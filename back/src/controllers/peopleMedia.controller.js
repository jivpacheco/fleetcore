// // back/src/controllers/peopleMedia.controller.js
// import multer from 'multer';
// import path from 'path';
// import Person from '../models/Person.js';
// import { getStorage } from '../services/storage/index.js';

// export const uploadMemory = multer({ storage: multer.memoryStorage() });

// function extFromFile(file) {
//   const fromName = path.extname(file.originalname || '').replace('.', '').toLowerCase();
//   const fromMime = (file.mimetype || '').split('/').pop() || '';
//   return fromName || fromMime || '';
// }

// // ====================== PHOTO ======================
// export async function uploadPersonPhoto(req, res, next) {
//   try {
//     const { personId } = req.params;

//     const person = await Person.findById(personId);
//     if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
//     if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

//     const storage = getStorage();
//     const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/people/${personId}/photo`;

//     const uploaded = await storage.uploadImage({ buffer: req.file.buffer, folder });

//     // borrar anterior
//     if (person.photo?.publicId) {
//       await storage.delete({ publicId: person.photo.publicId, resourceType: 'image' });
//     }

//     person.photo = {
//       url: uploaded.url,
//       format: uploaded.format || extFromFile(req.file),
//       contentType: req.file.mimetype || '',
//       bytes: uploaded.bytes || req.file.size || 0,
//       uploadedAt: new Date(),
//       publicId: uploaded.publicId,
//       provider: uploaded.provider || storage.name,
//     };

//     person.updatedBy = req.user?.uid;
//     await person.save();

//     return res.status(201).json({ item: person.photo });
//   } catch (err) {
//     next(err);
//   }
// }

// // ====================== DOCUMENTS ======================
// export async function uploadPersonDocument(req, res, next) {
//   try {
//     const { personId } = req.params;

//     const person = await Person.findById(personId);
//     if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
//     if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

//     const storage = getStorage();
//     const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/people/${personId}/documents`;

//     const uploaded = await storage.uploadFile({ buffer: req.file.buffer, folder });

//     const doc = {
//       label: req.body?.label?.trim() || req.file.originalname,
//       url: uploaded.url,
//       format: uploaded.format || extFromFile(req.file),
//       contentType: req.file.mimetype || '',
//       bytes: uploaded.bytes || req.file.size || 0,
//       uploadedAt: new Date(),
//       publicId: uploaded.publicId,
//       provider: uploaded.provider || storage.name,
//     };

//     person.documents.push(doc);
//     person.updatedBy = req.user?.uid;
//     await person.save();

//     return res.status(201).json({ item: doc });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function deletePersonDocument(req, res, next) {
//   try {
//     const { personId, docId } = req.params;

//     const person = await Person.findById(personId);
//     if (!person) return res.status(404).json({ message: 'Persona no encontrada' });

//     const doc = person.documents.id(docId);
//     if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });

//     const storage = getStorage();
//     await storage.delete({ publicId: doc.publicId, resourceType: 'raw' });

//     doc.deleteOne();
//     person.updatedBy = req.user?.uid;
//     await person.save();

//     return res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// }

// back/src/controllers/peopleMedia.controller.js
import multer from 'multer';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import path from 'path';
import Person from '../models/Person.js';
import { getStorage } from '../services/storage/index.js';

export const uploadMemory = multer({ storage: multer.memoryStorage() });

function extFromFile(file) {
  const fromName = path.extname(file.originalname || '').replace('.', '').toLowerCase();
  const fromMime = (file.mimetype || '').split('/').pop() || '';
  return fromName || fromMime || '';
}

// ===== Scope helpers (consistentes con people.controller) =====
function assertBranchWriteScope(req, branchId) {
  const roles = (req.user?.roles || []).map(r => String(r || '').toLowerCase())
  const isGlobal = roles.includes('global') || roles.includes('admin') || roles.includes('superadmin')
  if (isGlobal) return true

  const allowed = []
  if (Array.isArray(req.user?.branchIds)) allowed.push(...req.user.branchIds.map(String))
  if (req.user?.branchId) allowed.push(String(req.user.branchId))

  if (!allowed.includes(String(branchId))) {
    const err = new Error('No autorizado para operar en esta sucursal')
    err.status = 403
    throw err
  }
  return true
}

async function ensureInReadScope(req, personId) {
  const filter = { _id: personId, ...(req.branchFilter || {}) }
  const exists = await Person.findOne(filter).select('_id branchId').lean()
  if (!exists) {
    const err = new Error('No encontrado')
    err.status = 404
    throw err
  }
  return exists
}

