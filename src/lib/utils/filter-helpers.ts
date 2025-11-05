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
  sucursal: number | null | undefined
): string | undefined {
  return sucursal !== null && sucursal !== undefined 
    ? String(sucursal) 
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
 * @param channel - Código del canal de venta
 * @returns Nombre del canal o 'Canal Desconocido' si no es válido
 */
export function getSalesChannelName(channel: string | undefined): string {
  if (!channel) return 'Todos los Canales';
  return SALES_CHANNEL_NAMES[channel] || 'Canal Desconocido';
}

