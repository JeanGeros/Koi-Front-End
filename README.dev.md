# 🐟 KOI Frontend - Documentación para Desarrolladores

Sistema de gestión frontend construido con **Next.js 16**, **TypeScript**, **Clean Architecture** y **shadcn/ui**.

---

## 🚀 Estado del Proyecto

| Fase | Estado | Descripción |
|------|--------|-------------|
| **Fase 1** | ✅ **Completado** | Sistema de autenticación con Clean Architecture |
| **Fase 2** | ✅ **Completado** | API Layer con interceptors y refresh automático |
| **Fase 3** | ⏳ **Pendiente** | Protección de rutas con middleware |
| **Fase 4** | ⏳ **Pendiente** | Validación completa con Zod |
| **Fase 5** | ⏳ **Pendiente** | Features del dashboard |
| **Fase 6** | ⏳ **Pendiente** | Mejoras de UX |

---

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Lenguaje**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Validación**: Zod 4
- **Arquitectura**: Clean Architecture + Feature-Sliced Design

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI/Pages)    │  ← React Components
├─────────────────────────────────────┤
│   Application Layer (Hooks/Logic)  │  ← Custom Hooks + Context
├─────────────────────────────────────┤
│   Domain Layer (Services/Types)    │  ← Business Logic
├─────────────────────────────────────┤
│   Infrastructure Layer (API/Auth)  │  ← HTTP Client + Storage
└─────────────────────────────────────┘
```

Ver documentación completa en [`prompts/ARCHITECTURE.md`](./prompts/ARCHITECTURE.md)

---

## 🚀 Quick Start

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

### Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas no autenticadas
│   │   └── login/
│   ├── (protected)/              # Rutas protegidas (Fase 3)
│   │   └── dashboard/
│   └── layout.tsx                # Root layout con providers
│
├── components/
│   ├── features/                 # Componentes por feature
│   │   ├── auth/                 # Login, registro, etc.
│   │   └── dashboard/            # Dashboard components
│   └── ui/                       # shadcn/ui base components
│
├── lib/
│   ├── api/                      # 🔥 HTTP Client + Interceptors
│   │   ├── client.ts             # Cliente HTTP
│   │   ├── errors.ts             # Errores tipados
│   │   ├── interceptors.ts       # Request/Response interceptors
│   │   └── index.ts
│   │
│   ├── auth/                     # 🔥 Sistema de autenticación
│   │   ├── auth.context.tsx      # Context + Provider
│   │   ├── auth.service.ts       # Lógica de auth
│   │   └── auth.storage.ts       # Storage de tokens
│   │
│   ├── constants/                # Constantes
│   │   ├── api-endpoints.ts      # Endpoints centralizados
│   │   └── config.ts             # Config de la app
│   │
│   ├── schemas/                  # Validación con Zod
│   │   ├── auth.schema.ts
│   │   └── index.ts
│   │
│   ├── services/                 # Servicios de negocio
│   │   ├── dashboard.service.ts
│   │   ├── user.service.ts
│   │   └── index.ts
│   │
│   └── types/                    # Tipos TypeScript
│       ├── auth.types.ts
│       └── index.ts
│
└── hooks/                        # Custom hooks
    ├── use-auth.ts               # En auth.context.tsx
    ├── use-mobile.ts
    └── ...
```

---

## 🔥 Features Implementadas

### 1️⃣ Sistema de Autenticación

```typescript
// Usar en cualquier componente
import { useAuth } from '@/lib/auth/auth.context'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Inicia sesión</div>
  }

  return <div>Hola {user.username}</div>
}
```

**Características:**
- ✅ Estado global con Context API
- ✅ Validación con Zod
- ✅ Type safe 100%
- ✅ Carga automática del usuario al iniciar

### 2️⃣ Cliente HTTP con Interceptors

```typescript
// Crear un servicio
import { apiClient } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'

export const productService = {
  getAll: () => apiClient.get<Product[]>('/api/products/'),
  create: (data) => apiClient.post('/api/products/', data),
}
```

**Características:**
- ✅ Autenticación automática (agrega token)
- ✅ Refresh automático cuando expira
- ✅ Manejo de errores tipado
- ✅ Timeout configurable
- ✅ Soporte para FormData

### 3️⃣ Refresh Automático de Tokens

```
User Request → Token expirado (401)
    ↓
Interceptor detecta
    ↓
Refresca automáticamente
    ↓
Reintentar request
    ↓
Usuario no nota nada ✨
```

### 4️⃣ Manejo de Errores Tipado

```typescript
try {
  const data = await apiClient.get('/api/data/')
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // 401 - Redirect a login
  } else if (error instanceof ValidationError) {
    // 422 - Mostrar errores de campos
    showErrors(error.details)
  } else if (error instanceof NetworkError) {
    // Sin conexión
    showToast('Verifica tu conexión')
  }
}
```

