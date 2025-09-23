import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const LicenseSchema = new mongoose.Schema({
  type: { type:String },
  issueDate: Date,
  expiryDate: Date,
  issuer: String
}, { _id:false });

const PersonSchema = new mongoose.Schema({
  dni: { type:String, index:true },
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  licenses: [LicenseSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User' }
},{ timestamps:true });
PersonSchema.plugin(auditSoftDelete); PersonSchema.plugin(paginate);
export default mongoose.model('Person', PersonSchema);
