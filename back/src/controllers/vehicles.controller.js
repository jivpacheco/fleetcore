// ///****** ESTABLE */
// // back/src/controllers/vehicles.controller.js
// // -----------------------------------------------------------------------------
// // Controlador de Vehículos
// // - list(): populate('branch') para mostrar sucursal
// // - CRUD básico
// // - transfer(): APOYO agrega sufijo 'R'
// // - addVehiclePhoto / addVehicleDocument: naming uniforme y contador por categoría
// // -----------------------------------------------------------------------------
// import Vehicle from '../models/Vehicle.js';
// import cloud from '../utils/cloudinary.js'; // default export (cloud.uploader)

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

// // ====================== HELPERS DE MEDIA ======================
// function nextSeq(existingArr, category) {
//   const list = (existingArr || []).filter(it => it.category === U(category));
//   return (list.length + 1).toString().padStart(5, '0'); // 00001
// }
// function isVideoMimetype(mt = '') {
//   return /^video\//i.test(mt);
// }

// // ====================== MEDIA: FOTOS ======================
// export async function addVehiclePhoto(req, res) {
//   try {
//     const { id } = req.params;
//     const file = req.file;
//     const { category = 'BASIC', title = '', label = '' } = req.body || {};
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     // Subida a Cloudinary (deja resource_type=auto para imagen/video)
//     const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
//     const up = await cloud.uploader.upload(file.path, {
//       folder: `${folder}/vehicles/${id}/photos`,
//       resource_type: 'auto',
//     });

//     const cat = U(category) || 'BASIC';
//     const baseLabel = (label || title || file.originalname || '').toString().trim();
//     const seq = nextSeq(v.photos, cat);
//     const isVideo = isVideoMimetype(file.mimetype) || up.resource_type === 'video';

//     // Nombre uniforme mostrado: CATEGORÍA — ETIQUETA — 00001
//     const uniformTitle = `${cat} — ${U(baseLabel || 'SIN TÍTULO')} — ${seq}`;

//     v.photos.push({
//       category: cat,
//       title: uniformTitle,
//       url: up.secure_url,
//       publicId: up.public_id,
//       bytes: up.bytes,
//       format: up.format,
//       createdAt: new Date(),
//     });

//     await v.save();
//     res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1], isVideo });
//   } catch (err) {
//     console.error('[addVehiclePhoto] ❌', err);
//     res.status(500).json({ message: 'Error subiendo foto', error: err.message });
//   }
// }

// export async function deleteVehiclePhoto(req, res) {
//   try {
//     const { id, photoId } = req.params;
//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const ph = v.photos.id(photoId);
//     if (!ph) return res.status(404).json({ message: 'Foto no encontrada' });

//     if (ph.publicId) {
//       try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' }); } catch (_) {}
//     }
//     ph.remove();
//     await v.save();
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('[deleteVehiclePhoto] ❌', err);
//     res.status(500).json({ message: 'Error eliminando foto', error: err.message });
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
//     const lbl = U(label || file.originalname || 'SIN ETIQUETA');

//     // Docs (PDF/imagen) → nombre mostrado: CATEGORÍA — ETIQUETA
//     const uniformLabel = `${cat} — ${lbl}`;

//     v.documents.push({
//       category: cat,
//       label: uniformLabel,
//       url: up.secure_url,
//       publicId: up.public_id,
//       bytes: up.bytes,
//       format: up.format,
//       createdAt: new Date(),
//     });

//     await v.save();
//     res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
//   } catch (err) {
//     console.error('[addVehicleDocument] ❌', err);
//     res.status(500).json({ message: 'Error subiendo documento', error: err.message });
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
//       try { await cloud.uploader.destroy(d.publicId, { resource_type: 'raw' }); } catch (_) {}
//     }
//     d.remove();
//     await v.save();
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('[deleteVehicleDocument] ❌', err);
//     res.status(500).json({ message: 'Error eliminando documento', error: err.message });
//   }
// }
// ///***** FIN DE ESTABLE /////// */

