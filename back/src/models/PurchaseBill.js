import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const PurchaseBillSchema = new mongoose.Schema({
  supplierId: { type:mongoose.Schema.Types.ObjectId, ref:'Supplier', index:true },
  invoiceNumber: { type:String, required:true },
  invoiceDate: Date,
  dueDate: Date,
  lines: [{ productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' }, qty:Number, unitCost:Number, vatRate:Number }],
  posted: { type:Boolean, default:false }
},{ timestamps:true });
PurchaseBillSchema.index({ supplierId:1, invoiceNumber:1 }, { unique:true });
PurchaseBillSchema.plugin(auditSoftDelete); PurchaseBillSchema.plugin(paginate);
export default mongoose.model('PurchaseBill', PurchaseBillSchema);
