/**
 * Utilidades para manejo de fechas
 */

/**
 * Formatea una fecha a formato ISO string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Obtiene las fechas predeterminadas: desde el primer día del mes actual hasta hoy
 * @returns Objeto con start_date y end_date en formato ISO (YYYY-MM-DD)
 */
export function getDefaultDates(): { start_date: string; end_date: string } {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    start_date: formatDate(firstDayOfMonth),
    end_date: formatDate(today),
  };
}

/**
 * Combina parámetros con filtros del contexto y fechas predeterminadas
 * @param filters - Filtros del contexto del dashboard
 * @param initialParams - Parámetros iniciales opcionales
 * @param defaultDates - Fechas predeterminadas (opcional, se calculan si no se proveen)
 * @returns Parámetros combinados con prioridad: initialParams > filters > defaultDates
 */
export function mergeParamsWithFilters<T extends { start_date?: string; end_date?: string }>(
  filters: { start_date?: string; end_date?: string; [key: string]: any },
  initialParams?: Partial<T>,
  defaultDates?: { start_date: string; end_date: string }
): T {
  const defaults = defaultDates || getDefaultDates();

  return {
    ...defaults,
    ...(filters.start_date && { start_date: filters.start_date }),
    ...(filters.end_date && { end_date: filters.end_date }),
    ...(initialParams || {}),
  } as T;
}


// Obtener fechas predeterminadas si no hay selección
const getDefaultStartDate = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  return firstDayOfMonth.toISOString().split("T")[0];
};

const getDefaultEndDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export { getDefaultStartDate, getDefaultEndDate };