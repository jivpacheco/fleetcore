import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

const { Schema } = mongoose

const EvidenceSchema = new Schema(
    {
        url: { type: String, trim: true, default: '' },
        type: { type: String, trim: true, default: '' }, // image | video | doc
        name: { type: String, trim: true, default: '' },
    },
    { _id: false }
)

const ServiceRequestSchema = new Schema(
    {
        code: { type: String, required: true, trim: true, uppercase: true, index: true },

        vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: null, index: true }, // opcional (auto-asignable)

        issueSummary: { type: String, required: true, trim: true, index: true },
        description: { type: String, trim: true, default: '' },

        // referencia humana (opcional)
        failureReportId: { type: Schema.Types.ObjectId, ref: 'FailureReport', default: null, index: true },

        evidence: [EvidenceSchema],

        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW', index: true },

        status: {
            type: String,
            enum: ['OPEN', 'IN_TRIAGE', 'APPROVED', 'REJECTED', 'CONVERTED', 'CANCELLED'],
            default: 'OPEN',
            index: true,
        },

        // links (cuando avance el flujo)
        triageId: { type: Schema.Types.ObjectId, ref: 'Triage', default: null, index: true },
        workOrderId: { type: Schema.Types.ObjectId, ref: 'WorkOrder', default: null, index: true },

        createdBy: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
    },
    { timestamps: true }
)

ServiceRequestSchema.index({ code: 1 }, { unique: true })
ServiceRequestSchema.plugin(auditSoftDelete)
ServiceRequestSchema.plugin(paginate)

export default mongoose.model('ServiceRequest', ServiceRequestSchema)