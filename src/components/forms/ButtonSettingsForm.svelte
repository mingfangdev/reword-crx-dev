<script lang="ts">
  import FormField from '@ui/FormField.svelte'
  import Toggle from '@ui/Toggle.svelte'
  import Preview from '@options/Preview.svelte'
  import type { ButtonSettings } from '@shared/settings'
  import { SETTINGS_CONSTRAINTS } from '@shared/settings'

  export let settings: ButtonSettings
</script>

<div class="max-w-4xl mx-auto space-y-8">
  <div class="text-center mb-8">
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Button Settings</h2>
    <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
      Configure the button's appearance and behavior, then see a live preview of your changes.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Appearance Section -->
    <div class="space-y-6">
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>🎨</span> Appearance
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        Configure the button's visual appearance and position.
      </p>
      
      <div class="space-y-6">
        <FormField
          type="number"
          label="Button size (px)"
          bind:value={settings.buttonSize}
          min={SETTINGS_CONSTRAINTS.buttonSize.min}
          max={SETTINGS_CONSTRAINTS.buttonSize.max}
          id="button-size"
        />

        <FormField
          type="number"
          label="Horizontal offset (px)"
          bind:value={settings.offsetX}
          min={SETTINGS_CONSTRAINTS.offsetX.min}
          max={SETTINGS_CONSTRAINTS.offsetX.max}
          description="Positive values move the button right, negative values move it left"
          id="offset-x"
        />

        <FormField
          type="number"
          label="Vertical offset (px)"
          bind:value={settings.offsetY}
          min={SETTINGS_CONSTRAINTS.offsetY.min}
          max={SETTINGS_CONSTRAINTS.offsetY.max}
          description="Positive values move the button down, negative values move it up"
          id="offset-y"
        />
      </div>
    </div>

    <!-- Behavior Section -->
    <div class="space-y-6">
      <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>⚙️</span> Behavior
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        Control when and how the button appears and disappears.
      </p>
      
      <div class="space-y-4">
        <Toggle
          bind:checked={settings.showOnHover}
          label="Show button only on hover"
          description="The button will only appear when you hover over an input field"
          id="show-on-hover"
        />

        <Toggle
          bind:checked={settings.autoHide}
          label="Auto-hide when focus is lost"
          description="The button will automatically hide when you click outside the input field"
          id="auto-hide"
        />
      </div>
    </div>
  </div>

  <!-- Divider -->
  <div class="border-t border-gray-200 dark:border-gray-700 my-8"></div>

  <!-- Preview Section -->
  <div class="space-y-6">
    <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2 justify-center">
      <span>👁️</span> Live Preview
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-center">
      See how your button settings will appear in real-time.
    </p>
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <Preview {settings} />
    </div>
  </div>
</div> 