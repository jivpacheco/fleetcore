// // back/src/services/storage/providers/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

let ready = false;
function ensure() {
  if (ready) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  ready = true;
}

function uploadStream(buffer, options = {}) {
  ensure();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

export default {
  name: 'cloudinary',

  async uploadImage({ buffer, folder }) {
    const result = await uploadStream(buffer, { folder, resource_type: 'image' });
    return {
      provider: 'cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes || 0,
      format: result.format || '',
    };
  },

  async uploadFile({ buffer, folder }) {
    const result = await uploadStream(buffer, { folder, resource_type: 'raw' });
    return {
      provider: 'cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes || 0,
      format: result.format || '',
    };
  },

  async delete({ publicId, resourceType = 'raw' }) {
    if (!publicId) return;
    ensure();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  },
};
