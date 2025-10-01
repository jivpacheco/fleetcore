import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const PurchaseReceiptSchema = new mongoose.Schema({
  supplierId: { type:mongoose.Schema.Types.ObjectId, ref:'Supplier', index:true },
  poId: { type:mongoose.Schema.Types.ObjectId, ref:'PurchaseOrder' },
  invoiceNumber: String,
  items: [{ productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' }, qty:Number, unitCost:Number }],
  posted: { type:Boolean, default:false }
},{ timestamps:true });
PurchaseReceiptSchema.index({ supplierId:1, invoiceNumber:1 }, { unique:true, partialFilterExpression: { invoiceNumber: { $type: 'string' } } });
PurchaseReceiptSchema.plugin(auditSoftDelete); PurchaseReceiptSchema.plugin(paginate);
export default mongoose.model('PurchaseReceipt', PurchaseReceiptSchema);
