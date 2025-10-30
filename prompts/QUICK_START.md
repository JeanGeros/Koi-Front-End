# ⚡ Quick Start - KOI Frontend

> **Guía rápida para continuar el desarrollo**

---

## 🎯 Estado Actual del Proyecto

✅ **Fase 1 COMPLETADA** - Sistema de autenticación con Clean Architecture
✅ **Fase 2 COMPLETADA** - API Layer con interceptors y refresh automático
⏳ **Fase 3 PENDIENTE** - Protección de rutas con middleware

---

## 📁 Estructura Actual

```
src/
├── lib/
│   ├── api/              # ✅ Cliente HTTP con interceptors
│   ├── auth/             # ✅ Sistema de autenticación
│   ├── constants/        # ✅ Endpoints y config
│   ├── schemas/          # ✅ Validación con Zod
│   ├── services/         # ✅ Servicios de negocio
│   └── types/            # ✅ Tipos TypeScript
│
├── components/features/  # ✅ Componentes por feature
└── app/                  # Next.js App Router
```

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor (puerto 3000)

# Build
npm run build           # Compilar proyecto
npm start              # Servidor de producción

# Linting
npm run lint           # Ejecutar ESLint
```

---

## 💡 Uso del Sistema de Autenticación

### En un Componente

```typescript
'use client'
import { useAuth } from '@/lib/auth/auth.context'

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()

  if (isLoading) return <div>Cargando...</div>

  if (!isAuthenticated) {
    return <div>Por favor inicia sesión</div>
  }

  return (
    <div>
      Bienvenido {user?.username}
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}
```

---

## 🔌 Uso del Cliente API

### Crear un Servicio

```typescript
// src/lib/services/my-service.ts
import { apiClient } from '@/lib/api'

export const myService = {
  getData: () => apiClient.get<MyData>('/api/data/'),

  createItem: (data: CreateDto) =>
    apiClient.post<Item>('/api/items/', data),
}
```

### Usar en un Hook

```typescript
// src/hooks/use-my-data.ts
import { useState, useEffect } from 'react'
import { myService } from '@/lib/services'

export function useMyData() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    myService.getData()
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading }
}
```

---

## 📚 Documentación Completa

- **ARCHITECTURE.md** - Arquitectura del proyecto
- **API_CLIENT_GUIDE.md** - Guía del cliente API
- **CHANGELOG.md** - Historial de cambios

---

## 🎯 Próximos Pasos (Fase 3)

1. Crear `src/middleware.ts` para proteger rutas
2. Crear route groups `(auth)` y `(protected)`
3. Implementar redirect automático
4. Agregar componente `ProtectedRoute`

---

## 🔥 Features Clave Implementadas

✅ Refresh automático de tokens
✅ Manejo de errores tipado
✅ Validación con Zod
✅ Estado global de auth
✅ Endpoints centralizados
✅ Type safety 100%

---

**Última actualización**: 2025-10-30
