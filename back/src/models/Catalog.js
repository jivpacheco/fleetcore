// Modelo genérico de catálogos (clave + items)
// items: [{ code, label, active }]
import mongoose from 'mongoose'
const { Schema, model } = mongoose

const toUpper = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

const CatalogItemSchema = new Schema({
    code: { type: String, required: true, set: toUpper },
    label: { type: String, required: true, set: toUpper },
    active: { type: Boolean, default: true }
}, { _id: true, timestamps: false })

const CatalogSchema = new Schema({
    key: { type: String, required: true, unique: true, set: toUpper }, // p.ej. VEHICLE_STATUSES
    items: { type: [CatalogItemSchema], default: [] },
    remark: { type: String, set: toUpper }
}, { timestamps: true })

CatalogSchema.index({ key: 1 }, { unique: true })

export default model('Catalog', CatalogSchema)
