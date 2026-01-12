// back/src/models/DrivingTest.js
import mongoose from 'mongoose';
import auditSoftDelete from '../plugins/auditSoftDelete.js';
import paginate from '../plugins/paginate.js';

const TrackPointSchema = new mongoose.Schema(
    { lat: Number, lng: Number, at: Date },
    { _id: false }
);

const DrivingTestSchema = new mongoose.Schema(
    {
        personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true, index: true },
        examinerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true, index: true },
        vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },

        status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELED'], default: 'IN_PROGRESS', index: true },
        startedAt: { type: Date, default: null },
        endedAt: { type: Date, default: null },
        durationSec: { type: Number, default: 0 },
        distanceKm: { type: Number, default: 0 },

        track: { type: [TrackPointSchema], default: [] },

        // Imagen del recorrido: puede guardarse como URL (Cloudinary u otro) o como dataURL/base64
        // Nota: para producción se recomienda URL (almacenamiento externo).
        mapSnapshotUrl: { type: String, default: '' },
        mapSnapshotDataUrl: { type: String, default: '' },
        notes: { type: String, default: '' },

        createdBy: { type: String, default: null, index: true },
        updatedBy: { type: String, default: null, index: true },
    },
    { timestamps: true }
);

DrivingTestSchema.index({ personId: 1, createdAt: -1 });
DrivingTestSchema.index({ branchId: 1, createdAt: -1 });

DrivingTestSchema.plugin(auditSoftDelete);
DrivingTestSchema.plugin(paginate);

export default mongoose.model('DrivingTest', DrivingTestSchema);
