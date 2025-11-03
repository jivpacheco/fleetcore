// // front/src/pages/Vehicles/List.jsx
// // -----------------------------------------------------------------------------
// // Listado de Vehículos
// // - Búsqueda por q
// // - Filtro por Sucursal
// // - Paginación
// // - Orden: compañía (branch.code) → código (internalCode)
// // - Estado: etiqueta desde catálogo VEHICLE_STATUSES
// // - Reemplazo: muestra (siglaOriginal) si support.active
// // - Acciones Ver / Editar (rutas estándar)
// // -----------------------------------------------------------------------------
// import { useEffect, useMemo, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { api } from '../../services/http';

// function naturalSortBranches(list){
//   return [...list].sort((a,b)=>{
//     const an = Number(a.code); const bn = Number(b.code);
//     const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn);
//     if (aIsNum && bIsNum) return an - bn;
//     if (aIsNum) return -1;
//     if (bIsNum) return 1;
//     return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true });
//   });
// }

// export default function VehiclesList() {
//   const navigate = useNavigate();

//   // Catálogo de estados (code → label)
//   const [statuses, setStatuses] = useState([]);
//   const statusMap = useMemo(() => {
//     const m = new Map();
//     (statuses || []).forEach(s => m.set(String(s.code).toUpperCase(), s.label || s.code));
//     return m;
//   }, [statuses]);

//   // Sucursales
//   const [branches, setBranches] = useState([]);

//   // Tabla
//   const [items, setItems] = useState([]);
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [total, setTotal] = useState(0);

//   // Filtros
//   const [q, setQ] = useState('');
//   const [branch, setBranch] = useState('');

//   const pages = Math.max(Math.ceil(total / limit), 1);

//   // Catálogo de estados
//   useEffect(() => {
//     api.get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
//       .then(({ data }) => {
//         const items = data?.items || [];
//         setStatuses(items.map(it => ({ code: it.code, label: it.label })));
//       })
//       .catch(() => setStatuses([]));
//   }, []);

//   // Sucursales
//   useEffect(() => {
//     api.get('/api/v1/branches', { params: { page: 1, limit: 500 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || data?.list || [];
//         setBranches(naturalSortBranches(payload));
//       })
//       .catch(() => setBranches([]));
//   }, []);

//   // Cargar tabla
//   const load = async (_page = page, _limit = limit, _q = q, _branch = branch) => {
//     const { data } = await api.get('/api/v1/vehicles', {
//       params: { page: _page, limit: _limit, q: _q || undefined, branch: _branch || undefined }
//     });
//     const list = data?.items || data?.data?.items || data?.data || data?.list || [];

//     // Orden en front por si el back en tu entorno no aplica sort por poblados
//     const sorted = list.slice().sort((a,b)=>{
//       const aComp = (a.branch?.code || '').toString();
//       const bComp = (b.branch?.code || '').toString();
//       if (aComp !== bComp) return aComp.localeCompare(bComp, 'es', { numeric: true });
//       return (a.internalCode || '').localeCompare(b.internalCode || '', 'es', { numeric: true });
//     });

//     setItems(sorted);
//     setTotal(data?.total ?? sorted.length);
//     setPage(data?.page ?? _page);
//     setLimit(data?.limit ?? _limit);
//   };

//   useEffect(() => { load().catch(()=>{}); /* eslint-disable-next-line */ }, []);

//   const applyFilters = () => load(1, limit, q, branch);
//   const clearFilters = () => { setQ(''); setBranch(''); load(1, limit, '', ''); };

//   return (
//     <div className="max-w-6xl mx-auto">
//       <header className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-semibold">Vehículos</h2>
//         <div className="flex gap-2">
//           <button
//             onClick={() => navigate('/vehicles/new')}
//             className="px-3 py-2 bg-blue-600 text-white rounded"
//           >
//             Nuevo vehículo
//           </button>
//         </div>
//       </header>

//       {/* Filtros */}
//       <div className="bg-white border rounded-xl shadow p-4 mb-4">
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
//           <div className="sm:col-span-2">
//             <label className="block text-sm font-medium text-slate-600 mb-1">Buscar</label>
//             <input
//               value={q}
//               onChange={(e)=>setQ(e.target.value)}
//               placeholder="Placa, código, marca, modelo o sigla original..."
//               className="w-full border p-2 rounded"
//             />
//           </div>

//           <div className="sm:col-span-2">
//             <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
//             <select
//               value={branch}
//               onChange={(e)=>setBranch(e.target.value)}
//               className="w-full border p-2 rounded bg-white"
//             >
//               <option value="">Todas</option>
//               {branches.map(b => (
//                 <option key={b._id} value={b._id}>
//                   {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="mt-3 flex gap-2">
//           <button onClick={applyFilters} className="px-3 py-2 bg-slate-800 text-white rounded">Aplicar</button>
//           <button onClick={clearFilters} className="px-3 py-2 border rounded">Limpiar</button>
//         </div>
//       </div>

