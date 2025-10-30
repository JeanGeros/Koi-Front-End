/**
 * Exportaciones principales del módulo API
 */

// Asegurarse de que los interceptors se configuren
import "./interceptors"

export { apiClient } from "./client"
export type { RequestOptions } from "./client"

export * from "./errors"

/**
 * Función legacy de compatibilidad con el código existente
 * @deprecated Usar apiClient directamente
 */
export async function apiFetch<T>(
  path: string,
  options?: {
    method?: string
    body?: unknown
    headers?: HeadersInit
  }
): Promise<T> {
  const { apiClient } = await import("./client")

  return apiClient.request<T>(path, {
    method: options?.method || "GET",
    body: options?.body,
    headers: options?.headers,
  })
}
