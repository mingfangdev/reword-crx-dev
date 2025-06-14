export interface ButtonSettings {
  offsetX: number
  offsetY: number
  buttonSize: number
  showOnHover: boolean
  autoHide: boolean
  openRouterApiKey: string
  rewordPrompt: string
}

export interface DomainOverride {
  domain: string
  settings: Partial<ButtonSettings>
}

export const DEFAULT_SETTINGS: ButtonSettings = {
  offsetX: 16,
  offsetY: 4,
  buttonSize: 32,
  showOnHover: false,
  autoHide: true,
  openRouterApiKey: '',
  rewordPrompt: 'Rephrase the provided text into a formal comment suitable for Jira. Return only the rephrased comment without any additional text, explanations, or introductions. Ensure the tone is professional, clear, and concise, avoiding colloquial language or contractions.'
}

export const SETTINGS_CONSTRAINTS = {
  offsetX: { min: -50, max: 100 },
  offsetY: { min: -50, max: 100 },
  buttonSize: { min: 24, max: 48 }
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

export async function loadDomainOverrides(): Promise<Record<string, Partial<ButtonSettings>>> {
  try {
    const result = await chrome.storage.sync.get(['rewordDomainOverrides'])
    return result.rewordDomainOverrides || {}
  } catch (error) {
    console.warn('Failed to load domain overrides:', error)
    return {}
  }
}

export async function saveDomainOverrides(overrides: Record<string, Partial<ButtonSettings>>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ rewordDomainOverrides: overrides }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export async function addDomainOverride(domain: string, overrideSettings: Partial<ButtonSettings>): Promise<void> {
  const overrides = await loadDomainOverrides()
  overrides[domain] = overrideSettings
  await saveDomainOverrides(overrides)
}

export async function removeDomainOverride(domain: string): Promise<void> {
  const overrides = await loadDomainOverrides()
  delete overrides[domain]
  await saveDomainOverrides(overrides)
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

export function sendDomainOverridesUpdateToTabs(overrides: Record<string, Partial<ButtonSettings>>): void {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'DOMAIN_OVERRIDES_UPDATED',
          overrides: overrides
        }).catch(() => {
          // Ignore errors for tabs without content script
        })
      }
    })
  })
} 