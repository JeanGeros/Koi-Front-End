# API Endpoint: Top Clientes por Gasto (Bar Chart)

## Descripción
Endpoint para obtener el ranking de clientes con mayor gasto en un período específico, diseñado para gráficos de barras (Bar Chart) de Shadcn/Recharts con tooltips enriquecidos.

## URL
```
GET /api/analytics/charts/top-customers-spending/
```

## Autenticación
Requiere token JWT en el header:
```
Authorization: Bearer <token>
```

## Parámetros Query

| Parámetro | Tipo | Requerido | Descripción | Ejemplo | Default |
|-----------|------|-----------|-------------|---------|---------|
| `start_date` | string (YYYY-MM-DD) | **Sí** | Fecha de inicio del período | `2025-06-01` | - |
| `end_date` | string (YYYY-MM-DD) | **Sí** | Fecha de fin del período | `2025-06-30` | - |
| `limit` | integer | No | Cantidad de clientes top a mostrar (1-100) | `10` | `10` |
| `exclude_email` | string | No | Email de cliente a excluir del ranking | `daniellavicentini@gmail.com` | - |

## Ejemplo de Uso

### Request
```bash
curl -X GET "https://koi.casalicia.cl/api/analytics/charts/top-customers-spending/?start_date=2025-06-01&end_date=2025-06-30&limit=10" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### Response (200 OK)
```json
{
  "chartData": [
    {
      "rank": 1,
      "name": "María Fernanda González López",
      "rut": "12345678-9",
      "email": "maria.gonzalez@example.com",
      "spending": 2500000.00,
      "purchases": 15,
      "products": 45,
      "avgTicket": 166666.67
    },
    {
      "rank": 2,
      "name": "Juan Carlos Pérez Soto",
      "rut": "23456789-0",
      "email": "juan.perez@example.com",
      "spending": 1850000.00,
      "purchases": 12,
      "products": 38,
      "avgTicket": 154166.67
    },
    {
      "rank": 3,
      "name": "Carmen Rosa Muñoz Díaz",
      "rut": "34567890-1",
      "email": "carmen.munoz@example.com",
      "spending": 1650000.00,
      "purchases": 10,
      "products": 32,
      "avgTicket": 165000.00
    }
  ],
  "stats": {
    "totalSpending": 15750000.00,
    "avgSpending": 1575000.00,
    "maxSpending": 2500000.00,
    "totalCustomers": 10,
    "totalPurchases": 98,
    "totalProducts": 312
  },
  "period": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "performance": {
    "executionTimeSeconds": 0.15
  }
}
```

## Estructura de la Respuesta

### `chartData` (array)
Array ordenado de clientes por mayor gasto (descendente).

- **`rank`** (integer): Posición en el ranking (1 = mayor gasto)
- **`name`** (string): Nombre completo del cliente
- **`rut`** (string): RUT del cliente en formato "XXXXXXXX-Y"
- **`email`** (string): Correo electrónico del cliente
- **`spending`** (float): Total gastado en el período (CLP)
- **`purchases`** (integer): Cantidad de compras realizadas
- **`products`** (integer): Cantidad total de productos comprados
- **`avgTicket`** (float): Ticket promedio por compra (spending / purchases)

### `stats` (object)
Estadísticas globales del grupo de clientes.

- **`totalSpending`** (float): Suma total de gastos de todos los clientes del ranking
- **`avgSpending`** (float): Gasto promedio entre los clientes del ranking
- **`maxSpending`** (float): Mayor gasto individual
- **`totalCustomers`** (integer): Cantidad de clientes en el ranking
- **`totalPurchases`** (integer): Total de compras realizadas por todos
- **`totalProducts`** (integer): Total de productos comprados por todos

### `period` (object)
Información del período consultado.

- **`startDate`** (string): Fecha de inicio
- **`endDate`** (string): Fecha de fin

### `performance` (object)
Métricas de performance del endpoint.

- **`executionTimeSeconds`** (float): Tiempo de ejecución en segundos

---

## Integración con Shadcn Bar Chart

### Ejemplo de Componente React/Next.js

```typescript
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CustomerData {
  rank: number
  name: string
  rut: string
  email: string
  spending: number
  purchases: number
  products: number
  avgTicket: number
}

interface TopCustomersChartProps {
  data: CustomerData[]
  stats: {
    totalSpending: number
    avgSpending: number
    maxSpending: number
    totalCustomers: number
    totalPurchases: number
    totalProducts: number
  }
}

