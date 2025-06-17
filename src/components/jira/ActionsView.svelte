<script lang="ts">
  export let handleCreateTicketClick: () => void
  export let handleHistoryClick: () => void
</script>

<div class="grid grid-cols-2 gap-3">
  <button
    class="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg bg-white cursor-pointer transition-all hover:border-[#0052CC] hover:bg-[#DEEBFF] hover:-translate-y-0.5 hover:shadow-lg text-gray-700"
    on:click={handleCreateTicketClick}
    title="Create Ticket"
  >
    <span class="text-2xl leading-none">🎫</span>
    <span class="text-xs font-medium text-center leading-tight">Create Ticket</span>
  </button>
  <button
    class="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg bg-white cursor-pointer transition-all hover:border-[#0052CC] hover:bg-[#DEEBFF] hover:-translate-y-0.5 hover:shadow-lg text-gray-700"
    on:click={handleHistoryClick}
    title="Ticket History"
  >
    <span class="text-2xl leading-none">📜</span>
    <span class="text-xs font-medium text-center leading-tight">History</span>
  </button>
</div> 