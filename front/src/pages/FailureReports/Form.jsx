// // front/src/pages/FailureReports/Form.jsx
// // -----------------------------------------------------------------------------
// // Catálogo Reporte de Fallas (Cliente/Sucursal)
// // - Modo Ver: ?mode=view
// // - Guardia cambios sin guardar: hooks/UnsavedChangesGuard
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
// import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// import { FailureReportsAPI } from '../../api/failureReports.api'

// const emptyForm = {
//     code: '',
//     name: '',
//     description: '',
//     systemKey: '',
//     zoneKey: '',
//     suggestedQuestionsText: '',
//     tagsText: '',
//     active: true,
// }

// function toText(lines) {
//     return Array.isArray(lines) ? lines.join('\n') : ''
// }

// function parseLines(text) {
//     return String(text || '')
//         .split(/\r?\n/)
//         .map((s) => s.trim())
//         .filter(Boolean)
// }

// function parseTags(text) {
//     return Array.from(new Set(parseLines(text)))
// }

// export default function FailureReportsForm() {
//     const { id } = useParams()
//     const isNew = id === 'new' || !id
//     const navigate = useNavigate()
//     const [sp] = useSearchParams()
//     const viewMode = sp.get('mode') === 'view'

//     const [loading, setLoading] = useState(false)
//     const [saving, setSaving] = useState(false)
//     const [error, setError] = useState('')

//     const [form, setForm] = useState(emptyForm)
//     const [initial, setInitial] = useState(null)

//     const dirty = useMemo(() => {
//         if (!initial) return false
//         return JSON.stringify(form) !== JSON.stringify(initial)
//     }, [form, initial])

//     useEffect(() => {
//         if (isNew) {
//             setForm(emptyForm)
//             setInitial(emptyForm)
//             return
//         }

//         setLoading(true)
//         setError('')
//         FailureReportsAPI.get(id)
//             .then(({ data }) => {
//                 const item = data?.item
//                 const mapped = {
//                     code: item?.code || '',
//                     name: item?.name || '',
//                     description: item?.description || '',
//                     systemKey: item?.systemKey || '',
//                     zoneKey: item?.zoneKey || '',
//                     suggestedQuestionsText: toText(item?.suggestedQuestions),
//                     tagsText: toText(item?.tags),
//                     active: Boolean(item?.active),
//                 }
//                 setForm(mapped)
//                 setInitial(mapped)
//             })
//             .catch(() => setError('No se pudo cargar'))
//             .finally(() => setLoading(false))
//     }, [id, isNew])

//     const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }))

//     const onSave = async (e) => {
//         e.preventDefault()
//         if (viewMode) return

//         setSaving(true)
//         setError('')
//         const payload = {
//             code: form.code,
//             name: form.name,
//             description: form.description,
//             systemKey: form.systemKey,
//             zoneKey: form.zoneKey,
//             suggestedQuestions: parseLines(form.suggestedQuestionsText),
//             tags: parseTags(form.tagsText),
//             active: Boolean(form.active),
//         }

//         try {
//             if (isNew) {
//                 const { data } = await FailureReportsAPI.create(payload)
//                 navigate(`/config/catalogs/failure-reports/${data?.item?._id}`)
//             } else {
//                 await FailureReportsAPI.update(id, payload)
//                 setInitial(form)
//             }
//         } catch (err) {
//             setError(err?.response?.data?.message || 'No se pudo guardar')
//         } finally {
//             setSaving(false)
//         }
//     }

//     return (
//         <div className="max-w-5xl">
//             <UnsavedChangesGuard when={dirty && !viewMode} />

//             <div className="flex items-start justify-between gap-3 mb-4">
//                 <div>
//                     <h1 className="text-xl font-bold">
//                         {isNew ? 'Nuevo Reporte de Falla' : viewMode ? 'Ver Reporte de Falla' : 'Editar Reporte de Falla'}
//                     </h1>
//                     <p className="text-gray-500 text-sm">
//                         Estructura pensada para usuarios sin expertiz mecánica (no diagnóstico).
//                     </p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <Link className="px-3 py-2 rounded border bg-white" to="/config/catalogs/failure-reports">
//                         Volver
//                     </Link>

