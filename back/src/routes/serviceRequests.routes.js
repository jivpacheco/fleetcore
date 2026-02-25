import express from 'express'
import * as C from '../controllers/serviceRequests.controller.js'

const router = express.Router()

router.get('/', C.list)
router.get('/:id', C.get)
router.post('/', C.create)
router.put('/:id', C.update)
router.delete('/:id', C.remove)

// Acción PRO: convertir a OT (requiere Triage APPROVED)
router.post('/:id/convert-to-workorder', C.convertToWorkOrder)

export default router