// // back/src/controllers/vehicles.controller.js
// // -----------------------------------------------------------------------------
// // Controlador de Vehículos
// // - list(): populate('branch') para mostrar sucursal
// // - CRUD básico
// // - transfer(): APOYO agrega sufijo 'R' y registra en assignments (auditoría)
// // - Media (fotos/documentos):
// //     * Subida a Cloudinary con nombre público uniforme (categoría + etiqueta + secuencia)
// //     * Secuencia por categoría (00001, 00002, ...)
// //     * Eliminación robusta con resource_type: 'auto'
// // -----------------------------------------------------------------------------

// import Vehicle from '../models/Vehicle.js';
// import cloud from '../utils/cloudinary.js'; // export default (cloud.uploader)

// // Helper → MAYÚSCULA
// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// // Mapa de categorías internas → cómo mostrar en español
// const CAT_DISPLAY = {
//   BASIC: 'Básico',
//   ENGINE: 'Motor',
//   TRANSMISSION: 'Transmisión',
//   GENERATOR: 'Generador',
//   PUMP: 'Motobomba',
//   BODY: 'Cuerpo de bomba',
//   LEGAL: 'Legal',
//   MANUALS: 'Manuales',
//   PARTS: 'Partes',
// };

// // Sanitiza para public_id de Cloudinary (sin tildes, sin raros, espacios→guiones)
// function sanitizePublicId(str = '') {
//   return (str || '')
//     .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
//     .replace(/[^a-zA-Z0-9\-_. ]/g, '')               // deja alfanum, - _ . espacios
//     .trim()
//     .replace(/\s+/g, '-');                            // espacios → guiones
// }

// // Siguiente secuencia por categoría (00001, 00002, …)
// function nextSeq(existingArr, category) {
//   const list = (existingArr || []).filter(it => it.category === U(category));
//   return (list.length + 1).toString().padStart(5, '0'); // 00001
// }

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

//   // Default de PADRÓN issuer si viene vacío (editable)
//   if (!payload?.legal?.padron?.issuer) {
//     payload.legal = payload.legal || {};
//     payload.legal.padron = payload.legal.padron || {};
//     payload.legal.padron.issuer = 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACIÓN';
//   }

//   const v = await Vehicle.create(payload);
//   res.status(201).json(v);
// }

// export async function getOne(req, res) {
//   const v = await Vehicle.findById(req.params.id).lean();
//   if (!v) return res.status(404).json({ message: 'No encontrado' });
//   res.json(v);
// }

// export async function update(req, res) {
//   const payload = req.body || {};

//   // Si issuer de Padrón viene vacío, dejamos el default (editable)
//   if (!payload?.legal?.padron?.issuer) {
//     payload.legal = payload.legal || {};
//     payload.legal.padron = payload.legal.padron || {};
//     payload.legal.padron.issuer = 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACIÓN';
//   }

//   const v = await Vehicle.findByIdAndUpdate(req.params.id, payload, { new: true }).lean();
//   if (!v) return res.status(404).json({ message: 'No encontrado' });
//   res.json(v);
// }

// export async function remove(req, res) {
//   const v = await Vehicle.findByIdAndDelete(req.params.id).lean();
//   if (!v) return res.status(404).json({ message: 'No encontrado' });
//   res.json({ ok: true });
// }

// // ====================== TRANSFER / APOYO ======================
// export async function transfer(req, res) {
//   const { id } = req.params;
//   const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {};

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   const fromBranch = v.branch;
//   let newInternal = v.internalCode;

//   // Si es APOYO con reemplazo, aplicar sufijo R
//   if (reason?.toUpperCase() === 'APOYO' && replaceVehicleId) {
//     newInternal = `${v.internalCode}R`;
//   }

//   v.branch = toBranch || v.branch;
//   v.internalCode = newInternal;

//   // Auditoría (historial de asignaciones)
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

// // ====================== MEDIA: FOTOS ======================
// export async function addVehiclePhoto(req, res) {
//   try {
//     const { id } = req.params;
//     const file = req.file;
//     const { category = 'BASIC', label = '', title = '' } = req.body || {};
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
//     const cat = U(category) || 'BASIC';
//     const catDisplay = CAT_DISPLAY[cat] || cat; // nombre en español para mostrar
//     const baseLabel = (label || title || '').toString().trim(); // etiqueta opcional
//     const seq = nextSeq(v.photos, cat);                          // 00001

