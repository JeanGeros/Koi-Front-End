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
import type {
  PropsTopCustomersByCategory,
  PointsDistributionResponse,
  PointsDistributionParams,
  LowPenetrationResponse,
  LowPenetrationParams,
  TopCustomersNextPurchaseResponse,
  TopCustomersNextPurchaseParams,
  TopCustomersSpendingResponse,
  TopCustomersSpendingParams,
  KPICardsResponse,
  KPICardsParams
} from "../types/dashboard.types"

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
   * Cache: 5 minutos (300 segundos)
   */
  getTopCustomersByCategory: async (): Promise<PropsTopCustomersByCategory> => {
    return apiClient.get<PropsTopCustomersByCategory>(
      API_ENDPOINTS.DASHBOARD.TOP_CUSTOMERS_BY_CATEGORY,
      undefined,
      { revalidate: 300 }
    )
  },

  /**
   * Obtiene las estadísticas del dashboard
   * Cache: 5 minutos (300 segundos)
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>(
      API_ENDPOINTS.DASHBOARD.STATS,
      undefined,
      { revalidate: 300 }
    )
  },

  /**
   * Obtiene los datos para los gráficos
   * Cache: 5 minutos (300 segundos)
   */
  getCharts: async (): Promise<ChartData> => {
    return apiClient.get<ChartData>(
      API_ENDPOINTS.DASHBOARD.CHARTS,
      undefined,
      { revalidate: 300 }
    )
  },

  /**
   * Obtiene la distribución de puntos por fecha
   * Sin caché - Datos siempre frescos
   */
  getPointsDistribution: async (params?: PointsDistributionParams): Promise<PointsDistributionResponse> => {
    return apiClient.get<PointsDistributionResponse>(
      API_ENDPOINTS.DASHBOARD.POINTS_DISTRIBUTION,
      params,
      { revalidate: false }
    )
  },

  /**
   * Obtiene top clientes para próxima compra (1/3)
   * Muestra clientes individuales con más potencial para realizar su primera o tercera compra
   * Sin caché - Datos siempre frescos
   */
  getTopCustomersNextPurchase: async (params?: TopCustomersNextPurchaseParams): Promise<TopCustomersNextPurchaseResponse> => {
    return apiClient.get<TopCustomersNextPurchaseResponse>(
      API_ENDPOINTS.DASHBOARD.POTENTIAL_BUYERS,
      params,
      { revalidate: false }
    )
  },

  /**
   * Obtiene top clientes por gasto total
   * Ranking de clientes con mayor gasto en un período específico
   * Sin caché - Datos siempre frescos
   */
  getTopCustomersSpending: async (params: TopCustomersSpendingParams): Promise<TopCustomersSpendingResponse> => {
    return apiClient.get<TopCustomersSpendingResponse>(
      API_ENDPOINTS.DASHBOARD.TOP_CUSTOMERS_SPENDING,
      params,
      { revalidate: false }
    )
  },

  /**
   * Obtiene las tarjetas KPI con top clientes
   * Top Spender, Top Buyer y Top Diverse Buyer
   * Sin caché - Datos siempre frescos
   */
  getKPICards: async (params?: KPICardsParams): Promise<KPICardsResponse> => {
    return apiClient.get<KPICardsResponse>(
      API_ENDPOINTS.DASHBOARD.KPI_CARDS,
      params,
      { revalidate: false }
    )
  },
}
