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
//         code: { type: String, required: true, trim: true, uppercase: true},
//         // code: { type: String, required: true, trim: true, uppercase: true, index: true },
//         name: { type: String, required: true, trim: true, index: true },
//         description: { type: String, trim: true, default: '' },

//         // Clasificación técnica
//         systemKey: { type: String, trim: true, default: '', index: true },
//         subsystemKey: { type: String, trim: true, default: '' },
//         componentKey: { type: String, trim: true, default: '' },
//         failureModeKey: { type: String, trim: true, default: '' },

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

// RepairSchema.plugin(auditSoftDelete)
// RepairSchema.plugin(paginate)

// export default mongoose.model('Repair', RepairSchema)

// back/src/models/Repair.js
// -----------------------------------------------------------------------------
// Catálogo de Reparaciones (taller / técnico)
// - Base para KPI: standardLaborMinutes
// - Incluye media (photo + documents[]) como MediaFile
// - Paginación findPaged (paginate plugin)
// -----------------------------------------------------------------------------

import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'
import { MediaFileSchema } from './MediaFile.js'

const RepairSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, trim: true, uppercase: true },
        name: { type: String, required: true, trim: true, index: true },
        description: { type: String, trim: true, default: '' },

        // Clasificación técnica (taxonomía FleetCore)
        systemKey: { type: String, trim: true, default: '', index: true },
        subsystemKey: { type: String, trim: true, default: '' },
        componentKey: { type: String, trim: true, default: '' },
        failureModeKey: { type: String, trim: true, default: '' },

        // VMRS (mapeo técnico opcional recomendado)
        vmrs: {
            systemCode: { type: String, trim: true, default: '' },    // ej: "013"
            componentCode: { type: String, trim: true, default: '' }, // ej: "013-02"
            jobCode: { type: String, trim: true, default: '' },       // minor/job (si usas RTA)
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
        standardLaborMinutes: { type: Number, default: 0 },

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

RepairSchema.index({ code: 1 }, { unique: true })
// Índices VMRS para filtro/analytics
RepairSchema.index({ 'vmrs.systemCode': 1 })
RepairSchema.index({ 'vmrs.componentCode': 1 })
RepairSchema.index({ 'vmrs.jobCode': 1 })

RepairSchema.plugin(auditSoftDelete)
RepairSchema.plugin(paginate)

export default mongoose.model('Repair', RepairSchema)