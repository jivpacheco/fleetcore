
// // // back/src/controllers/vehicles.controller.js
// // // -----------------------------------------------------------------------------
// // // Controlador de Vehículos
// // //
// // // Qué cubre:
// // // - list(): listado con populate('branch') para que el front muestre la sucursal.
// // // - create/getOne/update/remove: CRUD básico (mantiene tu lógica de negocio).
// // // - transfer(): registra asignación y aplica la regla de APOYO → sufijo "R".
// // // - addVehiclePhoto / addVehicleDocument: subida de medios a Cloudinary
// // //   (funciona tanto si tu middleware YA sube a Cloudinary como si usa disco).
// // // - deleteVehiclePhoto / deleteVehicleDocument: elimina de BD y Cloudinary.
// // //
// // // Notas importantes:
// // //
// // // 1) Permisos (RBAC):
// // //    Los validas en las rutas con requirePermission(). No es necesario
// // //    repetir chequeos en el controlador.
// // //
// // // 2) Cloudinary:
// // //    - Si tu `upload.middleware.js` ya sube a Cloudinary y deja en req.file.*
// // //      la URL y el publicId, aquí simplemente se persiste en Mongo.
// // //    - Si tu middleware guarda en disco (file.path local), aquí subimos a
// // //      Cloudinary dinámicamente (sin depender de ../utils/cloudinary.js)
// // //      para evitar errores de import/export.
// // //
// // //    Requisitos .env:
// // //      CLOUDINARY_CLOUD_NAME=xxxx
// // //      CLOUDINARY_API_KEY=xxxx
// // //      CLOUDINARY_API_SECRET=xxxx
// // //      CLOUDINARY_FOLDER=fleetcore   (opcional, default 'fleetcore')
// // //
// // // 3) Normalización a MAYÚSCULAS: helper U() para strings.
// // // -----------------------------------------------------------------------------

// // import Vehicle from '../models/Vehicle.js';

// // // Helper → string a MAYÚSCULAS
// // const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// // // =====================================================
// // // Helper: resolver subida a Cloudinary si hace falta
// // // =====================================================
// // // Este helper hace dos cosas:
// // //  A) Si req.file YA trae una URL http(s) y un publicId (porque el middleware
// // //     subió a Cloudinary), simplemente la reutiliza.
// // //  B) Si req.file es un archivo local (diskStorage), realiza la subida aquí.
// // //
// // // Devuelve un objeto homogéneo:
// // // { secure_url, public_id, bytes, format }
// // async function ensureCloudinaryUpload(file, { folder, resource_type = 'auto' }) {
// //   // Caso A: el middleware ya subió a Cloudinary (por ejemplo usando upload_stream)
// //   // y dejó `file.path` con una URL https y `file.filename` como publicId.
// //   const looksLikeUrl = typeof file?.path === 'string' && /^https?:\/\//i.test(file.path);
// //   const hasPublicId = typeof file?.filename === 'string' && file.filename.length > 0;

// //   if (looksLikeUrl && hasPublicId) {
// //     return {
// //       secure_url: file.path,
// //       public_id: file.filename,
// //       bytes: file.size ?? undefined,
// //       format: file.format ?? (file.mimetype?.split('/')[1] || undefined),
// //     };
// //   }

// //   // Caso B: el middleware dejó un archivo temporal en disco → subir aquí.
// //   // Cargamos cloudinary v2 dinámicamente para no depender de utils/cloudinary.js
// //   const { v2: cloudinary } = await import('cloudinary');

// //   // Validación de credenciales para un error claro (evita "Must supply api_key")
// //   const missing = [];
// //   if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
// //   if (!process.env.CLOUDINARY_API_KEY)    missing.push('CLOUDINARY_API_KEY');
// //   if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
// //   if (missing.length) {
// //     const msg = `Cloudinary no configurado: falta ${missing.join(', ')} en .env`;
// //     throw new Error(msg);
// //   }

// //   cloudinary.config({
// //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //     api_key:    process.env.CLOUDINARY_API_KEY,
// //     api_secret: process.env.CLOUDINARY_API_SECRET,
// //     secure: true,
// //   });

// //   if (!file?.path) {
// //     throw new Error('Archivo no disponible para subir (file.path vacío)');
// //   }

