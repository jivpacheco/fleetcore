
// //**** ESTABLE ****
// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // VehiclesForm: Crear / Editar vehículo + secciones de Media (Fotos, Docs, Videos)
// // Requisitos:
// //  - services/http: exporta `api` y base de autenticación
// //  - api/vehicles.api: helpers para CRUD y media (upload/delete)
// //  - Backend: endpoints de media ya activos:
// //      POST   /api/v1/vehicles/:id/photos
// //      DELETE /api/v1/vehicles/:id/photos/:photoId
// //      POST   /api/v1/vehicles/:id/documents   (category: 'legal'|'manuals'|'parts'|'videos')
// //      DELETE /api/v1/vehicles/:id/documents/:documentId
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import {
//   getVehicle, createVehicle, updateVehicle,
//   uploadVehiclePhoto, uploadVehicleDocument,
//   deleteVehiclePhoto, deleteVehicleDocument,
// } from '../../api/vehicles.api'
// import { api } from '../../services/http' // se mantiene por compatibilidad (no imprescindible)

// function Uploader({ label = 'Subir archivo', mode = 'photo', onSelect }) {
//   // mode: 'photo' | 'doc' | 'video'
//   const accept = useMemo(() => {
//     if (mode === 'photo') return 'image/jpeg,image/png,image/webp'
//     if (mode === 'doc') return 'application/pdf,image/jpeg,image/png'
//     return 'video/mp4,video/webm,video/quicktime'
//   }, [mode])

//   return (
//     <label className="inline-flex items-center px-3 py-2 rounded bg-blue-600 text-white text-sm cursor-pointer hover:opacity-95">
//       {label}
//       <input
//         type="file"
//         className="hidden"
//         accept={accept}
//         onChange={e => {
//           const file = e.target.files?.[0]
//           if (file) onSelect?.(file)
//           e.target.value = ''
//         }}
//       />
//     </label>
//   )
// }

// export default function VehiclesForm() {
//   const { id } = useParams() // si existe -> edición
//   const navigate = useNavigate()

//   const [loading, setLoading] = useState(!!id)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')

//   const [vehicle, setVehicle] = useState(null)
//   const [form, setForm] = useState({
//     plate: '', internalCode: '', type: '', brand: '', model: '',
//     year: '', color: '', branch: ''
//   })

//   // UI: pestañas visibles solo si hay vehicle cargado (modo edición)
//   const [tab, setTab] = useState('basic') // 'basic' | 'photos' | 'docs' | 'videos'

//   useEffect(() => {
//     let alive = true
//     async function load() {
//       if (!id) return
//       setLoading(true)
//       setError('')
//       try {
//         const data = await getVehicle(id)
//         if (!alive) return
//         setVehicle(data.item || data) // admite ambos estilos de payload
//         // precargar formulario con datos básicos
//         const v = data.item || data
//         setForm({
//           plate: v.plate || '',
//           internalCode: v.internalCode || '',
//           type: v.type || '',
//           brand: v.brand || '',
//           model: v.model || '',
//           year: v.year || '',
//           color: v.color || '',
//           branch: v.branch || '',
//         })
//       } catch (err) {
//         if (!alive) return
//         setError(err?.response?.data?.message || err?.message || 'Error al cargar vehículo')
//       } finally {
//         if (alive) setLoading(false)
//       }
//     }
//     load()
//     return () => { alive = false }
//   }, [id])

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setSaving(true)
//     setError('')
//     try {
//       if (!id) {
//         const created = await createVehicle(form)
//         // creado → ir a edición del recién creado para poder subir media
//         const createdVehicle = created.item || created
//         alert('Vehículo creado con éxito')
//         navigate(`/vehicles/${createdVehicle._id}`)
//       } else {
//         const updated = await updateVehicle(id, form)
//         setVehicle(updated.item || updated)
//         alert('Cambios guardados')
//       }
//     } catch (err) {
//       setError(err?.response?.data?.message || err?.message || 'Error al guardar')
//     } finally {
//       setSaving(false)
//     }
//   }

//   // ---------------------
//   // Media: handlers
//   // ---------------------
//   async function onUploadPhoto(file) {
//     if (!vehicle?._id) return
//     try {
//       const v = await uploadVehiclePhoto(vehicle._id, file)
//       setVehicle(v.item || v)
//     } catch (err) {
//       alert(err?.response?.data?.message || err?.message || 'Error al subir foto')
//     }
//   }

//   async function onUploadLegal(file) {
//     if (!vehicle?._id) return
//     try {
//       const v = await uploadVehicleDocument(vehicle._id, file, { category: 'legal' })
//       setVehicle(v.item || v)
//     } catch (err) {
//       alert(err?.response?.data?.message || err?.message || 'Error al subir documento')
//     }
//   }

//   async function onUploadVideo(file) {
//     if (!vehicle?._id) return
//     try {
//       const v = await uploadVehicleDocument(vehicle._id, file, { category: 'videos' })
//       setVehicle(v.item || v)
//     } catch (err) {
//       alert(err?.response?.data?.message || err?.message || 'Error al subir video')
//     }
//   }

//   async function onDeletePhoto(photoId) {
//     try {
//       const v = await deleteVehiclePhoto(vehicle._id, photoId)
//       setVehicle(v.item || v)
//     } catch (err) {
//       alert(err?.response?.data?.message || err?.message || 'Error al eliminar foto')
//     }
//   }

//   async function onDeleteDocument(documentId) {
//     try {
//       const v = await deleteVehicleDocument(vehicle._id, documentId)
//       setVehicle(v.item || v)
//     } catch (err) {
//       alert(err?.response?.data?.message || err?.message || 'Error al eliminar documento')
//     }
//   }

//   // Helpers de render
//   const photos = (vehicle?.photos || [])
//   const docs   = (vehicle?.documents || []).filter(d => (d.category || '').toLowerCase() !== 'videos')
//   const videos = (vehicle?.documents || []).filter(d => (d.category || '').toLowerCase() === 'videos')

//   return (
//     <div className="max-w-5xl mx-auto">
//       <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-4">
//         <div className="flex items-center justify-between gap-3">
//           <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
//           <div className="flex gap-2">
//             <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">
//               Volver
//             </button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando...' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>

//         {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
//         {loading && <div className="px-3 py-2 bg-slate-50 rounded text-sm">Cargando...</div>}

//         {/* --------------------------- */}
//         {/* Tabs (solo si existe id)   */}
//         {/* --------------------------- */}
//         {id && (
//           <div className="flex flex-wrap gap-2 border-b pb-2">
//             {[
//               { k: 'basic',  t: 'Básico' },
//               { k: 'photos', t: 'Fotos' },
//               { k: 'docs',   t: 'Documentos' },
//               { k: 'videos', t: 'Videos' },
//             ].map(x => (
//               <button
//                 key={x.k}
//                 type="button"
//                 onClick={() => setTab(x.k)}
//                 className={`px-3 py-1.5 rounded-t ${
//                   tab === x.k ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
//                 }`}
//               >
//                 {x.t}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* --------------------------- */}
//         {/* TAB: Básico (crear/editar) */}
//         {/* --------------------------- */}
//         {(!id || tab === 'basic') && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <input placeholder="Placa" value={form.plate}
//               onChange={e=>setForm({...form,plate:e.target.value})}
//               className="border p-2 rounded"/>
//             <input placeholder="Código interno" value={form.internalCode}
//               onChange={e=>setForm({...form,internalCode:e.target.value})}
//               className="border p-2 rounded"/>
//             <input placeholder="Tipo" value={form.type}
//               onChange={e=>setForm({...form,type:e.target.value})}
//               className="border p-2 rounded"/>
//             <input placeholder="Marca" value={form.brand}
//               onChange={e=>setForm({...form,brand:e.target.value})}
//               className="border p-2 rounded"/>
//             <input placeholder="Modelo" value={form.model}
//               onChange={e=>setForm({...form,model:e.target.value})}
//               className="border p-2 rounded"/>
//             <input type="number" placeholder="Año" value={form.year}
//               onChange={e=>setForm({...form,year:e.target.value})}
//               className="border p-2 rounded"/>
//             <input placeholder="Color" value={form.color}
//               onChange={e=>setForm({...form,color:e.target.value})}
//               className="border p-2 rounded"/>
//             <input placeholder="Sucursal" value={form.branch}
//               onChange={e=>setForm({...form,branch:e.target.value})}
//               className="border p-2 rounded"/>
//           </div>
//         )}

//         {/* --------------------------- */}
//         {/* TAB: Fotos                  */}
//         {/* --------------------------- */}
//         {id && tab === 'photos' && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3">
//               <Uploader label="Subir foto" mode="photo" onSelect={onUploadPhoto} />
//               <p className="text-xs text-slate-500">Formatos: JPG/PNG/WEBP · máx 20 MB</p>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//               {photos.length === 0 && <div className="text-sm text-slate-500">Sin fotos</div>}
//               {photos.map(p => (
//                 <div key={p._id} className="relative group">
//                   <img src={p.url} alt="" className="w-full h-32 object-cover rounded border" />
//                   <button
//                     type="button"
//                     onClick={() => onDeletePhoto(p._id)}
//                     className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
//                                text-xs px-2 py-1 bg-red-600 text-white rounded"
//                   >
//                     Eliminar
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* --------------------------- */}
//         {/* TAB: Documentos             */}
//         {/* --------------------------- */}
//         {id && tab === 'docs' && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3">
//               <Uploader label="Subir documento (legal/manual)" mode="doc" onSelect={onUploadLegal} />
//               <p className="text-xs text-slate-500">PDF/Imagen · máx 20 MB</p>
//             </div>

