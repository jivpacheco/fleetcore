// // front/src/pages/Config/Catalogs/VehicleStatuses.jsx
// // -----------------------------------------------------------------------------
// // Catálogo: Estados de Vehículo (VEHICLE_STATUSES)
// // - Muestra columnas: Orden, Código, Nombre, Activo, Acciones.
// // - Evita errores al estar vacío (no muestra "Recurso no encontrado").
// // - Permite agregar (POST) y eliminar (DELETE) correctamente.
// // - Orden visual por `order` y luego `label`.
// // -----------------------------------------------------------------------------

// import { useEffect, useState } from 'react';
// import { api } from '../../../services/http';

// const KEY = 'VEHICLE_STATUSES';

// export default function VehicleStatusesCatalog() {
//   const [items, setItems] = useState([]);
//   const [form, setForm] = useState({ order: 0, code: '', label: '', active: true });
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState('');

//   function update(k, v) {
//     setForm((f) => ({ ...f, [k]: typeof v === 'string' ? v.toUpperCase() : v }));
//   }

//   async function load() {
//     setLoading(true);
//     setErr('');
//     try {
//       const { data } = await api.get('/api/v1/catalogs', { params: { key: KEY, limit: 200 } });
//       const list = data?.items || [];
//       list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label));
//       setItems(list);
//     } catch (_) {
//       // Catálogo vacío o error: no mostramos 404 al usuario
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { load(); }, []);

//   async function addItem(e) {
//     e.preventDefault();
//     setErr('');
//     try {
//       const payload = {
//         key: KEY,
//         order: Number(form.order) || 0,
//         code: (form.code || '').toUpperCase(),
//         label: (form.label || '').toUpperCase(),
//         active: !!form.active,
//       };
//       if (!payload.label) throw new Error('El nombre (label) es obligatorio.');
//       await api.post('/api/v1/catalogs', payload);
//       setForm({ order: 0, code: '', label: '', active: true });
//       await load();
//     } catch (e) {
//       setErr(e?.response?.data?.message || e.message || 'No se pudo crear');
//     }
//   }

//   async function remove(id) {
//     if (!confirm('¿Eliminar estado?')) return;
//     setErr('');
//     try {
//       await api.delete(`/api/v1/catalogs/${id}`);
//       await load();
//     } catch (e) {
//       setErr(e?.response?.data?.message || 'No se pudo eliminar');
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto space-y-4">
//       <header>
//         <h2 className="text-xl font-semibold">Catálogo: Estados de Vehículo</h2>
//         <p className="text-sm text-slate-500">Define opciones como ACTIVO, EN REPARACIÓN, FUERA DE SERVICIO, etc.</p>
//       </header>

//       {err && <div className="px-3 py-2 bg-red-50 text-red-700 rounded">{err}</div>}

//       <form onSubmit={addItem} className="bg-white border rounded-xl shadow">
//         <div className="px-4 py-3 border-b rounded-t-xl bg-slate-50">
//           <h3 className="font-medium">Agregar estado</h3>
//         </div>
//         <div className="p-4 grid grid-cols-1 sm:grid-cols-6 gap-3">
//           <div>
//             <label className="block text-sm mb-1 text-slate-600">Orden</label>
//             <input
//               type="number"
//               className="w-full border rounded p-2"
//               value={form.order}
//               onChange={(e) => update('order', e.target.value)}
//               placeholder="0"
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <label className="block text-sm mb-1 text-slate-600">Código (opcional)</label>
//             <input
//               className="w-full border rounded p-2"
//               placeholder="ACTIVE"
//               value={form.code}
//               onChange={(e) => update('code', e.target.value)}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <label className="block text-sm mb-1 text-slate-600">Nombre (label)</label>
//             <input
//               className="w-full border rounded p-2"
//               placeholder="ACTIVO"
//               required
//               value={form.label}
//               onChange={(e) => update('label', e.target.value)}
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <input
//               id="active"
//               type="checkbox"
//               checked={!!form.active}
//               onChange={(e) => update('active', e.target.checked)}
//             />
//             <label htmlFor="active">Activo</label>
//           </div>
//         </div>
//         <div className="p-4 border-t flex justify-end">
//           <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">
//             Agregar
//           </button>
//         </div>
//       </form>

