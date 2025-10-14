import { Router } from 'express'
import { requirePermission } from '../middleware/requirePermission.js'
import * as ctrl from '../controllers/catalogs.controller.js'

const r = Router()

// Lectura pública (autenticada) — ajusta permisos si deseas
r.get('/:key', requirePermission('catalogs:read'), ctrl.getOne)

// CRUD items del catálogo (solo admin/config)
r.post('/:key/items', requirePermission('catalogs:update'), ctrl.addItem)
r.patch('/:key/items/:itemId', requirePermission('catalogs:update'), ctrl.patchItem)
r.delete('/:key/items/:itemId', requirePermission('catalogs:update'), ctrl.removeItem)

export default r
