<script lang="ts">
  import '../app.css'
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
  let newPattern = ''
  let newOverrideSettings: Partial<ButtonSettings> = {
    offsetX: 16,
    offsetY: 4,
    rewordPrompt: ''
  }

  let saved = false

  // Edit state for pattern overrides
  let editingPattern: string | null = null
  let editSettings: Partial<ButtonSettings> = {}

  // Common pattern presets with both position and prompt overrides
  const commonPatternPresets = [
    { 
      pattern: 'atlassian.net/jira', 
      name: 'Jira', 
      settings: { 
        offsetX: -8, 
        offsetY: 8,
        rewordPrompt: 'Rephrase the provided text into a formal Jira comment. Be concise, professional, and action-oriented.'
      } 
    },
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

  const addPatternOverride = () => {
    if (newPattern.trim()) {
      domainOverrides[newPattern.trim()] = { ...newOverrideSettings }
      domainOverrides = domainOverrides // Trigger reactivity
      newPattern = ''
      newOverrideSettings = {
        offsetX: 16,
        offsetY: 4,
        rewordPrompt: ''
      }
      saveDomainOverridesData()
    }
  }

  const addPresetPattern = (preset: typeof commonPatternPresets[0]) => {
    domainOverrides[preset.pattern] = { ...preset.settings }
    domainOverrides = domainOverrides // Trigger reactivity
    saveDomainOverridesData()
  }

  const removePatternOverride = (pattern: string) => {
    delete domainOverrides[pattern]
    domainOverrides = domainOverrides // Trigger reactivity
    saveDomainOverridesData()
  }

  const startEditPatternOverride = (pattern: string) => {
    editingPattern = pattern
    editSettings = { ...domainOverrides[pattern] }
  }

  const saveEditPatternOverride = () => {
    if (editingPattern) {
      domainOverrides[editingPattern] = { ...editSettings }
      domainOverrides = domainOverrides // Trigger reactivity
      editingPattern = null
      editSettings = {}
      saveDomainOverridesData()
    }
  }

  const cancelEditPatternOverride = () => {
    editingPattern = null
    editSettings = {}
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

<main class="min-h-screen bg-gray-50 dark:bg-gray-900 p-5">
  <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
    <h1 class="text-3xl font-semibold text-center mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
      Reword Extension Settings
    </h1>

    <div class="space-y-8">
      <!-- Button Appearance Section -->
      <div class="pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">Button Appearance</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          Configure the button's visual appearance and position. The button appears at the bottom-right corner of input elements.
        </p>

        <div class="space-y-4">
          <div class="flex flex-col">
            <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Button size (px):
              <input 
                type="number" 
                bind:value={settings.buttonSize} 
                min={SETTINGS_CONSTRAINTS.buttonSize.min} 
                max={SETTINGS_CONSTRAINTS.buttonSize.max} 
                class="w-32 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </label>
          </div>

          <div class="flex flex-col">
            <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Horizontal offset (px):
              <input 
                type="number" 
                bind:value={settings.offsetX} 
                min={SETTINGS_CONSTRAINTS.offsetX.min} 
                max={SETTINGS_CONSTRAINTS.offsetX.max} 
                class="w-32 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <small class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Positive values move the button right, negative values move it left
              </small>
            </label>
          </div>

          <div class="flex flex-col">
            <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Vertical offset (px):
              <input 
                type="number" 
                bind:value={settings.offsetY} 
                min={SETTINGS_CONSTRAINTS.offsetY.min} 
                max={SETTINGS_CONSTRAINTS.offsetY.max} 
                class="w-32 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <small class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Positive values move the button down, negative values move it up
              </small>
            </label>
          </div>
        </div>
      </div>

      <!-- Behavior Section -->
      <div class="pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">Behavior</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input 
              type="checkbox" 
              bind:checked={settings.showOnHover} 
              class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            Show button only on hover over input
          </label>

          <label class="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input 
              type="checkbox" 
              bind:checked={settings.autoHide} 
              class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            Auto-hide when focus is lost
          </label>
        </div>
      </div>

      <!-- Domain-Specific Overrides Section -->
      <div class="pb-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">URL Pattern Overrides</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Configure custom button positions and prompts for specific websites. Use domain patterns (e.g., 'example.com') or URL patterns (e.g., 'atlassian.net/jira') for more precise matching.
        </p>
        
        <!-- Common domain presets -->
        <div class="mb-6">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">Quick Add Common Patterns</h4>
          <div class="flex flex-wrap gap-2">
            {#each commonPatternPresets as preset}
              <button 
                class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-md transition-colors duration-200"
                on:click={() => addPresetPattern(preset)}
                disabled={Object.keys(domainOverrides).some(pattern => pattern === preset.pattern || pattern.endsWith('.' + preset.pattern))}
              >
                + {preset.name}
              </button>
            {/each}
          </div>
        </div>

        <!-- Add new domain override -->
        <div class="mb-5">
          <h4 class="text-base font-medium text-gray-900 dark:text-white mb-3">Custom URL Pattern Override</h4>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                URL Pattern:
                <input 
                  type="text" 
                  bind:value={newPattern} 
                  placeholder="atlassian.net/jira" 
                  class="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </label>
              <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                X Offset:
                <input 
                  type="number" 
                  bind:value={newOverrideSettings.offsetX} 
                  placeholder="16"
                  min={SETTINGS_CONSTRAINTS.offsetX.min} 
                  max={SETTINGS_CONSTRAINTS.offsetX.max}
                  class="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </label>
              <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Y Offset:
                <input 
                  type="number" 
                  bind:value={newOverrideSettings.offsetY} 
                  placeholder="4"
                  min={SETTINGS_CONSTRAINTS.offsetY.min} 
                  max={SETTINGS_CONSTRAINTS.offsetY.max}
                  class="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </label>
            </div>
            <div class="flex flex-col">
              <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Prompt (Optional):
                <textarea 
                  bind:value={newOverrideSettings.rewordPrompt} 
                  placeholder="Enter custom prompt for this domain..." 
                  rows="3"
                  class="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical min-h-[80px]"
                ></textarea>
              </label>
            </div>
            <button 
              class="self-start px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              on:click={addPatternOverride}
            >
              Add Custom Pattern
            </button>
          </div>
        </div>

        <!-- List existing domain overrides -->
        {#if Object.keys(domainOverrides).length > 0}
          <div class="mb-4 space-y-3">
            {#each Object.entries(domainOverrides) as [pattern, override]}
              <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                {#if editingPattern === pattern}
                  <!-- Edit mode -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-semibold text-gray-900 dark:text-white text-base">Editing: {pattern}</span>
                      <div class="flex gap-2">
                        <button 
                          class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md"
                          on:click={saveEditPatternOverride}
                        >
                          Save
                        </button>
                        <button 
                          class="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-md"
                          on:click={cancelEditPatternOverride}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        X Offset:
                        <input 
                          type="number" 
                          bind:value={editSettings.offsetX} 
                          min={SETTINGS_CONSTRAINTS.offsetX.min} 
                          max={SETTINGS_CONSTRAINTS.offsetX.max}
                          class="w-32 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </label>
                      <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Y Offset:
                        <input 
                          type="number" 
                          bind:value={editSettings.offsetY} 
                          min={SETTINGS_CONSTRAINTS.offsetY.min} 
                          max={SETTINGS_CONSTRAINTS.offsetY.max}
                          class="w-32 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </label>
                    </div>
                    <div class="flex flex-col">
                      <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Custom Prompt (Optional):
                        <textarea 
                          bind:value={editSettings.rewordPrompt} 
                          placeholder="Enter custom prompt for this domain..." 
                          rows="3"
                          class="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical min-h-[80px]"
                        ></textarea>
                      </label>
                    </div>
                  </div>
                {:else}
                  <!-- View mode -->
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-gray-900 dark:text-white text-base">{pattern}</span>
                    <div class="flex gap-2">
                      <button 
                        class="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs leading-none"
                        on:click={() => startEditPatternOverride(pattern)}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button 
                        class="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-base leading-none"
                        on:click={() => removePatternOverride(pattern)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      Position: ({override.offsetX || 16}, {override.offsetY || 4})
                    </div>
                    {#if override.rewordPrompt}
                      <div class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        <strong>Custom Prompt:</strong> {override.rewordPrompt.substring(0, 100)}{override.rewordPrompt.length > 100 ? '...' : ''}
                      </div>
                    {:else}
                      <div class="text-xs text-gray-400 dark:text-gray-500 italic">
                        Using default prompt
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
          <button 
            class="px-4 py-2 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
            on:click={resetDomainOverrides}
          >
            Clear All Pattern Overrides
          </button>
        {:else}
          <p class="text-center py-5 text-sm text-gray-500 dark:text-gray-400 italic">
            No URL pattern overrides configured.
          </p>
        {/if}
      </div>

      <!-- AI Integration Section -->
      <div class="pb-6">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">AI Integration</h3>
        <div class="space-y-4">
          <div class="flex flex-col">
            <label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              OpenRouter API Key:
              <input 
                type="password" 
                bind:value={settings.openRouterApiKey} 
                placeholder="sk-or-..." 
                class="max-w-sm px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <small class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Get your API key from <a href="https://openrouter.ai/keys" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">openrouter.ai/keys</a>
              </small>
            </label>
          </div>

          <div class="flex flex-col">
            <label for="reword-prompt" class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Prompt:
            </label>
            <textarea 
              id="reword-prompt"
              bind:value={settings.rewordPrompt} 
              rows="3" 
              placeholder="Enter your custom prompt for rephrasing text..."
              class="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical min-h-[80px]"
            ></textarea>
            <small class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This prompt will be used to instruct the AI how to rephrase your text
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 mt-8 mb-8">
      <button 
        class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-md transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        on:click={saveSettings}
      >
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
      <button 
        class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors duration-200"
        on:click={resetSettings}
      >
        Reset to Defaults
      </button>
    </div>

    <Preview {settings} />
  </div>
</main>
