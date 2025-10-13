// back/src/routes/vehicles.routes.js
// Rutas de Vehículos (CRUD + transfer + media). Permisos manteniendo tu modelo.

import { Router } from 'express'
import { uploadSingle } from '../middleware/upload.middleware.js'
import * as ctrl from '../controllers/vehicles.controller.js'
import { requirePermission } from '../middleware/requirePermission.js'

const r = Router()

// CRUD básico
r.get('/', requirePermission('vehicles:read'), ctrl.list)
r.post('/', requirePermission('vehicles:create'), ctrl.create)
r.get('/:id', requirePermission('vehicles:read'), ctrl.getOne)
r.patch('/:id', requirePermission('vehicles:update'), ctrl.update)
r.delete('/:id', requirePermission('vehicles:delete'), ctrl.remove)

// Transferencia / asignación (incluye APOYO con "R")
r.post('/:id/transfer', requirePermission('vehicles:transfer'), ctrl.transfer)

// Media (fotos / documentos / videos) — con category/title
r.post('/:id/photos',
  requirePermission('vehicles:media'),
  uploadSingle,
  ctrl.addVehiclePhoto
)

r.delete('/:id/photos/:photoId',
  requirePermission('vehicles:media'),
  ctrl.deleteVehiclePhoto
)

r.post('/:id/documents',
  requirePermission('vehicles:media'),
  uploadSingle,
  ctrl.addVehicleDocument
)

r.delete('/:id/documents/:documentId',
  requirePermission('vehicles:media'),
  ctrl.deleteVehicleDocument
)

export default r
