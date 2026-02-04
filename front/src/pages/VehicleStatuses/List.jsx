// // front/src/pages/VehicleStatuses/List.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Estados de Vehículo (FleetCore Standard v1.0)
// // - List paginado: items/total/page/limit
// // - Filtros inline (como Repairs): búsqueda + activo + nuevo
// // - Tabla sana en móvil: overflow-x-auto + min-w
// // -----------------------------------------------------------------------------
// import { useEffect, useState } from "react";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import Paginator from "../../components/table/Paginator";
// import LimitSelect from "../../components/table/LimitSelect";
// import { VehicleStatusesAPI } from "../../api/vehicleStatuses.api";

// export default function VehicleStatusesList() {
//     const navigate = useNavigate();
//     const [sp, setSp] = useSearchParams();

//     const page = Number(sp.get("page") || 1);
//     const limit = Number(sp.get("limit") || 20);
//     const q = sp.get("q") || "";
//     const active = sp.get("active") ?? "";

//     const [loading, setLoading] = useState(false);
//     const [items, setItems] = useState([]);
//     const [total, setTotal] = useState(0);

//     const load = async () => {
//         setLoading(true);
//         try {
//             const res = await VehicleStatusesAPI.list({ q, active, page, limit });
//             setItems(Array.isArray(res.items) ? res.items : []);
//             setTotal(Number(res.total || 0));
//         } catch (e) {
//             console.error(e);
//             setItems([]);
//             setTotal(0);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         load();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [q, active, page, limit]);

//     const rowIsActive = (it) => {
//         if (typeof it?.isActive === "boolean") return it.isActive;
//         if (typeof it?.active === "boolean") return it.active;
//         if (typeof it?.enabled === "boolean") return it.enabled;
//         return Boolean(it?.active ?? it?.isActive ?? true);
//     };

//     const onDelete = async (it) => {
//         const name = it?.name || it?.label || it?.code || "registro";
//         const ok = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`);
//         if (!ok) return;
//         try {
//             await VehicleStatusesAPI.remove(it?._id || it?.id);
//             await load();
//         } catch (e) {
//             console.error(e);
//             alert("No se pudo eliminar. Revisa la consola.");
//         }
//     };

//     return (
//         <div className="p-6 space-y-6">
//             {/* Franja superior */}
//             <div className="flex items-start justify-between gap-3 flex-wrap">
//                 <div>
//                     <h1 className="text-xl font-bold">Catálogo · Estados de Vehículo</h1>
//                     <p className="text-gray-500 text-sm">
//                         Define estados operacionales (p. ej., ACTIVO, EN REPARACIÓN, FUERA DE SERVICIO).
//                     </p>
//                 </div>

//                 {/* Controles inline (estándar tipo Repairs) */}
//                 <div className="flex items-center gap-2 flex-wrap justify-end">
//                     <input
//                         className="border rounded-md px-3 py-2 text-sm w-56"
//                         placeholder="Buscar (código o nombre)..."
//                         value={q}
//                         onChange={(e) =>
//                             setSp(
//                                 (prev) => {
//                                     const v = e.target.value;
//                                     if (v) prev.set("q", v);
//                                     else prev.delete("q");
//                                     prev.set("page", "1");
//                                     return prev;
//                                 },
//                                 { replace: true }
//                             )
//                         }
//                     />

//                     <select
//                         className="border rounded-md px-3 py-2 text-sm w-48"
//                         value={active}
//                         onChange={(e) =>
//                             setSp(
//                                 (prev) => {
//                                     const v = e.target.value;
//                                     if (v === "") prev.delete("active");
//                                     else prev.set("active", v);
//                                     prev.set("page", "1");
//                                     return prev;
//                                 },
//                                 { replace: true }
//                             )
//                         }
//                     >
//                         <option value="">Activo (todos)</option>
//                         <option value="true">Solo activos</option>
//                         <option value="false">Solo inactivos</option>
//                     </select>

//                     <Link
//                         to="new"
//                         className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
//                     >
//                         Nuevo estado
//                     </Link>
//                 </div>
//             </div>

//             {/* Tabla */}
//             <div className="bg-white border rounded-2xl overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="min-w-[900px] w-full text-sm">
//                         <thead className="bg-gray-50 border-b">
//                             <tr className="text-left text-gray-700">
//                                 <th className="px-4 py-3">Código</th>
//                                 <th className="px-4 py-3">Nombre</th>
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
//                             ) : items.length === 0 ? (
//                                 <tr>
//                                     <td className="px-4 py-6 text-gray-500" colSpan={4}>
//                                         Sin registros.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 items.map((it) => {
//                                     const id = it?._id || it?.id;
//                                     return (
//                                         <tr key={id} className="border-t">
//                                             <td className="px-4 py-3 font-mono text-xs">{it?.code || it?.key || "—"}</td>
//                                             <td className="px-4 py-3">{it?.name || it?.label || "—"}</td>
//                                             <td className="px-4 py-3">{rowIsActive(it) ? "Sí" : "No"}</td>
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

//                 {/* Footer */}
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
//                                         prev.set("page", String(p));
//                                         return prev;
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
//                                         prev.set("limit", String(v));
//                                         prev.set("page", "1");
//                                         return prev;
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

