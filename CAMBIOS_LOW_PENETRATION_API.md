# Cambios en API: Low Penetration High Value

## Resumen de Modificaciones

Se actualizó el endpoint `/api/analytics/cross-selling/low-penetration-high-value/` según los siguientes requisitos:

---

## ✅ Cambio 1: Emails a Excluir como Constante Estática

### **ANTES:**
```python
exclude_email = request.query_params.get('exclude_email')

if exclude_email:
    try:
        cliente_excluir = Customer.objects.get(correo=exclude_email)
        excluded_run = cliente_excluir.run
        excluded_dv = cliente_excluir.dv
    except Customer.DoesNotExist:
        pass
```

**Problema:** Requería enviar el email como parámetro en cada request.

### **AHORA:**
```python
class LowPenetrationHighValueAPIView(APIView):
    # Emails estáticos a excluir del análisis (clientes internos, pruebas, etc.)
    EXCLUDED_EMAILS = [
        'daniellavicentini@gmail.com',
        'test@casalicia.cl',
        'admin@casalicia.cl',
        # Agregar más emails aquí según sea necesario
    ]

    def get(self, request):
        # Obtener lista de clientes a excluir (emails estáticos en batch)
        excluded_customers = []
        if self.EXCLUDED_EMAILS:
            excluded_customers = list(
                Customer.objects
                .filter(correo__in=self.EXCLUDED_EMAILS)
                .values_list('run', 'dv')
            )
```

**Mejoras:**
- ✅ Los emails están hardcodeados en el código
- ✅ Se pueden agregar fácilmente editando la constante
- ✅ Una sola query batch para todos los clientes excluidos
- ✅ No requiere parámetros en el request

---

## ✅ Cambio 2: Sin Filtros de Cantidad de Compras

### **ANTES:**
El código original no tenía filtros de cantidad de compras, pero la descripción menciona que se eliminó este requisito para claridad.

### **AHORA:**
```python
# Filtrar SOLO por ticket mínimo y baja penetración (<30%)
# NO se filtran por cantidad de compras mínimas ni máximas
if avg_ticket >= min_ticket and penetration_rate < 30:
    opportunities.append({...})
```

**Aclaración:**
- ✅ Solo se filtra por `min_ticket` (ticket mínimo)
- ✅ Solo se filtra por `penetration_rate < 30%` (baja penetración)
- ✅ **NO** hay filtros de cantidad de compras

---

## ✅ Cambio 3: Fechas Opcionales con Defaults del Mes Actual

### **ANTES:**
```python
# Parámetros obligatorios con defaults fijos
start_date_str = request.query_params.get('start_date', '2025-06-01')
end_date_str = request.query_params.get('end_date', '2025-06-30')
```

**Problema:** Siempre usaba fechas hardcodeadas si no se enviaban parámetros.

### **AHORA:**
```python
# Obtener fecha actual y calcular defaults
now = timezone.now()
first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

# Si no se proporcionan fechas, usar defaults del mes actual
if not start_date_str:
    start_date = first_day_of_month
    start_date_str = start_date.strftime('%Y-%m-%d')
else:
    try:
        start_date = make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))
    except ValueError:
        return Response({'error': 'Formato de start_date inválido. Use YYYY-MM-DD'}, ...)

if not end_date_str:
    end_date = now
    end_date_str = end_date.strftime('%Y-%m-%d')
else:
    try:
        end_date = make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
    except ValueError:
        return Response({'error': 'Formato de end_date inválido. Use YYYY-MM-DD'}, ...)
```

**Defaults dinámicos:**
- ✅ `start_date`: **Primer día del mes actual**
- ✅ `end_date`: **Fecha y hora actuales**
- ✅ Se calculan dinámicamente en cada request
- ✅ Parámetros completamente opcionales

**Ejemplos:**

```bash
# Sin parámetros de fecha (usa defaults del mes actual)
GET /api/analytics/cross-selling/low-penetration-high-value/
# Si hoy es 2025-10-31:
# - start_date: 2025-10-01
# - end_date: 2025-10-31

# Con fechas personalizadas
GET /api/analytics/cross-selling/low-penetration-high-value/?start_date=2025-06-01&end_date=2025-06-30
```

---

## 📊 Cambios en la Respuesta (Formato camelCase)