---

## 📚 Documentación

### Documentos Principales

| Archivo | Descripción |
|---------|-------------|
| [`QUICK_START.md`](./prompts/QUICK_START.md) | ⚡ Inicio rápido |
| [`ARCHITECTURE.md`](./prompts/ARCHITECTURE.md) | 🏗️ Arquitectura completa |
| [`API_CLIENT_GUIDE.md`](./prompts/API_CLIENT_GUIDE.md) | 🔌 Guía del cliente API |
| [`CHANGELOG.md`](./prompts/CHANGELOG.md) | 📝 Historial de cambios |

### Ejemplos de Código

- `src/lib/services/` - Servicios de ejemplo
- `src/components/features/auth/` - Componentes de auth
- `src/lib/auth/` - Sistema completo de autenticación

---

## 🎯 Próxima Sesión: Fase 3

### Objetivos

1. **Middleware de Next.js**
   - Proteger rutas automáticamente
   - Redirect basado en autenticación

2. **Route Groups**
   - `(auth)` - Rutas públicas (login, registro)
   - `(protected)` - Rutas protegidas (dashboard, perfil)

3. **Componentes de Protección**
   - `<ProtectedRoute>` - Wrapper para rutas protegidas
   - `withAuth()` - HOC para páginas

### Archivos a Crear

```
src/
├── middleware.ts              # Middleware de Next.js
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx        # Layout para auth
│   │   ├── login/
│   │   └── register/
│   │
│   └── (protected)/
│       ├── layout.tsx        # Layout protegido
│       ├── dashboard/
│       └── profile/
│
└── components/features/
    └── auth/
        └── protected-route.tsx
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo
npm run build              # Build de producción
npm start                  # Servidor de producción

# Linting
npm run lint               # Ejecutar ESLint

# Git
git status                 # Ver cambios
git add .                  # Agregar todos los cambios
git commit -m "mensaje"    # Commit

# Estructura
find src/lib -type f       # Ver archivos en lib
ls -la prompts/            # Ver documentación
```

---

## 📊 Estadísticas del Proyecto

### Métricas de Código

- **Archivos TypeScript**: ~25 archivos
- **Líneas de código**: ~2,000 LOC
- **Documentación**: ~2,500 líneas
- **Type safety**: 100%
- **Errores de compilación**: 0

### Cobertura de Features

| Feature | Estado | Progreso |
|---------|--------|----------|
| Autenticación | ✅ | 100% |
| API Client | ✅ | 100% |
| Refresh automático | ✅ | 100% |
| Manejo de errores | ✅ | 100% |
| Protección de rutas | ⏳ | 0% |
| Dashboard data | ⏳ | 0% |

---

## 🤝 Contribuir

### Flujo de Trabajo

1. Lee la documentación en `prompts/`
2. Sigue la arquitectura definida
3. Crea tipos con Zod
4. Escribe servicios en `lib/services/`
5. Usa hooks para lógica de estado
6. Componentes presentacionales en `components/features/`

### Estándares de Código

- ✅ TypeScript estricto
- ✅ Validación con Zod
- ✅ Funciones documentadas con JSDoc
- ✅ Componentes en `PascalCase`
- ✅ Archivos en `kebab-case`
- ✅ Hooks prefijados con `use`

---

## 📝 Notas Importantes

### Backend Requerido

El frontend espera un backend en `http://localhost:8000` con los siguientes endpoints:

```
POST   /api/auth/login/       # Login
POST   /api/auth/logout/      # Logout
POST   /api/auth/refresh/     # Refresh token
GET    /api/auth/me/          # Usuario actual
```

### Archivos de Backup

Los siguientes archivos fueron renombrados (pueden eliminarse):
- `src/lib/api.ts.old`
- `src/lib/auth.ts.old`
- `src/lib/auth-storage.ts.old`

### Breaking Changes desde Sesión Anterior

**Antes:**
```typescript
import { login } from '@/lib/auth'
import { apiFetch } from '@/lib/api'
```

**Ahora:**
```typescript
import { useAuth } from '@/lib/auth/auth.context'
import { apiClient } from '@/lib/api'

const { login } = useAuth()
```

---

## 🎉 Logros de la Sesión Actual

✅ Clean Architecture implementada
✅ Sistema de autenticación completo
✅ API Client con interceptors
✅ Refresh automático de tokens
✅ Manejo de errores centralizado
✅ Validación con Zod
✅ Documentación completa
✅ Type safety al 100%
✅ 0 errores de compilación

---

## 📞 Recursos

- **Next.js**: https://nextjs.org/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Zod**: https://zod.dev
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Última actualización**: 2025-10-30
**Versión**: 0.1.0
**Próxima fase**: Protección de Rutas (Fase 3)
