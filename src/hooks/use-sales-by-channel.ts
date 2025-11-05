/**
 * APPLICATION LAYER - Hook personalizado para obtener ventas por canal
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
  SalesByChannelResponse,
  SalesByChannelParams
} from '@/lib/types/dashboard.types'

interface UseSalesByChannelReturn {
  data: SalesByChannelResponse | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook personalizado para obtener ventas por canal/sucursal
 * @param params - Parámetros de la query (start_date, end_date, sales_channel)
 *                  Si no se proveen start_date/end_date, se usan las fechas predeterminadas
 *                  sales_channel: '0'=Internet, '1'=Casa Matriz, '2'=Sucursal, '3'=Outdoors, '4'=TodoHogar
 * @returns Objeto con data, isLoading, error, y función refetch
 */
export function useSalesByChannel(
  params?: SalesByChannelParams
): UseSalesByChannelReturn {
  // Combinar parámetros con fechas predeterminadas
  const queryParams = useMemo<SalesByChannelParams>(() => {
    const defaults = getDefaultDates()
    return {
      start_date: params?.start_date || defaults.start_date,
      end_date: params?.end_date || defaults.end_date,
      ...(params?.sales_channel !== undefined && { sales_channel: params.sales_channel }),
    }
  }, [params])

  const { data, isLoading, error, refetch } = useApiQuerySimple<SalesByChannelParams, SalesByChannelResponse>({
    fetchFn: dashboardService.getSalesByChannel,
    params: queryParams,
    defaultErrorMessage: 'Error al cargar ventas por canal',
  })
  return { data, isLoading, error, refetch }
}
