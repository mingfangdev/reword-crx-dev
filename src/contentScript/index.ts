import FloatingButton from './FloatingButton.svelte'
import OpenAI from 'openai'
import { DEFAULT_SETTINGS, type ButtonSettings, loadSettings } from '../shared/settings'
import { env } from '../shared/env'

// Add debug logging (only in development)
const DEBUG = import.meta.env.MODE === 'development'
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log('[Reword Extension]', ...args)
  }
}

// Types for different input element configurations
interface ElementConfig {
  type: 'input' | 'textarea' | 'akEditor' | 'contentEditable'
  element: HTMLElement
  selector?: string
}

class FloatingButtonManager {
  private currentButton: HTMLElement | null = null
  private currentTarget: HTMLElement | null = null
  private currentConfig: ElementConfig | null = null
  private svelteComponent: any = null
  private isProcessing: boolean = false
  private settings: ButtonSettings = DEFAULT_SETTINGS
  private domainOverrides: Record<string, Partial<ButtonSettings>> = {}
  private resizeObserver: ResizeObserver | null = null
  private inputDebounceTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    log('FloatingButtonManager initializing...')
    this.loadSettings()
    this.loadDomainOverrides()
    
    // Wait for DOM to be ready before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        log('DOM loaded, initializing...')
        this.init()
      })
    } else {
      log('DOM already loaded, initializing immediately...')
      this.init()
    }
  }

  private async loadSettings() {
    try {
      this.settings = await loadSettings()
      log('Settings loaded:', this.settings)
    } catch (error) {
      log('Error loading settings:', error)
      this.settings = DEFAULT_SETTINGS
    }
  }

  private async loadDomainOverrides() {
    try {
      const result = await chrome.storage.sync.get(['rewordDomainOverrides'])
      this.domainOverrides = result.rewordDomainOverrides || {}
      log('Domain overrides loaded:', this.domainOverrides)
    } catch (error) {
      console.warn('Failed to load domain overrides:', error)
    }
  }

  private getEffectiveSettings(): ButtonSettings {
    const currentUrl = window.location.href
    const hostname = window.location.hostname
    
    // Check for URL pattern matches first
    for (const [pattern, settings] of Object.entries(this.domainOverrides)) {
      if (pattern.includes('/')) {
        // This is a URL pattern, check if current URL matches
        const [domain, path] = pattern.split('/', 2)
        if (hostname.includes(domain) && currentUrl.includes('/' + path)) {
          return { ...this.settings, ...settings }
        }
      } else {
        // This is a hostname pattern, use original logic
        if (hostname === pattern || hostname.endsWith('.' + pattern)) {
          return { ...this.settings, ...settings }
        }
      }
    }
    
    return this.settings
  }

  private init() {
    log('Initializing event listeners on:', window.location.href)
    
    // Listen for focus events on input and textarea elements
    document.addEventListener('focusin', this.handleFocusIn.bind(this), true)
    document.addEventListener('focusout', this.handleFocusOut.bind(this), true)

    // Listen for scroll and resize to reposition button
    document.addEventListener('scroll', this.repositionButton.bind(this), true)
    window.addEventListener('resize', this.repositionButton.bind(this))

    // Listen for hover events if showOnHover is enabled
    document.addEventListener('mouseover', this.handleMouseOver.bind(this), true)
    document.addEventListener('mouseout', this.handleMouseOut.bind(this), true)

    // Listen for settings updates from options page
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      log('Received message:', request.type)
      if (request.type === 'SETTINGS_UPDATED') {
        this.settings = { ...this.settings, ...request.settings }
        this.handleSettingsUpdate()
        sendResponse({ success: true })
      } else if (request.type === 'DOMAIN_OVERRIDES_UPDATED') {
        this.domainOverrides = request.overrides
        this.handleSettingsUpdate()
        sendResponse({ success: true })
      }
    })

    log('Event listeners initialized successfully')
  }

  private handleMouseOver(event: MouseEvent) {
    const effectiveSettings = this.getEffectiveSettings()
    if (!effectiveSettings.enabled || !effectiveSettings.showOnHover) return

    const target = event.target as HTMLElement
    const config = this.detectInputElement(target)
    if (config) {
      this.showButton(config)
    }
  }

  private handleMouseOut(event: MouseEvent) {
    const effectiveSettings = this.getEffectiveSettings()
    if (!effectiveSettings.enabled || !effectiveSettings.showOnHover) return

    setTimeout(() => {
      const hoveredElement = document.elementFromPoint(event.clientX, event.clientY)
      if (
        hoveredElement !== this.currentButton &&
        !this.currentButton?.contains(hoveredElement as Node)
      ) {
        this.hideButton()
      }
    }, 50)
  }

  private handleFocusIn(event: FocusEvent) {
    log('Focus in event triggered on:', event.target)
    const target = event.target as HTMLElement
    const config = this.detectInputElement(target)

    log('Detected element config:', config)
    if (config) {
      const effectiveSettings = this.getEffectiveSettings()
      log('Effective settings:', effectiveSettings)
      if (!effectiveSettings.enabled) {
        log('Extension is disabled, not showing button')
        return
      }
      if (!effectiveSettings.showOnHover) {
        log('Showing button for element:', target.tagName, target.className)
        this.showButton(config)
      }
    }
  }

  private handleFocusOut(event: FocusEvent) {
    const effectiveSettings = this.getEffectiveSettings()
    if (!effectiveSettings.autoHide) return

    // Small delay to allow clicking the button before it disappears
    setTimeout(() => {
      if (document.activeElement !== this.currentTarget && !this.isProcessing) {
        this.hideButton()
      }
    }, 150)
  }

  private detectInputElement(element: HTMLElement): ElementConfig | null {
    // Check for Jira comment editor first
    if (element.getAttribute('role') === 'textbox' && 
        element.getAttribute('data-testid')?.includes('comment-text-area') ||
        element.classList.contains('ProseMirror')) {
      return {
        type: 'contentEditable',
        element: element,
        selector: '[role="textbox"][data-testid*="comment-text-area"], .ProseMirror'
      }
    }

    // Check for akEditor
    const akEditorContent = element.closest('.akEditor')?.querySelector('.ak-editor-content-area') as HTMLElement
    if (akEditorContent) {
      return {
        type: 'akEditor',
        element: akEditorContent,
        selector: '.akEditor .ak-editor-content-area'
      }
    }

    // Check if the element itself is the akEditor content area
    if (element.classList.contains('ak-editor-content-area')) {
      return {
        type: 'akEditor',
        element: element,
        selector: '.ak-editor-content-area'
      }
    }

    // Check for standard input and textarea
    if (element.tagName === 'INPUT') {
      return { type: 'input', element }
    }

    if (element.tagName === 'TEXTAREA') {
      return { type: 'textarea', element }
    }

    // Check for contentEditable elements
    if (element.contentEditable === 'true') {
      return { type: 'contentEditable', element }
    }

    return null
  }

  private showButton(config: ElementConfig) {
    log('showButton called for:', config.type, config.element)
    
    // Check if extension is enabled before showing button
    const effectiveSettings = this.getEffectiveSettings()
    if (!effectiveSettings.enabled) {
      log('Extension is disabled, not showing button')
      return
    }
    
    // Remove existing button if any
    this.hideButton()

    this.currentTarget = config.element
    this.currentConfig = config

    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.id = 'reword-floating-button'
    buttonContainer.style.cssText = `
      position: absolute;
      z-index: 999999 !important;
      pointer-events: auto;
      background: transparent;
    `

    try {
      // Mount Svelte component
      this.svelteComponent = new FloatingButton({
        target: buttonContainer,
        props: {
          onClick: () => {
            log('Button clicked!')
            // Ensure we maintain focus on the original text area
            if (this.currentTarget) {
              this.currentTarget.focus()
            }
            this.rewordText()
          },
          size: effectiveSettings.buttonSize,
          state: 'default',
        },
      })

      document.body.appendChild(buttonContainer)
      this.currentButton = buttonContainer

      log('Button created and appended to DOM')

      // Set up ResizeObserver to monitor element dimension changes
      this.setupResizeObserver()
      
      // Set up input event listener for debounced repositioning
      this.setupInputListener()

      this.repositionButton()
      
      log('Button positioned at:', buttonContainer.style.left, buttonContainer.style.top)
    } catch (error) {
      log('Error creating button:', error)
    }
  }

  private hideButton() {
    if (this.currentButton) {
      // Destroy Svelte component
      if (this.svelteComponent) {
        this.svelteComponent.$destroy()
        this.svelteComponent = null
      }

      // Clean up ResizeObserver
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }

      // Clear input debounce timer
      if (this.inputDebounceTimer) {
        clearTimeout(this.inputDebounceTimer)
        this.inputDebounceTimer = null
      }

      this.currentButton.remove()
      this.currentButton = null
      this.currentTarget = null
      this.currentConfig = null
    }
  }

  private updateButtonAppearance() {
    const effectiveSettings = this.getEffectiveSettings()
    if (this.svelteComponent) {
      this.svelteComponent.$set({ size: effectiveSettings.buttonSize })
    }
    this.repositionButton()
  }

  private async rewordText() {
    const effectiveSettings = this.getEffectiveSettings()
    const apiKey = effectiveSettings.openRouterApiKey || env.OPEN_ROUTER_API

    if (!this.currentTarget || this.isProcessing || !apiKey) {
      if (!apiKey) {
        alert('Please set your OpenRouter API key in the extension settings or .env file.')
        return
      }
      return
    }

    const selectedText = this.getSelectedText()

    if (!selectedText.trim()) {
      alert('Please select some text to rephrase.')
      return
    }

    this.isProcessing = true
    this.updateButtonState('processing')

    try {
      const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Reword Extension',
        },
        dangerouslyAllowBrowser: true,
      })

      const completion = await openai.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'system',
            content: effectiveSettings.rewordPrompt,
          },
          {
            role: 'user',
            content: selectedText,
          },
        ],
      })

      const rewordedText = completion.choices[0]?.message?.content
      if (rewordedText) {
        this.replaceSelectedText(rewordedText.trim())
        this.updateButtonState('success')
      } else {
        throw new Error('No response from AI')
      }
    } catch (error) {
      console.error('Error rephrasing text:', error)
      alert('Error rephrasing text. Please check your API key and try again.')
      this.updateButtonState('error')
    } finally {
      this.isProcessing = false
      setTimeout(() => {
        this.updateButtonState('default')
      }, 2000)
    }
  }

  private getSelectedText(): string {
    if (!this.currentTarget || !this.currentConfig) return ''

    switch (this.currentConfig.type) {
      case 'input':
      case 'textarea': {
        const element = this.currentTarget as HTMLInputElement | HTMLTextAreaElement
        const start = element.selectionStart || 0
        const end = element.selectionEnd || 0

        if (start === end) {
          // If no text is selected, select all text
          return element.value
        }

        return element.value.substring(start, end)
      }

      case 'akEditor':
      case 'contentEditable': {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const selectedText = selection.toString()
          if (selectedText.trim()) {
            log('Using selected text:', selectedText)
            return selectedText
          }
        }
        // If no text is selected, get all text content
        const allText = this.currentTarget.textContent || ''
        log('No selection, using all text:', allText)
        return allText
      }

      default:
        return ''
    }
  }

  private replaceSelectedText(newText: string) {
    if (!this.currentTarget || !this.currentConfig) return

    switch (this.currentConfig.type) {
      case 'input':
      case 'textarea': {
        const element = this.currentTarget as HTMLInputElement | HTMLTextAreaElement
        const start = element.selectionStart || 0
        const end = element.selectionEnd || 0

        if (start === end) {
          // If no text was selected, replace all text
          element.value = newText
        } else {
          // Replace selected text
          const before = element.value.substring(0, start)
          const after = element.value.substring(end)
          element.value = before + newText + after

          // Set cursor position after the new text
          const newCursorPos = start + newText.length
          element.setSelectionRange(newCursorPos, newCursorPos)
        }

        // Trigger input event to notify other scripts
        element.dispatchEvent(new Event('input', { bubbles: true }))
        element.focus()
        break
      }

      case 'akEditor':
      case 'contentEditable': {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          
          if (range.collapsed) {
            // If no text was selected, replace all content
            this.currentTarget.textContent = newText
          } else {
            // Replace selected text
            range.deleteContents()
            range.insertNode(document.createTextNode(newText))
            
            // Move cursor to end of inserted text
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
          }
        } else {
          // Fallback: replace all content
          this.currentTarget.textContent = newText
        }

        // Trigger input event for akEditor and other systems
        this.currentTarget.dispatchEvent(new Event('input', { bubbles: true }))
        this.currentTarget.focus()
        break
      }
    }
  }

  private updateButtonState(state: 'default' | 'processing' | 'success' | 'error') {
    if (this.svelteComponent) {
      this.svelteComponent.$set({ state })
    }
  }

  private repositionButton() {
    if (!this.currentButton || !this.currentTarget || !this.currentConfig) {
      log('Cannot reposition: missing button, target, or config')
      return
    }

    const rect = this.currentTarget.getBoundingClientRect()
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop
    const effectiveSettings = this.getEffectiveSettings()

    log('Repositioning button - target rect:', rect)
    log('Scroll position:', { scrollX, scrollY })

    // Always position at bottom-right corner of the element
    const left = `${rect.right + scrollX + effectiveSettings.offsetX}px`
    const top = `${rect.bottom + scrollY + effectiveSettings.offsetY}px`

    this.currentButton.style.left = left
    this.currentButton.style.top = top
    
    log('Button repositioned to:', { left, top })
  }

  private setupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    this.resizeObserver = new ResizeObserver(() => {
      this.repositionButton()
    })
    this.resizeObserver.observe(this.currentTarget as Element)
  }

  private setupInputListener() {
    if (this.inputDebounceTimer) {
      clearTimeout(this.inputDebounceTimer)
    }
    
    const handleInput = () => {
      if (this.inputDebounceTimer) {
        clearTimeout(this.inputDebounceTimer)
      }
      this.inputDebounceTimer = setTimeout(() => {
        this.repositionButton()
      }, 500)
    }
    
    this.currentTarget?.addEventListener('input', handleInput)
  }

  private handleSettingsUpdate() {
    const effectiveSettings = this.getEffectiveSettings()
    
    // If extension is disabled, hide any existing button
    if (!effectiveSettings.enabled) {
      log('Extension disabled, hiding button')
      this.hideButton()
      return
    }
    
    // Update button appearance if it exists and extension is enabled
    this.updateButtonAppearance()
  }
}

// Initialize the floating button manager
new FloatingButtonManager()
