import ServiceRequest from '../models/ServiceRequest.js'
import Triage from '../models/Triage.js'
import WorkOrder from '../models/WorkOrder.js'
import mongoose from 'mongoose'

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

function sanitize(body = {}) {
    const out = { ...body }

    if (typeof out.code === 'string') out.code = U(out.code.trim())
    if (typeof out.issueSummary === 'string') out.issueSummary = out.issueSummary.trim()
    if (typeof out.description === 'string') out.description = out.description.trim()

    if (typeof out.priority === 'string') out.priority = U(out.priority.trim())
    if (out.priority && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(out.priority)) {
        const err = new Error('priority inválida')
        err.status = 400
        throw err
    }

    if (typeof out.status === 'string') out.status = U(out.status.trim())

    // Evidence
    if (Array.isArray(out.evidence)) {
        out.evidence = out.evidence
            .map((e) => ({
                url: typeof e?.url === 'string' ? e.url.trim() : '',
                type: typeof e?.type === 'string' ? e.type.trim() : '',
                name: typeof e?.name === 'string' ? e.name.trim() : '',
            }))
            .filter((e) => Boolean(e.url))
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

        if (req.query.status) filter.status = U(String(req.query.status).trim())
        if (req.query.priority) filter.priority = U(String(req.query.priority).trim())

        if (req.query.vehicleId) filter.vehicleId = String(req.query.vehicleId).trim()
        if (req.query.branchId) filter.branchId = String(req.query.branchId).trim()
        if (req.query.failureReportId) filter.failureReportId = String(req.query.failureReportId).trim()

        if (q) {
            const rx = new RegExp(q, 'i')
            filter.$or = [{ issueSummary: rx }, { description: rx }, { code: rx }]
        }

        const result = await ServiceRequest.findPaged({
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
        const doc = await ServiceRequest.findById(req.params.id).lean()
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
        if (!payload.vehicleId) return res.status(400).json({ message: 'vehicleId es obligatorio' })
        if (!payload.issueSummary) return res.status(400).json({ message: 'issueSummary es obligatorio' })

        const created = await ServiceRequest.create({
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
        const doc = await ServiceRequest.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: 'No encontrado' })

        // reglas pro: si ya está CONVERTED, no se edita (salvo notas/evidence si quieres)
        if (doc.status === 'CONVERTED') return res.status(409).json({ message: 'No se puede editar: ya convertida' })

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
        const doc = await ServiceRequest.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: 'No encontrado' })

        // pro: si ya convertida, no borrar (auditoría)
        if (doc.status === 'CONVERTED') return res.status(409).json({ message: 'No se puede eliminar: ya convertida' })

        if (typeof doc.softDelete === 'function') {
            await doc.softDelete(req.user?.uid)
        } else {
            await ServiceRequest.findByIdAndDelete(req.params.id)
        }

        return res.status(204).end()
    } catch (err) {
        next(err)
    }
}

// POST /service-requests/:id/convert-to-workorder
export async function convertToWorkOrder(req, res, next) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const sr = await ServiceRequest.findById(req.params.id).session(session)
        if (!sr) return res.status(404).json({ message: 'ServiceRequest no encontrada' })

        if (sr.status === 'CONVERTED' && sr.workOrderId) {
            await session.commitTransaction()
            return res.json({ workOrderId: sr.workOrderId })
        }

        const triage = await Triage.findOne({ serviceRequestId: sr._id }).session(session)
        if (!triage) return res.status(409).json({ message: 'No hay Triage asociado' })
        if (triage.status !== 'APPROVED') return res.status(409).json({ message: 'Triage debe estar APPROVED' })

        // Crear WorkOrder (mínimo viable y robusto)
        const wo = await WorkOrder.create(
            [
                {
                    folio: '', // si luego agregamos Sequence, lo llenamos
                    serviceRequestId: sr._id,
                    triageId: triage._id,
                    vehicleId: sr.vehicleId,
                    branchId: sr.branchId,

                    priority: sr.priority,

                    vmrs: {
                        systemCode: triage.vmrs?.systemCode || '',
                        componentCode: triage.vmrs?.componentCode || '',
                        symptomCode: triage.vmrs?.symptomCode || '',
                        causeCode: triage.vmrs?.causeCode || '',
                    },

                    observations: sr.description || '',
                    status: 'open',
                    openedAt: new Date(),

                    createdBy: req.user?.uid,
                    updatedBy: req.user?.uid,
                },
            ],
            { session }
        )

        sr.status = 'CONVERTED'
        sr.triageId = triage._id
        sr.workOrderId = wo[0]._id
        sr.updatedBy = req.user?.uid
        await sr.save({ session })

        await session.commitTransaction()
        return res.status(201).json({ workOrderId: wo[0]._id })
    } catch (err) {
        await session.abortTransaction()
        next(err)
    } finally {
        session.endSession()
    }
}