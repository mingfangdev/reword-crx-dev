<script lang="ts">
  import type { JiraTicket } from '../../shared/types'

  export let parsedTicket: JiraTicket | null

  export let handleCopyTitle: () => void
  export let handleCopyDescription: () => void
  export let handleCopyUserStory: () => void
  export let handleCopyAcceptanceCriteria: () => void
  export let handleCopyTechnicalNotes: () => void
</script>

{#if parsedTicket}
  <div class="flex flex-col gap-6">
    <div class="bg-gray-50 border border-gray-300 rounded-lg overflow-auto">
      <div class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300">
        <h4 class="text-base font-semibold text-gray-900 m-0">Title</h4>
        <button
          class="bg-[#0052CC] text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-[#0747A6] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,82,204,0.3)] min-w-[60px]"
          on:click={handleCopyTitle}
        >
          Copy
        </button>
      </div>
      <div
        class="p-5 text-base leading-relaxed text-gray-900 font-sans min-h-[50px] break-words whitespace-pre-wrap"
      >
        <div class="block w-full text-gray-900 text-base leading-relaxed font-medium">
          {parsedTicket.title || 'No title available'}
        </div>
      </div>
    </div>

    <div class="bg-gray-50 border border-gray-300 rounded-lg overflow-auto">
      <div class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300">
        <h4 class="text-base font-semibold text-gray-900 m-0">Description</h4>
        <button
          class="bg-[#0052CC] text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-[#0747A6] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,82,204,0.3)] min-w-[60px]"
          on:click={handleCopyDescription}
        >
          Copy
        </button>
      </div>
      <div
        class="p-5 text-base leading-relaxed text-gray-900 font-sans min-h-[50px] break-words whitespace-pre-wrap"
      >
        <div class="block w-full text-gray-900 text-base leading-relaxed">
          {parsedTicket.description || 'No description available'}
        </div>
      </div>
    </div>

    <div class="bg-gray-50 border border-gray-300 rounded-lg overflow-auto">
      <div class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300">
        <h4 class="text-base font-semibold text-gray-900 m-0">User Story</h4>
        <button
          class="bg-[#0052CC] text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-[#0747A6] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,82,204,0.3)] min-w-[60px]"
          on:click={handleCopyUserStory}
        >
          Copy
        </button>
      </div>
      <div
        class="p-5 text-base leading-relaxed text-gray-900 font-sans min-h-[50px] break-words whitespace-pre-wrap"
      >
        <div class="block w-full text-gray-900 text-base leading-relaxed">
          {parsedTicket.userStory || 'No user story available'}
        </div>
      </div>
    </div>

    <div class="bg-gray-50 border border-gray-300 rounded-lg overflow-auto">
      <div class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300">
        <h4 class="text-base font-semibold text-gray-900 m-0">Acceptance Criteria</h4>
        <button
          class="bg-[#0052CC] text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-[#0747A6] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,82,204,0.3)] min-w-[60px]"
          on:click={handleCopyAcceptanceCriteria}
        >
          Copy
        </button>
      </div>
      <div
        class="p-5 text-base leading-relaxed text-gray-900 font-sans min-h-[50px] break-words whitespace-pre-wrap"
      >
        <ul class="m-0 pl-6">
          {#if parsedTicket.acceptanceCriteria}
            {#each parsedTicket.acceptanceCriteria as criteria}
              <li class="mb-3 last:mb-0 text-gray-900">{criteria}</li>
            {/each}
          {/if}
        </ul>
      </div>
    </div>

    <div class="bg-gray-50 border border-gray-300 rounded-lg overflow-auto">
      <div class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300">
        <h4 class="text-base font-semibold text-gray-900 m-0">Technical Notes</h4>
        <button
          class="bg-[#0052CC] text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-[#0747A6] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,82,204,0.3)] min-w-[60px]"
          on:click={handleCopyTechnicalNotes}
        >
          Copy
        </button>
      </div>
      <div
        class="p-5 text-base leading-relaxed text-gray-900 font-sans min-h-[50px] break-words whitespace-pre-wrap"
      >
        <div class="block w-full text-gray-900 text-base leading-relaxed">
          {parsedTicket.technicalNotes || 'No technical notes available'}
        </div>
      </div>
    </div>
  </div>
{/if} 