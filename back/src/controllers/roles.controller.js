// import Role from '../models/Role.js';

// function buildOrgFilter(req) {
//   // organizationId NO se fuerza por ahora.
//   // Si existe (futuro o admin global), filtramos por org.
//   const orgId = req?.user?.organizationId || null;
//   return orgId ? { organizationId: orgId } : { organizationId: null };
// }

// export async function listRoles(req, res) {
//   const filter = { active: true, ...buildOrgFilter(req) };
//   const items = await Role.find(filter).sort({ name: 1 });
//   return res.json({ items });
// }

// export async function createRole(req, res) {
//   const orgFilter = buildOrgFilter(req);

//   const payload = {
//     code: req.body.code,
//     name: req.body.name,
//     permissions: Array.isArray(req.body.permissions) ? req.body.permissions : [],
//     scope: req.body.scope || 'BRANCH',
//     active: req.body.active !== false,
//     isSystem: !!req.body.isSystem,
//     organizationId: orgFilter.organizationId ?? null,
//   };

//   const created = await Role.create(payload);
//   return res.status(201).json(created);
// }

// export async function updateRole(req, res) {
//   const { id } = req.params;
//   const role = await Role.findById(id);
//   if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

//   if (role.isSystem) {
//     return res.status(403).json({ message: 'No se puede modificar un rol del sistema' });
//   }

//   if (typeof req.body.code === 'string') role.code = req.body.code;
//   if (typeof req.body.name === 'string') role.name = req.body.name;
//   if (Array.isArray(req.body.permissions)) role.permissions = req.body.permissions;
//   if (typeof req.body.scope === 'string') role.scope = req.body.scope;
//   if (typeof req.body.active === 'boolean') role.active = req.body.active;

//   await role.save();
//   return res.json(role);
// }

// export async function deleteRole(req, res) {
//   const { id } = req.params;
//   const role = await Role.findById(id);
//   if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

//   if (role.isSystem) {
//     return res.status(403).json({ message: 'No se puede eliminar un rol del sistema' });
//   }

//   role.active = false;
//   await role.save();
//   return res.status(204).end();
// }

// //v2 01082026
// import Role from '../models/Role.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// function sanitize(body = {}) {
//   const out = { ...body };

//   if (typeof out.code === 'string') out.code = U(out.code.trim());
//   if (typeof out.name === 'string') out.name = out.name.trim();

//   // scope: normaliza a uppercase y valida
//   if (typeof out.scope === 'string') out.scope = U(out.scope.trim());
//   if (out.scope && !['GLOBAL', 'BRANCH'].includes(out.scope)) {
//     const err = new Error('scope inválido (GLOBAL | BRANCH)');
//     err.status = 400;
//     throw err;
//   }

//   // permissions: array de strings trim, sin vacíos, unique
//   if (Array.isArray(out.permissions)) {
//     const norm = out.permissions
//       .map(p => (typeof p === 'string' ? p.trim() : ''))
//       .filter(Boolean);
//     out.permissions = Array.from(new Set(norm));
//   }

//   // booleans
//   if (typeof out.active === 'string') out.active = out.active === 'true';
//   if (typeof out.isSystem === 'string') out.isSystem = out.isSystem === 'true';

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

//     // active opcional
//     if (req.query.active !== undefined && req.query.active !== '') {
//       filter.active = String(req.query.active) === 'true';
//     }

//     // scope opcional
//     if (req.query.scope) {
//       const scope = U(String(req.query.scope).trim());
//       if (!['GLOBAL', 'BRANCH'].includes(scope)) {
//         const err = new Error('scope inválido (GLOBAL | BRANCH)');
//         err.status = 400;
//         throw err;
//       }
//       filter.scope = scope;
//     }

//     // isSystem opcional
//     if (req.query.isSystem !== undefined && req.query.isSystem !== '') {
//       filter.isSystem = String(req.query.isSystem) === 'true';
//     }

//     // búsqueda
//     if (q) {
//       const rx = new RegExp(q, 'i');
//       filter.$or = [{ name: rx }, { code: rx }];
//     }

//     const result = await Role.findPaged({
//       filter,
//       page,
//       limit,
//       sort: { name: 1, code: 1 },
//     });

//     return res.json(result);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function get(req, res, next) {
//   try {
//     const doc = await Role.findById(req.params.id).lean();
//     if (!doc) return res.status(404).json({ message: 'No encontrado' });
//     return res.json({ item: doc });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function create(req, res, next) {
//   try {
//     const payload = sanitize(req.body || {});
//     if (!payload.code) return res.status(400).json({ message: 'code es obligatorio' });
//     if (!payload.name) return res.status(400).json({ message: 'name es obligatorio' });

