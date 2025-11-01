/**
 * Servicio para KPIs Avanzados de Analytics
 * Basado en: KPIS_AVANZADOS_FRONTEND.md
 */

import { apiClient } from "../api"
import { API_ENDPOINTS } from "../constants/api-endpoints"
import type { AdvancedKPIsResponse, AdvancedKPIsParams } from "../types/advanced-kpis.types"

/**
 * Servicio de KPIs Avanzados
 */
export const advancedKPIsService = {
  /**
   * Obtiene los 8 KPIs avanzados consolidados
   * Cache: 5 minutos (300 segundos) - Datos analíticos que cambian con frecuencia
   * @param params - Parámetros opcionales de filtrado (start_date, end_date, exclude_email)
   * @returns Promise con los 8 KPIs
   */
  getAdvancedKPIs: async (params?: AdvancedKPIsParams): Promise<AdvancedKPIsResponse> => {
    return apiClient.get<AdvancedKPIsResponse>(
      API_ENDPOINTS.ANALYTICS.ADVANCED_KPIS,
      params,
      // { revalidate: 300 }
    )
  },
}