//       <div className="bg-white border rounded-xl shadow overflow-hidden">
//         <div className="px-4 py-2 border-b bg-slate-50 rounded-t-xl font-medium">Listado</div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-slate-100">
//               <tr>
//                 <th className="text-left px-3 py-2">Orden</th>
//                 <th className="text-left px-3 py-2">Código</th>
//                 <th className="text-left px-3 py-2">Nombre</th>
//                 <th className="text-left px-3 py-2">Activo</th>
//                 <th className="text-left px-3 py-2">Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((it) => (
//                 <tr key={it._id} className="border-t">
//                   <td className="px-3 py-2">{it.order ?? 0}</td>
//                   <td className="px-3 py-2">{it.code || '—'}</td>
//                   <td className="px-3 py-2">{it.label}</td>
//                   <td className="px-3 py-2">{it.active ? 'Sí' : 'No'}</td>
//                   <td className="px-3 py-2">
//                     <button onClick={() => remove(it._id)} className="text-red-600 hover:underline">
//                       Eliminar
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {!items.length && (
//                 <tr>
//                   <td className="px-3 py-4 text-slate-500" colSpan={5}>
//                     {loading ? 'Cargando…' : 'Sin registros'}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// //********************************************** */

// //v2 12012026

// // front/src/pages/Config/Catalogs/VehicleStatuses.jsx
// // -----------------------------------------------------------------------------
// // Catálogo: Estados de Vehículo
// // - "Orden" ya no aparece en el form (se autocalcula como items.length+1).
// // - "Código (opcional)" = clave técnica (BD). "Nombre (label)" = lo visible.
// // - Maneja vacío sin error (404/200 → lista vacía).
// // -----------------------------------------------------------------------------
// import { useEffect, useState } from 'react';
// import { api } from '../../../services/http';

// const KEY = 'VEHICLE_STATUSES';

// export default function VehicleStatusesCatalog() {
//   const [items, setItems] = useState([]);
//   const [form, setForm] = useState({ code: '', label: '', active: true });
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState('');

//   async function load() {
//     setLoading(true);
//     setErr('');
//     try {
//       const { data } = await api.get('/api/v1/catalogs', { params: { key: KEY, limit: 500 } });
//       const list = data?.items || data?.data || [];
//       list.sort((a,b)=> (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label));
//       setItems(list);
//     } catch (e) {
//       // Si el back devolviera 404, tratamos como vacío
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(()=>{ load(); }, []);

//   function update(k, v) {
//     setForm(f => ({ ...f, [k]: typeof v === 'string' ? v.toUpperCase() : v }));
//   }

//   async function addItem(e) {
//     e.preventDefault();
//     setErr('');
//     try {
//       const nextOrder = (items?.length || 0) + 1;
//       const payload = {
//         key: KEY,
//         code: form.code?.trim() || '',
//         label: form.label?.trim(),
//         active: !!form.active,
//         order: nextOrder,
//       };
//       if (!payload.label) throw new Error('El nombre (label) es obligatorio.');
//       await api.post('/api/v1/catalogs', payload);
//       setForm({ code: '', label: '', active: true });
//       await load();
//     } catch (e) {
//       setErr(e?.response?.data?.message || e.message || 'Error creando catálogo');
//     }
//   }

//   async function remove(id) {
//     if (!confirm('¿Eliminar estado?')) return;
//     setErr('');
//     try {
//       await api.delete(`/api/v1/catalogs/${id}`);
//       await load();
//     } catch (e) {
//       setErr(e?.response?.data?.message || 'No se pudo eliminar');
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto space-y-4">
//       <header>
//         <h2 className="text-xl font-semibold">Catálogo: Estados de Vehículo</h2>
//         <p className="text-sm text-slate-500">
//           “Código” es la clave técnica (BD). “Nombre (label)” es lo que verá el usuario.
//         </p>
//       </header>

//       {err && <div className="px-3 py-2 bg-red-50 text-red-700 rounded">{err}</div>}

//       <form onSubmit={addItem} className="bg-white border rounded-xl shadow">
//         <div className="px-4 py-3 border-b rounded-t-xl bg-slate-50">
//           <h3 className="font-medium">Agregar estado</h3>
//         </div>
//         <div className="p-4 grid grid-cols-1 sm:grid-cols-6 gap-3">
//           <div className="sm:col-span-2">
//             <label className="block text-sm mb-1 text-slate-600">Código (opcional)</label>
//             <input className="w-full border rounded p-2"
//               placeholder="ACTIVE"
//               value={form.code} onChange={e=>update('code', e.target.value)} />
//           </div>
//           <div className="sm:col-span-3">
//             <label className="block text-sm mb-1 text-slate-600">Nombre (label)</label>
//             <input className="w-full border rounded p-2"
//               placeholder="ACTIVO"
//               required
//               value={form.label} onChange={e=>update('label', e.target.value)} />
//           </div>
//           <div className="flex items-center gap-2">
//             <input id="active" type="checkbox" checked={!!form.active}
//               onChange={e=>update('active', e.target.checked)} />
//             <label htmlFor="active">Activo</label>
//           </div>
//         </div>
//         <div className="p-4 border-t flex justify-end">
//           <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Agregar</button>
//         </div>
//       </form>

//       <div className="bg-white border rounded-xl shadow overflow-hidden">
//         <div className="px-4 py-2 border-b bg-slate-50 rounded-t-xl font-medium">Listado</div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-slate-100">
//               <tr>
//                 <th className="text-left px-3 py-2">Orden</th>
//                 <th className="text-left px-3 py-2">Código</th>
//                 <th className="text-left px-3 py-2">Nombre</th>
//                 <th className="text-left px-3 py-2">Activo</th>
//                 <th className="text-left px-3 py-2">Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map(it=>(
//                 <tr key={it._id} className="border-t">
//                   <td className="px-3 py-2">{it.order ?? 0}</td>
//                   <td className="px-3 py-2">{it.code || '—'}</td>
//                   <td className="px-3 py-2">{it.label}</td>
//                   <td className="px-3 py-2">{it.active ? 'Sí' : 'No'}</td>
//                   <td className="px-3 py-2">
//                     <button onClick={()=>remove(it._id)} className="text-red-600 hover:underline">Eliminar</button>
//                   </td>
//                 </tr>
//               ))}
//               {!items.length && (
//                 <tr><td className="px-3 py-4 text-slate-500" colSpan={5}>{loading ? 'Cargando…' : 'Sin registros'}</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from 'react'
import { api } from '../../../services/http'

const KEY = 'VEHICLE_STATUSES'

function extractItems(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.result?.items)) return data.result.items
  if (Array.isArray(data.data?.items)) return data.data.items
  return []
}

