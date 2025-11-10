// front/src/pages/Vehicles/Form.jsx
// -----------------------------------------------------------------------------
// Ficha de Vehículos (Básico, Técnico, Documentos, Medios, Inventario, Accidentes, Combustible, Tickets)
// - Modo Ver (?mode=view): deshabilita inputs y muestra sólo "Volver".
// - Auditoría mixta (5 + “Ver más”) al final de TODAS las pestañas.
// - Scroll central independiente (no afecta menú lateral).
// - Protección de cambios no guardados (al salir por menú, recargar o cerrar).
// - Servicios de Apoyo: validaciones UI + start -> redirige a /vehicles.
// - Documentos: nuevas estructuras (Padrón extendido, Rev. técnica, Permiso circ.) y parseo de fechas.
// - Medios: cada categoría acepta imágenes, videos y PDF. Carrusel con flechas centradas y teclas ← →.
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import React from 'react';
import { api } from '../../services/http'
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom'
import MediaUploader from '../../components/Vehicle/VehicleMediaUploader'
import {
  uploadVehiclePhoto,
  uploadVehicleDocument,
  deleteVehiclePhoto,
  deleteVehicleDocument
} from '../../api/vehicles.api'

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

const fmtDateTimeCL = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleString('es-CL', { hour12: false });
};

function fmtBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let val = Number(bytes);
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

