<script lang="ts">
  import FormField from '@ui/FormField.svelte'
  import Button from '@ui/Button.svelte'
  import type { ButtonSettings } from '@shared/settings'
  import { SETTINGS_CONSTRAINTS } from '@shared/settings'

  export let domainOverrides: Record<string, Partial<ButtonSettings>>
  export let saveDomainOverridesData: () => Promise<void>

  let newPattern = ''
  let newOverrideSettings: Partial<ButtonSettings> = {
    offsetX: 16,
    offsetY: 4,
    rewordPrompt: '',
  }

  // Edit state for pattern overrides
  let editingPattern: string | null = null
  let editSettings: Partial<ButtonSettings> = {}

  // Common pattern presets with both position and prompt overrides
  const commonPatternPresets = [
    {
      pattern: 'atlassian.net/jira',
      name: 'Jira',
      settings: {
        offsetX: -16,
        offsetY: -32,
        rewordPrompt:
          'Rephrase the provided text into a formal Jira comment. Be concise, professional, and action-oriented.',
      },
    },
  ]

  const addPatternOverride = () => {
    if (newPattern.trim()) {
      domainOverrides[newPattern.trim()] = { ...newOverrideSettings }
      domainOverrides = domainOverrides // Trigger reactivity
      newPattern = ''
      newOverrideSettings = {
        offsetX: 16,
        offsetY: 4,
        rewordPrompt: '',
      }
      saveDomainOverridesData()
    }
  }

  const addPresetPattern = (preset: (typeof commonPatternPresets)[0]) => {
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

  const resetDomainOverrides = () => {
    domainOverrides = {}
    saveDomainOverridesData()
  }
</script>

<div class="space-y-8">
  <div class="text-center mb-8">
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Site-Specific Overrides</h2>
    <p class="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
      Configure custom button positions and prompts for specific websites. Use domain patterns
      (e.g., 'example.com') or URL patterns (e.g., 'atlassian.net/jira') for more precise matching.
    </p>
  </div>

  <div class="max-w-4xl mx-auto">
    <!-- Common domain presets -->
    <div class="mb-8">
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">
        Quick Add Common Patterns
      </h3>
      <div class="flex flex-wrap gap-3">
        {#each commonPatternPresets as preset}
          <Button
            variant="secondary"
            size="medium"
            on:click={() => addPresetPattern(preset)}
            disabled={Object.keys(domainOverrides).some(
              (pattern) =>
                pattern === preset.pattern || pattern.endsWith('.' + preset.pattern),
            )}
          >
            + {preset.name}
          </Button>
        {/each}
      </div>
    </div>

    <!-- Add new domain override -->
    <div class="mb-8">
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">
        Custom URL Pattern Override
      </h3>
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            type="text"
            label="URL Pattern"
            bind:value={newPattern}
            placeholder="atlassian.net/jira"
            id="new-pattern"
          />
          
          <FormField
            type="number"
            label="X Offset"
            bind:value={newOverrideSettings.offsetX}
            placeholder="16"
            min={SETTINGS_CONSTRAINTS.offsetX.min}
            max={SETTINGS_CONSTRAINTS.offsetX.max}
            id="new-offset-x"
          />
          
          <FormField
            type="number"
            label="Y Offset"
            bind:value={newOverrideSettings.offsetY}
            placeholder="4"
            min={SETTINGS_CONSTRAINTS.offsetY.min}
            max={SETTINGS_CONSTRAINTS.offsetY.max}
            id="new-offset-y"
          />
        </div>
        
        <FormField
          type="textarea"
          label="Custom Prompt (Optional)"
          bind:value={newOverrideSettings.rewordPrompt}
          placeholder="Enter custom prompt for this domain..."
          rows={3}
          id="new-prompt"
          class="min-h-[80px]"
        />
        
        <Button variant="primary" on:click={addPatternOverride}>
          Add Custom Pattern
        </Button>
      </div>
    </div>

    <!-- List existing domain overrides -->
    {#if Object.keys(domainOverrides).length > 0}
      <div class="mb-4 space-y-3">
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4">
          Configured Patterns
        </h3>
        {#each Object.entries(domainOverrides) as [pattern, override]}
          <div class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            {#if editingPattern === pattern}
              <!-- Edit mode -->
              <div class="space-y-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-gray-900 dark:text-white text-base"
                    >Editing: {pattern}</span
                  >
                  <div class="flex gap-2">
                    <Button variant="success" size="small" on:click={saveEditPatternOverride}>
                      Save
                    </Button>
                    <Button variant="secondary" size="small" on:click={cancelEditPatternOverride}>
                      Cancel
                    </Button>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    type="number"
                    label="X Offset"
                    bind:value={editSettings.offsetX}
                    min={SETTINGS_CONSTRAINTS.offsetX.min}
                    max={SETTINGS_CONSTRAINTS.offsetX.max}
                    id="edit-offset-x-{pattern}"
                  />
                  
                  <FormField
                    type="number"
                    label="Y Offset"
                    bind:value={editSettings.offsetY}
                    min={SETTINGS_CONSTRAINTS.offsetY.min}
                    max={SETTINGS_CONSTRAINTS.offsetY.max}
                    id="edit-offset-y-{pattern}"
                  />
                </div>
                
                <FormField
                  type="textarea"
                  label="Custom Prompt (Optional)"
                  bind:value={editSettings.rewordPrompt}
                  placeholder="Enter custom prompt for this domain..."
                  rows={3}
                  id="edit-prompt-{pattern}"
                  class="min-h-[80px]"
                />
              </div>
            {:else}
              <!-- View mode -->
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-900 dark:text-white text-base"
                  >{pattern}</span
                >
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
                    <strong>Custom Prompt:</strong>
                    {override.rewordPrompt.substring(0, 100)}{override.rewordPrompt.length >
                    100
                      ? '...'
                      : ''}
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
      
      <Button variant="secondary" on:click={resetDomainOverrides}>
        Clear All Pattern Overrides
      </Button>
    {:else}
      <div class="text-center py-8">
        <p class="text-lg text-gray-500 dark:text-gray-400 italic">
          No URL pattern overrides configured.
        </p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Add patterns above to customize behavior for specific websites.
        </p>
      </div>
    {/if}
  </div>
</div> 