// back/src/app.js
// -----------------------------------------------------------------------------
// App Express principal (API)
// - CORS con credenciales (para cookies httpOnly y Authorization)
// - Parsers y cookies
// - (Opcional) Logger por request y manejadores de error si existen
// - Monta /api/v1/auth y /api/v1/*
// -----------------------------------------------------------------------------
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Si ya los tienes en tu proyecto, mantenlos. Si no, puedes comentarlos.
import { requestLogger } from './middleware/requestLogger.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import apiV1 from './routes/index.js'  // agregador de entidades (users, branches, etc.)
import authRoutes from './routes/auth.routes.js' // autenticación local + Microsoft
import catalogsRoutes from './routes/catalogs.routes.js'
// import dashboardRoutes from './routes/dashboard.routes.js'

const app = express()

const ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173'
const API_PREFIX = '/api/v1'

// 1) CORS ANTES de montar rutas
app.use(cors({
  origin: ORIGIN,                 // el origin exacto del front
  credentials: true,              // ← importante para cookies
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// 2) Parsers y cookies
app.use(express.json()) // JSON body parser
app.use(cookieParser()) // lee/escribe cookies (ej. fc_token, fc_pkce)


// 3) (Opcional) Logger por request
if (requestLogger) app.use(requestLogger)
// app.use(requestLogger)

// 4) Rutas
app.use(`${API_PREFIX}/auth`, authRoutes)  // /api/v1/auth/*
app.use(`${API_PREFIX}`, apiV1)            // /api/v1/<resto>
app.use(`${API_PREFIX}/catalogs`, catalogsRoutes)  

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'FleetCore Suite API' })
})

// 5) (Opcional) 404 + error handler global
if (notFound) app.use(notFound)
if (errorHandler) app.use(errorHandler)

export default app

