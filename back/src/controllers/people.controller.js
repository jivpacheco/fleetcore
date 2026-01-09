// // back/src/controllers/people.controller.js
// import Person from '../models/Person.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// function sanitizeBody(body = {}) {
//   const out = { ...body };

//   // Strings a MAYÚSCULAS (salvo email)
//   const upperFields = ['dni', 'firstName', 'lastName', 'birthPlace', 'nationality', 'phone'];
//   for (const k of upperFields) {
//     if (typeof out[k] === 'string') out[k] = U(out[k].trim());
//   }
//   if (typeof out.email === 'string') out.email = out.email.trim().toLowerCase();

//   // Fechas: si vienen vacías, elimínalas (evita Date inválidas)
//   const dateFields = ['birthDate', 'hireDate'];
//   for (const k of dateFields) {
//     if (out[k] === '' || out[k] === undefined) delete out[k];
//   }

//   // Licencias (subdocumento licenses[])
//   if (Array.isArray(out.licenses)) {
//     out.licenses = out.licenses.map((l) => ({
//       number: typeof l.number === 'string' ? U(l.number.trim()) : l.number,
//       type: typeof l.type === 'string' ? U(l.type.trim()) : l.type,
//       issueDate: l.issueDate || null,
//       expiryDate: l.expiryDate || null,
//       issuer: typeof l.issuer === 'string' ? U(l.issuer.trim()) : l.issuer,
//     }));
//   }

//   return out;
// }

// // ===== Scope helpers =====
// // Nota: esto asume que existe un middleware que setea req.branchFilter (read scope)
// // y que req.user trae roles + branchId/branchIds.
// // Si no existe, lo ajustamos al middleware real que tengas.
// function assertBranchWriteScope(req, branchId) {
//   const roles = req.user?.roles || [];
//   const isGlobal = roles.includes('global') || roles.includes('admin');
//   if (isGlobal) return true;

//   const allowed = [];
//   if (Array.isArray(req.user?.branchIds)) allowed.push(...req.user.branchIds.map(String));
//   if (req.user?.branchId) allowed.push(String(req.user.branchId));

//   if (!allowed.includes(String(branchId))) {
//     const err = new Error('No autorizado para operar en esta sucursal');
//     err.status = 403;
//     throw err;
//   }
//   return true;
// }

// async function ensureInReadScope(req, personId) {
//   const filter = { _id: personId, ...(req.branchFilter || {}) };
//   const exists = await Person.findOne(filter).select('_id').lean();
//   if (!exists) {
//     const err = new Error('No encontrado');
//     err.status = 404;
//     throw err;
//   }
// }

// // ===== Controllers =====
// export async function list(req, res, next) {
//   try {
//     const page = Number.parseInt(req.query.page ?? '1', 10) || 1;
//     const limit = Number.parseInt(req.query.limit ?? '10', 10) || 10;
//     const q = String(req.query.q || '').trim();

//     const filter = { ...(req.branchFilter || {}) };

//     if (req.query.branchId) filter.branchId = req.query.branchId;
//     if (req.query.positionId) filter.positionId = req.query.positionId;
//     if (req.query.active !== undefined && req.query.active !== '') {
//       filter.active = String(req.query.active) === 'true';
//     }

//     if (q) {
//       const rx = new RegExp(q, 'i');
//       filter.$or = [{ dni: rx }, { firstName: rx }, { lastName: rx }, { email: rx }];
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
//     });

//     return res.json(result); // tu paginate normalmente devuelve {items,total,page,limit,pages}
//   } catch (err) {
//     next(err);
//   }
// }

// export async function get(req, res, next) {
//   try {
//     const { id } = req.params;
//     await ensureInReadScope(req, id);

//     const doc = await Person.findById(id)
//       .populate('branchId', 'code name')
//       .populate('positionId', 'code name')
//       .lean();

//     return res.json({ item: doc });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function create(req, res, next) {
//   try {
//     const body = sanitizeBody(req.body || {});
//     if (!body.branchId) {
//       const err = new Error('branchId es obligatorio');
//       err.status = 400;
//       throw err;
//     }
//     assertBranchWriteScope(req, body.branchId);

