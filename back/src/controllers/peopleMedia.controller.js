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

//     // borrar anterior si existe
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
import path from 'path';
import Person from '../models/Person.js';
import { getStorage } from '../services/storage/index.js';

export const uploadMemory = multer({ storage: multer.memoryStorage() });

function extFromFile(file) {
  const fromName = path.extname(file.originalname || '').replace('.', '').toLowerCase();
  const fromMime = (file.mimetype || '').split('/').pop() || '';
  return fromName || fromMime || '';
}

// ====================== PHOTO ======================
export async function uploadPersonPhoto(req, res, next) {
  try {
    const { personId } = req.params;

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
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

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
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

    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Persona no encontrada' });

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
