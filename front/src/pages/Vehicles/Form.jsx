// // /**** actualizacion 22/10/2025 13:30??? --- mas optima
// //  */

// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // Ficha de Vehículos (Básico, Técnico, Documentos, Medios, Inventario, Accidentes, Combustible)
// // - Estado: select por catálogo (muestra label, envía code/label como valor). Al final del bloque “Básico”.
// // - Apoyo: bloque “Servicios de Apoyo a otras Sucursales” (selección sucursal → vehículos; iniciar/finalizar).
// // - Fechas legales: 'yyyy-MM-dd' en UI → Date al enviar.
// // - Medios: visor modal con carrusel (click miniatura).
// // -----------------------------------------------------------------------------
// import { useEffect, useMemo, useState } from 'react'
// import { api } from '../../services/http'
// import { useNavigate, useParams } from 'react-router-dom'
// import MediaUploader from '../../components/Vehicle/VehicleMediaUploader'
// import {
//   uploadVehiclePhoto,
//   uploadVehicleDocument,
//   deleteVehiclePhoto,
//   deleteVehicleDocument
// } from '../../api/vehicles.api'

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)
// function ymd(d) {
//   if (!d) return ''
//   const dt = new Date(d)
//   if (Number.isNaN(dt.getTime())) return ''
//   const mm = String(dt.getUTCMonth()+1).padStart(2,'0')
//   const dd = String(dt.getUTCDate()).padStart(2,'0')
//   return `${dt.getUTCFullYear()}-${mm}-${dd}`
// }
// function parseYMD(str) {
//   if (!str) return undefined
//   const [Y,M,D] = str.split('-').map(n=>parseInt(n,10))
//   if (!Y || !M || !D) return undefined
//   return new Date(Date.UTC(Y, M-1, D))
// }
// function naturalSortBranches(list){
//   return [...list].sort((a,b)=>{
//     const an = Number(a.code); const bn = Number(b.code)
//     const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn)
//     if (aIsNum && bIsNum) return an - bn
//     if (aIsNum) return -1
//     if (bIsNum) return 1
//     return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true })
//   })
// }

// export default function VehiclesForm() {
//   const navigate = useNavigate()
//   const { id } = useParams()

//   const [tab, setTab] = useState('BASICO')
//   const [branches, setBranches] = useState([])
//   const [saving, setSaving] = useState(false)
//   const [loading, setLoading] = useState(!!id)
//   const [error, setError] = useState('')
//   const [notice, setNotice] = useState('')
//   const [vehicle, setVehicle] = useState(null)

//   // Estado (catálogo)
//   const [statusOptions, setStatusOptions] = useState([]) // [{value, label}]
//   const [statusLoading, setStatusLoading] = useState(false)

//   // Apoyo
//   const [supportBranch, setSupportBranch] = useState('')
//   const [supportVehicles, setSupportVehicles] = useState([])
//   const [supportTarget, setSupportTarget] = useState('')
//   const [supportBusy, setSupportBusy] = useState(false)
//   const [supportActiveInfo, setSupportActiveInfo] = useState(null) // {from: ISO, code:'XXR'}

//   // Medios -> visor modal
//   const [viewerOpen, setViewerOpen] = useState(false)
//   const [viewerIndex, setViewerIndex] = useState(0)

//   const currentYear = new Date().getFullYear()
//   const YEAR_MIN = 1950
//   const YEAR_MAX = currentYear + 1

//   const [form, setForm] = useState({
//     // Básico
//     plate: '', internalCode: '',
//     type: '', brand: '', model: '', year: '', color: '', branch: '',
//     status: 'ACTIVE',
//     // Técnico
//     vin: '', engineNumber:'', engineBrand:'', engineModel:'', fuelType:'',
//     transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
//     generator: { brand:'', model:'', serial:'' },
//     pump: { brand:'', model:'', serial:'' },
//     body: { brand:'', model:'', serial:'' },
//     meters: { odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
//     // Legal (fechas visibles)
//     legal: {
//       padron:    { number:'', issuer:'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION', validFrom:'', validTo:'' },
//       soap:      { policy:'', issuer:'', validFrom:'', validTo:'' },
//       insurance: { policy:'', issuer:'', validFrom:'', validTo:'' },
//       tag:       { number:'', issuer:'' },
//       fuelCard:  { issuer:'', number:'', validTo:'' },
//     },
//   })

//   // --------- Cargar catálogo de estados ----------
//   useEffect(() => {
//     setStatusLoading(true)
//     api.get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
//       .then(({ data }) => {
//         const list = data?.items || data?.data || []
//         // value: code || label  (interno), label: etiqueta mostrada
//         const opts = list
//           .filter(it => it.active !== false)
//           .sort((a,b)=> (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label))
//           .map(it => ({ value: it.code || it.label, label: it.label }))
//         setStatusOptions(opts)
//       })
//       .finally(()=>setStatusLoading(false))
//   }, [])

//   // --------- Helpers update ----------
//   function update(field, val) {
//     if (field === 'branch' || field === 'year') {
//       setForm(f => ({ ...f, [field]: val }))
//     } else {
//       setForm(f => ({ ...f, [field]: (typeof val === 'string' ? U(val) : val) }))
//     }
//   }
//   function updateNested(path, val) {
//     setForm((f) => {
//       const clone = structuredClone(f)
//       let ref = clone
//       const parts = path.split('.')
//       for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]]
//       const isDatePath = path.startsWith('legal.') && (path.endsWith('validFrom') || path.endsWith('validTo'))
//       ref[parts.at(-1)] = (typeof val === 'string' && !isDatePath ? U(val) : val)
//       return clone
//     })
//   }

//   // --------- Branches ----------
//   useEffect(() => {
//     api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || data?.list || []
//         setBranches(naturalSortBranches(payload))
//         if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.')
//       })
//       .catch(() => setBranches([]))
//   }, [])

//   // --------- Cargar vehículo (edit) ----------
//   useEffect(() => {
//     if (!id) return
//     setLoading(true)
//     api.get(`/api/v1/vehicles/${id}`)
//       .then(({ data }) => {
//         const v = data?.item || data
//         setVehicle(v)
//         // Detectar si hay apoyo activo (última assignment reason APOYO sin endAt)
//         let supportInfo = null
//         const last = Array.isArray(v.assignments) && v.assignments.length ? v.assignments[v.assignments.length - 1] : null
//         if (last && last.reason === 'APOYO' && !last.endAt) {
//           supportInfo = { from: last.startAt, code: v.internalCode }
//         }
//         setSupportActiveInfo(supportInfo)

//         setForm({
//           ...form,
//           plate: v.plate || '',
//           internalCode: v.internalCode || '',
//           type: v.type || '',
//           brand: v.brand || '',
//           model: v.model || '',
//           year: v.year || '',
//           color: v.color || '',
//           branch: v.branch?._id || v.branch || '',
//           status: v.status || 'ACTIVE',
//           vin: v.vin || '',
//           engineNumber: v.engineNumber || '',
//           engineBrand: v.engineBrand || '',
//           engineModel: v.engineModel || '',
//           fuelType: v.fuelType || '',
//           transmission: {
//             type: v.transmission?.type || '',
//             brand: v.transmission?.brand || '',
//             model: v.transmission?.model || '',
//             serial: v.transmission?.serial || '',
//             gears: v.transmission?.gears || '',
//           },
//           generator: { brand: v.generator?.brand || '', model: v.generator?.model || '', serial: v.generator?.serial || '' },
//           pump:      { brand: v.pump?.brand || '',      model: v.pump?.model || '',      serial: v.pump?.serial || '' },
//           body:      { brand: v.body?.brand || '',      model: v.body?.model || '',      serial: v.body?.serial || '' },
//           meters: {
//             odometerKm: v.meters?.odometerKm ?? '',
//             engineHours: v.meters?.engineHours ?? '',
//             ladderHours: v.meters?.ladderHours ?? '',
//             generatorHours: v.meters?.generatorHours ?? '',
//             pumpHours: v.meters?.pumpHours ?? '',
//           },
//           legal: {
//             padron:    { number: v.legal?.padron?.number || '', issuer: v.legal?.padron?.issuer || 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION', validFrom: ymd(v.legal?.padron?.validFrom), validTo: ymd(v.legal?.padron?.validTo) },
//             soap:      { policy: v.legal?.soap?.policy || '', issuer: v.legal?.soap?.issuer || '', validFrom: ymd(v.legal?.soap?.validFrom), validTo: ymd(v.legal?.soap?.validTo) },
//             insurance: { policy: v.legal?.insurance?.policy || '', issuer: v.legal?.insurance?.issuer || '', validFrom: ymd(v.legal?.insurance?.validFrom), validTo: ymd(v.legal?.insurance?.validTo) },
//             tag:       { number: v.legal?.tag?.number || '', issuer: v.legal?.tag?.issuer || '' },
//             fuelCard:  { issuer: v.legal?.fuelCard?.issuer || '', number: v.legal?.fuelCard?.number || '', validTo: ymd(v.legal?.fuelCard?.validTo) },
//           }
//         })
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
//       .finally(() => setLoading(false))
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id])

//   // --------- Guardar ----------
//   async function handleSubmit(e) {
//     e.preventDefault()
//     setSaving(true); setError('')

//     try {
//       const reqFields = ['plate','internalCode','status','type','brand','model','year','color','branch']
//       for (const k of reqFields) {
//         if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`)
//       }
//       const yearNum = Number(form.year)
//       if (!Number.isFinite(yearNum) || yearNum < YEAR_MIN || yearNum > YEAR_MAX) {
//         throw new Error(`Año inválido. Debe estar entre ${YEAR_MIN} y ${YEAR_MAX}.`)
//       }

//       // Payload
//       const payload = structuredClone(form)
//       // Fechas a Date
//       payload.legal.padron.validFrom    = parseYMD(form.legal.padron.validFrom)
//       payload.legal.padron.validTo      = parseYMD(form.legal.padron.validTo)
//       payload.legal.soap.validFrom      = parseYMD(form.legal.soap.validFrom)
//       payload.legal.soap.validTo        = parseYMD(form.legal.soap.validTo)
//       payload.legal.insurance.validFrom = parseYMD(form.legal.insurance.validFrom)
//       payload.legal.insurance.validTo   = parseYMD(form.legal.insurance.validTo)
//       payload.legal.fuelCard.validTo    = parseYMD(form.legal.fuelCard.validTo)

//       // Uppercase inteligente
//       const up = (obj) => {
//         if (!obj || typeof obj !== 'object') return obj
//         const out = Array.isArray(obj) ? [] : {}
//         for (const k of Object.keys(obj)) {
//           const v = obj[k]
//           const isBranch = k === 'branch'
//           const isDateKey = ['validFrom','validTo'].includes(k)
//           if (typeof v === 'string' && !isBranch && !isDateKey) out[k] = U(v)
//           else if (v && typeof v === 'object') out[k] = up(v)
//           else out[k] = v
//         }
//         return out
//       }
//       const finalPayload = up(payload)
//       finalPayload.year = yearNum
//       if (finalPayload.transmission?.gears) {
//         finalPayload.transmission.gears = Number(finalPayload.transmission.gears)
//       }

//       if (id) {
//         await api.patch(`/api/v1/vehicles/${id}`, finalPayload)
//         alert('Vehículo actualizado con éxito')
//       } else {
//         await api.post('/api/v1/vehicles', finalPayload)
//         alert('Vehículo creado con éxito')
//       }
//       navigate('/vehicles')
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || 'Datos inválidos'
//       setError(msg)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // --------- Medios ----------
//   const canUpload = useMemo(()=>Boolean(id), [id])
//   const refresh = async ()=> {
//     if (!id) return
//     const { data } = await api.get(`/api/v1/vehicles/${id}`)
//     setVehicle(data?.item || data)
//   }
//   const handleUploadPhoto = async ({ file, category='BASIC', title='' }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir medios')
//     await uploadVehiclePhoto(id, { file, category, title })
//     await refresh()
//   }
//   const handleUploadDoc = async ({ file, category, label }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
//     await uploadVehicleDocument(id, { file, category, label })
//     await refresh()
//   }
//   const handleDeletePhoto = async (photoId) => {
//     if (!confirm('¿Eliminar foto?')) return
//     await deleteVehiclePhoto(id, photoId)
//     await refresh()
//   }
//   const handleDeleteDoc = async (docId) => {
//     if (!confirm('¿Eliminar documento?')) return
//     await deleteVehicleDocument(id, docId)
//     await refresh()
//   }

//   // --------- Apoyo (UI) ----------
//   // Cargar vehículos por sucursal seleccionada
//   useEffect(() => {
//     if (!supportBranch) { setSupportVehicles([]); setSupportTarget(''); return }
//     api.get('/api/v1/vehicles', { params: { page:1, limit:500, branch: supportBranch } })
//       .then(({ data }) => {
//         const items = data?.items || data?.data || []
//         setSupportVehicles(items)
//       })
//   }, [supportBranch])

//   // reemplazar
//   // async function startSupport() {
//   //   if (!id || !supportBranch || !supportTarget) return alert('Selecciona sucursal y vehículo objetivo.')
//   //   setSupportBusy(true)
//   //   try {
//   //     await api.post(`/api/v1/vehicles/${id}/support/start`, {
//   //       targetBranchId: supportBranch,
//   //       targetVehicleId: supportTarget,
//   //     })
  
//   //     const { data } = await api.get(`/api/v1/vehicles/${id}`)
//   //     setVehicle(data)
//   //     // marca UI
//   //     setSupportActiveInfo({ from: new Date().toISOString(), code: (data.internalCode || '') })
//   //     alert('Reemplazo iniciado')
//   //   } catch (e) {
//   //     alert(e?.response?.data?.message || 'No se pudo iniciar el reemplazo')
//   //   } finally {
//   //     setSupportBusy(false)
//   //   }
//   // }

//   async function startSupport() {
//   if (!id || !supportBranch || !supportTarget) {
//     return alert('Selecciona sucursal y vehículo objetivo.');
//   }
//   // protección básica en UI (también validado en back)
//   if (supportTarget === id) {
//     return alert('Un vehículo no puede reemplazarse a sí mismo.');
//   }

//   setSupportBusy(true);
//   try {
//     // ⚠️ NOMBRES ALINEADOS CON EL BACK: targetBranch / targetVehicle
//     await api.post(`/api/v1/vehicles/${id}/support/start`, {
//       targetBranch: supportBranch,
//       targetVehicle: supportTarget,
//     });
//     alert('Reemplazo iniciado');
//     // volver al listado como pediste
//     navigate('/vehicles');
//   } catch (e) {
//     alert(e?.response?.data?.message || 'No se pudo iniciar el reemplazo');
//   } finally {
//     setSupportBusy(false);
//   }
// }
    
  
//   // fin Reemplazo
//   async function finishSupport() {
//     if (!id) return
//     setSupportBusy(true)
//     try {
//       await api.post(`/api/v1/vehicles/${id}/support/finish`)
//       await refresh()
//       setSupportActiveInfo(null)
//       setSupportBranch(''); setSupportVehicles([]); setSupportTarget('')
//       alert('Reemplazo finalizado')
//     } catch (e) {
//       alert(e?.response?.data?.message || 'No se pudo finalizar el reemplazo')
//     } finally {
//       setSupportBusy(false)
//     }
//   }

//   // --------- Visor modal (carrusel) ----------
//   function openViewer(idx) { setViewerIndex(idx); setViewerOpen(true) }
//   function closeViewer() { setViewerOpen(false) }
//   function prevViewer() {
//     if (!vehicle?.photos?.length) return
//     setViewerIndex((viewerIndex - 1 + vehicle.photos.length) % vehicle.photos.length)
//   }
//   function nextViewer() {
//     if (!vehicle?.photos?.length) return
//     setViewerIndex((viewerIndex + 1) % vehicle.photos.length)
//   }

