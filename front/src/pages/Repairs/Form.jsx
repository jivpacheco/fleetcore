// // // // // front/src/pages/Repairs/Form.jsx
// // // // // -----------------------------------------------------------------------------
// // // // // Catálogo Reparaciones (Taller)
// // // // // - Modo Ver: ?mode=view
// // // // // - Guardia cambios sin guardar: hooks/UnsavedChangesGuard
// // // // // - Media: photo + documents[]
// // // // // -----------------------------------------------------------------------------

// // // // import { useEffect, useMemo, useState } from 'react'
// // // // import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
// // // // import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// // // // import { RepairsAPI } from '../../api/repairs.api'

// // // // const REPAIR_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'ADJUSTMENT']
// // // // const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
// // // // const IMPACTS = ['NO_STOP', 'LIMITED', 'OUT_OF_SERVICE']

// // // // const emptyForm = {
// // // //     code: '',
// // // //     name: '',
// // // //     description: '',
// // // //     systemKey: '',
// // // //     subsystemKey: '',
// // // //     componentKey: '',
// // // //     failureModeKey: '',
// // // //     repairType: 'CORRECTIVE',
// // // //     severityDefault: 'MEDIUM',
// // // //     operationalImpactDefault: 'LIMITED',
// // // //     standardLaborMinutes: 0,
// // // //     tagsText: '',
// // // //     active: true,
// // // // }

// // // // function toTagsText(tags) {
// // // //     return Array.isArray(tags) ? tags.join('\n') : ''
// // // // }

// // // // function parseTags(text) {
// // // //     return Array.from(
// // // //         new Set(
// // // //             String(text || '')
// // // //                 .split(/\r?\n|,/)
// // // //                 .map((s) => s.trim())
// // // //                 .filter(Boolean)
// // // //         )
// // // //     )
// // // // }

// // // // export default function RepairsForm() {
// // // //     const { id } = useParams()
// // // //     const isNew = id === 'new' || !id
// // // //     const navigate = useNavigate()
// // // //     const [sp] = useSearchParams()
// // // //     const viewMode = sp.get('mode') === 'view'

// // // //     const [loading, setLoading] = useState(false)
// // // //     const [saving, setSaving] = useState(false)
// // // //     const [error, setError] = useState('')

// // // //     const [doc, setDoc] = useState(null)
// // // //     const [form, setForm] = useState(emptyForm)
// // // //     const [initial, setInitial] = useState(null)

// // // //     const dirty = useMemo(() => {
// // // //         if (!initial) return false
// // // //         return JSON.stringify(form) !== JSON.stringify(initial)
// // // //     }, [form, initial])

// // // //     useEffect(() => {
// // // //         if (isNew) {
// // // //             setDoc(null)
// // // //             setForm(emptyForm)
// // // //             setInitial(emptyForm)
// // // //             return
// // // //         }

// // // //         setLoading(true)
// // // //         setError('')
// // // //         RepairsAPI.get(id)
// // // //             .then(({ data }) => {
// // // //                 const item = data?.item
// // // //                 setDoc(item)
// // // //                 const mapped = {
// // // //                     code: item?.code || '',
// // // //                     name: item?.name || '',
// // // //                     description: item?.description || '',
// // // //                     systemKey: item?.systemKey || '',
// // // //                     subsystemKey: item?.subsystemKey || '',
// // // //                     componentKey: item?.componentKey || '',
// // // //                     failureModeKey: item?.failureModeKey || '',
// // // //                     repairType: item?.repairType || 'CORRECTIVE',
// // // //                     severityDefault: item?.severityDefault || 'MEDIUM',
// // // //                     operationalImpactDefault: item?.operationalImpactDefault || 'LIMITED',
// // // //                     standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
// // // //                     tagsText: toTagsText(item?.tags),
// // // //                     active: Boolean(item?.active),
// // // //                 }
// // // //                 setForm(mapped)
// // // //                 setInitial(mapped)
// // // //             })
// // // //             .catch(() => setError('No se pudo cargar'))
// // // //             .finally(() => setLoading(false))
// // // //     }, [id, isNew])

// // // //     const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }))

// // // //     const onSave = async (e) => {
// // // //         e.preventDefault()
// // // //         if (viewMode) return

// // // //         setSaving(true)
// // // //         setError('')
// // // //         const payload = {
// // // //             code: form.code,
// // // //             name: form.name,
// // // //             description: form.description,
// // // //             systemKey: form.systemKey,
// // // //             subsystemKey: form.subsystemKey,
// // // //             componentKey: form.componentKey,
// // // //             failureModeKey: form.failureModeKey,
// // // //             repairType: form.repairType,
// // // //             severityDefault: form.severityDefault,
// // // //             operationalImpactDefault: form.operationalImpactDefault,
// // // //             standardLaborMinutes: Number(form.standardLaborMinutes || 0),
// // // //             tags: parseTags(form.tagsText),
// // // //             active: Boolean(form.active),
// // // //         }

// // // //         try {
// // // //             if (isNew) {
// // // //                 const { data } = await RepairsAPI.create(payload)
// // // //                 navigate(`/config/catalogs/repairs/${data?.item?._id}`)
// // // //             } else {
// // // //                 await RepairsAPI.update(id, payload)
// // // //                 setInitial(form)
// // // //             }
// // // //         } catch (err) {
// // // //             setError(err?.response?.data?.message || 'No se pudo guardar')
// // // //         } finally {
// // // //             setSaving(false)
// // // //         }
// // // //     }

// // // //     // -------- Media (solo para edición) --------
// // // //     const onUploadPhoto = async (file) => {
// // // //         if (!file || isNew || viewMode) return
// // // //         try {
// // // //             const { data } = await RepairsAPI.uploadPhoto(id, file)
// // // //             setDoc((s) => ({ ...s, photo: data?.item }))
// // // //         } catch (e) {
// // // //             setError('No se pudo subir la foto')
// // // //         }
// // // //     }

// // // //     const onUploadDoc = async (file) => {
// // // //         if (!file || isNew || viewMode) return
// // // //         try {
// // // //             const { data } = await RepairsAPI.uploadDocument(id, file, file.name)
// // // //             setDoc((s) => ({ ...s, documents: [...(s?.documents || []), data?.item] }))
// // // //         } catch (e) {
// // // //             setError('No se pudo subir el documento')
// // // //         }
// // // //     }

// // // //     const onDeleteDoc = async (docId) => {
// // // //         if (!docId || isNew || viewMode) return
// // // //         try {
// // // //             await RepairsAPI.deleteDocument(id, docId)
// // // //             setDoc((s) => ({ ...s, documents: (s?.documents || []).filter((d) => d?._id !== docId) }))
// // // //         } catch (e) {
// // // //             setError('No se pudo eliminar el documento')
// // // //         }
// // // //     }

// // // //     return (
// // // //         <div className="max-w-5xl">
// // // //             <UnsavedChangesGuard when={dirty && !viewMode} />

// // // //             <div className="flex items-start justify-between gap-3 mb-4">
// // // //                 <div>
// // // //                     <h1 className="text-xl font-bold">
// // // //                         {isNew ? 'Nueva Reparación' : viewMode ? 'Ver Reparación' : 'Editar Reparación'}
// // // //                     </h1>
// // // //                     <p className="text-gray-500 text-sm">
// // // //                         {viewMode
// // // //                             ? 'Vista de solo lectura. Use "Editar" para modificar.'
// // // //                             : 'Defina el estándar técnico (incluye tiempo estándar para KPI).'}
// // // //                     </p>
// // // //                 </div>

// // // //                 <div className="flex items-center gap-2">
// // // //                     <Link className="px-3 py-2 rounded border bg-white" to="/config/catalogs/repairs">
// // // //                         Volver
// // // //                     </Link>

// // // //                     {!isNew && viewMode && (
// // // //                         <button
// // // //                             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white"
// // // //                             onClick={() => navigate(`/config/catalogs/repairs/${id}`)}
// // // //                         >
// // // //                             Editar
// // // //                         </button>
// // // //                     )}

// // // //                     {!viewMode && (
// // // //                         <button
// // // //                             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white disabled:opacity-50"
// // // //                             onClick={onSave}
// // // //                             disabled={saving || loading}
// // // //                         >
// // // //                             {saving ? 'Guardando…' : 'Guardar'}
// // // //                         </button>
// // // //                     )}
// // // //                 </div>
// // // //             </div>

// // // //             {error && (
// // // //                 <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
// // // //                     {error}
// // // //                 </div>
// // // //             )}

// // // //             {loading ? (
// // // //                 <div className="p-6 text-gray-500">Cargando…</div>
// // // //             ) : (
// // // //                 <form onSubmit={onSave} className="space-y-4">
// // // //                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // // //                         <div className="md:col-span-1">
// // // //                             <label className="text-sm text-gray-600">Código</label>
// // // //                             <input
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.code}
// // // //                                 onChange={(e) => onChange('code', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                             />
// // // //                         </div>
// // // //                         <div className="md:col-span-2">
// // // //                             <label className="text-sm text-gray-600">Nombre</label>
// // // //                             <input
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.name}
// // // //                                 onChange={(e) => onChange('name', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                             />
// // // //                         </div>
// // // //                     </div>

// // // //                     <div>
// // // //                         <label className="text-sm text-gray-600">Descripción</label>
// // // //                         <textarea
// // // //                             className="w-full border rounded px-3 py-2"
// // // //                             rows={3}
// // // //                             value={form.description}
// // // //                             onChange={(e) => onChange('description', e.target.value)}
// // // //                             disabled={viewMode}
// // // //                         />
// // // //                     </div>

// // // //                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Sistema (systemKey)</label>
// // // //                             <input
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.systemKey}
// // // //                                 onChange={(e) => onChange('systemKey', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                                 placeholder="Ej: FRENOS"
// // // //                             />
// // // //                         </div>
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Sub-sistema</label>
// // // //                             <input
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.subsystemKey}
// // // //                                 onChange={(e) => onChange('subsystemKey', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                                 placeholder="Ej: HIDRÁULICO"
// // // //                             />
// // // //                         </div>
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Componente</label>
// // // //                             <input
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.componentKey}
// // // //                                 onChange={(e) => onChange('componentKey', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                                 placeholder="Ej: BOMBA"
// // // //                             />
// // // //                         </div>
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Modo de falla</label>
// // // //                             <input
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.failureModeKey}
// // // //                                 onChange={(e) => onChange('failureModeKey', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                                 placeholder="Ej: FUGA"
// // // //                             />
// // // //                         </div>
// // // //                     </div>

// // // //                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Tipo</label>
// // // //                             <select
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.repairType}
// // // //                                 onChange={(e) => onChange('repairType', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                             >
// // // //                                 {REPAIR_TYPES.map((t) => (
// // // //                                     <option key={t} value={t}>
// // // //                                         {t}
// // // //                                     </option>
// // // //                                 ))}
// // // //                             </select>
// // // //                         </div>
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Severidad (default)</label>
// // // //                             <select
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.severityDefault}
// // // //                                 onChange={(e) => onChange('severityDefault', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                             >
// // // //                                 {SEVERITIES.map((t) => (
// // // //                                     <option key={t} value={t}>
// // // //                                         {t}
// // // //                                     </option>
// // // //                                 ))}
// // // //                             </select>
// // // //                         </div>
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Impacto operacional</label>
// // // //                             <select
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.operationalImpactDefault}
// // // //                                 onChange={(e) => onChange('operationalImpactDefault', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                             >
// // // //                                 {IMPACTS.map((t) => (
// // // //                                     <option key={t} value={t}>
// // // //                                         {t}
// // // //                                     </option>
// // // //                                 ))}
// // // //                             </select>
// // // //                         </div>
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Tiempo estándar (min)</label>
// // // //                             <input
// // // //                                 type="number"
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 value={form.standardLaborMinutes}
// // // //                                 onChange={(e) => onChange('standardLaborMinutes', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                             />
// // // //                         </div>
// // // //                     </div>

// // // //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Tags (1 por línea)</label>
// // // //                             <textarea
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 rows={4}
// // // //                                 value={form.tagsText}
// // // //                                 onChange={(e) => onChange('tagsText', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                             />
// // // //                         </div>
// // // //                         <div className="space-y-3">
// // // //                             <div className="flex items-center gap-2 pt-6">
// // // //                                 <input
// // // //                                     type="checkbox"
// // // //                                     checked={form.active}
// // // //                                     onChange={(e) => onChange('active', e.target.checked)}
// // // //                                     disabled={viewMode}
// // // //                                 />
// // // //                                 <span className="text-sm">Activo</span>
// // // //                             </div>

// // // //                             <div className="rounded border p-3 bg-gray-50">
// // // //                                 <div className="text-sm font-semibold mb-2">Archivos (Media)</div>
// // // //                                 <div className="text-xs text-gray-500 mb-3">
// // // //                                     Disponible al guardar el registro. Se administra vía repairsMedia.controller.
// // // //                                 </div>

// // // //                                 <div className="flex items-center gap-2 mb-3">
// // // //                                     <span className="text-sm">Foto:</span>
// // // //                                     {doc?.photo?.url ? (
// // // //                                         <a className="text-sm text-[var(--fc-primary)]" href={doc.photo.url} target="_blank" rel="noreferrer">
// // // //                                             Ver
// // // //                                         </a>
// // // //                                     ) : (
// // // //                                         <span className="text-sm text-gray-500">—</span>
// // // //                                     )}
// // // //                                 </div>

// // // //                                 {!viewMode && !isNew && (
// // // //                                     <div className="space-y-2">
// // // //                                         <div>
// // // //                                             <input
// // // //                                                 type="file"
// // // //                                                 accept="image/*"
// // // //                                                 onChange={(e) => onUploadPhoto(e.target.files?.[0])}
// // // //                                             />
// // // //                                         </div>
// // // //                                         <div>
// // // //                                             <input
// // // //                                                 type="file"
// // // //                                                 onChange={(e) => onUploadDoc(e.target.files?.[0])}
// // // //                                             />
// // // //                                         </div>
// // // //                                     </div>
// // // //                                 )}

