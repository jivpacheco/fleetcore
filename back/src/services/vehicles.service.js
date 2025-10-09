import Vehicle from '../models/Vehicle.js';

export async function listVehicles({ page=1, limit=10, q='' }) {
  const p = Math.max(parseInt(page,10)||1,1);
  const l = Math.max(parseInt(limit,10)||10,1);
  const filter = q ? { $or: [
    { plate: new RegExp(q,'i') },
    { internalCode: new RegExp(q,'i') },
    { brand: new RegExp(q,'i') },
    { model: new RegExp(q,'i') }
  ] } : {};

  const [items, total] = await Promise.all([
    Vehicle.find(filter).sort('-createdAt').skip((p-1)*l).limit(l).lean(),
    Vehicle.countDocuments(filter)
  ]);
  return { items, total, page:p, limit:l, pages:Math.ceil(total/l) };
}

export async function createVehicle(payload) {
  const v = await Vehicle.create({
    ...payload,
    assignments: payload.branch ? [{
      branch: payload.branch,
      codeInternal: payload.internalCode,
      reason: 'ASIGNACION'
    }] : []
  });
  return v.toObject();
}

export async function getVehicle(id) {
  const v = await Vehicle.findById(id).lean();
  if (!v) throw new Error('not_found');
  return v;
}

export async function updateVehicle(id, payload) {
  const v = await Vehicle.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!v) throw new Error('not_found');
  return v;
}

export async function removeVehicle(id, soft=true, by=null) {
  const v = await Vehicle.findById(id);
  if (!v) throw new Error('not_found');
  if (soft) {
    v.deletedAt = new Date();
    v.deletedBy = by;
    v.isActive = false;
    await v.save();
    return v.toObject();
  } else {
    return await Vehicle.findByIdAndDelete(id).lean();
  }
}

export async function transferVehicle(id, { toBranch, newInternalCode, note }) {
  const v = await Vehicle.findById(id);
  if (!v) throw new Error('not_found');
  const fromBranch = v.branch;
  v.branch = toBranch;
  v.internalCode = newInternalCode || v.internalCode;
  v.assignments.push({
    branch: toBranch, codeInternal: v.internalCode,
    reason: 'TRASPASO', fromBranch, toBranch, note
  });
  await v.save();
  return v.toObject();
}
