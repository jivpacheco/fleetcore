// import mongoose from 'mongoose';
// import auditSoftDelete from '../plugins/auditSoftDelete.js';
// import paginate from '../plugins/paginate.js';
// import { isValidRUN, normalizeRUN } from '../utils/run.js';

// // Licencias de conducir (Chile)
// // - Se mantiene compatibilidad con campos legacy (number/issueDate/expiryDate)
// // - Nuevos campos: folioNumber + 3 fechas (firstIssuedAt / issuedAt / nextControlAt)
// const LICENSE_TYPES_CL = ['C','B','A4','A5','A2','A2*','A1','A1*','A3','D','E','F'];

// const LicenseSchema = new mongoose.Schema({
//   // Legacy (compat)
//   number: { type: String, trim: true, uppercase: true },
//   issueDate:  Date,
//   expiryDate: Date,

//   // Nuevo (RRHH)
//   folioNumber: { type: String, trim: true, uppercase: true },
//   type:   { type: String, trim: true, uppercase: true, enum: LICENSE_TYPES_CL },
//   firstIssuedAt: Date,
//   issuedAt: Date,
//   nextControlAt: Date,

//   issuer: { type: String, trim: true, uppercase: true },
// }, { _id:true });

// const PersonDocSchema = new mongoose.Schema({
//   label: { type: String, trim: true },
//   url:   { type: String, trim: true },
//   format:{ type: String, trim: true },
//   bytes: { type: Number, default: 0 },
//   uploadedAt: { type: Date, default: Date.now },
// }, { _id:true });

// const PersonSchema = new mongoose.Schema({
//   // Identificación
//   // En Chile el documento es RUN (Rol Único Nacional) con DV Módulo 11.
//   // Se almacena normalizado sin puntos, con guion: 12345678-K
//   dni: {
//     type: String,
//     required: true,
//     trim: true,
//     index: true,
//     set: (v) => (typeof v === 'string' ? normalizeRUN(v) : v),
//     validate: {
//       validator: (v) => isValidRUN(v),
//       message: 'RUN inválido (verifique número y DV)'
//     }
//   },
//   firstName: { type:String, required:true, trim:true, uppercase:true, index:true },
//   lastName:  { type:String, required:true, trim:true, uppercase:true, index:true },

//   // Datos personales
//   birthDate: Date,
//   birthPlace: { type:String, trim:true, uppercase:true },
//   nationality: { type:String, trim:true, uppercase:true },

//   // Contacto
//   phone: { type:String, trim:true },
//   email: { type:String, trim:true, lowercase:true },
//   address: {
//     line1: { type: String, trim: true },
//     line2: { type: String, trim: true },
//     city: { type: String, trim: true },
//     region: { type: String, trim: true },
//     country: { type: String, trim: true, default: 'CL' },
//     postalCode: { type: String, trim: true },
//   },

//   // Laboral
//   branchId: { type: mongoose.Schema.Types.ObjectId, ref:'Branch', required:true, index:true },
//   positionId: { type: mongoose.Schema.Types.ObjectId, ref:'Position', default:null, index:true },
//   hireDate: Date,
//   active: { type:Boolean, default:true, index:true },

//   // Conducción
//   licenses: [LicenseSchema],
//   authorizedVehicles: [{ type: mongoose.Schema.Types.ObjectId, ref:'Vehicle' }],
//   driverAuthorization: {
//     isAuthorized: { type: Boolean, default: false, index: true },
//     authorizedAt: { type: Date, default: null },
//     note: { type: String, trim: true, default: '' },
//   },

//   // Adjuntos / documentos RRHH

// photo: {
//   url: String,
//   format: String,
//   contentType: String,
//   bytes: Number,
//   uploadedAt: Date,
//   publicId: String,
//   provider: String,
// },
// documents: [{
//   label: { type: String, trim: true },
//   url: String,
//   format: String,
//   contentType: String,
//   bytes: Number,
//   uploadedAt: Date,
//   publicId: String,
//   provider: String,
// }],

//   // Vinculación (si existe usuario)
//   userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', default:null, index:true },

//   // Placeholder multi-tenant (futuro)
//   organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index:true, default:null },
// },{ timestamps:true });

// PersonSchema.index({ dni: 1, branchId: 1 }, { unique: false });
// PersonSchema.plugin(auditSoftDelete);
// PersonSchema.plugin(paginate);
// v 210126

// // export default mongoose.model('Person', PersonSchema);