// // // //                                 <div className="mt-3">
// // // //                                     <div className="text-sm font-semibold mb-2">Documentos</div>
// // // //                                     {(doc?.documents || []).length === 0 && (
// // // //                                         <div className="text-sm text-gray-500">Sin documentos</div>
// // // //                                     )}
// // // //                                     <ul className="space-y-1">
// // // //                                         {(doc?.documents || []).map((d) => (
// // // //                                             <li key={d._id} className="flex items-center justify-between gap-2">
// // // //                                                 <a className="text-sm text-[var(--fc-primary)]" href={d.url} target="_blank" rel="noreferrer">
// // // //                                                     {d.label || d.format || 'Documento'}
// // // //                                                 </a>
// // // //                                                 {!viewMode && (
// // // //                                                     <button
// // // //                                                         type="button"
// // // //                                                         className="text-xs text-red-600"
// // // //                                                         onClick={() => onDeleteDoc(d._id)}
// // // //                                                     >
// // // //                                                         Eliminar
// // // //                                                     </button>
// // // //                                                 )}
// // // //                                             </li>
// // // //                                         ))}
// // // //                                     </ul>
// // // //                                 </div>
// // // //                             </div>
// // // //                         </div>
// // // //                     </div>
// // // //                 </form>
// // // //             )}
// // // //         </div>
// // // //     )
// // // // }

// // // // //v2 280126
// // // // // front/src/pages/Repairs/Form.jsx
// // // // // -----------------------------------------------------------------------------
// // // // // Catálogo Reparaciones (Taller)
// // // // // - Modo Ver: ?mode=view
// // // // // - Guardia cambios sin guardar: hooks/UnsavedChangesGuard
// // // // // - Media: photo + documents[]
// // // // // -----------------------------------------------------------------------------

// // // // import { useEffect, useMemo, useState } from 'react'
// // // // import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
// // // // import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// // // // import { RepairsAPI } from '../../api/repairs.api'

// // // // const REPAIR_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'ADJUSTMENT']
// // // // const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
// // // // const IMPACTS = ['NO_STOP', 'LIMITED', 'OUT_OF_SERVICE']

// // // // const emptyForm = {
// // // //     code: '',
// // // //     name: '',
// // // //     description: '',
// // // //     systemKey: '',
// // // //     subsystemKey: '',
// // // //     componentKey: '',
// // // //     failureModeKey: '',
// // // //     repairType: 'CORRECTIVE',
// // // //     severityDefault: 'MEDIUM',
// // // //     operationalImpactDefault: 'LIMITED',
// // // //     standardLaborMinutes: 0,
// // // //     tagsText: '',
// // // //     active: true,
// // // // }

// // // // function toTagsText(tags) {
// // // //     return Array.isArray(tags) ? tags.join('\n') : ''
// // // // }

// // // // function parseTags(text) {
// // // //     return Array.from(
// // // //         new Set(
// // // //             String(text || '')
// // // //                 .split(/\r?\n|,/)
// // // //                 .map((s) => s.trim())
// // // //                 .filter(Boolean)
// // // //         )
// // // //     )
// // // // }

// // // // export default function RepairsForm() {
// // // //     const { id } = useParams()
// // // //     const isNew = id === 'new' || !id
// // // //     const navigate = useNavigate()
// // // //     const [sp] = useSearchParams()
// // // //     const viewMode = sp.get('mode') === 'view'

// // // //     const [loading, setLoading] = useState(false)
// // // //     const [saving, setSaving] = useState(false)
// // // //     const [error, setError] = useState('')

// // // //     const [doc, setDoc] = useState(null)
// // // //     const [form, setForm] = useState(emptyForm)
// // // //     const [initial, setInitial] = useState(null)

// // // //     const dirty = useMemo(() => {
// // // //         if (!initial) return false
// // // //         return JSON.stringify(form) !== JSON.stringify(initial)
// // // //     }, [form, initial])

// // // //     useEffect(() => {
// // // //         if (isNew) {
// // // //             setDoc(null)
// // // //             setForm(emptyForm)
// // // //             setInitial(emptyForm)
// // // //             return
// // // //         }

// // // //         setLoading(true)
// // // //         setError('')
// // // //         RepairsAPI.get(id)
// // // //             .then(({ data }) => {
// // // //                 const item = data?.item
// // // //                 setDoc(item)
// // // //                 const mapped = {
// // // //                     code: item?.code || '',
// // // //                     name: item?.name || '',
// // // //                     description: item?.description || '',
// // // //                     systemKey: item?.systemKey || '',
// // // //                     subsystemKey: item?.subsystemKey || '',
// // // //                     componentKey: item?.componentKey || '',
// // // //                     failureModeKey: item?.failureModeKey || '',
// // // //                     repairType: item?.repairType || 'CORRECTIVE',
// // // //                     severityDefault: item?.severityDefault || 'MEDIUM',
// // // //                     operationalImpactDefault: item?.operationalImpactDefault || 'LIMITED',
// // // //                     standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
// // // //                     tagsText: toTagsText(item?.tags),
// // // //                     active: Boolean(item?.active),
// // // //                 }
// // // //                 setForm(mapped)
// // // //                 setInitial(mapped)
// // // //             })
// // // //             .catch(() => setError('No se pudo cargar'))
// // // //             .finally(() => setLoading(false))
// // // //     }, [id, isNew])

// // // //     const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }))

// // // //     const onSave = async (e) => {
// // // //         e.preventDefault()
// // // //         if (viewMode) return

// // // //         setSaving(true)
// // // //         setError('')
// // // //         const payload = {
// // // //             code: form.code,
// // // //             name: form.name,
// // // //             description: form.description,
// // // //             systemKey: form.systemKey,
// // // //             subsystemKey: form.subsystemKey,
// // // //             componentKey: form.componentKey,
// // // //             failureModeKey: form.failureModeKey,
// // // //             repairType: form.repairType,
// // // //             severityDefault: form.severityDefault,
// // // //             operationalImpactDefault: form.operationalImpactDefault,
// // // //             standardLaborMinutes: Number(form.standardLaborMinutes || 0),
// // // //             tags: parseTags(form.tagsText),
// // // //             active: Boolean(form.active),
// // // //         }

// // // //         try {
// // // //             if (isNew) {
// // // //                 const { data } = await RepairsAPI.create(payload)
// // // //                 navigate(`/config/catalogs/repairs/${data?.item?._id}`)
// // // //             } else {
// // // //                 await RepairsAPI.update(id, payload)
// // // //                 setInitial(form)
// // // //             }
// // // //         } catch (err) {
// // // //             setError(err?.response?.data?.message || 'No se pudo guardar')
// // // //         } finally {
// // // //             setSaving(false)
// // // //         }
// // // //     }

// // // //     // -------- Media (solo para edición) --------
// // // //     const onUploadPhoto = async (file) => {
// // // //         if (!file || isNew || viewMode) return
// // // //         try {
// // // //             const { data } = await RepairsAPI.uploadPhoto(id, file)
// // // //             setDoc((s) => ({ ...s, photo: data?.item }))
// // // //         } catch (e) {
// // // //             setError('No se pudo subir la foto')
// // // //         }
// // // //     }

// // // //     const onUploadDoc = async (file) => {
// // // //         if (!file || isNew || viewMode) return
// // // //         try {
// // // //             const { data } = await RepairsAPI.uploadDocument(id, file, file.name)
// // // //             setDoc((s) => ({ ...s, documents: [...(s?.documents || []), data?.item] }))
// // // //         } catch (e) {
// // // //             setError('No se pudo subir el documento')
// // // //         }
// // // //     }

// // // //     const onDeleteDoc = async (docId) => {
// // // //         if (!docId || isNew || viewMode) return
// // // //         try {
// // // //             await RepairsAPI.deleteDocument(id, docId)
// // // //             setDoc((s) => ({ ...s, documents: (s?.documents || []).filter((d) => d?._id !== docId) }))
// // // //         } catch (e) {
// // // //             setError('No se pudo eliminar el documento')
// // // //         }
// // // //     }

// // // //     return (
// // // //         <div className="p-6 space-y-6">
// // // //             <UnsavedChangesGuard when={dirty && !viewMode} />

// // // //             <div className="flex items-start justify-between gap-3 mb-4">
// // // //                 <div>
// // // //                     <h1 className="text-xl font-bold">
// // // //                         {isNew ? 'Nueva Reparación' : viewMode ? 'Ver Reparación' : 'Editar Reparación'}
// // // //                     </h1>
// // // //                     <p className="text-gray-500 text-sm">
// // // //                         {viewMode
// // // //                             ? 'Vista de solo lectura. Use "Editar" para modificar.'
// // // //                             : 'Defina el estándar técnico (incluye tiempo estándar para KPI).'}
// // // //                     </p>
// // // //                 </div>

// // // //                 <div className="flex items-center gap-2">
// // // //                     <Link className="px-3 py-2 rounded border bg-white" to="/config/catalogs/repairs">
// // // //                         Volver
// // // //                     </Link>

// // // //                     {!isNew && viewMode && (
// // // //                         <button
// // // //                             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white"
// // // //                             onClick={() => navigate(`/config/catalogs/repairs/${id}`)}
// // // //                         >
// // // //                             Editar
// // // //                         </button>
// // // //                     )}

// // // //                     {!viewMode && (
// // // //                         <button
// // // //                             className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white disabled:opacity-50"
// // // //                             onClick={onSave}
// // // //                             disabled={saving || loading}
// // // //                         >
// // // //                             {saving ? 'Guardando…' : 'Guardar'}
// // // //                         </button>
// // // //                     )}
// // // //                 </div>
// // // //             </div>

// // // //             {error && (
// // // //                 <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
// // // //                     {error}
// // // //                 </div>
// // // //             )}

// // // //             {loading ? (
// // // //                 <div className="p-6 text-gray-500">Cargando…</div>
// // // //             ) : (
// // // //                 <div className="border rounded-xl p-4 bg-white">
// // // //                     <form onSubmit={onSave} className="space-y-4">
// // // //                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // // //                             <div className="md:col-span-1">
// // // //                                 <label className="text-sm text-gray-600">Código</label>
// // // //                                 <input
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.code}
// // // //                                     onChange={(e) => onChange('code', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                 />
// // // //                             </div>
// // // //                             <div className="md:col-span-2">
// // // //                                 <label className="text-sm text-gray-600">Nombre</label>
// // // //                                 <input
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.name}
// // // //                                     onChange={(e) => onChange('name', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                 />
// // // //                             </div>
// // // //                         </div>

// // // //                         <div>
// // // //                             <label className="text-sm text-gray-600">Descripción</label>
// // // //                             <textarea
// // // //                                 className="w-full border rounded px-3 py-2"
// // // //                                 rows={3}
// // // //                                 value={form.description}
// // // //                                 onChange={(e) => onChange('description', e.target.value)}
// // // //                                 disabled={viewMode}
// // // //                             />
// // // //                         </div>

// // // //                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Sistema (systemKey)</label>
// // // //                                 <input
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.systemKey}
// // // //                                     onChange={(e) => onChange('systemKey', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                     placeholder="Ej: FRENOS"
// // // //                                 />
// // // //                             </div>
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Sub-sistema</label>
// // // //                                 <input
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.subsystemKey}
// // // //                                     onChange={(e) => onChange('subsystemKey', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                     placeholder="Ej: HIDRÁULICO"
// // // //                                 />
// // // //                             </div>
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Componente</label>
// // // //                                 <input
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.componentKey}
// // // //                                     onChange={(e) => onChange('componentKey', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                     placeholder="Ej: BOMBA"
// // // //                                 />
// // // //                             </div>
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Modo de falla</label>
// // // //                                 <input
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.failureModeKey}
// // // //                                     onChange={(e) => onChange('failureModeKey', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                     placeholder="Ej: FUGA"
// // // //                                 />
// // // //                             </div>
// // // //                         </div>

// // // //                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Tipo</label>
// // // //                                 <select
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.repairType}
// // // //                                     onChange={(e) => onChange('repairType', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                 >
// // // //                                     {REPAIR_TYPES.map((t) => (
// // // //                                         <option key={t} value={t}>
// // // //                                             {t}
// // // //                                         </option>
// // // //                                     ))}
// // // //                                 </select>
// // // //                             </div>
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Severidad (default)</label>
// // // //                                 <select
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.severityDefault}
// // // //                                     onChange={(e) => onChange('severityDefault', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                 >
// // // //                                     {SEVERITIES.map((t) => (
// // // //                                         <option key={t} value={t}>
// // // //                                             {t}
// // // //                                         </option>
// // // //                                     ))}
// // // //                                 </select>
// // // //                             </div>
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Impacto operacional</label>
// // // //                                 <select
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.operationalImpactDefault}
// // // //                                     onChange={(e) => onChange('operationalImpactDefault', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                 >
// // // //                                     {IMPACTS.map((t) => (
// // // //                                         <option key={t} value={t}>
// // // //                                             {t}
// // // //                                         </option>
// // // //                                     ))}
// // // //                                 </select>
// // // //                             </div>
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Tiempo estándar (min)</label>
// // // //                                 <input
// // // //                                     type="number"
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     value={form.standardLaborMinutes}
// // // //                                     onChange={(e) => onChange('standardLaborMinutes', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                 />
// // // //                             </div>
// // // //                         </div>

// // // //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // //                             <div>
// // // //                                 <label className="text-sm text-gray-600">Tags (1 por línea)</label>
// // // //                                 <textarea
// // // //                                     className="w-full border rounded px-3 py-2"
// // // //                                     rows={4}
// // // //                                     value={form.tagsText}
// // // //                                     onChange={(e) => onChange('tagsText', e.target.value)}
// // // //                                     disabled={viewMode}
// // // //                                 />
// // // //                             </div>
// // // //                             <div className="space-y-3">
// // // //                                 <div className="flex items-center gap-2 pt-6">
// // // //                                     <input
// // // //                                         type="checkbox"
// // // //                                         checked={form.active}
// // // //                                         onChange={(e) => onChange('active', e.target.checked)}
// // // //                                         disabled={viewMode}
// // // //                                     />
// // // //                                     <span className="text-sm">Activo</span>
// // // //                                 </div>

