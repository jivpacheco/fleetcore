// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // Formulario de Vehículos (crear/editar, UI limpia con labels y validaciones)
// // - `internalCode` (sigla institucional): obligatorio y en MAYÚSCULAS.
// // - `plate`: obligatorio y en MAYÚSCULAS (se normaliza en el servicio también).
// // - Select de Sucursal (opcional mientras no existan Branches).
// // - Mensajes de error del backend (409 duplicado, 400 validación, etc.).
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import { api } from '../../services/http'
// import { useNavigate, useParams } from 'react-router-dom'

// export default function VehiclesForm() {
//   const navigate = useNavigate()
//   const { id } = useParams()

//   // --------------------------
//   // Estado del formulario
//   // --------------------------
//   const [form, setForm] = useState({
//     plate: '',
//     internalCode: '',
//     type: '',
//     brand: '',
//     model: '',
//     year: '',
//     color: '',
//     branch: '', // _id de Branch cuando exista
//   })
//   const [branches, setBranches] = useState([])
//   const [saving, setSaving] = useState(false)
//   const [loading, setLoading] = useState(!!id)
//   const [error, setError] = useState('')
//   const [notice, setNotice] = useState('')
//   const [touched, setTouched] = useState({}) // control simple de blur para mostrar errores inline

//   // Errores de validación del front
//   const vErrors = useMemo(() => {
//     const e = {}
//     if (!form.plate?.trim()) e.plate = 'La placa es obligatoria'
//     if (!form.internalCode?.trim()) e.internalCode = 'El código interno es obligatorio'
//     if (form.year && Number.isNaN(Number(form.year))) e.year = 'El año debe ser numérico'
//     return e
//   }, [form])

//   function update(field, val) {
//     setForm((f) => ({ ...f, [field]: val }))
//   }

//   // --------------------------
//   // Cargar sucursales (si hay)
//   // --------------------------
//   useEffect(() => {
//     api
//       .get('/api/v1/branches', { params: { page: 1, limit: 100 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || []
//         setBranches(payload)
//         if (!payload.length) {
//           setNotice('Aún no hay sucursales. Puedes registrar el vehículo sin sucursal y asignarlo luego.')
//         }
//       })
//       .catch(() => setBranches([]))
//   }, [])

//   // --------------------------
//   // Cargar vehículo si estamos editando
//   // --------------------------
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

//   // --------------------------
//   // Guardar
//   // --------------------------
//   async function handleSubmit(e) {
//     e.preventDefault()
//     setSaving(true)
//     setError('')

//     try {
//       // Validación del front antes de llamar a la API
//       if (Object.keys(vErrors).length > 0) {
//         setTouched({ plate: true, internalCode: true, year: true })
//         throw new Error('Revisa los campos marcados')
//       }

//       const payload = {
//         ...form,
//         // Normalización mínima (el servicio también normaliza)
//         plate: form.plate?.toUpperCase().trim(),
//         internalCode: form.internalCode?.toUpperCase().trim(),
//         year: form.year ? Number(form.year) : undefined,
//         branch: form.branch || undefined, // opcional
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

//   // Helper para clases de inputs con error
//   const inputClass = (hasError) =>
//     `w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 ${
//       hasError ? 'border-red-300' : 'border-slate-300'
//     }`

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
//       <header className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
//           <p className="text-sm text-slate-500">
//             Completa la información básica. Podrás añadir documentos, fotos y métricas luego.
//           </p>
//         </div>
//       </header>

//       {error && (
//         <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>
//       )}
//       {notice && !id && (
//         <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>
//       )}

//       {/* Tarjeta: Información Básica */}
//       <div className="bg-white shadow rounded-xl border">
//         <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//           <h3 className="font-medium text-slate-700">Información básica</h3>
//         </div>

//         <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {/* Placa */}
//           <div>
//             <label className="block text-sm font-medium text-slate-600 mb-1">
//               Placa / Patente <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={form.plate}
//               onChange={(e) => update('plate', e.target.value)}
//               onBlur={() => setTouched((t) => ({ ...t, plate: true }))}
//               className={inputClass(touched.plate && !!vErrors.plate)}
//               placeholder="ABC-123"
//               required
//             />
//             {touched.plate && vErrors.plate && (
//               <p className="text-xs text-red-600 mt-1">{vErrors.plate}</p>
//             )}
//           </div>

