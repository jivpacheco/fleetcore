// // front/src/pages/People/Form.jsx
// // -----------------------------------------------------------------------------
// // RRHH - Ficha de Persona (Tabs)
// // - Modo Ver: ?mode=view (bloquea inputs y muestra solo "Volver")
// // - Modo Editar: default
// // - Guard cambios sin guardar: hooks/UnsavedChangesGuard (useBlocker)
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useRef, useState } from 'react'
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
// import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// import { api } from '../../services/http'
// import { PeopleAPI } from '../../api/people.api'
// import { PositionsAPI } from '../../api/positions.api'

// function deepEqual(a, b) {
//   try { return JSON.stringify(a) === JSON.stringify(b) } catch { return false }
// }

// const ymd = (d) => {
//   if (!d) return ''
//   const dt = new Date(d)
//   if (Number.isNaN(dt.getTime())) return ''
//   return dt.toISOString().slice(0, 10)
// }

// export default function PeopleForm() {
//   const navigate = useNavigate()
//   const { id } = useParams()
//   const [sp, setSp] = useSearchParams()

//   const mode = sp.get('mode')
//   const readOnly = mode === 'view'
//   const [tab, setTab] = useState(sp.get('tab') || 'BASICO')

//   const scrollRef = useRef(null)
//   useEffect(() => { scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [tab])

//   const handleChangeTab = (code) => {
//     setTab(code)
//     const next = new URLSearchParams(sp)
//     next.set('tab', code)
//     setSp(next, { replace: true })
//   }

//   const [branches, setBranches] = useState([])
//   const [positions, setPositions] = useState([])

//   const [loading, setLoading] = useState(!!id)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')

//   const [form, setForm] = useState({
//     branchId: '',
//     positionId: '',
//     status: 'ACTIVE',
//     documentType: 'RUT',
//     documentId: '',
//     firstName: '',
//     lastName: '',
//     birthDate: '',
//     nationality: '',
//     email: '',
//     phone: '',
//     address: '',
//     hireDate: '',
//     licenses: [],
//   })

//   const [initialForm, setInitialForm] = useState(null)
//   const isDirty = !readOnly && !deepEqual(form, initialForm || form)

//   useEffect(() => {
//     // branches
//     api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || []
//         setBranches(payload)
//       })
//       .catch(() => setBranches([]))

//     // positions
//     PositionsAPI.list({ page: 1, limit: 500 })
//       .then(({ data }) => {
//         const list = data?.items || data?.data?.items || data?.data || []
//         setPositions(list.filter(x => x.active !== false))
//       })
//       .catch(() => setPositions([]))
//   }, [])

//   useEffect(() => {
//     if (!id) { setInitialForm(form); return }

//     setLoading(true)
//     PeopleAPI.get(id)
//       .then(({ data }) => {
//         const p = data?.item || data
//         const loaded = {
//           branchId: p.branchId?._id || p.branchId || '',
//           positionId: p.positionId?._id || p.positionId || '',
//           status: p.status || 'ACTIVE',
//           documentType: p.documentType || 'RUT',
//           documentId: p.documentId || '',
//           firstName: p.firstName || '',
//           lastName: p.lastName || '',
//           birthDate: ymd(p.birthDate),
//           nationality: p.nationality || '',
//           email: p.email || '',
//           phone: p.phone || '',
//           address: p.address || '',
//           hireDate: ymd(p.hireDate),
//           licenses: Array.isArray(p.licenses) ? p.licenses.map(l => ({
//             number: l.number || '',
//             type: l.type || '',
//             issuer: l.issuer || '',
//             issuedAt: ymd(l.issuedAt),
//             validTo: ymd(l.validTo),
//           })) : [],
//         }
//         setForm(loaded)
//         setInitialForm(loaded)
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar la persona'))
//       .finally(() => setLoading(false))
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id])

//   const toDateOrNull = (v) => (v ? new Date(`${v}T00:00:00.000Z`) : null)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (readOnly) return
//     setSaving(true); setError('')

