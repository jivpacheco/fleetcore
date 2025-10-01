import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const ToolLoanSchema = new mongoose.Schema({
  productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' },
  personId: { type:mongoose.Schema.Types.ObjectId, ref:'Person' },
  loanDate: Date,
  returnDate: Date,
  notes: String
},{ timestamps:true });
ToolLoanSchema.plugin(auditSoftDelete); ToolLoanSchema.plugin(paginate);
export default mongoose.model('ToolLoan', ToolLoanSchema);
