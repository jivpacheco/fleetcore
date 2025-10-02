// back/src/middleware/errorHandler.js
//
// Middlewares de manejo de errores y 404
// - notFound: para rutas inexistentes
// - errorHandler: captura errores y responde JSON consistente
//
// Mapea errores comunes (Mongoose ValidationError, CastError, duplicate key 11000,
// JWT, openid-client, etc.). En producción no expone stack.

const isProd = process.env.NODE_ENV === 'production'

/**
 * 404 para rutas no encontradas (debe ir antes de errorHandler)
 */
export function notFound(req, res, next) {
    res.status(404).json({
        message: 'Recurso no encontrado',
        path: req.originalUrl || req.url,
    })
}

/**
 * Normaliza/convierte diferentes tipos de error a { status, message, details? }
 */
function normalizeError(err) {
    // Defaults
    let status = err.status || 500
    let message = err.message || 'Error interno del servidor'
    let details

    // Mongoose: validación de esquema
    if (err.name === 'ValidationError') {
        status = 400
        message = 'Datos inválidos'
        details = Object.values(err.errors || {}).map(e => e.message)
    }

    // Mongoose: ObjectId inválido
    if (err.name === 'CastError') {
        status = 400
        message = `Formato inválido para el campo ${err.path}`
    }

    // Mongo duplicate key (índice único)
    if (err.code === 11000) {
        status = 409
        const fields = Object.keys(err.keyPattern || err.keyValue || {})
        message = `Registro duplicado${fields.length ? ` en ${fields.join(', ')}` : ''}`
    }

    // JWT
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        status = 401
        message = 'Token inválido o expirado'
    }

    // openid-client (OPError)
    if (err.name === 'OPError') {
        status = 401
        message = err.error_description || err.error || 'Error de OpenID Provider'
        details = { code: err.error, description: err.error_description }
    }

    // Si el error ya trae status/mensaje más específico
    if (err.status && err.status < status) status = err.status
    if (err.expose && err.message) message = err.message

    return { status, message, details }
}

/**
 * Manejador central de errores (último middleware)
 * - No expone stack en producción
 * - Incluye un requestId si lo setea requestLogger
 */
export function errorHandler(err, req, res, next) {
    const { status, message, details } = normalizeError(err)

    // Log limpio en servidor
    const rid = req.id ? `[req:${req.id}] ` : ''
    console.error(`${rid}ERROR ${status}: ${message}`)
    if (!isProd && err.stack) {
        console.error(err.stack)
    }

    const payload = { message }
    if (details) payload.details = details
    if (!isProd) payload._debug = { name: err.name }

    res.status(status).json(payload)
}