// // // //                                 <div className="rounded border p-3 bg-gray-50">
// // // //                                     <div className="text-sm font-semibold mb-2">Archivos (Media)</div>
// // // //                                     <div className="text-xs text-gray-500 mb-3">
// // // //                                         Disponible al guardar el registro. Se administra vía repairsMedia.controller.
// // // //                                     </div>

// // // //                                     <div className="flex items-center gap-2 mb-3">
// // // //                                         <span className="text-sm">Foto:</span>
// // // //                                         {doc?.photo?.url ? (
// // // //                                             <a className="text-sm text-[var(--fc-primary)]" href={doc.photo.url} target="_blank" rel="noreferrer">
// // // //                                                 Ver
// // // //                                             </a>
// // // //                                         ) : (
// // // //                                             <span className="text-sm text-gray-500">—</span>
// // // //                                         )}
// // // //                                     </div>

// // // //                                     {!viewMode && !isNew && (
// // // //                                         <div className="space-y-2">
// // // //                                             <div>
// // // //                                                 <input
// // // //                                                     type="file"
// // // //                                                     accept="image/*"
// // // //                                                     onChange={(e) => onUploadPhoto(e.target.files?.[0])}
// // // //                                                 />
// // // //                                             </div>
// // // //                                             <div>
// // // //                                                 <input
// // // //                                                     type="file"
// // // //                                                     onChange={(e) => onUploadDoc(e.target.files?.[0])}
// // // //                                                 />
// // // //                                             </div>
// // // //                                         </div>
// // // //                                     )}

// // // //                                     <div className="mt-3">
// // // //                                         <div className="text-sm font-semibold mb-2">Documentos</div>
// // // //                                         {(doc?.documents || []).length === 0 && (
// // // //                                             <div className="text-sm text-gray-500">Sin documentos</div>
// // // //                                         )}
// // // //                                         <ul className="space-y-1">
// // // //                                             {(doc?.documents || []).map((d) => (
// // // //                                                 <li key={d._id} className="flex items-center justify-between gap-2">
// // // //                                                     <a className="text-sm text-[var(--fc-primary)]" href={d.url} target="_blank" rel="noreferrer">
// // // //                                                         {d.label || d.format || 'Documento'}
// // // //                                                     </a>
// // // //                                                     {!viewMode && (
// // // //                                                         <button
// // // //                                                             type="button"
// // // //                                                             className="text-xs text-red-600"
// // // //                                                             onClick={() => onDeleteDoc(d._id)}
// // // //                                                         >
// // // //                                                             Eliminar
// // // //                                                         </button>
// // // //                                                     )}
// // // //                                                 </li>
// // // //                                             ))}
// // // //                                         </ul>
// // // //                                     </div>
// // // //                                 </div>
// // // //                             </div>
// // // //                         </div>
// // // //                     </form>
// // // //                 </div>
// // // //             )}
// // // //         </div>
// // // //     )
// // // // }

// // // // //v2 290126
// // // // // front/src/pages/Repairs/Form.jsx
// // // // // -----------------------------------------------------------------------------
// // // // // Catálogo → Reparaciones (Taller / Técnico)
// // // // // - Estándar técnico para OT: define severidad/impacto/tiempo estándar KPI
// // // // // - Modo Ver: ?mode=view
// // // // // - Guardia de cambios sin guardar: hooks/UnsavedChangesGuard
// // // // // - system/subsystem/component/failureMode controlados por JSON (repairTaxonomy.json)
// // // // // -----------------------------------------------------------------------------

// // // // import { useEffect, useMemo, useState } from 'react'
// // // // import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
// // // // import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// // // // import { RepairsAPI } from '../../api/repairs.api'
// // // // import vehicleTaxonomy from '../../data/fleetcore/vehicle-taxonomy.json'
// // // // import repairTaxonomy from '../../data/fleetcore/repair-taxonomy.json'

// // // // const emptyForm = {
// // // //   code: '',
// // // //   name: '',
// // // //   description: '',
// // // //   systemKey: '',
// // // //   subsystemKey: '',
// // // //   componentKey: '',
// // // //   failureModeKey: '',
// // // //   type: 'CORRECTIVE',
// // // //   severityDefault: 'MEDIUM',
// // // //   operationalImpact: 'LIMITED',
// // // //   standardLaborMinutes: 0,
// // // //   tags: [],
// // // //   isActive: true,
// // // // }

// // // // function toLines(arr){
// // // //   return Array.isArray(arr) ? arr.filter(Boolean).join('\n') : ''
// // // // }
// // // // function fromLines(text){
// // // //   return String(text || '')
// // // //     .split('\n')
// // // //     .map(s => s.trim())
// // // //     .filter(Boolean)
// // // // }

// // // // const TYPE_OPTIONS = [
// // // //   { v: 'CORRECTIVE', l: 'Correctiva' },
// // // //   { v: 'PREVENTIVE', l: 'Preventiva' },
// // // //   { v: 'INSPECTION', l: 'Inspección' },
// // // //   { v: 'UPGRADE', l: 'Mejora/Upgrade' },
// // // // ]
// // // // const SEVERITY_OPTIONS = [
// // // //   { v: 'LOW', l: 'Baja' },
// // // //   { v: 'MEDIUM', l: 'Media' },
// // // //   { v: 'HIGH', l: 'Alta' },
// // // //   { v: 'CRITICAL', l: 'Crítica' },
// // // // ]
// // // // const IMPACT_OPTIONS = [
// // // //   { v: 'NO_STOP', l: 'Opera normal (No stop)' },
// // // //   { v: 'LIMITED', l: 'Opera con restricción (Limited)' },
// // // //   { v: 'OUT_OF_SERVICE', l: 'Fuera de servicio (Out of service)' },
// // // // ]

// // // // export default function RepairsForm(){
// // // //   const nav = useNavigate()
// // // //   const { id } = useParams()
// // // //   const [sp] = useSearchParams()
// // // //   const viewMode = sp.get('mode') === 'view'

// // // //   const [loading, setLoading] = useState(false)
// // // //   const [saving, setSaving] = useState(false)
// // // //   const [form, setForm] = useState(emptyForm)
// // // //   const [initial, setInitial] = useState(emptyForm)

// // // //   // labels para systemKey (coherente con otros módulos)
// // // //   const systemLabels = useMemo(() => {
// // // //     const m = new Map()
// // // //     ;(vehicleTaxonomy?.systems || []).forEach(s => m.set(s.key, s.label))
// // // //     return m
// // // //   }, [])

// // // //   const repairSystems = useMemo(() => (repairTaxonomy?.systems || []), [])

// // // //   const selectedSystemNode = useMemo(() => {
// // // //     return repairSystems.find(s => s.key === form.systemKey) || null
// // // //   }, [repairSystems, form.systemKey])

// // // //   const subsystemOptions = useMemo(() => selectedSystemNode?.subsystems || [], [selectedSystemNode])
// // // //   const componentOptions = useMemo(() => selectedSystemNode?.components || [], [selectedSystemNode])
// // // //   const failureModes = useMemo(() => repairTaxonomy?.failureModes || [], [])

// // // //   const isDirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(form), [initial, form])

// // // //   UnsavedChangesGuard({
// // // //     when: isDirty && !viewMode,
// // // //     message: 'Hay cambios sin guardar. ¿Deseas salir sin guardar?',
// // // //   })

// // // //   const onBack = () => {
// // // //     if (!viewMode && isDirty) {
// // // //       const ok = window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')
// // // //       if (!ok) return
// // // //     }
// // // //     nav(-1)
// // // //   }

// // // //   // si cambia systemKey, resetea dependientes si quedan inválidos
// // // //   useEffect(() => {
// // // //     if (!form.systemKey) {
// // // //       if (form.subsystemKey || form.componentKey) {
// // // //         setForm(s => ({ ...s, subsystemKey:'', componentKey:'' }))
// // // //       }
// // // //       return
// // // //     }
// // // //     const validSub = (subsystemOptions || []).some(x => x.key === form.subsystemKey)
// // // //     const validComp = (componentOptions || []).some(x => x.key === form.componentKey)
// // // //     if (!validSub && form.subsystemKey) setForm(s => ({ ...s, subsystemKey: '' }))
// // // //     if (!validComp && form.componentKey) setForm(s => ({ ...s, componentKey: '' }))
// // // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // // //   }, [form.systemKey, subsystemOptions, componentOptions])

// // // //   const load = async () => {
// // // //     if (!id) {
// // // //       setForm(emptyForm)
// // // //       setInitial(emptyForm)
// // // //       return
// // // //     }
// // // //     setLoading(true)
// // // //     try{
// // // //       const { data } = await RepairsAPI.get(id)
// // // //       const item = data?.item || data?.data || data
// // // //       const next = {
// // // //         code: item?.code || '',
// // // //         name: item?.name || '',
// // // //         description: item?.description || '',
// // // //         systemKey: item?.systemKey || '',
// // // //         subsystemKey: item?.subsystemKey || '',
// // // //         componentKey: item?.componentKey || '',
// // // //         failureModeKey: item?.failureModeKey || '',
// // // //         type: item?.type || 'CORRECTIVE',
// // // //         severityDefault: item?.severityDefault || 'MEDIUM',
// // // //         operationalImpact: item?.operationalImpact || 'LIMITED',
// // // //         standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
// // // //         tags: Array.isArray(item?.tags) ? item.tags : [],
// // // //         isActive: item?.isActive !== false,
// // // //       }
// // // //       setForm(next)
// // // //       setInitial(next)
// // // //     }catch(err){
// // // //       console.error(err)
// // // //       alert(err?.response?.data?.message || 'No fue posible cargar el registro')
// // // //     }finally{
// // // //       setLoading(false)
// // // //     }
// // // //   }

// // // //   useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

// // // //   const submit = async (e) => {
// // // //     e.preventDefault()
// // // //     if (viewMode) return
// // // //     if (!form.code.trim()) return alert('Código es obligatorio')
// // // //     if (!form.name.trim()) return alert('Nombre es obligatorio')
// // // //     if (!form.systemKey) return alert('Sistema es obligatorio')

// // // //     const payload = {
// // // //       code: form.code.trim().toUpperCase(),
// // // //       name: form.name.trim(),
// // // //       description: form.description,
// // // //       systemKey: form.systemKey,
// // // //       subsystemKey: form.subsystemKey || '',
// // // //       componentKey: form.componentKey || '',
// // // //       failureModeKey: form.failureModeKey || '',
// // // //       type: form.type,
// // // //       severityDefault: form.severityDefault,
// // // //       operationalImpact: form.operationalImpact,
// // // //       standardLaborMinutes: Number(form.standardLaborMinutes || 0),
// // // //       tags: Array.isArray(form.tags) ? form.tags : [],
// // // //       isActive: form.isActive !== false,
// // // //     }

// // // //     setSaving(true)
// // // //     try{
// // // //       if (id) {
// // // //         await RepairsAPI.update(id, payload)
// // // //         alert('Reparación actualizada')
// // // //       } else {
// // // //         const { data } = await RepairsAPI.create(payload)
// // // //         const createdId = data?.item?._id || data?._id
// // // //         alert('Reparación creada')
// // // //         if (createdId) nav(`/config/catalogs/repairs/${createdId}`)
// // // //       }
// // // //       setInitial(payload)
// // // //     }catch(err){
// // // //       console.error(err)
// // // //       alert(err?.response?.data?.message || 'No fue posible guardar')
// // // //     }finally{
// // // //       setSaving(false)
// // // //     }
// // // //   }

// // // //   const tagHints = useMemo(() => {
// // // //     const t = repairTaxonomy?.repairTags || {}
// // // //     const all = [ ...(t.work||[]), ...(t.level||[]), ...(t.family||[]) ]
// // // //     return Array.from(new Set(all))
// // // //   }, [])

// // // //   return (
// // // //     <div className="p-6 space-y-6">
// // // //       <div>
// // // //         <h1 className="text-xl font-bold">{id ? 'Editar Reparación' : 'Nueva Reparación'}</h1>
// // // //         <p className="text-sm text-gray-600">Defina el estándar técnico (incluye tiempo estándar para KPI).</p>
// // // //       </div>

// // // //       <form onSubmit={submit} className="bg-white border rounded-2xl shadow-sm">
// // // //         {/* Header interno (cierra esquinas superiores) */}
// // // //         <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
// // // //           <div className="text-sm text-gray-500">{loading ? 'Cargando…' : viewMode ? 'Modo ver' : isDirty ? 'Cambios sin guardar' : 'Sin cambios'}</div>
// // // //           <div className="flex items-center gap-2">
// // // //             <button type="button" className="btn border rounded px-4 py-2" onClick={onBack}>
// // // //               {(!viewMode && isDirty) ? 'Cancelar' : 'Volver'}
// // // //             </button>
// // // //             {!viewMode && (
// // // //               <button type="submit" className="btn btn-primary rounded px-4 py-2 text-white" disabled={saving || loading}>
// // // //                 {saving ? 'Guardando…' : 'Guardar'}
// // // //               </button>
// // // //             )}
// // // //           </div>
// // // //         </div>

// // // //         <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
// // // //           <label className="text-sm md:col-span-2">
// // // //             <div className="text-gray-600 mb-1">Código *</div>
// // // //             <input className="border rounded px-3 py-2 w-full" value={form.code} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, code: e.target.value }))} placeholder="Ej: REP-FREN-001" />
// // // //           </label>

// // // //           <label className="text-sm md:col-span-2">
// // // //             <div className="text-gray-600 mb-1">Nombre *</div>
// // // //             <input className="border rounded px-3 py-2 w-full" value={form.name} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, name: e.target.value }))} placeholder="Ej: Cambio pastillas delanteras" />
// // // //           </label>

// // // //           <label className="text-sm md:col-span-4">
// // // //             <div className="text-gray-600 mb-1">Descripción</div>
// // // //             <textarea className="border rounded px-3 py-2 w-full min-h-24" value={form.description} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, description: e.target.value }))} />
// // // //           </label>

// // // //           <label className="text-sm">
// // // //             <div className="text-gray-600 mb-1">Sistema *</div>
// // // //             <select className="border rounded px-3 py-2 w-full" value={form.systemKey} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, systemKey: e.target.value }))}>
// // // //               <option value="">Seleccione…</option>
// // // //               {(vehicleTaxonomy?.systems || []).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
// // // //             </select>
// // // //             <div className="text-xs text-gray-500 mt-1">Recomendado usar el canon del sistema para BI.</div>
// // // //           </label>

