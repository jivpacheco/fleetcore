// import mongoose from 'mongoose';
// import auditSoftDelete from '../plugins/auditSoftDelete.js';
// import paginate from '../plugins/paginate.js';

// const SystemConfigSchema = new mongoose.Schema({
//   vatRecoverable: { type:Boolean, default:false },
//   costingMethod: { type:String, enum:['average','fifo'], default:'average' },
//   prefixes: { type: Map, of: String },
//   workflows: { type: Map, of: String }
// },{ timestamps:true });
// SystemConfigSchema.plugin(auditSoftDelete); SystemConfigSchema.plugin(paginate);
// export default mongoose.model('SystemConfig', SystemConfigSchema);

import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const SystemConfigSchema = new mongoose.Schema({
  vatRecoverable: { type:Boolean, default:false },
  costingMethod: { type:String, enum:['average','fifo'], default:'average' },
  prefixes: { type: Map, of: String },
  workflows: { type: Map, of: String },
  // Reglas de aprobación por módulo (flexible para 1+ niveles)
  // Ej: { workOrders:{ levels:[{ roleCode:'APPROVER_SUPERIOR', substitutes:['APPROVER_BOARD'] }] } }
  approvalRules: { type: mongoose.Schema.Types.Mixed, default: {} }
},{ timestamps:true });
SystemConfigSchema.plugin(auditSoftDelete); SystemConfigSchema.plugin(paginate);
export default mongoose.model('SystemConfig', SystemConfigSchema);
