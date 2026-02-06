// front/src/pages/Roles/List.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Paginator from "../../components/table/Paginator";
import LimitSelect from "../../components/table/LimitSelect";
import { RolesAPI } from "../../api/roles.api";

const BASE = "/config/catalogs/roles";

export default function RolesList() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 20);
  const q = sp.get("q") || "";
  const active = sp.get("active") ?? "";
  const scope = sp.get("scope") ?? "";
  const isSystem = sp.get("isSystem") ?? "";

  const [loading, setLoading] = useState(false);
  const [itemsRaw, setItemsRaw] = useState([]);
  const [total, setTotal] = useState(0);

  const items = useMemo(() => {
    const list = [...(itemsRaw || [])];
    list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "es", { numeric: true }));
    return list;
  }, [itemsRaw]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const res = await RolesAPI.list({ q, active, scope, isSystem, page, limit });
        if (!alive) return;
        setItemsRaw(res?.items || []);
        setTotal(res?.total ?? 0);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setItemsRaw([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [q, active, scope, isSystem, page, limit]);

  const rowIsActive = (it) => (typeof it?.active === "boolean" ? it.active : true);
  const isProtected = (it) => Boolean(it?.isSystem) || String(it?.code || "").toUpperCase() === "SUPERADMIN";

  const onDelete = async (it) => {
    if (isProtected(it)) return alert("Rol protegido: no se elimina.");
    const ok = window.confirm(`¿Eliminar "${it?.name || it?.code || "rol"}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    try {
      await RolesAPI.remove(it?._id || it?.id);
      const res = await RolesAPI.list({ q, active, scope, isSystem, page, limit });
      setItemsRaw(res?.items || []);
      setTotal(res?.total ?? 0);
      alert("Rol eliminado con éxito");
    } catch (err) {
      const status = err?.response?.status;
      if (status !== 409) console.error(err);
      alert(
        err?.response?.data?.message ||
          (status === 409
            ? "No se puede eliminar: el rol está asignado a uno o más usuarios."
            : "No fue posible eliminar")
      );
    }
  };

  const setParam = (k, v) =>
    setSp((prev) => {
      const next = new URLSearchParams(prev);
      if (v === "" || v == null) next.delete(k);
      else next.set(k, v);
      next.set("page", "1");
      return next;
    }, { replace: true });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Catálogo · Roles</h1>
          <p className="text-gray-500 text-sm">Define roles y permisos del sistema.</p>
        </div>

        <div className="flex items-center gap-2 justify-end flex-nowrap overflow-x-auto">
          <input
            className="shrink-0 border rounded-md px-3 py-2 text-sm w-56"
            placeholder="Buscar por nombre"
            value={q}
            onChange={(e) => setParam("q", e.target.value)}
          />

          <select
            className="shrink-0 border rounded-md px-3 py-2 text-sm w-44"
            value={active}
            onChange={(e) => setParam("active", e.target.value)}
          >
            <option value="">Activo (todos)</option>
            <option value="true">Solo activos</option>
            <option value="false">Solo inactivos</option>
          </select>

          <select
            className="shrink-0 border rounded-md px-3 py-2 text-sm w-44"
            value={scope}
            onChange={(e) => setParam("scope", e.target.value)}
          >
            <option value="">Scope (todos)</option>
            <option value="BRANCH">BRANCH</option>
            <option value="GLOBAL">GLOBAL</option>
          </select>

          <select
            className="shrink-0 border rounded-md px-3 py-2 text-sm w-44"
            value={isSystem}
            onChange={(e) => setParam("isSystem", e.target.value)}
          >
            <option value="">Sistema (todos)</option>
            <option value="true">Solo sistema</option>
            <option value="false">No sistema</option>
          </select>

          <Link
            to={`${BASE}/new`}
            className="shrink-0 px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95"
          >
            Nuevo rol
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-2">Código</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Scope</th>
                <th className="px-4 py-2">Activo</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-gray-500">Cargando…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-gray-500">Sin registros.</td></tr>
              ) : (
                items.map((it) => {
                  const id = it?._id || it?.id;
                  const locked = isProtected(it);
                  return (
                    <tr key={id} className="align-middle">
                      <td className="px-4 py-2">{String(it?.code || "—").toUpperCase()}</td>
                      <td className="px-4 py-2">{String(it?.name || "—").toUpperCase()}</td>
                      <td className="px-4 py-2">{it?.scope || "—"}</td>
                      <td className="px-4 py-2">{rowIsActive(it) ? "Sí" : "No"}</td>

                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
                            onClick={() => navigate(`${BASE}/${id}?mode=view`)}
                          >
                            Ver
                          </button>

                          <button
                            className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={locked}
                            onClick={() => navigate(`${BASE}/${id}`)}
                          >
                            Editar
                          </button>

                          <button
                            className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={locked}
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

        {/* ✅ Cierre visual como VehicleStatuses */}
        <div className="p-4 border-t flex items-center justify-between gap-3 flex-wrap bg-white">
          <div className="text-sm text-gray-600">Total: {total}</div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <Paginator
              page={page}
              limit={limit}
              total={total}
              onPage={(p) =>
                setSp((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("page", String(p));
                  return next;
                }, { replace: true })
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
                }, { replace: true })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
