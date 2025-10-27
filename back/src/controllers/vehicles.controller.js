// // ///*************** vERSION ESTABLE 20/10/2025 */

// // // back/src/controllers/vehicles.controller.js
// // // -----------------------------------------------------------------------------
// // // Controlador de Vehículos
// // // - list(): populate('branch') para mostrar sucursal
// // // - CRUD básico
// // // - transfer(): APOYO agrega sufijo 'R'
// // // - addVehiclePhoto / addVehicleDocument: naming uniforme y contador por categoría
// // //   + Soporte doble: multer local (sube aquí) o multer-storage-cloudinary (ya subido)
// // // -----------------------------------------------------------------------------
// // import Vehicle from '../models/Vehicle.js';
// // import cloud from '../utils/cloudinary.js'; // debe export default con .uploader

// // const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// // // ====================== LISTADO ======================
// // export async function list(req, res) {
// //   const { page = 1, limit = 10, q = '' } = req.query;
// //   const p = Math.max(parseInt(page, 10) || 1, 1);
// //   const l = Math.max(parseInt(limit, 10) || 10, 1);

// //   const filter = q ? {
// //     $or: [
// //       { plate: new RegExp(q, 'i') },
// //       { internalCode: new RegExp(q, 'i') },
// //       { brand: new RegExp(q, 'i') },
// //       { model: new RegExp(q, 'i') },
// //     ]
// //   } : {};

// //   const [items, total] = await Promise.all([
// //     Vehicle.find(filter)
// //       .populate('branch', 'code name')
// //       .sort('-createdAt')
// //       .skip((p - 1) * l)
// //       .limit(l)
// //       .lean(),
// //     Vehicle.countDocuments(filter),
// //   ]);

// //   res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
// // }

// // // ====================== CRUD BÁSICO ======================
// // export async function create(req, res) {
// //   const payload = req.body || {};
// //   if (!payload.status) payload.status = 'ACTIVE';
// //   const v = await Vehicle.create(payload);
// //   res.status(201).json(v);
// // }

// // export async function getOne(req, res) {
// //   const v = await Vehicle.findById(req.params.id).lean();
// //   if (!v) return res.status(404).json({ message: 'No encontrado' });
// //   res.json(v);
// // }

// // export async function update(req, res) {
// //   try {
// //     // No transformar Date → {}: aquí recibimos Date o undefined desde el front
// //     const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });
// //     res.json(v.toObject());
// //   } catch (err) {
// //     console.error(`[vehicles.update] 400`, err);
// //     const pathMsg = /Cast to date failed.*path "(.*?)"/i.exec(err?.message || '');
// //     const field = pathMsg?.[1];
// //     return res.status(400).json({ message: field ? `Formato inválido para el campo ${field}` : 'Datos inválidos' });
// //   }
// // }

// // export async function remove(req, res) {
// //   const v = await Vehicle.findByIdAndDelete(req.params.id).lean();
// //   if (!v) return res.status(404).json({ message: 'No encontrado' });
// //   res.json({ ok: true });
// // }

// // // ====================== TRANSFER ======================
// // export async function transfer(req, res) {
// //   const { id } = req.params;
// //   const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {};

// //   const v = await Vehicle.findById(id);
// //   if (!v) return res.status(404).json({ message: 'No encontrado' });

// //   const fromBranch = v.branch;
// //   let newInternal = v.internalCode;

// //   // APOYO con reemplazo → sufijo R
// //   if (reason?.toUpperCase() === 'APOYO' && replaceVehicleId) {
// //     newInternal = `${v.internalCode}R`;
// //   }

// //   v.branch = toBranch || v.branch;
// //   v.internalCode = newInternal;
// //   v.assignments.push({
// //     branch: toBranch || v.branch,
// //     codeInternal: v.internalCode,
// //     reason: U(reason),
// //     fromBranch,
// //     toBranch,
// //     note: U(note),
// //     startAt: new Date(),
// //   });

// //   await v.save();
// //   res.json(v.toObject());
// // }

// // // ====================== HELPERS DE MEDIA ======================
// // function nextSeq(existingArr, category) {
// //   const list = (existingArr || []).filter(it => it.category === U(category));
// //   return (list.length + 1).toString().padStart(5, '0'); // 00001
// // }
// // function isHttpUrl(p = '') {
// //   return /^https?:\/\//i.test(p);
// // }
// // function isVideoFormat(fmt = '', mt = '') {
// //   const f = (fmt || '').toLowerCase();
// //   const m = (mt || '').toLowerCase();
// //   return f === 'mp4' || f === 'mov' || f === 'webm' || m.startsWith('video/');
// // }

// // // ====================== MEDIA: FOTOS ======================
// // export async function addVehiclePhoto(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const file = req.file;
// //     const { category = 'BASIC', title = '', label = '' } = req.body || {};
// //     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const cat = U(category) || 'BASIC';
// //     const baseLabel = (label || title || '').toString().trim();
// //     const seq = nextSeq(v.photos, cat);

// //     let url, publicId, bytes, format, resourceType;

// //     // Caso 1: multer-storage-cloudinary (req.file ya es Cloudinary)
// //     if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
// //       url = file.path;
// //       publicId = file.filename || file.public_id;
// //       bytes = file.size;
// //       format = file.format || (file.mimetype ? file.mimetype.split('/')[1] : '');
// //       resourceType = file.resource_type || (isVideoFormat(format, file.mimetype) ? 'video' : 'image');
// //     } else {
// //       // Caso 2: multer local → subimos aquí
// //       const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
// //       const up = await cloud.uploader.upload(file.path, {
// //         folder: `${folder}/vehicles/${id}/photos`,
// //         resource_type: 'auto',
// //       });
// //       url = up.secure_url;
// //       publicId = up.public_id;
// //       bytes = up.bytes;
// //       format = up.format;
// //       resourceType = up.resource_type;
// //     }

// //     // Nombre uniforme mostrado
// //     const uniformTitle = `${cat} — ${U(baseLabel || 'SIN TÍTULO')} — ${seq}`;

// //     v.photos.push({
// //       category: cat,
// //       title: uniformTitle,
// //       url,
// //       publicId,
// //       bytes,
// //       format,
// //       createdAt: new Date(),
// //     });

// //     await v.save();
// //     res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1], isVideo: resourceType === 'video' });
// //   } catch (err) {
// //     console.error('[addVehiclePhoto] ❌', err);
// //     res.status(500).json({ message: 'Error subiendo foto', error: err.message });
// //   }
// // }

// // export async function deleteVehiclePhoto(req, res) {
// //   try {
// //     const { id, photoId } = req.params;
// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const idx = v.photos.findIndex(p => String(p._id) === String(photoId));
// //     if (idx === -1) return res.status(404).json({ message: 'Foto no encontrada' });

// //     const ph = v.photos[idx];
// //     if (ph.publicId) {
// //       try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' }); } catch (_) {}
// //     }
// //     v.photos.splice(idx, 1);
// //     await v.save();
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('[deleteVehiclePhoto] ❌', err);
// //     res.status(500).json({ message: 'Error eliminando foto', error: err.message });
// //   }
// // }

// // // ====================== MEDIA: DOCUMENTOS ======================
// // export async function addVehicleDocument(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const file = req.file;
// //     const { category = 'LEGAL', label = '' } = req.body || {};
// //     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const cat = U(category) || 'LEGAL';
// //     const lbl = U(label || 'SIN ETIQUETA');

// //     let url, publicId, bytes, format, resourceType;

// //     // Si ya viene de Cloudinary (storage)
// //     if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
// //       url = file.path;
// //       publicId = file.filename || file.public_id;
// //       bytes = file.size;
// //       format = file.format || (file.mimetype ? file.mimetype.split('/')[1] : '');
// //       resourceType = file.resource_type || (isVideoFormat(format, file.mimetype) ? 'video' : (format === 'pdf' || file.mimetype === 'application/pdf' ? 'raw' : 'image'));
// //     } else {
// //       // Subida local → Cloudinary
// //       const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
// //       const up = await cloud.uploader.upload(file.path, {
// //         folder: `${folder}/vehicles/${id}/documents`,
// //         resource_type: 'auto', // auto detecta raw/pdf
// //       });
// //       url = up.secure_url;
// //       publicId = up.public_id;
// //       bytes = up.bytes;
// //       format = up.format;
// //       resourceType = up.resource_type;
// //     }

