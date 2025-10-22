// // ///**** VERISION ESTABLE 20/10/2025 */

// // // front/src/pages/Vehicles/List.jsx
// // // -----------------------------------------------------------------------------
// // // Lista de vehículos mostrando Sucursal y ordenando por Sucursal → Código interno.
// // // -----------------------------------------------------------------------------
// // import { useEffect, useState } from 'react';
// // import { listVehicles } from '../../api/vehicles.api';
// // import { Link } from 'react-router-dom';

// // function naturalCode(a) {
// //   // convierte '1' -> 1, '10' -> 10, 'A' -> NaN; sirve para sort natural
// //   const n = Number(a);
// //   return Number.isFinite(n) ? n : Infinity;
// // }

// // export default function VehiclesList() {
// //   const [rows, setRows] = useState([]);
// //   const [q, setQ] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   async function load() {
// //     setLoading(true);
// //     try {
// //       const data = await listVehicles({ page: 1, limit: 100, q });
// //       const items = data.items || data.data || [];
// //       // sort: branch.name/code asc, luego internalCode asc (natural)
// //       items.sort((A,B)=>{
// //         const aB = (A.branch?.name || A.branch?.code || '').toString();
// //         const bB = (B.branch?.name || B.branch?.code || '').toString();
// //         const cmpB = aB.localeCompare(bB, 'es', { numeric: true });
// //         if (cmpB !== 0) return cmpB;
// //         // natural por internalCode numérico si aplica
// //         const na = naturalCode(A.internalCode);
// //         const nb = naturalCode(B.internalCode);
// //         if (na !== nb) return na - nb;
// //         return (A.internalCode || '').localeCompare(B.internalCode || '', 'es', { numeric: true });
// //       });
// //       setRows(items);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   useEffect(()=>{ load(); }, []); // carga inicial

// //   return (
// //     <div className="space-y-3">
// //       <header className="flex items-center justify-between">
// //         <h2 className="text-xl font-semibold">Vehículos</h2>
// //         <div className="flex items-center gap-2">
// //           <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar…" className="border rounded p-2" />
// //           <button onClick={load} className="px-3 py-2 border rounded">Buscar</button>
// //           <Link to="/vehicles/new" className="px-3 py-2 bg-blue-600 text-white rounded">Nuevo</Link>
// //         </div>
// //       </header>

// //       <div className="bg-white border rounded-xl shadow overflow-hidden">
// //         <div className="px-4 py-2 border-b bg-slate-50 rounded-t-xl font-medium">Listado</div>
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full text-sm">
// //             <thead className="bg-slate-100">
// //               <tr>
// //                 <th className="text-left px-3 py-2">Placa</th>
// //                 <th className="text-left px-3 py-2">Código</th>
// //                 <th className="text-left px-3 py-2">Sucursal</th>
// //                 <th className="text-left px-3 py-2">Tipo</th>
// //                 <th className="text-left px-3 py-2">Marca/Modelo</th>
// //                 <th className="text-left px-3 py-2">Año</th>
// //                 <th className="text-left px-3 py-2">Estado</th>
// //                 <th className="text-left px-3 py-2">Acciones</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {rows.map(v=>(
// //                 <tr key={v._id} className="border-t">
// //                   <td className="px-3 py-2">{v.plate}</td>
// //                   <td className="px-3 py-2">{v.internalCode}</td>
// //                   <td className="px-3 py-2">
// //                     {v.branch?.code ? `${v.branch.code} — ${v.branch.name}` : (v.branch?.name || '—')}
// //                   </td>
// //                   <td className="px-3 py-2">{v.type}</td>
// //                   <td className="px-3 py-2">{v.brand} {v.model}</td>
// //                   <td className="px-3 py-2">{v.year ?? '—'}</td>
// //                   <td className="px-3 py-2">{v.status}</td>
// //                   <td className="px-3 py-2">
// //                     <Link to={`/vehicles/${v._id}`} className="text-blue-600 hover:underline">Editar</Link>
// //                   </td>
// //                 </tr>
// //               ))}
// //               {!rows.length && (
// //                 <tr><td className="px-3 py-4 text-slate-500" colSpan={8}>{loading ? 'Cargando…' : 'Sin registros'}</td></tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }





