<script lang="ts">
  export let checked = false
  export let label: string
  export let description: string
  export let id: string
  export let disabled = false
</script>

<label
  class="flex items-center justify-between {disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer'}"
  for={id}
>
  <div class="flex flex-col">
    <span class="text-sm font-medium text-gray-700 dark:text-gray-500">{label}</span>
    {#if description}
      <span class="text-xs text-gray-500 dark:text-gray-400">{description}</span>
    {/if}
  </div>
  <div class="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      bind:checked
      {disabled}
      {id}
      class="sr-only peer"
      on:change
      on:click
    />
    <div
      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"
    ></div>
  </div>
</label>

<style>
</style> 