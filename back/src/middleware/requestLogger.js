// back/src/middleware/requestLogger.js
//
// Logger simple y limpio por request
// - Asigna req.id (usa X-Request-Id o genera UUID)
// - Loguea método, ruta, status y duración
//
// Útil para complementar (o reemplazar) morgan.

import { randomUUID } from 'node:crypto'

export function requestLogger(req, res, next) {
    const start = Date.now()
    const id = req.headers['x-request-id'] || randomUUID()

    req.id = String(id)
    res.setHeader('X-Request-Id', req.id)

    res.on('finish', () => {
        const ms = Date.now() - start
        // Log compacto: [req:ID] METODO /ruta → 200 12ms
        console.log(`[req:${req.id}] ${req.method} ${req.originalUrl} → ${res.statusCode} ${ms}ms`)
    })

    next()
}
