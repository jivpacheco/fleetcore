// back/templates/resource.controller.template.js
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Controller template (CRUD + paginación)
// -----------------------------------------------------------------------------
// import Model from "../models/<Resource>.js";

export async function list(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const q = String(req.query.q || "").trim();

    // TODO: implementar filtro q/active según modelo
    // const filter = q ? { name: new RegExp(q, "i") } : {};
    // const [items, total] = await Promise.all([
    //   Model.find(filter).skip((page-1)*limit).limit(limit).lean(),
    //   Model.countDocuments(filter),
    // ]);

    return res.json({ items: [], total: 0, page, limit });
  } catch (e) {
    next(e);
  }
}

export async function get(req, res, next) {
  try {
    const { id } = req.params;
    // const item = await Model.findById(id).lean();
    // if (!item) return res.status(404).json({ message: "No encontrado" });
    return res.json({ item: null });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    // const created = await Model.create(req.body);
    return res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    // const updated = await Model.findByIdAndUpdate(id, req.body, { new: true }).lean();
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    // await Model.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
