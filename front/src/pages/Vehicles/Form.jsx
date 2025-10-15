// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // Ficha de Vehículos con tabs: Básico, Técnico, Documentos, Medios.
// // - TODOS los campos de texto se normalizan a MAYÚSCULAS (front y back).
// // - Subida de medios por tarjeta (category) usando MediaUploader.
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import { api } from '../../services/http'
// import { useNavigate, useParams } from 'react-router-dom'
// import MediaUploader from '../../components/Vehicle/VehicleMediaUploader'
// import { uploadVehiclePhoto, uploadVehicleDocument } from '../../api/vehicles.api'

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

// export default function VehiclesForm() {
//   const navigate = useNavigate()
//   const { id } = useParams()

//   const [tab, setTab] = useState('BASICO') // BASICO|TECNICO|DOCUMENTOS|MEDIOS
//   const [branches, setBranches] = useState([])
//   const [saving, setSaving] = useState(false)
//   const [loading, setLoading] = useState(!!id)
//   const [error, setError] = useState('')
//   const [notice, setNotice] = useState('')

//   const [vehicle, setVehicle] = useState(null)

//   const [form, setForm] = useState({
//     // Básico (obligatorio)
//     plate: '',
//     internalCode: '',
//     status: 'ACTIVE',
//     type: '',
//     brand: '',
//     model: '',
//     year: '',
//     color: '',
//     branch: '',

//     // Técnico
//     vin: '',
//     engineNumber: '',
//     engineBrand: '',
//     engineModel: '',
//     fuelType: '',
//     transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
//     batteries: [], // dejamos edición básica (no UI compleja aún)
//     tyres: [],

//     generator: { brand:'', model:'', serial:'' },
//     pump: { brand:'', model:'', serial:'' },
//     body: { brand:'', model:'', serial:'' },

//     meters: { odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
//   })

//   // ---------- Helpers ----------
//   const upperPatch = (obj) => {
//     const out = Array.isArray(obj) ? [] : {}
//     for (const k of Object.keys(obj)) {
//       const v = obj[k]
//       if (typeof v === 'string') out[k] = U(v)
//       else if (v && typeof v === 'object') out[k] = upperPatch(v)
//       else out[k] = v
//     }
//     return out
//   }

//   function update(field, val) {
//     setForm((f) => ({ ...f, [field]: typeof val === 'string' ? U(val) : val }))
//   }
//   function updateNested(path, val) {
//     setForm((f) => {
//       const clone = structuredClone(f)
//       let ref = clone
//       const parts = path.split('.')
//       for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]]
//       ref[parts.at(-1)] = (typeof val === 'string' ? U(val) : val)
//       return clone
//     })
//   }

//   // ---------- Branches ----------
//   useEffect(() => {
//     api.get('/api/v1/branches', { params: { page: 1, limit: 100 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || data?.list || []
//         setBranches(payload)
//         if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.')
//       })
//       .catch(() => setBranches([]))
//   }, [])

//   // ---------- Cargar vehículo (edit) ----------
//   useEffect(() => {
//     if (!id) return
//     setLoading(true)
//     api.get(`/api/v1/vehicles/${id}`)
//       .then(({ data }) => {
//         const v = data?.item || data
//         setVehicle(v)
//         setForm({
//           plate: v.plate || '',
//           internalCode: v.internalCode || '',
//           status: v.status || 'ACTIVE',
//           type: v.type || '',
//           brand: v.brand || '',
//           model: v.model || '',
//           year: v.year || '',
//           color: v.color || '',
//           branch: v.branch?._id || v.branch || '',

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
//           batteries: v.batteries || [],
//           tyres: v.tyres || [],
//           generator: {
//             brand: v.generator?.brand || '',
//             model: v.generator?.model || '',
//             serial: v.generator?.serial || '',
//           },
//           pump: {
//             brand: v.pump?.brand || '',
//             model: v.pump?.model || '',
//             serial: v.pump?.serial || '',
//           },
//           body: {
//             brand: v.body?.brand || '',
//             model: v.body?.model || '',
//             serial: v.body?.serial || '',
//           },
//           meters: {
//             odometerKm: v.meters?.odometerKm || '',
//             engineHours: v.meters?.engineHours || '',
//             ladderHours: v.meters?.ladderHours || '',
//             generatorHours: v.meters?.generatorHours || '',
//             pumpHours: v.meters?.pumpHours || '',
//           },
//         })
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
//       .finally(() => setLoading(false))
//   }, [id])

