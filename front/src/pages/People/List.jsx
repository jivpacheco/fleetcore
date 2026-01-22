// // front/src/pages/People/List.jsx
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { PeopleAPI } from "../../api/people.api";
// import { PositionsAPI } from "../../api/positions.api";
// import { api, API_PREFIX } from "../../services/http";

// export default function PeopleList() {
//   const [q, setQ] = useState("");
//   const [active, setActive] = useState("");
//   const [positionId, setPositionId] = useState("");
//   const [branchId, setBranchId] = useState("");

//   const [positions, setPositions] = useState([]);
//   const [branches, setBranches] = useState([]);

//   const [page, setPage] = useState(1);
//   const limit = 10;

//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const pages = useMemo(
//     () => Math.max(1, Math.ceil((total || 0) / limit)),
//     [total]
//   );

//   const loadRefs = useCallback(async () => {
//     // positions
//     try {
//       const { data } = await PositionsAPI.list({ limit: 200, active: "true" });
//       setPositions(data.items || []);
//     } catch {
//       setPositions([]);
//     }

//     // branches
//     try {
//       const { data } = await api.get(`${API_PREFIX}/branches`, {
//         params: { page: 1, limit: 200 },
//       });
//       setBranches(data.items || []);
//     } catch {
//       setBranches([]);
//     }
//   }, []);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await PeopleAPI.list({
//         page,
//         limit,
//         q,
//         branchId,
//         positionId,
//         active,
//       });
//       setItems(data.items || []);
//       setTotal(data.total || 0);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, q, branchId, positionId, active]);

//   useEffect(() => {
//     loadRefs();
//   }, [loadRefs]);

//   // IMPORTANTE: en modo "por botón", recargamos solo cuando cambia page.
//   useEffect(() => {
//     load();
//   }, [page, load]);

//   const onSearch = (e) => {
//     e.preventDefault();
//     // Si ya estás en página 1, fuerza recarga explícita.
//     if (page === 1) load();
//     else setPage(1); // el effect disparará load() al cambiar page
//   };

//   const onClear = () => {
//     setQ("");
//     setActive("");
//     setPositionId("");
//     setBranchId("");

//     // limpiar y recargar desde pág 1
//     if (page === 1) {
//       // load usará los estados actuales; como setState es async,
//       // hacemos un micro-delay para que se reflejen los nuevos filtros.
//       // Alternativa: manejar "appliedFilters", pero esto es suficiente y estable.
//       setTimeout(() => load(), 0);
//     } else {
//       setPage(1);
//     }
//   };

//   const onDelete = async (id) => {
//     const ok = window.confirm("¿Eliminar persona?");
//     if (!ok) return;

//     try {
//       await PeopleAPI.remove(id);

//       // Si borraste el último elemento de la página y hay páginas previas, retrocede.
//       if (page > 1 && items.length === 1) {
//         setPage((p) => Math.max(1, p - 1));
//         return; // load se dispara por effect
//       }

//       // Si no, recarga la misma página
//       await load();
//     } catch (err) {
//       console.error(err);
//       alert("No fue posible eliminar");
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-xl font-bold">RRHH — Personas</h1>
//           <p className="text-sm text-gray-600">Listado y gestión de personas.</p>
//         </div>
//         <Link className="rounded-xl bg-blue-600 text-white px-4 py-2" to="/people/new">
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

//         <div className="md:col-span-5 flex gap-2">
//           <button
//             type="submit"
//             className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
//             disabled={loading}
//           >
//             Buscar
//           </button>
//           <button
//             type="button"
//             className="px-3 py-2 rounded border"
//             onClick={onClear}
//             disabled={loading}
//           >
//             Limpiar
//           </button>
//         </div>
//       </form>

