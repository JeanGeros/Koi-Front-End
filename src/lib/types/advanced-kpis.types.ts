// KPIs Avanzados - Tipos TypeScript
// Basado en: KPIS_AVANZADOS_FRONTEND.md

export interface ChurnKPI {
  at_risk_customers: number
  at_risk_value: number
  percentage: number
}

export interface RedemptionKPI {
  redemption_rate: number
  points_awarded: number
  points_redeemed: number
  points_unused: number
  customers_with_points: number
}

export interface MonoCategoryKPI {
  mono_category_customers: number
  percentage: number
  multi_category_customers: number
  total_customers: number
}

export interface CrossSellPotentialKPI {
  total_potential: number
  current_revenue: number
  upside_percentage: number
  target_families: number
}

export interface ParetoKPI {
  top_20_percent_count: number
  top_20_percent_revenue: number
  percentage_of_customers: number
  percentage_of_revenue: number
  avg_value_per_vip: number
}

export interface RetentionKPI {
  retention_rate: number
  retained_customers: number
  previous_period_customers: number
  current_period_customers: number
}

export interface FrequencyKPI {
  avg_days_between_purchases: number
  customers_with_multiple_purchases: number
}

export interface CLVKPI {
  avg_clv: number
  total_clv: number
  customers_analyzed: number
}

export interface PeriodMetadata {
  start_date: string
  end_date: string
  previous_period: {
    start_date: string
    end_date: string
  }
}

export interface AdvancedKPIsResponse {
  churn: ChurnKPI
  redemption: RedemptionKPI
  mono_category: MonoCategoryKPI
  cross_sell_potential: CrossSellPotentialKPI
  pareto: ParetoKPI
  retention: RetentionKPI
  frequency: FrequencyKPI
  clv: CLVKPI
  period: PeriodMetadata
}

export interface AdvancedKPIsParams {
  start_date?: string
  end_date?: string
  exclude_email?: string
  sales_channel?: string
}