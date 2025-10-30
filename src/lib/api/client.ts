/**
 * Cliente HTTP con soporte para interceptors y refresh automático de tokens
 */

import { config } from "../constants/config"
import { ApiError, NetworkError, parseApiError } from "./errors"

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  skipAuth?: boolean // Permite skip del header de autorización
}

type RequestInterceptor = (options: RequestOptions) => RequestOptions | Promise<RequestOptions>
type ResponseInterceptor = (response: Response) => Response | Promise<Response>
type ErrorInterceptor = (error: Error) => Error | Promise<Error>

class HttpClient {
  private baseUrl: string
  private timeout: number
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  // Flag para prevenir loops infinitos en refresh
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  /**
   * Agrega un interceptor de request
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Agrega un interceptor de response
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Agrega un interceptor de error
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  /**
   * Suscribe un callback para cuando el token se refresque
   */
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback)
  }

  /**
   * Notifica a todos los suscriptores que el token fue refrescado
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
  }

  /**
   * Marca que el refresh falló
   */
  private onRefreshFailed(): void {
    this.refreshSubscribers = []
  }

  /**
   * Ejecuta interceptors de request
   */
  private async runRequestInterceptors(
    options: RequestOptions
  ): Promise<RequestOptions> {
    let modifiedOptions = options
    for (const interceptor of this.requestInterceptors) {
      modifiedOptions = await interceptor(modifiedOptions)
    }
    return modifiedOptions
  }

  /**
   * Ejecuta interceptors de response
   */
  private async runResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse)
    }
    return modifiedResponse
  }

  /**
   * Ejecuta interceptors de error
   */
  private async runErrorInterceptors(error: Error): Promise<Error> {
    let modifiedError = error
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError)
    }
    return modifiedError
  }

  /**
   * Realiza una petición HTTP
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    try {
      // Ejecutar interceptors de request
      const modifiedOptions = await this.runRequestInterceptors(options)

      // Construir URL completa
      const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`

      const headers = new Headers(modifiedOptions.headers)
      if (!(modifiedOptions.body instanceof FormData)) {
        headers.set("Content-Type", "application/json")
        headers.set("Accept", "application/json")
      }

      // Configurar timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      try {
        // Realizar petición
        const response = await fetch(url, {
          ...modifiedOptions,
          headers,
          body:
            modifiedOptions.body instanceof FormData
              ? modifiedOptions.body
              : modifiedOptions.body !== undefined
              ? JSON.stringify(modifiedOptions.body)
              : undefined,
          signal: controller.signal,
          cache: "no-store",
        })

        clearTimeout(timeoutId)
        // Ejecutar interceptors de response
        const modifiedResponse = await this.runResponseInterceptors(response)
        // Parsear respuesta
        const contentType = modifiedResponse.headers.get("content-type")
        const isJson = contentType?.includes("application/json")
        const data = isJson
          ? await modifiedResponse.json().catch(() => undefined)
          : undefined

        // Verificar si la respuesta es exitosa
        if (!modifiedResponse.ok) {
          const error = new ApiError(
            modifiedResponse.status,
            (data as any)?.detail ||
              (data as any)?.message ||
              modifiedResponse.statusText,
            data
          )
          throw error
        }

        return data as T
      } catch (error) {
        clearTimeout(timeoutId)

        // Si es un abort por timeout
        if (error instanceof Error && error.name === "AbortError") {
          throw new NetworkError("La petición excedió el tiempo de espera")
        }

        throw error
      }
    } catch (error) {
      // Parsear y ejecutar interceptors de error
      const parsedError = parseApiError(error)
      const finalError = await this.runErrorInterceptors(parsedError)
      throw finalError
    }
  }

  /**
   * Métodos de conveniencia
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" })
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body })
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body })
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body })
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" })
  }

  // Getters para refresh token logic
  getIsRefreshing(): boolean {
    return this.isRefreshing
  }

  setIsRefreshing(value: boolean): void {
    this.isRefreshing = value
  }

  getRefreshSubscribers(): Array<(token: string) => void> {
    return this.refreshSubscribers
  }

  notifyRefreshSuccess(token: string): void {
    this.onTokenRefreshed(token)
  }

  notifyRefreshFailed(): void {
    this.onRefreshFailed()
  }

  addRefreshSubscriber(callback: (token: string) => void): void {
    this.subscribeTokenRefresh(callback)
  }
}

/**
 * Instancia global del cliente HTTP
 */
export const apiClient = new HttpClient(config.api.baseUrl, config.api.timeout)

/**
 * Tipo exportado para opciones de request
 */
export type { RequestOptions }