// //     // Nombre mostrado uniforme (lista)
// //     const uniformLabel = `${cat} — ${lbl}`;

// //     v.documents.push({
// //       category: cat,
// //       label: uniformLabel,
// //       url,
// //       publicId,
// //       bytes,
// //       format,
// //       createdAt: new Date(),
// //     });

// //     await v.save();
// //     res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
// //   } catch (err) {
// //     console.error('[addVehicleDocument] ❌', err);
// //     res.status(500).json({ message: 'Error subiendo documento', error: err.message });
// //   }
// // }

// // export async function deleteVehicleDocument(req, res) {
// //   try {
// //     const { id, documentId } = req.params;
// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const idx = v.documents.findIndex(d => String(d._id) === String(documentId));
// //     if (idx === -1) return res.status(404).json({ message: 'Documento no encontrado' });

// //     const d = v.documents[idx];
// //     if (d.publicId) {
// //       try { await cloud.uploader.destroy(d.publicId, { resource_type: 'auto' }); } catch (_) {}
// //     }
// //     v.documents.splice(idx, 1);
// //     await v.save();
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('[deleteVehicleDocument] ❌', err);
// //     res.status(500).json({ message: 'Error eliminando documento', error: err.message });
// //   }
// // }






// // ////****** penultima actualizacion */

// // // back/src/controllers/vehicles.controller.js
// // // -----------------------------------------------------------------------------
// // // Controlador de Vehículos
// // // - list(): populate('branch') para mostrar sucursal
// // // - CRUD básico (con auditoría)
// // // - transfer(): (se mantiene tu versión si la usas)
// // // - Media: add/delete Photo/Document (fix delete con deleteOne())
// // // - Support: iniciar/finalizar reemplazo (apoyo) con reglas de estado/siglas y auditoría
// // // -----------------------------------------------------------------------------
// // import Vehicle from '../models/Vehicle.js';
// // import cloud from '../utils/cloudinary.js'; // export default (cloud.uploader)

// // const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// // // ====================== LISTADO ======================
// // export async function list(req, res) {
// //   const { page = 1, limit = 10, q = '', branch } = req.query;
// //   const p = Math.max(parseInt(page, 10) || 1, 1);
// //   const l = Math.max(parseInt(limit, 10) || 10, 1);

// //   const filter = {};
// //   if (q) {
// //     Object.assign(filter, {
// //       $or: [
// //         { plate: new RegExp(q, 'i') },
// //         { internalCode: new RegExp(q, 'i') },
// //         { brand: new RegExp(q, 'i') },
// //         { model: new RegExp(q, 'i') },
// //       ],
// //     });
// //   }
// //   if (branch) filter.branch = branch;

// //   const [items, total] = await Promise.all([
// //     Vehicle.find(filter)
// //       .populate('branch', 'code name')
// //       .sort('-createdAt')
// //       .skip((p - 1) * l)
// //       .limit(l)
// //       .lean(),
// //     Vehicle.countDocuments(filter),
// //   ]);

// //   res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
// // }

// // // ====================== CRUD BÁSICO ======================
// // export async function create(req, res) {
// //   const payload = req.body || {};
// //   if (!payload.status) payload.status = 'ACTIVE';
// //   const v = await Vehicle.create(payload);
// //   v.audit?.push({ action: 'CREATE', by: req.user?.email, data: { payload } });
// //   await Vehicle.updateOne({ _id: v._id }, { $set: { audit: v.audit } }); // guardar audit
// //   res.status(201).json(v);
// // }

// // export async function getOne(req, res) {
// //   const v = await Vehicle.findById(req.params.id).lean();
// //   if (!v) return res.status(404).json({ message: 'No encontrado' });
// //   res.json(v);
// // }

// // export async function update(req, res) {
// //   const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
// //   if (!v) return res.status(404).json({ message: 'No encontrado' });
// //   v.audit?.push({ action: 'UPDATE', by: req.user?.email, data: req.body });
// //   await v.save();
// //   res.json(v.toObject());
// // }

// // export async function remove(req, res) {
// //   const v = await Vehicle.findByIdAndDelete(req.params.id).lean();
// //   if (!v) return res.status(404).json({ message: 'No encontrado' });
// //   // No podemos anexar audit luego de borrar; en proyectos reales usaríamos soft-delete.
// //   res.json({ ok: true });
// // }

// // // ====================== TRANSFER (tu lógica previa) ======================
// // export async function transfer(req, res) {
// //   const { id } = req.params;
// //   const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {};

// //   const v = await Vehicle.findById(id);
// //   if (!v) return res.status(404).json({ message: 'No encontrado' });

// //   const fromBranch = v.branch;
// //   let newInternal = v.internalCode;

// //   if (reason?.toUpperCase() === 'APOYO' && replaceVehicleId) {
// //     newInternal = `${v.internalCode}R`;
// //   }

// //   v.branch = toBranch || v.branch;
// //   v.internalCode = newInternal;
// //   v.assignments.push({
// //     branch: toBranch || v.branch,
// //     codeInternal: v.internalCode,
// //     reason: U(reason),
// //     fromBranch,
// //     toBranch,
// //     note: U(note),
// //     startAt: new Date(),
// //   });
// //   v.audit?.push({ action: 'TRANSFER', by: req.user?.email, data: { reason, toBranch, replaceVehicleId, note } });

// //   await v.save();
// //   res.json(v.toObject());
// // }

// // // ====================== HELPERS DE MEDIA ======================
// // function nextSeq(existingArr, category) {
// //   const list = (existingArr || []).filter(it => it.category === U(category));
// //   return (list.length + 1).toString().padStart(5, '0'); // 00001
// // }
// // function isVideoMimetype(mt = '') {
// //   return /^video\//i.test(mt);
// // }

// // // ====================== MEDIA: FOTOS ======================
// // export async function addVehiclePhoto(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const file = req.file;
// //     const { category = 'BASIC', title = '', label = '' } = req.body || {};
// //     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
// //     const up = await cloud.uploader.upload(file.path, {
// //       folder: `${folder}/vehicles/${id}/photos`,
// //       resource_type: 'auto',
// //     });

// //     const cat = U(category) || 'BASIC';
// //     const baseLabel = (label || title || file.originalname || '').toString().trim();
// //     const seq = nextSeq(v.photos, cat);
// //     const isVideo = isVideoMimetype(file.mimetype) || up.resource_type === 'video';

// //     const uniformTitle = baseLabel
// //       ? `${cat} — ${U(baseLabel)} — ${seq}`
// //       : `${cat} — ${seq}`;

// //     v.photos.push({
// //       category: cat,
// //       title: uniformTitle,
// //       url: up.secure_url,
// //       publicId: up.public_id,
// //       bytes: up.bytes,
// //       format: up.format,
// //       createdAt: new Date(),
// //     });

// //     v.audit?.push({ action: 'MEDIA_ADD', by: req.user?.email, data: { type: 'PHOTO', category: cat, title: uniformTitle } });

// //     await v.save();
// //     res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1], isVideo });
// //   } catch (err) {
// //     console.error('[addVehiclePhoto] ❌', err);
// //     res.status(500).json({ message: 'Error subiendo foto', error: err.message });
// //   }
// // }

// // export async function deleteVehiclePhoto(req, res) {
// //   try {
// //     const { id, photoId } = req.params;
// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const ph = v.photos.id(photoId);
// //     if (!ph) return res.status(404).json({ message: 'Foto no encontrada' });

// //     if (ph.publicId) {
// //       try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' }); } catch (_) {}
// //     }
// //     // ph.remove() puede no existir en Mongoose moderno; usamos deleteOne():
// //     await ph.deleteOne();
// //     v.audit?.push({ action: 'MEDIA_DEL', by: req.user?.email, data: { type: 'PHOTO', photoId } });
// //     await v.save();
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('[deleteVehiclePhoto] ❌', err);
// //     res.status(500).json({ message: 'Error eliminando foto', error: err.message });
// //   }
// // }

// // // ====================== MEDIA: DOCUMENTOS ======================
// // export async function addVehicleDocument(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const file = req.file;
// //     const { category = 'LEGAL', label = '' } = req.body || {};
// //     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
// //     const up = await cloud.uploader.upload(file.path, {
// //       folder: `${folder}/vehicles/${id}/documents`,
// //       resource_type: 'auto', // permite PDF (raw) y también imágenes
// //     });

