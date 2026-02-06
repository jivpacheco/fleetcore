// // // front/src/pages/Positions/List.jsx
// // // -----------------------------------------------------------------------------
// // // Catálogo → Cargos (Positions) (FleetCore Standard v1.0)
// // // - List paginado (items/total/page/limit) sobre PositionsAPI.list
// // // - Filtros inline (estándar tipo Repairs)
// // // -----------------------------------------------------------------------------
// // import { useEffect, useState } from "react";
// // import { Link, useNavigate, useSearchParams } from "react-router-dom";
// // import Paginator from "../../components/table/Paginator";
// // import LimitSelect from "../../components/table/LimitSelect";
// // import { PositionsAPI } from "../../api/positions.api";

// // function pickItems(data) {
// //     if (!data) return [];
// //     if (Array.isArray(data)) return data;
// //     if (Array.isArray(data.items)) return data.items;
// //     if (Array.isArray(data.result?.items)) return data.result.items;
// //     if (Array.isArray(data.data?.items)) return data.data.items;
// //     if (Array.isArray(data.data)) return data.data;
// //     return [];
// // }
// // function pickMeta(data) {
// //     const total = data?.total ?? data?.result?.total ?? data?.data?.total ?? (Array.isArray(data?.items) ? data.items.length : undefined) ?? 0;
// //     const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
// //     const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;
// //     return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
// // }

// // export default function PositionsList() {
// //     const navigate = useNavigate();
// //     const [sp, setSp] = useSearchParams();

// //     const page = Number(sp.get("page") || 1);
// //     const limit = Number(sp.get("limit") || 20);
// //     const q = sp.get("q") || "";
// //     const active = sp.get("active") ?? "";

// //     const [loading, setLoading] = useState(false);
// //     const [items, setItems] = useState([]);
// //     const [total, setTotal] = useState(0);

// //     const load = async () => {
// //         setLoading(true);
// //         try {
// //             const { data } = await PositionsAPI.list({ q, active, page, limit });
// //             const list = pickItems(data);
// //             const sorted = [...list].sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "es", { numeric: true }));
// //             setItems(sorted);
// //             setTotal(pickMeta(data).total);
// //         } catch (e) {
// //             console.error(e);
// //             setItems([]);
// //             setTotal(0);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, active, page, limit]);

// //     const rowIsActive = (it) => {
// //         if (typeof it?.isActive === "boolean") return it.isActive;
// //         if (typeof it?.active === "boolean") return it.active;
// //         return true;
// //     };

// //     const onDelete = async (it) => {
// //         const name = it?.name || "registro";
// //         const ok = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
// //         if (!ok) return;
// //         try {
// //             await PositionsAPI.remove(it?._id || it?.id);
// //             await load();
// //         } catch (e) {
// //             console.error(e);
// //             alert("No se pudo eliminar. Revisa la consola.");
// //         }
// //     };

// //     return (
// //         <div className="p-6 space-y-6">
// //             <div className="flex items-start justify-between gap-3 flex-wrap">
// //                 <div>
// //                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
// //                     <p className="text-gray-500 text-sm">Define cargos/puestos para RRHH y asignaciones.</p>
// //                 </div>

// //                 <div className="flex items-center gap-2 flex-wrap justify-end">
// //                     <input
// //                         className="border rounded-md px-3 py-2 text-sm w-56"
// //                         placeholder="Buscar por nombre"
// //                         value={q}
// //                         onChange={(e) =>
// //                             setSp((prev) => {
// //                                 const v = e.target.value;
// //                                 if (v) prev.set("q", v);
// //                                 else prev.delete("q");
// //                                 prev.set("page", "1");
// //                                 return prev;
// //                             }, { replace: true })
// //                         }
// //                     />

// //                     <select
// //                         className="border rounded-md px-3 py-2 text-sm w-48"
// //                         value={active}
// //                         onChange={(e) =>
// //                             setSp((prev) => {
// //                                 const v = e.target.value;
// //                                 if (v === "") prev.delete("active");
// //                                 else prev.set("active", v);
// //                                 prev.set("page", "1");
// //                                 return prev;
// //                             }, { replace: true })
// //                         }
// //                     >
// //                         <option value="">Activo (todos)</option>
// //                         <option value="true">Solo activos</option>
// //                         <option value="false">Solo inactivos</option>
// //                     </select>

// //                     <Link to="new" className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95">
// //                         Nuevo cargo
// //                     </Link>
// //                 </div>
// //             </div>

