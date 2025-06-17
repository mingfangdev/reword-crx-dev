<script lang="ts">
  import Button from '@ui/Button.svelte'

  export let variant: 'primary' | 'secondary' | 'ghost' | 'destructive' = 'primary'
  export let size: 'small' | 'medium' | 'large' = 'medium'
  export let className: string = ''

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }
</script>

<Button {variant} {size} class={className} on:click={openOptionsPage}>
  More Options
</Button> 