//   // ---------- Guardar ----------
//   async function handleSubmit(e) {
//     e.preventDefault()
//     setSaving(true); setError('')

//     try {
//       // Validación mínima en front
//       const reqFields = ['plate','internalCode','status','type','brand','model','year','color','branch']
//       for (const k of reqFields) {
//         if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`)
//       }
//       const payload = upperPatch({
//         ...form,
//         year: form.year ? Number(form.year) : undefined,
//         transmission: {
//           ...form.transmission,
//           gears: form.transmission.gears ? Number(form.transmission.gears) : undefined
//         },
//         meters: {
//           odometerKm: form.meters.odometerKm ? Number(form.meters.odometerKm) : undefined,
//           engineHours: form.meters.engineHours ? Number(form.meters.engineHours) : undefined,
//           ladderHours: form.meters.ladderHours ? Number(form.meters.ladderHours) : undefined,
//           generatorHours: form.meters.generatorHours ? Number(form.meters.generatorHours) : undefined,
//           pumpHours: form.meters.pumpHours ? Number(form.meters.pumpHours) : undefined,
//         }
//       })

//       if (id) {
//         await api.patch(`/api/v1/vehicles/${id}`, payload)
//         alert('Vehículo actualizado con éxito')
//       } else {
//         await api.post('/api/v1/vehicles', payload)
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

//   // ---------- Media handlers ----------
//   const canUpload = useMemo(()=>Boolean(id), [id])
//   const handleUploadBasicPhoto = async ({ file, category='BASIC', title='' }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir medios')
//     await uploadVehiclePhoto(id, { file, category, title })
//     // refresh ligero
//     const { data } = await api.get(`/api/v1/vehicles/${id}`)
//     setVehicle(data?.item || data)
//   }
//   const handleUploadTechPhoto = async ({ file, category, title }) => handleUploadBasicPhoto({ file, category, title })
//   const handleUploadLegalDoc = async ({ file, category, label }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
//     await uploadVehicleDocument(id, { file, category, label })
//     const { data } = await api.get(`/api/v1/vehicles/${id}`)
//     setVehicle(data?.item || data)
//   }

//   if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
//       <header className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
//           <p className="text-sm text-slate-500">Completa las tarjetas. Los textos se guardan en MAYÚSCULAS.</p>
//         </div>
//         <nav className="flex gap-2">
//           {['BASICO','TECNICO','DOCUMENTOS','MEDIOS'].map(t=>(
//             <button type="button" key={t}
//               onClick={()=>setTab(t)}
//               className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white':'bg-white border'}`}>
//               {t==='BASICO'?'Básico':t==='TECNICO'?'Técnico':t==='DOCUMENTOS'?'Documentos':'Medios'}
//             </button>
//           ))}
//         </nav>
//       </header>

//       {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
//       {!branches.length && !id && <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>}

//       {/* --------- TAB BASICO --------- */}
//       {tab==='BASICO' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Información básica</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {[
//                 ['Placa / Patente','plate','ABC-123'],
//                 ['Código interno','internalCode','B:10'],
//                 ['Estado','status','ACTIVE'],
//                 ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN...'],
//                 ['Marca','brand','SCANIA'],
//                 ['Modelo','model','P340'],
//                 ['Año','year','2020', 'number'],
//                 ['Color','color','ROJO'],
//               ].map(([label, key, ph, type])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     type={type||'text'}
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                     placeholder={ph}
//                     required
//                   />
//                 </div>
//               ))}

//               {/* Sucursal */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
//                 <select
//                   required
//                   value={form.branch}
//                   onChange={(e)=>update('branch', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
//                 >
//                   <option value="" disabled>Selecciona sucursal</option>
//                   {branches.map((b)=>(
//                     <option key={b._id} value={b._id}>
//                       {b.code ? `${b.code} — ${b.name}` : b.name || b._id}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Mini uploader para fotos básicas */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Fotos básicas</h3>
//             </div>
//             <div className="p-4">
//               <MediaUploader
//                 onUpload={handleUploadBasicPhoto}
//                 accept="image/*"
//                 category="BASIC"
//                 titleLabel="Título de la foto"
//                 mode="photo"
//               />
//               {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
//             </div>
//           </div>

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Cancelar</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* --------- TAB TECNICO --------- */}
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
//             <div className="px-4 pb-4">
//               <MediaUploader
//                 onUpload={(p)=>handleUploadTechPhoto({ ...p, category:'ENGINE' })}
//                 accept="image/*,video/*"
//                 category="ENGINE"
//                 titleLabel="Título (ej. PLACA MOTOR)"
//                 mode="photo"
//               />
//               {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
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
//                 ['Marchas','transmission.gears','6','number'],
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
//             <div className="px-4 pb-4">
//               <MediaUploader
//                 onUpload={(p)=>handleUploadTechPhoto({ ...p, category:'TRANSMISSION' })}
//                 accept="image/*,video/*"
//                 category="TRANSMISSION"
//                 titleLabel="Título (ej. PLACA CAJA)"
//                 mode="photo"
//               />
//             </div>
//           </div>

