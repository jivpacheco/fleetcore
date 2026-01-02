// import mongoose from 'mongoose';

// const RoleSchema = new mongoose.Schema(
//   {
//     organizationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Organization',
//       required: true,
//       index: true,
//     },
//     code: { type: String, required: true, uppercase: true, trim: true },
//     name: { type: String, required: true },
//     permissions: [{ type: String }],
//     scope: {
//       type: String,
//       enum: ['GLOBAL', 'BRANCH'],
//       default: 'BRANCH',
//     },
//     active: { type: Boolean, default: true },
//     isSystem: { type: Boolean, default: false }, // protege roles base
//   },
//   { timestamps: true }
// );

// RoleSchema.index({ organizationId: 1, code: 1 }, { unique: true });

// export default mongoose.model('Role', RoleSchema);

import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const RoleSchema = new mongoose.Schema(
  {
    // Código único (ej: ADMIN, GLOBAL, TECNICO)
    code: { type: String, required: true, trim: true, uppercase: true, index: true },

    // Nombre visible (ej: Administrador, Global, Técnico)
    name: { type: String, required: true, trim: true, index: true },

    // Permisos (strings): "people.read", "roles.manage", etc.
    permissions: [{ type: String, trim: true }],

    // Alcance: GLOBAL (todas las sucursales) | BRANCH (sólo su sucursal/scope)
    scope: { type: String, enum: ['GLOBAL', 'BRANCH'], default: 'BRANCH', index: true },

    active: { type: Boolean, default: true, index: true },

    // Protege roles base (si decides marcar algunos como sistema)
    isSystem: { type: Boolean, default: false, index: true },

    // Multi-tenant (futuro) - NO obligatorio por ahora
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true, default: null },
  },
  { timestamps: true }
);

// Si quieres evitar duplicados por org en el futuro:
// RoleSchema.index({ organizationId: 1, code: 1 }, { unique: true });

RoleSchema.plugin(auditSoftDelete);
RoleSchema.plugin(paginate);

export default mongoose.model('Role', RoleSchema);
