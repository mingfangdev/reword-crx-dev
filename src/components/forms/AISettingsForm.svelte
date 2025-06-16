<script lang="ts">
  import FormField from '@ui/FormField.svelte'
  import type { ButtonSettings } from '@shared/settings'

  export let settings: ButtonSettings
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="text-center mb-8">
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">AI Integration</h2>
    <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
      Configure your AI settings for text rewriting functionality.
    </p>
  </div>

  <div class="space-y-6">
    <FormField
      type="password"
      label="OpenRouter API Key"
      bind:value={settings.openRouterApiKey}
      placeholder="sk-or-..."
      description="Get your API key from openrouter.ai/keys"
      id="openrouter-api-key"
    />

    <FormField
      type="textarea"
      label="Default Prompt"
      bind:value={settings.rewordPrompt}
      placeholder="Enter your custom prompt for rephrasing text..."
      rows={6}
      description="This prompt will be used to instruct the AI how to rephrase your text"
      id="reword-prompt"
      class="min-h-[120px]"
    />
  </div>
</div> 