//   if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
//       <header className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
//           <p className="text-sm text-slate-500">Los textos se guardan en MAYÚSCULAS.</p>
//         </div>
//         <nav className="flex gap-2">
//           {['BASICO','TECNICO','DOCUMENTOS','MEDIOS','INVENTARIO','ACCIDENTES','COMBUSTIBLE'].map(t=>(
//             <button type="button" key={t}
//               onClick={()=>setTab(t)}
//               className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.25)]':'bg-white border'}`}>
//               {t==='BASICO'?'Básico':t==='TECNICO'?'Técnico':t==='DOCUMENTOS'?'Documentos':t==='MEDIOS'?'Medios':t}
//             </button>
//           ))}
//         </nav>
//       </header>

//       {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

//       {/* ====================== BASICO ====================== */}
//       {tab==='BASICO' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Información básica</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {[
//                 ['Placa / Patente','plate','ABC-123','text'],
//                 ['Código interno','internalCode','B:10','text'],
//                 ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN...','text'],
//                 ['Marca','brand','SCANIA','text'],
//                 ['Modelo','model','P340','text'],
//               ].map(([label, key, ph, type])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     type={type}
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                     placeholder={ph}
//                     required
//                   />
//                 </div>
//               ))}

//               {/* Año */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
//                 <input
//                   type="number"
//                   min={YEAR_MIN}
//                   max={YEAR_MAX}
//                   value={form.year}
//                   onChange={(e)=>update('year', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                   placeholder={String(currentYear)}
//                   required
//                 />
//                 <p className="text-xs text-slate-500 mt-1">Permitido: {YEAR_MIN}–{YEAR_MAX}</p>
//               </div>

//               {/* Color */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
//                 <input
//                   type="text"
//                   value={form.color}
//                   onChange={(e)=>update('color', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                   placeholder="ROJO"
//                   required
//                 />
//               </div>

//               {/* Sucursal */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
//                 <select
//                   required
//                   value={form.branch}
//                   onChange={(e)=>update('branch', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
//                 >
//                   <option value="" disabled>Selecciona sucursal</option>
//                   {branches.map(b=>(
//                     <option key={b._id} value={b._id}>
//                       {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Estado (AL FINAL del bloque) */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
//                 <select
//                   required
//                   disabled={statusLoading}
//                   value={form.status}
//                   onChange={(e)=>update('status', e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                 >
//                   <option value="" disabled>Selecciona estado</option>
//                   {statusOptions.map(opt=>(
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* ====================== APOYO A OTRAS SUCURSALES ====================== */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Servicios de Apoyo a otras Sucursales</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//               {/* Sucursal destino */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal objetivo</label>
//                 <select
//                   value={supportBranch}
//                   onChange={(e)=>setSupportBranch(e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                 >
//                   <option value="">— Selecciona sucursal —</option>
//                   {branches.map(b=>(
//                     <option key={b._id} value={b._id}>
//                       {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {/* Vehículo de esa sucursal */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Vehículo a reemplazar</label>
//                 <select
//                   value={supportTarget}
//                   onChange={(e)=>setSupportTarget(e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                   disabled={!supportBranch}
//                 >
//                   <option value="">— Selecciona vehículo —</option>
//                   {supportVehicles.map(v=>(
//                     <option key={v._id} value={v._id}>
//                       {v.internalCode || v.plate || v._id} — {v.brand} {v.model}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {/* Botón acción */}
//               <div className="flex gap-2">
//                 {supportActiveInfo ? (
//                   <button
//                     type="button"
//                     onClick={finishSupport}
//                     disabled={supportBusy}
//                     className="px-3 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
//                   >
//                     {supportBusy ? 'Finalizando…' : 'Finalizar reemplazo'}
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={startSupport}
//                     disabled={supportBusy || !supportBranch || !supportTarget}
//                     className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//                   >
//                     {supportBusy ? 'Iniciando…' : 'Iniciar reemplazo'}
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Etiquetas de estado de reemplazo */}
//             {supportActiveInfo && (
//               <div className="px-4 pb-4">
//                 <div className="text-sm text-slate-600">
//                   En reemplazo desde: {new Date(supportActiveInfo.from).toLocaleString()}
//                 </div>
//                 <div className="text-red-700 font-extrabold text-lg">
//                   {supportActiveInfo.code}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Cancelar</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

      

      

//       {/* ====================== TECNICO ====================== */}
//       {tab==='TECNICO' && (
//         <div className="space-y-4">
//           {/* Motor */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Motor</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {[
//                 ['VIN','vin',''],
//                 ['N° Motor','engineNumber',''],
//                 ['Marca Motor','engineBrand',''],
//                 ['Modelo Motor','engineModel',''],
//                 ['Combustible','fuelType','DIESEL/GASOLINA'],
//               ].map(([label,key,ph])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded"
//                     placeholder={ph}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Transmisión */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Transmisión</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//               {[
//                 ['Tipo','transmission.type','MANUAL/AUTOMATIC/AMT/CVT'],
//                 ['Marca','transmission.brand','ALLISON/ZF/EATON'],
//                 ['Modelo','transmission.model','4500 RDS'],
//                 ['Serie','transmission.serial',''],
//                 ['Marchas','transmission.gears','6','text'],
//               ].map(([label,path,ph,type])=>{
//                 const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
//                 return (
//                   <div key={path}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                     <input
//                       type={type||'text'}
//                       value={val}
//                       onChange={(e)=>updateNested(path, e.target.value)}
//                       className="w-full border p-2 rounded"
//                       placeholder={ph}
//                     />
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           {/* Medidores */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Medidores</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//               {[
//                 ['Odómetro (km)','meters.odometerKm','0'],
//                 ['Horómetro motor (h)','meters.engineHours','0'],
//                 ['Horas escala (h)','meters.ladderHours','0'],
//                 ['Horas generador (h)','meters.generatorHours','0'],
//                 ['Horas cuerpo bomba (h)','meters.pumpHours','0'],
//               ].map(([label,path,ph])=>{
//                 const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
//                 return (
//                   <div key={path}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                     <input
//                       value={val}
//                       onChange={(e)=>updateNested(path, e.target.value)}
//                       className="w-full border p-2 rounded"
//                       placeholder={ph}
//                     />
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           {/* Equipos */}
//           {[
//             ['Generador','generator'],
//             ['Motobomba','pump'],
//             ['Cuerpo de bomba','body'],
//           ].map(([title, key])=>(
//             <div className="bg-white shadow rounded-xl border" key={key}>
//               <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                 <h3 className="font-medium text-slate-700">{title}</h3>
//               </div>
//               <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {['brand','model','serial'].map((f)=>(
//                   <div key={f}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{f==='brand'?'Marca':f==='model'?'Modelo':'Serie'}</label>
//                     <input
//                       value={form[key]?.[f] ?? ''}
//                       onChange={(e)=>updateNested(`${key}.${f}`, e.target.value)}
//                       className="w-full border p-2 rounded"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ====================== DOCUMENTOS ====================== */}
//       {tab==='DOCUMENTOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Legal</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 gap-6">
//               {/* Padrón */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Padrón | N°</label>
//                   <input maxLength={12} value={form.legal.padron.number} onChange={(e)=>updateNested('legal.padron.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.padron.issuer} onChange={(e)=>updateNested('legal.padron.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                   <input type="date" value={form.legal.padron.validFrom || ''} onChange={(e)=>updateNested('legal.padron.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fin</label>
//                   <input type="date" value={form.legal.padron.validTo || ''} onChange={(e)=>updateNested('legal.padron.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* SOAP */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">SOAP | Póliza</label>
//                   <input value={form.legal.soap.policy} onChange={(e)=>updateNested('legal.soap.policy', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
//                   <input value={form.legal.soap.issuer} onChange={(e)=>updateNested('legal.soap.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                   <input type="date" value={form.legal.soap.validFrom || ''} onChange={(e)=>updateNested('legal.soap.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fin</label>
//                   <input type="date" value={form.legal.soap.validTo || ''} onChange={(e)=>updateNested('legal.soap.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* Seguro */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Seguro | Póliza</label>
//                   <input value={form.legal.insurance.policy} onChange={(e)=>updateNested('legal.insurance.policy', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
//                   <input value={form.legal.insurance.issuer} onChange={(e)=>updateNested('legal.insurance.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                   <input type="date" value={form.legal.insurance.validFrom || ''} onChange={(e)=>updateNested('legal.insurance.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fin</label>
//                   <input type="date" value={form.legal.insurance.validTo || ''} onChange={(e)=>updateNested('legal.insurance.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* TAG */}
//               <div className="grid sm:grid-cols-3 gap-3 items-end">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">TAG | N°</label>
//                   <input value={form.legal.tag.number} onChange={(e)=>updateNested('legal.tag.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.tag.issuer} onChange={(e)=>updateNested('legal.tag.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* Tarjeta combustible */}
//               <div className="grid sm:grid-cols-3 gap-3 items-end">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Tarj. combustible | Emisor</label>
//                   <input value={form.legal.fuelCard.issuer} onChange={(e)=>updateNested('legal.fuelCard.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">N° Tarjeta</label>
//                   <input value={form.legal.fuelCard.number} onChange={(e)=>updateNested('legal.fuelCard.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Vence</label>
//                   <input type="date" value={form.legal.fuelCard.validTo || ''} onChange={(e)=>updateNested('legal.fuelCard.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>
//             </div>

//             <div className="px-4 pb-4 text-sm text-slate-500">
//               La carga de documentos se realiza en la pestaña <b>Medios</b>.
//             </div>
//           </div>

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ====================== MEDIOS ====================== */}
//       {tab==='MEDIOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
//             </div>
//             <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 ['Básico (vehículo)','BASIC','photo'],
//                 ['Motor','ENGINE','photo'],
//                 ['Transmisión','TRANSMISSION','photo'],
//                 ['Generador','GENERATOR','photo'],
//                 ['Motobomba','PUMP','photo'],
//                 ['Cuerpo de bomba','BODY','photo'],
//                 ['Documentos (legal)','LEGAL','doc'],
//                 ['Manuales','MANUALS','doc'],
//                 ['Partes','PARTS','doc'],
//               ].map(([label,cat,mode])=>(
//                 <div key={cat} className="border rounded-lg p-3">
//                   <div className="font-medium mb-2">{label}</div>
//                   <MediaUploader
//                     onUpload={(p)=> mode==='doc'
//                       ? handleUploadDoc({ ...p, category:cat })
//                       : handleUploadPhoto({ ...p, category:cat })}
//                     accept={mode==='doc' ? 'application/pdf,image/*' : 'image/*,video/*'}
//                     category={cat}
//                     mode={mode}
//                   />
//                   {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Contenido actual */}
//           {vehicle && (
//             <div className="bg-white shadow rounded-xl border">
//               <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                 <h3 className="font-medium text-slate-700">Contenido actual</h3>
//               </div>
//               <div className="p-4 grid gap-6">
//                 {/* Fotos/Videos */}
//                 <div>
//                   <div className="font-medium mb-1">Fotos / Videos</div>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
//                     {(vehicle.photos||[]).map((ph,idx)=>(
//                       <div key={ph._id} className="text-xs">
//                         {/^mp4|mov|webm$/i.test(ph.format || '') ? (
//                           <video className="w-full h-24 rounded border object-cover" controls>
//                             <source src={ph.url} />
//                           </video>
//                         ) : (
//                           <img
//                             src={ph.url}
//                             alt={ph.title||''}
//                             className="w-full h-24 object-cover rounded border cursor-pointer"
//                             onClick={()=>openViewer(idx)}
//                           />
//                         )}
//                         <div className="mt-1 break-words">{ph.title}</div>
//                         <button
//                           type="button"
//                           onClick={()=>handleDeletePhoto(ph._id)}
//                           className="mt-1 text-red-600 hover:underline"
//                         >Eliminar</button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {/* Documentos/PDF */}
//                 <div>
//                   <div className="font-medium mb-1">Documentos</div>
//                   <ul className="list-disc pl-5 text-sm space-y-1">
//                     {(vehicle.documents||[]).map(d=>(
//                       <li key={d._id} className="break-words">
//                         {d.label} — <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ver</a>
//                         <button
//                           type="button"
//                           onClick={()=>handleDeleteDoc(d._id)}
//                           className="ml-3 text-red-600 hover:underline"
//                         >Eliminar</button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* MODAL VISOR */}
//           {viewerOpen && vehicle?.photos?.length > 0 && (
//             <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
//               <div className="bg-white rounded-lg max-w-4xl w-full mx-4 p-3 relative">
//                 <button className="absolute top-2 right-2 text-slate-700" onClick={closeViewer}>✕</button>
//                 <div className="flex items-center justify-between mb-3">
//                   <button className="px-3 py-1 border rounded" onClick={prevViewer}>◀</button>
//                   <div className="text-sm">{vehicle.photos[viewerIndex]?.title}</div>
//                   <button className="px-3 py-1 border rounded" onClick={nextViewer}>▶</button>
//                 </div>
//                 <div className="w-full">
//                   <img
//                     src={vehicle.photos[viewerIndex]?.url}
//                     alt={vehicle.photos[viewerIndex]?.title || ''}
//                     className="max-h-[70vh] mx-auto object-contain"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-end">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//           </div>
//         </div>
//       )}

//       {/* ESQUELETOS VISIBLES */}
//       {['INVENTARIO','ACCIDENTES','COMBUSTIBLE'].includes(tab) && (
//         <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//           Este módulo está en desarrollo.
//         </div>
//       )}
//     </form>
//   )
// }







// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // Ficha de Vehículos (Básico, Técnico, Documentos, Medios, Inventario, Accidentes,
// // Combustible, Tickets)
// // Ajustes incluidos en esta versión:
// // 1) Pestaña "Tickets" con placeholder "Este módulo está en desarrollo."
// // 2) Auditoría mixta (5 + "ver más") al fondo de *todas* las pestañas, con detalle
// //    from → to para START/FINISH de reemplazo.
// // 3) Validación de cambios: si hay modificaciones sin guardar y el usuario intenta
// //    cambiar de pestaña interna, navegar a otra ruta (enlaces <a>) o recargar/cerrar,
// //    se solicita confirmación. (Guard mínimo autocontenido; ver comentario en
// //    "Navegación protegida").
// // 4) Básico: botón inferior adaptativo: "Volver" (sin cambios) ↔ "Cancelar" (con cambios).
// // 5) Reemplazos (Servicios de Apoyo):
// //    - Evita reemplazar el mismo vehículo.
// //    - Evita reemplazar un vehículo que ya está en reemplazo.
// //    - Cambia estados a SUPPORT (APOYO REEMPLAZO) y OUT_OF_SERVICE (FUERA DE SERVICIO).
// //    - Al iniciar reemplazo, redirige a la lista de vehículos.
// // 6) Documentos:
// //    - Estructura Padrón: number, issuer, acquiredAt, registeredAt, issuedAt.
// //    - Revisión técnica: number, issuer, reviewedAt, validTo.
// //    - Permiso de circulación: number, issuer, reviewedAt, validTo.
// //    - Parseo de fechas antes de guardar.
// // 7) Medios:
// //    - Todas las categorías aceptan imágenes y documentos (pdf).
// //    - Visor centrado: flechas en el centro, control con ← →, soporte video.
// //    - "Ver" en documentos abre en nueva pestaña.
// // 8) Scroll independiente del menú: este archivo no toca layout; necesitas asegurar
// //    en tu layout contenedor que el sidebar y el área central tengan cada uno
// //    su propio overflow-y:auto. (Ej.: wrapper: flex h-screen; sidebar: h-screen overflow-y-auto;
// //    main: flex-1 h-screen overflow-y-auto). No se modifica aquí para no romper tu layout.
// //
// // NOTA: Requiere que el backend exponga /support/start y /support/finish tal como
// // ya dejaste en vehicles.controller.js (nombres de campos: targetBranch, targetVehicle).
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useRef, useState } from 'react'
// import { api } from '../../services/http'
// import { useNavigate, useParams } from 'react-router-dom'
// import MediaUploader from '../../components/Vehicle/VehicleMediaUploader'
// import {
//   uploadVehiclePhoto,
//   uploadVehicleDocument,
//   deleteVehiclePhoto,
//   deleteVehicleDocument
// } from '../../api/vehicles.api'