function ymd(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${mm}-${dd}`;
}
// Date | null (nunca undefined) para mongoose
function parseYMD(str) {
  if (!str) return null;
  const [Y, M, D] = str.split('-').map(n => parseInt(n, 10));
  if (!Y || !M || !D) return null;
  return new Date(Date.UTC(Y, M - 1, D));
}
function deepEqual(a, b) {
  try { return JSON.stringify(a) === JSON.stringify(b); }
  catch { return false; }
}


function naturalSortBranches(list) {
  return [...list].sort((a, b) => {
    const an = Number(a.code); const bn = Number(b.code)
    const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn)
    if (aIsNum && bIsNum) return an - bn
    if (aIsNum) return -1
    if (bIsNum) return 1
    return (a.name || '').localeCompare(b.name || '', 'es', { numeric: true })
  })
}

function normalizePdfUrl(url, format) {
  if (!url) return url;
  const isPdf = String(format || '').toLowerCase() === 'pdf' || /\.pdf(\?|$)/i.test(url);
  if (!isPdf) return url;
  return url.replace('/upload/', '/upload/fl_attachment/'); // fuerza Content-Disposition
}

function UnsavedChangesGuard({ isDirty }) {
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!isDirty) return;
      const a = e.target.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      const isSameOrigin = a.origin === window.location.origin;
      if (!isSameOrigin) return;
      const ok = window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?');
      if (!ok) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, [isDirty]);

  return null;
}

function AuditBlock({ vehicleId }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;
    setLoading(true);
    api.get(`/api/v1/vehicles/${vehicleId}/audit`, { params: { page: 1, limit } })
      .then(({ data }) => {
        setItems(data?.items || []);
        setTotal(data?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [vehicleId, limit]);

  return (
    <div className="mt-6">
      <div className="text-sm text-slate-500 mb-2 font-medium">Auditoría</div>
      <div className="rounded border bg-white">
        {loading && <div className="p-3 text-sm text-slate-500">Cargando auditoría…</div>}
        {!loading && items.length === 0 && (
          <div className="p-3 text-sm text-slate-500">Sin movimientos registrados.</div>
        )}
        {!loading && items.length > 0 && (
          <ul className="divide-y">
            {items.map((it, idx) => (
              <li key={idx} className="p-3 text-sm flex items-center gap-3">
                <span className="shrink-0 font-mono text-xs text-slate-500">
                  {fmtDateTimeCL(it.at)}
                </span>
                <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {it.action}
                </span>
                <span className="min-w-0 grow truncate text-slate-700">
                  {it?.data?.detail || '—'}
                </span>
                {it.by && <span className="shrink-0 text-xs text-slate-400">por: {it.by}</span>}
              </li>
            ))}
          </ul>
        )}
        {total > limit && (
          <div className="p-2 border-t flex justify-center">
            <button
              type="button"
              onClick={() => setLimit(Math.min(limit + 10, total))}
              className="text-xs text-blue-600 hover:underline"
            >
              Ver más
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== Componente principal =====================
export default function VehiclesForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()

  // Modo lectura por query param
  const params = new URLSearchParams(location.search)
  const mode = params.get('mode')
  const readOnly = mode === 'view'

  // Tabs
  const [searchParams, setSearchParams] = useSearchParams();
  // Estado de pestaña inicial: si hay ?tab= úsalo; si no, BASICO
  const [tab, setTab] = useState(searchParams.get('tab') || 'BASICO');
  // const [tab, setTab] = useState('BASICO')

  // Catálogos y sucursales
  const [branches, setBranches] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [statusLoading, setStatusLoading] = useState(false) /// no existe en la actualizacion ////
  const [statusMap, setStatusMap] = useState({}) // code -> label

  // Estados de control
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [vehicle, setVehicle] = useState(null)

  // Apoyo
  const [supportBranch, setSupportBranch] = useState('')
  const [supportVehicles, setSupportVehicles] = useState([])
  const [supportTarget, setSupportTarget] = useState('')
  const [supportBusy, setSupportBusy] = useState(false)
  const [supportActiveInfo, setSupportActiveInfo] = useState(null) // {from: ISO, code:'XXR'}


  // Carrusel de medios
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const viewerRef = useRef(null) /// no existe en la actualizacion ////

  const currentYear = new Date().getFullYear()
  const YEAR_MIN = 1950
  const YEAR_MAX = currentYear + 1

  // Form
  const [form, setForm] = useState({
    // Básico
    plate: '', internalCode: '',
    type: '', brand: '', model: '', year: '', color: '', branch: '',
    status: 'ACTIVE',
    // Técnico
    vin: '', engineNumber: '', engineBrand: '', engineModel: '', fuelType: '',
    transmission: { type: '', brand: '', model: '', serial: '', gears: '' },
    generator: { brand: '', model: '', serial: '' },
    pump: { brand: '', model: '', serial: '' },
    body: { brand: '', model: '', serial: '' },
    meters: { odometerKm: '', engineHours: '', ladderHours: '', generatorHours: '', pumpHours: '' },
    // Legal (fechas visibles)
    legal: {
      padron: {
        number: '',
        issuer: 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION',
        // NUEVOS CAMPOS
        acquisitionDate: '',   // yyyy-MM-dd
        inscriptionDate: '',   // yyyy-MM-dd
        issueDate: '',         // yyyy-MM-dd
        // Compat antiguos
        validFrom: '',         // legacy (no se usa, mantenido por compat)
        validTo: ''            // legacy (no se usa, mantenido por compat)
      },
      soap: { policy: '', issuer: '', validFrom: '', validTo: '' },
      insurance: { policy: '', issuer: '', validFrom: '', validTo: '' },
      tag: { number: '', issuer: '' },
      fuelCard: { issuer: '', number: '', validTo: '' },
      // NUEVOS BLOQUES
      technicalReview: { number: '', issuer: '', reviewedAt: '', validTo: '' }, // revisión técnica
      circulationPermit: { number: '', issuer: '', reviewedAt: '', validTo: '' } // permiso circulación
    }
  })


  // =============== Cargador Universal =================

  function UnifiedMediaUploader({ canUpload, mediaCats, onUploadPhoto, onUploadDoc }) {
  const [category, setCategory] = useState(mediaCats?.[0]?.[1] || '');
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const dropRef = useRef(null);
  // const [category, setCategory] = React.useState(mediaCats?.[0]?.[1] || '');
  // const [title, setTitle] = React.useState('');
  // const [files, setFiles] = React.useState([]);
  // const dropRef = React.useRef(null);

  // Arrastrar/soltar
  const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e) => {
    prevent(e);
    if (!canUpload) return;
    const list = Array.from(e.dataTransfer?.files || []);
    if (list.length) setFiles(prev => [...prev, ...list]);
  };

  // Pegar (Ctrl+V imágenes desde clipboard)
  useEffect(() => {
    const onPaste = (e) => {
      if (!canUpload) return;
      const items = e.clipboardData?.items || [];
      const pasted = [];
      for (const it of items) {
        if (it.kind === 'file') {
          const f = it.getAsFile();
          if (f) pasted.push(f);
        }
      }
      if (pasted.length) setFiles(prev => [...prev, ...pasted]);
    };
    const el = dropRef.current || window;
    el.addEventListener('paste', onPaste);
    return () => el.removeEventListener('paste', onPaste);
  }, [canUpload]);

  const onInputFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length) setFiles(prev => [...prev, ...list]);
    e.target.value = ''; // reset input
  };

  const removeAt = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const doUpload = async () => {
    if (!canUpload) return alert('Guarda el vehículo antes de subir.');
    if (!category) return alert('Selecciona una categoría.');
    if (!files.length) return alert('Selecciona al menos un archivo.');

    //adicion

    const pair = (mediaCats || []).find(([label, cat]) => cat === category);
    const displayCategory = (pair?.[0] || category).toUpperCase(); // ← NOMBRE VISIBLE EN MAYÚSCULAS


    for (const file of files) {
      const isPdf = (file.type?.toLowerCase?.()?.includes('pdf') || file.name?.toLowerCase?.()?.endsWith('.pdf'));
      // const payload = { file, category, title: title?.trim() || file.name };

      //adicion//
      const payload = { 
      file, 
      category,               // code (p.ej. 'MOTOR')
      categoryLabel: displayCategory,  // 'MOTOR' pero desde el label visible en mayúsculas
      title: title?.trim() || file.name ,
      bytes: file.size || 0,    // peso del archivo
      };

      try {
        if (isPdf) {
          await onUploadDoc({ ...payload, label: payload.title }); // mantiene tu API actual
        } else {
          await onUploadPhoto(payload);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('No se pudo subir uno de los archivos.');
      }
    }

    // Limpieza tras subir
    setFiles([]);
    // conservamos la categoría elegida; limpiamos título
    setTitle('');
  };

  return (
    <div className="p-4 space-y-4">
      {/* 1) Categorías (radio) */}
      <div>
        <div className="text-sm font-medium text-slate-700 mb-2">Categoría</div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-2">
          {mediaCats.map(([label, cat]) => (
            <label key={cat} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="media-cat"
                value={cat}
                checked={category === cat}
                onChange={() => setCategory(cat)}
                disabled={!canUpload}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
        {!canUpload && (
          <p className="text-xs text-slate-500 mt-1">Guarda el vehículo para habilitar la subida.</p>
        )}
      </div>

      {/* 2) Título */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Frente, lateral, número de serie, etc."
          disabled={!canUpload}
        />
      </div>

      {/* 3) Selección / Drag&Drop / Pegar */}
      <div
        ref={dropRef}
        onDragEnter={prevent}
        onDragOver={prevent}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center ${canUpload ? 'bg-white' : 'bg-slate-50 opacity-60'}`}
      >
        <p className="text-sm">Arrastra y suelta aquí, o pega (Ctrl+V) imágenes.</p>
        <p className="text-xs text-slate-500 mt-1">También puedes seleccionar archivos:</p>
        <label className="mt-3 inline-block px-3 py-2 border rounded cursor-pointer hover:bg-slate-50">
          Elegir archivos…
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={onInputFiles}
            disabled={!canUpload}
          />
        </label>

        {/* Lista de archivos seleccionados */}
        {files.length > 0 && (
          <div className="w-full mt-4">
            <div className="text-sm font-medium mb-2">A subir ({files.length}):</div>
            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                  <span className="truncate">{f.name}</span>
                  <button
                    type="button"
                    className="text-red-600 hover:underline text-xs"
                    onClick={() => removeAt(i)}
                  >Quitar</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4) Botón subir */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={doUpload}
          disabled={!canUpload || !category || files.length === 0}
          className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Subir
        </button>
      </div>
    </div>
  );
}

  // Para detectar cambios
  const [initialForm, setInitialForm] = useState(null)
  const isDirty = !readOnly && !deepEqual(form, initialForm || form)

  // ===================== Scroll central independiente =====================
  // Este contenedor hará que el contenido interno scrollee sin afectar el menú lateral
  const scrollContainerClass =
    'max-w-6xl mx-auto h-[calc(100vh-140px)] overflow-y-auto px-1 sm:px-0'
  const contentWrap = 'max-w-6xl mx-auto'
  const scrollBox = 'h-[calc(100vh-140px)] overflow-y-auto px-3'
  

  //============= Incluir Peso de Archivos ======================

  function prettyBytes(n = 0) {
  if (!n || isNaN(n)) return '';
  const kb = n / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}



  /// ============= Manejo de pestañas ==========================

  // Cambiar pestaña + actualizar la URL
