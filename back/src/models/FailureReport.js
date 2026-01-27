// back/src/models/FailureReport.js
// -----------------------------------------------------------------------------
// Catálogo de Reporte de Fallas (Cliente/Sucursal)
// - Pensado para "no expertos": sistemas principales + descripción guiada
// - Se usa al crear Tickets desde sucursal
// -----------------------------------------------------------------------------

import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

const FailureReportSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, trim: true, uppercase: true },
        // code: { type: String, required: true, trim: true, uppercase: true, index: true },
        name: { type: String, required: true, trim: true, index: true },
        description: { type: String, trim: true, default: '' },

        // Clasificación “macro” (no diagnóstico)
        systemKey: { type: String, required: true, trim: true, index: true },
        zoneKey: { type: String, trim: true, default: '' },

        // Ayuda para formularios de ticket
        suggestedQuestions: [{ type: String, trim: true }],
        tags: [{ type: String, trim: true }],

        active: { type: Boolean, default: true, index: true },

        createdBy: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
    },
    { timestamps: true }
)

FailureReportSchema.index({ code: 1 }, { unique: true })

FailureReportSchema.plugin(auditSoftDelete)
FailureReportSchema.plugin(paginate)

export default mongoose.model('FailureReport', FailureReportSchema)
