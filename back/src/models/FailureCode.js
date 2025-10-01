import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const FailureCodeSchema = new mongoose.Schema({
  system: String,
  assembly: String,
  part: String,
  code: { type:String, index:true },
  description: String
},{ timestamps:true });
FailureCodeSchema.index({ system:1, assembly:1, part:1, code:1 }, { unique:true });
FailureCodeSchema.plugin(auditSoftDelete); FailureCodeSchema.plugin(paginate);
export default mongoose.model('FailureCode', FailureCodeSchema);
