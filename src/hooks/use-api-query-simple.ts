/**
 * Hook base simple para queries a la API
 * APPLICATION LAYER - Maneja estados de carga/error sin depender del contexto
 * 
 * Principios de Clean Architecture:
 * - Recibe parámetros directamente (Dependency Inversion)
 * - No depende de capas externas (Presentation Layer)
 * - Fácil de testear (dependencias explícitas)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

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
  
  // Refs para almacenar valores actuales y evitar dependencias en closures
  const fetchFnRef = useRef(fetchFn);
  const paramsRef = useRef(params);
  const defaultErrorMessageRef = useRef(defaultErrorMessage);
  const enabledRef = useRef(enabled);
  
  // Actualizar refs cuando cambien los valores
  fetchFnRef.current = fetchFn;
  paramsRef.current = params;
  defaultErrorMessageRef.current = defaultErrorMessage;
  enabledRef.current = enabled;
  
  // Ref para almacenar los parámetros anteriores y comparar cambios
  const prevParamsStringRef = useRef<string | null>(null);
  
  // Serializar parámetros para comparación (solo recalcula si params cambia)
  const paramsString = useMemo(() => JSON.stringify(params), [params]);

  // Función de fetch que usa refs (no depende de valores en el closure)
  const fetchData = useCallback(async () => {
    if (!enabledRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Usar valores actuales desde refs
      const response = await fetchFnRef.current(paramsRef.current);

      if (mountedRef.current) {
        setData(response);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : defaultErrorMessageRef.current;
        setError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []); // Sin dependencias - usa refs para obtener valores actuales

  // Función de refetch
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Ejecutar fetch cuando cambien los parámetros
  useEffect(() => {
    // Comparar si los parámetros realmente cambiaron
    const paramsChanged = prevParamsStringRef.current !== paramsString;
    
    if (enabledRef.current && paramsChanged) {
      prevParamsStringRef.current = paramsString;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]); // Solo depende de paramsString, fetchData es estable

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

