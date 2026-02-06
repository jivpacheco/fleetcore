// // import { useEffect, useMemo, useState } from 'react'
// // import { api } from '../../../services/http'

// // const KEY = 'VEHICLE_STATUSES'

// // function extractItems(data) {
// //   if (!data) return []
// //   if (Array.isArray(data)) return data
// //   if (Array.isArray(data.items)) return data.items
// //   if (Array.isArray(data.result?.items)) return data.result.items
// //   if (Array.isArray(data.data?.items)) return data.data.items
// //   return []
// // }

// // export default function VehicleStatusesCatalog() {
// //   const [q, setQ] = useState('')
// //   const [items, setItems] = useState([])
// //   const [loading, setLoading] = useState(false)

// //   const [form, setForm] = useState({ order: 0, code: '', label: '', active: true })
// //   const [editingId, setEditingId] = useState(null)

// //   const load = async () => {
// //     setLoading(true)
// //     try {
// //       const { data } = await api.get('/api/v1/catalogs', { params: { key: KEY, limit: 500 } })
// //       const list = extractItems(data)
// //       const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.label || '').localeCompare(String(b.label || ''), undefined, { numeric: true }))
// //       setItems(sorted)
// //     } catch (err) {
// //       console.error(err)
// //       setItems([])
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   useEffect(() => { load() }, []) // eslint-disable-line

// //   const reset = () => {
// //     setForm({ order: 0, code: '', label: '', active: true })
// //     setEditingId(null)
// //   }

// //   const normalizeUpper = (v) => (v || '').toString().toUpperCase()

// //   const onSubmit = async (e) => {
// //     e.preventDefault()
// //     const payload = {
// //       key: KEY,
// //       order: Number(form.order) || 0,
// //       code: (form.code || '').trim() ? normalizeUpper(form.code.trim()) : '',
// //       label: normalizeUpper((form.label || '').trim()),
// //       active: form.active !== false,
// //     }
// //     if (!payload.label) return alert('Nombre (label) es obligatorio')

// //     try {
// //       if (editingId) {
// //         // PATCH: requiere endpoint /api/v1/catalogs/:id
// //         await api.patch(`/api/v1/catalogs/${editingId}`, payload)
// //       } else {
// //         await api.post('/api/v1/catalogs', payload)
// //       }
// //       await load()
// //       reset()
// //     } catch (err) {
// //       console.error(err)
// //       alert(err?.response?.data?.message || 'No fue posible guardar')
// //     }
// //   }

// //   const onEdit = (it) => {
// //     setEditingId(it._id)
// //     setForm({
// //       order: Number(it.order) || 0,
// //       code: it.code || '',
// //       label: it.label || '',
// //       active: it.active !== false,
// //     })
// //   }

// //   const onDelete = async (id) => {
// //     const ok = window.confirm('¿Eliminar estado de vehículo?')
// //     if (!ok) return
// //     try {
// //       await api.delete(`/api/v1/catalogs/${id}`)
// //       await load()
// //     } catch (err) {
// //       console.error(err)
// //       alert(err?.response?.data?.message || 'No fue posible eliminar')
// //     }
// //   }

// //   const filtered = useMemo(() => {
// //     const qq = q.trim().toLowerCase()
// //     if (!qq) return items
// //     return items.filter(it => `${it.order ?? ''} ${it.code || ''} ${it.label || ''}`.toLowerCase().includes(qq))
// //   }, [items, q])

// //   return (
// //     <div className="p-6 space-y-6">
// //       <div>
// //         <h1 className="text-xl font-bold">Catálogo: Estados de Vehículo</h1>
// //         <p className="text-sm text-gray-600">
// //           Define estados operacionales (p. ej., ACTIVO, EN REPARACIÓN, FUERA DE SERVICIO). “Código” es la clave técnica.
// //         </p>
// //       </div>

// //       <form onSubmit={onSubmit} className="border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
// //         <input
// //           type="number"
// //           className="border rounded px-3 py-2"
// //           placeholder="Orden"
// //           value={form.order}
// //           onChange={(e) => setForm(s => ({ ...s, order: e.target.value }))}
// //         />

// //         <input
// //           className="border rounded px-3 py-2"
// //           placeholder="Código (opcional)"
// //           value={form.code}
// //           onChange={(e) => setForm(s => ({ ...s, code: e.target.value }))}
// //         />

