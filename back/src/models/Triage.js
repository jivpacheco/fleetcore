import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

const { Schema } = mongoose

const TriageSchema = new Schema(
    {
        serviceRequestId: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true, index: true },

        technicianId: { type: Schema.Types.ObjectId, ref: 'Person', default: null, index: true },

        // diagnóstico VMRS (estructura)
        vmrs: {
            systemCode: { type: String, trim: true, default: '' },
            componentCode: { type: String, trim: true, default: '' },
            symptomCode: { type: String, trim: true, default: '' }, // opcional
            causeCode: { type: String, trim: true, default: '' },   // futuro
        },

        diagnosis: { type: String, trim: true, default: '' },

        severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW', index: true },
        operationalImpact: { type: String, enum: ['NO_STOP', 'LIMITED', 'OUT_OF_SERVICE'], default: 'NO_STOP', index: true },

        estimatedLaborMinutes: { type: Number, default: 0 },

        status: { type: String, enum: ['PENDING', 'DIAGNOSED', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },

        createdBy: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
    },
    { timestamps: true }
)

TriageSchema.index({ serviceRequestId: 1 }, { unique: true }) // 1 triage por SR (decisión pro)
TriageSchema.index({ 'vmrs.systemCode': 1, 'vmrs.componentCode': 1 })
TriageSchema.plugin(auditSoftDelete)
TriageSchema.plugin(paginate)

export default mongoose.model('Triage', TriageSchema)