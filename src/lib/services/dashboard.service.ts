/**
 * Servicio para datos del dashboard
 *
 * ⚠️ SERVICIO DE EJEMPLO - Actualmente no utilizado
 * Este archivo sirve como ejemplo de cómo crear servicios usando el cliente API.
 * Ver documentación en: prompts/API_CLIENT_GUIDE.md
 *
 * Para usar este servicio:
 * 1. Asegúrate de que el backend tenga los endpoints correspondientes
 * 2. Importa: `import { dashboardService } from '@/lib/services'`
 * 3. Usa en hooks o componentes
 */

import { apiClient } from "../api"
import { API_ENDPOINTS } from "../constants/api-endpoints"
import type { DashboardOverview } from "../types/dashboard.types"

// Tipos de ejemplo (moverlos a types/ en producción)
export type DashboardStats = {
  totalUsers: number
  activeUsers: number
  revenue: number
  growth: number
}

export type ChartData = {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
  }>
}

/**
 * Servicio de dashboard
 */
export const dashboardService = {
  /**
   * Obtiene el resumen completo del dashboard
   */
  getOverview: async (): Promise<DashboardOverview> => {
    return apiClient.get<DashboardOverview>(API_ENDPOINTS.DASHBOARD.OVERVIEW)
  },
  /**
   * Obtiene las estadísticas del dashboard
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS)
  },

  /**
   * Obtiene los datos para los gráficos
   */
  getCharts: async (): Promise<ChartData> => {
    return apiClient.get<ChartData>(API_ENDPOINTS.DASHBOARD.CHARTS)
  },
}