// //     const cat = U(category) || 'LEGAL';
// //     const lbl = (label || file.originalname || 'SIN ETIQUETA').toString().trim();
// //     const uniformLabel = `${cat} — ${U(lbl)}`;

// //     v.documents.push({
// //       category: cat,
// //       label: uniformLabel,
// //       url: up.secure_url,
// //       publicId: up.public_id,
// //       bytes: up.bytes,
// //       format: up.format,
// //       createdAt: new Date(),
// //     });

// //     v.audit?.push({ action: 'MEDIA_ADD', by: req.user?.email, data: { type: 'DOCUMENT', category: cat, label: uniformLabel } });

// //     await v.save();
// //     res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
// //   } catch (err) {
// //     // Cloudinary 401/400 típicamente: credenciales o tipo inválido
// //     console.error('[addVehicleDocument] ❌', err);
// //     res.status(500).json({ message: 'Error subiendo documento', error: err.message });
// //   }
// // }

// // export async function deleteVehicleDocument(req, res) {
// //   try {
// //     const { id, documentId } = req.params;
// //     const v = await Vehicle.findById(id);
// //     if (!v) return res.status(404).json({ message: 'No encontrado' });

// //     const d = v.documents.id(documentId);
// //     if (!d) return res.status(404).json({ message: 'Documento no encontrado' });

// //     if (d.publicId) {
// //       try { await cloud.uploader.destroy(d.publicId, { resource_type: 'raw' }); } catch (_) {}
// //     }
// //     await d.deleteOne();
// //     v.audit?.push({ action: 'MEDIA_DEL', by: req.user?.email, data: { type: 'DOCUMENT', documentId } });
// //     await v.save();
// //     res.json({ ok: true });
// //   } catch (err) {
// //     console.error('[deleteVehicleDocument] ❌', err);
// //     res.status(500).json({ message: 'Error eliminando documento', error: err.message });
// //   }
// // }

// // // ====================== SOPORTE / APOYO ENTRE SUCURSALES ======================
// // // Regla: al iniciar reemplazo, el "vehículo objetivo" (target) pasa a OUT_OF_SERVICE si no lo está.
// // // El vehículo actual (id) toma la sigla del target + 'R'. Guardamos originalInternalCode para revertir.
// // // Guardamos auditoría y marcamos support.active=true.
// // export async function startSupport(req, res) {
// //   const { id } = req.params; // vehículo que hará el reemplazo
// //   const { targetBranchId, targetVehicleId } = req.body || {};

// //   const replacer = await Vehicle.findById(id);
// //   if (!replacer) return res.status(404).json({ message: 'Vehículo (reemplazante) no encontrado' });

// //   const target = await Vehicle.findById(targetVehicleId);
// //   if (!target) return res.status(404).json({ message: 'Vehículo objetivo no encontrado' });

// //   // Si el target no está fuera de servicio, lo marcamos
// //   if (target.status !== 'OUT_OF_SERVICE') {
// //     target.status = 'OUT_OF_SERVICE';
// //     target.audit?.push({ action: 'UPDATE', by: req.user?.email, data: { status: 'OUT_OF_SERVICE', reason: 'SUPPORT_START' } });
// //     await target.save();
// //   }

// //   // Asignar sigla al reemplazante: sigla del target + 'R'
// //   const originalInternalCode = replacer.internalCode;
// //   const replacementCode = `${target.internalCode}R`;

// //   replacer.internalCode = replacementCode;
// //   replacer.support = {
// //     active: true,
// //     targetBranch: targetBranchId || target.branch,
// //     targetVehicle: target._id,
// //     replacementCode,
// //     originalInternalCode,
// //     startedAt: new Date(),
// //     endedAt: null,
// //   };
// //   replacer.audit?.push({ action: 'SUPPORT_START', by: req.user?.email, data: { targetBranchId: targetBranchId || target.branch, targetVehicleId: target._id, replacementCode, originalInternalCode } });

// //   await replacer.save();

// //   // Optional: registrar en assignments
// //   replacer.assignments.push({
// //     branch: replacer.branch,
// //     codeInternal: replacementCode,
// //     reason: 'APOYO',
// //     fromBranch: replacer.branch,
// //     toBranch: targetBranchId || target.branch,
// //     startAt: new Date(),
// //   });
// //   await replacer.save();

// //   res.json({ ok: true, vehicle: replacer.toObject() });
// // }

// // // Finalizar reemplazo: restaurar sigla original y cerrar periodo
// // export async function finishSupport(req, res) {
// //   const { id } = req.params; // vehículo que estaba reemplazando
// //   const v = await Vehicle.findById(id);
// //   if (!v) return res.status(404).json({ message: 'Vehículo no encontrado' });

// //   if (!v.support?.active) {
// //     return res.status(400).json({ message: 'El vehículo no está en soporte activo' });
// //   }

// //   const { targetVehicle } = v.support;
// //   const original = v.support.originalInternalCode;

// //   // Restaurar sigla original al reemplazante
// //   if (original) v.internalCode = original;

// //   // Cerrar soporte
// //   v.support.endedAt = new Date();
// //   v.support.active = false;
// //   v.audit?.push({ action: 'SUPPORT_FINISH', by: req.user?.email, data: { targetVehicle, restoredInternalCode: original } });

// //   // Cerrar último assignment APOYO si existe
// //   const last = v.assignments?.slice(-1)[0];
// //   if (last && last.reason === 'APOYO' && !last.endAt) {
// //     last.endAt = new Date();
// //   }

// //   await v.save();
// //   res.json({ ok: true, vehicle: v.toObject() });
// // }











// // /// ***************** ulitma actualizacion **********
// // // back/src/controllers/vehicles.controller.js
// // // -----------------------------------------------------------------------------
// // // Controlador de Vehículos (versión estable + mejoras)
// // // - list(): populate('branch') para mostrar sucursal
// // // - CRUD básico
// // // - transfer(): APOYO agrega sufijo 'R' (legacy compatible)
// // // - startSupport / finishSupport: flujo explícito de apoyo temporal
// // // - Media: add/delete con Cloudinary (resource_type:'auto'), naming uniforme,
// // //          fixes deleteOne() para subdocs
// // // - Auditoría: si existe v.audits (Array) se registran eventos; si no, se omite
// // // -----------------------------------------------------------------------------
// // import Vehicle from '../models/Vehicle.js'
// // import cloud from '../utils/cloudinary.js' // default export (cloud.uploader)

// // const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)
// // const now = () => new Date()

// // // ====================== LISTADO ======================
// // export async function list(req, res) {
// //   const { page = 1, limit = 10, q = '' } = req.query
// //   const p = Math.max(parseInt(page, 10) || 1, 1)
// //   const l = Math.max(parseInt(limit, 10) || 10, 1)

// //   const filter = q ? {
// //     $or: [
// //       { plate: new RegExp(q, 'i') },
// //       { internalCode: new RegExp(q, 'i') },
// //       { brand: new RegExp(q, 'i') },
// //       { model: new RegExp(q, 'i') },
// //     ]
// //   } : {}

// //   const [items, total] = await Promise.all([
// //     Vehicle.find(filter)
// //       .populate('branch', 'code name')
// //       .sort('-createdAt')
// //       .skip((p - 1) * l)
// //       .limit(l)
// //       .lean(),
// //     Vehicle.countDocuments(filter),
// //   ])

// //   res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) })
// // }

// // // ====================== CRUD BÁSICO ======================
// // export async function create(req, res) {
// //   const payload = req.body || {}
// //   if (!payload.status) payload.status = 'ACTIVE'
// //   const v = await Vehicle.create(payload)
// //   res.status(201).json(v)
// // }

// // export async function getOne(req, res) {
// //   const v = await Vehicle.findById(req.params.id).lean()
// //   if (!v) return res.status(404).json({ message: 'No encontrado' })
// //   res.json(v)
// // }

// // export async function update(req, res) {
// //   const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean()
// //   if (!v) return res.status(404).json({ message: 'No encontrado' })
// //   res.json(v)
// // }

// // export async function remove(req, res) {
// //   const v = await Vehicle.findByIdAndDelete(req.params.id).lean()
// //   if (!v) return res.status(404).json({ message: 'No encontrado' })
// //   res.json({ ok: true })
// // }

// // // ====================== TRANSFER (legacy) ======================
// // // Body: { reason:'TRASPASO'|'APOYO', toBranch, replaceVehicleId?, note }
// // export async function transfer(req, res) {
// //   const { id } = req.params
// //   const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {}

