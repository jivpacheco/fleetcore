// back/src/services/vehicles.service.js
// -----------------------------------------------------------------------------
// Servicio de vehículos con validación de requeridos, creación de primer
// evento de asignación y utilidades CRUD.
// -----------------------------------------------------------------------------
import Vehicle from '../models/Vehicle.js'

function assertBasic(payload = {}) {
  const req = ['plate','internalCode','type','brand','model','year','color','branch','transmission']
  const missing = req.filter(k => !payload[k] || (typeof payload[k] === 'string' && !payload[k].trim()))
  if (missing.length) {
    const pretty = missing.join(', ')
    const err = new Error(`Faltan campos obligatorios: ${pretty}`)
    err.status = 400
    throw err
  }
  // transmisión obligatoria y completa
  const t = payload.transmission || {}
  const tReq = ['type','brand','model']
  const tMissing = tReq.filter(k => !t[k] || (typeof t[k] === 'string' && !t[k].trim()))
  if (tMissing.length) {
    const err = new Error(`Transmisión incompleta: faltan ${tMissing.join(', ')}`)
    err.status = 400
    throw err
  }
  // año numérico
  if (Number.isNaN(Number(payload.year))) {
    const err = new Error('El año debe ser numérico')
    err.status = 400
    throw err
  }
}

export async function listVehicles({ page=1, limit=10, q='', status, branch }) {
  const p = Math.max(parseInt(page,10)||1,1)
  const l = Math.max(parseInt(limit,10)||10,1)

  const filter = { deletedAt: { $exists: false } }
  if (q) {
    filter.$or = [
      { plate:        new RegExp(q,'i') },
      { internalCode: new RegExp(q,'i') },
      { brand:        new RegExp(q,'i') },
      { model:        new RegExp(q,'i') }
    ]
  }
  if (status) filter.status = status
  if (branch) filter.branch = branch

  const [items, total] = await Promise.all([
    Vehicle.find(filter).sort('-createdAt').skip((p-1)*l).limit(l).lean(),
    Vehicle.countDocuments(filter)
  ])

  return { items, total, page:p, limit:l, pages:Math.ceil(total/l) }
}

export async function createVehicle(payload, userId = null) {
  assertBasic(payload)

  const doc = await Vehicle.create({
    ...payload,
    createdBy: userId || undefined,
    updatedBy: userId || undefined,
    assignments: [{
      branch: payload.branch,
      codeInternal: payload.internalCode,
      reason: 'ASIGNACION',
      startAt: new Date()
    }]
  })
  return doc.toObject()
}

export async function getVehicle(id) {
  const v = await Vehicle.findById(id).lean()
  if (!v) {
    const err = new Error('not_found')
    err.status = 404
    throw err
  }
  return v
}

export async function updateVehicle(id, payload, userId = null) {
  // si tocan básicos, validamos (permite updates parciales si no mandan básicos)
  const keys = Object.keys(payload || {})
  const touchesBasic = keys.some(k => [
    'plate','internalCode','type','brand','model','year','color','branch','transmission'
  ].includes(k))
  if (touchesBasic) assertBasic({ ...(await Vehicle.findById(id).lean()), ...payload })

  const v = await Vehicle.findByIdAndUpdate(
    id,
    { ...payload, updatedBy: userId || undefined },
    { new: true }
  ).lean()
  if (!v) {
    const err = new Error('not_found')
    err.status = 404
    throw err
  }
  return v
}

export async function removeVehicle(id, soft=true, by=null) {
  const v = await Vehicle.findById(id)
  if (!v) {
    const err = new Error('not_found'); err.status = 404; throw err
  }
  if (soft) {
    v.deletedAt = new Date()
    v.deletedBy = by || undefined
    v.isActive  = false
    await v.save()
    return v.toObject()
  } else {
    return await Vehicle.findByIdAndDelete(id).lean()
  }
}

export async function transferVehicle(id, { toBranch, newInternalCode, note }, userId=null) {
  const v = await Vehicle.findById(id)
  if (!v) {
    const err = new Error('not_found'); err.status = 404; throw err
  }
  const fromBranch = v.branch
  v.branch = toBranch
  v.internalCode = newInternalCode || v.internalCode
  v.assignments.push({
    branch: toBranch,
    codeInternal: v.internalCode,
    reason: 'TRASPASO',
    fromBranch, toBranch, note,
    startAt: new Date()
  })
  v.updatedBy = userId || undefined
  await v.save()
  return v.toObject()
}
