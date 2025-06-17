<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary'
  export let size: 'small' | 'medium' | 'large' = 'medium'
  export let disabled: boolean = false
  export let loading: boolean = false
  export let type: 'button' | 'submit' | 'reset' = 'button'

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  $: variantClasses = {
    primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white focus:ring-violet-500 hover:transform hover:-translate-y-0.5 hover:shadow-lg',
    secondary: 'bg-[#505F79] hover:bg-[#42526E] text-white focus:ring-[#505F79]',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
  }[variant]

  $: sizeClasses = {
    small: 'px-3 py-1 text-xs',
    medium: 'px-6 py-3 text-sm',
    large: 'px-8 py-4 text-base'
  }[size]
</script>

<button
  {type}
  {disabled}
  class="{baseClasses} {variantClasses} {sizeClasses} {$$props.class || ''}"
  on:click
>
  {#if loading}
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <slot name="loading">Loading...</slot>
    </div>
  {:else}
    <slot />
  {/if}
</button>

<style>
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style> 