// // ==================== Utils ====================
// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

// function ymd(d) {
//   if (!d) return ''
//   const dt = new Date(d)
//   if (Number.isNaN(dt.getTime())) return ''
//   const mm = String(dt.getUTCMonth()+1).padStart(2,'0')
//   const dd = String(dt.getUTCDate()).padStart(2,'0')
//   return `${dt.getUTCFullYear()}-${mm}-${dd}`
// }
// function parseYMD(str) {
//   if (!str) return undefined
//   const [Y,M,D] = str.split('-').map(n=>parseInt(n,10))
//   if (!Y || !M || !D) return undefined
//   return new Date(Date.UTC(Y, M-1, D))
// }
// function naturalSortBranches(list){
//   return [...list].sort((a,b)=>{
//     const an = Number(a.code); const bn = Number(b.code)
//     const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn)
//     if (aIsNum && bIsNum) return an - bn
//     if (aIsNum) return -1
//     if (bIsNum) return 1
//     return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true })
//   })
// }

// // ==================== Componente Auditoría ====================
// // Auditoría mixta: muestra los 5 más recientes y luego "ver más" para expandir todo.
// function AuditBlock({ vehicleId }) {
//   const [items, setItems] = useState([])
//   const [total, setTotal] = useState(0)
//   const [expanded, setExpanded] = useState(false)
//   const PAGE_LIMIT = 100 // traemos holgado para no paginar en UI

//   useEffect(() => {
//     if (!vehicleId) return
//     api.get(`/api/v1/vehicles/${vehicleId}/audit`, { params: { page: 1, limit: PAGE_LIMIT } })
//       .then(({ data }) => {
//         const list = data?.items || data?.data || []
//         setItems(list)
//         setTotal(data?.total ?? list.length)
//       })
//       .catch(() => { setItems([]); setTotal(0) })
//   }, [vehicleId])

//   const toShow = expanded ? items : items.slice(0, 5)

//   return (
//     <div className="mt-6 border-t pt-4">
//       <div className="font-medium text-slate-700 mb-2">Auditoría</div>
//       {toShow.length === 0 ? (
//         <div className="text-sm text-slate-500">Sin movimientos registrados.</div>
//       ) : (
//         <ul className="space-y-2 text-sm">
//           {toShow.map((it, idx) => (
//             <li key={idx} className="flex items-start gap-2">
//               <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
//                 {it.action}
//               </span>
//               <div className="flex-1">
//                 <div className="text-slate-800">
//                   {it?.data?.detail
//                     ? it.data.detail // p.ej. "B-10 → RX-15R"
//                     : it?.data?.message || JSON.stringify(it?.data || {})}
//                 </div>
//                 <div className="text-slate-500 text-xs">
//                   {it.by ? `${it.by} — ` : ''}{new Date(it.at).toLocaleString()}
//                 </div>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//       {total > 5 && (
//         <button
//           type="button"
//           onClick={()=>setExpanded(v=>!v)}
//           className="mt-2 text-blue-600 hover:underline text-sm"
//         >
//           {expanded ? 'Ver menos' : `Ver más (${total - 5})`}
//         </button>
//       )}
//     </div>
//   )
// }

// // ==================== Form principal ====================
// export default function VehiclesForm() {
//   const navigate = useNavigate()
//   const { id } = useParams()

//   const [tab, setTab] = useState('BASICO')
//   const [branches, setBranches] = useState([])
//   const [saving, setSaving] = useState(false)
//   const [loading, setLoading] = useState(!!id)
//   const [error, setError] = useState('')
//   const [notice, setNotice] = useState('')
//   const [vehicle, setVehicle] = useState(null)

//   // Estado (catálogo)
//   const [statusOptions, setStatusOptions] = useState([]) // [{value, label}]
//   const [statusLoading, setStatusLoading] = useState(false)
//   // Mapa para mostrar etiqueta desde code
//   const statusMapRef = useRef({}) // code -> label

//   // Apoyo
//   const [supportBranch, setSupportBranch] = useState('')
//   const [supportVehicles, setSupportVehicles] = useState([])
//   const [supportTarget, setSupportTarget] = useState('')
//   const [supportBusy, setSupportBusy] = useState(false)
//   const [supportActiveInfo, setSupportActiveInfo] = useState(null) // {from: ISO, code:'XXR'}

//   // Visor medios
//   const [viewerOpen, setViewerOpen] = useState(false)
//   const [viewerIndex, setViewerIndex] = useState(0)

//   const currentYear = new Date().getFullYear()
//   const YEAR_MIN = 1950
//   const YEAR_MAX = currentYear + 1

//   // ---------- Form State ----------
//   const [form, setForm] = useState({
//     // Básico
//     plate: '', internalCode: '',
//     type: '', brand: '', model: '', year: '', color: '', branch: '',
//     status: 'ACTIVE',
//     // Técnico
//     vin: '', engineNumber:'', engineBrand:'', engineModel:'', fuelType:'',
//     transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
//     generator: { brand:'', model:'', serial:'' },
//     pump: { brand:'', model:'', serial:'' },
//     body: { brand:'', model:'', serial:'' },
//     meters: { odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
//     // Legal / Documentos (fechas visibles: yyyy-MM-dd)
//     legal: {
//       padron: {
//         number:'', issuer:'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION',
//         acquiredAt:'', registeredAt:'', issuedAt:''
//       },
//       soap:      { policy:'', issuer:'', validFrom:'', validTo:'' },
//       insurance: { policy:'', issuer:'', validFrom:'', validTo:'' },
//       tag:       { number:'', issuer:'' },

//       // Tarjeta combustible (se mantiene)
//       fuelCard:  { issuer:'', number:'', validTo:'' },

//       // NUEVO: Revisión técnica
//       technicalReview: { number:'', issuer:'', reviewedAt:'', validTo:'' },
//       // NUEVO: Permiso de circulación
//       circulationPermit: { number:'', issuer:'', reviewedAt:'', validTo:'' },
//     },
//   })

//   // ---- Para detectar cambios no guardados ----
//   const [initialForm, setInitialForm] = useState(null)
//   const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm || form)

//   // --------- Cargar catálogo de estados ----------
//   useEffect(() => {
//     setStatusLoading(true)
//     api.get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
//       .then(({ data }) => {
//         const list = data?.items || data?.data || []
//         const opts = list
//           .filter(it => it.active !== false)
//           .sort((a,b)=> (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label))
//           .map(it => ({ value: it.code || it.label, label: it.label }))
//         setStatusOptions(opts)
//         // code -> label
//         const map = {}
//         for (const it of list) map[it.code || it.label] = it.label
//         statusMapRef.current = map
//       })
//       .finally(()=>setStatusLoading(false))
//   }, [])

//   // --------- Helpers update ----------
//   function update(field, val) {
//     if (field === 'branch' || field === 'year') {
//       setForm(f => ({ ...f, [field]: val }))
//     } else {
//       setForm(f => ({ ...f, [field]: (typeof val === 'string' ? U(val) : val) }))
//     }
//   }
//   function updateNested(path, val) {
//     setForm((f) => {
//       const clone = structuredClone(f)
//       let ref = clone
//       const parts = path.split('.')
//       for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]]
//       const isDatePath =
//         path.startsWith('legal.') &&
//         (path.endsWith('At') || path.endsWith('validFrom') || path.endsWith('validTo'))
//       ref[parts.at(-1)] = (typeof val === 'string' && !isDatePath ? U(val) : val)
//       return clone
//     })
//   }

//   // --------- Branches ----------
//   useEffect(() => {
//     api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || data?.list || []
//         setBranches(naturalSortBranches(payload))
//         if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.')
//       })
//       .catch(() => setBranches([]))
//   }, [])

//   // --------- Cargar vehículo (edit) ----------
//   useEffect(() => {
//     if (!id) {
//       setInitialForm(null)
//       return
//     }
//     setLoading(true)
//     api.get(`/api/v1/vehicles/${id}`)
//       .then(({ data }) => {
//         const v = data?.item || data
//         setVehicle(v)
//         // Detectar si hay apoyo activo (última assignment reason APOYO sin endAt)
//         let supportInfo = null
//         const last = Array.isArray(v.assignments) && v.assignments.length ? v.assignments[v.assignments.length - 1] : null
//         if (last && last.reason === 'APOYO' && !last.endAt) {
//           supportInfo = { from: last.startAt, code: v.internalCode }
//         }
//         setSupportActiveInfo(supportInfo)

//         // Cargar al form, mapeando nuevas fechas/documentos
//         const nextForm = {
//           ...form,
//           plate: v.plate || '',
//           internalCode: v.internalCode || '',
//           type: v.type || '',
//           brand: v.brand || '',
//           model: v.model || '',
//           year: v.year || '',
//           color: v.color || '',
//           branch: v.branch?._id || v.branch || '',
//           status: v.status || 'ACTIVE',
//           vin: v.vin || '',
//           engineNumber: v.engineNumber || '',
//           engineBrand: v.engineBrand || '',
//           engineModel: v.engineModel || '',
//           fuelType: v.fuelType || '',
//           transmission: {
//             type: v.transmission?.type || '',
//             brand: v.transmission?.brand || '',
//             model: v.transmission?.model || '',
//             serial: v.transmission?.serial || '',
//             gears: v.transmission?.gears || '',
//           },
//           generator: { brand: v.generator?.brand || '', model: v.generator?.model || '', serial: v.generator?.serial || '' },
//           pump:      { brand: v.pump?.brand || '',      model: v.pump?.model || '',      serial: v.pump?.serial || '' },
//           body:      { brand: v.body?.brand || '',      model: v.body?.model || '',      serial: v.body?.serial || '' },
//           meters: {
//             odometerKm: v.meters?.odometerKm ?? '',
//             engineHours: v.meters?.engineHours ?? '',
//             ladderHours: v.meters?.ladderHours ?? '',
//             generatorHours: v.meters?.generatorHours ?? '',
//             pumpHours: v.meters?.pumpHours ?? '',
//           },
//           legal: {
//             padron: {
//               number: v.legal?.padron?.number || '',
//               issuer: v.legal?.padron?.issuer || 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION',
//               acquiredAt: ymd(v.legal?.padron?.acquiredAt),
//               registeredAt: ymd(v.legal?.padron?.registeredAt),
//               issuedAt: ymd(v.legal?.padron?.issuedAt),
//             },
//             soap:      { policy: v.legal?.soap?.policy || '', issuer: v.legal?.soap?.issuer || '', validFrom: ymd(v.legal?.soap?.validFrom), validTo: ymd(v.legal?.soap?.validTo) },
//             insurance: { policy: v.legal?.insurance?.policy || '', issuer: v.legal?.insurance?.issuer || '', validFrom: ymd(v.legal?.insurance?.validFrom), validTo: ymd(v.legal?.insurance?.validTo) },
//             tag:       { number: v.legal?.tag?.number || '', issuer: v.legal?.tag?.issuer || '' },
//             fuelCard:  { issuer: v.legal?.fuelCard?.issuer || '', number: v.legal?.fuelCard?.number || '', validTo: ymd(v.legal?.fuelCard?.validTo) },
//             technicalReview: {
//               number: v.legal?.technicalReview?.number || '',
//               issuer: v.legal?.technicalReview?.issuer || '',
//               reviewedAt: ymd(v.legal?.technicalReview?.reviewedAt),
//               validTo: ymd(v.legal?.technicalReview?.validTo),
//             },
//             circulationPermit: {
//               number: v.legal?.circulationPermit?.number || '',
//               issuer: v.legal?.circulationPermit?.issuer || '',
//               reviewedAt: ymd(v.legal?.circulationPermit?.reviewedAt),
//               validTo: ymd(v.legal?.circulationPermit?.validTo),
//             },
//           }
//         }

//         setForm(nextForm)
//         // congelamos "estado inicial" para detectar cambios
//         setInitialForm(structuredClone(nextForm))
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
//       .finally(() => setLoading(false))
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id])

//   // --------- Guardar ----------
//   async function handleSubmit(e) {
//     e.preventDefault()
//     setSaving(true); setError('')

//     try {
//       const reqFields = ['plate','internalCode','status','type','brand','model','year','color','branch']
//       for (const k of reqFields) {
//         if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`)
//       }
//       const yearNum = Number(form.year)
//       if (!Number.isFinite(yearNum) || yearNum < YEAR_MIN || yearNum > YEAR_MAX) {
//         throw new Error(`Año inválido. Debe estar entre ${YEAR_MIN} y ${YEAR_MAX}.`)
//       }

//       // Payload + fechas -> Date
//       const payload = structuredClone(form)
//       // Padrón
//       payload.legal.padron.acquiredAt  = parseYMD(form.legal.padron.acquiredAt)
//       payload.legal.padron.registeredAt= parseYMD(form.legal.padron.registeredAt)
//       payload.legal.padron.issuedAt    = parseYMD(form.legal.padron.issuedAt)
//       // SOAP / Insurance
//       payload.legal.soap.validFrom      = parseYMD(form.legal.soap.validFrom)
//       payload.legal.soap.validTo        = parseYMD(form.legal.soap.validTo)
//       payload.legal.insurance.validFrom = parseYMD(form.legal.insurance.validFrom)
//       payload.legal.insurance.validTo   = parseYMD(form.legal.insurance.validTo)
//       // Fuel card
//       payload.legal.fuelCard.validTo    = parseYMD(form.legal.fuelCard.validTo)
//       // Nueva: Revisión técnica
//       payload.legal.technicalReview.reviewedAt = parseYMD(form.legal.technicalReview.reviewedAt)
//       payload.legal.technicalReview.validTo    = parseYMD(form.legal.technicalReview.validTo)
//       // Nueva: Permiso circulación
//       payload.legal.circulationPermit.reviewedAt = parseYMD(form.legal.circulationPermit.reviewedAt)
//       payload.legal.circulationPermit.validTo    = parseYMD(form.legal.circulationPermit.validTo)

//       // Uppercase inteligente
//       const up = (obj) => {
//         if (!obj || typeof obj !== 'object') return obj
//         const out = Array.isArray(obj) ? [] : {}
//         for (const k of Object.keys(obj)) {
//           const v = obj[k]
//           const isBranch = k === 'branch'
//           const isDateKey = /At$/.test(k) || ['validFrom','validTo'].includes(k)
//           if (typeof v === 'string' && !isBranch && !isDateKey) out[k] = U(v)
//           else if (v && typeof v === 'object') out[k] = up(v)
//           else out[k] = v
//         }
//         return out
//       }
//       const finalPayload = up(payload)
//       finalPayload.year = yearNum
//       if (finalPayload.transmission?.gears) {
//         finalPayload.transmission.gears = Number(finalPayload.transmission.gears)
//       }

//       if (id) {
//         await api.patch(`/api/v1/vehicles/${id}`, finalPayload)
//         alert('Vehículo actualizado con éxito')
//       } else {
//         await api.post('/api/v1/vehicles', finalPayload)
//         alert('Vehículo creado con éxito')
//       }
//       // reseteamos referencia (ya no hay cambios)
//       setInitialForm(structuredClone(finalPayload))
//       navigate('/vehicles')
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || 'Datos inválidos'
//       setError(msg)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // --------- Medios ----------
//   const canUpload = useMemo(()=>Boolean(id), [id])
//   const refresh = async ()=> {
//     if (!id) return
//     const { data } = await api.get(`/api/v1/vehicles/${id}`)
//     setVehicle(data?.item || data)
//   }
//   const handleUploadPhoto = async ({ file, category='BASIC', title='' }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir medios')
//     await uploadVehiclePhoto(id, { file, category, title })
//     await refresh()
//   }
//   const handleUploadDoc = async ({ file, category, label }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
//     await uploadVehicleDocument(id, { file, category, label })
//     await refresh()
//   }
//   const handleDeletePhoto = async (photoId) => {
//     if (!confirm('¿Eliminar foto?')) return
//     await deleteVehiclePhoto(id, photoId)
//     await refresh()
//   }
//   const handleDeleteDoc = async (docId) => {
//     if (!confirm('¿Eliminar documento?')) return
//     await deleteVehicleDocument(id, docId)
//     await refresh()
//   }

