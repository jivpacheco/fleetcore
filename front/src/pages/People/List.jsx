// // // // front/src/pages/People/List.jsx
// // // import { useEffect, useMemo, useState, useCallback } from "react";
// // // import { Link, useSearchParams } from "react-router-dom";
// // // import { PeopleAPI } from "../../api/people.api";
// // // import { PositionsAPI } from "../../api/positions.api";
// // // import { api, API_PREFIX } from "../../services/http";

// // // export default function PeopleList() {
// // //   const [sp, setSp] = useSearchParams();
// // //   const [q, setQ] = useState(() => sp.get("q") || "");
// // //   const [active, setActive] = useState("");
// // //   const [positionId, setPositionId] = useState("");
// // //   const [branchId, setBranchId] = useState("");

// // //   const [positions, setPositions] = useState([]);
// // //   const [branches, setBranches] = useState([]);

// // //   const [page, setPage] = useState(() => Number(sp.get("page") || 1));
// // //   const limit = 10;

// // //   const [items, setItems] = useState([]);
// // //   const [total, setTotal] = useState(0);
// // //   const [loading, setLoading] = useState(false);

// // //   const pages = useMemo(
// // //     () => Math.max(1, Math.ceil((total || 0) / limit)),
// // //     [total],
// // //   );

// // //   const loadRefs = useCallback(async () => {
// // //     // positions
// // //     try {
// // //       const { data } = await PositionsAPI.list({ limit: 200, active: "true" });
// // //       setPositions(data.items || []);
// // //     } catch {
// // //       setPositions([]);
// // //     }

// // //     // branches
// // //     try {
// // //       const { data } = await api.get(`${API_PREFIX}/branches`, {
// // //         params: { page: 1, limit: 200 },
// // //       });
// // //       setBranches(data.items || []);
// // //     } catch {
// // //       setBranches([]);
// // //     }
// // //   }, []);

// // //   // const load = useCallback(async () => {
// // //   //   setLoading(true);
// // //   //   try {
// // //   //     const { data } = await PeopleAPI.list({
// // //   //       page,
// // //   //       limit,
// // //   //       q,
// // //   //       branchId,
// // //   //       positionId,
// // //   //       active,
// // //   //     });
// // //   //     setItems(data.items || []);
// // //   //     setTotal(data.total || 0);
// // //   //   } finally {
// // //   //     setLoading(false);
// // //   //   }
// // //   // }, [page, limit, q, branchId, positionId, active]);

// // //   const load = useCallback(async () => {
// // //     setLoading(true);
// // //     try {
// // //       const { data } = await PeopleAPI.list({
// // //         page,
// // //         limit,
// // //         q,
// // //         branchId,
// // //         positionId,
// // //         active,
// // //       });

// // //       // const newItems = data.items || [];
// // //       const newItems = Array.isArray(data.items)
// // //         ? data.items
// // //         : Array.isArray(data.data)
// // //           ? data.data
// // //           : [];



// // //       const newTotal = data.total || 0;

// // //       setItems(newItems);
// // //       setTotal(newTotal);

// // //       // FIX: si hay resultados pero esta página quedó vacía, volver a página 1
// // //       if (newTotal > 0 && newItems.length === 0 && page > 1) {
// // //         setPage(1);
// // //         setSp((prev) => {
// // //           const next = new URLSearchParams(prev);
// // //           next.set("page", "1");
// // //           return next;
// // //         });
// // //       }
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [page, limit, q, branchId, positionId, active, setSp]);

// // //   //cargar referencias
// // //   useEffect(() => {
// // //     loadRefs();
// // //   }, [loadRefs]);

// // //   // SYNC URL params -> state
// // //   useEffect(() => {
// // //     const qUrl = sp.get("q") || "";
// // //     const pageUrl = Number(sp.get("page") || 1);

// // //     if (qUrl !== q) setQ(qUrl);
// // //     if (pageUrl !== page) setPage(pageUrl);
// // //   }, [sp]);

// // //   //caRrgar datos
// // //   useEffect(() => {
// // //     load();
// // //   }, [page, load]);




// // //   const onSearch = (e) => {
// // //     e.preventDefault();

// // //     // Persistir filtros en la URL para navegación/refresh (incluye q)
// // //     setSp((prev) => {
// // //       const next = new URLSearchParams(prev);
// // //       // Siempre volver a página 1 al buscar
// // //       next.set("page", "1");
// // //       if (q) next.set("q", q);
// // //       else next.delete("q");
// // //       // Nota: si quieres persistir branch/position/active en URL, se puede agregar aquí.
// // //       return next;
// // //     });

// // //     if (page === 1) load();
// // //     else setPage(1); // el effect disparará load() al cambiar page
// // //   };

// // //   const onClear = () => {
// // //     setQ("");
// // //     setActive("");
// // //     setPositionId("");
// // //     setBranchId("");

// // //     setSp((prev) => {
// // //       const next = new URLSearchParams(prev);
// // //       next.delete("q");
// // //       next.set("page", "1");
// // //       return next;
// // //     });

// // //     // limpiar y recargar desde pág 1
// // //     if (page === 1) {
// // //       setTimeout(() => load(), 0);
// // //     } else {
// // //       setPage(1);
// // //     }
// // //   };

// // //   const onDelete = async (id) => {
// // //     const ok = window.confirm("¿Eliminar persona?");
// // //     if (!ok) return;

// // //     try {
// // //       await PeopleAPI.remove(id);

// // //       // Si borraste el último elemento de la página y hay páginas previas, retrocede.
// // //       if (page > 1 && items.length === 1) {
// // //         setPage((p) => Math.max(1, p - 1));
// // //         return; // load se dispara por effect
// // //       }

// // //       // Si no, recarga la misma página
// // //       await load();
// // //     } catch (err) {
// // //       console.error(err);
// // //       alert("No fue posible eliminar");
// // //     }
// // //   };

