// import Position from '../models/Position.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// function sanitize(body = {}) {
//   const out = { ...body }
//   if (typeof out.code === 'string') out.code = U(out.code.trim())
//   if (typeof out.name === 'string') out.name = out.name.trim()
//   if (typeof out.description === 'string') out.description = out.description.trim()
//   return out
// }

// export async function list(req,res,next){
//   try{
//     const page  = Number.parseInt(req.query.page ?? '1', 10) || 1
//     const limit = Number.parseInt(req.query.limit ?? '50', 10) || 50
//     const q = String(req.query.q || '').trim()

//     const filter = {}
//     if (req.query.active !== undefined && req.query.active !== '') {
//       filter.active = String(req.query.active) === 'true'
//     }
//     if (q) {
//       const rx = new RegExp(q, 'i')
//       filter.$or = [{ name: rx }, { code: rx }]
//     }

//     const result = await Position.findPaged({
//       filter,
//       page,
//       limit,
//       sort: { name: 1 },
//     })
//     return res.json(result)
//   }catch(err){ next(err) }
// }

// export async function get(req,res,next){
//   try{
//     const doc = await Position.findById(req.params.id).lean()
//     if(!doc) return res.status(404).json({ message:'No encontrado' })
//     return res.json({ item: doc })
//   }catch(err){ next(err) }
// }

// export async function create(req,res,next){
//   try{
//     const created = await Position.create({ ...sanitize(req.body||{}), createdBy: req.user?.uid, updatedBy: req.user?.uid })
//     return res.status(201).json({ item: created })
//   }catch(err){ next(err) }
// }

// export async function update(req,res,next){
//   try{
//     const updated = await Position.findByIdAndUpdate(
//       req.params.id,
//       { ...sanitize(req.body||{}), updatedBy: req.user?.uid },
//       { new:true }
//     ).lean()
//     if(!updated) return res.status(404).json({ message:'No encontrado' })
//     return res.json({ item: updated })
//   }catch(err){ next(err) }
// }

// export async function remove(req,res,next){
//   try{
//     const doc = await Position.findById(req.params.id)
//     if(!doc) return res.status(404).json({ message:'No encontrado' })
//     if (typeof doc.softDelete === 'function') await doc.softDelete(req.user?.uid)
//     else await Position.findByIdAndDelete(req.params.id)
//     return res.json({ ok:true })
//   }catch(err){ next(err) }
// }


//v2

// import Position from '../models/Position.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// function sanitize(body = {}) {
//   const out = { ...body };
//   if (typeof out.code === 'string') out.code = U(out.code.trim());
//   if (typeof out.name === 'string') out.name = out.name.trim();
//   if (typeof out.description === 'string') out.description = out.description.trim();
//   return out;
// }

// // Multi-tenant “preparado”, NO forzado.
// // Si NO hay organizationId en req.user, no filtramos por org.
// function maybeOrgFilter(req) {
//   const orgId = req?.user?.organizationId;
//   return orgId ? { organizationId: orgId } : {};
// }

// export async function list(req, res, next) {
//   try {
//     const page = Number.parseInt(req.query.page ?? '1', 10) || 1;
//     const limit = Number.parseInt(req.query.limit ?? '50', 10) || 50;
//     const q = String(req.query.q || '').trim();

//     const filter = { ...maybeOrgFilter(req) };

//     // active (si viene explícito)
//     if (req.query.active !== undefined && req.query.active !== '') {
//       filter.active = String(req.query.active) === 'true';
//     }

//     // búsqueda
//     if (q) {
//       const rx = new RegExp(q, 'i');
//       filter.$or = [{ name: rx }, { code: rx }];
//     }

//     const result = await Position.findPaged({
//       filter,
//       page,
//       limit,
//       sort: { name: 1 },
//     });

//     return res.json(result);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function get(req, res, next) {
//   try {
//     const doc = await Position.findById(req.params.id).lean();
//     if (!doc) return res.status(404).json({ message: 'No encontrado' });
//     return res.json({ item: doc });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function create(req, res, next) {
//   try {
//     const payload = sanitize(req.body || {});
//     // Si en el futuro hay orgId, se setea; si no, queda null por default del schema
//     if (req?.user?.organizationId) payload.organizationId = req.user.organizationId;

//     const created = await Position.create({
//       ...payload,
//       createdBy: req.user?.uid,
//       updatedBy: req.user?.uid,
//     });

//     return res.status(201).json({ item: created });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function update(req, res, next) {
//   try {
//     const payload = sanitize(req.body || {});
//     // No tocar organizationId por update salvo que explícitamente lo soportes más adelante

//     const updated = await Position.findByIdAndUpdate(
//       req.params.id,
//       { ...payload, updatedBy: req.user?.uid },
//       { new: true }
//     ).lean();

//     if (!updated) return res.status(404).json({ message: 'No encontrado' });
//     return res.json({ item: updated });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function remove(req, res, next) {
//   try {
//     const doc = await Position.findById(req.params.id);
//     if (!doc) return res.status(404).json({ message: 'No encontrado' });

