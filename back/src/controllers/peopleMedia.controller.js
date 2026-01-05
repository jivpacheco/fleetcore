import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import Person from '../models/Person.js';

export const uploadMemory = multer({ storage: multer.memoryStorage() });

const ensureCloudinary = () =>
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

const uploadBuffer = (buffer, options = {}) => {
  ensureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};

export const uploadPersonPhoto = async (req, res) => {
  const { personId } = req.params;
  const person = await Person.findById(personId);
  if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
  if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

  const folder = `${process.env.CLOUDINARY_FOLDER || 'fleetcore'}/people/${personId}/photos`;
  const result = await uploadBuffer(req.file.buffer, { folder, resource_type: 'image' });

  person.photo = result.secure_url;
  await person.save();
  res.status(201).json({ url: person.photo });
};

export const uploadPersonDocument = async (req, res) => {
  const { personId } = req.params;
  const person = await Person.findById(personId);
  if (!person) return res.status(404).json({ message: 'Persona no encontrada' });
  if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

  const folder = `${process.env.CLOUDINARY_FOLDER || 'fleetcore'}/people/${personId}/documents`;
  const result = await uploadBuffer(req.file.buffer, { folder, resource_type: 'raw' });

  const { label='', category='GENERAL', bytes=0 } = req.body;
  person.documents.push({
    label: label || req.file.originalname,
    url: result.secure_url,
    format: (req.file.mimetype || '').split('/').pop() || '',
    bytes: Number(bytes) || req.file.size || 0,
    category,
  });

  await person.save();
  res.status(201).json({ item: person });
};

export const deletePersonDocument = async (req, res) => {
  const { personId, docId } = req.params;
  const person = await Person.findById(personId);
  if (!person) return res.status(404).json({ message: 'Persona no encontrada' });

  const before = person.documents.length;
  person.documents = person.documents.filter((d) => String(d._id) !== String(docId));
  if (person.documents.length === before) return res.status(404).json({ message: 'Documento no encontrado' });

  await person.save();
  res.json({ ok: true });
};