// // //   return (
// // //     <div className="p-6 space-y-6">
// // //       <div className="flex items-start justify-between gap-4">
// // //         <div>
// // //           <h1 className="text-xl font-bold">RRHH — Personas</h1>
// // //           <p className="text-sm text-gray-600">
// // //             Listado y gestión de personas.
// // //           </p>
// // //         </div>
// // //         <Link
// // //           className="rounded-md text-white px-4 py-2"
// // //           style={{ background: "var(--fc-primary)" }}
// // //           to="/people/new"
// // //         >
// // //           Nueva persona
// // //         </Link>
// // //       </div>

// // //       <form
// // //         onSubmit={onSearch}
// // //         className="border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
// // //       >
// // //         <input
// // //           className="border rounded px-3 py-2 md:col-span-2"
// // //           placeholder="Buscar (DNI, nombre, email)..."
// // //           value={q}
// // //           onChange={(e) => setQ(e.target.value)}
// // //         />

// // //         <select
// // //           className="border rounded px-3 py-2"
// // //           value={branchId}
// // //           onChange={(e) => setBranchId(e.target.value)}
// // //         >
// // //           <option value="">Sucursal (todas)</option>
// // //           {branches.map((b) => (
// // //             <option key={b._id} value={b._id}>
// // //               {b.code} — {b.name}
// // //             </option>
// // //           ))}
// // //         </select>

// // //         <select
// // //           className="border rounded px-3 py-2"
// // //           value={positionId}
// // //           onChange={(e) => setPositionId(e.target.value)}
// // //         >
// // //           <option value="">Cargo (todos)</option>
// // //           {positions.map((p) => (
// // //             <option key={p._id} value={p._id}>
// // //               {p.name}
// // //             </option>
// // //           ))}
// // //         </select>

// // //         <select
// // //           className="border rounded px-3 py-2"
// // //           value={active}
// // //           onChange={(e) => setActive(e.target.value)}
// // //         >
// // //           <option value="">Activo (todos)</option>
// // //           <option value="true">Sí</option>
// // //           <option value="false">No</option>
// // //         </select>

// // //         <div className="md:col-span-5 flex gap-2">
// // //           <button
// // //             type="submit"
// // //             className="px-3 py-2 rounded-md text-white disabled:opacity-50"
// // //             style={{ background: "var(--fc-primary)" }}
// // //             disabled={loading}
// // //           >
// // //             Buscar
// // //           </button>
// // //           <button
// // //             type="button"
// // //             className="px-3 py-2 rounded-md border border-gray-400"
// // //             onClick={onClear}
// // //             disabled={loading}
// // //           >
// // //             Limpiar
// // //           </button>
// // //         </div>
// // //       </form>

// // //       <div className="border rounded overflow-hidden">
// // //         <table className="w-full text-sm">
// // //           <thead className="bg-gray-50">
// // //             <tr>
// // //               <th className="text-left p-2">RUN</th>
// // //               <th className="text-left p-2">Nombre</th>
// // //               <th className="text-left p-2">Cargo</th>
// // //               <th className="text-left p-2">Sucursal</th>
// // //               <th className="text-left p-2">Conductor</th>
// // //               <th className="text-left p-2">Activo</th>
// // //               <th className="text-left p-2 w-56">Acciones</th>
// // //             </tr>
// // //           </thead>
// // //           <tbody>
// // //             {items.map((it) => (
// // //               <tr key={it._id} className="border-t">
// // //                 <td className="p-2">{it.dni}</td>
// // //                 <td className="p-2">
// // //                   {it.lastName} {it.firstName}
// // //                 </td>
// // //                 <td className="p-2">{it.positionId?.name || "—"}</td>
// // //                 <td className="p-2">{it.branchId?.name || "—"}</td>
// // //                 <td className="p-2">
// // //                   {(() => {
// // //                     const flag =
// // //                       it?.drivingAuthorization?.authorized ??
// // //                       it?.authorizedDriver ??
// // //                       it?.isAuthorizedDriver;
// // //                     if (flag === true) return "Sí";
// // //                     if (flag === false) return "No";
// // //                     return "—";
// // //                   })()}
// // //                 </td>
// // //                 <td className="p-2">{it.active === false ? "No" : "Sí"}</td>
// // //                 <td className="p-2 flex gap-2">
// // //                   <Link
// // //                     className="px-2 py-1 border rounded"
// // //                     to={`/people/${it._id}?mode=view`}
// // //                   >
// // //                     Ver
// // //                   </Link>

// // //                   <Link
// // //                     className="px-2 py-1 border rounded"
// // //                     to={`/people/${it._id}`}
// // //                   >
// // //                     Editar
// // //                   </Link>

// // //                   <button
// // //                     className="px-2 py-1 border rounded"
// // //                     type="button"
// // //                     onClick={() => onDelete(it._id)}
// // //                   >
// // //                     Eliminar
// // //                   </button>
// // //                   {/* <Link
// // //                     className="px-2 py-1 border rounded"
// // //                     to={`/people/${it._id}`}
// // //                   >
// // //                     Ver / Editar
// // //                   </Link>
// // //                   <button
// // //                     className="px-2 py-1 border rounded"
// // //                     type="button"
// // //                     onClick={() => onDelete(it._id)}
// // //                   >
// // //                     Eliminar
// // //                   </button> */}
// // //                 </td>
// // //               </tr>
// // //             ))}
// // //             {!items.length && !loading && (
// // //               <tr>
// // //                 <td className="p-3 text-gray-500" colSpan="7">
// // //                   Sin registros
// // //                 </td>
// // //               </tr>
// // //             )}
// // //             {loading && (
// // //               <tr>
// // //                 <td className="p-3 text-gray-500" colSpan="7">
// // //                   Cargando…
// // //                 </td>
// // //               </tr>
// // //             )}
// // //           </tbody>
// // //         </table>
// // //       </div>

