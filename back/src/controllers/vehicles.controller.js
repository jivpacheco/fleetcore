
// back/src/controllers/vehicles.controller.js
// -----------------------------------------------------------------------------
// Controlador de Vehículos
// - list(): soporta q y branch; busca también por support.originalInternalCode;
//           ordena (en memoria) por compañía (branch.code) y luego internalCode.
// - CRUD: create/update/remove con auditoría. update evita "circular structure"
//         registrando snapshots planos (before/after) sólo de campos tocados.
// - transfer(): compat de traspaso simple.
// - support: startSupport / finishSupport con trazas detalladas para auditoría.
// - media: add/delete (photos/documents) tolerante a multer y cloudinary.
// - auditoría paginada.
// -----------------------------------------------------------------------------

import Vehicle from '../models/Vehicle.js';
import cloud from '../utils/cloudinary.js';
import { humanizeDuration, humanizeMs } from '../utils/time.js';

// ----------------------------- Helpers ---------------------------------------
const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);
const isHttpUrl = (p = '') => /^https?:\/\//i.test(p);
const isVideoFormat = (fmt = '', mt = '') => {
  const f = (fmt || '').toLowerCase();
  const m = (mt || '').toLowerCase();
  return f === 'mp4' || f === 'mov' || f === 'webm' || m.startsWith('video/');
};
const isPdf = (fmt = '', mt = '') =>
  (fmt || '').toLowerCase() === 'pdf' || (mt || '').toLowerCase() === 'application/pdf';

const safeClone = (obj) => JSON.parse(JSON.stringify(obj ?? {}));

function pickChanged(base, next) {
  // Devuelve un objeto "base" reducido a las claves cambiadas en "next".
  const out = {};
  if (!base || !next) return out;
  for (const k of Object.keys(next)) {
    if (next[k] && typeof next[k] === 'object' && !Array.isArray(next[k])) {
      out[k] = {};
      for (const s of Object.keys(next[k])) out[k][s] = base?.[k]?.[s];
    } else {
      out[k] = base?.[k];
    }
  }
  return out;
}

function nextSeq(arr, category) {
  const list = (arr || []).filter((it) => it.category === U(category));
  return (list.length + 1).toString().padStart(5, '0'); // 00001
}

function auditPush(doc, action, data, by) {
  doc.audit.push({
    action: U(action),
    by: by || undefined,
    at: new Date(),
    data: data || {},
  });
}

