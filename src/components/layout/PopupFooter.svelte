<script lang="ts">
  import { sendSettingsUpdateToTabs, type ButtonSettings } from '@shared/settings'
  import MoreOptionsButton from '@ui/MoreOptionsButton.svelte'
  import Toggle from '@ui/Toggle.svelte'

  export let settings: ButtonSettings

  // Auto-save when settings actually change
  $: if (settings) {
    sendSettingsUpdateToTabs(settings)
  }
</script>

<div class="border-t border-gray-400 bg-gray-50 p-4 flex flex-col gap-4">
  <Toggle
    bind:checked={settings.enabled}
    label="Extension Enabled"
    description="Turn the extension on or off"
    id="enabled-jira"
  />
  <MoreOptionsButton variant="secondary" className="w-full" />
</div> 