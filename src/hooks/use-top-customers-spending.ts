'use client'

import { useMemo } from 'react'
import { useApiQuerySimple } from '@/hooks/use-api-query-simple'
import { dashboardService } from '@/lib/services/dashboard.service'
import { getDefaultDates } from '@/lib/utils/date-helpers'
import type {
  TopCustomersSpendingResponse,
  TopCustomersSpendingParams
} from '@/lib/types/dashboard.types'

interface UseTopCustomersSpendingReturn {
  data: TopCustomersSpendingResponse | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook personalizado para obtener top clientes por gasto total
 * Muestra ranking de clientes con mayor gasto en un período específico
 * @param params - Parámetros de la query (start_date, end_date, limit, exclude_email, sales_channel, family_product)
 *                  Si no se proveen start_date/end_date, se usan las fechas predeterminadas
 *                  sales_channel: '0'=Internet, '1'=Casa Matriz, '2'=Sucursal, '3'=Outdoors, '4'=TodoHogar
 *                  family_product: ID de la familia de producto a filtrar (null = todas)
 * @returns Objeto con data, isLoading, error, y función refetch
 */
export function useTopCustomersSpending(
  params?: Partial<TopCustomersSpendingParams>
): UseTopCustomersSpendingReturn {
  // Combinar parámetros con fechas predeterminadas
  const queryParams = useMemo<TopCustomersSpendingParams>(() => {
    const defaults = getDefaultDates()
    // TopCustomersSpendingParams requiere start_date y end_date como obligatorios
    return {
      start_date: params?.start_date || defaults.start_date,
      end_date: params?.end_date || defaults.end_date,
      ...(params?.limit !== undefined && { limit: params.limit }),
      ...(params?.exclude_email && { exclude_email: params.exclude_email }),
      ...(params?.sales_channel !== undefined && { sales_channel: params.sales_channel }),
      ...(params?.family_product !== undefined && params?.family_product !== null && { family_product: params.family_product }),
    }
  }, [params])

  const { data, isLoading, error } = useApiQuerySimple<TopCustomersSpendingParams, TopCustomersSpendingResponse>({
    fetchFn: dashboardService.getTopCustomersSpending,
    params: queryParams,
    defaultErrorMessage: 'Error al cargar top clientes por gasto',
  })

  return { data, isLoading, error }
}

