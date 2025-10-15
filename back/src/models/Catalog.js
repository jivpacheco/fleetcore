// // Modelo genérico de catálogos (clave + items)
// // items: [{ code, label, active }]
// import mongoose from 'mongoose'
// const { Schema, model } = mongoose

// const toUpper = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

// const CatalogItemSchema = new Schema({
//     code: { type: String, required: true, set: toUpper },
//     label: { type: String, required: true, set: toUpper },
//     active: { type: Boolean, default: true }
// }, { _id: true, timestamps: false })

// const CatalogSchema = new Schema({
//     key: { type: String, required: true, unique: true, set: toUpper }, // p.ej. VEHICLE_STATUSES
//     items: { type: [CatalogItemSchema], default: [] },
//     remark: { type: String, set: toUpper }
// }, { timestamps: true })

// CatalogSchema.index({ key: 1 }, { unique: true })

// export default model('Catalog', CatalogSchema)

// back/src/models/Catalog.js
// -----------------------------------------------------------------------------
// Catálogo simple con clave única `key` y arreglo de items.
// Evita índices duplicados: definimos el índice una sola vez en el campo.
// -----------------------------------------------------------------------------

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CatalogItemSchema = new Schema(
    {
        value: { type: String, required: true },      // valor interno (p.ej. 'ACTIVE')
        label: { type: String, required: true },      // etiqueta visible (p.ej. 'ACTIVO')
        meta: { type: Schema.Types.Mixed },          // opcional: color, icono, orden, etc.
        order: { type: Number, default: 0 },          // para ordenar
        active: { type: Boolean, default: true },
    },
    { _id: true, timestamps: false }
);

const CatalogSchema = new Schema(
    {
        // CLAVE ÚNICA DEL CATÁLOGO (p.ej. 'vehicle_statuses')
        key: { type: String, required: true, unique: true, index: true },

        // ÍTEMS DEL CATÁLOGO
        items: { type: [CatalogItemSchema], default: [] },

        // Auditoría simple
        createdBy: { type: String },
        updatedBy: { type: String },
    },
    { timestamps: true }
);

// IMPORTANTE: No repetir índices con schema.index({ key:1 })
// Si alguna vez necesitas más índices, agrégalos aquí, pero evita duplicar {key:1}.

export default model('Catalog', CatalogSchema);