// //             <div className="bg-white border rounded-2xl overflow-hidden">
// //                 <div className="overflow-x-auto">
// //                     <table className="min-w-[900px] w-full text-sm">
// //                         <thead className="bg-gray-50 border-b">
// //                             <tr className="text-left text-gray-700">
// //                                 <th className="px-4 py-3">Nombre</th>
// //                                 <th className="px-4 py-3">Descripción</th>
// //                                 <th className="px-4 py-3">Activo</th>
// //                                 <th className="px-4 py-3 text-right">Acciones</th>
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {loading ? (
// //                                 <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Cargando…</td></tr>
// //                             ) : items.length === 0 ? (
// //                                 <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Sin registros.</td></tr>
// //                             ) : (
// //                                 items.map((it) => {
// //                                     const id = it?._id || it?.id;
// //                                     return (
// //                                         <tr key={id} className="border-t">
// //                                             <td className="px-4 py-3">{it?.name || "—"}</td>
// //                                             <td className="px-4 py-3 text-gray-700">{it?.description || "—"}</td>
// //                                             <td className="px-4 py-3">{rowIsActive(it) ? "Sí" : "No"}</td>
// //                                             <td className="px-4 py-3">
// //                                                 <div className="flex items-center justify-end gap-2">
// //                                                     <button className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={() => navigate(`${id}?mode=view`)}>
// //                                                         Ver
// //                                                     </button>
// //                                                     <button className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={() => navigate(`${id}`)}>
// //                                                         Editar
// //                                                     </button>
// //                                                     <button className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={() => onDelete(it)}>
// //                                                         Eliminar
// //                                                     </button>
// //                                                 </div>
// //                                             </td>
// //                                         </tr>
// //                                     );
// //                                 })
// //                             )}
// //                         </tbody>
// //                     </table>
// //                 </div>

// //                 <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
// //                     <div className="text-sm text-gray-600">Total: {total}</div>
// //                     <div className="flex items-center gap-3 flex-wrap justify-end">
// //                         <Paginator page={page} limit={limit} total={total} onPage={(p) => setSp(prev => { prev.set("page", String(p)); return prev; }, { replace: true })} />
// //                         <LimitSelect value={limit} onChange={(v) => setSp(prev => { prev.set("limit", String(v)); prev.set("page", "1"); return prev; }, { replace: true })} />
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }

// // front/src/pages/Positions/List.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Cargos (Positions) (FleetCore Templates v1.0)
// // - List paginado sobre PositionsAPI.list({ q, active, page, limit })
// // - Filtros en URL: ?q=&active=&page=&limit=
// // - Acciones: Ver (?mode=view), Editar, Eliminar
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import Paginator from "../../components/table/Paginator";
// import LimitSelect from "../../components/table/LimitSelect";
// import { PositionsAPI } from "../../api/positions.api";

// // Debounce interno (fallback si aún no usas useDebouncedValue del template)
// function useDebounced(value, delay = 350) {
//     const [v, setV] = useState(value);
//     useEffect(() => {
//         const t = setTimeout(() => setV(value), delay);
//         return () => clearTimeout(t);
//     }, [value, delay]);
//     return v;
// }

// function pickItems(data) {
//     if (!data) return [];
//     if (Array.isArray(data)) return data;
//     if (Array.isArray(data.items)) return data.items;
//     if (Array.isArray(data.result?.items)) return data.result.items;
//     if (Array.isArray(data.data?.items)) return data.data.items;
//     if (Array.isArray(data.data)) return data.data;
//     return [];
// }

// function pickMeta(data, fallbackLimit = 20) {
//     const total =
//         data?.total ??
//         data?.result?.total ??
//         data?.data?.total ??
//         (Array.isArray(data?.items) ? data.items.length : undefined) ??
//         0;

//     const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
//     const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? fallbackLimit;

//     return {
//         total: Number(total || 0),
//         page: Number(page || 1),
//         limit: Number(limit || fallbackLimit),
//     };
// }

// function getActive(it) {
//     if (typeof it?.isActive === "boolean") return it.isActive;
//     if (typeof it?.active === "boolean") return it.active;
//     return true;
// }

// export default function PositionsList() {
//     const navigate = useNavigate();
//     const [sp, setSp] = useSearchParams();

//     const page = Number(sp.get("page") || 1);
//     const limit = Number(sp.get("limit") || 20);
//     const qParam = sp.get("q") || "";
//     const active = sp.get("active") ?? "";

//     // Input controlado (evita que el usuario pierda el cursor si cambian sp)
//     const [qInput, setQInput] = useState(qParam);
//     useEffect(() => setQInput(qParam), [qParam]);

//     const q = useDebounced(qInput, 300);

//     const [loading, setLoading] = useState(false);
//     const [items, setItems] = useState([]);
//     const [total, setTotal] = useState(0);

//     const sortedItems = useMemo(() => {
//         return [...items].sort((a, b) =>
//             String(a?.name || "").localeCompare(String(b?.name || ""), "es", { numeric: true })
//         );
//     }, [items]);

//     // Mantener URL sincronizada con el debounce
//     useEffect(() => {
//         setSp(
//             (prev) => {
//                 const next = new URLSearchParams(prev);
//                 if (q) next.set("q", q);
//                 else next.delete("q");
//                 next.set("page", "1");
//                 return next;
//             },
//             { replace: true }
//         );
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [q]);

