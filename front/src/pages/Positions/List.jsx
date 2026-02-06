// // // // // // front/src/pages/Positions/List.jsx
// // // // // // -----------------------------------------------------------------------------
// // // // // // Catálogo → Cargos (Positions) (FleetCore Standard v1.0)
// // // // // // - List paginado (items/total/page/limit) sobre PositionsAPI.list
// // // // // // - Filtros inline (estándar tipo Repairs)
// // // // // // -----------------------------------------------------------------------------
// // // // // import { useEffect, useState } from "react";
// // // // // import { Link, useNavigate, useSearchParams } from "react-router-dom";
// // // // // import Paginator from "../../components/table/Paginator";
// // // // // import LimitSelect from "../../components/table/LimitSelect";
// // // // // import { PositionsAPI } from "../../api/positions.api";

// // // // // function pickItems(data) {
// // // // //     if (!data) return [];
// // // // //     if (Array.isArray(data)) return data;
// // // // //     if (Array.isArray(data.items)) return data.items;
// // // // //     if (Array.isArray(data.result?.items)) return data.result.items;
// // // // //     if (Array.isArray(data.data?.items)) return data.data.items;
// // // // //     if (Array.isArray(data.data)) return data.data;
// // // // //     return [];
// // // // // }
// // // // // function pickMeta(data) {
// // // // //     const total = data?.total ?? data?.result?.total ?? data?.data?.total ?? (Array.isArray(data?.items) ? data.items.length : undefined) ?? 0;
// // // // //     const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
// // // // //     const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;
// // // // //     return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
// // // // // }

// // // // // export default function PositionsList() {
// // // // //     const navigate = useNavigate();
// // // // //     const [sp, setSp] = useSearchParams();

// // // // //     const page = Number(sp.get("page") || 1);
// // // // //     const limit = Number(sp.get("limit") || 20);
// // // // //     const q = sp.get("q") || "";
// // // // //     const active = sp.get("active") ?? "";

// // // // //     const [loading, setLoading] = useState(false);
// // // // //     const [items, setItems] = useState([]);
// // // // //     const [total, setTotal] = useState(0);

// // // // //     const load = async () => {
// // // // //         setLoading(true);
// // // // //         try {
// // // // //             const { data } = await PositionsAPI.list({ q, active, page, limit });
// // // // //             const list = pickItems(data);
// // // // //             const sorted = [...list].sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "es", { numeric: true }));
// // // // //             setItems(sorted);
// // // // //             setTotal(pickMeta(data).total);
// // // // //         } catch (e) {
// // // // //             console.error(e);
// // // // //             setItems([]);
// // // // //             setTotal(0);
// // // // //         } finally {
// // // // //             setLoading(false);
// // // // //         }
// // // // //     };

// // // // //     useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, active, page, limit]);

// // // // //     const rowIsActive = (it) => {
// // // // //         if (typeof it?.isActive === "boolean") return it.isActive;
// // // // //         if (typeof it?.active === "boolean") return it.active;
// // // // //         return true;
// // // // //     };

// // // // //     const onDelete = async (it) => {
// // // // //         const name = it?.name || "registro";
// // // // //         const ok = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
// // // // //         if (!ok) return;
// // // // //         try {
// // // // //             await PositionsAPI.remove(it?._id || it?.id);
// // // // //             await load();
// // // // //         } catch (e) {
// // // // //             console.error(e);
// // // // //             alert("No se pudo eliminar. Revisa la consola.");
// // // // //         }
// // // // //     };

// // // // //     return (
// // // // //         <div className="p-6 space-y-6">
// // // // //             <div className="flex items-start justify-between gap-3 flex-wrap">
// // // // //                 <div>
// // // // //                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
// // // // //                     <p className="text-gray-500 text-sm">Define cargos/puestos para RRHH y asignaciones.</p>
// // // // //                 </div>

// // // // //                 <div className="flex items-center gap-2 flex-wrap justify-end">
// // // // //                     <input
// // // // //                         className="border rounded-md px-3 py-2 text-sm w-56"
// // // // //                         placeholder="Buscar por nombre"
// // // // //                         value={q}
// // // // //                         onChange={(e) =>
// // // // //                             setSp((prev) => {
// // // // //                                 const v = e.target.value;
// // // // //                                 if (v) prev.set("q", v);
// // // // //                                 else prev.delete("q");
// // // // //                                 prev.set("page", "1");
// // // // //                                 return prev;
// // // // //                             }, { replace: true })
// // // // //                         }
// // // // //                     />

// // // // //                     <select
// // // // //                         className="border rounded-md px-3 py-2 text-sm w-48"
// // // // //                         value={active}
// // // // //                         onChange={(e) =>
// // // // //                             setSp((prev) => {
// // // // //                                 const v = e.target.value;
// // // // //                                 if (v === "") prev.delete("active");
// // // // //                                 else prev.set("active", v);
// // // // //                                 prev.set("page", "1");
// // // // //                                 return prev;
// // // // //                             }, { replace: true })
// // // // //                         }
// // // // //                     >
// // // // //                         <option value="">Activo (todos)</option>
// // // // //                         <option value="true">Solo activos</option>
// // // // //                         <option value="false">Solo inactivos</option>
// // // // //                     </select>

// // // // //                     <Link to="new" className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95">
// // // // //                         Nuevo cargo
// // // // //                     </Link>
// // // // //                 </div>
// // // // //             </div>

// // // // //             <div className="bg-white border rounded-2xl overflow-hidden">
// // // // //                 <div className="overflow-x-auto">
// // // // //                     <table className="min-w-[900px] w-full text-sm">
// // // // //                         <thead className="bg-gray-50 border-b">
// // // // //                             <tr className="text-left text-gray-700">
// // // // //                                 <th className="px-4 py-3">Nombre</th>
// // // // //                                 <th className="px-4 py-3">Descripción</th>
// // // // //                                 <th className="px-4 py-3">Activo</th>
// // // // //                                 <th className="px-4 py-3 text-right">Acciones</th>
// // // // //                             </tr>
// // // // //                         </thead>
// // // // //                         <tbody>
// // // // //                             {loading ? (
// // // // //                                 <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Cargando…</td></tr>
// // // // //                             ) : items.length === 0 ? (
// // // // //                                 <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Sin registros.</td></tr>
// // // // //                             ) : (
// // // // //                                 items.map((it) => {
// // // // //                                     const id = it?._id || it?.id;
// // // // //                                     return (
// // // // //                                         <tr key={id} className="border-t">
// // // // //                                             <td className="px-4 py-3">{it?.name || "—"}</td>
// // // // //                                             <td className="px-4 py-3 text-gray-700">{it?.description || "—"}</td>
// // // // //                                             <td className="px-4 py-3">{rowIsActive(it) ? "Sí" : "No"}</td>
// // // // //                                             <td className="px-4 py-3">
// // // // //                                                 <div className="flex items-center justify-end gap-2">
// // // // //                                                     <button className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={() => navigate(`${id}?mode=view`)}>
// // // // //                                                         Ver
// // // // //                                                     </button>
// // // // //                                                     <button className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={() => navigate(`${id}`)}>
// // // // //                                                         Editar
// // // // //                                                     </button>
// // // // //                                                     <button className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={() => onDelete(it)}>
// // // // //                                                         Eliminar
// // // // //                                                     </button>
// // // // //                                                 </div>
// // // // //                                             </td>
// // // // //                                         </tr>
// // // // //                                     );
// // // // //                                 })
// // // // //                             )}
// // // // //                         </tbody>
// // // // //                     </table>
// // // // //                 </div>

