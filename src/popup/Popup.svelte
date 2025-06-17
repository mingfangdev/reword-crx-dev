<script lang="ts">
  import ActionsView from '@components/jira/ActionsView.svelte'
  import CreateView from '@components/jira/CreateView.svelte'
  import HistoryView from '@components/jira/HistoryView.svelte'
  import PopupFooter from '@components/layout/PopupFooter.svelte'
  import ResultView from '@components/jira/ResultView.svelte'
  import { jiraTicketPrompt } from '@prompts/jiraTicket'
  import {
    getJiraTicketHistory,
    removeTicketFromHistory,
    saveTicketToHistory,
  } from '@shared/jiraHistory'
  import { generateText } from '@shared/openai'
  import {
    DEFAULT_SETTINGS,
    loadSettings,
    saveSettings as saveSettingsToStorage,
    sendSettingsUpdateToTabs,
  } from '@shared/settings'
  import type { ButtonSettings } from '@shared/settings'
  import type { JiraTicket } from '@shared/types'
  import Button from '@ui/Button.svelte'
  import MoreOptionsButton from '@ui/MoreOptionsButton.svelte'
  import Toggle from '@ui/Toggle.svelte'
  import { onMount } from 'svelte'

  // Use centralized default settings
  let settings: ButtonSettings = { ...DEFAULT_SETTINGS }

  let saved = false
  let isInitialLoad = true
  let previousSettings: string | null = null
  let isJiraPage = false

  type View = 'actions' | 'create' | 'generating' | 'result' | 'history'

  let view: View = 'actions'
  let userStoryDescription = ''
  let generatedTicket = ''
  let parsedTicket: JiraTicket | null = null
  let history: JiraTicket[] = []

  let stateRestored = false

  onMount(async () => {
    // Load saved settings using centralized function
    settings = await loadSettings()
    // Store the initial settings to compare against later
    previousSettings = JSON.stringify(settings)

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url?.includes('atlassian.net/jira')) {
        isJiraPage = true
        chrome.storage.local.get('jiraPopupState').then((data) => {
          if (data.jiraPopupState) {
            const {
              view: savedView,
              parsedTicket: savedTicket,
              userStoryDescription: savedDesc,
            } = data.jiraPopupState
            if (savedView === 'result' && savedTicket) {
              view = savedView
              parsedTicket = savedTicket
            } else if (savedView === 'create' && savedDesc) {
              view = savedView
              userStoryDescription = savedDesc
            } else if (savedView === 'history') {
              history = getJiraTicketHistory()
              view = 'history'
            }
          }
          stateRestored = true
        })
      } else {
        // If not on a Jira page, no state to restore
        stateRestored = true
      }
    })

    // Mark initial load as complete after settings are loaded
    setTimeout(() => {
      isInitialLoad = false
    }, 100)
  })

  const saveSettings = async () => {
    try {
      await saveSettingsToStorage(settings)
      saved = true
      setTimeout(() => (saved = false), 1500)

      // Send message to content script to update settings
      sendSettingsUpdateToTabs(settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  // Auto-save when settings actually change (but not during initial load)
  $: if (!isInitialLoad && previousSettings && JSON.stringify(settings) !== previousSettings) {
    previousSettings = JSON.stringify(settings)
    saveSettings()
  }

  $: if (isJiraPage && stateRestored && !isInitialLoad) {
    const stateToSave = {
      view,
      parsedTicket,
      userStoryDescription,
    }
    // If the view is 'generating', we treat it as 'create' for persistence purposes.
    // This way, if the user closes the popup, they return to the creation screen
    // with their text intact.
    if (stateToSave.view === 'generating') {
      stateToSave.view = 'create'
    }
    chrome.storage.local.set({ jiraPopupState: stateToSave })
  }

  const resetState = () => {
    view = 'actions'
    userStoryDescription = ''
    generatedTicket = ''
    parsedTicket = null
    history = []
    chrome.storage.local.remove('jiraPopupState')
  }

  const handleCreateTicketClick = () => {
    view = 'create'
  }

  const handleHistoryClick = () => {
    history = getJiraTicketHistory()
    view = 'history'
  }

  const handleBackToActions = () => {
    view = 'actions'
    userStoryDescription = ''
    generatedTicket = ''
    parsedTicket = null
    chrome.storage.local.remove('jiraPopupState')
  }

  const handleGenerateTicket = async () => {
    if (!userStoryDescription.trim()) {
      alert('Please describe the scenario for your ticket')
      return
    }

    view = 'generating'

    try {
      const currentSettings = await loadSettings()

      const result = await generateText({
        prompt: jiraTicketPrompt,
        content: userStoryDescription,
        apiKey: currentSettings.openRouterApiKey,
      })

      if (result.success && result.text) {
        generatedTicket = result.text

        try {
          const parsed = JSON.parse(result.text)
          parsedTicket = { ...parsed, id: Date.now() }
          saveTicketToHistory(parsed)
          view = 'result'
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
        textToCopy = content.join('\\n')
      } else {
        textToCopy = content
      }
      await navigator.clipboard.writeText(textToCopy)
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
${parsedTicket.acceptanceCriteria.map((criteria: string, index: number) => `${index + 1}. ${criteria}`).join('\\n')}

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

<main class="w-80 min-h-0 bg-white dark:bg-gray-800">
  {#if isJiraPage}
    <div class="p-6">
      <div class="text-center mb-6">
        <h3
          class="text-xl font-bold text-gray-800 dark:text-white m-0 flex items-center justify-center gap-2"
        >
          <span>🎫</span>
          <span>
            {#if view === 'actions'}
              Jira Quick Actions
            {:else if view === 'history'}
              Ticket History
            {:else if view === 'result'}
              Generated Ticket
            {:else}
              Create Jira Ticket
            {/if}
          </span>
        </h3>
      </div>
      {#if view === 'actions'}
        <ActionsView {handleCreateTicketClick} {handleHistoryClick} />
      {:else if view === 'create' || view === 'generating'}
        <CreateView
          bind:userStoryDescription
          isGenerating={view === 'generating'}
          {handleBackToActions}
          {handleGenerateTicket}
        />
      {:else if view === 'history'}
        <HistoryView
          {history}
          {handleViewHistoryItem}
          {handleRemoveFromHistory}
          {handleBackToActions}
        />
      {:else if view === 'result'}
        <ResultView
          {parsedTicket}
          {handleCopyTitle}
          {handleCopyDescription}
          {handleCopyUserStory}
          {handleCopyAcceptanceCriteria}
          {handleCopyTechnicalNotes}
        />
        <div class="flex-shrink-0 px-6 py-4 rounded-lg border-gray-200 bg-white mt-4 overflow-auto">
          <div class="flex flex-col gap-3">
            <Button on:click={handleEditDescription} variant="secondary">Edit</Button>
            <Button on:click={handleCopyFullTicket}>Copy all text</Button>
            <Button on:click={resetState}>Done</Button>
          </div>
        </div>
      {/if}
    </div>
    <PopupFooter bind:settings />
  {:else}
    <div class="p-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <h3
          class="text-xl font-bold text-gray-800 dark:text-white m-0 flex items-center justify-center gap-2"
        >
          <span>✏️</span>
          <span>Reword Settings</span>
        </h3>
      </div>

      <!-- Quick Settings (Empty for now) -->
      <div class="mb-6">
        <!-- Extension Enable/Disable Toggle -->
        <Toggle
          bind:checked={settings.enabled}
          label="Extension Enabled"
          description="Turn off to completely disable the extension"
          id="enabled"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-center flex-col gap-4">
        <MoreOptionsButton variant="primary" size="large" className="w-full" />
        {#if saved}
          <div class="text-green-500 text-sm font-semibold text-center mt-4">✓ Saved!</div>
        {/if}
      </div>
    </div>
  {/if}
</main>
