# KPIs Avanzados - API para Frontend

## 🎯 Endpoint Consolidado de Producción

**URL:**
```
GET http://localhost:8000/api/analytics/kpis/advanced/
```

**Producción:**
```
GET https://koi.casalicia.cl/api/analytics/kpis/advanced/
```

**Requiere Autenticación:**
```
Authorization: Bearer {tu_token_jwt}
```

---

## 📊 Parámetros Query (Todos Opcionales)

```javascript
{
  start_date: "2025-06-01",      // Fecha inicio (YYYY-MM-DD) - Default: 2025-06-01
  end_date: "2025-06-30",        // Fecha fin (YYYY-MM-DD) - Default: 2025-06-30
  exclude_email: "test@email.com" // Email a excluir de métricas
}
```

---

## 📋 Respuesta JSON Completa

Este endpoint retorna **8 KPIs consolidados** en una sola llamada:

```json
{
  // ========== KPI 1: CLIENTES EN RIESGO DE CHURN ==========
  "churn": {
    "at_risk_customers": 45,
    "at_risk_value": 2500000,
    "percentage": 18.5
  },

  // ========== KPI 2: RATIO DE REDENCIÓN DE PUNTOS ==========
  "redemption": {
    "redemption_rate": 18.5,
    "points_awarded": 1000000,
    "points_redeemed": 185000,
    "points_unused": 815000,
    "customers_with_points": 35
  },

  // ========== KPI 3: CLIENTES MONO-CATEGORÍA ==========
  "mono_category": {
    "mono_category_customers": 65,
    "percentage": 43.3,
    "multi_category_customers": 85,
    "total_customers": 150
  },

  // ========== KPI 4: VALOR POTENCIAL DE CROSS-SELLING ==========
  "cross_sell_potential": {
    "total_potential": 8500000,
    "current_revenue": 15500000,
    "upside_percentage": 54.8,
    "target_families": 3
  },

  // ========== KPI 5: TOP 20% VIP (PARETO) ==========
  "pareto": {
    "top_20_percent_count": 30,
    "top_20_percent_revenue": 12000000,
    "percentage_of_customers": 20.0,
    "percentage_of_revenue": 77.4,
    "avg_value_per_vip": 400000
  },

  // ========== KPI 6: TASA DE RETENCIÓN ==========
  "retention": {
    "retention_rate": 65.5,
    "retained_customers": 98,
    "previous_period_customers": 150,
    "current_period_customers": 150
  },

  // ========== KPI 7: FRECUENCIA DE COMPRA ==========
  "frequency": {
    "avg_days_between_purchases": 45.2,
    "customers_with_multiple_purchases": 85
  },

  // ========== KPI 8: CLV PROMEDIO ==========
  "clv": {
    "avg_clv": 285000,
    "total_clv": 42750000,
    "customers_analyzed": 150
  },

  // ========== METADATA ==========
  "period": {
    "start_date": "2025-06-01",
    "end_date": "2025-06-30",
    "previous_period": {
      "start_date": "2025-05-02",
      "end_date": "2025-06-01"
    }
  }
}
```

---

## 🎨 Descripción de Cada KPI

### 1️⃣ Clientes en Riesgo de Churn (`churn`)

**¿Qué mide?** Clientes que compraron en el período anterior pero NO en el actual

```json
"churn": {
  "at_risk_customers": 45,          // Cantidad de clientes en riesgo
  "at_risk_value": 2500000,         // Valor histórico total de estos clientes
  "percentage": 18.5                // % del total de clientes anteriores
}
```

**Tarjeta sugerida:**
```
⚠️ Clientes en Riesgo
45 clientes (18.5%)
$2,500,000 en riesgo
```

**Acción:** Crear campaña de reactivación inmediata

---

### 2️⃣ Ratio de Redención de Puntos (`redemption`)

**¿Qué mide?** Qué tan activo está el programa de puntos

```json
"redemption": {
  "redemption_rate": 18.5,          // (Redimidos / Otorgados) × 100
  "points_awarded": 1000000,        // Puntos otorgados en el período
  "points_redeemed": 185000,        // Puntos redimidos en el período
  "points_unused": 815000,          // Puntos acumulados sin usar
  "customers_with_points": 35       // Clientes con puntos > 0
}
```

**Tarjeta sugerida:**
```
📊 Redención de Puntos
18.5%
815K pts sin usar
35 clientes con puntos
```