// // // //           <label className="text-sm">
// // // //             <div className="text-gray-600 mb-1">Sub-sistema</div>
// // // //             <select className="border rounded px-3 py-2 w-full" value={form.subsystemKey} disabled={viewMode||loading || !form.systemKey}
// // // //               onChange={(e)=>setForm(s=>({ ...s, subsystemKey: e.target.value }))}>
// // // //               <option value="">{form.systemKey ? '(Sin sub-sistema)' : 'Seleccione sistema primero'}</option>
// // // //               {subsystemOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// // // //             </select>
// // // //             <div className="text-xs text-gray-500 mt-1">Depende del sistema seleccionado (evita combinaciones inválidas).</div>
// // // //           </label>

// // // //           <label className="text-sm">
// // // //             <div className="text-gray-600 mb-1">Componente</div>
// // // //             <select className="border rounded px-3 py-2 w-full" value={form.componentKey} disabled={viewMode||loading || !form.systemKey}
// // // //               onChange={(e)=>setForm(s=>({ ...s, componentKey: e.target.value }))}>
// // // //               <option value="">{form.systemKey ? '(Sin componente)' : 'Seleccione sistema primero'}</option>
// // // //               {componentOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// // // //             </select>
// // // //           </label>

// // // //           <label className="text-sm">
// // // //             <div className="text-gray-600 mb-1">Modo de falla</div>
// // // //             <select className="border rounded px-3 py-2 w-full" value={form.failureModeKey} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, failureModeKey: e.target.value }))}>
// // // //               <option value="">(Sin modo)</option>
// // // //               {failureModes.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// // // //             </select>
// // // //             <div className="text-xs text-gray-500 mt-1">Clave para análisis de confiabilidad (RCM/FMEA).</div>
// // // //           </label>

// // // //           <label className="text-sm">
// // // //             <div className="text-gray-600 mb-1">Tipo</div>
// // // //             <select className="border rounded px-3 py-2 w-full" value={form.type} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, type: e.target.value }))}>
// // // //               {TYPE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// // // //             </select>
// // // //             <div className="text-xs text-gray-500 mt-1">Correctiva/Preventiva define KPI y planificación.</div>
// // // //           </label>

// // // //           <label className="text-sm">
// // // //             <div className="text-gray-600 mb-1">Severidad (default)</div>
// // // //             <select className="border rounded px-3 py-2 w-full" value={form.severityDefault} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, severityDefault: e.target.value }))}>
// // // //               {SEVERITY_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// // // //             </select>
// // // //           </label>

// // // //           <label className="text-sm">
// // // //             <div className="text-gray-600 mb-1">Impacto operacional</div>
// // // //             <select className="border rounded px-3 py-2 w-full" value={form.operationalImpact} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, operationalImpact: e.target.value }))}>
// // // //               {IMPACT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// // // //             </select>
// // // //             <div className="text-xs text-gray-500 mt-1">Para SLA y criticidad (operable / limitado / fuera de servicio).</div>
// // // //           </label>

// // // //           <label className="text-sm">
// // // //             <div className="text-gray-600 mb-1">Tiempo estándar (min)</div>
// // // //             <input type="number" min="0" className="border rounded px-3 py-2 w-full" value={form.standardLaborMinutes}
// // // //               disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, standardLaborMinutes: Number(e.target.value || 0) }))}/>
// // // //             <div className="text-xs text-gray-500 mt-1">Base para KPI (real vs estándar) y planificación.</div>
// // // //           </label>

// // // //           <label className="text-sm md:col-span-2">
// // // //             <div className="text-gray-600 mb-1">Tags (1 por línea)</div>
// // // //             <textarea className="border rounded px-3 py-2 w-full min-h-24" value={toLines(form.tags)} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, tags: fromLines(e.target.value).map(t=>t.toUpperCase()) }))}/>
// // // //             <div className="text-xs text-gray-500 mt-1">
// // // //               Sugeridos: {tagHints.slice(0, 10).join(', ')}{tagHints.length > 10 ? '…' : ''}
// // // //             </div>
// // // //           </label>

// // // //           <label className="text-sm flex items-center gap-2 md:col-span-2 mt-6">
// // // //             <input type="checkbox" checked={form.isActive} disabled={viewMode||loading}
// // // //               onChange={(e)=>setForm(s=>({ ...s, isActive: e.target.checked }))}/>
// // // //             <span>Activo</span>
// // // //           </label>

// // // //           {/* Media: se gestiona vía repairsMedia.controller (backend). UI se implementa cuando el módulo de documentos esté consolidado */}
// // // //           <div className="md:col-span-4 border rounded-xl p-3 bg-gray-50">
// // // //             <div className="text-sm font-medium">Activos (media)</div>
// // // //             <div className="text-xs text-gray-600 mt-1">
// // // //               Disponible al guardar el registro. Se administra vía <span className="font-mono">repairsMedia.controller</span>.
// // // //             </div>
// // // //             <div className="mt-2 text-sm text-gray-700">
// // // //               <div><span className="font-medium">Foto:</span> —</div>
// // // //               <div className="mt-1"><span className="font-medium">Documentos:</span> —</div>
// // // //             </div>
// // // //           </div>

// // // //         </div>
// // // //       </form>
// // // //     </div>
// // // //   )
// // // // }
// // // // front/src/pages/Repairs/Form.jsx
// // // // -----------------------------------------------------------------------------
// // // // Catálogo → Reparaciones (Taller / Técnico)
// // // // - Estándar técnico para OT: define severidad/impacto/tiempo estándar KPI
// // // // - Modo Ver: ?mode=view
// // // // - Guardia de cambios sin guardar: hooks/UnsavedChangesGuard
// // // // - system/subsystem/component/failureMode controlados por JSON (repairTaxonomy.json)
// // // // -----------------------------------------------------------------------------

// // // import { useEffect, useMemo, useState } from 'react'
// // // import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
// // // import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// // // import { RepairsAPI } from '../../api/repairs.api'
// // // import vehicleTaxonomy from '../../data/fleetcore/vehicle-taxonomy.json'
// // // import repairTaxonomy from '../../data/fleetcore/repair-taxonomy.json'

// // // const emptyForm = {
// // //   code: '',
// // //   name: '',
// // //   description: '',
// // //   systemKey: '',
// // //   subsystemKey: '',
// // //   componentKey: '',
// // //   failureModeKey: '',
// // //   type: 'CORRECTIVE',
// // //   severityDefault: 'MEDIUM',
// // //   operationalImpact: 'LIMITED',
// // //   standardLaborMinutes: 0,
// // //   tags: [],
// // //   isActive: true,
// // // }

// // // function toLines(arr){
// // //   return Array.isArray(arr) ? arr.filter(Boolean).join('\n') : ''
// // // }
// // // function fromLines(text){
// // //   return String(text || '')
// // //     .split('\n')
// // //     .map(s => s.trim())
// // //     .filter(Boolean)
// // // }

// // // const TYPE_OPTIONS = [
// // //   { v: 'CORRECTIVE', l: 'Correctiva' },
// // //   { v: 'PREVENTIVE', l: 'Preventiva' },
// // //   { v: 'INSPECTION', l: 'Inspección' },
// // //   { v: 'UPGRADE', l: 'Mejora/Upgrade' },
// // // ]
// // // const SEVERITY_OPTIONS = [
// // //   { v: 'LOW', l: 'Baja' },
// // //   { v: 'MEDIUM', l: 'Media' },
// // //   { v: 'HIGH', l: 'Alta' },
// // //   { v: 'CRITICAL', l: 'Crítica' },
// // // ]
// // // const IMPACT_OPTIONS = [
// // //   { v: 'NO_STOP', l: 'Opera normal (No stop)' },
// // //   { v: 'LIMITED', l: 'Opera con restricción (Limited)' },
// // //   { v: 'OUT_OF_SERVICE', l: 'Fuera de servicio (Out of service)' },
// // // ]

// // // export default function RepairsForm(){
// // //   const nav = useNavigate()
// // //   const { id } = useParams()
// // //   const [sp] = useSearchParams()
// // //   const viewMode = sp.get('mode') === 'view'

// // //   const [loading, setLoading] = useState(false)
// // //   const [saving, setSaving] = useState(false)
// // //   const [form, setForm] = useState(emptyForm)
// // //   const [initial, setInitial] = useState(emptyForm)

// // //   // labels para systemKey (coherente con otros módulos)
// // //   const systemLabels = useMemo(() => {
// // //     const m = new Map()
// // //     ;(vehicleTaxonomy?.systems || []).forEach(s => m.set(s.key, s.label))
// // //     return m
// // //   }, [])

// // //   const repairSystems = useMemo(() => (repairTaxonomy?.systems || []), [])

// // //   const selectedSystemNode = useMemo(() => {
// // //     return repairSystems.find(s => s.key === form.systemKey) || null
// // //   }, [repairSystems, form.systemKey])

// // //   const subsystemOptions = useMemo(() => selectedSystemNode?.subsystems || [], [selectedSystemNode])
// // //   const componentOptions = useMemo(() => selectedSystemNode?.components || [], [selectedSystemNode])
// // //   const failureModes = useMemo(() => repairTaxonomy?.failureModes || [], [])

// // //   const isDirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(form), [initial, form])

// // //   UnsavedChangesGuard({
// // //     when: isDirty && !viewMode,
// // //     message: 'Hay cambios sin guardar. ¿Deseas salir sin guardar?',
// // //   })

// // //   const onBack = () => {
// // //     if (!viewMode && isDirty) {
// // //       const ok = window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')
// // //       if (!ok) return
// // //     }
// // //     nav('/config/catalogs/repairs')
// // //   }

// // //   // si cambia systemKey, resetea dependientes si quedan inválidos
// // //   useEffect(() => {
// // //     if (!form.systemKey) {
// // //       if (form.subsystemKey || form.componentKey) {
// // //         setForm(s => ({ ...s, subsystemKey:'', componentKey:'' }))
// // //       }
// // //       return
// // //     }
// // //     const validSub = (subsystemOptions || []).some(x => x.key === form.subsystemKey)
// // //     const validComp = (componentOptions || []).some(x => x.key === form.componentKey)
// // //     if (!validSub && form.subsystemKey) setForm(s => ({ ...s, subsystemKey: '' }))
// // //     if (!validComp && form.componentKey) setForm(s => ({ ...s, componentKey: '' }))
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [form.systemKey, subsystemOptions, componentOptions])

// // //   const load = async () => {
// // //     if (!id) {
// // //       setForm(emptyForm)
// // //       setInitial(emptyForm)
// // //       return
// // //     }
// // //     setLoading(true)
// // //     try{
// // //       const { data } = await RepairsAPI.get(id)
// // //       const item = data?.item || data?.data || data
// // //       const next = {
// // //         code: item?.code || '',
// // //         name: item?.name || '',
// // //         description: item?.description || '',
// // //         systemKey: item?.systemKey || '',
// // //         subsystemKey: item?.subsystemKey || '',
// // //         componentKey: item?.componentKey || '',
// // //         failureModeKey: item?.failureModeKey || '',
// // //         type: item?.type || 'CORRECTIVE',
// // //         severityDefault: item?.severityDefault || 'MEDIUM',
// // //         operationalImpact: item?.operationalImpact || 'LIMITED',
// // //         standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
// // //         tags: Array.isArray(item?.tags) ? item.tags : [],
// // //         isActive: item?.isActive !== false,
// // //       }
// // //       setForm(next)
// // //       setInitial(next)
// // //     }catch(err){
// // //       console.error(err)
// // //       alert(err?.response?.data?.message || 'No fue posible cargar el registro')
// // //     }finally{
// // //       setLoading(false)
// // //     }
// // //   }

// // //   useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

// // //   const submit = async (e) => {
// // //     e.preventDefault()
// // //     if (viewMode) return
// // //     if (id && !isDirty) return alert('No hay cambios por guardar')
// // //     if (!form.code.trim()) return alert('Código es obligatorio')
// // //     if (!form.name.trim()) return alert('Nombre es obligatorio')
// // //     if (!form.systemKey) return alert('Sistema es obligatorio')

// // //     const payload = {
// // //       code: form.code.trim().toUpperCase(),
// // //       name: form.name.trim(),
// // //       description: form.description,
// // //       systemKey: form.systemKey,
// // //       subsystemKey: form.subsystemKey || '',
// // //       componentKey: form.componentKey || '',
// // //       failureModeKey: form.failureModeKey || '',
// // //       type: form.type,
// // //       severityDefault: form.severityDefault,
// // //       operationalImpact: form.operationalImpact,
// // //       standardLaborMinutes: Number(form.standardLaborMinutes || 0),
// // //       tags: Array.isArray(form.tags) ? form.tags : [],
// // //       isActive: form.isActive !== false,
// // //     }

// // //     setSaving(true)
// // //     try{
// // //       if (id) {
// // //         await RepairsAPI.update(id, payload)
// // //         alert('Reparación actualizada')
// // //       } else {
// // //         await RepairsAPI.create(payload)
// // //         alert('Reparación creada')
// // //       }
// // //       setInitial(payload)
// // //       // Lineamiento FleetCore: al guardar, volver al listado
// // //       nav('/config/catalogs/repairs')
// // //     }catch(err){
// // //       console.error(err)
// // //       const msg = err?.response?.data?.message
// // //       // Mensaje más claro para código duplicado (Mongo dup key)
// // //       if (String(msg || '').toLowerCase().includes('duplicate') || err?.response?.status === 409 || err?.response?.status === 400) {
// // //         alert(msg || 'El código ya existe. Usa un código distinto.')
// // //       } else {
// // //         alert(msg || 'No fue posible guardar')
// // //       }
// // //     }finally{
// // //       setSaving(false)
// // //     }
// // //   }

// // //   const tagHints = useMemo(() => {
// // //     const t = repairTaxonomy?.repairTags || {}
// // //     const all = [ ...(t.work||[]), ...(t.level||[]), ...(t.family||[]) ]
// // //     return Array.from(new Set(all))
// // //   }, [])

