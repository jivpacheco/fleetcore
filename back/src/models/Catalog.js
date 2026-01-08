// // // -----------------------------------------------------------------------------
// // // Índices únicos compuestos
// // // -----------------------------------------------------------------------------
// // // 1. (key + label): impide duplicar nombres dentro del mismo catálogo
// // // 2. (key + code):  impide duplicar códigos técnicos dentro del mismo catálogo
// // // -----------------------------------------------------------------------------
// // CatalogSchema.index({ key: 1, label: 1 }, { unique: true, sparse: true });
// // CatalogSchema.index({ key: 1, code: 1 }, { unique: true, sparse: true });

// // // Exportar el modelo
// // export default model('Catalog', CatalogSchema);

// // back/src/models/Catalog.js
// // -----------------------------------------------------------------------------
// // Catálogo genérico por `key` (p.ej. 'VEHICLE_STATUSES'):
// // - code (opcional) y label (obligatorio), ambos en MAYÚSCULAS.
// // - Índices únicos compuestos: (key,label) y (key,code) → evita duplicados.
// // - ¡OJO! No debe existir un índice único en `key` a secas.
// // -----------------------------------------------------------------------------
// import mongoose from 'mongoose';
// const { Schema, model } = mongoose;

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// const CatalogSchema = new Schema({
//   key:    { type: String, required: true, set: U },  // p.ej. 'VEHICLE_STATUSES'
//   code:   { type: String, set: U, default: '' },      // p.ej. 'ACTIVE' (opcional)
//   label:  { type: String, required: true, set: U },   // p.ej. 'ACTIVO'
//   order:  { type: Number, default: 0 },
//   active: { type: Boolean, default: true },
//   meta:   { type: Schema.Types.Mixed },
// }, { timestamps: true });

// // Índices compuestos únicos
// CatalogSchema.index({ key: 1, label: 1 }, { unique: true, sparse: true });
// CatalogSchema.index({ key: 1, code: 1 },  { unique: true, sparse: true });

// export default model('Catalog', CatalogSchema);


// // -----------------------------------------------------------------------------
// // Índices únicos compuestos
// // -----------------------------------------------------------------------------
// // 1. (key + label): impide duplicar nombres dentro del mismo catálogo
// // 2. (key + code):  impide duplicar códigos técnicos dentro del mismo catálogo
// // -----------------------------------------------------------------------------
// CatalogSchema.index({ key: 1, label: 1 }, { unique: true, sparse: true });
// CatalogSchema.index({ key: 1, code: 1 }, { unique: true, sparse: true });

// // Exportar el modelo
// export default model('Catalog', CatalogSchema);

// back/src/models/Catalog.js
// -----------------------------------------------------------------------------
// Catálogo genérico por `key` (p.ej. 'VEHICLE_STATUSES'):
// - code (opcional) y label (obligatorio), ambos en MAYÚSCULAS.
// - Índices únicos compuestos: (key,label) y (key,code) → evita duplicados.
// - ¡OJO! No debe existir un índice único en `key` a secas.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

const CatalogSchema = new Schema({
  key:    { type: String, required: true, set: U },  // p.ej. 'VEHICLE_STATUSES'
  code:   { type: String, set: U, default: '' },      // p.ej. 'ACTIVE' (opcional)
  label:  { type: String, required: true, set: U },   // p.ej. 'ACTIVO'
  order:  { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  meta:   { type: Schema.Types.Mixed },
}, { timestamps: true });

// Índices compuestos únicos
CatalogSchema.index({ key: 1, label: 1 }, { unique: true, sparse: true });
CatalogSchema.index({ key: 1, code: 1 },  { unique: true, sparse: true });

export default model('Catalog', CatalogSchema);

