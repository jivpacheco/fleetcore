// back/src/routes/vmrs.routes.js
// -----------------------------------------------------------------------------
// VMRS API (FleetCore)
// v1:
// - GET /vmrs/systems
// - GET /vmrs/components?systemCode=013
//
// Convenciones FleetCore:
// - list => { items, total, page, limit, pages }
// - Query comunes: q, active, page, limit
// -----------------------------------------------------------------------------

import express from 'express'
import * as C from '../controllers/vmrs.controller.js'

const router = express.Router()

// Systems
router.get('/systems', C.listSystems)

// Components (filtrado por systemCode)
router.get('/components', C.listComponents) // ?systemCode=013

// --- Reservado para fases siguientes (no activar aún) ---
// router.get('/symptoms', C.listSymptoms) // ?componentCode=013-02
// router.get('/jobs', C.listJobs)         // ?componentCode=013-02 (minor/job standards)

export default router