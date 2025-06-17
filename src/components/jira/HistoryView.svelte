<script lang="ts">
  import type { JiraTicket } from '../../shared/types'

  export let history: JiraTicket[]
  export let handleViewHistoryItem: (ticket: JiraTicket) => void
  export let handleRemoveFromHistory: (ticketId: number) => void
  export let handleBackToActions: () => void
</script>

<div class="flex flex-col gap-4">
  {#if history.length > 0}
    <ul class="flex flex-col gap-3">
      {#each history as item (item.id)}
        <li class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span class="text-sm font-medium text-gray-800 truncate pr-4" title={item.title}
            >{item.title}</span
          >
          <div class="flex gap-2">
            <button
              class="text-xs px-3 py-1 rounded-md bg-[#DEEBFF] text-[#0747A6] hover:bg-[#B3D4FF]"
              on:click={() => handleViewHistoryItem(item)}>View</button
            >
            <button
              class="text-xs px-3 py-1 rounded-md bg-[#FFEBE6] text-[#BF2600] hover:bg-[#FFBDAD]"
              on:click={() => handleRemoveFromHistory(item.id)}>Remove</button
            >
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-center text-gray-500 py-8">No ticket history found.</p>
  {/if}
  <div class="flex justify-end mt-2 pt-4 border-t border-gray-100">
    <button
      class="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-md min-w-[80px]"
      on:click={handleBackToActions}
    >
      Back
    </button>
  </div>
</div> 