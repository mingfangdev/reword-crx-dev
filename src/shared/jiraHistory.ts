import type { JiraTicket } from './types'

const HISTORY_KEY = 'jiraTicketHistory'

export function getJiraTicketHistory(): JiraTicket[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []
  }
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY)
    return historyJson ? JSON.parse(historyJson) : []
  } catch (error) {
    console.error('Error getting Jira ticket history:', error)
    return []
  }
}

export function saveTicketToHistory(ticket: Omit<JiraTicket, 'id'>): JiraTicket[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getJiraTicketHistory()
  }
  const history = getJiraTicketHistory()
  const newTicket: JiraTicket = { ...ticket, id: Date.now() }
  const updatedHistory = [newTicket, ...history]

  // Optional: limit history size to 50
  if (updatedHistory.length > 50) {
    updatedHistory.splice(50)
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
    return updatedHistory
  } catch (error) {
    console.error('Error saving Jira ticket to history:', error)
    return history
  }
}

export function removeTicketFromHistory(ticketId: number): JiraTicket[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getJiraTicketHistory()
  }
  const history = getJiraTicketHistory()
  const updatedHistory = history.filter((ticket) => ticket.id !== ticketId)
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
    return updatedHistory
  } catch (error) {
    console.error('Error removing Jira ticket from history:', error)
    return history
  }
}

export function clearJiraHistory() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error('Error clearing Jira history:', error)
  }
} 