**Interpretación:**
- < 15% → Baja adopción, oportunidad de activación
- 15-30% → Saludable
- > 30% → Muy activo

---

### 3️⃣ Clientes Mono-Categoría (`mono_category`)

**¿Qué mide?** Clientes que solo compran en UNA familia de productos

```json
"mono_category": {
  "mono_category_customers": 65,    // Clientes que compran en 1 sola familia
  "percentage": 43.3,               // % del total
  "multi_category_customers": 85,   // Clientes que compran en 2+ familias
  "total_customers": 150            // Total de clientes activos
}
```

**Tarjeta sugerida:**
```
🎯 Mono-Categoría
65 clientes (43%)
Target Cross-Selling
```

**Acción:** Estos son tu lista #1 para campañas de cross-selling

---

### 4️⃣ Valor Potencial de Cross-Selling (`cross_sell_potential`)

**¿Qué mide?** Dinero que podrías ganar si todos compraran en 3+ familias

```json
"cross_sell_potential": {
  "total_potential": 8500000,       // $ potencial no capturado
  "current_revenue": 15500000,      // Ventas actuales del período
  "upside_percentage": 54.8,        // Potencial como % de ventas actuales
  "target_families": 3              // Objetivo de familias por cliente
}
```

**Tarjeta sugerida:**
```
💰 Potencial No Capturado
$8,500,000
+54.8% de upside posible
```

**Acción:** Justifica inversión en campañas de cross-selling

---

### 5️⃣ Top 20% VIP - Pareto (`pareto`)

**¿Qué mide?** Segmento de clientes que genera la mayor parte de ingresos

```json
"pareto": {
  "top_20_percent_count": 30,       // Cantidad de clientes VIP
  "top_20_percent_revenue": 12000000, // $ que generan
  "percentage_of_customers": 20.0,  // % del total de clientes
  "percentage_of_revenue": 77.4,    // % que representan de ingresos
  "avg_value_per_vip": 400000       // Valor promedio por cliente VIP
}
```

**Tarjeta sugerida:**
```
🎯 Segmento VIP (Top 20%)
30 clientes
$12M (77% de ventas)
Valor promedio: $400K
```

**Acción:** Dar tratamiento premium a estos clientes

---

### 6️⃣ Tasa de Retención (`retention`)

**¿Qué mide?** % de clientes que volvieron a comprar

```json
"retention": {
  "retention_rate": 65.5,           // % de clientes retenidos
  "retained_customers": 98,         // Clientes que compraron en ambos períodos
  "previous_period_customers": 150, // Clientes del período anterior
  "current_period_customers": 150   // Clientes del período actual
}
```

**Tarjeta sugerida:**
```
🔄 Retención
65.5%
98 de 150 clientes volvieron
```

**Interpretación:**
- < 30% → Problema serio
- 30-50% → Mejorable
- > 50% → Saludable

---

### 7️⃣ Frecuencia de Compra (`frequency`)

**¿Qué mide?** Cada cuántos días compran los clientes

```json
"frequency": {
  "avg_days_between_purchases": 45.2, // Días promedio entre compras
  "customers_with_multiple_purchases": 85 // Clientes con 2+ compras
}
```

**Tarjeta sugerida:**
```
📅 Frecuencia
45 días promedio
entre compras
```

**Acción:** Define timing óptimo para campañas de reactivación

---

### 8️⃣ CLV Promedio (`clv`)

**¿Qué mide?** Valor total histórico promedio por cliente

```json
"clv": {
  "avg_clv": 285000,                // CLV promedio
  "total_clv": 42750000,            // CLV total de todos los clientes
  "customers_analyzed": 150         // Clientes analizados
}
```

**Tarjeta sugerida:**
```
💎 CLV Promedio
$285,000
por cliente
```

**Acción:** Define cuánto invertir en adquirir/retener clientes

---

## 💻 Código Frontend

### Fetch Simple

```javascript
async function getAdvancedKPIs() {
  const response = await fetch(
    'http://localhost:8000/api/analytics/kpis/advanced/?start_date=2025-06-01&end_date=2025-06-30',
    {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Error al obtener KPIs')
  }

  return await response.json()
}

// Uso
const kpis = await getAdvancedKPIs()
console.log(kpis.churn.at_risk_customers)  // 45
console.log(kpis.redemption.redemption_rate)  // 18.5
console.log(kpis.pareto.top_20_percent_count)  // 30
```

