# API Endpoint: Distribución de Puntos por Fecha (Line Chart)

## Descripción
Endpoint para obtener la distribución de puntos generados por día en un formato compatible con Shadcn/Recharts para gráficos de líneas (Line Chart).

## URL
```
GET /api/analytics/charts/points-distribution/
```

## Autenticación
Requiere token JWT en el header:
```
Authorization: Bearer <token>
```

## Parámetros Query

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `start_date` | string (YYYY-MM-DD) | No | Fecha de inicio del período | `2025-06-01` |
| `end_date` | string (YYYY-MM-DD) | No | Fecha de fin del período | `2025-06-30` |
| `exclude_email` | string | No | Email de cliente a excluir de las métricas | `daniellavicentini@gmail.com` |

## Ejemplo de Uso

### Request
```bash
curl -X GET "https://koi.casalicia.cl/api/analytics/charts/points-distribution/?start_date=2025-06-01&end_date=2025-06-30" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### Response (200 OK)
```json
{
  "chartData": [
    {
      "date": "2025-06-01",
      "points": 1250,
      "sales": 125000.50,
      "purchases": 15,
      "topCategories": [
        {
          "id": 22,
          "name": "Familia 22",
          "sales": 45000.00,
          "count": 8
        },
        {
          "id": 15,
          "name": "Familia 15",
          "sales": 38000.00,
          "count": 5
        },
        {
          "id": 8,
          "name": "Familia 8",
          "sales": 22000.50,
          "count": 2
        }
      ]
    },
    {
      "date": "2025-06-02",
      "points": 980,
      "sales": 98000.00,
      "purchases": 12,
      "topCategories": [
        {
          "id": 22,
          "name": "Familia 22",
          "sales": 55000.00,
          "count": 6
        },
        {
          "id": 10,
          "name": "Familia 10",
          "sales": 25000.00,
          "count": 4
        },
        {
          "id": 15,
          "name": "Familia 15",
          "sales": 18000.00,
          "count": 2
        }
      ]
    }
  ],
  "stats": {
    "totalPoints": 45780,
    "avgPointsPerDay": 1526.00,
    "maxPointsDay": 2350,
    "totalPurchases": 420,
    "daysWithData": 30
  },
  "period": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  }
}
```

## Estructura de la Respuesta

### `chartData` (array)
Array con datos por día, ordenados cronológicamente.

- **`date`** (string): Fecha en formato YYYY-MM-DD
- **`points`** (integer): Total de puntos generados ese día
- **`sales`** (float): Monto total de ventas del día
- **`purchases`** (integer): Cantidad de compras realizadas
- **`topCategories`** (array): Top 3 categorías más compradas del día
  - **`id`** (integer): ID de la familia de producto
  - **`name`** (string): Nombre de la familia
  - **`sales`** (float): Total de ventas de esa categoría
  - **`count`** (integer): Cantidad de ítems vendidos

### `stats` (object)
Estadísticas globales del período.

- **`totalPoints`** (integer): Total de puntos generados en el período
- **`avgPointsPerDay`** (float): Promedio de puntos por día
- **`maxPointsDay`** (integer): Máximo de puntos en un solo día
- **`totalPurchases`** (integer): Total de compras del período
- **`daysWithData`** (integer): Cantidad de días con datos

### `period` (object)
Información del período consultado.

- **`startDate`** (string): Fecha de inicio
- **`endDate`** (string): Fecha de fin

## Integración con Shadcn Line Chart

### Ejemplo de Componente React/Next.js

```typescript
"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartDataPoint {
  date: string
  points: number
  sales: number
  purchases: number
  topCategories: Array<{
    id: number
    name: string
    sales: number
    count: number
  }>
}

interface PointsChartProps {
  data: ChartDataPoint[]
}

// Tooltip personalizado con información detallada
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null

  const data = payload[0].payload

  return (
    <div className="bg-white p-4 border rounded-lg shadow-lg">
      <p className="font-semibold text-sm mb-2">{data.date}</p>
      <div className="space-y-1 text-sm">
        <p className="text-blue-600 font-medium">
          Puntos: {data.points.toLocaleString()}
        </p>
        <p className="text-gray-600">
          Compras: {data.purchases}
        </p>
        <p className="text-gray-600">
          Ventas: ${data.sales.toLocaleString('es-CL')}
        </p>

        {data.topCategories.length > 0 && (
          <>
            <p className="font-medium mt-2 text-gray-700">Categorías principales:</p>
            <ul className="text-xs space-y-1 ml-2">
              {data.topCategories.map((cat: any, idx: number) => (
                <li key={idx}>
                  • {cat.name}: ${cat.sales.toLocaleString('es-CL')} ({cat.count} items)
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export function PointsDistributionChart({ data }: PointsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Puntos por Día</CardTitle>
        <CardDescription>
          Puntos generados diariamente con información de compras y categorías
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getDate()}/${date.getMonth() + 1}`
              }}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="points"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Uso del componente

```typescript
import { PointsDistributionChart } from '@/components/charts/points-distribution-chart'

export default async function DashboardPage() {
  // Fetch data from API
  const response = await fetch(
    'https://koi.casalicia.cl/api/analytics/charts/points-distribution/?start_date=2025-06-01&end_date=2025-06-30',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  )

  const { chartData, stats } = await response.json()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="Total Puntos" value={stats.totalPoints} />
        <StatsCard title="Promedio/Día" value={stats.avgPointsPerDay} />
        <StatsCard title="Día Máximo" value={stats.maxPointsDay} />
        <StatsCard title="Total Compras" value={stats.totalPurchases} />
      </div>

      <PointsDistributionChart data={chartData} />
    </div>
  )
}
```

## Notas Técnicas

### Filtros Aplicados
- Solo se consideran transacciones de tipo **"Venta"** (`transaction_type='1'`)
- Se excluyen notas de crédito, devoluciones y facturas
- Los datos se agrupan por día (fecha completa, no hora)

### Optimizaciones
- Usa agregaciones de Django ORM para calcular métricas por día
- Una query separada por día para obtener top categorías
- Formato de respuesta optimizado para Recharts (camelCase)

### Performance
- Para períodos muy largos (>90 días), considerar paginación
- Las categorías top se limitan a 3 por día para mantener tooltips legibles
- Los datos se ordenan cronológicamente automáticamente

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Formato de fecha inválido |
| 401 | Token JWT inválido o faltante |
| 500 | Error interno del servidor |

## Ejemplo de Respuesta de Error

```json
{
  "error": "Formato de fecha inválido. Use YYYY-MM-DD"
}
```