//     try {
//       if (!form.branchId) throw new Error('Sucursal es obligatoria')
//       if (!form.positionId) throw new Error('Cargo es obligatorio')
//       if (!String(form.documentId || '').trim()) throw new Error('Documento es obligatorio')
//       if (!String(form.firstName || '').trim() || !String(form.lastName || '').trim()) throw new Error('Nombre y apellido son obligatorios')

//       const payload = {
//         ...form,
//         birthDate: toDateOrNull(form.birthDate),
//         hireDate: toDateOrNull(form.hireDate),
//         licenses: (form.licenses || []).map(l => ({
//           ...l,
//           issuedAt: toDateOrNull(l.issuedAt),
//           validTo: toDateOrNull(l.validTo),
//         })),
//       }

//       if (id) await PeopleAPI.update(id, payload)
//       else await PeopleAPI.create(payload)

//       alert(id ? 'Persona actualizada con éxito' : 'Persona creada con éxito')
//       setInitialForm(form)
//       navigate('/people')
//     } catch (err) {
//       setError(err?.response?.data?.message || err.message || 'Datos inválidos')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const TabButton = ({ code, label }) => (
//     <button
//       type="button"
//       onClick={() => handleChangeTab(code)}
//       className={`px-3 py-1.5 rounded ${tab === code ? 'bg-blue-600 text-white' : 'bg-white border'}`}
//     >
//       {label}
//     </button>
//   )

//   if (loading) return <div className="max-w-6xl mx-auto p-4 bg-white border rounded mt-3">Cargando…</div>

//   return (
//     <div className="flex flex-col h-full">
//       <UnsavedChangesGuard when={isDirty} getMessage={() => 'Tienes cambios sin guardar. ¿Salir sin guardar?'} />

//       <header className="max-w-6xl mx-auto mt-2 px-3">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">
//             {readOnly ? 'Consulta de persona' : id ? 'Editar persona' : 'Registrar persona'}
//           </h2>
//         </div>

//         <nav className="mt-2 flex justify-center gap-2">
//           <TabButton code="BASICO" label="Básico" />
//           <TabButton code="ORGANIZACION" label="Organización" />
//           <TabButton code="CONDUCCION" label="Conducción" />
//         </nav>
//       </header>

//       {error && <div className="max-w-6xl mx-auto mt-2 px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

//       <form ref={scrollRef} onSubmit={handleSubmit} className="max-w-6xl mx-auto w-full h-[calc(100vh-140px)] overflow-y-auto px-3 my-3">

//         {tab === 'BASICO' && (
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Datos personales</h3>
//             </div>

//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Documento</label>
//                 <input
//                   className="w-full border p-2 rounded"
//                   value={form.documentId}
//                   disabled={readOnly}
//                   readOnly={readOnly}
//                   onChange={(e) => setForm(f => ({ ...f, documentId: e.target.value }))}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
//                 <select
//                   className="w-full border p-2 rounded bg-white"
//                   value={form.status}
//                   disabled={readOnly}
//                   onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
//                 >
//                   <option value="ACTIVE">ACTIVO</option>
//                   <option value="INACTIVE">INACTIVO</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Nombres</label>
//                 <input
//                   className="w-full border p-2 rounded"
//                   value={form.firstName}
//                   disabled={readOnly}
//                   readOnly={readOnly}
//                   onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Apellidos</label>
//                 <input
//                   className="w-full border p-2 rounded"
//                   value={form.lastName}
//                   disabled={readOnly}
//                   readOnly={readOnly}
//                   onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {tab === 'ORGANIZACION' && (
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Organización</h3>
//             </div>

//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
//                 <select
//                   className="w-full border p-2 rounded bg-white"
//                   value={form.branchId}
//                   disabled={readOnly}
//                   onChange={(e) => setForm(f => ({ ...f, branchId: e.target.value }))}
//                 >
//                   <option value="" disabled>Selecciona sucursal</option>
//                   {branches.map(b => (
//                     <option key={b._id} value={b._id}>
//                       {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Cargo</label>
//                 <select
//                   className="w-full border p-2 rounded bg-white"
//                   value={form.positionId}
//                   disabled={readOnly}
//                   onChange={(e) => setForm(f => ({ ...f, positionId: e.target.value }))}
//                 >
//                   <option value="" disabled>Selecciona cargo</option>
//                   {positions.map(p => (
//                     <option key={p._id} value={p._id}>
//                       {p.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         )}

