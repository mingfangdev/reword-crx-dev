<script lang="ts">
  import { onMount } from 'svelte'
  import {
    DEFAULT_SETTINGS,
    SETTINGS_CONSTRAINTS,
    loadSettings,
    saveSettings as saveSettingsToStorage,
    sendSettingsUpdateToTabs,
  } from '@shared/settings'
  import type { ButtonSettings } from '@shared/settings'
  import Toggle from '@ui/Toggle.svelte'
  import Button from '@ui/Button.svelte'

  // Use centralized default settings
  let settings: ButtonSettings = { ...DEFAULT_SETTINGS }

  let saved = false
  let isInitialLoad = true
  let previousSettings: string | null = null

  onMount(async () => {
    // Load saved settings using centralized function
    settings = await loadSettings()
    // Store the initial settings to compare against later
    previousSettings = JSON.stringify(settings)
    // Mark initial load as complete after settings are loaded
    setTimeout(() => {
      isInitialLoad = false
    }, 100)
  })

  const saveSettings = async () => {
    try {
      await saveSettingsToStorage(settings)
      saved = true
      setTimeout(() => (saved = false), 1500)

      // Send message to content script to update settings
      sendSettingsUpdateToTabs(settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  // Auto-save when settings actually change (but not during initial load)
  $: if (!isInitialLoad && previousSettings && JSON.stringify(settings) !== previousSettings) {
    previousSettings = JSON.stringify(settings)
    saveSettings()
  }
</script>

<main class="w-80 min-h-0 bg-white dark:bg-gray-800">
  <div class="p-6">
    <!-- Header -->
    <div class="text-center mb-6">
      <h3 class="text-xl font-bold text-gray-800 dark:text-white m-0 flex items-center justify-center gap-2">
        <span>✏️</span>
        <span>Reword Settings</span>
      </h3>
    </div>

    <!-- Quick Settings (Empty for now) -->
    <div class="mb-6">
      <!-- Extension Enable/Disable Toggle -->
      <Toggle
        bind:checked={settings.enabled}
        label="Extension Enabled"
        description="Turn off to completely disable the extension"
        id="enabled"
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-center flex-col gap-4">      
      <Button
        variant="primary"
        size="large"
        class="w-full"
        on:click={openOptionsPage}
      >
        More Options
      </Button>
      {#if saved}
        <div class="text-green-500 text-sm font-semibold text-center mt-4">
          ✓ Saved!
        </div>
      {/if}
    </div>
  </div>
</main>
