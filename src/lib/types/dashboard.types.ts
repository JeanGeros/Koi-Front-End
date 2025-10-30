export type DashboardPeriodo = {
  desde: string
  hasta: string
}

export type DashboardMetricasGenerales = {
  total_clientes: number
  total_puntos_circulacion: number
  campanas_activas: number
}

export type DashboardVentas = {
  total_ventas: number
  total_ordenes: number
  promedio_venta: number
}

export type DashboardPuntos = {
  puntos_usados: number
  transacciones_uso: number
  puntos_agregados: number
  puntos_deducidos: number
}

export type DashboardTopCliente = {
  personaid: number
  rut_completo: string
  nombre_completo: string
  correo: string
  current_points: number
}

export type DashboardOverview = {
  periodo: DashboardPeriodo
  metricas_generales: DashboardMetricasGenerales
  ventas: DashboardVentas
  puntos: DashboardPuntos
  top_clientes: DashboardTopCliente[]
  top_familias_productos: unknown[]
}

export type DashboardCustomerWithMostSales = {
  rut: string
  nombre_completo: string
  cantidad_compras: number
  total_monto: number
}