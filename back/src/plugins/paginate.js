export default function paginate(schema){
  schema.statics.findPaged = async function({ filter={}, page=1, limit=20, sort={ createdAt:-1 }, select=null, populate=null }){
    const skip = (Number(page)-1)*Number(limit);
    const [data, total] = await Promise.all([
      this.find(filter).select(select).populate(populate).sort(sort).skip(skip).limit(Number(limit)).lean(),
      this.countDocuments(filter)
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }
}