// // import { useEffect, useState } from 'react';
// // export default function VehiclesList(){
// //   const [items,setItems]=useState([]),[page,setPage]=useState(1),[limit,setLimit]=useState(10),
// //         [pages,setPages]=useState(1),[q,setQ]=useState('');
// //   async function fetchList(){
// //     const params=new URLSearchParams({page,limit,q});
// //     const res=await fetch(`/api/v1/vehicles?${params}`,{credentials:'include'});
// //     const data=await res.json();
// //     setItems(data.items||[]); setPages(data.pages||1);
// //   }
// //   useEffect(()=>{fetchList();},[page,limit,q]);

// //   return(
// //   <div className="space-y-4">
// //     <div className="flex items-center justify-between">
// //       <h1 className="text-xl font-semibold">Vehículos</h1>
// //       <div className="flex gap-2">
// //         <input className="border rounded px-3 py-1.5" placeholder="Buscar..." value={q} onChange={e=>{setQ(e.target.value);setPage(1);}}/>
// //         <a href="/vehicles/new" className="px-3 py-2 bg-blue-600 text-white rounded">Nuevo</a>
// //       </div>
// //     </div>

// //     <div className="bg-white border rounded">
// //       <table className="w-full text-sm">
// //         <thead className="bg-gray-50"><tr>
// //           <th className="px-3 py-2 text-left">Patente</th>
// //           <th className="px-3 py-2 text-left">Código interno</th>
// //           <th className="px-3 py-2 text-left">Tipo</th>
// //           <th className="px-3 py-2 text-left">Sucursal</th>
// //         </tr></thead>
// //         <tbody>
// //           {items.length?items.map(v=>(
// //             <tr key={v._id} className="hover:bg-gray-50">
// //               <td className="px-3 py-2">{v.plate}</td>
// //               <td className="px-3 py-2">{v.internalCode||'-'}</td>
// //               <td className="px-3 py-2">{v.type||'-'}</td>
// //               <td className="px-3 py-2">{v.branch||'-'}</td>
// //             </tr>
// //           )):<tr><td colSpan={4} className="text-center py-6 text-gray-500">Sin resultados</td></tr>}
// //         </tbody>
// //       </table>
// //       <div className="flex justify-between p-3">
// //         <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="border px-3 py-1.5 rounded">Anterior</button>
// //         <span>Página {page} de {pages}</span>
// //         <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="border px-3 py-1.5 rounded">Siguiente</button>
// //         <select value={limit} onChange={e=>{setLimit(+e.target.value);setPage(1);}} className="border rounded px-2 py-1">
// //           <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
// //         </select>
// //       </div>
// //     </div>
// //   </div>);
// // }


// // ///**** */
// // // front/src/pages/Vehicles/List.jsx
// // // -----------------------------------------------------------------------------
// // // Lista de Vehículos (paginada + botón Nuevo).
// // // - Usa VehiclesAPI.list (Axios con baseURL VITE_API_URL).
// // // - Botón "Nuevo" navega a /vehicles/new (no al dashboard).
// // // -----------------------------------------------------------------------------

// // import { useEffect, useState } from 'react'
// // import { useNavigate } from 'react-router-dom'
// // import { VehiclesAPI } from '../../api/vehicles.api'

// // export default function VehiclesList() {
// //   const navigate = useNavigate()
// //   const [items, setItems] = useState([])
// //   const [page, setPage] = useState(1)
// //   const [limit, setLimit] = useState(10)
// //   const [q, setQ] = useState('')
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState('')

