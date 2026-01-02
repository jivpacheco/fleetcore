// // ///*************** vERSION ESTABLE 20/10/2025 */
// // // back/src/routes/vehicles.routes.js
// // // -----------------------------------------------------------------------------
// // // Rutas dedicadas a Vehículos
// // // - CRUD (GET/POST/PATCH/DELETE) gestionado por vehicles.controller.js
// // // - Endpoints específicos para subir/eliminar fotos y documentos
// // // - Protegidas por requireAuth + requirePermission
// // // -----------------------------------------------------------------------------

// // import express from 'express';
// // import { requireAuth } from '../middleware/requireAuth.js';
// // import { requirePermission } from '../middleware/requirePermission.js';
// // // ✅ Corregido: import nombrado, no default
// // import { uploadSingle } from '../middleware/upload.middleware.js';
// // import * as ctrl from '../controllers/vehicles.controller.js';

// // const router = express.Router();

// // // ====================== CRUD ======================

// // // 📋 Listar vehículos (con populate sucursal)
// // router.get('/', requireAuth, requirePermission('vehicles:read'), ctrl.list);

// // // 📄 Obtener uno
// // router.get('/:id', requireAuth, requirePermission('vehicles:read'), ctrl.getOne);

// // // ➕ Crear nuevo
// // router.post('/', requireAuth, requirePermission('vehicles:create'), ctrl.create);

// // // ✏️ Actualizar
// // router.patch('/:id', requireAuth, requirePermission('vehicles:update'), ctrl.update);

// // // ❌ Eliminar
// // router.delete('/:id', requireAuth, requirePermission('vehicles:delete'), ctrl.remove);

// // // ====================== TRANSFER / APOYO ======================
// // // Body esperado: { reason: 'TRASPASO'|'APOYO', toBranch, replaceVehicleId?, note }
// // // Si reason === 'APOYO' y viene replaceVehicleId → se aplicará sufijo 'R' a internalCode
// // router.post(
// //   '/:id/transfer',
// //   requireAuth,
// //   requirePermission('vehicles:transfer'),
// //   ctrl.transfer
// // );

// // // ====================== MEDIA ======================
// // // Subidas de medios con campo 'file' en FormData
// // // Front (axios):
// // // const fd = new FormData();
// // // fd.append('file', archivo);
// // // fd.append('category', 'BASIC');
// // // fd.append('title', 'FRENOS');
// // // await api.post(`/api/v1/vehicles/${id}/photos`, fd)

// // // 📸 Subir foto
// // router.post(
// //   '/:id/photos',
// //   requireAuth,
// //   requirePermission('vehicles:media'),
// //   uploadSingle,
// //   ctrl.addVehiclePhoto
// // );

// // // 📸 Eliminar foto
// // router.delete(
// //   '/:id/photos/:photoId',
// //   requireAuth,
// //   requirePermission('vehicles:media'),
// //   ctrl.deleteVehiclePhoto
// // );

// // // 📄 Subir documento
// // router.post(
// //   '/:id/documents',
// //   requireAuth,
// //   requirePermission('vehicles:media'),
// //   uploadSingle,
// //   ctrl.addVehicleDocument
// // );

// // // 📄 Eliminar documento
// // router.delete(
// //   '/:id/documents/:documentId',
// //   requireAuth,
// //   requirePermission('vehicles:media'),
// //   ctrl.deleteVehicleDocument
// // );

// // export default router;







// // /***** penultima actualizacion */

// // // back/src/routes/vehicles.routes.js
// // // -----------------------------------------------------------------------------
// // // Rutas dedicadas a Vehículos
// // // - CRUD (GET/POST/PATCH/DELETE) gestionado por vehicles.controller.js
// // // - Transferencia / Apoyo (start/finish) para reemplazos temporales
// // // - Endpoints específicos para subir/eliminar fotos y documentos (Cloudinary)
// // // - Protegidas por requireAuth + requirePermission (esquema con ':')
// // // -----------------------------------------------------------------------------

// // import express from 'express'
// // import { requireAuth } from '../middleware/requireAuth.js'
// // import { requirePermission } from '../middleware/requirePermission.js'
// // // ✅ Import correcto según tu base estable: export nombrado
// // import { uploadSingle } from '../middleware/upload.middleware.js'
// // import * as ctrl from '../controllers/vehicles.controller.js'

// // const router = express.Router()

// // // ====================== CRUD ======================

