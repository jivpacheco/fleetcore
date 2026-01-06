// import { Router } from 'express';
import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
// import requireAuth from '../middleware/requireAuth.js';
import requirePermission from '../middleware/requirePermission.js';
import * as ctrl from '../controllers/roles.controller.js';

// const router = Router();
const router = express.Router();

// Copia exacta del patrón de vehicles.routes.js
function ensure(fn, name) {
  if (typeof fn === 'function') return fn;
  console.error(`[roles.routes] ❌ Handler "${name}" no es función. Recibido:`, fn);
  return (req, res) => res.status(500).json({ message: `Handler ${name} no disponible` });
}

// ====================== CRUD ======================
router.get('/',       requireAuth, requirePermission('roles:read'),    ensure(ctrl.list,   'list'));
router.get('/:id',    requireAuth, requirePermission('roles:read'),    ensure(ctrl.get,    'get'));
router.post('/',      requireAuth, requirePermission('roles:create'),  ensure(ctrl.create, 'create'));
router.patch('/:id',  requireAuth, requirePermission('roles:update'),  ensure(ctrl.update, 'update'));
router.delete('/:id', requireAuth, requirePermission('roles:delete'),  ensure(ctrl.remove, 'remove'));

export default router;
