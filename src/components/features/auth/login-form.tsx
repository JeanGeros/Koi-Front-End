"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth.context"
import { loginSchema } from "@/lib/schemas/auth.schema"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { LoginFormData } from "@/lib/types/auth.types"

type LoginFormProps = React.ComponentProps<"div">

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter()
  const { login } = useAuth()

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData | "general", string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    // Validar formulario con Zod
    const result = loginSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData
        if (field) {
          fieldErrors[field] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)

    try {
      await login(result.data)
      router.push("/dashboard")
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? (err as { message?: string }).message || null
          : null
      setErrors({ general: message || "Error de autenticación" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenido de nuevo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Usuario</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="tu_usuario"
                  required
                  value={formData.username}
                  onChange={handleChange("username")}
                  disabled={isSubmitting}
                />
                {errors.username && <FieldError>{errors.username}</FieldError>}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  {/* <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange("password")}
                  disabled={isSubmitting}
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                </Button>
                {errors.general && (
                  <FieldError className="mt-2">{errors.general}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
