<script lang="ts">
  import { onMount } from 'svelte'
  import { DEFAULT_SETTINGS, SETTINGS_CONSTRAINTS, loadSettings, saveSettings as saveSettingsToStorage, sendSettingsUpdateToTabs } from '../shared/settings'
  import type { ButtonSettings } from '../shared/settings'

  // Use centralized default settings
  let settings: ButtonSettings = { ...DEFAULT_SETTINGS }

  let saved = false

  onMount(async () => {
    // Load saved settings using centralized function
    settings = await loadSettings()
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

  const resetSettings = () => {
    settings = { ...DEFAULT_SETTINGS }
    saveSettings()
  }
</script>

<main>
  <h1>Reword Extension Settings</h1>

  <div class="settings-section">
    <h3>Button Position</h3>
    <div class="setting-group">
      <label>
        Position relative to input:
        <select bind:value={settings.buttonPosition}>
          <option value="right">Right side</option>
          <option value="left">Left side</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
        </select>
      </label>
    </div>

    <div class="setting-group">
      <label>
        Horizontal offset (px):
        <input type="number" bind:value={settings.offsetX} min={SETTINGS_CONSTRAINTS.offsetX.min} max={SETTINGS_CONSTRAINTS.offsetX.max} />
      </label>
    </div>

    <div class="setting-group">
      <label>
        Vertical offset (px):
        <input type="number" bind:value={settings.offsetY} min={SETTINGS_CONSTRAINTS.offsetY.min} max={SETTINGS_CONSTRAINTS.offsetY.max} />
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

  <div class="preview">
    <h3>Preview</h3>
    <div class="preview-input">
      <input type="text" placeholder="Sample input field..." readonly />
      <div 
        class="preview-button" 
        style="
          width: {settings.buttonSize}px; 
          height: {settings.buttonSize}px;
          {settings.buttonPosition === 'right' ? `left: calc(100% + ${settings.offsetX}px);` : ''}
          {settings.buttonPosition === 'left' ? `right: calc(100% + ${Math.abs(settings.offsetX)}px);` : ''}
          {settings.buttonPosition === 'top' ? `bottom: calc(100% + ${Math.abs(settings.offsetY)}px); left: 50%;` : ''}
          {settings.buttonPosition === 'bottom' ? `top: calc(100% + ${settings.offsetY}px); left: 50%;` : ''}
          top: {settings.buttonPosition === 'right' || settings.buttonPosition === 'left' ? settings.offsetY + 'px' : 'auto'};
        "
      >
        ✏️
      </div>
    </div>
  </div>
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
  }

  h3 {
    color: #333;
    margin-bottom: 16px;
    font-weight: 500;
  }

  @media (prefers-color-scheme: dark) {
    h3 {
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

  input, select, textarea {
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
    input, select, textarea {
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

  .preview {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 2px dashed #ddd;
  }

  @media (prefers-color-scheme: dark) {
    .preview {
      background: #333;
      border-color: #555;
    }
  }

  .preview-input {
    position: relative;
    display: inline-block;
  }

  .preview-input input {
    width: 300px;
    max-width: none;
  }

  .preview-button {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
</style>
