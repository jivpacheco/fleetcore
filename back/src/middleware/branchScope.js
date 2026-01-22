// export function branchScope(req,res,next){
//   const isGlobal = (req.user?.roles||[]).includes('global');
//   req.branchFilter = isGlobal ? {} : { branchId: { $in: req.user.branchIds || [] } };
//   next();
// }

// // Filtra por sucursales según req.user (roles/branchIds/branchId)
// // Recomendado usar junto a requireAuth para que req.user exista.
// export function branchScope(req,res,next){
//   const roles = req.user?.roles || []
//   const isGlobal = roles.includes('global')

//   if (isGlobal) {
//     req.branchFilter = {} // acceso total
//   } else if (Array.isArray(req.user?.branchIds) && req.user.branchIds.length) {
//     req.branchFilter = { branchId: { $in: req.user.branchIds } }
//   } else if (req.user?.branchId) {
//     req.branchFilter = { branchId: req.user.branchId }
//   } else {
//     // Sin info de sucursal y no global → no retorna nada (seguro por defecto)
//     req.branchFilter = { _id: { $exists: false } }
//   }
//   next()
// }
// version obsoleta
// // back/src/middleware/branchScope.js
// // -----------------------------------------------------------------------------
// // Filtra por sucursales según req.user (roles/branchIds/branchId)
// // - Para modelos "normales" usa branchId (campo en el documento)
// // - Para el recurso /branches (Branch model), debe filtrar por _id
// // -----------------------------------------------------------------------------
// export function branchScope(req, res, next) {
//   const rolesRaw = req.user?.roles || []
//   const roles = rolesRaw.map(r => String(r || '').toUpperCase())

//   // GLOBAL o SUPERADMIN = acceso total
//   const isGlobal = roles.includes('GLOBAL') || roles.includes('SUPERADMIN')

//   // ¿Estamos listando /branches?
//   // En /api/v1/branches -> req.baseUrl normalmente termina en '/branches'
//   const isBranchesResource = String(req.baseUrl || '').endsWith('/branches')

//   if (isGlobal) {
//     req.branchFilter = {}
//     return next()
//   }

//   // Si el usuario trae branchIds (array)
//   if (Array.isArray(req.user?.branchIds) && req.user.branchIds.length) {
//     req.branchFilter = isBranchesResource
//       ? { _id: { $in: req.user.branchIds } }            // ✅ PARA BRANCHES
//       : { branchId: { $in: req.user.branchIds } }       // ✅ PARA MODELOS CON branchId
//     return next()
//   }

//   // Si el usuario trae branchId único
//   if (req.user?.branchId) {
//     req.branchFilter = isBranchesResource
//       ? { _id: req.user.branchId }                      // ✅ PARA BRANCHES
//       : { branchId: req.user.branchId }                 // ✅ PARA MODELOS CON branchId
//     return next()
//   }

//   // Sin info de sucursal y no global → no retorna nada (seguro por defecto)
//   req.branchFilter = { _id: { $exists: false } }
//   next()
// }

// back/src/middleware/branchScope.js
export function branchScope(req, res, next) {
  const rolesRaw = req.user?.roles || []
  const roles = rolesRaw.map(r => String(r || '').toLowerCase())

  // Define acceso total:
  // - global
  // - superadmin
  // - admin (porque tus rutas permiten admin como acceso “global” a catálogos)
  const isGlobal = roles.includes('global') || roles.includes('superadmin') || roles.includes('admin')

  // recurso /branches debe filtrar por _id
  const isBranchesResource = String(req.baseUrl || '').endsWith('/branches')

  if (isGlobal) {
    req.branchFilter = {}
    return next()
  }

  // branchIds
  if (Array.isArray(req.user?.branchIds) && req.user.branchIds.length) {
    req.branchFilter = isBranchesResource
      ? { _id: { $in: req.user.branchIds } }
      : { branchId: { $in: req.user.branchIds } }
    return next()
  }

  // branchId
  if (req.user?.branchId) {
    req.branchFilter = isBranchesResource
      ? { _id: req.user.branchId }
      : { branchId: req.user.branchId }
    return next()
  }

  // seguro por defecto
  req.branchFilter = { _id: { $exists: false } }
  next()
}
