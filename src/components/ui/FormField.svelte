<script lang="ts">
  export let type: 'text' | 'password' | 'number' | 'textarea' = 'text'
  export let label: string = ''
  export let value: string | number = ''
  export let placeholder: string = ''
  export let disabled: boolean = false
  export let required: boolean = false
  export let min: number | undefined = undefined
  export let max: number | undefined = undefined
  export let rows: number = 3
  export let description: string = ''
  export let id: string = ''
  export let name: string = ''

  const baseInputClasses = 'px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'
</script>

<div class="flex flex-col">
  {#if label}
    <label for={id} class="flex flex-col gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
      <span class="text-base">{label}:</span>
      
      {#if type === 'textarea'}
        <textarea
          {id}
          {name}
          bind:value
          {placeholder}
          {disabled}
          {required}
          {rows}
          class="{baseInputClasses} resize-vertical min-h-[80px] {$$props.class || ''}"
          on:input
          on:change
          on:focus
          on:blur
        ></textarea>
      {:else if type === 'number'}
        <input
          type="number"
          {id}
          {name}
          bind:value
          {placeholder}
          {disabled}
          {required}
          {min}
          {max}
          class="{baseInputClasses} w-full {$$props.class || ''}"
          on:input
          on:change
          on:focus
          on:blur
        />
      {:else if type === 'password'}
        <input
          type="password"
          {id}
          {name}
          bind:value
          {placeholder}
          {disabled}
          {required}
          class="{baseInputClasses} w-full {$$props.class || ''}"
          on:input
          on:change
          on:focus
          on:blur
        />
      {:else}
        <input
          type="text"
          {id}
          {name}
          bind:value
          {placeholder}
          {disabled}
          {required}
          class="{baseInputClasses} w-full {$$props.class || ''}"
          on:input
          on:change
          on:focus
          on:blur
        />
      {/if}
      
      {#if description}
        <small class="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </small>
      {/if}
    </label>
  {:else}
    {#if type === 'textarea'}
      <textarea
        {id}
        {name}
        bind:value
        {placeholder}
        {disabled}
        {required}
        {rows}
        class="{baseInputClasses} resize-vertical min-h-[80px] {$$props.class || ''}"
        on:input
        on:change
        on:focus
        on:blur
      ></textarea>
    {:else if type === 'number'}
      <input
        type="number"
        {id}
        {name}
        bind:value
        {placeholder}
        {disabled}
        {required}
        {min}
        {max}
        class="{baseInputClasses} w-40 {$$props.class || ''}"
        on:input
        on:change
        on:focus
        on:blur
      />
    {:else if type === 'password'}
      <input
        type="password"
        {id}
        {name}
        bind:value
        {placeholder}
        {disabled}
        {required}
        class="{baseInputClasses} w-full {$$props.class || ''}"
        on:input
        on:change
        on:focus
        on:blur
      />
    {:else}
      <input
        type="text"
        {id}
        {name}
        bind:value
        {placeholder}
        {disabled}
        {required}
        class="{baseInputClasses} w-full {$$props.class || ''}"
        on:input
        on:change
        on:focus
        on:blur
      />
    {/if}
    
    {#if description}
      <small class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {description}
      </small>
    {/if}
  {/if}
</div> 