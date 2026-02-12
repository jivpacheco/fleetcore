// front/src/pages/Positions/Form.jsx
// -----------------------------------------------------------------------------
// Catálogo → Cargos (Positions)
// Basado 1:1 en VehicleStatuses/Form.jsx (módulo estable)
// - Modo Ver: ?mode=view (solo lectura) + botón Editar
// - Botonera abajo-derecha (Cancelar/Volver + Guardar/Crear)
// - UnsavedChangesGuard + beforeunload + banderas globales
// - Negocio intacto: get/list fallback, create/update, redirect
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { PositionsAPI } from "../../api/positions.api";

const BASE = "/config/catalogs/positions";

function normalize(data) {
  return {
    name: String(data?.name || ""),
    description: String(data?.description || ""),
    active: data?.active !== false,
  };
}

function pickItemFromList(data, id) {
  const list = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.result?.items)
      ? data.result.items
      : Array.isArray(data)
        ? data
        : [];
  return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
}

export default function PositionsForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();

  const isNew = !id || id === "new";
  const viewMode = sp.get("mode") === "view";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", active: true });

  const [editEnabled, setEditEnabled] = useState(!viewMode);

  useEffect(() => setEditEnabled(!viewMode), [viewMode]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (isNew) {
        const base = { name: "", description: "", active: true };
        setInitial(base);
        setForm(base);
        return;
      }

      setLoading(true);
      try {
        let item = null;

        // 1) get directo si existe
        if (typeof PositionsAPI.get === "function") item = await PositionsAPI.get(id);

        // 2) fallback: list y buscar (igual que tu lógica actual)
        if (!item) {
          const res = await PositionsAPI.list({ q: "", limit: 500 });
          const data = res?.data ?? res;
          item = pickItemFromList(data, id);
        }

        if (!alive) return;

        const norm = normalize(item);
        setInitial(norm);
        setForm(norm);
      } catch (e) {
        console.error(e);
        if (alive) {
          alert("No se pudo cargar el cargo.");
          navigate(-1);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, isNew, navigate]);

  const dirty = useMemo(() => {
    if (!initial) return false;
    return (
      String(form.name || "") !== String(initial.name || "") ||
      String(form.description || "") !== String(initial.description || "") ||
      Boolean(form.active) !== Boolean(initial.active)
    );
  }, [form, initial]);

  UnsavedChangesGuard(dirty);

  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    try {
      window.__FLEETCORE_UNSAVED__ = Boolean(dirty);
      window.__FLEETCORE_UNSAVED_MESSAGE__ = "Hay cambios sin guardar. ¿Deseas salir sin guardar?";
    } catch {}
    return () => {
      try {
        window.__FLEETCORE_UNSAVED__ = false;
        window.__FLEETCORE_UNSAVED_MESSAGE__ = "";
      } catch {}
    };
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
    if (!form.name.trim()) {
      alert("Nombre es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: String(form.description || ""),
        active: Boolean(form.active),
      };

      if (isNew) await PositionsAPI.create(payload);
      else await PositionsAPI.update(id, payload);

      // resetea dirty antes de navegar
      setInitial(payload);
      setForm(payload);

      try {
        window.__FLEETCORE_UNSAVED__ = false;
        window.__FLEETCORE_UNSAVED_MESSAGE__ = "";
      } catch {}

      navigate(BASE);
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
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Catálogo · Cargos</h1>
          <p className="text-sm text-slate-500">
            {isNew ? "Nuevo cargo." : viewMode ? "Modo ver (solo lectura)." : "Editar cargo."}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-600 bg-white p-4 sm:p-6">
        {loading ? (
          <div className="text-slate-500">Cargando…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Nombre *</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                disabled={!canEdit}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[120px]"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
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

      <div className="mt-4 flex justify-end gap-2 flex-wrap">
        <button className="px-4 py-2 rounded-lg border" onClick={goBack}>
          {dirty ? "Cancelar" : "Volver"}
        </button>

        {viewMode && !editEnabled && (
          <button
            className="px-4 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white"
            onClick={() => setEditEnabled(true)}
          >
            Editar
          </button>
        )}

        {(!viewMode || editEnabled) && (
          <button
            className="px-4 py-2 rounded-lg bg-[#0B3A66] text-white disabled:opacity-60"
            onClick={onSubmit}
            disabled={saving || loading}
          >
            {saving ? "Guardando…" : isNew ? "Crear" : "Guardar"}
          </button>
        )}
      </div>
    </div>
  );
}
