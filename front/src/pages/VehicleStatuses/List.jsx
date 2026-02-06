// front/src/pages/VehicleStatuses/List.jsx
// -----------------------------------------------------------------------------
// Catálogo → Estados de Vehículo
// - Listado paginado (items/total/page/limit)
// - Filtros live (sin botón Buscar): q + active
// - UI alineada al estándar FleetCore (Repairs / FailureReports)
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { VehicleStatusesAPI } from "../../api/vehicleStatuses.api";
import Paginator from "../../components/table/Paginator";
import LimitSelect from "../../components/table/LimitSelect";

function normBool(v) {
    if (v === true || v === false) return v;
    if (v === "true") return true;
    if (v === "false") return false;
    return undefined; // todos
}

function textIncludes(hay, needle) {
    return String(hay || "").toLowerCase().includes(String(needle || "").toLowerCase());
}

export default function VehicleStatusesList() {
    const [sp, setSp] = useSearchParams();

    const page = Number(sp.get("page") || 1);
    const limit = Number(sp.get("limit") || 20);

    // filtros live (mismo patrón que Repairs)
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
            arr = arr.filter((it) =>
                textIncludes(it?.code, qq) ||
                textIncludes(it?.name, qq) ||
                textIncludes(it?.label, qq)
            );
        }

        // Orden estable por código y nombre
        arr.sort((a, b) => {
            const ac = String(a?.code || "").toLowerCase();
            const bc = String(b?.code || "").toLowerCase();
            if (ac !== bc) return ac.localeCompare(bc, undefined, { numeric: true });
            const an = String(a?.name || a?.label || "").toLowerCase();
            const bn = String(b?.name || b?.label || "").toLowerCase();
            return an.localeCompare(bn, undefined, { numeric: true });
        });

        return arr;
    }, [itemsRaw, q, activeBool]);

    const total = useMemo(() => {
        // si filtramos en frontend, total debe reflejar el filtrado
        const backendTotal = Number(totalRaw || 0);
        if (q.trim() || activeBool !== undefined) return items.length;
        return backendTotal || items.length;
    }, [totalRaw, items.length, q, activeBool]);

    useEffect(() => {
        let alive = true;
        async function load() {
            setLoading(true);
            try {
                const res = await VehicleStatusesAPI.list({ q, active, page, limit });
                if (!alive) return;
                setItemsRaw(res?.items || []);
                setTotalRaw(res?.total ?? 0);
            } finally {
                if (alive) setLoading(false);
            }
        }
        load();
        return () => {
            alive = false;
        };
    }, [q, active, page, limit]);

    return (
        <div className="p-4 sm:p-6">
            {/* Header estándar */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-semibold">Catálogo · Estados de Vehículo</h1>
                    <p className="text-sm text-slate-500">
                        Define estados operacionales (p. ej., ACTIVO, EN REPARACIÓN, FUERA DE SERVICIO).
                    </p>
                </div>

                {/* TODO EN UNA LÍNEA (buscar + activo + nuevo) */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <input
                        className="border rounded-md px-3 py-2 text-sm w-72"
                        placeholder="Buscar (código o nombre)…"
                        value={q}
                        onChange={(e) =>
                            setSp((prev) => {
                                const v = e.target.value;
                                if (v) prev.set("q", v);
                                else prev.delete("q");
                                prev.set("page", "1");
                                return prev;
                            })
                        }
                    />

                    <select
                        className="border rounded-md px-3 py-2 text-sm w-52"
                        value={active}
                        onChange={(e) =>
                            setSp((prev) => {
                                const v = e.target.value ?? "";
                                if (v) prev.set("active", v);
                                else prev.delete("active");
                                prev.set("page", "1");
                                return prev;
                            })
                        }
                    >
                        <option value="">Activo (todos)</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>

                    <Link
                        to="new"
                        className="px-4 py-2 rounded-md bg-[#0B3A66] text-white text-sm font-medium whitespace-nowrap"
                    >
                        Nuevo estado
                    </Link>
                </div>
            </div>

            {/* Tabla en card (cierra bien el contenedor, footer dentro) */}
            {/* <div className="bg-white rounded-lg shadow-sm border overflow-hidden"> */}
            <div className="mt-6 rounded-lg border border-slate-600 bg-white overflow-hidden">
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
                                items.map((it) => (
                                    <tr key={it?._id || it?.id || it?.code} className="border-b last:border-b-0">
                                        <td className="px-4 py-3">{it?.code || "—"}</td>
                                        <td className="px-4 py-3">{it?.name || it?.label || "—"}</td>
                                        <td className="px-4 py-3">{it?.active === false ? "No" : "Sí"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 justify-end">
                                                <Link
                                                    className="px-3 py-1.5 rounded-md border"
                                                    to={`${it?._id || it?.id}?mode=view`}
                                                >
                                                    Ver
                                                </Link>
                                                <Link
                                                    className="px-3 py-1.5 rounded-md border"
                                                    to={`${it?._id || it?.id}`}
                                                >
                                                    Editar
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer (dentro del card) */}
                <div className="border-t px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-sm text-slate-600">Total: {total}</div>

                    <div className="flex items-center gap-3">
                        <Paginator
                            page={page}
                            limit={limit}
                            total={total}
                            onPageChange={(p) =>
                                setSp((prev) => {
                                    prev.set("page", String(p));
                                    return prev;
                                })
                            }
                        />
                        <LimitSelect
                            value={limit}
                            onChange={(v) =>
                                setSp((prev) => {
                                    prev.set("limit", String(v));
                                    prev.set("page", "1");
                                    return prev;
                                })
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
