import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

function normStr(v) {
    return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v
}

const VmrsSystemSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, trim: true, uppercase: true, index: true }, // "013"
        nameEs: { type: String, required: true, trim: true, index: true },               // "Sistema de frenos"
        nameEn: { type: String, trim: true, default: '' },                               // opcional
        active: { type: Boolean, default: true, index: true },
        sortOrder: { type: Number, default: 0, index: true },
        createdBy: { type: String, default: '' },
        updatedBy: { type: String, default: '' },
    },
    { timestamps: true }
)

VmrsSystemSchema.index({ code: 1 }, { unique: true })
// Búsqueda rápida por texto común (no es text index, es para regex/like)
VmrsSystemSchema.index({ nameEs: 1, nameEn: 1 })

VmrsSystemSchema.pre('save', function () {
    this.code = normStr(this.code)
    this.nameEs = normStr(this.nameEs)
    this.nameEn = normStr(this.nameEn)
})

VmrsSystemSchema.plugin(auditSoftDelete)
VmrsSystemSchema.plugin(paginate)

export default mongoose.model('VmrsSystem', VmrsSystemSchema)