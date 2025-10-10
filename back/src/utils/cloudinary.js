// back/src/utils/cloudinary.js
// -----------------------------------------------------------------------------
// Servicio Cloudinary centralizado:
//  - Configura SDK desde .env
//  - Valida tipo y tamaño por categoría (imagen/pdf/video)
//  - Sube a carpeta virtual por vehículo y categoría
//  - Borra por publicId, intentando image/raw/video
// -----------------------------------------------------------------------------
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import fs from 'fs/promises'

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_FOLDER = 'fleetcore/vehicles',

  // Límites específicos por tipo
  MAX_UPLOAD_MB_IMAGE = '20',
  MAX_UPLOAD_MB_DOC   = '20',
  MAX_UPLOAD_MB_VIDEO = '150',
} = process.env

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn('[cloudinary] Faltan variables de entorno — revisa .env')
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

// Tipos permitidos
export const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'video/mp4', 'video/quicktime', 'video/webm',
])

function classify(mime = '') {
  if (mime.startsWith('video/')) return 'video'
  if (mime === 'application/pdf') return 'doc'
  if (mime.startsWith('image/')) return 'photo'
  return 'unknown'
}

/**
 * Valida tipo y tamaño acorde al mimetype.
 * Arroja error con mensaje claro si no cumple.
 */
export function validateFile({ mimetype, size }) {
  if (!ALLOWED_MIME.has(mimetype)) {
    throw new Error('Tipo no permitido. Usa JPG, PNG, WEBP, PDF o MP4/WEBM/MOV.')
  }
  const kind = classify(mimetype)
  const limitMb =
    kind === 'video' ? Number(MAX_UPLOAD_MB_VIDEO) :
    kind === 'doc'   ? Number(MAX_UPLOAD_MB_DOC)   :
                       Number(MAX_UPLOAD_MB_IMAGE)

  if (size > limitMb * 1024 * 1024) {
    throw new Error(`Archivo supera ${limitMb}MB permitidos para ${kind}.`)
  }
}

/**
 * Sube archivo a Cloudinary.
 * @param {object} opts
 * @param {string} opts.tmpPath - ruta temporal (multer)
 * @param {string} opts.mimetype - mimetype detectado por multer
 * @param {string} opts.vehicleId - para generar prefijo de carpeta
 * @param {string} [opts.category='photos'] - subcarpeta: photos|legal|manuals|parts|videos
 * @returns {Promise<{url, publicId, bytes, format, kind, width?, height?}>}
 */
export async function uploadVehicleFile({ tmpPath, mimetype, vehicleId, category = 'photos' }) {
  const folder = path.posix.join(CLOUDINARY_UPLOAD_FOLDER, String(vehicleId), String(category))
  const kind = classify(mimetype)
  const isImage = kind === 'photo'

  const options = {
    folder,
    resource_type: 'auto', // autodetecta image/raw/video
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    // Transformaciones solo para imágenes (optimización + remover EXIF)
    transformation: isImage
      ? [{ quality: 'auto', fetch_format: 'auto', flags: 'strip_profile' }]
      : undefined,
    // (opcional) preprocesado de video:
    // eager: kind === 'video' ? [{ width: 720, crop: 'limit', format: 'mp4' }] : undefined,
  }

  try {
    const res = await cloudinary.uploader.upload(tmpPath, options)
    return {
      url: res.secure_url,
      publicId: res.public_id,
      bytes: res.bytes,
      format: res.format,
      kind, // 'photo' | 'doc' | 'video'
      width: res.width,
      height: res.height,
    }
  } finally {
    // Limpieza del archivo temporal
    try { await fs.unlink(tmpPath) } catch {}
  }
}

/** Borra un asset por publicId intentando image → raw → video. */
export async function deleteByPublicId(publicId) {
  if (!publicId) return { result: 'not-found' }

  // Como imagen
  const asImage = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  if (asImage.result !== 'not found') return asImage

  // Como "raw" (PDF u otros)
  const asRaw = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
  if (asRaw.result !== 'not found') return asRaw

  // Como video
  return cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
}