// //   const v = await Vehicle.findById(id)
// //   if (!v) return res.status(404).json({ message: 'No encontrado' })

// //   const fromBranch = v.branch
// //   let newInternal = v.internalCode

// //   // APOYO: sufijo R si reemplaza a otro
// //   if (reason?.toUpperCase() === 'APOYO' && replaceVehicleId) {
// //     newInternal = `${v.internalCode}R`
// //   }

// //   v.branch = toBranch || v.branch
// //   v.internalCode = newInternal
// //   v.assignments?.push?.({
// //     branch: toBranch || v.branch,
// //     codeInternal: v.internalCode,
// //     reason: U(reason),
// //     fromBranch,
// //     toBranch,
// //     note: U(note),
// //     startAt: now(),
// //   })

// //   // Auditoría (si existe)
// //   if (Array.isArray(v.audits)) {
// //     v.audits.push({
// //       ts: now(),
// //       action: 'TRANSFER',
// //       data: { reason, toBranch, replaceVehicleId, note, fromBranch, newInternal },
// //       by: req.user?.id || null,
// //     })
// //   }

// //   await v.save()
// //   res.json(v.toObject())
// // }

// // // ====================== APOYO explícito ======================
// // // POST /vehicles/:id/support/start  { targetBranchId, targetVehicleId }
// // // - Pone el vehículo objetivo en 'OUT_OF_SERVICE' (si no lo está)
// // // - Asigna al vehículo actual la sigla del objetivo + 'R'
// // export async function startSupport(req, res) {
// //   const { id } = req.params
// //   const { targetBranchId, targetVehicleId } = req.body || {}

// //   const supporter = await Vehicle.findById(id) // vehículo que apoya
// //   if (!supporter) return res.status(404).json({ message: 'Vehículo (apoyo) no encontrado' })

// //   const target = await Vehicle.findById(targetVehicleId) // vehículo a reemplazar
// //   if (!target) return res.status(404).json({ message: 'Vehículo objetivo no encontrado' })

// //   // Si el objetivo no está fuera de servicio, ponerlo fuera de servicio
// //   const OUT = 'OUT_OF_SERVICE'
// //   if (target.status !== OUT) {
// //     target.status = OUT
// //   }

// //   // Asignar branch y sigla al que apoya: sigla objetivo + 'R'
// //   supporter.branch = targetBranchId || target.branch || supporter.branch
// //   const originalInternal = supporter.internalCode
// //   supporter.internalCode = `${target.internalCode}R`

// //   // Registrar asignación
// //   supporter.assignments?.push?.({
// //     branch: supporter.branch,
// //     codeInternal: supporter.internalCode,
// //     reason: 'APOYO',
// //     fromBranch: supporter.branch,
// //     toBranch: targetBranchId || target.branch,
// //     note: `Apoyo a ${target._id}`,
// //     startAt: now(),
// //   })

// //   // Auditoría
// //   for (const v of [supporter, target]) {
// //     if (Array.isArray(v.audits)) {
// //       v.audits.push({
// //         ts: now(),
// //         action: 'SUPPORT_START',
// //         data: {
// //           supporterId: supporter._id,
// //           targetId: target._id,
// //           originalInternal,
// //           newInternal: supporter.internalCode,
// //           targetStatus: target.status
// //         },
// //         by: req.user?.id || null,
// //       })
// //     }
// //   }

// //   await Promise.all([supporter.save(), target.save()])
// //   res.json({ ok: true, supporter: supporter.toObject(), target: target.toObject() })
// // }

// // // POST /vehicles/:id/support/finish
// // // - Revierte: quita sufijo 'R' al que apoyaba (si procede) y limpia “asignación activa”
// // export async function finishSupport(req, res) {
// //   const { id } = req.params
// //   const supporter = await Vehicle.findById(id)
// //   if (!supporter) return res.status(404).json({ message: 'Vehículo (apoyo) no encontrado' })

// //   // Quitar sufijo R si lo tenía
// //   if (typeof supporter.internalCode === 'string' && supporter.internalCode.endsWith('R')) {
// //     supporter.internalCode = supporter.internalCode.slice(0, -1)
// //   }

// //   // Cerrar última asignación de apoyo (si existe)
// //   const last = Array.isArray(supporter.assignments) && supporter.assignments.length
// //     ? supporter.assignments[supporter.assignments.length - 1]
// //     : null
// //   if (last && last.reason === 'APOYO' && !last.endAt) {
// //     last.endAt = now()
// //   }

// //   // Auditoría
// //   if (Array.isArray(supporter.audits)) {
// //     supporter.audits.push({
// //       ts: now(),
// //       action: 'SUPPORT_FINISH',
// //       data: { internalCode: supporter.internalCode },
// //       by: req.user?.id || null,
// //     })
// //   }

// //   await supporter.save()
// //   res.json({ ok: true, supporter: supporter.toObject() })
// // }

// // // ====================== HELPERS DE MEDIA ======================
// // function nextSeq(existingArr, category) {
// //   const list = (existingArr || []).filter(it => it.category === U(category))
// //   return (list.length + 1).toString().padStart(5, '0') // 00001
// // }
// // function isVideoMimetype(mt = '') {
// //   return /^video\//i.test(mt)
// // }

// // // ====================== MEDIA: FOTOS ======================
// // export async function addVehiclePhoto(req, res) {
// //   try {
// //     const { id } = req.params
// //     const file = req.file
// //     const { category = 'BASIC', title = '', label = '' } = req.body || {}
// //     if (!file) return res.status(400).json({ message: 'Archivo requerido' })

// //     const v = await Vehicle.findById(id)
// //     if (!v) return res.status(404).json({ message: 'No encontrado' })

// //     // Subida Cloudinary (imagen o video)
// //     const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore'
// //     const up = await cloud.uploader.upload(file.path, {
// //       folder: `${folder}/vehicles/${id}/photos`,
// //       resource_type: 'auto',
// //     })

// //     const cat = U(category) || 'BASIC'
// //     const baseLabel = (label || title || file.originalname || '').toString().trim()
// //     const seq = nextSeq(v.photos, cat)
// //     const isVideo = isVideoMimetype(file.mimetype) || up.resource_type === 'video'

// //     // Nombre uniforme mostrado: CATEGORÍA — ETIQUETA — 00001
// //     const uniformTitle = `${cat} — ${U(baseLabel || 'SIN TÍTULO')} — ${seq}`

// //     v.photos.push({
// //       category: cat,
// //       title: uniformTitle,
// //       url: up.secure_url,
// //       publicId: up.public_id,
// //       bytes: up.bytes,
// //       format: up.format,
// //       createdAt: now(),
// //     })

// //     // Auditoría
// //     if (Array.isArray(v.audits)) {
// //       v.audits.push({
// //         ts: now(),
// //         action: 'MEDIA_ADD_PHOTO',
// //         data: { category: cat, title: uniformTitle, publicId: up.public_id, isVideo },
// //         by: req.user?.id || null,
// //       })
// //     }

// //     await v.save()
// //     res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1], isVideo })
// //   } catch (err) {
// //     console.error('[addVehiclePhoto] ❌', err)
// //     res.status(500).json({ message: 'Error subiendo foto', error: err.message })
// //   }
// // }

// // export async function deleteVehiclePhoto(req, res) {
// //   try {
// //     const { id, photoId } = req.params
// //     const v = await Vehicle.findById(id)
// //     if (!v) return res.status(404).json({ message: 'No encontrado' })

// //     const ph = v.photos.id(photoId)
// //     if (!ph) return res.status(404).json({ message: 'Foto no encontrada' })

// //     if (ph.publicId) {
// //       try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' }) } catch (_) {}
// //     }

// //     // ✅ Mongoose v7/8: usar deleteOne() en subdocumento
// //     ph.deleteOne()

// //     // Auditoría
// //     if (Array.isArray(v.audits)) {
// //       v.audits.push({
// //         ts: now(),
// //         action: 'MEDIA_DELETE_PHOTO',
// //         data: { photoId, publicId: ph.publicId },
// //         by: req.user?.id || null,
// //       })
// //     }

// //     await v.save()
// //     res.json({ ok: true })
// //   } catch (err) {
// //     console.error('[deleteVehiclePhoto] ❌', err)
// //     res.status(500).json({ message: 'Error eliminando foto', error: err.message })
// //   }
// // }