//     const load = async () => {
//         setLoading(true);
//         try {
//             const { data } = await PositionsAPI.list({ q: qParam, active, page, limit });
//             const list = pickItems(data);
//             const meta = pickMeta(data, limit);

//             setItems(list);
//             setTotal(meta.total);
//         } catch (err) {
//             console.error(err);
//             setItems([]);
//             setTotal(0);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         load();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [qParam, active, page, limit]);

//     const setParam = (key, value, resetPage = true) => {
//         setSp(
//             (prev) => {
//                 const next = new URLSearchParams(prev);
//                 if (value === "" || value === null || typeof value === "undefined") next.delete(key);
//                 else next.set(key, String(value));
//                 if (resetPage) next.set("page", "1");
//                 return next;
//             },
//             { replace: true }
//         );
//     };

//     const onDelete = async (it) => {
//         const id = it?._id || it?.id;
//         const name = it?.name || "registro";
//         const ok = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
//         if (!ok) return;

//         try {
//             await PositionsAPI.remove(id);
//             await load();
//         } catch (err) {
//             console.error(err);
//             alert("No se pudo eliminar. Revisa la consola.");
//         }
//     };

//     return (
//         <div className="p-6 space-y-6">
//             {/* Header + filtros (tipo Repairs) */}
//             <div className="flex items-start justify-between gap-3 flex-wrap">
//                 <div>
//                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
//                     <p className="text-gray-500 text-sm">Define cargos/puestos para RRHH y asignaciones.</p>
//                 </div>

//                 <div className="flex items-center gap-2 flex-wrap justify-end">
//                     <input
//                         className="border rounded-md px-3 py-2 text-sm w-56"
//                         placeholder="Buscar por nombre"
//                         value={qInput}
//                         onChange={(e) => setQInput(e.target.value)}
//                     />

//                     <select
//                         className="border rounded-md px-3 py-2 text-sm w-48"
//                         value={active}
//                         onChange={(e) => setParam("active", e.target.value)}
//                     >
//                         <option value="">Activo (todos)</option>
//                         <option value="true">Solo activos</option>
//                         <option value="false">Solo inactivos</option>
//                     </select>

//                     <Link
//                         to="new"
//                         className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
//                     >
//                         Nuevo cargo
//                     </Link>
//                 </div>
//             </div>

//             <div className="bg-white border rounded-2xl overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="min-w-[900px] w-full text-sm">
//                         <thead className="bg-gray-50 border-b">
//                             <tr className="text-left text-gray-700">
//                                 <th className="px-4 py-3">Nombre</th>
//                                 <th className="px-4 py-3">Descripción</th>
//                                 <th className="px-4 py-3">Activo</th>
//                                 <th className="px-4 py-3 text-right">Acciones</th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {loading ? (
//                                 <tr>
//                                     <td className="px-4 py-6 text-gray-500" colSpan={4}>
//                                         Cargando…
//                                     </td>
//                                 </tr>
//                             ) : sortedItems.length === 0 ? (
//                                 <tr>
//                                     <td className="px-4 py-6 text-gray-500" colSpan={4}>
//                                         Sin registros.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 sortedItems.map((it) => {
//                                     const id = it?._id || it?.id;
//                                     return (
//                                         <tr key={id} className="border-t">
//                                             <td className="px-4 py-3">{it?.name || "—"}</td>
//                                             <td className="px-4 py-3 text-gray-700">{it?.description || "—"}</td>
//                                             <td className="px-4 py-3">{getActive(it) ? "Sí" : "No"}</td>
//                                             <td className="px-4 py-3">
//                                                 <div className="flex items-center justify-end gap-2">
//                                                     <button
//                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
//                                                         onClick={() => navigate(`${id}?mode=view`)}
//                                                     >
//                                                         Ver
//                                                     </button>
//                                                     <button
//                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
//                                                         onClick={() => navigate(`${id}`)}
//                                                     >
//                                                         Editar
//                                                     </button>
//                                                     <button
//                                                         className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
//                                                         onClick={() => onDelete(it)}
//                                                     >
//                                                         Eliminar
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
//                     <div className="text-sm text-gray-600">Total: {total}</div>

//                     <div className="flex items-center gap-3 flex-wrap justify-end">
//                         <Paginator
//                             page={page}
//                             limit={limit}
//                             total={total}
//                             onPage={(p) =>
//                                 setSp(
//                                     (prev) => {
//                                         const next = new URLSearchParams(prev);
//                                         next.set("page", String(p));
//                                         return next;
//                                     },
//                                     { replace: true }
//                                 )
//                             }
//                         />

