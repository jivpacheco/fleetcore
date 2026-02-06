// front/src/templates/entity/List.jsx
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Entidad (List)
// - Base para Suppliers, Inventory, Tickets, etc.
// - Agregar filtros específicos en FiltersBar
// -----------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/fc/PageHeader";
import FiltersBar from "../../components/fc/FiltersBar";
import TableCard from "../../components/fc/TableCard";
import TableFooter from "../../components/fc/TableFooter";
import useListQueryParams from "../../hooks/useListQueryParams";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { EntityAPI } from "./api";

export default function EntityList() {
  const navigate = useNavigate();
  const { page, limit, q, active, set } = useListQueryParams({ page: 1, limit: 20, q: "", active: "" });

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const qDebounced = useDebouncedValue(q, 300);

  const load = async () => {
    setLoading(true);
    try {
      const res = await EntityAPI.list({ page, limit, q: qDebounced, active });
      setItems(res?.items || []);
      setTotal(Number(res?.total || 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, limit, qDebounced, active]); // eslint-disable-line

  const canPrev = page > 1;
  const canNext = page * limit < total;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader title="<Entidad>" subtitle="Listado estándar FleetCore.">
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
            <option value="">Activo (todos)</option>
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
                <th className="px-3 py-2">Col 1</th>
                <th className="px-3 py-2">Col 2</th>
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
                  const rowId = it?._id || it?.id;
                  return (
                    <tr key={String(rowId)} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="px-3 py-2">{String(it?.col1 ?? "")}</td>
                      <td className="px-3 py-2">{String(it?.col2 ?? "")}</td>
                      <td className="px-3 py-2">{it?.active !== false ? "Sí" : "No"}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button className="px-3 py-1.5 rounded-lg border text-sm" onClick={() => navigate(String(rowId) + "?mode=view")} type="button">Ver</button>
                          <button className="px-3 py-1.5 rounded-lg bg-[#0B3A66] hover:opacity-95 text-white text-sm" onClick={() => navigate(String(rowId))} type="button">Editar</button>
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
