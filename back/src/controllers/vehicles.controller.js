// // back/src/controllers/vehicles.controller.js
// // CRUD + transfer + media (fotos/documentos/videos con category/title)

// import * as svc from '../services/vehicles.service.js'
// import Vehicle from '../models/Vehicle.js'
// import { validateFile, uploadVehicleFile, deleteByPublicId } from '../utils/cloudinary.js'

// // export async function list(req, res, next) {
// //   try { res.json(await svc.listVehicles(req.query)) }
// //   catch (e) { next(e) }
// // }


// export async function list(req, res) {
//   const { page = 1, limit = 10, q = '' } = req.query;
//   const p = Math.max(parseInt(page, 10) || 1, 1);
//   const l = Math.max(parseInt(limit, 10) || 10, 1);

//   const filter = q
//     ? {
//         $or: [
//           { plate: new RegExp(q, 'i') },
//           { internalCode: new RegExp(q, 'i') },
//           { brand: new RegExp(q, 'i') },
//           { model: new RegExp(q, 'i') },
//         ],
//       }
//     : {};

//   const [items, total] = await Promise.all([
//     Vehicle.find(filter)
//       .populate('branch', 'code name')     // 👈 aquí
//       .sort('-createdAt')
//       .skip((p - 1) * l)
//       .limit(l)
//       .lean(),
//     Vehicle.countDocuments(filter),
//   ]);

//   res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
// }



// export async function create(req, res, next) {
//   try { res.status(201).json(await svc.createVehicle(req.body)) }
//   catch (e) {
//     if (e?.code === 11000) return res.status(409).json({ message: 'Registro duplicado en plate/internalCode' })
//     next(e)
//   }
// }

// export async function getOne(req, res, next) {
//   try { res.json(await svc.getVehicle(req.params.id)) }
//   catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'No encontrado' }) : next(e) }
// }

// export async function update(req, res, next) {
//   try { res.json(await svc.updateVehicle(req.params.id, req.body)) }
//   catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'No encontrado' }) : next(e) }
// }

// export async function remove(req, res, next) {
//   try { res.json(await svc.removeVehicle(req.params.id, true, req.user?.uid)) }
//   catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'No encontrado' }) : next(e) }
// }

// export async function transfer(req, res, next) {
//   try { res.json(await svc.transferVehicle(req.params.id, req.body)) }
//   catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'No encontrado' }) : next(e) }
// }

// // -------- Media --------

// export async function addVehiclePhoto(req, res) {
//   try {
//     const { id } = req.params
//     const file = req.file
//     const { category = 'BASIC', title = '' } = req.body
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' })

//     validateFile({ mimetype: file.mimetype, size: file.size })

//     const up = await uploadVehicleFile({
//       tmpPath: file.path,
//       mimetype: file.mimetype,
//       vehicleId: id,
//       category: String(category || 'BASIC').toLowerCase(), // carpeta
//     })

//     const doc = await Vehicle.findByIdAndUpdate(
//       id,
//       {
//         $push: { photos: {
//           category: String(category).toUpperCase(),
//           title: String(title || '').toUpperCase(),
//           url: up.url, publicId: up.publicId, bytes: up.bytes, format: up.format, createdAt: new Date()
//         }},
//         $set: { updatedBy: req.user?.uid }
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
//     const { category = 'LEGAL', label = '' } = req.body
//     const file = req.file
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' })

//     validateFile({ mimetype: file.mimetype, size: file.size })

//     const up = await uploadVehicleFile({
//       tmpPath: file.path,
//       mimetype: file.mimetype,
//       vehicleId: id,
//       category: String(category || 'LEGAL').toLowerCase(),
//     })

//     const doc = await Vehicle.findByIdAndUpdate(
//       id,
//       {
//         $push: { documents: {
//           category: String(category).toUpperCase(),
//           label: String(label || '').toUpperCase(),
//           url: up.url, publicId: up.publicId, bytes: up.bytes, format: up.format, createdAt: new Date()
//         }},
//         $set: { updatedBy: req.user?.uid }
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
// - list(): lista con populate('branch') para mostrar sucursal en front.
// - create/update/get/remove/transfer: CRUD y traspasos (no tocados si ya
//   tenías lógica propia, puedes mantener la tuya).
// - addVehiclePhoto / addVehicleDocument: endpoints para subir medios
//   (deben ser llamados por routes/vehicles.routes.js con multer).
// -----------------------------------------------------------------------------

