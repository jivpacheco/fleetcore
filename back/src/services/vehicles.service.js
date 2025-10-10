// back/src/services/vehicles.service.js
import Vehicle from '../models/Vehicle.js'

function dupKeyToField(err) {
  // Intenta detectar campo del error 11000 (duplicate key)
  const msg = err?.message || ''
  if (msg.includes('internalCode')) return 'internalCode'
  if (msg.includes('plate')) return 'plate'
  if (msg.includes('code_1')) return 'internalCode' // legado
  return null
}

export async function listVehicles({ page = 1, limit = 10, q = '' }) {
  const p = Math.max(parseInt(page, 10) || 1, 1)
  const l = Math.max(parseInt(limit, 10) || 10, 1)
  const rx = (s) => new RegExp(String(s).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

  const filter = q
    ? { $or: [{ plate: rx(q) }, { internalCode: rx(q) }, { brand: rx(q) }, { model: rx(q) }] }
    : {}

  const [items, total] = await Promise.all([
    Vehicle.find(filter).sort('-createdAt').skip((p - 1) * l).limit(l).lean(),
    Vehicle.countDocuments(filter),
  ])
  return { items, total, page: p, limit: l, pages: Math.ceil(total / l) || 1 }
}

export async function createVehicle(payload) {
  // Normalizaciones
  const data = {
    ...payload,
  }
  if (data.internalCode) data.internalCode = String(data.internalCode).toUpperCase().trim()
  if (data.plate) data.plate = String(data.plate).toUpperCase().trim()

  // Validación mínima
  if (!data.internalCode) {
    const e = new Error('El código interno es obligatorio')
    e.status = 400
    throw e
  }
  if (!data.plate) {
    const e = new Error('La placa es obligatoria')
    e.status = 400
    throw e
  }

  try {
    const v = await Vehicle.create({
      ...data,
      assignments: data.branch
        ? [
            {
              branch: data.branch,
              codeInternal: data.internalCode,
              reason: 'ASIGNACION',
            },
          ]
        : [],
    })
    return v.toObject()
  } catch (err) {
    // Error de clave duplicada
    if (err?.code === 11000) {
      const field = dupKeyToField(err) || 'valor'
      const e = new Error(
        field === 'internalCode'
          ? `Ya existe un vehículo con el código interno "${data.internalCode}"`
          : field === 'plate'
          ? `Ya existe un vehículo con la placa "${data.plate}"`
          : 'Registro duplicado',
      )
      e.status = 409
      throw e
    }
    throw err
  }
}

export async function getVehicle(id) {
  const v = await Vehicle.findById(id).lean()
  if (!v) throw new Error('not_found')
  return v
}

export async function updateVehicle(id, payload) {
  const data = { ...payload }
  if (data.internalCode) data.internalCode = String(data.internalCode).toUpperCase().trim()
  if (data.plate) data.plate = String(data.plate).toUpperCase().trim()

  try {
    const v = await Vehicle.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean()
    if (!v) throw new Error('not_found')
    return v
  } catch (err) {
    if (err?.code === 11000) {
      const field = dupKeyToField(err) || 'valor'
      const e = new Error(
        field === 'internalCode'
          ? `Ya existe un vehículo con el código interno "${data.internalCode}"`
          : field === 'plate'
          ? `Ya existe un vehículo con la placa "${data.plate}"`
          : 'Registro duplicado',
      )
      e.status = 409
      throw e
    }
    throw err
  }
}

export async function removeVehicle(id, soft = true, by = null) {
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

export async function transferVehicle(id, { toBranch, newInternalCode, note }) {
  const v = await Vehicle.findById(id)
  if (!v) throw new Error('not_found')

  const fromBranch = v.branch
  v.branch = toBranch
  if (newInternalCode) v.internalCode = String(newInternalCode).toUpperCase().trim()

  v.assignments.push({
    branch: toBranch,
    codeInternal: v.internalCode,
    reason: 'TRASPASO',
    fromBranch,
    toBranch,
    note,
  })
  await v.save()
  return v.toObject()
}
