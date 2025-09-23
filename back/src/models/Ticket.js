import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const TicketSchema = new mongoose.Schema({
  folio: String,
  branchId: { type:mongoose.Schema.Types.ObjectId, ref:'Branch', index:true },
  subjectType: { type:String, enum:['vehicle','equipment','infrastructure'], required:true },
  subjectId: { type:mongoose.Schema.Types.ObjectId, required:true },
  description: String,
  status: { type:String, enum:['open','approved','rejected','in_ot','closed'], default:'open', index:true },
  workOrderId: { type:mongoose.Schema.Types.ObjectId, ref:'WorkOrder' },
  audit: {
    createdBy: { type:mongoose.Schema.Types.ObjectId, ref:'User' },
    approvedBy: { type:mongoose.Schema.Types.ObjectId, ref:'User' }
  }
},{ timestamps:true });
TicketSchema.index({ subjectType:1, subjectId:1 });
TicketSchema.plugin(auditSoftDelete); TicketSchema.plugin(paginate);
export default mongoose.model('Ticket', TicketSchema);