//         {tab === 'CONDUCCION' && (
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Conducción</h3>
//             </div>

//             <div className="p-4 text-sm text-slate-600">
//               Sprint 1: base lista. Sprint 2: licencias múltiples + validaciones + vehículos autorizados.
//             </div>
//           </div>
//         )}

//         <div className="flex justify-end gap-3 pb-4 mt-4">
//           {readOnly ? (
//             <button type="button" onClick={() => navigate('/people')} className="px-3 py-2 border rounded">Volver</button>
//           ) : (
//             <>
//               <button type="button" onClick={() => navigate('/people')} className="px-3 py-2 border rounded">
//                 {isDirty ? 'Cancelar' : 'Volver'}
//               </button>
//               <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//                 {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//               </button>
//             </>
//           )}
//         </div>
//       </form>
//     </div>
//   )
// }

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
import { PeopleAPI } from '../../api/people.api'
import { PositionsAPI } from '../../api/positions.api'
import { api, API_PREFIX } from '../../services/http'

import LicensesTab from './tabs/LicensesTab'
import FilesTab from './tabs/FilesTab'
import DrivingTestsTab from './tabs/DrivingTestsTab'

const TABS = [
  { key: 'basic', label: 'Básico' },
  { key: 'org', label: 'Organización' },
  { key: 'licenses', label: 'Licencias' },
  { key: 'files', label: 'Archivos' },
  { key: 'tests', label: 'Pruebas' },
]

function pickId(v) {
  if (!v) return ''
  if (typeof v === 'string') return v
  return v._id || ''
}