// //   async function load() {
// //     setLoading(true)
// //     setError('')
// //     try {
// //       const { data } = await VehiclesAPI.list({ page, limit, q })
// //       // admite tus dos formatos: {items,total} ó {data: {...}}
// //       const payload = data?.items ? data : data?.data ? data.data : data
// //       setItems(payload.items || payload.data || [])
// //       // si tu API entrega pages/total, puedes almacenarlos aquí para el paginador
// //     } catch (err) {
// //       // Si alguna vez el backend devolviera HTML, evitamos el crash de JSON
// //       const msg = err?.response?.data?.message || err?.message || 'Error al cargar vehículos'
// //       setError(msg)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   useEffect(() => { load() /*eslint-disable-next-line*/ }, [page, limit])

// //   return (
// //     <div className="max-w-6xl mx-auto">
// //       <div className="flex items-center justify-between mb-4">
// //         <h2 className="text-xl font-semibold">Vehículos</h2>
// //         <div className="flex items-center gap-2">
// //           <input
// //             value={q}
// //             onChange={e=>setQ(e.target.value)}
// //             onKeyDown={e=>{ if (e.key==='Enter') load() }}
// //             placeholder="Buscar por placa, código…"
// //             className="border rounded px-2 py-1"
// //           />
// //           <button onClick={load} className="px-3 py-2 border rounded">Buscar</button>
// //           <button
// //             onClick={() => navigate('/vehicles/new')}
// //             className="px-3 py-2 bg-blue-600 text-white rounded"
// //           >
// //             Nuevo
// //           </button>
// //         </div>
// //       </div>

// //       {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm mb-3">{error}</div>}
// //       {loading && <div className="px-3 py-2 bg-slate-50 rounded text-sm mb-3">Cargando…</div>}

// //       <div className="overflow-x-auto border rounded">
// //         <table className="min-w-full text-sm">
// //           <thead className="bg-slate-50">
// //             <tr>
// //               <th className="text-left p-2 border-b">Placa</th>
// //               <th className="text-left p-2 border-b">Código interno</th>
// //               <th className="text-left p-2 border-b">Tipo</th>
// //               <th className="text-left p-2 border-b">Marca</th>
// //               <th className="text-left p-2 border-b">Modelo</th>
// //               <th className="text-left p-2 border-b">Sucursal</th>
// //               <th className="text-right p-2 border-b">Acciones</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {items.length === 0 && (
// //               <tr><td colSpan={7} className="p-3 text-center text-slate-500">Sin resultados</td></tr>
// //             )}
// //             {items.map(v => (
// //               <tr key={v._id} className="odd:bg-white even:bg-slate-50">
// //                 <td className="p-2">{v.plate}</td>
// //                 <td className="p-2">{v.internalCode}</td>
// //                 <td className="p-2">{v.type}</td>
// //                 <td className="p-2">{v.brand}</td>
// //                 <td className="p-2">{v.model}</td>
// //                 <td className="p-2">{v.branch?.name || '-'}</td>
// //                 <td className="p-2 text-right">
// //                   <button
// //                     onClick={() => navigate(`/vehicles/${v._id}`)}
// //                     className="px-2 py-1 text-blue-600 hover:underline"
// //                   >
// //                     Editar
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Paginador mínimo */}
// //       <div className="flex items-center justify-end gap-2 mt-3">
// //         <select value={limit} onChange={e=>setLimit(Number(e.target.value))} className="border rounded px-2 py-1">
// //           {[10,20,50].map(n => <option key={n} value={n}>{n}/pág</option>)}
// //         </select>
// //         <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
// //         <span className="text-sm">Página {page}</span>
// //         <button onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded">Next</button>
// //       </div>
// //     </div>
// //   )
// // }



// //// ACTUALIZACION 20/10/2025 //////