// // // // //                 <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
// // // // //                     <div className="text-sm text-gray-600">Total: {total}</div>
// // // // //                     <div className="flex items-center gap-3 flex-wrap justify-end">
// // // // //                         <Paginator page={page} limit={limit} total={total} onPage={(p) => setSp(prev => { prev.set("page", String(p)); return prev; }, { replace: true })} />
// // // // //                         <LimitSelect value={limit} onChange={(v) => setSp(prev => { prev.set("limit", String(v)); prev.set("page", "1"); return prev; }, { replace: true })} />
// // // // //                     </div>
// // // // //                 </div>
// // // // //             </div>
// // // // //         </div>
// // // // //     );
// // // // // }

// // // // // front/src/pages/Positions/List.jsx
// // // // // -----------------------------------------------------------------------------
// // // // // Catálogo → Cargos (Positions) (FleetCore Templates v1.0)
// // // // // - List paginado sobre PositionsAPI.list({ q, active, page, limit })
// // // // // - Filtros en URL: ?q=&active=&page=&limit=
// // // // // - Acciones: Ver (?mode=view), Editar, Eliminar
// // // // // -----------------------------------------------------------------------------

// // // // import { useEffect, useMemo, useState } from "react";
// // // // import { Link, useNavigate, useSearchParams } from "react-router-dom";
// // // // import Paginator from "../../components/table/Paginator";
// // // // import LimitSelect from "../../components/table/LimitSelect";
// // // // import { PositionsAPI } from "../../api/positions.api";

// // // // // Debounce interno (fallback si aún no usas useDebouncedValue del template)
// // // // function useDebounced(value, delay = 350) {
// // // //     const [v, setV] = useState(value);
// // // //     useEffect(() => {
// // // //         const t = setTimeout(() => setV(value), delay);
// // // //         return () => clearTimeout(t);
// // // //     }, [value, delay]);
// // // //     return v;
// // // // }

// // // // function pickItems(data) {
// // // //     if (!data) return [];
// // // //     if (Array.isArray(data)) return data;
// // // //     if (Array.isArray(data.items)) return data.items;
// // // //     if (Array.isArray(data.result?.items)) return data.result.items;
// // // //     if (Array.isArray(data.data?.items)) return data.data.items;
// // // //     if (Array.isArray(data.data)) return data.data;
// // // //     return [];
// // // // }

// // // // function pickMeta(data, fallbackLimit = 20) {
// // // //     const total =
// // // //         data?.total ??
// // // //         data?.result?.total ??
// // // //         data?.data?.total ??
// // // //         (Array.isArray(data?.items) ? data.items.length : undefined) ??
// // // //         0;

// // // //     const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
// // // //     const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? fallbackLimit;

// // // //     return {
// // // //         total: Number(total || 0),
// // // //         page: Number(page || 1),
// // // //         limit: Number(limit || fallbackLimit),
// // // //     };
// // // // }

// // // // function getActive(it) {
// // // //     if (typeof it?.isActive === "boolean") return it.isActive;
// // // //     if (typeof it?.active === "boolean") return it.active;
// // // //     return true;
// // // // }

// // // // export default function PositionsList() {
// // // //     const navigate = useNavigate();
// // // //     const [sp, setSp] = useSearchParams();

// // // //     const page = Number(sp.get("page") || 1);
// // // //     const limit = Number(sp.get("limit") || 20);
// // // //     const qParam = sp.get("q") || "";
// // // //     const active = sp.get("active") ?? "";

// // // //     // Input controlado (evita que el usuario pierda el cursor si cambian sp)
// // // //     const [qInput, setQInput] = useState(qParam);
// // // //     useEffect(() => setQInput(qParam), [qParam]);

// // // //     const q = useDebounced(qInput, 300);

// // // //     const [loading, setLoading] = useState(false);
// // // //     const [items, setItems] = useState([]);
// // // //     const [total, setTotal] = useState(0);

// // // //     const sortedItems = useMemo(() => {
// // // //         return [...items].sort((a, b) =>
// // // //             String(a?.name || "").localeCompare(String(b?.name || ""), "es", { numeric: true })
// // // //         );
// // // //     }, [items]);

// // // //     // Mantener URL sincronizada con el debounce
// // // //     useEffect(() => {
// // // //         setSp(
// // // //             (prev) => {
// // // //                 const next = new URLSearchParams(prev);
// // // //                 if (q) next.set("q", q);
// // // //                 else next.delete("q");
// // // //                 next.set("page", "1");
// // // //                 return next;
// // // //             },
// // // //             { replace: true }
// // // //         );
// // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //     }, [q]);

// // // //     const load = async () => {
// // // //         setLoading(true);
// // // //         try {
// // // //             const { data } = await PositionsAPI.list({ q: qParam, active, page, limit });
// // // //             const list = pickItems(data);
// // // //             const meta = pickMeta(data, limit);

// // // //             setItems(list);
// // // //             setTotal(meta.total);
// // // //         } catch (err) {
// // // //             console.error(err);
// // // //             setItems([]);
// // // //             setTotal(0);
// // // //         } finally {
// // // //             setLoading(false);
// // // //         }
// // // //     };

// // // //     useEffect(() => {
// // // //         load();
// // // //         // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //     }, [qParam, active, page, limit]);

// // // //     const setParam = (key, value, resetPage = true) => {
// // // //         setSp(
// // // //             (prev) => {
// // // //                 const next = new URLSearchParams(prev);
// // // //                 if (value === "" || value === null || typeof value === "undefined") next.delete(key);
// // // //                 else next.set(key, String(value));
// // // //                 if (resetPage) next.set("page", "1");
// // // //                 return next;
// // // //             },
// // // //             { replace: true }
// // // //         );
// // // //     };

// // // //     const onDelete = async (it) => {
// // // //         const id = it?._id || it?.id;
// // // //         const name = it?.name || "registro";
// // // //         const ok = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
// // // //         if (!ok) return;

// // // //         try {
// // // //             await PositionsAPI.remove(id);
// // // //             await load();
// // // //         } catch (err) {
// // // //             console.error(err);
// // // //             alert("No se pudo eliminar. Revisa la consola.");
// // // //         }
// // // //     };

// // // //     return (
// // // //         <div className="p-6 space-y-6">
// // // //             {/* Header + filtros (tipo Repairs) */}
// // // //             <div className="flex items-start justify-between gap-3 flex-wrap">
// // // //                 <div>
// // // //                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
// // // //                     <p className="text-gray-500 text-sm">Define cargos/puestos para RRHH y asignaciones.</p>
// // // //                 </div>

// // // //                 <div className="flex items-center gap-2 flex-wrap justify-end">
// // // //                     <input
// // // //                         className="border rounded-md px-3 py-2 text-sm w-56"
// // // //                         placeholder="Buscar por nombre"
// // // //                         value={qInput}
// // // //                         onChange={(e) => setQInput(e.target.value)}
// // // //                     />

// // // //                     <select
// // // //                         className="border rounded-md px-3 py-2 text-sm w-48"
// // // //                         value={active}
// // // //                         onChange={(e) => setParam("active", e.target.value)}
// // // //                     >
// // // //                         <option value="">Activo (todos)</option>
// // // //                         <option value="true">Solo activos</option>
// // // //                         <option value="false">Solo inactivos</option>
// // // //                     </select>

// // // //                     <Link
// // // //                         to="new"
// // // //                         className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
// // // //                     >
// // // //                         Nuevo cargo
// // // //                     </Link>
// // // //                 </div>
// // // //             </div>

