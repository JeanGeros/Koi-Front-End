/**
 * APPLICATION LAYER - Hook personalizado para obtener top clientes por categoría
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
  PropsTopCustomersByCategory,
  TopCustomersByCategoryParams
} from '@/lib/types/dashboard.types'

interface UseTopCustomersByCategoryReturn {
  data: PropsTopCustomersByCategory | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook personalizado para obtener top clientes por categoría
 * @param params - Parámetros de la query (start_date, end_date, family_product, count_customers, sales_channel)
 *                  Si no se proveen start_date/end_date, se usan las fechas predeterminadas
 *                  sales_channel: '0'=Internet, '1'=Casa Matriz, '2'=Sucursal, '3'=Outdoors, '4'=TodoHogar
 * @returns Objeto con data, isLoading, error, y función refetch
 */
export function useTopCustomersByCategory(
  params?: TopCustomersByCategoryParams
): UseTopCustomersByCategoryReturn {
  // Combinar parámetros con fechas predeterminadas
  const queryParams = useMemo<TopCustomersByCategoryParams>(() => {
    const defaults = getDefaultDates()
    return {
      start_date: params?.start_date || defaults.start_date,
      end_date: params?.end_date || defaults.end_date,
      ...(params?.family_product !== undefined && { family_product: params.family_product }),
      ...(params?.count_customers !== undefined && { count_customers: params.count_customers }),
      ...(params?.sales_channel !== undefined && { sales_channel: params.sales_channel }),
    }
  }, [params])

  const { data, isLoading, error } = useApiQuerySimple<TopCustomersByCategoryParams, PropsTopCustomersByCategory>({
    fetchFn: dashboardService.getTopCustomersByCategory,
    params: queryParams,
    defaultErrorMessage: 'Error al cargar top clientes por categoría',
  })
  return { data, isLoading, error }
}
