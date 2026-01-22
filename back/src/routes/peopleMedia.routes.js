// // back/src/routes/peopleMedia.routes.js
// import { Router } from 'express';
// import { requireAuth } from '../middleware/requireAuth.js';
// import requirePermission from '../middleware/requirePermission.js';
// import { branchScope } from '../middleware/branchScope.js';
// import * as ctrl from '../controllers/peopleMedia.controller.js';

// const router = Router({ mergeParams: true });

// function ensure(fn, name) {
//     if (typeof fn === 'function') return fn;
//     console.error(`[peopleMedia.routes] ❌ Handler "${name}" no es función. Recibido:`, fn);
//     return (req, res) => res.status(500).json({ message: `Handler ${name} no disponible` });
// }

// // Nota: este router ya está montado en /people/:personId/media
// router.post(
//     '/photo',
//     requireAuth,
//     requirePermission('people:update'),
//     branchScope,
//     ctrl.uploadMemory.single('file'),
//     ensure(ctrl.uploadPersonPhoto, 'uploadPersonPhoto')
// );

// router.post(
//     '/documents',
//     requireAuth,
//     requirePermission('people:update'),
//     branchScope,
//     ctrl.uploadMemory.single('file'),
//     ensure(ctrl.uploadPersonDocument, 'uploadPersonDocument')
// );

// router.delete(
//     '/documents/:docId',
//     requireAuth,
//     requirePermission('people:update'),
//     branchScope,
//     ensure(ctrl.deletePersonDocument, 'deletePersonDocument')
// );

// export default router;

// back/src/routes/peopleMedia.routes.js
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import requirePermission from '../middleware/requirePermission.js';
import { branchScope } from '../middleware/branchScope.js';
import * as ctrl from '../controllers/peopleMedia.controller.js';

const router = Router({ mergeParams: true });

function ensure(fn, name) {
    if (typeof fn === 'function') return fn;
    console.error(`[peopleMedia.routes] ❌ Handler "${name}" no es función. Recibido:`, fn);
    return (req, res) => res.status(500).json({ message: `Handler ${name} no disponible` });
}

// Nota: este router ya está montado en /people/:personId/media
router.post(
    '/photo',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ctrl.uploadMemory.single('file'),
    ensure(ctrl.uploadPersonPhoto, 'uploadPersonPhoto')
);

router.delete(
    '/photo',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ensure(ctrl.deletePersonPhoto, 'deletePersonPhoto')
);

router.post(
    '/documents',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ctrl.uploadMemory.single('file'),
    ensure(ctrl.uploadPersonDocument, 'uploadPersonDocument')
);

router.delete(
    '/documents/:docId',
    requireAuth,
    requirePermission('people:update'),
    branchScope,
    ensure(ctrl.deletePersonDocument, 'deletePersonDocument')
);

router.get(
    '/documents/:docId/download',
    requireAuth,
    requirePermission('people:read'),
    branchScope,
    ensure(ctrl.downloadPersonDocument, 'downloadPersonDocument')
);

export default router;
