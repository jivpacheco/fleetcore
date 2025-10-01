import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const ToolOwnershipSchema = new mongoose.Schema({
  productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' },
  personId: { type:mongoose.Schema.Types.ObjectId, ref:'Person' },
  startDate: Date,
  endDate: Date
},{ timestamps:true });
ToolOwnershipSchema.plugin(auditSoftDelete); ToolOwnershipSchema.plugin(paginate);
export default mongoose.model('ToolOwnership', ToolOwnershipSchema);