//           {/* Equipos: Generador / Motobomba / Cuerpo de Bomba */}
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
//               <div className="px-4 pb-4">
//                 <MediaUploader
//                   onUpload={(p)=>handleUploadTechPhoto({ ...p, category:key.toUpperCase() })}
//                   accept="image/*,video/*"
//                   category={key.toUpperCase()}
//                   titleLabel="Título (ej. PLACA EQUIPO)"
//                   mode="photo"
//                 />
//               </div>
//             </div>
//           ))}

//           {/* Medidores */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Medidores</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//               {[
//                 ['Odómetro (km)','meters.odometerKm','0','number'],
//                 ['Horómetro motor (h)','meters.engineHours','0','number'],
//                 ['Horas escala (h)','meters.ladderHours','0','number'],
//                 ['Horas generador (h)','meters.generatorHours','0','number'],
//                 ['Horas cuerpo bomba (h)','meters.pumpHours','0','number'],
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

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* --------- TAB DOCUMENTOS --------- */}
//       {tab==='DOCUMENTOS' && (
//         <div className="space-y-4">
//           {/* LEGAL */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Legal</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {[
//                 ['Padrón - N°','legal.padron.number'],
//                 ['Padrón - Emisor','legal.padron.issuer'],
//                 ['SOAP - Póliza','legal.soap.policy'],
//                 ['SOAP - Emisor','legal.soap.issuer'],
//                 ['Seguro - Póliza','legal.insurance.policy'],
//                 ['Seguro - Emisor','legal.insurance.issuer'],
//                 ['TAG - N°','legal.tag.number'],
//                 ['TAG - Emisor','legal.tag.issuer'],
//                 ['Tarj. combustible - Emisor','legal.fuelCard.issuer'],
//                 ['Tarj. combustible - N°','legal.fuelCard.number'],
//               ].map(([label,path])=>{
//                 const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
//                 return (
//                   <div key={path}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                     <input
//                       value={val}
//                       onChange={(e)=>updateNested(path, e.target.value)}
//                       className="w-full border p-2 rounded"
//                     />
//                   </div>
//                 )
//               })}
//               {/* Fechas y numéricos simples los puedes añadir luego */}
//             </div>

//             {/* Subida de documentos LEGAL */}
//             <div className="px-4 pb-4">
//               <MediaUploader
//                 onUpload={(p)=>handleUploadLegalDoc({ ...p, category:'LEGAL' })}
//                 accept="application/pdf,image/*"
//                 category="LEGAL"
//                 labelLabel="Etiqueta (ej. SOAP 2026)"
//                 mode="doc"
//               />
//               {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
//             </div>

//             {/* Manuales/Partes (misma tarjeta por simplicidad) */}
//             <div className="px-4 pb-4">
//               <h4 className="font-medium text-slate-700 mb-2">Manuales / Partes</h4>
//               <div className="grid sm:grid-cols-2 gap-3">
//                 <MediaUploader
//                   onUpload={(p)=>handleUploadLegalDoc({ ...p, category:'MANUALS' })}
//                   accept="application/pdf,image/*"
//                   category="MANUALS"
//                   labelLabel="Manual (ej. MOTOR DC13)"
//                   mode="doc"
//                 />
//                 <MediaUploader
//                   onUpload={(p)=>handleUploadLegalDoc({ ...p, category:'PARTS' })}
//                   accept="application/pdf,image/*"
//                   category="PARTS"
//                   labelLabel="Partes (ej. CATÁLOGO NEUMÁTICOS)"
//                   mode="doc"
//                 />
//               </div>
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