// //   const up = await cloudinary.uploader.upload(file.path, {
// //     folder,
// //     resource_type,
// //   });

// //   return {
// //     secure_url: up.secure_url,
// //     public_id: up.public_id,
// //     bytes: up.bytes,
// //     format: up.format,
// //   };
// // }

// // // =====================================================
// // // LISTADO
// // // =====================================================
// // export async function list(req, res) {
// //   try {
// //     const { page = 1, limit = 10, q = '' } = req.query;
// //     const p = Math.max(parseInt(page, 10) || 1, 1);
// //     const l = Math.max(parseInt(limit, 10) || 10, 1);

// //     const filter = q
// //       ? {
// //           $or: [
// //             { plate: new RegExp(q, 'i') },
// //             { internalCode: new RegExp(q, 'i') },
// //             { brand: new RegExp(q, 'i') },
// //             { model: new RegExp(q, 'i') },
// //           ],
// //         }
// //       : {};

// //     const [items, total] = await Promise.all([
// //       Vehicle.find(filter)
// //         .populate('branch', 'code name') // 👈 indispensable para ver sucursal en front
// //         .sort('-createdAt')
// //         .skip((p - 1) * l)
// //         .limit(l)
// //         .lean(),
// //       Vehicle.countDocuments(filter),
// //     ]);

// //     res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
// //   } catch (err) {
// //     console.error('[vehicles.list] ❌', err);
// //     res.status(500).json({ message: 'Error listando vehículos', error: err.message });
// //   }
// // }

// // // =====================================================
// // // CRUD BÁSICO
// // // =====================================================
// // export async function create(req, res) {
// //   try {
// //     const payload = req.body || {};
// //     if (!payload.status) payload.status = 'ACTIVE';
// //     // Si tienes más reglas de negocio, agrégalas aquí antes de crear.
// //     const v = await Vehicle.create(payload);
// //     res.status(201).json(v);
// //   } catch (err) {
// //     console.error('[vehicles.create] ❌', err);
// //     const code = err?.name === 'ValidationError' ? 400 : 500;
// //     res.status(code).json({ message: 'Datos inválidos', error: err.message });
// //   }
// // }

// // export async function getOne(req, res) {
// //   try {
// //     const v = await Vehicle.findById(req.params.id).lean();
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });
// //     res.json(v);
// //   } catch (err) {
// //     console.error('[vehicles.getOne] ❌', err);
// //     res.status(500).json({ message: 'Error obteniendo vehículo', error: err.message });
// //   }
// // }

// // export async function update(req, res) {
// //   try {
// //     const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });
// //     res.json(v);
// //   } catch (err) {
// //     console.error('[vehicles.update] ❌', err);
// //     const code = err?.name === 'ValidationError' ? 400 : 500;
// //     res.status(code).json({ message: 'Datos inválidos', error: err.message });
// //   }
// // }

// // export async function remove(req, res) {
// //   try {
// //     const v = await Vehicle.findByIdAndDelete(req.params.id).lean();
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('[vehicles.remove] ❌', err);
// //     res.status(500).json({ message: 'Error eliminando vehículo', error: err.message });
// //   }
// // }

// // // =====================================================
// // // TRANSFER / APOYO
// // // =====================================================
// // export async function transfer(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {};

// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const fromBranch = v.branch;
// //     let newInternal = v.internalCode;

// //     // Regla de APOYO: si viene replaceVehicleId, sufijo 'R'
// //     if (U(reason) === 'APOYO' && replaceVehicleId) {
// //       newInternal = `${v.internalCode}R`;
// //     }

// //     v.branch = toBranch || v.branch;
// //     v.internalCode = newInternal;
// //     v.assignments.push({
// //       branch: toBranch || v.branch,
// //       codeInternal: v.internalCode,
// //       reason: U(reason),
// //       fromBranch,
// //       toBranch,
// //       note: U(note),
// //       startAt: new Date(),
// //     });

// //     await v.save();
// //     res.json(v.toObject());
// //   } catch (err) {
// //     console.error('[vehicles.transfer] ❌', err);
// //     res.status(500).json({ message: 'Error en transferencia', error: err.message });
// //   }
// // }

