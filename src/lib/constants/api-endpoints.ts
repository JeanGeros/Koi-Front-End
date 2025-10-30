/**
 * Endpoints de la API
 * Centralizados para fácil mantenimiento
 */

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: "/api/auth/login/",
    LOGOUT: "/api/auth/logout/",
    REFRESH: "/api/auth/refresh/",
    ME: "/api/me/", // Endpoint para obtener datos del usuario autenticado
  },
  // Usuarios
  USERS: {
    LIST: "/api/users/",
    DETAIL: (id: string) => `/api/users/${id}/`,
    ME: "/api/users/me/",
  },
  // Dashboard (ejemplo)
  DASHBOARD: {
    OVERVIEW: "/api/dashboard/marketing/",
    STATS: "/api/dashboard/stats/",
    CHARTS: "/api/dashboard/charts/",
  },
} as const