// ====================== LISTADO ======================
export async function list(req, res) {
  const { page = 1, limit = 10, q = '', branch } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const filter = {};
  if (q) {
    filter.$or = [
      { plate: new RegExp(q, 'i') },
      { internalCode: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { model: new RegExp(q, 'i') },
      // permite hallar S-1R buscando RX-15 (sigla original)
      { 'support.originalInternalCode': new RegExp(q, 'i') },
    ];
  }
  if (branch) filter.branch = branch;

  const [rawItems, total] = await Promise.all([
    Vehicle.find(filter).populate('branch', 'code name').skip((p - 1) * l).limit(l).lean(),
    Vehicle.countDocuments(filter),
  ]);

  // Orden en memoria: compañía (branch.code) → internalCode
  const items = (rawItems || []).slice().sort((a, b) => {
    const aComp = (a.branch?.code || '').toString();
    const bComp = (b.branch?.code || '').toString();
    if (aComp !== bComp) return aComp.localeCompare(bComp, 'es', { numeric: true });
    return (a.internalCode || '').localeCompare(b.internalCode || '', 'es', { numeric: true });
  });

  res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
}


// ============== VALIDADOR DE FECHAS ===============

// Normaliza cualquier fecha: acepta Date, 'YYYY-MM-DD', ISO o '' -> null
function normDate(v) {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return isNaN(v) ? null : v;

  const s = String(v).trim();

  // YYYY-MM-DD anclado a 00:00Z
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00.000Z`);
    return isNaN(d) ? null : d;
  }

  // ISO/otras variantes parseables
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

// Asegura estructura y convierte TODAS las fechas legales a Date|null
function normalizeLegalDates(body = {}) {
  body.legal ??= {};
  body.legal.padron ??= {};
  body.legal.soap ??= {};
  body.legal.insurance ??= {};
  body.legal.technicalReview ??= {};
  body.legal.circulationPermit ??= {};
  body.legal.fuelCard ??= {};

  // PADRÓN
  body.legal.padron.acquisitionDate = normDate(body.legal.padron.acquisitionDate);
  body.legal.padron.inscriptionDate = normDate(body.legal.padron.inscriptionDate);
  body.legal.padron.issueDate = normDate(body.legal.padron.issueDate);

  // SOAP
  body.legal.soap.validFrom = normDate(body.legal.soap.validFrom);
  body.legal.soap.validTo = normDate(body.legal.soap.validTo);

  // SEGURO
  body.legal.insurance.validFrom = normDate(body.legal.insurance.validFrom);
  body.legal.insurance.validTo = normDate(body.legal.insurance.validTo);

  // REVISIÓN TÉCNICA
  body.legal.technicalReview.reviewedAt = normDate(body.legal.technicalReview.reviewedAt);
  body.legal.technicalReview.validTo = normDate(body.legal.technicalReview.validTo);

  // PERMISO DE CIRCULACIÓN
  body.legal.circulationPermit.reviewedAt = normDate(body.legal.circulationPermit.reviewedAt);
  body.legal.circulationPermit.validTo = normDate(body.legal.circulationPermit.validTo);

  // TARJETA DE COMBUSTIBLE
  body.legal.fuelCard.validTo = normDate(body.legal.fuelCard.validTo);

  return body;
}


// ====================== CRUD ======================
export async function create(req, res) {
  const payload = req.body || {};
  if (!payload.status) payload.status = 'ACTIVE';
  const v = await Vehicle.create(payload);
  auditPush(v, 'CREATE', { payload: safeClone(payload) }, req.user?.email || req.user?.id);
  await v.save();
  res.status(201).json(v);
}

export async function getOne(req, res) {
  const v = await Vehicle.findById(req.params.id).lean();
  if (!v) return res.status(404).json({ message: 'No encontrado' });
  res.json(v);
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const changes = req.body || {};

    /// Adicion ///

    // ⬇️ Normalizar fechas para evitar "{}" en campos Date
    normalizeLegalDates(changes);


    const before = await Vehicle.findById(id).lean();
    if (!before) return res.status(404).json({ message: 'No encontrado' });

    // const after = await Vehicle.findByIdAndUpdate(id, changes, { new: true }).lean();
    const after = await Vehicle.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).lean();


    // Snapshot plano de sólo las claves cambiadas (evita "circular structure")
    const vDoc = await Vehicle.findById(id); // doc vivo para push en audit
    vDoc.audit.push({
      action: 'UPDATE',
      by: req.user?.email || req.user?.id,
      at: new Date(),
      data: {
        before: safeClone(pickChanged(before, changes)),
        after: safeClone(pickChanged(after, changes)),
      },
    });
    await vDoc.save();

    res.json(after);
  } catch (err) {
    console.error('[vehicles.update] 400', err);
    const pathMsg = /Cast to date failed.*path "(.*?)"/i.exec(err?.message || '');
    const field = pathMsg?.[1];
    return res
      .status(400)
      .json({ message: field ? `Formato inválido para el campo ${field}` : 'Datos inválidos' });
  }
}

export async function remove(req, res) {
  const v = await Vehicle.findById(req.params.id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

// ====================== TRANSFER (simple, compat) ======================
export async function transfer(req, res) {
  const { id } = req.params;
  const { reason = 'TRASPASO', toBranch, replaceVehicleId, note } = req.body || {};

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  const fromBranch = v.branch;
  let newInternal = v.internalCode;

  if (U(reason) === 'APOYO' && replaceVehicleId) {
    newInternal = `${v.internalCode}R`;
  }

  v.branch = toBranch || v.branch;
  v.internalCode = newInternal;
  v.assignments.push({
    branch: toBranch || v.branch,
    codeInternal: v.internalCode,
    reason: U(reason),
    fromBranch,
    toBranch,
    note: U(note),
    startAt: new Date(),
  });

  auditPush(
    v,
    'TRANSFER',
    { reason, toBranch, replaceVehicleId, note, fromBranch, newInternalCode: newInternal },
    req.user?.email || req.user?.id
  );
  await v.save();
  res.json(v.toObject());
}

// ====================== APOYO (start/finish) ======================
// export async function startSupport(req, res) {
//   // Espera body: { targetBranch, targetVehicle }  (nombres exactos)
//   const { id } = req.params;
//   const { targetBranch, targetVehicle } = req.body || {};

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'Vehículo origen no encontrado' });

//   if (!targetBranch || !targetVehicle) {
//     return res.status(400).json({ message: 'Sucursal y vehículo objetivo son requeridos' });
//   }
//   if (String(targetVehicle) === String(id)) {
//     return res.status(400).json({ message: 'Un vehículo no puede reemplazarse a sí mismo' });
//   }
//   if (v.support?.active) {
//     return res.status(400).json({ message: 'Este vehículo ya está en reemplazo activo' });
//   }

//   const target = await Vehicle.findById(targetVehicle);
//   if (!target) return res.status(404).json({ message: 'Vehículo a reemplazar no encontrado' });
//   if (target.support?.active) {
//     return res.status(400).json({ message: 'No se puede reemplazar un vehículo que ya está en reemplazo' });
//   }

//   // Estado objetivo OUT_OF_SERVICE (si no lo está)
//   if ((target.status || '').toUpperCase() !== 'OUT_OF_SERVICE') {
//     target.status = 'OUT_OF_SERVICE';
//   }

//     // El actual toma sigla target + 'R'
//   const originalInternal = v.internalCode;
//   const replacement = `${target.internalCode}R`;

//   // Inicializa soporte en v
//   v.support = {
//     active: true,
//     targetBranch,
//     targetVehicle,
//     replacementCode: replacement,
//     originalInternalCode: originalInternal,
//     startedAt: new Date(),
//     endedAt: null,
//     totalMsServed: v.support?.totalMsServed || 0,
//   };

//   // Marcar estados v.internalCode = replacement;
//   v.internalCode = originalInternal;
//   v.status = 'SUPPORT';

//   // Guarda quién lo dejó así (para restaurar solo si corresponde a este apoyo)
//   target.supportReplacedBy = v._id;
//   target.supportReplacedAt = v.support.startedAt;


//   auditPush(v, 'SUPPORT_START', {
//     detail: `${originalInternal} → ${replacement}`,
//     targetVehicle,
//     targetBranch,
//   }, req.user?.email || req.user?.id);

//   await target.save();
//   await v.save();

//   res.json(v.toObject());
// }


export async function startSupport(req, res) {
  // Body esperado: { targetBranch, targetVehicle }
  const { id } = req.params; // vehículo que presta apoyo
  const { targetBranch, targetVehicle } = req.body || {};

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'Vehículo origen no encontrado' });

  if (!targetBranch || !targetVehicle) {
    return res.status(400).json({ message: 'Sucursal y vehículo objetivo son requeridos' });
  }
  if (String(targetVehicle) === String(id)) {
    return res.status(400).json({ message: 'Un vehículo no puede reemplazarse a sí mismo' });
  }
  if (v.support?.active) {
    return res.status(400).json({ message: 'Este vehículo ya está en reemplazo activo' });
  }

  const target = await Vehicle.findById(targetVehicle);
  if (!target) return res.status(404).json({ message: 'Vehículo a reemplazar no encontrado' });
  if (target.support?.active) {
    return res.status(400).json({ message: 'No se puede reemplazar un vehículo que ya está en reemplazo' });
  }

  // Datos del tramo
  const startedAt = new Date();
  const originalInternal = v.internalCode;
  const replacement = `${target.internalCode}R`;

  // Bloque support del apoyador
  v.support = {
    active: true,
    targetBranch,
    targetVehicle: target._id,
    replacementCode: replacement,
    originalInternalCode: originalInternal,
    startedAt,
    endedAt: null,
    totalMsServed: typeof v.support?.totalMsServed === 'number' ? v.support.totalMsServed : 0,
  };

  // Estados
  v.internalCode = originalInternal;   // no se cambia por apoyo
  v.status = 'SUPPORT';                // usa el código que tengas en catálogo

  // // Reemplazado: fuera de servicio + trazabilidad para restaurar al finalizar
  // target.status = 'OUT_OF_SERVICE';
  // target.supportReplacedBy = v._id;
  // target.supportReplacedAt = startedAt;

  // Reemplazado: NO tocar status; solo metadatos de relación
  target.supportReplacedBy = v._id;
  target.supportReplacedAt = startedAt;


  // Guardar primero target (depende del startedAt), luego v
  await target.save();
  await v.save();

  // Auditoría
  auditPush(
    v,
    'INICIO_REEMPLAZO',
    {
      detail: `${originalInternal} → ${replacement}`,
      targetVehicle: target._id,
      targetBranch,
      startedAt,
    },
    req.user?.email || req.user?.id
  );

  await v.save();

  // Devolver ambos actualizados para que el front sincronice lista/consulta
  return res.json({
    vehicle: v.toObject(),
    target: target.toObject(),
  });
}


// export async function finishSupport(req, res) {
//   const { id } = req.params;

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'Vehículo no encontrado' });
//   if (!v.support?.active) {
//     return res.status(400).json({ message: 'Este vehículo no está en apoyo activo' });
//   }

//   const { targetVehicle, originalInternalCode, replacementCode } = v.support || {};
//   const fromCode = replacementCode || v.internalCode;
//   const toCode = originalInternalCode || v.internalCode;

//   // ========= NUEVO: cálculo de tramo y acumulado =========
//   const now = new Date();
//   // const from = v.support?.from || v.support?.startedAt || v.support?.beganAt || v.support?.initAt || null;
//   const from = v.support?.startedAt || v.support?.from || null;

//   // ms del tramo actual (si no hay 'from', consideramos 0)
//   const tramoMs = from ? Math.max(0, now - new Date(from)) : 0;

//   // acumular total en support.totalMsServed (si el campo no existe, lo iniciamos)
//   // if (typeof v.support.totalMsServed !== 'number') v.support.totalMsServed = 0;
//   // v.support.totalMsServed += tramoMs;
//   if (!v.support) v.support = {};
//   if (typeof v.support.totalMsServed !== 'number') v.support.totalMsServed = 0;
//   v.support.totalMsServed += tramoMs;


//   const tramoHuman = humanizeDuration(from || now, now);
//   const totalHuman = humanizeMs(v.support.totalMsServed);
//   // ========= FIN NUEVO =========

//   // Restaurar sigla/status del que apoya
//   if (originalInternalCode) v.internalCode = originalInternalCode;
//   v.status = 'ACTIVE';
//   v.support.active = false;
//   // v.support.endedAt = new Date();
//   v.support.endedAt = now;

//   // 🔁 Restaurar el objetivo si este apoyo lo dejó OUT_OF_SERVICE
//   if (targetVehicle) {
//     const target = await Vehicle.findById(targetVehicle);
//     if (target && String(target.supportReplacedBy) === String(v._id)) {
//       target.status = 'ACTIVE';
//       target.supportReplacedBy = undefined;
//       target.supportReplacedAt = undefined;
//       await target.save();
//     }
//   }

//   auditPush(v, 'SUPPORT_FINISH', {
//     // detail: `${fromCode} → ${toCode}`,
//     // detail: `${fromCode} → ${toCode} — tramo=${tramoHuman}, total=${totalHuman}`,  
//     detail: `${fromCode} → ${toCode} — Tiempo Total: ${tramoHuman}`,
//     targetVehicle,
//     endedAt: v.support.endedAt,
//   }, req.user?.email || req.user?.id);

//   await v.save();
//   res.json(v.toObject());
// }


export async function finishSupport(req, res) {
  const { id } = req.params; // vehículo que estaba prestando apoyo

  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ message: 'Vehículo no encontrado' });
  if (!v.support?.active) {
    return res.status(400).json({ message: 'Este vehículo no está en apoyo activo' });
  }

  const now = new Date();
  const startedAt = v.support?.startedAt ? new Date(v.support.startedAt) : null;
  if (!startedAt) {
    return res.status(400).json({ message: 'No existe hora de inicio (startedAt) para este apoyo.' });
  }

  // Tiempo del servicio actual (FIN - INICIO)
  const tramoMs = Math.max(0, now - startedAt);
  // Si quieres conservar acumulado, lo dejamos (aunque solo mostramos tramo)
  if (typeof v.support.totalMsServed !== 'number') v.support.totalMsServed = 0;
  v.support.totalMsServed += tramoMs;

  const tramoHuman = humanizeDuration(startedAt, now);

  // Restaurar apoyador
  v.support.active = false;
  v.support.endedAt = now;
  v.status = 'ACTIVE';
  // NO tocar internalCode por apoyo:
  // if (v.support?.originalInternalCode) v.internalCode = v.support.originalInternalCode;

  // Restaurar reemplazado SOLO si este apoyo lo puso fuera de servicio
  let target = null;
  const targetId = v.support?.targetVehicle || v.support?.target;
  if (targetId) {
    target = await Vehicle.findById(targetId);
    if (target && String(target.supportReplacedBy) === String(v._id)) {
      target.supportReplacedBy = undefined;
      target.supportReplacedAt = undefined;
      await target.save();
    }



    // if (target && String(target.supportReplacedBy) === String(v._id) &&
    //     (target.status || '').toUpperCase() === 'OUT_OF_SERVICE') {
    //   target.status = 'ACTIVE';
    //   target.supportReplacedBy = undefined;
    //   target.supportReplacedAt = undefined;
    //   await target.save();
    // }
  }

  // Flecha inversa para auditoría
  const fromCode = v.support?.replacementCode || (target?.internalCode ?? target?.plate ?? 'OBJETIVO');
  const toCode = v.support?.originalInternalCode || v.internalCode;

  auditPush(
    v,
    'FINALIZA_REEMPLAZO',
    {
      detail: `${fromCode} → ${toCode} — Tiempo Total: ${tramoHuman}`,
      startedAt,
      endedAt: now,
      targetVehicle: targetId || target?._id,
    },
    req.user?.email || req.user?.id
  );

  await v.save();

  // Devolver ambos para sincronizar inmediatamente en el front
  return res.json({
    vehicle: v.toObject(),
    target: target ? target.toObject() : null,
  });
}



// ====================== APOYO (start/finish) ======================

// export async function startSupport(req, res) {
//   const { id } = req.params;
//   const { targetBranch, targetVehicle } = req.body || {};

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   const target = await Vehicle.findById(targetVehicle);
//   if (!target) return res.status(404).json({ message: 'Vehículo a reemplazar no encontrado' });

//   // Estado del target → OUT_OF_SERVICE (si no lo está)
//   const targetPrevStatus = target.status;
//   if (U(target.status) !== 'OUT_OF_SERVICE') target.status = 'OUT_OF_SERVICE';

//   // Siglas
//   const prevCode = v.internalCode;
//   const replacement = `${target.internalCode}R`;

//   v.support = {
//     active: true,
//     targetBranch,
//     targetVehicle,
//     replacementCode: replacement,
//     originalInternalCode: prevCode,
//     startedAt: new Date(),
//     endedAt: null,
//   };
//   v.internalCode = replacement;
//   const prevStatus = v.status;
//   v.status = 'SUPPORT';

//   auditPush(
//     v,
//     'SUPPORT_START',
//     {
//       fromCode: prevCode,
//       toCode: replacement,
//       fromStatus: prevStatus,
//       toStatus: v.status,
//       targetVehicle: target._id,
//       targetInternalCode: target.internalCode,
//       targetPrevStatus,
//       targetNewStatus: target.status,
//     },
//     req.user?.email || req.user?.id
//   );

//   await target.save();
//   await v.save();

//   res.json(v.toObject());
// }

// export async function finishSupport(req, res) {
//   const { id } = req.params;

//   const v = await Vehicle.findById(id);
//   if (!v) return res.status(404).json({ message: 'No encontrado' });

//   if (!v.support?.active) {
//     return res.status(400).json({ message: 'Este vehículo no está en apoyo activo' });
//   }

//   const { targetVehicle, originalInternalCode, replacementCode } = v.support || {};
//   const prevCode = v.internalCode;
//   const prevStatus = v.status;

//   // Restaurar sigla original
//   if (originalInternalCode) v.internalCode = originalInternalCode;
//   v.status = 'ACTIVE';
//   v.support.active = false;
//   v.support.endedAt = new Date();

//   auditPush(
//     v,
//     'SUPPORT_FINISH',
//     {
//       fromCode: prevCode,
//       toCode: v.internalCode,
//       fromStatus: prevStatus,
//       toStatus: v.status,
//       targetVehicle,
//       replacementCode,
//       endedAt: v.support.endedAt,
//     },
//     req.user?.email || req.user?.id
//   );

//   await v.save();
//   res.json(v.toObject());
// }

// ====================== MEDIA: FOTOS ======================
// omitir
export async function addVehiclePhoto(req, res) {
  try {
    // omitir //
    // const { id } = req.params;
    // const file = req.file;
    // const { category = 'BASIC', title = '', label = '' } = req.body || {};
    // if (!file) return res.status(400).json({ message: 'Archivo requerido' });

    const { id } = req.params;
    const file = req.file;
    const {
      category = 'BASIC',
      title = '',
      label = '',
      categoryLabel = '',   // 👈 NUEVO: nombre visible
      bytes: bytesRaw = 0,  // 👈 NUEVO: peso opcional desde front
    } = req.body || {};
    if (!file) return res.status(400).json({ message: 'Archivo requerido' });

    const v = await Vehicle.findById(id);
    if (!v) return res.status(404).json({ message: 'No encontrado' });
    /// omitir ////
    // const cat = U(category) || 'BASIC';
    // const baseLabel = (label || title || '').toString().trim();
    // const seq = nextSeq(v.photos, cat);

    // adicion //
    const cat = (category || 'BASIC').toString().trim().toUpperCase();
    const catLabel = (categoryLabel || cat).toString().trim().toUpperCase(); // 👈 usar visible si viene
    const baseLabel = (label || title || '').toString().trim();
    const seq = nextSeq(v.photos, cat);

    let url,
      publicId,
      bytes,
      format,
      resourceType;

    //modificacion
    const mimetype = file.mimetype;

    // multer-storage-cloudinary → file.path https y con filename/public_id
    // omitir ///
    // if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
    //   url = file.path;
    //   publicId = file.filename || file.public_id;
    //   bytes = file.size;
    //   format = file.format || (mimetype ? mimetype.split('/')[1] : '');
    //   resourceType =
    //     file.resource_type ||
    //     (isVideoFormat(format, mimetype) ? 'video' : isPdf(format, mimetype) ? 'raw' : 'image');
    // } else {
    //   // multer simple → subimos
    //   const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
    //   const up = await cloud.uploader.upload(file.path, {
    //     folder: `${folder}/vehicles/${id}/photos`,
    //     resource_type: 'auto',
    //   });
    //   url = up.secure_url;
    //   publicId = up.public_id;
    //   bytes = up.bytes;
    //   format = up.format;
    //   resourceType = up.resource_type;
    // }

    //adicion //
    if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
      url = file.path;
      publicId = file.filename || file.public_id;
      bytes = Number(bytesRaw || file.size || 0);
      format = file.format || (mimetype ? mimetype.split('/')[1] : '');
      resourceType =
        file.resource_type ||
        (isVideoFormat(format, mimetype) ? 'video' : isPdf(format, mimetype) ? 'raw' : 'image');
    } else {
      const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';

      //Adcion
      const name = file.originalname || file.name || '';
      const preIsPdf = (mimetype?.toLowerCase().includes('pdf') || /\.pdf$/i.test(name));

      //anterior
      //   const opts = {
      //     folder: `${folder}/vehicles/${id}/photos`,
      //     // resource_type: 'auto',
      //     resource_type: preIsPdf ? 'raw' : 'auto',
      //   };


      //   const up = await cloud.uploader.upload(file.path, opts);
      //   url = up.secure_url;
      //   publicId = up.public_id;
      //   bytes = Number(bytesRaw || up.bytes || 0);
      //   format = up.format;
      //   resourceType = up.resource_type;
      // }

      //cierre anterior

      //Adicion
      const up = await cloud.uploader.upload(file.path, {
        folder: `${folder}/vehicles/${id}/documents`,
        resource_type: 'raw',                // 👈 antes 'auto'
        //cambio 10/11 23:4?
        type: 'upload',            // 👈 forzar público
        access_mode: 'public',     // 👈 forzar público
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        //fin //cambio 10/11 23:4?
      });
      url = up.secure_url;
      publicId = up.public_id;
      bytes = Number(bytesRaw || up.bytes || 0);
      format = up.format;
      resourceType = up.resource_type;

    }


    //fin adicion

    // Si realmente es PDF/RAW, lo redirigimos a documentos
    //omitir//
    //     if (resourceType === 'raw' || isPdf(format, mimetype)) {
    //       const uniformLabel = baseLabel
    //         ? `${cat} — ${U(baseLabel)} — ${seq}`
    //         : `${cat} — ${seq}`;
    //       v.documents.push({
    //         category: cat,
    //         label: uniformLabel,
    //         url,
    //         publicId,
    //         bytes,
    //         format,
    //         createdAt: new Date(),
    //       });
    //       auditPush(
    //         v,
    //         'MEDIA_ADD',
    //         { type: 'DOCUMENT', category: cat, label: uniformLabel, url },
    //         req.user?.email || req.user?.id
    //       );
    //       await v.save();
    //       return res
    //         .status(201)
    //         .json({ ok: true, redirected: 'document', document: v.documents.at(-1) });
    //     }

    //     const uniformTitle = baseLabel
    //       ? `${cat} — ${U(baseLabel)} — ${seq}`
    //       : `${cat} — ${seq}`;

    //     v.photos.push({
    //       category: cat,
    //       title: uniformTitle,
    //       url,
    //       publicId,
    //       bytes,
    //       format,
    //       createdAt: new Date(),
    //     });

    //     auditPush(
    //       v,
    //       'MEDIA_ADD',
    //       {
    //         type: resourceType === 'video' ? 'VIDEO' : 'PHOTO',
    //         category: cat,
    //         title: uniformTitle,
    //         url,
    //       },
    //       req.user?.email || req.user?.id
    //     );
    //     await v.save();

    //     res
    //       .status(201)
    //       .json({ ok: true, photo: v.photos.at(-1), isVideo: resourceType === 'video' });
    //   } catch (err) {
    //     console.error('[addVehiclePhoto] ❌', err);
    //     res.status(500).json({ message: 'Error subiendo foto', error: err.message });
    //   }
    // }

    /// adicion ///
    // Si es PDF → a documentos, y normalizar URL para inline
    if (resourceType === 'raw' || isPdf(format, mimetype)) {
      // Fuerza extensión .pdf si falta
      // const pdfUrl = url.includes('.pdf') ? url : `${url}.pdf`;
      const pdfUrl = url; // up.secure_url ya apunta a /raw/upload/..../file.pdf


      // const uniformLabel = baseLabel
      //   ? `${catLabel} — ${U(baseLabel)} — ${seq}`
      //   : `${catLabel} — ${seq}`;
      const seq = nextSeq(v.documents, cat);
      const uniformLabel = lbl
        ? `${catLabel} — ${U(lbl)} — ${seq}`
        : `${catLabel} — ${seq}`;

      v.documents.push({
        category: cat,
        categoryLabel: catLabel,  // 👈 guardar visible
        label: uniformLabel,
        url: pdfUrl,
        publicId,
        bytes,
        format: 'pdf',
        createdAt: new Date(),
      });

      auditPush(
        v,
        'MEDIA_ADD',
        { type: 'DOCUMENT', category: cat, categoryLabel: catLabel, label: uniformLabel, url: pdfUrl },
        req.user?.email || req.user?.id
      );
      await v.save();
      return res.status(201).json({ ok: true, redirected: 'document', document: v.documents.at(-1) });
    }

    // Foto/Video
    const uniformTitle = baseLabel
      ? `${catLabel} — ${U(baseLabel)} — ${seq}`
      : `${catLabel} — ${seq}`;

    v.photos.push({
      category: cat,
      categoryLabel: catLabel,  // 👈 guardar visible
      title: uniformTitle,
      url,
      publicId,
      bytes,
      format,
      createdAt: new Date(),
    });

    auditPush(
      v,
      'MEDIA_ADD',
      {
        type: resourceType === 'video' ? 'VIDEO' : 'PHOTO',
        category: cat,
        categoryLabel: catLabel,
        title: uniformTitle,
        url,
      },
      req.user?.email || req.user?.id
    );
    await v.save();

    res.status(201).json({ ok: true, photo: v.photos.at(-1), isVideo: resourceType === 'video' });
  } catch (err) {
    console.error('[addVehiclePhoto] ❌', err);
    res.status(500).json({ message: 'Error subiendo foto', error: err.message });
  }
}


export async function deleteVehiclePhoto(req, res) {
  try {
    const { id, photoId } = req.params;
    const v = await Vehicle.findById(id);
    if (!v) return res.status(404).json({ message: 'No encontrado' });

    const idx = v.photos.findIndex((p) => String(p._id) === String(photoId));
    if (idx === -1) return res.status(404).json({ message: 'Foto no encontrada' });

    const ph = v.photos[idx];
    if (ph.publicId) {
      try {
        await cloud.uploader.destroy(ph.publicId, { resource_type: 'auto' });
      } catch (_) { }
    }
    v.photos.splice(idx, 1);

    auditPush(v, 'MEDIA_DEL', { type: 'PHOTO', photoId }, req.user?.email || req.user?.id);
    await v.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteVehiclePhoto] ❌', err);
    res.status(500).json({ message: 'Error eliminando foto', error: err.message });
  }
}

// ====================== MEDIA: DOCUMENTOS ======================

/// omitir ///
// export async function addVehicleDocument(req, res) {
//   try {
//     const { id } = req.params;
//     const file = req.file;
//     const { category = 'LEGAL', label = '' } = req.body || {};
//     if (!file) return res.status(400).json({ message: 'Archivo requerido' });

//     const v = await Vehicle.findById(id);
//     if (!v) return res.status(404).json({ message: 'No encontrado' });

//     const cat = U(category) || 'LEGAL';
//     const lbl = (label || '').toString().trim();

//     let url,
//       publicId,
//       bytes,
//       format,
//       resourceType,
//       mimetype = file.mimetype;

//     if (isHttpUrl(file.path) && (file.filename || file.public_id)) {
//       url = file.path;
//       publicId = file.filename || file.public_id;
//       bytes = file.size;
//       format = file.format || (mimetype ? mimetype.split('/')[1] : '');
//       resourceType =
//         file.resource_type ||
//         (isPdf(format, mimetype) ? 'raw' : isVideoFormat(format, mimetype) ? 'video' : 'image');
//     } else {
//       const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
//       const up = await cloud.uploader.upload(file.path, {
//         folder: `${folder}/vehicles/${id}/documents`,
//         resource_type: 'auto',
//       });
//       url = up.secure_url;
//       publicId = up.public_id;
//       bytes = up.bytes;
//       format = up.format;
//       resourceType = up.resource_type;
//     }

//     // Si por error llega imagen/video, lo tratamos como photo
//     if (resourceType !== 'raw' && !isPdf(format, mimetype)) {
//       const seq = nextSeq(v.photos, cat);
//       const uniformTitle = lbl ? `${cat} — ${U(lbl)} — ${seq}` : `${cat} — ${seq}`;
//       v.photos.push({
//         category: cat,
//         title: uniformTitle,
//         url,
//         publicId,
//         bytes,
//         format,
//         createdAt: new Date(),
//       });
//       auditPush(
//         v,
//         'MEDIA_ADD',
//         {
//           type: isVideoFormat(format, mimetype) ? 'VIDEO' : 'PHOTO',
//           category: cat,
//           title: uniformTitle,
//           url,
//         },
//         req.user?.email || req.user?.id
//       );
//       await v.save();
//       return res
//         .status(201)
//         .json({ ok: true, redirected: 'photo', photo: v.photos.at(-1) });
//     }

//     const seq = nextSeq(v.documents, cat);
//     const uniformLabel = lbl ? `${cat} — ${U(lbl)} — ${seq}` : `${cat} — ${seq}`;

//     v.documents.push({
//       category: cat,
//       label: uniformLabel,
//       url,
//       publicId,
//       bytes,
//       format,
//       createdAt: new Date(),
//     });

//     auditPush(
//       v,
//       'MEDIA_ADD',
//       { type: 'DOCUMENT', category: cat, label: uniformLabel, url },
//       req.user?.email || req.user?.id
//     );
//     await v.save();

//     res.status(201).json({ ok: true, document: v.documents.at(-1) });
//   } catch (err) {
//     console.error('[addVehicleDocument] ❌', err);
//     res.status(500).json({ message: 'Error subiendo documento', error: err.message });
//   }
// }

// adicion //

export async function addVehicleDocument(req, res) {
  try {
    const { id } = req.params;
    const file = req.file;
    const {
      category = 'LEGAL',
      label = '',
      categoryLabel = '',   // 👈 nombre visible desde el front
      bytes: bytesRaw = 0,  // 👈 tamaño que mandamos en payload
    } = req.body || {};

    if (!file) return res.status(400).json({ message: 'Archivo requerido' });

    const v = await Vehicle.findById(id);
    if (!v) return res.status(404).json({ message: 'No encontrado' });

    const cat = (category || 'LEGAL').toString().trim().toUpperCase();
    const catLabel = (categoryLabel || cat).toString().trim().toUpperCase(); // 👈 USAMOS SIEMPRE MAYÚSCULA
    const lbl = (label || '').toString().trim();

    let url, publicId, bytes, format, resourceType, mimetype = file.mimetype;

    // === Detectamos si el archivo ya viene de cloudinary (multer-storage-cloudinary) ===
    const isCloud = isHttpUrl(file.path) && (file.filename || file.public_id);

    if (isCloud) {
      url = file.path;
      publicId = file.filename || file.public_id;
      bytes = Number(bytesRaw || file.size || 0);
      format = file.format || (mimetype ? mimetype.split('/')[1] : '');
      resourceType =
        file.resource_type ||
        (isPdf(format, mimetype) ? 'raw' : isVideoFormat(format, mimetype) ? 'video' : 'image');
    } else {
      // === Subida normal ===
      const folder = process.env.CLOUDINARY_FOLDER || 'fleetcore';
      const up = await cloud.uploader.upload(file.path, {
        folder: `${folder}/vehicles/${id}/documents`,
        // resource_type: 'auto',
         //cambio 10/11 23:4?
        resource_type: 'raw',
        type: 'upload',            // 👈 forzar público
        access_mode: 'public',     // 👈 forzar público
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        //fin //cambio 10/11 23:4?

      });
      url = up.secure_url;
      publicId = up.public_id;
      bytes = Number(bytesRaw || up.bytes || 0);
      format = up.format;
      resourceType = up.resource_type;
    }

    // === Si llegó imagen/video por error → redirigir a PHOTO (como ya hacías) ===
    if (resourceType !== 'raw' && !isPdf(format, mimetype)) {
      const seq = nextSeq(v.photos, cat);
      const uniformTitle = lbl
        ? `${catLabel} — ${U(lbl)} — ${seq}`
        : `${catLabel} — ${seq}`;

      v.photos.push({
        category: cat,
        categoryLabel: catLabel,   // 👈 guardamos nombre visible
        title: uniformTitle,
        url,
        publicId,
        bytes,
        format,
        createdAt: new Date(),
      });

      auditPush(
        v,
        'MEDIA_ADD',
        { type: isVideoFormat(format, mimetype) ? 'VIDEO' : 'PHOTO', category: cat, categoryLabel: catLabel, title: uniformTitle, url },
        req.user?.email || req.user?.id
      );

      await v.save();
      return res.status(201).json({ ok: true, redirected: 'photo', photo: v.photos.at(-1) });
    }

    // === Normalizar PDF: forzar extensión `.pdf` si falta ===
    const pdfUrl = url.includes('.pdf') ? url : `${url}.pdf`;

    const seq = nextSeq(v.documents, cat);
    const uniformLabel = lbl
      ? `${catLabel} — ${U(lbl)} — ${seq}`
      : `${catLabel} — ${seq}`;

    v.documents.push({
      category: cat,
      categoryLabel: catLabel, // 👈 Guardamos el visible
      label: uniformLabel,
      url: pdfUrl,
      publicId,
      bytes,
      format: 'pdf',
      createdAt: new Date(),
    });

    auditPush(
      v,
      'MEDIA_ADD',
      { type: 'DOCUMENT', category: cat, categoryLabel: catLabel, label: uniformLabel, url: pdfUrl },
      req.user?.email || req.user?.id
    );

    await v.save();
    res.status(201).json({ ok: true, document: v.documents.at(-1) });

  } catch (err) {
    console.error('[addVehicleDocument] ❌', err);
    res.status(500).json({ message: 'Error subiendo documento', error: err.message });
  }
}


export async function deleteVehicleDocument(req, res) {
  try {
    const { id, documentId } = req.params;
    const v = await Vehicle.findById(id);
    if (!v) return res.status(404).json({ message: 'No encontrado' });

    const idx = v.documents.findIndex((d) => String(d._id) === String(documentId));
    if (idx === -1) return res.status(404).json({ message: 'Documento no encontrado' });

    const d = v.documents[idx];
    if (d.publicId) {
      try {
        await cloud.uploader.destroy(d.publicId, { resource_type: 'auto' });
      } catch (_) { }
    }
    v.documents.splice(idx, 1);

    auditPush(v, 'MEDIA_DEL', { type: 'DOCUMENT', documentId }, req.user?.email || req.user?.id);
    await v.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteVehicleDocument] ❌', err);
    res.status(500).json({ message: 'Error eliminando documento', error: err.message });
  }
}

// ====================== AUDITORÍA (paginada) ======================
export async function listAudit(req, res) {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.max(parseInt(limit, 10) || 10, 1);

  const v = await Vehicle.findById(id, { audit: 1 }).lean();
  if (!v) return res.status(404).json({ message: 'No encontrado' });

  const total = v.audit?.length || 0;
  const start = (p - 1) * l;
  const end = start + l;
  const items = (v.audit || [])
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(start, end);

  res.json({ items, total, page: p, limit: l, pages: Math.ceil(total / l) });
}

