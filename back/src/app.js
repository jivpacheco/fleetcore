// back/src/app.js
//
// App Express principal para FleetCore Suite (API)
// - Configura CORS con credenciales (cookies + Authorization)
// - Parsers (JSON), cookies httpOnly
// - Logger minimalista por request (request-id + timing)
// - Monta rutas de autenticación y API v1
// - Endpoint /api/health
// - 404 (notFound) y manejador global de errores (errorHandler)
//
// Requiere .env con al menos:
//   CLIENT_URL=http://localhost:5173
//   JWT_SECRET=change_me
//
// Nota: CORS debe ir ANTES de montar rutas, y el error handler SIEMPRE al final.

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


import { requestLogger } from './middleware/requestLogger.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import apiV1 from './routes/index.js'          // agregador de entidades (users, branches, etc.)
import authRoutes from './routes/auth.routes.js' // autenticación local + Microsoft
// import dashboardRoutes from './routes/dashboard.routes.js'

const app = express()

// === Configuración base ===
const ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173'
const API_PREFIX = '/api/v1'

// 1) CORS (antes de las rutas)
//    - origin: debe ser el origin exacto del front (no usar '*')
//    - credentials: true para habilitar cookies httpOnly y Authorization en el browser
app.use(cors({
  origin: ORIGIN,
  credentials: true,
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// 2) Parsers y cookies
app.use(express.json())     // JSON body parser
app.use(cookieParser())     // lee/escribe cookies (ej. fc_token, fc_pkce)

// 3) Logger por request (id + tiempo de respuesta)
app.use(requestLogger)

// === Rutas ===

// Auth (login local + Microsoft OIDC)
// Queda montado en /api/v1/auth/*
app.use(`${API_PREFIX}/auth`, authRoutes)

// app.use(`${API_PREFIX}/dashboard`, dashboardRoutes)



// API REST principal (/api/v1/<entidades>)
// En routes/index.js montas users, branches, vehicles, etc.
app.use(`${API_PREFIX}`, apiV1)

// Health-check simple para monitoreo
app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'FleetCore Suite API' })
})

// === Manejo de errores ===

// 404 para rutas no encontradas (debe ir DESPUÉS de montar rutas)
app.use(notFound)

// Manejador global de errores (SIEMPRE el último)
app.use(errorHandler)

export default app