// ====================== PHOTO ======================
export async function uploadPersonPhoto(req, res, next) {
  try {
    const { personId } = req.params;
    const scope = await ensureInReadScope(req, personId)

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Persona no encontrada' });

    assertBranchWriteScope(req, scope.branchId)

    assertBranchWriteScope(req, scope.branchId)
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

    const storage = getStorage();
    const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/people/${personId}/photo`;

    const uploaded = await storage.uploadImage({ buffer: req.file.buffer, folder });

    // borrar anterior
    if (person.photo?.publicId) {
      await storage.delete({ publicId: person.photo.publicId, resourceType: 'image' });
    }

    person.photo = {
      url: uploaded.url,
      format: uploaded.format || extFromFile(req.file),
      contentType: req.file.mimetype || '',
      bytes: uploaded.bytes || req.file.size || 0,
      uploadedAt: new Date(),
      publicId: uploaded.publicId,
      provider: uploaded.provider || storage.name,
    };

    person.updatedBy = req.user?.uid;
    await person.save();

    return res.status(201).json({ item: person.photo });
  } catch (err) {
    next(err);
  }
}

// ====================== DOCUMENTS ======================
export async function uploadPersonDocument(req, res, next) {
  try {
    const { personId } = req.params;
    const scope = await ensureInReadScope(req, personId)

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Persona no encontrada' });

    assertBranchWriteScope(req, scope.branchId)
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

    const storage = getStorage();
    const folder = `${process.env.STORAGE_FOLDER || 'fleetcore'}/people/${personId}/documents`;

    const uploaded = await storage.uploadFile({ buffer: req.file.buffer, folder });

    const doc = {
      label: req.body?.label?.trim() || req.file.originalname,
      url: uploaded.url,
      format: uploaded.format || extFromFile(req.file),
      contentType: req.file.mimetype || '',
      bytes: uploaded.bytes || req.file.size || 0,
      uploadedAt: new Date(),
      publicId: uploaded.publicId,
      provider: uploaded.provider || storage.name,
    };

    person.documents.push(doc);
    person.updatedBy = req.user?.uid;
    await person.save();

    return res.status(201).json({ item: doc });
  } catch (err) {
    next(err);
  }
}

export async function deletePersonDocument(req, res, next) {
  try {
    const { personId, docId } = req.params;

    // const scope = await ensureInReadScope(req, personId)

    const scope = await ensureInReadScope(req, personId)

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Persona no encontrada' });

    assertBranchWriteScope(req, scope.branchId)

    assertBranchWriteScope(req, scope.branchId)

    const doc = person.documents.id(docId);
    if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });

    const storage = getStorage();
    await storage.delete({ publicId: doc.publicId, resourceType: 'raw' });

    doc.deleteOne();
    person.updatedBy = req.user?.uid;
    await person.save();

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function deletePersonPhoto(req, res, next) {
  try {
    const { personId } = req.params;
    const scope = await ensureInReadScope(req, personId)

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'No encontrado' });

    assertBranchWriteScope(req, scope.branchId)

    // Borrar en proveedor si existe publicId
    const photo = person.photo || null;
    if (photo?.publicId) {
      try {
        const storage = getStorage();
        await storage.delete({ publicId: photo.publicId, resourceType: 'image' });
      } catch (e) {
        // No bloqueamos el flujo: priorizamos coherencia en DB.
      }
    }

    person.photo = null;
    person.updatedBy = req.user?.uid;
    await person.save();

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

function inferFilename(doc) {
  const base = (doc?.label || 'documento').toString().trim() || 'documento';
  const safe = base.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const ext = (doc?.format || '').toString().trim();
  if (ext && safe.toLowerCase().endsWith('.' + ext.toLowerCase())) return safe;
  return ext ? `${safe}.${ext}` : safe;
}

export async function downloadPersonDocument(req, res, next) {
  try {
    const { personId, docId } = req.params;
    await ensureInReadScope(req, personId);

    const person = await Person.findById(personId).lean();
    if (!person) return res.status(404).json({ message: 'No encontrado' });

    const doc = (person.documents || []).find((d) => String(d._id) === String(docId));
    if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });

    const filename = inferFilename(doc);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    if (doc.contentType) res.setHeader('Content-Type', doc.contentType);

    const u = new URL(doc.url);
    const proto = u.protocol === 'http:' ? http : https;

    proto.get(doc.url, (r) => {
      // Propagar errores upstream
      if (r.statusCode && r.statusCode >= 400) {
        res.status(r.statusCode).end();
        r.resume();
        return;
      }
      r.pipe(res);
    }).on('error', () => {
      res.status(502).json({ message: 'No fue posible descargar el archivo' });
    });
  } catch (err) {
    next(err);
  }
}