//                     {!isNew && viewMode && (
//                         <button
//                             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white"
//                             onClick={() => navigate(`/config/catalogs/failure-reports/${id}`)}
//                         >
//                             Editar
//                         </button>
//                     )}

//                     {!viewMode && (
//                         <button
//                             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white disabled:opacity-50"
//                             onClick={onSave}
//                             disabled={saving || loading}
//                         >
//                             {saving ? 'Guardando…' : 'Guardar'}
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="p-6 text-gray-500">Cargando…</div>
//             ) : (
//                 <form onSubmit={onSave} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="md:col-span-1">
//                             <label className="text-sm text-gray-600">Código</label>
//                             <input
//                                 className="w-full border rounded px-3 py-2"
//                                 value={form.code}
//                                 onChange={(e) => onChange('code', e.target.value)}
//                                 disabled={viewMode}
//                             />
//                         </div>
//                         <div className="md:col-span-2">
//                             <label className="text-sm text-gray-600">Nombre</label>
//                             <input
//                                 className="w-full border rounded px-3 py-2"
//                                 value={form.name}
//                                 onChange={(e) => onChange('name', e.target.value)}
//                                 disabled={viewMode}
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <label className="text-sm text-gray-600">Descripción</label>
//                         <textarea
//                             className="w-full border rounded px-3 py-2"
//                             rows={3}
//                             value={form.description}
//                             onChange={(e) => onChange('description', e.target.value)}
//                             disabled={viewMode}
//                         />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-sm text-gray-600">Sistema principal (systemKey)</label>
//                             <input
//                                 className="w-full border rounded px-3 py-2"
//                                 value={form.systemKey}
//                                 onChange={(e) => onChange('systemKey', e.target.value)}
//                                 disabled={viewMode}
//                                 placeholder="Ej: FRENOS"
//                             />
//                             <div className="text-xs text-gray-500 mt-1">
//                                 Ejemplos: Motor, Frenos, Suspensión, Eléctrico, Luces, Dirección.
//                             </div>
//                         </div>
//                         <div>
//                             <label className="text-sm text-gray-600">Zona (opcional)</label>
//                             <input
//                                 className="w-full border rounded px-3 py-2"
//                                 value={form.zoneKey}
//                                 onChange={(e) => onChange('zoneKey', e.target.value)}
//                                 disabled={viewMode}
//                                 placeholder="Ej: DELANTEROS"
//                             />
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-sm text-gray-600">Preguntas sugeridas (1 por línea)</label>
//                             <textarea
//                                 className="w-full border rounded px-3 py-2"
//                                 rows={6}
//                                 value={form.suggestedQuestionsText}
//                                 onChange={(e) => onChange('suggestedQuestionsText', e.target.value)}
//                                 disabled={viewMode}
//                                 placeholder={
//                                     'Ej:\n- ¿Ocurre al frenar?\n- ¿Se carga hacia un lado?\n- ¿Hay ruido metálico?'
//                                 }
//                             />
//                         </div>
//                         <div>
//                             <label className="text-sm text-gray-600">Tags (1 por línea)</label>
//                             <textarea
//                                 className="w-full border rounded px-3 py-2"
//                                 rows={6}
//                                 value={form.tagsText}
//                                 onChange={(e) => onChange('tagsText', e.target.value)}
//                                 disabled={viewMode}
//                             />

//                             <div className="flex items-center gap-2 pt-3">
//                                 <input
//                                     type="checkbox"
//                                     checked={form.active}
//                                     onChange={(e) => onChange('active', e.target.checked)}
//                                     disabled={viewMode}
//                                 />
//                                 <span className="text-sm">Activo</span>
//                             </div>
//                         </div>
//                     </div>
//                 </form>
//             )}
//         </div>
//     )
// }

// //v2 280126

// // front/src/pages/FailureReports/Form.jsx
// // -----------------------------------------------------------------------------
// // Catálogo Reporte de Fallas (Cliente/Sucursal)
// // - Modo Ver: ?mode=view
// // - Guardia cambios sin guardar: hooks/UnsavedChangesGuard
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
// import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// import { FailureReportsAPI } from '../../api/failureReports.api'