// // //   return (
// // //     <div className="p-6 space-y-6">
// // //       <div>
// // //         <h1 className="text-xl font-bold">{id ? 'Editar Reparación' : 'Nueva Reparación'}</h1>
// // //         <p className="text-sm text-gray-600">Defina el estándar técnico (incluye tiempo estándar para KPI).</p>
// // //       </div>

// // //       <form onSubmit={submit} className="bg-white border rounded-2xl shadow-sm">
// // //         {/* Header interno (cierra esquinas superiores) */}
// // //         <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
// // //           <div className="text-sm text-gray-500">{loading ? 'Cargando…' : viewMode ? 'Modo ver' : isDirty ? 'Cambios sin guardar' : 'Sin cambios'}</div>
// // //           <div className="flex items-center gap-2">
// // //             <button type="button" className="btn border rounded px-4 py-2" onClick={onBack}>
// // //               {(!viewMode && isDirty) ? 'Cancelar' : 'Volver'}
// // //             </button>
// // //             {!viewMode && (
// // //               <button type="submit" className="btn btn-primary rounded px-4 py-2 text-white" disabled={saving || loading}>
// // //                 {saving ? 'Guardando…' : 'Guardar'}
// // //               </button>
// // //             )}
// // //           </div>
// // //         </div>

// // //         <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
// // //           <label className="text-sm md:col-span-2">
// // //             <div className="text-gray-600 mb-1">Código *</div>
// // //             <input className="border rounded px-3 py-2 w-full" value={form.code} disabled={viewMode||loading}
// // //               maxLength={25}
// // //               onChange={(e)=>setForm(s=>({ ...s, code: e.target.value }))} placeholder="Ej: REP-FREN-001" />
// // //           </label>

// // //           <label className="text-sm md:col-span-2">
// // //             <div className="text-gray-600 mb-1">Nombre *</div>
// // //             <input className="border rounded px-3 py-2 w-full" value={form.name} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, name: e.target.value }))} placeholder="Ej: Cambio pastillas delanteras" />
// // //           </label>

// // //           <label className="text-sm md:col-span-4">
// // //             <div className="text-gray-600 mb-1">Descripción</div>
// // //             <textarea className="border rounded px-3 py-2 w-full min-h-24" value={form.description} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, description: e.target.value }))} />
// // //           </label>

// // //           <label className="text-sm">
// // //             <div className="text-gray-600 mb-1">Sistema *</div>
// // //             <select className="border rounded px-3 py-2 w-full" value={form.systemKey} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, systemKey: e.target.value }))}>
// // //               <option value="">Seleccione…</option>
// // //               {(vehicleTaxonomy?.systems || []).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
// // //             </select>
// // //             <div className="text-xs text-gray-500 mt-1">Recomendado usar el canon del sistema para BI.</div>
// // //           </label>

// // //           <label className="text-sm">
// // //             <div className="text-gray-600 mb-1">Sub-sistema</div>
// // //             <select className="border rounded px-3 py-2 w-full" value={form.subsystemKey} disabled={viewMode||loading || !form.systemKey}
// // //               onChange={(e)=>setForm(s=>({ ...s, subsystemKey: e.target.value }))}>
// // //               <option value="">{form.systemKey ? '(Sin sub-sistema)' : 'Seleccione sistema primero'}</option>
// // //               {subsystemOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// // //             </select>
// // //             <div className="text-xs text-gray-500 mt-1">Depende del sistema seleccionado (evita combinaciones inválidas).</div>
// // //           </label>

// // //           <label className="text-sm">
// // //             <div className="text-gray-600 mb-1">Componente</div>
// // //             <select className="border rounded px-3 py-2 w-full" value={form.componentKey} disabled={viewMode||loading || !form.systemKey}
// // //               onChange={(e)=>setForm(s=>({ ...s, componentKey: e.target.value }))}>
// // //               <option value="">{form.systemKey ? '(Sin componente)' : 'Seleccione sistema primero'}</option>
// // //               {componentOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// // //             </select>
// // //           </label>

// // //           <label className="text-sm">
// // //             <div className="text-gray-600 mb-1">Modo de falla</div>
// // //             <select className="border rounded px-3 py-2 w-full" value={form.failureModeKey} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, failureModeKey: e.target.value }))}>
// // //               <option value="">(Sin modo)</option>
// // //               {failureModes.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// // //             </select>
// // //             <div className="text-xs text-gray-500 mt-1">Clave para análisis de confiabilidad (RCM/FMEA).</div>
// // //           </label>

// // //           <label className="text-sm">
// // //             <div className="text-gray-600 mb-1">Tipo</div>
// // //             <select className="border rounded px-3 py-2 w-full" value={form.type} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, type: e.target.value }))}>
// // //               {TYPE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// // //             </select>
// // //             <div className="text-xs text-gray-500 mt-1">Correctiva/Preventiva define KPI y planificación.</div>
// // //           </label>

// // //           <label className="text-sm">
// // //             <div className="text-gray-600 mb-1">Severidad (default)</div>
// // //             <select className="border rounded px-3 py-2 w-full" value={form.severityDefault} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, severityDefault: e.target.value }))}>
// // //               {SEVERITY_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// // //             </select>
// // //           </label>

// // //           <label className="text-sm">
// // //             <div className="text-gray-600 mb-1">Impacto operacional</div>
// // //             <select className="border rounded px-3 py-2 w-full" value={form.operationalImpact} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, operationalImpact: e.target.value }))}>
// // //               {IMPACT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// // //             </select>
// // //             <div className="text-xs text-gray-500 mt-1">Para SLA y criticidad (operable / limitado / fuera de servicio).</div>
// // //           </label>

// // //           <label className="text-sm">
// // //             <div className="text-gray-600 mb-1">Tiempo estándar (min)</div>
// // //             <input type="number" min="0" className="border rounded px-3 py-2 w-full" value={form.standardLaborMinutes}
// // //               disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, standardLaborMinutes: Number(e.target.value || 0) }))}/>
// // //             <div className="text-xs text-gray-500 mt-1">Base para KPI (real vs estándar) y planificación.</div>
// // //           </label>

// // //           <label className="text-sm md:col-span-2">
// // //             <div className="text-gray-600 mb-1">Tags (1 por línea)</div>
// // //             <textarea className="border rounded px-3 py-2 w-full min-h-24" value={toLines(form.tags)} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, tags: fromLines(e.target.value).map(t=>t.toUpperCase()) }))}/>
// // //             <div className="text-xs text-gray-500 mt-1">
// // //               Sugeridos: {tagHints.slice(0, 10).join(', ')}{tagHints.length > 10 ? '…' : ''}
// // //             </div>
// // //           </label>

// // //           <label className="text-sm flex items-center gap-2 md:col-span-2 mt-6">
// // //             <input type="checkbox" checked={form.isActive} disabled={viewMode||loading}
// // //               onChange={(e)=>setForm(s=>({ ...s, isActive: e.target.checked }))}/>
// // //             <span>Activo</span>
// // //           </label>

// // //           {/* Media: se gestiona vía repairsMedia.controller (backend). UI se implementa cuando el módulo de documentos esté consolidado */}
// // //           <div className="md:col-span-4 border rounded-xl p-3 bg-gray-50">
// // //             <div className="text-sm font-medium">Activos (media)</div>
// // //             <div className="text-xs text-gray-600 mt-1">
// // //               Disponible al guardar el registro. Se administra vía <span className="font-mono">repairsMedia.controller</span>.
// // //             </div>
// // //             <div className="mt-2 text-sm text-gray-700">
// // //               <div><span className="font-medium">Foto:</span> —</div>
// // //               <div className="mt-1"><span className="font-medium">Documentos:</span> —</div>
// // //             </div>
// // //           </div>

// // //         </div>
// // //       </form>
// // //     </div>
// // //   )
// // // }

// // // front/src/pages/Repairs/Form.jsx
// // // -----------------------------------------------------------------------------
// // // Catálogo → Reparaciones (Taller / Técnico)
// // // - Estándar técnico para OT: define severidad/impacto/tiempo estándar KPI
// // // - Modo Ver: ?mode=view
// // // - Guardia de cambios sin guardar: hooks/UnsavedChangesGuard
// // // - system/subsystem/component/failureMode controlados por JSON (repairTaxonomy.json)
// // // -----------------------------------------------------------------------------

// // import { useEffect, useMemo, useState } from 'react'
// // import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
// // import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// // import { RepairsAPI } from '../../api/repairs.api'
// // import vehicleTaxonomy from '../../data/fleetcore/vehicle-taxonomy.json'
// // import repairTaxonomy from '../../data/fleetcore/repair-taxonomy.json'

// // const emptyForm = {
// //   code: '',
// //   name: '',
// //   description: '',
// //   systemKey: '',
// //   subsystemKey: '',
// //   componentKey: '',
// //   failureModeKey: '',
// //   type: 'CORRECTIVE',
// //   severityDefault: 'MEDIUM',
// //   operationalImpact: 'LIMITED',
// //   standardLaborMinutes: 0,
// //   tags: [],
// //   isActive: true,
// // }

// // function toLines(arr){
// //   return Array.isArray(arr) ? arr.filter(Boolean).join('\n') : ''
// // }
// // function fromLines(text){
// //   return String(text || '')
// //     .split('\n')
// //     .map(s => s.trim())
// //     .filter(Boolean)
// // }

// // const TYPE_OPTIONS = [
// //   { v: 'CORRECTIVE', l: 'Correctiva' },
// //   { v: 'PREVENTIVE', l: 'Preventiva' },
// //   { v: 'INSPECTION', l: 'Inspección' },
// //   { v: 'UPGRADE', l: 'Mejora/Upgrade' },
// // ]
// // const SEVERITY_OPTIONS = [
// //   { v: 'LOW', l: 'Baja' },
// //   { v: 'MEDIUM', l: 'Media' },
// //   { v: 'HIGH', l: 'Alta' },
// //   { v: 'CRITICAL', l: 'Crítica' },
// // ]
// // const IMPACT_OPTIONS = [
// //   { v: 'NO_STOP', l: 'Opera normal (No stop)' },
// //   { v: 'LIMITED', l: 'Opera con restricción (Limited)' },
// //   { v: 'OUT_OF_SERVICE', l: 'Fuera de servicio (Out of service)' },
// // ]

// // export default function RepairsForm(){
// //   const nav = useNavigate()
// //   const { id } = useParams()
// //   const [sp] = useSearchParams()
// //   const viewMode = sp.get('mode') === 'view'

// //   const [loading, setLoading] = useState(false)
// //   const [saving, setSaving] = useState(false)
// //   const [form, setForm] = useState(emptyForm)
// //   const [initial, setInitial] = useState(emptyForm)

// //   // labels para systemKey (coherente con otros módulos)
// //   const systemLabels = useMemo(() => {
// //     const m = new Map()
// //     ;(vehicleTaxonomy?.systems || []).forEach(s => m.set(s.key, s.label))
// //     return m
// //   }, [])

// //   const repairSystems = useMemo(() => (repairTaxonomy?.systems || []), [])

// //   const selectedSystemNode = useMemo(() => {
// //     return repairSystems.find(s => s.key === form.systemKey) || null
// //   }, [repairSystems, form.systemKey])

// //   const subsystemOptions = useMemo(() => selectedSystemNode?.subsystems || [], [selectedSystemNode])
// //   const componentOptions = useMemo(() => selectedSystemNode?.components || [], [selectedSystemNode])
// //   const failureModes = useMemo(() => repairTaxonomy?.failureModes || [], [])

// //   const isDirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(form), [initial, form])

// //   UnsavedChangesGuard({
// //     when: isDirty && !viewMode,
// //     message: 'Hay cambios sin guardar. ¿Deseas salir sin guardar?',
// //   })

// //   const onBack = () => {
// //     if (!viewMode && isDirty) {
// //       const ok = window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')
// //       if (!ok) return
// //     }
// //     nav('/config/catalogs/repairs')
// //   }

// //   // si cambia systemKey, resetea dependientes si quedan inválidos
// //   useEffect(() => {
// //     if (!form.systemKey) {
// //       if (form.subsystemKey || form.componentKey) {
// //         setForm(s => ({ ...s, subsystemKey:'', componentKey:'' }))
// //       }
// //       return
// //     }
// //     const validSub = (subsystemOptions || []).some(x => x.key === form.subsystemKey)
// //     const validComp = (componentOptions || []).some(x => x.key === form.componentKey)
// //     if (!validSub && form.subsystemKey) setForm(s => ({ ...s, subsystemKey: '' }))
// //     if (!validComp && form.componentKey) setForm(s => ({ ...s, componentKey: '' }))
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [form.systemKey, subsystemOptions, componentOptions])

// //   const load = async () => {
// //     if (!id) {
// //       setForm(emptyForm)
// //       setInitial(emptyForm)
// //       return
// //     }
// //     setLoading(true)
// //     try{
// //       const { data } = await RepairsAPI.get(id)
// //       const item = data?.item || data?.data || data
// //       const next = {
// //         code: item?.code || '',
// //         name: item?.name || '',
// //         description: item?.description || '',
// //         systemKey: item?.systemKey || '',
// //         subsystemKey: item?.subsystemKey || '',
// //         componentKey: item?.componentKey || '',
// //         failureModeKey: item?.failureModeKey || '',
// //         type: item?.type || 'CORRECTIVE',
// //         severityDefault: item?.severityDefault || 'MEDIUM',
// //         operationalImpact: item?.operationalImpact || 'LIMITED',
// //         standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
// //         tags: Array.isArray(item?.tags) ? item.tags : [],
// //         isActive: (typeof item?.isActive === 'boolean') ? item.isActive : (typeof item?.active === 'boolean') ? item.active : true,
// //       }
// //       setForm(next)
// //       setInitial(next)
// //     }catch(err){
// //       console.error(err)
// //       alert(err?.response?.data?.message || 'No fue posible cargar el registro')
// //     }finally{
// //       setLoading(false)
// //     }
// //   }

// //   useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