//       {/* --------- TAB MEDIOS (galerías por categoría) --------- */}
//       {tab==='MEDIOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Medios por tarjeta</h3>
//             </div>
//             <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 ['Básico','BASIC'],
//                 ['Motor','ENGINE'],
//                 ['Transmisión','TRANSMISSION'],
//                 ['Generador','GENERATOR'],
//                 ['Motobomba','PUMP'],
//                 ['Cuerpo de bomba','BODY'],
//                 ['Documentos (legal)','LEGAL'],
//                 ['Manuales','MANUALS'],
//                 ['Partes','PARTS'],
//                 ['Técnico libre','TECHNICAL'],
//                 ['Videos','VIDEOS'],
//               ].map(([label,cat])=>(
//                 <div key={cat} className="border rounded-lg p-3">
//                   <div className="font-medium mb-2">{label}</div>
//                   <MediaUploader
//                     onUpload={(p)=> cat==='LEGAL' || cat==='MANUALS' || cat==='PARTS'
//                       ? handleUploadLegalDoc({ ...p, category:cat })
//                       : handleUploadTechPhoto({ ...p, category:cat })}
//                     accept={cat==='VIDEOS' ? 'video/*' : (cat==='LEGAL' || cat==='MANUALS' || cat==='PARTS' ? 'application/pdf,image/*' : 'image/*,video/*')}
//                     category={cat}
//                     mode={cat==='LEGAL' || cat==='MANUALS' || cat==='PARTS' ? 'doc' : 'photo'}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Aquí podrías listar grids de photos/documents del vehículo si ya lo cargamos */}
//           {vehicle && (
//             <div className="bg-white shadow rounded-xl border">
//               <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                 <h3 className="font-medium text-slate-700">Contenido actual</h3>
//               </div>
//               <div className="p-4 grid gap-4">
//                 <div>
//                   <div className="font-medium mb-1">Fotos</div>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
//                     {(vehicle.photos||[]).map(ph=>(
//                       <div key={ph._id} className="text-xs">
//                         <img src={ph.url} alt={ph.title||''} className="w-full h-24 object-cover rounded border" />
//                         <div className="mt-1">{ph.category} {ph.title?`- ${ph.title}`:''}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="font-medium mb-1">Documentos</div>
//                   <ul className="list-disc pl-5 text-sm">
//                     {(vehicle.documents||[]).map(d=>(
//                       <li key={d._id}>
//                         <span className="font-medium">{d.category}</span> — {d.label} — <a href={d.url} target="_blank" className="text-blue-600 underline">ver</a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-end">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//           </div>
//         </div>
//       )}
//     </form>
//   )
// }

// Ficha de Vehículos: Básico, Técnico, Documentos, Medios.
// - status desde catálogo VEHICLE_STATUSES
// - Fechas legales en DOCUMENTOS
// - Uploader de medios SOLO en pestaña "Medios" (con categorías)
// - Todo texto -> mayúsculas en front (y también en back via setters)

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/http'
import { useNavigate, useParams } from 'react-router-dom'
import VehicleMediaUploader from '../../components/Vehicle/VehicleMediaUploader'
import { uploadVehiclePhoto, uploadVehicleDocument } from '../../api/vehicles.api'
import { getCatalog } from '../../api/catalogs.api'

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

