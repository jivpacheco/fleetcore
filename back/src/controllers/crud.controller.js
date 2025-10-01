// export function makeCrudController(Model){
//   return {
//     list: async (req,res)=>{
//       const { page=1, limit=20, q, ...raw } = req.query;
//       const filter = { ...(req.branchFilter||{}), ...(raw||{}) };
//       if(q && Model.schema.paths.name){ filter.name = { $regex: q, $options:'i' }; }
//       const result = await Model.findPaged({ filter, page, limit });
//       res.json(result);
//     },
//     get: async (req,res)=>{
//       const doc = await Model.findById(req.params.id).lean();
//       if(!doc) return res.status(404).json({ error:'Not found' });
//       res.json(doc);
//     },
//     create: async (req,res)=>{
//       const doc = await Model.create({ ...req.body, createdBy: req.user?.uid });
//       res.status(201).json(doc);
//     },
//     update: async (req,res)=>{
//       const { id } = req.params;
//       const doc = await Model.findByIdAndUpdate(id, { ...req.body, updatedBy: req.user?.uid }, { new:true });
//       if(!doc) return res.status(404).json({ error:'Not found' });
//       res.json(doc);
//     },
//     remove: async (req,res)=>{
//       const { id } = req.params;
//       const doc = await Model.findById(id);
//       if(!doc) return res.status(404).json({ error:'Not found' });
//       if(typeof doc.softDelete === 'function'){ await doc.softDelete(req.user?.uid); }
//       else { await Model.findByIdAndDelete(id); }
//       res.json({ ok:true });
//     }
//   }
// }
// Controlador CRUD genérico con paginación { data, total, page, limit }
// - Defaults: page=1, limit=10
// - Sanitiza filtros de query para evitar operadores peligrosos
export function makeCrudController(Model){
  const ALLOWED_FILTERS = new Set([
    'status','branchId','vehicleId','priority','code','plate'
  ]) // ajusta por modelo

  const sanitizeRaw = (raw = {}) => {
    const out = {}
    for (const [k,v] of Object.entries(raw)) {
      if (k === 'page' || k === 'limit' || k === 'q') continue
      if (k.startsWith('$')) continue
      if (ALLOWED_FILTERS.size && !ALLOWED_FILTERS.has(k)) continue
      out[k] = v
    }
    return out
  }

  return {
    list: async (req,res,next)=>{
      try{
        const page  = Number.parseInt(req.query.page ?? '1', 10) || 1
        const limit = Number.parseInt(req.query.limit ?? '10', 10) || 10
        const q     = req.query.q
        const raw   = sanitizeRaw(req.query)
        const filter = { ...(req.branchFilter || {}), ...(raw || {}) }
        if (q && Model.schema.paths.name) {
          filter.name = { $regex: q, $options:'i' }
        }
        // Tu plugin Model.findPaged debe devolver: { data,total,page,limit }
        const result = await Model.findPaged({ filter, page, limit })
        return res.json(result)
      }catch(err){ next(err) }
    },

    get: async (req,res,next)=>{
      try{
        const doc = await Model.findById(req.params.id).lean()
        if(!doc) return res.status(404).json({ error:'Not found' })
        return res.json(doc)
      }catch(err){ next(err) }
    },

    create: async (req,res,next)=>{
      try{
        const doc = await Model.create({ ...req.body, createdBy: req.user?.uid })
        return res.status(201).json(doc)
      }catch(err){ next(err) }
    },

    update: async (req,res,next)=>{
      try{
        const { id } = req.params
        const doc = await Model.findByIdAndUpdate(
          id,
          { ...req.body, updatedBy: req.user?.uid },
          { new:true }
        )
        if(!doc) return res.status(404).json({ error:'Not found' })
        return res.json(doc)
      }catch(err){ next(err) }
    },

    remove: async (req,res,next)=>{
      try{
        const { id } = req.params
        const doc = await Model.findById(id)
        if(!doc) return res.status(404).json({ error:'Not found' })
        if (typeof doc.softDelete === 'function') {
          await doc.softDelete(req.user?.uid)
        } else {
          await Model.findByIdAndDelete(id)
        }
        return res.json({ ok:true })
      }catch(err){ next(err) }
    }
  }
}