// import mongoose from 'mongoose';
// import auditSoftDelete from '../plugins/auditSoftDelete.js';
// import paginate from '../plugins/paginate.js';
// import { isValidRUN, normalizeRUN } from '../utils/run.js';

// // Licencias de conducir (Chile)
// // - Se mantiene compatibilidad con campos legacy (number/issueDate/expiryDate)
// // - Nuevos campos: folioNumber + 3 fechas (firstIssuedAt / issuedAt / nextControlAt)
// const LICENSE_TYPES_CL = ['C','B','A4','A5','A2','A2*','A1','A1*','A3','D','E','F'];

// const LicenseSchema = new mongoose.Schema({
//   // Legacy (compat)
//   number: { type: String, trim: true, uppercase: true },
//   issueDate:  Date,
//   expiryDate: Date,

//   // Nuevo (RRHH)
//   folioNumber: { type: String, trim: true, uppercase: true },
//   type:   { type: String, trim: true, uppercase: true, enum: LICENSE_TYPES_CL },
//   firstIssuedAt: Date,
//   issuedAt: Date,
//   nextControlAt: Date,

//   issuer: { type: String, trim: true, uppercase: true },
// }, { _id:true });

// const PersonDocSchema = new mongoose.Schema({
//   label: { type: String, trim: true },
//   url:   { type: String, trim: true },
//   format:{ type: String, trim: true },
//   bytes: { type: Number, default: 0 },
//   uploadedAt: { type: Date, default: Date.now },
// }, { _id:true });

// const PersonSchema = new mongoose.Schema({
//   // Identificación
//   // En Chile el documento es RUN (Rol Único Nacional) con DV Módulo 11.
//   // Se almacena normalizado sin puntos, con guion: 12345678-K
//   dni: {
//     type: String,
//     required: true,
//     trim: true,
//     // index: true,
//     set: (v) => (typeof v === 'string' ? normalizeRUN(v) : v),
//     validate: {
//       validator: (v) => isValidRUN(v),
//       message: 'RUN inválido (verifique número y DV)'
//     }
//   },
//   firstName: { type:String, required:true, trim:true, uppercase:true, index:true },
//   lastName:  { type:String, required:true, trim:true, uppercase:true, index:true },

//   // Datos personales
//   birthDate: Date,
//   birthPlace: { type:String, trim:true, uppercase:true },
//   nationality: { type:String, trim:true, uppercase:true },

//   // Contacto
//   phone: { type:String, trim:true },
//   email: { type:String, trim:true, lowercase:true },
//   address: {
//     line1: { type: String, trim: true },
//     line2: { type: String, trim: true },
//     city: { type: String, trim: true },
//     region: { type: String, trim: true },
//     country: { type: String, trim: true, default: 'CL' },
//     postalCode: { type: String, trim: true },
//   },

//   // Laboral
//   branchId: { type: mongoose.Schema.Types.ObjectId, ref:'Branch', required:true, index:true },
//   positionId: { type: mongoose.Schema.Types.ObjectId, ref:'Position', default:null, index:true },
//   hireDate: Date,
//   active: { type:Boolean, default:true, index:true },

//   // Conducción
//   licenses: [LicenseSchema],
//   authorizedVehicles: [{ type: mongoose.Schema.Types.ObjectId, ref:'Vehicle' }],
//   driverAuthorization: {
//     isAuthorized: { type: Boolean, default: false, index: true },
//     authorizedAt: { type: Date, default: null },
//     note: { type: String, trim: true, default: '' },
//   },

//   // Adjuntos / documentos RRHH

// photo: {
//   url: String,
//   format: String,
//   contentType: String,
//   bytes: Number,
//   uploadedAt: Date,
//   publicId: String,
//   provider: String,
// },
// documents: [{
//   label: { type: String, trim: true },
//   url: String,
//   format: String,
//   contentType: String,
//   bytes: Number,
//   uploadedAt: Date,
//   publicId: String,
//   provider: String,
// }],

//   // Vinculación (si existe usuario)
//   userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', default:null, index:true },

//   // Placeholder multi-tenant (futuro)
//   organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index:true, default:null },
// },{ timestamps:true });

// PersonSchema.index({ dni: 1 }, { unique: true });
// // PersonSchema.index({ dni: 1, branchId: 1 }, { unique: false });
// PersonSchema.plugin(auditSoftDelete);
// PersonSchema.plugin(paginate);

// export default mongoose.model('Person', PersonSchema);

// export default mongoose.model('Person', PersonSchema);

// //v2 22-01-26

