// front/src/templates/catalog/List.jsx
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Catálogo (List)
// - Búsqueda live (sin botón Buscar)
// - Filtro activo live
// - Tabla con overflow-x-auto para móvil
// - Footer dentro del card (Total + paginación)
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/fc/PageHeader";
import FiltersBar from "../../components/fc/FiltersBar";
import TableCard from "../../components/fc/TableCard";
import TableFooter from "../../components/fc/TableFooter";
import useListQueryParams from "../../hooks/useListQueryParams";
import useDebouncedValue from "../../hooks/useDebouncedValue";

// Reemplazar por el API real del módulo
// import { PositionsAPI } from "../../api/positions.api";
import { CatalogAPI } from "./api";

export default function CatalogList() {
  const navigate = useNavigate();
  const { page, limit, q, active, set } = useListQueryParams({ page: 1, limit: 20, q: "", active: "" });

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const qDebounced = useDebouncedValue(q, 300);

  const subtitle = useMemo(() => "Listado estándar FleetCore (List/Form separados).", []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await CatalogAPI.list({ page, limit, q: qDebounced, active });
      setItems(res?.items || []);
      setTotal(Number(res?.total || 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, qDebounced, active]);

  const canPrev = page > 1;
  const canNext = page * limit < total;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader title="Catálogo · <Título>" subtitle={subtitle}>
        <button
          className="px-4 py-2 rounded-md bg-[#0B3A66] hover:opacity-95 text-white"
          onClick={() => navigate("new")}
          type="button"
        >
          + Nuevo
        </button>
      </PageHeader>

      <FiltersBar>
        <div className="md:col-span-6">
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Buscar…"
            value={q}
            onChange={(e) => set({ q: e.target.value }, { resetPage: true })}
          />
        </div>

        <div className="md:col-span-3">
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={active}
            onChange={(e) => set({ active: e.target.value }, { resetPage: true })}
          >
            <option value="">Activos (todos)</option>
            <option value="true">Solo activos</option>
            <option value="false">Solo inactivos</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={limit}
            onChange={(e) => set({ limit: e.target.value }, { resetPage: true })}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n} / pág.</option>
            ))}
          </select>
        </div>
      </FiltersBar>

      <TableCard>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr className="text-left">
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Activo</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-3 py-4 text-slate-500" colSpan={4}>Cargando…</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-3 py-4 text-slate-500" colSpan={4}>Sin resultados.</td></tr>
              ) : (
                items.map((it) => {
                  const rowId = it?._id || it?.id || it?.key || it?.code;
                  const code = it?.code || it?.key || "";
                  const name = it?.name || it?.label || "";
                  const isActive = it?.active !== false;

                  return (
                    <tr key={String(rowId)} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="px-3 py-2">{code}</td>
                      <td className="px-3 py-2">{name}</td>
                      <td className="px-3 py-2">{isActive ? "Sí" : "No"}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-3 py-1.5 rounded-lg border text-sm"
                            onClick={() => navigate(String(rowId) + "?mode=view")}
                            type="button"
                          >
                            Ver
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg bg-[#0B3A66] hover:opacity-95 text-white text-sm"
                            onClick={() => navigate(String(rowId))}
                            type="button"
                          >
                            Editar
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

        <TableFooter
          total={total}
          page={page}
          limit={limit}
          onPrev={() => set({ page: page - 1 })}
          onNext={() => set({ page: page + 1 })}
          isPrevDisabled={!canPrev}
          isNextDisabled={!canNext}
        />
      </TableCard>
    </div>
  );
}
