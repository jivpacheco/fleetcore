// import * as svc from '../services/vehicles.service.js';
// import Vehicle from '../models/Vehicle.js';
// import { validateFile, uploadVehicleFile, deleteByPublicId } from '../utils/cloudinary.js';


// export async function list(req, res, next) {
//   try { res.json(await svc.listVehicles(req.query)); }
//   catch (e) { next(e); }
// }
// export async function create(req, res, next) {
//   try { res.status(201).json(await svc.createVehicle(req.body)); }
//   catch (e) { next(e); }
// }
// export async function getOne(req, res, next) {
//   try { res.json(await svc.getVehicle(req.params.id)); }
//   catch (e) { e.message === 'not_found' ? res.status(404).json({ msg: 'No encontrado' }) : next(e); }
// }
// export async function update(req, res, next) {
//   try { res.json(await svc.updateVehicle(req.params.id, req.body)); }
//   catch (e) { e.message === 'not_found' ? res.status(404).json({ msg: 'No encontrado' }) : next(e); }
// }
// export async function remove(req, res, next) {
//   try { res.json(await svc.removeVehicle(req.params.id, true, req.user?.uid)); }
//   catch (e) { e.message === 'not_found' ? res.status(404).json({ msg: 'No encontrado' }) : next(e); }
// }
// export async function transfer(req, res, next) {
//   try { res.json(await svc.transferVehicle(req.params.id, req.body)); }
//   catch (e) { e.message === 'not_found' ? res.status(404).json({ msg: 'No encontrado' }) : next(e); }
// }

// export async function addVehiclePhoto(req, res) {
//   try {
//     const { id } = req.params
//     const file = req.file
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' })

//     // Validación por tipo/tamaño
//     validateFile({ mimetype: file.mimetype, size: file.size })

//     const up = await uploadVehicleFile({
//       tmpPath: file.path,
//       mimetype: file.mimetype,
//       vehicleId: id,
//       category: 'photos',
//     })

//     // Se asume Vehicle.photos[] existe como subdoc
//     const doc = await Vehicle.findByIdAndUpdate(
//       id,
//       {
//         $push: { photos: {
//           url: up.url, publicId: up.publicId, bytes: up.bytes, format: up.format, uploadedAt: new Date()
//         }},
//         $set: { updatedBy: req.user?.uid },
//       },
//       { new: true }
//     )
//     if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })
//     res.json({ item: doc })
//   } catch (err) {
//     res.status(400).json({ message: err.message || 'Error al subir foto' })
//   }
// }

// export async function deleteVehiclePhoto(req, res) {
//   try {
//     const { id, photoId } = req.params
//     const doc = await Vehicle.findById(id)
//     if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })

//     const photo = doc.photos.id(photoId)
//     if (!photo) return res.status(404).json({ message: 'Foto no encontrada' })

//     await deleteByPublicId(photo.publicId)
//     photo.deleteOne()
//     doc.updatedBy = req.user?.uid
//     await doc.save()

//     res.json({ item: doc })
//   } catch (err) {
//     res.status(400).json({ message: err.message || 'Error al eliminar foto' })
//   }
// }

// export async function addVehicleDocument(req, res) {
//   try {
//     const { id } = req.params
//     const { category = 'legal', label = '' } = req.body
//     const file = req.file
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' })

//     validateFile({ mimetype: file.mimetype, size: file.size })

//     const up = await uploadVehicleFile({
//       tmpPath: file.path,
//       mimetype: file.mimetype,
//       vehicleId: id,
//       category, // legal | manuals | parts | videos
//     })

//     // Puedes usar documents[] o media[]; aquí documents[]
//     const doc = await Vehicle.findByIdAndUpdate(
//       id,
//       {
//         $push: { documents: {
//           url: up.url, publicId: up.publicId, category, label, bytes: up.bytes, format: up.format, uploadedAt: new Date()
//         }},
//         $set: { updatedBy: req.user?.uid },
//       },
//       { new: true }
//     )
//     if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })

//     res.json({ item: doc })
//   } catch (err) {
//     res.status(400).json({ message: err.message || 'Error al subir documento' })
//   }
// }

// export async function deleteVehicleDocument(req, res) {
//   try {
//     const { id, documentId } = req.params
//     const doc = await Vehicle.findById(id)
//     if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })

//     const item = doc.documents.id(documentId)
//     if (!item) return res.status(404).json({ message: 'Documento no encontrado' })

//     await deleteByPublicId(item.publicId)
//     item.deleteOne()
//     doc.updatedBy = req.user?.uid
//     await doc.save()

//     res.json({ item: doc })
//   } catch (err) {
//     res.status(400).json({ message: err.message || 'Error al eliminar documento' })
//   }
// }

// back/src/controllers/vehicles.controller.js
// -----------------------------------------------------------------------------
// Controlador de Vehículos
// - CRUD delega en services/vehicles.service.js (tu capa svc.*).
// - Media (fotos/documentos/videos) usa Cloudinary utils y escribe subdocs
//   en Vehicle.photos[] y Vehicle.documents[] (y updatedBy).
// - Compatible con tu esquema actual (PhotoSchema/DocumentSchema usan createdAt).
// -----------------------------------------------------------------------------

