console.info('contentScript is running')

// Import Svelte component and OpenAI
import FloatingButton from './FloatingButton.svelte'
import OpenAI from 'openai'
import { DEFAULT_SETTINGS, type ButtonSettings, loadSettings } from '../shared/settings'

class FloatingButtonManager {
  private currentButton: HTMLElement | null = null
  private currentTarget: HTMLElement | null = null
  private svelteComponent: any = null
  private isProcessing: boolean = false
  private settings: ButtonSettings = DEFAULT_SETTINGS

  constructor() {
    this.loadSettings()
    this.init()
  }

  private async loadSettings() {
    this.settings = await loadSettings()
  }

  private init() {
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
      if (request.type === 'SETTINGS_UPDATED') {
        this.settings = { ...this.settings, ...request.settings }
        this.updateButtonAppearance()
        sendResponse({ success: true })
      }
    })
  }

  private handleMouseOver(event: MouseEvent) {
    if (!this.settings.showOnHover) return
    
    const target = event.target as HTMLElement
    if (this.isInputOrTextarea(target)) {
      this.showButton(target)
    }
  }

  private handleMouseOut(event: MouseEvent) {
    if (!this.settings.showOnHover) return
    
    setTimeout(() => {
      const hoveredElement = document.elementFromPoint(event.clientX, event.clientY)
      if (hoveredElement !== this.currentButton && !this.currentButton?.contains(hoveredElement as Node)) {
        this.hideButton()
      }
    }, 50)
  }

  private handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement
    
    if (this.isInputOrTextarea(target)) {
      if (!this.settings.showOnHover) {
        this.showButton(target)
      }
    }
  }

  private handleFocusOut(event: FocusEvent) {
    if (!this.settings.autoHide) return

    // Small delay to allow clicking the button before it disappears
    setTimeout(() => {
      if (document.activeElement !== this.currentTarget && !this.isProcessing) {
        this.hideButton()
      }
    }, this.settings.hideDelay)
  }

  private isInputOrTextarea(element: HTMLElement): boolean {
    return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA'
  }

  private showButton(target: HTMLElement) {
    // Remove existing button if any
    this.hideButton()
    
    this.currentTarget = target
    
    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.id = 'reword-floating-button'
    buttonContainer.style.cssText = `
      position: absolute;
      z-index: 10000;
      pointer-events: auto;
    `
    
    // Mount Svelte component
    this.svelteComponent = new FloatingButton({
      target: buttonContainer,
      props: {
        onClick: () => {
          this.rewordText()
        },
        size: this.settings.buttonSize,
        state: 'default'
      }
    })
    
    document.body.appendChild(buttonContainer)
    this.currentButton = buttonContainer
    
    this.repositionButton()
  }

  private hideButton() {
    if (this.currentButton) {
      // Destroy Svelte component
      if (this.svelteComponent) {
        this.svelteComponent.$destroy()
        this.svelteComponent = null
      }
      
      this.currentButton.remove()
      this.currentButton = null
      this.currentTarget = null
    }
  }

  private updateButtonAppearance() {
    if (this.svelteComponent) {
      this.svelteComponent.$set({ size: this.settings.buttonSize })
    }
    this.repositionButton()
  }

  private async rewordText() {
    if (!this.currentTarget || this.isProcessing || !this.settings.openRouterApiKey) {
      if (!this.settings.openRouterApiKey) {
        alert('Please set your OpenRouter API key in the extension settings first.')
        return
      }
      return
    }

    const target = this.currentTarget as HTMLInputElement | HTMLTextAreaElement
    const selectedText = this.getSelectedText(target)
    
    if (!selectedText.trim()) {
      alert('Please select some text to rephrase.')
      return
    }

    this.isProcessing = true
    this.updateButtonState('processing')

    try {
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: this.settings.openRouterApiKey,
        defaultHeaders: {
          "HTTP-Referer": window.location.origin,
          "X-Title": 'Reword Extension',
        },
        dangerouslyAllowBrowser: true
      })

      const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            "role": "system",
            "content": this.settings.rewordPrompt
          },
          {
            "role": "user",
            "content": selectedText
          }
        ],
      })

      const rewordedText = completion.choices[0]?.message?.content
      if (rewordedText) {
        this.replaceSelectedText(target, rewordedText.trim())
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

  private getSelectedText(element: HTMLInputElement | HTMLTextAreaElement): string {
    const start = element.selectionStart || 0
    const end = element.selectionEnd || 0
    
    if (start === end) {
      // If no text is selected, select all text
      return element.value
    }
    
    return element.value.substring(start, end)
  }

  private replaceSelectedText(element: HTMLInputElement | HTMLTextAreaElement, newText: string) {
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
  }

  private updateButtonState(state: 'default' | 'processing' | 'success' | 'error') {
    if (this.svelteComponent) {
      this.svelteComponent.$set({ state })
    }
  }

  private repositionButton() {
    if (!this.currentButton || !this.currentTarget) return
    
    const rect = this.currentTarget.getBoundingClientRect()
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop
    
    let left: string, top: string

    switch (this.settings.buttonPosition) {
      case 'right':
        left = `${rect.right + scrollX + this.settings.offsetX}px`
        top = `${rect.top + scrollY + this.settings.offsetY}px`
        break
      case 'left':
        left = `${rect.left + scrollX - this.settings.buttonSize - Math.abs(this.settings.offsetX)}px`
        top = `${rect.top + scrollY + this.settings.offsetY}px`
        break
      case 'top':
        left = `${rect.left + scrollX + (rect.width / 2) - (this.settings.buttonSize / 2)}px`
        top = `${rect.top + scrollY - this.settings.buttonSize - Math.abs(this.settings.offsetY)}px`
        break
      case 'bottom':
        left = `${rect.left + scrollX + (rect.width / 2) - (this.settings.buttonSize / 2)}px`
        top = `${rect.bottom + scrollY + this.settings.offsetY}px`
        break
      default:
        left = `${rect.right + scrollX + this.settings.offsetX}px`
        top = `${rect.top + scrollY + this.settings.offsetY}px`
    }

    this.currentButton.style.left = left
    this.currentButton.style.top = top
  }
}

// Initialize the floating button manager
new FloatingButtonManager()
