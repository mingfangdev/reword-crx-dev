/**
 * Environment variables module with type-safety
 *
 * This module handles loading environment variables from .env files through Vite
 * and provides type-safe access.
 */

/**
 * Type definition for our environment variables
 */
export interface Env {
  OPEN_ROUTER_API?: string
}

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
 * Check if we're in development mode
 */
export const isDev = getEnvVariables().DEV

/**
 * Check if we're in production mode
 */
export const isProd = getEnvVariables().PROD

/**
 * Exported environment variables
 * Loads variables when available, no validation errors
 */
export const env: Env = {
  OPEN_ROUTER_API: getEnvVariables().VITE_OPEN_ROUTER_API || undefined,
}