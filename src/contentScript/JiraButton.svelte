<script lang="ts">
  export let onClick: () => void
  export let size: number = 32
  export let state: 'default' | 'processing' | 'success' | 'error' = 'default'

  const DEBUG = import.meta.env.MODE === 'development'
  
  const handleClick = (event: MouseEvent) => {
    if (DEBUG) console.log('[Reword Extension] JiraButton handleClick called')
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    
    if (state !== 'processing') {
      if (DEBUG) console.log('[Reword Extension] Calling Jira onClick handler')
      onClick()
    } else {
      if (DEBUG) console.log('[Reword Extension] JiraButton is processing, ignoring click')
    }
  }

  const handleMouseDown = (event: MouseEvent) => {
    if (DEBUG) console.log('[Reword Extension] JiraButton mousedown called')
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }

  $: icon = state === 'processing' ? '⏳' : 
            state === 'success' ? '✅' : 
            state === 'error' ? '❌' : '🎯'

  $: title = state === 'processing' ? 'Processing...' :
             state === 'success' ? 'Success! Jira action completed' :
             state === 'error' ? 'Error occurred' :
             'Click to open Jira modal'
</script>

<button 
  class="jira-button {state}" 
  on:click={handleClick}
  on:mousedown={handleMouseDown}
  title={title}
  style="width: {size}px; height: {size}px; font-size: {size * 0.4375}px"
  disabled={state === 'processing'}
  tabindex="-1"
>
  {icon}
</button>

<style>
  .jira-button {
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #0052cc 0%, #2684ff 100%);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    font-family: system-ui, -apple-system, sans-serif;
    position: relative;
    z-index: 999999;
    pointer-events: auto;
  }

  .jira-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    background: linear-gradient(135deg, #003d8f 0%, #1e6bcc 100%);
  }

  .jira-button:active {
    transform: scale(0.95);
  }

  .jira-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .jira-button.processing {
    animation: pulse 1s infinite;
  }

  .jira-button.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .jira-button.error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
</style> 