//   // --------- Apoyo (UI) ----------
//   // Cargar vehículos por sucursal seleccionada
//   useEffect(() => {
//     if (!supportBranch) { setSupportVehicles([]); setSupportTarget(''); return }
//     api.get('/api/v1/vehicles', { params: { page:1, limit:500, branch: supportBranch } })
//       .then(({ data }) => {
//         const items = data?.items || data?.data || []
//         setSupportVehicles(items)
//       })
//   }, [supportBranch])

//   async function startSupport() {
//     if (!id || !supportBranch || !supportTarget) return alert('Selecciona sucursal y vehículo objetivo.')
//     if (supportTarget === id) return alert('Un vehículo no puede reemplazarse a sí mismo.')

//     // Evita reemplazar un target que ya está en apoyo
//     const t = supportVehicles.find(v => String(v._id) === String(supportTarget))
//     if (t?.support?.active) {
//       return alert('No se puede reemplazar un vehículo que ya está en reemplazo.')
//     }

//     setSupportBusy(true)
//     try {
//       await api.post(`/api/v1/vehicles/${id}/support/start`, {
//         targetBranch: supportBranch,
//         targetVehicle: supportTarget,
//       })
//       alert('Reemplazo iniciado')
//       navigate('/vehicles') // redirección a lista
//     } catch (e) {
//       alert(e?.response?.data?.message || 'No se pudo iniciar el reemplazo')
//     } finally {
//       setSupportBusy(false)
//     }
//   }

//   async function finishSupport() {
//     if (!id) return
//     setSupportBusy(true)
//     try {
//       await api.post(`/api/v1/vehicles/${id}/support/finish`)
//       await refresh()
//       setSupportActiveInfo(null)
//       setSupportBranch(''); setSupportVehicles([]); setSupportTarget('')
//       alert('Reemplazo finalizado')
//     } catch (e) {
//       alert(e?.response?.data?.message || 'No se pudo finalizar el reemplazo')
//     } finally {
//       setSupportBusy(false)
//     }
//   }

//   // --------- Visor modal (carrusel) ----------
//   function openViewer(idx) { setViewerIndex(idx); setViewerOpen(true) }
//   function closeViewer() { setViewerOpen(false) }
//   function prevViewer() {
//     if (!vehicle?.photos?.length) return
//     setViewerIndex((i) => (i - 1 + vehicle.photos.length) % vehicle.photos.length)
//   }
//   function nextViewer() {
//     if (!vehicle?.photos?.length) return
//     setViewerIndex((i) => (i + 1) % vehicle.photos.length)
//   }
//   // navegación con flechas del teclado
//   useEffect(() => {
//     if (!viewerOpen) return
//     const onKey = (e) => {
//       if (e.key === 'ArrowLeft') prevViewer()
//       if (e.key === 'ArrowRight') nextViewer()
//       if (e.key === 'Escape') closeViewer()
//     }
//     window.addEventListener('keydown', onKey)
//     return () => window.removeEventListener('keydown', onKey)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [viewerOpen, vehicle?.photos?.length])

//   // --------- Navegación protegida (cambios sin guardar) ----------
//   // 1) Evita cerrar/recargar con cambios
//   useEffect(() => {
//     const handler = (e) => {
//       if (!isDirty) return
//       e.preventDefault()
//       e.returnValue = ''
//     }
//     window.addEventListener('beforeunload', handler)
//     return () => window.removeEventListener('beforeunload', handler)
//   }, [isDirty])

//   // 2) Intercepta clicks en <a> (links del sidebar/menú, etc.)
//   useEffect(() => {
//     const onClick = (e) => {
//       if (!isDirty) return
//       const a = e.target.closest?.('a')
//       if (a && a.href && a.target !== '_blank' && a.origin === window.location.origin) {
//         const ok = confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')
//         if (!ok) {
//           e.preventDefault()
//           e.stopPropagation()
//         }
//       }
//     }
//     document.addEventListener('click', onClick, true)
//     return () => document.removeEventListener('click', onClick, true)
//   }, [isDirty])

//   if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

//   const tabs = ['BASICO','TECNICO','DOCUMENTOS','MEDIOS','INVENTARIO','ACCIDENTES','COMBUSTIBLE','TICKETS']

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
//       <header className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
//           <p className="text-sm text-slate-500">Los textos se guardan en MAYÚSCULAS.</p>
//         </div>
//         <nav className="flex gap-2 overflow-x-auto">
//           {tabs.map(t=>(
//             <button type="button" key={t}
//               onClick={()=>{
//                 if (isDirty && !confirm('Tienes cambios sin guardar. ¿Cambiar de pestaña?')) return
//                 setTab(t)
//               }}
//               className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.25)]':'bg-white border'}`}>
//               {t==='BASICO'?'Básico'
//                :t==='TECNICO'?'Técnico'
//                :t==='DOCUMENTOS'?'Documentos'
//                :t==='MEDIOS'?'Medios'
//                :t==='INVENTARIO'?'Inventario'
//                :t==='ACCIDENTES'?'Accidentes'
//                :t==='COMBUSTIBLE'?'Combustible'
//                :t==='TICKETS'?'Tickets':t}
//             </button>
//           ))}
//         </nav>
//       </header>

//       {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
//       {notice && <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>}

//       {/* ====================== BASICO ====================== */}
//       {tab==='BASICO' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Información básica</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {[
//                 ['Placa / Patente','plate','ABC-123','text'],
//                 ['Código interno','internalCode','B:10','text'],
//                 ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN...','text'],
//                 ['Marca','brand','SCANIA','text'],
//                 ['Modelo','model','P340','text'],
//               ].map(([label, key, ph, type])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     type={type}
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                     placeholder={ph}
//                     required
//                   />
//                 </div>
//               ))}

//               {/* Año */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
//                 <input
//                   type="number"
//                   min={YEAR_MIN}
//                   max={YEAR_MAX}
//                   value={form.year}
//                   onChange={(e)=>update('year', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                   placeholder={String(currentYear)}
//                   required
//                 />
//                 <p className="text-xs text-slate-500 mt-1">Permitido: {YEAR_MIN}–{YEAR_MAX}</p>
//               </div>

//               {/* Color */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
//                 <input
//                   type="text"
//                   value={form.color}
//                   onChange={(e)=>update('color', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                   placeholder="ROJO"
//                   required
//                 />
//               </div>

//               {/* Sucursal */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
//                 <select
//                   required
//                   value={form.branch}
//                   onChange={(e)=>update('branch', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
//                 >
//                   <option value="" disabled>Selecciona sucursal</option>
//                   {branches.map(b=>(
//                     <option key={b._id} value={b._id}>
//                       {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Estado (AL FINAL del bloque) */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
//                 <select
//                   required
//                   disabled={statusLoading}
//                   value={form.status}
//                   onChange={(e)=>update('status', e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                 >
//                   <option value="" disabled>Selecciona estado</option>
//                   {statusOptions.map(opt=>(
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
//                   ))}
//                 </select>
//                 {/* Etiqueta legible desde el catálogo (si aplica) */}
//                 {!!form.status && statusMapRef.current[form.status] && (
//                   <div className="text-xs text-slate-500 mt-1">
//                     Etiqueta: {statusMapRef.current[form.status]}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* ====================== APOYO A OTRAS SUCURSALES ====================== */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Servicios de Apoyo a otras Sucursales</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//               {/* Sucursal destino */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal objetivo</label>
//                 <select
//                   value={supportBranch}
//                   onChange={(e)=>setSupportBranch(e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                 >
//                   <option value="">— Selecciona sucursal —</option>
//                   {branches.map(b=>(
//                     <option key={b._id} value={b._id}>
//                       {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {/* Vehículo de esa sucursal */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Vehículo a reemplazar</label>
//                 <select
//                   value={supportTarget}
//                   onChange={(e)=>setSupportTarget(e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                   disabled={!supportBranch}
//                 >
//                   <option value="">— Selecciona vehículo —</option>
//                   {supportVehicles.map(v=>(
//                     <option key={v._id} value={v._id}>
//                       {v.internalCode || v.plate || v._id} — {v.brand} {v.model}
//                       {v.support?.active ? ' (EN REEMPLAZO)' : ''}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {/* Botón acción */}
//               <div className="flex gap-2">
//                 {supportActiveInfo ? (
//                   <button
//                     type="button"
//                     onClick={finishSupport}
//                     disabled={supportBusy}
//                     className="px-3 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
//                   >
//                     {supportBusy ? 'Finalizando…' : 'Finalizar reemplazo'}
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={startSupport}
//                     disabled={supportBusy || !supportBranch || !supportTarget}
//                     className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//                   >
//                     {supportBusy ? 'Iniciando…' : 'Iniciar reemplazo'}
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Etiquetas de estado de reemplazo */}
//             {supportActiveInfo && (
//               <div className="px-4 pb-4">
//                 <div className="text-sm text-slate-600">
//                   En reemplazo desde: {new Date(supportActiveInfo.from).toLocaleString()}
//                 </div>
//                 <div className="text-red-700 font-extrabold text-lg">
//                   {supportActiveInfo.code}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Botones inferior adaptativo */}
//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={()=>{
//                 if (isDirty) {
//                   const ok = confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')
//                   if (!ok) return
//                 }
//                 navigate('/vehicles')
//               }}
//               className="px-3 py-2 border rounded"
//             >
//               {isDirty ? 'Cancelar' : 'Volver'}
//             </button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>

//           {/* Auditoría */}
//           {id && <AuditBlock vehicleId={id} />}
//         </div>
//       )}