// // //       <div className="flex items-center justify-between">
// // //         <div className="text-sm text-gray-600">Total: {total}</div>
// // //         <div className="flex items-center gap-2">
// // //           <button
// // //             className="px-2 py-1 border rounded disabled:opacity-50"
// // //             type="button"
// // //             disabled={page <= 1}
// // //             onClick={() => {
// // //               const nextP = Math.max(1, page - 1);
// // //               setPage(nextP);
// // //               setSp((prev) => {
// // //                 const n = new URLSearchParams(prev);
// // //                 n.set("page", String(nextP));
// // //                 return n;
// // //               });
// // //             }}
// // //           >
// // //             Anterior
// // //           </button>
// // //           <div className="text-sm">
// // //             Página {page} / {pages}
// // //           </div>
// // //           <button
// // //             className="px-2 py-1 border rounded disabled:opacity-50"
// // //             type="button"
// // //             disabled={page >= pages}
// // //             onClick={() => {
// // //               const nextP = Math.min(pages, page + 1);
// // //               setPage(nextP);
// // //               setSp((prev) => {
// // //                 const n = new URLSearchParams(prev);
// // //                 n.set("page", String(nextP));
// // //                 return n;
// // //               });
// // //             }}
// // //           >
// // //             Siguiente
// // //           </button>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // //03022026
// // // front/src/pages/People/List.jsx
// // import { useEffect, useMemo, useState, useCallback } from "react";
// // import { Link, useSearchParams } from "react-router-dom";
// // import { PeopleAPI } from "../../api/people.api";
// // import { PositionsAPI } from "../../api/positions.api";
// // import { api, API_PREFIX } from "../../services/http";

// // export default function PeopleList() {
// //   const [sp, setSp] = useSearchParams();
// //   const [q, setQ] = useState(() => sp.get("q") || "");
// //   const [active, setActive] = useState("");
// //   const [positionId, setPositionId] = useState("");
// //   const [branchId, setBranchId] = useState("");

// //   const [positions, setPositions] = useState([]);
// //   const [branches, setBranches] = useState([]);

// //   const [page, setPage] = useState(() => Number(sp.get("page") || 1));
// //   const limit = 10;

// //   const [items, setItems] = useState([]);
// //   const [total, setTotal] = useState(0);
// //   const [loading, setLoading] = useState(false);

// //   const pages = useMemo(
// //     () => Math.max(1, Math.ceil((total || 0) / limit)),
// //     [total],
// //   );

// //   const loadRefs = useCallback(async () => {
// //     // positions
// //     try {
// //       const { data } = await PositionsAPI.list({ limit: 200, active: "true" });
// //       setPositions(data.items || []);
// //     } catch {
// //       setPositions([]);
// //     }

// //     // branches
// //     try {
// //       const { data } = await api.get(`${API_PREFIX}/branches`, {
// //         params: { page: 1, limit: 200 },
// //       });
// //       setBranches(data.items || []);
// //     } catch {
// //       setBranches([]);
// //     }
// //   }, []);

