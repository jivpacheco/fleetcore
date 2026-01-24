// back/src/controllers/failureReportsMedia.controller.js
// -----------------------------------------------------------------------------
// Media para Catálogo de Reporte de Fallas (Cliente/Sucursal):
// - Foto (photo)
// - Documentos (documents[])
// Nota: utiliza el storage existente (services/storage) vía getStorage()
// -----------------------------------------------------------------------------

import multer from 'multer'
import path from 'path'
import FailureReport from '../models/FailureReport.js'
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
export async function uploadFailureReportPhoto(req, res, next) {
    try {
        const { failureReportId } = req.params
        const fr = await FailureReport.findById(failureReportId)
        if (!fr) return res.status(404).json({ message: 'Reporte de falla no encontrado' })
        if (!req.file) return res.status(400).json({ message: 'Archivo requerido' })

        const storage = getStorage()
        const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/catalogs/failure-reports/${failureReportId}/photo`

        const uploaded = await storage.uploadImage({ buffer: req.file.buffer, folder })

        // borrar anterior
        if (fr.photo?.publicId) {
            await storage.delete({ publicId: fr.photo.publicId, resourceType: 'image' })
        }

        fr.photo = toMediaFile({ uploaded: { ...uploaded, provider: uploaded.provider || storage.name }, file: req.file })
        fr.updatedBy = req.user?.uid
        await fr.save()

        return res.status(201).json({ item: fr.photo })
    } catch (err) {
        next(err)
    }
}

// ====================== DOCUMENTS ======================
export async function uploadFailureReportDocument(req, res, next) {
    try {
        const { failureReportId } = req.params
        const fr = await FailureReport.findById(failureReportId)
        if (!fr) return res.status(404).json({ message: 'Reporte de falla no encontrado' })
        if (!req.file) return res.status(400).json({ message: 'Archivo requerido' })

        const storage = getStorage()
        const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/catalogs/failure-reports/${failureReportId}/documents`

        const uploaded = await storage.uploadFile({ buffer: req.file.buffer, folder })

        const doc = toMediaFile({
            uploaded: { ...uploaded, provider: uploaded.provider || storage.name },
            file: req.file,
            label: req.body?.label || req.file.originalname,
        })

        fr.documents.push(doc)
        fr.updatedBy = req.user?.uid
        await fr.save()

        return res.status(201).json({ item: doc })
    } catch (err) {
        next(err)
    }
}

export async function deleteFailureReportDocument(req, res, next) {
    try {
        const { failureReportId, docId } = req.params
        const fr = await FailureReport.findById(failureReportId)
        if (!fr) return res.status(404).json({ message: 'Reporte de falla no encontrado' })

        const doc = fr.documents.id(docId)
        if (!doc) return res.status(404).json({ message: 'Documento no encontrado' })

        const storage = getStorage()
        if (doc.publicId) {
            await storage.delete({ publicId: doc.publicId, resourceType: 'raw' })
        }

        doc.deleteOne()
        fr.updatedBy = req.user?.uid
        await fr.save()

        return res.json({ ok: true })
    } catch (err) {
        next(err)
    }
}
