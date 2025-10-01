import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const LocationSchema = new mongoose.Schema({
  code: { type:String, required:true },
  name: { type:String, required:true },
  type: { type:String, enum:['BRANCH','WORKSHOP','WAREHOUSE','BIN','VEHICLE','TOOLCART','PERSON'], required:true },
  branchId: { type:mongoose.Schema.Types.ObjectId, ref:'Branch' },
  parentId: { type:mongoose.Schema.Types.ObjectId, ref:'Location' }
},{ timestamps:true });
LocationSchema.index({ code:1, branchId:1 }, { unique:true });
LocationSchema.plugin(auditSoftDelete); LocationSchema.plugin(paginate);
export default mongoose.model('Location', LocationSchema);