export default function VehiclesForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [tab, setTab] = useState('BASICO')
  const [branches, setBranches] = useState([])
  const [statuses, setStatuses] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [vehicle, setVehicle] = useState(null)

  const [form, setForm] = useState({
    plate: '', internalCode: '', status: '', type: '', brand: '', model: '', year: '', color: '', branch: '',
    vin: '', engineNumber: '', engineBrand: '', engineModel: '', fuelType: '',
    transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
    generator:{ brand:'', model:'', serial:'' },
    pump:{ brand:'', model:'', serial:'' },
    body:{ brand:'', model:'', serial:'' },
    meters:{ odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
    legal:{
      padron:{ number:'', issuer:'', validFrom:'', validTo:'' },
      soap:{ policy:'', issuer:'', validFrom:'', validTo:'' },
      insurance:{ policy:'', issuer:'', validFrom:'', validTo:'' },
      tag:{ number:'', issuer:'' },
      fuelCard:{ issuer:'', number:'', validTo:'', quota:'' }
    }
  })

  const upperPatch = (obj) => {
    const out = Array.isArray(obj) ? [] : {}
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (typeof v === 'string') out[k] = U(v)
      else if (v && typeof v === 'object') out[k] = upperPatch(v)
      else out[k] = v
    }
    return out
  }
  const update = (key, val) => setForm(f => ({ ...f, [key]: typeof val === 'string' ? U(val) : val }))
  const updateNested = (path, val) => setForm(f => {
    const c = structuredClone(f); let r=c; const parts=path.split('.')
    for(let i=0;i<parts.length-1;i++){ r=r[parts[i]] }
    r[parts.at(-1)] = (typeof val==='string'?U(val):val); return c
  })

  // Cargar sucursales
  useEffect(() => {
    api.get('/api/v1/branches', { params: { page: 1, limit: 100 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || data?.list || []
        setBranches(payload)
        if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.')
      })
      .catch(() => setBranches([]))
  }, [])

  // Cargar catálogo de estados
  useEffect(() => {
    getCatalog('vehicle_statuses')
      .then((data)=>{
        const actives = (data?.items||[]).filter(i=>i.active)
        setStatuses(actives)
      })
      .catch(()=> setStatuses([]))
  }, [])

  // Cargar vehículo (edit)
  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/api/v1/vehicles/${id}`)
      .then(({ data }) => {
        const v = data?.item || data
        setVehicle(v)
        setForm({
          ...form,
          plate: v.plate||'', internalCode: v.internalCode||'', status: v.status||'', type: v.type||'',
          brand: v.brand||'', model: v.model||'', year: v.year||'', color: v.color||'',
          branch: v.branch?._id || v.branch || '',
          vin: v.vin||'', engineNumber: v.engineNumber||'', engineBrand: v.engineBrand||'', engineModel: v.engineModel||'', fuelType: v.fuelType||'',
          transmission: { type:v.transmission?.type||'', brand:v.transmission?.brand||'', model:v.transmission?.model||'', serial:v.transmission?.serial||'', gears:v.transmission?.gears||'' },
          generator:{ brand:v.generator?.brand||'', model:v.generator?.model||'', serial:v.generator?.serial||'' },
          pump:{ brand:v.pump?.brand||'', model:v.pump?.model||'', serial:v.pump?.serial||'' },
          body:{ brand:v.body?.brand||'', model:v.body?.model||'', serial:v.body?.serial||'' },
          meters:{
            odometerKm:v.meters?.odometerKm||'', engineHours:v.meters?.engineHours||'', ladderHours:v.meters?.ladderHours||'',
            generatorHours:v.meters?.generatorHours||'', pumpHours:v.meters?.pumpHours||''
          },
          legal:{
            padron:{ number:v.legal?.padron?.number||'', issuer:v.legal?.padron?.issuer||'', validFrom: v.legal?.padron?.validFrom?.slice?.(0,10)||'', validTo: v.legal?.padron?.validTo?.slice?.(0,10)||'' },
            soap:{ policy:v.legal?.soap?.policy||'', issuer:v.legal?.soap?.issuer||'', validFrom: v.legal?.soap?.validFrom?.slice?.(0,10)||'', validTo: v.legal?.soap?.validTo?.slice?.(0,10)||'' },
            insurance:{ policy:v.legal?.insurance?.policy||'', issuer:v.legal?.insurance?.issuer||'', validFrom: v.legal?.insurance?.validFrom?.slice?.(0,10)||'', validTo: v.legal?.insurance?.validTo?.slice?.(0,10)||'' },
            tag:{ number:v.legal?.tag?.number||'', issuer:v.legal?.tag?.issuer||'' },
            fuelCard:{ issuer:v.legal?.fuelCard?.issuer||'', number:v.legal?.fuelCard?.number||'', validTo: v.legal?.fuelCard?.validTo?.slice?.(0,10)||'', quota: v.legal?.fuelCard?.quota ?? '' }
          }
        })
      })
      .catch((err)=> setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
      .finally(()=> setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Guardar
  async function handleSubmit(e){
    e.preventDefault(); setSaving(true); setError('')
    try{
      const req = ['plate','internalCode','status','type','brand','model','year','color','branch']
      for (const k of req){ if (!String(form[k]??'').trim()) throw new Error(`El campo ${k} es obligatorio`) }
      const payload = upperPatch({
        ...form,
        year: form.year ? Number(form.year) : undefined,
        transmission: { ...form.transmission, gears: form.transmission.gears? Number(form.transmission.gears):undefined },
        meters: {
          odometerKm: form.meters.odometerKm? Number(form.meters.odometerKm):undefined,
          engineHours: form.meters.engineHours? Number(form.meters.engineHours):undefined,
          ladderHours: form.meters.ladderHours? Number(form.meters.ladderHours):undefined,
          generatorHours: form.meters.generatorHours? Number(form.meters.generatorHours):undefined,
          pumpHours: form.meters.pumpHours? Number(form.meters.pumpHours):undefined
        },
        // fechas ISO (si vienen vacías, las setters del back las ignoran)
      })
      if (id){
        await api.patch(`/api/v1/vehicles/${id}`, payload)
        alert('Vehículo actualizado')
      }else{
        await api.post('/api/v1/vehicles', payload)
        alert('Vehículo creado')
      }
      navigate('/vehicles')
    }catch(err){ setError(err?.response?.data?.message || err.message || 'Datos inválidos') }
    finally{ setSaving(false) }
  }

  // -------- Medios (solo pestaña "MEDIOS") ----------
  const canUpload = useMemo(()=>Boolean(id), [id])

  async function onUploadManyPhotos(files, { category, label }){
    if (!id) throw new Error('Guarda el vehículo antes de subir medios')
    for (const f of files){
      await uploadVehiclePhoto(id, { file:f, category, title:label })
    }
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }
  async function onUploadManyDocs(files, { category, label }){
    if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
    for (const f of files){
      await uploadVehicleDocument(id, { file:f, category, label })
    }
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }

  if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

  // Categorías para el uploader (sin redundancias; todo aquí):
  const photoCategories = [
    { code:'BASIC', label:'BÁSICO (VISTAS)' },
    { code:'ENGINE', label:'MOTOR' },
    { code:'TRANSMISSION', label:'TRANSMISIÓN' },
    { code:'GENERATOR', label:'GENERADOR' },
    { code:'PUMP', label:'MOTOBOMBA' },
    { code:'BODY', label:'CUERPO DE BOMBA' },
    { code:'TECHNICAL', label:'TÉCNICO (LIBRE)' },
  ]
  const docCategories = [
    { code:'LEGAL', label:'LEGAL' },
    { code:'MANUALS', label:'MANUALES' },
    { code:'PARTS', label:'PARTES' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
          <p className="text-sm text-slate-500">Los textos se guardan en MAYÚSCULA. Los medios se gestionan en la pestaña “Medios”.</p>
        </div>
        <nav className="flex gap-2">
          {['BASICO','TECNICO','DOCUMENTOS','MEDIOS'].map(t=>(
            <button key={t} type="button"
              onClick={()=>setTab(t)}
              className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white':'bg-white border'}`}>
              {t==='BASICO'?'Básico':t==='TECNICO'?'Técnico':t==='DOCUMENTOS'?'Documentos':'Medios'}
            </button>
          ))}
        </nav>
      </header>

      {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
      {!branches.length && !id && <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">Crea una sucursal antes de registrar vehículos.</div>}

      {/* BASICO */}
      {tab==='BASICO' && (
        <div className="bg-white shadow rounded-xl border">
          <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
            <h3 className="font-medium text-slate-700">Información básica</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Placa / Patente','plate','ABC-123'],
              ['Código interno','internalCode','B:10'],
              ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN…'],
              ['Marca','brand','SCANIA'],
              ['Modelo','model','P340'],
              ['Año','year','2020','number'],
              ['Color','color','ROJO'],
            ].map(([label, key, ph, type])=>(
              <div key={key}>
                <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                <input type={type||'text'} value={form[key]} onChange={e=>update(key, e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring" placeholder={ph} required />
              </div>
            ))}

            {/* Estado (desde catálogo) */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
              <select required value={form.status} onChange={e=>update('status', e.target.value)}
                className="w-full border p-2 rounded bg-white">
                <option value="" disabled>Selecciona</option>
                {statuses.map(s=>(
                  <option key={s._id} value={s.code}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Sucursal */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
              <select required value={form.branch} onChange={e=>update('branch', e.target.value)}
                className="w-full border p-2 rounded bg-white">
                <option value="" disabled>Selecciona sucursal</option>
                {branches.map(b=>(
                  <option key={b._id} value={b._id}>{b.code ? `${b.code} — ${b.name}` : b.name || b._id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-4 pb-4 flex justify-end gap-3">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* TECNICO (sin uploaders aquí) */}
      {tab==='TECNICO' && (
        <div className="space-y-4">
          {/* Motor */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl"><h3 className="font-medium text-slate-700">Motor</h3></div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ['VIN','vin',''],
                ['N° Motor','engineNumber',''],
                ['Marca Motor','engineBrand',''],
                ['Modelo Motor','engineModel',''],
                ['Combustible','fuelType','DIESEL/GASOLINA'],
              ].map(([label,key,ph])=>(
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input value={form[key]} onChange={e=>update(key, e.target.value)} className="w-full border p-2 rounded" placeholder={ph}/>
                </div>
              ))}
            </div>
          </div>

          {/* Transmisión */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl"><h3 className="font-medium text-slate-700">Transmisión</h3></div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                ['Tipo','transmission.type','MANUAL/AUTOMATIC/AMT/CVT'],
                ['Marca','transmission.brand','ALLISON/ZF/EATON'],
                ['Modelo','transmission.model','4500 RDS'],
                ['Serie','transmission.serial',''],
                ['Marchas','transmission.gears','6','number'],
              ].map(([label,path,ph,type])=>{
                const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
                return (
                  <div key={path}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                    <input type={type||'text'} value={val} onChange={e=>updateNested(path, e.target.value)}
                      className="w-full border p-2 rounded" placeholder={ph}/>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Equipos */}
          {[
            ['Generador','generator'],
            ['Motobomba','pump'],
            ['Cuerpo de bomba','body'],
          ].map(([title,key])=>(
            <div className="bg-white shadow rounded-xl border" key={key}>
              <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl"><h3 className="font-medium text-slate-700">{title}</h3></div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['brand','model','serial'].map(f=>(
                  <div key={f}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{f==='brand'?'Marca':f==='model'?'Modelo':'Serie'}</label>
                    <input value={form[key]?.[f]??''} onChange={e=>updateNested(`${key}.${f}`, e.target.value)} className="w-full border p-2 rounded"/>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Medidores */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl"><h3 className="font-medium text-slate-700">Medidores</h3></div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                ['Odómetro (km)','meters.odometerKm','0','number'],
                ['Horas motor','meters.engineHours','0','number'],
                ['Horas escala','meters.ladderHours','0','number'],
                ['Horas generador','meters.generatorHours','0','number'],
                ['Horas cuerpo bomba','meters.pumpHours','0','number'],
              ].map(([label,path,ph,type])=>{
                const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
                return (
                  <div key={path}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                    <input type={type||'text'} value={val} onChange={e=>updateNested(path, e.target.value)}
                      className="w-full border p-2 rounded" placeholder={ph}/>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-1">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENTOS — con fechas */}
      {tab==='DOCUMENTOS' && (
        <div className="bg-white shadow rounded-xl border">
          <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl"><h3 className="font-medium text-slate-700">Documentos (Legal)</h3></div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Padrón */}
            {[
              ['Padrón - N°','legal.padron.number'],
              ['Padrón - Emisor','legal.padron.issuer'],
            ].map(([label,path])=>{
              const val = path.split('.').reduce((a,k)=>a?.[k], form) ?? ''
              return (
                <div key={path}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input value={val} onChange={e=>updateNested(path, e.target.value)} className="w-full border p-2 rounded"/>
                </div>
              )
            })}
            {[
              ['Padrón - Vigencia desde','legal.padron.validFrom'],
              ['Padrón - Vigencia hasta','legal.padron.validTo'],
            ].map(([label,path])=>{
              const val = path.split('.').reduce((a,k)=>a?.[k], form) ?? ''
              return (
                <div key={path}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input type="date" value={val} onChange={e=>updateNested(path, e.target.value)} className="w-full border p-2 rounded"/>
                </div>
              )
            })}

            {/* SOAP */}
            {[
              ['SOAP - Póliza','legal.soap.policy'],
              ['SOAP - Emisor','legal.soap.issuer'],
            ].map(([label,path])=>{
              const val = path.split('.').reduce((a,k)=>a?.[k], form) ?? ''
              return (
                <div key={path}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input value={val} onChange={e=>updateNested(path, e.target.value)} className="w-full border p-2 rounded"/>
                </div>
              )
            })}
            {[
              ['SOAP - Desde','legal.soap.validFrom'],
              ['SOAP - Hasta','legal.soap.validTo'],
            ].map(([label,path])=>{
              const val = path.split('.').reduce((a,k)=>a?.[k], form) ?? ''
              return (
                <div key={path}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input type="date" value={val} onChange={e=>updateNested(path, e.target.value)} className="w-full border p-2 rounded"/>
                </div>
              )
            })}

            {/* Seguro contractual */}
            {[
              ['Seguro - Póliza','legal.insurance.policy'],
              ['Seguro - Emisor','legal.insurance.issuer'],
            ].map(([label,path])=>{
              const val = path.split('.').reduce((a,k)=>a?.[k], form) ?? ''
              return (
                <div key={path}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input value={val} onChange={e=>updateNested(path, e.target.value)} className="w-full border p-2 rounded"/>
                </div>
              )
            })}
            {[
              ['Seguro - Desde','legal.insurance.validFrom'],
              ['Seguro - Hasta','legal.insurance.validTo'],
            ].map(([label,path])=>{
              const val = path.split('.').reduce((a,k)=>a?.[k], form) ?? ''
              return (
                <div key={path}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input type="date" value={val} onChange={e=>updateNested(path, e.target.value)} className="w-full border p-2 rounded"/>
                </div>
              )
            })}

            {/* TAG */}
            {[
              ['TAG - N°','legal.tag.number'],
              ['TAG - Emisor','legal.tag.issuer'],
            ].map(([label,path])=>{
              const val = path.split('.').reduce((a,k)=>a?.[k], form) ?? ''
              return (
                <div key={path}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input value={val} onChange={e=>updateNested(path, e.target.value)} className="w-full border p-2 rounded"/>
                </div>
              )
            })}

            {/* Tarjeta de combustible */}
            {[
              ['Tarj. combustible - Emisor','legal.fuelCard.issuer'],
              ['Tarj. combustible - N°','legal.fuelCard.number'],
            ].map(([label,path])=>{
              const val = path.split('.').reduce((a,k)=>a?.[k], form) ?? ''
              return (
                <div key={path}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input value={val} onChange={e=>updateNested(path, e.target.value)} className="w-full border p-2 rounded"/>
                </div>
              )
            })}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tarj. combustible - Vence</label>
              <input type="date" value={form.legal.fuelCard.validTo} onChange={e=>updateNested('legal.fuelCard.validTo', e.target.value)} className="w-full border p-2 rounded"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tarj. combustible - Cupo</label>
              <input type="number" value={form.legal.fuelCard.quota} onChange={e=>updateNested('legal.fuelCard.quota', e.target.value)} className="w-full border p-2 rounded"/>
            </div>
          </div>

          <div className="px-4 pb-4 flex justify-end gap-3">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* MEDIOS — único lugar para subir archivos */}
      {tab==='MEDIOS' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl"><h3 className="font-medium text-slate-700">Subir Fotos</h3></div>
            <div className="p-4">
              <VehicleMediaUploader
                mode="photo"
                accept="image/*,video/*"
                categories={photoCategories}
                onUploadMany={onUploadManyPhotos}
              />
              {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
            </div>
          </div>

          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl"><h3 className="font-medium text-slate-700">Subir Documentos</h3></div>
            <div className="p-4">
              <VehicleMediaUploader
                mode="doc"
                accept="application/pdf,image/*"
                categories={docCategories}
                onUploadMany={onUploadManyDocs}
              />
            </div>
          </div>

          {/* Contenido actual */}
          {vehicle && (
            <div className="bg-white shadow rounded-xl border">
              <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl"><h3 className="font-medium text-slate-700">Contenido actual</h3></div>
              <div className="p-4 grid gap-4">
                <div>
                  <div className="font-medium mb-2">Fotos</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {(vehicle.photos||[]).map(ph=>(
                      <div key={ph._id} className="text-xs">
                        <img src={ph.url} alt={ph.title||''} className="w-full h-24 object-cover rounded border" />
                        <div className="mt-1">{ph.category || '—'} {ph.title?`- ${ph.title}`:''}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">Documentos</div>
                  <ul className="list-disc pl-5 text-sm">
                    {(vehicle.documents||[]).map(d=>(
                      <li key={d._id}>
                        <span className="font-medium">{d.category || 'DOC'}</span> — {d.label || '(s/etiqueta)'} — <a href={d.url} target="_blank" className="text-blue-600 underline">ver</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
          </div>
        </div>
      )}
    </form>
  )
}
