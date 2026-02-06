// front/src/templates/entity/Form.jsx
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Entidad (Form)
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/fc/PageHeader";
import TableCard from "../../components/fc/TableCard";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import useUnsavedGlobals from "../../hooks/useUnsavedGlobals";
import { EntityAPI } from "./api";

export default function EntityForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();

  const isNew = !id || id === "new";
  const viewMode = sp.get("mode") === "view";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ active: true });

  const [editEnabled, setEditEnabled] = useState(!viewMode);
  useEffect(() => setEditEnabled(!viewMode), [viewMode]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isNew) {
        const base = { active: true };
        setInitial(base);
        setForm(base);
        return;
      }
      setLoading(true);
      try {
        const data = await EntityAPI.get(id);
        if (!alive) return;
        setInitial(data || {});
        setForm(data || {});
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [id, isNew]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial || {}), [form, initial]);

  UnsavedChangesGuard(dirty);
  useUnsavedGlobals(dirty);

  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const canEdit = !viewMode || editEnabled;

  const goBack = () => {
    if (dirty) {
      const ok = window.confirm("Hay cambios sin guardar. ¿Deseas salir sin guardar?");
      if (!ok) return;
    }
    navigate(-1);
  };

  const onSubmit = async () => {
    if (saving || loading) return;
    setSaving(true);
    try {
      if (isNew) await EntityAPI.create(form);
      else await EntityAPI.update(id, form);
      setInitial(form);
      navigate(-1);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "No se pudo guardar. Revisa la consola.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader title="<Entidad>" subtitle={isNew ? "Crear." : viewMode ? "Modo ver." : "Editar."} />

      <TableCard>
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-slate-500">Cargando…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reemplazar por campos reales */}
              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(form.active)}
                    onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                    disabled={!canEdit}
                  />
                  <span className="text-sm">Activo</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-end gap-2 flex-wrap">
          <button className="px-4 py-2 rounded-lg border" onClick={goBack} type="button">
            {dirty ? "Cancelar" : "Volver"}
          </button>

          {viewMode && !editEnabled && (
            <button
              className="px-4 py-2 rounded-md bg-[#0B3A66] hover:opacity-95 text-white"
              onClick={() => setEditEnabled(true)}
              type="button"
            >
              Editar
            </button>
          )}

          {(!viewMode || editEnabled) && (
            <button
              className="px-4 py-2 rounded-md bg-[#0B3A66] hover:opacity-95 text-white disabled:opacity-60"
              onClick={onSubmit}
              disabled={saving || loading}
              type="button"
            >
              {saving ? "Guardando…" : isNew ? "Crear" : "Guardar"}
            </button>
          )}
        </div>
      </TableCard>
    </div>
  );
}
