// front/src/templates/catalog/Form.jsx
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0 - Catálogo (Form)
// - Modo Ver: ?mode=view (solo lectura) + botón Editar
// - Botonera abajo-derecha (Volver/Cancelar + Guardar/Crear)
// - UnsavedChangesGuard + beforeunload + useUnsavedGlobals (sidebar guard)
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/fc/PageHeader";
import TableCard from "../../components/fc/TableCard";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import useUnsavedGlobals from "../../hooks/useUnsavedGlobals";

// Reemplazar por el API real
import { CatalogAPI } from "./api";

function normalize(data) {
  return {
    code: String(data?.code || data?.key || ""),
    name: String(data?.name || data?.label || ""),
    active: data?.active !== false,
  };
}

export default function CatalogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();

  const isNew = !id || id === "new";
  const viewMode = sp.get("mode") === "view";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", active: true });

  const [editEnabled, setEditEnabled] = useState(!viewMode);

  useEffect(() => setEditEnabled(!viewMode), [viewMode]);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isNew) {
        const base = { code: "", name: "", active: true };
        setInitial(base);
        setForm(base);
        return;
      }
      setLoading(true);
      try {
        const data = await CatalogAPI.get(id);
        if (!alive) return;
        const norm = normalize(data);
        setInitial(norm);
        setForm(norm);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [id, isNew]);

  const dirty = useMemo(() => {
    if (!initial) return false;
    return (
      String(form.code || "") !== String(initial.code || "") ||
      String(form.name || "") !== String(initial.name || "") ||
      Boolean(form.active) !== Boolean(initial.active)
    );
  }, [form, initial]);

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

    if (!form.code.trim() || !form.name.trim()) {
      alert("Código y Nombre son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        active: Boolean(form.active),
      };

      if (isNew) await CatalogAPI.create(payload);
      else await CatalogAPI.update(id, payload);

      setInitial(payload);
      setForm(payload);

      navigate(-1);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo guardar. Revisa la consola.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        title={`Catálogo · <Título>`}
        subtitle={isNew ? "Crear nuevo registro." : viewMode ? "Modo ver (solo lectura)." : "Editar registro."}
      />

      <TableCard>
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-slate-500">Cargando…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Código *</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={form.code}
                  onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nombre *</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  disabled={!canEdit}
                />
              </div>

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
