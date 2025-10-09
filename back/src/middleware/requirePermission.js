const ROLE_PERMS = {
  admin: ['*'],
  global: ['vehicles:read','vehicles:create','vehicles:update','vehicles:delete','vehicles:transfer'],
  jefeTaller: ['vehicles:read','vehicles:update','vehicles:transfer'],
  bodega: ['vehicles:read'],
  tecnico: ['vehicles:read'],
};

export function requirePermission(perm){
  return (req,res,next)=>{
    const roles = req.user?.roles || [];
    const all = roles.flatMap(r=>ROLE_PERMS[r]||[]);
    if(all.includes('*')||all.includes(perm)) return next();
    res.status(403).json({message:'Forbidden'});
  };
}
