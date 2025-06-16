<script lang="ts">
  export let isOpen: boolean = false
  export let onClose: () => void

  const DEBUG = import.meta.env.MODE === 'development'

  const handleClose = () => {
    if (DEBUG) console.log('[Reword Extension] JiraModal closing')
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

  // Sample Jira actions
  const jiraActions = [
    { id: 'create-issue', label: 'Create Issue', icon: '➕' },
    { id: 'search-issues', label: 'Search Issues', icon: '🔍' },
    { id: 'quick-filters', label: 'Quick Filters', icon: '🔧' },
    { id: 'recent-issues', label: 'Recent Issues', icon: '📋' },
    { id: 'my-issues', label: 'My Issues', icon: '👤' },
    { id: 'boards', label: 'Boards', icon: '📊' }
  ]

  const handleActionClick = (actionId: string) => {
    if (DEBUG) console.log(`[Reword Extension] Jira action clicked: ${actionId}`)
    // Here you would implement the actual Jira functionality
    alert(`Jira action: ${actionId}`)
    handleClose()
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if isOpen}
  <div 
    class="modal-backdrop"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h3>Jira Quick Actions</h3>
        <button class="close-button" on:click={handleClose} title="Close">
          ✕
        </button>
      </div>
      
      <div class="modal-content">
        <div class="actions-grid">
          {#each jiraActions as action}
            <button 
              class="action-button"
              on:click={() => handleActionClick(action.id)}
              title={action.label}
            >
              <span class="action-icon">{action.icon}</span>
              <span class="action-label">{action.label}</span>
            </button>
          {/each}
        </div>
      </div>
      
      <div class="modal-footer">
        <p class="footer-text">Quick access to Jira functions</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 1000000;
  }

  .modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 320px;
    max-height: 80vh;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
    position: fixed;
    bottom: 8px;
    right: 8px;
    animation: slideIn 0.3s ease-out;
  }

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

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #0052cc 0%, #2684ff 100%);
    color: white;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
    line-height: 1;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .modal-content {
    padding: 20px;
    max-height: calc(80vh - 140px);
    overflow-y: auto;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .action-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    color: #374151;
  }

  .action-button:hover {
    border-color: #2684ff;
    background: #f8faff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(38, 132, 255, 0.15);
  }

  .action-icon {
    font-size: 24px;
    line-height: 1;
  }

  .action-label {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
  }

  .modal-footer {
    padding: 12px 20px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .footer-text {
    margin: 0;
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  }
</style> 