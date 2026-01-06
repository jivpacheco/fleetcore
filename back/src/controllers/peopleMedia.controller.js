// import { v2 as cloudinary } from 'cloudinary';
// import multer from 'multer';
// import Person from '../models/Person.js';

// export const uploadMemory = multer({ storage: multer.memoryStorage() });

// const ensureCloudinary = () =>
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

// const uploadBuffer = (buffer, options = {}) => {
//   ensureCloudinary();
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
//       if (err) return reject(err);
//       resolve(result);
//     });
//     stream.end(buffer);
//   });
// };

// export const uploadPersonPhoto = async (req, res) => {
//   const { personId } = req.params;
//   const person = await Person.findById(personId);
//   if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
//   if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

//   const folder = `${process.env.CLOUDINARY_FOLDER || 'fleetcore'}/people/${personId}/photos`;
//   const result = await uploadBuffer(req.file.buffer, { folder, resource_type: 'image' });

//   person.photo = result.secure_url;
//   await person.save();
//   res.status(201).json({ url: person.photo });
// };

// export const uploadPersonDocument = async (req, res) => {
//   const { personId } = req.params;
//   const person = await Person.findById(personId);
//   if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
//   if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

//   const folder = `${process.env.CLOUDINARY_FOLDER || 'fleetcore'}/people/${personId}/documents`;
//   const result = await uploadBuffer(req.file.buffer, { folder, resource_type: 'raw' });

//   const { label='', category='GENERAL', bytes=0 } = req.body;
//   person.documents.push({
//     label: label || req.file.originalname,
//     url: result.secure_url,
//     format: (req.file.mimetype || '').split('/').pop() || '',
//     bytes: Number(bytes) || req.file.size || 0,
//     category,
//   });

//   await person.save();
//   res.status(201).json({ item: person });
// };

// export const deletePersonDocument = async (req, res) => {
//   const { personId, docId } = req.params;
//   const person = await Person.findById(personId);
//   if (!person) return res.status(404).json({ message: 'Persona no encontrada' });

//   const before = person.documents.length;
//   person.documents = person.documents.filter((d) => String(d._id) !== String(docId));
//   if (person.documents.length === before) return res.status(404).json({ message: 'Documento no encontrado' });

//   await person.save();
//   res.json({ ok: true });
// };

//v2

// // back/src/controllers/peopleMedia.controller.js
// import { v2 as cloudinary } from 'cloudinary';
// import multer from 'multer';
// import Person from '../models/Person.js';

// export const uploadMemory = multer({ storage: multer.memoryStorage() });

// let cloudinaryReady = false;
// function ensureCloudinary() {
//   if (cloudinaryReady) return;
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });
//   cloudinaryReady = true;
// }

// function uploadBuffer(buffer, options = {}) {
//   ensureCloudinary();
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
//       if (err) return reject(err);
//       resolve(result);
//     });
//     stream.end(buffer);
//   });
// }

// // POST /api/v1/people/:personId/media/photos
// export async function uploadPersonPhoto(req, res, next) {
//   try {
//     const { personId } = req.params;

//     const person = await Person.findById(personId);
//     if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
//     if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

//     const folder = `${process.env.CLOUDINARY_FOLDER || 'fleetcore'}/people/${personId}/photos`;

//     const result = await uploadBuffer(req.file.buffer, {
//       folder,
//       resource_type: 'image',
//     });

//     person.photo = {
//       url: result.secure_url,
//       format: result.format || (req.file.mimetype || '').split('/').pop() || '',
//       bytes: Number(result.bytes) || req.file.size || 0,
//       uploadedAt: new Date(),
//     };

//     if (req.user?.uid) person.updatedBy = req.user.uid;

//     await person.save();
//     return res.status(201).json({ item: person.photo });
//   } catch (err) {
//     next(err);
//   }
// }

// // POST /api/v1/people/:personId/media/documents
// export async function uploadPersonDocument(req, res, next) {
//   try {
//     const { personId } = req.params;