//     if (req?.user?.organizationId) payload.organizationId = req.user.organizationId;

//     const created = await Role.create({
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
//     const role = await Role.findById(req.params.id);
//     if (!role) return res.status(404).json({ message: 'No encontrado' });

//     if (role.isSystem) {
//       return res.status(403).json({ message: 'No se puede modificar un rol del sistema' });
//     }

//     const payload = sanitize(req.body || {});
//     // No permitir cambiar organizationId desde aquí (future-safe)
//     delete payload.organizationId;
//     delete payload.isSystem; // no permitir elevar a system desde UI

//     Object.assign(role, payload, { updatedBy: req.user?.uid });
//     await role.save();

//     return res.json({ item: role });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function remove(req, res, next) {
//   try {
//     const role = await Role.findById(req.params.id);
//     if (!role) return res.status(404).json({ message: 'No encontrado' });

//     if (role.isSystem) {
//       return res.status(403).json({ message: 'No se puede eliminar un rol del sistema' });
//     }

//     if (typeof role.softDelete === 'function') {
//       await role.softDelete(req.user?.uid);
//       return res.json({ ok: true });
//     }

//     // fallback
//     role.active = false;
//     role.updatedBy = req.user?.uid;
//     await role.save();

//     return res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// }

import Role from '../models/Role.js';

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

function sanitize(body = {}) {
  const out = { ...body };

  if (typeof out.code === 'string') out.code = U(out.code.trim());
  if (typeof out.name === 'string') out.name = out.name.trim();

  // scope: normaliza a uppercase y valida
  if (typeof out.scope === 'string') out.scope = U(out.scope.trim());
  if (out.scope && !['GLOBAL', 'BRANCH'].includes(out.scope)) {
    const err = new Error('scope inválido (GLOBAL | BRANCH)');
    err.status = 400;
    throw err;
  }

  // permissions: array de strings trim, sin vacíos, unique
  if (Array.isArray(out.permissions)) {
    const norm = out.permissions
      .map(p => (typeof p === 'string' ? p.trim() : ''))
      .filter(Boolean);
    out.permissions = Array.from(new Set(norm));
  }

  // booleans
  if (typeof out.active === 'string') out.active = out.active === 'true';
  if (typeof out.isSystem === 'string') out.isSystem = out.isSystem === 'true';

  return out;
}

// Multi-tenant “preparado”, NO forzado.
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

    // active opcional
    if (req.query.active !== undefined && req.query.active !== '') {
      filter.active = String(req.query.active) === 'true';
    }

    // scope opcional
    if (req.query.scope) {
      const scope = U(String(req.query.scope).trim());
      if (!['GLOBAL', 'BRANCH'].includes(scope)) {
        const err = new Error('scope inválido (GLOBAL | BRANCH)');
        err.status = 400;
        throw err;
      }
      filter.scope = scope;
    }

    // isSystem opcional
    if (req.query.isSystem !== undefined && req.query.isSystem !== '') {
      filter.isSystem = String(req.query.isSystem) === 'true';
    }

    // búsqueda
    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [{ name: rx }, { code: rx }];
    }

    const result = await Role.findPaged({
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
    const doc = await Role.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'No encontrado' });
    return res.json({ item: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const payload = sanitize(req.body || {});
    if (!payload.code) return res.status(400).json({ message: 'code es obligatorio' });
    if (!payload.name) return res.status(400).json({ message: 'name es obligatorio' });

    if (req?.user?.organizationId) payload.organizationId = req.user.organizationId;

    const created = await Role.create({
      ...payload,
      createdBy: req.user?.uid,
      updatedBy: req.user?.uid,
    });

    return res.status(201).json({ item: created });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'No encontrado' });

    if (role.isSystem) {
      return res.status(403).json({ message: 'No se puede modificar un rol del sistema' });
    }

    const payload = sanitize(req.body || {});
    // No permitir cambiar organizationId desde aquí (future-safe)
    delete payload.organizationId;
    delete payload.isSystem; // no permitir elevar a system desde UI

    Object.assign(role, payload, { updatedBy: req.user?.uid });
    await role.save();

    return res.json({ item: role });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'No encontrado' });

    if (role.isSystem) {
      return res.status(403).json({ message: 'No se puede eliminar un rol del sistema' });
    }

    if (typeof role.softDelete === 'function') {
      await role.softDelete(req.user?.uid);
      return res.json({ ok: true });
    }

    // fallback
    role.active = false;
    role.updatedBy = req.user?.uid;
    await role.save();

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
