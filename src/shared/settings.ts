export interface ButtonSettings {
  buttonPosition: 'right' | 'left' | 'top' | 'bottom'
  offsetX: number
  offsetY: number
  buttonSize: number
  showOnHover: boolean
  autoHide: boolean
  hideDelay: number
  openRouterApiKey: string
  rewordPrompt: string
}

export const DEFAULT_SETTINGS: ButtonSettings = {
  buttonPosition: 'right',
  offsetX: 16,
  offsetY: 4,
  buttonSize: 32,
  showOnHover: false,
  autoHide: true,
  hideDelay: 150,
  openRouterApiKey: '',
  rewordPrompt: 'Rephrase the provided text into a formal comment suitable for Jira. Return only the rephrased comment without any additional text, explanations, or introductions. Ensure the tone is professional, clear, and concise, avoiding colloquial language or contractions.'
}

export const SETTINGS_CONSTRAINTS = {
  offsetX: { min: -50, max: 100 },
  offsetY: { min: -50, max: 100 },
  buttonSize: { min: 24, max: 48 },
  hideDelay: { min: 0, max: 1000 }
} as const

export async function loadSettings(): Promise<ButtonSettings> {
  try {
    const result = await chrome.storage.sync.get(['rewordSettings'])
    return result.rewordSettings ? { ...DEFAULT_SETTINGS, ...result.rewordSettings } : DEFAULT_SETTINGS
  } catch (error) {
    console.warn('Failed to load settings:', error)
    return DEFAULT_SETTINGS
  }
}

export async function saveSettings(settings: ButtonSettings): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ rewordSettings: settings }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export function sendSettingsUpdateToTabs(settings: ButtonSettings): void {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          settings: settings
        }).catch(() => {
          // Ignore errors for tabs without content script
        })
      }
    })
  })
} 