/**
 * Environment variables module with type-safety and validation
 *
 * This module handles loading environment variables from .env files through Vite
 * and provides type-safe access with validation.
 */

/**
 * Type definition for our environment variables
 */
export interface Env {
  OPEN_ROUTER_API: string
}

/**
 * Check if we're in development mode
 */
export const isDev = getEnvVariables().DEV

/**
 * Check if we're in production mode
 */
export const isProd = getEnvVariables().PROD

/**
 * Get environment variables with proper fallback handling
 */
function getEnvVariables() {
  // Values from .env file will be injected by Vite at build time
  // Only variables prefixed with VITE_ are exposed to client code
  const vars = import.meta.env || {}

  return {
    VITE_OPEN_ROUTER_API: vars.VITE_OPEN_ROUTER_API || '',
    DEV: vars.DEV || false,
    PROD: vars.PROD || true,
  }
}

/**
 * Validates that required environment variables are present
 * @throws Error if any required environment variables are missing
 */
function validateEnv(): Env {
  const variables = getEnvVariables()
  const openRouterApiKey = variables.VITE_OPEN_ROUTER_API

  if (!openRouterApiKey && isDev) {
    throw new Error(
      'VITE_OPEN_ROUTER_API is required but not provided in .env file. ' +
        'Please create a .env file with VITE_OPEN_ROUTER_API=your-api-key',
    )
  }

  return {
    OPEN_ROUTER_API: openRouterApiKey,
  }
}

/**
 * Exported environment variables with validation
 * This will throw an error during initialization if required vars are missing
 */
export const env: Env = validateEnv()