// // // ====================== MEDIA: DOCUMENTOS ======================
// // export async function addVehicleDocument(req, res) {
// //   try {
// //     const { id } = req.params
// //     const file = req.file
// //     const { category = 'LEGAL', label = '' } = req.body || {}
// //     if (!file) return res.status(400).json({ message: 'Archivo requerido' })

// //     const v = await Vehicle.findById(id)
// //     if (!v) return res.status(404).json({ message: 'No encontrado' })

// //     const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore'
// //     const up = await cloud.uploader.upload(file.path, {
// //       folder: `${folder}/vehicles/${id}/documents`,
// //       resource_type: 'auto', // ✅ mantiene PDFs/imagenes/otros como en tu base estable
// //     })

// //     const cat = U(category) || 'LEGAL'
// //     const lbl = U(label || file.originalname || 'SIN ETIQUETA')
// //     const uniformLabel = `${cat} — ${lbl}`

// //     v.documents.push({
// //       category: cat,
// //       label: uniformLabel,
// //       url: up.secure_url,
// //       publicId: up.public_id,
// //       bytes: up.bytes,
// //       format: up.format,
// //       createdAt: now(),
// //     })

// //     // Auditoría
// //     if (Array.isArray(v.audits)) {
// //       v.audits.push({
// //         ts: now(),
// //         action: 'MEDIA_ADD_DOC',
// //         data: { category: cat, label: uniformLabel, publicId: up.public_id },
// //         by: req.user?.id || null,
// //       })
// //     }

// //     await v.save()
// //     res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] })
// //   } catch (err) {
// //     console.error('[addVehicleDocument] ❌', err)
// //     res.status(500).json({ message: 'Error subiendo documento', error: err.message })
// //   }
// // }

// // export async function deleteVehicleDocument(req, res) {
// //   try {
// //     const { id, documentId } = req.params
// //     const v = await Vehicle.findById(id)
// //     if (!v) return res.status(404).json({ message: 'No encontrado' })

// //     const d = v.documents.id(documentId)
// //     if (!d) return res.status(404).json({ message: 'Documento no encontrado' })

// //     if (d.publicId) {
// //       try { await cloud.uploader.destroy(d.publicId, { resource_type: 'auto' }) } catch (_) {}
// //     }

// //     // ✅ Mongoose v7/8: usar deleteOne() en subdocumento
// //     d.deleteOne()

// //     // Auditoría
// //     if (Array.isArray(v.audits)) {
// //       v.audits.push({
// //         ts: now(),
// //         action: 'MEDIA_DELETE_DOC',
// //         data: { documentId, publicId: d.publicId },
// //         by: req.user?.id || null,
// //       })
// //     }

// //     await v.save()
// //     res.json({ ok: true })
// //   } catch (err) {
// //     console.error('[deleteVehicleDocument] ❌', err)
// //     res.status(500).json({ message: 'Error eliminando documento', error: err.message })
// //   }
// // }


// //// ACTUALIZACION 20/10/2025 //////

// // back/src/controllers/vehicles.controller.js
// // -----------------------------------------------------------------------------
// // Controlador de Vehículos
// // - list(): populate('branch')
// // - CRUD (CREATE/UPDATE registran auditoría)
// // - transfer(): mantiene compatibilidad
// // - Apoyos: startSupport / finishSupport (cambios de estado/sigla + auditoría)
// // - Media: subida/borrado robusto (multer y multer-storage-cloudinary), auto-clasifica PDF
// // - Auditoría: listado paginado
// // -----------------------------------------------------------------------------
// import Vehicle from '../models/Vehicle.js';
// import cloud from '../utils/cloudinary.js'; // export default con .uploader

// // Helpers
// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);
// const isHttpUrl = (p = '') => /^https?:\/\//i.test(p);
// const isVideoFormat = (fmt = '', mt = '') => {
//   const f = (fmt || '').toLowerCase();
//   const m = (mt || '').toLowerCase();
//   return f === 'mp4' || f === 'mov' || f === 'webm' || m.startsWith('video/');
// };
// const isPdf = (fmt = '', mt = '') => (fmt || '').toLowerCase() === 'pdf' || (mt || '').toLowerCase() === 'application/pdf';

// function nextSeq(arr, category) {
//   const list = (arr || []).filter(it => it.category === U(category));
//   return (list.length + 1).toString().padStart(5, '0'); // 00001
// }

// function auditPush(doc, action, data, by) {
//   doc.audit.push({
//     action: U(action),
//     by: by || undefined,
//     at: new Date(),
//     data: data || {}
//   });
// }

// // // ====================== LISTADO ======================
// // export async function list(req, res) {
// //   const { page = 1, limit = 10, q = '' } = req.query;
// //   const p = Math.max(parseInt(page, 10) || 1, 1);
// //   const l = Math.max(parseInt(limit, 10) || 10, 1);

// //   const filter = q ? {
// //     $or: [
// //       { plate: new RegExp(q, 'i') },
// //       { internalCode: new RegExp(q, 'i') },
// //       { brand: new RegExp(q, 'i') },
// //       { model: new RegExp(q, 'i') },
// //     ]
// //   } : {};

// //   const [items, total] = await Promise.all([
// //     Vehicle.find(filter)
// //       .populate('branch', 'code name')
// //       .sort('-createdAt')
// //       .skip((p - 1) * l)
// //       .limit(l)
// //       .lean(),
// //     Vehicle.countDocuments(filter),
// //   ]);

// //   res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
// // }

// // ====================== LISTADO ======================
// export async function list(req, res) {
//   const { page = 1, limit = 10, q = '', branch } = req.query;
//   const p = Math.max(parseInt(page, 10) || 1, 1);
//   const l = Math.max(parseInt(limit, 10) || 10, 1);

//   const filter = {};
//   if (q) {
//     filter.$or = [
//       { plate: new RegExp(q, 'i') },
//       { internalCode: new RegExp(q, 'i') },
//       { brand: new RegExp(q, 'i') },
//       { model: new RegExp(q, 'i') },
//     ];
//   }
//   if (branch) filter.branch = branch; // <<— filtro por sucursal

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


// // ====================== CRUD ======================
// export async function create(req, res) {
//   const payload = req.body || {};
//   if (!payload.status) payload.status = 'ACTIVE';
//   const v = await Vehicle.create(payload);
//   auditPush(v, 'CREATE', { payload }, req.user?.email || req.user?.id);
//   await v.save();
//   res.status(201).json(v);
// }

// export async function getOne(req, res) {
//   const v = await Vehicle.findById(req.params.id).lean();
//   if (!v) return res.status(404).json({ message: 'No encontrado' });
//   res.json(v);
// }

// export async function update(req, res) {
//   try {
//     const before = await Vehicle.findById(req.params.id);
//     if (!before) return res.status(404).json({ message: 'No encontrado' });

//     const v = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     auditPush(v, 'UPDATE', { before, after: v }, req.user?.email || req.user?.id);
//     await v.save();

//     res.json(v.toObject());
//   } catch (err) {
//     console.error(`[vehicles.update] 400`, err);
//     const pathMsg = /Cast to date failed.*path "(.*?)"/i.exec(err?.message || '');
//     const field = pathMsg?.[1];
//     return res.status(400).json({ message: field ? `Formato inválido para el campo ${field}` : 'Datos inválidos' });
//   }
// }

// export async function remove(req, res) {
//   const v = await Vehicle.findById(req.params.id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });
//   await Vehicle.findByIdAndDelete(req.params.id);
//   // Guardamos la auditoría en memoria previa (no hay doc para push)
//   // Puedes almacenar en una colección separada si quieres historial de deletes
//   res.json({ ok: true });
// }

// // ====================== TRANSFER (simple, compat) ======================
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

//   auditPush(v, 'TRANSFER', { reason, toBranch, replaceVehicleId, note }, req.user?.email || req.user?.id);
//   await v.save();
//   res.json(v.toObject());
// }

// // ====================== APOYO (start/finish) ======================
// export async function startSupport(req, res) {
//   // Body: { targetBranch, targetVehicle }
//   const { id } = req.params;
//   const { targetBranch, targetVehicle } = req.body || {};

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   const target = await Vehicle.findById(targetVehicle);
//   if (!target) return res.status(404).json({ message: 'Vehículo a reemplazar no encontrado' });

//   // Si el target NO está fuera de servicio, lo dejamos fuera de servicio
//   if (U(target.status) !== 'OUT_OF_SERVICE') {
//     target.status = 'OUT_OF_SERVICE';
//   }