// //         <input
// //           className="border rounded px-3 py-2 md:col-span-2"
// //           placeholder="Nombre (label) *"
// //           value={form.label}
// //           onChange={(e) => setForm(s => ({ ...s, label: e.target.value }))}
// //         />

// //         <label className="flex items-center gap-2 text-sm md:col-span-4">
// //           <input
// //             type="checkbox"
// //             checked={form.active !== false}
// //             onChange={(e) => setForm(s => ({ ...s, active: e.target.checked }))}
// //           />
// //           Activo
// //         </label>

// //         <div className="md:col-span-4 flex gap-2">
// //           <button type="submit" className="px-3 py-2 rounded bg-black text-white">
// //             {editingId ? 'Actualizar' : 'Crear'}
// //           </button>
// //           <button type="button" className="px-3 py-2 rounded border" onClick={reset}>
// //             Limpiar
// //           </button>
// //           <button type="button" className="px-3 py-2 rounded border" onClick={load} disabled={loading}>
// //             Recargar
// //           </button>
// //         </div>
// //       </form>

// //       <div className="flex items-center gap-2">
// //         <input
// //           className="border rounded px-3 py-2 w-full md:w-96"
// //           placeholder="Buscar..."
// //           value={q}
// //           onChange={(e) => setQ(e.target.value)}
// //         />
// //       </div>

// //       <div className="border rounded overflow-hidden">
// //         <table className="w-full text-sm">
// //           <thead className="bg-gray-50">
// //             <tr>
// //               <th className="text-left p-2">Orden</th>
// //               <th className="text-left p-2">Código</th>
// //               <th className="text-left p-2">Nombre</th>
// //               <th className="text-left p-2">Activo</th>
// //               <th className="text-left p-2 w-48">Acciones</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {filtered.map(it => (
// //               <tr key={it._id} className="border-t">
// //                 <td className="p-2">{it.order ?? 0}</td>
// //                 <td className="p-2">{it.code || '—'}</td>
// //                 <td className="p-2">{it.label || '—'}</td>
// //                 <td className="p-2">{it.active === false ? 'No' : 'Sí'}</td>
// //                 <td className="p-2 flex gap-2">
// //                   <button className="px-2 py-1 border rounded" onClick={() => onEdit(it)}>Editar</button>
// //                   <button className="px-2 py-1 border rounded" onClick={() => onDelete(it._id)}>Eliminar</button>
// //                 </td>
// //               </tr>
// //             ))}
// //             {!filtered.length && (
// //               <tr><td className="p-3 text-gray-500" colSpan="5">{loading ? 'Cargando…' : 'Sin registros'}</td></tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   )
// // }

// // front/src/pages/Config/Catalogs/VehicleStatuses.jsx
// // -----------------------------------------------------------------------------
// // Catálogo: Estados de Vehículo (VEHICLE_STATUSES)
// // Revisión 2026-01-14 (alineado a requerimientos):
// // - Solo campos: Código (obligatorio/único) + Nombre/Label (obligatorio/único) + Activo
// // - Elimina "Orden" (no se usa) y elimina botón "Recargar"
// // - Ordena por Nombre (label)
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from "react";
// import { api } from "../../../services/http";

// const KEY = "VEHICLE_STATUSES";

// function extractItems(data) {
//   if (!data) return [];
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data.items)) return data.items;
//   if (Array.isArray(data.result?.items)) return data.result.items;
//   if (Array.isArray(data.data?.items)) return data.data.items;
//   return [];
// }

// export default function VehicleStatusesCatalog() {
//   const [q, setQ] = useState("");
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({ code: "", label: "", active: true });
//   const [editingId, setEditingId] = useState(null);