// //   // const load = useCallback(async () => {
// //   //   setLoading(true);
// //   //   try {
// //   //     const { data } = await PeopleAPI.list({
// //   //       page,
// //   //       limit,
// //   //       q,
// //   //       branchId,
// //   //       positionId,
// //   //       active,
// //   //     });
// //   //     setItems(data.items || []);
// //   //     setTotal(data.total || 0);
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // }, [page, limit, q, branchId, positionId, active]);

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const { data } = await PeopleAPI.list({
// //         page,
// //         limit,
// //         q,
// //         branchId,
// //         positionId,
// //         active,
// //       });

// //       // const newItems = data.items || [];
// //       const newItems = Array.isArray(data.items)
// //         ? data.items
// //         : Array.isArray(data.data)
// //           ? data.data
// //           : [];



// //       const newTotal = data.total || 0;

// //       setItems(newItems);
// //       setTotal(newTotal);

// //       // FIX: si hay resultados pero esta página quedó vacía, volver a página 1
// //       if (newTotal > 0 && newItems.length === 0 && page > 1) {
// //         setPage(1);
// //         setSp((prev) => {
// //           const next = new URLSearchParams(prev);
// //           next.set("page", "1");
// //           return next;
// //         });
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [page, limit, q, branchId, positionId, active, setSp]);

// //   //cargar referencias
// //   useEffect(() => {
// //     loadRefs();
// //   }, [loadRefs]);

// //   // SYNC URL params -> state
// //   useEffect(() => {
// //     const qUrl = sp.get("q") || "";
// //     const pageUrl = Number(sp.get("page") || 1);

// //     if (qUrl !== q) setQ(qUrl);
// //     if (pageUrl !== page) setPage(pageUrl);
// //   }, [sp]);

// //   //caRrgar datos
// //   useEffect(() => {
// //     load();
// //   }, [page, load]);




// //   const onSearch = (e) => {
// //     e.preventDefault();

// //     // Persistir filtros en la URL para navegación/refresh (incluye q)
// //     setSp((prev) => {
// //       const next = new URLSearchParams(prev);
// //       // Siempre volver a página 1 al buscar
// //       next.set("page", "1");
// //       if (q) next.set("q", q);
// //       else next.delete("q");
// //       // Nota: si quieres persistir branch/position/active en URL, se puede agregar aquí.
// //       return next;
// //     });

// //     if (page === 1) load();
// //     else setPage(1); // el effect disparará load() al cambiar page
// //   };

// //   const onClear = () => {
// //     setQ("");
// //     setActive("");
// //     setPositionId("");
// //     setBranchId("");

// //     setSp((prev) => {
// //       const next = new URLSearchParams(prev);
// //       next.delete("q");
// //       next.set("page", "1");
// //       return next;
// //     });

// //     // limpiar y recargar desde pág 1
// //     if (page === 1) {
// //       setTimeout(() => load(), 0);
// //     } else {
// //       setPage(1);
// //     }
// //   };

// //   const onDelete = async (id) => {
// //     const ok = window.confirm("¿Eliminar persona?");
// //     if (!ok) return;

// //     try {
// //       await PeopleAPI.remove(id);

// //       // Si borraste el último elemento de la página y hay páginas previas, retrocede.
// //       if (page > 1 && items.length === 1) {
// //         setPage((p) => Math.max(1, p - 1));
// //         return; // load se dispara por effect
// //       }

// //       // Si no, recarga la misma página
// //       await load();
// //     } catch (err) {
// //       console.error(err);
// //       alert("No fue posible eliminar");
// //     }
// //   };

// //   return (
// //     <div className="p-4 md:p-6 space-y-6">
// //       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
// //         <div>
// //           <h1 className="text-xl font-bold">RRHH — Personas</h1>
// //           <p className="text-sm text-gray-600">
// //             Listado y gestión de personas.
// //           </p>
// //         </div>
// //         <Link
// //           className="rounded-lg text-white px-4 py-2 w-full sm:w-auto text-center"
// //           style={{ background: "var(--fc-primary)" }}
// //           to="/people/new"
// //         >
// //           Nueva persona
// //         </Link>
// //       </div>

// //       <form
// //         onSubmit={onSearch}
// //         className="border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
// //       >
// //         <input
// //           className="border rounded px-3 py-2 md:col-span-2"
// //           placeholder="Buscar (DNI, nombre, email)..."
// //           value={q}
// //           onChange={(e) => setQ(e.target.value)}
// //         />

// //         <select
// //           className="border rounded px-3 py-2"
// //           value={branchId}
// //           onChange={(e) => setBranchId(e.target.value)}
// //         >
// //           <option value="">Sucursal (todas)</option>
// //           {branches.map((b) => (
// //             <option key={b._id} value={b._id}>
// //               {b.code} — {b.name}
// //             </option>
// //           ))}
// //         </select>

// //         <select
// //           className="border rounded px-3 py-2"
// //           value={positionId}
// //           onChange={(e) => setPositionId(e.target.value)}
// //         >
// //           <option value="">Cargo (todos)</option>
// //           {positions.map((p) => (
// //             <option key={p._id} value={p._id}>
// //               {p.name}
// //             </option>
// //           ))}
// //         </select>

// //         <select
// //           className="border rounded px-3 py-2"
// //           value={active}
// //           onChange={(e) => setActive(e.target.value)}
// //         >
// //           <option value="">Activo (todos)</option>
// //           <option value="true">Sí</option>
// //           <option value="false">No</option>
// //         </select>

// //         <div className="md:col-span-5 grid grid-cols-2 gap-2 md:flex md:gap-2">
// //           <button
// //             type="submit"
// //             className="px-3 py-2 rounded-md text-white disabled:opacity-50 w-full md:w-auto"
// //             style={{ background: "var(--fc-primary)" }}
// //             disabled={loading}
// //           >
// //             Buscar
// //           </button>
// //           <button
// //             type="button"
// //             className="px-3 py-2 rounded-md border border-gray-400 w-full md:w-auto"
// //             onClick={onClear}
// //             disabled={loading}
// //           >
// //             Limpiar
// //           </button>
// //         </div>
// //       </form>

// //       <div className="border rounded-xl overflow-hidden bg-white">
// //         <div className="overflow-x-auto">
// //           <table className="min-w-[900px] w-full text-sm">
// //             <thead className="bg-gray-50">
// //             <tr>
// //               <th className="text-left p-2">RUN</th>
// //               <th className="text-left p-2">Nombre</th>
// //               <th className="text-left p-2">Cargo</th>
// //               <th className="text-left p-2">Sucursal</th>
// //               <th className="text-left p-2">Conductor</th>
// //               <th className="text-left p-2">Activo</th>
// //               <th className="text-left p-2 w-56">Acciones</th>
// //             </tr>
// //             </thead>
// //             <tbody>
// //             {items.map((it) => (
// //               <tr key={it._id} className="border-t">
// //                 <td className="p-2">{it.dni}</td>
// //                 <td className="p-2">
// //                   {it.lastName} {it.firstName}
// //                 </td>
// //                 <td className="p-2">{it.positionId?.name || "—"}</td>
// //                 <td className="p-2">{it.branchId?.name || "—"}</td>
// //                 <td className="p-2">
// //                   {(() => {
// //                     const flag =
// //                       it?.drivingAuthorization?.authorized ??
// //                       it?.authorizedDriver ??
// //                       it?.isAuthorizedDriver;
// //                     if (flag === true) return "Sí";
// //                     if (flag === false) return "No";
// //                     return "—";
// //                   })()}
// //                 </td>
// //                 <td className="p-2">{it.active === false ? "No" : "Sí"}</td>
// //                 <td className="p-2 flex gap-2">
// //                   <Link
// //                     className="px-2 py-1 border rounded"
// //                     to={`/people/${it._id}?mode=view`}
// //                   >
// //                     Ver
// //                   </Link>

// //                   <Link
// //                     className="px-2 py-1 border rounded"
// //                     to={`/people/${it._id}`}
// //                   >
// //                     Editar
// //                   </Link>

// //                   <button
// //                     className="px-2 py-1 border rounded"
// //                     type="button"
// //                     onClick={() => onDelete(it._id)}
// //                   >
// //                     Eliminar
// //                   </button>
// //                   {/* <Link
// //                     className="px-2 py-1 border rounded"
// //                     to={`/people/${it._id}`}
// //                   >
// //                     Ver / Editar
// //                   </Link>
// //                   <button
// //                     className="px-2 py-1 border rounded"
// //                     type="button"
// //                     onClick={() => onDelete(it._id)}
// //                   >
// //                     Eliminar
// //                   </button> */}
// //                 </td>
// //               </tr>
// //             ))}
// //             {!items.length && !loading && (
// //               <tr>
// //                 <td className="p-3 text-gray-500" colSpan="7">
// //                   Sin registros
// //                 </td>
// //               </tr>
// //             )}
// //             {loading && (
// //               <tr>
// //                 <td className="p-3 text-gray-500" colSpan="7">
// //                   Cargando…
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //         </div>
// //       </div>

// //       <div className="flex items-center justify-between">
// //         <div className="text-sm text-gray-600">Total: {total}</div>
// //         <div className="flex items-center gap-2">
// //           <button
// //             className="px-2 py-1 border rounded disabled:opacity-50"
// //             type="button"
// //             disabled={page <= 1}
// //             onClick={() => {
// //               const nextP = Math.max(1, page - 1);
// //               setPage(nextP);
// //               setSp((prev) => {
// //                 const n = new URLSearchParams(prev);
// //                 n.set("page", String(nextP));
// //                 return n;
// //               });
// //             }}
// //           >
// //             Anterior
// //           </button>
// //           <div className="text-sm">
// //             Página {page} / {pages}
// //           </div>
// //           <button
// //             className="px-2 py-1 border rounded disabled:opacity-50"
// //             type="button"
// //             disabled={page >= pages}
// //             onClick={() => {
// //               const nextP = Math.min(pages, page + 1);
// //               setPage(nextP);
// //               setSp((prev) => {
// //                 const n = new URLSearchParams(prev);
// //                 n.set("page", String(nextP));
// //                 return n;
// //               });
// //             }}
// //           >
// //             Siguiente
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// //190226

// // front/src/pages/People/List.jsx
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { Link, useSearchParams } from "react-router-dom";
// import { PeopleAPI } from "../../api/people.api";
// import { PositionsAPI } from "../../api/positions.api";
// import { api, API_PREFIX } from "../../services/http";

// export default function PeopleList() {
//   const [sp, setSp] = useSearchParams();

//   // -----------------------------
//   // Draft filters (UI)
//   // -----------------------------
//   const [q, setQ] = useState(() => sp.get("q") || "");
//   const [active, setActive] = useState("");       // draft
//   const [positionId, setPositionId] = useState(""); // draft
//   const [branchId, setBranchId] = useState("");     // draft

//   // -----------------------------
//   // Applied filters (API)
//   // (solo cambian al presionar Buscar / Limpiar)
//   // -----------------------------
//   const [applied, setApplied] = useState(() => ({
//     q: sp.get("q") || "",
//     active: sp.get("active") || "",
//     positionId: sp.get("positionId") || "",
//     branchId: sp.get("branchId") || "",
//   }));

//   const [positions, setPositions] = useState([]);
//   const [branches, setBranches] = useState([]);

//   const [page, setPage] = useState(() => Number(sp.get("page") || 1));
//   const limit = 10;

//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const pages = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total]);

//   // -----------------------------
//   // Helpers: normalizar respuestas
//   // -----------------------------
//   const pickItems = (res) => {
//     // soporta:
//     // - axios: { data: { items: [...] } }
//     // - api wrapper: { items: [...] }
//     // - otras: { data: [...] }
//     const root = res?.data ?? res ?? {};
//     const items =
//       Array.isArray(root?.items) ? root.items :
//       Array.isArray(root?.data) ? root.data :
//       Array.isArray(res?.items) ? res.items :
//       [];
//     const total = Number(root?.total ?? res?.total ?? 0) || 0;
//     return { items, total };
//   };

//   // -----------------------------
//   // Cargar refs (positions + branches)
//   // -----------------------------
//   const loadRefs = useCallback(async () => {
//     // positions (Cargo)
//     try {
//       const res = await PositionsAPI.list({ limit: 200, active: "true" });
//       const { items } = pickItems(res);
//       setPositions(items);
//     } catch (e) {
//       console.error("PositionsAPI.list failed", e);
//       setPositions([]);
//     }

//     // branches (Sucursal)
//     try {
//       const res = await api.get(`${API_PREFIX}/branches`, {
//         params: { page: 1, limit: 200, active: "true" },
//       });
//       const { items } = pickItems(res);
//       setBranches(items);
//     } catch (e) {
//       console.error("GET /branches failed", e);
//       setBranches([]);
//     }
//   }, []);

//   useEffect(() => {
//     loadRefs();
//   }, [loadRefs]);

//   // -----------------------------
//   // Sync URL -> state (solo q/page aquí para no romper UI)
//   // Si quieres persistir filtros en URL, abajo lo hacemos en onSearch.
//   // -----------------------------
//   useEffect(() => {
//     const qUrl = sp.get("q") || "";
//     const pageUrl = Number(sp.get("page") || 1);
//     if (qUrl !== q) setQ(qUrl);
//     if (pageUrl !== page) setPage(pageUrl);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [sp]);

//   // -----------------------------
//   // Load data (USA applied filters)
//   // -----------------------------
//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await PeopleAPI.list({
//         page,
//         limit,
//         q: applied.q,
//         active: applied.active,
//         positionId: applied.positionId,
//         branchId: applied.branchId,

//         // Compat: algunos backends filtran por branchIds/positionIds (coma-separado)
//         branchIds: applied.branchId ? applied.branchId : undefined,
//         positionIds: applied.positionId ? applied.positionId : undefined,
//       });

//       const root = res?.data ?? res ?? {};
//       const newItems = Array.isArray(root?.items)
//         ? root.items
//         : Array.isArray(root?.data)
//           ? root.data
//           : [];

//       const newTotal = Number(root?.total ?? 0) || 0;

//       setItems(newItems);
//       setTotal(newTotal);

//       // Si hay total pero la página quedó vacía, volver a 1
//       if (newTotal > 0 && newItems.length === 0 && page > 1) {
//         setPage(1);
//         setSp((prev) => {
//           const next = new URLSearchParams(prev);
//           next.set("page", "1");
//           return next;
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, applied, setSp]);

