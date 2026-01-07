// // front/src/pages/People/List.jsx
// // -----------------------------------------------------------------------------
// // RRHH - Listado de Personas
// // - Búsqueda básica + filtros
// // - Acciones: Ver (?mode=view) y Editar
// // - Filtro por sucursal: ?branchId=...
// // -----------------------------------------------------------------------------

// import { useEffect, useState } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { PeopleAPI } from '../../api/people.api'

// export default function PeopleList() {
//   const navigate = useNavigate()
//   const [sp, setSp] = useSearchParams()

//   const [items, setItems] = useState([])
//   const [total, setTotal] = useState(0)
//   const [loading, setLoading] = useState(false)

//   const page = Number(sp.get('page') || 1)
//   const limit = Number(sp.get('limit') || 20)
//   const [q, setQ] = useState(sp.get('q') || '')
//   const branchId = sp.get('branchId') || ''
//   const positionId = sp.get('positionId') || ''
//   const active = sp.get('active') || ''

//   const load = async () => {
//     setLoading(true)
//     try {
//       const { data } = await PeopleAPI.list({ page, limit, q, branchId, positionId, active })
//       const list = data?.items || data?.data?.items || data?.data || []
//       setItems(list)
//       setTotal(data?.total || data?.data?.total || 0)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [page, limit]) // eslint-disable-line

//   const applySearch = () => {
//     const next = new URLSearchParams(sp)
//     next.set('q', q)
//     next.set('page', '1')
//     setSp(next, { replace: true })
//     // load triggered by effect because page changes to 1
//     if (page === 1) load()
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-3">
//       <div className="flex items-center justify-between">
//         <h2 className="text-lg font-semibold">RRHH — Personas</h2>
//         <button
//           className="px-3 py-2 bg-blue-600 text-white rounded"
//           onClick={() => navigate('/people/new')}
//         >
//           Crear persona
//         </button>
//       </div>

//       <div className="mt-3 flex gap-2">
//         <input
//           className="border rounded p-2 w-full"
//           placeholder="Buscar por nombre, documento, email…"
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//         />
//         <button className="px-3 py-2 border rounded" onClick={applySearch}>
//           Buscar
//         </button>
//       </div>

//       <div className="mt-4 bg-white border rounded-xl overflow-hidden">
//         {loading && <div className="p-3 text-sm text-slate-500">Cargando…</div>}
//         {!loading && items.length === 0 && <div className="p-3 text-sm text-slate-500">Sin resultados.</div>}

//         {!loading && items.length > 0 && (
//           <table className="w-full text-sm">
//             <thead className="bg-slate-50">
//               <tr>
//                 <th className="text-left p-2">Nombre</th>
//                 <th className="text-left p-2">Documento</th>
//                 <th className="text-left p-2">Sucursal</th>
//                 <th className="text-left p-2">Cargo</th>
//                 <th className="text-right p-2">Acciones</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {items.map(p => (
//                 <tr key={p._id}>
//                   <td className="p-2">{p.firstName} {p.lastName}</td>
//                   <td className="p-2">{p.documentType} {p.documentId}</td>
//                   <td className="p-2">{p.branchId?.name || '—'}</td>
//                   <td className="p-2">{p.positionId?.name || '—'}</td>
//                   <td className="p-2 text-right space-x-2">
//                     <button
//                       className="px-2 py-1 border rounded"
//                       onClick={() => navigate(`/people/${p._id}?mode=view&tab=BASICO`)}
//                     >
//                       Ver
//                     </button>
//                     <button
//                       className="px-2 py-1 bg-blue-600 text-white rounded"
//                       onClick={() => navigate(`/people/${p._id}?tab=BASICO`)}
//                     >
//                       Editar
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       <div className="mt-3 flex justify-end gap-2">
//         <button
//           className="px-3 py-2 border rounded"
//           disabled={page <= 1}
//           onClick={() => {
//             const next = new URLSearchParams(sp)
//             next.set('page', String(page - 1))
//             setSp(next, { replace: true })
//           }}
//         >
//           Anterior
//         </button>

//         <div className="px-3 py-2 text-sm text-slate-600">Página {page}</div>