//             <ul className="divide-y divide-slate-100 border rounded">
//               {docs.length === 0 && <li className="p-3 text-sm text-slate-500">Sin documentos</li>}
//               {docs.map(d => (
//                 <li key={d._id} className="p-3 flex items-center justify-between">
//                   <div className="min-w-0">
//                     <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
//                       {d.label || d.category || 'Documento'}
//                     </a>
//                     <div className="text-xs text-slate-500">
//                       {Math.round((d.bytes || 0) / 1024)} KB · {d.format?.toUpperCase?.()}
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => onDeleteDocument(d._id)}
//                     className="text-xs px-2 py-1 bg-red-600 text-white rounded"
//                   >
//                     Eliminar
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* --------------------------- */}
//         {/* TAB: Videos                 */}
//         {/* --------------------------- */}
//         {id && tab === 'videos' && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3">
//               <Uploader label="Subir video" mode="video" onSelect={onUploadVideo} />
//               <p className="text-xs text-slate-500">MP4/WEBM/MOV · máx 150 MB</p>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {videos.length === 0 && <div className="text-sm text-slate-500">Sin videos</div>}
//               {videos.map(v => (
//                 <div key={v._id} className="relative group">
//                   <video src={v.url} controls className="w-full h-48 rounded border" />
//                   <button
//                     type="button"
//                     onClick={() => onDeleteDocument(v._id)}
//                     className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
//                                text-xs px-2 py-1 bg-red-600 text-white rounded"
//                   >
//                     Eliminar
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </form>
//     </div>
//   )
// }