//     // public_id deseado: "Motor-Placa-00001" (sin extensión; Cloudinary la asigna)
//     const publicIdBase = sanitizePublicId(`${catDisplay} ${baseLabel || ''} ${seq}`);
//     const up = await cloud.uploader.upload(file.path, {
//       folder: `${folder}/vehicles/${id}/photos`,
//       public_id: publicIdBase,
//       use_filename: false,
//       unique_filename: false,
//       overwrite: false,
//       resource_type: 'auto',
//     });

//     // Título mostrado tal cual lo quieres ver en UI
//     const displayTitle = `${catDisplay}${baseLabel ? ' ' + U(baseLabel) : ''} ${seq}`;

//     v.photos.push({
//       category: cat,
//       title: displayTitle,     // p.ej. "Motor PLACA 00001"
//       url: up.secure_url,
//       publicId: up.public_id,  // incluye la ruta relativa dentro del folder
//       bytes: up.bytes,
//       format: up.format,
//       createdAt: new Date(),
//     });

//     await v.save();
//     res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1] });
//   } catch (err) {
//     console.error('[addVehiclePhoto] ❌', err);
//     res.status(500).json({ message: 'Error subiendo foto', error: err.message });
//   }
// }

// export async function deleteVehiclePhoto(req, res) {
//   try {
//     const { id, photoId } = req.params;
//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const ph = v.photos.id(photoId);
//     if (!ph) return res.status(404).json({ message: 'Foto no encontrada' });

//     if (ph.publicId) {
//       try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' }); } catch (_) {}
//     }
//     ph.remove();
//     await v.save();
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('[deleteVehiclePhoto] ❌', err);
//     res.status(500).json({ message: 'Error eliminando foto', error: err.message });
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
//     const cat = U(category) || 'LEGAL';
//     const catDisplay = CAT_DISPLAY[cat] || cat; // español
//     const lbl = (label || '').toString().trim();
//     const seq = nextSeq(v.documents, cat);      // 00001

//     // public_id deseado: "Manuales-Manual-de-usuario-00001"
//     const publicIdBase = sanitizePublicId(`${catDisplay} ${lbl || ''} ${seq}`);
//     const up = await cloud.uploader.upload(file.path, {
//       folder: `${folder}/vehicles/${id}/documents`,
//       public_id: publicIdBase,
//       use_filename: false,
//       unique_filename: false,
//       overwrite: false,
//       resource_type: 'auto', // pdf → raw; Cloudinary lo resuelve con auto
//     });

//     // Etiqueta mostrada (lista de documentos)
//     const displayLabel = `${catDisplay}${lbl ? ' ' + U(lbl) : ''} ${seq}`;

//     v.documents.push({
//       category: cat,
//       label: displayLabel,     // p.ej. "Manuales MANUAL DE USUARIO 00001"
//       url: up.secure_url,
//       publicId: up.public_id,
//       bytes: up.bytes,
//       format: up.format,
//       createdAt: new Date(),
//     });

//     await v.save();
//     res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
//   } catch (err) {
//     console.error('[addVehicleDocument] ❌', err);
//     res.status(500).json({ message: 'Error subiendo documento', error: err.message });
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
//       try { await cloud.uploader.destroy(d.publicId, { resource_type: 'auto' }); } catch (_) {}
//     }
//     d.remove();
//     await v.save();
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('[deleteVehicleDocument] ❌', err);
//     res.status(500).json({ message: 'Error eliminando documento', error: err.message });
//   }
// }

