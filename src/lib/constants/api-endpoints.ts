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
    TOP_CUSTOMERS_BY_CATEGORY: "/api/dashboard/top_customers_by_category/",
    SALES_BY_CHANNEL: "/api/dashboard/sales-by-channel/",
    POINTS_DISTRIBUTION: "/api/dashboard/points-distribution/",
    POTENTIAL_BUYERS: "/api/dashboard/potential-buyers/",
    TOP_CUSTOMERS_SPENDING: "/api/dashboard/top-customers-spending/",
    KPI_CARDS: "/api/dashboard/kpi-cards/",

    STATS: "/api/dashboard/stats/",
    CHARTS: "/api/dashboard/charts/",
  },
  // Analytics - KPIs Avanzados
  ANALYTICS: {
    ADVANCED_KPIS: "/api/analytics/kpis/advanced/",
  },
} as const
