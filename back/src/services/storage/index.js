// back/src/services/storage/index.js
import cloudinaryProvider from './providers/cloudinary.js';

// Futuro:
// import s3Provider from './providers/s3.js';
// import gcsProvider from './providers/gcs.js';

const PROVIDERS = {
  cloudinary: cloudinaryProvider,
  // s3: s3Provider,
  // gcs: gcsProvider,
};

export function getStorage() {
  const name = (process.env.STORAGE_PROVIDER || 'cloudinary').toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(`STORAGE_PROVIDER inválido: "${name}"`);
  }
  return provider;
}
