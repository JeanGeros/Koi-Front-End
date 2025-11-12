/**
 * APPLICATION LAYER - Hook personalizado para obtener top clientes para próxima compra (1/3)
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
  TopCustomersNextPurchaseResponse,
  TopCustomersNextPurchaseParams
} from '@/lib/types/dashboard.types'

interface UseTopCustomersNextPurchaseReturn {
  data: TopCustomersNextPurchaseResponse | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook personalizado para obtener top clientes para próxima compra (1/3)
 * Muestra clientes individuales con más potencial para realizar su primera o tercera compra
 * @param params - Parámetros de la query (start_date, end_date, family_product, min_purchases, limit, sales_channel)
 *                  Si no se proveen start_date/end_date, se usan las fechas predeterminadas
 *                  sales_channel: '0'=Internet, '1'=Casa Matriz, '2'=Sucursal, '3'=Outdoors, '4'=TodoHogar
 * @returns Objeto con data, isLoading, error, y función refetch
 */
export function useTopCustomersNextPurchase(
  params?: TopCustomersNextPurchaseParams
): UseTopCustomersNextPurchaseReturn {
  // Combinar parámetros con fechas predeterminadas
  const queryParams = useMemo<TopCustomersNextPurchaseParams>(() => {
    const defaults = getDefaultDates()
    return {
      start_date: params?.start_date || defaults.start_date,
      end_date: params?.end_date || defaults.end_date,
      ...(params?.family_product !== undefined && { family_product: params.family_product }),
      ...(params?.min_purchases !== undefined && { min_purchases: params.min_purchases }),
      ...(params?.limit !== undefined && { limit: params.limit }),
      ...(params?.sales_channel !== undefined && { sales_channel: params.sales_channel }),
    }
  }, [params])

  const { data, isLoading, error } = useApiQuerySimple<TopCustomersNextPurchaseParams, TopCustomersNextPurchaseResponse>({
    fetchFn: dashboardService.getTopCustomersNextPurchase,
    params: queryParams,
    defaultErrorMessage: 'Error al cargar top clientes para próxima compra',
  })
  return { data, isLoading, error }
}

