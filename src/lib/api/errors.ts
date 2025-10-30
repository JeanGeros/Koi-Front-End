/**
 * Custom error classes para manejo de errores de API
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class NetworkError extends Error {
  constructor(message = "Error de conexión con el servidor") {
    super(message)
    this.name = "NetworkError"
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "No autorizado") {
    super(401, message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Acceso denegado") {
    super(403, message)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Recurso no encontrado") {
    super(404, message)
    this.name = "NotFoundError"
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Error de validación", details?: unknown) {
    super(422, message, details)
    this.name = "ValidationError"
  }
}

export class ServerError extends ApiError {
  constructor(message = "Error interno del servidor") {
    super(500, message)
    this.name = "ServerError"
  }
}

/**
 * Convierte un error genérico en un ApiError específico
 */
export function parseApiError(error: unknown): Error {
  // Si ya es un error personalizado, retornarlo
  if (error instanceof ApiError) {
    return error
  }

  // Si es un error de red
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new NetworkError()
  }

  // Si es un objeto con información de respuesta
  if (typeof error === "object" && error !== null) {
    const err = error as {
      status?: number
      message?: string
      detail?: string
      details?: unknown
    }

    const status = err.status || 500
    const message = err.detail || err.message || "Error desconocido"
    const details = err.details

    switch (status) {
      case 401:
        return new UnauthorizedError(message)
      case 403:
        return new ForbiddenError(message)
      case 404:
        return new NotFoundError(message)
      case 422:
        return new ValidationError(message, details)
      case 500:
      case 502:
      case 503:
        return new ServerError(message)
      default:
        return new ApiError(status, message, details)
    }
  }

  // Error genérico
  return new Error("Error desconocido")
}
