/**
 * APPLICATION LAYER - Hook personalizado para obtener la tabla de clientes
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
  CustomersTableResponse,
  CustomersTableParams
} from '@/lib/types/dashboard.types'

interface UseCustomersTableReturn {
  data: CustomersTableResponse | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook personalizado para obtener la tabla de clientes
 * @param params - Parámetros de la query (start_date, end_date, sales_channel, family_product, page, page_size, sort_by, sort_order)
 *                  Si no se proveen start_date/end_date, se usan las fechas predeterminadas
 *                  sales_channel: 0=Internet, 1=Casa Matriz, 2=Sucursal, 3=Outdoors, 4=TodoHogar
 *                  family_product: ID de la familia de producto a filtrar (null = todas)
 *                  page: Número de página (default: 1)
 *                  page_size: Registros por página (default: 50, máx: 200)
 *                  sort_by: Campo para ordenar (default: total_spending)
 *                  sort_order: Dirección (default: desc)
 * @returns Objeto con data, isLoading, error, y función refetch
 */
export function useCustomersTable(
  params?: CustomersTableParams
): UseCustomersTableReturn {
  // Combinar parámetros con fechas predeterminadas
  const queryParams = useMemo<CustomersTableParams>(() => {
    const defaults = getDefaultDates()
    return {
      start_date: params?.start_date || defaults.start_date,
      end_date: params?.end_date || defaults.end_date,
      page: params?.page || 1,
      page_size: params?.page_size || 50,
      sort_by: params?.sort_by || 'total_spending',
      sort_order: params?.sort_order || 'desc',
      ...(params?.sales_channel !== undefined && { sales_channel: params.sales_channel }),
      ...(params?.family_product !== undefined && params?.family_product !== null && { family_product: params.family_product }),
    }
  }, [params])

  const { data, isLoading, error } = useApiQuerySimple<CustomersTableParams, CustomersTableResponse>({
    fetchFn: dashboardService.getCustomersTable,
    params: queryParams,
    defaultErrorMessage: 'Error al cargar tabla de clientes',
  })
  return { data, isLoading, error }
}

