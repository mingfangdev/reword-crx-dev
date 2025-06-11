<script lang="ts">
  import { onMount } from 'svelte'
  import { 
    DEFAULT_SETTINGS, 
    SETTINGS_CONSTRAINTS, 
    loadSettings, 
    saveSettings as saveSettingsToStorage, 
    sendSettingsUpdateToTabs,
    loadDomainOverrides,
    saveDomainOverrides,
    sendDomainOverridesUpdateToTabs,
    type DomainOverride
  } from '../shared/settings'
  import type { ButtonSettings } from '../shared/settings'
  import Preview from './Preview.svelte'

  // Use centralized default settings
  let settings: ButtonSettings = { ...DEFAULT_SETTINGS }
  let domainOverrides: Record<string, Partial<ButtonSettings>> = {}
  let newDomain = ''
  let newOverrideSettings: Partial<ButtonSettings> = {
    offsetX: 16,
    offsetY: 4
  }

  let saved = false

  // Common akEditor domain presets
  const commonDomainPresets = [
    { domain: 'atlassian.net', name: 'Atlassian Cloud (Jira/Confluence)', settings: { offsetX: -8, offsetY: 8 } },
    { domain: 'jira.com', name: 'Jira', settings: { offsetX: -8, offsetY: 8 } },
    { domain: 'confluence.com', name: 'Confluence', settings: { offsetX: -8, offsetY: 8 } }
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
      setTimeout(() => saved = false, 2000)
      
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
      setTimeout(() => saved = false, 2000)
      
      // Send message to content script to update domain overrides
      sendDomainOverridesUpdateToTabs(domainOverrides)
    } catch (error) {
      console.error('Failed to save domain overrides:', error)
    }
  }

  const addDomainOverride = () => {
    if (newDomain.trim()) {
      domainOverrides[newDomain.trim()] = { ...newOverrideSettings }
      domainOverrides = domainOverrides // Trigger reactivity
      newDomain = ''
      newOverrideSettings = {
        offsetX: 16,
        offsetY: 4
      }
      saveDomainOverridesData()
    }
  }

  const addPresetDomain = (preset: typeof commonDomainPresets[0]) => {
    domainOverrides[preset.domain] = { ...preset.settings }
    domainOverrides = domainOverrides // Trigger reactivity
    saveDomainOverridesData()
  }

  const removeDomainOverride = (domain: string) => {
    delete domainOverrides[domain]
    domainOverrides = domainOverrides // Trigger reactivity
    saveDomainOverridesData()
  }

  const resetSettings = () => {
    settings = { ...DEFAULT_SETTINGS }
    saveSettings()
  }

  const resetDomainOverrides = () => {
    domainOverrides = {}
    saveDomainOverridesData()
  }
</script>

