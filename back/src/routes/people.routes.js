// import express from 'express';
// import { requireAuth } from '../middleware/requireAuth.js';
// // import { requirePermission } from '../middleware/requirePermission.js';
// import  requirePermission  from '../middleware/requirePermission.js';
// import { branchScope } from '../middleware/branchScope.js';
// import * as ctrl from '../controllers/people.controller.js';

// const router = express.Router();

// router.get('/',      requireAuth, requirePermission('people:read'),   branchScope, ctrl.list);
// router.get('/:id',   requireAuth, requirePermission('people:read'),   branchScope, ctrl.get);
// router.post('/',     requireAuth, requirePermission('people:create'), ctrl.create);
// router.patch('/:id', requireAuth, requirePermission('people:update'), branchScope, ctrl.update);
// router.delete('/:id',requireAuth, requirePermission('people:delete'), branchScope, ctrl.remove);

// router.post('/:id/licenses', requireAuth, requirePermission('people:update'), ensure(ctrl.addLicense, 'addLicense'));
// router.patch('/:id/licenses/:licenseId', requireAuth, requirePermission('people:update'), ensure(ctrl.updateLicense, 'updateLicense'));
// router.delete('/:id/licenses/:licenseId', requireAuth, requirePermission('people:update'), ensure(ctrl.removeLicense, 'removeLicense'));


// export default router;

import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import requirePermission from '../middleware/requirePermission.js';
import { branchScope } from '../middleware/branchScope.js';
import * as ctrl from '../controllers/people.controller.js';

const router = express.Router();

function ensure(fn, name) {
    if (typeof fn === 'function') return fn;
    console.error(`[people.routes] ❌ Handler "${name}" no es función. Recibido:`, fn);
    return (req, res) => res.status(500).json({ message: `Handler ${name} no disponible` });
}

// ====================== CRUD ======================
router.get(
    '/',
    requireAuth,
    requirePermission('people:read'),
    branchScope,
    ensure(ctrl.list, 'list')
);

router.get(
    '/:id',
    requireAuth,
    requirePermission('people:read'),
    branchScope,
    ensure(ctrl.get, 'get')
);

router.post(
    '/',
    requireAuth,
    requirePermission('people:create'),
    ensure(ctrl.create, 'create')
);

router.patch(
    '/:id',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ensure(ctrl.update, 'update')
);

router.delete(
    '/:id',
    requireAuth,
    requirePermission('people:delete'),
    branchScope,
    ensure(ctrl.remove, 'remove')
);

// ====================== LICENSES (subdoc en Person) ======================
router.post(
    '/:id/licenses',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ensure(ctrl.addLicense, 'addLicense')
);

router.patch(
    '/:id/licenses/:licenseId',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ensure(ctrl.updateLicense, 'updateLicense')
);

router.delete(
    '/:id/licenses/:licenseId',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ensure(ctrl.removeLicense, 'removeLicense')
);

export default router;