// //   const submit = async (e) => {
// //     e.preventDefault()
// //     if (viewMode) return
// //     if (id && !isDirty) return alert('No hay cambios por guardar')
// //     if (!form.code.trim()) return alert('Código es obligatorio')
// //     if (!form.name.trim()) return alert('Nombre es obligatorio')
// //     if (!form.systemKey) return alert('Sistema es obligatorio')

// //     const payload = {
// //       code: form.code.trim().toUpperCase(),
// //       name: form.name.trim(),
// //       description: form.description,
// //       systemKey: form.systemKey,
// //       subsystemKey: form.subsystemKey || '',
// //       componentKey: form.componentKey || '',
// //       failureModeKey: form.failureModeKey || '',
// //       type: form.type,
// //       severityDefault: form.severityDefault,
// //       operationalImpact: form.operationalImpact,
// //       standardLaborMinutes: Number(form.standardLaborMinutes || 0),
// //       tags: Array.isArray(form.tags) ? form.tags : [],
// //       isActive: form.isActive === true,
// //       active: form.isActive === true,
// //     }

// //     setSaving(true)
// //     try{
// //       if (id) {
// //         await RepairsAPI.update(id, payload)
// //         alert('Reparación actualizada')
// //       } else {
// //         await RepairsAPI.create(payload)
// //         alert('Reparación creada')
// //       }
// //       setInitial(payload)
// //       // Lineamiento FleetCore: al guardar, volver al listado
// //       nav('/config/catalogs/repairs')
// //     }catch(err){
// //       console.error(err)
// //       const msg = err?.response?.data?.message
// //       // Mensaje más claro para código duplicado (Mongo dup key)
// //       if (String(msg || '').toLowerCase().includes('duplicate') || err?.response?.status === 409 || err?.response?.status === 400) {
// //         alert(msg || 'El código ya existe. Usa un código distinto.')
// //       } else {
// //         alert(msg || 'No fue posible guardar')
// //       }
// //     }finally{
// //       setSaving(false)
// //     }
// //   }

// //   const tagHints = useMemo(() => {
// //     const t = repairTaxonomy?.repairTags || {}
// //     const all = [ ...(t.work||[]), ...(t.level||[]), ...(t.family||[]) ]
// //     return Array.from(new Set(all))
// //   }, [])

// //   return (
// //     <div className="p-6 space-y-6">
// //       <div>
// //         <h1 className="text-xl font-bold">{id ? 'Editar Reparación' : 'Nueva Reparación'}</h1>
// //         <p className="text-sm text-gray-600">Defina el estándar técnico (incluye tiempo estándar para KPI).</p>
// //       </div>
// //       {/* bg-white border rounded-2xl shadow-sm */}
// //       <form onSubmit={submit} className="bg-white border rounded-lg shadow-sm">
// //         {/* Header interno (cierra esquinas superiores) */}
// //         <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
// //           <div className="text-sm text-gray-500">{loading ? 'Cargando…' : viewMode ? 'Modo ver' : ''}</div>
// //           <div className="flex items-center gap-2">
// //             <button type="button" className="btn border rounded px-4 py-2" onClick={onBack}>
// //               {(!viewMode && isDirty) ? 'Cancelar' : 'Volver'}
// //             </button>
// //             {!viewMode && (
// //               <button type="submit" className="px-4 py-2 rounded bg-[var(--fc-primary)] hover:opacity-95 text-white" disabled={saving || loading}>
// //                 {saving ? 'Guardando…' : 'Guardar'}
// //               </button>
// //             )}
// //           </div>
// //         </div>

// //         <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
// //           <label className="text-sm md:col-span-2">
// //             <div className="text-gray-600 mb-1">Código *</div>
// //             <input className="border rounded px-3 py-2 w-full" value={form.code} disabled={viewMode||loading||saving}
// //               maxLength={25}
// //               onChange={(e)=>setForm(s=>({ ...s, code: e.target.value }))} placeholder="Ej: REP-FREN-001" />
// //           </label>

// //           <label className="text-sm md:col-span-2">
// //             <div className="text-gray-600 mb-1">Nombre *</div>
// //             <input className="border rounded px-3 py-2 w-full" value={form.name} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, name: e.target.value }))} placeholder="Ej: Cambio pastillas delanteras" />
// //           </label>

// //           <label className="text-sm md:col-span-4">
// //             <div className="text-gray-600 mb-1">Descripción</div>
// //             <textarea className="border rounded px-3 py-2 w-full min-h-24" value={form.description} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, description: e.target.value }))} />
// //           </label>

// //           <label className="text-sm">
// //             <div className="text-gray-600 mb-1">Sistema *</div>
// //             <select className="border rounded px-3 py-2 w-full" value={form.systemKey} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, systemKey: e.target.value }))}>
// //               <option value="">Seleccione…</option>
// //               {(vehicleTaxonomy?.systems || []).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
// //             </select>
// //             <div className="text-xs text-gray-500 mt-1">Recomendado usar el canon del sistema para BI.</div>
// //           </label>

// //           <label className="text-sm">
// //             <div className="text-gray-600 mb-1">Sub-sistema</div>
// //             <select className="border rounded px-3 py-2 w-full" value={form.subsystemKey} disabled={viewMode||loading || !form.systemKey}
// //               onChange={(e)=>setForm(s=>({ ...s, subsystemKey: e.target.value }))}>
// //               <option value="">{form.systemKey ? '(Sin sub-sistema)' : 'Seleccione sistema primero'}</option>
// //               {subsystemOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// //             </select>
// //             <div className="text-xs text-gray-500 mt-1">Depende del sistema seleccionado (evita combinaciones inválidas).</div>
// //           </label>

// //           <label className="text-sm">
// //             <div className="text-gray-600 mb-1">Componente</div>
// //             <select className="border rounded px-3 py-2 w-full" value={form.componentKey} disabled={viewMode||loading || !form.systemKey}
// //               onChange={(e)=>setForm(s=>({ ...s, componentKey: e.target.value }))}>
// //               <option value="">{form.systemKey ? '(Sin componente)' : 'Seleccione sistema primero'}</option>
// //               {componentOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// //             </select>
// //           </label>

// //           <label className="text-sm">
// //             <div className="text-gray-600 mb-1">Modo de falla</div>
// //             <select className="border rounded px-3 py-2 w-full" value={form.failureModeKey} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, failureModeKey: e.target.value }))}>
// //               <option value="">(Sin modo)</option>
// //               {failureModes.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
// //             </select>
// //             <div className="text-xs text-gray-500 mt-1">Clave para análisis de confiabilidad (RCM/FMEA).</div>
// //           </label>

// //           <label className="text-sm">
// //             <div className="text-gray-600 mb-1">Tipo</div>
// //             <select className="border rounded px-3 py-2 w-full" value={form.type} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, type: e.target.value }))}>
// //               {TYPE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// //             </select>
// //             <div className="text-xs text-gray-500 mt-1">Correctiva/Preventiva define KPI y planificación.</div>
// //           </label>

// //           <label className="text-sm">
// //             <div className="text-gray-600 mb-1">Severidad (default)</div>
// //             <select className="border rounded px-3 py-2 w-full" value={form.severityDefault} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, severityDefault: e.target.value }))}>
// //               {SEVERITY_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// //             </select>
// //           </label>

// //           <label className="text-sm">
// //             <div className="text-gray-600 mb-1">Impacto operacional</div>
// //             <select className="border rounded px-3 py-2 w-full" value={form.operationalImpact} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, operationalImpact: e.target.value }))}>
// //               {IMPACT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
// //             </select>
// //             <div className="text-xs text-gray-500 mt-1">Para SLA y criticidad (operable / limitado / fuera de servicio).</div>
// //           </label>

// //           <label className="text-sm">
// //             <div className="text-gray-600 mb-1">Tiempo estándar (min)</div>
// //             <input type="number" min="0" className="border rounded px-3 py-2 w-full" value={form.standardLaborMinutes}
// //               disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, standardLaborMinutes: Number(e.target.value || 0) }))}/>
// //             <div className="text-xs text-gray-500 mt-1">Base para KPI (real vs estándar) y planificación.</div>
// //           </label>

// //           <label className="text-sm md:col-span-2">
// //             <div className="text-gray-600 mb-1">Tags (1 por línea)</div>
// //             <textarea className="border rounded px-3 py-2 w-full min-h-24" value={toLines(form.tags)} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, tags: fromLines(e.target.value).map(t=>t.toUpperCase()) }))}/>
// //             <div className="text-xs text-gray-500 mt-2">
// //               Mejora la calidad del catálogo y estandariza el lenguaje.
// //             </div>

// //             <div className="mt-3">
// //               <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-gray-50 text-xs text-gray-700">
// //                 Sugeridos
// //               </span>
// //               <div className="flex flex-wrap gap-2 mt-2">
// //                 {tagHints.slice(0, 30).map((t) => {
// //                   const next = String(t).toUpperCase()
// //                   const selected = (form.tags || []).map(String).map(x=>x.toUpperCase()).includes(next)
// //                   return (
// //                     <button
// //                       type="button"
// //                       key={t}
// //                       className={
// //                         "px-3 py-1.5 rounded-full border text-xs " +
// //                         (selected
// //                           ? "bg-blue-50 border-blue-300 text-blue-700"
// //                           : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
// //                       }
// //                       onClick={() =>
// //                         setForm((s) => {
// //                           const cur = Array.isArray(s.tags) ? s.tags.map((x) => String(x).toUpperCase()) : []
// //                           const has = cur.includes(next)
// //                           return { ...s, tags: has ? cur.filter((x) => x !== next) : [...cur, next] }
// //                         })
// //                       }
// //                       disabled={viewMode || loading}
// //                       title={selected ? "Quitar" : "Agregar"}
// //                     >
// //                       {selected ? "✓ " : ""}{t}
// //                     </button>
// //                   )
// //                 })}
// //               </div>
// //             </div>
// //           </label>

// //           <label className="text-sm flex items-center gap-2 md:col-span-2 mt-6 select-none">
// //             <input type="checkbox" checked={form.isActive === true} disabled={viewMode||loading||saving}
// //               onChange={(e)=>setForm(s=>({ ...s, isActive: e.target.checked }))}/>
// //             <span>Activo</span>
// //           </label>

// //           {/* Media: se gestiona vía repairsMedia.controller (backend). UI se implementa cuando el módulo de documentos esté consolidado */}
// //           <div className="md:col-span-4 border rounded-xl p-3 bg-gray-50">
// //             <div className="text-sm font-medium">Activos (media)</div>
// //             <div className="text-xs text-gray-600 mt-1">
// //               Disponible al guardar el registro. Se administra vía <span className="font-mono">repairsMedia.controller</span>.
// //             </div>
// //             <div className="mt-2 text-sm text-gray-700">
// //               <div><span className="font-medium">Foto:</span> —</div>
// //               <div className="mt-1"><span className="font-medium">Documentos:</span> —</div>
// //             </div>
// //           </div>

// //         </div>
// //       </form>
// //     </div>
// //   )
// // }


// // front/src/pages/Repairs/Form.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Reparaciones (Taller / Técnico)
// // - Estándar técnico para OT: define severidad/impacto/tiempo estándar KPI
// // - Modo Ver: ?mode=view
// // - Guardia de cambios sin guardar: hooks/UnsavedChangesGuard
// // - system/subsystem/component/failureMode controlados por JSON (repairTaxonomy.json)
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
// import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// import { RepairsAPI } from '../../api/repairs.api'
// import vehicleTaxonomy from '../../data/fleetcore/vehicle-taxonomy.json'
// import repairTaxonomy from '../../data/fleetcore/repair-taxonomy.json'

// const emptyForm = {
//   code: '',
//   name: '',
//   description: '',
//   systemKey: '',
//   subsystemKey: '',
//   componentKey: '',
//   failureModeKey: '',
//   type: 'CORRECTIVE',
//   severityDefault: 'MEDIUM',
//   operationalImpact: 'LIMITED',
//   standardLaborMinutes: 0,
//   tags: [],
//   isActive: true,
// }

// function toLines(arr){
//   return Array.isArray(arr) ? arr.filter(Boolean).join('\n') : ''
// }
// function fromLines(text){
//   return String(text || '')
//     .split('\n')
//     .map(s => s.trim())
//     .filter(Boolean)
// }

// const TYPE_OPTIONS = [
//   { v: 'CORRECTIVE', l: 'Correctiva' },
//   { v: 'PREVENTIVE', l: 'Preventiva' },
//   { v: 'INSPECTION', l: 'Inspección' },
//   { v: 'UPGRADE', l: 'Mejora/Upgrade' },
// ]
// const SEVERITY_OPTIONS = [
//   { v: 'LOW', l: 'Baja' },
//   { v: 'MEDIUM', l: 'Media' },
//   { v: 'HIGH', l: 'Alta' },
//   { v: 'CRITICAL', l: 'Crítica' },
// ]
// const IMPACT_OPTIONS = [
//   { v: 'NO_STOP', l: 'Opera normal (No stop)' },
//   { v: 'LIMITED', l: 'Opera con restricción (Limited)' },
//   { v: 'OUT_OF_SERVICE', l: 'Fuera de servicio (Out of service)' },
// ]

// export default function RepairsForm(){
//   const nav = useNavigate()
//   const { id } = useParams()
//   const [sp] = useSearchParams()
//   const viewMode = sp.get('mode') === 'view'

//   const [loading, setLoading] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [form, setForm] = useState(emptyForm)
//   const [initial, setInitial] = useState(emptyForm)

//   // labels para systemKey (coherente con otros módulos)
//   const systemLabels = useMemo(() => {
//     const m = new Map()
//     ;(vehicleTaxonomy?.systems || []).forEach(s => m.set(s.key, s.label))
//     return m
//   }, [])

//   const repairSystems = useMemo(() => (repairTaxonomy?.systems || []), [])

//   const selectedSystemNode = useMemo(() => {
//     return repairSystems.find(s => s.key === form.systemKey) || null
//   }, [repairSystems, form.systemKey])

//   const subsystemOptions = useMemo(() => selectedSystemNode?.subsystems || [], [selectedSystemNode])
//   const componentOptions = useMemo(() => selectedSystemNode?.components || [], [selectedSystemNode])
//   const failureModes = useMemo(() => repairTaxonomy?.failureModes || [], [])