//       {/* Tabla */}
//       <div className="bg-white border rounded-xl shadow overflow-x-auto">
//         <table className="min-w-full text-sm">
//           <thead className="bg-slate-50 text-slate-600">
//             <tr>
//               <th className="text-left px-3 py-2">Código</th>
//               <th className="text-left px-3 py-2">Placa</th>
//               <th className="text-left px-3 py-2">Sucursal</th>
//               <th className="text-left px-3 py-2">Estado</th>
//               <th className="text-left px-3 py-2">Marca/Modelo</th>
//               <th className="text-left px-3 py-2 w-28">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
//                   No hay vehículos para mostrar.
//                 </td>
//               </tr>
//             )}
//             {items.map(v => {
//               const label = statusMap.get(String(v.status || '').toUpperCase()) || (v.status || '');
//               const original = v.support?.active && v.support?.originalInternalCode ? `(${v.support.originalInternalCode})` : '';
//               return (
//                 <tr key={v._id} className="border-t">
//                   <td className="px-3 py-2 whitespace-nowrap">
//                     <span className="font-medium">{v.internalCode}</span>{' '}
//                     {original && <span className="text-red-600 font-bold">{original}</span>}
//                   </td>
//                   <td className="px-3 py-2">{v.plate}</td>
//                   <td className="px-3 py-2">
//                     {v.branch?.code ? `${v.branch.code} — ${v.branch.name}` : (v.branch?.name || '—')}
//                   </td>
//                   <td className="px-3 py-2">
//                     <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border text-slate-700">
//                       {label}
//                     </span>
//                   </td>
//                   <td className="px-3 py-2">
//                     <div className="text-slate-700">{v.brand} {v.model}</div>
//                     <div className="text-slate-400">{v.year || '—'}</div>
//                   </td>
//                   <td className="px-3 py-2">
//                     <div className="flex gap-2">
//                       <Link to={`/vehicles/${v._id}`} className="text-blue-600 hover:underline">Ver</Link>
//                       <Link to={`/vehicles/${v._id}/edit`} className="text-amber-600 hover:underline">Editar</Link>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>

//         {/* Paginación */}
//         <div className="px-3 py-2 border-t flex items-center justify-between">
//           <div className="text-sm text-slate-600">
//             Página {page} de {pages} — {total} registros
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               className="px-2 py-1 border rounded disabled:opacity-40"
//               onClick={() => { const np = Math.max(page-1, 1); setPage(np); load(np, limit, q, branch); }}
//               disabled={page <= 1}
//             >
//               ‹ Anterior
//             </button>
//             <select
//               value={limit}
//               onChange={(e)=>{ const nl = parseInt(e.target.value,10)||10; setLimit(nl); load(1, nl, q, branch); }}
//               className="border rounded px-2 py-1"
//             >
//               {[10,20,50,100].map(n => <option key={n} value={n}>{n}/pág</option>)}
//             </select>
//             <button
//               className="px-2 py-1 border rounded disabled:opacity-40"
//               onClick={() => { const np = Math.min(page+1, pages); setPage(np); load(np, limit, q, branch); }}
//               disabled={page >= pages}
//             >
//               Siguiente ›
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// front/src/pages/Vehicles/List.jsx
// -----------------------------------------------------------------------------
// Lista de Vehículos
// - Búsqueda por texto (q) y filtro por sucursal (branch).
// - Paginación.
// - Acciones: Ver (readonly) y Editar.
// - Si un vehículo está en apoyo (SUPPORT) muestra junto a la sigla un rótulo
//   rojo y en negrita con la sigla de reemplazo (XXR).
//   En nuestro back, al iniciar apoyo, al vehículo "origen" se le asigna
//   internalCode = <siglaTarget> + 'R'. Por eso el indicador en rojo será
//   precisamente el internalCode vigente cuando SUPPORT=true.
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/http'

function naturalSortBranches(list){
  return [...list].sort((a,b)=>{
    const an = Number(a.code); const bn = Number(b.code)
    const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn)
    if (aIsNum && bIsNum) return an - bn
    if (aIsNum) return -1
    if (bIsNum) return 1
    return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true })
  })
}

