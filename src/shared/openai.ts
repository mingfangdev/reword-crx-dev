import OpenAI from 'openai'
import { env } from './env'

export interface GenerateTextOptions {
  prompt: string
  content: string
  model?: string
  apiKey?: string
}

export interface GenerateTextResult {
  success: boolean
  text?: string
  error?: string
}

/**
 * Generate text using OpenAI through OpenRouter
 */
export async function generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
  const { prompt, content, model = 'deepseek/deepseek-chat-v3-0324:free', apiKey } = options
  
  const effectiveApiKey = apiKey || env.OPEN_ROUTER_API
  
  if (!effectiveApiKey) {
    return {
      success: false,
      error: 'No API key provided. Please set your OpenRouter API key in the extension settings or .env file.'
    }
  }

  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: effectiveApiKey,
      defaultHeaders: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Reword Extension',
      },
      dangerouslyAllowBrowser: true,
    })

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: content,
        },
      ],
    })

    const generatedText = completion.choices[0]?.message?.content
    
    if (!generatedText) {
      return {
        success: false,
        error: 'No response from AI'
      }
    }

    return {
      success: true,
      text: generatedText.trim()
    }
  } catch (error) {
    console.error('Error generating text:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
} 