// back/src/routes/drivingTests.routes.js
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import requirePermission from '../middleware/requirePermission.js';
import { branchScope } from '../middleware/branchScope.js';
import * as ctrl from '../controllers/drivingTests.controller.js';

// const router = Router();
const router = Router({ mergeParams: true });

function ensure(fn, name) {
    if (typeof fn === 'function') return fn;
    console.error(`[drivingTests.routes] ❌ Handler "${name}" no es función. Recibido:`, fn);
    return (req, res) => res.status(500).json({ message: `Handler ${name} no disponible` });
}

// Read
router.get(
    '/',
    requireAuth,
    requirePermission('drivingTests:read'),
    branchScope,
    ensure(ctrl.list, 'list')
);

router.get(
    '/:id',
    requireAuth,
    requirePermission('drivingTests:read'),
    branchScope,
    ensure(ctrl.get, 'get')
);

// Start / Finish
router.post(
    '/start',
    requireAuth,
    requirePermission('drivingTests:create'),
    ensure(ctrl.start, 'start')
);

router.post(
    '/:id/finish',
    requireAuth,
    requirePermission('drivingTests:update'),
    branchScope,
    ensure(ctrl.finish, 'finish')
);

// Delete
router.delete(
    '/:id',
    requireAuth,
    requirePermission('drivingTests:delete'),
    branchScope,
    ensure(ctrl.remove, 'remove')
);

export default router;
