// import mongoose from 'mongoose';
// import auditSoftDelete from '../plugins/auditSoftDelete.js';
// import paginate from '../plugins/paginate.js';

// const BranchSchema = new mongoose.Schema({
//   // code: { type:String, unique:true, required:true },
//   code: { type:String, required:true },
//   name: { type:String, required:true },
//   address: String,
//   city: String,
//   region: String,
//   active: { type:Boolean, default:true }
// },{ timestamps:true });
// BranchSchema.index({ code:1 },{ unique:true });
// BranchSchema.plugin(auditSoftDelete); BranchSchema.plugin(paginate);
// export default mongoose.model('Branch', BranchSchema);

import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const BranchSchema = new mongoose.Schema({
  // code: { type:String, unique:true, required:true },
  code: { type:String, required:true },
  name: { type:String, required:true },
  // Ubicación (residencia/operación)
  region: String,
  comuna: String,
  city: String,
  address: String,
  geo: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },

  // Media
  photo: {
    url: String,
    format: String,
    contentType: String,
    bytes: Number,
    uploadedAt: Date,
    publicId: String,
    provider: String,
  },
  documents: [
    {
      label: String,
      url: String,
      format: String,
      contentType: String,
      bytes: Number,
      uploadedAt: Date,
      publicId: String,
      provider: String,
    },
  ],

  active: { type:Boolean, default:true }
},{ timestamps:true });
BranchSchema.index({ code:1 },{ unique:true });
BranchSchema.plugin(auditSoftDelete); BranchSchema.plugin(paginate);
export default mongoose.model('Branch', BranchSchema);
