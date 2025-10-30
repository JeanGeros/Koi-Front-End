import type { TokenPair } from "../types/auth.types"

const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"

/**
 * Verifica si estamos en el entorno del navegador
 */
function isBrowser(): boolean {
  return typeof window !== "undefined"
}

/**
 * Storage para manejar tokens de autenticación
 * Usa localStorage por ahora, pero está preparado para migrar a cookies httpOnly
 */
export const authStorage = {
  /**
   * Guarda el par de tokens en localStorage
   */
  saveTokens(tokens: TokenPair): void {
    if (!isBrowser()) return

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
    } catch (error) {
      console.error("Error al guardar tokens:", error)
    }
  },

  /**
   * Guarda solo el access token (útil para refresh)
   */
  saveAccessToken(token: string): void {
    if (!isBrowser()) return

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } catch (error) {
      console.error("Error al guardar access token:", error)
    }
  },

  /**
   * Obtiene el access token
   */
  getAccessToken(): string | null {
    if (!isBrowser()) return null

    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY)
    } catch (error) {
      console.error("Error al obtener access token:", error)
      return null
    }
  },

  /**
   * Obtiene el refresh token
   */
  getRefreshToken(): string | null {
    if (!isBrowser()) return null

    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error("Error al obtener refresh token:", error)
      return null
    }
  },

  /**
   * Obtiene ambos tokens
   */
  getTokens(): TokenPair | null {
    const access = this.getAccessToken()
    const refresh = this.getRefreshToken()

    if (!access || !refresh) return null

    return { access, refresh }
  },

  /**
   * Limpia todos los tokens del storage
   */
  clearTokens(): void {
    if (!isBrowser()) return

    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error("Error al limpiar tokens:", error)
    }
  },

  /**
   * Verifica si existen tokens guardados
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken())
  },
}
