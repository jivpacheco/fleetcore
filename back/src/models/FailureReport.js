// // back/src/models/FailureReport.js
// // -----------------------------------------------------------------------------
// // Catálogo de Reporte de Fallas (Cliente/Sucursal)
// // - Pensado para "no expertos": sistemas principales + descripción guiada
// // - Se usa al crear Tickets desde sucursal
// // -----------------------------------------------------------------------------

// import mongoose from 'mongoose'
// import auditSoftDelete from '../plugins/auditSoftDelete.js'
// import paginate from '../plugins/paginate.js'

// const FailureReportSchema = new mongoose.Schema(
//     {
//         code: { type: String, required: true, trim: true, uppercase: true },
//         // code: { type: String, required: true, trim: true, uppercase: true, index: true },
//         name: { type: String, required: true, trim: true, index: true },
//         description: { type: String, trim: true, default: '' },

//         // Clasificación “macro” (no diagnóstico)
//         systemKey: { type: String, required: true, trim: true, index: true },
//         zoneKey: { type: String, trim: true, default: '' },

//         // Ayuda para formularios de ticket
//         suggestedQuestions: [{ type: String, trim: true }],
//         tags: [{ type: String, trim: true }],

//         active: { type: Boolean, default: true, index: true },

//         createdBy: { type: String, default: '' },
//         updatedBy: { type: String, default: '' },
//     },
//     { timestamps: true }
// )

// FailureReportSchema.index({ code: 1 }, { unique: true })

// FailureReportSchema.plugin(auditSoftDelete)
// FailureReportSchema.plugin(paginate)

// export default mongoose.model('FailureReport', FailureReportSchema)

// back/src/models/FailureReport.js
// -----------------------------------------------------------------------------
// Catálogo de Reporte de Fallas (Cliente/Sucursal)
// - Pensado para "no expertos": sistemas principales + descripción guiada
// - Se usa al crear Tickets desde sucursal
// -----------------------------------------------------------------------------

import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

function normStr(v) {
    return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
}
function normKey(v) {
    return typeof v === 'string'
        ? v.trim().toLowerCase().replace(/\s+/g, ' ')
        : v
}

const FailureReportSchema = new mongoose.Schema(
    {
        // Código interno del catálogo (ej: FR-000123)
        code: { type: String, required: true, trim: true, uppercase: true },

        // Título “humano”
        name: { type: String, required: true, trim: true },

        // Descripción/ayuda
        description: { type: String, trim: true, default: '' },

        // Clasificación macro (no diagnóstico)
        systemKey: { type: String, required: true, trim: true },
        zoneKey: { type: String, trim: true, default: '' },

        // Ayuda para formulario
        suggestedQuestions: [{ type: String, trim: true }],
        tags: [{ type: String, trim: true }],

        // ====== SRM / catálogo avanzado ======
        source: { type: String, trim: true, default: 'MANUAL', index: true }, // SRM | MANUAL | USER | ...
        normalizedName: { type: String, trim: true, default: '', index: true }, // dedupe/búsqueda
        aliases: [{ type: String, trim: true }], // sinónimos
        scoreCount: { type: Number, default: 0, index: true }, // frecuencia SRM
        examples: [{ type: String, trim: true }], // 2–5 ejemplos reales
        lastSeenAt: { type: Date, default: null, index: true },

        // Link a VMRS (para navegación jerárquica opcional)
        vmrsSystemCode: { type: String, trim: true, uppercase: true, default: '', index: true },
        vmrsComponentCode: { type: String, trim: true, uppercase: true, default: '', index: true },
        vmrsJobCode: { type: String, trim: true, uppercase: true, default: '', index: true },

        active: { type: Boolean, default: true, index: true },

        createdBy: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
    },
    { timestamps: true }
)

// Unicidad por code
FailureReportSchema.index({ code: 1 }, { unique: true })

// UI navegación jerárquica (rápido)
FailureReportSchema.index({ systemKey: 1, zoneKey: 1, active: 1 })

// Búsqueda mixta: texto libre sin text-index (regex) + filtros
FailureReportSchema.index({ name: 1, normalizedName: 1, active: 1 })
FailureReportSchema.index({ tags: 1, active: 1 }) // multikey

// (Opcional) Text Index para búsqueda libre "tipo Google"
// OJO: solo 1 text index por colección.
// FailureReportSchema.index({ name: 'text', description: 'text', tags: 'text', aliases: 'text' })

FailureReportSchema.pre('save', function () {
    this.code = normStr(this.code)
    this.name = normStr(this.name)
    this.description = normStr(this.description)
    this.systemKey = normStr(this.systemKey)
    this.zoneKey = normStr(this.zoneKey)

    // Normalizado para dedupe/búsqueda
    if (!this.normalizedName) this.normalizedName = normKey(this.name)
    else this.normalizedName = normKey(this.normalizedName)

    if (Array.isArray(this.aliases)) this.aliases = this.aliases.map(normStr).filter(Boolean)
    if (Array.isArray(this.tags)) this.tags = this.tags.map(normStr).filter(Boolean)
    if (Array.isArray(this.examples)) this.examples = this.examples.map(normStr).filter(Boolean)

    this.vmrsSystemCode = normStr(this.vmrsSystemCode)
    this.vmrsComponentCode = normStr(this.vmrsComponentCode)
    this.vmrsJobCode = normStr(this.vmrsJobCode)
})

FailureReportSchema.plugin(auditSoftDelete)
FailureReportSchema.plugin(paginate)

export default mongoose.model('FailureReport', FailureReportSchema)