//       {/* ====================== TECNICO ====================== */}
//       {tab==='TECNICO' && (
//         <div className="space-y-4">
//           {/* Motor */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Motor</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {[
//                 ['VIN','vin',''],
//                 ['N° Motor','engineNumber',''],
//                 ['Marca Motor','engineBrand',''],
//                 ['Modelo Motor','engineModel',''],
//                 ['Combustible','fuelType','DIESEL/GASOLINA'],
//               ].map(([label,key,ph])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded"
//                     placeholder={ph}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Transmisión */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Transmisión</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//               {[
//                 ['Tipo','transmission.type','MANUAL/AUTOMATIC/AMT/CVT'],
//                 ['Marca','transmission.brand','ALLISON/ZF/EATON'],
//                 ['Modelo','transmission.model','4500 RDS'],
//                 ['Serie','transmission.serial',''],
//                 ['Marchas','transmission.gears','6','text'],
//               ].map(([label,path,ph,type])=>{
//                 const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
//                 return (
//                   <div key={path}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                     <input
//                       type={type||'text'}
//                       value={val}
//                       onChange={(e)=>updateNested(path, e.target.value)}
//                       className="w-full border p-2 rounded"
//                       placeholder={ph}
//                     />
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           {/* Medidores */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Medidores</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//               {[
//                 ['Odómetro (km)','meters.odometerKm','0'],
//                 ['Horómetro motor (h)','meters.engineHours','0'],
//                 ['Horas escala (h)','meters.ladderHours','0'],
//                 ['Horas generador (h)','meters.generatorHours','0'],
//                 ['Horas cuerpo bomba (h)','meters.pumpHours','0'],
//               ].map(([label,path,ph])=>{
//                 const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
//                 return (
//                   <div key={path}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                     <input
//                       value={val}
//                       onChange={(e)=>updateNested(path, e.target.value)}
//                       className="w-full border p-2 rounded"
//                       placeholder={ph}
//                     />
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={()=>{
//                 if (isDirty && !confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) return
//                 navigate('/vehicles')
//               }}
//               className="px-3 py-2 border rounded"
//             >
//               {isDirty ? 'Cancelar' : 'Volver'}
//             </button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>

//           {id && <AuditBlock vehicleId={id} />}
//         </div>
//       )}

//       {/* ====================== DOCUMENTOS ====================== */}
//       {tab==='DOCUMENTOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Legal / Documentos</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 gap-6">
//               {/* Padrón (new fields) */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Padrón | N°</label>
//                   <input maxLength={20} value={form.legal.padron.number} onChange={(e)=>updateNested('legal.padron.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.padron.issuer} onChange={(e)=>updateNested('legal.padron.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Adquisición</label>
//                   <input type="date" value={form.legal.padron.acquiredAt || ''} onChange={(e)=>updateNested('legal.padron.acquiredAt', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inscripción</label>
//                   <input type="date" value={form.legal.padron.registeredAt || ''} onChange={(e)=>updateNested('legal.padron.registeredAt', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Emisión</label>
//                   <input type="date" value={form.legal.padron.issuedAt || ''} onChange={(e)=>updateNested('legal.padron.issuedAt', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* SOAP */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">SOAP | Póliza</label>
//                   <input value={form.legal.soap.policy} onChange={(e)=>updateNested('legal.soap.policy', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
//                   <input value={form.legal.soap.issuer} onChange={(e)=>updateNested('legal.soap.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                   <input type="date" value={form.legal.soap.validFrom || ''} onChange={(e)=>updateNested('legal.soap.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fin</label>
//                   <input type="date" value={form.legal.soap.validTo || ''} onChange={(e)=>updateNested('legal.soap.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* Seguro */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Seguro | Póliza</label>
//                   <input value={form.legal.insurance.policy} onChange={(e)=>updateNested('legal.insurance.policy', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
//                   <input value={form.legal.insurance.issuer} onChange={(e)=>updateNested('legal.insurance.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                   <input type="date" value={form.legal.insurance.validFrom || ''} onChange={(e)=>updateNested('legal.insurance.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fin</label>
//                   <input type="date" value={form.legal.insurance.validTo || ''} onChange={(e)=>updateNested('legal.insurance.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* TAG */}
//               <div className="grid sm:grid-cols-3 gap-3 items-end">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">TAG | N°</label>
//                   <input value={form.legal.tag.number} onChange={(e)=>updateNested('legal.tag.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.tag.issuer} onChange={(e)=>updateNested('legal.tag.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* Tarjeta combustible */}
//               <div className="grid sm:grid-cols-3 gap-3 items-end">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Tarj. combustible | Emisor</label>
//                   <input value={form.legal.fuelCard.issuer} onChange={(e)=>updateNested('legal.fuelCard.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">N° Tarjeta</label>
//                   <input value={form.legal.fuelCard.number} onChange={(e)=>updateNested('legal.fuelCard.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Vence</label>
//                   <input type="date" value={form.legal.fuelCard.validTo || ''} onChange={(e)=>updateNested('legal.fuelCard.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* NUEVO: Revisión técnica */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Revisión técnica #</label>
//                   <input value={form.legal.technicalReview.number} onChange={(e)=>updateNested('legal.technicalReview.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.technicalReview.issuer} onChange={(e)=>updateNested('legal.technicalReview.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Revisión</label>
//                   <input type="date" value={form.legal.technicalReview.reviewedAt || ''} onChange={(e)=>updateNested('legal.technicalReview.reviewedAt', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Vencimiento</label>
//                   <input type="date" value={form.legal.technicalReview.validTo || ''} onChange={(e)=>updateNested('legal.technicalReview.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* NUEVO: Permiso de circulación */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Permiso de circulación #</label>
//                   <input value={form.legal.circulationPermit.number} onChange={(e)=>updateNested('legal.circulationPermit.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.circulationPermit.issuer} onChange={(e)=>updateNested('legal.circulationPermit.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Revisión</label>
//                   <input type="date" value={form.legal.circulationPermit.reviewedAt || ''} onChange={(e)=>updateNested('legal.circulationPermit.reviewedAt', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Vencimiento</label>
//                   <input type="date" value={form.legal.circulationPermit.validTo || ''} onChange={(e)=>updateNested('legal.circulationPermit.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>
//             </div>

//             <div className="px-4 pb-4 text-sm text-slate-500">
//               La carga de documentos se realiza en la pestaña <b>Medios</b>.
//             </div>
//           </div>

//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={()=>{
//                 if (isDirty && !confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) return
//                 navigate('/vehicles')
//               }}
//               className="px-3 py-2 border rounded"
//             >
//               {isDirty ? 'Cancelar' : 'Volver'}
//             </button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>

//           {id && <AuditBlock vehicleId={id} />}
//         </div>
//       )}

//       {/* ====================== MEDIOS ====================== */}
//       {tab==='MEDIOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
//             </div>
//             <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 ['Básico (vehículo)','BASIC'],
//                 ['Motor','ENGINE'],
//                 ['Transmisión','TRANSMISSION'],
//                 ['Generador','GENERATOR'],
//                 ['Motobomba','PUMP'],
//                 ['Cuerpo de bomba','BODY'],
//                 ['Documentos (legal)','LEGAL'],
//                 ['Manuales','MANUALS'],
//                 ['Partes','PARTS'],
//               ].map(([label,cat])=>(
//                 <div key={cat} className="border rounded-lg p-3">
//                   <div className="font-medium mb-2">{label}</div>
//                   <MediaUploader
//                     onUpload={(p)=>{
//                       // Acepta imagen/video/documento (pdf)
//                       const mime = p?.file?.type || ''
//                       if (mime === 'application/pdf') {
//                         return handleUploadDoc({ ...p, category:cat, label: p?.title })
//                       }
//                       return handleUploadPhoto({ ...p, category:cat, title: p?.title })
//                     }}
//                     // acepta ambos tipos
//                     accept="image/*,video/*,application/pdf"
//                     category={cat}
//                     mode="mixed"
//                   />
//                   {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Contenido actual */}
//           {vehicle && (
//             <div className="bg-white shadow rounded-xl border">
//               <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                 <h3 className="font-medium text-slate-700">Contenido actual</h3>
//               </div>
//               <div className="p-4 grid gap-6">
//                 {/* Fotos/Videos */}
//                 <div>
//                   <div className="font-medium mb-1">Fotos / Videos</div>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
//                     {(vehicle.photos||[]).map((ph,idx)=>(
//                       <div key={ph._id} className="text-xs">
//                         {/^(mp4|mov|webm)$/i.test(ph.format || '') ? (
//                           <video className="w-full h-24 rounded border object-cover" controls>
//                             <source src={ph.url} />
//                           </video>
//                         ) : (
//                           <img
//                             src={ph.url}
//                             alt={ph.title||''}
//                             className="w-full h-24 object-cover rounded border cursor-pointer"
//                             onClick={()=>openViewer(idx)}
//                           />
//                         )}
//                         <div className="mt-1 break-words">{ph.title}</div>
//                         <button
//                           type="button"
//                           onClick={()=>handleDeletePhoto(ph._id)}
//                           className="mt-1 text-red-600 hover:underline"
//                         >Eliminar</button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {/* Documentos/PDF */}
//                 <div>
//                   <div className="font-medium mb-1">Documentos</div>
//                   <ul className="list-disc pl-5 text-sm space-y-1">
//                     {(vehicle.documents||[]).map(d=>(
//                       <li key={d._id} className="break-words">
//                         {d.label} — <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ver</a>
//                         <button
//                           type="button"
//                           onClick={()=>handleDeleteDoc(d._id)}
//                           className="ml-3 text-red-600 hover:underline"
//                         >Eliminar</button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* MODAL VISOR: flechas centradas + teclas */}
//           {viewerOpen && vehicle?.photos?.length > 0 && (
//             <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
//               <div className="bg-white rounded-lg max-w-5xl w-full mx-4 p-3 relative">
//                 <button className="absolute top-2 right-2 text-slate-700" onClick={closeViewer}>✕</button>
//                 <div className="w-full flex items-center justify-between mt-6">
//                   <button className="px-3 py-2 border rounded" onClick={prevViewer}>◀</button>
//                   <div className="flex-1 px-4">
//                     {/^(mp4|mov|webm)$/i.test(vehicle.photos[viewerIndex]?.format || '') ? (
//                       <video className="max-h-[70vh] mx-auto rounded border" controls>
//                         <source src={vehicle.photos[viewerIndex]?.url} />
//                       </video>
//                     ) : (
//                       <img
//                         src={vehicle.photos[viewerIndex]?.url}
//                         alt={vehicle.photos[viewerIndex]?.title || ''}
//                         className="max-h-[70vh] mx-auto object-contain rounded border bg-black/5"
//                       />
//                     )}
//                     <div className="text-center mt-2 text-sm">
//                       {vehicle.photos[viewerIndex]?.title}
//                     </div>
//                   </div>
//                   <button className="px-3 py-2 border rounded" onClick={nextViewer}>▶</button>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-end">
//             <button
//               type="button"
//               onClick={()=>{
//                 if (isDirty && !confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) return
//                 navigate('/vehicles')
//               }}
//               className="px-3 py-2 border rounded"
//             >
//               {isDirty ? 'Cancelar' : 'Volver'}
//             </button>
//           </div>

//           {id && <AuditBlock vehicleId={id} />}
//         </div>
//       )}

//       {/* ====================== SKELETONS / PLACEHOLDERS ====================== */}
//       {tab==='INVENTARIO' && (
//         <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//           Este módulo está en desarrollo.
//           {id && <AuditBlock vehicleId={id} />}
//         </div>
//       )}
//       {tab==='ACCIDENTES' && (
//         <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//           Este módulo está en desarrollo.
//           {id && <AuditBlock vehicleId={id} />}
//         </div>
//       )}
//       {tab==='COMBUSTIBLE' && (
//         <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//           Este módulo está en desarrollo.
//           {id && <AuditBlock vehicleId={id} />}
//         </div>
//       )}
//       {tab==='TICKETS' && (
//         <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//           Este módulo está en desarrollo.
//           {id && <AuditBlock vehicleId={id} />}
//         </div>
//       )}
//     </form>
//   )
// }



// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // Ficha de Vehículos (Básico, Técnico, Documentos, Medios, Inventario, Accidentes, Combustible, Tickets)
// // - Modo Ver (?mode=view): deshabilita inputs y muestra sólo "Volver".
// // - Auditoría mixta (5 + “Ver más”) al final de TODAS las pestañas.
// // - Scroll central independiente (no afecta menú lateral).
// // - Protección de cambios no guardados (al salir por menú, recargar o cerrar).
// // - Servicios de Apoyo: validaciones UI + start -> redirige a /vehicles.
// // - Documentos: nuevas estructuras (Padrón extendido, Rev. técnica, Permiso circ.) y parseo de fechas.
// // - Medios: cada categoría acepta imágenes, videos y PDF. Carrusel con flechas centradas y teclas ← →.
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
// import { api } from '../../services/http'
// import { useNavigate, useParams, useLocation } from 'react-router-dom'
// import MediaUploader from '../../components/Vehicle/VehicleMediaUploader'
// import {
//   uploadVehiclePhoto,
//   uploadVehicleDocument,
//   deleteVehiclePhoto,
//   deleteVehicleDocument
// } from '../../api/vehicles.api'
// //import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard';

// // ===================== Helpers generales =====================
// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

// function ymd(d) {
//   if (!d) return ''
//   const dt = new Date(d)
//   if (Number.isNaN(dt.getTime())) return ''
//   const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
//   const dd = String(dt.getUTCDate()).padStart(2, '0')
//   return `${dt.getUTCFullYear()}-${mm}-${dd}`
// }
// function parseYMD(str) {
//   if (!str) return undefined
//   const [Y, M, D] = str.split('-').map(n => parseInt(n, 10))
//   if (!Y || !M || !D) return undefined
//   return new Date(Date.UTC(Y, M - 1, D))
// }
// function naturalSortBranches(list) {
//   return [...list].sort((a, b) => {
//     const an = Number(a.code); const bn = Number(b.code)
//     const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn)
//     if (aIsNum && bIsNum) return an - bn
//     if (aIsNum) return -1
//     if (bIsNum) return 1
//     return (a.name || '').localeCompare(b.name || '', 'es', { numeric: true })
//   })
// }
// function deepEqual(a, b) {
//   try { return JSON.stringify(a) === JSON.stringify(b) } catch { return false }
// }

// // ===================== Guard de cambios no guardados =====================
// // - beforeunload (recarga/cerrar)
// // - Intercepta clics en <a> internos para confirmar si isDirty
// function UnsavedChangesGuard({ isDirty }) {
//   useEffect(() => {
//     const onBeforeUnload = (e) => {
//       if (!isDirty) return
//       e.preventDefault()
//       e.returnValue = ''
//     }
//     window.addEventListener('beforeunload', onBeforeUnload)
//     return () => window.removeEventListener('beforeunload', onBeforeUnload)
//   }, [isDirty])

//   useEffect(() => {
//     const onDocClick = (e) => {
//       if (!isDirty) return
//       // Sólo anchors con navegación interna
//       const a = e.target.closest?.('a')
//       if (!a) return
//       const href = a.getAttribute('href') || ''
//       if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
//       const isSameOrigin = a.origin === window.location.origin
//       if (!isSameOrigin) return // enlaces externos no los bloqueamos
//       const confirmLeave = window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')
//       if (!confirmLeave) {
//         e.preventDefault()
//         e.stopPropagation()
//       }
//     }
//     document.addEventListener('click', onDocClick, true)
//     return () => document.removeEventListener('click', onDocClick, true)
//   }, [isDirty])

//   return null
// }

// // ===================== Auditoría (mixta 5 + ver más) =====================
// function AuditBlock({ vehicleId }) {
//   const [items, setItems] = useState([])
//   const [total, setTotal] = useState(0)
//   const [limit, setLimit] = useState(5) // mixto: 5 iniciales
//   const [loading, setLoading] = useState(false)

//   const load = useCallback(async (lim = limit) => {
//     if (!vehicleId) return
//     setLoading(true)
//     try {
//       const { data } = await api.get(`/api/v1/vehicles/${vehicleId}/audit`, {
//         params: { page: 1, limit: lim }
//       })
//       setItems(data?.items || [])
//       setTotal(data?.total || 0)
//     } catch (_) { /* noop */ } finally { setLoading(false) }
//   }, [vehicleId, limit])

//   useEffect(() => { load(limit) }, [load, limit])

//   const showMore = () => {
//     const next = Math.min(limit + 10, total || limit + 10)
//     setLimit(next)
//   }

//   return (
//     <div className="mt-6">
//       <div className="text-sm text-slate-500 mb-2 font-medium">Auditoría</div>
//       <div className="rounded border bg-white">
//         {loading && <div className="p-3 text-sm text-slate-500">Cargando auditoría…</div>}
//         {!loading && items.length === 0 && (
//           <div className="p-3 text-sm text-slate-500">Sin movimientos registrados.</div>
//         )}
//         {!loading && items.length > 0 && (
//           <ul className="divide-y">
//             {items.map((it, idx) => (
//               <li key={idx} className="p-3 text-sm">
//                 <div className="flex items-center justify-between">
//                   <div className="font-mono text-xs text-slate-500">
//                     {new Date(it.at).toLocaleString()}
//                   </div>
//                   <div className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
//                     {it.action}
//                   </div>
//                 </div>
//                 {/* Muestra un resumen: intenta detalle from → to si existe */}
//                 <div className="mt-1">
//                   {it?.data?.detail ? (
//                     <span className="text-slate-700">{it.data.detail}</span>
//                   ) : (
//                     <span className="text-slate-500">—</span>
//                   )}
//                 </div>
//                 {it.by && (
//                   <div className="mt-1 text-xs text-slate-400">
//                     por: {it.by}
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//         {total > limit && (
//           <div className="p-2 border-t flex justify-center">
//             <button
//               type="button"
//               onClick={showMore}
//               className="text-xs text-blue-600 hover:underline"
//             >
//               Ver más
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// // ===================== Componente principal =====================
// export default function VehiclesForm() {
//   const navigate = useNavigate()
//   const { id } = useParams()
//   const location = useLocation()

//   // Modo lectura por query param
//   const params = new URLSearchParams(location.search)
//   const mode = params.get('mode')
//   const readOnly = mode === 'view'

//   // Tabs
//   const [tab, setTab] = useState('BASICO')

//   // Catálogos y sucursales
//   const [branches, setBranches] = useState([])
//   const [statusOptions, setStatusOptions] = useState([])
//   const [statusLoading, setStatusLoading] = useState(false)

//   // Estados de control
//   const [saving, setSaving] = useState(false)
//   const [loading, setLoading] = useState(!!id)
//   const [error, setError] = useState('')
//   const [notice, setNotice] = useState('')
//   const [vehicle, setVehicle] = useState(null)

//   // Apoyo
//   const [supportBranch, setSupportBranch] = useState('')
//   const [supportVehicles, setSupportVehicles] = useState([])
//   const [supportTarget, setSupportTarget] = useState('')
//   const [supportBusy, setSupportBusy] = useState(false)
//   const [supportActiveInfo, setSupportActiveInfo] = useState(null) // {from: ISO, code:'XXR'}

//   // Carrusel de medios
//   const [viewerOpen, setViewerOpen] = useState(false)
//   const [viewerIndex, setViewerIndex] = useState(0)
//   const viewerRef = useRef(null)

//   const currentYear = new Date().getFullYear()
//   const YEAR_MIN = 1950
//   const YEAR_MAX = currentYear + 1

//   // Form
//   const [form, setForm] = useState({
//     // Básico
//     plate: '', internalCode: '',
//     type: '', brand: '', model: '', year: '', color: '', branch: '',
//     status: 'ACTIVE',
//     // Técnico
//     vin: '', engineNumber: '', engineBrand: '', engineModel: '', fuelType: '',
//     transmission: { type: '', brand: '', model: '', serial: '', gears: '' },
//     generator: { brand: '', model: '', serial: '' },
//     pump: { brand: '', model: '', serial: '' },
//     body: { brand: '', model: '', serial: '' },
//     meters: { odometerKm: '', engineHours: '', ladderHours: '', generatorHours: '', pumpHours: '' },
//     // Legal (fechas visibles)
//     legal: {
//       padron: {
//         number: '',
//         issuer: 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION',
//         // NUEVOS CAMPOS
//         acquisitionDate: '',   // yyyy-MM-dd
//         inscriptionDate: '',   // yyyy-MM-dd
//         issueDate: '',         // yyyy-MM-dd
//         // Compat antiguos
//         validFrom: '',         // legacy (no se usa, mantenido por compat)
//         validTo: ''            // legacy (no se usa, mantenido por compat)
//       },
//       soap:      { policy: '', issuer: '', validFrom: '', validTo: '' },
//       insurance: { policy: '', issuer: '', validFrom: '', validTo: '' },
//       tag:       { number: '', issuer: '' },
//       fuelCard:  { issuer: '', number: '', validTo: '' },
//       // NUEVOS BLOQUES
//       technicalReview: { number: '', issuer: '', reviewedAt: '', validTo: '' }, // revisión técnica
//       circulationPermit: { number: '', issuer: '', reviewedAt: '', validTo: '' } // permiso circulación
//     }
//   })

//   // adicion para controlar la salida cuando se tienen cambios
//   // --- Control de auditoría de cambios ---
//   const [initialForm, setInitialForm] = useState(null);
//   const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm || form);

//   // fin adicion

//   // Para detectar cambios
//   const [initialForm, setInitialForm] = useState(null)
//   const isDirty = !readOnly && !deepEqual(form, initialForm || form)

//   // ===================== Scroll central independiente =====================
//   // Este contenedor hará que el contenido interno scrollee sin afectar el menú lateral
//   const scrollContainerClass =
//     'max-w-6xl mx-auto h-[calc(100vh-140px)] overflow-y-auto px-1 sm:px-0'

//   // ===================== Cargar catálogos =====================
//   useEffect(() => {
//     setStatusLoading(true)
//     api.get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
//       .then(({ data }) => {
//         const list = data?.items || data?.data || []
//         const opts = list
//           .filter(it => it.active !== false)
//           .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label))
//           .map(it => ({ value: it.code || it.label, label: it.label }))
//         setStatusOptions(opts)
//       })
//       .finally(() => setStatusLoading(false))
//   }, [])

//   // ===================== Cargar sucursales =====================
//   useEffect(() => {
//     api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || data?.list || []
//         setBranches(naturalSortBranches(payload))
//         if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.')
//       })
//       .catch(() => setBranches([]))
//   }, [])

//   // ===================== Cargar vehículo (edición) =====================
//   useEffect(() => {
//     if (!id) {
//       setInitialForm(form) // nuevo registro
//       return
//     }
//     setLoading(true)
//     api.get(`/api/v1/vehicles/${id}`)
//       .then(({ data }) => {
//         const v = data?.item || data
//         setVehicle(v)

//         // Apoyo activo
//         let supportInfo = null
//         const last = Array.isArray(v.assignments) && v.assignments.length ? v.assignments[v.assignments.length - 1] : null
//         if (last && last.reason === 'APOYO' && !last.endAt) {
//           supportInfo = { from: last.startAt, code: v.internalCode }
//         }
//         setSupportActiveInfo(supportInfo)

//         setForm({
//           ...form,
//           plate: v.plate || '',
//           internalCode: v.internalCode || '',
//           type: v.type || '',
//           brand: v.brand || '',
//           model: v.model || '',
//           year: v.year || '',
//           color: v.color || '',
//           branch: v.branch?._id || v.branch || '',
//           status: v.status || 'ACTIVE',
//           vin: v.vin || '',
//           engineNumber: v.engineNumber || '',
//           engineBrand: v.engineBrand || '',
//           engineModel: v.engineModel || '',
//           fuelType: v.fuelType || '',
//           transmission: {
//             type: v.transmission?.type || '',
//             brand: v.transmission?.brand || '',
//             model: v.transmission?.model || '',
//             serial: v.transmission?.serial || '',
//             gears: v.transmission?.gears || '',
//           },
//           generator: { brand: v.generator?.brand || '', model: v.generator?.model || '', serial: v.generator?.serial || '' },
//           pump:      { brand: v.pump?.brand || '',      model: v.pump?.model || '',      serial: v.pump?.serial || '' },
//           body:      { brand: v.body?.brand || '',      model: v.body?.model || '',      serial: v.body?.serial || '' },
//           meters: {
//             odometerKm: v.meters?.odometerKm ?? '',
//             engineHours: v.meters?.engineHours ?? '',
//             ladderHours: v.meters?.ladderHours ?? '',
//             generatorHours: v.meters?.generatorHours ?? '',
//             pumpHours: v.meters?.pumpHours ?? '',
//           },
//           legal: {
//             padron:    { number: v.legal?.padron?.number || '', issuer: v.legal?.padron?.issuer || 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION', validFrom: ymd(v.legal?.padron?.validFrom), validTo: ymd(v.legal?.padron?.validTo) },
//             soap:      { policy: v.legal?.soap?.policy || '', issuer: v.legal?.soap?.issuer || '', validFrom: ymd(v.legal?.soap?.validFrom), validTo: ymd(v.legal?.soap?.validTo) },
//             insurance: { policy: v.legal?.insurance?.policy || '', issuer: v.legal?.insurance?.issuer || '', validFrom: ymd(v.legal?.insurance?.validFrom), validTo: ymd(v.legal?.insurance?.validTo) },
//             tag:       { number: v.legal?.tag?.number || '', issuer: v.legal?.tag?.issuer || '' },
//             fuelCard:  { issuer: v.legal?.fuelCard?.issuer || '', number: v.legal?.fuelCard?.number || '', validTo: ymd(v.legal?.fuelCard?.validTo) },
//           }
//         })
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
//       .finally(() => setLoading(false))
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id])

//   // ===================== Update helpers =====================
//   function update(field, val) {
//     if (field === 'branch' || field === 'year') {
//       setForm(f => ({ ...f, [field]: val }))
//     } else {
//       setForm(f => ({ ...f, [field]: (typeof val === 'string' ? U(val) : val) }))
//     }
//   }
//   function updateNested(path, val) {
//     setForm((f) => {
//       const clone = structuredClone(f)
//       let ref = clone
//       const parts = path.split('.')
//       for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]]
//       const isDatePath =
//         path.startsWith('legal.') &&
//         (
//           path.endsWith('validFrom') ||
//           path.endsWith('validTo') ||
//           path.endsWith('acquisitionDate') ||
//           path.endsWith('inscriptionDate') ||
//           path.endsWith('issueDate') ||
//           path.endsWith('reviewedAt')
//         )
//       ref[parts.at(-1)] = (typeof val === 'string' && !isDatePath ? U(val) : val)
//       return clone
//     })
//   }

//   // ===================== Guardar =====================
//   async function handleSubmit(e) {
//     e.preventDefault()
//     if (readOnly) return
//     setSaving(true); setError('')

//     try {
//       const reqFields = ['plate', 'internalCode', 'status', 'type', 'brand', 'model', 'year', 'color', 'branch']
//       for (const k of reqFields) {
//         if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`)
//       }
//       const yearNum = Number(form.year)
//       if (!Number.isFinite(yearNum) || yearNum < YEAR_MIN || yearNum > YEAR_MAX) {
//         throw new Error(`Año inválido. Debe estar entre ${YEAR_MIN} y ${YEAR_MAX}.`)
//       }

//       // Payload clonado
//       const payload = structuredClone(form)

//       // Parseo de fechas (Documentos y Padrón extendido)
//       payload.legal.padron.acquisitionDate = parseYMD(form.legal.padron.acquisitionDate)
//       payload.legal.padron.inscriptionDate = parseYMD(form.legal.padron.inscriptionDate)
//       payload.legal.padron.issueDate       = parseYMD(form.legal.padron.issueDate)

//       payload.legal.soap.validFrom         = parseYMD(form.legal.soap.validFrom)
//       payload.legal.soap.validTo           = parseYMD(form.legal.soap.validTo)
//       payload.legal.insurance.validFrom    = parseYMD(form.legal.insurance.validFrom)
//       payload.legal.insurance.validTo      = parseYMD(form.legal.insurance.validTo)
//       payload.legal.fuelCard.validTo       = parseYMD(form.legal.fuelCard.validTo)

//       payload.legal.technicalReview.reviewedAt = parseYMD(form.legal.technicalReview.reviewedAt)
//       payload.legal.technicalReview.validTo    = parseYMD(form.legal.technicalReview.validTo)
//       payload.legal.circulationPermit.reviewedAt = parseYMD(form.legal.circulationPermit.reviewedAt)
//       payload.legal.circulationPermit.validTo    = parseYMD(form.legal.circulationPermit.validTo)

//       // Uppercase inteligente (excepto branch y fechas)
//       const up = (obj) => {
//         if (!obj || typeof obj !== 'object') return obj
//         const out = Array.isArray(obj) ? [] : {}
//         for (const k of Object.keys(obj)) {
//           const v = obj[k]
//           const isBranch = k === 'branch'
//           const isDateKey = ['validFrom', 'validTo', 'acquisitionDate', 'inscriptionDate', 'issueDate', 'reviewedAt'].includes(k)
//           if (typeof v === 'string' && !isBranch && !isDateKey) out[k] = U(v)
//           else if (v && typeof v === 'object') out[k] = up(v)
//           else out[k] = v
//         }
//         return out
//       }
//       const finalPayload = up(payload)
//       finalPayload.year = yearNum
//       if (finalPayload.transmission?.gears) {
//         finalPayload.transmission.gears = Number(finalPayload.transmission.gears)
//       }

//       if (id) {
//         await api.patch(`/api/v1/vehicles/${id}`, finalPayload)
//         alert('Vehículo actualizado con éxito')
//       } else {
//         await api.post('/api/v1/vehicles', finalPayload)
//         alert('Vehículo creado con éxito')
//       }
//       setInitialForm(finalPayload)
//       navigate('/vehicles')
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || 'Datos inválidos'
//       setError(msg)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // ===================== Medios =====================
//   const canUpload = useMemo(() => Boolean(id), [id])
//   const refresh = async () => {
//     if (!id) return
//     const { data } = await api.get(`/api/v1/vehicles/${id}`)
//     setVehicle(data?.item || data)
//   }
//   const handleUploadPhoto = async ({ file, category = 'BASIC', title = '' }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir medios')
//     await uploadVehiclePhoto(id, { file, category, title })
//     await refresh()
//   }
//   const handleUploadDoc = async ({ file, category, label }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
//     await uploadVehicleDocument(id, { file, category, label })
//     await refresh()
//   }
//   const handleDeletePhoto = async (photoId) => {
//     if (!confirm('¿Eliminar foto?')) return
//     await deleteVehiclePhoto(id, photoId)
//     await refresh()
//   }
//   const handleDeleteDoc = async (docId) => {
//     if (!confirm('¿Eliminar documento?')) return
//     await deleteVehicleDocument(id, docId)
//     await refresh()
//   }

//   // ===================== Apoyo (UI) =====================
//   useEffect(() => {
//     if (!supportBranch) { setSupportVehicles([]); setSupportTarget(''); return }
//     api.get('/api/v1/vehicles', { params: { page: 1, limit: 500, branch: supportBranch } })
//       .then(({ data }) => {
//         const items = data?.items || data?.data || []
//         setSupportVehicles(items)
//       })
//   }, [supportBranch])

//   async function startSupport() {
//     if (!id || !supportBranch || !supportTarget) {
//       return alert('Selecciona sucursal y vehículo objetivo.')
//     }
//     // No reemplazarse a sí mismo
//     if (supportTarget === id) {
//       return alert('Un vehículo no puede reemplazarse a sí mismo.')
//     }
//     setSupportBusy(true)
//     try {
//       await api.post(`/api/v1/vehicles/${id}/support/start`, {
//         targetBranch: supportBranch,
//         targetVehicle: supportTarget,
//       })
//       alert('Reemplazo iniciado')
//       navigate('/vehicles') // redirección a lista
//     } catch (e) {
//       alert(e?.response?.data?.message || 'No se pudo iniciar el reemplazo')
//     } finally {
//       setSupportBusy(false)
//     }
//   }

//   async function finishSupport() {
//     if (!id) return
//     setSupportBusy(true)
//     try {
//       await api.post(`/api/v1/vehicles/${id}/support/finish`)
//       await refresh()
//       setSupportActiveInfo(null)
//       setSupportBranch(''); setSupportVehicles([]); setSupportTarget('')
//       alert('Reemplazo finalizado')
//     } catch (e) {
//       alert(e?.response?.data?.message || 'No se pudo finalizar el reemplazo')
//     } finally {
//       setSupportBusy(false)
//     }
//   }

//   // ===================== Carrusel de imágenes/videos =====================
//   function openViewer(idx) { setViewerIndex(idx); setViewerOpen(true) }
//   function closeViewer() { setViewerOpen(false) }
//   function prevViewer() {
//     if (!vehicle?.photos?.length) return
//     setViewerIndex((viewerIndex - 1 + vehicle.photos.length) % vehicle.photos.length)
//   }
//   function nextViewer() {
//     if (!vehicle?.photos?.length) return
//     setViewerIndex((viewerIndex + 1) % vehicle.photos.length)
//   }

//   useEffect(() => {
//     if (!viewerOpen) return
//     const onKey = (e) => {
//       if (e.key === 'ArrowLeft') prevViewer()
//       if (e.key === 'ArrowRight') nextViewer()
//       if (e.key === 'Escape') closeViewer()
//     }
//     document.addEventListener('keydown', onKey)
//     return () => document.removeEventListener('keydown', onKey)
//   }, [viewerOpen, viewerIndex])

//   // ===================== Cancelar / Volver =====================
//   const handleCancel = () => {
//     if (!isDirty) return navigate('/vehicles')
//     const ok = window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')
//     if (ok) navigate('/vehicles')
//   }

//   // ===================== Render =====================
//   if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

//   const TabButton = ({ code, label }) => (
//     <button
//       type="button"
//       onClick={() => setTab(code)}
//       className={`px-3 py-1.5 rounded ${tab === code
//         ? 'bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.25)]'
//         : 'bg-white border'}`}
//     >
//       {label}
//     </button>
//   )

//   // Mapea categorías para uploader (todas aceptan imágenes, video, PDF)
//   const mediaCats = [
//     ['Básico (vehículo)', 'BASIC'],
//     ['Motor', 'ENGINE'],
//     ['Transmisión', 'TRANSMISSION'],
//     ['Generador', 'GENERATOR'],
//     ['Motobomba', 'PUMP'],
//     ['Cuerpo de bomba', 'BODY'],
//     ['Documentos (legal)', 'LEGAL'],
//     ['Manuales', 'MANUALS'],
//     ['Partes', 'PARTS'],
//   ]

//   return (
//     <div className="flex flex-col h-full">
//       {/* Guard global de cambios sin guardar */}
//       <UnsavedChangesGuard isDirty={isDirty} />

//       <header className="px-2 sm:px-0 max-w-6xl mx-auto w-full mt-2">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-xl font-semibold">
//               {readOnly ? 'Consulta de vehículo' : id ? 'Editar Vehículo' : 'Registrar Vehículo'}
//             </h2>
//             {!readOnly && (
//               <p className="text-sm text-slate-500">
//                 Los textos se guardan en MAYÚSCULAS.
//               </p>
//             )}
//           </div>
//           <nav className="flex gap-2">
//             <TabButton code="BASICO" label="Básico" />
//             <TabButton code="TECNICO" label="Técnico" />
//             <TabButton code="DOCUMENTOS" label="Documentos" />
//             <TabButton code="MEDIOS" label="Medios" />
//             <TabButton code="INVENTARIO" label="Inventario" />
//             <TabButton code="ACCIDENTES" label="Accidentes" />
//             <TabButton code="COMBUSTIBLE" label="Combustible" />
//             {/* NUEVA pestaña solicitada */}
//             <TabButton code="TICKETS" label="Tickets" />
//           </nav>
//         </div>
//       </header>

//       {error && <div className="max-w-6xl mx-auto px-3 py-2 bg-red-50 text-red-700 rounded text-sm mt-2">{error}</div>}
//       {notice && <div className="max-w-6xl mx-auto px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm mt-2">{notice}</div>}

//       {/* Contenedor con scroll propio, independiente del menú */}
//       <form onSubmit={handleSubmit} className={`${scrollContainerClass} my-3`}>
//         <fieldset disabled={readOnly} className="space-y-4">

//           {/* ====================== BASICO ====================== */}
//           {tab === 'BASICO' && (
//             <div className="space-y-4">
//               <div className="bg-white shadow rounded-xl border">
//                 <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                   <h3 className="font-medium text-slate-700">Información básica</h3>
//                 </div>
//                 <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {[
//                     ['Placa / Patente', 'plate', 'ABC-123', 'text'],
//                     ['Código interno', 'internalCode', 'B-10', 'text'],
//                     ['Tipo de vehículo', 'type', 'CARRO BOMBA, CAMIÓN...', 'text'],
//                     ['Marca', 'brand', 'SCANIA', 'text'],
//                     ['Modelo', 'model', 'P340', 'text'],
//                   ].map(([label, key, ph, type]) => (
//                     <div key={key}>
//                       <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                       <input
//                         type={type}
//                         value={form[key]}
//                         onChange={(e) => update(key, e.target.value)}
//                         className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                         placeholder={ph}
//                         required
//                       />
//                     </div>
//                   ))}

//                   {/* Año */}
//                   <div>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
//                     <input
//                       type="number"
//                       min={YEAR_MIN}
//                       max={YEAR_MAX}
//                       value={form.year}
//                       onChange={(e) => update('year', e.target.value)}
//                       className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                       placeholder={String(currentYear)}
//                       required
//                     />
//                     <p className="text-xs text-slate-500 mt-1">Permitido: {YEAR_MIN}–{YEAR_MAX}</p>
//                   </div>

//                   {/* Color */}
//                   <div>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
//                     <input
//                       type="text"
//                       value={form.color}
//                       onChange={(e) => update('color', e.target.value)}
//                       className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                       placeholder="ROJO"
//                       required
//                     />
//                   </div>

//                   {/* Sucursal */}
//                   <div className="sm:col-span-2">
//                     <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
//                     <select
//                       required
//                       value={form.branch}
//                       onChange={(e) => update('branch', e.target.value)}
//                       className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
//                     >
//                       <option value="" disabled>Selecciona sucursal</option>
//                       {branches.map(b => (
//                         <option key={b._id} value={b._id}>
//                           {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Estado */}
//                   <div className="sm:col-span-2">
//                     <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
//                     <select
//                       required
//                       disabled={statusLoading}
//                       value={form.status}
//                       onChange={(e) => update('status', e.target.value)}
//                       className="w-full border p-2 rounded bg-white"
//                     >
//                       <option value="" disabled>Selecciona estado</option>
//                       {statusOptions.map(opt => (
//                         <option key={opt.value} value={opt.value}>{opt.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* ====================== APOYO A OTRAS SUCURSALES ====================== */}
//               <div className="bg-white shadow rounded-xl border">
//                 <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                   <h3 className="font-medium text-slate-700">Servicios de Apoyo a otras Sucursales</h3>
//                 </div>
//                 <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//                   {/* Sucursal destino */}
//                   <div>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal objetivo</label>
//                     <select
//                       value={supportBranch}
//                       onChange={(e) => setSupportBranch(e.target.value)}
//                       className="w-full border p-2 rounded bg-white"
//                     >
//                       <option value="">— Selecciona sucursal —</option>
//                       {branches.map(b => (
//                         <option key={b._id} value={b._id}>
//                           {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   {/* Vehículo de esa sucursal */}
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-slate-600 mb-1">Vehículo a reemplazar</label>
//                     <select
//                       value={supportTarget}
//                       onChange={(e) => setSupportTarget(e.target.value)}
//                       className="w-full border p-2 rounded bg-white"
//                       disabled={!supportBranch}
//                     >
//                       <option value="">— Selecciona vehículo —</option>
//                       {supportVehicles.map(v => (
//                         <option key={v._id} value={v._id}>
//                           {(v.internalCode || v.plate || v._id)} — {v.brand} {v.model}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   {/* Botón acción */}
//                   <div className="flex gap-2">
//                     {supportActiveInfo ? (
//                       <button
//                         type="button"
//                         onClick={finishSupport}
//                         disabled={supportBusy}
//                         className="px-3 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
//                       >
//                         {supportBusy ? 'Finalizando…' : 'Finalizar reemplazo'}
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={startSupport}
//                         disabled={supportBusy || !supportBranch || !supportTarget}
//                         className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//                       >
//                         {supportBusy ? 'Iniciando…' : 'Iniciar reemplazo'}
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Etiquetas de estado de reemplazo */}
//                 {supportActiveInfo && (
//                   <div className="px-4 pb-4">
//                     <div className="text-sm text-slate-600">
//                       En reemplazo desde: {new Date(supportActiveInfo.from).toLocaleString()}
//                     </div>
//                     <div className="text-red-700 font-extrabold text-lg">
//                       {supportActiveInfo.code}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Auditoría (mixta) */}
//               {id && <AuditBlock vehicleId={id} />}