// front/src/pages/VehicleStatuses/List.jsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { VehicleStatusesAPI } from "../../api/vehicleStatuses.api"

export default function VehicleStatusesList() {
    const navigate = useNavigate()
    const [sp, setSp] = useSearchParams()

    const page = Number(sp.get("page") || 1)
    const limit = Number(sp.get("limit") || 20)

    // filtros en URL (estándar FleetCore)
    const qParam = sp.get("q") || ""
    const activeParam = sp.get("active") || "" // "" | "true" | "false"

    // estado de UI (inputs controlados)
    const [q, setQ] = useState(qParam)
    const [active, setActive] = useState(activeParam)

    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total, limit])

    // sincroniza inputs si cambian params externos
    useEffect(() => setQ(qParam), [qParam])
    useEffect(() => setActive(activeParam), [activeParam])

    async function load() {
        setLoading(true)
        try {
            const res = await VehicleStatusesAPI.list({
                q: qParam,
                active: activeParam, // "" | "true" | "false"
                page,
                limit,
            })
            setItems(res?.items || [])
            setTotal(Number(res?.total || 0))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [qParam, activeParam, page, limit]) // eslint-disable-line

    const applyFilters = () => {
        const next = new URLSearchParams(sp)
        if (q.trim()) next.set("q", q.trim())
        else next.delete("q")

        // activo: "" = todos
        if (active) next.set("active", active)
        else next.delete("active")

        next.set("page", "1") // al filtrar volvemos a pág 1
        setSp(next)
    }

    const clearFilters = () => {
        const next = new URLSearchParams(sp)
        next.delete("q")
        next.delete("active")
        next.set("page", "1")
        setSp(next)
    }

    const goPage = (p) => {
        const next = new URLSearchParams(sp)
        next.set("page", String(Math.min(Math.max(1, p), totalPages)))
        setSp(next)
    }

    const setLimit = (v) => {
        const next = new URLSearchParams(sp)
        next.set("limit", String(v))
        next.set("page", "1")
        setSp(next)
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Header estándar FleetCore */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Catálogo · Estados de Vehículo</h1>
                    <p className="text-sm text-slate-500">
                        Define estados operacionales (p. ej., ACTIVO, EN REPARACIÓN, FUERA DE SERVICIO).
                    </p>
                </div>

                <button
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0B3A66] text-white font-medium hover:opacity-95"
                    onClick={() => navigate("new")}
                >
                    Nuevo estado
                </button>
            </div>

            {/* Filtros inline (como Repairs) */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-6 sm:items-center">
                    <input
                        className="sm:col-span-2 w-full border rounded-lg px-3 py-2"
                        placeholder="Buscar (código o nombre)…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") applyFilters() }}
                    />

                    <select
                        className="sm:col-span-2 w-full border rounded-lg px-3 py-2"
                        value={active}
                        onChange={(e) => setActive(e.target.value)}
                    >
                        <option value="">Activo (todos)</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>

                    <select
                        className="sm:col-span-1 w-full border rounded-lg px-3 py-2"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    >
                        <option value={10}>10 / pág</option>
                        <option value={20}>20 / pág</option>
                        <option value={50}>50 / pág</option>
                    </select>

                    <div className="sm:col-span-1 flex gap-2 justify-end">
                        <button className="px-4 py-2 rounded-lg bg-[#0B3A66] text-white" onClick={applyFilters}>
                            Buscar
                        </button>
                        <button className="px-4 py-2 rounded-lg border" onClick={clearFilters}>
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla + footer dentro del mismo contenedor (cierra bien el card) */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr className="text-left border-b">
                                <th className="px-4 py-3 font-semibold">Código</th>
                                <th className="px-4 py-3 font-semibold">Nombre</th>
                                <th className="px-4 py-3 font-semibold">Activo</th>
                                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td className="px-4 py-6 text-slate-500" colSpan={4}>Cargando…</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-slate-500" colSpan={4}>Sin resultados.</td>
                                </tr>
                            ) : (
                                items.map((it) => (
                                    <tr key={it?._id || it?.id || it?.code} className="border-b last:border-b-0">
                                        <td className="px-4 py-3">{it?.code || it?.key || "—"}</td>
                                        <td className="px-4 py-3">{it?.name || it?.label || "—"}</td>
                                        <td className="px-4 py-3">{it?.active === false ? "No" : "Sí"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    className="px-3 py-1.5 rounded-lg border"
                                                    onClick={() => navigate(`${it?._id || it?.id}?mode=view`)}
                                                >
                                                    Ver
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 rounded-lg border"
                                                    onClick={() => navigate(String(it?._id || it?.id))}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 rounded-lg border"
                                                    onClick={() => navigate(`${it?._id || it?.id}`)} // eliminar se hace desde form (recomendado)
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: aquí se “cierra” bien el contenedor */}
                <div className="border-t px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-600">Total: {total}</div>

                    <div className="flex items-center gap-2 justify-end">
                        <button className="px-3 py-2 rounded-lg border" disabled={page <= 1} onClick={() => goPage(page - 1)}>
                            Anterior
                        </button>
                        <div className="text-sm text-slate-600">Página {page} / {totalPages}</div>
                        <button className="px-3 py-2 rounded-lg border" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
