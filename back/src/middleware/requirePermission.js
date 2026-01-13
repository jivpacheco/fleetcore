// const ROLE_PERMS = {
//   // Acceso total
//   admin: ['*'],

//   // Global: opera transversalmente
//   global: [
//     'vehicles:read','vehicles:create','vehicles:update','vehicles:delete','vehicles:transfer',
//     'people:read','people:create','people:update','people:delete',
//     'positions:read','positions:manage',
//     'roles:read','roles:manage',
    

//   ],

//   // Operación
//   jefeTaller: ['vehicles:read','vehicles:update','vehicles:transfer','people:read'],
//   bodega: ['vehicles:read','people:read'],
//   tecnico: ['vehicles:read','people:read'],
// };

// /**
//  * requirePermission('a') -> exige 'a'
//  * requirePermission('a','b') -> exige 'a' OR 'b'
//  */
// export default function requirePermission(...permsRequired) {
//   return (req, res, next) => {
//     const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
//     const allPerms = roles.flatMap(r => ROLE_PERMS[String(r)] || []);

//     // si no se pidió permiso específico, permite
//     if (!permsRequired.length) return next();

//     // super permiso
//     if (allPerms.includes('*')) return next();

//     // OR: si cumple alguno
//     const ok = permsRequired.some(p => allPerms.includes(p));
//     if (ok) return next();

//     return res.status(403).json({ message: 'Forbidden' });
//   };
// }
    

// back/src/middleware/requirePermission.js
//
// Autorización por permisos (RBAC)
// - El JWT trae req.user.roles como array de códigos de rol (ej: ['ADMIN','APPROVER'])
// - Cada Role en DB contiene permissions: ['people.read','workOrders.approve', ...]
// - Se permite '*' como wildcard total.
//
// NOTA: Mantiene compatibilidad con permisos tipo 'people:read' (colon) y 'people.read' (dot).

import Role from '../models/Role.js'

const CACHE_TTL_MS = 30_000
const rolePermCache = new Map() // code -> { at:number, perms:Set<string> }

function normalizePerm(p) {
  return String(p || '').trim()
}

async function getPermsForRoleCode(code) {
  // const c = String(code || '').trim()
  const c = String(code || '').trim().toUpperCase()


  if (!c) return new Set()

  const hit = rolePermCache.get(c)
  const now = Date.now()
  if (hit && (now - hit.at) < CACHE_TTL_MS) return hit.perms

  const doc = await Role.findOne({ code: c, active: { $ne: false } }).lean()
  const perms = new Set((doc?.permissions || []).map(normalizePerm).filter(Boolean))

  // Compat: si el rol no existe en DB y es 'admin', damos wildcard.
  if (!doc && c.toLowerCase() === 'admin') perms.add('*')

  rolePermCache.set(c, { at: now, perms })
  return perms
}

export default function requirePermission(requiredPerm) {
  const required = normalizePerm(requiredPerm)

  return async (req, res, next) => {
    try {
      const roleCodes = req.user?.roles || []

      // Atajo: admin por rol en token
      if (roleCodes.some(r => String(r).toLowerCase() === 'admin')) return next()

      const all = new Set()

      for (const rc of roleCodes) {
        const perms = await getPermsForRoleCode(rc)
        for (const p of perms) all.add(p)
      }

      if (all.has('*')) return next()

      // Compat colon/dot: si piden 'people.read' y está 'people:read'
      const alt = required.includes('.') ? required.replace('.', ':') :
                  required.includes(':') ? required.replace(':', '.') : null

      if (all.has(required) || (alt && all.has(alt))) return next()

      return res.status(403).json({ message: 'No autorizado', required: required })
    } catch (err) {
      return res.status(500).json({ message: 'Error en autorización', error: err?.message })
    }
  }
}
