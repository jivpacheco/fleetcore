// back/src/controllers/branchMedia.controller.js
// -----------------------------------------------------------------------------
// Media para Sucursales:
// - Foto de fachada (photo)
// - Documentos (documents[])
// Nota: utiliza el storage existente (services/storage) con multer.memoryStorage
// -----------------------------------------------------------------------------

import multer from 'multer'
import path from 'path'
import Branch from '../models/Branch.js'
import { getStorage } from '../services/storage/index.js'

export const uploadMemory = multer({ storage: multer.memoryStorage() })

function extFromFile(file) {
    const fromName = path.extname(file.originalname || '').replace('.', '').toLowerCase()
    const fromMime = (file.mimetype || '').split('/').pop() || ''
    return fromName || fromMime || ''
}

export async function uploadBranchPhoto(req, res, next) {
    try {
        const { branchId } = req.params
        const branch = await Branch.findById(branchId)
        if (!branch) return res.status(404).json({ message: 'Sucursal no encontrada' })
        if (!req.file) return res.status(400).json({ message: 'Archivo requerido' })

        const storage = getStorage()
        const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/branches/${branchId}/photo`
        const uploaded = await storage.uploadImage({ buffer: req.file.buffer, folder })

        // borrar anterior
        if (branch.photo?.publicId) {
            await storage.delete({ publicId: branch.photo.publicId, resourceType: 'image' })
        }

        branch.photo = {
            url: uploaded.url,
            format: uploaded.format || extFromFile(req.file),
            contentType: req.file.mimetype || '',
            bytes: uploaded.bytes || req.file.size || 0,
            uploadedAt: new Date(),
            publicId: uploaded.publicId,
            provider: uploaded.provider || storage.name,
        }
        branch.updatedBy = req.user?.uid
        await branch.save()

        return res.status(201).json({ item: branch.photo })
    } catch (err) {
        next(err)
    }
}

export async function uploadBranchDocument(req, res, next) {
    try {
        const { branchId } = req.params
        const branch = await Branch.findById(branchId)
        if (!branch) return res.status(404).json({ message: 'Sucursal no encontrada' })
        if (!req.file) return res.status(400).json({ message: 'Archivo requerido' })

        const storage = getStorage()
        const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/branches/${branchId}/documents`
        const uploaded = await storage.uploadFile({ buffer: req.file.buffer, folder })

        const doc = {
            label: req.body?.label?.trim() || req.file.originalname,
            url: uploaded.url,
            format: uploaded.format || extFromFile(req.file),
            contentType: req.file.mimetype || '',
            bytes: uploaded.bytes || req.file.size || 0,
            uploadedAt: new Date(),
            publicId: uploaded.publicId,
            provider: uploaded.provider || storage.name,
        }

        branch.documents.push(doc)
        branch.updatedBy = req.user?.uid
        await branch.save()

        return res.status(201).json({ item: doc })
    } catch (err) {
        next(err)
    }
}

export async function deleteBranchDocument(req, res, next) {
    try {
        const { branchId, docId } = req.params
        const branch = await Branch.findById(branchId)
        if (!branch) return res.status(404).json({ message: 'Sucursal no encontrada' })

        const doc = branch.documents.id(docId)
        if (!doc) return res.status(404).json({ message: 'Documento no encontrado' })

        const storage = getStorage()
        await storage.delete({ publicId: doc.publicId, resourceType: 'raw' })

        doc.deleteOne()
        branch.updatedBy = req.user?.uid
        await branch.save()

        return res.json({ ok: true })
    } catch (err) {
        next(err)
    }
}
