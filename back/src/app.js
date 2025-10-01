// import express from 'express'
// import cors from 'cors'
// import morgan from 'morgan'
// import authRoutes from './routes/auth.routes.js'
// import branches from './routes/branches.routes.js'
// import vehicles from './routes/vehicles.routes.js'
// import persons from './routes/persons.routes.js'
// import users from './routes/users.routes.js'
// import tickets from './routes/tickets.routes.js'

// const app = express()

// // CORS con credenciales: front http://localhost:5173
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true
// }))

// app.use(morgan('dev'))
// app.use(express.json())

// const API_PREFIX = '/api/v1'
// app.use(`${API_PREFIX}/auth`, authRoutes)
// app.use(`${API_PREFIX}/branches`, branches)
// app.use(`${API_PREFIX}/vehicles`, vehicles)
// app.use(`${API_PREFIX}/persons`, persons)
// app.use(`${API_PREFIX}/users`, users)
// app.use(`${API_PREFIX}/tickets`, tickets)

// // Opcional: health
// app.get('/api/health', (req,res)=>res.json({ok:true, name:'FleetCore Suite API'}))

// export default app

// back/src/app.js
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import apiV1 from './routes/index.js'        // << agregador de rutas por modelo
import authRoutes from './routes/auth.routes.js' // << auth local + Microsoft (que te pasé)

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // necesario para cookies/sesión
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

const API_PREFIX = '/api/v1'

app.use(`${API_PREFIX}/auth`, authRoutes) // /api/v1/auth/*
app.use(`${API_PREFIX}`, apiV1)           // /api/v1/<todas las entidades de index.js>

app.get('/api/health', (req,res)=>res.json({ ok:true, name:'FleetCore Suite API' }))

export default app
