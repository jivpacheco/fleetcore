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

// front/src/pages/FailureReports/Form.jsx
// -----------------------------------------------------------------------------
// Catálogo Reporte de Fallas (Cliente/Sucursal)
// - Modo Ver: ?mode=view
// - Guardia cambios sin guardar: hooks/UnsavedChangesGuard
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
import { FailureReportsAPI } from '../../api/failureReports.api'

const emptyForm = {
    code: '',
    name: '',
    description: '',
    systemKey: '',
    zoneKey: '',
    suggestedQuestionsText: '',
    tagsText: '',
    active: true,
}

function toText(lines) {
    return Array.isArray(lines) ? lines.join('\n') : ''
}

function parseLines(text) {
    return String(text || '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
}

function parseTags(text) {
    return Array.from(new Set(parseLines(text)))
}

export default function FailureReportsForm() {
    const { id } = useParams()
    const isNew = id === 'new' || !id
    const navigate = useNavigate()
    const [sp] = useSearchParams()
    const viewMode = sp.get('mode') === 'view'

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [form, setForm] = useState(emptyForm)
    const [initial, setInitial] = useState(null)

    const dirty = useMemo(() => {
        if (!initial) return false
        return JSON.stringify(form) !== JSON.stringify(initial)
    }, [form, initial])

    useEffect(() => {
        if (isNew) {
            setForm(emptyForm)
            setInitial(emptyForm)
            return
        }

        setLoading(true)
        setError('')
        FailureReportsAPI.get(id)
            .then(({ data }) => {
                const item = data?.item
                const mapped = {
                    code: item?.code || '',
                    name: item?.name || '',
                    description: item?.description || '',
                    systemKey: item?.systemKey || '',
                    zoneKey: item?.zoneKey || '',
                    suggestedQuestionsText: toText(item?.suggestedQuestions),
                    tagsText: toText(item?.tags),
                    active: Boolean(item?.active),
                }
                setForm(mapped)
                setInitial(mapped)
            })
            .catch(() => setError('No se pudo cargar'))
            .finally(() => setLoading(false))
    }, [id, isNew])

    const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }))

    const onSave = async (e) => {
        e.preventDefault()
        if (viewMode) return

        setSaving(true)
        setError('')
        const payload = {
            code: form.code,
            name: form.name,
            description: form.description,
            systemKey: form.systemKey,
            zoneKey: form.zoneKey,
            suggestedQuestions: parseLines(form.suggestedQuestionsText),
            tags: parseTags(form.tagsText),
            active: Boolean(form.active),
        }

        try {
            if (isNew) {
                const { data } = await FailureReportsAPI.create(payload)
                navigate(`/config/catalogs/failure-reports/${data?.item?._id}`)
            } else {
                await FailureReportsAPI.update(id, payload)
                setInitial(form)
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'No se pudo guardar')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <UnsavedChangesGuard when={dirty && !viewMode} />

            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-xl font-bold">
                        {isNew ? 'Nuevo Reporte de Falla' : viewMode ? 'Ver Reporte de Falla' : 'Editar Reporte de Falla'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Estructura pensada para usuarios sin expertiz mecánica (no diagnóstico).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link className="px-3 py-2 rounded border bg-white" to="/config/catalogs/failure-reports">
                        Volver
                    </Link>

                    {!isNew && viewMode && (
                        <button
                            className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white"
                            onClick={() => navigate(`/config/catalogs/failure-reports/${id}`)}
                        >
                            Editar
                        </button>
                    )}

                    {!viewMode && (
                        <button
                            className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white disabled:opacity-50"
                            onClick={onSave}
                            disabled={saving || loading}
                        >
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="p-6 text-gray-500">Cargando…</div>
            ) : (
                <div className="border rounded-xl p-4 bg-white">
                    <form onSubmit={onSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="text-sm text-gray-600">Código</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={form.code}
                                    onChange={(e) => onChange('code', e.target.value)}
                                    disabled={viewMode}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-600">Nombre</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={form.name}
                                    onChange={(e) => onChange('name', e.target.value)}
                                    disabled={viewMode}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Descripción</label>
                            <textarea
                                className="w-full border rounded px-3 py-2"
                                rows={3}
                                value={form.description}
                                onChange={(e) => onChange('description', e.target.value)}
                                disabled={viewMode}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Sistema principal (systemKey)</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={form.systemKey}
                                    onChange={(e) => onChange('systemKey', e.target.value)}
                                    disabled={viewMode}
                                    placeholder="Ej: FRENOS"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Ejemplos: Motor, Frenos, Suspensión, Eléctrico, Luces, Dirección.
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Zona (opcional)</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={form.zoneKey}
                                    onChange={(e) => onChange('zoneKey', e.target.value)}
                                    disabled={viewMode}
                                    placeholder="Ej: DELANTEROS"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Preguntas sugeridas (1 por línea)</label>
                                <textarea
                                    className="w-full border rounded px-3 py-2"
                                    rows={6}
                                    value={form.suggestedQuestionsText}
                                    onChange={(e) => onChange('suggestedQuestionsText', e.target.value)}
                                    disabled={viewMode}
                                    placeholder={
                                        'Ej:\n- ¿Ocurre al frenar?\n- ¿Se carga hacia un lado?\n- ¿Hay ruido metálico?'
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Tags (1 por línea)</label>
                                <textarea
                                    className="w-full border rounded px-3 py-2"
                                    rows={6}
                                    value={form.tagsText}
                                    onChange={(e) => onChange('tagsText', e.target.value)}
                                    disabled={viewMode}
                                />

                                <div className="flex items-center gap-2 pt-3">
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(e) => onChange('active', e.target.checked)}
                                        disabled={viewMode}
                                    />
                                    <span className="text-sm">Activo</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