// // // front/src/pages/Vehicles/List.jsx
// // // -----------------------------------------------------------------------------
// // // Listado de Vehículos
// // // - Búsqueda por q
// // // - Filtro por Sucursal
// // // - Paginación
// // // - Status con ETIQUETA (desde catálogo VEHICLE_STATUSES)
// // // - Indicador "(REEMPLAZO)" en rojo y negrita junto a internalCode si support.active === true
// // // - Acciones: Ver/Editar (ajusta las rutas si usas otras)
// // // -----------------------------------------------------------------------------
// // import { useEffect, useMemo, useState } from 'react';
// // import { Link, useNavigate } from 'react-router-dom';
// // import { api } from '../../services/http';

// // function naturalSortBranches(list){
// //   return [...list].sort((a,b)=>{
// //     const an = Number(a.code); const bn = Number(b.code);
// //     const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn);
// //     if (aIsNum && bIsNum) return an - bn;
// //     if (aIsNum) return -1;
// //     if (bIsNum) return 1;
// //     return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true });
// //   });
// // }

// // export default function VehiclesList() {
// //   const navigate = useNavigate();

// //   // Catálogos
// //   const [statuses, setStatuses] = useState([]); // [{code,label}]
// //   const statusMap = useMemo(() => {
// //     const m = new Map();
// //     (statuses || []).forEach(s => m.set(String(s.code).toUpperCase(), s.label || s.code));
// //     return m;
// //   }, [statuses]);

// //   // Sucursales
// //   const [branches, setBranches] = useState([]);

// //   // Tabla
// //   const [items, setItems] = useState([]);
// //   const [page, setPage] = useState(1);
// //   const [limit, setLimit] = useState(10);
// //   const [total, setTotal] = useState(0);

// //   // Filtros
// //   const [q, setQ] = useState('');
// //   const [branch, setBranch] = useState('');

// //   const pages = Math.max(Math.ceil(total / limit), 1);

// //   // Catálogo de estados
// //   useEffect(() => {
// //     api.get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
// //       .then(({ data }) => {
// //         const items = data?.items || [];
// //         setStatuses(items.map(it => ({ code: it.code, label: it.label })));
// //       })
// //       .catch(() => setStatuses([]));
// //   }, []);

// //   // Sucursales
// //   useEffect(() => {
// //     api.get('/api/v1/branches', { params: { page: 1, limit: 500 } })
// //       .then(({ data }) => {
// //         const payload = data?.items || data?.data?.items || data?.data || data?.list || [];
// //         setBranches(naturalSortBranches(payload));
// //       })
// //       .catch(() => setBranches([]));
// //   }, []);

// //   // Cargar tabla
// //   const load = async (_page = page, _limit = limit, _q = q, _branch = branch) => {
// //     const { data } = await api.get('/api/v1/vehicles', {
// //       params: { page: _page, limit: _limit, q: _q || undefined, branch: _branch || undefined }
// //     });
// //     const list = data?.items || data?.data?.items || data?.data || data?.list || [];
// //     setItems(list);
// //     setTotal(data?.total ?? list.length);
// //     setPage(data?.page ?? _page);
// //     setLimit(data?.limit ?? _limit);
// //   };

// //   useEffect(() => { load().catch(()=>{}); /* eslint-disable-next-line */ }, []);

// //   const applyFilters = () => load(1, limit, q, branch);
// //   const clearFilters = () => { setQ(''); setBranch(''); load(1, limit, '', ''); };

// //   return (
// //     <div className="max-w-6xl mx-auto">
// //       <header className="flex items-center justify-between mb-4">
// //         <h2 className="text-xl font-semibold">Vehículos</h2>
// //         <div className="flex gap-2">
// //           <button
// //             onClick={() => navigate('/vehicles/new')}
// //             className="px-3 py-2 bg-blue-600 text-white rounded"
// //           >
// //             Nuevo vehículo
// //           </button>
// //         </div>
// //       </header>

