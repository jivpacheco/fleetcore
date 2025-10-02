// export function requireRole(...roles){
//   return (req,res,next)=>{
//     const user = req.user || {};
//     if(!user.roles) return res.status(403).json({ error: 'No roles' });
//     const ok = roles.some(r => user.roles.includes(r));
//     return ok ? next() : res.status(403).json({ error: 'Forbidden' });
//   };
// }

// back/src/middleware/roles.js
//
// Autorización por roles
// - requireRole('admin') → exige al menos 1 rol del listado

export function requireRole(...allowedRoles) {
  const set = new Set(allowedRoles)
  return (req, res, next) => {
    const roles = req.user?.roles || []
    const ok = roles.some(r => set.has(r))
    if (!ok) return res.status(403).json({ message: 'No autorizado' })
    next()
  }
}