### **ANTES (snake_case):**
```json
{
  "opportunities": [{
    "customer_count": 150,
    "penetration_rate": 12.5,
    "avg_ticket": 250000,
    "total_revenue": 37500000,
    "growth_potential": "high"
  }],
  "summary": {
    "total_families_analyzed": 45,
    "avg_penetration_rate": 18.3,
    "high_value_threshold": 100000,
    "total_customers_period": 1200
  }
}
```

### **AHORA (camelCase - Shadcn compatible):**
```json
{
  "opportunities": [{
    "family": {
      "id": 22,
      "name": "Familia 22"
    },
    "customerCount": 150,
    "penetrationRate": 12.5,
    "avgTicket": 250000,
    "totalRevenue": 37500000,
    "totalTransactions": 450,
    "growthPotential": "high"
  }],
  "summary": {
    "totalFamiliesAnalyzed": 45,
    "totalOpportunities": 12,
    "avgPenetrationRate": 18.3,
    "highValueThreshold": 100000,
    "totalCustomersPeriod": 1200,
    "excludedCustomersCount": 3
  },
  "period": {
    "startDate": "2025-10-01",
    "endDate": "2025-10-31"
  }
}
```

**Nuevos campos agregados:**
- ✅ `totalTransactions`: Cantidad de transacciones de la familia
- ✅ `totalOpportunities`: Cantidad de familias con oportunidad
- ✅ `excludedCustomersCount`: Cantidad de clientes excluidos

---

## 🔧 Otros Cambios Técnicos

### 1. Filtro de Solo Ventas Reales
```python
# ANTES: No filtraba por tipo de transacción
query_total_customers = Order.objects.filter(date__range=(start_date, end_date))

# AHORA: Solo ventas reales
query_total_customers = Order.objects.filter(
    date__range=(start_date, end_date),
    transaction_type='1'  # Solo ventas reales
)
```

### 2. Exclusión de Múltiples Clientes
```python
# ANTES: Solo excluía 1 cliente
if excluded_run and excluded_dv:
    query_total_customers = query_total_customers.exclude(run=excluded_run, dv=excluded_dv)

# AHORA: Excluye lista de clientes
if excluded_customers:
    for run, dv in excluded_customers:
        query_total_customers = query_total_customers.exclude(run=run, dv=dv)
```

### 3. Logging Mejorado
```python
# ANTES:
logger.info(f"API low-penetration-high-value: {len(opportunities)} familias encontradas")

# AHORA:
logger.info(f"API low-penetration-high-value: {len(opportunities)} familias encontradas, {len(excluded_customers)} clientes excluidos")
```

---

## 📝 Documentación OpenAPI Actualizada

**Parámetros:**
```yaml
parameters:
  - name: start_date
    type: date
    required: false  # ✅ Ahora opcional
    description: "Fecha inicio del período (YYYY-MM-DD). Default: primer día del mes actual"

  - name: end_date
    type: date
    required: false  # ✅ Ahora opcional
    description: "Fecha fin del período (YYYY-MM-DD). Default: hoy"

  - name: min_ticket
    type: integer
    required: false
    default: 100000
    description: "Ticket mínimo para considerar premium"
```

**Nota:** Se eliminó el parámetro `exclude_email`.

---

## 🧪 Ejemplos de Uso

### Caso 1: Sin Parámetros (Defaults del Mes Actual)
```bash
curl -X GET "https://koi.casalicia.cl/api/analytics/cross-selling/low-penetration-high-value/" \
  -H "Authorization: Bearer <token>"

# Analiza desde el 1ro del mes actual hasta hoy
```

### Caso 2: Con Fechas Personalizadas
```bash
curl -X GET "https://koi.casalicia.cl/api/analytics/cross-selling/low-penetration-high-value/?start_date=2025-01-01&end_date=2025-06-30" \
  -H "Authorization: Bearer <token>"

# Analiza el primer semestre de 2025
```

### Caso 3: Con Ticket Mínimo Personalizado
```bash
curl -X GET "https://koi.casalicia.cl/api/analytics/cross-selling/low-penetration-high-value/?min_ticket=500000" \
  -H "Authorization: Bearer <token>"

# Solo familias premium con ticket >= $500.000
```

---

## 🎯 Impacto en el Frontend

