// back/src/models/Vehicle.js
// Modelo Vehicle con trazabilidad completa, técnica, legal, medidores y medios por categoría.
// Normaliza strings a MAYÚSCULAS en setters.

import mongoose from 'mongoose'
import findPagedPlugin from '../plugins/findPaged.plugin.js'

const { Schema, model } = mongoose

const toUpper = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

// ---------- Sub-esquemas ----------

const BranchRef = { type: Schema.Types.ObjectId, ref: 'Branch' }

const AssignmentSchema = new Schema({
  branch: BranchRef,
  codeInternal: { type: String, set: toUpper },
  reason: { type: String, set: toUpper }, // ASIGNACION, APOYO, TRASPASO
  fromBranch: BranchRef,
  toBranch: BranchRef,
  note: { type: String, set: toUpper },
  startAt: Date,
  endAt: Date,
  at: { type: Date, default: Date.now },
}, { _id: false })

const MediaSchema = new Schema({
  // Para tarjetas específicas: category = 'basic'|'engine'|'transmission'|'generator'|'pump'|'body'|'technical'|'legal'|'manuals'|'parts'|'videos'
  category: { type: String, set: toUpper },
  title: { type: String, set: toUpper },
  kind: { type: String, enum: ['photo', 'doc', 'manual', 'video'], set: toUpper },
  url: String,
  publicId: String,
  bytes: Number,
  format: String,
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false })

const ComponentSchema = new Schema({
  // Componentes técnicos genéricos
  category: { type: String, set: toUpper }, // GENERATOR|PUMP|BODY|OTHER
  type: { type: String, set: toUpper },
  brand: { type: String, set: toUpper },
  model: { type: String, set: toUpper },
  serial: { type: String, set: toUpper },
  description: { type: String, set: toUpper },
  media: [MediaSchema]
}, { _id: false })

const LegalSchema = new Schema({
  padron:    { number: {type:String,set:toUpper}, issuer: {type:String,set:toUpper}, validFrom: Date, validTo: Date },
  soap:      { policy: {type:String,set:toUpper}, issuer: {type:String,set:toUpper}, validFrom: Date, validTo: Date },
  insurance: { policy: {type:String,set:toUpper}, issuer: {type:String,set:toUpper}, validFrom: Date, validTo: Date },
  tag:       { number: {type:String,set:toUpper}, issuer: {type:String,set:toUpper} },
  fuelCard:  { issuer: {type:String,set:toUpper}, number: {type:String,set:toUpper}, validTo: Date, quota: Number }
}, { _id: false })

const MetersSchema = new Schema({
  odometerKm: Number,
  engineHours: Number,
  ladderHours: Number,
  generatorHours: Number,
  pumpHours: Number,
}, { _id: false })

const TyreAxleSchema = new Schema({
  axle: { type:String, set: toUpper }, // FRONT, REAR1, REAR2
  positionCount: Number,
  application: { type:String, set: toUpper },
  reference: { type:String, set: toUpper },
  tires: [{
    role: { type:String, set: toUpper }, // DIRECTIONAL|TRACTION|MIXED
    brand: { type:String, set: toUpper },
    model: { type:String, set: toUpper },
    size:  { type:String, set: toUpper },
    serial:{ type:String, set: toUpper },
    media: [MediaSchema]
  }]
}, { _id: false })

const PhotoSchema = new Schema({
  category: { type: String, set: toUpper },
  title: { type: String, set: toUpper },
  url: String,
  publicId: String,
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true })

const DocumentSchema = new Schema({
  category: { type: String, set: toUpper }, // LEGAL|MANUALS|PARTS|VIDEOS
  label: { type: String, set: toUpper },
  url: String,
  publicId: String,
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true })

const TransmissionSchema = new Schema({
  type:   { type:String, enum:['MANUAL','AUTOMATIC','AMT','CVT'], set: toUpper, required: false },
  brand:  { type:String, set: toUpper },
  model:  { type:String, set: toUpper },
  serial: { type:String, set: toUpper },
  gears:  Number,
}, { _id:false })

const BatteriesSchema = new Schema({
  brand: { type:String, set: toUpper },
  model: { type:String, set: toUpper },
  capacityAh: Number,
  voltageV: Number,
  qty: Number,
  notes: { type:String, set: toUpper },
}, { _id:false })

// ---------- Schema principal ----------

const VehicleSchema = new Schema({
  // Básico (OBLIGATORIO)
  plate: { type: String, required: true, unique: true, set: toUpper },
  internalCode: { type: String, required: true, unique: true, set: toUpper },
  status: { type: String, required: true, enum: ['ACTIVE','SUPPORT','IN_REPAIR','OUT_OF_SERVICE','RETIRED'], set: toUpper },

  type: { type:String, required:true, set: toUpper },
  brand: { type:String, required:true, set: toUpper },
  model: { type:String, required:true, set: toUpper },
  year:  { type:Number, required:true },
  color: { type:String, required:true, set: toUpper },

  // Relaciones
  branch: { ...BranchRef, required: true },

  // Técnico
  vin: { type:String, set: toUpper },
  engineNumber: { type:String, set: toUpper },
  engineBrand:  { type:String, set: toUpper },
  engineModel:  { type:String, set: toUpper },
  fuelType:     { type:String, set: toUpper },

  transmission: TransmissionSchema,
  batteries: [BatteriesSchema],
  tyres: [TyreAxleSchema],

  // Equipos técnicos específicos (generador/motobomba/cuerpo de bomba)
  generator: {
    brand:{type:String,set:toUpper}, model:{type:String,set:toUpper}, serial:{type:String,set:toUpper},
    media: [MediaSchema]
  },
  pump: { // motobomba
    brand:{type:String,set:toUpper}, model:{type:String,set:toUpper}, serial:{type:String,set:toUpper},
    media: [MediaSchema]
  },
  body: { // cuerpo de bomba
    brand:{type:String,set:toUpper}, model:{type:String,set:toUpper}, serial:{type:String,set:toUpper},
    media: [MediaSchema]
  },

  meters: MetersSchema,

  // Legal & Media
  legal: LegalSchema,
  media: [MediaSchema],   // uso general si quisieras centralizar
  photos: [PhotoSchema],  // usado por /photos
  documents: [DocumentSchema], // usado por /documents

  // Trazabilidad
  assignments: [AssignmentSchema],

  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String,
  deletedAt: Date,
  deletedBy: String
}, { timestamps: true })

// Índices
VehicleSchema.index({ internalCode: 1 }, { unique: true })
VehicleSchema.index({ branch: 1 })
VehicleSchema.index({ status: 1 })
VehicleSchema.plugin(findPagedPlugin)

export default model('Vehicle', VehicleSchema)
