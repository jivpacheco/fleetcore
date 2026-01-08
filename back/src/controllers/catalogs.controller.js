// //v2 - 08012024
// // back/src/controllers/catalogs.controller.js
// // -----------------------------------------------------------------------------
// // Controlador de Catálogos genéricos (por `key`).
// // Permite listar, crear y eliminar registros de catálogos como VEHICLE_STATUSES.
// // Compatible con el modelo Catalog.js y rutas definidas en catalogs.routes.js
// // -----------------------------------------------------------------------------

// import Catalog from '../models/Catalog.js';

// // -----------------------------------------------------------------------------
// // 🔹 LISTAR → GET /api/v1/catalogs?key=VEHICLE_STATUSES
// // -----------------------------------------------------------------------------
// export async function list(req, res) {
//   try {
//     const { key, limit = 200, page = 1 } = req.query;

//     const filter = key ? { key: key.toUpperCase() } : {};
//     const skip = (Number(page) - 1) * Number(limit);

//     const total = await Catalog.countDocuments(filter);
//     const items = await Catalog.find(filter)
//       .sort({ order: 1, label: 1 })
//       .skip(skip)
//       .limit(Number(limit));

//     // No arrojar error si no hay registros
//     if (!items.length) {
//       return res.json({
//         message: 'Catálogo vacío',
//         key: key || null,
//         items: [],
//         total: 0,
//       });
//     }

//     res.json({ key, total, items });
//   } catch (err) {
//     console.error('[Catalogs.list] ❌', err);
//     res.status(500).json({ message: 'Error listando catálogos', error: err.message });
//   }
// }

// // -----------------------------------------------------------------------------
// // 🔹 CREAR → POST /api/v1/catalogs
// // Body esperado: { key, code?, label, order?, active? }
// // -----------------------------------------------------------------------------
// export async function create(req, res) {
//   try {
//     let { key, code = '', label, order = 0, active = true, meta = {} } = req.body;
//     if (!key || !label) {
//       return res.status(400).json({ message: 'Campos "key" y "label" son obligatorios' });
//     }

//     key = key.toUpperCase();
//     code = code?.trim()?.toUpperCase() || '';
//     label = label?.trim()?.toUpperCase();

//     // Validar duplicados
//     const exists = await Catalog.findOne({
//       key,
//       $or: [{ label }, ...(code ? [{ code }] : [])],
//     });

//     if (exists) {
//       return res.status(409).json({
//         message: `Ya existe un elemento con la misma etiqueta o código (${label || code})`,
//       });
//     }

//     // Crear y guardar
//     const item = await Catalog.create({
//       key,
//       code,
//       label,
//       order: Number(order) || 0,
//       active: Boolean(active),
//       meta,
//     });

//     res.status(201).json({ message: 'Elemento creado correctamente', item });
//   } catch (err) {
//     console.error('[Catalogs.create] ❌', err);
//     res.status(500).json({ message: 'Error creando catálogo', error: err.message });
//   }
// }

// // -----------------------------------------------------------------------------
// // 🔹 ELIMINAR → DELETE /api/v1/catalogs/:id
// // -----------------------------------------------------------------------------
// export async function remove(req, res) {
//   try {
//     const { id } = req.params;
//     const found = await Catalog.findById(id);
//     if (!found) {
//       return res.status(404).json({ message: 'Elemento no encontrado' });
//     }

//     await found.deleteOne();
//     res.json({ message: 'Elemento eliminado correctamente' });
//   } catch (err) {
//     console.error('[Catalogs.remove] ❌', err);
//     res.status(500).json({ message: 'Error eliminando elemento', error: err.message });
//   }
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
