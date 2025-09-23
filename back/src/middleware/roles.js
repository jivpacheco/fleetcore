export function requireRole(...roles){
  return (req,res,next)=>{
    const user = req.user || {};
    if(!user.roles) return res.status(403).json({ error: 'No roles' });
    const ok = roles.some(r => user.roles.includes(r));
    return ok ? next() : res.status(403).json({ error: 'Forbidden' });
  };
}