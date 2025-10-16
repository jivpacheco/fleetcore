// import * as svc from '../services/catalogs.service.js'

// export async function getOne(req, res, next) {
//     try { res.json(await svc.getByKey(req.params.key)) }
//     catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'Catálogo no encontrado' }) : next(e) }
// }

// export async function addItem(req, res, next) {
//     try {
//         const { code, label, active } = req.body || {}
//         if (!code || !label) return res.status(400).json({ message: 'code y label son requeridos' })
//         const out = await svc.upsertItem(req.params.key, { code, label, active })
//         res.status(201).json(out)
//     } catch (e) { next(e) }
// }

// export async function patchItem(req, res, next) {
//     try {
//         const out = await svc.updateItem(req.params.key, req.params.itemId, req.body || {})
//         res.json(out)
//     } catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'Item no encontrado' }) : next(e) }
// }

// export async function removeItem(req, res, next) {
//     try {
//         const out = await svc.removeItem(req.params.key, req.params.itemId)
//         res.json(out)
//     } catch (e) { e.message === 'not_found' ? res.status(404).json({ message: 'Item no encontrado' }) : next(e) }
// }

// back/src/controllers/catalogs.controller.js
// -----------------------------------------------------------------------------
// Controlador de Catálogos (modelo plano: key, code, label, order, active)
// - list: nunca 404 si está vacío; devuelve { items: [] }.
// - create: crea item, evitando duplicados por (key+label) o (key+code).
// - remove: elimina por _id.
// -----------------------------------------------------------------------------

import Catalog from '../models/Catalog.js';

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// GET /api/v1/catalogs?key=VEHICLE_STATUSES&limit=200
export async function list(req, res) {
  const key = U(req.query.key || '');
  const limit = Math.min(parseInt(req.query.limit || '200', 10), 500);

  const filter = key ? { key } : {};
  const items = await Catalog.find(filter).sort({ order: 1, label: 1 }).limit(limit).lean();

  // Nunca 404 cuando no hay registros; devolvemos lista vacía
  return res.json({ items });
}

// POST /api/v1/catalogs
// body: { key, code?, label, order?, active? }
export async function create(req, res) {
  const payload = {
    key: U(req.body.key),
    code: U(req.body.code || ''),
    label: U(req.body.label),
    order: Number(req.body.order || 0),
    active: Boolean(req.body.active ?? true),
  };

  if (!payload.key || !payload.label) {
    return res.status(400).json({ message: 'key y label son obligatorios' });
  }

  // evitar duplicados: (key+label) y (key+code si viene)
  const dup = await Catalog.findOne({
    key: payload.key,
    $or: [{ label: payload.label }, ...(payload.code ? [{ code: payload.code }] : [])],
  }).lean();
  if (dup) return res.status(409).json({ message: 'Ya existe un ítem con el mismo código o nombre.' });

  const item = await Catalog.create(payload);
  res.status(201).json(item);
}

// DELETE /api/v1/catalogs/:id
export async function remove(req, res) {
  const { id } = req.params;
  const it = await Catalog.findByIdAndDelete(id).lean();
  if (!it) return res.status(404).json({ message: 'No encontrado' });
  res.json({ ok: true });
}
