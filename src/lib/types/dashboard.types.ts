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

export type PropsTopCustomersByCategory = {
  top_customers_by_category: DashboardCustomerWithMostSales[]
  start_date: string
  end_date: string
  family_product: number
  count_customers: number
}

export type DashboardCustomerWithMostSales = {
  rut: string
  nombre_completo: string
  cantidad_compras: number
  total_monto: number
}

// Points Distribution Chart Types
export type PointsDistributionCategory = {
  id: number
  name: string
  sales: number
  count: number
}

export type PointsDistributionDataPoint = {
  date: string
  points: number
  sales: number
  purchases: number
  topCategories: PointsDistributionCategory[]
}

export type PointsDistributionStats = {
  totalPoints: number
  avgPointsPerDay: number
  maxPointsDay: number
  totalPurchases: number
  daysWithData: number
}

export type PointsDistributionPeriod = {
  startDate: string
  endDate: string
}

export type PointsDistributionResponse = {
  chartData: PointsDistributionDataPoint[]
  stats: PointsDistributionStats
  period: PointsDistributionPeriod
}

export type PointsDistributionParams = {
  start_date?: string
  end_date?: string
  exclude_email?: string
}

// Low Penetration High Value API Types
export type LowPenetrationFamily = {
  id: number
  name: string
}

export type LowPenetrationOpportunity = {
  family: LowPenetrationFamily
  customerCount: number
  penetrationRate: number
  avgTicket: number
  totalRevenue: number
  totalTransactions: number
  growthPotential: "high" | "medium" | "low"
}

export type LowPenetrationSummary = {
  totalFamiliesAnalyzed: number
  totalOpportunities: number
  avgPenetrationRate: number
  highValueThreshold: number
  totalCustomersPeriod: number
  excludedCustomersCount: number
}

export type LowPenetrationPeriod = {
  startDate: string
  endDate: string
}

export type LowPenetrationResponse = {
  opportunities: LowPenetrationOpportunity[]
  summary: LowPenetrationSummary
  period: LowPenetrationPeriod
}

export type LowPenetrationParams = {
  start_date?: string
  end_date?: string
  min_ticket?: number
}

// Top Customers Next Purchase API Types (Nueva estructura con clientes individuales)
export type TopCustomersNextPurchasePurchaseHistory = {
  date: string
  productCode: number
  amount: number
  quantity: number
  family: number
}

export type TopCustomersNextPurchaseCustomer = {
  rank: number
  name: string
  rut: string
  email: string
  currentPoints: number
  purchases: number
  spending: number
  items: number
  avgTicket: number
  firstPurchase: string
  lastPurchase: string
  recencyDays: number
  frequencyScore: number
  daysActive: number
  isHot: boolean
  familyId: number
  purchaseHistory: TopCustomersNextPurchasePurchaseHistory[]
}

export type TopCustomersNextPurchaseStats = {
  totalCustomers: number
  totalPurchases: number
  totalSpending: number
  totalItems: number
  avgPurchases: number
  avgSpending: number
  avgItems: number
  avgFrequency: number
  avgRecency: number
  maxSpending: number
  hotCustomers: number
  hotPercentage: number
}

export type TopCustomersNextPurchasePeriod = {
  startDate: string
  endDate: string
}

export type TopCustomersNextPurchaseFilters = {
  familyProduct: number | null
  minPurchases: number
  limit: number
}

export type TopCustomersNextPurchasePerformance = {
  executionTimeSeconds: number
}

export type TopCustomersNextPurchaseResponse = {
  chartData: TopCustomersNextPurchaseCustomer[]
  stats: TopCustomersNextPurchaseStats
  period: TopCustomersNextPurchasePeriod
  filters: TopCustomersNextPurchaseFilters
  performance: TopCustomersNextPurchasePerformance
}

export type TopCustomersNextPurchaseParams = {
  start_date?: string
  end_date?: string
  family_product?: number
  min_purchases?: number
  limit?: number
}

// Top Customers Spending API Types
export type TopCustomersSpendingCustomer = {
  rank: number
  name: string
  rut: string
  email: string
  spending: number
  purchases: number
  products: number
  avgTicket: number
}

export type TopCustomersSpendingStats = {
  totalSpending: number
  avgSpending: number
  maxSpending: number
  totalCustomers: number
  totalPurchases: number
  totalProducts: number
}

export type TopCustomersSpendingPeriod = {
  startDate: string
  endDate: string
}

export type TopCustomersSpendingPerformance = {
  executionTimeSeconds: number
}

export type TopCustomersSpendingResponse = {
  chartData: TopCustomersSpendingCustomer[]
  stats: TopCustomersSpendingStats
  period: TopCustomersSpendingPeriod
  performance: TopCustomersSpendingPerformance
}

export type TopCustomersSpendingParams = {
  start_date: string
  end_date: string
  limit?: number
  exclude_email?: string
}

// KPI Cards API Types
export type KPICardCustomer = {
  name: string
  email: string
  rut: string
  totalSpending?: number
  totalPurchases?: number
  totalItems?: number
  familiesCount?: number
  families?: number[]
}

export type KPICardsPeriod = {
  startDate: string
  endDate: string
}

export type KPICardsPerformance = {
  executionTimeSeconds: number
}

export type KPICardsResponse = {
  topSpender: KPICardCustomer
  topBuyer: KPICardCustomer
  topDiverseBuyer: KPICardCustomer
  period: KPICardsPeriod
  performance: KPICardsPerformance
}

export type KPICardsParams = {
  start_date?: string
  end_date?: string
}