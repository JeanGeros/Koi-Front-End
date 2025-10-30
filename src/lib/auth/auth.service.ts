import { apiClient } from "../api"
import { authStorage } from "./auth.storage"
import { loginResponseSchema, tokenPairSchema, userSchema } from "../schemas/auth.schema"
import { API_ENDPOINTS } from "../constants/api-endpoints"
import type { LoginPayload, TokenPair, User, LoginResponse } from "../types/auth.types"

/**
 * Servicio de autenticación
 * Maneja todas las operaciones relacionadas con auth
 */
export const authService = {
  /**
   * Inicia sesión con username y password
   * Guarda los tokens automáticamente en storage
   * Retorna tokens y usuario (si el backend lo provee)
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const data = await apiClient.post<unknown>(API_ENDPOINTS.AUTH.LOGIN, payload, {
      skipAuth: true, // Login no requiere autenticación previa
    })

    // Validar respuesta con Zod (acepta usuario opcional)
    const response = loginResponseSchema.parse(data)

    // Guardar tokens en storage
    authStorage.saveTokens({ access: response.access, refresh: response.refresh })

    return response
  },

  /**
   * Cierra la sesión del usuario
   * Limpia los tokens del storage
   */
  logout: async (): Promise<void> => {
    try {
      // Intentar notificar al backend (opcional)
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {
        // Ignorar errores del backend en logout
      })
    } finally {
      // Siempre limpiar tokens locales
      authStorage.clearTokens()
    }
  },

  /**
   * Obtiene la información del usuario autenticado actual
   */
  getCurrentUser: async (): Promise<User> => {
    const data = await apiClient.get<unknown>(API_ENDPOINTS.AUTH.ME)
    // Validar respuesta con Zod
    const user = userSchema.parse(data)
    return user
  },

  /**
   * Refresca el access token usando el refresh token
   */
  refreshToken: async (refreshToken: string): Promise<TokenPair> => {
    const data = await apiClient.post<unknown>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh: refreshToken },
      { skipAuth: true } // El refresh se hace sin el token actual
    )

    // Validar respuesta con Zod
    const tokens = tokenPairSchema.parse(data)

    // Guardar nuevo access token
    authStorage.saveAccessToken(tokens.access)

    return tokens
  },

  /**
   * Verifica si el usuario tiene tokens válidos
   */
  hasValidTokens: (): boolean => {
    return authStorage.hasTokens()
  },
}
