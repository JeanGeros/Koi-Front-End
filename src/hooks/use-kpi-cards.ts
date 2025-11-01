/**
 * APPLICATION LAYER - Hook personalizado para obtener las tarjetas KPI con top clientes
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
  KPICardsResponse,
  KPICardsParams
} from '@/lib/types/dashboard.types'

interface UseKPICardsReturn {
  data: KPICardsResponse | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook personalizado para obtener las tarjetas KPI con top clientes
 * @param params - Parámetros de la query (start_date, end_date)
 *                  Si no se proveen, se usan las fechas predeterminadas
 * @returns Objeto con data, isLoading, error, y función refetch
 */
export function useKPICards(
  params?: KPICardsParams
): UseKPICardsReturn {
  // Combinar parámetros con fechas predeterminadas
  const queryParams = useMemo<KPICardsParams>(() => {
    const defaults = getDefaultDates()
    return {
      start_date: params?.start_date || defaults.start_date,
      end_date: params?.end_date || defaults.end_date,
    }
  }, [params])

  const { data, isLoading, error, refetch } = useApiQuerySimple<KPICardsParams, KPICardsResponse>({
    fetchFn: dashboardService.getKPICards,
    params: queryParams,
    defaultErrorMessage: 'Error al cargar tarjetas KPI',
  })

  return { data, isLoading, error, refetch }
}

