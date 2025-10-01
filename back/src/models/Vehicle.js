import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';
import { normPlate } from '../utils/normalize.js';

const MeterSchema = new mongoose.Schema({
  name: String,
  value: Number,
  unit: { type:String, enum:['km','hr'] }
},{ _id:false });

const DocumentSchema = new mongoose.Schema({
  type: { type:String, enum:['revision','permiso','seguro'] },
  issuer: String,
  issueDate: Date,
  expiryDate: Date,
  fileUrl: String
},{ _id:false });

const EngineSchema = new mongoose.Schema({
  number: String,
  brand: String,
  model: String
},{ _id:false });

const VehicleSchema = new mongoose.Schema({
  // code: { type:String, unique:true, required:true },
  code: { type:String, required:true },
  name: { type:String, required:true },
  plate: { type:String, index:true },
  vin: String,
  chassis: String,
  engine: EngineSchema,
  meters: [MeterSchema],
  documents: [DocumentSchema],
  status: { type:String, enum:['available','in_maintenance','out_of_service'], default:'available' },
  branchId: { type:mongoose.Schema.Types.ObjectId, ref:'Branch' }
},{ timestamps:true });

VehicleSchema.pre('save', function(){ if(this.isModified('plate') && this.plate){ this.plate = normPlate(this.plate); } });
VehicleSchema.index({ code:1 },{ unique:true });
VehicleSchema.index({ branchId:1, status:1 });
VehicleSchema.plugin(auditSoftDelete); VehicleSchema.plugin(paginate);
export default mongoose.model('Vehicle', VehicleSchema);