// //       {/* Filtros */}
// //       <div className="bg-white border rounded-xl shadow p-4 mb-4">
// //         <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
// //           <div className="sm:col-span-2">
// //             <label className="block text-sm font-medium text-slate-600 mb-1">Buscar</label>
// //             <input
// //               value={q}
// //               onChange={(e)=>setQ(e.target.value)}
// //               placeholder="Placa, código, marca, modelo..."
// //               className="w-full border p-2 rounded"
// //             />
// //           </div>

// //           <div className="sm:col-span-2">
// //             <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
// //             <select
// //               value={branch}
// //               onChange={(e)=>setBranch(e.target.value)}
// //               className="w-full border p-2 rounded bg-white"
// //             >
// //               <option value="">Todas</option>
// //               {branches.map(b => (
// //                 <option key={b._id} value={b._id}>
// //                   {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //         </div>

// //         <div className="mt-3 flex gap-2">
// //           <button onClick={applyFilters} className="px-3 py-2 bg-slate-800 text-white rounded">Aplicar</button>
// //           <button onClick={clearFilters} className="px-3 py-2 border rounded">Limpiar</button>
// //         </div>
// //       </div>

// //       {/* Tabla */}
// //       <div className="bg-white border rounded-xl shadow overflow-x-auto">
// //         <table className="min-w-full text-sm">
// //           <thead className="bg-slate-50 text-slate-600">
// //             <tr>
// //               <th className="text-left px-3 py-2">Código</th>
// //               <th className="text-left px-3 py-2">Placa</th>
// //               <th className="text-left px-3 py-2">Sucursal</th>
// //               <th className="text-left px-3 py-2">Estado</th>
// //               <th className="text-left px-3 py-2">Marca/Modelo</th>
// //               <th className="text-left px-3 py-2 w-28">Acciones</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {items.length === 0 && (
// //               <tr>
// //                 <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
// //                   No hay vehículos para mostrar.
// //                 </td>
// //               </tr>
// //             )}
// //             {items.map(v => {
// //               const label = statusMap.get(String(v.status || '').toUpperCase()) || (v.status || '');
// //               const isSupport = v.support?.active === true;
// //               return (
// //                 <tr key={v._id} className="border-t">
// //                   <td className="px-3 py-2 whitespace-nowrap">
// //                     <span className="font-medium">{v.internalCode}</span>{' '}
// //                     {isSupport && (
// //                       <span className="text-red-600 font-bold">(REEMPLAZO)</span>
// //                     )}
// //                   </td>
// //                   <td className="px-3 py-2">{v.plate}</td>
// //                   <td className="px-3 py-2">
// //                     {v.branch?.code ? `${v.branch.code} — ${v.branch.name}` : (v.branch?.name || '—')}
// //                   </td>
// //                   <td className="px-3 py-2">
// //                     <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border text-slate-700">
// //                       {label}
// //                     </span>
// //                   </td>
// //                   <td className="px-3 py-2">
// //                     <div className="text-slate-700">{v.brand} {v.model}</div>
// //                     <div className="text-slate-400">{v.year || '—'}</div>
// //                   </td>
// //                   <td className="px-3 py-2">
// //                     <div className="flex gap-2">
// //                       <Link to={`/vehicles/${v._id}`} className="text-blue-600 hover:underline">Ver</Link>
// //                       <Link to={`/vehicles/${v._id}/edit`} className="text-slate-700 hover:underline">Editar</Link>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               );
// //             })}
// //           </tbody>
// //         </table>