//         <button
//           className="px-3 py-2 border rounded"
//           disabled={page * limit >= total}
//           onClick={() => {
//             const next = new URLSearchParams(sp)
//             next.set('page', String(page + 1))
//             setSp(next, { replace: true })
//           }}
//         >
//           Siguiente
//         </button>
//       </div>
//     </div>
//   )
// }

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PeopleAPI } from '../../api/people.api'
import { PositionsAPI } from '../../api/positions.api'
import { api, API_PREFIX } from '../../services/http'

export default function PeopleList() {
  const [q, setQ] = useState('')
  const [active, setActive] = useState('')
  const [positionId, setPositionId] = useState('')
  const [branchId, setBranchId] = useState('')

  const [positions, setPositions] = useState([])
  const [branches, setBranches] = useState([])

  const [page, setPage] = useState(1)
  const limit = 10

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const pages = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total])

  const loadRefs = async () => {
    // positions
    try {
      const { data } = await PositionsAPI.list({ limit: 200, active: 'true' })
      setPositions(data.items || [])
    } catch { setPositions([]) }

    // branches (genérico)
    try {
      const { data } = await api.get(`${API_PREFIX}/branches`, { params: { page: 1, limit: 200 } })
      setBranches(data.items || [])
    } catch { setBranches([]) }
  }

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await PeopleAPI.list({ page, limit, q, branchId, positionId, active })
      setItems(data.items || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRefs() }, [])
  useEffect(() => { load() }, [page]) // eslint-disable-line

  const onSearch = async (e) => {
    e.preventDefault()
    setPage(1)
    await load()
  }

  const onDelete = async (id) => {
    const ok = window.confirm('¿Eliminar persona?')
    if (!ok) return
    try {
      await PeopleAPI.remove(id)
      await load()
    } catch (err) {
      console.error(err)
      alert('No fue posible eliminar')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">RRHH — Personas</h1>
          <p className="text-sm text-gray-600">Listado y gestión de personas.</p>
        </div>
        <Link className="px-3 py-2 rounded bg-black text-white" to="/people/new">
          Nueva persona
        </Link>
      </div>

      <form onSubmit={onSearch} className="border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Buscar (DNI, nombre, email)..." value={q}
          onChange={(e) => setQ(e.target.value)} />

        <select className="border rounded px-3 py-2" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          <option value="">Sucursal (todas)</option>
          {branches.map(b => <option key={b._id} value={b._id}>{b.code} — {b.name}</option>)}
        </select>

        <select className="border rounded px-3 py-2" value={positionId} onChange={(e) => setPositionId(e.target.value)}>
          <option value="">Cargo (todos)</option>
          {positions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>

        <select className="border rounded px-3 py-2" value={active} onChange={(e) => setActive(e.target.value)}>
          <option value="">Activo (todos)</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>

        <div className="md:col-span-5 flex gap-2">
          <button type="submit" className="px-3 py-2 rounded bg-black text-white" disabled={loading}>Buscar</button>
          <button type="button" className="px-3 py-2 rounded border" onClick={() => { setQ(''); setActive(''); setPositionId(''); setBranchId(''); setPage(1); }}>
            Limpiar
          </button>
        </div>
      </form>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">DNI</th>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Cargo</th>
              <th className="text-left p-2">Sucursal</th>
              <th className="text-left p-2">Activo</th>
              <th className="text-left p-2 w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it._id} className="border-t">
                <td className="p-2">{it.dni}</td>
                <td className="p-2">{it.lastName} {it.firstName}</td>
                <td className="p-2">{it.positionId?.name || '—'}</td>
                <td className="p-2">{it.branchId?.name || '—'}</td>
                <td className="p-2">{it.active === false ? 'No' : 'Sí'}</td>
                <td className="p-2 flex gap-2">
                  <Link className="px-2 py-1 border rounded" to={`/people/${it._id}`}>Ver / Editar</Link>
                  <button className="px-2 py-1 border rounded" type="button" onClick={() => onDelete(it._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr><td className="p-3 text-gray-500" colSpan="6">Sin registros</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded" type="button" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
          <div className="text-sm">Página {page} / {pages}</div>
          <button className="px-2 py-1 border rounded" type="button" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Siguiente</button>
        </div>
      </div>
    </div>
  )
}
