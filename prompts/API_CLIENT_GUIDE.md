# 🔌 Guía del Cliente API - Sistema de Interceptors y Refresh Automático

> **Guía práctica para usar el nuevo sistema de API con refresh automático de tokens**
>
> **Última actualización**: 2025-10-30

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Uso Básico](#uso-básico)
4. [Interceptors](#interceptors)
5. [Manejo de Errores](#manejo-de-errores)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [Testing](#testing)

---

## 🎯 Introducción

El nuevo sistema de API proporciona:

✅ **Autenticación automática** - Los tokens se agregan automáticamente a las peticiones
✅ **Refresh automático** - Cuando el token expira, se refresca automáticamente
✅ **Manejo centralizado de errores** - Errores tipados y consistentes
✅ **Type safety completo** - TypeScript en todas las capas
✅ **Timeout configurable** - Control sobre tiempos de espera

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌──────────────────────────────────────────────────┐
│            apiClient (HttpClient)                │
│  - Configuración base                            │
│  - Timeout management                            │
│  - Métodos: get, post, put, patch, delete       │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│              Request Interceptors                │
│  - authRequestInterceptor:                       │
│    Agrega Authorization header                   │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│                  HTTP Request                    │
│              (fetch nativo de JS)                │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│             Response Interceptors                │
│  - authResponseInterceptor:                      │
│    • Detecta 401 Unauthorized                    │
│    • Intenta refresh automático                  │
│    • Reintentar request original                 │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│               Error Interceptors                 │
│  - errorInterceptor:                             │
│    • Parsea errores                              │
│    • Logging                                     │
│    • Redirects (401 → /login)                    │
└──────────────────────────────────────────────────┘
```

### Flujo de Refresh Automático

```
1. Request con token expirado
         ↓
2. Backend responde 401
         ↓
3. Interceptor detecta 401
         ↓
4. ¿Ya está refrescando?
   ├─ SÍ → Encolar request y esperar
   └─ NO → Iniciar refresh
         ↓
5. POST /api/auth/refresh/
   con refreshToken
         ↓
6. ¿Refresh exitoso?
   ├─ SÍ → Guardar nuevo token
   │      → Notificar requests en cola
   │      → Reintentar request original
   │      → Retornar data
   │
   └─ NO → Limpiar tokens
         → Redirect a /login
         → Lanzar error
```

---

## 💡 Uso Básico

### Importar el Cliente

```typescript
import { apiClient } from '@/lib/api'
```

### Métodos Disponibles

#### GET Request

```typescript
// Obtener datos
const users = await apiClient.get<User[]>('/api/users/')

// Con query params
const filteredUsers = await apiClient.get<User[]>('/api/users/?role=admin')
```

#### POST Request

```typescript
// Crear recurso
const newUser = await apiClient.post<User>('/api/users/', {
  username: 'john',
  email: 'john@example.com'
})

// Login (skip auth)
const tokens = await apiClient.post<TokenPair>(
  '/api/auth/login/',
  { username: 'admin', password: 'secret' },
  { skipAuth: true } // No enviar Authorization header
)
```

#### PATCH Request

```typescript
// Actualizar parcialmente
const updatedUser = await apiClient.patch<User>('/api/users/me/', {
  firstName: 'John',
  lastName: 'Doe'
})
```

#### PUT Request

```typescript
// Reemplazar completamente
const user = await apiClient.put<User>('/api/users/123/', userData)
```

#### DELETE Request

```typescript
// Eliminar
await apiClient.delete('/api/users/123/')
```

### Opciones Avanzadas

```typescript
// Custom headers
const data = await apiClient.get('/api/data/', {
  headers: {
    'X-Custom-Header': 'value'
  }
})

// Skip autenticación
const publicData = await apiClient.get('/api/public/', {
  skipAuth: true
})

// FormData (multipart)
const formData = new FormData()
formData.append('file', file)

const response = await apiClient.post('/api/upload/', formData)
```

---

## 🔧 Interceptors

### Request Interceptor

Agrega automáticamente el token de autorización:

```typescript
// src/lib/api/interceptors.ts

function authRequestInterceptor(options: RequestOptions): RequestOptions {
  if (options.skipAuth) return options

  const accessToken = authStorage.getAccessToken()

  if (accessToken) {
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)

    return { ...options, headers }
  }

  return options
}
```

### Response Interceptor

Maneja refresh automático en errores 401:

```typescript
async function authResponseInterceptor(response: Response): Promise<Response> {
  if (response.ok) return response

  if (response.status === 401) {
    // Lógica de refresh automático
    // 1. Verificar si ya está refrescando
    // 2. Intentar refresh
    // 3. Reintentar request original
    // 4. Si falla, redirect a login
  }

  return response
}
```

### Error Interceptor

Maneja errores de forma centralizada:

```typescript
async function errorInterceptor(error: Error): Promise<Error> {
  // Logging en development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]:', error)
  }

  // Redirect en UnauthorizedError
  if (error instanceof UnauthorizedError) {
    window.location.href = '/login'
  }

  return error
}
```

---

## ❌ Manejo de Errores

### Clases de Error Personalizadas

```typescript
// NetworkError - Problemas de conexión
try {
  const data = await apiClient.get('/api/data/')
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Sin conexión al servidor')
  }
}

// UnauthorizedError - 401
catch (error) {
  if (error instanceof UnauthorizedError) {
    console.log('Debes iniciar sesión')
  }
}

// ForbiddenError - 403
catch (error) {
  if (error instanceof ForbiddenError) {
    console.log('No tienes permisos')
  }
}

