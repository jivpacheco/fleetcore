import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const UserSchema = new mongoose.Schema({
  email: { type:String, unique:true, required:true, index:true },
  passwordHash: { type:String, required:true },
  roles: [{ type:String, enum:['admin','global','jefeTaller','bodega','tecnico'] }],
  branchIds: [{ type:mongoose.Schema.Types.ObjectId, ref:'Branch' }],
  active: { type:Boolean, default:true }
},{ timestamps:true });
UserSchema.plugin(auditSoftDelete); UserSchema.plugin(paginate);
export default mongoose.model('User', UserSchema);
