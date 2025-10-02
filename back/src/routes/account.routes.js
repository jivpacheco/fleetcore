// back/src/routes/account.routes.js
//
// Rutas de la cuenta del usuario autenticado
// Protegidas con requireAuth

import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { AccountController as C } from '../controllers/account.controller.js'

const r = Router()

r.get('/me', requireAuth, C.me)
r.put('/password', requireAuth, C.password)

export default r