// //         {/* Paginación */}
// //         <div className="px-3 py-2 border-t flex items-center justify-between">
// //           <div className="text-sm text-slate-600">
// //             Página {page} de {pages} — {total} registros
// //           </div>
// //           <div className="flex items-center gap-2">
// //             <button
// //               className="px-2 py-1 border rounded disabled:opacity-40"
// //               onClick={() => { const np = Math.max(page-1, 1); setPage(np); load(np, limit, q, branch); }}
// //               disabled={page <= 1}
// //             >
// //               ‹ Anterior
// //             </button>
// //             <select
// //               value={limit}
// //               onChange={(e)=>{ const nl = parseInt(e.target.value,10)||10; setLimit(nl); load(1, nl, q, branch); }}
// //               className="border rounded px-2 py-1"
// //             >
// //               {[10,20,50,100].map(n => <option key={n} value={n}>{n}/pág</option>)}
// //             </select>
// //             <button
// //               className="px-2 py-1 border rounded disabled:opacity-40"
// //               onClick={() => { const np = Math.min(page+1, pages); setPage(np); load(np, limit, q, branch); }}
// //               disabled={page >= pages}
// //             >
// //               Siguiente ›
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // front/src/pages/Vehicles/List.jsx
// // -----------------------------------------------------------------------------
// // Listado de Vehículos
// // - Búsqueda por q
// // - Filtro por Sucursal
// // - Paginación
// // - Status con ETIQUETA (desde catálogo VEHICLE_STATUSES)
// // - Indicador "(REEMPLAZO)" en rojo y negrita junto a internalCode si support.active === true
// // - Acciones: Ver/Editar (ajusta las rutas si usas otras)
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

//   // Catálogos
//   const [statuses, setStatuses] = useState([]); // [{code,label}]
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
//     setItems(list);
//     setTotal(data?.total ?? list.length);
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
//               placeholder="Placa, código, marca, modelo..."
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
//               const isSupport = v.support?.active === true;
//               return (
//                 <tr key={v._id} className="border-t">
//                   <td className="px-3 py-2 whitespace-nowrap">
//                     <span className="font-medium">{v.internalCode}</span>{' '}
//                     {isSupport && (
//                       <span className="text-red-600 font-bold">(REEMPLAZO)</span>
//                     )}
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
//                       <Link to={`/vehicles/${v._id}/edit`} className="text-slate-700 hover:underline">Editar</Link>
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


// //// actualizacion 22/10/2025 13:30

// front/src/pages/Vehicles/List.jsx
// -----------------------------------------------------------------------------
// Listado de Vehículos
// - Búsqueda por q
// - Filtro por Sucursal
// - Paginación
// - Orden: compañía (branch.code) → código (internalCode)
// - Estado: etiqueta desde catálogo VEHICLE_STATUSES
// - Reemplazo: muestra (siglaOriginal) si support.active
// - Acciones Ver / Editar (rutas estándar)
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/http';

function naturalSortBranches(list){
  return [...list].sort((a,b)=>{
    const an = Number(a.code); const bn = Number(b.code);
    const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn);
    if (aIsNum && bIsNum) return an - bn;
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true });
  });
}

