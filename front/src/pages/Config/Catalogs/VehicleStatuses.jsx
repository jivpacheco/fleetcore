// import { useEffect, useState } from 'react'
// import { getCatalog, addCatalogItem, patchCatalogItem, removeCatalogItem } from '../../../api/catalogs.api'

// const KEY = 'vehicle_statuses' // en back se guarda uppercase

// export default function VehicleStatusesCatalog() {
//     const [items, setItems] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//     const [form, setForm] = useState({ code: '', label: '' })

//     async function load() {
//         setLoading(true); setError('')
//         try {
//             const data = await getCatalog(KEY)
//             setItems(data?.items || [])
//         } catch (e) {
//             setItems([]); setError('No se pudo cargar el catálogo')
//         } finally { setLoading(false) }
//     }
//     useEffect(() => { load() }, [])

//     async function handleAdd(e) {
//         e.preventDefault()
//         if (!form.code.trim() || !form.label.trim()) return
//         await addCatalogItem(KEY, { code: form.code, label: form.label })
//         setForm({ code: '', label: '' })
//         await load()
//     }

//     async function toggleActive(it) {
//         await patchCatalogItem(KEY, it._id, { active: !it.active })
//         await load()
//     }

//     async function del(it) {
//         if (!confirm('¿Eliminar estado?')) return
//         await removeCatalogItem(KEY, it._id)
//         await load()
//     }

//     return (
//         <div className="max-w-3xl space-y-4">
//             <header>
//                 <h1 className="text-xl font-semibold">Catálogo: Estados de Vehículo</h1>
//                 <p className="text-sm text-slate-500">Configura opciones como ACTIVE, SUPPORT, IN_REPAIR, etc.</p>
//             </header>

//             <form onSubmit={handleAdd} className="bg-white border rounded-xl p-4 flex gap-3 items-end">
//                 <div className="flex-1">
//                     <label className="block text-xs font-medium text-slate-600 mb-1">Código</label>
//                     <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
//                         className="w-full border rounded p-2" placeholder="ACTIVE" required />
//                 </div>
//                 <div className="flex-1">
//                     <label className="block text-xs font-medium text-slate-600 mb-1">Etiqueta</label>
//                     <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value.toUpperCase() }))}
//                         className="w-full border rounded p-2" placeholder="ACTIVO" required />
//                 </div>
//                 <button className="px-3 py-2 bg-blue-600 text-white rounded">Agregar</button>
//             </form>

//             <div className="bg-white border rounded-xl">
//                 <table className="w-full text-sm">
//                     <thead>
//                         <tr className="bg-slate-50 text-slate-600">
//                             <th className="text-left px-3 py-2">Código</th>
//                             <th className="text-left px-3 py-2">Etiqueta</th>
//                             <th className="px-3 py-2">Activo</th>
//                             <th className="px-3 py-2"></th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr><td className="px-3 py-3" colSpan={4}>Cargando…</td></tr>
//                         ) : items.length ? items.map(it => (
//                             <tr key={it._id} className="border-t">
//                                 <td className="px-3 py-2 font-mono">{it.code}</td>
//                                 <td className="px-3 py-2">{it.label}</td>
//                                 <td className="px-3 py-2">
//                                     <button onClick={() => toggleActive(it)} className={`px-2 py-1 rounded ${it.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
//                                         {it.active ? 'Sí' : 'No'}
//                                     </button>
//                                 </td>
//                                 <td className="px-3 py-2 text-right">
//                                     <button onClick={() => del(it)} className="px-2 py-1 text-red-600 hover:underline">Eliminar</button>
//                                 </td>
//                             </tr>
//                         )) : (
//                             <tr><td className="px-3 py-3" colSpan={4}>Sin datos</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {error && <div className="text-red-600 text-sm">{error}</div>}
//         </div>
//     )
// }


// front/src/pages/Config/Catalogs/VehicleStatuses.jsx
// -----------------------------------------------------------------------------
// Catálogo: Estados de Vehículo
// - Muestra columnas: Orden, Código, Nombre, Activo, Acciones.
// - Evita duplicados por key+label y key+code (el back ya lo garantiza).
// - Bordes superiores redondeados corregidos.
// -----------------------------------------------------------------------------
import { useEffect, useState } from 'react';
import { api } from '../../../services/http';

const KEY = 'VEHICLE_STATUSES';

export default function VehicleStatusesCatalog() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ order: 0, code: '', label: '', active: true });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.get('/api/v1/catalogs', { params: { key: KEY, limit: 200 } });
      const list = data?.items || data?.data || [];
      // Orden natural por order asc, luego label
      list.sort((a,b)=> (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label));
      setItems(list);
    } catch (e) {
      setErr(e?.response?.data?.message || 'No se pudo cargar el catálogo');
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); }, []);

  function update(k, v) {
    setForm(f => ({ ...f, [k]: typeof v === 'string' ? v.toUpperCase() : v }));
  }

  async function addItem(e) {
    e.preventDefault();
    setErr('');
    try {
      const payload = {
        key: KEY,
        order: Number(form.order) || 0,
        code: form.code?.trim() || '',   // opcional, pero si lo colocan se valida unicidad
        label: form.label?.trim(),
        active: Boolean(form.active),
      };
      if (!payload.label) throw new Error('El nombre (label) es obligatorio.');

      await api.post('/api/v1/catalogs', payload);
      setForm({ order: 0, code: '', label: '', active: true });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'No se pudo crear');
    }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar estado?')) return;
    setErr('');
    try {
      await api.delete(`/api/v1/catalogs/${id}`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || 'No se pudo eliminar');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Catálogo: Estados de Vehículo</h2>
        <p className="text-sm text-slate-500">Define opciones como ACTIVO, EN REPARACIÓN, FUERA DE SERVICIO, etc.</p>
      </header>

      {err && <div className="px-3 py-2 bg-red-50 text-red-700 rounded">{err}</div>}

      <form onSubmit={addItem} className="bg-white border rounded-xl shadow">
        <div className="px-4 py-3 border-b rounded-t-xl bg-slate-50">
          <h3 className="font-medium">Agregar estado</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm mb-1 text-slate-600">Orden</label>
            <input type="number" className="w-full border rounded p-2"
              value={form.order} onChange={e=>update('order', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1 text-slate-600">Código (opcional)</label>
            <input className="w-full border rounded p-2"
              placeholder="ACTIVE"
              value={form.code} onChange={e=>update('code', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1 text-slate-600">Nombre (label)</label>
            <input className="w-full border rounded p-2"
              placeholder="ACTIVO"
              required
              value={form.label} onChange={e=>update('label', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="active" type="checkbox" checked={!!form.active}
              onChange={e=>update('active', e.target.checked)} />
            <label htmlFor="active">Activo</label>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Agregar</button>
        </div>
      </form>

      <div className="bg-white border rounded-xl shadow overflow-hidden">
        <div className="px-4 py-2 border-b bg-slate-50 rounded-t-xl font-medium">Listado</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-3 py-2">Orden</th>
                <th className="text-left px-3 py-2">Código</th>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Activo</th>
                <th className="text-left px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it=>(
                <tr key={it._id} className="border-t">
                  <td className="px-3 py-2">{it.order ?? 0}</td>
                  <td className="px-3 py-2">{it.code || '—'}</td>
                  <td className="px-3 py-2">{it.label}</td>
                  <td className="px-3 py-2">{it.active ? 'Sí' : 'No'}</td>
                  <td className="px-3 py-2">
                    <button onClick={()=>remove(it._id)} className="text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td className="px-3 py-4 text-slate-500" colSpan={5}>Sin registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
