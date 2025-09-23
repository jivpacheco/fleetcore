import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';
import { normRut } from '../utils/normalize.js';

const SupplierSchema = new mongoose.Schema({
  rut: { type:String, unique:true, required:true, index:true },
  businessName: { type:String, required:true },
  address: String,
  phone: String,
  email: String,
  active: { type:Boolean, default:true }
},{ timestamps:true });
SupplierSchema.pre('save', function(){ if(this.isModified('rut')) this.rut = normRut(this.rut); });
SupplierSchema.plugin(auditSoftDelete); SupplierSchema.plugin(paginate);
export default mongoose.model('Supplier', SupplierSchema);
