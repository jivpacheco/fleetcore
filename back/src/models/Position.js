import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const PositionSchema = new mongoose.Schema({
  // Código corto opcional (ej: TEC, BOD, JEF)
  code: { type: String, trim: true, uppercase: true, index: true },
  // Nombre visible (ej: Técnico, Bodega, Jefe de Taller)
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true, index: true },

  // Placeholder multi-tenant (futuro)
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true, default: null },
}, { timestamps: true });

PositionSchema.plugin(auditSoftDelete);
PositionSchema.plugin(paginate);

export default mongoose.model('Position', PositionSchema);
