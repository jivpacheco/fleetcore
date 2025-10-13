// back/src/models/Vehicle.js
// -----------------------------------------------------------------------------
// Modelo Vehicle con trazabilidad, estado, transmisión y soporte de media.
// Nota: todos los campos "básicos" pasan a ser obligatorios.
// -----------------------------------------------------------------------------
import mongoose from 'mongoose'
import findPagedPlugin from '../plugins/findPaged.plugin.js'

const { Schema, model } = mongoose

const BranchRef = { type: Schema.Types.ObjectId, ref: 'Branch', required: true }

// --- Subdocs -----------------------------------------------------------------
const AssignmentSchema = new Schema({
  branch: BranchRef,
  codeInternal: String,               // ej: B:10, BX-2
  reason: {                           // ASIGNACION|APOYO|TRASPASO
    type: String,
    enum: ['ASIGNACION', 'APOYO', 'TRASPASO'],
    default: 'ASIGNACION'
  },
  fromBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
  toBranch:   { type: Schema.Types.ObjectId, ref: 'Branch' },
  note: String,
  startAt: { type: Date, default: Date.now },
  endAt:   { type: Date, default: null },
}, { _id: false })

const MediaSchema = new Schema({
  kind: { type: String, enum: ['photo', 'doc', 'manual', 'video'], required: true },
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
  odometerKm:     Number,
  engineHours:    Number,
  ladderHours:    Number,
  generatorHours: Number,
  pumpHours:      Number,
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
  category: { type: String, default: 'legal' }, // legal|manuals|parts|videos
  label: { type: String, default: '' },
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true })

const TransmissionSchema = new Schema({
  type:  { type: String, enum: ['manual','automatic','amt','cvt'], required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  serial: String,
  gears: { type: Number, min: 1, max: 18 }
}, { _id: false })

// --- Vehicle -----------------------------------------------------------------
const VehicleSchema = new Schema({
  // Básicos (OBLIGATORIOS)
  plate:        { type: String, required: true, unique: true },
  internalCode: { type: String, required: true, index: true },
  type:         { type: String, required: true },
  brand:        { type: String, required: true },
  model:        { type: String, required: true },
  year:         { type: Number, required: true, min: 1900, max: 2100 },
  color:        { type: String, required: true },

  // Identificación extendida
  vin:          String,
  engineNumber: String,
  engineBrand:  String,
  engineModel:  String,

  // Estado operativo
  status: {
    type: String,
    enum: ['active','support','in_repair','out_of_service','retired'],
    default: 'active',
    index: true
  },

  // Relación con sucursal (OBLIGATORIO)
  branch: BranchRef,

  // Transmisión (OBLIGATORIO)
  transmission: { type: TransmissionSchema, required: true },

  // Subcolecciones
  assignments: [AssignmentSchema],
  legal:       LegalSchema,
  components:  [ComponentSchema],
  tyres:       [TyreAxleSchema],
  meters:      MetersSchema,

  // Media (ambas listas siguen disponibles)
  media:     [MediaSchema],   // opcional
  photos:    [PhotoSchema],
  documents: [DocumentSchema],

  // Auditoría / soft delete
  isActive:  { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
  deletedBy: String,
}, { timestamps: true })

// Índices (no duplicar el único de plate)
VehicleSchema.index({ internalCode: 1 })
VehicleSchema.index({ branch: 1 })

VehicleSchema.plugin(findPagedPlugin)

export default model('Vehicle', VehicleSchema)
