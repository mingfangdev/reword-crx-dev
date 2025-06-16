<script lang="ts">
  import { onMount } from 'svelte'
  import {
    DEFAULT_SETTINGS,
    SETTINGS_CONSTRAINTS,
    loadSettings,
    saveSettings as saveSettingsToStorage,
    sendSettingsUpdateToTabs,
  } from '../shared/settings'
  import type { ButtonSettings } from '../shared/settings'

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
      <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="enabled">
            Extension Enabled
          </label>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Turn off to completely disable the extension
          </span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="enabled"
            bind:checked={settings.enabled}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-center flex-col gap-4">      
      <button 
        class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg text-base cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
        on:click={openOptionsPage}
      >
        More Options
      </button>
      {#if saved}
        <div class="text-green-500 text-sm font-semibold text-center mt-4">
          ✓ Saved!
        </div>
      {/if}
    </div>
  </div>
</main>