////***/// fINAL */

// front/src/pages/Vehicles/Form.jsx
// -----------------------------------------------------------------------------
// Formulario de Vehículos (crear/editar mínimo)
// - Carga sucursales para seleccionar y envía branch como ObjectId.
// - Normaliza year a Number.
// - Muestra errores de backend legibles.
// -----------------------------------------------------------------------------

// import { useEffect, useState } from 'react'
// import { api } from '../../services/http'
// import { useNavigate, useParams } from 'react-router-dom'

// export default function VehiclesForm() {
//   const navigate = useNavigate()
//   const { id } = useParams()

//   const [form, setForm] = useState({
//     plate: '',
//     internalCode: '',
//     type: '',
//     brand: '',
//     model: '',
//     year: '',
//     color: '',
//     branch: '', // guardaremos aquí el _id seleccionado
//   })
//   const [branches, setBranches] = useState([])
//   const [saving, setSaving] = useState(false)
//   const [loading, setLoading] = useState(!!id)
//   const [error, setError] = useState('')

//   // Cargar sucursales para el select
//   useEffect(() => {
//     api
//       .get('/api/v1/branches', { params: { page: 1, limit: 100 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || []
//         setBranches(payload)
//       })
//       .catch(() => setBranches([]))
//   }, [])

//   // Si estamos editando, cargar vehículo
//   useEffect(() => {
//     if (!id) return
//     setLoading(true)
//     api
//       .get(`/api/v1/vehicles/${id}`)
//       .then(({ data }) => {
//         const v = data?.item || data
//         setForm({
//           plate: v.plate || '',
//           internalCode: v.internalCode || '',
//           type: v.type || '',
//           brand: v.brand || '',
//           model: v.model || '',
//           year: v.year || '',
//           color: v.color || '',
//           branch: v.branch?._id || v.branch || '',
//         })
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
//       .finally(() => setLoading(false))
//   }, [id])

//   function update(field, val) {
//     setForm((f) => ({ ...f, [field]: val }))
//   }

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setSaving(true)
//     setError('')

//     try {
//       // Normalizaciones mínimas
//       const payload = {
//         ...form,
//         year: form.year ? Number(form.year) : undefined,
//         branch: form.branch || undefined, // debe ser _id (ObjectId string)
//       }

//       if (!payload.plate) throw new Error('La placa es requerida')
//       if (payload.year && Number.isNaN(payload.year)) {
//         throw new Error('El año debe ser numérico')
//       }

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

//   if (loading) {
//     return <div className="max-w-3xl mx-auto bg-white shadow rounded p-4">Cargando…</div>
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto bg-white shadow rounded p-4">
//       <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>

