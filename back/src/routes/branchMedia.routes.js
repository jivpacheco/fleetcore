// back/src/routes/branchMedia.routes.js
// -----------------------------------------------------------------------------
// Router de media para Sucursales.
// Montaje esperado: /branches/:branchId/media
// -----------------------------------------------------------------------------

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { branchScope } from '../middleware/branchScope.js'
import * as ctrl from '../controllers/branchMedia.controller.js'

const router = Router({ mergeParams: true })

function ensure(fn, name) {
    if (typeof fn === 'function') return fn
    console.error(`[branchMedia.routes] ❌ Handler "${name}" no es función. Recibido:`, fn)
    return (_req, res) => res.status(500).json({ message: `Handler ${name} no disponible` })
}

// Nota: en el agregador ya existe requireAuth global, pero lo mantenemos explícito
// para que este router sea reutilizable si cambia el montaje.
router.post(
    '/photo',
    requireAuth,
    branchScope,
    ctrl.uploadMemory.single('file'),
    ensure(ctrl.uploadBranchPhoto, 'uploadBranchPhoto')
)

router.post(
    '/documents',
    requireAuth,
    branchScope,
    ctrl.uploadMemory.single('file'),
    ensure(ctrl.uploadBranchDocument, 'uploadBranchDocument')
)

router.delete(
    '/documents/:docId',
    requireAuth,
    branchScope,
    ensure(ctrl.deleteBranchDocument, 'deleteBranchDocument')
)

export default router
