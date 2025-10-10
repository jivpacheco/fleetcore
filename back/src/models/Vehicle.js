// Modelo Vehicle con trazabilidad completa y soporte Cloudinary
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const BranchRef = { type: Schema.Types.ObjectId, ref: 'Branch' };

const AssignmentSchema = new Schema({
  branch: BranchRef,
  codeInternal: String, // B:10, B:18R, BX-2
  reason: String,       // ASIGNACION, APOYO, TRASPASO
  fromBranch: BranchRef,
  toBranch: BranchRef,
  note: String,
  at: { type: Date, default: Date.now },
}, { _id: false });

const MediaSchema = new Schema({
  kind: { type: String, enum: ['photo', 'doc', 'manual', 'video'], required: true },
  title: { type: String, default: '' },
  url: String,
  publicId: String,
  bytes: Number,
  format: String,
  uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

const ComponentSchema = new Schema({
  type: String,
  brand: String,
  model: String,
  serial: String,
  description: String,
  media: [MediaSchema]
}, { _id: false });

const LegalSchema = new Schema({
  padron: { number: String, issuer: String, validFrom: Date, validTo: Date },
  soap: { policy: String, issuer: String, validFrom: Date, validTo: Date },
  insurance: { policy: String, issuer: String, validFrom: Date, validTo: Date },
  tag: { number: String, issuer: String },
  fuelCard: { issuer: String, number: String, validTo: Date, quota: Number }
}, { _id: false });

const MetersSchema = new Schema({
  odometerKm: Number,
  engineHours: Number,
  ladderHours: Number,
  generatorHours: Number,
  pumpHours: Number,
}, { _id: false });

const TyreAxleSchema = new Schema({
  axle: String, // delantero, trasero1, trasero2
  positionCount: Number,
  application: String,
  reference: String,
}, { _id: false });

const PhotoSchema = new Schema({
  url: String,
  publicId: String,
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const DocumentSchema = new Schema({
  url: String,
  publicId: String,
  category: { type: String, default: 'legal' }, // legal|manuals|parts
  label: { type: String, default: '' },
  bytes: Number,
  format: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const VehicleSchema = new Schema({
  plate: { type: String, required: true, unique: true },
  internalCode: String,
  type: String,
  brand: String,
  model: String,
  year: Number,
  vin: String,
  engineNumber: String,
  engineBrand: String,
  engineModel: String,
  color: String,
  branch: BranchRef,
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
}, { timestamps: true });

VehicleSchema.index({ plate: 1 }, { unique: true });
VehicleSchema.index({ internalCode: 1 });
VehicleSchema.index({ branch: 1 });

export default model('Vehicle', VehicleSchema);