//     const created = await Person.create({
//       ...body,
//       createdBy: req.user?.uid,
//       updatedBy: req.user?.uid,
//     });

//     const doc = await Person.findById(created._id)
//       .populate('branchId', 'code name')
//       .populate('positionId', 'code name')
//       .lean();

//     return res.status(201).json({ item: doc });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function update(req, res, next) {
//   try {
//     const { id } = req.params;
//     await ensureInReadScope(req, id);

//     const body = sanitizeBody(req.body || {});
//     if (body.branchId) assertBranchWriteScope(req, body.branchId);

//     const updated = await Person.findByIdAndUpdate(
//       id,
//       { ...body, updatedBy: req.user?.uid },
//       { new: true }
//     )
//       .populate('branchId', 'code name')
//       .populate('positionId', 'code name')
//       .lean();

//     return res.json({ item: updated });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function remove(req, res, next) {
//   try {
//     const { id } = req.params;
//     await ensureInReadScope(req, id);

//     const doc = await Person.findById(id);
//     if (!doc) {
//       const err = new Error('No encontrado');
//       err.status = 404;
//       throw err;
//     }

//     if (typeof doc.softDelete === 'function') {
//       await doc.softDelete(req.user?.uid);
//     } else {
//       await Person.findByIdAndDelete(id);
//     }

//     return res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// }

// function sanitizeLicense(l = {}) {
//   const out = { ...l };

//   if (typeof out.number === 'string') out.number = U(out.number.trim());
//   if (typeof out.type === 'string') out.type = U(out.type.trim());
//   if (typeof out.issuer === 'string') out.issuer = U(out.issuer.trim());

//   // Fechas: limpiar vacíos y normalizar string -> Date
//   for (const k of ['issueDate', 'expiryDate']) {
//     if (out[k] === '' || out[k] === undefined || out[k] === null) delete out[k];
//     if (typeof out[k] === 'string') {
//       const d = new Date(out[k]);
//       if (Number.isNaN(d.getTime())) delete out[k];
//       else out[k] = d;
//     }
//   }

//   return out;
// }

// export async function addLicense(req, res, next) {
//   try {
//     const { id } = req.params; // personId
//     await ensureInReadScope(req, id);

//     const person = await Person.findById(id);
//     if (!person) return res.status(404).json({ message: 'No encontrado' });

//     // Validar scope de escritura por sucursal
//     assertBranchWriteScope(req, person.branchId);

//     const lic = sanitizeLicense(req.body || {});
//     if (!lic.number) return res.status(400).json({ message: 'number es obligatorio' });
//     if (!lic.type) return res.status(400).json({ message: 'type es obligatorio' });

//     person.licenses.push(lic);
//     person.updatedBy = req.user?.uid;
//     await person.save();

//     return res.status(201).json({ item: person.licenses.at(-1) });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function updateLicense(req, res, next) {
//   try {
//     const { id, licenseId } = req.params;
//     await ensureInReadScope(req, id);

//     const person = await Person.findById(id);
//     if (!person) return res.status(404).json({ message: 'No encontrado' });

//     assertBranchWriteScope(req, person.branchId);

//     const lic = person.licenses.id(licenseId);
//     if (!lic) return res.status(404).json({ message: 'Licencia no encontrada' });

//     const payload = sanitizeLicense(req.body || {});
//     Object.assign(lic, payload);

//     person.updatedBy = req.user?.uid;
//     await person.save();

//     return res.json({ item: lic });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function removeLicense(req, res, next) {
//   try {
//     const { id, licenseId } = req.params;
//     await ensureInReadScope(req, id);

//     const person = await Person.findById(id);
//     if (!person) return res.status(404).json({ message: 'No encontrado' });

//     assertBranchWriteScope(req, person.branchId);

//     const lic = person.licenses.id(licenseId);
//     if (!lic) return res.status(404).json({ message: 'Licencia no encontrada' });

//     lic.deleteOne();
//     person.updatedBy = req.user?.uid;
//     await person.save();

//     return res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// }