export default function VehiclesList(){
  const navigate = useNavigate()

  // Filtros/estado
  const [q, setQ] = useState('')
  const [branch, setBranch] = useState('')
  const [branches, setBranches] = useState([])

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar sucursales
  useEffect(() => {
    api.get('/api/v1/branches', { params: { page:1, limit:200 } })
      .then(({ data })=>{
        const list = data?.items || data?.data?.items || data?.data || data?.list || []
        setBranches(naturalSortBranches(list))
      })
      .catch(()=> setBranches([]))
  }, [])

  // Buscar vehículos
  async function fetchData(p = page, l = limit) {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/api/v1/vehicles', {
        params: { page: p, limit: l, q: q || undefined, branch: branch || undefined }
      })
      const arr = data?.items || data?.data || []
      setItems(arr)
      setTotal(data?.total ?? arr.length)
      setPage(data?.page ?? p)
      setLimit(data?.limit ?? l)
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo cargar el listado')
      setItems([]); setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Primera carga
  useEffect(()=>{ fetchData(1, limit) }, []) // eslint-disable-line

  // Handlers UI
  function handleSearch(e){
    e.preventDefault()
    fetchData(1, limit)
  }
  function clearFilters(){
    setQ(''); setBranch('')
    setTimeout(()=>fetchData(1, limit), 0)
  }

  // Cálculo de páginas
  const pages = useMemo(()=>{
    const n = Math.max(1, Math.ceil(total / limit))
    return Array.from({length:n}, (_,i)=>i+1)
  }, [total, limit])

  // Render fila vehículo
  function Row({ v }){
    // Si está en apoyo, el internalCode es la sigla de reemplazo (target + 'R')
    const isSupport = String(v.status || '').toUpperCase() === 'SUPPORT' || v?.support?.active
    const code = v.internalCode || v.plate || v._id

    return (
      <tr className="border-b last:border-b-0 hover:bg-slate-50">
        <td className="px-3 py-2 whitespace-nowrap text-sm">
          <div className="font-medium">
            {code}
            {isSupport && (
              <span className="ml-2 text-red-700 font-extrabold">
                ({code})
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {v.brand} {v.model} — {v.year || '—'}
          </div>
        </td>
        <td className="px-3 py-2 text-sm">
          {v.branch?.code ? `${v.branch.code} — ${v.branch.name}` : (v.branch?.name || '—')}
        </td>
        <td className="px-3 py-2 text-sm">
          {v.status || '—'}
        </td>
        <td className="px-3 py-2 text-right text-sm">
          <div className="inline-flex gap-2">
            <button
              type="button"
              className="px-2.5 py-1.5 border rounded hover:bg-white"
              title="Ver (solo lectura)"
              onClick={()=> navigate(`/vehicles/${v._id}?mode=view`)}
            >
              Ver
            </button>
            <button
              type="button"
              className="px-2.5 py-1.5 bg-blue-600 text-white rounded hover:brightness-95"
              title="Editar"
              onClick={()=> navigate(`/vehicles/${v._id}`)}
            >
              Editar
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vehículos</h1>
          <p className="text-sm text-slate-500">Gestiona el inventario de vehículos.</p>
        </div>
        <div>
          <button
            type="button"
            onClick={()=>navigate('/vehicles/new')}
            className="px-3 py-2 bg-emerald-600 text-white rounded hover:brightness-95"
          >
            Nuevo vehículo
          </button>
        </div>
      </header>

      {/* Filtros */}
      <form onSubmit={handleSearch} className="bg-white border rounded-xl shadow p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Buscar</label>
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="PLACA, SIGLA, MARCA, MODELO…"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
            <select
              value={branch}
              onChange={(e)=>setBranch(e.target.value)}
              className="w-full border p-2 rounded bg-white"
            >
              <option value="">Todas</option>
              {branches.map(b=>(
                <option key={b._id} value={b._id}>
                  {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded hover:brightness-95">
              Buscar
            </button>
            <button type="button" onClick={clearFilters} className="px-3 py-2 border rounded">
              Limpiar
            </button>
          </div>
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white border rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="px-3 py-2 font-medium">Vehículo</th>
              <th className="px-3 py-2 font-medium">Sucursal</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={4}>Cargando…</td></tr>
            ) : error ? (
              <tr><td className="px-3 py-6 text-center text-sm text-red-600" colSpan={4}>{error}</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={4}>Sin resultados.</td></tr>
            ) : (
              items.map(v => <Row key={v._id} v={v} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          {total} registros — página {page} de {Math.max(1, Math.ceil(total/limit))}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e)=>{ const l = Number(e.target.value)||10; setLimit(l); fetchData(1,l) }}
            className="border rounded p-1 bg-white text-sm"
          >
            {[10,20,50,100].map(n=><option key={n} value={n}>{n} / pág.</option>)}
          </select>
          <div className="flex flex-wrap gap-1">
            {pages.map(p=>(
              <button
                key={p}
                type="button"
                onClick={()=> fetchData(p, limit)}
                className={`px-2.5 py-1.5 rounded border text-sm ${p===page ? 'bg-blue-600 text-white' : 'bg-white'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
