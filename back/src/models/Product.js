import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';
import { normCode } from '../utils/normalize.js';

const DepSchema = new mongoose.Schema({
  method: { type:String, enum:['line','usage'] },
  usefulLife: Number
},{ _id:false });

const ProductSchema = new mongoose.Schema({
  // code: { type:String, unique:true, required:true },
  code: { type:String, required:true },
  name: { type:String, required:true },
  category: { type:String, enum:['repuesto','consumible','herramienta','equipo'] },
  brand: String,
  model: String,
  partNumber: String,
  serialNumber: String,
  unit: String,
  unitCost: Number,
  accountingCode: String,
  depreciation: DepSchema,
  active: { type:Boolean, default:true }
},{ timestamps:true });

ProductSchema.pre('save', function(){ if(this.isModified('code')) this.code = normCode(this.code); });
ProductSchema.index({ code:1 },{ unique:true });
ProductSchema.plugin(auditSoftDelete); ProductSchema.plugin(paginate);
export default mongoose.model('Product', ProductSchema);