// import mongoose from "mongoose";
// import auditSoftDelete from "../plugins/auditSoftDelete.js";
// import paginate from "../plugins/paginate.js";
// import { isValidRUN, normalizeRUN } from "../utils/run.js";

// // Licencias de conducir (Chile)
// // - Se mantiene compatibilidad con campos legacy (number/issueDate/expiryDate)
// // - Nuevos campos: folioNumber + 3 fechas (firstIssuedAt / issuedAt / nextControlAt)
// const LICENSE_TYPES_CL = [
//   "C",
//   "B",
//   "A4",
//   "A5",
//   "A2",
//   "A2*",
//   "A1",
//   "A1*",
//   "A3",
//   "D",
//   "E",
//   "F",
// ];

// const LicenseSchema = new mongoose.Schema(
//   {
//     // Legacy (compat)
//     number: { type: String, trim: true, uppercase: true },
//     issueDate: Date,
//     expiryDate: Date,

//     // Nuevo (RRHH)
//     folioNumber: { type: String, trim: true, uppercase: true },
//     type: { type: String, trim: true, uppercase: true, enum: LICENSE_TYPES_CL },
//     firstIssuedAt: Date,
//     issuedAt: Date,
//     nextControlAt: Date,

//     issuer: { type: String, trim: true, uppercase: true },
//   },
//   { _id: true },
// );

// const PersonDocSchema = new mongoose.Schema(
//   {
//     label: { type: String, trim: true },
//     url: { type: String, trim: true },
//     format: { type: String, trim: true },
//     bytes: { type: Number, default: 0 },
//     uploadedAt: { type: Date, default: Date.now },
//   },
//   { _id: true },
// );

// const PersonSchema = new mongoose.Schema(
//   {
//     // Identificación
//     // En Chile el documento es RUN (Rol Único Nacional) con DV Módulo 11.
//     // Se almacena normalizado sin puntos, con guion: 12345678-K
//     dni: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true,
//       index: true,
//       set: (v) => (typeof v === "string" ? normalizeRUN(v) : v),
//       validate: {
//         validator: (v) => isValidRUN(v),
//         message: "RUN inválido (verifique número y DV)",
//       },
//     },

//     // dni: {
//     //   type: String,
//     //   required: true,
//     //   trim: true,
//     //   unique: true,
//     //   index: true,
//     //   set: (v) => (typeof v === "string" ? normalizeRUN(v) : v),
//     //   validate: {
//     //     validator: (v) => isValidRUN(v),
//     //     message: "RUN inválido (verifique número y DV)",
//     //   },
//     // },
//     firstName: {
//       type: String,
//       required: true,
//       trim: true,
//       uppercase: true,
//       index: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//       trim: true,
//       uppercase: true,
//       index: true,
//     },

//     // Datos personales
//     birthDate: Date,
//     birthPlace: { type: String, trim: true, uppercase: true },
//     nationality: { type: String, trim: true, uppercase: true },

//     // Contacto
//     phone: { type: String, trim: true },
//     email: { type: String, trim: true, lowercase: true },
//     address: {
//       line1: { type: String, trim: true },
//       line2: { type: String, trim: true },
//       city: { type: String, trim: true },
//       comuna: { type: String, trim: true },
//       region: { type: String, trim: true },
//       country: { type: String, trim: true, default: "CL" },
//       postalCode: { type: String, trim: true },
//     },

//     // Laboral
//     branchId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Branch",
//       required: true,
//       index: true,
//     },
//     positionId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Position",
//       default: null,
//       index: true,
//     },
//     hireDate: Date,
//     active: { type: Boolean, default: true, index: true },

//     // Conducción
//     licenses: [LicenseSchema],
//     authorizedVehicles: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
//     ],
//     driverAuthorization: {
//       isAuthorized: { type: Boolean, default: false, index: true },
//       authorizedAt: { type: Date, default: null },
//       note: { type: String, trim: true, default: "" },
//     },

//     driverAuthorizationHistory: [
//       {
//         at: { type: Date, default: Date.now },
//         authorizedBy: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//           default: null,
//         },
//         authorizedByName: { type: String, trim: true, default: "" },
//         from: {
//           isAuthorized: { type: Boolean, default: false },
//           authorizedAt: { type: Date, default: null },
//           note: { type: String, trim: true, default: "" },
//         },
//         to: {
//           isAuthorized: { type: Boolean, default: false },
//           authorizedAt: { type: Date, default: null },
//           note: { type: String, trim: true, default: "" },
//         },
//       },
//     ],