//           {/* Código interno */}
//           <div>
//             <label className="block text-sm font-medium text-slate-600 mb-1">
//               Código interno (sigla institucional) <span className="text-red-500">*</span>
//             </label>
//             <input
//               value={form.internalCode}
//               onChange={(e) => update('internalCode', e.target.value.toUpperCase())}
//               onBlur={() => setTouched((t) => ({ ...t, internalCode: true }))}
//               className={inputClass(touched.internalCode && !!vErrors.internalCode)}
//               placeholder="B:10, BX-2, SR-CALI..."
//               required
//             />
//             {touched.internalCode && vErrors.internalCode && (
//               <p className="text-xs text-red-600 mt-1">{vErrors.internalCode}</p>
//             )}
//             {!vErrors.internalCode && (
//               <p className="text-xs text-slate-500 mt-1">
//                 Debe ser único. Se usa para identificar la unidad en toda la suite.
//               </p>
//             )}
//           </div>

//           {/* Tipo */}
//           <div>
//             <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de vehículo</label>
//             <input
//               value={form.type}
//               onChange={(e) => update('type', e.target.value)}
//               className={inputClass(false)}
//               placeholder="Camión, Carro bomba…"
//             />
//           </div>

//           {/* Marca */}
//           <div>
//             <label className="block text-sm font-medium text-slate-600 mb-1">Marca</label>
//             <input
//               value={form.brand}
//               onChange={(e) => update('brand', e.target.value)}
//               className={inputClass(false)}
//               placeholder="Scania, Volvo…"
//             />
//           </div>

//           {/* Modelo */}
//           <div>
//             <label className="block text-sm font-medium text-slate-600 mb-1">Modelo</label>
//             <input
//               value={form.model}
//               onChange={(e) => update('model', e.target.value)}
//               className={inputClass(false)}
//               placeholder="P340, FMX…"
//             />
//           </div>

//           {/* Año */}
//           <div>
//             <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
//             <input
//               type="number"
//               value={form.year}
//               onChange={(e) => update('year', e.target.value)}
//               onBlur={() => setTouched((t) => ({ ...t, year: true }))}
//               className={inputClass(touched.year && !!vErrors.year)}
//               placeholder="2020"
//             />
//             {touched.year && vErrors.year && (
//               <p className="text-xs text-red-600 mt-1">{vErrors.year}</p>
//             )}
//           </div>

//           {/* Color */}
//           <div>
//             <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
//             <input
//               value={form.color}
//               onChange={(e) => update('color', e.target.value)}
//               className={inputClass(false)}
//               placeholder="Rojo"
//             />
//           </div>

//           {/* Sucursal (opcional por ahora) */}
//           <div>
//             <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal (opcional)</label>
//             <select
//               value={form.branch}
//               onChange={(e) => update('branch', e.target.value)}
//               className={inputClass(false) + ' bg-white'}
//             >
//               <option value="">Sin sucursal</option>
//               {branches.map((b) => (
//                 <option key={b._id} value={b._id}>
//                   {b.code ? `${b.code} — ${b.name}` : b.name || b._id}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Acciones */}
//       <div className="flex justify-end gap-3">
//         <button
//           type="button"
//           onClick={() => navigate('/vehicles')}
//           className="px-3 py-2 border rounded"
//         >
//           Cancelar
//         </button>
//         <button
//           type="submit"
//           disabled={saving}
//           className="px-3 py-2 bg-blue-600 text-white rounded"
//         >
//           {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//         </button>
//       </div>
//     </form>
//   )
// }

// front/src/pages/Vehicles/Form.jsx
// -----------------------------------------------------------------------------
// Vehículos: Crear/Editar con:
//  - Básicos OBLIGATORIOS (incluye status y transmisión)
//  - Tabs: Legal (docs), Media (fotos / pdf / video)
//  - Requiere tener sucursales cargadas para branch (obligatorio)
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/http'
import { useNavigate, useParams } from 'react-router-dom'

