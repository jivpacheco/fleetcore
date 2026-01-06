// import Person from '../models/Person.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// function sanitizeBody(body = {}) {
//   const out = { ...body };

//   // Strings a mayúsculas (salvo email)
//   const upperFields = ['dni','firstName','lastName','birthPlace','nationality','phone']
//   for (const k of upperFields) {
//     if (typeof out[k] === 'string') out[k] = U(out[k].trim())
//   }
//   if (typeof out.email === 'string') out.email = out.email.trim().toLowerCase()

//   // Fechas
//   const dateFields = ['birthDate','hireDate']
//   for (const k of dateFields) {
//     if (out[k] === '' || out[k] === undefined) delete out[k]
//   }

//   // Licencias
//   if (Array.isArray(out.licenses)) {
//     out.licenses = out.licenses.map(l => ({
//       number: typeof l.number === 'string' ? U(l.number.trim()) : l.number,
//       type: typeof l.type === 'string' ? U(l.type.trim()) : l.type,
//       issueDate: l.issueDate || null,
//       expiryDate: l.expiryDate || null,
//       issuer: typeof l.issuer === 'string' ? U(l.issuer.trim()) : l.issuer,
//     }))
//   }

//   return out
// }

// function assertBranchWriteScope(req, branchId){
//   const roles = req.user?.roles || []
//   const isGlobal = roles.includes('global') || roles.includes('admin')
//   if (isGlobal) return true

//   const allowed = []
//   if (Array.isArray(req.user?.branchIds)) allowed.push(...req.user.branchIds.map(String))
//   if (req.user?.branchId) allowed.push(String(req.user.branchId))

//   if (!allowed.includes(String(branchId))) {
//     const err = new Error('No autorizado para operar en esta sucursal')
//     err.status = 403
//     throw err
//   }
//   return true
// }

// async function ensureInReadScope(req, personId){
//   // Reusa req.branchFilter (set por branchScope)
//   const filter = { _id: personId, ...(req.branchFilter || {}) }
//   const exists = await Person.findOne(filter).select('_id').lean()
//   if (!exists) {
//     const err = new Error('No encontrado')
//     err.status = 404
//     throw err
//   }
// }

// export async function list(req,res,next){
//   try{
//     const page  = Number.parseInt(req.query.page ?? '1', 10) || 1
//     const limit = Number.parseInt(req.query.limit ?? '10', 10) || 10
//     const q = String(req.query.q || '').trim()

//     const filter = { ...(req.branchFilter || {}) }

//     // Filtros directos
//     if (req.query.branchId) filter.branchId = req.query.branchId
//     if (req.query.positionId) filter.positionId = req.query.positionId
//     if (req.query.active !== undefined && req.query.active !== '') {
//       filter.active = String(req.query.active) === 'true'
//     }

//     if (q) {
//       const rx = new RegExp(q, 'i')
//       filter.$or = [
//         { dni: rx },
//         { firstName: rx },
//         { lastName: rx },
//       ]
//     }

//     const result = await Person.findPaged({
//       filter,
//       page,
//       limit,
//       sort: { lastName: 1, firstName: 1 },
//       populate: [
//         { path: 'branchId', select: 'code name' },
//         { path: 'positionId', select: 'code name' },
//       ],
//     })

//     return res.json(result)
//   }catch(err){ next(err) }
// }

// export async function get(req,res,next){
//   try{
//     const { id } = req.params
//     await ensureInReadScope(req, id)
//     const doc = await Person.findById(id)
//       .populate('branchId', 'code name')
//       .populate('positionId', 'code name')
//       .lean()

//     return res.json({ item: doc })
//   }catch(err){ next(err) }
// }

// export async function create(req,res,next){
//   try{
//     const body = sanitizeBody(req.body || {})
//     if (!body.branchId) {
//       const err = new Error('branchId es obligatorio')
//       err.status = 400
//       throw err
//     }
//     assertBranchWriteScope(req, body.branchId)

//     const created = await Person.create({
//       ...body,
//       createdBy: req.user?.uid,
//       updatedBy: req.user?.uid,
//     })

//     const doc = await Person.findById(created._id)
//       .populate('branchId', 'code name')
//       .populate('positionId', 'code name')
//       .lean()

//     return res.status(201).json({ item: doc })
//   }catch(err){ next(err) }
// }

