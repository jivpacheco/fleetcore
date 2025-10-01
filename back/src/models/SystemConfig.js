import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const SystemConfigSchema = new mongoose.Schema({
  vatRecoverable: { type:Boolean, default:false },
  costingMethod: { type:String, enum:['average','fifo'], default:'average' },
  prefixes: { type: Map, of: String },
  workflows: { type: Map, of: String }
},{ timestamps:true });
SystemConfigSchema.plugin(auditSoftDelete); SystemConfigSchema.plugin(paginate);
export default mongoose.model('SystemConfig', SystemConfigSchema);
