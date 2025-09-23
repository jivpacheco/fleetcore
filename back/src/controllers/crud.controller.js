export function makeCrudController(Model){
  return {
    list: async (req,res)=>{
      const { page=1, limit=20, q, ...raw } = req.query;
      const filter = { ...(req.branchFilter||{}), ...(raw||{}) };
      if(q && Model.schema.paths.name){ filter.name = { $regex: q, $options:'i' }; }
      const result = await Model.findPaged({ filter, page, limit });
      res.json(result);
    },
    get: async (req,res)=>{
      const doc = await Model.findById(req.params.id).lean();
      if(!doc) return res.status(404).json({ error:'Not found' });
      res.json(doc);
    },
    create: async (req,res)=>{
      const doc = await Model.create({ ...req.body, createdBy: req.user?.uid });
      res.status(201).json(doc);
    },
    update: async (req,res)=>{
      const { id } = req.params;
      const doc = await Model.findByIdAndUpdate(id, { ...req.body, updatedBy: req.user?.uid }, { new:true });
      if(!doc) return res.status(404).json({ error:'Not found' });
      res.json(doc);
    },
    remove: async (req,res)=>{
      const { id } = req.params;
      const doc = await Model.findById(id);
      if(!doc) return res.status(404).json({ error:'Not found' });
      if(typeof doc.softDelete === 'function'){ await doc.softDelete(req.user?.uid); }
      else { await Model.findByIdAndDelete(id); }
      res.json({ ok:true });
    }
  }
}