//   // Este vehículo toma la sigla del target + 'R'
//   const originalInternal = v.internalCode;
//   const replacement = `${target.internalCode}R`;

//   v.support = {
//     active: true,
//     targetBranch,
//     targetVehicle,
//     replacementCode: replacement,
//     originalInternalCode: originalInternal,
//     startedAt: new Date(),
//     endedAt: null,
//   };
//   v.internalCode = replacement;
//   v.status = 'SUPPORT';

//   auditPush(v, 'SUPPORT_START', {
//     targetBranch, targetVehicle, replacementCode: replacement, originalInternalCode: originalInternal
//   }, req.user?.email || req.user?.id);

//   await target.save();
//   await v.save();

//   res.json(v.toObject());
// }

// export async function finishSupport(req, res) {
//   const { id } = req.params;

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   if (!v.support?.active) {
//     return res.status(400).json({ message: 'Este vehículo no está en apoyo activo' });
//   }

//   const { targetVehicle, originalInternalCode, replacementCode } = v.support || {};
//   const target = targetVehicle ? await Vehicle.findById(targetVehicle) : null;

//   // Restaurar sigla original
//   if (originalInternalCode) v.internalCode = originalInternalCode;
//   v.status = 'ACTIVE';
//   v.support.active = false;
//   v.support.endedAt = new Date();

//   auditPush(v, 'SUPPORT_FINISH', {
//     targetVehicle, replacementCode, endedAt: v.support.endedAt
//   }, req.user?.email || req.user?.id);

//   await v.save();
//   // No tocamos el estado del target (queda como esté)
//   res.json(v.toObject());
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

//     const cat = U(category) || 'BASIC';
//     const baseLabel = (label || title || '').toString().trim();
//     const seq = nextSeq(v.photos, cat);

//     let url, publicId, bytes, format, resourceType, mimetype = file.mimetype;

//     // Si viene desde multer-storage-cloudinary → path es https y ya trae filename/public_id
//     if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
//       url = file.path;
//       publicId = file.filename || file.public_id;
//       bytes = file.size;
//       format = file.format || (mimetype ? mimetype.split('/')[1] : '');
//       resourceType = file.resource_type || (isVideoFormat(format, mimetype) ? 'video' : (isPdf(format, mimetype) ? 'raw' : 'image'));
//     } else {
//       // multer simple → subimos
//       const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
//       const up = await cloud.uploader.upload(file.path, {
//         folder: `${folder}/vehicles/${id}/photos`,
//         resource_type: 'auto',
//       });
//       url = up.secure_url;
//       publicId = up.public_id;
//       bytes = up.bytes;
//       format = up.format;
//       resourceType = up.resource_type;
//     }

//     // Si detectamos PDF/RAW por error aquí, lo enviamos a documents
//     if (resourceType === 'raw' || isPdf(format, mimetype)) {
//       const uniformLabel = baseLabel ? `${cat} — ${U(baseLabel)} — ${seq}` : `${cat} — ${seq}`;
//       v.documents.push({
//         category: cat,
//         label: uniformLabel,
//         url, publicId, bytes, format, createdAt: new Date(),
//       });
//       auditPush(v, 'MEDIA_ADD', { type: 'DOCUMENT', category: cat, label: uniformLabel, url }, req.user?.email || req.user?.id);
//       await v.save();
//       return res.status(201).json({ ok: true, redirected: 'document', document: v.documents[v.documents.length - 1] });
//     }

//     // Nombre uniforme mostrado (si no hay etiqueta, omitimos parte intermedia)
//     const uniformTitle = baseLabel ? `${cat} — ${U(baseLabel)} — ${seq}` : `${cat} — ${seq}`;

//     v.photos.push({
//       category: cat,
//       title: uniformTitle,
//       url, publicId, bytes, format, createdAt: new Date(),
//     });

//     auditPush(v, 'MEDIA_ADD', { type: resourceType === 'video' ? 'VIDEO' : 'PHOTO', category: cat, title: uniformTitle, url }, req.user?.email || req.user?.id);
//     await v.save();

//     res.status(201).json({ ok: true, photo: v.photos[v.photos.length - 1], isVideo: resourceType === 'video' });
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

//     const idx = v.photos.findIndex(p => String(p._id) === String(photoId));
//     if (idx === -1) return res.status(404).json({ message: 'Foto no encontrada' });

//     const ph = v.photos[idx];
//     if (ph.publicId) {
//       try { await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' }); } catch (_) {}
//     }
//     v.photos.splice(idx, 1);

//     auditPush(v, 'MEDIA_DEL', { type: 'PHOTO', photoId }, req.user?.email || req.user?.id);
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

//     const cat = U(category) || 'LEGAL';
//     const lbl = (label || '').toString().trim();

//     let url, publicId, bytes, format, resourceType, mimetype = file.mimetype;

//     if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
//       url = file.path;
//       publicId = file.filename || file.public_id;
//       bytes = file.size;
//       format = file.format || (mimetype ? mimetype.split('/')[1] : '');
//       resourceType = file.resource_type || (isPdf(format, mimetype) ? 'raw' : (isVideoFormat(format, mimetype) ? 'video' : 'image'));
//     } else {
//       const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
//       const up = await cloud.uploader.upload(file.path, {
//         folder: `${folder}/vehicles/${id}/documents`,
//         resource_type: 'auto',
//       });
//       url = up.secure_url;
//       publicId = up.public_id;
//       bytes = up.bytes;
//       format = up.format;
//       resourceType = up.resource_type;
//     }

//     // Si por error nos mandan imagen/video aquí, lo enrutamos a photos
//     if (resourceType !== 'raw' && !isPdf(format, mimetype)) {
//       const seq = nextSeq(v.photos, cat);
//       const uniformTitle = lbl ? `${cat} — ${U(lbl)} — ${seq}` : `${cat} — ${seq}`;
//       v.photos.push({
//         category: cat,
//         title: uniformTitle,
//         url, publicId, bytes, format, createdAt: new Date(),
//       });
//       auditPush(v, 'MEDIA_ADD', { type: isVideoFormat(format, mimetype) ? 'VIDEO' : 'PHOTO', category: cat, title: uniformTitle, url }, req.user?.email || req.user?.id);
//       await v.save();
//       return res.status(201).json({ ok: true, redirected: 'photo', photo: v.photos[v.photos.length - 1] });
//     }

//     const seq = nextSeq(v.documents, cat);
//     const uniformLabel = lbl ? `${cat} — ${U(lbl)} — ${seq}` : `${cat} — ${seq}`;

//     v.documents.push({
//       category: cat,
//       label: uniformLabel,
//       url, publicId, bytes, format, createdAt: new Date(),
//     });

//     auditPush(v, 'MEDIA_ADD', { type: 'DOCUMENT', category: cat, label: uniformLabel, url }, req.user?.email || req.user?.id);
//     await v.save();

//     res.status(201).json({ ok: true, document: v.documents[v.documents.length - 1] });
//   } catch (err) {
//     console.error('[addVehicleDocument] ❌', err);
//     // Cloudinary 401 (raw remoto) → mensaje claro
//     res.status(500).json({ message: 'Error subiendo documento', error: err.message });
//   }
// }

// export async function deleteVehicleDocument(req, res) {
//   try {
//     const { id, documentId } = req.params;
//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const idx = v.documents.findIndex(d => String(d._id) === String(documentId));
//     if (idx === -1) return res.status(404).json({ message: 'Documento no encontrado' });

//     const d = v.documents[idx];
//     if (d.publicId) {
//       try { await cloud.uploader.destroy(d.publicId, { resource_type: 'auto' }); } catch (_) {}
//     }
//     v.documents.splice(idx, 1);

//     auditPush(v, 'MEDIA_DEL', { type: 'DOCUMENT', documentId }, req.user?.email || req.user?.id);
//     await v.save();

//     res.json({ ok: true });
//   } catch (err) {
//     console.error('[deleteVehicleDocument] ❌', err);
//     res.status(500).json({ message: 'Error eliminando documento', error: err.message });
//   }
// }

// // ====================== AUDITORÍA (paginada) ======================
// export async function listAudit(req, res) {
//   const { id } = req.params;
//   const { page = 1, limit = 10 } = req.query;
//   const p = Math.max(parseInt(page, 10) || 1, 1);
//   const l = Math.max(parseInt(limit, 10) || 10, 1);

//   const v = await Vehicle.findById(id, { audit: 1 }).lean();
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   const total = v.audit?.length || 0;
//   const start = (p - 1) * l;
//   const end = start + l;
//   const items = (v.audit || [])
//     .slice()
//     .sort((a, b) => new Date(b.at) - new Date(a.at))
//     .slice(start, end);

//   res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
// }


// //// actualizacion 22/10/2025 13:30
// back/src/controllers/vehicles.controller.js
// -----------------------------------------------------------------------------
// Controlador de Vehículos
// - list(): soporta q y branch; busca también por support.originalInternalCode;
//           ordena (en memoria) por compañía (branch.code) y luego internalCode.
// - CRUD: create/update/remove con auditoría. update evita "circular structure"
//         registrando snapshots planos (before/after) sólo de campos tocados.
// - transfer(): compat de traspaso simple.
// - support: startSupport / finishSupport con trazas detalladas para auditoría.
// - media: add/delete (photos/documents) tolerante a multer y cloudinary.
// - auditoría paginada.
// -----------------------------------------------------------------------------

import Vehicle from '../models/Vehicle.js';
import cloud from '../utils/cloudinary.js';

// ----------------------------- Helpers ---------------------------------------
const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);
const isHttpUrl = (p = '') => /^https?:\/\//i.test(p);
const isVideoFormat = (fmt = '', mt = '') => {
  const f = (fmt || '').toLowerCase();
  const m = (mt || '').toLowerCase();
  return f === 'mp4' || f === 'mov' || f === 'webm' || m.startsWith('video/');
};
const isPdf = (fmt = '', mt = '') =>
  (fmt || '').toLowerCase() === 'pdf' || (mt || '').toLowerCase() === 'application/pdf';

