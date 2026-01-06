// import DrivingTest from '../models/DrivingTest.js';

// export const listDrivingTests = async (req, res) => {
//   const { personId='', branchId='' } = req.query;
//   const f = {};
//   if (personId) f.personId = personId;
//   if (branchId) f.branchId = branchId;
//   res.json({ items: await DrivingTest.find(f).sort({ createdAt: -1 }).limit(500) });
// };

// export const getDrivingTest = async (req, res) => {
//   const item = await DrivingTest.findById(req.params.id);
//   if (!item) return res.status(404).json({ message: 'Prueba no encontrada' });
//   res.json({ item });
// };

// export const startDrivingTest = async (req, res) => {
//   const item = await DrivingTest.create({
//     ...req.body,
//     status: 'IN_PROGRESS',
//     startedAt: req.body.startedAt ? new Date(req.body.startedAt) : new Date(),
//   });
//   res.status(201).json({ item });
// };

// export const finishDrivingTest = async (req, res) => {
//   const item = await DrivingTest.findById(req.params.id);
//   if (!item) return res.status(404).json({ message: 'Prueba no encontrada' });

//   Object.assign(item, req.body, {
//     status: 'COMPLETED',
//     endedAt: req.body.endedAt ? new Date(req.body.endedAt) : new Date(),
//   });

//   await item.save();
//   res.json({ item });
// };

// export const deleteDrivingTest = async (req, res) => {
//   const item = await DrivingTest.findByIdAndDelete(req.params.id);
//   if (!item) return res.status(404).json({ message: 'Prueba no encontrada' });
//   res.json({ ok: true });
// };
//v2
// import DrivingTest from '../models/DrivingTest.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// function sanitize(body = {}) {
//   const out = { ...body };

//   // Normalizaciones típicas (ajusta según tu schema real)
//   if (typeof out.status === 'string') out.status = U(out.status.trim());

//   // Fechas: permitir string ISO
//   for (const k of ['startedAt', 'endedAt']) {
//     if (out[k] === '' || out[k] === undefined) delete out[k];
//     if (typeof out[k] === 'string') {
//       const d = new Date(out[k]);
//       out[k] = isNaN(d) ? undefined : d;
//       if (out[k] === undefined) delete out[k];
//     }
//   }

//   // Numericos
//   for (const k of ['distanceKm', 'durationSec']) {
//     if (out[k] === '' || out[k] === undefined) delete out[k];
//     if (out[k] !== undefined) out[k] = Number(out[k]);
//     if (out[k] !== undefined && !Number.isFinite(out[k])) delete out[k];
//   }

//   return out;
// }

// // Si tu app ya maneja scope por sucursal, agrega un filtro aquí.
// // Si no lo tienes en req.branchFilter, puedes omitirlo por ahora.
// function branchScopedFilter(req) {
//   return { ...(req.branchFilter || {}) };
// }

// export async function list(req, res, next) {
//   try {
//     const page  = Number.parseInt(req.query.page ?? '1', 10) || 1;
//     const limit = Number.parseInt(req.query.limit ?? '50', 10) || 50;

//     const personId = String(req.query.personId || '').trim();
//     const branchId = String(req.query.branchId || '').trim();

//     const filter = { ...branchScopedFilter(req) };
//     if (personId) filter.personId = personId;
//     if (branchId) filter.branchId = branchId;

//     // Si tu schema tiene paginate plugin:
//     if (typeof DrivingTest.findPaged === 'function') {
//       const result = await DrivingTest.findPaged({
//         filter,
//         page,
//         limit,
//         sort: { createdAt: -1 },
//         // populate: [{ path:'personId', select:'dni firstName lastName' }, ...] // si aplica
//       });
//       return res.json(result);
//     }

//     // Fallback si no hay findPaged
//     const p = Math.max(page, 1);
//     const l = Math.min(200, Math.max(limit, 1));
//     const [items, total] = await Promise.all([
//       DrivingTest.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
//       DrivingTest.countDocuments(filter),
//     ]);
//     return res.json({ items, total, page: p, limit: l });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function get(req, res, next) {
//   try {
//     const item = await DrivingTest.findById(req.params.id).lean();
//     if (!item) return res.status(404).json({ message: 'Prueba no encontrada' });
//     return res.json({ item });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function start(req, res, next) {
//   try {
//     const payload = sanitize(req.body || {});

//     const created = await DrivingTest.create({
//       ...payload,
//       status: 'IN_PROGRESS',
//       startedAt: payload.startedAt ? payload.startedAt : new Date(),
//       createdBy: req.user?.uid,
//       updatedBy: req.user?.uid,
//     });

//     return res.status(201).json({ item: created });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function finish(req, res, next) {
//   try {
//     const test = await DrivingTest.findById(req.params.id);
//     if (!test) return res.status(404).json({ message: 'Prueba no encontrada' });