// // // //             <div className="bg-white border rounded-2xl overflow-hidden">
// // // //                 <div className="overflow-x-auto">
// // // //                     <table className="min-w-[900px] w-full text-sm">
// // // //                         <thead className="bg-gray-50 border-b">
// // // //                             <tr className="text-left text-gray-700">
// // // //                                 <th className="px-4 py-3">Nombre</th>
// // // //                                 <th className="px-4 py-3">Descripción</th>
// // // //                                 <th className="px-4 py-3">Activo</th>
// // // //                                 <th className="px-4 py-3 text-right">Acciones</th>
// // // //                             </tr>
// // // //                         </thead>

// // // //                         <tbody>
// // // //                             {loading ? (
// // // //                                 <tr>
// // // //                                     <td className="px-4 py-6 text-gray-500" colSpan={4}>
// // // //                                         Cargando…
// // // //                                     </td>
// // // //                                 </tr>
// // // //                             ) : sortedItems.length === 0 ? (
// // // //                                 <tr>
// // // //                                     <td className="px-4 py-6 text-gray-500" colSpan={4}>
// // // //                                         Sin registros.
// // // //                                     </td>
// // // //                                 </tr>
// // // //                             ) : (
// // // //                                 sortedItems.map((it) => {
// // // //                                     const id = it?._id || it?.id;
// // // //                                     return (
// // // //                                         <tr key={id} className="border-t">
// // // //                                             <td className="px-4 py-3">{it?.name || "—"}</td>
// // // //                                             <td className="px-4 py-3 text-gray-700">{it?.description || "—"}</td>
// // // //                                             <td className="px-4 py-3">{getActive(it) ? "Sí" : "No"}</td>
// // // //                                             <td className="px-4 py-3">
// // // //                                                 <div className="flex items-center justify-end gap-2">
// // // //                                                     <button
// // // //                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // // //                                                         onClick={() => navigate(`${id}?mode=view`)}
// // // //                                                     >
// // // //                                                         Ver
// // // //                                                     </button>
// // // //                                                     <button
// // // //                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // // //                                                         onClick={() => navigate(`${id}`)}
// // // //                                                     >
// // // //                                                         Editar
// // // //                                                     </button>
// // // //                                                     <button
// // // //                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // // //                                                         onClick={() => onDelete(it)}
// // // //                                                     >
// // // //                                                         Eliminar
// // // //                                                     </button>
// // // //                                                 </div>
// // // //                                             </td>
// // // //                                         </tr>
// // // //                                     );
// // // //                                 })
// // // //                             )}
// // // //                         </tbody>
// // // //                     </table>
// // // //                 </div>

// // // //                 <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
// // // //                     <div className="text-sm text-gray-600">Total: {total}</div>

// // // //                     <div className="flex items-center gap-3 flex-wrap justify-end">
// // // //                         <Paginator
// // // //                             page={page}
// // // //                             limit={limit}
// // // //                             total={total}
// // // //                             onPage={(p) =>
// // // //                                 setSp(
// // // //                                     (prev) => {
// // // //                                         const next = new URLSearchParams(prev);
// // // //                                         next.set("page", String(p));
// // // //                                         return next;
// // // //                                     },
// // // //                                     { replace: true }
// // // //                                 )
// // // //                             }
// // // //                         />

// // // //                         <LimitSelect
// // // //                             value={limit}
// // // //                             onChange={(v) =>
// // // //                                 setSp(
// // // //                                     (prev) => {
// // // //                                         const next = new URLSearchParams(prev);
// // // //                                         next.set("limit", String(v));
// // // //                                         next.set("page", "1");
// // // //                                         return next;
// // // //                                     },
// // // //                                     { replace: true }
// // // //                                 )
// // // //                             }
// // // //                         />
// // // //                     </div>
// // // //                 </div>
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // }

// // // // // //060226
// // // // // // front/src/pages/Positions/List.jsx
// // // // // // -----------------------------------------------------------------------------
// // // // // // Catálogo → Cargos (Positions) (FleetCore Standard v1.0)
// // // // // // - List paginado (items/total/page/limit) sobre PositionsAPI.list
// // // // // // - Filtros inline (estándar tipo Repairs)
// // // // // // -----------------------------------------------------------------------------
// // // // // import { useEffect, useMemo, useState, useCallback } from "react";
// // // // // import { Link, useNavigate, useSearchParams } from "react-router-dom";
// // // // // import Paginator from "../../components/table/Paginator";
// // // // // import LimitSelect from "../../components/table/LimitSelect";
// // // // // import { PositionsAPI } from "../../api/positions.api";

// // // // // function pickItems(data) {
// // // // //     if (!data) return [];
// // // // //     if (Array.isArray(data)) return data;
// // // // //     if (Array.isArray(data.items)) return data.items;
// // // // //     if (Array.isArray(data.result?.items)) return data.result.items;
// // // // //     if (Array.isArray(data.data?.items)) return data.data.items;
// // // // //     if (Array.isArray(data.data)) return data.data;
// // // // //     return [];
// // // // // }

// // // // // function pickMeta(data) {
// // // // //     const total =
// // // // //         data?.total ??
// // // // //         data?.result?.total ??
// // // // //         data?.data?.total ??
// // // // //         (Array.isArray(data?.items) ? data.items.length : undefined) ??
// // // // //         0;

// // // // //     const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
// // // // //     const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

// // // // //     return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
// // // // // }

// // // // // export default function PositionsList() {
// // // // //     const navigate = useNavigate();
// // // // //     const [sp, setSp] = useSearchParams();

// // // // //     const page = Number(sp.get("page") || 1);
// // // // //     const limit = Number(sp.get("limit") || 20);
// // // // //     const q = sp.get("q") || "";
// // // // //     const active = sp.get("active") ?? "";

// // // // //     const [loading, setLoading] = useState(false);
// // // // //     const [items, setItems] = useState([]);
// // // // //     const [total, setTotal] = useState(0);

// // // // //     const sortedItems = useMemo(() => {
// // // // //         return [...items].sort((a, b) =>
// // // // //             String(a?.name || "").localeCompare(String(b?.name || ""), "es", { numeric: true })
// // // // //         );
// // // // //     }, [items]);

// // // // //     const load = useCallback(async () => {
// // // // //         setLoading(true);
// // // // //         try {
// // // // //             const { data } = await PositionsAPI.list({ q, active, page, limit });
// // // // //             const list = pickItems(data);
// // // // //             setItems(list);
// // // // //             setTotal(pickMeta(data).total);
// // // // //         } catch (e) {
// // // // //             console.error(e);
// // // // //             setItems([]);
// // // // //             setTotal(0);
// // // // //         } finally {
// // // // //             setLoading(false);
// // // // //         }
// // // // //     }, [q, active, page, limit]);

// // // // //     useEffect(() => {
// // // // //         load();
// // // // //     }, [load]);

// // // // //     const rowIsActive = (it) => {
// // // // //         if (typeof it?.isActive === "boolean") return it.isActive;
// // // // //         if (typeof it?.active === "boolean") return it.active;
// // // // //         return true;
// // // // //     };

// // // // //     const setParam = (key, value) => {
// // // // //         setSp(
// // // // //             (prev) => {
// // // // //                 const next = new URLSearchParams(prev);
// // // // //                 if (value === "" || value === null || typeof value === "undefined") next.delete(key);
// // // // //                 else next.set(key, String(value));
// // // // //                 next.set("page", "1");
// // // // //                 return next;
// // // // //             },
// // // // //             { replace: true }
// // // // //         );
// // // // //     };