import * as svc from '../services/vehicles.service.js'
import Vehicle from '../models/Vehicle.js'
import { validateFile, uploadVehicleFile, deleteByPublicId } from '../utils/cloudinary.js'

// ---------------------------
// CRUD (delegado a svc.*)
// ---------------------------
export async function list(req, res, next) {
  try { res.json(await svc.listVehicles(req.query)) }
  catch (e) { next(e) }
}

export async function create(req, res, next) {
  try { res.status(201).json(await svc.createVehicle(req.body)) }
  catch (e) { next(e) }
}

export async function getOne(req, res, next) {
  try { res.json(await svc.getVehicle(req.params.id)) }
  catch (e) {
    e.message === 'not_found'
      ? res.status(404).json({ msg: 'No encontrado' })
      : next(e)
  }
}

export async function update(req, res, next) {
  try { res.json(await svc.updateVehicle(req.params.id, req.body)) }
  catch (e) {
    e.message === 'not_found'
      ? res.status(404).json({ msg: 'No encontrado' })
      : next(e)
  }
}

export async function remove(req, res, next) {
  try { res.json(await svc.removeVehicle(req.params.id, true, req.user?.uid)) }
  catch (e) {
    e.message === 'not_found'
      ? res.status(404).json({ msg: 'No encontrado' })
      : next(e)
  }
}

export async function transfer(req, res, next) {
  try { res.json(await svc.transferVehicle(req.params.id, req.body)) }
  catch (e) {
    e.message === 'not_found'
      ? res.status(404).json({ msg: 'No encontrado' })
      : next(e)
  }
}

// ---------------------------
// MEDIA: Fotos / Documentos
// ---------------------------

/**
 * POST /api/v1/vehicles/:id/photos
 * Subir imagen (jpg/png/webp) a Cloudinary y registrar en Vehicle.photos[]
 */
export async function addVehiclePhoto(req, res) {
  try {
    const { id } = req.params
    const file = req.file
    if (!file) return res.status(400).json({ message: 'Archivo requerido' })

    // Valida por tipo/tamaño (usa .env MAX_UPLOAD_MB_IMAGE)
    validateFile({ mimetype: file.mimetype, size: file.size })

    const up = await uploadVehicleFile({
      tmpPath: file.path,
      mimetype: file.mimetype,
      vehicleId: id,
      category: 'photos',
    })

    // Importante: tu esquema usa createdAt (no uploadedAt)
    const doc = await Vehicle.findByIdAndUpdate(
      id,
      {
        $push: {
          photos: {
            url: up.url,
            publicId: up.publicId,
            bytes: up.bytes,
            format: up.format,
            createdAt: new Date(),
          },
        },
        $set: { updatedBy: req.user?.uid },
      },
      { new: true }
    )

    if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })
    res.json({ item: doc })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error al subir foto' })
  }
}

/**
 * DELETE /api/v1/vehicles/:id/photos/:photoId
 * Eliminar foto por _id del subdocumento
 */
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

/**
 * POST /api/v1/vehicles/:id/documents
 * Subir documento (PDF/imagen) o video (mp4/webm/mov) y registrar en documents[].
 * body: { category='legal'|'manuals'|'parts'|'videos', label? }
 */
export async function addVehicleDocument(req, res) {
  try {
    const { id } = req.params
    let { category = 'legal', label = '' } = req.body
    const file = req.file
    if (!file) return res.status(400).json({ message: 'Archivo requerido' })

    // Valida por tipo/tamaño (usa .env MAX_UPLOAD_MB_DOC / MAX_UPLOAD_MB_VIDEO)
    validateFile({ mimetype: file.mimetype, size: file.size })

    // Si es video y no enviaron category, guardamos como 'videos' por defecto
    const isVideo = file.mimetype?.startsWith('video/')
    if (isVideo && (!category || category === 'legal')) {
      category = 'videos'
    }

    // Normalizaciones suaves
    category = String(category || 'legal').toLowerCase()
    label = typeof label === 'string' ? label.trim() : ''

    const up = await uploadVehicleFile({
      tmpPath: file.path,
      mimetype: file.mimetype,
      vehicleId: id,
      category, // 'legal' | 'manuals' | 'parts' | 'videos'
    })

    const doc = await Vehicle.findByIdAndUpdate(
      id,
      {
        $push: {
          documents: {
            url: up.url,
            publicId: up.publicId,
            category,
            label,
            bytes: up.bytes,
            format: up.format,
            createdAt: new Date(), // <-- tu esquema usa createdAt
          },
        },
        $set: { updatedBy: req.user?.uid },
      },
      { new: true }
    )

    if (!doc) return res.status(404).json({ message: 'Vehículo no encontrado' })
    res.json({ item: doc })
  } catch (err) {
    res.status(400).json({ message: err.message || 'Error al subir documento' })
  }
}

/**
 * DELETE /api/v1/vehicles/:id/documents/:documentId
 * Eliminar documento por _id del subdocumento
 */
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
