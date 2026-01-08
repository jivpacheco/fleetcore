// back/src/models/Vehicle.js
// -----------------------------------------------------------------------------
// Modelo de Vehículo (con bloque "support" y "audit")
// - support: estado de apoyo temporal a otra sucursal/vehículo
// - audit: trazabilidad de acciones relevantes (media, soporte, CRUD, etc.)
// -----------------------------------------------------------------------------
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const PhotoSchema = new Schema({
  category: { type: String, uppercase: true },
  title: { type: String },
  url: { type: String, required: true },
  publicId: { type: String },
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const DocumentSchema = new Schema({
  category: { type: String, uppercase: true },
  label: { type: String },
  url: { type: String, required: true },
  publicId: { type: String },
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const AssignmentSchema = new Schema({
  branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
  codeInternal: String,
  reason: String,        // TRASPASO / APOYO
  fromBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
  toBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
  note: String,
  startAt: Date,
  endAt: Date,
}, { _id: true });

const AuditSchema = new Schema({
  action: { type: String, uppercase: true }, // CREATE/UPDATE/DELETE/SUPPORT_START/SUPPORT_FINISH/MEDIA_ADD/MEDIA_DEL
  by: { type: String },                       // opcional: usuario (email o id)
  at: { type: Date, default: Date.now },
  data: { type: Schema.Types.Mixed },
}, { _id: true });

const LegalDateRange = {
  validFrom: Date,
  validTo: Date,
};

const LegalSchema = new Schema({
  padron: {
    number: { type: String, maxlength: 12 },
    issuer: { type: String, default: 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION', uppercase: true },
    // Compatibilidad antigua
    validFrom: Date,
    validTo: Date,
    // Nuevas
    acquisitionDate: Date,
    inscriptionDate: Date,
    issueDate: Date,
  },
  soap: {
    policy: String,
    issuer: String,
    ...LegalDateRange,
  },
  insurance: {
    policy: String,
    issuer: String,
    ...LegalDateRange,
  },
  tag: {
    number: String,
    issuer: String,
  },
  fuelCard: {
    issuer: String,
    number: String,
    validTo: Date,
  },
  // Nuevos bloques
  revisionTech: {
    number: String,
    issuer: String,
    reviewedAt: Date,
    validTo: Date,
  },
  circulationPermit: {
    number: String,
    issuer: String,
    issuedAt: Date,
    validTo: Date,
  },
}, { _id: false });

const VehicleSchema = new Schema({
  plate: { type: String, uppercase: true, required: true, index: true },
  internalCode: { type: String, uppercase: true, required: true, index: true },
  status: { type: String, uppercase: true, default: 'ACTIVE' },
  type: { type: String, uppercase: true },
  brand: { type: String, uppercase: true },
  model: { type: String, uppercase: true },
  year: Number,
  color: { type: String, uppercase: true },
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },

  vin: String,
  engineNumber: String,
  engineBrand: { type: String, uppercase: true },
  engineModel: { type: String, uppercase: true },
  fuelType: { type: String, uppercase: true },

  transmission: {
    type: { type: String, uppercase: true },
    brand: { type: String, uppercase: true },
    model: { type: String, uppercase: true },
    serial: { type: String, uppercase: true },
    gears: Number,
  },

  generator: { brand: { type: String, uppercase: true }, model: { type: String, uppercase: true }, serial: { type: String, uppercase: true } },
  pump:      { brand: { type: String, uppercase: true }, model: { type: String, uppercase: true }, serial: { type: String, uppercase: true } },
  body:      { brand: { type: String, uppercase: true }, model: { type: String, uppercase: true }, serial: { type: String, uppercase: true } },

  meters: {
    odometerKm: Number,
    engineHours: Number,
    ladderHours: Number,
    generatorHours: Number,
    pumpHours: Number,
  },

  legal: { type: LegalSchema, default: {} },

  photos: [PhotoSchema],
  documents: [DocumentSchema],
  assignments: [AssignmentSchema],

  // ====== Apoyo/Reemplazo ======
  support: {
    active: { type: Boolean, default: false },
    targetBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    targetVehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    replacementCode: { type: String, uppercase: true },       // sigla del target + 'R'
    originalInternalCode: { type: String, uppercase: true },  // para volver al finalizar
    startedAt: Date,
    endedAt: Date,
    totalMsServed: { type: Number, default: 0 }, // acumulado en milisegundos
  },

  // Auditoría
  audit: [AuditSchema],

}, { timestamps: true });

export default model('Vehicle', VehicleSchema);
