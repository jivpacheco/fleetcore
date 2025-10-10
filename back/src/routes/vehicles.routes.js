// // back/src/routes/vehicles.routes.js
// // -----------------------------------------------------------------------------
// // Rutas de Vehículos (CRUD + transfer + media).
// // Se usa requirePermission para tener un modelo consistente de permisos.
// // -----------------------------------------------------------------------------
// import { Router } from 'express'
// import { uploadSingle } from '../middleware/upload.middleware.js'
// import * as ctrl from '../controllers/vehicles.controller.js'
// import { requirePermission } from '../middleware/requirePermission.js'

// const r = Router()

// // CRUD básico
// r.get('/', requirePermission('vehicles:read'), ctrl.list)
// r.post('/', requirePermission('vehicles:create'), ctrl.create)
// r.get('/:id', requirePermission('vehicles:read'), ctrl.getOne)
// r.patch('/:id', requirePermission('vehicles:update'), ctrl.update)
// r.delete('/:id', requirePermission('vehicles:delete'), ctrl.remove)

// // Transferencia / asignación
// r.post('/:id/transfer', requirePermission('vehicles:transfer'), ctrl.transfer)

// // Media (fotos / documentos / videos)
// r.post('/:id/photos',
//     requirePermission('vehicles:media'),
//     uploadSingle,
//     ctrl.addVehiclePhoto
// )

// r.delete('/:id/photos/:photoId',
//     requirePermission('vehicles:media'),
//     ctrl.deleteVehiclePhoto
// )

// r.post('/:id/documents',
//     requirePermission('vehicles:media'),
//     uploadSingle,
//     ctrl.addVehicleDocument
// )

// r.delete('/:id/documents/:documentId',
//     requirePermission('vehicles:media'),
//     ctrl.deleteVehicleDocument
// )

// export default r

// back/src/routes/vehicles.routes.js
// -----------------------------------------------------------------------------
// Rutas de Vehículos (CRUD + transfer + media).
// Se usa requirePermission para tener un modelo consistente de permisos.
// -----------------------------------------------------------------------------
import { Router } from 'express'
import { uploadSingle } from '../middleware/upload.middleware.js'
import * as ctrl from '../controllers/vehicles.controller.js'
import { requirePermission } from '../middleware/requirePermission.js'
import { validateObjectId } from '../utils/validateObjectId.js'

const r = Router()

// CRUD básico
r.get('/',  requirePermission('vehicles:read'),   ctrl.list)
r.post('/', requirePermission('vehicles:create'), ctrl.create)
r.get('/:id',
  validateObjectId('id'),
  requirePermission('vehicles:read'),
  ctrl.getOne
)
r.patch('/:id',
  validateObjectId('id'),
  requirePermission('vehicles:update'),
  ctrl.update
)
r.delete('/:id',
  validateObjectId('id'),
  requirePermission('vehicles:delete'),
  ctrl.remove
)

// Transferencia / asignación
r.post('/:id/transfer',
  validateObjectId('id'),
  requirePermission('vehicles:transfer'),
  ctrl.transfer
)

// Media (fotos / documentos / videos)
r.post('/:id/photos',
  validateObjectId('id'),
  requirePermission('vehicles:media'),
  uploadSingle,
  ctrl.addVehiclePhoto
)

r.delete('/:id/photos/:photoId',
  validateObjectId('id'),
  validateObjectId('photoId'),
  requirePermission('vehicles:media'),
  ctrl.deleteVehiclePhoto
)

r.post('/:id/documents',
  validateObjectId('id'),
  requirePermission('vehicles:media'),
  uploadSingle,
  ctrl.addVehicleDocument
)

r.delete('/:id/documents/:documentId',
  validateObjectId('id'),
  validateObjectId('documentId'),
  requirePermission('vehicles:media'),
  ctrl.deleteVehicleDocument
)

export default r
