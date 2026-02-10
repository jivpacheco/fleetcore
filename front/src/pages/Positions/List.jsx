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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            className="px-4 py-2 rounded-md bg-[#0B3A66] text-white text-sm font-medium whitespace-nowrap w-full sm:w-auto text-center"
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
