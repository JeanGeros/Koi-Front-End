/**
 * APPLICATION LAYER - Hook personalizado para obtener la distribución de puntos por fecha
 * 
 * Principios de Clean Architecture:
 * - Recibe parámetros directamente (no depende del contexto)
 * - Usa utilidades compartidas (getDefaultDates)
 * - Orquesta llamadas al Domain Layer (dashboardService)
 */

'use client'

import { useMemo } from 'react'
import { useApiQuerySimple } from '@/hooks/use-api-query-simple'
import { dashboardService } from '@/lib/services/dashboard.service'
import { getDefaultDates } from '@/lib/utils/date-helpers'
import type {
  PointsDistributionResponse,
  PointsDistributionParams
} from '@/lib/types/dashboard.types'

interface UsePointsDistributionReturn {
  data: PointsDistributionResponse | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook personalizado para obtener la distribución de puntos por fecha
 * @param params - Parámetros de la query (start_date, end_date, exclude_email, sales_channel, family_product)
 *                  Si no se proveen start_date/end_date, se usan las fechas predeterminadas
 *                  sales_channel: '0'=Internet, '1'=Casa Matriz, '2'=Sucursal, '3'=Outdoors, '4'=TodoHogar
 *                  family_product: ID de la familia de producto a filtrar (null = todas)
 * @returns Objeto con data, isLoading, error, y función refetch
 */
export function usePointsDistribution(
  params?: PointsDistributionParams
): UsePointsDistributionReturn {
  // Combinar parámetros con fechas predeterminadas
  const queryParams = useMemo<PointsDistributionParams>(() => {
    const defaults = getDefaultDates()
    return {
      start_date: params?.start_date || defaults.start_date,
      end_date: params?.end_date || defaults.end_date,
      ...(params?.exclude_email && { exclude_email: params.exclude_email }),
      ...(params?.sales_channel !== undefined && { sales_channel: params.sales_channel }),
      ...(params?.family_product !== undefined && params?.family_product !== null && { family_product: params.family_product }),
    }
  }, [params])

  const { data, isLoading, error} = useApiQuerySimple<PointsDistributionParams, PointsDistributionResponse>({
    fetchFn: dashboardService.getPointsDistribution,
    params: queryParams,
    defaultErrorMessage: 'Error al cargar distribución de puntos',
  })

  return { data, isLoading, error}
}