//   const normalizeUpper = (v) => (v || "").toString().trim().toUpperCase();

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get("/api/v1/catalogs", {
//         params: { key: KEY, limit: 500 },
//       });
//       const list = extractItems(data);
//       const sorted = [...list].sort((a, b) =>
//         String(a.label || "").localeCompare(String(b.label || ""), undefined, {
//           numeric: true,
//         })
//       );
//       setItems(sorted);
//     } catch (err) {
//       console.error(err);
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []); // eslint-disable-line

//   const reset = () => {
//     setForm({ code: "", label: "", active: true });
//     setEditingId(null);
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       key: KEY,
//       code: normalizeUpper(form.code),
//       label: normalizeUpper(form.label),
//       active: form.active !== false,
//     };

//     if (!payload.code) return alert("Código es obligatorio");
//     if (!payload.label) return alert("Nombre (label) es obligatorio");

//     // try {
//     //   if (editingId) await api.patch(`/api/v1/catalogs/${editingId}`, payload)
//     //   else await api.post('/api/v1/catalogs', payload)

//     //   await load()
//     //   reset()
//     // } catch (err) {
//     //   console.error(err)
//     //   alert(err?.response?.data?.message || 'No fue posible guardar')
//     // }

//     try {
//       if (editingId) {
//         await api.patch(`/api/v1/catalogs/${editingId}`, payload);
//         alert("Vehículo actualizado con éxito");
//       } else {
//         await api.post("/api/v1/catalogs", payload);
//         alert("Vehículo creado con éxito");
//       }

//       await load();
//       reset();
//     } catch (err) {
//       console.error(err);
//       alert(err?.response?.data?.message || "No fue posible guardar");
//     }
//   };

//   const onEdit = (it) => {
//     setEditingId(it._id);
//     setForm({
//       code: it.code || "",
//       label: it.label || "",
//       active: it.active !== false,
//     });
//   };

//   const onDelete = async (id) => {
//     const ok = window.confirm("¿Eliminar estado de vehículo?");
//     if (!ok) return;
//     try {
//       await api.delete(`/api/v1/catalogs/${id}`);
//       await load();
//     } catch (err) {
//       console.error(err);
//       alert(err?.response?.data?.message || "No fue posible eliminar");
//     }
//   };

//   const filtered = useMemo(() => {
//     const qq = q.trim().toLowerCase();
//     if (!qq) return items;
//     return items.filter((it) =>
//       `${it.code || ""} ${it.label || ""}`.toLowerCase().includes(qq)
//     );
//   }, [items, q]);

//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h1 className="text-xl font-bold">Catálogo: Estados de Vehículo</h1>
//         <p className="text-sm text-gray-600">
//           “Código” es la clave técnica (backend). “Nombre” es lo visible para el
//           usuario.
//         </p>
//       </div>

//       <form
//         onSubmit={onSubmit}
//         className="border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3 bg-white"
//       >
//         <input
//           className="border rounded px-3 py-2"
//           placeholder="Código *"
//           value={form.code}
//           onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
//         />

//         <input
//           className="border rounded px-3 py-2 md:col-span-3"
//           placeholder="Nombre (label) *"
//           value={form.label}
//           onChange={(e) => setForm((s) => ({ ...s, label: e.target.value }))}
//         />

//         <label className="flex items-center gap-2 text-sm md:col-span-4">
//           <input
//             type="checkbox"
//             checked={form.active !== false}
//             onChange={(e) =>
//               setForm((s) => ({ ...s, active: e.target.checked }))
//             }
//           />
//           Activo
//         </label>

//         <div className="md:col-span-4 flex gap-2">
//           <button
//             type="submit"
//             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white"
//           >
//             {editingId ? "Actualizar" : "Crear"}
//           </button>
//           <button
//             type="button"
//             className="px-3 py-2 rounded border"
//             onClick={reset}
//           >
//             Limpiar
//           </button>
//         </div>
//       </form>

//       <div className="flex items-center gap-2">
//         <input
//           className="border rounded px-3 py-2 w-full md:w-96"
//           placeholder="Buscar..."
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//         />
//       </div>

//       <div className="border rounded overflow-hidden bg-white">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="text-left p-2">Código</th>
//               <th className="text-left p-2">Nombre</th>
//               <th className="text-left p-2">Activo</th>
//               <th className="text-left p-2 w-48">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((it) => (
//               <tr key={it._id} className="border-t">
//                 <td className="p-2">{it.code || "—"}</td>
//                 <td className="p-2">{it.label || "—"}</td>
//                 <td className="p-2">{it.active === false ? "No" : "Sí"}</td>
//                 <td className="p-2 flex gap-2">
//                   <button
//                     className="px-2 py-1 border rounded"
//                     onClick={() => onEdit(it)}
//                   >
//                     Editar
//                   </button>
//                   <button
//                     className="px-2 py-1 border rounded"
//                     onClick={() => onDelete(it._id)}
//                   >
//                     Eliminar
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {!filtered.length && (
//               <tr>
//                 <td className="p-3 text-gray-500" colSpan="4">
//                   {loading ? "Cargando…" : "Sin registros"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
