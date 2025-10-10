// import { useEffect, useState } from 'react';
// export default function VehiclesList(){
//   const [items,setItems]=useState([]),[page,setPage]=useState(1),[limit,setLimit]=useState(10),
//         [pages,setPages]=useState(1),[q,setQ]=useState('');
//   async function fetchList(){
//     const params=new URLSearchParams({page,limit,q});
//     const res=await fetch(`/api/v1/vehicles?${params}`,{credentials:'include'});
//     const data=await res.json();
//     setItems(data.items||[]); setPages(data.pages||1);
//   }
//   useEffect(()=>{fetchList();},[page,limit,q]);

//   return(
//   <div className="space-y-4">
//     <div className="flex items-center justify-between">
//       <h1 className="text-xl font-semibold">Vehículos</h1>
//       <div className="flex gap-2">
//         <input className="border rounded px-3 py-1.5" placeholder="Buscar..." value={q} onChange={e=>{setQ(e.target.value);setPage(1);}}/>
//         <a href="/vehicles/new" className="px-3 py-2 bg-blue-600 text-white rounded">Nuevo</a>
//       </div>
//     </div>

//     <div className="bg-white border rounded">
//       <table className="w-full text-sm">
//         <thead className="bg-gray-50"><tr>
//           <th className="px-3 py-2 text-left">Patente</th>
//           <th className="px-3 py-2 text-left">Código interno</th>
//           <th className="px-3 py-2 text-left">Tipo</th>
//           <th className="px-3 py-2 text-left">Sucursal</th>
//         </tr></thead>
//         <tbody>
//           {items.length?items.map(v=>(
//             <tr key={v._id} className="hover:bg-gray-50">
//               <td className="px-3 py-2">{v.plate}</td>
//               <td className="px-3 py-2">{v.internalCode||'-'}</td>
//               <td className="px-3 py-2">{v.type||'-'}</td>
//               <td className="px-3 py-2">{v.branch||'-'}</td>
//             </tr>
//           )):<tr><td colSpan={4} className="text-center py-6 text-gray-500">Sin resultados</td></tr>}
//         </tbody>
//       </table>
//       <div className="flex justify-between p-3">
//         <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="border px-3 py-1.5 rounded">Anterior</button>
//         <span>Página {page} de {pages}</span>
//         <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="border px-3 py-1.5 rounded">Siguiente</button>
//         <select value={limit} onChange={e=>{setLimit(+e.target.value);setPage(1);}} className="border rounded px-2 py-1">
//           <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
//         </select>
//       </div>
//     </div>
//   </div>);
// }
// front/src/pages/Vehicles/List.jsx
// -----------------------------------------------------------------------------
// Lista de Vehículos (paginada + botón Nuevo).
// - Usa VehiclesAPI.list (Axios con baseURL VITE_API_URL).
// - Botón "Nuevo" navega a /vehicles/new (no al dashboard).
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VehiclesAPI } from '../../api/vehicles.api'

export default function VehiclesList() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await VehiclesAPI.list({ page, limit, q })
      // admite tus dos formatos: {items,total} ó {data: {...}}
      const payload = data?.items ? data : data?.data ? data.data : data
      setItems(payload.items || payload.data || [])
      // si tu API entrega pages/total, puedes almacenarlos aquí para el paginador
    } catch (err) {
      // Si alguna vez el backend devolviera HTML, evitamos el crash de JSON
      const msg = err?.response?.data?.message || err?.message || 'Error al cargar vehículos'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /*eslint-disable-next-line*/ }, [page, limit])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Vehículos</h2>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if (e.key==='Enter') load() }}
            placeholder="Buscar por placa, código…"
            className="border rounded px-2 py-1"
          />
          <button onClick={load} className="px-3 py-2 border rounded">Buscar</button>
          <button
            onClick={() => navigate('/vehicles/new')}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Nuevo
          </button>
        </div>
      </div>

      {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm mb-3">{error}</div>}
      {loading && <div className="px-3 py-2 bg-slate-50 rounded text-sm mb-3">Cargando…</div>}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 border-b">Placa</th>
              <th className="text-left p-2 border-b">Código interno</th>
              <th className="text-left p-2 border-b">Tipo</th>
              <th className="text-left p-2 border-b">Marca</th>
              <th className="text-left p-2 border-b">Modelo</th>
              <th className="text-left p-2 border-b">Sucursal</th>
              <th className="text-right p-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7} className="p-3 text-center text-slate-500">Sin resultados</td></tr>
            )}
            {items.map(v => (
              <tr key={v._id} className="odd:bg-white even:bg-slate-50">
                <td className="p-2">{v.plate}</td>
                <td className="p-2">{v.internalCode}</td>
                <td className="p-2">{v.type}</td>
                <td className="p-2">{v.brand}</td>
                <td className="p-2">{v.model}</td>
                <td className="p-2">{v.branch?.name || '-'}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => navigate(`/vehicles/${v._id}`)}
                    className="px-2 py-1 text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginador mínimo */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <select value={limit} onChange={e=>setLimit(Number(e.target.value))} className="border rounded px-2 py-1">
          {[10,20,50].map(n => <option key={n} value={n}>{n}/pág</option>)}
        </select>
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
        <span className="text-sm">Página {page}</span>
        <button onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded">Next</button>
      </div>
    </div>
  )
}
