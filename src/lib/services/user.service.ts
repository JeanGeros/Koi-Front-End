/**
 * Servicio para operaciones de usuarios
 *
 * ⚠️ SERVICIO DE EJEMPLO - Actualmente no utilizado
 * Este archivo sirve como ejemplo de CRUD completo usando el cliente API.
 * Ver documentación en: prompts/API_CLIENT_GUIDE.md
 *
 * Para usar este servicio:
 * 1. Asegúrate de que el backend tenga los endpoints correspondientes
 * 2. Importa: `import { userService } from '@/lib/services'`
 * 3. Usa en hooks o componentes
 */

import { apiClient } from "../api"
import { API_ENDPOINTS } from "../constants/api-endpoints"
import type { User } from "../types/auth.types"

// Tipos adicionales (moverlos a types/ en producción)
export type UpdateUserDto = {
  firstName?: string
  lastName?: string
  email?: string
}

/**
 * Servicio de usuarios
 */
export const userService = {
  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.USERS.ME)
  },

  /**
   * Actualiza el perfil del usuario actual
   */
  updateProfile: async (data: UpdateUserDto): Promise<User> => {
    return apiClient.patch<User>(API_ENDPOINTS.USERS.ME, data)
  },

  /**
   * Obtiene todos los usuarios (ejemplo con paginación)
   */
  getUsers: async (params?: {
    page?: number
    limit?: number
  }): Promise<{ users: User[]; total: number }> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const query = queryParams.toString()
    const url = `${API_ENDPOINTS.USERS.LIST}${query ? `?${query}` : ""}`

    return apiClient.get(url)
  },

  /**
   * Obtiene un usuario por ID
   */
  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id))
  },
}
