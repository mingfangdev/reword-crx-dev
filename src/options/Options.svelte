<script lang="ts">
  import AISettingsForm from '@forms/AISettingsForm.svelte'
  import ButtonSettingsForm from '@forms/ButtonSettingsForm.svelte'
  import SiteOverridesForm from '@forms/SiteOverridesForm.svelte'
  import OptionsFooter from '@layout/OptionsFooter.svelte'
  import OptionsHeader from '@layout/OptionsHeader.svelte'
  import type { ButtonSettings } from '@shared/settings'
  import {
    DEFAULT_SETTINGS,
    loadDomainOverrides,
    loadSettings,
    saveDomainOverrides,
    saveSettings as saveSettingsToStorage,
    sendDomainOverridesUpdateToTabs,
    sendSettingsUpdateToTabs
  } from '@shared/settings'
  import TabNavigation from '@ui/TabNavigation.svelte'
  import { onMount } from 'svelte'
  import '../app.css'

  // Use centralized default settings
  let settings: ButtonSettings = { ...DEFAULT_SETTINGS }
  let domainOverrides: Record<string, Partial<ButtonSettings>> = {}
  let saved = false

  // Tab state
  let activeTab = 'ai'

  // Tab definitions
  const tabs = [
    { id: 'ai', label: 'AI Integration', icon: '🤖' },
    { id: 'settings', label: 'Button Settings', icon: '⚙️' },
    { id: 'overrides', label: 'Site Overrides', icon: '🌐' },
  ]

  onMount(async () => {
    // Load saved settings using centralized function
    settings = await loadSettings()
    domainOverrides = await loadDomainOverrides()
  })

  const saveSettings = async () => {
    try {
      await saveSettingsToStorage(settings)
      saved = true
      setTimeout(() => (saved = false), 2000)

      // Send message to content script to update settings
      sendSettingsUpdateToTabs(settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const saveDomainOverridesData = async () => {
    try {
      await saveDomainOverrides(domainOverrides)
      saved = true
      setTimeout(() => (saved = false), 2000)

      // Send message to content script to update domain overrides
      sendDomainOverridesUpdateToTabs(domainOverrides)
    } catch (error) {
      console.error('Failed to save domain overrides:', error)
    }
  }

  const resetSettings = () => {
    settings = { ...DEFAULT_SETTINGS }
    saveSettings()
  }
</script>

<main class="min-h-screen bg-gray-50 dark:bg-gray-900 p-5">
  <div class="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
    <OptionsHeader />

    <!-- Tab Navigation -->
    <TabNavigation bind:activeTab {tabs} />

    <!-- Tab Content -->
    <div class="min-h-[400px]">
      {#if activeTab === 'ai'}
        <AISettingsForm {settings} />
      {:else if activeTab === 'settings'}
        <ButtonSettingsForm {settings} />
       {:else if activeTab === 'overrides'}
        <SiteOverridesForm {domainOverrides} {saveDomainOverridesData} />
      {/if}
    </div>

    <!-- Actions - Always visible at bottom -->
    <OptionsFooter {saved} onSave={saveSettings} onReset={resetSettings} />
  </div>
</main>