//   useEffect(() => {
//     load();
//   }, [page, applied, load]); // ⚠️ OJO: applied cambia solo con Buscar/Limpiar

//   // -----------------------------
//   // Actions
//   // -----------------------------
//   const onSearch = (e) => {
//     e.preventDefault();

//     const nextApplied = { q, active, positionId, branchId };
//     setApplied(nextApplied);

//     // Persistir en URL sin cambiar apariencia
//     setSp((prev) => {
//       const next = new URLSearchParams(prev);
//       next.set("page", "1");

//       if (q) next.set("q", q);
//       else next.delete("q");

//       if (branchId) next.set("branchId", branchId);
//       else next.delete("branchId");

//       if (positionId) next.set("positionId", positionId);
//       else next.delete("positionId");

//       if (active) next.set("active", active);
//       else next.delete("active");

//       return next;
//     });

//     if (page !== 1) setPage(1); // load se dispara por effect
//   };

//   const onClear = () => {
//     setQ("");
//     setActive("");
//     setPositionId("");
//     setBranchId("");

//     setApplied({ q: "", active: "", positionId: "", branchId: "" });

//     setSp((prev) => {
//       const next = new URLSearchParams(prev);
//       next.delete("q");
//       next.delete("branchId");
//       next.delete("positionId");
//       next.delete("active");
//       next.set("page", "1");
//       return next;
//     });

