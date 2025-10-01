import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const AccidentSchema = new mongoose.Schema({
  vehicleId: { type:mongoose.Schema.Types.ObjectId, ref:'Vehicle' },
  driverId: { type:mongoose.Schema.Types.ObjectId, ref:'Person' },
  date: Date,
  location: String,
  damages: String,
  investigation: String,
  documents: [{ type:String, url:String }]
},{ timestamps:true });
AccidentSchema.plugin(auditSoftDelete); AccidentSchema.plugin(paginate);
export default mongoose.model('Accident', AccidentSchema);