//   const isDirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(form), [initial, form])

//   UnsavedChangesGuard({
//     when: isDirty && !viewMode,
//     message: 'Hay cambios sin guardar. ¿Deseas salir sin guardar?',
//   })

//   const onBack = () => {
//     if (!viewMode && isDirty) {
//       const ok = window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')
//       if (!ok) return
//     }
//     nav('/config/catalogs/repairs')
//   }

//   // si cambia systemKey, resetea dependientes si quedan inválidos
//   useEffect(() => {
//     if (!form.systemKey) {
//       if (form.subsystemKey || form.componentKey) {
//         setForm(s => ({ ...s, subsystemKey:'', componentKey:'' }))
//       }
//       return
//     }
//     const validSub = (subsystemOptions || []).some(x => x.key === form.subsystemKey)
//     const validComp = (componentOptions || []).some(x => x.key === form.componentKey)
//     if (!validSub && form.subsystemKey) setForm(s => ({ ...s, subsystemKey: '' }))
//     if (!validComp && form.componentKey) setForm(s => ({ ...s, componentKey: '' }))
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [form.systemKey, subsystemOptions, componentOptions])

//   const load = async () => {
//     if (!id) {
//       setForm(emptyForm)
//       setInitial(emptyForm)
//       return
//     }
//     setLoading(true)
//     try{
//       const { data } = await RepairsAPI.get(id)
//       const item = data?.item || data?.data || data
//       const next = {
//         code: item?.code || '',
//         name: item?.name || '',
//         description: item?.description || '',
//         systemKey: item?.systemKey || '',
//         subsystemKey: item?.subsystemKey || '',
//         componentKey: item?.componentKey || '',
//         failureModeKey: item?.failureModeKey || '',
//         type: item?.type || 'CORRECTIVE',
//         severityDefault: item?.severityDefault || 'MEDIUM',
//         operationalImpact: item?.operationalImpact || 'LIMITED',
//         standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
//         tags: Array.isArray(item?.tags) ? item.tags : [],
//         isActive: (typeof item?.isActive === 'boolean') ? item.isActive : (typeof item?.active === 'boolean') ? item.active : true,
//       }
//       setForm(next)
//       setInitial(next)
//     }catch(err){
//       console.error(err)
//       alert(err?.response?.data?.message || 'No fue posible cargar el registro')
//     }finally{
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

//   const submit = async (e) => {
//     e.preventDefault()
//     if (viewMode) return
//     if (id && !isDirty) return alert('No hay cambios por guardar')
//     if (!form.code.trim()) return alert('Código es obligatorio')
//     if (!form.name.trim()) return alert('Nombre es obligatorio')
//     if (!form.systemKey) return alert('Sistema es obligatorio')

//     const payload = {
//       code: form.code.trim().toUpperCase(),
//       name: form.name.trim(),
//       description: form.description,
//       systemKey: form.systemKey,
//       subsystemKey: form.subsystemKey || '',
//       componentKey: form.componentKey || '',
//       failureModeKey: form.failureModeKey || '',
//       type: form.type,
//       severityDefault: form.severityDefault,
//       operationalImpact: form.operationalImpact,
//       standardLaborMinutes: Number(form.standardLaborMinutes || 0),
//       tags: Array.isArray(form.tags) ? form.tags : [],
//       isActive: form.isActive === true,
//       active: form.isActive === true,
//     }

//     setSaving(true)
//     try{
//       if (id) {
//         await RepairsAPI.update(id, payload)
//         alert('Reparación actualizada')
//       } else {
//         await RepairsAPI.create(payload)
//         alert('Reparación creada')
//       }
//       setInitial(payload)
//       // Lineamiento FleetCore: al guardar, volver al listado
//       nav('/config/catalogs/repairs')
//     }catch(err){
//       console.error(err)
//       const msg = err?.response?.data?.message
//       // Mensaje más claro para código duplicado (Mongo dup key)
//       if (String(msg || '').toLowerCase().includes('duplicate') || err?.response?.status === 409 || err?.response?.status === 400) {
//         alert(msg || 'El código ya existe. Usa un código distinto.')
//       } else {
//         alert(msg || 'No fue posible guardar')
//       }
//     }finally{
//       setSaving(false)
//     }
//   }

//   const tagHints = useMemo(() => {
//     const t = repairTaxonomy?.repairTags || {}
//     const all = [ ...(t.work||[]), ...(t.level||[]), ...(t.family||[]) ]
//     return Array.from(new Set(all))
//   }, [])

//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h1 className="text-xl font-bold">{id ? 'Editar Reparación' : 'Nueva Reparación'}</h1>
//         <p className="text-sm text-gray-600">Defina el estándar técnico (incluye tiempo estándar para KPI).</p>
//       </div>

//       <form onSubmit={submit} className="bg-white border rounded-2xl shadow-sm">
//         {/* Header interno (cierra esquinas superiores) */}
//         <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
//           <div className="text-sm text-gray-500">{loading ? 'Cargando…' : viewMode ? 'Modo ver' : ''}</div>
//           <div className="flex items-center gap-2">
//             <button type="button" className="btn border rounded px-4 py-2" onClick={onBack}>
//               {(!viewMode && isDirty) ? 'Cancelar' : 'Volver'}
//             </button>
//             {!viewMode && (
//               <button type="submit" className="px-4 py-2 rounded bg-[var(--fc-primary)] hover:opacity-95 text-white" disabled={saving || loading}>
//                 {saving ? 'Guardando…' : 'Guardar'}
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
//           <label className="text-sm md:col-span-2">
//             <div className="text-gray-600 mb-1">Código *</div>
//             <input className="border rounded px-3 py-2 w-full" value={form.code} disabled={viewMode||loading||saving}
//               maxLength={25}
//               onChange={(e)=>setForm(s=>({ ...s, code: e.target.value }))} placeholder="Ej: REP-FREN-001" />
//           </label>

//           <label className="text-sm md:col-span-2">
//             <div className="text-gray-600 mb-1">Nombre *</div>
//             <input className="border rounded px-3 py-2 w-full" value={form.name} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, name: e.target.value }))} placeholder="Ej: Cambio pastillas delanteras" />
//           </label>

//           <label className="text-sm md:col-span-4">
//             <div className="text-gray-600 mb-1">Descripción</div>
//             <textarea className="border rounded px-3 py-2 w-full min-h-24" value={form.description} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, description: e.target.value }))} />
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Sistema *</div>
//             <select className="border rounded px-3 py-2 w-full" value={form.systemKey} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, systemKey: e.target.value }))}>
//               <option value="">Seleccione…</option>
//               {(vehicleTaxonomy?.systems || []).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
//             </select>
//             <div className="text-xs text-gray-500 mt-1">Recomendado usar el canon del sistema para BI.</div>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Sub-sistema</div>
//             <select className="border rounded px-3 py-2 w-full" value={form.subsystemKey} disabled={viewMode||loading || !form.systemKey}
//               onChange={(e)=>setForm(s=>({ ...s, subsystemKey: e.target.value }))}>
//               <option value="">{form.systemKey ? '(Sin sub-sistema)' : 'Seleccione sistema primero'}</option>
//               {subsystemOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
//             </select>
//             <div className="text-xs text-gray-500 mt-1">Depende del sistema seleccionado (evita combinaciones inválidas).</div>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Componente</div>
//             <select className="border rounded px-3 py-2 w-full" value={form.componentKey} disabled={viewMode||loading || !form.systemKey}
//               onChange={(e)=>setForm(s=>({ ...s, componentKey: e.target.value }))}>
//               <option value="">{form.systemKey ? '(Sin componente)' : 'Seleccione sistema primero'}</option>
//               {componentOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Modo de falla</div>
//             <select className="border rounded px-3 py-2 w-full" value={form.failureModeKey} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, failureModeKey: e.target.value }))}>
//               <option value="">(Sin modo)</option>
//               {failureModes.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
//             </select>
//             <div className="text-xs text-gray-500 mt-1">Clave para análisis de confiabilidad (RCM/FMEA).</div>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Tipo</div>
//             <select className="border rounded px-3 py-2 w-full" value={form.type} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, type: e.target.value }))}>
//               {TYPE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
//             </select>
//             <div className="text-xs text-gray-500 mt-1">Correctiva/Preventiva define KPI y planificación.</div>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Severidad (default)</div>
//             <select className="border rounded px-3 py-2 w-full" value={form.severityDefault} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, severityDefault: e.target.value }))}>
//               {SEVERITY_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Impacto operacional</div>
//             <select className="border rounded px-3 py-2 w-full" value={form.operationalImpact} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, operationalImpact: e.target.value }))}>
//               {IMPACT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
//             </select>
//             <div className="text-xs text-gray-500 mt-1">Para SLA y criticidad (operable / limitado / fuera de servicio).</div>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Tiempo estándar (min)</div>
//             <input type="number" min="0" className="border rounded px-3 py-2 w-full" value={form.standardLaborMinutes}
//               disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, standardLaborMinutes: Number(e.target.value || 0) }))}/>
//             <div className="text-xs text-gray-500 mt-1">Base para KPI (real vs estándar) y planificación.</div>
//           </label>

//           <label className="text-sm md:col-span-2">
//             <div className="text-gray-600 mb-1">Tags (1 por línea)</div>
//             <textarea className="border rounded px-3 py-2 w-full min-h-24" value={toLines(form.tags)} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, tags: fromLines(e.target.value).map(t=>t.toUpperCase()) }))}/>
//             <div className="text-xs text-gray-500 mt-2">
//               Mejora la calidad del catálogo y estandariza el lenguaje.
//             </div>

