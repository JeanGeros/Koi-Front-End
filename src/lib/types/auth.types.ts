// Re-export types from schemas
export type {
  LoginFormData,
  TokenPair,
  LoginResponse,
  User,
  RefreshTokenRequest,
} from "../schemas/auth.schema"

// Import User for internal use
import type { User } from "../schemas/auth.schema"

// Tipos adicionales para auth
export type LoginPayload = {
  username: string
  password: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type AuthContextType = AuthState & {
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}