//       {error && (
//         <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//         <input
//           placeholder="Placa"
//           value={form.plate}
//           onChange={(e) => update('plate', e.target.value)}
//           className="border p-2 rounded"
//           required
//         />
//         <input
//           placeholder="Código interno"
//           value={form.internalCode}
//           onChange={(e) => update('internalCode', e.target.value)}
//           className="border p-2 rounded"
//         />
//         <input
//           placeholder="Tipo"
//           value={form.type}
//           onChange={(e) => update('type', e.target.value)}
//           className="border p-2 rounded"
//         />
//         <input
//           placeholder="Marca"
//           value={form.brand}
//           onChange={(e) => update('brand', e.target.value)}
//           className="border p-2 rounded"
//         />
//         <input
//           placeholder="Modelo"
//           value={form.model}
//           onChange={(e) => update('model', e.target.value)}
//           className="border p-2 rounded"
//         />
//         <input
//           type="number"
//           placeholder="Año"
//           value={form.year}
//           onChange={(e) => update('year', e.target.value)}
//           className="border p-2 rounded"
//         />
//         <input
//           placeholder="Color"
//           value={form.color}
//           onChange={(e) => update('color', e.target.value)}
//           className="border p-2 rounded"
//         />

//         {/* Select de Sucursal */}
//         <select
//           value={form.branch}
//           onChange={(e) => update('branch', e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">Sin sucursal</option>
//           {branches.map((b) => (
//             <option key={b._id} value={b._id}>
//               {b.code ? `${b.code} — ${b.name}` : b.name || b._id}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex justify-end gap-3 pt-3">
//         <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">
//           Cancelar
//         </button>
//         <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//           {saving ? 'Guardando...' : 'Guardar'}
//         </button>
//       </div>
//     </form>
//   )
// }

///***** OPTIMIZADA */

// front/src/pages/Vehicles/Form.jsx
// -----------------------------------------------------------------------------
// Formulario de Vehículos (crear/editar, con UI mejorada)
// - Labels sobre campos, layout en tarjetas, mensajes claros.
// - Select de Sucursal (cuando existan). Si no hay, se informa al usuario.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { api } from '../../services/http'
import { useNavigate, useParams } from 'react-router-dom'

export default function VehiclesForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState({
    plate: '',
    internalCode: '',
    type: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    branch: '', // _id de Branch cuando exista
  })
  const [branches, setBranches] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Cargar sucursales (si hay)
  useEffect(() => {
    api
      .get('/api/v1/branches', { params: { page: 1, limit: 100 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || []
        setBranches(payload)
        if (!payload.length) {
          setNotice('Aún no hay sucursales. Puedes registrar el vehículo sin sucursal y asignarlo luego.')
        }
      })
      .catch(() => setBranches([]))
  }, [])

  // Cargar vehículo si estamos editando
  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get(`/api/v1/vehicles/${id}`)
      .then(({ data }) => {
        const v = data?.item || data
        setForm({
          plate: v.plate || '',
          internalCode: v.internalCode || '',
          type: v.type || '',
          brand: v.brand || '',
          model: v.model || '',
          year: v.year || '',
          color: v.color || '',
          branch: v.branch?._id || v.branch || '',
        })
      })
      .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
      .finally(() => setLoading(false))
  }, [id])

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        branch: form.branch || undefined, // opcional
      }

      if (!payload.plate?.trim()) throw new Error('La placa es requerida')
      if (payload.year && Number.isNaN(payload.year)) throw new Error('El año debe ser numérico')

      if (id) {
        await api.patch(`/api/v1/vehicles/${id}`, payload)
        alert('Vehículo actualizado con éxito')
      } else {
        await api.post('/api/v1/vehicles', payload)
        alert('Vehículo creado con éxito')
      }
      navigate('/vehicles')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Datos inválidos'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto bg-white shadow rounded p-4">Cargando…</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
          <p className="text-sm text-slate-500">Completa la información básica. Podrás añadir documentos, fotos y métricas luego.</p>
        </div>
      </header>

      {error && (
        <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}
      {notice && !id && (
        <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>
      )}

      {/* Tarjeta: Información Básica */}
      <div className="bg-white shadow rounded-xl border">
        <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
          <h3 className="font-medium text-slate-700">Información básica</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Placa / Patente</label>
            <input
              value={form.plate}
              onChange={(e) => update('plate', e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="ABC-123"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Código interno</label>
            <input
              value={form.internalCode}
              onChange={(e) => update('internalCode', e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="B:10, BX-2, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de vehículo</label>
            <input
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Camión, Carro bomba…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Marca</label>
            <input
              value={form.brand}
              onChange={(e) => update('brand', e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Scania, Volvo…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Modelo</label>
            <input
              value={form.model}
              onChange={(e) => update('model', e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="P340, FMX…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => update('year', e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="2020"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
            <input
              value={form.color}
              onChange={(e) => update('color', e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Rojo"
            />
          </div>

          {/* Sucursal (opcional por ahora) */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal (opcional)</label>
            <select
              value={form.branch}
              onChange={(e) => update('branch', e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
            >
              <option value="">Sin sucursal</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.code ? `${b.code} — ${b.name}` : b.name || b._id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/vehicles')}
          className="px-3 py-2 border rounded"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
        </button>
      </div>
    </form>
  )
}
