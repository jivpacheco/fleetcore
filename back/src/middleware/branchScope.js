export function branchScope(req,res,next){
  const isGlobal = (req.user?.roles||[]).includes('global');
  req.branchFilter = isGlobal ? {} : { branchId: { $in: req.user.branchIds || [] } };
  next();
}