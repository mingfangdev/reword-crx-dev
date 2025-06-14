<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { ButtonSettings } from '../shared/settings'
  import { env, isDev } from '../shared/env'

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

<div class="preview-container">
  <h3>Interactive Preview</h3>
  <p class="preview-description">
    Test the reword functionality with your current settings. Edit the text below and click the reword button to see it in action.
  </p>
  
  <div class="preview-wrapper">
    <div class="preview-input-container">
      <textarea 
        bind:this={textareaElement}
        bind:value={previewText}
        placeholder="Enter some text to test the reword functionality..."
        rows="4"
        class="preview-textarea"
      ></textarea>
      
      <button 
        class="preview-reword-button" 
        class:loading={isLoading}
        class:show-on-hover={settings.showOnHover}
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
          <div class="spinner"></div>
        {:else}
          ✏️
        {/if}
      </button>
    </div>
  </div>
  
  <div class="preview-note">
    <small>
      <strong>Note:</strong> The button appears at the bottom-right corner of the textarea. 
      {#if !settings.openRouterApiKey && !isDev}
        <span class="warning">⚠️ Set your OpenRouter API key above to test the reword functionality.</span>
      {/if}
    </small>
  </div>
</div>

<style>
  .preview-container {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 2px dashed #ddd;
  }

  @media (prefers-color-scheme: dark) {
    .preview-container {
      background: #333;
      border-color: #555;
    }
  }

  h3 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #333;
  }

  @media (prefers-color-scheme: dark) {
    h3 {
      color: #fff;
    }
  }

  .preview-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    line-height: 1.4;
  }

  @media (prefers-color-scheme: dark) {
    .preview-description {
      color: #aaa;
    }
  }

  .preview-wrapper {
    margin-bottom: 16px;
  }

  .preview-input-container {
    position: relative;
    display: inline-block;
    width: 100%;
    max-width: 500px;
  }

  .preview-textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    box-sizing: border-box;
  }

  @media (prefers-color-scheme: dark) {
    .preview-textarea {
      background: #2a2a2a;
      border-color: #555;
      color: #fff;
    }
  }

  .preview-input-container:hover .preview-reword-button.show-on-hover,
  .preview-reword-button:not(.show-on-hover) {
    opacity: 1;
    visibility: visible;
  }

  .preview-reword-button {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    opacity: 1;
    visibility: visible;
  }

  .preview-reword-button.show-on-hover {
    opacity: 0;
    visibility: hidden;
  }

  .preview-reword-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  }

  .preview-reword-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .preview-reword-button.loading {
    cursor: wait;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .preview-note {
    padding: 12px;
    background: #e7f3ff;
    border: 1px solid #b3d9ff;
    border-radius: 6px;
  }

  @media (prefers-color-scheme: dark) {
    .preview-note {
      background: #1a2631;
      border-color: #2a4a5c;
    }
  }

  .preview-note small {
    display: block;
    font-size: 12px;
    color: #333;
    margin: 0;
  }

  @media (prefers-color-scheme: dark) {
    .preview-note small {
      color: #ccc;
    }
  }

  .warning {
    color: #f56565;
    font-weight: 500;
  }

  @media (prefers-color-scheme: dark) {
    .warning {
      color: #feb2b2;
    }
  }
</style> 