// // // =====================================================
// // // MEDIA: FOTOS
// // // =====================================================
// // // POST /api/v1/vehicles/:id/photos  (uploadSingle en la ruta)
// // export async function addVehiclePhoto(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const file = req.file;
// //     const { category = 'BASIC', title = '' } = req.body || {};
// //     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const folderRoot = process.env.CLOUDINARY_FOLDER || 'fleetcore';
// //     // Sube a Cloudinary si hace falta (o usa lo que ya dejó el middleware)
// //     const up = await ensureCloudinaryUpload(file, {
// //       folder: `${folderRoot}/vehicles/${id}/photos`,
// //       resource_type: 'auto',
// //     });

// //     v.photos.push({
// //       category: U(category),
// //       title: U(title) || (file.originalname ? U(file.originalname) : ''),
// //       url: up.secure_url,
// //       publicId: up.public_id,
// //       bytes: up.bytes,
// //       format: up.format,
// //       createdAt: new Date(),
// //     });

// //     await v.save();
// //     res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1] });
// //   } catch (err) {
// //     console.error('[vehicles.addVehiclePhoto] ❌', err);
// //     const msg = /Cloudinary no configurado/.test(err.message)
// //       ? err.message
// //       : 'Error subiendo foto';
// //     res.status(500).json({ message: msg, error: err.message });
// //   }
// // }

// // // DELETE /api/v1/vehicles/:id/photos/:photoId
// // export async function deleteVehiclePhoto(req, res) {
// //   try {
// //     const { id, photoId } = req.params;
// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const ph = v.photos.id(photoId);
// //     if (!ph) return res.status(404).json({ message: 'Foto no encontrada' });

// //     // Intentar eliminar en Cloudinary si hay publicId
// //     if (ph.publicId) {
// //       try {
// //         const { v2: cloudinary } = await import('cloudinary');
// //         cloudinary.config({
// //           cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //           api_key:    process.env.CLOUDINARY_API_KEY,
// //           api_secret: process.env.CLOUDINARY_API_SECRET,
// //           secure: true,
// //         });
// //         await cloudinary.uploader.destroy(ph.publicId, { resource_type: 'image' });
// //       } catch (_) {
// //         // No interrumpir si falla la eliminación remota
// //       }
// //     }

// //     ph.remove();
// //     await v.save();
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('[vehicles.deleteVehiclePhoto] ❌', err);
// //     res.status(500).json({ message: 'Error eliminando foto', error: err.message });
// //   }
// // }

// // // =====================================================
// // // MEDIA: DOCUMENTOS
// // // =====================================================
// // // POST /api/v1/vehicles/:id/documents  (uploadSingle en la ruta)
// // export async function addVehicleDocument(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const file = req.file;
// //     const { category = 'LEGAL', label = '' } = req.body || {};
// //     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const folderRoot = process.env.CLOUDINARY_FOLDER || 'fleetcore';
// //     const up = await ensureCloudinaryUpload(file, {
// //       folder: `${folderRoot}/vehicles/${id}/documents`,
// //       resource_type: 'auto',
// //     });

// //     v.documents.push({
// //       category: U(category),
// //       label: U(label) || (file.originalname ? U(file.originalname) : ''),
// //       url: up.secure_url,
// //       publicId: up.public_id,
// //       bytes: up.bytes,
// //       format: up.format,
// //       createdAt: new Date(),
// //     });

// //     await v.save();
// //     res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
// //   } catch (err) {
// //     console.error('[vehicles.addVehicleDocument] ❌', err);
// //     const msg = /Cloudinary no configurado/.test(err.message)
// //       ? err.message
// //       : 'Error subiendo documento';
// //     res.status(500).json({ message: msg, error: err.message });
// //   }
// // }

// // // DELETE /api/v1/vehicles/:id/documents/:documentId
// // export async function deleteVehicleDocument(req, res) {
// //   try {
// //     const { id, documentId } = req.params;
// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const d = v.documents.id(documentId);
// //     if (!d) return res.status(404).json({ message: 'Documento no encontrado' });

// //     if (d.publicId) {
// //       try {
// //         const { v2: cloudinary } = await import('cloudinary');
// //         cloudinary.config({
// //           cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //           api_key:    process.env.CLOUDINARY_API_KEY,
// //           api_secret: process.env.CLOUDINARY_API_SECRET,
// //           secure: true,
// //         });
// //         // resource_type raw para PDFs/otros
// //         await cloudinary.uploader.destroy(d.publicId, { resource_type: 'raw' });
// //       } catch (_) {}
// //     }

