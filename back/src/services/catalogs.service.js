import Catalog from '../models/Catalog.js'

export async function getByKey(key) {
    const doc = await Catalog.findOne({ key: String(key).toUpperCase() }).lean()
    if (!doc) throw new Error('not_found')
    return doc
}

export async function upsertItem(key, item) {
    const k = String(key).toUpperCase()
    const update = {
        $push: {
            items: {
                code: item.code, label: item.label, active: item.active !== false
            }
        }
    }
    const doc = await Catalog.findOneAndUpdate({ key: k }, update, {
        new: true, upsert: true, setDefaultsOnInsert: true
    }).lean()
    return doc
}

export async function updateItem(key, itemId, patch) {
    const k = String(key).toUpperCase()
    const doc = await Catalog.findOne({ key: k })
    if (!doc) throw new Error('not_found')
    const it = doc.items.id(itemId)
    if (!it) throw new Error('not_found')
    if (patch.code !== undefined) it.code = String(patch.code).toUpperCase()
    if (patch.label !== undefined) it.label = String(patch.label).toUpperCase()
    if (patch.active !== undefined) it.active = !!patch.active
    await doc.save()
    return doc.toObject()
}

export async function removeItem(key, itemId) {
    const k = String(key).toUpperCase()
    const doc = await Catalog.findOne({ key: k })
    if (!doc) throw new Error('not_found')
    const it = doc.items.id(itemId)
    if (!it) throw new Error('not_found')
    it.deleteOne()
    await doc.save()
    return doc.toObject()
}