// // // 📋 Listar vehículos (con populate sucursal)
// // router.get(
// //   '/',
// //   requireAuth,
// //   requirePermission('vehicles:read'),
// //   ctrl.list
// // )

// // // 📄 Obtener uno
// // router.get(
// //   '/:id',
// //   requireAuth,
// //   requirePermission('vehicles:read'),
// //   ctrl.getOne
// // )

// // // ➕ Crear nuevo
// // router.post(
// //   '/',
// //   requireAuth,
// //   requirePermission('vehicles:create'),
// //   ctrl.create
// // )

// // // ✏️ Actualizar
// // router.patch(
// //   '/:id',
// //   requireAuth,
// //   requirePermission('vehicles:update'),
// //   ctrl.update
// // )

// // // ❌ Eliminar
// // router.delete(
// //   '/:id',
// //   requireAuth,
// //   requirePermission('vehicles:delete'),
// //   ctrl.remove
// // )

// // // ====================== TRANSFERENCIA / APOYO ======================
// // // Body esperado en /transfer: { reason: 'TRASPASO'|'APOYO', toBranch, replaceVehicleId?, note }
// // // Si reason === 'APOYO' y viene replaceVehicleId → se aplicará sufijo 'R' a internalCode
// // router.post(
// //   '/:id/transfer',
// //   requireAuth,
// //   requirePermission('vehicles:transfer'),
// //   ctrl.transfer
// // )

// // // Opcional: flujo explícito de apoyo (si ya tienes implementado en controller)
// // // startSupport: inicia reemplazo; finishSupport: finaliza reemplazo
// // router.post(
// //   '/:id/support/start',
// //   requireAuth,
// //   requirePermission('vehicles:transfer'),
// //   ctrl.startSupport // <-- Asegúrate de tener esta función en el controller
// // )

// // router.post(
// //   '/:id/support/finish',
// //   requireAuth,
// //   requirePermission('vehicles:transfer'),
// //   ctrl.finishSupport // <-- Asegúrate de tener esta función en el controller
// // )

// // // ====================== MEDIA ======================
// // // Subidas de medios con campo 'file' en FormData
// // // Front (axios) ejemplo:
// // // const fd = new FormData()
// // // fd.append('file', archivo)
// // // fd.append('category', 'BASIC')
// // // fd.append('title', 'FRENOS')
// // // await api.post(`/api/v1/vehicles/${id}/photos`, fd)

// // // 📸 Subir foto
// // router.post(
// //   '/:id/photos',
// //   requireAuth,
// //   requirePermission('vehicles:media'),
// //   uploadSingle, // 👈 usa el middleware correcto
// //   ctrl.addVehiclePhoto
// // )

// // // 📸 Eliminar foto
// // router.delete(
// //   '/:id/photos/:photoId',
// //   requireAuth,
// //   requirePermission('vehicles:media'),
// //   ctrl.deleteVehiclePhoto
// // )

// // // 📄 Subir documento
// // router.post(
// //   '/:id/documents',
// //   requireAuth,
// //   requirePermission('vehicles:media'),
// //   uploadSingle, // 👈 usa el middleware correcto
// //   ctrl.addVehicleDocument
// // )

// // // 📄 Eliminar documento
// // router.delete(
// //   '/:id/documents/:documentId',
// //   requireAuth,
// //   requirePermission('vehicles:media'),
// //   ctrl.deleteVehicleDocument
// // )

// // export default router





// // ///*************  */
// // // back/src/routes/vehicles.routes.js
// // // -----------------------------------------------------------------------------
// // // Rutas dedicadas a Vehículos
// // // - CRUD + Transferencia / Apoyo + Media (Cloudinary)
// // // - Protegidas por requireAuth + requirePermission (esquema con ':')
// // // -----------------------------------------------------------------------------

// // import express from 'express'
// // import { requireAuth } from '../middleware/requireAuth.js'
// // import { requirePermission } from '../middleware/requirePermission.js'
// // import { uploadSingle } from '../middleware/upload.middleware.js'
// // import * as ctrl from '../controllers/vehicles.controller.js'

// // const router = express.Router()

// // // ====================== CRUD ======================
// // router.get('/',    requireAuth, requirePermission('vehicles:read'),   ctrl.list)
// // router.get('/:id', requireAuth, requirePermission('vehicles:read'),   ctrl.getOne)
// // router.post('/',   requireAuth, requirePermission('vehicles:create'), ctrl.create)
// // router.patch('/:id', requireAuth, requirePermission('vehicles:update'), ctrl.update)
// // router.delete('/:id', requireAuth, requirePermission('vehicles:delete'), ctrl.remove)

