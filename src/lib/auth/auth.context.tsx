"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { authService } from "./auth.service"
import { authStorage } from "./auth.storage"
import type { AuthContextType, LoginPayload, User } from "../types/auth.types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Carga el usuario desde el token almacenado
   * Se ejecuta al montar el componente
   */
  const loadUser = useCallback(async () => {
    const hasTokens = authStorage.hasTokens()
    if (!hasTokens) {
      setIsLoading(false)
      return
    }

    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      // Si falla, limpiar tokens (probablemente expirados o inválidos)
      authStorage.clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar usuario al montar
  useEffect(() => {
    loadUser()
  }, [loadUser])

  /**
   * Inicia sesión del usuario
   * Después de autenticarse, obtiene los datos del usuario desde /api/me
   */
  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true)
    try {
      // 1. Hacer login (guarda tokens)
      await authService.login(payload)
      // 2. Obtener datos del usuario desde /api/me
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Cierra la sesión del usuario
   */
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  /**
   * Refresca la información del usuario
   * Útil después de actualizar el perfil
   */
  const refreshUser = useCallback(async () => {
    if (!authStorage.hasTokens()) {
      setUser(null)
      return
    }

    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error("Error al refrescar usuario:", error)
      authStorage.clearTokens()
      setUser(null)
      throw error
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para usar el contexto de autenticación
 * @throws Error si se usa fuera del AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }

  return context
}