//             <div className="mt-3">
//               <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-gray-50 text-xs text-gray-700">
//                 Sugeridos
//               </span>
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {tagHints.slice(0, 30).map((t) => {
//                   const next = String(t).toUpperCase()
//                   const selected = (form.tags || []).map(String).map(x=>x.toUpperCase()).includes(next)
//                   return (
//                     <button
//                       type="button"
//                       key={t}
//                       className={
//                         "px-3 py-1.5 rounded-full border text-xs " +
//                         (selected
//                           ? "bg-blue-50 border-blue-300 text-blue-700"
//                           : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
//                       }
//                       onClick={() =>
//                         setForm((s) => {
//                           const cur = Array.isArray(s.tags) ? s.tags.map((x) => String(x).toUpperCase()) : []
//                           const has = cur.includes(next)
//                           return { ...s, tags: has ? cur.filter((x) => x !== next) : [...cur, next] }
//                         })
//                       }
//                       disabled={viewMode || loading}
//                       title={selected ? "Quitar" : "Agregar"}
//                     >
//                       {selected ? "✓ " : ""}{t}
//                     </button>
//                   )
//                 })}
//               </div>
//             </div>
//           </label>

//           <label className="text-sm flex items-center gap-2 md:col-span-2 mt-6 select-none">
//             <input type="checkbox" checked={form.isActive === true} disabled={viewMode||loading||saving}
//               onChange={(e)=>setForm(s=>({ ...s, isActive: e.target.checked }))}/>
//             <span>Activo</span>
//           </label>

//           {/* Media: se gestiona vía repairsMedia.controller (backend). UI se implementa cuando el módulo de documentos esté consolidado */}
//           <div className="md:col-span-4 border rounded-xl p-3 bg-gray-50">
//             <div className="text-sm font-medium">Activos (media)</div>
//             <div className="text-xs text-gray-600 mt-1">
//               Disponible al guardar el registro. Se administra vía <span className="font-mono">repairsMedia.controller</span>.
//             </div>
//             <div className="mt-2 text-sm text-gray-700">
//               <div><span className="font-medium">Foto:</span> —</div>
//               <div className="mt-1"><span className="font-medium">Documentos:</span> —</div>
//             </div>
//           </div>

//         </div>
//       </form>
//     </div>
//   )
// }

// //v2 290126
// // front/src/pages/Repairs/Form.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Reparaciones (Taller / Técnico)
// // - Estándar técnico para OT: define severidad/impacto/tiempo estándar KPI
// // - Modo Ver: ?mode=view
// // - Guardia de cambios sin guardar: hooks/UnsavedChangesGuard
// // - system/subsystem/component/failureMode controlados por JSON (repairTaxonomy.json)
// // -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
import { RepairsAPI } from '../../api/repairs.api'
import vehicleTaxonomy from '../../data/fleetcore/vehicle-taxonomy.json'
import repairTaxonomy from '../../data/fleetcore/repair-taxonomy.json'

const emptyForm = {
  code: '',
  name: '',
  description: '',
  systemKey: '',
  subsystemKey: '',
  componentKey: '',
  failureModeKey: '',
  type: 'CORRECTIVE',
  severityDefault: 'MEDIUM',
  operationalImpact: 'LIMITED',
  standardLaborMinutes: 0,
  tags: [],
  isActive: true,
}

function toLines(arr){
  return Array.isArray(arr) ? arr.filter(Boolean).join('\n') : ''
}
function fromLines(text){
  return String(text || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

const TYPE_OPTIONS = [
  { v: 'CORRECTIVE', l: 'Correctiva' },
  { v: 'PREVENTIVE', l: 'Preventiva' },
  { v: 'INSPECTION', l: 'Inspección' },
  { v: 'UPGRADE', l: 'Mejora/Upgrade' },
]
const SEVERITY_OPTIONS = [
  { v: 'LOW', l: 'Baja' },
  { v: 'MEDIUM', l: 'Media' },
  { v: 'HIGH', l: 'Alta' },
  { v: 'CRITICAL', l: 'Crítica' },
]
const IMPACT_OPTIONS = [
  { v: 'NO_STOP', l: 'Opera normal (No stop)' },
  { v: 'LIMITED', l: 'Opera con restricción (Limited)' },
  { v: 'OUT_OF_SERVICE', l: 'Fuera de servicio (Out of service)' },
]

export default function RepairsForm(){
  const nav = useNavigate()
  const { id } = useParams()
  const [sp] = useSearchParams()
  const viewMode = sp.get('mode') === 'view'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [initial, setInitial] = useState(emptyForm)

  // Validación temprana de duplicados (crear y también edición si cambia el código)
  const [codeCheck, setCodeCheck] = useState({ checking: false, duplicate: false })

  const repairSystems = useMemo(() => (repairTaxonomy?.systems || []), [])
  const failureModes = useMemo(() => (repairTaxonomy?.failureModes || []), [])

  // (Opcional) Permitir alimentar tipo/severidad/impacto desde JSON.
  // Si el JSON no define options, usamos los defaults del front (const TYPE_OPTIONS, etc).
  const typeOptions = useMemo(() => {
    const opt = repairTaxonomy?.options?.types
    if (Array.isArray(opt) && opt.length) {
      return opt.map(v => ({ v: String(v), l: String(v) }))
    }
    return TYPE_OPTIONS
  }, [])
  const severityOptions = useMemo(() => {
    const opt = repairTaxonomy?.options?.severities
    if (Array.isArray(opt) && opt.length) {
      return opt.map(v => ({ v: String(v), l: String(v) }))
    }
    return SEVERITY_OPTIONS
  }, [])
  const impactOptions = useMemo(() => {
    const opt = repairTaxonomy?.options?.operationalImpacts
    if (Array.isArray(opt) && opt.length) {
      return opt.map(v => ({ v: String(v), l: String(v) }))
    }
    return IMPACT_OPTIONS
  }, [])

  const selectedSystemNode = useMemo(() => {
    return repairSystems.find(s => s.key === form.systemKey) || null
  }, [repairSystems, form.systemKey])

  const subsystemOptions = useMemo(() => selectedSystemNode?.subsystems || [], [selectedSystemNode])
  const componentOptions = useMemo(() => selectedSystemNode?.components || [], [selectedSystemNode])

  const isDirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(form), [initial, form])

  UnsavedChangesGuard({
    when: isDirty && !viewMode,
    message: 'Hay cambios sin guardar. ¿Deseas salir sin guardar?',
  })

  const onBack = () => {
    if (!viewMode && isDirty) {
      const ok = window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')
      if (!ok) return
    }
    nav('/config/catalogs/repairs')
  }

  const onEdit = () => {
    if (!id) return
    nav(`/config/catalogs/repairs/${id}`)
  }

  // Si cambia systemKey, resetea dependientes si quedan inválidos
  useEffect(() => {
    if (!form.systemKey) {
      if (form.subsystemKey || form.componentKey) {
        setForm(s => ({ ...s, subsystemKey:'', componentKey:'' }))
      }
      return
    }
    const validSub = (subsystemOptions || []).some(x => x.key === form.subsystemKey)
    const validComp = (componentOptions || []).some(x => x.key === form.componentKey)
    if (!validSub && form.subsystemKey) setForm(s => ({ ...s, subsystemKey: '' }))
    if (!validComp && form.componentKey) setForm(s => ({ ...s, componentKey: '' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.systemKey, subsystemOptions, componentOptions])

  const load = async () => {
    if (!id) {
      setForm(emptyForm)
      setInitial(emptyForm)
      setCodeCheck({ checking: false, duplicate: false })
      return
    }
    setLoading(true)
    try{
      const { data } = await RepairsAPI.get(id)
      const item = data?.item || data?.data || data
      const next = {
        code: item?.code || '',
        name: item?.name || '',
        description: item?.description || '',
        systemKey: item?.systemKey || '',
        subsystemKey: item?.subsystemKey || '',
        componentKey: item?.componentKey || '',
        failureModeKey: item?.failureModeKey || '',
        type: item?.type || 'CORRECTIVE',
        severityDefault: item?.severityDefault || 'MEDIUM',
        operationalImpact: item?.operationalImpact || 'LIMITED',
        standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
        tags: Array.isArray(item?.tags) ? item.tags : [],
        isActive: (typeof item?.isActive === 'boolean') ? item.isActive : (typeof item?.active === 'boolean') ? item.active : true,
      }
      setForm(next)
      setInitial(next)
      setCodeCheck({ checking: false, duplicate: false })
    }catch(err){
      console.error(err)
      alert(err?.response?.data?.message || 'No fue posible cargar el registro')
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkDuplicateCode = async () => {
    if (viewMode) return
    const codeNorm = String(form.code || '').trim().toUpperCase()
    const initialNorm = String(initial.code || '').trim().toUpperCase()

    // En edición: solo validar si cambió el código
    const shouldCheck = Boolean(codeNorm) && (!id || (id && codeNorm !== initialNorm))
    if (!shouldCheck) {
      setCodeCheck({ checking: false, duplicate: false })
      return
    }

    setCodeCheck(s => ({ ...s, checking: true }))
    try{
      const { data } = await RepairsAPI.list({ page: 1, limit: 10, q: codeNorm, active: '' })
      const items = data?.items || []
      const dup = items.some((it) => {
        const itCode = String(it?.code || '').trim().toUpperCase()
        const sameCode = itCode === codeNorm
        const sameId = id && String(it?._id) === String(id)
        return sameCode && !sameId
      })
      setCodeCheck({ checking: false, duplicate: dup })
    }catch{
      // si falla la consulta, no bloqueamos; evitamos falsos positivos
      setCodeCheck({ checking: false, duplicate: false })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (viewMode) return

    const codeNorm = String(form.code || '').trim().toUpperCase()
    if (!codeNorm) return alert('Código es obligatorio')
    if (!String(form.name || '').trim()) return alert('Nombre es obligatorio')
    if (!form.systemKey) return alert('Sistema es obligatorio')

    // Si hay duplicado detectado, no guardar (sin alert final; se muestra inline bajo el campo)
    if (codeCheck.duplicate) return

    if (id && !isDirty) return alert('No hay cambios por guardar')

    const payload = {
      code: codeNorm,
      name: String(form.name || '').trim(),
      description: form.description,
      systemKey: form.systemKey,
      subsystemKey: form.subsystemKey || '',
      componentKey: form.componentKey || '',
      failureModeKey: form.failureModeKey || '',
      type: form.type,
      severityDefault: form.severityDefault,
      operationalImpact: form.operationalImpact,
      standardLaborMinutes: Number(form.standardLaborMinutes || 0),
      tags: Array.isArray(form.tags) ? form.tags : [],
      isActive: form.isActive === true,
      active: form.isActive === true,
    }

    setSaving(true)
    try{
      if (id) {
        await RepairsAPI.update(id, payload)
        alert('Reparación actualizada')
      } else {
        await RepairsAPI.create(payload)
        alert('Reparación creada')
      }
      setInitial(payload)
      nav('/config/catalogs/repairs')
    }catch(err){
      console.error(err)
      const msg = err?.response?.data?.message
      // Si backend informa duplicado, reflejarlo en UI (sin alert de "al final")
      if (String(msg || '').toLowerCase().includes('duplicate') || err?.response?.status === 409) {
        setCodeCheck({ checking: false, duplicate: true })
        return
      }
      alert(msg || 'No fue posible guardar')
    }finally{
      setSaving(false)
    }
  }

  const tagHints = useMemo(() => {
    const t = repairTaxonomy?.repairTags || {}
    const all = [ ...(t.work||[]), ...(t.level||[]), ...(t.family||[]) ]
    return Array.from(new Set(all))
  }, [])

  const codeHasError = !viewMode && !loading && Boolean(String(form.code || '').trim()) && codeCheck.duplicate

  const onTagsKeyDown = (e) => {
    // Ctrl + Shift + Enter => inserta salto de línea dentro del textarea (sin perder el foco)
    if (e.key === 'Enter' && e.ctrlKey && e.shiftKey) {
      e.preventDefault()
      const el = e.target
      const value = String(el.value || '')
      const start = el.selectionStart ?? value.length
      const end = el.selectionEnd ?? value.length
      const nextValue = value.slice(0, start) + '\n' + value.slice(end)
      // actualiza tags a partir del texto resultante
      setForm(s => ({ ...s, tags: fromLines(nextValue).map(t => t.toUpperCase()) }))
      // reubicar caret
      requestAnimationFrame(() => {
        try{
          el.selectionStart = el.selectionEnd = start + 1
        }catch{}
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">
          {id ? (viewMode ? 'Ver Reparación' : 'Editar Reparación') : 'Nueva Reparación'}
        </h1>
        <p className="text-sm text-gray-600">
          Estándar técnico para OT: severidad/impacto/tiempo estándar (KPI).
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {/* Header interno (cierra esquinas superiores) */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
          <div className="text-sm text-gray-500">
            {loading ? 'Cargando…' : viewMode ? 'Modo ver' : ''}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm md:col-span-2">
            <div className="text-gray-600 mb-1">Código *</div>
            <input
              className={"border rounded px-3 py-2 w-full " + (codeHasError ? "border-red-500 ring-1 ring-red-200" : "")}
              value={form.code}
              disabled={viewMode || loading || saving}
              maxLength={25}
              onChange={(e)=> {
                setForm(s=>({ ...s, code: e.target.value }))
                if (codeCheck.duplicate) setCodeCheck(s => ({ ...s, duplicate: false }))
              }}
              onBlur={checkDuplicateCode}
              placeholder="Ej: REP-FREN-001"
            />
            {codeHasError && (
              <div className="text-xs text-red-600 mt-1">Este código ya existe</div>
            )}
          </label>

          <label className="text-sm md:col-span-2">
            <div className="text-gray-600 mb-1">Nombre *</div>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.name}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, name: e.target.value }))}
              placeholder="Ej: Cambio pastillas delanteras"
            />
          </label>

          <label className="text-sm md:col-span-4">
            <div className="text-gray-600 mb-1">Descripción</div>
            <textarea
              className="border rounded px-3 py-2 w-full min-h-24"
              value={form.description}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, description: e.target.value }))}
            />
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Sistema *</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.systemKey}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, systemKey: e.target.value }))}
            >
              <option value="">Seleccione…</option>
              {(vehicleTaxonomy?.systems || []).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <div className="text-xs text-gray-500 mt-1">Recomendado usar el canon del sistema para BI.</div>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Sub-sistema</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.subsystemKey}
              disabled={viewMode || loading || !form.systemKey}
              onChange={(e)=>setForm(s=>({ ...s, subsystemKey: e.target.value }))}
            >
              <option value="">{form.systemKey ? '(Sin sub-sistema)' : 'Seleccione sistema primero'}</option>
              {subsystemOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
            <div className="text-xs text-gray-500 mt-1">Depende del sistema seleccionado (evita combinaciones inválidas).</div>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Componente</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.componentKey}
              disabled={viewMode || loading || !form.systemKey}
              onChange={(e)=>setForm(s=>({ ...s, componentKey: e.target.value }))}
            >
              <option value="">{form.systemKey ? '(Sin componente)' : 'Seleccione sistema primero'}</option>
              {componentOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Modo de falla</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.failureModeKey}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, failureModeKey: e.target.value }))}
            >
              <option value="">(Sin modo)</option>
              {failureModes.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
            <div className="text-xs text-gray-500 mt-1">Clave para análisis de confiabilidad (RCM/FMEA).</div>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Tipo</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.type}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, type: e.target.value }))}
            >
              {typeOptions.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Severidad (default)</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.severityDefault}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, severityDefault: e.target.value }))}
            >
              {severityOptions.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Impacto operacional</div>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.operationalImpact}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, operationalImpact: e.target.value }))}
            >
              {impactOptions.map(o => <option key={o.v} value={o.v}>{o.v}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Tiempo estándar (min)</div>
            <input
              type="number"
              min="0"
              className="border rounded px-3 py-2 w-full"
              value={form.standardLaborMinutes}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, standardLaborMinutes: Number(e.target.value || 0) }))}
            />
          </label>

          <label className="text-sm md:col-span-2">
            <div className="text-gray-600 mb-1">Tags (1 por línea)</div>
            <textarea
              className="border rounded px-3 py-2 w-full min-h-24"
              value={toLines(form.tags)}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, tags: fromLines(e.target.value).map(t=>t.toUpperCase()) }))}
              onKeyDown={onTagsKeyDown}
              placeholder="Ej:\nMANTENCION\nFRENOS\nSEGURIDAD"
            />
            <div className="text-xs text-gray-500 mt-2">
              Tip: Ctrl + Shift + Enter para insertar una línea nueva sin salir del flujo.
            </div>

            <div className="mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-gray-50 text-xs text-gray-700">
                Sugeridos
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {tagHints.slice(0, 30).map((t) => {
                  const next = String(t).toUpperCase()
                  const selected = (form.tags || []).map(String).map(x=>x.toUpperCase()).includes(next)
                  return (
                    <button
                      type="button"
                      key={t}
                      className={
                        "px-3 py-1.5 rounded-full border text-xs " +
                        (selected
                          ? "bg-[color:var(--fc-primary)]/10 border-[color:var(--fc-primary)]/40 text-[color:var(--fc-primary)]"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
                      }
                      onClick={() =>
                        setForm((s) => {
                          const cur = Array.isArray(s.tags) ? s.tags.map((x) => String(x).toUpperCase()) : []
                          const has = cur.includes(next)
                          return { ...s, tags: has ? cur.filter((x) => x !== next) : [...cur, next] }
                        })
                      }
                      disabled={viewMode || loading}
                      title={selected ? "Quitar" : "Agregar"}
                    >
                      {selected ? "✓ " : ""}
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
          </label>

          <label className="text-sm flex items-center gap-2 md:col-span-2 mt-1 select-none">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.isActive === true}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, isActive: e.target.checked }))}
            />
            <span>Activo</span>
          </label>
        </div>

        {/* Footer acciones (al fondo) */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
          <button type="button" className="btn border rounded px-4 py-2" onClick={onBack} disabled={saving || loading}>
            {(!viewMode && isDirty) ? 'Cancelar' : 'Volver'}
          </button>

          {id && viewMode && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-[var(--fc-primary)] hover:opacity-95 text-white"
              onClick={onEdit}
            >
              Editar
            </button>
          )}

          {!viewMode && (
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[var(--fc-primary)] hover:opacity-95 text-white disabled:opacity-50"
              disabled={saving || loading || (id ? !isDirty : false) || codeCheck.duplicate}
              title={codeCheck.duplicate ? 'Este código ya existe' : (id && !isDirty) ? 'No hay cambios por guardar' : ''}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
