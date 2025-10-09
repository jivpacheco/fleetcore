import { useEffect, useState } from 'react';
export default function VehiclesList(){
  const [items,setItems]=useState([]),[page,setPage]=useState(1),[limit,setLimit]=useState(10),
        [pages,setPages]=useState(1),[q,setQ]=useState('');
  async function fetchList(){
    const params=new URLSearchParams({page,limit,q});
    const res=await fetch(`/api/v1/vehicles?${params}`,{credentials:'include'});
    const data=await res.json();
    setItems(data.items||[]); setPages(data.pages||1);
  }
  useEffect(()=>{fetchList();},[page,limit,q]);

  return(
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Vehículos</h1>
      <div className="flex gap-2">
        <input className="border rounded px-3 py-1.5" placeholder="Buscar..." value={q} onChange={e=>{setQ(e.target.value);setPage(1);}}/>
        <a href="/vehicles/new" className="px-3 py-2 bg-blue-600 text-white rounded">Nuevo</a>
      </div>
    </div>

    <div className="bg-white border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50"><tr>
          <th className="px-3 py-2 text-left">Patente</th>
          <th className="px-3 py-2 text-left">Código interno</th>
          <th className="px-3 py-2 text-left">Tipo</th>
          <th className="px-3 py-2 text-left">Sucursal</th>
        </tr></thead>
        <tbody>
          {items.length?items.map(v=>(
            <tr key={v._id} className="hover:bg-gray-50">
              <td className="px-3 py-2">{v.plate}</td>
              <td className="px-3 py-2">{v.internalCode||'-'}</td>
              <td className="px-3 py-2">{v.type||'-'}</td>
              <td className="px-3 py-2">{v.branch||'-'}</td>
            </tr>
          )):<tr><td colSpan={4} className="text-center py-6 text-gray-500">Sin resultados</td></tr>}
        </tbody>
      </table>
      <div className="flex justify-between p-3">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="border px-3 py-1.5 rounded">Anterior</button>
        <span>Página {page} de {pages}</span>
        <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="border px-3 py-1.5 rounded">Siguiente</button>
        <select value={limit} onChange={e=>{setLimit(+e.target.value);setPage(1);}} className="border rounded px-2 py-1">
          <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
        </select>
      </div>
    </div>
  </div>);
}
