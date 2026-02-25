import Triage from '../models/Triage.js'
import ServiceRequest from '../models/ServiceRequest.js'

function cleanVmrsCode(v) {
    if (typeof v !== 'string') return ''
    const s = v.trim().toUpperCase()
    if (!s) return ''
    if (!/^[A-Z0-9-]+$/.test(s)) return ''
    return s
}

function sanitize(body = {}) {
    const out = { ...body }

    if (typeof out.diagnosis === 'string') out.diagnosis = out.diagnosis.trim()

    if (typeof out.severity === 'string') out.severity = out.severity.trim().toUpperCase()
    if (out.severity && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(out.severity)) {
        const err = new Error('severity inválida')
        err.status = 400
        throw err
    }

    if (typeof out.operationalImpact === 'string') out.operationalImpact = out.operationalImpact.trim().toUpperCase()
    if (out.operationalImpact && !['NO_STOP', 'LIMITED', 'OUT_OF_SERVICE'].includes(out.operationalImpact)) {
        const err = new Error('operationalImpact inválido')
        err.status = 400
        throw err
    }

    if (typeof out.estimatedLaborMinutes === 'string') out.estimatedLaborMinutes = Number(out.estimatedLaborMinutes)
    if (out.estimatedLaborMinutes !== undefined && Number.isNaN(Number(out.estimatedLaborMinutes))) {
        const err = new Error('estimatedLaborMinutes inválido')
        err.status = 400
        throw err
    }

    if (typeof out.status === 'string') out.status = out.status.trim().toUpperCase()
    if (out.status && !['PENDING', 'DIAGNOSED', 'APPROVED', 'REJECTED'].includes(out.status)) {
        const err = new Error('status inválido')
        err.status = 400
        throw err
    }

    // VMRS
    if (out.vmrs && typeof out.vmrs === 'object') {
        out.vmrs = {
            systemCode: cleanVmrsCode(out.vmrs.systemCode),
            componentCode: cleanVmrsCode(out.vmrs.componentCode),
            symptomCode: cleanVmrsCode(out.vmrs.symptomCode),
            causeCode: cleanVmrsCode(out.vmrs.causeCode),
        }
        if (!out.vmrs.systemCode) out.vmrs.componentCode = ''
        if (!out.vmrs.componentCode) out.vmrs.symptomCode = ''
    } else {
        delete out.vmrs
    }

    return out
}

function parseBool(v) {
    if (v === undefined || v === null || v === '') return undefined
    if (typeof v === 'boolean') return v
    const s = String(v).trim().toLowerCase()
    if (s === 'true') return true
    if (s === 'false') return false
    return undefined
}

export async function list(req, res, next) {
    try {
        const page = Number.parseInt(req.query.page ?? '1', 10) || 1
        const limit = Number.parseInt(req.query.limit ?? '20', 10) || 20
        const q = String(req.query.q || '').trim()

        const filter = {}

        const active = parseBool(req.query.active)
        if (active !== undefined) filter.active = active

        if (req.query.status) filter.status = String(req.query.status).trim().toUpperCase()
        if (req.query.serviceRequestId) filter.serviceRequestId = String(req.query.serviceRequestId).trim()
        if (req.query.technicianId) filter.technicianId = String(req.query.technicianId).trim()

        if (req.query.vmrsSystemCode) filter['vmrs.systemCode'] = cleanVmrsCode(req.query.vmrsSystemCode)
        if (req.query.vmrsComponentCode) filter['vmrs.componentCode'] = cleanVmrsCode(req.query.vmrsComponentCode)

        if (q) {
            const rx = new RegExp(q, 'i')
            filter.$or = [{ diagnosis: rx }]
        }

        const result = await Triage.findPaged({
            filter,
            page,
            limit,
            sort: { createdAt: -1 },
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
        const doc = await Triage.findById(req.params.id).lean()
        if (!doc) return res.status(404).json({ message: 'No encontrado' })
        return res.json({ item: doc })
    } catch (err) {
        next(err)
    }
}

export async function create(req, res, next) {
    try {
        const payload = sanitize(req.body || {})
        if (!payload.serviceRequestId) return res.status(400).json({ message: 'serviceRequestId es obligatorio' })

        const sr = await ServiceRequest.findById(payload.serviceRequestId)
        if (!sr) return res.status(404).json({ message: 'ServiceRequest no encontrada' })

        // regla pro: al crear triage, SR pasa a IN_TRIAGE si estaba OPEN
        if (sr.status === 'OPEN') {
            sr.status = 'IN_TRIAGE'
            sr.updatedBy = req.user?.uid
            await sr.save()
        }

        const created = await Triage.create({
            ...payload,
            createdBy: req.user?.uid,
            updatedBy: req.user?.uid,
        })

        // link en SR
        sr.triageId = created._id
        sr.updatedBy = req.user?.uid
        await sr.save()

        return res.status(201).json({ item: created })
    } catch (err) {
        if (err?.code === 11000) return res.status(409).json({ message: 'Ya existe triage para esta ServiceRequest' })
        next(err)
    }
}

export async function update(req, res, next) {
    try {
        const doc = await Triage.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: 'No encontrado' })

        const payload = sanitize(req.body || {})
        Object.assign(doc, payload, { updatedBy: req.user?.uid })
        await doc.save()

        // sincronía pro: si triage APPROVED -> SR APPROVED
        if (doc.serviceRequestId) {
            const sr = await ServiceRequest.findById(doc.serviceRequestId)
            if (sr) {
                if (doc.status === 'APPROVED') sr.status = 'APPROVED'
                if (doc.status === 'REJECTED') sr.status = 'REJECTED'
                sr.updatedBy = req.user?.uid
                await sr.save()
            }
        }

        return res.json({ item: doc })
    } catch (err) {
        next(err)
    }
}

export async function remove(req, res, next) {
    try {
        const doc = await Triage.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: 'No encontrado' })

        // pro: si ya APPROVED, no borrar
        if (doc.status === 'APPROVED') return res.status(409).json({ message: 'No se puede eliminar: triage APPROVED' })

        if (typeof doc.softDelete === 'function') {
            await doc.softDelete(req.user?.uid)
        } else {
            await Triage.findByIdAndDelete(req.params.id)
        }

        return res.status(204).end()
    } catch (err) {
        next(err)
    }
}