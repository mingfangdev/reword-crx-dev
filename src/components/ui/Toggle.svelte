<script lang="ts">
  export let checked: boolean = false
  export let disabled: boolean = false
  export let label: string = ''
  export let description: string = ''
  export let id: string = ''
</script>

<label 
  class="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
  for={id}
>
  <div class="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      {id}
      bind:checked
      {disabled}
      class="sr-only peer"
    />
    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  </div>
  
  {#if label || description || $$slots.default}
    <div class="flex flex-col">
      {#if label}
        <div class="text-base font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
      {/if}
      {#if description}
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </div>
      {/if}
      <slot />
    </div>
  {/if}
</label> 