// Colores para las barras (gradiente del mejor al peor)
const COLORS = [
  '#0ea5e9', // sky-500 - Top 1
  '#06b6d4', // cyan-500 - Top 2
  '#14b8a6', // teal-500 - Top 3
  '#10b981', // emerald-500
  '#22c55e', // green-500
  '#84cc16', // lime-500
  '#eab308', // yellow-500
  '#f59e0b', // amber-500
  '#f97316', // orange-500
  '#ef4444', // red-500
]

// Tooltip personalizado con información detallada del cliente
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null

  const customer = payload[0].payload

  return (
    <div className="bg-white p-4 border rounded-lg shadow-lg min-w-[280px]">
      {/* Header con ranking */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant={customer.rank <= 3 ? "default" : "secondary"} className="text-xs">
          #{customer.rank} Ranking
        </Badge>
        <span className="text-xs text-gray-500">{customer.rut}</span>
      </div>

      {/* Nombre del cliente */}
      <p className="font-semibold text-sm mb-2 text-gray-900">
        {customer.name}
      </p>

      {/* Email */}
      <p className="text-xs text-gray-600 mb-3">
        {customer.email}
      </p>

      {/* Divider */}
      <div className="border-t my-2"></div>

      {/* Métricas principales */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Total Gastado:</span>
          <span className="text-sm font-bold text-blue-600">
            ${customer.spending.toLocaleString('es-CL')}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Compras:</span>
          <span className="text-sm font-medium text-gray-900">
            {customer.purchases} compras
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Productos:</span>
          <span className="text-sm font-medium text-gray-900">
            {customer.products} items
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Ticket Promedio:</span>
          <span className="text-sm font-medium text-green-600">
            ${customer.avgTicket.toLocaleString('es-CL')}
          </span>
        </div>
      </div>
    </div>
  )
}

// Etiqueta personalizada para las barras
const CustomLabel = ({ x, y, width, value }: any) => {
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#64748b"
      textAnchor="middle"
      fontSize={11}
      fontWeight={500}
    >
      ${(value / 1000000).toFixed(1)}M
    </text>
  )
}

export function TopCustomersSpendingChart({ data, stats }: TopCustomersChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clientes por Gasto Total</CardTitle>
        <CardDescription>
          Clientes con mayor gasto en el período seleccionado
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Estadísticas globales */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Total Período</p>
            <p className="text-lg font-bold text-blue-600">
              ${stats.totalSpending.toLocaleString('es-CL')}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Promedio Cliente</p>
            <p className="text-lg font-bold text-green-600">
              ${stats.avgSpending.toLocaleString('es-CL')}
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Total Compras</p>
            <p className="text-lg font-bold text-purple-600">
              {stats.totalPurchases}
            </p>
          </div>
        </div>

        {/* Gráfico de barras */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(value) => {
                // Acortar nombres largos
                return value.length > 20 ? value.substring(0, 20) + '...' : value
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
            <Bar
              dataKey="spending"
              radius={[8, 8, 0, 0]}
              label={<CustomLabel />}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Leyenda de medallas para top 3 */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-xs text-gray-600">Top 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs text-gray-600">Top 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span className="text-xs text-gray-600">Top 3</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Uso del componente

```typescript
import { TopCustomersSpendingChart } from '@/components/charts/top-customers-spending-chart'
import { useState } from 'react'

export default function CustomersAnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '2025-06-01',
    endDate: '2025-06-30'
  })
  const [limit, setLimit] = useState(10)

  // Fetch data from API
  const { data, isLoading } = useQuery({
    queryKey: ['top-customers-spending', dateRange, limit],
    queryFn: async () => {
      const response = await fetch(
        `https://koi.casalicia.cl/api/analytics/charts/top-customers-spending/?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Error fetching data')

      return response.json()
    }
  })

  if (isLoading) return <Skeleton className="h-[600px]" />

  return (
    <div className="space-y-4">
      {/* Filtros de fecha y límite */}
      <div className="flex gap-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <Select value={limit.toString()} onValueChange={(v) => setLimit(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Top 5</SelectItem>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="20">Top 20</SelectItem>
            <SelectItem value="50">Top 50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gráfico */}
      <TopCustomersSpendingChart
        data={data.chartData}
        stats={data.stats}
      />
    </div>
  )
}
```

---

## Notas Técnicas

### Filtros Aplicados
- Solo se consideran transacciones de tipo **"Venta"** (`transaction_type='1'`)
- Se excluyen notas de crédito, devoluciones y facturas
- Los datos se agrupan por cliente (RUN + DV)

### Optimizaciones Implementadas

1. **Agregación única:** Una sola query con `GROUP BY` para obtener totales por cliente
2. **Batch customer lookup:** Todos los datos de clientes se obtienen en una sola query usando Q objects
3. **Diccionario O(1):** Lookup de información de clientes es instantáneo
4. **Distinct en count:** `Count('number_order_id', distinct=True)` evita duplicados

### Performance Esperada

| Top Clientes | Queries | Tiempo Estimado |
|-------------|---------|-----------------|
| 10 clientes | 2 queries | ~80ms |
| 20 clientes | 2 queries | ~100ms |
| 50 clientes | 2 queries | ~120ms |

**Siempre 2 queries independiente del límite:**
1. Query con agregación por cliente
2. Query para obtener datos personales de clientes

### Validaciones

- ✅ `start_date` y `end_date` son **requeridos**
- ✅ `limit` debe estar entre 1 y 100
- ✅ Formato de fecha debe ser YYYY-MM-DD
- ✅ Cliente excluido debe existir en la BD (si se especifica)

---

## Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| 400 | Parámetros start_date/end_date faltantes | Enviar ambos parámetros |
| 400 | Límite fuera de rango (1-100) | Ajustar parámetro limit |
| 400 | Formato de fecha inválido | Use formato YYYY-MM-DD |
| 401 | Token JWT inválido o faltante | Renovar token de autenticación |
| 500 | Error interno del servidor | Revisar logs del servidor |

### Ejemplos de Respuestas de Error

```json
// Error: Parámetros faltantes
{
  "error": "Los parámetros start_date y end_date son requeridos"
}

