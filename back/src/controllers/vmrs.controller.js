// back/src/controllers/vmrs.controller.js
// -----------------------------------------------------------------------------
// VMRS Controller (FleetCore)
// - Listado paginado y filtrable de Systems y Components.
// - Diseño para escalar a Symptoms/Jobs sin romper contrato.
// -----------------------------------------------------------------------------

import VmrsSystem from '../models/VmrsSystem.js'
import VmrsComponent from '../models/VmrsComponent.js'

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

function parseBool(v) {
    if (v === undefined || v === null || v === '') return undefined
    if (typeof v === 'boolean') return v
    const s = String(v).trim().toLowerCase()
    if (s === 'true') return true
    if (s === 'false') return false
    return undefined
}

function cleanVmrsCode(v) {
    if (typeof v !== 'string') return ''
    const s = v.trim().toUpperCase()
    if (!s) return ''
    if (!/^[A-Z0-9-]+$/.test(s)) return ''
    return s
}

function parsePageLimit(req, defaults = { page: 1, limit: 200 }) {
    const page = Number.parseInt(req.query.page ?? String(defaults.page), 10) || defaults.page
    const limit = Number.parseInt(req.query.limit ?? String(defaults.limit), 10) || defaults.limit
    return { page: Math.max(1, page), limit: Math.max(1, Math.min(limit, 1000)) } // hard cap
}

function buildTextSearch(q, fields) {
    const qq = String(q || '').trim()
    if (!qq) return null
    const rx = new RegExp(qq, 'i')
    return { $or: fields.map((f) => ({ [f]: rx })) }
}

// GET /vmrs/systems?q=&active=true&page=1&limit=200
export async function listSystems(req, res, next) {
    try {
        const { page, limit } = parsePageLimit(req, { page: 1, limit: 200 })
        const q = String(req.query.q || '').trim()
        const active = parseBool(req.query.active)

        const filter = {}
        if (active !== undefined) filter.active = active

        const text = buildTextSearch(q, ['code', 'nameEs', 'nameEn'])
        if (text) Object.assign(filter, text)

        const result = await VmrsSystem.findPaged({
            filter,
            page,
            limit,
            sort: { sortOrder: 1, code: 1 },
        })

        return res.json({
            items: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: result.pages,
        })
    } catch (err) {
        next(err)
    }
}

// GET /vmrs/components?systemCode=013&q=&active=true&page=1&limit=500
export async function listComponents(req, res, next) {
    try {
        const { page, limit } = parsePageLimit(req, { page: 1, limit: 500 })
        const q = String(req.query.q || '').trim()
        const active = parseBool(req.query.active)

        const systemCode = cleanVmrsCode(req.query.systemCode)
        if (!systemCode) return res.status(400).json({ message: 'systemCode es obligatorio' })

        const filter = { systemCode }
        if (active !== undefined) filter.active = active

        const text = buildTextSearch(q, ['code', 'nameEs', 'nameEn'])
        if (text) Object.assign(filter, text)

        const result = await VmrsComponent.findPaged({
            filter,
            page,
            limit,
            sort: { sortOrder: 1, code: 1 },
        })

        return res.json({
            items: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: result.pages,
        })
    } catch (err) {
        next(err)
    }
}

// --- Reservado para fases siguientes ---
// export async function listSymptoms(req, res, next) { ... } // ?componentCode=013-02
// export async function listJobs(req, res, next) { ... }     // ?componentCode=013-02