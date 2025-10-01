import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const SequenceSchema = new mongoose.Schema({
  name: { type:String, required:true },
  prefix: String,
  value: { type:Number, default:0 },
  perBranch: { type:Boolean, default:false },
  perYear: { type:Boolean, default:false }
},{ timestamps:true });
SequenceSchema.index({ name:1, prefix:1 }, { unique:true, partialFilterExpression: { name: { $type:'string' } } });
SequenceSchema.plugin(auditSoftDelete); SequenceSchema.plugin(paginate);
export default mongoose.model('Sequence', SequenceSchema);
