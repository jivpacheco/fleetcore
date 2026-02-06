// back/templates/resource.media.controller.template.js
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Media controller template
// - Usa getStorage() para ser migrable (Cloudinary/AWS/Drive/etc.)
// - Mantiene contrato en BD:
//    photo: MediaFile | null
//    documents: MediaFile[]
// -----------------------------------------------------------------------------
import multer from "multer";
import { getStorage } from "../services/storage/index.js";
// import Model from "../models/<Resource>.js";

export const uploadMemory = multer({ storage: multer.memoryStorage() });

export async function uploadPhoto(req, res, next) {
  try {
    const { id } = req.params;
    const storage = getStorage();

    // const entity = await Model.findById(id);
    // if (!entity) return res.status(404).json({ message: "No encontrado" });

    const result = await storage.upload({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      folder: "<resource>/photo",
      mime: req.file.mimetype,
    });

    // entity.photo = result; await entity.save();
    return res.json({ ok: true, photo: result });
  } catch (e) {
    next(e);
  }
}

export async function uploadDocument(req, res, next) {
  try {
    const { id } = req.params;
    const storage = getStorage();

    const result = await storage.upload({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      folder: "<resource>/documents",
      mime: req.file.mimetype,
    });

    // entity.documents.push(result); await entity.save();
    return res.json({ ok: true, document: result });
  } catch (e) {
    next(e);
  }
}