//     const payload = sanitize(req.body || {});

//     Object.assign(test, payload, {
//       status: 'COMPLETED',
//       endedAt: payload.endedAt ? payload.endedAt : new Date(),
//       updatedBy: req.user?.uid,
//     });

//     await test.save();
//     return res.json({ item: test });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function remove(req, res, next) {
//   try {
//     const test = await DrivingTest.findById(req.params.id);
//     if (!test) return res.status(404).json({ message: 'Prueba no encontrada' });

//     // Soft delete si tu plugin auditSoftDelete está aplicado
//     if (typeof test.softDelete === 'function') {
//       await test.softDelete(req.user?.uid);
//       return res.json({ ok: true });
//     }

//     await DrivingTest.findByIdAndDelete(req.params.id);
//     return res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// }


// back/src/controllers/drivingTests.controller.js
import DrivingTest from '../models/DrivingTest.js';

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

function sanitize(body = {}) {
  const out = { ...body };

  // status (si viene) se normaliza
  if (typeof out.status === 'string') out.status = U(out.status.trim());

  // Fechas: permitir string ISO
  for (const k of ['startedAt', 'endedAt']) {
    if (out[k] === '' || out[k] === undefined) delete out[k];
    if (typeof out[k] === 'string') {
      const d = new Date(out[k]);
      if (Number.isNaN(d.getTime())) delete out[k];
      else out[k] = d;
    }
  }

  // Números
  for (const k of ['distanceKm', 'durationSec']) {
    if (out[k] === '' || out[k] === undefined) delete out[k];
    if (out[k] !== undefined) {
      const n = Number(out[k]);
      if (!Number.isFinite(n)) delete out[k];
      else out[k] = n;
    }
  }

  return out;
}

// Si usas branchScope y te deja req.branchFilter, esto se respeta.
function branchScopedFilter(req) {
  return { ...(req.branchFilter || {}) };
}

export async function list(req, res, next) {
  try {
    const page  = Number.parseInt(req.query.page ?? '1', 10) || 1;
    const limit = Number.parseInt(req.query.limit ?? '50', 10) || 50;

    const personId = String(req.query.personId || '').trim();
    const branchId = String(req.query.branchId || '').trim();
    const status   = String(req.query.status || '').trim();

    const filter = { ...branchScopedFilter(req) };
    if (personId) filter.personId = personId;
    if (branchId) filter.branchId = branchId;
    if (status)   filter.status = U(status);

    // preferir paginate plugin
    if (typeof DrivingTest.findPaged === 'function') {
      const result = await DrivingTest.findPaged({
        filter,
        page,
        limit,
        sort: { createdAt: -1 },
        // populate: [{ path:'personId', select:'dni firstName lastName' }, ...]
      });
      return res.json(result);
    }

    // fallback
    const p = Math.max(page, 1);
    const l = Math.min(200, Math.max(limit, 1));

    const [items, total] = await Promise.all([
      DrivingTest.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
      DrivingTest.countDocuments(filter),
    ]);

    return res.json({ items, total, page: p, limit: l });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const item = await DrivingTest.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Prueba no encontrada' });
    return res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function start(req, res, next) {
  try {
    const payload = sanitize(req.body || {});

    // Forzamos estado IN_PROGRESS aquí
    const created = await DrivingTest.create({
      ...payload,
      status: 'IN_PROGRESS',
      startedAt: payload.startedAt ? payload.startedAt : new Date(),
      createdBy: req.user?.uid,
      updatedBy: req.user?.uid,
    });

    return res.status(201).json({ item: created });
  } catch (err) {
    next(err);
  }
}

export async function finish(req, res, next) {
  try {
    const test = await DrivingTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Prueba no encontrada' });

    // Reglas mínimas de estado
    if (test.status === 'COMPLETED') {
      return res.status(409).json({ message: 'La prueba ya está COMPLETED' });
    }
    if (test.status !== 'IN_PROGRESS') {
      return res.status(409).json({ message: `No se puede finalizar desde estado ${test.status}` });
    }

    const payload = sanitize(req.body || {});
    const endedAt = payload.endedAt ? payload.endedAt : new Date();

    if (test.startedAt && endedAt < test.startedAt) {
      return res.status(400).json({ message: 'endedAt no puede ser menor que startedAt' });
    }

    Object.assign(test, payload, {
      status: 'COMPLETED',
      endedAt,
      updatedBy: req.user?.uid,
    });

    await test.save();
    return res.json({ item: test });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const test = await DrivingTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Prueba no encontrada' });

    if (typeof test.softDelete === 'function') {
      await test.softDelete(req.user?.uid);
      return res.json({ ok: true });
    }

    await DrivingTest.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