// // // // //     const onDelete = async (it) => {
// // // // //         const name = it?.name || "registro";
// // // // //         const ok = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
// // // // //         if (!ok) return;

// // // // //         try {
// // // // //             await PositionsAPI.remove(it?._id || it?.id);
// // // // //             await load();
// // // // //         } catch (e) {
// // // // //             console.error(e);
// // // // //             alert("No se pudo eliminar. Revisa la consola.");
// // // // //         }
// // // // //     };

// // // // //     return (
// // // // //         <div className="p-6 space-y-6">
// // // // //             <div className="flex items-start justify-between gap-3 flex-wrap">
// // // // //                 <div>
// // // // //                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
// // // // //                     <p className="text-gray-500 text-sm">Define cargos/puestos para RRHH y asignaciones.</p>
// // // // //                 </div>

// // // // //                 <div className="flex items-center gap-2 flex-wrap justify-end">
// // // // //                     <input
// // // // //                         className="border rounded-md px-3 py-2 text-sm w-56"
// // // // //                         placeholder="Buscar por nombre"
// // // // //                         value={q}
// // // // //                         onChange={(e) => setParam("q", e.target.value)}
// // // // //                     />

// // // // //                     <select
// // // // //                         className="border rounded-md px-3 py-2 text-sm w-48"
// // // // //                         value={active}
// // // // //                         onChange={(e) => setParam("active", e.target.value)}
// // // // //                     >
// // // // //                         <option value="">Activo (todos)</option>
// // // // //                         <option value="true">Solo activos</option>
// // // // //                         <option value="false">Solo inactivos</option>
// // // // //                     </select>

// // // // //                     <Link
// // // // //                         to="new"
// // // // //                         className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
// // // // //                     >
// // // // //                         Nuevo cargo
// // // // //                     </Link>
// // // // //                 </div>
// // // // //             </div>

// // // // //             <div className="bg-white border rounded-2xl overflow-hidden">
// // // // //                 <div className="overflow-x-auto">
// // // // //                     <table className="min-w-[900px] w-full text-sm">
// // // // //                         <thead className="bg-gray-50 border-b">
// // // // //                             <tr className="text-left text-gray-700">
// // // // //                                 <th className="px-4 py-3">Nombre</th>
// // // // //                                 <th className="px-4 py-3">Descripción</th>
// // // // //                                 <th className="px-4 py-3">Activo</th>
// // // // //                                 <th className="px-4 py-3 text-right">Acciones</th>
// // // // //                             </tr>
// // // // //                         </thead>
// // // // //                         <tbody>
// // // // //                             {loading ? (
// // // // //                                 <tr>
// // // // //                                     <td className="px-4 py-6 text-gray-500" colSpan={4}>
// // // // //                                         Cargando…
// // // // //                                     </td>
// // // // //                                 </tr>
// // // // //                             ) : sortedItems.length === 0 ? (
// // // // //                                 <tr>
// // // // //                                     <td className="px-4 py-6 text-gray-500" colSpan={4}>
// // // // //                                         Sin registros.
// // // // //                                     </td>
// // // // //                                 </tr>
// // // // //                             ) : (
// // // // //                                 sortedItems.map((it) => {
// // // // //                                     const id = it?._id || it?.id;
// // // // //                                     return (
// // // // //                                         <tr key={id} className="border-t">
// // // // //                                             <td className="px-4 py-3">{it?.name || "—"}</td>
// // // // //                                             <td className="px-4 py-3 text-gray-700">{it?.description || "—"}</td>
// // // // //                                             <td className="px-4 py-3">{rowIsActive(it) ? "Sí" : "No"}</td>
// // // // //                                             <td className="px-4 py-3">
// // // // //                                                 <div className="flex items-center justify-end gap-2">
// // // // //                                                     <button
// // // // //                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // // // //                                                         onClick={() => navigate(`${id}?mode=view`)}
// // // // //                                                     >
// // // // //                                                         Ver
// // // // //                                                     </button>
// // // // //                                                     <button
// // // // //                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // // // //                                                         onClick={() => navigate(`${id}`)}
// // // // //                                                     >
// // // // //                                                         Editar
// // // // //                                                     </button>
// // // // //                                                     <button
// // // // //                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // // // //                                                         onClick={() => onDelete(it)}
// // // // //                                                     >
// // // // //                                                         Eliminar
// // // // //                                                     </button>
// // // // //                                                 </div>
// // // // //                                             </td>
// // // // //                                         </tr>
// // // // //                                     );
// // // // //                                 })
// // // // //                             )}
// // // // //                         </tbody>
// // // // //                     </table>
// // // // //                 </div>

// // // // //                 <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
// // // // //                     <div className="text-sm text-gray-600">Total: {total}</div>
// // // // //                     <div className="flex items-center gap-3 flex-wrap justify-end">
// // // // //                         <Paginator
// // // // //                             page={page}
// // // // //                             limit={limit}
// // // // //                             total={total}
// // // // //                             onPage={(p) =>
// // // // //                                 setSp(
// // // // //                                     (prev) => {
// // // // //                                         const next = new URLSearchParams(prev);
// // // // //                                         next.set("page", String(p));
// // // // //                                         return next;
// // // // //                                     },
// // // // //                                     { replace: true }
// // // // //                                 )
// // // // //                             }
// // // // //                         />
// // // // //                         <LimitSelect
// // // // //                             value={limit}
// // // // //                             onChange={(v) =>
// // // // //                                 setSp(
// // // // //                                     (prev) => {
// // // // //                                         const next = new URLSearchParams(prev);
// // // // //                                         next.set("limit", String(v));
// // // // //                                         next.set("page", "1");
// // // // //                                         return next;
// // // // //                                     },
// // // // //                                     { replace: true }
// // // // //                                 )
// // // // //                             }
// // // // //                         />
// // // // //                     </div>
// // // // //                 </div>
// // // // //             </div>
// // // // //         </div>
// // // // //     );
// // // // // }

// // // // front/src/pages/Positions/List.jsx
// // // // -----------------------------------------------------------------------------
// // // // Catálogo → Cargos (Positions) (FleetCore Templates v1.0)
// // // // - Patrón estándar: components/fc + hooks compartidos
// // // // - Estado en URL: page/limit/q/active
// // // // - Actions: Ver (?mode=view), Editar, Eliminar (mismo negocio)
// // // // -----------------------------------------------------------------------------

// // // import { useEffect, useMemo, useState } from "react";
// // // import { Link, useNavigate } from "react-router-dom";

// // // import { PositionsAPI } from "../../api/positions.api";

// // // import PageHeader from "../../components/fc/PageHeader";
// // // import TableCard from "../../components/fc/TableCard";
// // // import TableFooter from "../../components/fc/TableFooter";
// // // import FiltersBar from "../../components/fc/FiltersBar";

// // // import useListQueryParams from "../../hooks/useListQueryParams";
// // // import useDebouncedValue from "../../hooks/useDebouncedValue";

// // // function pickItems(data) {
// // //   if (!data) return [];
// // //   if (Array.isArray(data)) return data;
// // //   if (Array.isArray(data.items)) return data.items;
// // //   if (Array.isArray(data.result?.items)) return data.result.items;
// // //   if (Array.isArray(data.data?.items)) return data.data.items;
// // //   if (Array.isArray(data.data)) return data.data;
// // //   return [];
// // // }

