// back/src/controllers/repairsMedia.controller.js
// -----------------------------------------------------------------------------
// Media para Catálogo de Reparaciones:
// - Foto (photo)
// - Documentos (documents[])
// Nota: utiliza el storage existente (services/storage) vía getStorage()
// -----------------------------------------------------------------------------

import multer from 'multer'
import path from 'path'
import Repair from '../models/Repair.js'
import { getStorage } from '../services/storage/index.js'

export const uploadMemory = multer({ storage: multer.memoryStorage() })

function extFromFile(file) {
    const fromName = path.extname(file.originalname || '').replace('.', '').toLowerCase()
    const fromMime = (file.mimetype || '').split('/').pop() || ''
    return fromName || fromMime || ''
}

function toMediaFile({ uploaded, file, label = '' } = {}) {
    return {
        label: (label || '').trim(),
        url: uploaded?.url || '',
        format: uploaded?.format || extFromFile(file),
        contentType: file?.mimetype || '',
        bytes: uploaded?.bytes || file?.size || 0,
        uploadedAt: new Date(),
        publicId: uploaded?.publicId || '',
        provider: uploaded?.provider || '',
    }
}

// ====================== PHOTO ======================
export async function uploadRepairPhoto(req, res, next) {
    try {
        const { repairId } = req.params
        const repair = await Repair.findById(repairId)
        if (!repair) return res.status(404).json({ message: 'Reparación no encontrada' })
        if (!req.file) return res.status(400).json({ message: 'Archivo requerido' })

        const storage = getStorage()
        const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/catalogs/repairs/${repairId}/photo`

        const uploaded = await storage.uploadImage({ buffer: req.file.buffer, folder })

        // borrar anterior
        if (repair.photo?.publicId) {
            await storage.delete({ publicId: repair.photo.publicId, resourceType: 'image' })
        }

        repair.photo = toMediaFile({ uploaded: { ...uploaded, provider: uploaded.provider || storage.name }, file: req.file })
        repair.updatedBy = req.user?.uid
        await repair.save()

        return res.status(201).json({ item: repair.photo })
    } catch (err) {
        next(err)
    }
}

// ====================== DOCUMENTS ======================
export async function uploadRepairDocument(req, res, next) {
    try {
        const { repairId } = req.params
        const repair = await Repair.findById(repairId)
        if (!repair) return res.status(404).json({ message: 'Reparación no encontrada' })
        if (!req.file) return res.status(400).json({ message: 'Archivo requerido' })

        const storage = getStorage()
        const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/catalogs/repairs/${repairId}/documents`

        const uploaded = await storage.uploadFile({ buffer: req.file.buffer, folder })

        const doc = toMediaFile({
            uploaded: { ...uploaded, provider: uploaded.provider || storage.name },
            file: req.file,
            label: req.body?.label || req.file.originalname,
        })

        repair.documents.push(doc)
        repair.updatedBy = req.user?.uid
        await repair.save()

        return res.status(201).json({ item: doc })
    } catch (err) {
        next(err)
    }
}

export async function deleteRepairDocument(req, res, next) {
    try {
        const { repairId, docId } = req.params
        const repair = await Repair.findById(repairId)
        if (!repair) return res.status(404).json({ message: 'Reparación no encontrada' })

        const doc = repair.documents.id(docId)
        if (!doc) return res.status(404).json({ message: 'Documento no encontrado' })

        const storage = getStorage()
        if (doc.publicId) {
            await storage.delete({ publicId: doc.publicId, resourceType: 'raw' })
        }

        doc.deleteOne()
        repair.updatedBy = req.user?.uid
        await repair.save()

        return res.json({ ok: true })
    } catch (err) {
        next(err)
    }
}