// const emptyForm = {
//     code: '',
//     name: '',
//     description: '',
//     systemKey: '',
//     zoneKey: '',
//     suggestedQuestionsText: '',
//     tagsText: '',
//     active: true,
// }

// function toText(lines) {
//     return Array.isArray(lines) ? lines.join('\n') : ''
// }

// function parseLines(text) {
//     return String(text || '')
//         .split(/\r?\n/)
//         .map((s) => s.trim())
//         .filter(Boolean)
// }

// function parseTags(text) {
//     return Array.from(new Set(parseLines(text)))
// }

// export default function FailureReportsForm() {
//     const { id } = useParams()
//     const isNew = id === 'new' || !id
//     const navigate = useNavigate()
//     const [sp] = useSearchParams()
//     const viewMode = sp.get('mode') === 'view'

//     const [loading, setLoading] = useState(false)
//     const [saving, setSaving] = useState(false)
//     const [error, setError] = useState('')

//     const [form, setForm] = useState(emptyForm)
//     const [initial, setInitial] = useState(null)

//     const dirty = useMemo(() => {
//         if (!initial) return false
//         return JSON.stringify(form) !== JSON.stringify(initial)
//     }, [form, initial])

//     useEffect(() => {
//         if (isNew) {
//             setForm(emptyForm)
//             setInitial(emptyForm)
//             return
//         }

//         setLoading(true)
//         setError('')
//         FailureReportsAPI.get(id)
//             .then(({ data }) => {
//                 const item = data?.item
//                 const mapped = {
//                     code: item?.code || '',
//                     name: item?.name || '',
//                     description: item?.description || '',
//                     systemKey: item?.systemKey || '',
//                     zoneKey: item?.zoneKey || '',
//                     suggestedQuestionsText: toText(item?.suggestedQuestions),
//                     tagsText: toText(item?.tags),
//                     active: Boolean(item?.active),
//                 }
//                 setForm(mapped)
//                 setInitial(mapped)
//             })
//             .catch(() => setError('No se pudo cargar'))
//             .finally(() => setLoading(false))
//     }, [id, isNew])

//     const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }))

//     const onSave = async (e) => {
//         e.preventDefault()
//         if (viewMode) return

//         setSaving(true)
//         setError('')
//         const payload = {
//             code: form.code,
//             name: form.name,
//             description: form.description,
//             systemKey: form.systemKey,
//             zoneKey: form.zoneKey,
//             suggestedQuestions: parseLines(form.suggestedQuestionsText),
//             tags: parseTags(form.tagsText),
//             active: Boolean(form.active),
//         }

//         try {
//             if (isNew) {
//                 const { data } = await FailureReportsAPI.create(payload)
//                 navigate(`/config/catalogs/failure-reports/${data?.item?._id}`)
//             } else {
//                 await FailureReportsAPI.update(id, payload)
//                 setInitial(form)
//             }
//         } catch (err) {
//             setError(err?.response?.data?.message || 'No se pudo guardar')
//         } finally {
//             setSaving(false)
//         }
//     }

//     return (
//         <div className="p-6 space-y-6">
//             <UnsavedChangesGuard when={dirty && !viewMode} />

//             <div className="flex items-start justify-between gap-3 mb-4">
//                 <div>
//                     <h1 className="text-xl font-bold">
//                         {isNew ? 'Nuevo Reporte de Falla' : viewMode ? 'Ver Reporte de Falla' : 'Editar Reporte de Falla'}
//                     </h1>
//                     <p className="text-gray-500 text-sm">
//                         Estructura pensada para usuarios sin expertiz mecánica (no diagnóstico).
//                     </p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <Link className="px-3 py-2 rounded border bg-white" to="/config/catalogs/failure-reports">
//                         Volver
//                     </Link>

//                     {!isNew && viewMode && (
//                         <button
//                             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white"
//                             onClick={() => navigate(`/config/catalogs/failure-reports/${id}`)}
//                         >
//                             Editar
//                         </button>
//                     )}