// // // ====================== TRANSFERENCIA / APOYO ======================
// // // /transfer (modo legacy compatible): { reason:'TRASPASO'|'APOYO', toBranch, replaceVehicleId?, note }
// // router.post('/:id/transfer',
// //   requireAuth, requirePermission('vehicles:transfer'), ctrl.transfer)

// // // Flujo explícito Apoyo (UI nuevo)
// // router.post('/:id/support/start',
// //   requireAuth, requirePermission('vehicles:transfer'), ctrl.startSupport)

// // router.post('/:id/support/finish',
// //   requireAuth, requirePermission('vehicles:transfer'), ctrl.finishSupport)

// // // ====================== MEDIA ======================
// // // El campo del archivo en FormData debe llamarse 'file'
// // router.post('/:id/photos',
// //   requireAuth, requirePermission('vehicles:media'),
// //   uploadSingle, ctrl.addVehiclePhoto)

// // router.delete('/:id/photos/:photoId',
// //   requireAuth, requirePermission('vehicles:media'),
// //   ctrl.deleteVehiclePhoto)

// // router.post('/:id/documents',
// //   requireAuth, requirePermission('vehicles:media'),
// //   uploadSingle, ctrl.addVehicleDocument)

// // router.delete('/:id/documents/:documentId',
// //   requireAuth, requirePermission('vehicles:media'),
// //   ctrl.deleteVehicleDocument)

// // export default router




// //// ACTUALIZACION 20/10/2025 //////

// // back/src/routes/vehicles.routes.js
// // -----------------------------------------------------------------------------
// // Rutas de Vehículos (CRUD + transfer + media + support + auditoría)
// // -----------------------------------------------------------------------------
// import express from 'express';
// import { requireAuth } from '../middleware/requireAuth.js';
// import { requirePermission } from '../middleware/requirePermission.js';
// // ✅ Import nombrado que ya tienes estable
// import { uploadSingle } from '../middleware/upload.middleware.js';
// import * as ctrl from '../controllers/vehicles.controller.js';

// const router = express.Router();

// // ====================== CRUD ======================
// router.get('/',       requireAuth, requirePermission('vehicles:read'),    ctrl.list);
// router.get('/:id',    requireAuth, requirePermission('vehicles:read'),    ctrl.getOne);
// router.post('/',      requireAuth, requirePermission('vehicles:create'),  ctrl.create);
// router.patch('/:id',  requireAuth, requirePermission('vehicles:update'),  ctrl.update);
// router.delete('/:id', requireAuth, requirePermission('vehicles:delete'),  ctrl.remove);

// // ====================== TRANSFER ======================
// router.post('/:id/transfer', requireAuth, requirePermission('vehicles:transfer'), ctrl.transfer);

// // ====================== APOYO ======================
// router.post('/:id/support/start',  requireAuth, requirePermission('vehicles:transfer'), ctrl.startSupport);
// router.post('/:id/support/finish', requireAuth, requirePermission('vehicles:transfer'), ctrl.finishSupport);

// // ====================== MEDIA ======================
// router.post('/:id/photos',            requireAuth, requirePermission('vehicles:media'), uploadSingle, ctrl.addVehiclePhoto);
// router.delete('/:id/photos/:photoId', requireAuth, requirePermission('vehicles:media'), ctrl.deleteVehiclePhoto);

// router.post('/:id/documents',               requireAuth, requirePermission('vehicles:media'), uploadSingle, ctrl.addVehicleDocument);
// router.delete('/:id/documents/:documentId', requireAuth, requirePermission('vehicles:media'), ctrl.deleteVehicleDocument);

// // ====================== AUDITORÍA ======================
// router.get('/:id/audit', requireAuth, requirePermission('vehicles:read'), ctrl.listAudit);

// export default router;

// //// actualizacion 22/10/2025 13:30

// back/src/routes/vehicles.routes.js
// -----------------------------------------------------------------------------
// Rutas de Vehículos (CRUD + transfer + media + support + auditoría)
// - Usa import * as ctrl, cuyos handlers existen y son funciones.
// - Mantiene tu middleware de auth/permissions y uploadSingle nombrado.
// -----------------------------------------------------------------------------