////******************** */
// back/src/controllers/vehicles.controller.js
// -----------------------------------------------------------------------------
// Controlador de Vehículos
// - list(): populate('branch') para mostrar sucursal
// - CRUD básico
// - transfer(): APOYO agrega sufijo 'R'
// - addVehiclePhoto / addVehicleDocument: naming uniforme y contador por categoría
//   + Soporte doble: multer local (sube aquí) o multer-storage-cloudinary (ya subido)
// -----------------------------------------------------------------------------
import Vehicle from '../models/Vehicle.js';
import cloud from '../utils/cloudinary.js'; // debe export default con .uploader

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
  try {
    // No transformar Date → {}: aquí recibimos Date o undefined desde el front
    const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!v) return res.status(404).json({ message: 'No encontrado' });
    res.json(v.toObject());
  } catch (err) {
    console.error(`[vehicles.update] 400`, err);
    const pathMsg = /Cast to date failed.*path "(.*?)"/i.exec(err?.message || '');
    const field = pathMsg?.[1];
    return res.status(400).json({ message: field ? `Formato inválido para el campo ${field}` : 'Datos inválidos' });
  }
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

  // APOYO con reemplazo → sufijo R
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
function isHttpUrl(p = '') {
  return /^https?:\/\//i.test(p);
}
function isVideoFormat(fmt = '', mt = '') {
  const f = (fmt || '').toLowerCase();
  const m = (mt || '').toLowerCase();
  return f === 'mp4' || f === 'mov' || f === 'webm' || m.startsWith('video/');
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

    const cat = U(category) || 'BASIC';
    const baseLabel = (label || title || '').toString().trim();
    const seq = nextSeq(v.photos, cat);

    let url, publicId, bytes, format, resourceType;

    // Caso 1: multer-storage-cloudinary (req.file ya es Cloudinary)
    if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
      url = file.path;
      publicId = file.filename || file.public_id;
      bytes = file.size;
      format = file.format || (file.mimetype ? file.mimetype.split('/')[1] : '');
      resourceType = file.resource_type || (isVideoFormat(format, file.mimetype) ? 'video' : 'image');
    } else {
      // Caso 2: multer local → subimos aquí
      const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
      const up = await cloud.uploader.upload(file.path, {
        folder: `${folder}/vehicles/${id}/photos`,
        resource_type: 'auto',
      });
      url = up.secure_url;
      publicId = up.public_id;
      bytes = up.bytes;
      format = up.format;
      resourceType = up.resource_type;
    }

    // Nombre uniforme mostrado
    const uniformTitle = `${cat} — ${U(baseLabel || 'SIN TÍTULO')} — ${seq}`;

    v.photos.push({
      category: cat,
      title: uniformTitle,
      url,
      publicId,
      bytes,
      format,
      createdAt: new Date(),
    });

    await v.save();
    res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1], isVideo: resourceType === 'video' });
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

    const idx = v.photos.findIndex(p => String(p._id) === String(photoId));
    if (idx === -1) return res.status(404).json({ message: 'Foto no encontrada' });

    const ph = v.photos[idx];
    if (ph.publicId) {
      try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' }); } catch (_) {}
    }
    v.photos.splice(idx, 1);
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

    const cat = U(category) || 'LEGAL';
    const lbl = U(label || 'SIN ETIQUETA');

    let url, publicId, bytes, format, resourceType;

    // Si ya viene de Cloudinary (storage)
    if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
      url = file.path;
      publicId = file.filename || file.public_id;
      bytes = file.size;
      format = file.format || (file.mimetype ? file.mimetype.split('/')[1] : '');
      resourceType = file.resource_type || (isVideoFormat(format, file.mimetype) ? 'video' : (format === 'pdf' || file.mimetype === 'application/pdf' ? 'raw' : 'image'));
    } else {
      // Subida local → Cloudinary
      const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
      const up = await cloud.uploader.upload(file.path, {
        folder: `${folder}/vehicles/${id}/documents`,
        resource_type: 'auto', // auto detecta raw/pdf
      });
      url = up.secure_url;
      publicId = up.public_id;
      bytes = up.bytes;
      format = up.format;
      resourceType = up.resource_type;
    }

    // Nombre mostrado uniforme (lista)
    const uniformLabel = `${cat} — ${lbl}`;

    v.documents.push({
      category: cat,
      label: uniformLabel,
      url,
      publicId,
      bytes,
      format,
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

    const idx = v.documents.findIndex(d => String(d._id) === String(documentId));
    if (idx === -1) return res.status(404).json({ message: 'Documento no encontrado' });

    const d = v.documents[idx];
    if (d.publicId) {
      try { await cloud.uploader.destroy(d.publicId, { resource_type: 'auto' }); } catch (_) {}
    }
    v.documents.splice(idx, 1);
    await v.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteVehicleDocument] ❌', err);
    res.status(500).json({ message: 'Error eliminando documento', error: err.message });
  }
}