// NotFoundError - 404
catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Recurso no encontrado')
  }
}

// ValidationError - 422
catch (error) {
  if (error instanceof ValidationError) {
    console.log('Datos inválidos:', error.details)
  }
}

// ServerError - 500+
catch (error) {
  if (error instanceof ServerError) {
    console.log('Error del servidor')
  }
}
```

### Error Genérico

```typescript
try {
  const data = await apiClient.get('/api/data/')
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`Error ${error.status}: ${error.message}`)
    console.log('Detalles:', error.details)
  }
}
```

### Verificar si es Recuperable

```typescript
import { isRetryableError } from '@/lib/api'

try {
  const data = await apiClient.get('/api/data/')
} catch (error) {
  if (isRetryableError(error as Error)) {
    // Reintentar después de un delay
    setTimeout(() => retry(), 3000)
  } else {
    // Mostrar error al usuario
    showErrorToast(error.message)
  }
}
```

---

## 🎨 Ejemplos Prácticos

### Crear un Servicio

```typescript
// src/lib/services/product.service.ts

import { apiClient } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints'

export type Product = {
  id: string
  name: string
  price: number
  stock: number
}

export type CreateProductDto = Omit<Product, 'id'>

export const productService = {
  getAll: async (): Promise<Product[]> => {
    return apiClient.get<Product[]>('/api/products/')
  },

  getById: async (id: string): Promise<Product> => {
    return apiClient.get<Product>(`/api/products/${id}/`)
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    return apiClient.post<Product>('/api/products/', data)
  },

  update: async (id: string, data: Partial<CreateProductDto>): Promise<Product> => {
    return apiClient.patch<Product>(`/api/products/${id}/`, data)
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/products/${id}/`)
  }
}
```

### Usar en un Hook

```typescript
// src/hooks/use-products.ts

import { useState, useEffect } from 'react'
import { productService, type Product } from '@/lib/services/product.service'
import { ApiError } from '@/lib/api'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await productService.getAll()
        setProducts(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Error desconocido')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, isLoading, error }
}
```

### Usar en un Componente

```typescript
// src/components/features/products/product-list.tsx

'use client'

import { useProducts } from '@/hooks/use-products'

export function ProductList() {
  const { products, isLoading, error } = useProducts()

  if (isLoading) {
    return <div>Cargando productos...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="border p-4">
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <p>Stock: {product.stock}</p>
        </div>
      ))}
    </div>
  )
}
```

### Mutations con React

```typescript
// src/hooks/use-product-mutation.ts

import { useState } from 'react'
import { productService, type CreateProductDto, type Product } from '@/lib/services'
import { ApiError, ValidationError } from '@/lib/api'

export function useCreateProduct() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProduct = async (data: CreateProductDto): Promise<Product | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const product = await productService.create(data)
      return product
    } catch (err) {
      if (err instanceof ValidationError) {
        setError('Datos inválidos: ' + err.message)
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Error desconocido')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { createProduct, isLoading, error }
}
```

---

## 🧪 Testing

### Mockear el Cliente API

```typescript
// __mocks__/@/lib/api.ts

export const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}
```

### Test de un Servicio

```typescript
// src/lib/services/__tests__/product.service.test.ts

import { productService } from '../product.service'
import { apiClient } from '@/lib/api'

jest.mock('@/lib/api')

describe('productService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch all products', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 100, stock: 10 }
    ]

    ;(apiClient.get as jest.Mock).mockResolvedValue(mockProducts)

    const products = await productService.getAll()

    expect(apiClient.get).toHaveBeenCalledWith('/api/products/')
    expect(products).toEqual(mockProducts)
  })

  it('should handle errors', async () => {
    const error = new ApiError(500, 'Server error')

    ;(apiClient.get as jest.Mock).mockRejectedValue(error)

    await expect(productService.getAll()).rejects.toThrow('Server error')
  })
})
```

---

## 🎯 Mejores Prácticas

### 1. Usar Constantes para Endpoints

```typescript
// ❌ Mal
const user = await apiClient.get('/api/users/me/')

// ✅ Bien
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints'
const user = await apiClient.get(API_ENDPOINTS.USERS.ME)
```

### 2. Tipar las Respuestas

```typescript
// ❌ Mal
const data = await apiClient.get('/api/users/')

// ✅ Bien
const users = await apiClient.get<User[]>('/api/users/')
```

### 3. Manejar Errores Apropiadamente

```typescript
// ❌ Mal
try {
  const data = await apiClient.get('/api/data/')
} catch (error) {
  console.log(error)
}

// ✅ Bien
try {
  const data = await apiClient.get('/api/data/')
} catch (error) {
  if (error instanceof ValidationError) {
    showFieldErrors(error.details)
  } else if (error instanceof ApiError) {
    showErrorToast(error.message)
  } else {
    showErrorToast('Error inesperado')
  }
}
```

### 4. Usar skipAuth cuando sea Necesario

```typescript
// ❌ Mal - Login sin skipAuth puede causar loops
const tokens = await apiClient.post('/api/auth/login/', credentials)

// ✅ Bien
const tokens = await apiClient.post('/api/auth/login/', credentials, {
  skipAuth: true
})
```

---

## 📚 Recursos Adicionales

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura completa del proyecto
- [Código fuente del cliente](../src/lib/api/client.ts)
- [Código fuente de interceptors](../src/lib/api/interceptors.ts)
- [Ejemplos de servicios](../src/lib/services/)

---

**Mantenido por**: Equipo de Desarrollo KOI
**Última revisión**: 2025-10-30
