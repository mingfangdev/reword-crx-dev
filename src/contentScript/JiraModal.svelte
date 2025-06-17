<script lang="ts">
  import { generateText } from '../shared/openai'
  import { loadSettings } from '../shared/settings'
  import { jiraTicketPrompt } from '../prompts/jiraTicket'
  import {
    getJiraTicketHistory,
    removeTicketFromHistory,
    saveTicketToHistory,
  } from '../shared/jiraHistory'
  import type { JiraTicket } from '../shared/types'

  export let isOpen: boolean = false
  export let onClose: () => void

  const DEBUG = import.meta.env.MODE === 'development'

  const PLACEHOLDER_TEXT =
    'Just describe the scenario for this ticket and it will generate the user story and acceptance criteria...'

  type View = 'actions' | 'create' | 'generating' | 'result' | 'history'

  let view: View = 'actions'
  let userStoryDescription = ''
  let generatedTicket = ''
  let parsedTicket: JiraTicket | null = null
  let history: JiraTicket[] = []

  const resetState = () => {
    view = 'actions'
    userStoryDescription = ''
    generatedTicket = ''
    parsedTicket = null
    history = []
  }

  const handleClose = () => {
    if (DEBUG) console.log('[Reword Extension] JiraModal closing')
    resetState()
    onClose()
  }

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose()
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose()
    }
  }

  const handleCreateTicketClick = () => {
    if (DEBUG) console.log('[Reword Extension] Create ticket clicked')
    view = 'create'
  }

  const handleHistoryClick = () => {
    if (DEBUG) console.log('[Reword Extension] History clicked')
    history = getJiraTicketHistory()
    view = 'history'
  }

  const handleBackToActions = () => {
    view = 'actions'
    userStoryDescription = ''
    generatedTicket = ''
    parsedTicket = null
  }

  const handleGenerateTicket = async () => {
    if (!userStoryDescription.trim()) {
      alert('Please describe the scenario for your ticket')
      return
    }

    if (DEBUG)
      console.log('[Reword Extension] Generating ticket with description:', userStoryDescription)

    view = 'generating'

    try {
      const settings = await loadSettings()

      const result = await generateText({
        prompt: jiraTicketPrompt,
        content: userStoryDescription,
        apiKey: settings.openRouterApiKey,
      })

      if (result.success && result.text) {
        generatedTicket = result.text

        try {
          const parsed = JSON.parse(result.text)
          parsedTicket = { ...parsed, id: Date.now() }
          saveTicketToHistory(parsed)
          view = 'result'
          if (DEBUG)
            console.log(
              '[Reword Extension] Ticket generated and parsed successfully:',
              parsedTicket,
            )
        } catch (parseError) {
          console.log('Original result:', result)
          console.error('Error parsing JSON response:', parseError)
          alert('Error: The AI response was not in valid JSON format. Please try again.')
          view = 'create'
          return
        }
      } else {
        throw new Error(result.error || 'Failed to generate ticket')
      }
    } catch (error) {
      console.error('Error generating ticket:', error)
      alert(`Error generating ticket: ${error instanceof Error ? error.message : 'Unknown error'}`)
      view = 'create'
    }
  }

  const handleEditDescription = () => {
    view = 'create'
  }

  const handleViewHistoryItem = (ticket: JiraTicket) => {
    parsedTicket = ticket
    view = 'result'
  }

  const handleRemoveFromHistory = (ticketId: number) => {
    history = removeTicketFromHistory(ticketId)
  }

  const handleCopyTitle = () => {
    if (!parsedTicket) return
    handleCopySection('Title', parsedTicket.title)
  }
  const handleCopyDescription = () => {
    if (!parsedTicket) return
    handleCopySection('Description', parsedTicket.description)
  }
  const handleCopyUserStory = () => {
    if (!parsedTicket) return
    handleCopySection('User Story', parsedTicket.userStory)
  }
  const handleCopyAcceptanceCriteria = () => {
    if (!parsedTicket) return
    handleCopySection('Acceptance Criteria', parsedTicket.acceptanceCriteria)
  }
  const handleCopyTechnicalNotes = () => {
    if (!parsedTicket) return
    handleCopySection('Technical Notes', parsedTicket.technicalNotes)
  }

  const handleCopySection = async (sectionName: string, content: string | string[]) => {
    try {
      let textToCopy = ''
      if (Array.isArray(content)) {
        textToCopy = content.join('\n')
      } else {
        textToCopy = content
      }

      await navigator.clipboard.writeText(textToCopy)

      // Show a temporary visual feedback
      const button = event?.target as HTMLElement
      if (button) {
        const originalText = button.textContent
        button.textContent = 'Copied!'
        button.style.background = '#10b981'
        setTimeout(() => {
          button.textContent = originalText
          button.style.background = ''
        }, 1000)
      }

      if (DEBUG) console.log(`[Reword Extension] ${sectionName} copied to clipboard`)
    } catch (err) {
      console.error(`Failed to copy ${sectionName}:`, err)
      alert(`Failed to copy ${sectionName} to clipboard`)
    }
  }

  const handleCopyFullTicket = () => {
    if (!parsedTicket) return

    const fullTicket = `Title: ${parsedTicket.title}

Description:
${parsedTicket.description}

User Story:
${parsedTicket.userStory}

Acceptance Criteria:
${parsedTicket.acceptanceCriteria.map((criteria: string, index: number) => `${index + 1}. ${criteria}`).join('\n')}

Technical Notes:
${parsedTicket.technicalNotes}`

    navigator.clipboard
      .writeText(fullTicket)
      .then(() => {
        alert('Full ticket copied to clipboard!')
      })
      .catch((err) => {
        console.error('Failed to copy full ticket:', err)
        alert('Failed to copy full ticket to clipboard')
      })
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if isOpen}
  <div
    class="bg-white rounded-xl shadow-2xl w-[500px] max-h-[90vh] overflow-hidden fixed bottom-4 right-4 animate-[slideIn_0.3s_ease-out] z-[1000000] border border-gray-300 flex flex-col"
    on:keydown={handleKeydown}
    tabindex="-1"
  >
    <div
      class="bg-blue-500 flex justify-between items-center px-5 py-4 border-b border-gray-200 flex-shrink-0"
    >
      <h3 class="m-0 font-semibold text-white">
        {#if view === 'actions'}
          Jira Quick Actions
        {:else if view === 'history'}
          Ticket History
        {:else if view === 'result'}
          Generated Ticket
        {:else}
          Create Jira Ticket
        {/if}
      </h3>
      <button
        class="bg-transparent border-none text-white text-lg cursor-pointer p-1 rounded transition-colors hover:bg-white/20"
        on:click={handleClose}
        title="Close"
      >
        ✕
      </button>
    </div>

    <div class="flex-grow p-6 overflow-y-auto">
      {#if view === 'actions'}
        <div class="grid grid-cols-2 gap-3">
          <button
            class="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg bg-white cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-lg text-gray-700"
            on:click={handleCreateTicketClick}
            title="Create Ticket"
          >
            <span class="text-2xl leading-none">🎫</span>
            <span class="text-xs font-medium text-center leading-tight">Create Ticket</span>
          </button>
          <button
            class="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg bg-white cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-lg text-gray-700"
            on:click={handleHistoryClick}
            title="Ticket History"
          >
            <span class="text-2xl leading-none">📜</span>
            <span class="text-xs font-medium text-center leading-tight">History</span>
          </button>
        </div>
      {:else if view === 'create' || view === 'generating'}
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="userStory" class="text-sm font-medium text-gray-700"
              >Describe your ticket</label
            >
            <textarea
              id="userStory"
              bind:value={userStoryDescription}
              placeholder={PLACEHOLDER_TEXT}
              class="w-full p-3 border border-gray-300 rounded-lg text-sm font-sans resize-y min-h-[200px] bg-white text-gray-700 leading-relaxed transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-gray-400 placeholder:leading-relaxed"
              rows="10"
              disabled={view === 'generating'}
            ></textarea>
          </div>

          <div class="flex gap-3 justify-end mt-2 pt-4 border-t border-gray-100">
            <button
              class="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-md min-w-[80px]"
              on:click={handleBackToActions}
              disabled={view === 'generating'}
            >
              Back
            </button>
            <button
              class="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-blue-500 bg-blue-500 text-white shadow-[0_2px_4px_rgba(59,130,246,0.2)] hover:bg-blue-700 hover:border-blue-700 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(59,130,246,0.3)] min-w-[80px] disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              on:click={handleGenerateTicket}
              disabled={view === 'generating'}
            >
              {#if view === 'generating'}Generating...{:else}Generate Ticket{/if}
            </button>
          </div>
        </div>
      {:else if view === 'history'}
        <div class="flex flex-col gap-4">
          {#if history.length > 0}
            <ul class="flex flex-col gap-3">
              {#each history as item (item.id)}
                <li
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span class="text-sm font-medium text-gray-800 truncate pr-4" title={item.title}
                    >{item.title}</span
                  >
                  <div class="flex gap-2">
                    <button
                      class="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                      on:click={() => handleViewHistoryItem(item)}>View</button
                    >
                    <button
                      class="text-xs px-3 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200"
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
      {:else if view === 'result'}
        {#if parsedTicket}
          <div class="flex flex-col gap-6">
            <div class="bg-gray-50 border border-gray-300 rounded-lg">
              <div
                class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300"
              >
                <h4 class="text-base font-semibold text-gray-900 m-0">Title</h4>
                <button
                  class="bg-blue-500 text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(59,130,246,0.3)] min-w-[60px]"
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

            <div class="bg-gray-50 border border-gray-300 rounded-lg">
              <div
                class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300"
              >
                <h4 class="text-base font-semibold text-gray-900 m-0">Description</h4>
                <button
                  class="bg-blue-500 text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(59,130,246,0.3)] min-w-[60px]"
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

            <div class="bg-gray-50 border border-gray-300 rounded-lg">
              <div
                class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300"
              >
                <h4 class="text-base font-semibold text-gray-900 m-0">User Story</h4>
                <button
                  class="bg-blue-500 text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(59,130,246,0.3)] min-w-[60px]"
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

            <div class="bg-gray-50 border border-gray-300 rounded-lg">
              <div
                class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300"
              >
                <h4 class="text-base font-semibold text-gray-900 m-0">Acceptance Criteria</h4>
                <button
                  class="bg-blue-500 text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(59,130,246,0.3)] min-w-[60px]"
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

            <div class="bg-gray-50 border border-gray-300 rounded-lg">
              <div
                class="flex justify-between items-center px-5 py-4 bg-gray-100 border-b border-gray-300"
              >
                <h4 class="text-base font-semibold text-gray-900 m-0">Technical Notes</h4>
                <button
                  class="bg-blue-500 text-white border-none rounded px-3 py-1.5 text-sm font-medium cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(59,130,246,0.3)] min-w-[60px]"
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
      {/if}
    </div>

    {#if view === 'result'}
      <div class="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
        <div class="flex gap-3 justify-end">
          <button
            class="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-md min-w-[80px]"
            on:click={handleEditDescription}
          >
            Edit
          </button>
          <button
            class="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-md min-w-[80px]"
            on:click={handleCopyFullTicket}
          >
            Copy Full Ticket
          </button>
          <button
            class="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-blue-500 bg-blue-500 text-white shadow-[0_2px_4px_rgba(59,130,246,0.2)] hover:bg-blue-700 hover:border-blue-700 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(59,130,246,0.3)] min-w-[80px]"
            on:click={handleClose}
          >
            Done
          </button>
        </div>
      </div>
    {/if}

    <div class="flex-shrink-0 px-5 py-3 border-t border-gray-200 bg-gray-50">
      <p class="m-0 text-xs text-gray-600 text-center">
        {#if view === 'actions'}
          Quick access to Jira functions
        {:else if view === 'history'}
          Review your past tickets
        {:else if view === 'result'}
          AI-generated ticket ready for use
        {:else}
          Describe your ticket requirements
        {/if}
      </p>
    </div>
  </div>
{/if}

<style>
  /* Custom keyframe for slide-in animation */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
</style>
