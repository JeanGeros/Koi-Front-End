/**
 * Hook base simple para queries a la API
 * APPLICATION LAYER - Maneja estados de carga/error sin depender del contexto
 * 
 * Principios de Clean Architecture:
 * - Recibe parámetros directamente (Dependency Inversion)
 * - No depende de capas externas (Presentation Layer)
 * - Fácil de testear (dependencias explícitas)
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseApiQuerySimpleOptions<TParams, TResponse> {
  /**
   * Función que realiza la llamada a la API (Domain Layer)
   */
  fetchFn: (params: TParams) => Promise<TResponse>;

  /**
   * Parámetros de la query
   */
  params: TParams;

  /**
   * Mensaje de error por defecto si no se puede parsear
   */
  defaultErrorMessage?: string;

  /**
   * Si es true, no ejecuta el fetch automáticamente al montar
   * @default false
   */
  enabled?: boolean;
}

export interface UseApiQuerySimpleReturn<TResponse> {
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
   * Función para re-fetch manualmente
   */
  refetch: () => Promise<void>;
}

/**
 * Hook base simple para queries a la API
 * 
 * APPLICATION LAYER - Orquesta el fetching de datos
 * No depende del contexto, solo recibe parámetros explícitos
 */
export function useApiQuerySimple<TParams, TResponse>(
  options: UseApiQuerySimpleOptions<TParams, TResponse>
): UseApiQuerySimpleReturn<TResponse> {
  const {
    fetchFn,
    params,
    defaultErrorMessage = "Error al cargar datos",
    enabled = true,
  } = options;

  // Estado interno
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar race conditions
  const mountedRef = useRef(true);

  // Función de fetch
  const fetchData = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchFn(params);

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
  }, [params, fetchFn, defaultErrorMessage, enabled]);

  // Función de refetch
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Ejecutar fetch cuando cambien los parámetros
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

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
  };
}