//       <div className="border rounded overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="text-left p-2">RUN</th>
//               <th className="text-left p-2">Nombre</th>
//               <th className="text-left p-2">Cargo</th>
//               <th className="text-left p-2">Sucursal</th>
//               <th className="text-left p-2">Conductor</th>
//               <th className="text-left p-2">Activo</th>
//               <th className="text-left p-2 w-56">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((it) => (
//               <tr key={it._id} className="border-t">
//                 <td className="p-2">{it.dni}</td>
//                 <td className="p-2">
//                   {it.lastName} {it.firstName}
//                 </td>
//                 <td className="p-2">{it.positionId?.name || "—"}</td>
//                 <td className="p-2">{it.branchId?.name || "—"}</td>
//                 <td className="p-2">
//                   {(() => {
//                     const flag =
//                       it?.drivingAuthorization?.authorized ??
//                       it?.authorizedDriver ??
//                       it?.isAuthorizedDriver;
//                     if (flag === true) return 'Sí'
//                     if (flag === false) return 'No'
//                     return '—'
//                   })()}
//                 </td>
//                 <td className="p-2">{it.active === false ? "No" : "Sí"}</td>
//                 <td className="p-2 flex gap-2">
//                   <Link className="px-2 py-1 border rounded" to={`/people/${it._id}`}>
//                     Ver / Editar
//                   </Link>
//                   <button
//                     className="px-2 py-1 border rounded"
//                     type="button"
//                     onClick={() => onDelete(it._id)}
//                   >
//                     Eliminar
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {!items.length && !loading && (
//               <tr>
//                 <td className="p-3 text-gray-500" colSpan="7">
//                   Sin registros
//                 </td>
//               </tr>
//             )}
//             {loading && (
//               <tr>
//                 <td className="p-3 text-gray-500" colSpan="7">
//                   Cargando…
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="text-sm text-gray-600">Total: {total}</div>
//         <div className="flex items-center gap-2">
//           <button
//             className="px-2 py-1 border rounded disabled:opacity-50"
//             type="button"
//             disabled={page <= 1}
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//           >
//             Anterior
//           </button>
//           <div className="text-sm">
//             Página {page} / {pages}
//           </div>
//           <button
//             className="px-2 py-1 border rounded disabled:opacity-50"
//             type="button"
//             disabled={page >= pages}
//             onClick={() => setPage((p) => Math.min(pages, p + 1))}
//           >
//             Siguiente
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// //v2
// // front/src/pages/People/List.jsx
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { PeopleAPI } from "../../api/people.api";
// import { PositionsAPI } from "../../api/positions.api";
// import { api, API_PREFIX } from "../../services/http";

// export default function PeopleList() {
//   const [q, setQ] = useState("");
//   const [active, setActive] = useState("");
//   const [positionId, setPositionId] = useState("");
//   const [branchId, setBranchId] = useState("");

//   const [positions, setPositions] = useState([]);
//   const [branches, setBranches] = useState([]);

//   const [page, setPage] = useState(1);
//   const limit = 10;

//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const pages = useMemo(
//     () => Math.max(1, Math.ceil((total || 0) / limit)),
//     [total]
//   );

//   const loadRefs = useCallback(async () => {
//     // positions
//     try {
//       const { data } = await PositionsAPI.list({ limit: 200, active: "true" });
//       setPositions(data.items || []);
//     } catch {
//       setPositions([]);
//     }

//     // branches
//     try {
//       const { data } = await api.get(`${API_PREFIX}/branches`, {
//         params: { page: 1, limit: 200 },
//       });
//       setBranches(data.items || []);
//     } catch {
//       setBranches([]);
//     }
//   }, []);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await PeopleAPI.list({
//         page,
//         limit,
//         q,
//         branchId,
//         positionId,
//         active,
//       });
//       setItems(data.items || []);
//       setTotal(data.total || 0);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, limit, q, branchId, positionId, active]);

//   useEffect(() => {
//     loadRefs();
//   }, [loadRefs]);

//   // IMPORTANTE: en modo "por botón", recargamos solo cuando cambia page.
//   useEffect(() => {
//     load();
//   }, [page, load]);

//   const onSearch = (e) => {
//     e.preventDefault();
//     // Si ya estás en página 1, fuerza recarga explícita.
//     if (page === 1) load();
//     else setPage(1); // el effect disparará load() al cambiar page
//   };

//   const onClear = () => {
//     setQ("");
//     setActive("");
//     setPositionId("");
//     setBranchId("");

//     // limpiar y recargar desde pág 1
//     if (page === 1) {
//       // load usará los estados actuales; como setState es async,
//       // hacemos un micro-delay para que se reflejen los nuevos filtros.
//       // Alternativa: manejar "appliedFilters", pero esto es suficiente y estable.
//       setTimeout(() => load(), 0);
//     } else {
//       setPage(1);
//     }
//   };

//   const onDelete = async (id) => {
//     const ok = window.confirm("¿Eliminar persona?");
//     if (!ok) return;

//     try {
//       await PeopleAPI.remove(id);

//       // Si borraste el último elemento de la página y hay páginas previas, retrocede.
//       if (page > 1 && items.length === 1) {
//         setPage((p) => Math.max(1, p - 1));
//         return; // load se dispara por effect
//       }

//       // Si no, recarga la misma página
//       await load();
//     } catch (err) {
//       console.error(err);
//       alert("No fue posible eliminar");
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-xl font-bold">RRHH — Personas</h1>
//           <p className="text-sm text-gray-600">Listado y gestión de personas.</p>
//         </div>
//         <Link
//           className="rounded-md text-white px-4 py-2"
//           style={{ background: 'var(--fc-primary)' }}
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

//         <div className="md:col-span-5 flex gap-2">
//           <button
//             type="submit"
//             className="px-3 py-2 rounded-md text-white disabled:opacity-50"
//             style={{ background: 'var(--fc-primary)' }}
//             disabled={loading}
//           >
//             Buscar
//           </button>
//           <button
//             type="button"
//             className="px-3 py-2 rounded-md border border-gray-400"
//             onClick={onClear}
//             disabled={loading}
//           >
//             Limpiar
//           </button>
//         </div>
//       </form>

//       <div className="border rounded overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="text-left p-2">RUN</th>
//               <th className="text-left p-2">Nombre</th>
//               <th className="text-left p-2">Cargo</th>
//               <th className="text-left p-2">Sucursal</th>
//               <th className="text-left p-2">Conductor</th>
//               <th className="text-left p-2">Activo</th>
//               <th className="text-left p-2 w-56">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((it) => (
//               <tr key={it._id} className="border-t">
//                 <td className="p-2">{it.dni}</td>
//                 <td className="p-2">
//                   {it.lastName} {it.firstName}
//                 </td>
//                 <td className="p-2">{it.positionId?.name || "—"}</td>
//                 <td className="p-2">{it.branchId?.name || "—"}</td>
//                 <td className="p-2">
//                   {(() => {
//                     const flag =
//                       it?.drivingAuthorization?.authorized ??
//                       it?.authorizedDriver ??
//                       it?.isAuthorizedDriver;
//                     if (flag === true) return 'Sí'
//                     if (flag === false) return 'No'
//                     return '—'
//                   })()}
//                 </td>
//                 <td className="p-2">{it.active === false ? "No" : "Sí"}</td>
//                 <td className="p-2 flex gap-2">
//                   <Link className="px-2 py-1 border rounded" to={`/people/${it._id}`}>
//                     Ver / Editar
//                   </Link>
//                   <button
//                     className="px-2 py-1 border rounded"
//                     type="button"
//                     onClick={() => onDelete(it._id)}
//                   >
//                     Eliminar
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {!items.length && !loading && (
//               <tr>
//                 <td className="p-3 text-gray-500" colSpan="7">
//                   Sin registros
//                 </td>
//               </tr>
//             )}
//             {loading && (
//               <tr>
//                 <td className="p-3 text-gray-500" colSpan="7">
//                   Cargando…
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="text-sm text-gray-600">Total: {total}</div>
//         <div className="flex items-center gap-2">
//           <button
//             className="px-2 py-1 border rounded disabled:opacity-50"
//             type="button"
//             disabled={page <= 1}
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//           >
//             Anterior
//           </button>
//           <div className="text-sm">
//             Página {page} / {pages}
//           </div>
//           <button
//             className="px-2 py-1 border rounded disabled:opacity-50"
//             type="button"
//             disabled={page >= pages}
//             onClick={() => setPage((p) => Math.min(pages, p + 1))}
//           >
//             Siguiente
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// front/src/pages/People/List.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PeopleAPI } from "../../api/people.api";
import { PositionsAPI } from "../../api/positions.api";
import { api, API_PREFIX } from "../../services/http";

export default function PeopleList() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(() => sp.get("q") || "");
  const [active, setActive] = useState("");
  const [positionId, setPositionId] = useState("");
  const [branchId, setBranchId] = useState("");

  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);

  const [page, setPage] = useState(() => Number(sp.get("page") || 1));
  const limit = 10;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / limit)),
    [total],
  );

  const loadRefs = useCallback(async () => {
    // positions
    try {
      const { data } = await PositionsAPI.list({ limit: 200, active: "true" });
      setPositions(data.items || []);
    } catch {
      setPositions([]);
    }

    // branches
    try {
      const { data } = await api.get(`${API_PREFIX}/branches`, {
        params: { page: 1, limit: 200 },
      });
      setBranches(data.items || []);
    } catch {
      setBranches([]);
    }
  }, []);

  // const load = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const { data } = await PeopleAPI.list({
  //       page,
  //       limit,
  //       q,
  //       branchId,
  //       positionId,
  //       active,
  //     });
  //     setItems(data.items || []);
  //     setTotal(data.total || 0);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [page, limit, q, branchId, positionId, active]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await PeopleAPI.list({
        page,
        limit,
        q,
        branchId,
        positionId,
        active,
      });

      const newItems = data.items || [];
      const newTotal = data.total || 0;

      setItems(newItems);
      setTotal(newTotal);

      // FIX: si hay resultados pero esta página quedó vacía, volver a página 1
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
  }, [page, limit, q, branchId, positionId, active, setSp]);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  //adicion

  // Sync con URL (por ejemplo cuando vienes de crear persona y navegas con ?q=RUN)
  useEffect(() => {
    const qUrl = sp.get("q") || "";
    const pageUrl = Number(sp.get("page") || 1);

    if (qUrl !== q) setQ(qUrl);
    if (pageUrl !== page) setPage(pageUrl);
    // Nota: el load() se ejecuta por el effect que escucha page/load.
    // Como load depende de q, al cambiar q y/o page se refresca.
  }, [sp]);

  useEffect(() => {
    // si q viene en la URL, auto-cargar sin exigir click en Buscar
    const qUrl = sp.get("q") || "";
    if (qUrl) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // IMPORTANTE: en modo "por botón", recargamos solo cuando cambia page.
  useEffect(() => {
    load();
  }, [page, load]);

  const onSearch = (e) => {
    e.preventDefault();

    // Persistir filtros en la URL para navegación/refresh (incluye q)
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      // Siempre volver a página 1 al buscar
      next.set("page", "1");
      if (q) next.set("q", q);
      else next.delete("q");
      // Nota: si quieres persistir branch/position/active en URL, se puede agregar aquí.
      return next;
    });

    if (page === 1) load();
    else setPage(1); // el effect disparará load() al cambiar page
  };

  const onClear = () => {
    setQ("");
    setActive("");
    setPositionId("");
    setBranchId("");

    setSp((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      next.set("page", "1");
      return next;
    });

    // limpiar y recargar desde pág 1
    if (page === 1) {
      setTimeout(() => load(), 0);
    } else {
      setPage(1);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm("¿Eliminar persona?");
    if (!ok) return;

    try {
      await PeopleAPI.remove(id);

      // Si borraste el último elemento de la página y hay páginas previas, retrocede.
      if (page > 1 && items.length === 1) {
        setPage((p) => Math.max(1, p - 1));
        return; // load se dispara por effect
      }

      // Si no, recarga la misma página
      await load();
    } catch (err) {
      console.error(err);
      alert("No fue posible eliminar");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">RRHH — Personas</h1>
          <p className="text-sm text-gray-600">
            Listado y gestión de personas.
          </p>
        </div>
        <Link
          className="rounded-md text-white px-4 py-2"
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

        <div className="md:col-span-5 flex gap-2">
          <button
            type="submit"
            className="px-3 py-2 rounded-md text-white disabled:opacity-50"
            style={{ background: "var(--fc-primary)" }}
            disabled={loading}
          >
            Buscar
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-md border border-gray-400"
            onClick={onClear}
            disabled={loading}
          >
            Limpiar
          </button>
        </div>
      </form>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
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
                <td className="p-2">
                  {it.lastName} {it.firstName}
                </td>
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
                  <Link
                    className="px-2 py-1 border rounded"
                    to={`/people/${it._id}`}
                  >
                    Ver / Editar
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
                <td className="p-3 text-gray-500" colSpan="7">
                  Sin registros
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td className="p-3 text-gray-500" colSpan="7">
                  Cargando…
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
          <div className="text-sm">
            Página {page} / {pages}
          </div>
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