export default function VehiclesList() {
  const navigate = useNavigate();

  // Catálogo de estados (code → label)
  const [statuses, setStatuses] = useState([]);
  const statusMap = useMemo(() => {
    const m = new Map();
    (statuses || []).forEach(s => m.set(String(s.code).toUpperCase(), s.label || s.code));
    return m;
  }, [statuses]);

  // Sucursales
  const [branches, setBranches] = useState([]);

  // Tabla
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Filtros
  const [q, setQ] = useState('');
  const [branch, setBranch] = useState('');

  const pages = Math.max(Math.ceil(total / limit), 1);

  // Catálogo de estados
  useEffect(() => {
    api.get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
      .then(({ data }) => {
        const items = data?.items || [];
        setStatuses(items.map(it => ({ code: it.code, label: it.label })));
      })
      .catch(() => setStatuses([]));
  }, []);

  // Sucursales
  useEffect(() => {
    api.get('/api/v1/branches', { params: { page: 1, limit: 500 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || data?.list || [];
        setBranches(naturalSortBranches(payload));
      })
      .catch(() => setBranches([]));
  }, []);

  // Cargar tabla
  const load = async (_page = page, _limit = limit, _q = q, _branch = branch) => {
    const { data } = await api.get('/api/v1/vehicles', {
      params: { page: _page, limit: _limit, q: _q || undefined, branch: _branch || undefined }
    });
    const list = data?.items || data?.data?.items || data?.data || data?.list || [];

    // Orden en front por si el back en tu entorno no aplica sort por poblados
    const sorted = list.slice().sort((a,b)=>{
      const aComp = (a.branch?.code || '').toString();
      const bComp = (b.branch?.code || '').toString();
      if (aComp !== bComp) return aComp.localeCompare(bComp, 'es', { numeric: true });
      return (a.internalCode || '').localeCompare(b.internalCode || '', 'es', { numeric: true });
    });

    setItems(sorted);
    setTotal(data?.total ?? sorted.length);
    setPage(data?.page ?? _page);
    setLimit(data?.limit ?? _limit);
  };

  useEffect(() => { load().catch(()=>{}); /* eslint-disable-next-line */ }, []);

  const applyFilters = () => load(1, limit, q, branch);
  const clearFilters = () => { setQ(''); setBranch(''); load(1, limit, '', ''); };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Vehículos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/vehicles/new')}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Nuevo vehículo
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white border rounded-xl shadow p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Buscar</label>
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Placa, código, marca, modelo o sigla original..."
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
            <select
              value={branch}
              onChange={(e)=>setBranch(e.target.value)}
              className="w-full border p-2 rounded bg-white"
            >
              <option value="">Todas</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>
                  {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={applyFilters} className="px-3 py-2 bg-slate-800 text-white rounded">Aplicar</button>
          <button onClick={clearFilters} className="px-3 py-2 border rounded">Limpiar</button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Código</th>
              <th className="text-left px-3 py-2">Placa</th>
              <th className="text-left px-3 py-2">Sucursal</th>
              <th className="text-left px-3 py-2">Estado</th>
              <th className="text-left px-3 py-2">Marca/Modelo</th>
              <th className="text-left px-3 py-2 w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                  No hay vehículos para mostrar.
                </td>
              </tr>
            )}
            {items.map(v => {
              const label = statusMap.get(String(v.status || '').toUpperCase()) || (v.status || '');
              const original = v.support?.active && v.support?.originalInternalCode ? `(${v.support.originalInternalCode})` : '';
              return (
                <tr key={v._id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="font-medium">{v.internalCode}</span>{' '}
                    {original && <span className="text-red-600 font-bold">{original}</span>}
                  </td>
                  <td className="px-3 py-2">{v.plate}</td>
                  <td className="px-3 py-2">
                    {v.branch?.code ? `${v.branch.code} — ${v.branch.name}` : (v.branch?.name || '—')}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border text-slate-700">
                      {label}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-slate-700">{v.brand} {v.model}</div>
                    <div className="text-slate-400">{v.year || '—'}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Link to={`/vehicles/${v._id}`} className="text-blue-600 hover:underline">Ver</Link>
                      <Link to={`/vehicles/${v._id}/edit`} className="text-amber-600 hover:underline">Editar</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="px-3 py-2 border-t flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Página {page} de {pages} — {total} registros
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 border rounded disabled:opacity-40"
              onClick={() => { const np = Math.max(page-1, 1); setPage(np); load(np, limit, q, branch); }}
              disabled={page <= 1}
            >
              ‹ Anterior
            </button>
            <select
              value={limit}
              onChange={(e)=>{ const nl = parseInt(e.target.value,10)||10; setLimit(nl); load(1, nl, q, branch); }}
              className="border rounded px-2 py-1"
            >
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}/pág</option>)}
            </select>
            <button
              className="px-2 py-1 border rounded disabled:opacity-40"
              onClick={() => { const np = Math.min(page+1, pages); setPage(np); load(np, limit, q, branch); }}
              disabled={page >= pages}
            >
              Siguiente ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
