// export function branchScope(req,res,next){
//   const isGlobal = (req.user?.roles||[]).includes('global');
//   req.branchFilter = isGlobal ? {} : { branchId: { $in: req.user.branchIds || [] } };
//   next();
// }
// Filtra por sucursales según req.user (roles/branchIds/branchId)
// Recomendado usar junto a requireAuth para que req.user exista.
export function branchScope(req,res,next){
  const roles = req.user?.roles || []
  const isGlobal = roles.includes('global')

  if (isGlobal) {
    req.branchFilter = {} // acceso total
  } else if (Array.isArray(req.user?.branchIds) && req.user.branchIds.length) {
    req.branchFilter = { branchId: { $in: req.user.branchIds } }
  } else if (req.user?.branchId) {
    req.branchFilter = { branchId: req.user.branchId }
  } else {
    // Sin info de sucursal y no global → no retorna nada (seguro por defecto)
    req.branchFilter = { _id: { $exists: false } }
  }
  next()
}