// // // function pickMeta(data, fallback = { page: 1, limit: 20 }) {
// // //   const total =
// // //     data?.total ??
// // //     data?.result?.total ??
// // //     data?.data?.total ??
// // //     (Array.isArray(data?.items) ? data.items.length : undefined) ??
// // //     0;

// // //   const page =
// // //     data?.page ?? data?.result?.page ?? data?.data?.page ?? fallback.page ?? 1;
// // //   const limit =
// // //     data?.limit ??
// // //     data?.result?.limit ??
// // //     data?.data?.limit ??
// // //     fallback.limit ??
// // //     20;

// // //   return {
// // //     total: Number(total || 0),
// // //     page: Number(page || 1),
// // //     limit: Number(limit || 20),
// // //   };
// // // }

// // // function rowIsActive(it) {
// // //   if (typeof it?.isActive === "boolean") return it.isActive;
// // //   if (typeof it?.active === "boolean") return it.active;
// // //   return true;
// // // }

// // // export default function PositionsList() {
// // //   const navigate = useNavigate();

// // //   // URL params estándar (Template)
// // //   const { params, setParam, setPage, setLimit } = useListQueryParams({
// // //     defaults: { page: 1, limit: 20, q: "", active: "" },
// // //   });

// // //   const page = Number(params.page || 1);
// // //   const limit = Number(params.limit || 20);
// // //   const q = String(params.q || "");
// // //   const active = params.active ?? "";

// // //   // Debounce estándar para no spamear API
// // //   const qDebounced = useDebouncedValue(q, 300);

// // //   const [loading, setLoading] = useState(false);
// // //   const [items, setItems] = useState([]);
// // //   const [total, setTotal] = useState(0);

// // //   const sortedItems = useMemo(() => {
// // //     return [...items].sort((a, b) =>
// // //       String(a?.name || "").localeCompare(String(b?.name || ""), "es", {
// // //         numeric: true,
// // //       }),
// // //     );
// // //   }, [items]);

// // //   useEffect(() => {
// // //     let alive = true;

// // //     const load = async () => {
// // //       setLoading(true);
// // //       try {
// // //         const { data } = await PositionsAPI.list({
// // //           q: qDebounced,
// // //           active,
// // //           page,
// // //           limit,
// // //         });

// // //         if (!alive) return;

// // //         const list = pickItems(data);
// // //         const meta = pickMeta(data, { page, limit });

// // //         setItems(list);
// // //         setTotal(meta.total);
// // //       } catch (e) {
// // //         console.error(e);
// // //         if (!alive) return;
// // //         setItems([]);
// // //         setTotal(0);
// // //       } finally {
// // //         if (alive) setLoading(false);
// // //       }
// // //     };

// // //     load();
// // //     return () => {
// // //       alive = false;
// // //     };
// // //   }, [qDebounced, active, page, limit]);

// // //   const onDelete = async (it) => {
// // //     const name = it?.name || "registro";
// // //     const ok = window.confirm(
// // //       `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
// // //     );
// // //     if (!ok) return;

// // //     try {
// // //       await PositionsAPI.remove(it?._id || it?.id);
// // //       // Mantener negocio: recargar lista
// // //       const { data } = await PositionsAPI.list({
// // //         q: qDebounced,
// // //         active,
// // //         page,
// // //         limit,
// // //       });
// // //       const list = pickItems(data);
// // //       const meta = pickMeta(data, { page, limit });
// // //       setItems(list);
// // //       setTotal(meta.total);
// // //     } catch (e) {
// // //       console.error(e);
// // //       alert("No se pudo eliminar. Revisa la consola.");
// // //     }
// // //   };

// // //   return (
// // //     <div className="p-6 space-y-6">
// // //       <PageHeader
// // //         title="Catálogo · Cargos"
// // //         subtitle="Define cargos/puestos para RRHH y asignaciones."
// // //         actions={
// // //           <Link
// // //             to="new"
// // //             className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
// // //           >
// // //             Nuevo cargo
// // //           </Link>
// // //         }
// // //       />

// // //       <FiltersBar>
// // //         <FiltersBar.Search
// // //           placeholder="Buscar por nombre"
// // //           value={q}
// // //           onChange={(v) => {
// // //             setParam("q", v);
// // //             setPage(1);
// // //           }}
// // //         />

// // //         <FiltersBar.Select
// // //           value={active}
// // //           onChange={(v) => {
// // //             // mantener negocio: "" => todos
// // //             setParam("active", v === "" ? "" : v);
// // //             setPage(1);
// // //           }}
// // //           options={[
// // //             { value: "", label: "Activo (todos)" },
// // //             { value: "true", label: "Solo activos" },
// // //             { value: "false", label: "Solo inactivos" },
// // //           ]}
// // //         />
// // //       </FiltersBar>

// // //       <TableCard>
// // //         <TableCard.Table minWidth={900}>
// // //           <TableCard.Thead>
// // //             <TableCard.Tr>
// // //               <TableCard.Th>Nombre</TableCard.Th>
// // //               <TableCard.Th>Descripción</TableCard.Th>
// // //               <TableCard.Th>Activo</TableCard.Th>
// // //               <TableCard.Th align="right">Acciones</TableCard.Th>
// // //             </TableCard.Tr>
// // //           </TableCard.Thead>

// // //           <TableCard.Tbody>
// // //             {loading ? (
// // //               <TableCard.Empty colSpan={4} text="Cargando…" />
// // //             ) : sortedItems.length === 0 ? (
// // //               <TableCard.Empty colSpan={4} text="Sin registros." />
// // //             ) : (
// // //               sortedItems.map((it) => {
// // //                 const id = it?._id || it?.id;
// // //                 return (
// // //                   <TableCard.Tr key={id}>
// // //                     <TableCard.Td>{it?.name || "—"}</TableCard.Td>
// // //                     <TableCard.Td muted>{it?.description || "—"}</TableCard.Td>
// // //                     <TableCard.Td>{rowIsActive(it) ? "Sí" : "No"}</TableCard.Td>
// // //                     <TableCard.Td align="right">
// // //                       <div className="flex items-center justify-end gap-2">
// // //                         <button
// // //                           className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // //                           onClick={() => navigate(`${id}?mode=view`)}
// // //                         >
// // //                           Ver
// // //                         </button>
// // //                         <button
// // //                           className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // //                           onClick={() => navigate(`${id}`)}
// // //                         >
// // //                           Editar
// // //                         </button>
// // //                         <button
// // //                           className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// // //                           onClick={() => onDelete(it)}
// // //                         >
// // //                           Eliminar
// // //                         </button>
// // //                       </div>
// // //                     </TableCard.Td>
// // //                   </TableCard.Tr>
// // //                 );
// // //               })
// // //             )}
// // //           </TableCard.Tbody>
// // //         </TableCard.Table>

// // //         <TableFooter
// // //           total={total}
// // //           page={page}
// // //           limit={limit}
// // //           onPageChange={(p) => setPage(p)}
// // //           onLimitChange={(l) => {
// // //             setLimit(l);
// // //             setPage(1);
// // //           }}
// // //         />
// // //       </TableCard>
// // //     </div>
// // //   );
// // // }

// // // front/src/pages/Positions/List.jsx
// // // -----------------------------------------------------------------------------
// // // Catálogo → Cargos (Positions) (FleetCore Templates v1.0)
// // // - UI: components/fc
// // // - URL state: q/active/page/limit
// // // - Hook adapter: soporta distintas firmas de useListQueryParams
// // // -----------------------------------------------------------------------------

// // import { useEffect, useMemo, useState } from "react";
// // import { Link, useNavigate, useSearchParams } from "react-router-dom";