const safeClone = (obj) => JSON.parse(JSON.stringify(obj ?? {}));

function pickChanged(base, next) {
  // Devuelve un objeto "base" reducido a las claves cambiadas en "next".
  const out = {};
  if (!base || !next) return out;
  for (const k of Object.keys(next)) {
    if (next[k] && typeof next[k] === 'object' && !Array.isArray(next[k])) {
      out[k] = {};
      for (const s of Object.keys(next[k])) out[k][s] = base?.[k]?.[s];
    } else {
      out[k] = base?.[k];
    }
  }
  return out;
}

function nextSeq(arr, category) {
  const list = (arr || []).filter((it) => it.category === U(category));
  return (list.length + 1).toString().padStart(5, '0'); // 00001
}

function auditPush(doc, action, data, by) {
  doc.audit.push({
    action: U(action),
    by: by || undefined,
    at: new Date(),
    data: data || {},
  });
}

// ====================== LISTADO ======================
export async function list(req, res) {
  const { page = 1, limit = 10, q = '', branch } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const filter = {};
  if (q) {
    filter.$or = [
      { plate: new RegExp(q, 'i') },
      { internalCode: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { model: new RegExp(q, 'i') },
      // permite hallar S-1R buscando RX-15 (sigla original)
      { 'support.originalInternalCode': new RegExp(q, 'i') },
    ];
  }
  if (branch) filter.branch = branch;

  const [rawItems, total] = await Promise.all([
    Vehicle.find(filter).populate('branch', 'code name').skip((p - 1) * l).limit(l).lean(),
    Vehicle.countDocuments(filter),
  ]);

  // Orden en memoria: compañía (branch.code) → internalCode
  const items = (rawItems || []).slice().sort((a, b) => {
    const aComp = (a.branch?.code || '').toString();
    const bComp = (b.branch?.code || '').toString();
    if (aComp !== bComp) return aComp.localeCompare(bComp, 'es', { numeric: true });
    return (a.internalCode || '').localeCompare(b.internalCode || '', 'es', { numeric: true });
  });

  res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
}

// ====================== CRUD ======================
export async function create(req, res) {
  const payload = req.body || {};
  if (!payload.status) payload.status = 'ACTIVE';
  const v = await Vehicle.create(payload);
  auditPush(v, 'CREATE', { payload: safeClone(payload) }, req.user?.email || req.user?.id);
  await v.save();
  res.status(201).json(v);
}

export async function getOne(req, res) {
  const v = await Vehicle.findById(req.params.id).lean();
  if (!v) return res.status(404).json({ message: 'No encontrado' });
  res.json(v);
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const changes = req.body || {};

    const before = await Vehicle.findById(id).lean();
    if (!before) return res.status(404).json({ message: 'No encontrado' });

    const after = await Vehicle.findByIdAndUpdate(id, changes, { new: true }).lean();

    // Snapshot plano de sólo las claves cambiadas (evita "circular structure")
    const vDoc = await Vehicle.findById(id); // doc vivo para push en audit
    vDoc.audit.push({
      action: 'UPDATE',
      by: req.user?.email || req.user?.id,
      at: new Date(),
      data: {
        before: safeClone(pickChanged(before, changes)),
        after: safeClone(pickChanged(after, changes)),
      },
    });
    await vDoc.save();

    res.json(after);
  } catch (err) {
    console.error('[vehicles.update] 400', err);
    const pathMsg = /Cast to date failed.*path "(.*?)"/i.exec(err?.message || '');
    const field = pathMsg?.[1];
    return res
      .status(400)
      .json({ message: field ? `Formato inválido para el campo ${field}` : 'Datos inválidos' });
  }
}

export async function remove(req, res) {
  const v = await Vehicle.findById(req.params.id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

// ====================== TRANSFER (simple, compat) ======================
export async function transfer(req, res) {
  const { id } = req.params;
  const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {};

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  const fromBranch = v.branch;
  let newInternal = v.internalCode;

  if (U(reason) === 'APOYO' && replaceVehicleId) {
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

  auditPush(
    v,
    'TRANSFER',
    { reason, toBranch, replaceVehicleId, note, fromBranch, newInternalCode: newInternal },
    req.user?.email || req.user?.id
  );
  await v.save();
  res.json(v.toObject());
}

// ====================== APOYO (start/finish) ======================
export async function startSupport(req, res) {
  // Espera body: { targetBranch, targetVehicle }  (nombres exactos)
  const { id } = req.params;
  const { targetBranch, targetVehicle } = req.body || {};

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'Vehículo origen no encontrado' });

  if (!targetBranch || !targetVehicle) {
    return res.status(400).json({ message: 'Sucursal y vehículo objetivo son requeridos' });
  }
  if (String(targetVehicle) === String(id)) {
    return res.status(400).json({ message: 'Un vehículo no puede reemplazarse a sí mismo' });
  }
  if (v.support?.active) {
    return res.status(400).json({ message: 'Este vehículo ya está en reemplazo activo' });
  }

  const target = await Vehicle.findById(targetVehicle);
  if (!target) return res.status(404).json({ message: 'Vehículo a reemplazar no encontrado' });
  if (target.support?.active) {
    return res.status(400).json({ message: 'No se puede reemplazar un vehículo que ya está en reemplazo' });
  }

  // Estado objetivo OUT_OF_SERVICE (si no lo está)
  if ((target.status || '').toUpperCase() !== 'OUT_OF_SERVICE') {
    target.status = 'OUT_OF_SERVICE';
  }

  // El actual toma sigla target + 'R'
  const originalInternal = v.internalCode;
  const replacement = `${target.internalCode}R`;

  v.support = {
    active: true,
    targetBranch,
    targetVehicle,
    replacementCode: replacement,
    originalInternalCode: originalInternal,
    startedAt: new Date(),
    endedAt: null,
  };
  v.internalCode = replacement;
  v.status = 'SUPPORT';

  auditPush(v, 'SUPPORT_START', {
    detail: `${originalInternal} → ${replacement}`,
    targetVehicle,
    targetBranch,
  }, req.user?.email || req.user?.id);

  await target.save();
  await v.save();

  res.json(v.toObject());
}

export async function finishSupport(req, res) {
  const { id } = req.params;

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'Vehículo no encontrado' });
  if (!v.support?.active) {
    return res.status(400).json({ message: 'Este vehículo no está en apoyo activo' });
  }

  const { targetVehicle, originalInternalCode, replacementCode } = v.support || {};
  const fromCode = replacementCode || v.internalCode;
  const toCode   = originalInternalCode || v.internalCode;

  // Restaurar sigla/status
  if (originalInternalCode) v.internalCode = originalInternalCode;
  v.status = 'ACTIVE';
  v.support.active = false;
  v.support.endedAt = new Date();

  auditPush(v, 'SUPPORT_FINISH', {
    detail: `${fromCode} → ${toCode}`,
    targetVehicle,
    endedAt: v.support.endedAt,
  }, req.user?.email || req.user?.id);

  await v.save();
  res.json(v.toObject());
}

