import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const RepairMasterSchema = new mongoose.Schema({
  system: String,
  assembly: String,
  part: String,
  code: String,
  description: String
},{ timestamps:true });
RepairMasterSchema.index({ system:1, assembly:1, part:1, code:1 }, { unique:true });
RepairMasterSchema.plugin(auditSoftDelete); RepairMasterSchema.plugin(paginate);
export default mongoose.model('RepairMaster', RepairMasterSchema);
