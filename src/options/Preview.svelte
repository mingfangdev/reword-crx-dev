<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { ButtonSettings } from '@shared/settings'
  import { env, isDev } from '@shared/env'

  export let settings: ButtonSettings

  const dispatch = createEventDispatcher()

  let previewText = 'This is a sample text that you can edit and test the reword functionality with. Try changing the settings above to see how the button position updates in real-time!'
  let isLoading = false
  let textareaElement: HTMLTextAreaElement

  // Get effective API key from settings or environment
  $: effectiveApiKey = settings.openRouterApiKey || env.OPEN_ROUTER_API

  const handleRewordClick = async () => {
    if (!previewText.trim() || isLoading) return
    
    if (!effectiveApiKey) {
      alert('Please set your OpenRouter API key in the settings above or in your .env file to test the reword functionality.')
      return
    }

    isLoading = true
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': chrome.runtime.getURL(''),
          'X-Title': 'Reword Extension'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: `${settings.rewordPrompt}\n\nText to rephrase: "${previewText}"`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const rewordedText = data.choices?.[0]?.message?.content?.trim()
      
      if (rewordedText) {
        previewText = rewordedText
      } else {
        throw new Error('No reworded text received')
      }
    } catch (error) {
      console.error('Reword failed:', error)
      alert('Failed to reword text. Please check your API key and try again.')
    } finally {
      isLoading = false
    }
  }

  const focusTextarea = () => {
    if (textareaElement) {
      textareaElement.focus()
    }
  }
</script>

<div class="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
  <h3 class="mt-0 mb-2 text-gray-800 dark:text-white">Interactive Preview</h3>
  <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
    Test the reword functionality with your current settings. Edit the text below and click the reword button to see it in action.
  </p>
  
  <div class="mb-4">
    <div class="relative w-full group">
      <textarea 
        bind:this={textareaElement}
        bind:value={previewText}
        placeholder="Enter some text to test the reword functionality..."
        rows="4"
        class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm font-inherit resize-y min-h-[100px] box-border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      ></textarea>
      
      <button 
        class="absolute rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none flex items-center justify-center text-sm cursor-pointer shadow-lg transition-all duration-200 ease-in-out hover:transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none {isLoading ? 'cursor-wait' : ''} {settings.showOnHover ? 'opacity-0 invisible group-hover:opacity-100 group-hover:visible' : 'opacity-100 visible'}"
        style="
          width: {settings.buttonSize}px; 
          height: {settings.buttonSize}px;
          right: {-settings.offsetX}px;
          bottom: {-settings.offsetY}px;
        "
        on:click={handleRewordClick}
        disabled={isLoading || !previewText.trim()}
        title="Click to reword text"
      >
        {#if isLoading}
          <div class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        {:else}
          ✏️
        {/if}
      </button>
    </div>
  </div>
  
  <div class="p-3 bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-md">
    <small class="block text-xs text-gray-800 dark:text-gray-300 m-0">
      <strong>Note:</strong> The button appears at the bottom-right corner of the textarea. 
      {#if !settings.openRouterApiKey && !isDev}
        <span class="text-red-500 dark:text-red-400 font-medium">⚠️ Set your OpenRouter API key above to test the reword functionality.</span>
      {/if}
    </small>
  </div>
</div>

<style>
  /* Custom animation for spinner since Tailwind's animate-spin might not be available */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style> 