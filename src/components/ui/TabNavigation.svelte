<script lang="ts">
  export let tabs: Array<{ id: string; label: string; icon?: string }>
  export let activeTab: string

  const handleTabClick = (tabId: string) => {
    activeTab = tabId
  }
</script>

<div class="mb-8">
  <nav class="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
    {#each tabs as tab}
      <button
        class="flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 {activeTab === tab.id
          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
        on:click={() => handleTabClick(tab.id)}
      >
        {#if tab.icon}
          <span class="text-base">{tab.icon}</span>
        {/if}
        <span class="hidden sm:inline">{tab.label}</span>
      </button>
    {/each}
  </nav>
</div> 