import Vehicle from '../models/Vehicle.js';
import cloud from '../utils/cloudinary.js';

// Helper para extraer y normalizar string → MAYÚSCULA
const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// ====================== LISTADO ======================
export async function list(req, res) {
  const { page = 1, limit = 10, q = '' } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const filter = q
    ? {
        $or: [
          { plate: new RegExp(q, 'i') },
          { internalCode: new RegExp(q, 'i') },
          { brand: new RegExp(q, 'i') },
          { model: new RegExp(q, 'i') },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    Vehicle.find(filter)
      .populate('branch', 'code name')   // 👈 necesario para mostrar sucursal
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Vehicle.countDocuments(filter),
  ]);

  res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
}

// ====================== CRUD BÁSICO ======================
export async function create(req, res) {
  const payload = req.body || {};
  // aseguremos status por defecto
  if (!payload.status) payload.status = 'ACTIVE';
  const v = await Vehicle.create(payload);
  res.status(201).json(v);
}

export async function getOne(req, res) {
  const v = await Vehicle.findById(req.params.id).lean();
  if (!v) return res.status(404).json({ message: 'No encontrado' });
  res.json(v);
}

export async function update(req, res) {
  const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!v) return res.status(404).json({ message: 'No encontrado' });
  res.json(v);
}

export async function remove(req, res) {
  const v = await Vehicle.findByIdAndDelete(req.params.id).lean();
  if (!v) return res.status(404).json({ message: 'No encontrado' });
  res.json({ ok: true });
}

// ====================== TRANSFER ======================
export async function transfer(req, res) {
  const { id } = req.params;
  const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {};

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  const fromBranch = v.branch;
  let newInternal = v.internalCode;

  // Si es APOYO con reemplazo, aplicar sufijo R
  if (reason?.toUpperCase() === 'APOYO' && replaceVehicleId) {
    newInternal = `${v.internalCode}R`;
  }

  v.branch = toBranch || v.branch;
  v.internalCode = newInternal;
  v.assignments.push({
    branch: toBranch || v.branch,
    codeInternal: v.internalCode,
    reason: U(reason),
    fromBranch,
    toBranch,
    note: U(note),
    startAt: new Date(),
  });

  await v.save();
  res.json(v.toObject());
}

// ====================== MEDIA: FOTOS ======================
export async function addVehiclePhoto(req, res) {
  const { id } = req.params;
  const file = req.file;
  const { category = 'BASIC', title = '' } = req.body || {};
  if (!file) return res.status(400).json({ message: 'Archivo requerido' });

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  // Subida a Cloudinary
  const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
  const up = await cloud.uploader.upload(file.path, {
    folder: `${folder}/vehicles/${id}/photos`,
    resource_type: 'auto',
  });

  v.photos.push({
    category: U(category),
    title: U(title),
    url: up.secure_url,
    publicId: up.public_id,
    bytes: up.bytes,
    format: up.format,
  });

  await v.save();
  res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1] });
}

export async function deleteVehiclePhoto(req, res) {
  const { id, photoId } = req.params;
  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  const ph = v.photos.id(photoId);
  if (!ph) return res.status(404).json({ message: 'Foto no encontrada' });

  // borrar en cloudinary (si hay publicId)
  if (ph.publicId) {
    try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'image' }); } catch (_) {}
  }
  ph.remove();
  await v.save();
  res.json({ ok: true });
}

// ====================== MEDIA: DOCUMENTOS ======================
export async function addVehicleDocument(req, res) {
  const { id } = req.params;
  const file = req.file;
  const { category = 'LEGAL', label = '' } = req.body || {};
  if (!file) return res.status(400).json({ message: 'Archivo requerido' });

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
  const up = await cloud.uploader.upload(file.path, {
    folder: `${folder}/vehicles/${id}/documents`,
    resource_type: 'auto',
  });

  v.documents.push({
    category: U(category),
    label: U(label),
    url: up.secure_url,
    publicId: up.public_id,
    bytes: up.bytes,
    format: up.format,
  });

  await v.save();
  res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
}

export async function deleteVehicleDocument(req, res) {
  const { id, documentId } = req.params;
  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  const d = v.documents.id(documentId);
  if (!d) return res.status(404).json({ message: 'Documento no encontrado' });

  if (d.publicId) {
    try { await cloud.uploader.destroy(d.publicId, { resource_type: 'raw' }); } catch (_) {}
  }
  d.remove();
  await v.save();
  res.json({ ok: true });
}