//               {/* Botonera adaptativa Volver/Cancelar + Guardar */}
//               <div className="flex justify-end gap-3 pb-4">
//                 {readOnly ? (
//                   <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//                 ) : (
//                   <>
//                     <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
//                       {isDirty ? 'Cancelar' : 'Volver'}
//                     </button>
//                     <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//                       {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ====================== TECNICO ====================== */}
//           {tab === 'TECNICO' && (
//             <div className="space-y-4">
//               {/* Motor */}
//               <div className="bg-white shadow rounded-xl border">
//                 <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                   <h3 className="font-medium text-slate-700">Motor</h3>
//                 </div>
//                 <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                   {[
//                     ['VIN', 'vin', ''],
//                     ['N° Motor', 'engineNumber', ''],
//                     ['Marca Motor', 'engineBrand', ''],
//                     ['Modelo Motor', 'engineModel', ''],
//                     ['Combustible', 'fuelType', 'DIESEL/GASOLINA'],
//                   ].map(([label, key, ph]) => (
//                     <div key={key}>
//                       <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                       <input
//                         value={form[key]}
//                         onChange={(e) => update(key, e.target.value)}
//                         className="w-full border p-2 rounded"
//                         placeholder={ph}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Transmisión */}
//               <div className="bg-white shadow rounded-xl border">
//                 <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                   <h3 className="font-medium text-slate-700">Transmisión</h3>
//                 </div>
//                 <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//                   {[
//                     ['Tipo', 'transmission.type', 'MANUAL/AUTOMATIC/AMT/CVT'],
//                     ['Marca', 'transmission.brand', 'ALLISON/ZF/EATON'],
//                     ['Modelo', 'transmission.model', '4500 RDS'],
//                     ['Serie', 'transmission.serial', ''],
//                     ['Marchas', 'transmission.gears', '6', 'text'],
//                   ].map(([label, path, ph, type]) => {
//                     const val = path.split('.').reduce((acc, k) => acc?.[k], form) ?? ''
//                     return (
//                       <div key={path}>
//                         <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                         <input
//                           type={type || 'text'}
//                           value={val}
//                           onChange={(e) => updateNested(path, e.target.value)}
//                           className="w-full border p-2 rounded"
//                           placeholder={ph}
//                         />
//                       </div>
//                     )
//                   })}
//                 </div>
//               </div>

