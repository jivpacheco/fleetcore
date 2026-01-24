// back/src/models/MediaFile.js
// -----------------------------------------------------------------------------
// Subschema reutilizable para manejar archivos (photo / documents[]).
// Persistimos el contrato FleetCore: photo + documents[] como MediaFile.
// -----------------------------------------------------------------------------

import mongoose from 'mongoose'

export const MediaFileSchema = new mongoose.Schema(
    {
        label: { type: String, trim: true, default: '' },
        url: { type: String, trim: true, default: '' },
        format: { type: String, trim: true, default: '' },
        contentType: { type: String, trim: true, default: '' },
        bytes: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },

        // Para providers tipo Cloudinary
        publicId: { type: String, trim: true, default: '' },
        provider: { type: String, trim: true, default: '' },
    },
    { _id: true }
)

// Nota: no exportamos mongoose.model() a propósito.
// Esto se usa embebido en otros esquemas.
