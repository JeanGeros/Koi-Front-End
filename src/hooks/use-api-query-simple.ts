/**
 * Hook base simple para queries a la API
 * APPLICATION LAYER - Maneja estados de carga/error sin depender del contexto
 *
 * Principios de Clean Architecture:
 * - Recibe parámetros directamente (Dependency Inversion)
 * - No depende de capas externas (Presentation Layer)
 * - Fácil de testear (dependencias explícitas)
 */

import { useState, useEffect, useRef, useCallback } from "react";

// Caché global para compartir datos entre instancias del hook
const globalCache = new Map<string, { data: unknown; timestamp: number }>();

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
   * Si es false, no ejecuta el fetch automáticamente al montar
   * @default true
   */
  enabled?: boolean;

  /**
   * Clave única para identificar esta query en el caché
   * Si no se provee, se genera automáticamente basado en params
   */
  cacheKey?: string;

  /**
   * Tiempo en milisegundos que los datos se consideran "frescos"
   * Durante este tiempo, no se volverá a hacer fetch automáticamente
   * @default 0 (sin caché)
   */
  staleTime?: number;

  /**
   * Tiempo en milisegundos para hacer debounce del fetch
   * Útil cuando los parámetros cambian rápidamente (ej: filtros, búsqueda)
   * @default 0 (sin debounce)
   */
  debounceMs?: number;

  /**
   * Callback que se ejecuta cuando hay un optimistic update
   * Permite actualizar la UI antes de que el request termine
   */
  onMutate?: (params: TParams) => TResponse | void;

  /**
   * Callback que se ejecuta cuando el request es exitoso
   * Útil para invalidar caché o side effects
   */
  onSuccess?: (data: TResponse) => void;

  /**
   * Callback que se ejecuta cuando el request falla
   */
  onError?: (error: Error) => void;
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
   * Indica si los datos están "stale" (viejos)
   */
  isStale: boolean;

  /**
   * Función para re-fetch manualmente
   */
  refetch: () => void;

  /**
   * Función para actualizar datos de forma optimista
   * Actualiza la UI inmediatamente y luego hace el fetch
   */
  mutate: (optimisticData: TResponse) => void;

  /**
   * Función para invalidar el caché de esta query
   */
  invalidateCache: () => void;
}

/**
 * Genera una clave de caché basada en los parámetros
 */
function generateCacheKey(params: unknown): string {
  return JSON.stringify(params);
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
    cacheKey,
    staleTime = 0,
    debounceMs = 0,
    onMutate,
    onSuccess,
    onError,
  } = options;

  // Generar clave de caché
  const computedCacheKey = cacheKey || generateCacheKey(params);

  // Estado interno
  const [data, setData] = useState<TResponse | null>(() => {
    // Inicializar con datos del caché si existen y son frescos
    if (staleTime > 0) {
      const cached = globalCache.get(computedCacheKey);
      if (cached && Date.now() - cached.timestamp < staleTime) {
        return cached.data as TResponse;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  // Control de fetch en progreso para evitar múltiples llamadas simultáneas
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Función para invalidar el caché
  const invalidateCache = useCallback(() => {
    globalCache.delete(computedCacheKey);
    setIsStale(true);
  }, [computedCacheKey]);

  // Función para actualizar datos de forma optimista
  const mutate = useCallback(
    (optimisticData: TResponse) => {
      // Actualizar UI inmediatamente
      setData(optimisticData);
      setError(null);

      // Actualizar caché
      globalCache.set(computedCacheKey, {
        data: optimisticData,
        timestamp: Date.now(),
      });

      // Ejecutar callback si existe
      if (onMutate) {
        const result = onMutate(params);
        if (result) {
          setData(result);
        }
      }
    },
    [computedCacheKey, onMutate, params]
  );

  // Función principal de fetch
  const executeFetch = useCallback(async () => {
    // Cancelar cualquier fetch anterior en progreso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController para este fetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);
    setIsStale(false);

    try {
      const response = await fetchFn(params);

      // Solo actualizar estado si no se canceló
      if (!abortController.signal.aborted) {
        setData(response);

        // Guardar en caché
        globalCache.set(computedCacheKey, {
          data: response,
          timestamp: Date.now(),
        });

        // Ejecutar callback de éxito
        if (onSuccess) {
          onSuccess(response);
        }
      }
    } catch (err) {
      // Solo actualizar estado si no se canceló
      if (!abortController.signal.aborted) {
        const errorMessage =
          err instanceof Error ? err.message : defaultErrorMessage;
        setError(errorMessage);

        // Ejecutar callback de error
        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    } finally {
      // Solo actualizar estado si no se canceló
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [
    fetchFn,
    params,
    defaultErrorMessage,
    computedCacheKey,
    onSuccess,
    onError,
  ]);

  // Función de refetch manual
  const refetch = useCallback(() => {
    // Cancelar debounce si existe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    executeFetch();
  }, [executeFetch]);

  // Efecto principal: ejecutar fetch cuando cambien las dependencias
  useEffect(() => {
    // Si no está habilitado, no hacer nada
    if (!enabled) {
      return;
    }

    // Verificar si hay datos en caché y son frescos
    if (staleTime > 0) {
      const cached = globalCache.get(computedCacheKey);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < staleTime) {
          // Datos frescos en caché, no hacer fetch
          setData(cached.data as TResponse);
          setIsStale(false);
          return;
        } else {
          // Datos en caché pero stale
          setIsStale(true);
        }
      }
    }

    // Limpiar timer de debounce anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si hay debounce, esperar antes de ejecutar
    if (debounceMs > 0) {
      debounceTimerRef.current = setTimeout(() => {
        executeFetch();
      }, debounceMs);
    } else {
      // Sin debounce, ejecutar inmediatamente
      executeFetch();
    }

    // Cleanup: cancelar fetch y timer al desmontar o cuando cambien las dependencias
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, computedCacheKey, staleTime, debounceMs, executeFetch]);

  // Efecto para marcar datos como stale después del staleTime
  useEffect(() => {
    if (staleTime > 0 && data) {
      const timer = setTimeout(() => {
        setIsStale(true);
      }, staleTime);

      return () => clearTimeout(timer);
    }
  }, [staleTime, data]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    mutate,
    invalidateCache,
  };
}

/**
 * Función helper para limpiar todo el caché global
 * Útil para logout o cuando se necesita forzar re-fetch de todo
 */
export function clearAllCache() {
  globalCache.clear();
}

/**
 * Función helper para limpiar caché específico por patrón
 * Útil para invalidar múltiples queries relacionadas
 */
export function clearCacheByPattern(pattern: string | RegExp) {
  const keysToDelete: string[] = [];
  const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;

  globalCache.forEach((_, key) => {
    if (regex.test(key)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => globalCache.delete(key));
}
