<script lang="ts">
  export let userStoryDescription: string
  export let isGenerating: boolean
  export let handleBackToActions: () => void
  export let handleGenerateTicket: () => void

  const PLACEHOLDER_TEXT =
    'Just describe the scenario for this ticket and it will generate the user story and acceptance criteria...'
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <label for="userStory" class="text-sm font-medium text-white">Describe your ticket</label>
    <textarea
      id="userStory"
      bind:value={userStoryDescription}
      placeholder={PLACEHOLDER_TEXT}
      class="w-full p-3 border border-gray-300 rounded-lg text-sm font-sans resize-y min-h-[200px] bg-white text-gray-700 leading-relaxed transition-all focus:outline-none focus:border-[#0052CC] focus:shadow-[0_0_0_3px_rgba(0,82,204,0.1)] placeholder:text-gray-400 placeholder:leading-relaxed"
      rows="10"
      disabled={isGenerating}
    ></textarea>
  </div>

  <div class="flex gap-3 justify-end mt-2 pt-4 border-t border-gray-100">
    <button
      class="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-md min-w-[80px]"
      on:click={handleBackToActions}
      disabled={isGenerating}
    >
      Back
    </button>
    <button
      class="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-[#0052CC] bg-[#0052CC] text-white shadow-[0_2px_4px_rgba(0,82,204,0.2)] hover:bg-[#0747A6] hover:border-[#0747A6] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,82,204,0.3)] min-w-[80px] disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      on:click={handleGenerateTicket}
      disabled={isGenerating}
    >
      {#if isGenerating}Generating...{:else}Generate Ticket{/if}
    </button>
  </div>
</div> 