"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { getDefaultDates } from "@/lib/utils/date-helpers";

export interface DashboardFilters {
  sales_channel?: number | undefined;
  start_date?: string;
  end_date?: string;
  family_product?: number | null;
  min_purchases?: number;
  limit?: number;
}

interface DashboardFiltersContextType {
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  updateFilters: (updates: Partial<DashboardFilters>) => void;
  clearFilters: () => void;
}

const DashboardFiltersContext = createContext<
  DashboardFiltersContextType | undefined
>(undefined);

interface DashboardFiltersProviderProps {
  children: ReactNode;
}

const COOKIE_NAME = "dashboard_filters";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días en segundos

/**
 * Verifica si estamos en el entorno del navegador
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Lee una cookie por nombre
 */
function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
}

/**
 * Establece una cookie usando max-age (compatible con cache de Next.js)
 */
function setCookie(
  name: string,
  value: string,
  maxAge: number = COOKIE_MAX_AGE
): void {
  if (!isBrowser()) return;

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

/**
 * Elimina una cookie
 */
function deleteCookie(name: string): void {
  if (!isBrowser()) return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Carga los filtros desde cookies o retorna valores predeterminados
 */
function loadFiltersFromCache(): DashboardFilters {
  if (!isBrowser()) {
    return getDefaultDates();
  }

  try {
    const cookieValue = getCookie(COOKIE_NAME);
    if (cookieValue) {
      const parsed = JSON.parse(cookieValue) as DashboardFilters;
      // Si hay fechas guardadas, usarlas; si no, usar las predeterminadas
      return {
        ...getDefaultDates(),
        ...parsed,
        // Si las fechas guardadas están vacías, usar las predeterminadas
        start_date: parsed.start_date || getDefaultDates().start_date,
        end_date: parsed.end_date || getDefaultDates().end_date,
        sales_channel: parsed.sales_channel,
      };
    }
  } catch (error) {
    console.error("Error al cargar filtros desde cookies:", error);
  }

  // Si no hay nada guardado, retornar fechas predeterminadas
  return getDefaultDates();
}

/**
 * Guarda los filtros en cookies (cache de Next.js)
 */
function saveFiltersToCache(filters: DashboardFilters): void {
  if (!isBrowser()) return;

  try {
    const value = JSON.stringify(filters);
    setCookie(COOKIE_NAME, value, COOKIE_MAX_AGE);
  } catch (error) {
    console.error("Error al guardar filtros en cookies:", error);
  }
}

export function DashboardFiltersProvider({
  children,
}: DashboardFiltersProviderProps) {
  // Inicializar con valores desde cookies o predeterminados
  const [filters, setFiltersState] = useState<DashboardFilters>(() =>
    loadFiltersFromCache()
  );

  // Guardar en cookies (cache de Next.js) cuando cambien los filtros
  useEffect(() => {
    saveFiltersToCache(filters);
  }, [filters]);

  const setFilters = useCallback((newFilters: DashboardFilters) => {
    // Asegurar que siempre haya fechas predeterminadas si no se proporcionan
    const filtersWithDefaults = {
      ...getDefaultDates(),
      ...newFilters,
      start_date: newFilters.start_date || getDefaultDates().start_date,
      end_date: newFilters.end_date || getDefaultDates().end_date,
    };
    setFiltersState(filtersWithDefaults);
  }, []);

  const updateFilters = useCallback((updates: Partial<DashboardFilters>) => {
    setFiltersState((prev) => {
      const updated = { ...prev, ...updates };
      // Eliminar propiedades undefined para que no se envíen a la API
      if (updated.sales_channel === undefined) {
        delete updated.sales_channel;
      }
      if (updated.family_product === undefined || updated.family_product === null) {
        delete updated.family_product;
      }
      // Asegurar que siempre haya fechas predeterminadas si se eliminan
      if (!updated.start_date) {
        updated.start_date = getDefaultDates().start_date;
      }
      if (!updated.end_date) {
        updated.end_date = getDefaultDates().end_date;
      }
      return updated;
    });
  }, []);

  const clearFilters = useCallback(() => {
    // Limpiar filtros pero mantener las fechas predeterminadas
    const defaultFilters = getDefaultDates();
    setFiltersState(defaultFilters);
    // Eliminar la cookie
    deleteCookie(COOKIE_NAME);
  }, []);

  return (
    <DashboardFiltersContext.Provider
      value={{
        filters,
        setFilters,
        updateFilters,
        clearFilters,
      }}
    >
      {children}
    </DashboardFiltersContext.Provider>
  );
}

export function useDashboardFilters() {
  const context = useContext(DashboardFiltersContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardFilters debe ser usado dentro de DashboardFiltersProvider"
    );
  }
  return context;
}