import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
// import { requirePermission } from '../middleware/requirePermission.js';
import  requirePermission  from '../middleware/requirePermission.js';
import { uploadSingle } from '../middleware/upload.middleware.js';
import * as ctrl from '../controllers/vehicles.controller.js';

const router = express.Router();

function ensure(fn, name) {
  if (typeof fn === 'function') return fn;
  console.error(`[vehicles.routes] ❌ Handler "${name}" no es función. Recibido:`, fn);
  return (req, res) => res.status(500).json({ message: `Handler ${name} no disponible` });
}


// // ====================== CRUD ======================
// router.get('/',       requireAuth, requirePermission('vehicles:read'),    ctrl.list);
// router.get('/:id',    requireAuth, requirePermission('vehicles:read'),    ctrl.getOne);
// router.post('/',      requireAuth, requirePermission('vehicles:create'),  ctrl.create);
// router.patch('/:id',  requireAuth, requirePermission('vehicles:update'),  ctrl.update);
// router.delete('/:id', requireAuth, requirePermission('vehicles:delete'),  ctrl.remove);

// // ====================== TRANSFER ======================
// router.post('/:id/transfer', requireAuth, requirePermission('vehicles:transfer'), ctrl.transfer);

// // ====================== APOYO ======================
// router.post('/:id/support/start',  requireAuth, requirePermission('vehicles:transfer'), ctrl.startSupport);
// router.post('/:id/support/finish', requireAuth, requirePermission('vehicles:transfer'), ctrl.finishSupport);

// // ====================== MEDIA ======================
// router.post('/:id/photos',                  requireAuth, requirePermission('vehicles:media'), uploadSingle, ctrl.addVehiclePhoto);
// router.delete('/:id/photos/:photoId',       requireAuth, requirePermission('vehicles:media'),                 ctrl.deleteVehiclePhoto);
// router.post('/:id/documents',               requireAuth, requirePermission('vehicles:media'), uploadSingle,  ctrl.addVehicleDocument);
// router.delete('/:id/documents/:documentId', requireAuth, requirePermission('vehicles:media'),                 ctrl.deleteVehicleDocument);

// // ====================== AUDITORÍA ======================
// router.get('/:id/audit', requireAuth, requirePermission('vehicles:read'), ctrl.listAudit);

// ====================== CRUD ======================
router.get('/',       requireAuth, requirePermission('vehicles:read'),    ensure(ctrl.list, 'list'));
router.get('/:id',    requireAuth, requirePermission('vehicles:read'),    ensure(ctrl.getOne, 'getOne'));
router.post('/',      requireAuth, requirePermission('vehicles:create'),  ensure(ctrl.create, 'create'));
router.patch('/:id',  requireAuth, requirePermission('vehicles:update'),  ensure(ctrl.update, 'update'));
router.delete('/:id', requireAuth, requirePermission('vehicles:delete'),  ensure(ctrl.remove, 'remove'));

// ====================== TRANSFER ======================
router.post('/:id/transfer', requireAuth, requirePermission('vehicles:transfer'), ensure(ctrl.transfer, 'transfer'));

// ====================== APOYO ======================
router.post('/:id/support/start',  requireAuth, requirePermission('vehicles:transfer'), ensure(ctrl.startSupport, 'startSupport'));
router.post('/:id/support/finish', requireAuth, requirePermission('vehicles:transfer'), ensure(ctrl.finishSupport, 'finishSupport'));

// ====================== MEDIA ======================
router.post('/:id/photos',            requireAuth, requirePermission('vehicles:media'), uploadSingle, ensure(ctrl.addVehiclePhoto, 'addVehiclePhoto'));
router.delete('/:id/photos/:photoId', requireAuth, requirePermission('vehicles:media'), ensure(ctrl.deleteVehiclePhoto, 'deleteVehiclePhoto'));
router.post('/:id/documents',               requireAuth, requirePermission('vehicles:media'), uploadSingle, ensure(ctrl.addVehicleDocument, 'addVehicleDocument'));
router.delete('/:id/documents/:documentId', requireAuth, requirePermission('vehicles:media'), ensure(ctrl.deleteVehicleDocument, 'deleteVehicleDocument'));

// ====================== AUDITORÍA ======================
router.get('/:id/audit', requireAuth, requirePermission('vehicles:read'), ensure(ctrl.listAudit, 'listAudit'));


export default router;
