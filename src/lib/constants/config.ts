/**
 * Configuración general de la aplicación
 */

const DEFAULT_API_BASE_URL = "https://koi.casalicia.cl"

export const config = {
  // API Configuration
  api: {
    baseUrl:
      DEFAULT_API_BASE_URL,
    timeout: 30000, // 30 segundos
  },

  // Auth Configuration
  auth: {
    tokenRefreshThreshold: 60, // segundos antes de que expire para refrescar
  },
} as const
