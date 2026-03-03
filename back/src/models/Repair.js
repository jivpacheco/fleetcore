// // back/src/models/Repair.js
// // -----------------------------------------------------------------------------
// // Catálogo de Reparaciones (taller / técnico)
// // - Base para KPI: standardLaborMinutes
// // - Incluye media (photo + documents[]) como MediaFile
// // - Paginación findPaged (paginate plugin)
// // -----------------------------------------------------------------------------

// import mongoose from 'mongoose'
// import auditSoftDelete from '../plugins/auditSoftDelete.js'
// import paginate from '../plugins/paginate.js'
// import { MediaFileSchema } from './MediaFile.js'

// const RepairSchema = new mongoose.Schema(
//     {
//         code: { type: String, required: true, trim: true, uppercase: true },
//         name: { type: String, required: true, trim: true, index: true },
//         description: { type: String, trim: true, default: '' },

//         // Clasificación técnica (taxonomía FleetCore)
//         systemKey: { type: String, trim: true, default: '', index: true },
//         subsystemKey: { type: String, trim: true, default: '' },
//         componentKey: { type: String, trim: true, default: '' },
//         failureModeKey: { type: String, trim: true, default: '' },

//         // VMRS (mapeo técnico opcional recomendado)
//         vmrs: {
//             systemCode: { type: String, trim: true, default: '' },    // ej: "013"
//             componentCode: { type: String, trim: true, default: '' }, // ej: "013-02"
//             jobCode: { type: String, trim: true, default: '' },       // minor/job (si usas RTA)
//         },

//         repairType: {
//             type: String,
//             enum: ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'ADJUSTMENT'],
//             default: 'CORRECTIVE',
//             index: true,
//         },

//         severityDefault: {
//             type: String,
//             enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
//             default: 'MEDIUM',
//             index: true,
//         },

//         operationalImpactDefault: {
//             type: String,
//             enum: ['NO_STOP', 'LIMITED', 'OUT_OF_SERVICE'],
//             default: 'LIMITED',
//             index: true,
//         },

//         // KPI estándar (minutos)
//         standardLaborMinutes: { type: Number, default: 0 },

//         tags: [{ type: String, trim: true }],
//         active: { type: Boolean, default: true, index: true },

//         // Media
//         photo: { type: MediaFileSchema, default: null },
//         documents: { type: [MediaFileSchema], default: [] },

//         createdBy: { type: String, default: '' },
//         updatedBy: { type: String, default: '' },
//     },
//     { timestamps: true }
// )

// RepairSchema.index({ code: 1 }, { unique: true })
// // Índices VMRS para filtro/analytics
// RepairSchema.index({ 'vmrs.systemCode': 1 })
// RepairSchema.index({ 'vmrs.componentCode': 1 })
// RepairSchema.index({ 'vmrs.jobCode': 1 })

// RepairSchema.plugin(auditSoftDelete)
// RepairSchema.plugin(paginate)

// export default mongoose.model('Repair', RepairSchema)

// back/src/models/Repair.js
// -----------------------------------------------------------------------------
// Catálogo de Reparaciones (taller / técnico)
// - Base para KPI: standardLaborMinutes
// - Incluye media (photo + documents[]) como MediaFile
// - Soporta búsqueda mixta:
//    (1) texto libre: name/description/tags
//    (2) navegación: systemKey/subsystemKey/componentKey/failureModeKey
//    (3) jerarquía VMRS: vmrs.systemCode / vmrs.componentCode / vmrs.jobCode
// -----------------------------------------------------------------------------

import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'
import { MediaFileSchema } from './MediaFile.js'

function normStr(v) {
    return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
}
function normKey(v) {
    return typeof v === 'string'
        ? v.trim().toLowerCase().replace(/\s+/g, ' ')
        : v
}

const RepairSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, trim: true, uppercase: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },

        // Clasificación técnica (taxonomía FleetCore)
        systemKey: { type: String, trim: true, default: '' },
        subsystemKey: { type: String, trim: true, default: '' },
        componentKey: { type: String, trim: true, default: '' },
        failureModeKey: { type: String, trim: true, default: '' },

        // Búsqueda/normalización (para dedupe + search)
        normalizedName: { type: String, trim: true, default: '', index: true },
        aliases: [{ type: String, trim: true }], // sinónimos

        // VMRS (mapeo técnico opcional recomendado)
        vmrs: {
            systemCode: { type: String, trim: true, uppercase: true, default: '' },    // "013"
            componentCode: { type: String, trim: true, uppercase: true, default: '' }, // "013-02"
            jobCode: { type: String, trim: true, uppercase: true, default: '' },       // "013-02-001"
        },

        repairType: {
            type: String,
            enum: ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'ADJUSTMENT'],
            default: 'CORRECTIVE',
            index: true,
        },

        severityDefault: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            default: 'MEDIUM',
            index: true,
        },

        operationalImpactDefault: {
            type: String,
            enum: ['NO_STOP', 'LIMITED', 'OUT_OF_SERVICE'],
            default: 'LIMITED',
            index: true,
        },

        // KPI estándar (minutos)
        standardLaborMinutes: { type: Number, default: 0, index: true },

        tags: [{ type: String, trim: true }],
        active: { type: Boolean, default: true, index: true },

        // Media
        photo: { type: MediaFileSchema, default: null },
        documents: { type: [MediaFileSchema], default: [] },

        createdBy: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
    },
    { timestamps: true }
)

// -------------------- ÍNDICES (sin duplicidad) --------------------

// Unicidad
RepairSchema.index({ code: 1 }, { unique: true })

// Navegación jerárquica FleetCore
RepairSchema.index({ systemKey: 1, subsystemKey: 1, componentKey: 1, active: 1 })
RepairSchema.index({ failureModeKey: 1, active: 1 })

// VMRS para filtros/analytics
RepairSchema.index({ 'vmrs.systemCode': 1, active: 1 })
RepairSchema.index({ 'vmrs.componentCode': 1, active: 1 })
RepairSchema.index({ 'vmrs.jobCode': 1, active: 1 })

// Texto libre (sin text-index por ahora; sirve para regex/like)
RepairSchema.index({ name: 1, normalizedName: 1, active: 1 })
RepairSchema.index({ tags: 1, active: 1 })       // multikey
RepairSchema.index({ aliases: 1, active: 1 })    // multikey

// (Opcional) Text index: SOLO si decides usar $text en Mongo.
// OJO: una colección solo puede tener 1 text index.
// RepairSchema.index({ name: 'text', description: 'text', tags: 'text', aliases: 'text' })

// Normalización
RepairSchema.pre('save', function () {
    this.code = normStr(this.code)
    this.name = normStr(this.name)
    this.description = normStr(this.description)

    this.systemKey = normStr(this.systemKey)
    this.subsystemKey = normStr(this.subsystemKey)
    this.componentKey = normStr(this.componentKey)
    this.failureModeKey = normStr(this.failureModeKey)

    if (!this.normalizedName) this.normalizedName = normKey(this.name)
    else this.normalizedName = normKey(this.normalizedName)

    if (Array.isArray(this.tags)) this.tags = this.tags.map(normStr).filter(Boolean)
    if (Array.isArray(this.aliases)) this.aliases = this.aliases.map(normStr).filter(Boolean)

    if (this.vmrs) {
        this.vmrs.systemCode = normStr(this.vmrs.systemCode)
        this.vmrs.componentCode = normStr(this.vmrs.componentCode)
        this.vmrs.jobCode = normStr(this.vmrs.jobCode)
    }
})

RepairSchema.plugin(auditSoftDelete)
RepairSchema.plugin(paginate)

export default mongoose.model('Repair', RepairSchema)