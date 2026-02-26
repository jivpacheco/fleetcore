// import mongoose from 'mongoose';
// import auditSoftDelete from '../plugins/auditSoftDelete.js';
// import paginate from '../plugins/paginate.js';

// const TimeLogSchema = new mongoose.Schema({
//   start: Date, end: Date, duration: Number
// },{ _id:false });

// const TaskSchema = new mongoose.Schema({
//   description: String,
//   assignedTo: { type:mongoose.Schema.Types.ObjectId, ref:'Person' },
//   status: { type:String, enum:['pending','in_progress','paused','done'], default:'pending' },

//   // --- Aprobaciones (workflow) ---
//   // Soporta 1 o más niveles. Si no se usa, queda vacío.
//   approvals: [{
//     level: { type: Number, default: 1 },
//     status: { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
//     decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
//     decidedAt: { type: Date, default: null },
//     note: { type: String, default: '' },
//   }],

//   timeLogs: [TimeLogSchema]
// },{ _id:false });

// const WorkOrderSchema = new mongoose.Schema({
//   folio: String,
//   vehicleId: { type:mongoose.Schema.Types.ObjectId, ref:'Vehicle', index:true },
//   branchId: { type:mongoose.Schema.Types.ObjectId, ref:'Branch', index:true },
//   tasks: [TaskSchema],
//   parts: [{ productId: { type:mongoose.Schema.Types.ObjectId, ref:'Product' }, qty: Number, reservationId: { type:mongoose.Schema.Types.ObjectId, ref:'Reservation' } }],
//   observations: String,
//   status: { type:String, enum:['open','in_progress','closed'], default:'open', index:true }
// },{ timestamps:true });
// WorkOrderSchema.plugin(auditSoftDelete); WorkOrderSchema.plugin(paginate);
// export default mongoose.model('WorkOrder', WorkOrderSchema);

import mongoose from 'mongoose'
import auditSoftDelete from '../plugins/auditSoftDelete.js'
import paginate from '../plugins/paginate.js'

const { Schema } = mongoose

const TimeLogSchema = new Schema(
  { start: Date, end: Date, duration: Number },
  { _id: false }
)

const TaskSchema = new Schema(
  {
    description: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Person' },
    status: { type: String, enum: ['pending', 'in_progress', 'paused', 'done'], default: 'pending' },

    approvals: [
      {
        level: { type: Number, default: 1 },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
        decidedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
        decidedAt: { type: Date, default: null },
        note: { type: String, default: '' },
      },
    ],

    timeLogs: [TimeLogSchema],
  },
  { _id: false }
)

// Repairs ejecutadas (instancias) basadas en catálogo Repair
const WorkOrderRepairSchema = new Schema(
  {
    repairId: { type: Schema.Types.ObjectId, ref: 'Repair', required: true, index: true },
    nameSnapshot: { type: String, default: '' }, // opcional: snapshot para historial si cambia el catálogo
    status: { type: String, enum: ['planned', 'in_progress', 'done', 'cancelled'], default: 'planned', index: true },

    // VMRS recomendado para analytics (si Repair lo trae, lo copiamos)
    vmrs: {
      systemCode: { type: String, trim: true, default: '' },
      componentCode: { type: String, trim: true, default: '' },
      jobCode: { type: String, trim: true, default: '' },
    },

    // tiempos/costos reales (vs estándar)
    laborMinutesPlanned: { type: Number, default: 0 },
    laborMinutesActual: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { _id: false }
)

const WorkOrderSchema = new Schema(
  {
    folio: { type: String, trim: true, default: '' },

    // Origen del flujo (NUEVO)
    serviceRequestId: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', default: null},
    triageId: { type: Schema.Types.ObjectId, ref: 'Triage', default: null},

    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },

    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW', index: true },

    // VMRS a nivel OT (NUEVO) - diagnóstico consolidado
    vmrs: {
      systemCode: { type: String, trim: true, default: '' },
      componentCode: { type: String, trim: true, default: '' },
      symptomCode: { type: String, trim: true, default: '' }, // opcional
      causeCode: { type: String, trim: true, default: '' },   // futuro
    },

    // Ejecución
    tasks: [TaskSchema],
    repairs: [WorkOrderRepairSchema], // NUEVO

    parts: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        qty: Number,
        reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
      },
    ],

    observations: { type: String, default: '' },

    status: {
      type: String,
      enum: ['draft', 'approved', 'open', 'in_progress', 'paused', 'closed', 'cancelled'],
      default: 'open',
      index: true,
    },

    openedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },

    createdBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
)

// Índices útiles para reportes
WorkOrderSchema.index({ vehicleId: 1, createdAt: -1 })
WorkOrderSchema.index({ branchId: 1, createdAt: -1 })
WorkOrderSchema.index({ 'vmrs.systemCode': 1, 'vmrs.componentCode': 1 })
WorkOrderSchema.index({ serviceRequestId: 1 })
WorkOrderSchema.index({ triageId: 1 })

WorkOrderSchema.plugin(auditSoftDelete)
WorkOrderSchema.plugin(paginate)

export default mongoose.model('WorkOrder', WorkOrderSchema)