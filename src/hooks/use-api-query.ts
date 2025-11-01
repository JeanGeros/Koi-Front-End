/**
 * Hook base genérico para manejar queries a la API
 * Proporciona lógica común de fetching, estados de carga/error, y sincronización con filtros
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useDashboardFilters } from "@/lib/contexts/dashboard-filters.context";
import { mergeParamsWithFilters } from "@/lib/utils/date-helpers";

export interface UseApiQueryOptions<TParams, TResponse> {
  /**
   * Función que realiza la llamada a la API
   */
  fetchFn: (params: TParams) => Promise<TResponse>;

  /**
   * Parámetros iniciales (opcional)
   */
  initialParams?: TParams;

  /**
   * Mensaje de error por defecto si no se puede parsear
   */
  defaultErrorMessage?: string;

  /**
   * Si es true, sincroniza automáticamente con los filtros del contexto
   * @default true
   */
  syncWithFilters?: boolean;

  /**
   * Función para combinar filtros del contexto con parámetros iniciales
   * Si no se provee, se usa mergeParamsWithFilters por defecto
   */
  mergeFilters?: (
    filters: ReturnType<typeof useDashboardFilters>["filters"],
    initialParams?: TParams
  ) => TParams;

  /**
   * Si es true, no ejecuta el fetch automáticamente al montar
   * @default false
   */
  enabled?: boolean;
}

export interface UseApiQueryReturn<TResponse> {
  /**
   * Datos de la respuesta
   */
  data: TResponse | null;

  /**
   * Estado de carga
   */
  isLoading: boolean;

  /**
   * Mensaje de error (null si no hay error)
   */
  error: string | null;

  /**
   * Función para re-fetch manualmente con nuevos parámetros opcionales
   */
  refetch: (params?: Partial<Parameters<UseApiQueryOptions<any, TResponse>["fetchFn"]>[0]>) => Promise<void>;

  /**
   * Función para actualizar los parámetros sin hacer fetch inmediatamente
   */
  setParams: (params: Partial<Parameters<UseApiQueryOptions<any, TResponse>["fetchFn"]>[0]>) => void;
}

/**
 * Hook base genérico para queries a la API
 * Maneja estados de carga, errores, sincronización con filtros y refetch
 */
export function useApiQuery<TParams extends { start_date?: string; end_date?: string }, TResponse>(
  options: UseApiQueryOptions<TParams, TResponse>
): UseApiQueryReturn<TResponse> {
  const {
    fetchFn,
    initialParams,
    defaultErrorMessage = "Error al cargar datos",
    syncWithFilters = true,
    mergeFilters,
    enabled = true,
  } = options;

  const { filters } = useDashboardFilters();

  // Estado interno
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar race conditions
  const mountedRef = useRef(true);

  // Función para combinar parámetros con filtros
  const getMergedParams = useCallback((): TParams => {
    if (mergeFilters) {
      return mergeFilters(filters, initialParams);
    }
    return mergeParamsWithFilters(filters, initialParams) as TParams;
  }, [filters, initialParams, mergeFilters]);

  // Estado de parámetros
  const [params, setParamsState] = useState<TParams>(() => getMergedParams());

  // Actualizar parámetros cuando cambien los filtros o initialParams (si syncWithFilters está activo)
  useEffect(() => {
    if (syncWithFilters) {
      const mergedParams = getMergedParams();
      setParamsState(mergedParams);
    }
  }, [filters, initialParams, syncWithFilters, getMergedParams]);

  // Función de fetch
  const fetchData = useCallback(
    async (fetchParams?: Partial<TParams>) => {
      if (!enabled && !fetchParams) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const finalParams = fetchParams
          ? ({ ...params, ...fetchParams } as TParams)
          : params;

        const response = await fetchFn(finalParams);

        if (mountedRef.current) {
          setData(response);
        }
      } catch (err) {
        if (mountedRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : defaultErrorMessage;
          setError(errorMessage);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [params, fetchFn, defaultErrorMessage, enabled]
  );

  // Función de refetch
  const refetch = useCallback(
    async (newParams?: Partial<TParams>) => {
      if (newParams) {
        setParamsState((prev) => ({ ...prev, ...newParams } as TParams));
      }
      await fetchData(newParams);
    },
    [fetchData]
  );

  // Función para actualizar parámetros sin fetch
  const setParams = useCallback((newParams: Partial<TParams>) => {
    setParamsState((prev) => ({ ...prev, ...newParams } as TParams));
  }, []);

  // Ejecutar fetch cuando cambien los parámetros
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [params, fetchData, enabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    setParams,
  };
}
