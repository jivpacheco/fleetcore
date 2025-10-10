// back/src/models/Vehicle.js
// -----------------------------------------------------------------------------
// Modelo Vehicle con trazabilidad completa y soporte Cloudinary.
// Reglas clave:
//  • plate: requerido, único, uppercase
//  • internalCode: requerido, único, uppercase (sigla institucional)
//  • Plugin findPaged para paginación estándar
// -----------------------------------------------------------------------------
import mongoose from 'mongoose'
import findPagedPlugin from '../plugins/findPaged.plugin.js'

const { Schema, model } = mongoose

// -----------------------------------------------------------------------------
// Referencias y subesquemas
// -----------------------------------------------------------------------------
const BranchRef = { type: Schema.Types.ObjectId, ref: 'Branch' }

const AssignmentSchema = new Schema({
  branch: BranchRef,
  codeInternal: String, // legado histórico (mantener si hay datos antiguos)
  reason: String,       // ASIGNACION | APOYO | TRASPASO
  fromBranch: BranchRef,
  toBranch: BranchRef,
  note: String,
  at: { type: Date, default: Date.now },
}, { _id: false })

const MediaSchema = new Schema({
  kind: { type: String, enum: ['photo', 'doc', 'manual'], required: true },
  title: String,
  url: String,
  publicId: String,
  bytes: Number,
  format: String,
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false })

const ComponentSchema = new Schema({
  type: String,
  brand: String,
  model: String,
  serial: String,
  description: String,
  media: [MediaSchema]
}, { _id: false })

const LegalSchema = new Schema({
  padron:    { number: String, issuer: String, validFrom: Date, validTo: Date },
  soap:      { policy: String, issuer: String, validFrom: Date, validTo: Date },
  insurance: { policy: String, issuer: String, validFrom: Date, validTo: Date },
  tag:       { number: String, issuer: String },
  fuelCard:  { issuer: String, number: String, validTo: Date, quota: Number }
}, { _id: false })

const MetersSchema = new Schema({
  odometerKm: Number,
  engineHours: Number,
  ladderHours: Number,
  generatorHours: Number,
  pumpHours: Number,
}, { _id: false })

const TyreAxleSchema = new Schema({
  axle: String, // delantero, trasero1, trasero2
  positionCount: Number,
  application: String,
  reference: String,
}, { _id: false })

const PhotoSchema = new Schema({
  url: String,
  publicId: String,
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true })

const DocumentSchema = new Schema({
  url: String,
  publicId: String,
  category: { type: String, default: 'legal' }, // legal | manuals | parts | videos
  label: { type: String, default: '' },
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true })

// -----------------------------------------------------------------------------
// Esquema principal
// -----------------------------------------------------------------------------
const VehicleSchema = new Schema({
  plate: {
    type: String,
    required: [true, 'La placa es obligatoria'],
    unique: true,
    trim: true,
    uppercase: true,
  },

  // ← Sigla institucional
  internalCode: {
    type: String,
    required: [true, 'El código interno (sigla institucional) es obligatorio'],
    unique: true,
    trim: true,
    uppercase: true,
  },

  type: String,
  brand: String,
  model: String,
  year: Number,
  vin: String,
  engineNumber: String,
  engineBrand: String,
  engineModel: String,
  color: String,

  branch: BranchRef, // opcional por ahora
  assignments: [AssignmentSchema],
  legal: LegalSchema,
  components: [ComponentSchema],
  tyres: [TyreAxleSchema],
  meters: MetersSchema,
  media: [MediaSchema],
  photos: [PhotoSchema],
  documents: [DocumentSchema],

  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
  deletedBy: String
}, { timestamps: true })

// -----------------------------------------------------------------------------
// Índices y plugin
// -----------------------------------------------------------------------------

// ❗ IMPORTANTE: evita duplicar índices. Como `internalCode` y `plate` ya son
// `unique` en el campo, NO declares VehicleSchema.index({ internalCode: 1 })
// ni VehicleSchema.index({ plate: 1 }) de nuevo.

// Mantén otros índices útiles:
VehicleSchema.index({ branch: 1 })

// Plugin de paginación estándar
VehicleSchema.plugin(findPagedPlugin)

export default model('Vehicle', VehicleSchema)