//     const person = await Person.findById(personId);
//     if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
//     if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

//     const folder = `${process.env.CLOUDINARY_FOLDER || 'fleetcore'}/people/${personId}/documents`;

//     const result = await uploadBuffer(req.file.buffer, {
//       folder,
//       resource_type: 'raw',
//     });

//     const label =
//       (typeof req.body?.label === 'string' && req.body.label.trim()) ||
//       req.file.originalname ||
//       'DOCUMENTO';

//     const doc = {
//       label,
//       url: result.secure_url,
//       format: result.format || (req.file.mimetype || '').split('/').pop() || '',
//       bytes: Number(result.bytes) || req.file.size || 0,
//       uploadedAt: new Date(),
//     };

//     person.documents.push(doc);

//     if (req.user?.uid) person.updatedBy = req.user.uid;

//     await person.save();
//     return res.status(201).json({ item: person.documents.at(-1) });
//   } catch (err) {
//     next(err);
//   }
// }

// // DELETE /api/v1/people/:personId/media/documents/:docId
// export async function deletePersonDocument(req, res, next) {
//   try {
//     const { personId, docId } = req.params;

//     const person = await Person.findById(personId);
//     if (!person) return res.status(404).json({ message: 'Persona no encontrada' });

//     const before = person.documents.length;
//     person.documents = person.documents.filter((d) => String(d._id) !== String(docId));

//     if (person.documents.length === before) {
//       return res.status(404).json({ message: 'Documento no encontrado' });
//     }

//     if (req.user?.uid) person.updatedBy = req.user.uid;

//     await person.save();
//     return res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// }

// back/src/controllers/peopleMedia.controller.js
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import Person from '../models/Person.js';
import path from 'path';

export const uploadMemory = multer({ storage: multer.memoryStorage() });

let cloudinaryReady = false;
function ensureCloudinary() {
  if (cloudinaryReady) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  cloudinaryReady = true;
}

function uploadBuffer(buffer, options = {}) {
  ensureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// ====================== PHOTO ======================
export async function uploadPersonPhoto(req, res, next) {
  try {
    const { personId } = req.params;
    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

    const folder = `${process.env.CLOUDINARY_FOLDER || 'fleetcore'}/people/${personId}/photo`;

    const result = await uploadBuffer(req.file.buffer, {
      folder,
      resource_type: 'image',
    });

    // Si había foto previa, la borramos
    if (person.photo?.publicId) {
      // await cloudinary.uploader.destroy(person.photo.publicId);
      await cloudinary.uploader.destroy(person.photo.publicId, { resource_type: 'image' });
      
    }

    person.photo = {
      url: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      uploadedAt: new Date(),
      publicId: result.public_id,
    };

    person.updatedBy = req.user?.uid;
    await person.save();

    res.status(201).json({ item: person.photo });
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

    const folder = `${process.env.CLOUDINARY_FOLDER || 'fleetcore'}/people/${personId}/documents`;

    const result = await uploadBuffer(req.file.buffer, {
      folder,
      resource_type: 'raw',
    });

    const extFromName = path.extname(req.file.originalname || '').replace('.', '').toLowerCase();
    const extFromMime = (req.file.mimetype || '').split('/').pop() || '';
    
    const doc = {
      label: req.body?.label?.trim() || req.file.originalname,
      url: result.secure_url,
      // format: result.format,
      format: result.format || extFromName || extFromMime || '',
      bytes: result.bytes,
      uploadedAt: new Date(),
      publicId: result.public_id,
    };

    person.documents.push(doc);
    person.updatedBy = req.user?.uid;
    await person.save();

    res.status(201).json({ item: doc });
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

    if (doc.publicId) {
      await cloudinary.uploader.destroy(doc.publicId, { resource_type: 'raw' });
    }

    doc.deleteOne();
    person.updatedBy = req.user?.uid;
    await person.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
