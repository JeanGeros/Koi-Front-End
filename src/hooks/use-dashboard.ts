'use client'

import { useEffect, useState } from 'react'
import { dashboardService } from '@/lib/services/dashboard.service'
import type { DashboardOverview } from '@/lib/types/dashboard.types'

export function useDashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const overview = await dashboardService.getOverview()
    
        if (mounted) setData(overview)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [])
  return { data, isLoading, error }
}