---

### React Component con shadcn/ui

```tsx
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AdvancedKPIs {
  churn: {
    at_risk_customers: number
    at_risk_value: number
    percentage: number
  }
  redemption: {
    redemption_rate: number
    points_unused: number
    customers_with_points: number
  }
  mono_category: {
    mono_category_customers: number
    percentage: number
  }
  cross_sell_potential: {
    total_potential: number
    upside_percentage: number
  }
  pareto: {
    top_20_percent_count: number
    top_20_percent_revenue: number
    percentage_of_revenue: number
  }
  retention: {
    retention_rate: number
  }
  frequency: {
    avg_days_between_purchases: number
  }
  clv: {
    avg_clv: number
  }
}

export function AdvancedKPIsDashboard() {
  const [kpis, setKpis] = useState<AdvancedKPIs | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadKPIs() {
      try {
        const response = await fetch(
          'http://localhost:8000/api/analytics/kpis/advanced/',
          {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
          }
        )
        const data = await response.json()
        setKpis(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadKPIs()
  }, [])

  if (loading) return <div>Cargando KPIs...</div>
  if (!kpis) return <div>Error al cargar KPIs</div>

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">KPIs Avanzados de Marketing</h2>

      {/* Fila 1: Métricas de Alerta */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Churn */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ⚠️ Clientes en Riesgo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {kpis.churn.at_risk_customers}
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.churn.percentage}% del total
            </p>
            <p className="text-xs text-muted-foreground">
              ${kpis.churn.at_risk_value.toLocaleString()} en riesgo
            </p>
          </CardContent>
        </Card>

        {/* Redención */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              📊 Redención de Puntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.redemption.redemption_rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.redemption.points_unused.toLocaleString()} pts sin usar
            </p>
            <p className="text-xs text-muted-foreground">
              {kpis.redemption.customers_with_points} clientes con puntos
            </p>
          </CardContent>
        </Card>

        {/* Mono-Categoría */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              🎯 Mono-Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.mono_category.mono_category_customers}
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.mono_category.percentage}% del total
            </p>
            <Badge variant="outline" className="mt-2">
              Target Cross-Selling
            </Badge>
          </CardContent>
        </Card>

        {/* Potencial Cross-Sell */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              💰 Potencial No Capturado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(kpis.cross_sell_potential.total_potential / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              +{kpis.cross_sell_potential.upside_percentage}% de upside
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fila 2: Segmentación y Retención */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Pareto VIP */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              🎯 Segmento VIP (Top 20%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {kpis.pareto.top_20_percent_count} clientes
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="text-lg font-semibold">
                  ${(kpis.pareto.top_20_percent_revenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">% de Ventas</p>
                <p className="text-lg font-semibold text-green-600">
                  {kpis.pareto.percentage_of_revenue}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retención */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              🔄 Retención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.retention.retention_rate}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Clientes que volvieron a comprar
            </p>
          </CardContent>
        </Card>

        {/* CLV */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              💎 CLV Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(kpis.clv.avg_clv / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Valor de vida del cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fila 3: Frecuencia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            📅 Frecuencia de Compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis.frequency.avg_days_between_purchases} días
          </div>
          <p className="text-xs text-muted-foreground">
            Promedio entre compras
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### Custom Hook

```tsx
// hooks/useAdvancedKPIs.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface UseAdvancedKPIsParams {
  startDate?: string
  endDate?: string
  excludeEmail?: string
}

