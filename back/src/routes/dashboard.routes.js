import { Router } from 'express'
import { requireAuth } from '../middlewares/requireAuth.js' // ajusta la ruta si difiere
import { getKpis, getAlerts } from '../controllers/dashboard.controller.js'

const router = Router()

// todo el dashboard detrás de auth
router.get('/kpis', requireAuth, getKpis)
router.get('/alerts', requireAuth, getAlerts)

export default router