// Error: Límite inválido
{
  "error": "El límite debe estar entre 1 y 100"
}

// Error: Formato de fecha
{
  "error": "Formato de fecha inválido. Use YYYY-MM-DD"
}
```

---

## Casos de Uso

### 1. Identificar VIP Customers
```bash
# Top 5 clientes del último trimestre
GET /api/analytics/charts/top-customers-spending/?start_date=2025-04-01&end_date=2025-06-30&limit=5
```

### 2. Análisis Mensual
```bash
# Top 20 clientes de junio
GET /api/analytics/charts/top-customers-spending/?start_date=2025-06-01&end_date=2025-06-30&limit=20
```

### 3. Excluir Cliente Interno
```bash
# Top 10 excluyendo cuenta de prueba
GET /api/analytics/charts/top-customers-spending/?start_date=2025-06-01&end_date=2025-06-30&limit=10&exclude_email=test@casalicia.cl
```

### 4. Análisis Semestral
```bash
# Top 50 clientes del semestre
GET /api/analytics/charts/top-customers-spending/?start_date=2025-01-01&end_date=2025-06-30&limit=50
```

---

## Mejoras Futuras Sugeridas

1. **Segmentación por canal:**
   ```
   ?channel=internet  # Solo ventas online
   ?channel=sucursal  # Solo ventas en tienda
   ```

2. **Filtro por familia de producto:**
   ```
   ?family_id=22  # Solo compras de una familia específica
   ```

3. **Comparación con período anterior:**
   ```json
   {
     "current": {...},
     "previous": {...},
     "growth": "+15%"
   }
   ```

4. **Export a Excel:**
   ```
   ?format=xlsx  # Descargar en formato Excel
   ```

5. **Paginación para grandes listas:**
   ```
   ?page=1&page_size=20
   ```

---

## Conclusión

Esta API está optimizada para gráficos de barras interactivos con tooltips ricos en información. La clave es:

- ✅ **Solo 2 queries** independiente del límite
- ✅ **Información completa** del cliente en cada barra
- ✅ **Formato Shadcn-ready** con camelCase
- ✅ **Estadísticas agregadas** para KPIs
- ✅ **Performance tracking** incluido

### Testing rápido:
```bash
curl -X GET "http://localhost:8000/api/analytics/charts/top-customers-spending/?start_date=2025-06-01&end_date=2025-06-30&limit=10" \
  -H "Authorization: Bearer <token>" \
  | jq '.performance'
```