//               {/* Medidores */}
//               <div className="bg-white shadow rounded-xl border">
//                 <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                   <h3 className="font-medium text-slate-700">Medidores</h3>
//                 </div>
//                 <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//                   {[
//                     ['Odómetro (km)', 'meters.odometerKm', '0'],
//                     ['Horómetro motor (h)', 'meters.engineHours', '0'],
//                     ['Horas escala (h)', 'meters.ladderHours', '0'],
//                     ['Horas generador (h)', 'meters.generatorHours', '0'],
//                     ['Horas cuerpo bomba (h)', 'meters.pumpHours', '0'],
//                   ].map(([label, path, ph]) => {
//                     const val = path.split('.').reduce((acc, k) => acc?.[k], form) ?? ''
//                     return (
//                       <div key={path}>
//                         <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                         <input
//                           value={val}
//                           onChange={(e) => updateNested(path, e.target.value)}
//                           className="w-full border p-2 rounded"
//                           placeholder={ph}
//                         />
//                       </div>
//                     )
//                   })}
//                 </div>
//               </div>

//               {/* Equipos */}
//               {[
//                 ['Generador', 'generator'],
//                 ['Motobomba', 'pump'],
//                 ['Cuerpo de bomba', 'body'],
//               ].map(([title, key]) => (
//                 <div className="bg-white shadow rounded-xl border" key={key}>
//                   <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                     <h3 className="font-medium text-slate-700">{title}</h3>
//                   </div>
//                   <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     {['brand', 'model', 'serial'].map((f) => (
//                       <div key={f}>
//                         <label className="block text-sm font-medium text-slate-600 mb-1">
//                           {f === 'brand' ? 'Marca' : f === 'model' ? 'Modelo' : 'Serie'}
//                         </label>
//                         <input
//                           value={form[key]?.[f] ?? ''}
//                           onChange={(e) => updateNested(`${key}.${f}`, e.target.value)}
//                           className="w-full border p-2 rounded"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}

//               {/* Auditoría */}
//               {id && <AuditBlock vehicleId={id} />}

//               <div className="flex justify-end gap-3 pb-4">
//                 {readOnly ? (
//                   <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//                 ) : (
//                   <>
//                     <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
//                       {isDirty ? 'Cancelar' : 'Volver'}
//                     </button>
//                     <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//                       {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ====================== DOCUMENTOS ====================== */}
//           {tab === 'DOCUMENTOS' && (
//             <div className="space-y-4">
//               <div className="bg-white shadow rounded-xl border">
//                 <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                   <h3 className="font-medium text-slate-700">Legal</h3>
//                 </div>
//                 <div className="p-4 grid grid-cols-1 gap-6">
//                   {/* Padrón extendido */}
//                   <div className="grid sm:grid-cols-6 gap-3 items-end">
//                     <div className="sm:col-span-2">
//                       <label className="block text-sm font-medium text-slate-600">Padrón | N°</label>
//                       <input maxLength={20} value={form.legal.padron.number} onChange={(e) => updateNested('legal.padron.number', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                       <input value={form.legal.padron.issuer} onChange={(e) => updateNested('legal.padron.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">F. Adquisición</label>
//                       <input type="date" value={form.legal.padron.acquisitionDate || ''} onChange={(e) => updateNested('legal.padron.acquisitionDate', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">F. Inscripción</label>
//                       <input type="date" value={form.legal.padron.inscriptionDate || ''} onChange={(e) => updateNested('legal.padron.inscriptionDate', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">F. Emisión</label>
//                       <input type="date" value={form.legal.padron.issueDate || ''} onChange={(e) => updateNested('legal.padron.issueDate', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                   </div>

//                   {/* SOAP */}
//                   <div className="grid sm:grid-cols-6 gap-3 items-end">
//                     <div className="sm:col-span-2">
//                       <label className="block text-sm font-medium text-slate-600">SOAP | Póliza</label>
//                       <input value={form.legal.soap.policy} onChange={(e) => updateNested('legal.soap.policy', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
//                       <input value={form.legal.soap.issuer} onChange={(e) => updateNested('legal.soap.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                       <input type="date" value={form.legal.soap.validFrom || ''} onChange={(e) => updateNested('legal.soap.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Fin</label>
//                       <input type="date" value={form.legal.soap.validTo || ''} onChange={(e) => updateNested('legal.soap.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                   </div>

//                   {/* Seguro */}
//                   <div className="grid sm:grid-cols-6 gap-3 items-end">
//                     <div className="sm:col-span-2">
//                       <label className="block text-sm font-medium text-slate-600">Seguro | Póliza</label>
//                       <input value={form.legal.insurance.policy} onChange={(e) => updateNested('legal.insurance.policy', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
//                       <input value={form.legal.insurance.issuer} onChange={(e) => updateNested('legal.insurance.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                       <input type="date" value={form.legal.insurance.validFrom || ''} onChange={(e) => updateNested('legal.insurance.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Fin</label>
//                       <input type="date" value={form.legal.insurance.validTo || ''} onChange={(e) => updateNested('legal.insurance.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                   </div>

//                   {/* TAG */}
//                   <div className="grid sm:grid-cols-3 gap-3 items-end">
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">TAG | N°</label>
//                       <input value={form.legal.tag.number} onChange={(e) => updateNested('legal.tag.number', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                       <input value={form.legal.tag.issuer} onChange={(e) => updateNested('legal.tag.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                   </div>

//                   {/* Tarjeta combustible */}
//                   <div className="grid sm:grid-cols-3 gap-3 items-end">
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Tarj. combustible | Emisor</label>
//                       <input value={form.legal.fuelCard.issuer} onChange={(e) => updateNested('legal.fuelCard.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">N° Tarjeta</label>
//                       <input value={form.legal.fuelCard.number} onChange={(e) => updateNested('legal.fuelCard.number', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Vence</label>
//                       <input type="date" value={form.legal.fuelCard.validTo || ''} onChange={(e) => updateNested('legal.fuelCard.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                   </div>

//                   {/* Revisión técnica */}
//                   <div className="grid sm:grid-cols-6 gap-3 items-end">
//                     <div className="sm:col-span-2">
//                       <label className="block text-sm font-medium text-slate-600">Revisión técnica | N°</label>
//                       <input value={form.legal.technicalReview.number} onChange={(e) => updateNested('legal.technicalReview.number', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                       <input value={form.legal.technicalReview.issuer} onChange={(e) => updateNested('legal.technicalReview.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Fecha revisión</label>
//                       <input type="date" value={form.legal.technicalReview.reviewedAt || ''} onChange={(e) => updateNested('legal.technicalReview.reviewedAt', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Vencimiento</label>
//                       <input type="date" value={form.legal.technicalReview.validTo || ''} onChange={(e) => updateNested('legal.technicalReview.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                   </div>

//                   {/* Permiso de circulación */}
//                   <div className="grid sm:grid-cols-6 gap-3 items-end">
//                     <div className="sm:col-span-2">
//                       <label className="block text-sm font-medium text-slate-600">Permiso de circulación | N°</label>
//                       <input value={form.legal.circulationPermit.number} onChange={(e) => updateNested('legal.circulationPermit.number', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                       <input value={form.legal.circulationPermit.issuer} onChange={(e) => updateNested('legal.circulationPermit.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Fecha revisión</label>
//                       <input type="date" value={form.legal.circulationPermit.reviewedAt || ''} onChange={(e) => updateNested('legal.circulationPermit.reviewedAt', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-600">Vencimiento</label>
//                       <input type="date" value={form.legal.circulationPermit.validTo || ''} onChange={(e) => updateNested('legal.circulationPermit.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Auditoría */}
//               {id && <AuditBlock vehicleId={id} />}

//               <div className="flex justify-end gap-3 pb-4">
//                 {readOnly ? (
//                   <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//                 ) : (
//                   <>
//                     <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
//                       {isDirty ? 'Cancelar' : 'Volver'}
//                     </button>
//                     <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//                       {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ====================== MEDIOS ====================== */}
//           {tab === 'MEDIOS' && (
//             <div className="space-y-4">
//               <div className="bg-white shadow rounded-xl border">
//                 <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                   <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
//                 </div>
//                 <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {mediaCats.map(([label, cat]) => (
//                     <div key={cat} className="border rounded-lg p-3">
//                       <div className="font-medium mb-2">{label}</div>
//                       <MediaUploader
//                         onUpload={(p) =>
//                           // admite fotos, videos y PDF indistintamente
//                           (p?.file?.type?.toLowerCase?.()?.includes('pdf') || p?.file?.name?.toLowerCase?.()?.endsWith('.pdf'))
//                             ? handleUploadDoc({ ...p, category: cat, label: p.title })
//                             : handleUploadPhoto({ ...p, category: cat, title: p.title })
//                         }
//                         accept={'image/*,video/*,application/pdf'}
//                         category={cat}
//                         mode={'mixed'}
//                       />
//                       {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Contenido actual */}
//               {vehicle && (
//                 <div className="bg-white shadow rounded-xl border">
//                   <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                     <h3 className="font-medium text-slate-700">Contenido actual</h3>
//                   </div>
//                   <div className="p-4 grid gap-6">
//                     {/* Fotos/Videos */}
//                     <div>
//                       <div className="font-medium mb-1">Fotos / Videos</div>
//                       <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
//                         {(vehicle.photos || []).map((ph, idx) => {
//                           const isVideo = /^(mp4|mov|webm)$/i.test(ph.format || '')
//                           return (
//                             <div key={ph._id} className="text-xs">
//                               {isVideo ? (
//                                 <video
//                                   className="w-full h-24 rounded border object-cover"
//                                   controls
//                                   onClick={() => openViewer(idx)}
//                                 >
//                                   <source src={ph.url} />
//                                 </video>
//                               ) : (
//                                 <img
//                                   src={ph.url}
//                                   alt={ph.title || ''}
//                                   className="w-full h-24 object-cover rounded border cursor-pointer"
//                                   onClick={() => openViewer(idx)}
//                                 />
//                               )}
//                               <div className="mt-1 break-words">{ph.title}</div>
//                               <button
//                                 type="button"
//                                 onClick={() => handleDeletePhoto(ph._id)}
//                                 className="mt-1 text-red-600 hover:underline"
//                               >Eliminar</button>
//                             </div>
//                           )
//                         })}
//                       </div>
//                     </div>
//                     {/* Documentos/PDF */}
//                     <div>
//                       <div className="font-medium mb-1">Documentos</div>
//                       <ul className="list-disc pl-5 text-sm space-y-1">
//                         {(vehicle.documents || []).map(d => (
//                           <li key={d._id} className="break-words">
//                             {d.label} — <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ver</a>
//                             <button
//                               type="button"
//                               onClick={() => handleDeleteDoc(d._id)}
//                               className="ml-3 text-red-600 hover:underline"
//                             >Eliminar</button>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* MODAL VISOR - Flechas centradas, teclas ← → */}
//               {viewerOpen && vehicle?.photos?.length > 0 && (
//                 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" ref={viewerRef}>
//                   <div className="bg-white rounded-lg max-w-5xl w-full mx-4 p-3 relative">
//                     <button className="absolute top-2 right-2 text-slate-700" onClick={closeViewer}>✕</button>
//                     <div className="w-full flex items-center justify-between my-2">
//                       <div className="flex-1 flex justify-center">
//                         <div className="text-sm">{vehicle.photos[viewerIndex]?.title}</div>
//                       </div>
//                     </div>
//                     <div className="relative">
//                       <button
//                         className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-2 border rounded bg-white/90"
//                         onClick={prevViewer}
//                         aria-label="Anterior"
//                       >
//                         ◀
//                       </button>
//                       <div className="w-full">
//                         {/* Mostrar imagen o video en el visor */}
//                         {/^(mp4|mov|webm)$/i.test(vehicle.photos[viewerIndex]?.format || '')
//                           ? (
//                             <video
//                               className="max-h-[75vh] mx-auto rounded border"
//                               controls
//                               autoPlay
//                             >
//                               <source src={vehicle.photos[viewerIndex]?.url} />
//                             </video>
//                           ) : (
//                             <img
//                               src={vehicle.photos[viewerIndex]?.url}
//                               alt={vehicle.photos[viewerIndex]?.title || ''}
//                               className="max-h-[75vh] mx-auto object-contain rounded border"
//                             />
//                           )
//                         }
//                       </div>
//                       <button
//                         className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 border rounded bg-white/90"
//                         onClick={nextViewer}
//                         aria-label="Siguiente"
//                       >
//                         ▶
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Auditoría */}
//               {id && <AuditBlock vehicleId={id} />}

