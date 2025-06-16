<script lang="ts">
  import Button from '@ui/Button.svelte'

  export let saved: boolean = false
  export let onSave: () => void
  export let onReset: () => void
</script>

<div class="flex gap-3 mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
  <Button variant="primary" on:click={onSave}>
    {saved ? '✓ Saved!' : 'Save Settings'}
  </Button>
  <Button variant="secondary" on:click={onReset}>
    Reset to Defaults
  </Button>
</div> 