// ====================== APOYO (start/finish) ======================

// export async function startSupport(req, res) {
//   const { id } = req.params;
//   const { targetBranch, targetVehicle } = req.body || {};

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   const target = await Vehicle.findById(targetVehicle);
//   if (!target) return res.status(404).json({ message: 'Vehículo a reemplazar no encontrado' });

//   // Estado del target → OUT_OF_SERVICE (si no lo está)
//   const targetPrevStatus = target.status;
//   if (U(target.status) !== 'OUT_OF_SERVICE') target.status = 'OUT_OF_SERVICE';

//   // Siglas
//   const prevCode = v.internalCode;
//   const replacement = `${target.internalCode}R`;

//   v.support = {
//     active: true,
//     targetBranch,
//     targetVehicle,
//     replacementCode: replacement,
//     originalInternalCode: prevCode,
//     startedAt: new Date(),
//     endedAt: null,
//   };
//   v.internalCode = replacement;
//   const prevStatus = v.status;
//   v.status = 'SUPPORT';

//   auditPush(
//     v,
//     'SUPPORT_START',
//     {
//       fromCode: prevCode,
//       toCode: replacement,
//       fromStatus: prevStatus,
//       toStatus: v.status,
//       targetVehicle: target._id,
//       targetInternalCode: target.internalCode,
//       targetPrevStatus,
//       targetNewStatus: target.status,
//     },
//     req.user?.email || req.user?.id
//   );

//   await target.save();
//   await v.save();

//   res.json(v.toObject());
// }

// export async function finishSupport(req, res) {
//   const { id } = req.params;

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   if (!v.support?.active) {
//     return res.status(400).json({ message: 'Este vehículo no está en apoyo activo' });
//   }

//   const { targetVehicle, originalInternalCode, replacementCode } = v.support || {};
//   const prevCode = v.internalCode;
//   const prevStatus = v.status;

//   // Restaurar sigla original
//   if (originalInternalCode) v.internalCode = originalInternalCode;
//   v.status = 'ACTIVE';
//   v.support.active = false;
//   v.support.endedAt = new Date();

//   auditPush(
//     v,
//     'SUPPORT_FINISH',
//     {
//       fromCode: prevCode,
//       toCode: v.internalCode,
//       fromStatus: prevStatus,
//       toStatus: v.status,
//       targetVehicle,
//       replacementCode,
//       endedAt: v.support.endedAt,
//     },
//     req.user?.email || req.user?.id
//   );

//   await v.save();
//   res.json(v.toObject());
// }

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

    let url,
      publicId,
      bytes,
      format,
      resourceType,
      mimetype = file.mimetype;

    // multer-storage-cloudinary → file.path https y con filename/public_id
    if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
      url = file.path;
      publicId = file.filename || file.public_id;
      bytes = file.size;
      format = file.format || (mimetype ? mimetype.split('/')[1] : '');
      resourceType =
        file.resource_type ||
        (isVideoFormat(format, mimetype) ? 'video' : isPdf(format, mimetype) ? 'raw' : 'image');
    } else {
      // multer simple → subimos
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

    // Si realmente es PDF/RAW, lo redirigimos a documentos
    if (resourceType === 'raw' || isPdf(format, mimetype)) {
      const uniformLabel = baseLabel
        ? `${cat} — ${U(baseLabel)} — ${seq}`
        : `${cat} — ${seq}`;
      v.documents.push({
        category: cat,
        label: uniformLabel,
        url,
        publicId,
        bytes,
        format,
        createdAt: new Date(),
      });
      auditPush(
        v,
        'MEDIA_ADD',
        { type: 'DOCUMENT', category: cat, label: uniformLabel, url },
        req.user?.email || req.user?.id
      );
      await v.save();
      return res
        .status(201)
        .json({ ok: true, redirected: 'document', document: v.documents.at(-1) });
    }

    const uniformTitle = baseLabel
      ? `${cat} — ${U(baseLabel)} — ${seq}`
      : `${cat} — ${seq}`;

    v.photos.push({
      category: cat,
      title: uniformTitle,
      url,
      publicId,
      bytes,
      format,
      createdAt: new Date(),
    });

    auditPush(
      v,
      'MEDIA_ADD',
      {
        type: resourceType === 'video' ? 'VIDEO' : 'PHOTO',
        category: cat,
        title: uniformTitle,
        url,
      },
      req.user?.email || req.user?.id
    );
    await v.save();

    res
      .status(201)
      .json({ ok: true, photo: v.photos.at(-1), isVideo: resourceType === 'video' });
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

    const idx = v.photos.findIndex((p) => String(p._id) === String(photoId));
    if (idx === -1) return res.status(404).json({ message: 'Foto no encontrada' });

    const ph = v.photos[idx];
    if (ph.publicId) {
      try {
        await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' });
      } catch (_) {}
    }
    v.photos.splice(idx, 1);

    auditPush(v, 'MEDIA_DEL', { type: 'PHOTO', photoId }, req.user?.email || req.user?.id);
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
    const lbl = (label || '').toString().trim();

    let url,
      publicId,
      bytes,
      format,
      resourceType,
      mimetype = file.mimetype;

    if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
      url = file.path;
      publicId = file.filename || file.public_id;
      bytes = file.size;
      format = file.format || (mimetype ? mimetype.split('/')[1] : '');
      resourceType =
        file.resource_type ||
        (isPdf(format, mimetype) ? 'raw' : isVideoFormat(format, mimetype) ? 'video' : 'image');
    } else {
      const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
      const up = await cloud.uploader.upload(file.path, {
        folder: `${folder}/vehicles/${id}/documents`,
        resource_type: 'auto',
      });
      url = up.secure_url;
      publicId = up.public_id;
      bytes = up.bytes;
      format = up.format;
      resourceType = up.resource_type;
    }

    // Si por error llega imagen/video, lo tratamos como photo
    if (resourceType !== 'raw' && !isPdf(format, mimetype)) {
      const seq = nextSeq(v.photos, cat);
      const uniformTitle = lbl ? `${cat} — ${U(lbl)} — ${seq}` : `${cat} — ${seq}`;
      v.photos.push({
        category: cat,
        title: uniformTitle,
        url,
        publicId,
        bytes,
        format,
        createdAt: new Date(),
      });
      auditPush(
        v,
        'MEDIA_ADD',
        {
          type: isVideoFormat(format, mimetype) ? 'VIDEO' : 'PHOTO',
          category: cat,
          title: uniformTitle,
          url,
        },
        req.user?.email || req.user?.id
      );
      await v.save();
      return res
        .status(201)
        .json({ ok: true, redirected: 'photo', photo: v.photos.at(-1) });
    }

    const seq = nextSeq(v.documents, cat);
    const uniformLabel = lbl ? `${cat} — ${U(lbl)} — ${seq}` : `${cat} — ${seq}`;

    v.documents.push({
      category: cat,
      label: uniformLabel,
      url,
      publicId,
      bytes,
      format,
      createdAt: new Date(),
    });

    auditPush(
      v,
      'MEDIA_ADD',
      { type: 'DOCUMENT', category: cat, label: uniformLabel, url },
      req.user?.email || req.user?.id
    );
    await v.save();

    res.status(201).json({ ok: true, document: v.documents.at(-1) });
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

    const idx = v.documents.findIndex((d) => String(d._id) === String(documentId));
    if (idx === -1) return res.status(404).json({ message: 'Documento no encontrado' });

    const d = v.documents[idx];
    if (d.publicId) {
      try {
        await cloud.uploader.destroy(d.publicId, { resource_type: 'auto' });
      } catch (_) {}
    }
    v.documents.splice(idx, 1);

    auditPush(v, 'MEDIA_DEL', { type: 'DOCUMENT', documentId }, req.user?.email || req.user?.id);
    await v.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteVehicleDocument] ❌', err);
    res.status(500).json({ message: 'Error eliminando documento', error: err.message });
  }
}

// ====================== AUDITORÍA (paginada) ======================
export async function listAudit(req, res) {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const v = await Vehicle.findById(id, { audit: 1 }).lean();
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  const total = v.audit?.length || 0;
  const start = (p - 1) * l;
  const end = start + l;
  const items = (v.audit || [])
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(start, end);

  res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
}