//                     {!viewMode && (
//                         <button
//                             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white disabled:opacity-50"
//                             onClick={onSave}
//                             disabled={saving || loading}
//                         >
//                             {saving ? 'Guardando…' : 'Guardar'}
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {error && (
//                 <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
//                     {error}
//                 </div>
//             )}

//             {loading ? (
//                 <div className="p-6 text-gray-500">Cargando…</div>
//             ) : (
//                 <div className="border rounded-xl p-4 bg-white">
//                     <form onSubmit={onSave} className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div className="md:col-span-1">
//                                 <label className="text-sm text-gray-600">Código</label>
//                                 <input
//                                     className="w-full border rounded px-3 py-2"
//                                     value={form.code}
//                                     onChange={(e) => onChange('code', e.target.value)}
//                                     disabled={viewMode}
//                                 />
//                             </div>
//                             <div className="md:col-span-2">
//                                 <label className="text-sm text-gray-600">Nombre</label>
//                                 <input
//                                     className="w-full border rounded px-3 py-2"
//                                     value={form.name}
//                                     onChange={(e) => onChange('name', e.target.value)}
//                                     disabled={viewMode}
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="text-sm text-gray-600">Descripción</label>
//                             <textarea
//                                 className="w-full border rounded px-3 py-2"
//                                 rows={3}
//                                 value={form.description}
//                                 onChange={(e) => onChange('description', e.target.value)}
//                                 disabled={viewMode}
//                             />
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="text-sm text-gray-600">Sistema principal (systemKey)</label>
//                                 <input
//                                     className="w-full border rounded px-3 py-2"
//                                     value={form.systemKey}
//                                     onChange={(e) => onChange('systemKey', e.target.value)}
//                                     disabled={viewMode}
//                                     placeholder="Ej: FRENOS"
//                                 />
//                                 <div className="text-xs text-gray-500 mt-1">
//                                     Ejemplos: Motor, Frenos, Suspensión, Eléctrico, Luces, Dirección.
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-600">Zona (opcional)</label>
//                                 <input
//                                     className="w-full border rounded px-3 py-2"
//                                     value={form.zoneKey}
//                                     onChange={(e) => onChange('zoneKey', e.target.value)}
//                                     disabled={viewMode}
//                                     placeholder="Ej: DELANTEROS"
//                                 />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="text-sm text-gray-600">Preguntas sugeridas (1 por línea)</label>
//                                 <textarea
//                                     className="w-full border rounded px-3 py-2"
//                                     rows={6}
//                                     value={form.suggestedQuestionsText}
//                                     onChange={(e) => onChange('suggestedQuestionsText', e.target.value)}
//                                     disabled={viewMode}
//                                     placeholder={
//                                         'Ej:\n- ¿Ocurre al frenar?\n- ¿Se carga hacia un lado?\n- ¿Hay ruido metálico?'
//                                     }
//                                 />
//                             </div>
//                             <div>
//                                 <label className="text-sm text-gray-600">Tags (1 por línea)</label>
//                                 <textarea
//                                     className="w-full border rounded px-3 py-2"
//                                     rows={6}
//                                     value={form.tagsText}
//                                     onChange={(e) => onChange('tagsText', e.target.value)}
//                                     disabled={viewMode}
//                                 />

//                                 <div className="flex items-center gap-2 pt-3">
//                                     <input
//                                         type="checkbox"
//                                         checked={form.active}
//                                         onChange={(e) => onChange('active', e.target.checked)}
//                                         disabled={viewMode}
//                                     />
//                                     <span className="text-sm">Activo</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </form>
//                 </div>
//             )}
//         </div>
//     )
// }

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

export default function FailureReportsForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const viewMode = sp.get("mode") === "view";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [initial, setInitial] = useState(emptyForm);

  const systemOptions = useMemo(() => vehicleTaxonomy?.systems || [], []);
  const zoneOptions = useMemo(() => vehicleTaxonomy?.zones || [], []);

  const isDirty = useMemo(() => {
    const a = JSON.stringify(initial);
    const b = JSON.stringify(form);
    return a !== b;
  }, [initial, form]);

  UnsavedChangesGuard({
    when: isDirty && !viewMode,
    message: "Hay cambios sin guardar. ¿Deseas salir sin guardar?",
  });

  const onBack = () => {
    if (!viewMode && isDirty) {
      const ok = window.confirm(
        "Hay cambios sin guardar. ¿Deseas descartarlos?",
      );
      if (!ok) return;
    }
    nav(-1);
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
        isActive: item?.isActive !== false,
      };
      setForm(next);
      setInitial(next);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || "No fue posible cargar el registro",
      );
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
    if (!form.code.trim()) return alert("Código es obligatorio");
    if (!form.name.trim()) return alert("Nombre es obligatorio");
    if (!form.systemKey) return alert("Sistema principal es obligatorio");

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description,
      systemKey: form.systemKey,
      zoneKey: form.zoneKey || "",
      suggestedQuestions: Array.isArray(form.suggestedQuestions)
        ? form.suggestedQuestions
        : [],
      tags: Array.isArray(form.tags) ? form.tags : [],
      isActive: form.isActive !== false,
    };

    setSaving(true);
    try {
      if (id) {
        await FailureReportsAPI.update(id, payload);
        alert("Reporte de falla actualizado");
      } else {
        const { data } = await FailureReportsAPI.create(payload);
        const createdId = data?.item?._id || data?._id;
        alert("Reporte de falla creado");
        if (createdId) nav(`/config/catalogs/failure-reports/${createdId}`);
      }
      setInitial(payload); // marca como limpio
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "No fue posible guardar");
    } finally {
      setSaving(false);
    }
  };

  const helpTags = useMemo(() => {
    const t = vehicleTaxonomy?.reportTags || {};
    const all = [
      ...(t.phenomenon || []),
      ...(t.condition || []),
      ...(t.impact || []),
    ];
    return Array.from(new Set(all));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">
          {id ? "Editar Reporte de Falla" : "Nuevo Reporte de Falla"}
        </h1>
        <p className="text-sm text-gray-600">
          Estructura pensada para usuarios sin expertiz mecánica (no
          diagnóstico).
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border rounded-2xl shadow-sm">
        {/* Header interno (para cerrar esquinas superiores) */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
          <div className="text-sm text-gray-500">
            {loading
              ? "Cargando…"
              : viewMode
                ? "Modo ver"
                : isDirty
                  ? "Cambios sin guardar"
                  : "Sin cambios"}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn border rounded px-4 py-2"
              onClick={onBack}
            >
              {!viewMode && isDirty ? "Cancelar" : "Volver"}
            </button>
            {!viewMode && (
              <button
                type="submit"
                className="btn btn-primary rounded px-4 py-2 text-white"
                disabled={saving || loading}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            <div className="text-gray-600 mb-1">Código *</div>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.code}
              disabled={viewMode || loading}
              onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
              placeholder="Ej: FR-FREN-001"
            />
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
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Describe el síntoma observable (sin diagnóstico)."
            />
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Sistema principal *</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.systemKey}
              disabled={viewMode || loading}
              onChange={(e) =>
                setForm((s) => ({ ...s, systemKey: e.target.value }))
              }
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
              onChange={(e) =>
                setForm((s) => ({ ...s, zoneKey: e.target.value }))
              }
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
            <div className="text-gray-600 mb-1">
              Preguntas sugeridas (1 por línea)
            </div>
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
              placeholder={
                "Ej:\n- ¿Ocurre al frenar?\n- ¿Se carga hacia un lado?\n- ¿Hay ruido metálico?"
              }
            />
            <div className="text-xs text-gray-500 mt-1">
              Mejora la calidad del reporte sin pedir diagnóstico.
            </div>
          </label>

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
            <div className="text-xs text-gray-500 mt-1">
              Sugeridos: {helpTags.slice(0, 10).join(", ")}
              {helpTags.length > 10 ? "…" : ""}
            </div>
          </label>

          <label className="text-sm flex items-center gap-2 md:col-span-2 mt-1">
            <input
              type="checkbox"
              checked={form.isActive}
              disabled={viewMode || loading}
              onChange={(e) =>
                setForm((s) => ({ ...s, isActive: e.target.checked }))
              }
            />
            <span>Activo</span>
          </label>
        </div>
      </form>
    </div>
  );
}