// // import { PositionsAPI } from "../../api/positions.api";

// // import PageHeader from "../../components/fc/PageHeader";
// // import TableCard from "../../components/fc/TableCard";
// // import TableFooter from "../../components/fc/TableFooter";
// // import FiltersBar from "../../components/fc/FiltersBar";

// // import useDebouncedValue from "../../hooks/useDebouncedValue";
// // import useListQueryParams from "../../hooks/useListQueryParams";

// // function pickItems(data) {
// //   if (!data) return [];
// //   if (Array.isArray(data)) return data;
// //   if (Array.isArray(data.items)) return data.items;
// //   if (Array.isArray(data.result?.items)) return data.result.items;
// //   if (Array.isArray(data.data?.items)) return data.data.items;
// //   if (Array.isArray(data.data)) return data.data;
// //   return [];
// // }

// // function pickMeta(data, fallback = { page: 1, limit: 20 }) {
// //   const total =
// //     data?.total ??
// //     data?.result?.total ??
// //     data?.data?.total ??
// //     (Array.isArray(data?.items) ? data.items.length : undefined) ??
// //     0;

// //   const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? fallback.page ?? 1;
// //   const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? fallback.limit ?? 20;

// //   return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
// // }

// // function rowIsActive(it) {
// //   if (typeof it?.isActive === "boolean") return it.isActive;
// //   if (typeof it?.active === "boolean") return it.active;
// //   return true;
// // }

// // // Adapter robusto: intenta usar hook, si no calza, cae a useSearchParams.
// // function usePositionsListParams() {
// //   const [sp, setSp] = useSearchParams();

// //   // fallback base (si el hook no sirve)
// //   const fallback = {
// //     page: Number(sp.get("page") || 1),
// //     limit: Number(sp.get("limit") || 20),
// //     q: sp.get("q") || "",
// //     active: sp.get("active") ?? "",
// //     setPage: (p) =>
// //       setSp((prev) => {
// //         const next = new URLSearchParams(prev);
// //         next.set("page", String(p));
// //         return next;
// //       }, { replace: true }),
// //     setLimit: (l) =>
// //       setSp((prev) => {
// //         const next = new URLSearchParams(prev);
// //         next.set("limit", String(l));
// //         next.set("page", "1");
// //         return next;
// //       }, { replace: true }),
// //     setQ: (v) =>
// //       setSp((prev) => {
// //         const next = new URLSearchParams(prev);
// //         if (v) next.set("q", v);
// //         else next.delete("q");
// //         next.set("page", "1");
// //         return next;
// //       }, { replace: true }),
// //     setActive: (v) =>
// //       setSp((prev) => {
// //         const next = new URLSearchParams(prev);
// //         if (v === "" || v === null || typeof v === "undefined") next.delete("active");
// //         else next.set("active", String(v));
// //         next.set("page", "1");
// //         return next;
// //       }, { replace: true }),
// //   };

// //   // intenta hook FleetCore
// //   let hookResult;
// //   try {
// //     hookResult = useListQueryParams?.({ defaults: { page: 1, limit: 20, q: "", active: "" } });
// //   } catch {
// //     hookResult = null;
// //   }

// //   // Variante A: { params, setParam, setPage, setLimit }
// //   if (hookResult?.params) {
// //     const params = hookResult.params || {};
// //     const page = Number(params.page || 1);
// //     const limit = Number(params.limit || 20);
// //     const q = String(params.q || "");
// //     const active = params.active ?? "";

// //     const setParam = hookResult.setParam
// //       ? hookResult.setParam
// //       : (k, v) => {
// //           // por si no existe setParam
// //           if (k === "q") fallback.setQ(v);
// //           if (k === "active") fallback.setActive(v);
// //         };

// //     return {
// //       page,
// //       limit,
// //       q,
// //       active,
// //       setPage: hookResult.setPage || fallback.setPage,
// //       setLimit: hookResult.setLimit || fallback.setLimit,
// //       setQ: (v) => setParam("q", v),
// //       setActive: (v) => setParam("active", v),
// //     };
// //   }

// //   // Variante B: { page, limit, q, active, setPage, setLimit, setQ, setActive }
// //   if (
// //     typeof hookResult?.page !== "undefined" ||
// //     typeof hookResult?.limit !== "undefined" ||
// //     typeof hookResult?.q !== "undefined"
// //   ) {
// //     return {
// //       page: Number(hookResult.page || 1),
// //       limit: Number(hookResult.limit || 20),
// //       q: String(hookResult.q || ""),
// //       active: hookResult.active ?? "",
// //       setPage: hookResult.setPage || fallback.setPage,
// //       setLimit: hookResult.setLimit || fallback.setLimit,
// //       setQ: hookResult.setQ || fallback.setQ,
// //       setActive: hookResult.setActive || fallback.setActive,
// //     };
// //   }

// //   // fallback final
// //   return fallback;
// // }

// // export default function PositionsList() {
// //   const navigate = useNavigate();

// //   const { page, limit, q, active, setPage, setLimit, setQ, setActive } = usePositionsListParams();
// //   const qDebounced = useDebouncedValue(q, 300);

// //   const [loading, setLoading] = useState(false);
// //   const [items, setItems] = useState([]);
// //   const [total, setTotal] = useState(0);

// //   const sortedItems = useMemo(() => {
// //     return [...items].sort((a, b) =>
// //       String(a?.name || "").localeCompare(String(b?.name || ""), "es", { numeric: true })
// //     );
// //   }, [items]);

// //   useEffect(() => {
// //     let alive = true;

// //     const load = async () => {
// //       setLoading(true);
// //       try {
// //         const { data } = await PositionsAPI.list({ q: qDebounced, active, page, limit });
// //         if (!alive) return;
// //         setItems(pickItems(data));
// //         setTotal(pickMeta(data, { page, limit }).total);
// //       } catch (e) {
// //         console.error(e);
// //         if (!alive) return;
// //         setItems([]);
// //         setTotal(0);
// //       } finally {
// //         if (alive) setLoading(false);
// //       }
// //     };

// //     load();
// //     return () => {
// //       alive = false;
// //     };
// //   }, [qDebounced, active, page, limit]);

// //   const onDelete = async (it) => {
// //     const name = it?.name || "registro";
// //     const ok = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
// //     if (!ok) return;

// //     try {
// //       await PositionsAPI.remove(it?._id || it?.id);
// //       // mantener negocio: recargar
// //       const { data } = await PositionsAPI.list({ q: qDebounced, active, page, limit });
// //       setItems(pickItems(data));
// //       setTotal(pickMeta(data, { page, limit }).total);
// //     } catch (e) {
// //       console.error(e);
// //       alert("No se pudo eliminar. Revisa la consola.");
// //     }
// //   };

// //   return (
// //     <div className="p-6 space-y-6">
// //       <PageHeader
// //         title="Catálogo · Cargos"
// //         subtitle="Define cargos/puestos para RRHH y asignaciones."
// //         actions={
// //           <Link
// //             to="new"
// //             className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
// //           >
// //             Nuevo cargo
// //           </Link>
// //         }
// //       />

// //       <FiltersBar>
// //         <FiltersBar.Search
// //           placeholder="Buscar por nombre"
// //           value={q}
// //           onChange={(v) => {
// //             setQ(v);
// //             setPage(1);
// //           }}
// //         />

// //         <FiltersBar.Select
// //           value={active}
// //           onChange={(v) => {
// //             setActive(v);
// //             setPage(1);
// //           }}
// //           options={[
// //             { value: "", label: "Activo (todos)" },
// //             { value: "true", label: "Solo activos" },
// //             { value: "false", label: "Solo inactivos" },
// //           ]}
// //         />
// //       </FiltersBar>

