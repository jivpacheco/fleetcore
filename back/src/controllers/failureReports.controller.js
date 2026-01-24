// back/src/controllers/failureReports.controller.js
// -----------------------------------------------------------------------------
// Catálogo: Reporte de Fallas (cliente/sucursal)
// Estándar FleetCore v1.0:
// - list: { items, total, page, limit }
// - get:  { item }
// - create/update: { item }
// -----------------------------------------------------------------------------

import FailureReport from '../models/FailureReport.js'

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

function sanitize(body = {}) {
    const out = { ...body }

    if (typeof out.code === 'string') out.code = U(out.code.trim())
    if (typeof out.name === 'string') out.name = out.name.trim()
    if (typeof out.description === 'string') out.description = out.description.trim()
    if (typeof out.systemKey === 'string') out.systemKey = out.systemKey.trim()
    if (typeof out.zoneKey === 'string') out.zoneKey = out.zoneKey.trim()

    if (Array.isArray(out.suggestedQuestions)) {
        out.suggestedQuestions = out.suggestedQuestions
            .map((s) => (typeof s === 'string' ? s.trim() : ''))
            .filter(Boolean)
    }

    if (Array.isArray(out.tags)) {
        out.tags = Array.from(
            new Set(out.tags.map((t) => (typeof t === 'string' ? t.trim() : '')).filter(Boolean))
        )
    }

    if (typeof out.active === 'string') out.active = out.active === 'true'

    return out
}

export async function list(req, res, next) {
    try {
        const page = Number.parseInt(req.query.page ?? '1', 10) || 1
        const limit = Number.parseInt(req.query.limit ?? '20', 10) || 20
        const q = String(req.query.q || '').trim()

        const filter = {}

        if (req.query.active !== undefined && req.query.active !== '') {
            filter.active = String(req.query.active) === 'true'
        }

        if (req.query.systemKey) filter.systemKey = String(req.query.systemKey).trim()
        if (req.query.zoneKey) filter.zoneKey = String(req.query.zoneKey).trim()

        if (q) {
            const rx = new RegExp(q, 'i')
            filter.$or = [{ name: rx }, { code: rx }, { description: rx }]
        }

        const result = await FailureReport.findPaged({
            filter,
            page,
            limit,
            sort: { name: 1, code: 1 },
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

export async function get(req, res, next) {
    try {
        const doc = await FailureReport.findById(req.params.id).lean()
        if (!doc) return res.status(404).json({ message: 'No encontrado' })
        return res.json({ item: doc })
    } catch (err) {
        next(err)
    }
}

export async function create(req, res, next) {
    try {
        const payload = sanitize(req.body || {})
        if (!payload.code) return res.status(400).json({ message: 'code es obligatorio' })
        if (!payload.name) return res.status(400).json({ message: 'name es obligatorio' })
        if (!payload.systemKey) return res.status(400).json({ message: 'systemKey es obligatorio' })

        const created = await FailureReport.create({
            ...payload,
            createdBy: req.user?.uid,
            updatedBy: req.user?.uid,
        })

        return res.status(201).json({ item: created })
    } catch (err) {
        if (err?.code === 11000) return res.status(409).json({ message: 'code ya existe' })
        next(err)
    }
}

export async function update(req, res, next) {
    try {
        const doc = await FailureReport.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: 'No encontrado' })

        const payload = sanitize(req.body || {})
        Object.assign(doc, payload, { updatedBy: req.user?.uid })
        await doc.save()

        return res.json({ item: doc })
    } catch (err) {
        if (err?.code === 11000) return res.status(409).json({ message: 'code ya existe' })
        next(err)
    }
}

export async function remove(req, res, next) {
    try {
        const doc = await FailureReport.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: 'No encontrado' })

        if (typeof doc.softDelete === 'function') {
            await doc.softDelete(req.user?.uid)
        } else {
            await FailureReport.findByIdAndDelete(req.params.id)
        }

        return res.status(204).end()
    } catch (err) {
        next(err)
    }
}
