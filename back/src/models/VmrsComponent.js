import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

function normStr(v) {
    return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
}

const VmrsComponentSchema = new mongoose.Schema(
    {
        systemCode: { type: String, required: true, trim: true, uppercase: true }, // "013"
        code: { type: String, required: true, trim: true, uppercase: true },       // "013-02"
        nameEs: { type: String, required: true, trim: true, index: true },
        nameEn: { type: String, trim: true, default: '' },
        active: { type: Boolean, default: true, index: true },
        sortOrder: { type: Number, default: 0, index: true },
        createdBy: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
    },
    { timestamps: true }
)

VmrsComponentSchema.index({ systemCode: 1, code: 1 }, { unique: true })
VmrsComponentSchema.index({ systemCode: 1, sortOrder: 1, code: 1 }) // list por systemCode
VmrsComponentSchema.index({ nameEs: 1, nameEn: 1 })

VmrsComponentSchema.pre('save', function () {
    this.systemCode = normStr(this.systemCode)
    this.code = normStr(this.code)
    this.nameEs = normStr(this.nameEs)
    this.nameEn = normStr(this.nameEn)
})

VmrsComponentSchema.plugin(auditSoftDelete)
VmrsComponentSchema.plugin(paginate)

export default mongoose.model('VmrsComponent', VmrsComponentSchema)