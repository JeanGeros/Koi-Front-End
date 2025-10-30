import { z } from "zod"

// Schema para el formulario de login
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50, "El usuario no puede tener más de 50 caracteres"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede tener más de 100 caracteres"),
})

// Schema para el par de tokens que retorna el backend
export const tokenPairSchema = z.object({
  access: z.string(),
  refresh: z.string(),
})

// Schema para la respuesta de login (puede incluir usuario opcionalmente)
export const loginResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }).optional(), // Usuario es opcional
})

// Schema para el usuario autenticado
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

// Schema para refresh token request
export const refreshTokenSchema = z.object({
  refresh: z.string(),
})

// Exportar tipos inferidos desde los schemas
export type LoginFormData = z.infer<typeof loginSchema>
export type TokenPair = z.infer<typeof tokenPairSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type User = z.infer<typeof userSchema>
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>