//                         <LimitSelect
//                             value={limit}
//                             onChange={(v) =>
//                                 setSp(
//                                     (prev) => {
//                                         const next = new URLSearchParams(prev);
//                                         next.set("limit", String(v));
//                                         next.set("page", "1");
//                                         return next;
//                                     },
//                                     { replace: true }
//                                 )
//                             }
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// front/src/pages/Positions/List.jsx
// -----------------------------------------------------------------------------
// Catálogo → Cargos (Positions) (FleetCore Standard v1.0)
// - List paginado (items/total/page/limit) sobre PositionsAPI.list
// - Filtros inline (estándar tipo Repairs)
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Paginator from "../../components/table/Paginator";
import LimitSelect from "../../components/table/LimitSelect";
import { PositionsAPI } from "../../api/positions.api";

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
        0;

    const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
    const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

    return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
}

export default function PositionsList() {
    const navigate = useNavigate();
    const [sp, setSp] = useSearchParams();

    const page = Number(sp.get("page") || 1);
    const limit = Number(sp.get("limit") || 20);
    const q = sp.get("q") || "";
    const active = sp.get("active") ?? "";

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) =>
            String(a?.name || "").localeCompare(String(b?.name || ""), "es", { numeric: true })
        );
    }, [items]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await PositionsAPI.list({ q, active, page, limit });
            const list = pickItems(data);
            setItems(list);
            setTotal(pickMeta(data).total);
        } catch (e) {
            console.error(e);
            setItems([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [q, active, page, limit]);

    useEffect(() => {
        load();
    }, [load]);

    const rowIsActive = (it) => {
        if (typeof it?.isActive === "boolean") return it.isActive;
        if (typeof it?.active === "boolean") return it.active;
        return true;
    };

    const setParam = (key, value) => {
        setSp(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (value === "" || value === null || typeof value === "undefined") next.delete(key);
                else next.set(key, String(value));
                next.set("page", "1");
                return next;
            },
            { replace: true }
        );
    };

    const onDelete = async (it) => {
        const name = it?.name || "registro";
        const ok = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
        if (!ok) return;

        try {
            await PositionsAPI.remove(it?._id || it?.id);
            await load();
        } catch (e) {
            console.error(e);
            alert("No se pudo eliminar. Revisa la consola.");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
                    <p className="text-gray-500 text-sm">Define cargos/puestos para RRHH y asignaciones.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <input
                        className="border rounded-md px-3 py-2 text-sm w-56"
                        placeholder="Buscar por nombre"
                        value={q}
                        onChange={(e) => setParam("q", e.target.value)}
                    />

                    <select
                        className="border rounded-md px-3 py-2 text-sm w-48"
                        value={active}
                        onChange={(e) => setParam("active", e.target.value)}
                    >
                        <option value="">Activo (todos)</option>
                        <option value="true">Solo activos</option>
                        <option value="false">Solo inactivos</option>
                    </select>

                    <Link
                        to="new"
                        className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
                    >
                        Nuevo cargo
                    </Link>
                </div>
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-left text-gray-700">
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Descripción</th>
                                <th className="px-4 py-3">Activo</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td className="px-4 py-6 text-gray-500" colSpan={4}>
                                        Cargando…
                                    </td>
                                </tr>
                            ) : sortedItems.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-gray-500" colSpan={4}>
                                        Sin registros.
                                    </td>
                                </tr>
                            ) : (
                                sortedItems.map((it) => {
                                    const id = it?._id || it?.id;
                                    return (
                                        <tr key={id} className="border-t">
                                            <td className="px-4 py-3">{it?.name || "—"}</td>
                                            <td className="px-4 py-3 text-gray-700">{it?.description || "—"}</td>
                                            <td className="px-4 py-3">{rowIsActive(it) ? "Sí" : "No"}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                                                        onClick={() => navigate(`${id}?mode=view`)}
                                                    >
                                                        Ver
                                                    </button>
                                                    <button
                                                        className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                                                        onClick={() => navigate(`${id}`)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
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

                <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-sm text-gray-600">Total: {total}</div>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                        <Paginator
                            page={page}
                            limit={limit}
                            total={total}
                            onPage={(p) =>
                                setSp(
                                    (prev) => {
                                        const next = new URLSearchParams(prev);
                                        next.set("page", String(p));
                                        return next;
                                    },
                                    { replace: true }
                                )
                            }
                        />
                        <LimitSelect
                            value={limit}
                            onChange={(v) =>
                                setSp(
                                    (prev) => {
                                        const next = new URLSearchParams(prev);
                                        next.set("limit", String(v));
                                        next.set("page", "1");
                                        return next;
                                    },
                                    { replace: true }
                                )
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
