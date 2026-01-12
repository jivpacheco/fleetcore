// back/src/routes/permissions.routes.js
import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/roles.js'
import { ACTIONS, RESOURCES } from '../utils/permissionsCatalog.js'

const r = express.Router()

// Solo admin/global para que el UI de roles pueda autogenerar la grilla
r.get('/catalog', requireAuth, requireRole('admin','global'), (req, res) => {
  res.json({ actions: ACTIONS, resources: RESOURCES })
})

export default r
