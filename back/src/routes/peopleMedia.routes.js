import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import requirePermission from '../middleware/requirePermission.js';
import { branchScope } from '../middleware/branchScope.js';
import * as ctrl from '../controllers/peopleMedia.controller.js';

const router = Router();

function ensure(fn, name) {
    if (typeof fn === 'function') return fn;
    console.error(`[peopleMedia.routes] Handler "${name}" no es función`);
    return (req, res) => res.status(500).json({ message: `Handler ${name} no disponible` });
}

router.post(
    '/:personId/media/photo',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ctrl.uploadMemory.single('file'),
    ensure(ctrl.uploadPersonPhoto, 'uploadPersonPhoto')
);

router.post(
    '/:personId/media/documents',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ctrl.uploadMemory.single('file'),
    ensure(ctrl.uploadPersonDocument, 'uploadPersonDocument')
);

router.delete(
    '/:personId/media/documents/:docId',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ensure(ctrl.deletePersonDocument, 'deletePersonDocument')
);

export default router;