//               <div className="flex justify-end">
//                 <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//               </div>
//             </div>
//           )}

//           {/* ====================== INVENTARIO / ACCIDENTES / COMBUSTIBLE ====================== */}
//           {['INVENTARIO', 'ACCIDENTES', 'COMBUSTIBLE'].includes(tab) && (
//             <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//               Este módulo está en desarrollo.
//               {/* Auditoría */}
//               {id && <AuditBlock vehicleId={id} />}
//               <div className="flex justify-end mt-4">
//                 {readOnly ? (
//                   <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//                 ) : (
//                   <>
//                     <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
//                       {isDirty ? 'Cancelar' : 'Volver'}
//                     </button>
//                     <button type="submit" disabled={saving} className="ml-2 px-3 py-2 bg-blue-600 text-white rounded">
//                       {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ====================== TICKETS ====================== */}
//           {tab === 'TICKETS' && (
//             <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//               Este módulo está en desarrollo.
//               {/* Si más adelante decides montar <TicketsBlock />:
//                  <TicketsBlock vehicleId={id} />
//               */}
//               {id && <AuditBlock vehicleId={id} />}
//               <div className="flex justify-end mt-4">
//                 {readOnly ? (
//                   <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//                 ) : (
//                   <>
//                     <button type="button" onClick={handleCancel} className="px-3 py-2 border rounded">
//                       {isDirty ? 'Cancelar' : 'Volver'}
//                     </button>
//                     <button type="submit" disabled={saving} className="ml-2 px-3 py-2 bg-blue-600 text-white rounded">
//                       {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </fieldset>
//       </form>
//     </div>
//   )
// }

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
import { api } from '../../services/http'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import MediaUploader from '../../components/Vehicle/VehicleMediaUploader'
import {
  uploadVehiclePhoto,
  uploadVehicleDocument,
  deleteVehiclePhoto,
  deleteVehicleDocument
} from '../../api/vehicles.api'

// ===================== Helpers generales =====================
const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

function ymd(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${mm}-${dd}`
}
function parseYMD(str) {
  if (!str) return undefined
  const [Y, M, D] = str.split('-').map(n => parseInt(n, 10))
  if (!Y || !M || !D) return undefined
  return new Date(Date.UTC(Y, M - 1, D))
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
function deepEqual(a, b) {
  try { return JSON.stringify(a) === JSON.stringify(b) } catch { return false }
}

// ===================== Guard de cambios no guardados =====================
// - beforeunload (recarga/cerrar)
// - Intercepta clics en <a> internos para confirmar si isDirty
function UnsavedChangesGuard({ isDirty }) {
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    const onDocClick = (e) => {
      if (!isDirty) return
      // Sólo anchors con navegación interna
      const a = e.target.closest?.('a')
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
      const isSameOrigin = a.origin === window.location.origin
      if (!isSameOrigin) return // enlaces externos no los bloqueamos
      const confirmLeave = window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')
      if (!confirmLeave) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('click', onDocClick, true)
    return () => document.removeEventListener('click', onDocClick, true)
  }, [isDirty])

  return null
}

// ===================== Auditoría (mixta 5 + ver más) =====================
function AuditBlock({ vehicleId }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(5) // mixto: 5 iniciales
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (lim = limit) => {
    if (!vehicleId) return
    setLoading(true)
    try {
      const { data } = await api.get(`/api/v1/vehicles/${vehicleId}/audit`, {
        params: { page: 1, limit: lim }
      })
      setItems(data?.items || [])
      setTotal(data?.total || 0)
    } catch (_) { /* noop */ } finally { setLoading(false) }
  }, [vehicleId, limit])

  useEffect(() => { load(limit) }, [load, limit])

  const showMore = () => {
    const next = Math.min(limit + 10, total || limit + 10)
    setLimit(next)
  }

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
              <li key={idx} className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-slate-500">
                    {new Date(it.at).toLocaleString()}
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {it.action}
                  </div>
                </div>
                {/* Muestra un resumen: intenta detalle from → to si existe */}
                <div className="mt-1">
                  {it?.data?.detail ? (
                    <span className="text-slate-700">{it.data.detail}</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </div>
                {it.by && (
                  <div className="mt-1 text-xs text-slate-400">
                    por: {it.by}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {total > limit && (
          <div className="p-2 border-t flex justify-center">
            <button
              type="button"
              onClick={showMore}
              className="text-xs text-blue-600 hover:underline"
            >
              Ver más
            </button>
          </div>
        )}
      </div>
    </div>
  )
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
  const [tab, setTab] = useState('BASICO')

  // Catálogos y sucursales
  const [branches, setBranches] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [statusLoading, setStatusLoading] = useState(false)

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
  const viewerRef = useRef(null)

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
      soap:      { policy: '', issuer: '', validFrom: '', validTo: '' },
      insurance: { policy: '', issuer: '', validFrom: '', validTo: '' },
      tag:       { number: '', issuer: '' },
      fuelCard:  { issuer: '', number: '', validTo: '' },
      // NUEVOS BLOQUES
      technicalReview: { number: '', issuer: '', reviewedAt: '', validTo: '' }, // revisión técnica
      circulationPermit: { number: '', issuer: '', reviewedAt: '', validTo: '' } // permiso circulación
    }
  })

  // Para detectar cambios
  const [initialForm, setInitialForm] = useState(null)
  const isDirty = !readOnly && !deepEqual(form, initialForm || form)

  // ===================== Scroll central independiente =====================
  // Este contenedor hará que el contenido interno scrollee sin afectar el menú lateral
  const scrollContainerClass =
    'max-w-6xl mx-auto h-[calc(100vh-140px)] overflow-y-auto px-1 sm:px-0'

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
      })
      .finally(() => setStatusLoading(false))
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

        // Apoyo activo
        let supportInfo = null
        const last = Array.isArray(v.assignments) && v.assignments.length ? v.assignments[v.assignments.length - 1] : null
        if (last && last.reason === 'APOYO' && !last.endAt) {
          supportInfo = { from: last.startAt, code: v.internalCode }
        }
        setSupportActiveInfo(supportInfo)

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
          pump:      { brand: v.pump?.brand || '',      model: v.pump?.model || '',      serial: v.pump?.serial || '' },
          body:      { brand: v.body?.brand || '',      model: v.body?.model || '',      serial: v.body?.serial || '' },
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
              validFrom: ymd(v.legal?.padron?.validFrom),
              validTo: ymd(v.legal?.padron?.validTo)
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

      // Parseo de fechas (Documentos y Padrón extendido)
      payload.legal.padron.acquisitionDate = parseYMD(form.legal.padron.acquisitionDate)
      payload.legal.padron.inscriptionDate = parseYMD(form.legal.padron.inscriptionDate)
      payload.legal.padron.issueDate       = parseYMD(form.legal.padron.issueDate)

      payload.legal.soap.validFrom         = parseYMD(form.legal.soap.validFrom)
      payload.legal.soap.validTo           = parseYMD(form.legal.soap.validTo)
      payload.legal.insurance.validFrom    = parseYMD(form.legal.insurance.validFrom)
      payload.legal.insurance.validTo      = parseYMD(form.legal.insurance.validTo)
      payload.legal.fuelCard.validTo       = parseYMD(form.legal.fuelCard.validTo)

      payload.legal.technicalReview.reviewedAt = parseYMD(form.legal.technicalReview.reviewedAt)
      payload.legal.technicalReview.validTo    = parseYMD(form.legal.technicalReview.validTo)
      payload.legal.circulationPermit.reviewedAt = parseYMD(form.legal.circulationPermit.reviewedAt)
      payload.legal.circulationPermit.validTo    = parseYMD(form.legal.circulationPermit.validTo)

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

  // ===================== Medios =====================
  const canUpload = useMemo(() => Boolean(id), [id])
  const refresh = async () => {
    if (!id) return
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }
  const handleUploadPhoto = async ({ file, category = 'BASIC', title = '' }) => {
    if (!id) throw new Error('Guarda el vehículo antes de subir medios')
    await uploadVehiclePhoto(id, { file, category, title })
    await refresh()
  }
  const handleUploadDoc = async ({ file, category, label }) => {
    if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
    await uploadVehicleDocument(id, { file, category, label })
    await refresh()
  }
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

  // ===================== Apoyo (UI) =====================
  useEffect(() => {
    if (!supportBranch) { setSupportVehicles([]); setSupportTarget(''); return }
    api.get('/api/v1/vehicles', { params: { page: 1, limit: 500, branch: supportBranch } })
      .then(({ data }) => {
        const items = data?.items || data?.data || []
        setSupportVehicles(items)
      })
  }, [supportBranch])

  async function startSupport() {
    if (!id || !supportBranch || !supportTarget) {
      return alert('Selecciona sucursal y vehículo objetivo.')
    }
    // No reemplazarse a sí mismo
    if (supportTarget === id) {
      return alert('Un vehículo no puede reemplazarse a sí mismo.')
    }
    setSupportBusy(true)
    try {
      await api.post(`/api/v1/vehicles/${id}/support/start`, {
        targetBranch: supportBranch,
        targetVehicle: supportTarget,
      })
      alert('Reemplazo iniciado')
      navigate('/vehicles') // redirección a lista
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
      await api.post(`/api/v1/vehicles/${id}/support/finish`)
      await refresh()
      setSupportActiveInfo(null)
      setSupportBranch(''); setSupportVehicles([]); setSupportTarget('')
      alert('Reemplazo finalizado')
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo finalizar el reemplazo')
    } finally {
      setSupportBusy(false)
    }
  }

  // ===================== Carrusel de imágenes/videos =====================
  function openViewer(idx) { setViewerIndex(idx); setViewerOpen(true) }
  function closeViewer() { setViewerOpen(false) }
  function prevViewer() {
    if (!vehicle?.photos?.length) return
    setViewerIndex((viewerIndex - 1 + vehicle.photos.length) % vehicle.photos.length)
  }
  function nextViewer() {
    if (!vehicle?.photos?.length) return
    setViewerIndex((viewerIndex + 1) % vehicle.photos.length)
  }

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
  if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

  const TabButton = ({ code, label }) => (
    <button
      type="button"
      onClick={() => setTab(code)}
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

      <header className="px-2 sm:px-0 max-w-6xl mx-auto w-full mt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {readOnly ? 'Consulta de vehículo' : id ? 'Editar Vehículo' : 'Registrar Vehículo'}
            </h2>
            {!readOnly && (
              <p className="text-sm text-slate-500">
                Los textos se guardan en MAYÚSCULAS.
              </p>
            )}
          </div>
          <nav className="flex gap-2">
            <TabButton code="BASICO" label="Básico" />
            <TabButton code="TECNICO" label="Técnico" />
            <TabButton code="DOCUMENTOS" label="Documentos" />
            <TabButton code="MEDIOS" label="Medios" />
            <TabButton code="INVENTARIO" label="Inventario" />
            <TabButton code="ACCIDENTES" label="Accidentes" />
            <TabButton code="COMBUSTIBLE" label="Combustible" />
            {/* NUEVA pestaña solicitada */}
            <TabButton code="TICKETS" label="Tickets" />
          </nav>
        </div>
      </header>

      {error && <div className="max-w-6xl mx-auto px-3 py-2 bg-red-50 text-red-700 rounded text-sm mt-2">{error}</div>}
      {notice && <div className="max-w-6xl mx-auto px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm mt-2">{notice}</div>}

      {/* Contenedor con scroll propio, independiente del menú */}
      <form onSubmit={handleSubmit} className={`${scrollContainerClass} my-3`}>
        <fieldset disabled={readOnly} className="space-y-4">

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
                      disabled={statusLoading}
                      value={form.status}
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
                  {/* Sucursal destino */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal objetivo</label>
                    <select
                      value={supportBranch}
                      onChange={(e) => setSupportBranch(e.target.value)}
                      className="w-full border p-2 rounded bg-white"
                    >
                      <option value="">— Selecciona sucursal —</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>
                          {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Vehículo de esa sucursal */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Vehículo a reemplazar</label>
                    <select
                      value={supportTarget}
                      onChange={(e) => setSupportTarget(e.target.value)}
                      className="w-full border p-2 rounded bg-white"
                      disabled={!supportBranch}
                    >
                      <option value="">— Selecciona vehículo —</option>
                      {supportVehicles.map(v => (
                        <option key={v._id} value={v._id}>
                          {(v.internalCode || v.plate || v._id)} — {v.brand} {v.model}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Botón acción */}
                  <div className="flex gap-2">
                    {supportActiveInfo ? (
                      <button
                        type="button"
                        onClick={finishSupport}
                        disabled={supportBusy}
                        className="px-3 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                      >
                        {supportBusy ? 'Finalizando…' : 'Finalizar reemplazo'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startSupport}
                        disabled={supportBusy || !supportBranch || !supportTarget}
                        className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                      >
                        {supportBusy ? 'Iniciando…' : 'Iniciar reemplazo'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Etiquetas de estado de reemplazo */}
                {supportActiveInfo && (
                  <div className="px-4 pb-4">
                    <div className="text-sm text-slate-600">
                      En reemplazo desde: {new Date(supportActiveInfo.from).toLocaleString()}
                    </div>
                    <div className="text-red-700 font-extrabold text-lg">
                      {supportActiveInfo.code}
                    </div>
                  </div>
                )}
              </div>

              {/* Auditoría (mixta) */}
              {id && <AuditBlock vehicleId={id} />}

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
                  <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
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
              </div>

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
                              <div className="mt-1 break-words">{ph.title}</div>
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
                          <li key={d._id} className="break-words">
                            {d.label} — <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ver</a>
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(d._id)}
                              className="ml-3 text-red-600 hover:underline"
                            >Eliminar</button>
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
        </fieldset>
      </form>
    </div>
  )
}


