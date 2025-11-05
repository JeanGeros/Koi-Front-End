/**
 * Mapeo de códigos de familia de productos a sus descripciones
 */
export const PRODUCT_FAMILIES: Record<number, string> = {
  1: "COCINA",
  2: "ADORNOS",
  3: "TEXTILES",
  4: "MUEBLES",
  5: "ELECTRONICA",
  6: "ILUMINACION",
  7: "CALEFACCION",
  8: "FABRICACION PROPIA",
  9: "MUNDO INFANTIL",
  10: "CUIDADO PERSONAL",
  11: "SERVICIOS",
  12: "GASTOS E INTERESES DE LA TIENDA",
  13: "INDUSTRIAL",
  14: "BAÑO",
  15: "ELECTRONICA MENOR",
  19: "HIGIENE Y AMBIENTES",
  20: "LENCERIA",
  21: "PERFUMERIA Y JOYERIA",
  22: "DAMAS",
  23: "VARONES",
  24: "ROPA DE NIÑOS",
  25: "COLEGIO",
  26: "COLEGIO ADULTO",
  27: "COLEGIO LENCERIA",
  30: "DEPORTES",
  50: "ZAPATERIA",
  51: "DELICATESEN Y GOURMET",
  52: "BOLSOS Y CARTERAS",
  53: "DEPORTE",
  54: "LIBRERIA",
  55: "MUSICA",
  56: "JUGUETES- RODADOS Y VEHICULOS",
  57: "ENTRETENCION Y REGALO",
  58: "RELOJERIA Y LENTES",
  59: "COMPUTACION/ELECTRONICA",
  61: "ORTOPEDICOS-TERAPEUTICOS",
  70: "ACCESORIOS OUTDOOR",
  80: "ROPA OUTDOOR",
  81: "ROPA DEPORTIVA",
  90: "ZAPATERIA OUTDOOR",
  91: "ZAPATERIA DEPORTIVA",
  100: "NO CATALOGADO",
  101: "SERVICIOS OUTDOOR",
};

/**
 * Obtiene el nombre de una familia de producto por su código
 * @param familyCode - Código numérico de la familia
 * @returns Nombre de la familia o "Familia {código}" si no existe
 */
export function getFamilyName(familyCode: number | null | undefined): string {
  if (!familyCode) return "";
  return PRODUCT_FAMILIES[familyCode] || `Familia ${familyCode}`;
}

/**
 * Obtiene todas las familias disponibles como array de objetos {value, label}
 * Útil para usar en componentes Select
 */
export function getFamiliesAsOptions() {
  return Object.entries(PRODUCT_FAMILIES)
    .map(([code, name]) => ({
      value: code,
      label: name,
    }))
    .sort((a, b) => Number(a.value) - Number(b.value));
}
