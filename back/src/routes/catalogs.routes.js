// import { Router } from 'express'
// import { requirePermission } from '../middleware/requirePermission.js'
// import * as ctrl from '../controllers/catalogs.controller.js'

// const r = Router()

// // Lectura pública (autenticada) — ajusta permisos si deseas
// r.get('/:key', requirePermission('catalogs:read'), ctrl.getOne)

// // CRUD items del catálogo (solo admin/config)
// r.post('/:key/items', requirePermission('catalogs:update'), ctrl.addItem)
// r.patch('/:key/items/:itemId', requirePermission('catalogs:update'), ctrl.patchItem)
// r.delete('/:key/items/:itemId', requirePermission('catalogs:update'), ctrl.removeItem)

// export default r

// //v2 12012026

// // back/src/routes/catalogs.routes.js
// // -----------------------------------------------------------------------------
// // Rutas dedicadas a Catálogos
// // - Permite listar, crear y eliminar ítems por clave (key)
// // - Protegidas por requireAuth + requirePermission
// // -----------------------------------------------------------------------------

// import express from 'express';
// import { requireAuth } from '../middleware/requireAuth.js';
// // import { requirePermission } from '../middleware/requirePermission.js';
// import  requirePermission from '../middleware/requirePermission.js';
// import * as ctrl from '../controllers/catalogs.controller.js';

// const router = express.Router();

// // 📋 Listar ítems de catálogo (por key)
// router.get('/', requireAuth, requirePermission('catalogs.view'), ctrl.list);

// // ➕ Crear nuevo ítem
// router.post('/', requireAuth, requirePermission('catalogs.create'), ctrl.create);

// // ❌ Eliminar ítem
// router.delete('/:id', requireAuth, requirePermission('catalogs.delete'), ctrl.remove);

// export default router;


// back/src/routes/catalogs.routes.js
import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import requirePermission from '../middleware/requirePermission.js'
import * as ctrl from '../controllers/catalogs.controller.js'

const router = express.Router()

router.get('/', requireAuth, requirePermission('catalogs.view'), ctrl.list)
router.post('/', requireAuth, requirePermission('catalogs.create'), ctrl.create)

// ✅ NUEVO: actualizar ítem
router.patch('/:id', requireAuth, requirePermission('catalogs.update'), ctrl.update)

router.delete('/:id', requireAuth, requirePermission('catalogs.delete'), ctrl.remove)

export default router
