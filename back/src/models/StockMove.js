import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const StockMoveSchema = new mongoose.Schema({
  productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product', index:true },
  fromLocationId: { type:mongoose.Schema.Types.ObjectId, ref:'Location' },
  toLocationId: { type:mongoose.Schema.Types.ObjectId, ref:'Location' },
  qty: Number,
  unitCost: Number,
  type: { type:String, enum:['IN_PURCHASE','OUT_CONSUME_WO','TRANSFER','ADJUST'] },
  workOrderId: { type:mongoose.Schema.Types.ObjectId, ref:'WorkOrder' },
  createdBy: { type:mongoose.Schema.Types.ObjectId, ref:'User' }
},{ timestamps:true });
StockMoveSchema.index({ productId:1, createdAt:1 });
StockMoveSchema.index({ type:1, createdAt:1 });
StockMoveSchema.plugin(auditSoftDelete); StockMoveSchema.plugin(paginate);
export default mongoose.model('StockMove', StockMoveSchema);
