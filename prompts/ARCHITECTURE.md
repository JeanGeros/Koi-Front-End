# 🏗️ Arquitectura del Frontend - KOI Project

> **Documento de referencia para mantener consistencia arquitectónica en el proyecto**
>
> **Última actualización**: 2025-10-30

---

## 📋 Tabla de Contenidos

1. [Análisis del Código Actual](#análisis-del-código-actual)
2. [Arquitectura Propuesta](#arquitectura-propuesta)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Principios y Patrones](#principios-y-patrones)
5. [Flujo de Datos](#flujo-de-datos)
6. [Guías de Implementación](#guías-de-implementación)
7. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 📊 Análisis del Código Actual

### ✅ Puntos Positivos

1. **Estructura de carpetas clara:**
   - `src/app/` - Rutas de Next.js (login, dashboard)
   - `src/components/` - Componentes reutilizables
   - `src/lib/` - Lógica de negocio (API, auth)
   - `src/hooks/` - Custom hooks

2. **Separación de concerns:**
   - Autenticación separada en `auth.ts`, `auth-storage.ts`, `api.ts`
   - Componentes UI aislados en `ui/`

3. **Uso de TypeScript:** Tipos definidos para tokens, errores, etc.

4. **Componentes UI de calidad:** Usando shadcn/ui (Radix UI)

### ⚠️ Problemas Críticos Identificados

#### 1. **Falta de manejo de refresh tokens**
- **Ubicación**: `src/lib/api.ts:18-54`
- **Problema**: No hay interceptor para renovar tokens expirados
- **Impacto**: Usuario debe hacer login manualmente cuando expira el token

#### 2. **Falta de protección de rutas**
- **Problema**: No hay middleware de Next.js para proteger `/dashboard`
- **Impacto**: Rutas protegidas accesibles sin autenticación

#### 3. **Almacenamiento inseguro**
- **Ubicación**: `src/lib/auth-storage.ts:9-13`
- **Problema**: Usando `localStorage` que es vulnerable a XSS
- **Solución recomendada**: Cookies httpOnly (requiere backend ajustado)

#### 4. **No hay manejo de estado global**
- **Problema**: Sin Context API para el usuario autenticado
- **Impacto**: Cada componente debe verificar tokens manualmente

#### 5. **Falta de tipos y validación**
- **Problema**: No hay tipos para usuario, respuestas del API
- **Nota**: Zod está instalado pero no utilizado

#### 6. **Componentes con responsabilidades mixtas**
- **Ubicación**: `src/components/login-form.tsx`
- **Problema**: Mezcla lógica de negocio con presentación
- **Solución**: Separar en hook + componente presentacional

#### 7. **Hardcoded data**
- **Ubicación**: `src/app/dashboard/page.tsx:11`
- **Problema**: Importa `data.json` en vez de fetch del API
- **Impacto**: No consume backend real

#### 8. **Falta de capa de servicios organizada**
- **Problema**: No hay servicios por dominio (user, dashboard, etc.)
- **Impacto**: Dificulta escalabilidad y testing

---

## 🏛️ Arquitectura Propuesta

### Tipo: **Feature-Sliced Design + Clean Architecture**

Arquitectura híbrida que combina capas limpias con organización por features.

### Diagrama de Capas

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI/Pages)    │  ← Next.js App Router + Componentes
├─────────────────────────────────────┤
│   Application Layer (Hooks/Logic)  │  ← Custom Hooks + Context
├─────────────────────────────────────┤
│   Domain Layer (Services/Types)    │  ← Servicios de negocio + Tipos
├─────────────────────────────────────┤
│   Infrastructure Layer (API/Auth)  │  ← Cliente HTTP + Storage
└─────────────────────────────────────┘
```

### Regla de Dependencias

```
Presentation → Application → Domain → Infrastructure
```

**Importante**: Las capas externas pueden depender de las internas, pero NUNCA al revés.

---

## 📁 Estructura de Carpetas

```
src/
├── app/                           # 📱 PRESENTATION LAYER
│   ├── (auth)/                    # Route group - No autenticadas
│   │   ├── layout.tsx            # Layout simple para auth
│   │   └── login/
│   │       └── page.tsx          # Solo renderiza UI
│   │
│   ├── (protected)/              # Route group - Rutas protegidas
│   │   ├── layout.tsx            # Layout con verificación de auth
│   │   └── dashboard/
│   │       └── page.tsx          # Consume hooks, renderiza UI
│   │
│   ├── layout.tsx                # Root layout con providers
│   ├── providers.tsx             # Todos los providers (Auth, Theme, etc)
│   └── not-found.tsx
│
├── components/                    # 🎨 Componentes Reutilizables
│   ├── features/                 # Componentes específicos de features
│   │   ├── auth/
│   │   │   ├── login-form.tsx   # Componente presentacional puro
│   │   │   └── protected-route.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── stats-cards.tsx
│   │       ├── revenue-chart.tsx
│   │       └── data-table.tsx
│   │
│   ├── layouts/                  # Layouts compartidos
│   │   ├── main-layout.tsx
│   │   └── sidebar-layout.tsx
│   │
│   └── ui/                       # Componentes base (shadcn/ui)
│       └── [componentes shadcn]
│
├── lib/                          # 🔧 Core Libraries
│   ├── api/                      # INFRASTRUCTURE LAYER - HTTP Client
│   │   ├── client.ts            # Configuración base (fetch/axios)
│   │   ├── interceptors.ts      # Request/Response interceptors
│   │   ├── errors.ts            # Custom error classes
│   │   └── types.ts             # Tipos de API genéricos
│   │
│   ├── auth/                     # INFRASTRUCTURE + DOMAIN - Auth
│   │   ├── auth.context.tsx     # React Context Provider
│   │   ├── auth.service.ts      # Lógica de autenticación
│   │   ├── auth.storage.ts      # Persistencia de tokens
│   │   ├── auth.types.ts        # Tipos de auth
│   │   └── auth.utils.ts        # Utilidades (validar token, etc)
│   │
│   ├── services/                 # DOMAIN LAYER - Business Logic
│   │   ├── user.service.ts      # CRUD de usuarios
│   │   ├── dashboard.service.ts # Datos del dashboard
│   │   └── index.ts             # Exportaciones centralizadas
│   │
│   ├── types/                    # DOMAIN LAYER - Tipos compartidos
│   │   ├── index.ts
│   │   ├── user.types.ts
│   │   ├── dashboard.types.ts
│   │   └── common.types.ts
│   │
│   ├── schemas/                  # Validación con Zod
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   └── index.ts
│   │
│   ├── constants/                # Constantes de la app
│   │   ├── routes.ts
│   │   ├── api-endpoints.ts
│   │   └── config.ts
│   │
│   └── utils/                    # Utilidades generales
│       ├── cn.ts                # Tailwind merge
│       ├── format.ts            # Formateo de datos
│       └── validators.ts        # Validadores custom
│
├── hooks/                        # 🪝 APPLICATION LAYER - Custom Hooks
│   ├── use-auth.ts              # Hook principal de auth
│   ├── use-user.ts              # Hook de usuario actual
│   ├── use-dashboard.ts         # Hook de datos del dashboard
│   ├── use-api-query.ts         # Hook genérico para queries
│   ├── use-api-mutation.ts      # Hook genérico para mutations
│   └── use-mobile.ts
│
├── middleware.ts                 # 🛡️ Next.js Middleware (Route Protection)
│
└── env.ts                        # Validación de variables de entorno
```

---

## 🎯 Principios y Patrones

### A. Separation of Concerns

| Capa | Responsabilidad | Ejemplo |
|------|----------------|---------|
| **Presentation** | Solo renderizado, reciben props | `LoginForm.tsx` |
| **Application** | Estado y side effects | `useAuth()` hook |
| **Domain** | Lógica de negocio | `authService.login()` |
| **Infrastructure** | HTTP, Storage, APIs externas | `apiClient.post()` |

### B. Patrones Implementados

#### 1. **Repository Pattern** (en Services)

```typescript
// lib/services/user.service.ts
export const userService = {
  getProfile: () => apiClient.get<User>('/users/me'),
  updateProfile: (data: UpdateUserDto) => apiClient.patch<User>('/users/me', data),
  getUsers: (filters?: UserFilters) => apiClient.get<User[]>('/users', { params: filters })
}
```

#### 2. **Provider Pattern** (para Auth y otros contextos)

```typescript
// app/providers.tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  )
}
```

#### 3. **Custom Hooks Pattern**

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')

  return {
    user: context.user,
    login: context.login,
    logout: context.logout,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading
  }
}
```

#### 4. **Interceptor Pattern** (para refresh automático)

```typescript
// lib/api/interceptors.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = authStorage.getRefreshToken()
        const { access } = await authService.refreshToken(refreshToken)
        authStorage.saveAccessToken(access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        authStorage.clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
```

#### 5. **Factory Pattern** (para crear instancias configuradas)

```typescript
// lib/api/client.ts
export function createApiClient(config?: ApiConfig) {
  const client = axios.create({
    baseURL: config?.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: config?.timeout || 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  setupInterceptors(client)

  return client
}
```

---

## 🔄 Flujo de Datos

### Flujo Completo: Login de Usuario

```
1. User Action (Click "Login")
         ↓
2. LoginForm Component (Presentation)
   - Valida form con Zod
   - Llama a useAuth().login()
         ↓
3. useAuth Hook (Application)
   - Maneja estado de loading
   - Llama a authService.login()
         ↓
4. authService.login() (Domain)
   - Valida payload
   - Llama a apiClient.post()
         ↓
5. apiClient.post() (Infrastructure)
   - Hace HTTP request
   - Maneja errores de red
         ↓
6. Backend API Response
         ↓
7. Interceptor procesa respuesta
   - Guarda tokens
   - Actualiza headers
         ↓
8. authStorage.saveTokens() (Infrastructure)
   - Persiste en localStorage/cookies
         ↓
9. AuthContext actualiza estado (Application)
   - user, isAuthenticated = true
         ↓
10. LoginForm recibe estado actualizado (Presentation)
    - Redirect a /dashboard
    - UI muestra usuario autenticado
```

### Flujo: Request con Token Expirado

```
1. Component hace request
         ↓
2. apiClient.get('/protected-data')
         ↓
3. Backend responde 401 Unauthorized
         ↓
4. Response Interceptor detecta 401
         ↓
5. Intenta refresh automático:
   - Llama a /auth/refresh con refreshToken
   - Obtiene nuevo accessToken
   - Guarda nuevo token
   - Reintenta request original
         ↓
6. Si refresh falla:
   - Limpia tokens
   - Redirect a /login
         ↓
7. Si refresh exitoso:
   - Retorna data al componente
   - Usuario no nota nada
```

---

## 📚 Guías de Implementación

### 1. Crear un Nuevo Servicio

```typescript
// lib/services/product.service.ts
import { apiClient } from '@/lib/api/client'
import type { Product, CreateProductDto } from '@/lib/types/product.types'

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products')
    return response.data
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`)
    return response.data
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data)
    return response.data
  }
}
```

### 2. Crear un Custom Hook

```typescript
// hooks/use-products.ts
import { useState, useEffect } from 'react'
import { productService } from '@/lib/services/product.service'
import type { Product } from '@/lib/types/product.types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const data = await productService.getAll()
        setProducts(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, isLoading, error }
}
```

### 3. Crear un Componente Feature

```typescript
// components/features/products/product-list.tsx
'use client'