const STATUSES = [
  { value: 'active',         label: 'Operativo' },
  { value: 'support',        label: 'Apoyo' },
  { value: 'in_repair',      label: 'En reparación' },
  { value: 'out_of_service', label: 'Fuera de servicio' },
  { value: 'retired',        label: 'Retirado' },
]

const TX_TYPES = [
  { value: 'manual',    label: 'Manual' },
  { value: 'automatic', label: 'Automática' },
  { value: 'amt',       label: 'AMT' },
  { value: 'cvt',       label: 'CVT' },
]

export default function VehiclesForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [tab, setTab] = useState('basic')
  const [branches, setBranches] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Form "básico"
  const [form, setForm] = useState({
    plate: '',
    internalCode: '',
    type: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    status: 'active',
    branch: '',
    transmission: {
      type: 'manual',
      brand: '',
      model: '',
      serial: '',
      gears: ''
    }
  })

  // Datos del vehículo (para renderizar listas de media sin re-cargar todo el form)
  const [vehicle, setVehicle] = useState(null)

  const isEdit = useMemo(() => Boolean(id), [id])

  // Cargar sucursales
  useEffect(() => {
    api.get('/api/v1/branches', { params: { page: 1, limit: 500, sort: 'code:asc(number)' } })
      .then(({ data }) => {
         console.log('[branches payload]', data) // revisar en consola
        const items = data?.items || data?.data?.items || data?.data || []
        setBranches(items)
        if (!items.length) {
          setNotice('Debes crear sucursales antes de registrar vehículos (branch es obligatorio).')
        }
      })
      .catch(() => setBranches([]))
  }, [])

  // Cargar vehículo (modo edición)
  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/api/v1/vehicles/${id}`)
      .then(({ data }) => {
        const v = data?.item || data
        setVehicle(v)
        setForm({
          plate: v.plate || '',
          internalCode: v.internalCode || '',
          type: v.type || '',
          brand: v.brand || '',
          model: v.model || '',
          year: v.year || '',
          color: v.color || '',
          status: v.status || 'active',
          branch: v.branch?._id || v.branch || '',
          transmission: {
            type:   v.transmission?.type   || 'manual',
            brand:  v.transmission?.brand  || '',
            model:  v.transmission?.model  || '',
            serial: v.transmission?.serial || '',
            gears:  v.transmission?.gears  || ''
          }
        })
      })
      .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
      .finally(() => setLoading(false))
  }, [id])

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }))
  }
  function updateTx(field, val) {
    setForm((f) => ({ ...f, transmission: { ...(f.transmission||{}), [field]: val }}))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        transmission: {
          ...form.transmission,
          gears: form.transmission?.gears ? Number(form.transmission.gears) : undefined
        }
      }

      // Validaciones mínimas en front (backend también valida)
      const req = ['plate','internalCode','type','brand','model','year','color','branch']
      for (const k of req) {
        if (!String(payload[k] ?? '').trim()) throw new Error('Completa todos los campos básicos obligatorios.')
      }
      const txReq = ['type','brand','model']
      for (const k of txReq) {
        if (!String(payload.transmission?.[k] ?? '').trim()) throw new Error('Completa los campos obligatorios de transmisión.')
      }

      if (isEdit) {
        await api.patch(`/api/v1/vehicles/${id}`, payload)
        alert('Vehículo actualizado con éxito')
      } else {
        const { data } = await api.post('/api/v1/vehicles', payload)
        alert('Vehículo creado con éxito')
        // para que de inmediato puedas subir media / legal
        navigate(`/vehicles/${data?._id || data?.item?._id || data?.id || ''}`)
        return
      }
      navigate('/vehicles')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Datos inválidos'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  // ------------------ Subidas (Legal / Media) -------------------------------
  function isImage(file) {
    return file && file.type && file.type.startsWith('image/')
  }
  function isVideo(file) {
    return file && file.type && file.type.startsWith('video/')
  }

  async function uploadPhoto(file) {
    if (!id) return alert('Guarda primero el vehículo para habilitar Media.')
    const formData = new FormData()
    formData.append('file', file)
    await api.post(`/api/v1/vehicles/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // refrescar ficha mínima
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }

  async function uploadDocOrVideo(file, category = 'legal', label = '') {
    if (!id) return alert('Guarda primero el vehículo para habilitar Legal/Media.')
    const formData = new FormData()
    formData.append('file', file)
    // si es video, categorizamos como "videos"
    const cat = isVideo(file) ? 'videos' : category
    formData.append('category', cat)
    if (label) formData.append('label', label)

    await api.post(`/api/v1/vehicles/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }

  async function deletePhoto(photoId) {
    await api.delete(`/api/v1/vehicles/${id}/photos/${photoId}`)
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }
  async function deleteDocument(documentId) {
    await api.delete(`/api/v1/vehicles/${id}/documents/${documentId}`)
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }

  // --------------------------------------------------------------------------
  if (loading) return <div className="max-w-4xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{isEdit ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
          <p className="text-sm text-slate-500">
            Completa la información básica. Luego podrás adjuntar documentación e imágenes.
          </p>
        </div>
      </header>

      {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
      {notice && !isEdit && <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow border">
        <div className="border-b bg-slate-50 rounded-t-xl px-2">
          <nav className="flex gap-1 p-1">
            {[
              {key:'basic', label:'Básico'},
              {key:'legal', label:'Legal'},
              {key:'media', label:'Media (Fotos/Docs/Video)'}
            ].map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm rounded-lg ${tab===t.key ? 'bg-white shadow font-medium' : 'hover:bg-white/60'}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* --- TAB: BÁSICO --- */}
        {tab==='basic' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identificación */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Placa / Patente *</label>
              <input
                value={form.plate}
                onChange={(e) => update('plate', e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="ABC-123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Código interno *</label>
              <input
                value={form.internalCode}
                onChange={(e) => update('internalCode', e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="B:10, BX-2, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de vehículo *</label>
              <input
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="Camión, Carro bomba…"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Marca *</label>
              <input
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="Scania, Volvo…"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Modelo *</label>
              <input
                value={form.model}
                onChange={(e) => update('model', e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="P340, FMX…"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Año *</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => update('year', e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="2020"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Color *</label>
              <input
                value={form.color}
                onChange={(e) => update('color', e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="Rojo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Estado *</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full border p-2 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                required
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Sucursal */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal *</label>
              <select
                value={form.branch}
                onChange={(e) => update('branch', e.target.value)}
                className="w-full border p-2 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                required
              >
                <option value="">Selecciona sucursal…</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.displayCode || b.code || b.name || b._id} — {b.name || b.title || b.displayName || ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Transmisión */}
            <div className="md:col-span-2">
              <div className="text-sm font-medium text-slate-700 mb-2">Transmisión *</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Tipo *</label>
                  <select
                    value={form.transmission.type}
                    onChange={(e)=>updateTx('type', e.target.value)}
                    className="w-full border p-2 rounded bg-white focus:outline-none focus:ring focus:ring-blue-200"
                    required
                  >
                    {TX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Marca *</label>
                  <input
                    value={form.transmission.brand}
                    onChange={(e)=>updateTx('brand', e.target.value)}
                    className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="Allison, ZF, Eaton…"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Modelo *</label>
                  <input
                    value={form.transmission.model}
                    onChange={(e)=>updateTx('model', e.target.value)}
                    className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="4500 RDS…"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">N° Serie</label>
                  <input
                    value={form.transmission.serial}
                    onChange={(e)=>updateTx('serial', e.target.value)}
                    className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="TRX-000123"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">N° Marchas</label>
                  <input
                    type="number"
                    value={form.transmission.gears}
                    onChange={(e)=>updateTx('gears', e.target.value)}
                    className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="6"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: LEGAL --- */}
        {tab==='legal' && (
          <div className="p-4 space-y-4">
            {!isEdit && (
              <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">
                Guarda primero el vehículo para habilitar adjuntos legales.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="font-medium text-slate-700 mb-2">Adjuntar documento legal (PDF/imagen)</div>
                <form onSubmit={(e)=>e.preventDefault()}>
                  <label className="block text-sm mb-1 text-slate-600">Etiqueta</label>
                  <input id="legalLabel" className="w-full border p-2 rounded mb-2" placeholder="SOAP 2025" disabled={!isEdit}/>
                  <label className="block text-sm mb-1 text-slate-600">Archivo</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="w-full border p-2 rounded"
                    disabled={!isEdit}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const label = document.getElementById('legalLabel')?.value || ''
                      try {
                        await uploadDocOrVideo(file, 'legal', label)
                        alert('Documento legal subido.')
                      } catch (err) {
                        alert(err?.response?.data?.message || err.message || 'Error al subir documento')
                      } finally { e.target.value = '' }
                    }}
                  />
                </form>
              </div>

              <div className="border rounded-lg p-3">
                <div className="font-medium text-slate-700 mb-2">Documentos legales</div>
                <ul className="text-sm space-y-2 max-h-56 overflow-auto">
                  {(vehicle?.documents || [])
                    .filter(d => d.category==='legal')
                    .map(d => (
                      <li key={d._id} className="flex items-center justify-between gap-2">
                        <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                          {d.label || d.format?.toUpperCase() || 'Documento'} ({Math.round((d.bytes||0)/1024)} KB)
                        </a>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={()=>deleteDocument(d._id)}
                          disabled={!isEdit}
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  {(!vehicle?.documents || vehicle.documents.filter(d=>d.category==='legal').length===0) && (
                    <li className="text-slate-500">Sin documentos legales aún.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: MEDIA --- */}
        {tab==='media' && (
          <div className="p-4 space-y-4">
            {!isEdit && (
              <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">
                Guarda primero el vehículo para habilitar fotos y videos.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fotos */}
              <div className="border rounded-lg p-3">
                <div className="font-medium text-slate-700 mb-2">Subir foto (JPG/PNG/WEBP)</div>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border p-2 rounded mb-2"
                  disabled={!isEdit}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (!isImage(file)) { alert('Selecciona una imagen'); return }
                    try {
                      await uploadPhoto(file)
                      alert('Foto subida.')
                    } catch (err) {
                      alert(err?.response?.data?.message || err.message || 'Error al subir foto')
                    } finally { e.target.value = '' }
                  }}
                />
                <div className="grid grid-cols-3 gap-2">
                  {(vehicle?.photos || []).map(p => (
                    <div key={p._id} className="relative group">
                      <img src={p.url} alt="" className="w-full h-24 object-cover rounded"/>
                      <button
                        type="button"
                        className="absolute top-1 right-1 text-xs bg-white/90 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100"
                        onClick={()=>deletePhoto(p._id)}
                        disabled={!isEdit}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {(!vehicle?.photos || vehicle.photos.length===0) && (
                    <div className="text-sm text-slate-500">Sin fotos todavía.</div>
                  )}
                </div>
              </div>

              {/* Documentos/Video */}
              <div className="border rounded-lg p-3">
                <div className="font-medium text-slate-700 mb-2">Subir documento/VIDEO (PDF / MP4/WEBM/MOV)</div>
                <input
                  type="file"
                  accept="application/pdf,video/*"
                  className="w-full border p-2 rounded mb-2"
                  disabled={!isEdit}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      await uploadDocOrVideo(file) // category auto: videos si video/*
                      alert(isVideo(file) ? 'Video subido.' : 'Documento subido.')
                    } catch (err) {
                      alert(err?.response?.data?.message || err.message || 'Error al subir archivo')
                    } finally { e.target.value = '' }
                  }}
                />
                <ul className="text-sm space-y-2 max-h-56 overflow-auto">
                  {(vehicle?.documents || []).map(d => (
                    <li key={d._id} className="flex items-center justify-between gap-2">
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                        {(d.category==='videos' ? '🎞️ Video' : (d.label || 'Documento'))}
                        {' '}({d.format?.toUpperCase()}) {d.bytes ? `• ${Math.round(d.bytes/1024)} KB` : ''}
                      </a>
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={()=>deleteDocument(d._id)}
                        disabled={!isEdit}
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                  {(!vehicle?.documents || vehicle.documents.length===0) && (
                    <li className="text-slate-500">Sin documentos/videos aún.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
          {saving ? 'Guardando…' : (isEdit ? 'Guardar cambios' : 'Guardar')}
        </button>
      </div>
    </form>
  )
}