//     if (page !== 1) setPage(1); // load se dispara por effect
//   };

//   const onDelete = async (id) => {
//     const ok = window.confirm("¿Eliminar persona?");
//     if (!ok) return;

//     try {
//       await PeopleAPI.remove(id);

//       if (page > 1 && items.length === 1) {
//         setPage((p) => Math.max(1, p - 1));
//         return;
//       }

//       await load();
//     } catch (err) {
//       console.error(err);
//       alert("No fue posible eliminar");
//     }
//   };

//   // -----------------------------
//   // UI (MISMA APARIENCIA)
//   // -----------------------------
//   return (
//     <div className="p-4 md:p-6 space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-bold">RRHH — Personas</h1>
//           <p className="text-sm text-gray-600">Listado y gestión de personas.</p>
//         </div>
//         <Link
//           className="rounded-lg text-white px-4 py-2 w-full sm:w-auto text-center"
//           style={{ background: "var(--fc-primary)" }}
//           to="/people/new"
//         >
//           Nueva persona
//         </Link>
//       </div>

//       <form
//         onSubmit={onSearch}
//         className="border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
//       >
//         <input
//           className="border rounded px-3 py-2 md:col-span-2"
//           placeholder="Buscar (DNI, nombre, email)..."
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//         />

//         <select
//           className="border rounded px-3 py-2"
//           value={branchId}
//           onChange={(e) => setBranchId(e.target.value)}
//         >
//           <option value="">Sucursal (todas)</option>
//           {branches.map((b) => (
//             <option key={b._id} value={b._id}>
//               {b.code} — {b.name}
//             </option>
//           ))}
//         </select>

//         <select
//           className="border rounded px-3 py-2"
//           value={positionId}
//           onChange={(e) => setPositionId(e.target.value)}
//         >
//           <option value="">Cargo (todos)</option>
//           {positions.map((p) => (
//             <option key={p._id} value={p._id}>
//               {p.name}
//             </option>
//           ))}
//         </select>

//         <select
//           className="border rounded px-3 py-2"
//           value={active}
//           onChange={(e) => setActive(e.target.value)}
//         >
//           <option value="">Activo (todos)</option>
//           <option value="true">Sí</option>
//           <option value="false">No</option>
//         </select>

//         <div className="md:col-span-5 grid grid-cols-2 gap-2 md:flex md:gap-2">
//           <button
//             type="submit"
//             className="px-3 py-2 rounded-md text-white disabled:opacity-50 w-full md:w-auto"
//             style={{ background: "var(--fc-primary)" }}
//             disabled={loading}
//           >
//             Buscar
//           </button>
//           <button
//             type="button"
//             className="px-3 py-2 rounded-md border border-gray-400 w-full md:w-auto"
//             onClick={onClear}
//             disabled={loading}
//           >
//             Limpiar
//           </button>
//         </div>
//       </form>

