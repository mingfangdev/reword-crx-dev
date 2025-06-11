<script lang="ts">
  export let onClick: () => void
  export let size: number = 32
  export let state: 'default' | 'processing' | 'success' | 'error' = 'default'

  const handleClick = () => {
    if (state !== 'processing') {
      onClick()
    }
  }

  $: icon = state === 'processing' ? '⏳' : 
            state === 'success' ? '✅' : 
            state === 'error' ? '❌' : '✏️'

  $: title = state === 'processing' ? 'Processing...' :
             state === 'success' ? 'Success! Text rephrased' :
             state === 'error' ? 'Error occurred' :
             'Click to rephrase text'
</script>

<button 
  class="floating-button {state}" 
  on:click={handleClick}
  title={title}
  style="width: {size}px; height: {size}px; font-size: {size * 0.4375}px"
  disabled={state === 'processing'}
>
  {icon}
</button>

<style>
  .floating-button {
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .floating-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  }

  .floating-button:active {
    transform: scale(0.95);
  }

  .floating-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .floating-button.processing {
    animation: pulse 1s infinite;
  }

  .floating-button.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .floating-button.error {
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