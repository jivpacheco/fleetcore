// // back/src/middleware/upload.middleware.js
// // -----------------------------------------------------------------------------
// // Middleware de subida (multer) con límites por tipo de archivo.
// // - Acepta: imágenes (jpg/png/webp), PDF y videos (mp4/webm/mov).
// // - Define un límite superior global (video) y valida estrictamente por tipo
// //   en el servicio Cloudinary (para error claro y seguro).
// // -----------------------------------------------------------------------------
// import multer from 'multer'
// import path from 'path'

// // Límites por tipo desde .env (con valores por defecto)
// const LIMIT_IMAGE = Number(process.env.MAX_UPLOAD_MB_IMAGE || '20')  * 1024 * 1024
// const LIMIT_DOC   = Number(process.env.MAX_UPLOAD_MB_DOC   || '20')  * 1024 * 1024
// const LIMIT_VIDEO = Number(process.env.MAX_UPLOAD_MB_VIDEO || '150') * 1024 * 1024

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, '/tmp'),
//   filename: (_req, file, cb) => {
//     const ext = path.extname(file.originalname) || ''
//     cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
//   },
// })

// /**
//  * Filtro de tipos permitidos en la etapa de multer.
//  * NOTA: La validación de tamaño fino se hace luego en el servicio Cloudinary
//  * según el tipo. Aquí solo permitimos los mimetypes válidos.
//  */
// function fileFilter(_req, file, cb) {
//   const allowed = [
//     'image/jpeg', 'image/png', 'image/webp',
//     'application/pdf',
//     'video/mp4', 'video/quicktime', 'video/webm',
//   ]
//   if (allowed.includes(file.mimetype)) return cb(null, true)
//   cb(new Error('Tipo no permitido'))
// }

// /**
//  * uploadSingle: sube un único archivo bajo el campo "file".
//  * - Usamos un límite "superior" igual al de video para que ningún archivo
//  *   exceda el máximo absoluto (150MB por defecto).
//  * - La validación específica por tipo y mensaje claro se realiza en
//  *   utils/cloudinary.validateFile().
//  */
// export const uploadSingle = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: LIMIT_VIDEO }, // límite absoluto (video)
// }).single('file')

// // Exportamos también los límites por si se requieren en otros módulos (opcional)
// export const UPLOAD_LIMITS = { LIMIT_IMAGE, LIMIT_DOC, LIMIT_VIDEO }

// back/src/middleware/upload.middleware.js
// -----------------------------------------------------------------------------
// Middleware de subida de archivos con integración directa a Cloudinary.
// - Usa multer + multer-storage-cloudinary para evitar guardado local (/tmp).
// - Valida tipos de archivo (imagen, documento PDF, video).
// - Aplica límites de tamaño por tipo desde .env.
// - Compatible con cloudinary.js (export default cloudinary).
// -----------------------------------------------------------------------------

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js'; // <- Importa la instancia configurada
import path from 'path';

// -----------------------------------------------------------------------------
// Límites configurables (en MB)
// -----------------------------------------------------------------------------
const LIMIT_IMAGE = Number(process.env.MAX_UPLOAD_MB_IMAGE || '20') * 1024 * 1024;
const LIMIT_DOC = Number(process.env.MAX_UPLOAD_MB_DOC || '20') * 1024 * 1024;
const LIMIT_VIDEO = Number(process.env.MAX_UPLOAD_MB_VIDEO || '150') * 1024 * 1024;

// -----------------------------------------------------------------------------
// Filtro de archivos permitidos
// -----------------------------------------------------------------------------
function fileFilter(_req, file, cb) {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
}

// -----------------------------------------------------------------------------
// Configuración de almacenamiento Cloudinary
// -----------------------------------------------------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
    const ext = path.extname(file.originalname).replace('.', '') || 'file';
    const resourceType = file.mimetype.startsWith('image')
      ? 'image'
      : file.mimetype.startsWith('video')
      ? 'video'
      : 'raw'; // para PDF u otros archivos

    return {
      folder,
      resource_type: resourceType,
      format: ext,
      public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };
  },
});

// -----------------------------------------------------------------------------
// Configuración principal de multer
// -----------------------------------------------------------------------------
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: LIMIT_VIDEO }, // límite global
}).single('file');

// -----------------------------------------------------------------------------
// Exportar límites por si se necesitan en validaciones adicionales
// -----------------------------------------------------------------------------
export const UPLOAD_LIMITS = {
  LIMIT_IMAGE,
  LIMIT_DOC,
  LIMIT_VIDEO,
};

// -----------------------------------------------------------------------------
// Ejemplo de uso en rutas:
//
// import { uploadSingle } from '../middleware/upload.middleware.js'
// router.post('/:id/photos', requirePermission('vehicles.media'), uploadSingle, ctrl.addVehiclePhoto)
// -----------------------------------------------------------------------------
