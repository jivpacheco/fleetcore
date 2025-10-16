// // back/src/routes/vehicles.routes.js
// // -----------------------------------------------------------------------------
// // Rutas de Vehículos (CRUD + transfer + media).
// // -----------------------------------------------------------------------------
// import { Router } from 'express';
// import { uploadSingle } from '../middleware/upload.middleware.js';
// import * as ctrl from '../controllers/vehicles.controller.js';
// import { requirePermission } from '../middleware/requirePermission.js';

// const r = Router();

// // CRUD
// r.get('/',    requirePermission('vehicles:read'),   ctrl.list);
// r.post('/',   requirePermission('vehicles:create'), ctrl.create);
// r.get('/:id', requirePermission('vehicles:read'),   ctrl.getOne);
// r.patch('/:id', requirePermission('vehicles:update'), ctrl.update);
// r.delete('/:id', requirePermission('vehicles:delete'), ctrl.remove);

// // Transfer
// r.post('/:id/transfer', requirePermission('vehicles:transfer'), ctrl.transfer);

// // Media
// r.post('/:id/photos',
//   requirePermission('vehicles:media'),
//   uploadSingle,
//   ctrl.addVehiclePhoto
// );
// r.delete('/:id/photos/:photoId',
//   requirePermission('vehicles:media'),
//   ctrl.deleteVehiclePhoto
// );

// r.post('/:id/documents',
//   requirePermission('vehicles:media'),
//   uploadSingle,
//   ctrl.addVehicleDocument
// );
// r.delete('/:id/documents/:documentId',
//   requirePermission('vehicles:media'),
//   ctrl.deleteVehicleDocument
// );

// export default r;


// back/src/routes/vehicles.routes.js
// -----------------------------------------------------------------------------
// Rutas dedicadas a Vehículos
// - CRUD (GET/POST/PATCH/DELETE) gestionado por vehicles.controller.js
// - Endpoints específicos para subir/eliminar fotos y documentos
// - Protegidas por requireAuth + requirePermission
// -----------------------------------------------------------------------------

import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requirePermission } from '../middleware/requirePermission.js';
import upload from '../middleware/upload.middleware.js';
import * as ctrl from '../controllers/vehicles.controller.js';

const router = express.Router();

// 📌 Listar vehículos (con populate sucursal)
router.get('/', requireAuth, requirePermission('vehicles.view'), ctrl.list);

// 📌 Obtener uno
router.get('/:id', requireAuth, requirePermission('vehicles.view'), ctrl.getOne);

// 📌 Crear nuevo
router.post('/', requireAuth, requirePermission('vehicles.create'), ctrl.create);

// 📌 Actualizar
router.patch('/:id', requireAuth, requirePermission('vehicles.update'), ctrl.update);

// 📌 Eliminar
router.delete('/:id', requireAuth, requirePermission('vehicles.delete'), ctrl.remove);

// 📌 Transferir (cambio de sucursal / reemplazo)
router.post('/:id/transfer', requireAuth, requirePermission('vehicles.transfer'), ctrl.transfer);

// ====================== MEDIA ======================

// 📸 Subir foto (usa Cloudinary)
router.post(
  '/:id/photos',
  requireAuth,
  requirePermission('vehicles.media'),
  upload.single('file'),
  ctrl.addVehiclePhoto
);

// 📸 Eliminar foto
router.delete(
  '/:id/photos/:photoId',
  requireAuth,
  requirePermission('vehicles.media'),
  ctrl.deleteVehiclePhoto
);

// 📄 Subir documento
router.post(
  '/:id/documents',
  requireAuth,
  requirePermission('vehicles.media'),
  upload.single('file'),
  ctrl.addVehicleDocument
);

// 📄 Eliminar documento
router.delete(
  '/:id/documents/:documentId',
  requireAuth,
  requirePermission('vehicles.media'),
  ctrl.deleteVehicleDocument
);

export default router;
