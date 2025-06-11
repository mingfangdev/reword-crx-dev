<script lang="ts">
  import { onMount } from 'svelte'
  import { DEFAULT_SETTINGS, SETTINGS_CONSTRAINTS, loadSettings, saveSettings as saveSettingsToStorage, sendSettingsUpdateToTabs } from '../shared/settings'
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
      setTimeout(() => saved = false, 1500)
      
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

<main>
  <div class="header">
    <h3>✏️ Reword Settings</h3>
  </div>

  <div class="quick-settings">
    <div class="setting-row">
      <label for="position">Position:</label>
      <select id="position" bind:value={settings.buttonPosition} class="compact">
        <option value="right">Right</option>
        <option value="left">Left</option>
        <option value="top">Top</option>
        <option value="bottom">Bottom</option>
      </select>
    </div>

    <div class="setting-row">
      <label for="size">Size:</label>
      <input id="size" type="range" bind:value={settings.buttonSize} min={SETTINGS_CONSTRAINTS.buttonSize.min} max={SETTINGS_CONSTRAINTS.buttonSize.max} class="slider" />
      <span class="value">{settings.buttonSize}px</span>
    </div>

    <div class="setting-row">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={settings.showOnHover} />
        Show on hover only
      </label>
    </div>

    <div class="setting-row">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={settings.autoHide} />
        Auto-hide when unfocused
      </label>
    </div>

  </div>
  

  <div class="actions">
    {#if saved}
      <div class="saved-indicator">✓ Saved!</div>
    {/if}
    <button class="options-btn" on:click={openOptionsPage}>
      More Options
    </button>
  </div>
</main>

<style>
  :global(:root) {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color-scheme: light dark;
  }

  :global(body) {
    margin: 0;
    width: 320px;
    background: #f8f9fa;
  }

  @media (prefers-color-scheme: dark) {
    :global(body) {
      background: #1a1a1a;
      color: #ffffff;
    }
  }

  main {
    padding: 16px;
    background: white;
    border-radius: 8px;
    margin: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    main {
      background: #2a2a2a;
    }
  }

  .header {
    text-align: center;
    margin-bottom: 16px;
  }

  h3 {
    color: #667eea;
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .quick-settings {
    margin-bottom: 16px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.9rem;
  }

  label {
    font-weight: 500;
    color: #555;
    min-width: 60px;
  }

  @media (prefers-color-scheme: dark) {
    label {
      color: #ccc;
    }
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    min-width: auto;
    cursor: pointer;
  }

  .checkbox-label input {
    margin-right: 8px;
  }

  select.compact {
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.85rem;
    background: white;
    min-width: 80px;
  }

  @media (prefers-color-scheme: dark) {
    select.compact {
      background: #333;
      border-color: #555;
      color: #fff;
    }
  }

  .slider {
    flex: 1;
    margin: 0 8px;
    accent-color: #667eea;
  }

  .value {
    font-size: 0.8rem;
    color: #667eea;
    font-weight: 600;
    min-width: 35px;
    text-align: right;
  }

  

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .saved-indicator {
    color: #22c55e;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .options-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .options-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  input[type="checkbox"] {
    accent-color: #667eea;
  }

  .api-key-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .api-input {
    width: 100%;
    max-width: none;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-top: 4px;
  }
</style>