// //     d.remove();
// //     await v.save();
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('[vehicles.deleteVehicleDocument] ❌', err);
// //     res.status(500).json({ message: 'Error eliminando documento', error: err.message });
// //   }
// // }

// back/src/controllers/vehicles.controller.js
// -----------------------------------------------------------------------------
// Controlador de Vehículos
// - list(): populate('branch') para mostrar sucursal
// - CRUD básico
// - transfer(): APOYO agrega sufijo 'R'
// - addVehiclePhoto / addVehicleDocument: naming uniforme y contador por categoría
// -----------------------------------------------------------------------------
import Vehicle from '../models/Vehicle.js';
import cloud from '../utils/cloudinary.js'; // default export (cloud.uploader)

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// ====================== LISTADO ======================
export async function list(req, res) {
  const { page = 1, limit = 10, q = '' } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const filter = q ? {
    $or: [
      { plate: new RegExp(q, 'i') },
      { internalCode: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { model: new RegExp(q, 'i') },
    ]
  } : {};

  const [items, total] = await Promise.all([
    Vehicle.find(filter)
      .populate('branch', 'code name')
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

// ====================== HELPERS DE MEDIA ======================
function nextSeq(existingArr, category) {
  const list = (existingArr || []).filter(it => it.category === U(category));
  return (list.length + 1).toString().padStart(5, '0'); // 00001
}
function isVideoMimetype(mt = '') {
  return /^video\//i.test(mt);
}

// ====================== MEDIA: FOTOS ======================
export async function addVehiclePhoto(req, res) {
  try {
    const { id } = req.params;
    const file = req.file;
    const { category = 'BASIC', title = '', label = '' } = req.body || {};
    if (!file) return res.status(400).json({ message: 'Archivo requerido' });

    const v = await Vehicle.findById(id);
    if (!v) return res.status(404).json({ message: 'No encontrado' });

    // Subida a Cloudinary (deja resource_type=auto para imagen/video)
    const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
    const up = await cloud.uploader.upload(file.path, {
      folder: `${folder}/vehicles/${id}/photos`,
      resource_type: 'auto',
    });

    const cat = U(category) || 'BASIC';
    const baseLabel = (label || title || file.originalname || '').toString().trim();
    const seq = nextSeq(v.photos, cat);
    const isVideo = isVideoMimetype(file.mimetype) || up.resource_type === 'video';

    // Nombre uniforme mostrado: CATEGORÍA — ETIQUETA — 00001
    const uniformTitle = `${cat} — ${U(baseLabel || 'SIN TÍTULO')} — ${seq}`;

    v.photos.push({
      category: cat,
      title: uniformTitle,
      url: up.secure_url,
      publicId: up.public_id,
      bytes: up.bytes,
      format: up.format,
      createdAt: new Date(),
    });

    await v.save();
    res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1], isVideo });
  } catch (err) {
    console.error('[addVehiclePhoto] ❌', err);
    res.status(500).json({ message: 'Error subiendo foto', error: err.message });
  }
}

export async function deleteVehiclePhoto(req, res) {
  try {
    const { id, photoId } = req.params;
    const v = await Vehicle.findById(id);
    if (!v) return res.status(404).json({ message: 'No encontrado' });

    const ph = v.photos.id(photoId);
    if (!ph) return res.status(404).json({ message: 'Foto no encontrada' });

    if (ph.publicId) {
      try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' }); } catch (_) {}
    }
    ph.remove();
    await v.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteVehiclePhoto] ❌', err);
    res.status(500).json({ message: 'Error eliminando foto', error: err.message });
  }
}

// ====================== MEDIA: DOCUMENTOS ======================
export async function addVehicleDocument(req, res) {
  try {
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

    const cat = U(category) || 'LEGAL';
    const lbl = U(label || file.originalname || 'SIN ETIQUETA');

    // Docs (PDF/imagen) → nombre mostrado: CATEGORÍA — ETIQUETA
    const uniformLabel = `${cat} — ${lbl}`;

    v.documents.push({
      category: cat,
      label: uniformLabel,
      url: up.secure_url,
      publicId: up.public_id,
      bytes: up.bytes,
      format: up.format,
      createdAt: new Date(),
    });

    await v.save();
    res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
  } catch (err) {
    console.error('[addVehicleDocument] ❌', err);
    res.status(500).json({ message: 'Error subiendo documento', error: err.message });
  }
}