// back/src/controllers/people.controller.js
import Person from '../models/Person.js';
import { normalizeRUN } from '../utils/run.js';

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

function sanitizeBody(body = {}) {
  const out = { ...body };

  // Strings a MAYÚSCULAS (salvo email)
  const upperFields = ['dni', 'firstName', 'lastName', 'birthPlace', 'nationality', 'phone'];
  for (const k of upperFields) {
    if (typeof out[k] === 'string') out[k] = U(out[k].trim());
  }

  // RUN (Chile): normalizar a 12345678-K (sin puntos)
  if (typeof out.dni === 'string') out.dni = normalizeRUN(out.dni);
  if (typeof out.email === 'string') out.email = out.email.trim().toLowerCase();

  // Fechas: si vienen vacías, elimínalas (evita Date inválidas)
  const dateFields = ['birthDate', 'hireDate'];
  for (const k of dateFields) {
    if (out[k] === '' || out[k] === undefined) delete out[k];
  }

  // Licencias (subdocumento licenses[])
  if (Array.isArray(out.licenses)) {
    out.licenses = out.licenses.map((l) => ({
      // Legacy
      number: typeof l.number === 'string' ? U(l.number.trim()) : l.number,
      issueDate: l.issueDate || null,
      expiryDate: l.expiryDate || null,

      // Nuevo
      folioNumber: typeof l.folioNumber === 'string' ? U(l.folioNumber.trim()) : l.folioNumber,
      type: typeof l.type === 'string' ? U(l.type.trim()) : l.type,
      firstIssuedAt: l.firstIssuedAt || null,
      issuedAt: l.issuedAt || null,
      nextControlAt: l.nextControlAt || null,

      issuer: typeof l.issuer === 'string' ? U(l.issuer.trim()) : l.issuer,
    }));
  }

  // Autorización de conducción (tab Pruebas)
  if (out.driverAuthorization && typeof out.driverAuthorization === 'object') {
    const da = { ...out.driverAuthorization };
    if (da.authorizedAt === '' || da.authorizedAt === undefined) delete da.authorizedAt;
    if (typeof da.authorizedAt === 'string') {
      const d = new Date(da.authorizedAt);
      if (Number.isNaN(d.getTime())) delete da.authorizedAt;
      else da.authorizedAt = d;
    }
    if (typeof da.note === 'string') da.note = da.note.trim();
    out.driverAuthorization = da;
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

const LICENSE_TYPES_CL = ['C','B','A4','A5','A2','A2*','A1','A1*','A3','D','E','F'];

function sanitizeLicense(l = {}) {
  const out = { ...l };

  // Legacy
  if (typeof out.number === 'string') out.number = U(out.number.trim());

  // Nuevo
  if (typeof out.folioNumber === 'string') out.folioNumber = U(out.folioNumber.trim());
  if (typeof out.type === 'string') out.type = U(out.type.trim());
  if (typeof out.issuer === 'string') out.issuer = U(out.issuer.trim());

  if (out.type && !LICENSE_TYPES_CL.includes(out.type)) {
    const err = new Error(`Tipo de licencia inválido: ${out.type}`);
    err.status = 400;
    throw err;
  }

  // Fechas: limpiar vacíos y normalizar string -> Date
  for (const k of ['issueDate', 'expiryDate', 'firstIssuedAt', 'issuedAt', 'nextControlAt']) {
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
    if (!lic.type) return res.status(400).json({ message: 'type es obligatorio' });

    // Regla: evitar duplicados por tipo (Chile). Si existe, responder 409 con el licenseId.
    const existing = person.licenses.find((x) => String(x.type || '') === String(lic.type || ''));
    if (existing) {
      // Permitir upsert explícito (útil si el front quiere resolver sin 2 llamadas)
      if (String(req.query.upsert || '').toLowerCase() === 'true') {
        Object.assign(existing, lic);
        person.updatedBy = req.user?.uid;
        await person.save();
        return res.json({ item: existing, upserted: true });
      }
      return res.status(409).json({ message: 'Ya existe una licencia con ese tipo', licenseId: existing._id });
    }

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

