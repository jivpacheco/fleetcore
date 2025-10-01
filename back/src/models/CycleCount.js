import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const CycleCountSchema = new mongoose.Schema({
  locationId: { type:mongoose.Schema.Types.ObjectId, ref:'Location' },
  productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' },
  countedQty: Number,
  posted: { type:Boolean, default:false }
},{ timestamps:true });
CycleCountSchema.plugin(auditSoftDelete); CycleCountSchema.plugin(paginate);
export default mongoose.model('CycleCount', CycleCountSchema);
