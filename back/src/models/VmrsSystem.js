// import mongoose from 'mongoose'
// import auditSoftDelete from '../plugins/auditSoftDelete.js'
// import paginate from '../plugins/paginate.js'

// function normStr(v) {
//     return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
// }

// const VmrsSystemSchema = new mongoose.Schema(
//     {
//         code: { type: String, required: true, trim: true, uppercase: true }, // "013"
//         nameEs: { type: String, required: true, trim: true, index: true },               // "Sistema de frenos"
//         nameEn: { type: String, trim: true, default: '' },                               // opcional
//         active: { type: Boolean, default: true, index: true },
//         sortOrder: { type: Number, default: 0, index: true },
//         createdBy: { type: String, default: '' },
//         updatedBy: { type: String, default: '' },
//     },
//     { timestamps: true }
// )

// VmrsSystemSchema.index({ code: 1 }, { unique: true })
// // Búsqueda rápida por texto común (no es text index, es para regex/like)
// VmrsSystemSchema.index({ nameEs: 1, nameEn: 1 })

// VmrsSystemSchema.pre('save', function () {
//     this.code = normStr(this.code)
//     this.nameEs = normStr(this.nameEs)
//     this.nameEn = normStr(this.nameEn)
// })

// VmrsSystemSchema.plugin(auditSoftDelete)
// VmrsSystemSchema.plugin(paginate)

// export default mongoose.model('VmrsSystem', VmrsSystemSchema)

import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

function normStr(v) {
    return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
}

const VmrsSystemSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, trim: true, uppercase: true }, // "013"
        nameEs: { type: String, required: true, trim: true },               // "Sistema de frenos"
        nameEn: { type: String, trim: true, default: '' },

        active: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },

        createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    { timestamps: true }
)

/**
 * Índices GOLD
 */

// 1) lookup exacto por código
VmrsSystemSchema.index({ code: 1 }, { unique: true })

// 2) listado jerárquico (dropdown/list)
VmrsSystemSchema.index({ active: 1, sortOrder: 1, nameEs: 1 })

// 3) texto libre (mixed search) - Mongo text index
//   - ÚNICO text index por colección
VmrsSystemSchema.index(
    { nameEs: 'text', nameEn: 'text', code: 'text' },
    { weights: { nameEs: 10, nameEn: 6, code: 12 }, name: 'vmrsSystem_text' }
)

VmrsSystemSchema.pre('save', function () {
    this.code = normStr(this.code)
    this.nameEs = normStr(this.nameEs)
    this.nameEn = normStr(this.nameEn)
})

VmrsSystemSchema.plugin(auditSoftDelete)
VmrsSystemSchema.plugin(paginate)

export default mongoose.model('VmrsSystem', VmrsSystemSchema)