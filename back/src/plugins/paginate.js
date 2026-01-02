// export default function paginate(schema){
//   schema.statics.findPaged = async function({ filter={}, page=1, limit=20, sort={ createdAt:-1 }, select=null, populate=null }){
//     const skip = (Number(page)-1)*Number(limit);
//     const [data, total] = await Promise.all([
//       this.find(filter).select(select).populate(populate).sort(sort).skip(skip).limit(Number(limit)).lean(),
//       this.countDocuments(filter)
//     ]);
//     return { data, total, page: Number(page), limit: Number(limit) };
//   }
// }

export default function paginate(schema){
  /**
   * Paginación server-side uniforme.
   * Devuelve: { data, total, page, limit, pages }
   *
   * Nota:
   * - Si el esquema usa soft-delete (isDeleted), por defecto excluimos eliminados.
   * - populate puede ser string, objeto o array (igual que Mongoose).
   */
  schema.statics.findPaged = async function({
    filter = {},
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select = null,
    populate = null,
  } = {}){
    const p = Math.max(Number.parseInt(page, 10) || 1, 1)
    const l = Math.max(Number.parseInt(limit, 10) || 10, 1)
    const skip = (p - 1) * l

    // Soft-delete por defecto
    const hasIsDeleted = Boolean(this.schema?.paths?.isDeleted)
    const baseFilter = hasIsDeleted && filter?.isDeleted === undefined
      ? { isDeleted: false, ...(filter || {}) }
      : (filter || {})

    const q = this.find(baseFilter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(l)

    if (populate) q.populate(populate)

    const [data, total] = await Promise.all([
      q.lean(),
      this.countDocuments(baseFilter),
    ])

    return { data, total, page: p, limit: l, pages: Math.ceil(total / l) }
  }
}
