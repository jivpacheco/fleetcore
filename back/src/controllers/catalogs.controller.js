// // back/src/controllers/catalogs.controller.js
// // -----------------------------------------------------------------------------
// // Controlador de Catálogos (modelo plano: key, code, label, order, active)
// // - list: nunca 404 si está vacío; devuelve { items: [] }.
// // - create: crea item, evitando duplicados por (key+label) o (key+code).
// // - remove: elimina por _id.
// // -----------------------------------------------------------------------------

// import Catalog from '../models/Catalog.js';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// // GET /api/v1/catalogs?key=VEHICLE_STATUSES&limit=200
// export async function list(req, res) {
//   const key = U(req.query.key || '');
//   const limit = Math.min(parseInt(req.query.limit || '200', 10), 500);

//   const filter = key ? { key } : {};
//   const items = await Catalog.find(filter).sort({ order: 1, label: 1 }).limit(limit).lean();

//   // Nunca 404 cuando no hay registros; devolvemos lista vacía
//   return res.json({ items });
// }

// // POST /api/v1/catalogs
// // body: { key, code?, label, order?, active? }
// export async function create(req, res) {
//   const payload = {
//     key: U(req.body.key),
//     code: U(req.body.code || ''),
//     label: U(req.body.label),
//     order: Number(req.body.order || 0),
//     active: Boolean(req.body.active ?? true),
//   };

//   if (!payload.key || !payload.label) {
//     return res.status(400).json({ message: 'key y label son obligatorios' });
//   }

//   // evitar duplicados: (key+label) y (key+code si viene)
//   const dup = await Catalog.findOne({
//     key: payload.key,
//     $or: [{ label: payload.label }, ...(payload.code ? [{ code: payload.code }] : [])],
//   }).lean();
//   if (dup) return res.status(409).json({ message: 'Ya existe un ítem con el mismo código o nombre.' });

//   const item = await Catalog.create(payload);
//   res.status(201).json(item);
// }

// // DELETE /api/v1/catalogs/:id
// export async function remove(req, res) {
//   const { id } = req.params;
//   const it = await Catalog.findByIdAndDelete(id).lean();
//   if (!it) return res.status(404).json({ message: 'No encontrado' });
//   res.json({ ok: true });
// }

// back/src/controllers/catalogs.controller.js
// -----------------------------------------------------------------------------
// Controlador de Catálogos genéricos (por `key`).
// Permite listar, crear y eliminar registros de catálogos como VEHICLE_STATUSES.
// Compatible con el modelo Catalog.js y rutas definidas en catalogs.routes.js
// -----------------------------------------------------------------------------

import Catalog from '../models/Catalog.js';

// -----------------------------------------------------------------------------
// 🔹 LISTAR → GET /api/v1/catalogs?key=VEHICLE_STATUSES
// -----------------------------------------------------------------------------
export async function list(req, res) {
  try {
    const { key, limit = 200, page = 1 } = req.query;

    const filter = key ? { key: key.toUpperCase() } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Catalog.countDocuments(filter);
    const items = await Catalog.find(filter)
      .sort({ order: 1, label: 1 })
      .skip(skip)
      .limit(Number(limit));

    // No arrojar error si no hay registros
    if (!items.length) {
      return res.json({
        message: 'Catálogo vacío',
        key: key || null,
        items: [],
        total: 0,
      });
    }

    res.json({ key, total, items });
  } catch (err) {
    console.error('[Catalogs.list] ❌', err);
    res.status(500).json({ message: 'Error listando catálogos', error: err.message });
  }
}

// -----------------------------------------------------------------------------
// 🔹 CREAR → POST /api/v1/catalogs
// Body esperado: { key, code?, label, order?, active? }
// -----------------------------------------------------------------------------
export async function create(req, res) {
  try {
    let { key, code = '', label, order = 0, active = true, meta = {} } = req.body;
    if (!key || !label) {
      return res.status(400).json({ message: 'Campos "key" y "label" son obligatorios' });
    }

    key = key.toUpperCase();
    code = code?.trim()?.toUpperCase() || '';
    label = label?.trim()?.toUpperCase();

    // Validar duplicados
    const exists = await Catalog.findOne({
      key,
      $or: [{ label }, ...(code ? [{ code }] : [])],
    });

    if (exists) {
      return res.status(409).json({
        message: `Ya existe un elemento con la misma etiqueta o código (${label || code})`,
      });
    }

    // Crear y guardar
    const item = await Catalog.create({
      key,
      code,
      label,
      order: Number(order) || 0,
      active: Boolean(active),
      meta,
    });

    res.status(201).json({ message: 'Elemento creado correctamente', item });
  } catch (err) {
    console.error('[Catalogs.create] ❌', err);
    res.status(500).json({ message: 'Error creando catálogo', error: err.message });
  }
}

// -----------------------------------------------------------------------------
// 🔹 ELIMINAR → DELETE /api/v1/catalogs/:id
// -----------------------------------------------------------------------------
export async function remove(req, res) {
  try {
    const { id } = req.params;
    const found = await Catalog.findById(id);
    if (!found) {
      return res.status(404).json({ message: 'Elemento no encontrado' });
    }

    await found.deleteOne();
    res.json({ message: 'Elemento eliminado correctamente' });
  } catch (err) {
    console.error('[Catalogs.remove] ❌', err);
    res.status(500).json({ message: 'Error eliminando elemento', error: err.message });
  }
}
