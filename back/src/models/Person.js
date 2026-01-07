import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const LicenseSchema = new mongoose.Schema({
  number: { type: String, trim: true, uppercase: true },
  type:   { type: String, trim: true, uppercase: true },  // A1/A2/B/C...
  issueDate:  Date,
  expiryDate: Date,
  issuer: { type: String, trim: true, uppercase: true },
}, { _id:true });

const PersonDocSchema = new mongoose.Schema({
  label: { type: String, trim: true },
  url:   { type: String, trim: true },
  format:{ type: String, trim: true },
  bytes: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
}, { _id:true });

const PersonSchema = new mongoose.Schema({
  // Identificación
  dni: { type:String, required:true, trim:true, index:true },
  firstName: { type:String, required:true, trim:true, uppercase:true, index:true },
  lastName:  { type:String, required:true, trim:true, uppercase:true, index:true },

  // Datos personales
  birthDate: Date,
  birthPlace: { type:String, trim:true, uppercase:true },
  nationality: { type:String, trim:true, uppercase:true },

  // Contacto
  phone: { type:String, trim:true },
  email: { type:String, trim:true, lowercase:true },

  // Laboral
  branchId: { type: mongoose.Schema.Types.ObjectId, ref:'Branch', required:true, index:true },
  positionId: { type: mongoose.Schema.Types.ObjectId, ref:'Position', default:null, index:true },
  hireDate: Date,
  active: { type:Boolean, default:true, index:true },

  // Conducción
  licenses: [LicenseSchema],
  authorizedVehicles: [{ type: mongoose.Schema.Types.ObjectId, ref:'Vehicle' }],

  // Adjuntos / documentos RRHH
  // photo: { url:String, format:String, bytes:Number, uploadedAt: Date },
  // documents: [PersonDocSchema],
//   photo: {
//   url: String,
//   format: String,
//   bytes: Number,
//   uploadedAt: Date,
//   publicId: String,   // ← CLAVE
// },

// documents: [{
//   label: { type: String, trim: true },
//   url: String,
//   format: String,
//   bytes: Number,
//   uploadedAt: Date,
//   publicId: String,   // ← CLAVE
// }],

photo: {
  url: String,
  format: String,
  contentType: String,
  bytes: Number,
  uploadedAt: Date,
  publicId: String,
  provider: String,
},
documents: [{
  label: { type: String, trim: true },
  url: String,
  format: String,
  contentType: String,
  bytes: Number,
  uploadedAt: Date,
  publicId: String,
  provider: String,
}],


  // Vinculación (si existe usuario)
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', default:null, index:true },

  // Placeholder multi-tenant (futuro)
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index:true, default:null },
},{ timestamps:true });

PersonSchema.index({ dni: 1, branchId: 1 }, { unique: false });
PersonSchema.plugin(auditSoftDelete);
PersonSchema.plugin(paginate);

export default mongoose.model('Person', PersonSchema);


// import mongoose from 'mongoose';
// import auditSoftDelete from '../plugins/auditSoftDelete.js';
// import paginate from '../plugins/paginate.js';

// const LicenseSchema = new mongoose.Schema({
//   type: { type:String },
//   issueDate: Date,
//   expiryDate: Date,
//   issuer: String
// }, { _id:false });

// const PersonSchema = new mongoose.Schema({
//   dni: { type:String, index:true },
//   firstName: String,
//   lastName: String,
//   phone: String,
//   email: String,
//   licenses: [LicenseSchema],
//   userId: { type: mongoose.Schema.Types.ObjectId, ref:'User' }
// },{ timestamps:true });
// PersonSchema.plugin(auditSoftDelete); PersonSchema.plugin(paginate);
// export default mongoose.model('Person', PersonSchema);
