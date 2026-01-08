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
