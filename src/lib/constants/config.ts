/**
 * Configuración general de la aplicación
 */

const DEFAULT_API_BASE_URL = "http://localhost:8000"

export const config = {
  // API Configuration
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL &&
      process.env.NEXT_PUBLIC_API_BASE_URL.length > 0
        ? process.env.NEXT_PUBLIC_API_BASE_URL
        : DEFAULT_API_BASE_URL,
    timeout: 30000, // 30 segundos
  },

  // Auth Configuration
  auth: {
    tokenRefreshThreshold: 60, // segundos antes de que expire para refrescar
  },
} as const
