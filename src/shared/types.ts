export interface JiraTicket {
  id: number
  title: string
  description: string
  userStory: string
  acceptanceCriteria: string[]
  technicalNotes: string
} 