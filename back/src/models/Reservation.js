import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const ReservationSchema = new mongoose.Schema({
  productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' },
  workOrderId: { type:mongoose.Schema.Types.ObjectId, ref:'WorkOrder' },
  locationId: { type:mongoose.Schema.Types.ObjectId, ref:'Location' },
  qty: Number,
  status: { type:String, enum:['active','consumed','cancelled'], default:'active' }
},{ timestamps:true });
ReservationSchema.plugin(auditSoftDelete); ReservationSchema.plugin(paginate);
export default mongoose.model('Reservation', ReservationSchema);
