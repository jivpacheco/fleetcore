// import mongoose from 'mongoose';
// import auditSoftDelete from '../plugins/auditSoftDelete.js';
// import paginate from '../plugins/paginate.js';

// const UserSchema = new mongoose.Schema({
//   email: { type:String, unique:true, required:true, index:true },
//   passwordHash: { type:String, required:true },
//   roles: [{ type:String, enum:['admin','global','jefeTaller','bodega','tecnico'] }],
//   branchIds: [{ type:mongoose.Schema.Types.ObjectId, ref:'Branch' }],
//   active: { type:Boolean, default:true }
// },{ timestamps:true });
// UserSchema.plugin(auditSoftDelete); UserSchema.plugin(paginate);
// export default mongoose.model('User', UserSchema);
// back/src/models/User.js
//
// Modelo de Usuario para identidad unificada (local + Microsoft)
// - Email único (clave de unificación)
// - Soporta login local (password hash) y Microsoft (OIDC)
// - Bandera mustChangePassword para claves temporales
// - Oculta información sensible en toJSON
//
// Notas:
// - El dominio permitido también se valida en auth.routes.js. Aquí proveemos helpers por si quieres usar validaciones de dominio a nivel de modelo.
// - Usa bcryptjs para hashing de contraseñas locales.
// - Ajusta roles/branchIds según tu negocio (p. ej., ['global'] para acceso total).

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema, model } = mongoose

// Ajusta si lo deseas via .env
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12)
// Opcional: "pepper" extra que agregas al password antes de hashear (mejora seguridad)
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER || ''

// Helper: normaliza email (lowercase, trim)
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

const UserSchema = new Schema(
  {
    // --------- Identidad base ---------
    email: {
      type: String,
      required: true,
      unique: true,        // índice único
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },

    // --------- Estado / Acceso ---------
    isActive: {
      type: Boolean,
      default: true,       // puedes desactivar usuarios sin borrarlos
      index: true,
    },
    roles: {
      type: [String],      // p. ej. ['user'], ['global'], ['admin']
      default: ['user'],
      index: true,
    },
    branchIds: {
      type: [Schema.Types.ObjectId], // IDs de sucursales asociadas (scope)
      ref: 'Branch',
      default: [],
      index: true,
    },

    // --------- Credenciales locales (opcionales) ---------
    local: {
      passwordHash: { type: String, default: '' },
      mustChangePassword: { type: Boolean, default: false }, // para claves temporales
      passwordUpdatedAt: { type: Date },
      allowLocalLogin: { type: Boolean, default: true },     // puedes deshabilitar login local por usuario
    },

    // --------- Proveedores externos ---------
    providers: {
      // Identidad Microsoft (OIDC)
      microsoft: {
        sub: { type: String, sparse: true, unique: true },    // subject OIDC (único, pero sparse)
        tid: { type: String },                                 // tenant id (opcional)
        oid: { type: String },                                 // object id (opcional)
        upn: { type: String },                                 // user principal name / preferred_username
        allowMicrosoftLogin: { type: Boolean, default: true }, // habilitar/deshabilitar por usuario
      },
      // Si mañana agregas Google, Okta, etc., añade aquí más objetos
    },

    // --------- Auditoría básica ---------
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },

    // --------- Soft delete (opcional) ---------
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
  },
  {
    timestamps: true, // createdAt / updatedAt
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // Ocultamos campos sensibles
        if (ret.local) {
          delete ret.local.passwordHash
        }
        delete ret.__v
        return ret
      },
    },
  }
)

// -------------------- Indexes adicionales --------------------
// Asegura unicidad del email (por si el índice no se creó al vuelo)
// UserSchema.index({ email: 1 }, { unique: true })

// Unicidad de providers.microsoft.sub (sparse permite null/undefined repetidos)
// UserSchema.index({ 'providers.microsoft.sub': 1 }, { unique: true, sparse: true })

// -------------------- Validaciones / Hooks --------------------

// Normaliza email antes de validar/guardar
UserSchema.pre('validate', function (next) {
  if (this.email) this.email = normalizeEmail(this.email)
  next()
})

// Opcional: validador de dominio permitido a nivel modelo (puedes activarlo si quieres forzar desde DB)
// Ten en cuenta que el control principal ya lo hacemos en auth.routes.js.
UserSchema.path('email').validate(function (value) {
  const allowed = (process.env.ALLOWED_DOMAIN || '').trim().toLowerCase()
  if (!allowed) return true // sin restricción
  return value.endsWith(`@${allowed}`)
}, 'El dominio del correo no está permitido')

// -------------------- Métodos de instancia --------------------

/**
 * Establece/actualiza la contraseña local del usuario.
 * - Hashea con bcrypt + pepper (si definido)
 * - Marca passwordUpdatedAt
 * - Opcional: limpiar mustChangePassword (si era clave temporal)
 */
UserSchema.methods.setPassword = async function setPassword(plain) {
  if (!plain || typeof plain !== 'string') {
    throw new Error('Password inválido')
  }
  const toHash = PASSWORD_PEPPER ? plain + PASSWORD_PEPPER : plain
  const hash = await bcrypt.hash(toHash, BCRYPT_SALT_ROUNDS)
  this.local.passwordHash = hash
  this.local.passwordUpdatedAt = new Date()
}

/**
 * Verifica una contraseña local contra el hash guardado.
 * Retorna true/false.
 */
UserSchema.methods.checkPassword = async function checkPassword(plain) {
  if (!this.local?.passwordHash) return false
  const toCompare = PASSWORD_PEPPER ? plain + PASSWORD_PEPPER : plain
  return bcrypt.compare(toCompare, this.local.passwordHash)
}

/**
 * Soft delete (opcional): marca el usuario como eliminado.
 * Útil si quieres mantener historial.
 */
UserSchema.methods.softDelete = async function softDelete(byUserId) {
  this.deletedAt = new Date()
  this.deletedBy = byUserId || null
  this.isActive = false
  await this.save()
}

// -------------------- Métodos estáticos --------------------

/**
 * Busca por email normalizado.
 */
UserSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: normalizeEmail(email) })
}

/**
 * findPaged (opcional): si tu controlador usa Model.findPaged,
 * puedes proveer una implementación simple aquí.
 * - filter: objeto de filtro
 * - page: número de página (1-based)
 * - limit: tamaño de página
 * - sort: orden (por defecto -createdAt)
 */
UserSchema.statics.findPaged = async function findPaged({
  filter = {},
  page = 1,
  limit = 10,
  sort = '-createdAt',
  projection = null,
}) {
  const p = Math.max(parseInt(page, 10) || 1, 1)
  const l = Math.max(parseInt(limit, 10) || 10, 1)

  const [items, total] = await Promise.all([
    this.find(filter, projection).sort(sort).skip((p - 1) * l).limit(l).lean(),
    this.countDocuments(filter),
  ])

  return {
    items,
    total,
    page: p,
    limit: l,
    pages: Math.ceil(total / l) || 1,
  }
}

const User = model('User', UserSchema)
export default User
