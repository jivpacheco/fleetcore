// import express from 'express';
// import { requireAuth } from '../middleware/requireAuth.js';
// import { requirePermission } from '../middleware/requirePermission.js';
// import * as ctrl from '../controllers/positions.controller.js';

// const router = express.Router();

// // Lectura: usuarios con people:read (o superior) pueden ver catálogo
// router.get('/',    requireAuth, requirePermission('people:read'), ctrl.list);
// router.get('/:id', requireAuth, requirePermission('people:read'), ctrl.get);

// // Gestión: solo rol superior (admin/global) por permiso dedicado
// router.post('/',     requireAuth, requirePermission('positions:manage'), ctrl.create);
// router.patch('/:id', requireAuth, requirePermission('positions:manage'), ctrl.update);
// router.delete('/:id',requireAuth, requirePermission('positions:manage'), ctrl.remove);

// export default router;


import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
// import { requirePermission } from '../middleware/requirePermission.js';
import requirePermission from '../middleware/requirePermission.js';
import * as ctrl from '../controllers/positions.controller.js';

const router = express.Router();

// Lectura: ideal positions:read; si aún no existe, usa people:read como fallback
router.get('/',    requireAuth, requirePermission('positions:read', 'people:read'), ctrl.list);
router.get('/:id', requireAuth, requirePermission('positions:read', 'people:read'), ctrl.get);

// Gestión: solo rol superior (admin/global) por permiso dedicado
router.post('/',      requireAuth, requirePermission('positions:manage'), ctrl.create);
router.patch('/:id',  requireAuth, requirePermission('positions:manage'), ctrl.update);
router.delete('/:id', requireAuth, requirePermission('positions:manage'), ctrl.remove);

export default router;