//     // Adjuntos / documentos RRHH

//     photo: {
//       url: String,
//       format: String,
//       contentType: String,
//       bytes: Number,
//       uploadedAt: Date,
//       publicId: String,
//       provider: String,
//     },
//     documents: [
//       {
//         label: { type: String, trim: true },
//         url: String,
//         format: String,
//         contentType: String,
//         bytes: Number,
//         uploadedAt: Date,
//         publicId: String,
//         provider: String,
//       },
//     ],

//     // Vinculación (si existe usuario)
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//       index: true,
//     },

//     // Placeholder multi-tenant (futuro)
//     organizationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Organization",
//       index: true,
//       default: null,
//     },
//   },
//   { timestamps: true },
// );

// PersonSchema.index({ dni: 1 }, { unique: true });
// // PersonSchema.index({ dni: 1, branchId: 1 }, { unique: false });
// PersonSchema.plugin(auditSoftDelete);
// PersonSchema.plugin(paginate);

// export default mongoose.model("Person", PersonSchema);


import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';
import { isValidRUN, normalizeRUN } from '../utils/run.js';

// Licencias de conducir (Chile)
// - Se mantiene compatibilidad con campos legacy (number/issueDate/expiryDate)
// - Nuevos campos: folioNumber + 3 fechas (firstIssuedAt / issuedAt / nextControlAt)
const LICENSE_TYPES_CL = ['C', 'B', 'A4', 'A5', 'A2', 'A2*', 'A1', 'A1*', 'A3', 'D', 'E', 'F'];

const LicenseSchema = new mongoose.Schema({
  // Legacy (compat)
  number: { type: String, trim: true, uppercase: true },
  issueDate: Date,
  expiryDate: Date,

  // Nuevo (RRHH)
  folioNumber: { type: String, trim: true, uppercase: true },
  type: { type: String, trim: true, uppercase: true, enum: LICENSE_TYPES_CL },
  firstIssuedAt: Date,
  issuedAt: Date,
  nextControlAt: Date,

  issuer: { type: String, trim: true, uppercase: true },
}, { _id: true });

const PersonDocSchema = new mongoose.Schema({
  label: { type: String, trim: true },
  url: { type: String, trim: true },
  format: { type: String, trim: true },
  bytes: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

const PersonSchema = new mongoose.Schema({
  // Identificación
  // En Chile el documento es RUN (Rol Único Nacional) con DV Módulo 11.
  // Se almacena normalizado sin puntos, con guion: 12345678-K
  dni: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    set: (v) => (typeof v === 'string' ? normalizeRUN(v) : v),
    validate: {
      validator: (v) => isValidRUN(v),
      message: 'RUN inválido (verifique número y DV)'
    }
  },
  firstName: { type: String, required: true, trim: true, uppercase: true, index: true },
  lastName: { type: String, required: true, trim: true, uppercase: true, index: true },

  // Datos personales
  birthDate: Date,
  birthPlace: { type: String, trim: true, uppercase: true },
  nationality: { type: String, trim: true, uppercase: true },

  // Contacto
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    comuna: { type: String, trim: true },
    region: { type: String, trim: true },
    country: { type: String, trim: true, default: 'CL' },
    postalCode: { type: String, trim: true },
  },

  // Laboral
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', default: null, index: true },
  hireDate: Date,
  active: { type: Boolean, default: true, index: true },

  // Conducción
  licenses: [LicenseSchema],
  authorizedVehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }],
  driverAuthorization: {
    isAuthorized: { type: Boolean, default: false, index: true },
    authorizedAt: { type: Date, default: null },
    note: { type: String, trim: true, default: '' },
  },

  driverAuthorizationHistory: [{
    at: { type: Date, default: Date.now },
    authorizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    authorizedByName: { type: String, trim: true, default: '' },
    from: {
      isAuthorized: { type: Boolean, default: false },
      authorizedAt: { type: Date, default: null },
      note: { type: String, trim: true, default: '' },
    },
    to: {
      isAuthorized: { type: Boolean, default: false },
      authorizedAt: { type: Date, default: null },
      note: { type: String, trim: true, default: '' },
    },
  }],


  // Adjuntos / documentos RRHH

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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

  // Placeholder multi-tenant (futuro)
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true, default: null },
}, { timestamps: true });

// PersonSchema.index({ dni: 1, branchId: 1 }, { unique: false });
PersonSchema.plugin(auditSoftDelete);
PersonSchema.plugin(paginate);

export default mongoose.model('Person', PersonSchema);
