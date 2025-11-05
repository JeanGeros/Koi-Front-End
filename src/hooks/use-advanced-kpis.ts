'use client'

import { useMemo } from 'react'
import { useApiQuerySimple } from '@/hooks/use-api-query-simple'
import { advancedKPIsService } from '@/lib/services/advanced-kpis.service'
import { getDefaultDates } from '@/lib/utils/date-helpers'
import type { AdvancedKPIsResponse, AdvancedKPIsParams } from '@/lib/types/advanced-kpis.types'

interface UseAdvancedKPIsReturn {
  data: AdvancedKPIsResponse | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook personalizado para obtener KPIs Avanzados
 * @param params - Parámetros de la query (start_date, end_date, exclude_email, sales_channel)
 *                  Si no se proveen, se usan las fechas predeterminadas
 *                  sales_channel: '0'=Internet, '1'=Casa Matriz, '2'=Sucursal, '3'=Outdoors, '4'=TodoHogar
 * @returns Objeto con data, isLoading, error, y función refetch
 */
export function useAdvancedKPIs(params?: AdvancedKPIsParams): UseAdvancedKPIsReturn {
  // Combinar parámetros con fechas predeterminadas
  const queryParams = useMemo<AdvancedKPIsParams>(() => {
    const defaults = getDefaultDates()
    return {
      start_date: params?.start_date || defaults.start_date,
      end_date: params?.end_date || defaults.end_date,
      ...(params?.exclude_email && { exclude_email: params.exclude_email }),
      ...(params?.sales_channel !== undefined && { sales_channel: params.sales_channel }),
    }
  }, [params])

  const { data, isLoading, error, refetch } = useApiQuerySimple<AdvancedKPIsParams, AdvancedKPIsResponse>({
    fetchFn: advancedKPIsService.getAdvancedKPIs,
    params: queryParams,
    defaultErrorMessage: 'Error al cargar KPIs avanzados',
  })

  return { data, isLoading, error, refetch }
}