// export async function update(req,res,next){
//   try{
//     const { id } = req.params
//     await ensureInReadScope(req, id)

//     const body = sanitizeBody(req.body || {})

//     // Si se cambia branchId, validar scope de escritura
//     if (body.branchId) assertBranchWriteScope(req, body.branchId)

//     const updated = await Person.findByIdAndUpdate(
//       id,
//       { ...body, updatedBy: req.user?.uid },
//       { new: true }
//     )
//       .populate('branchId', 'code name')
//       .populate('positionId', 'code name')
//       .lean()

//     return res.json({ item: updated })
//   }catch(err){ next(err) }
// }

// export async function remove(req,res,next){
//   try{
//     const { id } = req.params
//     await ensureInReadScope(req, id)
//     const doc = await Person.findById(id)
//     if (!doc) {
//       const err = new Error('No encontrado')
//       err.status = 404
//       throw err
//     }
//     if (typeof doc.softDelete === 'function') {
//       await doc.softDelete(req.user?.uid)
//     } else {
//       await Person.findByIdAndDelete(id)
//     }
//     return res.json({ ok:true })
//   }catch(err){ next(err) }
// }

// back/src/controllers/people.controller.js
import Person from '../models/Person.js';

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

function sanitizeBody(body = {}) {
  const out = { ...body };

  // Strings a MAYÚSCULAS (salvo email)
  const upperFields = ['dni', 'firstName', 'lastName', 'birthPlace', 'nationality', 'phone'];
  for (const k of upperFields) {
    if (typeof out[k] === 'string') out[k] = U(out[k].trim());
  }
  if (typeof out.email === 'string') out.email = out.email.trim().toLowerCase();

  // Fechas: si vienen vacías, elimínalas (evita Date inválidas)
  const dateFields = ['birthDate', 'hireDate'];
  for (const k of dateFields) {
    if (out[k] === '' || out[k] === undefined) delete out[k];
  }

  // Licencias (subdocumento licenses[])
  if (Array.isArray(out.licenses)) {
    out.licenses = out.licenses.map((l) => ({
      number: typeof l.number === 'string' ? U(l.number.trim()) : l.number,
      type: typeof l.type === 'string' ? U(l.type.trim()) : l.type,
      issueDate: l.issueDate || null,
      expiryDate: l.expiryDate || null,
      issuer: typeof l.issuer === 'string' ? U(l.issuer.trim()) : l.issuer,
    }));
  }

  return out;
}

// ===== Scope helpers =====
// Nota: esto asume que existe un middleware que setea req.branchFilter (read scope)
// y que req.user trae roles + branchId/branchIds.
// Si no existe, lo ajustamos al middleware real que tengas.
function assertBranchWriteScope(req, branchId) {
  const roles = req.user?.roles || [];
  const isGlobal = roles.includes('global') || roles.includes('admin');
  if (isGlobal) return true;

  const allowed = [];
  if (Array.isArray(req.user?.branchIds)) allowed.push(...req.user.branchIds.map(String));
  if (req.user?.branchId) allowed.push(String(req.user.branchId));

  if (!allowed.includes(String(branchId))) {
    const err = new Error('No autorizado para operar en esta sucursal');
    err.status = 403;
    throw err;
  }
  return true;
}

async function ensureInReadScope(req, personId) {
  const filter = { _id: personId, ...(req.branchFilter || {}) };
  const exists = await Person.findOne(filter).select('_id').lean();
  if (!exists) {
    const err = new Error('No encontrado');
    err.status = 404;
    throw err;
  }
}

