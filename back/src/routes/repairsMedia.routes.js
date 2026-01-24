// back/src/routes/repairsMedia.routes.js
import express from 'express'
import {
    uploadMemory,
    uploadRepairPhoto,
    uploadRepairDocument,
    deleteRepairDocument,
} from '../controllers/repairsMedia.controller.js'

const router = express.Router({ mergeParams: true })

// Foto
router.post('/photo', uploadMemory.single('file'), uploadRepairPhoto)

// Documentos
router.post('/documents', uploadMemory.single('file'), uploadRepairDocument)
router.delete('/documents/:docId', deleteRepairDocument)

export default router
