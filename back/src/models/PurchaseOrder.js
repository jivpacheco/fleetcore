import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const PurchaseOrderSchema = new mongoose.Schema({
  supplierId: { type:mongoose.Schema.Types.ObjectId, ref:'Supplier', index:true },
  items: [{ productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' }, qty:Number, unitCost:Number }],
  status: { type:String, enum:['draft','approved','closed'], default:'draft' }
},{ timestamps:true });
PurchaseOrderSchema.plugin(auditSoftDelete); PurchaseOrderSchema.plugin(paginate);
export default mongoose.model('PurchaseOrder', PurchaseOrderSchema);