export default function PeopleForm() {
  const { id } = useParams()
  const isNew = id === 'new' || !id
  const navigate = useNavigate()

  const [tab, setTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [positions, setPositions] = useState([])
  const [branches, setBranches] = useState([])

  const [personDoc, setPersonDoc] = useState(null) // versión completa desde backend
  const [initial, setInitial] = useState(null)

  const [form, setForm] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
    birthPlace: '',
    nationality: '',
    hireDate: '',
    active: true,

    branchId: '',
    positionId: '',
  })

  const isDirty = useMemo(() => {
    if (!initial) return false
    return JSON.stringify(form) !== JSON.stringify(initial)
  }, [form, initial])

  const loadRefs = async () => {
    // branches
    try {
      const { data } = await api.get(`${API_PREFIX}/branches`, { params: { page: 1, limit: 200 } })
      setBranches(data.items || [])
    } catch { setBranches([]) }

    // positions
    try {
      const { data } = await PositionsAPI.list({ page: 1, limit: 200, active: 'true' })
      setPositions(data.items || [])
    } catch { setPositions([]) }
  }

  const mapToForm = (p) => ({
    dni: p.dni || '',
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    phone: p.phone || '',
    email: p.email || '',
    birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : '',
    birthPlace: p.birthPlace || '',
    nationality: p.nationality || '',
    hireDate: p.hireDate ? String(p.hireDate).slice(0, 10) : '',
    active: p.active !== false,

    branchId: pickId(p.branchId),
    positionId: pickId(p.positionId),
  })

  const loadPerson = async () => {
    if (isNew) {
      setPersonDoc(null)
      const base = { ...form }
      setInitial(base)
      return
    }

    setLoading(true)
    try {
      const { data } = await PeopleAPI.get(id)
      const p = data.item
      setPersonDoc(p)

      const mapped = mapToForm(p)
      setForm(mapped)
      setInitial(mapped)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRefs() }, [])
  useEffect(() => { loadPerson() }, [id]) // eslint-disable-line

  const payload = useMemo(() => {
    const out = { ...form }
    if (!out.positionId) out.positionId = null
    if (!out.email) delete out.email
    return out
  }, [form])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = isNew
        ? await PeopleAPI.create(payload)
        : await PeopleAPI.update(id, payload)

      const saved = data.item
      if (isNew) {
        navigate(`/people/${saved._id}`)
        return
      }
      await loadPerson()
    } catch (err) {
      console.error(err)
      alert('No fue posible guardar')
    } finally {
      setSaving(false)
    }
  }

  const title = isNew ? 'Nueva persona' : `Persona: ${form.lastName} ${form.firstName}`

  return (
    <div className="p-6 space-y-6">
      <UnsavedChangesGuard when={isDirty} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600">RRHH — ficha por pestañas.</p>
        </div>
        <div className="flex gap-2">
          <Link className="px-3 py-2 rounded border" to="/people">Volver</Link>
          <button className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" onClick={save} disabled={saving || loading}>
            Guardar
          </button>
        </div>
      </div>

      <div className="border-b flex gap-2">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`px-3 py-2 text-sm border-b-2 ${tab===t.key ? 'border-black font-semibold' : 'border-transparent text-gray-600'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Cargando…</div>
      ) : (
        <>
          {tab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
              <input className="border rounded px-3 py-2" placeholder="DNI *" value={form.dni} onChange={(e)=>setForm(s=>({...s,dni:e.target.value}))} />
              <input className="border rounded px-3 py-2" placeholder="Nombres *" value={form.firstName} onChange={(e)=>setForm(s=>({...s,firstName:e.target.value}))} />
              <input className="border rounded px-3 py-2" placeholder="Apellidos *" value={form.lastName} onChange={(e)=>setForm(s=>({...s,lastName:e.target.value}))} />

              <input className="border rounded px-3 py-2" placeholder="Teléfono" value={form.phone} onChange={(e)=>setForm(s=>({...s,phone:e.target.value}))} />
              <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Email" value={form.email} onChange={(e)=>setForm(s=>({...s,email:e.target.value}))} />

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Fecha nacimiento</div>
                <input type="date" className="border rounded px-3 py-2 w-full" value={form.birthDate} onChange={(e)=>setForm(s=>({...s,birthDate:e.target.value}))} />
              </label>

              <input className="border rounded px-3 py-2" placeholder="Lugar nacimiento" value={form.birthPlace} onChange={(e)=>setForm(s=>({...s,birthPlace:e.target.value}))} />
              <input className="border rounded px-3 py-2" placeholder="Nacionalidad" value={form.nationality} onChange={(e)=>setForm(s=>({...s,nationality:e.target.value}))} />

              <label className="flex items-center gap-2 text-sm md:col-span-3">
                <input type="checkbox" checked={form.active} onChange={(e)=>setForm(s=>({...s,active:e.target.checked}))} />
                Activo
              </label>
            </div>
          )}

          {tab === 'org' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
              <label className="text-sm">
                <div className="text-gray-600 mb-1">Sucursal *</div>
                <select className="border rounded px-3 py-2 w-full" value={form.branchId} onChange={(e)=>setForm(s=>({...s,branchId:e.target.value}))}>
                  <option value="">— Selecciona sucursal —</option>
                  {branches.map(b => <option key={b._id} value={b._id}>{b.code} — {b.name}</option>)}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Cargo</div>
                <select className="border rounded px-3 py-2 w-full" value={form.positionId || ''} onChange={(e)=>setForm(s=>({...s,positionId:e.target.value}))}>
                  <option value="">— Sin cargo —</option>
                  {positions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Fecha contratación</div>
                <input type="date" className="border rounded px-3 py-2 w-full" value={form.hireDate} onChange={(e)=>setForm(s=>({...s,hireDate:e.target.value}))} />
              </label>
            </div>
          )}

          {tab === 'licenses' && (
            <LicensesTab
              person={personDoc || { _id: isNew ? null : id, licenses: [] }}
              onChange={(updater) => {
                setPersonDoc(prev => typeof updater === 'function' ? updater(prev || { _id: id, licenses: [] }) : updater)
              }}
            />
          )}

          {tab === 'files' && (
            <FilesTab
              person={personDoc || { _id: isNew ? null : id, photo: null, documents: [] }}
              onPersonReload={loadPerson}
            />
          )}

          {tab === 'tests' && (
            <DrivingTestsTab person={personDoc || { _id: isNew ? null : id, branchId: form.branchId }} />
          )}

          {isNew && (
            <div className="text-sm text-amber-700 border border-amber-200 bg-amber-50 rounded p-3">
              Nota: para Licencias / Archivos / Pruebas primero debes guardar la persona.
            </div>
          )}
        </>
      )}
    </div>
  )
}