// ===== Controllers =====
export async function list(req, res, next) {
  try {
    const page = Number.parseInt(req.query.page ?? '1', 10) || 1;
    const limit = Number.parseInt(req.query.limit ?? '10', 10) || 10;
    const q = String(req.query.q || '').trim();

    const filter = { ...(req.branchFilter || {}) };

    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.positionId) filter.positionId = req.query.positionId;
    if (req.query.active !== undefined && req.query.active !== '') {
      filter.active = String(req.query.active) === 'true';
    }

    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [{ dni: rx }, { firstName: rx }, { lastName: rx }, { email: rx }];
    }

    const result = await Person.findPaged({
      filter,
      page,
      limit,
      sort: { lastName: 1, firstName: 1 },
      populate: [
        { path: 'branchId', select: 'code name' },
        { path: 'positionId', select: 'code name' },
      ],
    });

    return res.json(result); // tu paginate normalmente devuelve {items,total,page,limit,pages}
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const { id } = req.params;
    await ensureInReadScope(req, id);

    const doc = await Person.findById(id)
      .populate('branchId', 'code name')
      .populate('positionId', 'code name')
      .lean();

    return res.json({ item: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const body = sanitizeBody(req.body || {});
    if (!body.branchId) {
      const err = new Error('branchId es obligatorio');
      err.status = 400;
      throw err;
    }
    assertBranchWriteScope(req, body.branchId);

    const created = await Person.create({
      ...body,
      createdBy: req.user?.uid,
      updatedBy: req.user?.uid,
    });

    const doc = await Person.findById(created._id)
      .populate('branchId', 'code name')
      .populate('positionId', 'code name')
      .lean();

    return res.status(201).json({ item: doc });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    await ensureInReadScope(req, id);

    const body = sanitizeBody(req.body || {});
    if (body.branchId) assertBranchWriteScope(req, body.branchId);

    const updated = await Person.findByIdAndUpdate(
      id,
      { ...body, updatedBy: req.user?.uid },
      { new: true }
    )
      .populate('branchId', 'code name')
      .populate('positionId', 'code name')
      .lean();

    return res.json({ item: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await ensureInReadScope(req, id);

    const doc = await Person.findById(id);
    if (!doc) {
      const err = new Error('No encontrado');
      err.status = 404;
      throw err;
    }

    if (typeof doc.softDelete === 'function') {
      await doc.softDelete(req.user?.uid);
    } else {
      await Person.findByIdAndDelete(id);
    }

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

function sanitizeLicense(l = {}) {
  const out = { ...l };

  if (typeof out.number === 'string') out.number = U(out.number.trim());
  if (typeof out.type === 'string') out.type = U(out.type.trim());
  if (typeof out.issuer === 'string') out.issuer = U(out.issuer.trim());

  // Fechas: limpiar vacíos y normalizar string -> Date
  for (const k of ['issueDate', 'expiryDate']) {
    if (out[k] === '' || out[k] === undefined || out[k] === null) delete out[k];
    if (typeof out[k] === 'string') {
      const d = new Date(out[k]);
      if (Number.isNaN(d.getTime())) delete out[k];
      else out[k] = d;
    }
  }

  return out;
}

export async function addLicense(req, res, next) {
  try {
    const { id } = req.params; // personId
    await ensureInReadScope(req, id);

    const person = await Person.findById(id);
    if (!person) return res.status(404).json({ message: 'No encontrado' });

    // Validar scope de escritura por sucursal
    assertBranchWriteScope(req, person.branchId);

    const lic = sanitizeLicense(req.body || {});
    if (!lic.number) return res.status(400).json({ message: 'number es obligatorio' });
    if (!lic.type) return res.status(400).json({ message: 'type es obligatorio' });

    person.licenses.push(lic);
    person.updatedBy = req.user?.uid;
    await person.save();

    return res.status(201).json({ item: person.licenses.at(-1) });
  } catch (err) {
    next(err);
  }
}

export async function updateLicense(req, res, next) {
  try {
    const { id, licenseId } = req.params;
    await ensureInReadScope(req, id);

    const person = await Person.findById(id);
    if (!person) return res.status(404).json({ message: 'No encontrado' });

    assertBranchWriteScope(req, person.branchId);

    const lic = person.licenses.id(licenseId);
    if (!lic) return res.status(404).json({ message: 'Licencia no encontrada' });

    const payload = sanitizeLicense(req.body || {});
    Object.assign(lic, payload);

    person.updatedBy = req.user?.uid;
    await person.save();

    return res.json({ item: lic });
  } catch (err) {
    next(err);
  }
}

export async function removeLicense(req, res, next) {
  try {
    const { id, licenseId } = req.params;
    await ensureInReadScope(req, id);

    const person = await Person.findById(id);
    if (!person) return res.status(404).json({ message: 'No encontrado' });

    assertBranchWriteScope(req, person.branchId);

    const lic = person.licenses.id(licenseId);
    if (!lic) return res.status(404).json({ message: 'Licencia no encontrada' });

    lic.deleteOne();
    person.updatedBy = req.user?.uid;
    await person.save();

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