// //       <TableCard>
// //         <TableCard.Table minWidth={900}>
// //           <TableCard.Thead>
// //             <TableCard.Tr>
// //               <TableCard.Th>Nombre</TableCard.Th>
// //               <TableCard.Th>Descripción</TableCard.Th>
// //               <TableCard.Th>Activo</TableCard.Th>
// //               <TableCard.Th align="right">Acciones</TableCard.Th>
// //             </TableCard.Tr>
// //           </TableCard.Thead>

// //           <TableCard.Tbody>
// //             {loading ? (
// //               <TableCard.Empty colSpan={4} text="Cargando…" />
// //             ) : sortedItems.length === 0 ? (
// //               <TableCard.Empty colSpan={4} text="Sin registros." />
// //             ) : (
// //               sortedItems.map((it) => {
// //                 const id = it?._id || it?.id;
// //                 return (
// //                   <TableCard.Tr key={id}>
// //                     <TableCard.Td>{it?.name || "—"}</TableCard.Td>
// //                     <TableCard.Td muted>{it?.description || "—"}</TableCard.Td>
// //                     <TableCard.Td>{rowIsActive(it) ? "Sí" : "No"}</TableCard.Td>
// //                     <TableCard.Td align="right">
// //                       <div className="flex items-center justify-end gap-2">
// //                         <button
// //                           className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// //                           onClick={() => navigate(`${id}?mode=view`)}
// //                         >
// //                           Ver
// //                         </button>
// //                         <button
// //                           className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// //                           onClick={() => navigate(`${id}`)}
// //                         >
// //                           Editar
// //                         </button>
// //                         <button
// //                           className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
// //                           onClick={() => onDelete(it)}
// //                         >
// //                           Eliminar
// //                         </button>
// //                       </div>
// //                     </TableCard.Td>
// //                   </TableCard.Tr>
// //                 );
// //               })
// //             )}
// //           </TableCard.Tbody>
// //         </TableCard.Table>

// //         <TableFooter
// //           total={total}
// //           page={page}
// //           limit={limit}
// //           onPageChange={(p) => setPage(p)}
// //           onLimitChange={(l) => {
// //             setLimit(l);
// //             setPage(1);
// //           }}
// //         />
// //       </TableCard>
// //     </div>
// //   );
// // }

// // front/src/pages/Positions/List.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Cargos (Positions)
// // Patrón estable (basado en VehicleStatuses):
// // - useSearchParams directo (sin hooks template inestables)
// // - filtros inline: q + active + Nuevo
// // - paginación: Paginator + LimitSelect
// // - negocio intacto: PositionsAPI.list({ q, active, page, limit })
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import Paginator from "../../components/table/Paginator";
// import LimitSelect from "../../components/table/LimitSelect";
// import { PositionsAPI } from "../../api/positions.api";

// function pickItems(data) {
//   if (!data) return [];
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data.items)) return data.items;
//   if (Array.isArray(data.result?.items)) return data.result.items;
//   if (Array.isArray(data.data?.items)) return data.data.items;
//   if (Array.isArray(data.data)) return data.data;
//   return [];
// }

// function pickMeta(data) {
//   const total =
//     data?.total ??
//     data?.result?.total ??
//     data?.data?.total ??
//     (Array.isArray(data?.items) ? data.items.length : undefined) ??
//     0;

//   const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
//   const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

//   return {
//     total: Number(total || 0),
//     page: Number(page || 1),
//     limit: Number(limit || 20),
//   };
// }

// function rowIsActive(it) {
//   if (typeof it?.isActive === "boolean") return it.isActive;
//   if (typeof it?.active === "boolean") return it.active;
//   return true;
// }

// export default function PositionsList() {
//   const navigate = useNavigate();
//   const [sp, setSp] = useSearchParams();

//   const page = Number(sp.get("page") || 1);
//   const limit = Number(sp.get("limit") || 20);
//   const q = sp.get("q") || "";
//   const active = sp.get("active") ?? ""; // "" | "true" | "false"

//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);

//   const sortedItems = useMemo(() => {
//     return [...items].sort((a, b) =>
//       String(a?.name || "").localeCompare(String(b?.name || ""), "es", {
//         numeric: true,
//       }),
//     );
//   }, [items]);

//   useEffect(() => {
//     let alive = true;

//     async function load() {
//       setLoading(true);
//       try {
//         const { data } = await PositionsAPI.list({ q, active, page, limit });
//         if (!alive) return;

//         const list = pickItems(data);
//         const meta = pickMeta(data);

//         setItems(list);
//         setTotal(meta.total);
//       } catch (e) {
//         console.error(e);
//         if (!alive) return;
//         setItems([]);
//         setTotal(0);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       alive = false;
//     };
//   }, [q, active, page, limit]);

//   const setParam = (key, value, resetPage = true) => {
//     setSp(
//       (prev) => {
//         const next = new URLSearchParams(prev); // ✅ no mutar el objeto original
//         if (value === "" || value === null || typeof value === "undefined")
//           next.delete(key);
//         else next.set(key, String(value));
//         if (resetPage) next.set("page", "1");
//         return next;
//       },
//       { replace: true },
//     );
//   };

//   const onDelete = async (it) => {
//     const name = it?.name || "registro";
//     const ok = window.confirm(
//       `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
//     );
//     if (!ok) return;

//     try {
//       await PositionsAPI.remove(it?._id || it?.id);

//       // negocio intacto: recargar
//       const { data } = await PositionsAPI.list({ q, active, page, limit });
//       setItems(pickItems(data));
//       setTotal(pickMeta(data).total);
//     } catch (e) {
//       console.error(e);
//       alert("No se pudo eliminar. Revisa la consola.");
//     }
//   };

//   return (
//     <div className="p-4 sm:p-6">
//       {/* Header estándar (igual al módulo que funciona) */}
//       <div className="flex items-start justify-between gap-3 flex-wrap">
//         <div>
//           <h1 className="text-xl font-semibold">Catálogo · Cargos</h1>
//           <p className="text-sm text-slate-500">
//             Define cargos/puestos para RRHH y asignaciones.
//           </p>
//         </div>

//         {/* Buscar + activo + nuevo */}
//         <div className="flex items-center gap-2 flex-wrap justify-end">
//           <input
//             className="border rounded-md px-3 py-2 text-sm w-72"
//             placeholder="Buscar por nombre…"
//             value={q}
//             onChange={(e) => setParam("q", e.target.value)}
//           />

//           <select
//             className="border rounded-md px-3 py-2 text-sm w-48"
//             value={active}
//             onChange={(e) => setParam("active", e.target.value)}
//           >
//             <option value="">Activo (todos)</option>
//             <option value="true">Solo activos</option>
//             <option value="false">Solo inactivos</option>
//           </select>

//           <Link
//             to="new"
//             className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
//           >
//             Nuevo cargo
//           </Link>
//         </div>
//       </div>

