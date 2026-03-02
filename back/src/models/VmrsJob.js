// import mongoose from 'mongoose'
// import auditSoftDelete from '../plugins/auditSoftDelete.js'
// import paginate from '../plugins/paginate.js'

// function normStr(v) {
//     return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
// }

// const VmrsJobSchema = new mongoose.Schema(
//     {
//         // 3-digit (System)
//         systemCode: { type: String, required: true, trim: true, uppercase: true, index: true }, // "021"

//         // 6-digit (Component)
//         componentCode: { type: String, required: true, trim: true, uppercase: true, index: true }, // "021-001"

//         // 9-digit (Job/Detail)
//         jobCode: { type: String, required: true, trim: true, uppercase: true}, // "021-001-048"

//         nameEs: { type: String, required: true, trim: true, index: true },
//         nameEn: { type: String, trim: true, default: '' },

//         // desde RTA si existe
//         stdLaborHours: { type: Number, default: 0, index: true },

//         active: { type: Boolean, default: true, index: true },
//         sortOrder: { type: Number, default: 0, index: true },

//         createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
//         updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
//     },
//     { timestamps: true }
// )

// // único por jobCode (suficiente y rápido)
// VmrsJobSchema.index({ jobCode: 1 }, { unique: true })
// // list por sistema/componente
// VmrsJobSchema.index({ systemCode: 1, componentCode: 1, jobCode: 1 })
// // búsqueda rápida
// VmrsJobSchema.index({ nameEs: 1, nameEn: 1 })

// VmrsJobSchema.pre('save', function () {
//     this.systemCode = normStr(this.systemCode)
//     this.componentCode = normStr(this.componentCode)
//     this.jobCode = normStr(this.jobCode)
//     this.nameEs = normStr(this.nameEs)
//     this.nameEn = normStr(this.nameEn)
// })

// VmrsJobSchema.plugin(auditSoftDelete)
// VmrsJobSchema.plugin(paginate)

// export default mongoose.model('VmrsJob', VmrsJobSchema)

import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

function normStr(v) {
    return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
}

const VmrsJobSchema = new mongoose.Schema(
    {
        systemCode: { type: String, required: true, trim: true, uppercase: true },     // "021"
        componentCode: { type: String, required: true, trim: true, uppercase: true }, // "021-001"
        jobCode: { type: String, required: true, trim: true, uppercase: true },       // "021-001-048"

        nameEs: { type: String, required: true, trim: true },
        nameEn: { type: String, trim: true, default: '' },

        stdLaborHours: { type: Number, default: 0 },

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

// 1) único por jobCode (lookup exacto y evita duplicados)
VmrsJobSchema.index({ jobCode: 1 }, { unique: true })

// 2) navegación/listado por jerarquía
VmrsJobSchema.index({ systemCode: 1, componentCode: 1, active: 1, sortOrder: 1, nameEs: 1 })

// 3) lookup por jerarquía exacta (cuando haces findOne por system+component+job)
VmrsJobSchema.index({ systemCode: 1, componentCode: 1, jobCode: 1 })

// 4) texto libre (mixed search)
VmrsJobSchema.index(
    { nameEs: 'text', nameEn: 'text', jobCode: 'text', componentCode: 'text', systemCode: 'text' },
    { weights: { nameEs: 10, nameEn: 6, jobCode: 12, componentCode: 8, systemCode: 4 }, name: 'vmrsJob_text' }
)

VmrsJobSchema.pre('save', function () {
    this.systemCode = normStr(this.systemCode)
    this.componentCode = normStr(this.componentCode)
    this.jobCode = normStr(this.jobCode)
    this.nameEs = normStr(this.nameEs)
    this.nameEn = normStr(this.nameEn)
})

VmrsJobSchema.plugin(auditSoftDelete)
VmrsJobSchema.plugin(paginate)

export default mongoose.model('VmrsJob', VmrsJobSchema)