import { useProducts } from '@/hooks/use-products'
import { ProductCard } from './product-card'

export function ProductList() {
  const { products, isLoading, error } = useProducts()

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 4. Crear Tipos con Zod

```typescript
// lib/schemas/product.schema.ts
import { z } from 'zod'

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  createdAt: z.string().datetime()
})

export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true
})

// lib/types/product.types.ts
import type { z } from 'zod'
import { productSchema, createProductSchema } from '@/lib/schemas/product.schema'

export type Product = z.infer<typeof productSchema>
export type CreateProductDto = z.infer<typeof createProductSchema>
```

### 5. Proteger una Ruta

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/profile', '/settings']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  // Si está en ruta protegida sin token → redirect a login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si está en ruta de auth con token → redirect a dashboard
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

## 💡 Ejemplos Prácticos

### Ejemplo Completo: Feature de Autenticación

#### 1. Types & Schema

```typescript
// lib/types/auth.types.ts
export type TokenPair = {
  access: string
  refresh: string
}

export type User = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
}

export type LoginPayload = {
  username: string
  password: string
}

// lib/schemas/auth.schema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'Usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres')
})
```

#### 2. Service Layer

```typescript
// lib/services/auth.service.ts
import { apiClient } from '@/lib/api/client'
import { authStorage } from '@/lib/auth/auth.storage'
import type { LoginPayload, TokenPair, User } from '@/lib/types/auth.types'

export const authService = {
  login: async (payload: LoginPayload): Promise<TokenPair> => {
    const response = await apiClient.post<TokenPair>('/auth/login/', payload)
    authStorage.saveTokens(response.data)
    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout/')
    } finally {
      authStorage.clearTokens()
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me/')
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<TokenPair> => {
    const response = await apiClient.post<TokenPair>('/auth/refresh/', {
      refresh: refreshToken
    })
    return response.data
  }
}
```

#### 3. Context Provider

```typescript
// lib/auth/auth.context.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/lib/services/auth.service'
import { authStorage } from './auth.storage'
import type { User, LoginPayload } from '@/lib/types/auth.types'

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const token = authStorage.getAccessToken()
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch {
          authStorage.clearTokens()
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = async (payload: LoginPayload) => {
    await authService.login(payload)
    const userData = await authService.getCurrentUser()
    setUser(userData)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

#### 4. UI Component

```typescript
// components/features/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth.context'
import { loginSchema } from '@/lib/schemas/auth.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { LoginPayload } from '@/lib/types/auth.types'

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginPayload>({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validar con Zod
    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await login(formData)
      router.push('/dashboard')
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Error de autenticación'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Usuario"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      {errors.general && <p className="text-red-500">{errors.general}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
      </Button>
    </form>
  )
}
```

---

## 🎨 Ventajas de esta Arquitectura

| Ventaja | Descripción |
|---------|-------------|
| ✅ **Escalabilidad** | Fácil agregar features sin afectar código existente |
| ✅ **Testabilidad** | Cada capa se testea independientemente |
| ✅ **Mantenibilidad** | Código organizado y predecible |
| ✅ **Reutilización** | Hooks y servicios compartidos entre componentes |
| ✅ **Type Safety** | TypeScript + Zod en todas las capas |
| ✅ **Performance** | Next.js optimizations + lazy loading |
| ✅ **Developer Experience** | Estructura clara, fácil onboarding |

---

## 🚀 Próximos Pasos

### Fase 1: Refactorización Base (Prioridad Alta)
- [ ] Crear estructura de carpetas nueva
- [ ] Migrar `auth.ts`, `auth-storage.ts` a nueva estructura
- [ ] Implementar `AuthContext` y `AuthProvider`
- [ ] Crear `useAuth()` hook
- [ ] Refactorizar `login-form.tsx` separando lógica

### Fase 2: API Layer (Prioridad Alta)
- [ ] Configurar cliente HTTP con interceptors
- [ ] Implementar refresh automático de tokens
- [ ] Crear servicios base (user, auth)
- [ ] Agregar manejo de errores centralizado

### Fase 3: Protección de Rutas (Prioridad Alta)
- [ ] Crear middleware de Next.js
- [ ] Implementar route groups `(auth)` y `(protected)`
- [ ] Agregar componente `ProtectedRoute`

### Fase 4: Validación y Tipos (Prioridad Media)
- [ ] Crear schemas con Zod
- [ ] Generar tipos desde schemas
- [ ] Validar requests/responses

### Fase 5: Features del Dashboard (Prioridad Media)
- [ ] Crear servicios para dashboard data
- [ ] Implementar hooks de data fetching
- [ ] Refactorizar componentes del dashboard
- [ ] Conectar con API real (quitar data.json)

### Fase 6: Mejoras de UX (Prioridad Baja)
- [ ] Agregar error boundaries
- [ ] Implementar loading states globales
- [ ] Agregar toasts para feedback
- [ ] Optimizar performance con React.memo

---

## 📖 Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Zod Documentation](https://zod.dev/)

---

**Mantenido por**: Equipo de Desarrollo KOI
**Contacto**: Para dudas sobre arquitectura, consultar este documento primero
