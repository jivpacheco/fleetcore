// /////*********** VERSION ESTABLE 20/10/2025 */
// // back/src/models/Vehicle.js
// // -----------------------------------------------------------------------------
// // Modelo de Vehículo (añadimos bloque "support" y "audit" para reemplazos)
// // - support: estado de apoyo temporal a otra sucursal/vehículo
// // - audit: trazabilidad de acciones relevantes
// // -----------------------------------------------------------------------------
// import mongoose from 'mongoose';
// const { Schema, model } = mongoose;

// const PhotoSchema = new Schema({
//   category: { type: String, uppercase: true },
//   title: { type: String },
//   url: { type: String, required: true },
//   publicId: { type: String },
//   bytes: Number,
//   format: String,
//   createdAt: { type: Date, default: Date.now },
// }, { _id: true });

// const DocumentSchema = new Schema({
//   category: { type: String, uppercase: true },
//   label: { type: String },
//   url: { type: String, required: true },
//   publicId: { type: String },
//   bytes: Number,
//   format: String,
//   createdAt: { type: Date, default: Date.now },
// }, { _id: true });

// const AssignmentSchema = new Schema({
//   branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
//   codeInternal: String,
//   reason: String,        // TRASPASO / APOYO
//   fromBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
//   toBranch: { type: Schema.Types.ObjectId, ref: 'Branch' },
//   note: String,
//   startAt: Date,
//   endAt: Date,
// }, { _id: true });

// const AuditSchema = new Schema({
//   action: { type: String, uppercase: true }, // CREATE/UPDATE/DELETE/SUPPORT_START/SUPPORT_FINISH/MEDIA_ADD/MEDIA_DEL
//   by: { type: String },                       // opcional: usuario (email o id)
//   at: { type: Date, default: Date.now },
//   data: { type: Schema.Types.Mixed },
// }, { _id: true });

// const LegalDateRange = {
//   validFrom: Date,
//   validTo: Date,
// };

// const LegalSchema = new Schema({
//   padron: {
//     number: { type: String, maxlength: 12 },
//     issuer: { type: String, default: 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION', uppercase: true },
//     // Fechas antiguas compatibles
//     validFrom: Date,
//     validTo: Date,
//     // Nuevas fechas solicitadas
//     acquisitionDate: Date,
//     inscriptionDate: Date,
//     issueDate: Date,
//   },
//   soap: {
//     policy: String,
//     issuer: String,
//     ...LegalDateRange,
//   },
//   insurance: {
//     policy: String,
//     issuer: String,
//     ...LegalDateRange,
//   },
//   tag: {
//     number: String,
//     issuer: String,
//   },
//   fuelCard: {
//     issuer: String,
//     number: String,
//     validTo: Date,
//   },
//   // Nuevos bloques
//   technicalReview: {
//     number: String,
//     issuer: String,
//     reviewDate: Date,
//     validTo: Date,
//   },
//   circulationPermit: {
//     number: String,
//     issuer: String,
//     issueDate: Date,
//     validTo: Date,
//   },
// }, { _id: false });

// const VehicleSchema = new Schema({
//   plate: { type: String, uppercase: true, required: true, index: true },
//   internalCode: { type: String, uppercase: true, required: true, index: true },
//   status: { type: String, uppercase: true, default: 'ACTIVE' },
//   type: { type: String, uppercase: true },
//   brand: { type: String, uppercase: true },
//   model: { type: String, uppercase: true },
//   year: Number,
//   color: { type: String, uppercase: true },
//   branch: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },

//   vin: String,
//   engineNumber: String,
//   engineBrand: { type: String, uppercase: true },
//   engineModel: { type: String, uppercase: true },
//   fuelType: { type: String, uppercase: true },

//   transmission: {
//     type: { type: String, uppercase: true },
//     brand: { type: String, uppercase: true },
//     model: { type: String, uppercase: true },
//     serial: { type: String, uppercase: true },
//     gears: Number,
//   },