//       {/* Tabla + footer */}
//       <div className="bg-white border rounded-2xl overflow-hidden mt-4">
//         <div className="overflow-x-auto">
//           <table className="min-w-[900px] w-full text-sm">
//             <thead className="bg-gray-50 border-b">
//               <tr className="text-left text-gray-700">
//                 <th className="px-4 py-3">Nombre</th>
//                 <th className="px-4 py-3">Descripción</th>
//                 <th className="px-4 py-3">Activo</th>
//                 <th className="px-4 py-3 text-right">Acciones</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td className="px-4 py-6 text-gray-500" colSpan={4}>
//                     Cargando…
//                   </td>
//                 </tr>
//               ) : sortedItems.length === 0 ? (
//                 <tr>
//                   <td className="px-4 py-6 text-gray-500" colSpan={4}>
//                     Sin registros.
//                   </td>
//                 </tr>
//               ) : (
//                 sortedItems.map((it) => {
//                   const id = it?._id || it?.id;
//                   return (
//                     <tr key={id} className="border-t">
//                       <td className="px-4 py-3">{it?.name || "—"}</td>
//                       <td className="px-4 py-3 text-gray-700">
//                         {it?.description || "—"}
//                       </td>
//                       <td className="px-4 py-3">
//                         {rowIsActive(it) ? "Sí" : "No"}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
//                             onClick={() => navigate(`${id}?mode=view`)}
//                           >
//                             Ver
//                           </button>
//                           <button
//                             className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
//                             onClick={() => navigate(`${id}`)}
//                           >
//                             Editar
//                           </button>
//                           <button
//                             className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
//                             onClick={() => onDelete(it)}
//                           >
//                             Eliminar
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
//           <div className="text-sm text-gray-600">Total: {total}</div>

//           <div className="flex items-center gap-3 flex-wrap justify-end">
//             <Paginator
//               page={page}
//               limit={limit}
//               total={total}
//               onPage={(p) => setParam("page", p, false)}
//             />
//             <LimitSelect value={limit} onChange={(v) => setParam("limit", v)} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// front/src/pages/Positions/List.jsx
// -----------------------------------------------------------------------------
// Catálogo → Cargos (Positions)
// Basado 1:1 en VehicleStatuses/List.jsx (módulo estable)
// - Filtros live: q + active (en URL)
// - Tabla dentro de card + footer dentro del card
// - Acciones: Ver / Editar / Eliminar
// - Links ABSOLUTOS (para que no falle por routing no-nested)
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PositionsAPI } from "../../api/positions.api";
import Paginator from "../../components/table/Paginator";
import LimitSelect from "../../components/table/LimitSelect";

const BASE = "/config/catalogs/positions";

function normBool(v) {
  if (v === true || v === false) return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined; // todos
}

function textIncludes(hay, needle) {
  return String(hay || "")
    .toLowerCase()
    .includes(String(needle || "").toLowerCase());
}

function pickItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.result?.items)) return data.result.items;
  if (Array.isArray(data.data?.items)) return data.data.items;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function pickMeta(data) {
  const total =
    data?.total ??
    data?.result?.total ??
    data?.data?.total ??
    (Array.isArray(data?.items) ? data.items.length : undefined) ??
    (Array.isArray(data) ? data.length : 0);

  const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
  const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

  return {
    total: Number(total || 0),
    page: Number(page || 1),
    limit: Number(limit || 20),
  };
}

export default function PositionsList() {
  const [sp, setSp] = useSearchParams();

  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 20);
  const q = sp.get("q") || "";
  const active = sp.get("active") ?? ""; // "" | "true" | "false"

  const [loading, setLoading] = useState(false);
  const [itemsRaw, setItemsRaw] = useState([]);
  const [totalRaw, setTotalRaw] = useState(0);

  const activeBool = useMemo(() => normBool(active), [active]);

  const items = useMemo(() => {
    // Filtro de respaldo (por si backend no filtra)
    let arr = Array.isArray(itemsRaw) ? [...itemsRaw] : [];

    if (activeBool === true) arr = arr.filter((it) => it?.active !== false);
    if (activeBool === false) arr = arr.filter((it) => it?.active === false);

    const qq = q.trim();
    if (qq) {
      arr = arr.filter(
        (it) => textIncludes(it?.name, qq) || textIncludes(it?.description, qq),
      );
    }

    // Orden estable por name
    arr.sort((a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || ""), "es", {
        numeric: true,
      }),
    );

    return arr;
  }, [itemsRaw, q, activeBool]);

  const total = useMemo(() => {
    const backendTotal = Number(totalRaw || 0);
    if (q.trim() || activeBool !== undefined) return items.length;
    return backendTotal || items.length;
  }, [totalRaw, items.length, q, activeBool]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const res = await PositionsAPI.list({ q, active, page, limit });
        if (!alive) return;
        setItemsRaw(res?.items || []);
        setTotalRaw(res?.total ?? 0);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setItemsRaw([]);
        setTotalRaw(0);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [q, active, page, limit]);

  const onDelete = async (it) => {
    const name = it?.name || "registro";
    const ok = window.confirm(
      `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;

    try {
      await PositionsAPI.remove(it?._id || it?.id);
      // recargar manteniendo filtros/paginación
      const res = await PositionsAPI.list({ q, active, page, limit });
      const data = res?.data ?? res;
      const list = data?.items ? data.items : pickItems(data);
      const meta =
        data?.total !== undefined ? { total: data.total } : pickMeta(data);
      setItemsRaw(list || []);
      setTotalRaw(meta?.total ?? 0);
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar. Revisa la consola.");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Catálogo · Cargos</h1>
          <p className="text-sm text-slate-500">
            Define cargos/puestos para RRHH y asignaciones.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <input
            className="border rounded-md px-3 py-2 text-sm w-72"
            placeholder="Buscar por nombre…"
            value={q}
            onChange={(e) =>
              setSp((prev) => {
                const next = new URLSearchParams(prev);
                const v = e.target.value;
                if (v) next.set("q", v);
                else next.delete("q");
                next.set("page", "1");
                return next;
              })
            }
          />

          <select
            className="border rounded-md px-3 py-2 text-sm w-52"
            value={active}
            onChange={(e) =>
              setSp((prev) => {
                const next = new URLSearchParams(prev);
                const v = e.target.value ?? "";
                if (v) next.set("active", v);
                else next.delete("active");
                next.set("page", "1");
                return next;
              })
            }
          >
            <option value="">Activo (todos)</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <Link
            to={`${BASE}/new`}
            className="px-4 py-2 rounded-md bg-[#0B3A66] text-white text-sm font-medium whitespace-nowrap"
          >
            Nuevo cargo
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-600 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left border-b">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                {/* <th className="px-4 py-3 font-semibold">Descripción</th> */}
                <th className="px-4 py-3 font-semibold">Activo</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={4}>
                    Cargando…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={4}>
                    Sin resultados.
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const id = it?._id || it?.id;
                  return (
                    <tr key={id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{it?.name || "—"}</td>
                      {/* <td className="px-4 py-3">{it?.description || "—"}</td> */}
                      <td className="px-4 py-3">
                        {it?.active === false ? "No" : "Sí"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <Link
                            className="px-3 py-1.5 rounded-md border"
                            to={`${BASE}/${id}?mode=view`}
                          >
                            Ver
                          </Link>
                          <Link
                            className="px-3 py-1.5 rounded-md border"
                            to={`${BASE}/${id}`}
                          >
                            Editar
                          </Link>
                          <button
                            className="px-3 py-1.5 rounded-md border"
                            onClick={() => onDelete(it)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-slate-600">Total: {total}</div>

          <div className="flex items-center gap-3">
            <Paginator
              page={page}
              limit={limit}
              total={total}
              onPageChange={(p) =>
                setSp((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("page", String(p));
                  return next;
                })
              }
            />
            <LimitSelect
              value={limit}
              onChange={(v) =>
                setSp((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("limit", String(v));
                  next.set("page", "1");
                  return next;
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
