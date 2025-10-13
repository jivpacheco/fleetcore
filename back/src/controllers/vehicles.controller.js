// back/src/controllers/vehicles.controller.js
// CRUD + transfer + media (fotos/documentos/videos con category/title)

import * as svc from '../services/vehicles.service.js'
import Vehicle from '../models/Vehicle.js'
import { validateFile, uploadVehicleFile, deleteByPublicId } from '../utils/cloudinary.js'

export async function list(req, res, next) {
  try { res.json(await svc.listVehicles(req.query)) }
  catch (e) { next(e) }
}

export async function create(req, res, next) {
  try { res.status(201).json(await svc.createVehicle(req.body)) }
  catch (e) {
    if (e?.code === 11000) return res.status(409).json({ message: 'Registro duplicado en plate/internalCode' })
    next(e)
  }
}

export async function getOne(req, res, next) {
  try { res.json(await svc.getVehicle(req.params.id)) }
  catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'No encontrado' }) : next(e) }
}

export async function update(req, res, next) {
  try { res.json(await svc.updateVehicle(req.params.id, req.body)) }
  catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'No encontrado' }) : next(e) }
}

export async function remove(req, res, next) {
  try { res.json(await svc.removeVehicle(req.params.id, true, req.user?.uid)) }
  catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'No encontrado' }) : next(e) }
}

export async function transfer(req, res, next) {
  try { res.json(await svc.transferVehicle(req.params.id, req.body)) }
  catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'No encontrado' }) : next(e) }
}

// -------- Media --------

export async function addVehiclePhoto(req, res) {
  try {
    const { id } = req.params
    const file = req.file
    const { category = 'BASIC', title = '' } = req.body
    if (!file) return res.status(400).json({ message: 'Archivo requerido' })

    validateFile({ mimetype: file.mimetype, size: file.size })

    const up = await uploadVehicleFile({
      tmpPath: file.path,
      mimetype: file.mimetype,
      vehicleId: id,
      category: String(category || 'BASIC').toLowerCase(), // carpeta
    })

    const doc = await Vehicle.findByIdAndUpdate(
      id,
      {
        $push: { photos: {
          category: String(category).toUpperCase(),
          title: String(title || '').toUpperCase(),
          url: up.url, publicId: up.publicId, bytes: up.bytes, format: up.format, createdAt: new Date()
        }},
        $set: { updatedBy: req.user?.uid }
      },
      { new: true }
    )
    if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })
    res.json({ item: doc })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error al subir foto' })
  }
}

export async function deleteVehiclePhoto(req, res) {
  try {
    const { id, photoId } = req.params
    const doc = await Vehicle.findById(id)
    if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })

    const photo = doc.photos.id(photoId)
    if (!photo) return res.status(404).json({ message: 'Foto no encontrada' })

    await deleteByPublicId(photo.publicId)
    photo.deleteOne()
    doc.updatedBy = req.user?.uid
    await doc.save()

    res.json({ item: doc })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error al eliminar foto' })
  }
}

export async function addVehicleDocument(req, res) {
  try {
    const { id } = req.params
    const { category = 'LEGAL', label = '' } = req.body
    const file = req.file
    if (!file) return res.status(400).json({ message: 'Archivo requerido' })

    validateFile({ mimetype: file.mimetype, size: file.size })

    const up = await uploadVehicleFile({
      tmpPath: file.path,
      mimetype: file.mimetype,
      vehicleId: id,
      category: String(category || 'LEGAL').toLowerCase(),
    })

    const doc = await Vehicle.findByIdAndUpdate(
      id,
      {
        $push: { documents: {
          category: String(category).toUpperCase(),
          label: String(label || '').toUpperCase(),
          url: up.url, publicId: up.publicId, bytes: up.bytes, format: up.format, createdAt: new Date()
        }},
        $set: { updatedBy: req.user?.uid }
      },
      { new: true }
    )
    if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })

    res.json({ item: doc })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error al subir documento' })
  }
}

export async function deleteVehicleDocument(req, res) {
  try {
    const { id, documentId } = req.params
    const doc = await Vehicle.findById(id)
    if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })

    const item = doc.documents.id(documentId)
    if (!item) return res.status(404).json({ message: 'Documento no encontrado' })

    await deleteByPublicId(item.publicId)
    item.deleteOne()
    doc.updatedBy = req.user?.uid
    await doc.save()

    res.json({ item: doc })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error al eliminar documento' })
  }
}