export async function deleteVehicleDocument(req, res) {
  try {
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
  } catch (err) {
    console.error('[deleteVehicleDocument] ❌', err);
    res.status(500).json({ message: 'Error eliminando documento', error: err.message });
  }
}

// // back/src/controllers/vehicles.controller.js
// // -----------------------------------------------------------------------------
// // Controlador de Vehículos
// // - list(): populate('branch') para mostrar sucursal
// // - CRUD básico
// // - transfer(): APOYO agrega sufijo 'R'
// // - Media: nombres visibles uniformes y resourceType guardado para borrar bien
// // -----------------------------------------------------------------------------
// import Vehicle from '../models/Vehicle.js';
// import cloud from '../utils/cloudinary.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// // ====================== LISTADO ======================
// export async function list(req, res) {
//   const { page = 1, limit = 10, q = '' } = req.query;
//   const p = Math.max(parseInt(page, 10) || 1, 1);
//   const l = Math.max(parseInt(limit, 10) || 10, 1);

//   const filter = q ? {
//     $or: [
//       { plate: new RegExp(q, 'i') },
//       { internalCode: new RegExp(q, 'i') },
//       { brand: new RegExp(q, 'i') },
//       { model: new RegExp(q, 'i') },
//     ]
//   } : {};

//   const [items, total] = await Promise.all([
//     Vehicle.find(filter)
//       .populate('branch', 'code name')
//       .sort('-createdAt')
//       .skip((p - 1) * l)
//       .limit(l)
//       .lean(),
//     Vehicle.countDocuments(filter),
//   ]);

//   res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
// }

// // ====================== CRUD BÁSICO ======================
// export async function create(req, res) {
//   const payload = req.body || {};
//   if (!payload.status) payload.status = 'ACTIVE';
//   const v = await Vehicle.create(payload);
//   res.status(201).json(v);
// }

// export async function getOne(req, res) {
//   const v = await Vehicle.findById(req.params.id).lean();
//   if (!v) return res.status(404).json({ message: 'No encontrado' });
//   res.json(v);
// }

// export async function update(req, res) {
//   const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
//   if (!v) return res.status(404).json({ message: 'No encontrado' });
//   res.json(v);
// }

// export async function remove(req, res) {
//   const v = await Vehicle.findByIdAndDelete(req.params.id).lean();
//   if (!v) return res.status(404).json({ message: 'No encontrado' });
//   res.json({ ok: true });
// }

// // ====================== TRANSFER ======================
// export async function transfer(req, res) {
//   const { id } = req.params;
//   const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {};

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   const fromBranch = v.branch;
//   let newInternal = v.internalCode;

//   if (reason?.toUpperCase() === 'APOYO' && replaceVehicleId) {
//     newInternal = `${v.internalCode}R`;
//   }

//   v.branch = toBranch || v.branch;
//   v.internalCode = newInternal;
//   v.assignments.push({
//     branch: toBranch || v.branch,
//     codeInternal: v.internalCode,
//     reason: U(reason),
//     fromBranch,
//     toBranch,
//     note: U(note),
//     startAt: new Date(),
//   });

//   await v.save();
//   res.json(v.toObject());
// }

// // ====================== HELPERS MEDIA ======================
// function nextSeq(existingArr, category) {
//   const list = (existingArr || []).filter(it => it.category === U(category));
//   return (list.length + 1).toString().padStart(5, '0'); // 00001
// }
// function isVideoMime(mt = '') { return /^video\//i.test(mt); }
// function buildDisplayName(category, label, seq, format) {
//   // "Motor Placa 00001.jpg" | "Motor 00001.jpg"
//   const cat = (category || '').trim();
//   const lbl = (label || '').trim();
//   const base = lbl ? `${cat} ${lbl} ${seq}` : `${cat} ${seq}`;
//   return format ? `${base}.${format.toLowerCase()}` : base;
// }

// // ====================== MEDIA: FOTOS/VIDEOS ======================
// export async function addVehiclePhoto(req, res) {
//   try {
//     const { id } = req.params;
//     const file = req.file;
//     const { category = 'BASIC', title = '', label = '' } = req.body || {};
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
//     const up = await cloud.uploader.upload(file.path, {
//       folder: `${folder}/vehicles/${id}/photos`,
//       resource_type: 'auto',
//     });