//     // Borrado lógico (auditSoftDelete) = estándar recomendado
//     if (typeof doc.softDelete === 'function') {
//       await doc.softDelete(req.user?.uid);
//       return res.json({ ok: true });
//     }

//     // Fallback (si no existe softDelete por algún motivo)
//     await Position.findByIdAndDelete(req.params.id);
//     return res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// }

//v2

// // back/src/controllers/positions.controller.js
// import Position from '../models/Position.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// function sanitize(body = {}) {
//   const out = { ...body };
//   if (typeof out.code === 'string') out.code = U(out.code.trim());
//   if (typeof out.name === 'string') out.name = out.name.trim();
//   if (typeof out.description === 'string') out.description = out.description.trim();

//   // active si viene como string "true/false"
//   if (typeof out.active === 'string') out.active = out.active === 'true';

//   return out;
// }

// // Multi-tenant “preparado”, NO forzado.
// function maybeOrgFilter(req) {
//   const orgId = req?.user?.organizationId;
//   return orgId ? { organizationId: orgId } : {};
// }

// export async function list(req, res, next) {
//   try {
//     const page = Number.parseInt(req.query.page ?? '1', 10) || 1;
//     const limit = Number.parseInt(req.query.limit ?? '50', 10) || 50;
//     const q = String(req.query.q || '').trim();

//     const filter = { ...maybeOrgFilter(req) };

//     if (req.query.active !== undefined && req.query.active !== '') {
//       filter.active = String(req.query.active) === 'true';
//     }

//     if (q) {
//       const rx = new RegExp(q, 'i');
//       filter.$or = [{ name: rx }, { code: rx }];
//     }

//     const result = await Position.findPaged({
//       filter,
//       page,
//       limit,
//       sort: { name: 1, code: 1 }, // estable y compatible con tu modelo
//     });

//     return res.json(result);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function get(req, res, next) {
//   try {
//     const doc = await Position.findById(req.params.id).lean();
//     if (!doc) return res.status(404).json({ message: 'No encontrado' });
//     return res.json({ item: doc });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function create(req, res, next) {
//   try {
//     const payload = sanitize(req.body || {});
//     if (req?.user?.organizationId) payload.organizationId = req.user.organizationId;

//     const created = await Position.create({
//       ...payload,
//       createdBy: req.user?.uid,
//       updatedBy: req.user?.uid,
//     });

//     return res.status(201).json({ item: created });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function update(req, res, next) {
//   try {
//     const payload = sanitize(req.body || {});
//     const updated = await Position.findByIdAndUpdate(
//       req.params.id,
//       { ...payload, updatedBy: req.user?.uid },
//       { new: true }
//     ).lean();

//     if (!updated) return res.status(404).json({ message: 'No encontrado' });
//     return res.json({ item: updated });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function remove(req, res, next) {
//   try {
//     const doc = await Position.findById(req.params.id);
//     if (!doc) return res.status(404).json({ message: 'No encontrado' });

//     if (typeof doc.softDelete === 'function') {
//       await doc.softDelete(req.user?.uid);
//       return res.json({ ok: true });
//     }

//     await Position.findByIdAndDelete(req.params.id);
//     return res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// }

// back/src/controllers/positions.controller.js
import Position from '../models/Position.js';

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

function sanitize(body = {}) {
  const out = { ...body };
  if (typeof out.code === 'string') out.code = U(out.code.trim());
  if (typeof out.name === 'string') out.name = out.name.trim();
  if (typeof out.description === 'string') out.description = out.description.trim();
  if (typeof out.active === 'string') out.active = out.active === 'true';
  return out;
}

function maybeOrgFilter(req) {
  const orgId = req?.user?.organizationId;
  return orgId ? { organizationId: orgId } : {};
}

export async function list(req, res, next) {
  try {
    const page = Number.parseInt(req.query.page ?? '1', 10) || 1;
    const limit = Number.parseInt(req.query.limit ?? '50', 10) || 50;
    const q = String(req.query.q || '').trim();

    const filter = { ...maybeOrgFilter(req) };

    if (req.query.active !== undefined && req.query.active !== '') {
      filter.active = String(req.query.active) === 'true';
    }

    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [{ name: rx }, { code: rx }];
    }

    const result = await Position.findPaged({
      filter,
      page,
      limit,
      sort: { name: 1, code: 1 },
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const doc = await Position.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'No encontrado' });
    return res.json({ item: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const payload = sanitize(req.body || {});
    if (!payload.name) return res.status(400).json({ message: 'name es obligatorio' });

    if (req?.user?.organizationId) payload.organizationId = req.user.organizationId;

    const created = await Position.create({
      ...payload,
      createdBy: req.user?.uid,
      updatedBy: req.user?.uid,
    });

    const item = await Position.findById(created._id).lean();
    return res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const payload = sanitize(req.body || {});
    delete payload.organizationId; // future-safe

    const updated = await Position.findByIdAndUpdate(
      req.params.id,
      { ...payload, updatedBy: req.user?.uid },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    return res.json({ item: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Position.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'No encontrado' });

    if (typeof doc.softDelete === 'function') {
      await doc.softDelete(req.user?.uid);
      return res.json({ ok: true });
    }

    await Position.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}




