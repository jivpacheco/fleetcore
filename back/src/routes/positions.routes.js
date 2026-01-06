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
// //v2

// import express from 'express';
// import { requireAuth } from '../middleware/requireAuth.js';
// // import { requirePermission } from '../middleware/requirePermission.js';
// import requirePermission from '../middleware/requirePermission.js';
// import * as ctrl from '../controllers/positions.controller.js';

// const router = express.Router();

// // Lectura: ideal positions:read; si aún no existe, usa people:read como fallback
// router.get('/',    requireAuth, requirePermission('positions:read', 'people:read'), ctrl.list);
// router.get('/:id', requireAuth, requirePermission('positions:read', 'people:read'), ctrl.get);

// // Gestión: solo rol superior (admin/global) por permiso dedicado
// router.post('/',      requireAuth, requirePermission('positions:manage'), ctrl.create);
// router.patch('/:id',  requireAuth, requirePermission('positions:manage'), ctrl.update);
// router.delete('/:id', requireAuth, requirePermission('positions:manage'), ctrl.remove);

// export default router;

// back/src/routes/positions.routes.js
import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import requirePermission from '../middleware/requirePermission.js'
import * as ctrl from '../controllers/positions.controller.js'

const router = express.Router()

function ensure(fn, name) {
    if (typeof fn === 'function') return fn
    console.error(`[positions.routes] ❌ Handler "${name}" no es función. Recibido:`, fn)
    return (req, res) => res.status(500).json({ message: `Handler ${name} no disponible` })
}

// ====================== CRUD ======================
// Lectura
router.get(
    '/',
    requireAuth,
    requirePermission('positions:read', 'people:read'),
    ensure(ctrl.list, 'list')
)

router.get(
    '/:id',
    requireAuth,
    requirePermission('positions:read', 'people:read'),
    ensure(ctrl.get, 'get')
)

// Gestión
router.post(
    '/',
    requireAuth,
    requirePermission('positions:manage'),
    ensure(ctrl.create, 'create')
)

router.patch(
    '/:id',
    requireAuth,
    requirePermission('positions:manage'),
    ensure(ctrl.update, 'update')
)

router.delete(
    '/:id',
    requireAuth,
    requirePermission('positions:manage'),
    ensure(ctrl.remove, 'remove')
)

export default router
