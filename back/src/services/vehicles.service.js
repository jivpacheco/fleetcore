// back/src/services/vehicles.service.js
// Servicios de listado y CRUD con normalización a MAYÚSCULAS en campos string.
// Incluye creación de asignación inicial si se pasa branch.

import Vehicle from '../models/Vehicle.js'

const toUpper = (v) => (typeof v === 'string' ? v.toUpperCase() : v)
const upObj = (o) => {
  if (!o || typeof o !== 'object') return o
  const out = Array.isArray(o) ? [] : {}
  for (const k of Object.keys(o)) {
    const v = o[k]
    if (typeof v === 'string') out[k] = toUpper(v)
    else if (v && typeof v === 'object') out[k] = upObj(v)
    else out[k] = v
  }
  return out
}

export async function listVehicles({ page=1, limit=10, q='' }) {
  const p = Math.max(parseInt(page,10)||1,1)
  const l = Math.max(parseInt(limit,10)||10,1)
  const filter = q ? { $or: [
    { plate: new RegExp(q,'i') },
    { internalCode: new RegExp(q,'i') },
    { brand: new RegExp(q,'i') },
    { model: new RegExp(q,'i') }
  ] } : {}

  const [items, total] = await Promise.all([
    Vehicle.find(filter).sort('-createdAt').skip((p-1)*l).limit(l).lean(),
    Vehicle.countDocuments(filter)
  ])
  return { items, total, page:p, limit:l, pages:Math.ceil(total/l) }
}

export async function createVehicle(payload) {
  const data = upObj(payload)
  // Validación mínima extra (status por defecto si no viene)
  if (!data.status) data.status = 'ACTIVE'
  const v = await Vehicle.create({
    ...data,
    assignments: data.branch ? [{
      branch: data.branch,
      codeInternal: data.internalCode,
      reason: 'ASIGNACION',
      startAt: new Date()
    }] : []
  })
  return v.toObject()
}

export async function getVehicle(id) {
  const v = await Vehicle.findById(id).lean()
  if (!v) throw new Error('not_found')
  return v
}

export async function updateVehicle(id, payload) {
  const data = upObj(payload)
  const v = await Vehicle.findByIdAndUpdate(id, data, { new: true }).lean()
  if (!v) throw new Error('not_found')
  return v
}

export async function removeVehicle(id, soft=true, by=null) {
  const v = await Vehicle.findById(id)
  if (!v) throw new Error('not_found')
  if (soft) {
    v.deletedAt = new Date()
    v.deletedBy = by
    v.isActive = false
    await v.save()
    return v.toObject()
  } else {
    return await Vehicle.findByIdAndDelete(id).lean()
  }
}

export async function transferVehicle(id, { reason='TRASPASO', toBranch, replaceVehicleId, note }) {
  const v = await Vehicle.findById(id)
  if (!v) throw new Error('not_found')

  const fromBranch = v.branch
  let newInternal = v.internalCode

  // Si es APOYO y hay replaceVehicleId, agregamos sufijo 'R'
  if (reason?.toUpperCase() === 'APOYO') {
    newInternal = `${v.internalCode}R`
  }

  v.branch = toBranch || v.branch
  v.internalCode = newInternal
  v.assignments.push({
    branch: toBranch || v.branch,
    codeInternal: v.internalCode,
    reason: reason?.toUpperCase() || 'TRASPASO',
    fromBranch,
    toBranch,
    note: note?.toUpperCase?.(),
    startAt: new Date()
  })
  await v.save()
  return v.toObject()
}