//   generator: { brand: { type: String, uppercase: true }, model: { type: String, uppercase: true }, serial: { type: String, uppercase: true } },
//   pump:      { brand: { type: String, uppercase: true }, model: { type: String, uppercase: true }, serial: { type: String, uppercase: true } },
//   body:      { brand: { type: String, uppercase: true }, model: { type: String, uppercase: true }, serial: { type: String, uppercase: true } },

//   meters: {
//     odometerKm: Number,
//     engineHours: Number,
//     ladderHours: Number,
//     generatorHours: Number,
//     pumpHours: Number,
//   },

//   legal: { type: LegalSchema, default: {} },

//   photos: [PhotoSchema],
//   documents: [DocumentSchema],
//   assignments: [AssignmentSchema],

//   // ====== NUEVO: estado de Apoyo/Reemplazo ======
//   support: {
//     active: { type: Boolean, default: false },
//     targetBranch: { type: Schema.Types.ObjectId, ref: 'Branch' }, // sucursal a la que está apoyando
//     targetVehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' }, // vehículo reemplazado
//     replacementCode: { type: String, uppercase: true }, // nueva sigla asignada (sigla del target + 'R')
//     originalInternalCode: { type: String, uppercase: true }, // para volver al finalizar
//     startedAt: Date,
//     endedAt: Date,
//   },

//   // Auditoría de acciones
//   audit: [AuditSchema],

// }, { timestamps: true });

// export default model('Vehicle', VehicleSchema);




// // back/src/models/Vehicle.js
// // -----------------------------------------------------------------------------
// // Vehicle model (respetando tu base y ampliando la tarjeta Legal)
// // - legal.padron: number(max 12), issuer, acquisitionDate, inscriptionDate, issueDate
// // - legal.soap: { policy, issuer, validFrom, validTo }
// // - legal.insurance: { policy, issuer, validFrom, validTo }
// // - legal.tag: { number, issuer }
// // - legal.fuelCard: { issuer, number, validTo }
// // - legal.revisionTech: { number, issuer, reviewedAt, validTo }      (NUEVO)
// // - legal.circulationPermit: { number, issuer, issuedAt, validTo }   (NUEVO)
// //
// // Medios (igual): photos[], documents[]
// // -----------------------------------------------------------------------------
// import mongoose from 'mongoose';
// const { Schema, model } = mongoose;

// const TrimUpper = v => (typeof v === 'string' ? v.trim().toUpperCase() : v);

// const PhotoSchema = new Schema({
//   category: { type: String, set: TrimUpper },
//   title:    { type: String }, // “CATEGORÍA — ETIQUETA — 00001”
//   url:      { type: String, required: true },
//   publicId: { type: String },
//   bytes:    { type: Number },
//   format:   { type: String },
//   createdAt:{ type: Date, default: Date.now },
// }, { _id: true });

// const DocumentSchema = new Schema({
//   category: { type: String, set: TrimUpper },
//   label:    { type: String }, // “CATEGORÍA — ETIQUETA” (uniforme)
//   url:      { type: String, required: true },
//   publicId: { type: String },
//   bytes:    { type: Number },
//   format:   { type: String },
//   createdAt:{ type: Date, default: Date.now },
// }, { _id: true });

// const LegalPadronSchema = new Schema({
//   number:          { type: String, maxlength: 12, set: TrimUpper },
//   issuer:          { type: String, set: TrimUpper }, // default en UI
//   acquisitionDate: { type: Date },
//   inscriptionDate: { type: Date },
//   issueDate:       { type: Date },
// }, { _id: false });

// const PeriodSchema = new Schema({
//   policy:    { type: String, set: TrimUpper },
//   issuer:    { type: String, set: TrimUpper },
//   validFrom: { type: Date },
//   validTo:   { type: Date },
// }, { _id: false });

// const TagSchema = new Schema({
//   number: { type: String, set: TrimUpper },
//   issuer: { type: String, set: TrimUpper },
// }, { _id: false });

// const FuelCardSchema = new Schema({
//   issuer:  { type: String, set: TrimUpper },
//   number:  { type: String, set: TrimUpper },
//   validTo: { type: Date },
// }, { _id: false });