### Antes de los Cambios:
```typescript
// PROBLEMA: Siempre había que enviar exclude_email
const response = await fetch(
  `/api/low-penetration-high-value/?start_date=2025-06-01&end_date=2025-06-30&exclude_email=test@casalicia.cl`
)
```

### Después de los Cambios:
```typescript
// ✅ Sin parámetros: usa mes actual y excluye automáticamente
const response1 = await fetch('/api/low-penetration-high-value/')

// ✅ Solo fechas personalizadas
const response2 = await fetch('/api/low-penetration-high-value/?start_date=2025-06-01&end_date=2025-06-30')

// ✅ Acceso a nuevos campos camelCase
const data = await response1.json()
console.log(data.summary.excludedCustomersCount)  // Cantidad de clientes excluidos
console.log(data.opportunities[0].totalTransactions)  // Transacciones de la familia
```

---

## 🔐 Gestión de Emails Excluidos

**Para agregar más emails a excluir:**

1. Editar el archivo `gonarm/rest_api/views.py`
2. Buscar la clase `LowPenetrationHighValueAPIView`
3. Modificar la constante `EXCLUDED_EMAILS`:

```python
EXCLUDED_EMAILS = [
    'daniellavicentini@gmail.com',
    'test@casalicia.cl',
    'admin@casalicia.cl',
    'nuevo_email@example.com',  # ⬅️ Agregar aquí
]
```

4. Reiniciar el servidor Django

**Ventajas:**
- ✅ Centralizado en el código
- ✅ Versionado con Git
- ✅ No depende de parámetros externos
- ✅ Fácil de auditar

---

## 📊 Resumen de Cambios

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Emails excluidos** | Parámetro `exclude_email` | Constante estática `EXCLUDED_EMAILS` |
| **Fechas** | Obligatorias con defaults fijos | Opcionales con defaults dinámicos (mes actual) |
| **Cantidad compras** | Sin filtros | Sin filtros (confirmado) |
| **Formato respuesta** | `snake_case` | `camelCase` (Shadcn compatible) |
| **Nuevos campos** | - | `totalTransactions`, `excludedCustomersCount` |
| **Filtros** | Todos los tipos | Solo ventas reales (`transaction_type='1'`) |

---

## ✅ Checklist de Implementación

- [x] Agregar constante `EXCLUDED_EMAILS` estática
- [x] Remover parámetro `exclude_email` de la API
- [x] Implementar batch lookup de clientes excluidos
- [x] Cambiar fechas a opcionales
- [x] Calcular defaults dinámicos (primer día mes actual + hoy)
- [x] Actualizar formato de respuesta a camelCase
- [x] Agregar filtro `transaction_type='1'`
- [x] Agregar campos `totalTransactions` y `excludedCustomersCount`
- [x] Actualizar logging con cantidad de clientes excluidos
- [x] Actualizar documentación OpenAPI

---

## 🚀 Testing

```bash
# Test 1: Sin parámetros (defaults del mes actual)
curl -X GET "http://localhost:8000/api/analytics/cross-selling/low-penetration-high-value/" \
  -H "Authorization: Bearer <token>" \
  | jq '.period'

# Debe retornar:
# {
#   "startDate": "2025-10-01",  # Primer día del mes actual
#   "endDate": "2025-10-31"      # Hoy
# }

# Test 2: Verificar clientes excluidos
curl -X GET "http://localhost:8000/api/analytics/cross-selling/low-penetration-high-value/" \
  -H "Authorization: Bearer <token>" \
  | jq '.summary.excludedCustomersCount'

# Debe retornar: 3 (o la cantidad de emails en EXCLUDED_EMAILS)

# Test 3: Fechas personalizadas
curl -X GET "http://localhost:8000/api/analytics/cross-selling/low-penetration-high-value/?start_date=2025-06-01&end_date=2025-06-30" \
  -H "Authorization: Bearer <token>" \
  | jq '.period'

# Debe retornar:
# {
#   "startDate": "2025-06-01",
#   "endDate": "2025-06-30"
# }
```

---

## 📖 Conclusión

La API ahora es:
- ✅ **Más simple**: No requiere parámetro `exclude_email`
- ✅ **Más inteligente**: Usa fechas dinámicas del mes actual
- ✅ **Más mantenible**: Emails excluidos centralizados en el código
- ✅ **Más completa**: Información adicional en la respuesta
- ✅ **Frontend-ready**: Formato camelCase compatible con Shadcn
