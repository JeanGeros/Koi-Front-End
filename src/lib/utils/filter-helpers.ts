/**
 * Utilidades para manejo de filtros del dashboard
 */

/**
 * Convierte sucursal (number) a sales_channel (string)
 * sales_channel: '0'=Internet, '1'=Casa Matriz, '2'=Sucursal, '3'=Outdoors, '4'=TodoHogar
 * 
 * @param sucursal - Número de sucursal del filtro
 * @returns String del canal de venta o undefined si no hay sucursal seleccionada
 */
export function convertSucursalToSalesChannel(
  sales_channel: number | undefined
): number | undefined {
  return sales_channel !== undefined 
    ? Number(sales_channel) 
    : undefined;
}

/**
 * Valida que el sales_channel sea un valor válido
 * 
 * @param channel - Canal de venta a validar
 * @returns true si el canal es válido, false en caso contrario
 */
export function validateSalesChannel(channel: string | undefined): channel is string {
  if (!channel) return false;
  const validChannels = ['0', '1', '2', '3', '4'];
  return validChannels.includes(channel);
}

/**
 * Mapeo de códigos de canal a nombres legibles
 */
export const SALES_CHANNEL_NAMES: Record<string, string> = {
  '0': 'Internet',
  '1': 'Casa Matriz',
  '2': 'Sucursal',
  '3': 'Outdoors',
  '4': 'TodoHogar',
};

/**
 * Obtiene el nombre legible de un canal de venta
 * 
 * @param channel - Código del canal de venta (string o number)
 * @returns Nombre del canal o 'Todos los Canales' si no hay filtro
 */
export function getSalesChannelName(channel: string | number | undefined): string {
  if (channel === undefined || channel === null) return 'Todos los Canales';
  const channelStr = String(channel);
  return SALES_CHANNEL_NAMES[channelStr] || 'Canal Desconocido';
}

/**
 * Formatea una fecha a formato legible en español (Chile)
 * 
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns Fecha formateada o string vacío si no hay fecha
 */
export function formatDateForDisplay(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Capitaliza la primera letra de cada palabra en un texto.
 * 
 * @param text - Texto a capitalizar
 * @returns Texto capitalizado
 */
export function capitalice(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/(^|\s|_)[\p{L}\p{N}]/gu, match => match.toUpperCase())
    .replace(/_/g, ' ');
}



/**
 * Genera un texto descriptivo dinámico basado en los filtros aplicados
 * 
 * @param filters - Objeto con los filtros del dashboard
 * @param familyName - Nombre de la familia de producto (opcional, se puede obtener del código)
 * @returns Texto descriptivo de los filtros aplicados
 */
export function generateFilterDescription(
  filters: {
    family_product?: number | null;
    sales_channel?: number;
    start_date?: string;
    end_date?: string;
    min_purchases?: number;
  },
  familyName?: string
): string {
  const parts: string[] = [];
  
  // Agregar categoría de producto si existe
  if (filters.family_product && familyName) {
    parts.push(`categoría ${capitalice(familyName)}`);
  } else if (filters.family_product) {
    parts.push('categoría seleccionada');
  }
  
  // Agregar canal de venta si existe y no es el default (1 = Casa Matriz)
  if (filters.sales_channel !== undefined) {
    const channelName = getSalesChannelName(filters.sales_channel);
    parts.push(`Tienda ${capitalice(channelName)}`);
  }
  
  // Agregar mínimo de compras si existe
  if (filters.min_purchases) {
    parts.push(`mínimo ${filters.min_purchases} compras`);
  }
  
  // Procesar el período de fechas por separado para asegurar el salto de línea
  let periodText = '';
  if (filters.start_date && filters.end_date) {
    const startFormatted = formatDateForDisplay(filters.start_date);
    const endFormatted = formatDateForDisplay(filters.end_date);
    if (startFormatted && endFormatted) {
      periodText = `\n Período Consultado: ${startFormatted} - ${endFormatted}`;
    }
  }
  
  // Si no hay parts ni período, retornar vacío
  if (parts.length === 0 && !periodText) {
    return '';
  }
  
  // Construir el texto final
  let result = '';
  if (parts.length > 0) {
    result = ` en ${parts.join(' en ')}`;
  }
  if (periodText) {
    result += periodText;
  }
  
  return result;
}