<main>
  <h1>Reword Extension Settings</h1>

  <div class="settings-section">
    <h3>Button Position</h3>
    <p class="section-description">
      The button always appears at the bottom-right corner of input elements. Use offsets to fine-tune the position.
    </p>

    <div class="setting-group">
      <label>
        Horizontal offset (px):
        <input type="number" bind:value={settings.offsetX} min={SETTINGS_CONSTRAINTS.offsetX.min} max={SETTINGS_CONSTRAINTS.offsetX.max} />
        <small>Positive values move the button right, negative values move it left</small>
      </label>
    </div>

    <div class="setting-group">
      <label>
        Vertical offset (px):
        <input type="number" bind:value={settings.offsetY} min={SETTINGS_CONSTRAINTS.offsetY.min} max={SETTINGS_CONSTRAINTS.offsetY.max} />
        <small>Positive values move the button down, negative values move it up</small>
      </label>
    </div>
  </div>

  <div class="settings-section">
    <h3>Button Appearance</h3>
    <div class="setting-group">
      <label>
        Button size (px):
        <input type="number" bind:value={settings.buttonSize} min={SETTINGS_CONSTRAINTS.buttonSize.min} max={SETTINGS_CONSTRAINTS.buttonSize.max} />
      </label>
    </div>
  </div>

  <div class="settings-section">
    <h3>Behavior</h3>
    <div class="setting-group">
      <label>
        <input type="checkbox" bind:checked={settings.showOnHover} />
        Show button only on hover over input
      </label>
    </div>

    <div class="setting-group">
      <label>
        <input type="checkbox" bind:checked={settings.autoHide} />
        Auto-hide when focus is lost
      </label>
    </div>

    {#if settings.autoHide}
      <div class="setting-group">
        <label>
          Hide delay (ms):
          <input type="number" bind:value={settings.hideDelay} min={SETTINGS_CONSTRAINTS.hideDelay.min} max={SETTINGS_CONSTRAINTS.hideDelay.max} />
        </label>
      </div>
    {/if}
  </div>

  <div class="settings-section">
    <h3>Domain-Specific Overrides</h3>
    <p class="section-description">
      Configure different button positions for specific websites. Useful for websites with unique layouts like akEditor (Jira/Confluence).
    </p>
    
    <!-- Common domain presets -->
    <div class="preset-domains">
      <h4>Quick Add Common Domains</h4>
      <div class="preset-buttons">
        {#each commonDomainPresets as preset}
          <button 
            class="preset-btn" 
            on:click={() => addPresetDomain(preset)}
            disabled={Object.keys(domainOverrides).some(domain => domain.includes(preset.domain))}
          >
            + {preset.name}
          </button>
        {/each}
      </div>
    </div>

    <!-- Add new domain override -->
    <div class="domain-override-form">
      <h4>Custom Domain Override</h4>
      <div class="form-row">
        <input 
          type="text" 
          bind:value={newDomain} 
          placeholder="example.com" 
          class="domain-input"
        />
        <input 
          type="number" 
          bind:value={newOverrideSettings.offsetX} 
          placeholder="X offset"
          min={SETTINGS_CONSTRAINTS.offsetX.min} 
          max={SETTINGS_CONSTRAINTS.offsetX.max}
          class="offset-input"
        />
        <input 
          type="number" 
          bind:value={newOverrideSettings.offsetY} 
          placeholder="Y offset"
          min={SETTINGS_CONSTRAINTS.offsetY.min} 
          max={SETTINGS_CONSTRAINTS.offsetY.max}
          class="offset-input"
        />
        <button class="add-btn" on:click={addDomainOverride}>Add Custom</button>
      </div>
    </div>

    <!-- List existing domain overrides -->
    {#if Object.keys(domainOverrides).length > 0}
      <div class="domain-overrides-list">
        {#each Object.entries(domainOverrides) as [domain, override]}
          <div class="domain-override-item">
            <span class="domain-name">{domain}</span>
            <span class="override-details">
              Offset: ({override.offsetX || 16}, {override.offsetY || 4})
            </span>
            <button class="remove-btn" on:click={() => removeDomainOverride(domain)}>×</button>
          </div>
        {/each}
      </div>
      <button class="secondary small" on:click={resetDomainOverrides}>
        Clear All Domain Overrides
      </button>
    {:else}
      <p class="no-overrides">No domain-specific overrides configured.</p>
    {/if}
  </div>

  <div class="settings-section">
    <h3>AI Integration</h3>
    <div class="setting-group">
      <label>
        OpenRouter API Key:
        <input type="password" bind:value={settings.openRouterApiKey} placeholder="sk-or-..." />
        <small>Get your API key from <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai/keys</a></small>
      </label>
    </div>

    <div class="setting-group textarea-group">
      <label for="reword-prompt">Reword Prompt:</label>
      <textarea 
        id="reword-prompt"
        bind:value={settings.rewordPrompt} 
        rows="3" 
        placeholder="Enter your custom prompt for rephrasing text..."
      ></textarea>
      <small>This prompt will be used to instruct the AI how to rephrase your text</small>
    </div>
  </div>

  <div class="actions">
    <button class="primary" on:click={saveSettings}>
      {saved ? '✓ Saved!' : 'Save Settings'}
    </button>
    <button class="secondary" on:click={resetSettings}>
      Reset to Defaults
    </button>
  </div>

  <Preview {settings} />
</main>

<style>
  :global(:root) {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color-scheme: light dark;
  }

  :global(body) {
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
    min-height: 100vh;
  }

  @media (prefers-color-scheme: dark) {
    :global(body) {
      background: #1a1a1a;
      color: #ffffff;
    }
  }

  main {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    main {
      background: #2a2a2a;
    }
  }

  h1 {
    color: #667eea;
    text-align: center;
    margin-bottom: 32px;
    font-weight: 600;
    font-size: 28px;
  }

  h3 {
    color: #333;
    margin-bottom: 16px;
    font-weight: 500;
    font-size: 20px;
  }

  h4 {
    color: #333;
    margin-bottom: 12px;
    font-weight: 500;
    font-size: 16px;
  }

  @media (prefers-color-scheme: dark) {
    h3, h4 {
      color: #ffffff;
    }
  }

  .settings-section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #eee;
  }

  @media (prefers-color-scheme: dark) {
    .settings-section {
      border-bottom-color: #444;
    }
  }

  .setting-group {
    margin-bottom: 16px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #555;
    align-self: flex-start;
  }

  .textarea-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .textarea-group label {
    margin-bottom: 8px;
    align-self: flex-start;
  }

  @media (prefers-color-scheme: dark) {
    label {
      color: #ccc;
    }
  }

  input, textarea {
    width: 100%;
    max-width: 200px;
    padding: 8px 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    margin-top: 4px;
    font-family: inherit;
  }

  textarea {
    max-width: 400px;
    resize: vertical;
    min-height: 80px;
  }

  input[type="password"] {
    max-width: 300px;
  }

  small {
    display: block;
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }

  small a {
    color: #667eea;
    text-decoration: none;
  }

  small a:hover {
    text-decoration: underline;
  }

  @media (prefers-color-scheme: dark) {
    input, textarea {
      background: #333;
      border-color: #555;
      color: #fff;
    }

    small {
      color: #aaa;
    }
  }

  input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
    margin-top: 0;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
  }

  button {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .secondary {
    background: #f0f0f0;
    color: #666;
  }

  .secondary:hover {
    background: #e0e0e0;
  }

  @media (prefers-color-scheme: dark) {
    .secondary {
      background: #444;
      color: #ccc;
    }
    .secondary:hover {
      background: #555;
    }
  }



  .section-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    line-height: 1.4;
  }

  @media (prefers-color-scheme: dark) {
    .section-description {
      color: #aaa;
    }
  }

  .preset-domains {
    margin-bottom: 24px;
  }



  .preset-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .preset-btn {
    padding: 8px 16px;
    background: #f8f9fa;
    color: #495057;
    border: 2px solid #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .preset-btn:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
  }

  .preset-btn:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (prefers-color-scheme: dark) {
    .preset-btn {
      background: #495057;
      color: #fff;
      border-color: #6c757d;
    }

    .preset-btn:hover:not(:disabled) {
      background: #5a6268;
      border-color: #868e96;
    }

    .preset-btn:disabled {
      background: #343a40;
      color: #868e96;
    }
  }

  .domain-override-form {
    margin-bottom: 20px;
  }


  .form-row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .domain-input {
    max-width: 150px;
  }

  .offset-input {
    max-width: 80px;
  }

  .add-btn {
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .add-btn:hover {
    background: #5a6fd8;
  }

  .domain-overrides-list {
    margin-bottom: 16px;
  }

  .domain-override-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    margin-bottom: 8px;
  }

  @media (prefers-color-scheme: dark) {
    .domain-override-item {
      background: #3a3a3a;
      border-color: #555;
    }
  }

  .domain-name {
    font-weight: 600;
    color: #333;
    min-width: 120px;
  }

  @media (prefers-color-scheme: dark) {
    .domain-name {
      color: #fff;
    }
  }

  .override-details {
    font-size: 14px;
    color: #666;
    flex-grow: 1;
  }

  @media (prefers-color-scheme: dark) {
    .override-details {
      color: #ccc;
    }
  }

  .remove-btn {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 1;
  }

  .remove-btn:hover {
    background: #c82333;
  }

  .small {
    font-size: 12px;
    padding: 8px 16px;
  }

  .no-overrides {
    font-style: italic;
    color: #999;
    text-align: center;
    padding: 20px;
  }

  @media (prefers-color-scheme: dark) {
    .no-overrides {
      color: #666;
    }
  }
</style>