export function useAdvancedKPIs(params?: UseAdvancedKPIsParams) {
  return useQuery({
    queryKey: ['advanced-kpis', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      if (params?.startDate) queryParams.append('start_date', params.startDate)
      if (params?.endDate) queryParams.append('end_date', params.endDate)
      if (params?.excludeEmail) queryParams.append('exclude_email', params.excludeEmail)

      const response = await api.get(
        `/analytics/kpis/advanced/?${queryParams}`
      )
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Uso en componente
export function Dashboard() {
  const { data: kpis, isLoading, error } = useAdvancedKPIs({
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  })

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <p>Clientes en riesgo: {kpis.churn.at_risk_customers}</p>
      <p>Redención: {kpis.redemption.redemption_rate}%</p>
    </div>
  )
}
```

---

## 🧪 Testing

### cURL

```bash
# 1. Login y obtener token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "tu_usuario", "password": "tu_password"}'

# Guardar token
export TOKEN="tu_token_aqui"

# 2. Obtener KPIs avanzados
curl -X GET "http://localhost:8000/api/analytics/kpis/advanced/?start_date=2025-06-01&end_date=2025-06-30" \
  -H "Authorization: Bearer $TOKEN"
```

### Python

```python
import requests

# Login
response = requests.post('http://localhost:8000/api/auth/login/', json={
    'username': 'tu_usuario',
    'password': 'tu_password'
})
token = response.json()['access']

# Obtener KPIs
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(
    'http://localhost:8000/api/analytics/kpis/advanced/',
    headers=headers,
    params={
        'start_date': '2025-06-01',
        'end_date': '2025-06-30'
    }
)

kpis = response.json()
print(f"Clientes en riesgo: {kpis['churn']['at_risk_customers']}")
print(f"Redención: {kpis['redemption']['redemption_rate']}%")
print(f"Potencial: ${kpis['cross_sell_potential']['total_potential']:,}")
```

---

## 📊 Vista Previa del Dashboard

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      KPIs AVANZADOS DE MARKETING                           │
└────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ ⚠️ En Riesgo     │ 📊 Redención     │ 🎯 Mono-Cat      │ 💰 Potencial     │
│ 45 clientes      │ 18.5%           │ 65 clientes      │ $8.5M           │
│ 18.5% del total  │ 815K pts        │ 43% del total    │ +54.8% upside   │
│ $2.5M en riesgo  │ 35 con puntos   │ Target XS        │                 │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘

┌────────────────────────────────────┬──────────────────┬──────────────────┐
│ 🎯 Segmento VIP (Top 20%)          │ 🔄 Retención     │ 💎 CLV Promedio  │
│ 30 clientes                        │ 65.5%           │ $285K           │
│ ┌──────────┬──────────┐           │ Clientes que    │ Valor de vida   │
│ │ Ingresos │ % Ventas │           │ volvieron       │                 │
│ │ $12.0M   │ 77.4%    │           │                 │                 │
│ └──────────┴──────────┘           │                 │                 │
└────────────────────────────────────┴──────────────────┴──────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ 📅 Frecuencia de Compra                                                    │
│ 45 días promedio entre compras                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Interpretación y Acciones

### KPI Alto Impacto

| KPI | Si es... | Acción |
|-----|----------|--------|
| **Churn** | > 20% | 🚨 Campaña de reactivación URGENTE |
| **Redención** | < 15% | 💡 Activar puntos con promociones |
| **Mono-Categoría** | > 40% | 🎯 Campañas de cross-selling focalizadas |
| **Potencial** | > 50% | 💰 Justifica inversión agresiva en marketing |
| **Pareto** | < 15% | 🎖️ Programa VIP para top clientes |
| **Retención** | < 30% | 🔧 Revisar experiencia del cliente |
| **Frecuencia** | > 60 días | ⏰ Enviar recordatorios/ofertas |
| **CLV** | Bajo | 📈 Foco en upselling y retención |

---

## 🔧 Troubleshooting

### Error: "Authentication credentials were not provided"
```javascript
// Asegúrate de incluir el token
headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('token')
}
```

### Error: "Formato de fecha inválido"
```javascript
// Las fechas deben ser YYYY-MM-DD
start_date: "2025-06-01"  // ✅ Correcto
start_date: "01/06/2025"  // ❌ Incorrecto
```

### Performance lento
El endpoint calcula 8 KPIs. Considera:
- Reducir rango de fechas
- Implementar cache en frontend (5-10 minutos)
- Usar React Query con `staleTime`

---

## 📌 Resumen

**Endpoint:** `GET /api/analytics/kpis/advanced/`

**Retorna 8 KPIs en un solo request:**
1. ⚠️ Churn
2. 📊 Redención
3. 🎯 Mono-Categoría
4. 💰 Potencial Cross-Sell
5. 🎯 Pareto VIP
6. 🔄 Retención
7. 📅 Frecuencia
8. 💎 CLV

**Ventajas:**
- ✅ Un solo request = mejor performance
- ✅ Datos ya calculados y optimizados
- ✅ Formato listo para tarjetas shadcn/ui
- ✅ Incluye período de comparación
- ✅ Todas las métricas accionables

**Úsalo en producción para tu dashboard de marketing** 🚀