// const RevisionTechSchema = new Schema({
//   number:    { type: String, set: TrimUpper },
//   issuer:    { type: String, set: TrimUpper },
//   reviewedAt:{ type: Date },  // fecha de revisión
//   validTo:   { type: Date },  // vencimiento
// }, { _id: false });

// const CirculationPermitSchema = new Schema({
//   number:  { type: String, set: TrimUpper },
//   issuer:  { type: String, set: TrimUpper }, // comuna/municipio
//   issuedAt:{ type: Date },
//   validTo: { type: Date },
// }, { _id: false });

// const VehicleSchema = new Schema({
//   plate:        { type: String, required: true, set: TrimUpper },
//   internalCode: { type: String, required: true, set: TrimUpper },
//   status:       { type: String, required: true, set: TrimUpper },
//   type:         { type: String, required: true, set: TrimUpper },
//   brand:        { type: String, required: true, set: TrimUpper },
//   model:        { type: String, required: true, set: TrimUpper },
//   year:         { type: Number, required: true },
//   color:        { type: String, required: true, set: TrimUpper },
//   branch:       { type: Schema.Types.ObjectId, ref: 'Branch', required: true },

//   vin:          { type: String, set: TrimUpper },
//   engineNumber: { type: String, set: TrimUpper },
//   engineBrand:  { type: String, set: TrimUpper },
//   engineModel:  { type: String, set: TrimUpper },
//   fuelType:     { type: String, set: TrimUpper },

//   transmission: {
//     type:  { type: String, set: TrimUpper },
//     brand: { type: String, set: TrimUpper },
//     model: { type: String, set: TrimUpper },
//     serial:{ type: String, set: TrimUpper },
//     gears: { type: Number },
//   },

//   generator: { brand: { type: String, set: TrimUpper }, model: { type: String, set: TrimUpper }, serial: { type: String, set: TrimUpper } },
//   pump:      { brand: { type: String, set: TrimUpper }, model: { type: String, set: TrimUpper }, serial: { type: String, set: TrimUpper } },
//   body:      { brand: { type: String, set: TrimUpper }, model: { type: String, set: TrimUpper }, serial: { type: String, set: TrimUpper } },

//   meters: {
//     odometerKm:     { type: Number },
//     engineHours:    { type: Number },
//     ladderHours:    { type: Number },
//     generatorHours: { type: Number },
//     pumpHours:      { type: Number },
//   },

//   legal: {
//     padron:            { type: LegalPadronSchema, default: {} },
//     soap:              { type: PeriodSchema, default: {} },
//     insurance:         { type: PeriodSchema, default: {} },
//     tag:               { type: TagSchema, default: {} },
//     fuelCard:          { type: FuelCardSchema, default: {} },
//     revisionTech:      { type: RevisionTechSchema, default: {} },     // NUEVO
//     circulationPermit: { type: CirculationPermitSchema, default: {} },// NUEVO
//   },

//   photos:    { type: [PhotoSchema], default: [] },
//   documents: { type: [DocumentSchema], default: [] },

//   // historial de asignaciones / auditoría básica (puede ampliarse)
//   assignments: [{
//     branch:       { type: Schema.Types.ObjectId, ref: 'Branch' },
//     codeInternal: { type: String, set: TrimUpper },
//     reason:       { type: String, set: TrimUpper }, // TRASPASO / APOYO
//     fromBranch:   { type: Schema.Types.ObjectId, ref: 'Branch' },
//     toBranch:     { type: Schema.Types.ObjectId, ref: 'Branch' },
//     note:         { type: String, set: TrimUpper },
//     startAt:      { type: Date, default: Date.now },
//   }],
// }, { timestamps: true });

// export default model('Vehicle', VehicleSchema);




///*** ACTUALIZACION 20/10/2025 */
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
  },

  // Auditoría
  audit: [AuditSchema],

}, { timestamps: true });

export default model('Vehicle', VehicleSchema);
