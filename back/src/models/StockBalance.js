import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const StockBalanceSchema = new mongoose.Schema({
  productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product', index:true },
  locationId: { type:mongoose.Schema.Types.ObjectId, ref:'Location', index:true },
  onHand: { type:Number, default:0 },
  reserved: { type:Number, default:0 }
},{ timestamps:true });
StockBalanceSchema.index({ productId:1, locationId:1 }, { unique:true });
StockBalanceSchema.plugin(auditSoftDelete); StockBalanceSchema.plugin(paginate);
export default mongoose.model('StockBalance', StockBalanceSchema);