//       <div className="border rounded-xl overflow-hidden bg-white">
//         <div className="overflow-x-auto">
//           <table className="min-w-[900px] w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="text-left p-2">RUN</th>
//                 <th className="text-left p-2">Nombre</th>
//                 <th className="text-left p-2">Cargo</th>
//                 <th className="text-left p-2">Sucursal</th>
//                 <th className="text-left p-2">Conductor</th>
//                 <th className="text-left p-2">Activo</th>
//                 <th className="text-left p-2 w-56">Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((it) => (
//                 <tr key={it._id} className="border-t">
//                   <td className="p-2">{it.dni}</td>
//                   <td className="p-2">{it.lastName} {it.firstName}</td>
//                   <td className="p-2">{it.positionId?.name || "—"}</td>
//                   <td className="p-2">{it.branchId?.name || "—"}</td>
//                   <td className="p-2">
//                     {(() => {
//                       const flag =
//                         it?.drivingAuthorization?.authorized ??
//                         it?.authorizedDriver ??
//                         it?.isAuthorizedDriver;
//                       if (flag === true) return "Sí";
//                       if (flag === false) return "No";
//                       return "—";
//                     })()}
//                   </td>
//                   <td className="p-2">{it.active === false ? "No" : "Sí"}</td>
//                   <td className="p-2 flex gap-2">
//                     <Link className="px-2 py-1 border rounded" to={`/people/${it._id}?mode=view`}>
//                       Ver
//                     </Link>
//                     <Link className="px-2 py-1 border rounded" to={`/people/${it._id}`}>
//                       Editar
//                     </Link>
//                     <button
//                       className="px-2 py-1 border rounded"
//                       type="button"
//                       onClick={() => onDelete(it._id)}
//                     >
//                       Eliminar
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {!items.length && !loading && (
//                 <tr>
//                   <td className="p-3 text-gray-500" colSpan="7">Sin registros</td>
//                 </tr>
//               )}
//               {loading && (
//                 <tr>
//                   <td className="p-3 text-gray-500" colSpan="7">Cargando…</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="text-sm text-gray-600">Total: {total}</div>
//         <div className="flex items-center gap-2">
//           <button
//             className="px-2 py-1 border rounded disabled:opacity-50"
//             type="button"
//             disabled={page <= 1}
//             onClick={() => {
//               const nextP = Math.max(1, page - 1);
//               setPage(nextP);
//               setSp((prev) => {
//                 const n = new URLSearchParams(prev);
//                 n.set("page", String(nextP));
//                 return n;
//               });
//             }}
//           >
//             Anterior
//           </button>
//           <div className="text-sm">Página {page} / {pages}</div>
//           <button
//             className="px-2 py-1 border rounded disabled:opacity-50"
//             type="button"
//             disabled={page >= pages}
//             onClick={() => {
//               const nextP = Math.min(pages, page + 1);
//               setPage(nextP);
//               setSp((prev) => {
//                 const n = new URLSearchParams(prev);
//                 n.set("page", String(nextP));
//                 return n;
//               });
//             }}
//           >
//             Siguiente
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// front/src/pages/People/List.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PeopleAPI } from "../../api/people.api";
import { PositionsAPI } from "../../api/positions.api";
import { api, API_PREFIX } from "../../services/http";

export default function PeopleList() {
  const [sp, setSp] = useSearchParams();

  // -----------------------------
  // Draft filters (UI) - se aplican automáticamente
  // -----------------------------
  const [q, setQ] = useState(() => sp.get("q") || "");
  const [active, setActive] = useState(() => sp.get("active") || "");
  const [positionId, setPositionId] = useState(() => sp.get("positionId") || "");
  const [branchId, setBranchId] = useState(() => sp.get("branchId") || "");

  // Debounce para el texto (buscar)
  const [qDebounced, setQDebounced] = useState(q);

  // Applied (API) - cambia automático por effects
  const [applied, setApplied] = useState(() => ({
    q: sp.get("q") || "",
    active: sp.get("active") || "",
    positionId: sp.get("positionId") || "",
    branchId: sp.get("branchId") || "",
  }));

  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);

  const [page, setPage] = useState(() => Number(sp.get("page") || 1));
  const limit = 10;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pages = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total]);

  // -----------------------------
  // Helpers: normalizar respuestas
  // -----------------------------
  const pickItems = (res) => {
    const root = res?.data ?? res ?? {};
    const items =
      Array.isArray(root?.items) ? root.items :
      Array.isArray(root?.data) ? root.data :
      Array.isArray(res?.items) ? res.items :
      [];
    const total = Number(root?.total ?? res?.total ?? 0) || 0;
    return { items, total };
  };

  // -----------------------------
  // Cargar refs (positions + branches)
  // -----------------------------
  const loadRefs = useCallback(async () => {
    // positions (Cargo)
    try {
      const res = await PositionsAPI.list({ limit: 200, active: "true" });
      const { items } = pickItems(res);
      setPositions(items);
    } catch (e) {
      console.error("PositionsAPI.list failed", e);
      setPositions([]);
    }

    // branches (Sucursal)
    try {
      const res = await api.get(`${API_PREFIX}/branches`, {
        params: { page: 1, limit: 200, active: "true" },
      });
      const { items } = pickItems(res);
      setBranches(items);
    } catch (e) {
      console.error("GET /branches failed", e);
      setBranches([]);
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  // -----------------------------
  // Debounce para q (texto)
  // -----------------------------
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  // -----------------------------
  // Sync URL -> state (para back/forward y refresh)
  // IMPORTANT: solo aplica si realmente cambió el param.
  // -----------------------------
  const didInitRef = useRef(false);
  useEffect(() => {
    const qUrl = sp.get("q") || "";
    const activeUrl = sp.get("active") || "";
    const positionUrl = sp.get("positionId") || "";
    const branchUrl = sp.get("branchId") || "";
    const pageUrl = Number(sp.get("page") || 1);

    // Primera carga: respetar URL como fuente
    if (!didInitRef.current) {
      didInitRef.current = true;

      setQ(qUrl);
      setQDebounced(qUrl);
      setActive(activeUrl);
      setPositionId(positionUrl);
      setBranchId(branchUrl);
      setPage(pageUrl);

      setApplied({
        q: qUrl,
        active: activeUrl,
        positionId: positionUrl,
        branchId: branchUrl,
      });
      return;
    }

    // Navegación (back/forward)
    if (qUrl !== q) setQ(qUrl);
    if (activeUrl !== active) setActive(activeUrl);
    if (positionUrl !== positionId) setPositionId(positionUrl);
    if (branchUrl !== branchId) setBranchId(branchUrl);
    if (pageUrl !== page) setPage(pageUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // -----------------------------
  // Auto-aplicar filtros cuando cambian
  // - selects y active: inmediato
  // - q: por qDebounced
  // - siempre vuelve a página 1
  // - persiste en URL
  // -----------------------------
  useEffect(() => {
    const nextApplied = {
      q: qDebounced,
      active,
      positionId,
      branchId,
    };

    setApplied(nextApplied);

    // Reset page a 1 al cambiar filtros
    if (page !== 1) setPage(1);

    // Persistir en URL sin cambiar UI
    setSp((prev) => {
      const next = new URLSearchParams(prev);

      // page
      next.set("page", "1");

      // q
      if (qDebounced) next.set("q", qDebounced);
      else next.delete("q");

      // branchId
      if (branchId) next.set("branchId", branchId);
      else next.delete("branchId");

      // positionId
      if (positionId) next.set("positionId", positionId);
      else next.delete("positionId");

      // active
      if (active) next.set("active", active);
      else next.delete("active");

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, branchId, positionId, active]);

  // -----------------------------
  // Load data (usa applied)
  // -----------------------------
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PeopleAPI.list({
        page,
        limit,
        q: applied.q,
        active: applied.active,
        positionId: applied.positionId,
        branchId: applied.branchId,

        // Compat: algunos backends filtran por branchIds/positionIds
        // (si tu backend espera CSV, aquí al menos va 1 id)
        branchIds: applied.branchId ? applied.branchId : undefined,
        positionIds: applied.positionId ? applied.positionId : undefined,
      });

      const root = res?.data ?? res ?? {};
      const newItems = Array.isArray(root?.items)
        ? root.items
        : Array.isArray(root?.data)
          ? root.data
          : [];

      const newTotal = Number(root?.total ?? 0) || 0;

      setItems(newItems);
      setTotal(newTotal);

      // Si hay total pero la página quedó vacía, volver a 1
      if (newTotal > 0 && newItems.length === 0 && page > 1) {
        setPage(1);
        setSp((prev) => {
          const next = new URLSearchParams(prev);
          next.set("page", "1");
          return next;
        });
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, applied, setSp]);

  // Cargar cuando cambie page o applied
  useEffect(() => {
    load();
  }, [page, applied, load]);

  // -----------------------------
  // Actions
  // -----------------------------
  const onSearch = (e) => {
    // Se mantiene el botón por apariencia, pero ya es auto-aplicar.
    // Si el usuario presiona "Buscar", aplicamos inmediato sin esperar debounce.
    e.preventDefault();
    setQDebounced(q);
  };

  const onClear = () => {
    setQ("");
    setQDebounced("");
    setActive("");
    setPositionId("");
    setBranchId("");

    setApplied({ q: "", active: "", positionId: "", branchId: "" });

    setSp((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      next.delete("branchId");
      next.delete("positionId");
      next.delete("active");
      next.set("page", "1");
      return next;
    });

    if (page !== 1) setPage(1);
  };

  const onDelete = async (id) => {
    const ok = window.confirm("¿Eliminar persona?");
    if (!ok) return;

    try {
      await PeopleAPI.remove(id);

      if (page > 1 && items.length === 1) {
        setPage((p) => Math.max(1, p - 1));
        return;
      }

      await load();
    } catch (err) {
      console.error(err);
      alert("No fue posible eliminar");
    }
  };

  // -----------------------------
  // UI (MISMA APARIENCIA)
  // -----------------------------
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">RRHH — Personas</h1>
          <p className="text-sm text-gray-600">Listado y gestión de personas.</p>
        </div>
        <Link
          className="rounded-lg text-white px-4 py-2 w-full sm:w-auto text-center"
          style={{ background: "var(--fc-primary)" }}
          to="/people/new"
        >
          Nueva persona
        </Link>
      </div>

      <form
        onSubmit={onSearch}
        className="border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          className="border rounded px-3 py-2 md:col-span-2"
          placeholder="Buscar (DNI, nombre, email)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        >
          <option value="">Sucursal (todas)</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.code} — {b.name}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={positionId}
          onChange={(e) => setPositionId(e.target.value)}
        >
          <option value="">Cargo (todos)</option>
          {positions.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={active}
          onChange={(e) => setActive(e.target.value)}
        >
          <option value="">Activo (todos)</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>

        <div className="md:col-span-5 grid grid-cols-2 gap-2 md:flex md:gap-2">
          <button
            type="submit"
            className="px-3 py-2 rounded-md text-white disabled:opacity-50 w-full md:w-auto"
            style={{ background: "var(--fc-primary)" }}
            disabled={loading}
          >
            Buscar
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-md border border-gray-400 w-full md:w-auto"
            onClick={onClear}
            disabled={loading}
          >
            Limpiar
          </button>
        </div>
      </form>

      <div className="border rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">RUN</th>
                <th className="text-left p-2">Nombre</th>
                <th className="text-left p-2">Cargo</th>
                <th className="text-left p-2">Sucursal</th>
                <th className="text-left p-2">Conductor</th>
                <th className="text-left p-2">Activo</th>
                <th className="text-left p-2 w-56">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id} className="border-t">
                  <td className="p-2">{it.dni}</td>
                  <td className="p-2">{it.lastName} {it.firstName}</td>
                  <td className="p-2">{it.positionId?.name || "—"}</td>
                  <td className="p-2">{it.branchId?.name || "—"}</td>
                  <td className="p-2">
                    {(() => {
                      const flag =
                        it?.drivingAuthorization?.authorized ??
                        it?.authorizedDriver ??
                        it?.isAuthorizedDriver;
                      if (flag === true) return "Sí";
                      if (flag === false) return "No";
                      return "—";
                    })()}
                  </td>
                  <td className="p-2">{it.active === false ? "No" : "Sí"}</td>
                  <td className="p-2 flex gap-2">
                    <Link className="px-2 py-1 border rounded" to={`/people/${it._id}?mode=view`}>
                      Ver
                    </Link>
                    <Link className="px-2 py-1 border rounded" to={`/people/${it._id}`}>
                      Editar
                    </Link>
                    <button
                      className="px-2 py-1 border rounded"
                      type="button"
                      onClick={() => onDelete(it._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {!items.length && !loading && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan="7">Sin registros</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan="7">Cargando…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            type="button"
            disabled={page <= 1}
            onClick={() => {
              const nextP = Math.max(1, page - 1);
              setPage(nextP);
              setSp((prev) => {
                const n = new URLSearchParams(prev);
                n.set("page", String(nextP));
                return n;
              });
            }}
          >
            Anterior
          </button>
          <div className="text-sm">Página {page} / {pages}</div>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            type="button"
            disabled={page >= pages}
            onClick={() => {
              const nextP = Math.min(pages, page + 1);
              setPage(nextP);
              setSp((prev) => {
                const n = new URLSearchParams(prev);
                n.set("page", String(nextP));
                return n;
              });
            }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
