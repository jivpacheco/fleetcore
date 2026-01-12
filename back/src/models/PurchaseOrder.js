// import mongoose from 'mongoose';
// import auditSoftDelete from '../plugins/auditSoftDelete.js';
// import paginate from '../plugins/paginate.js';

// const PurchaseOrderSchema = new mongoose.Schema({
//   supplierId: { type:mongoose.Schema.Types.ObjectId, ref:'Supplier', index:true },
//   items: [{ productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' }, qty:Number, unitCost:Number }],
//   status: { type:String, enum:['draft','approved','closed'], default:'draft' }
// },{ timestamps:true });
// PurchaseOrderSchema.plugin(auditSoftDelete); PurchaseOrderSchema.plugin(paginate);
// export default mongoose.model('PurchaseOrder', PurchaseOrderSchema);

import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const PurchaseOrderSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', index: true },
  items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, qty: Number, unitCost: Number }],
  status: { type: String, enum: ['draft', 'approved', 'closed'], default: 'draft' },

  // --- Aprobaciones (workflow) ---
  // Soporta 1 o más niveles. Si no se usa, queda vacío.
  approvals: [{
    level: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    decidedAt: { type: Date, default: null },
    note: { type: String, default: '' },
  }],

}, { timestamps: true });
PurchaseOrderSchema.plugin(auditSoftDelete); PurchaseOrderSchema.plugin(paginate);
export default mongoose.model('PurchaseOrder', PurchaseOrderSchema);
