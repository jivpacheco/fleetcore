// back/src/plugins/findPaged.plugin.js
// -----------------------------------------------------------------------------
// Plugin Mongoose: agrega Model.findPaged(query, scope)
// - Soporta filtros comunes (q, plate, type, branch) y scope adicional (p.ej. por sucursal).
// - Devuelve { items, page, limit, total, pages } ordenado por -createdAt.
// - Robusto ante parámetros faltantes.
// -----------------------------------------------------------------------------
export default function findPagedPlugin(schema) {
  schema.statics.findPaged = async function (rawQuery = {}, scope = {}) {
    const page  = Math.max(parseInt(rawQuery.page ?? 1, 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(rawQuery.limit ?? 10, 10) || 10, 1), 200)

    const { q = '', plate = '', type = '', branch = '' } = rawQuery

    const rx = (s) => new RegExp(String(s).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    // Filtros base
    const filter = { ...scope }

    // Búsqueda libre
    if (q && String(q).trim()) {
      const r = rx(q)
      filter.$or = [
        { plate: r },
        { internalCode: r },
        { brand: r },
        { model: r },
        { type: r },
      ]
    }

    // Filtros directos
    if (plate && String(plate).trim()) filter.plate = rx(plate)
    if (type && String(type).trim())   filter.type  = rx(type)
    if (branch && String(branch).trim()) filter.branch = branch  // suele ser ObjectId en string

    // Opcional: excluir soft-deleted si tu esquema lo maneja
    // if (!('withDeleted' in rawQuery)) filter.deletedAt = { $exists: false }

    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      this.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.countDocuments(filter),
    ])

    return {
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    }
  }
}