export default function VehicleStatusesCatalog() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({ order: 0, code: '', label: '', active: true })
  const [editingId, setEditingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/v1/catalogs', { params: { key: KEY, limit: 500 } })
      const list = extractItems(data)
      const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.label || '').localeCompare(String(b.label || ''), undefined, { numeric: true }))
      setItems(sorted)
    } catch (err) {
      console.error(err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const reset = () => {
    setForm({ order: 0, code: '', label: '', active: true })
    setEditingId(null)
  }

  const normalizeUpper = (v) => (v || '').toString().toUpperCase()

  const onSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      key: KEY,
      order: Number(form.order) || 0,
      code: (form.code || '').trim() ? normalizeUpper(form.code.trim()) : '',
      label: normalizeUpper((form.label || '').trim()),
      active: form.active !== false,
    }
    if (!payload.label) return alert('Nombre (label) es obligatorio')

    try {
      if (editingId) {
        // PATCH: requiere endpoint /api/v1/catalogs/:id
        await api.patch(`/api/v1/catalogs/${editingId}`, payload)
      } else {
        await api.post('/api/v1/catalogs', payload)
      }
      await load()
      reset()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'No fue posible guardar')
    }
  }

  const onEdit = (it) => {
    setEditingId(it._id)
    setForm({
      order: Number(it.order) || 0,
      code: it.code || '',
      label: it.label || '',
      active: it.active !== false,
    })
  }

  const onDelete = async (id) => {
    const ok = window.confirm('¿Eliminar estado de vehículo?')
    if (!ok) return
    try {
      await api.delete(`/api/v1/catalogs/${id}`)
      await load()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'No fue posible eliminar')
    }
  }

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return items
    return items.filter(it => `${it.order ?? ''} ${it.code || ''} ${it.label || ''}`.toLowerCase().includes(qq))
  }, [items, q])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Catálogo: Estados de Vehículo</h1>
        <p className="text-sm text-gray-600">
          Define estados operacionales (p. ej., ACTIVO, EN REPARACIÓN, FUERA DE SERVICIO). “Código” es la clave técnica.
        </p>
      </div>

      <form onSubmit={onSubmit} className="border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="number"
          className="border rounded px-3 py-2"
          placeholder="Orden"
          value={form.order}
          onChange={(e) => setForm(s => ({ ...s, order: e.target.value }))}
        />

        <input
          className="border rounded px-3 py-2"
          placeholder="Código (opcional)"
          value={form.code}
          onChange={(e) => setForm(s => ({ ...s, code: e.target.value }))}
        />

        <input
          className="border rounded px-3 py-2 md:col-span-2"
          placeholder="Nombre (label) *"
          value={form.label}
          onChange={(e) => setForm(s => ({ ...s, label: e.target.value }))}
        />

        <label className="flex items-center gap-2 text-sm md:col-span-4">
          <input
            type="checkbox"
            checked={form.active !== false}
            onChange={(e) => setForm(s => ({ ...s, active: e.target.checked }))}
          />
          Activo
        </label>

        <div className="md:col-span-4 flex gap-2">
          <button type="submit" className="px-3 py-2 rounded bg-black text-white">
            {editingId ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" className="px-3 py-2 rounded border" onClick={reset}>
            Limpiar
          </button>
          <button type="button" className="px-3 py-2 rounded border" onClick={load} disabled={loading}>
            Recargar
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        <input
          className="border rounded px-3 py-2 w-full md:w-96"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Orden</th>
              <th className="text-left p-2">Código</th>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Activo</th>
              <th className="text-left p-2 w-48">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(it => (
              <tr key={it._id} className="border-t">
                <td className="p-2">{it.order ?? 0}</td>
                <td className="p-2">{it.code || '—'}</td>
                <td className="p-2">{it.label || '—'}</td>
                <td className="p-2">{it.active === false ? 'No' : 'Sí'}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => onEdit(it)}>Editar</button>
                  <button className="px-2 py-1 border rounded" onClick={() => onDelete(it._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td className="p-3 text-gray-500" colSpan="5">{loading ? 'Cargando…' : 'Sin registros'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

