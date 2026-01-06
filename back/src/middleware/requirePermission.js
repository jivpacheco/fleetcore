const ROLE_PERMS = {
  // Acceso total
  admin: ['*'],

  // Global: opera transversalmente
  global: [
    'vehicles:read','vehicles:create','vehicles:update','vehicles:delete','vehicles:transfer',
    'people:read','people:create','people:update','people:delete',
    'positions:read','positions:manage',
    'roles:read','roles:manage',
    

  ],

  // Operación
  jefeTaller: ['vehicles:read','vehicles:update','vehicles:transfer','people:read'],
  bodega: ['vehicles:read','people:read'],
  tecnico: ['vehicles:read','people:read'],
};

/**
 * requirePermission('a') -> exige 'a'
 * requirePermission('a','b') -> exige 'a' OR 'b'
 */
export default function requirePermission(...permsRequired) {
  return (req, res, next) => {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const allPerms = roles.flatMap(r => ROLE_PERMS[String(r)] || []);

    // si no se pidió permiso específico, permite
    if (!permsRequired.length) return next();

    // super permiso
    if (allPerms.includes('*')) return next();

    // OR: si cumple alguno
    const ok = permsRequired.some(p => allPerms.includes(p));
    if (ok) return next();

    return res.status(403).json({ message: 'Forbidden' });
  };
}

// Si en algún sitio aún haces: import { requirePermission } ...
// puedes descomentar este alias para compatibilidad:
// export { requirePermission };


//V2
// const ROLE_PERMS = {
//   // Acceso total
//   admin: ['*'],

//   // Global: opera transversalmente
//   global: [
//     'vehicles:read','vehicles:create','vehicles:update','vehicles:delete','vehicles:transfer',
//     'people:read','people:create','people:update','people:delete',
//     'positions:manage',
//   ],

//   // Operación
//   jefeTaller: ['vehicles:read','vehicles:update','vehicles:transfer','people:read'],
//   bodega: ['vehicles:read','people:read'],
//   tecnico: ['vehicles:read','people:read'],
// };

// export function requirePermission(perm){
//   return (req,res,next)=>{
//     const roles = req.user?.roles || [];
//     const all = roles.flatMap(r => ROLE_PERMS[r] || []);
//     if (all.includes('*') || all.includes(perm)) return next();
//     return res.status(403).json({ message: 'Forbidden' });
//   };
// }



// const ROLE_PERMS = {
//   admin: ['*'],
//   global: ['vehicles:read','vehicles:create','vehicles:update','vehicles:delete','vehicles:transfer'],
//   jefeTaller: ['vehicles:read','vehicles:update','vehicles:transfer'],
//   bodega: ['vehicles:read'],
//   tecnico: ['vehicles:read'],
// };

// export function requirePermission(perm){
//   return (req,res,next)=>{
//     const roles = req.user?.roles || [];
//     const all = roles.flatMap(r=>ROLE_PERMS[r]||[]);
//     if(all.includes('*')||all.includes(perm)) return next();
//     res.status(403).json({message:'Forbidden'});
//   };
// }
