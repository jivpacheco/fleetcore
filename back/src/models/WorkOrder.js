import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const TimeLogSchema = new mongoose.Schema({
  start: Date, end: Date, duration: Number
},{ _id:false });

const TaskSchema = new mongoose.Schema({
  description: String,
  assignedTo: { type:mongoose.Schema.Types.ObjectId, ref:'Person' },
  status: { type:String, enum:['pending','in_progress','paused','done'], default:'pending' },
  timeLogs: [TimeLogSchema]
},{ _id:false });

const WorkOrderSchema = new mongoose.Schema({
  folio: String,
  vehicleId: { type:mongoose.Schema.Types.ObjectId, ref:'Vehicle', index:true },
  branchId: { type:mongoose.Schema.Types.ObjectId, ref:'Branch', index:true },
  tasks: [TaskSchema],
  parts: [{ productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' }, qty: Number, reservationId: { type:mongoose.Schema.Types.ObjectId, ref:'Reservation' } }],
  observations: String,
  status: { type:String, enum:['open','in_progress','closed'], default:'open', index:true }
},{ timestamps:true });
WorkOrderSchema.plugin(auditSoftDelete); WorkOrderSchema.plugin(paginate);
export default mongoose.model('WorkOrder', WorkOrderSchema);
