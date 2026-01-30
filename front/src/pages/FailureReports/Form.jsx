// front/src/pages/FailureReports/Form.jsx
// -----------------------------------------------------------------------------
// Catálogo → Reporte de Fallas (Sucursal / Operación)
// - Pensado para usuarios sin expertiz mecánica (NO diagnóstico)
// - Modo Ver: ?mode=view
// - Guardia de cambios sin guardar: hooks/UnsavedChangesGuard
// - systemKey y zoneKey controlados por JSON (data/fleetcore/vehicle-taxonomy.json)
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { FailureReportsAPI } from "../../api/failureReports.api";
import vehicleTaxonomy from "../../data/fleetcore/vehicle-taxonomy.json";

const emptyForm = {
  code: "",
  name: "",
  description: "",
  systemKey: "",
  zoneKey: "",
  suggestedQuestions: [],
  tags: [],
  isActive: true,
};

function toLines(arr) {
  return Array.isArray(arr) ? arr.filter(Boolean).join("\n") : "";
}
function fromLines(text) {
  return String(text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
function normCode(v) {
  return String(v || "").trim().toUpperCase();
}

export default function FailureReportsForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const viewMode = sp.get("mode") === "view";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [initial, setInitial] = useState(emptyForm);

  // Duplicado (crear + editar si cambia el código)
  const [codeCheck, setCodeCheck] = useState({
    checking: false,
    duplicate: false,
  });

  const systemOptions = useMemo(() => vehicleTaxonomy?.systems || [], []);
  const zoneOptions = useMemo(() => vehicleTaxonomy?.zones || [], []);

  const helpTags = useMemo(() => {
    const t = vehicleTaxonomy?.reportTags || {};
    const all = [
      ...(t.phenomenon || []),
      ...(t.condition || []),
      ...(t.impact || []),
    ];
    return Array.from(new Set(all));
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(initial) !== JSON.stringify(form);
  }, [initial, form]);

  UnsavedChangesGuard({
    when: isDirty && !viewMode,
    message: "Hay cambios sin guardar. ¿Deseas salir sin guardar?",
  });

  // Check duplicado:
  // - Crear: siempre que haya code
  // - Editar: solo si code difiere del initial.code
  useEffect(() => {
    const current = normCode(form.code);
    const original = normCode(initial.code);

    const shouldCheck = Boolean(current) && (!id || (id && current !== original));
    if (!shouldCheck) {
      setCodeCheck({ checking: false, duplicate: false });
      return;
    }

    setCodeCheck((s) => ({ ...s, checking: true }));
    const t = setTimeout(async () => {
      try {
        const { data } = await FailureReportsAPI.list({
          page: 1,
          limit: 10,
          q: current,
          active: "",
        });
        const items = data?.items || [];

        const dup = items.some((it) => {
          const itCode = normCode(it?.code);
          const sameCode = itCode === current;
          const sameId = id && String(it?._id) === String(id);
          return sameCode && !sameId;
        });

        setCodeCheck({ checking: false, duplicate: dup });
      } catch {
        setCodeCheck({ checking: false, duplicate: false });
      }
    }, 450);

    return () => clearTimeout(t);
  }, [id, form.code, initial.code]);

  const onBack = () => {
    if (!viewMode && isDirty) {
      const ok = window.confirm("Hay cambios sin guardar. ¿Deseas descartarlos?");
      if (!ok) return;
    }
    nav("/config/catalogs/failure-reports");
  };

  const onEdit = () => {
    if (!id) return;
    nav(`/config/catalogs/failure-reports/${id}`);
  };

  const load = async () => {
    if (!id) {
      setForm(emptyForm);
      setInitial(emptyForm);
      return;
    }
    setLoading(true);
    try {
      const { data } = await FailureReportsAPI.get(id);
      const item = data?.item || data?.data || data;

      const next = {
        code: item?.code || "",
        name: item?.name || "",
        description: item?.description || "",
        systemKey: item?.systemKey || "",
        zoneKey: item?.zoneKey || "",
        suggestedQuestions: Array.isArray(item?.suggestedQuestions)
          ? item.suggestedQuestions
          : [],
        tags: Array.isArray(item?.tags) ? item.tags : [],
        isActive: item?.isActive === false ? false : true,
      };

      setForm(next);
      setInitial(next);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "No fue posible cargar el registro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    if (viewMode) return;

    const codeNorm = normCode(form.code);
    if (!codeNorm) return alert("Código es obligatorio");
    if (codeCheck.duplicate) return alert("Este código ya existe.");
    if (!String(form.name || "").trim()) return alert("Nombre es obligatorio");
    if (!form.systemKey) return alert("Sistema principal es obligatorio");

    if (id && !isDirty) return alert("No hay cambios por guardar");

    const payload = {
      code: codeNorm,
      name: String(form.name || "").trim(),
      description: form.description,
      systemKey: form.systemKey,
      zoneKey: form.zoneKey || "",
      suggestedQuestions: Array.isArray(form.suggestedQuestions)
        ? form.suggestedQuestions
        : [],
      tags: Array.isArray(form.tags) ? form.tags : [],
      // ✅ Enviar boolean real (si está desmarcado debe ir false sí o sí)
      // isActive: Boolean(form.isActive),
      isActive: form.isActive === true,

    };

    setSaving(true);
    try {
      if (id) {
        await FailureReportsAPI.update(id, payload);
        alert("Reporte de falla actualizado");
      } else {
        await FailureReportsAPI.create(payload);
        alert("Reporte de falla creado");
      }
      setInitial(payload);
      nav("/config/catalogs/failure-reports");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "No fue posible guardar");
    } finally {
      setSaving(false);
    }
  };

  const codeHasError = !viewMode && !loading && Boolean(normCode(form.code)) && codeCheck.duplicate;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold">
          {id ? (viewMode ? "Ver Reporte de Falla" : "Editar Reporte de Falla") : "Nuevo Reporte de Falla"}
        </h1>
        <p className="text-sm text-gray-600">
          Estructura pensada para usuarios sin expertiz mecánica (no diagnóstico).
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {/* Header interno (sin línea de “código disponible”) */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
          <div className="text-sm text-gray-500">
            {loading ? "Cargando…" : viewMode ? "Modo ver" : ""}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            <div className="text-gray-600 mb-1">Código *</div>
            <input
              className={
                "border rounded px-3 py-2 w-full " +
                (codeHasError ? "border-red-500 ring-1 ring-red-200" : "")
              }
              value={form.code}
              disabled={viewMode || loading}
              onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
              placeholder="Ej: FR-FREN-001"
            />
            {codeHasError && (
              <div className="text-xs text-red-600 mt-1">Este código ya existe</div>
            )}
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Nombre *</div>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.name}
              disabled={viewMode || loading}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ej: Ruido metálico al frenar"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <div className="text-gray-600 mb-1">Descripción</div>
            <textarea
              className="border rounded px-3 py-2 w-full min-h-24"
              value={form.description}
              disabled={viewMode || loading}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="Describe el síntoma observable (sin diagnóstico)."
            />
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Sistema principal *</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.systemKey}
              disabled={viewMode || loading}
              onChange={(e) => setForm((s) => ({ ...s, systemKey: e.target.value }))}
            >
              <option value="">Seleccione…</option>
              {systemOptions.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Clave analítica principal (evita ambigüedad).
            </div>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Zona (opcional)</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.zoneKey}
              disabled={viewMode || loading}
              onChange={(e) => setForm((s) => ({ ...s, zoneKey: e.target.value }))}
            >
              <option value="">(Sin zona)</option>
              {zoneOptions.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Útil para “lado/eje/sector”. Si no aplica, déjalo vacío.
            </div>
          </label>

          <label className="text-sm md:col-span-1">
            <div className="text-gray-600 mb-1">Preguntas sugeridas (1 por línea)</div>
            <textarea
              className="border rounded px-3 py-2 w-full min-h-32"
              value={toLines(form.suggestedQuestions)}
              disabled={viewMode || loading}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  suggestedQuestions: fromLines(e.target.value),
                }))
              }
              placeholder={"Ej:\n- ¿Ocurre al frenar?\n- ¿Se carga hacia un lado?\n- ¿Hay ruido metálico?"}
            />
            <div className="text-xs text-gray-500 mt-1">
              Mejora la calidad del reporte sin pedir diagnóstico.
            </div>
          </label>

          {/* Tags textarea */}
          <label className="text-sm md:col-span-1">
            <div className="text-gray-600 mb-1">Tags (1 por línea)</div>
            <textarea
              className="border rounded px-3 py-2 w-full min-h-32"
              value={toLines(form.tags)}
              disabled={viewMode || loading}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  tags: fromLines(e.target.value).map((t) => t.toUpperCase()),
                }))
              }
              placeholder={"Ej:\nRUIDO\nEN_FRENADA\nSEGURIDAD"}
            />
          </label>

          {/* ✅ Sugeridos DESPUÉS del box Tags (a todo lo ancho) */}
          <div className="md:col-span-2">
            <div className="text-xs text-gray-500">
              Mejora la calidad del reporte sin pedir diagnóstico
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-gray-50 text-xs text-gray-700">
                Sugeridos
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {helpTags.slice(0, 30).map((t) => {
                  const next = String(t).toUpperCase();
                  const selected = (form.tags || [])
                    .map(String)
                    .map((x) => x.toUpperCase())
                    .includes(next);

                  return (
                    <button
                      type="button"
                      key={t}
                      className={
                        "px-3 py-1.5 rounded-full border text-xs " +
                        (selected
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
                      }
                      onClick={() =>
                        setForm((s) => {
                          const cur = Array.isArray(s.tags)
                            ? s.tags.map((x) => String(x).toUpperCase())
                            : [];
                          const has = cur.includes(next);
                          return { ...s, tags: has ? cur.filter((x) => x !== next) : [...cur, next] };
                        })
                      }
                      disabled={viewMode || loading}
                      title={selected ? "Quitar" : "Agregar"}
                    >
                      {selected ? "✓ " : ""}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activo */}
          {/* <label className="text-sm flex items-center gap-2 md:col-span-2 mt-1">
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              disabled={viewMode || loading}
              onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
            />
            <span>Activo</span>
          </label> */}
          <label className="text-sm flex items-center gap-2 md:col-span-2 mt-1 select-none">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.isActive === true}
              disabled={viewMode || loading || saving}
              onChange={(e) => {
                const next = e.target.checked;
                setForm((s) => ({ ...s, isActive: next }));
              }}
            />
            <span>Activo</span>

            {!viewMode && (
              <span className="text-xs text-gray-500">
                ({form.isActive === true ? "Sí" : "No"})
              </span>
            )}
          </label>

        </div>

        {/* Footer acciones a la derecha */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
          <button
            type="button"
            className="btn border rounded px-4 py-2"
            onClick={onBack}
            disabled={saving || loading}
          >
            {!viewMode && isDirty ? "Cancelar" : "Volver"}
          </button>

          {id && viewMode && (
            <button
              type="button"
              className="btn btn-primary rounded px-4 py-2 text-white"
              onClick={onEdit}
            >
              Editar
            </button>
          )}

          {!viewMode && (
            <button
              type="submit"
              className="btn btn-primary rounded px-4 py-2 text-white"
              disabled={
                saving ||
                loading ||
                codeCheck.duplicate ||
                !normCode(form.code) ||
                !String(form.name || "").trim() ||
                !String(form.systemKey || "").trim() ||
                (id ? !isDirty : false)
              }
              title={
                codeCheck.duplicate
                  ? "Este código ya existe"
                  : id && !isDirty
                    ? "No hay cambios por guardar"
                    : ""
              }
            >
              {saving ? (id ? "Guardando…" : "Creando…") : id ? "Actualizar" : "Crear"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
