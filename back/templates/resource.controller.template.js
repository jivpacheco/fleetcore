// back/templates/resource.controller.template.js
// -----------------------------------------------------------------------------
// Plantilla FleetCore v1.0 - Controller (list con contrato estándar)
// - GET list: { items, total, page, limit }
// - Soporta: page, limit, q (+ filtros)
// -----------------------------------------------------------------------------
export async function list(req, res) {
  const page = Math.max(1, Number(req.query.page || 1))
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)))
  const q = String(req.query.q || '').trim()

  // TODO: construir filtro
  const filter = {}
  if (q) {
    // Ejemplo: búsqueda simple por code/name (ajustar por entidad)
    filter.$or = [
      { code: new RegExp(q, 'i') },
      { name: new RegExp(q, 'i') },
    ]
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Model.countDocuments(filter),
  ])

  res.json({ items, total, page, limit })
}
