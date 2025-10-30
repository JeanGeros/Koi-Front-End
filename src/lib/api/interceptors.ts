/**
 * Interceptors para el cliente HTTP
 * Maneja autenticación automática y refresh de tokens
 */

import { apiClient, type RequestOptions } from "./client"
import { authStorage } from "../auth/auth.storage"
import { API_ENDPOINTS } from "../constants/api-endpoints"
import { UnauthorizedError } from "./errors"
import type { TokenPair } from "../types/auth.types"
import { tokenPairSchema } from "../schemas/auth.schema"

/**
 * Request Interceptor: Agrega el token de autenticación a las peticiones
 */
function authRequestInterceptor(options: RequestOptions): RequestOptions {
  // Skip si la opción skipAuth está activa
  if (options.skipAuth) {
    return options
  }

  // Obtener token de acceso
  const accessToken = authStorage.getAccessToken()

  if (accessToken) {
    // Clonar headers y agregar Authorization
    const headers = new Headers(options.headers)
    headers.set("Authorization", `Bearer ${accessToken}`)

    return {
      ...options,
      headers,
    }
  }

  return options
}

/**
 * Response Interceptor: Maneja errores 401 y refresca el token automáticamente
 */
async function authResponseInterceptor(response: Response): Promise<Response> {
  // Si la respuesta es exitosa, retornarla
  if (response.ok) {
    return response
  }

  // Si es 401 Unauthorized, intentar refrescar el token
  if (response.status === 401) {
    const originalRequest = response.url
    const refreshToken = authStorage.getRefreshToken()

    // Si no hay refresh token, no podemos hacer nada
    if (!refreshToken) {
      // Limpiar tokens y lanzar error
      authStorage.clearTokens()
      throw new UnauthorizedError("Sesión expirada")
    }

    // Verificar si ya estamos refrescando
    if (apiClient.getIsRefreshing()) {
      // Esperar a que termine el refresh en curso
      return new Promise((resolve, reject) => {
        apiClient.addRefreshSubscriber((newToken: string) => {
          // Reintentar la petición original con el nuevo token
          const headers = new Headers(response.headers)
          headers.set("Authorization", `Bearer ${newToken}`)

          fetch(originalRequest, {
            headers,
            method: "GET", // Asumimos GET, en producción necesitarías guardar el método original
          })
            .then(resolve)
            .catch(reject)
        })
      })
    }

    // Marcar que estamos refrescando
    apiClient.setIsRefreshing(true)

    try {
      // Intentar refrescar el token
      const refreshResponse = await fetch(
        `${apiClient["baseUrl"]}${API_ENDPOINTS.AUTH.REFRESH}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      )

      if (!refreshResponse.ok) {
        throw new UnauthorizedError("No se pudo refrescar el token")
      }

      const data = await refreshResponse.json()
      const tokens = tokenPairSchema.parse(data) as TokenPair

      // Guardar nuevo access token
      authStorage.saveAccessToken(tokens.access)

      // Notificar a las peticiones en espera
      apiClient.notifyRefreshSuccess(tokens.access)

      // Reintentar la petición original
      const headers = new Headers(response.headers)
      headers.set("Authorization", `Bearer ${tokens.access}`)

      const retryResponse = await fetch(originalRequest, {
        headers,
        method: "GET", // Asumimos GET
      })

      return retryResponse
    } catch (error) {
      // Si el refresh falla, limpiar tokens y notificar
      apiClient.notifyRefreshFailed()
      authStorage.clearTokens()

      // Redirigir a login (solo en browser)
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }

      throw error
    } finally {
      apiClient.setIsRefreshing(false)
    }
  }

  return response
}

/**
 * Error Interceptor: Maneja errores de forma centralizada
 */
async function errorInterceptor(error: Error): Promise<Error> {
  // Log de errores (en producción enviar a servicio de logging)
  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]:", error)
  }

  // Si es UnauthorizedError y estamos en browser, redirigir
  if (error instanceof UnauthorizedError && typeof window !== "undefined") {
    // Solo redirigir si no estamos ya en login
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login"
    }
  }

  return error
}

/**
 * Configura todos los interceptors en el cliente
 */
export function setupInterceptors(): void {
  apiClient.addRequestInterceptor(authRequestInterceptor)
  apiClient.addResponseInterceptor(authResponseInterceptor)
  apiClient.addErrorInterceptor(errorInterceptor)
}

// Configurar interceptors automáticamente al importar
setupInterceptors()