function handleChangeTab(code) {
  setTab(code);
  setSearchParams({ tab: code }); // (si prefieres no apilar historial: setSearchParams({ tab: code }, { replace: true })
}

// Ref al contenedor con scroll (tu form con `${scrollBox}`)
const scrollRef = useRef(null);

// Al cambiar de pestaña, sube el scroll del contenedor
useEffect(() => {
  scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' }); // 'smooth' si quieres animación
}, [tab]);


  // ===================== Cargar catálogos =====================
  useEffect(() => {
    setStatusLoading(true)
    api.get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
      .then(({ data }) => {
        const list = data?.items || data?.data || []
        const opts = list
          .filter(it => it.active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label))
          .map(it => ({ value: it.code || it.label, label: it.label }))
        setStatusOptions(opts)
        //adicion
        const map = {}
        for (const o of opts) map[o.value] = o.label
        setStatusMap(map)
      })
    // .finally(() => setStatusLoading(false)) 
  }, [])

  // ===================== Cargar sucursales =====================
  useEffect(() => {
    api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || data?.list || []
        setBranches(naturalSortBranches(payload))
        if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.')
      })
      .catch(() => setBranches([]))
  }, [])

  // ===================== Cargar vehículo (edición) =====================
  useEffect(() => {
    if (!id) {
      setInitialForm(form) // nuevo registro
      return
    }
    setLoading(true)
    api.get(`/api/v1/vehicles/${id}`)
      .then(({ data }) => {
        const v = data?.item || data
        setVehicle(v)

        // soporte activo (desde doc) // Adicion //
        if (v?.support?.active) {
          setSupportActiveInfo({
            from: v.support.startedAt,
            code: v.support.replacementCode,
            targetCode: (v.support.replacementCode || '').replace(/R$/, '') // ej Q-12
          })
        } else {
          setSupportActiveInfo(null)
        }


        const newForm = {
          ...form,
          plate: v.plate || '',
          internalCode: v.internalCode || '',
          type: v.type || '',
          brand: v.brand || '',
          model: v.model || '',
          year: v.year || '',
          color: v.color || '',
          branch: v.branch?._id || v.branch || '',
          status: v.status || 'ACTIVE',
          vin: v.vin || '',
          engineNumber: v.engineNumber || '',
          engineBrand: v.engineBrand || '',
          engineModel: v.engineModel || '',
          fuelType: v.fuelType || '',
          transmission: {
            type: v.transmission?.type || '',
            brand: v.transmission?.brand || '',
            model: v.transmission?.model || '',
            serial: v.transmission?.serial || '',
            gears: v.transmission?.gears || '',
          },
          generator: { brand: v.generator?.brand || '', model: v.generator?.model || '', serial: v.generator?.serial || '' },
          pump: { brand: v.pump?.brand || '', model: v.pump?.model || '', serial: v.pump?.serial || '' },
          body: { brand: v.body?.brand || '', model: v.body?.model || '', serial: v.body?.serial || '' },
          meters: {
            odometerKm: v.meters?.odometerKm ?? '',
            engineHours: v.meters?.engineHours ?? '',
            ladderHours: v.meters?.ladderHours ?? '',
            generatorHours: v.meters?.generatorHours ?? '',
            pumpHours: v.meters?.pumpHours ?? '',
          },
          legal: {
            padron: {
              number: v.legal?.padron?.number || '',
              issuer: v.legal?.padron?.issuer || 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION',
              acquisitionDate: ymd(v.legal?.padron?.acquisitionDate),
              inscriptionDate: ymd(v.legal?.padron?.inscriptionDate),
              issueDate: ymd(v.legal?.padron?.issueDate),
              // Compat legacy si venían poblados:
              // validFrom: ymd(v.legal?.padron?.validFrom),
              // validTo: ymd(v.legal?.padron?.validTo)
            },
            soap: {
              policy: v.legal?.soap?.policy || '',
              issuer: v.legal?.soap?.issuer || '',
              validFrom: ymd(v.legal?.soap?.validFrom),
              validTo: ymd(v.legal?.soap?.validTo),
            },
            insurance: {
              policy: v.legal?.insurance?.policy || '',
              issuer: v.legal?.insurance?.issuer || '',
              validFrom: ymd(v.legal?.insurance?.validFrom),
              validTo: ymd(v.legal?.insurance?.validTo),
            },
            tag: { number: v.legal?.tag?.number || '', issuer: v.legal?.tag?.issuer || '' },
            fuelCard: { issuer: v.legal?.fuelCard?.issuer || '', number: v.legal?.fuelCard?.number || '', validTo: ymd(v.legal?.fuelCard?.validTo) },
            technicalReview: {
              number: v.legal?.technicalReview?.number || '',
              issuer: v.legal?.technicalReview?.issuer || '',
              reviewedAt: ymd(v.legal?.technicalReview?.reviewedAt),
              validTo: ymd(v.legal?.technicalReview?.validTo)
            },
            circulationPermit: {
              number: v.legal?.circulationPermit?.number || '',
              issuer: v.legal?.circulationPermit?.issuer || '',
              reviewedAt: ymd(v.legal?.circulationPermit?.reviewedAt),
              validTo: ymd(v.legal?.circulationPermit?.validTo)
            }
          }
        }

        setForm(newForm)
        setInitialForm(newForm) // snapshot para isDirty
      })
      .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ===================== Update helpers =====================
  function update(field, val) {
    if (field === 'branch' || field === 'year') {
      setForm(f => ({ ...f, [field]: val }))
    } else {
      setForm(f => ({ ...f, [field]: (typeof val === 'string' ? U(val) : val) }))
    }
  }
  function updateNested(path, val) {
    setForm((f) => {
      const clone = structuredClone(f)
      let ref = clone
      const parts = path.split('.')
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]]
      const isDatePath =
        path.startsWith('legal.') &&
        (
          path.endsWith('validFrom') ||
          path.endsWith('validTo') ||
          path.endsWith('acquisitionDate') ||
          path.endsWith('inscriptionDate') ||
          path.endsWith('issueDate') ||
          path.endsWith('reviewedAt')
        )
      ref[parts.at(-1)] = (typeof val === 'string' && !isDatePath ? U(val) : val)
      return clone
    })
  }

  // ===================== Guardar =====================
  async function handleSubmit(e) {
    e.preventDefault()
    if (readOnly) return
    setSaving(true); setError('')

    try {
      const reqFields = ['plate', 'internalCode', 'status', 'type', 'brand', 'model', 'year', 'color', 'branch']
      for (const k of reqFields) {
        if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`)
      }
      const yearNum = Number(form.year)
      if (!Number.isFinite(yearNum) || yearNum < YEAR_MIN || yearNum > YEAR_MAX) {
        throw new Error(`Año inválido. Debe estar entre ${YEAR_MIN} y ${YEAR_MAX}.`)
      }

      // Payload clonado
      const payload = structuredClone(form)

            // === Conversión segura de fechas ===
      const toDateOrNull = (v) => {
        if (!v) return null;
        if (v instanceof Date) return isNaN(v) ? null : v;
        // Si viene "YYYY-MM-DD"
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
          return new Date(`${v}T00:00:00.000Z`);
        }
        // Intento final
        const d = new Date(v);
        return isNaN(d) ? null : d;
      };

      // PADRÓN
      payload.legal.padron.acquisitionDate = toDateOrNull(form.legal.padron.acquisitionDate);
      payload.legal.padron.inscriptionDate = toDateOrNull(form.legal.padron.inscriptionDate);
      payload.legal.padron.issueDate = toDateOrNull(form.legal.padron.issueDate);

      // SOAP
      payload.legal.soap.validFrom = toDateOrNull(form.legal.soap.validFrom);
      payload.legal.soap.validTo   = toDateOrNull(form.legal.soap.validTo);

      // SEGURO
      payload.legal.insurance.validFrom = toDateOrNull(form.legal.insurance.validFrom);
      payload.legal.insurance.validTo   = toDateOrNull(form.legal.insurance.validTo);

      // TARJETA COMBUSTIBLE
      payload.legal.fuelCard.validTo = toDateOrNull(form.legal.fuelCard.validTo);

      // REVISIÓN TÉCNICA
      payload.legal.technicalReview.reviewedAt = toDateOrNull(form.legal.technicalReview.reviewedAt);
      payload.legal.technicalReview.validTo    = toDateOrNull(form.legal.technicalReview.validTo);

      // PERMISO CIRCULACIÓN
      payload.legal.circulationPermit.reviewedAt = toDateOrNull(form.legal.circulationPermit.reviewedAt);
      payload.legal.circulationPermit.validTo    = toDateOrNull(form.legal.circulationPermit.validTo);

      // Uppercase inteligente (excepto branch y fechas)
      const up = (obj) => {
        if (!obj || typeof obj !== 'object') return obj
        const out = Array.isArray(obj) ? [] : {}
        for (const k of Object.keys(obj)) {
          const v = obj[k]
          const isBranch = k === 'branch'
          const isDateKey = ['validFrom', 'validTo', 'acquisitionDate', 'inscriptionDate', 'issueDate', 'reviewedAt'].includes(k)
          if (typeof v === 'string' && !isBranch && !isDateKey) out[k] = U(v)
          else if (v && typeof v === 'object') out[k] = up(v)
          else out[k] = v
        }
        return out
      }
      const finalPayload = up(payload)
      finalPayload.year = yearNum
      if (finalPayload.transmission?.gears) {
        finalPayload.transmission.gears = Number(finalPayload.transmission.gears)
      }

      if (id) {
        await api.patch(`/api/v1/vehicles/${id}`, finalPayload)
        alert('Vehículo actualizado con éxito')
      } else {
        await api.post('/api/v1/vehicles', finalPayload)
        alert('Vehículo creado con éxito')
      }
      setInitialForm(finalPayload)
      navigate('/vehicles')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Datos inválidos'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const canUpload = useMemo(() => Boolean(id), [id])
  const refresh = async () => {
    if (!id) return
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    const v = data?.item || data
    setVehicle(v)
    if (v?.support?.active) {
      setSupportActiveInfo({
        from: v.support.startedAt,
        code: v.support.replacementCode,
        targetCode: (v.support.replacementCode || '').replace(/R$/, '')
      })
    } else setSupportActiveInfo(null)
  }

  //================ Handlers ====================
  // const handleUploadPhoto = async ({ file, category = 'BASIC', title = '' }) => {
  //   if (!id) throw new Error('Guarda el vehículo antes de subir medios')
  //   await uploadVehiclePhoto(id, { file, category, title })
  //   await refresh()
  // }
  // const handleUploadDoc = async ({ file, category, label }) => {
  //   if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
  //   await uploadVehicleDocument(id, { file, category, label })
  //   await refresh()
  // }

  const handleUploadPhoto = async ({ file, category = 'BASIC', categoryLabel, title = '', bytes = 0 }) => {
  if (!id) throw new Error('Guarda el vehículo antes de subir medios');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('category', category);
  if (categoryLabel) fd.append('categoryLabel', categoryLabel); // 👈 nombre visible
  if (title) fd.append('title', title);
  fd.append('bytes', String(bytes || 0));
  //adicion 
  // await api.post(`/api/v1/vehicles/${id}/photos`, fd);
  await api.post(`/api/v1/vehicles/${id}/photos`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  await refresh();
};

const handleUploadDoc = async ({ file, category = 'BASIC', categoryLabel, label = '', bytes = 0 }) => {
  if (!id) throw new Error('Guarda el vehículo antes de subir documentos');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('category', category);
  if (categoryLabel) fd.append('categoryLabel', categoryLabel); // 👈 nombre visible
  if (label) fd.append('label', label);
  fd.append('bytes', String(bytes || 0));
  //Adicion
  // await api.post(`/api/v1/vehicles/${id}/documents`, fd);
  await api.post(`/api/v1/vehicles/${id}/documents`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  await refresh();
};

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('¿Eliminar foto?')) return
    await deleteVehiclePhoto(id, photoId)
    await refresh()
  }
  const handleDeleteDoc = async (docId) => {
    if (!confirm('¿Eliminar documento?')) return
    await deleteVehicleDocument(id, docId)
    await refresh()
  }

  useEffect(() => {
    if (!supportBranch) { setSupportVehicles([]); setSupportTarget(''); return }
    api.get('/api/v1/vehicles', { params: { page: 1, limit: 500, branch: supportBranch } })
      .then(({ data }) => setSupportVehicles(data?.items || data?.data || []))
  }, [supportBranch])

  async function startSupport() {
    if (!id || !supportBranch || !supportTarget) {
      return alert('Selecciona sucursal y vehículo objetivo.')
    }
    if (supportTarget === id) {
      return alert('Un vehículo no puede reemplazarse a sí mismo.')
    }
    setSupportBusy(true)
    try {
      // 1) llamamos al back
      const { data: started } = await api.post(`/api/v1/vehicles/${id}/support/start`, {
        targetBranch: supportBranch,
        targetVehicle: supportTarget,
      })
      // 2) UI inmediata: extraer target code para leyenda
      const target = supportVehicles.find(v => v._id === supportTarget)
      const targetCode = target?.internalCode || ''
      const repl = `${targetCode}R`
      setSupportActiveInfo({ from: new Date().toISOString(), code: repl, targetCode })
      // 3) estado local (por si quieres mostrar label/estado)
      setVehicle(started)
      alert('Reemplazo iniciado')
      navigate('/vehicles') // redirección a listado (requerido)
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo iniciar el reemplazo')
    } finally {
      setSupportBusy(false)
    }
  }

  async function finishSupport() {
    if (!id) return
    setSupportBusy(true)
    try {
      const { data: finished } = await api.post(`/api/v1/vehicles/${id}/support/finish`)
      setVehicle(finished)
      setSupportActiveInfo(null)
      setSupportBranch(''); setSupportVehicles([]); setSupportTarget('')
      alert('Reemplazo finalizado')
      navigate('/vehicles')  
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo finalizar el reemplazo')
    } finally {
      setSupportBusy(false)
    }
  }

  const openViewer = (i) => { setViewerIndex(i); setViewerOpen(true) }
  const closeViewer = () => setViewerOpen(false)
  const prevViewer = () => setViewerIndex(i => (i - 1 + (vehicle?.photos?.length || 1)) % (vehicle?.photos?.length || 1))
  const nextViewer = () => setViewerIndex(i => ((i + 1) % (vehicle?.photos?.length || 1)))


  useEffect(() => {
    if (!viewerOpen) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prevViewer()
      if (e.key === 'ArrowRight') nextViewer()
      if (e.key === 'Escape') closeViewer()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [viewerOpen, viewerIndex])

  // ===================== Cancelar / Volver =====================
  const handleCancel = () => {
    if (!isDirty) return navigate('/vehicles')
    const ok = window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')
    if (ok) navigate('/vehicles')
  }

  // ===================== Render =====================
  
  if (loading) return <div className={`${contentWrap} bg-white shadow rounded p-4 mt-3`}>Cargando…</div>

  const TabButton = ({ code, label }) => (
    <button
      type="button"
      // onClick={() => setTab(code)}
      onClick={() => handleChangeTab(code)}   // ← antes hacía setTab(code)
      className={`px-3 py-1.5 rounded ${tab === code
        ? 'bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.25)]'
        : 'bg-white border'}`}
    >
      {label}
    </button>
  )

  // Mapea categorías para uploader (todas aceptan imágenes, video, PDF)
  const mediaCats = [
    ['Básico (vehículo)', 'BASIC'],
    ['Motor', 'ENGINE'],
    ['Transmisión', 'TRANSMISSION'],
    ['Generador', 'GENERATOR'],
    ['Motobomba', 'PUMP'],
    ['Cuerpo de bomba', 'BODY'],
    ['Documentos (legal)', 'LEGAL'],
    ['Manuales', 'MANUALS'],
    ['Partes', 'PARTS'],
  ]


    return (
    <div className="flex flex-col h-full">
      {/* Guard global de cambios sin guardar */}
      <UnsavedChangesGuard isDirty={isDirty} />

        <header className={`${contentWrap} mt-2 `}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {readOnly ? 'Consulta de vehículo' : id ? 'Editar Vehículo' : 'Registrar Vehículo'}
            </h2>
            {!readOnly && (
              <p className="text-xs text-slate-500">Los textos se guardan en MAYÚSCULAS.</p>
            )}
          </div>
        </div>
        {/* Tabs centradas */}
        <nav className="mt-2 flex justify-center gap-2">
          <TabButton code="BASICO" label="Básico" />
          <TabButton code="TECNICO" label="Técnico" />
          <TabButton code="DOCUMENTOS" label="Documentos" />
          <TabButton code="MEDIOS" label="Medios" />
          <TabButton code="INVENTARIO" label="Inventario" />
          <TabButton code="ACCIDENTES" label="Accidentes" />
          <TabButton code="COMBUSTIBLE" label="Combustible" />
          <TabButton code="TICKETS" label="Tickets" />
        </nav>
      </header>


      {error && <div className={`${contentWrap} px-3 py-2 bg-red-50 text-red-700 rounded text-sm mt-2`}>{error}</div>}
      {notice && <div className={`${contentWrap} px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm mt-2`}>{notice}</div>}

        {/* Contenedor con scroll propio, independiente del menú */}
      {/* <form onSubmit={handleSubmit} className={`${scrollContainerClass} my-3`}> */}
      <form ref={scrollRef}  onSubmit={handleSubmit} className={`${contentWrap} ${scrollBox} my-3`}>
        {/* <fieldset disabled={readOnly} className="space-y-4"> */}

          {/* ====================== BASICO ====================== */}
          {tab === 'BASICO' && (
            <div className="space-y-4">
              <div className="bg-white shadow rounded-xl border">
                <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                  <h3 className="font-medium text-slate-700">Información básica</h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['Placa / Patente', 'plate', 'ABC-123', 'text'],
                    ['Código interno', 'internalCode', 'B-10', 'text'],
                    ['Tipo de vehículo', 'type', 'CARRO BOMBA, CAMIÓN...', 'text'],
                    ['Marca', 'brand', 'SCANIA', 'text'],
                    ['Modelo', 'model', 'P340', 'text'],
                  ].map(([label, key, ph, type]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) => update(key, e.target.value)}
                        className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                        placeholder={ph}
                        required
                        disabled={readOnly || Boolean(supportActiveInfo)}  // ← bloquea si está en apoyo
                        readOnly={readOnly || Boolean(supportActiveInfo)} 
                        // disabled={readOnly}
                        // readOnly={readOnly}
                      />
                    </div>
                  ))}

                  {/* Año */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
                    <input
                      type="number"
                      min={YEAR_MIN}
                      max={YEAR_MAX}
                      value={form.year}
                      onChange={(e) => update('year', e.target.value)}
                      className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                      placeholder={String(currentYear)}
                      required
                      disabled={readOnly}
                      readOnly={readOnly}
                    />
                    <p className="text-xs text-slate-500 mt-1">Permitido: {YEAR_MIN}–{YEAR_MAX}</p>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => update('color', e.target.value)}
                      className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                      placeholder="ROJO"
                      required
                      disabled={readOnly}
                      readOnly={readOnly}
                    />
                  </div>

                  {/* Sucursal */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
                    <select
                      required
                      value={form.branch}
                      onChange={(e) => update('branch', e.target.value)}
                      className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                    >
                      <option value="" disabled>Selecciona sucursal</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>
                          {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estado */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                    <select
                      required
                      value={form.status}
                      // disabled={readOnly || statusLoading}
                      onChange={(e) => update('status', e.target.value)}
                      className="w-full border p-2 rounded bg-white"
                    >
                      <option value="" disabled>Selecciona estado</option>
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

               {/* ====================== APOYO A OTRAS SUCURSALES ====================== */}

              <div className="bg-white shadow rounded-xl border">
              <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                <h3 className="font-medium text-slate-700">Servicios de Apoyo a otras Sucursales</h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal objetivo</label>
                  <select
                    value={supportBranch}
                    onChange={(e) => {setSupportBranch(e.target.value); setSupportTarget(''); }}
                    className="w-full border p-2 rounded bg-white"
                    disabled={readOnly}
                  >
                    <option value="">— Selecciona sucursal —</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Vehículo a reemplazar</label>
                  <select
                    value={supportTarget}
                    onChange={(e) => setSupportTarget(e.target.value)}
                    className="w-full border p-2 rounded bg-white"
                    disabled={readOnly || !supportBranch}
                  >
                    <option value="">— Selecciona vehículo —</option>
                    {supportVehicles.map(v => (
                      <option key={v._id} value={v._id}>
                        {(v.internalCode || v.plate || v._id)} — {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  {supportActiveInfo ? (
                    <button
                      type="button"
                      onClick={finishSupport}
                      disabled={readOnly || supportBusy}
                      className="px-3 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                    >
                      {supportBusy ? 'Finalizando…' : 'Finalizar reemplazo'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startSupport}
                      disabled={readOnly || supportBusy || !supportBranch || !supportTarget}
                      className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                      {supportBusy ? 'Iniciando…' : 'Iniciar reemplazo'}
                    </button>
                  )}
                </div>
              </div>

              {/* Leyenda de reemplazo requerida */}
              {supportActiveInfo && (
                <div className="px-4 pb-4 text-sm">
                  <span className="font-medium">EN Reemplazo del vehículo:</span>{' '}
                  <span className="font-semibold">{supportActiveInfo.targetCode}</span>{' '}
                  desde {fmtDateTimeCL(supportActiveInfo.from)}
                </div>
              )}
            </div>


          

              

              {/* Botonera adaptativa Volver/Cancelar + Guardar */}
              <div className="flex justify-end gap-3 pb-4">
                {readOnly ? (
                  <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
                ) : (
                  <>
                    <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
                      {isDirty ? 'Cancelar' : 'Volver'}
                    </button>
                    <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
                      {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
                    </button>
                  </>
                )}
              </div>

              {/* Auditoría (mixta) */}
              {id && <AuditBlock vehicleId={id} />}
              
            </div>
          )}

          {/* ====================== TECNICO ====================== */}
          {tab === 'TECNICO' && (
            <div className="space-y-4">
              {/* Motor */}
              <div className="bg-white shadow rounded-xl border">
                <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                  <h3 className="font-medium text-slate-700">Motor</h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    ['VIN', 'vin', ''],
                    ['N° Motor', 'engineNumber', ''],
                    ['Marca Motor', 'engineBrand', ''],
                    ['Modelo Motor', 'engineModel', ''],
                    ['Combustible', 'fuelType', 'DIESEL/GASOLINA'],
                  ].map(([label, key, ph]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                      <input
                        value={form[key]}
                        onChange={(e) => update(key, e.target.value)}
                        className="w-full border p-2 rounded"
                        placeholder={ph}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Transmisión */}
              <div className="bg-white shadow rounded-xl border">
                <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                  <h3 className="font-medium text-slate-700">Transmisión</h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {[
                    ['Tipo', 'transmission.type', 'MANUAL/AUTOMATIC/AMT/CVT'],
                    ['Marca', 'transmission.brand', 'ALLISON/ZF/EATON'],
                    ['Modelo', 'transmission.model', '4500 RDS'],
                    ['Serie', 'transmission.serial', ''],
                    ['Marchas', 'transmission.gears', '6', 'text'],
                  ].map(([label, path, ph, type]) => {
                    const val = path.split('.').reduce((acc, k) => acc?.[k], form) ?? ''
                    return (
                      <div key={path}>
                        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                        <input
                          type={type || 'text'}
                          value={val}
                          onChange={(e) => updateNested(path, e.target.value)}
                          className="w-full border p-2 rounded"
                          placeholder={ph}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Medidores */}
              <div className="bg-white shadow rounded-xl border">
                <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                  <h3 className="font-medium text-slate-700">Medidores</h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {[
                    ['Odómetro (km)', 'meters.odometerKm', '0'],
                    ['Horómetro motor (h)', 'meters.engineHours', '0'],
                    ['Horas escala (h)', 'meters.ladderHours', '0'],
                    ['Horas generador (h)', 'meters.generatorHours', '0'],
                    ['Horas cuerpo bomba (h)', 'meters.pumpHours', '0'],
                  ].map(([label, path, ph]) => {
                    const val = path.split('.').reduce((acc, k) => acc?.[k], form) ?? ''
                    return (
                      <div key={path}>
                        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                        <input
                          value={val}
                          onChange={(e) => updateNested(path, e.target.value)}
                          className="w-full border p-2 rounded"
                          placeholder={ph}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Equipos */}
              {[
                ['Generador', 'generator'],
                ['Motobomba', 'pump'],
                ['Cuerpo de bomba', 'body'],
              ].map(([title, key]) => (
                <div className="bg-white shadow rounded-xl border" key={key}>
                  <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                    <h3 className="font-medium text-slate-700">{title}</h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['brand', 'model', 'serial'].map((f) => (
                      <div key={f}>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          {f === 'brand' ? 'Marca' : f === 'model' ? 'Modelo' : 'Serie'}
                        </label>
                        <input
                          value={form[key]?.[f] ?? ''}
                          onChange={(e) => updateNested(`${key}.${f}`, e.target.value)}
                          className="w-full border p-2 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Auditoría */}
              {id && <AuditBlock vehicleId={id} />}

              <div className="flex justify-end gap-3 pb-4">
                {readOnly ? (
                  <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
                ) : (
                  <>
                    <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
                      {isDirty ? 'Cancelar' : 'Volver'}
                    </button>
                    <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
                      {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ====================== DOCUMENTOS ====================== */}
          {tab === 'DOCUMENTOS' && (
            <div className="space-y-4">
              <div className="bg-white shadow rounded-xl border">
                <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                  <h3 className="font-medium text-slate-700">Legal</h3>
                </div>
                <div className="p-4 grid grid-cols-1 gap-6">
                  {/* Padrón extendido */}
                  <div className="grid sm:grid-cols-6 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-600">Padrón | N°</label>
                      <input maxLength={20} value={form.legal.padron.number} onChange={(e) => updateNested('legal.padron.number', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Emisor</label>
                      <input value={form.legal.padron.issuer} onChange={(e) => updateNested('legal.padron.issuer', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">F. Adquisición</label>
                      <input type="date" value={form.legal.padron.acquisitionDate || ''} onChange={(e) => updateNested('legal.padron.acquisitionDate', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">F. Inscripción</label>
                      <input type="date" value={form.legal.padron.inscriptionDate || ''} onChange={(e) => updateNested('legal.padron.inscriptionDate', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">F. Emisión</label>
                      <input type="date" value={form.legal.padron.issueDate || ''} onChange={(e) => updateNested('legal.padron.issueDate', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  {/* SOAP */}
                  <div className="grid sm:grid-cols-6 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-600">SOAP | Póliza</label>
                      <input value={form.legal.soap.policy} onChange={(e) => updateNested('legal.soap.policy', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
                      <input value={form.legal.soap.issuer} onChange={(e) => updateNested('legal.soap.issuer', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Inicio</label>
                      <input type="date" value={form.legal.soap.validFrom || ''} onChange={(e) => updateNested('legal.soap.validFrom', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Fin</label>
                      <input type="date" value={form.legal.soap.validTo || ''} onChange={(e) => updateNested('legal.soap.validTo', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  {/* Seguro */}
                  <div className="grid sm:grid-cols-6 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-600">Seguro | Póliza</label>
                      <input value={form.legal.insurance.policy} onChange={(e) => updateNested('legal.insurance.policy', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
                      <input value={form.legal.insurance.issuer} onChange={(e) => updateNested('legal.insurance.issuer', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Inicio</label>
                      <input type="date" value={form.legal.insurance.validFrom || ''} onChange={(e) => updateNested('legal.insurance.validFrom', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Fin</label>
                      <input type="date" value={form.legal.insurance.validTo || ''} onChange={(e) => updateNested('legal.insurance.validTo', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  {/* TAG */}
                  <div className="grid sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-sm font-medium text-slate-600">TAG | N°</label>
                      <input value={form.legal.tag.number} onChange={(e) => updateNested('legal.tag.number', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Emisor</label>
                      <input value={form.legal.tag.issuer} onChange={(e) => updateNested('legal.tag.issuer', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  {/* Tarjeta combustible */}
                  <div className="grid sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Tarj. combustible | Emisor</label>
                      <input value={form.legal.fuelCard.issuer} onChange={(e) => updateNested('legal.fuelCard.issuer', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">N° Tarjeta</label>
                      <input value={form.legal.fuelCard.number} onChange={(e) => updateNested('legal.fuelCard.number', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Vence</label>
                      <input type="date" value={form.legal.fuelCard.validTo || ''} onChange={(e) => updateNested('legal.fuelCard.validTo', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  {/* Revisión técnica */}
                  <div className="grid sm:grid-cols-6 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-600">Revisión técnica | N°</label>
                      <input value={form.legal.technicalReview.number} onChange={(e) => updateNested('legal.technicalReview.number', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Emisor</label>
                      <input value={form.legal.technicalReview.issuer} onChange={(e) => updateNested('legal.technicalReview.issuer', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Fecha revisión</label>
                      <input type="date" value={form.legal.technicalReview.reviewedAt || ''} onChange={(e) => updateNested('legal.technicalReview.reviewedAt', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Vencimiento</label>
                      <input type="date" value={form.legal.technicalReview.validTo || ''} onChange={(e) => updateNested('legal.technicalReview.validTo', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  {/* Permiso de circulación */}
                  <div className="grid sm:grid-cols-6 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-600">Permiso de circulación | N°</label>
                      <input value={form.legal.circulationPermit.number} onChange={(e) => updateNested('legal.circulationPermit.number', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Emisor</label>
                      <input value={form.legal.circulationPermit.issuer} onChange={(e) => updateNested('legal.circulationPermit.issuer', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Fecha revisión</label>
                      <input type="date" value={form.legal.circulationPermit.reviewedAt || ''} onChange={(e) => updateNested('legal.circulationPermit.reviewedAt', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600">Vencimiento</label>
                      <input type="date" value={form.legal.circulationPermit.validTo || ''} onChange={(e) => updateNested('legal.circulationPermit.validTo', e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Auditoría */}
              {id && <AuditBlock vehicleId={id} />}

              <div className="flex justify-end gap-3 pb-4">
                {readOnly ? (
                  <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
                ) : (
                  <>
                    <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
                      {isDirty ? 'Cancelar' : 'Volver'}
                    </button>
                    <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
                      {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ====================== MEDIOS ====================== */}
          {tab === 'MEDIOS' && (
            <div className="space-y-4">
              <div className="bg-white shadow rounded-xl border">
                  <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                    <h3 className="font-medium text-slate-700">Cargar medios</h3>
                    <p className="text-xs text-slate-500">Selecciona categoría, asigna un título opcional y sube múltiples archivos (arrastrar, pegar o elegir).</p>
                  </div>

                  {/* Uploader unificado */}
                  <UnifiedMediaUploader
                    canUpload={canUpload}
                    mediaCats={mediaCats /* [['Básico','BASICO'], ['Motor','MOTOR'], ...] */}
                    onUploadPhoto={handleUploadPhoto}
                    onUploadDoc={handleUploadDoc}
                  />
                </div>
              {/* <div className="bg-white shadow rounded-xl border">
                <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                  <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
                  <p className="text-xs text-slate-500">Selecciona categoría, asigna un título opcional y sube múltiples archivos (arrastrar, pegar o elegir).</p>
                </div>

                
                <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mediaCats.map(([label, cat]) => (
                    <div key={cat} className="border rounded-lg p-3">
                      <div className="font-medium mb-2">{label}</div>
                      <MediaUploader
                        onUpload={(p) =>
                          // admite fotos, videos y PDF indistintamente
                          (p?.file?.type?.toLowerCase?.()?.includes('pdf') || p?.file?.name?.toLowerCase?.()?.endsWith('.pdf'))
                            ? handleUploadDoc({ ...p, category: cat, label: p.title })
                            : handleUploadPhoto({ ...p, category: cat, title: p.title })
                        }
                        accept={'image/*,video/*,application/pdf'}
                        category={cat}
                        mode={'mixed'}
                      />
                      {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
                    </div>
                  ))}
                </div>
              </div> */}
              

              {/* Contenido actual */}
              {vehicle && (
                <div className="bg-white shadow rounded-xl border">
                  <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                    <h3 className="font-medium text-slate-700">Contenido actual</h3>
                  </div>
                  <div className="p-4 grid gap-6">
                    {/* Fotos/Videos */}
                    <div>
                      <div className="font-medium mb-1">Fotos / Videos</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {(vehicle.photos || []).map((ph, idx) => {
                          const isVideo = /^(mp4|mov|webm)$/i.test(ph.format || '')
                          return (
                            <div key={ph._id} className="text-xs">
                              {isVideo ? (
                                <video
                                  className="w-full h-24 rounded border object-cover"
                                  controls
                                  onClick={() => openViewer(idx)}
                                >
                                  <source src={ph.url} />
                                </video>
                              ) : (
                                <img
                                  src={ph.url}
                                  alt={ph.title || ''}
                                  className="w-full h-24 object-cover rounded border cursor-pointer"
                                  onClick={() => openViewer(idx)}
                                />
                              )}
                              {/* OMITIR */}
                              {/* <div className="mt-1 break-words">{ph.title}</div> */}
                              {/* ADICION */}
                              <div className="mt-1 break-words">
                              {ph.title}
                              {ph.bytes ? (
                                <span className="text-slate-500 text-xs"> ({fmtBytes(ph.bytes)})</span>
                              ) : null}
                              </div>


                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(ph._id)}
                                className="mt-1 text-red-600 hover:underline"
                              >Eliminar</button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {/* Documentos/PDF */}
                    <div>
                      <div className="font-medium mb-1">Documentos</div>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {(vehicle.documents || []).map(d => (
                          // OMITIR
                          // <li key={d._id} className="break-words">
                          //   {d.label} — <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ver</a>
                          // {/* ADICION */}
                          // <li key={d._id} className="break-words">
                          //   <span className="font-medium">{d.categoryLabel || d.category}</span> — {d.label}
                          //   {d.bytes ? (
                          //     <span className="text-slate-500 text-xs"> ({fmtBytes(d.bytes)})</span>
                          //   ) : null}
                          //   {' — '}
                          //   <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ver</a>
                          //   <button
                          //     type="button"
                          //     onClick={() => handleDeleteDoc(d._id)}
                          //     className="ml-3 text-red-600 hover:underline"
                          //   >Eliminar</button>
                          // </li>

                          <li key={d._id} className="break-words">
                            {d.label}
                            {typeof d.bytes === 'number' && d.bytes > 0 && (
                              <span className="text-slate-500"> ({fmtBytes(d.bytes)})</span>
                            )}{' '}
                            — <a
                                  href={normalizePdfUrl(d.url, d.format)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  ver
                                </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(d._id)}
                              className="ml-3 text-red-600 hover:underline"
                            >
                              Eliminar
                            </button>
                          </li>





                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL VISOR - Flechas centradas, teclas ← → */}
              {viewerOpen && vehicle?.photos?.length > 0 && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" ref={viewerRef}>
                  <div className="bg-white rounded-lg max-w-5xl w-full mx-4 p-3 relative">
                    <button className="absolute top-2 right-2 text-slate-700" onClick={closeViewer}>✕</button>
                    <div className="w-full flex items-center justify-between my-2">
                      <div className="flex-1 flex justify-center">
                        <div className="text-sm">{vehicle.photos[viewerIndex]?.title}</div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-2 border rounded bg-white/90"
                        onClick={prevViewer}
                        aria-label="Anterior"
                      >
                        ◀
                      </button>
                      <div className="w-full">
                        {/* Mostrar imagen o video en el visor */}
                        {/^(mp4|mov|webm)$/i.test(vehicle.photos[viewerIndex]?.format || '')
                          ? (
                            <video
                              className="max-h-[75vh] mx-auto rounded border"
                              controls
                              autoPlay
                            >
                              <source src={vehicle.photos[viewerIndex]?.url} />
                            </video>
                          ) : (
                            <img
                              src={vehicle.photos[viewerIndex]?.url}
                              alt={vehicle.photos[viewerIndex]?.title || ''}
                              className="max-h-[75vh] mx-auto object-contain rounded border"
                            />
                          )
                        }
                      </div>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 border rounded bg-white/90"
                        onClick={nextViewer}
                        aria-label="Siguiente"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Auditoría */}
              {id && <AuditBlock vehicleId={id} />}

              <div className="flex justify-end">
                <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
              </div>
            </div>
          )}

          {/* ====================== INVENTARIO / ACCIDENTES / COMBUSTIBLE ====================== */}
          {['INVENTARIO', 'ACCIDENTES', 'COMBUSTIBLE'].includes(tab) && (
            <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
              Este módulo está en desarrollo.
              {/* Auditoría */}
              {id && <AuditBlock vehicleId={id} />}
              <div className="flex justify-end mt-4">
                {readOnly ? (
                  <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
                ) : (
                  <>
                    <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
                      {isDirty ? 'Cancelar' : 'Volver'}
                    </button>
                    <button type="submit" disabled={saving} className="ml-2 px-3 py-2 bg-blue-600 text-white rounded">
                      {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ====================== TICKETS ====================== */}
          {tab === 'TICKETS' && (
            <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
              Este módulo está en desarrollo.
              {/* Si más adelante decides montar <TicketsBlock />:
                 <TicketsBlock vehicleId={id} />
              */}
              {id && <AuditBlock vehicleId={id} />}
              <div className="flex justify-end mt-4">
                {readOnly ? (
                  <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
                ) : (
                  <>
                    <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
                      {isDirty ? 'Cancelar' : 'Volver'}
                    </button>
                    <button type="submit" disabled={saving} className="ml-2 px-3 py-2 bg-blue-600 text-white rounded">
                      {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        {/* </fieldset> */}
      </form>
    </div>
  )
}