//     const cat = U(category) || 'BASIC';
//     const baseLabel = (label || title).toString().trim();
//     const seq = nextSeq(v.photos, cat);
//     const fmt = (up.format || file.mimetype?.split('/')[1] || '').toLowerCase();
//     const displayName = buildDisplayName(
//       // nombre visible SIEMPRE en español, con categoría + etiqueta + consecutivo + extensión
//       // ej: "Motor Placa 00001.jpg"
//       cat[0] + cat.slice(1).toLowerCase(), // "ENGINE" -> "Engine" (si prefieres todo mayúscula, cámbialo)
//       baseLabel,
//       seq,
//       fmt
//     );

//     v.photos.push({
//       category: cat,
//       title: `${cat} ${baseLabel ? baseLabel.toUpperCase() + ' ' : ''}${seq}`, // título visible
//       displayName,                              // 👈 nombre formateado como pediste
//       url: up.secure_url,
//       publicId: up.public_id,
//       resourceType: up.resource_type,           // 👈 image|video|raw
//       bytes: up.bytes,
//       format: fmt,
//       createdAt: new Date(),
//     });

//     await v.save();
//     res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1] });
//   } catch (err) {
//     console.error('[addVehiclePhoto] ❌', err);
//     res.status(500).json({ message: 'Error subiendo foto', error: err.message });
//   }
// }

// // ====================== MEDIA: DOCUMENTOS ======================
// export async function addVehicleDocument(req, res) {
//   try {
//     const { id } = req.params;
//     const file = req.file;
//     const { category = 'LEGAL', label = '' } = req.body || {};
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
//     const up = await cloud.uploader.upload(file.path, {
//       folder: `${folder}/vehicles/${id}/documents`,
//       resource_type: 'auto',
//     });

//     const cat = U(category) || 'LEGAL';
//     const lbl = (label || '').toString().trim();
//     const seq = nextSeq(v.documents, cat);
//     const fmt = (up.format || file.mimetype?.split('/')[1] || '').toLowerCase();
//     const displayName = buildDisplayName(
//       cat[0] + cat.slice(1).toLowerCase(),  // "MANUALS" -> "Manuals"
//       lbl,
//       seq,
//       fmt
//     );

//     v.documents.push({
//       category: cat,
//       label: `${cat} ${lbl ? lbl.toUpperCase() + ' ' : ''}${seq}`, // etiqueta visible
//       displayName,                              // 👈 "Manuales Manual de usuario 00001.pdf"
//       url: up.secure_url,
//       publicId: up.public_id,
//       resourceType: up.resource_type,           // 👈 image|video|raw
//       bytes: up.bytes,
//       format: fmt,
//       createdAt: new Date(),
//     });

//     await v.save();
//     res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
//   } catch (err) {
//     console.error('[addVehicleDocument] ❌', err);
//     res.status(500).json({ message: 'Error subiendo documento', error: err.message });
//   }
// }

// // ====================== ELIMINAR MEDIOS ======================
// export async function deleteVehiclePhoto(req, res) {
//   try {
//     const { id, photoId } = req.params;
//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const ph = v.photos.id(photoId);
//     if (!ph) return res.status(404).json({ message: 'Foto no encontrada' });

//     if (ph.publicId) {
//       try {
//         await cloud.uploader.destroy(ph.publicId, { resource_type: ph.resourceType || 'auto' });
//       } catch (_) {}
//     }
//     ph.remove();
//     await v.save();
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('[deleteVehiclePhoto] ❌', err);
//     res.status(500).json({ message: 'Error eliminando foto', error: err.message });
//   }
// }

// export async function deleteVehicleDocument(req, res) {
//   try {
//     const { id, documentId } = req.params;
//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const d = v.documents.id(documentId);
//     if (!d) return res.status(404).json({ message: 'Documento no encontrado' });

//     if (d.publicId) {
//       try {
//         await cloud.uploader.destroy(d.publicId, { resource_type: d.resourceType || 'raw' });
//       } catch (_) {}
//     }
//     d.remove();
//     await v.save();
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('[deleteVehicleDocument] ❌', err);
//     res.status(500).json({ message: 'Error eliminando documento', error: err.message });
//   }
// }
