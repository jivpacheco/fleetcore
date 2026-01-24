// front/src/pages/Repairs/Form.jsx
// -----------------------------------------------------------------------------
// Catálogo Reparaciones (Taller)
// - Modo Ver: ?mode=view
// - Guardia cambios sin guardar: hooks/UnsavedChangesGuard
// - Media: photo + documents[]
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
import { RepairsAPI } from '../../api/repairs.api'

const REPAIR_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'ADJUSTMENT']
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const IMPACTS = ['NO_STOP', 'LIMITED', 'OUT_OF_SERVICE']

const emptyForm = {
    code: '',
    name: '',
    description: '',
    systemKey: '',
    subsystemKey: '',
    componentKey: '',
    failureModeKey: '',
    repairType: 'CORRECTIVE',
    severityDefault: 'MEDIUM',
    operationalImpactDefault: 'LIMITED',
    standardLaborMinutes: 0,
    tagsText: '',
    active: true,
}

function toTagsText(tags) {
    return Array.isArray(tags) ? tags.join('\n') : ''
}

function parseTags(text) {
    return Array.from(
        new Set(
            String(text || '')
                .split(/\r?\n|,/)
                .map((s) => s.trim())
                .filter(Boolean)
        )
    )
}

export default function RepairsForm() {
    const { id } = useParams()
    const isNew = id === 'new' || !id
    const navigate = useNavigate()
    const [sp] = useSearchParams()
    const viewMode = sp.get('mode') === 'view'

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [doc, setDoc] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [initial, setInitial] = useState(null)

    const dirty = useMemo(() => {
        if (!initial) return false
        return JSON.stringify(form) !== JSON.stringify(initial)
    }, [form, initial])

    useEffect(() => {
        if (isNew) {
            setDoc(null)
            setForm(emptyForm)
            setInitial(emptyForm)
            return
        }

        setLoading(true)
        setError('')
        RepairsAPI.get(id)
            .then(({ data }) => {
                const item = data?.item
                setDoc(item)
                const mapped = {
                    code: item?.code || '',
                    name: item?.name || '',
                    description: item?.description || '',
                    systemKey: item?.systemKey || '',
                    subsystemKey: item?.subsystemKey || '',
                    componentKey: item?.componentKey || '',
                    failureModeKey: item?.failureModeKey || '',
                    repairType: item?.repairType || 'CORRECTIVE',
                    severityDefault: item?.severityDefault || 'MEDIUM',
                    operationalImpactDefault: item?.operationalImpactDefault || 'LIMITED',
                    standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
                    tagsText: toTagsText(item?.tags),
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
            subsystemKey: form.subsystemKey,
            componentKey: form.componentKey,
            failureModeKey: form.failureModeKey,
            repairType: form.repairType,
            severityDefault: form.severityDefault,
            operationalImpactDefault: form.operationalImpactDefault,
            standardLaborMinutes: Number(form.standardLaborMinutes || 0),
            tags: parseTags(form.tagsText),
            active: Boolean(form.active),
        }

        try {
            if (isNew) {
                const { data } = await RepairsAPI.create(payload)
                navigate(`/config/catalogs/repairs/${data?.item?._id}`)
            } else {
                await RepairsAPI.update(id, payload)
                setInitial(form)
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'No se pudo guardar')
        } finally {
            setSaving(false)
        }
    }

    // -------- Media (solo para edición) --------
    const onUploadPhoto = async (file) => {
        if (!file || isNew || viewMode) return
        try {
            const { data } = await RepairsAPI.uploadPhoto(id, file)
            setDoc((s) => ({ ...s, photo: data?.item }))
        } catch (e) {
            setError('No se pudo subir la foto')
        }
    }

    const onUploadDoc = async (file) => {
        if (!file || isNew || viewMode) return
        try {
            const { data } = await RepairsAPI.uploadDocument(id, file, file.name)
            setDoc((s) => ({ ...s, documents: [...(s?.documents || []), data?.item] }))
        } catch (e) {
            setError('No se pudo subir el documento')
        }
    }

    const onDeleteDoc = async (docId) => {
        if (!docId || isNew || viewMode) return
        try {
            await RepairsAPI.deleteDocument(id, docId)
            setDoc((s) => ({ ...s, documents: (s?.documents || []).filter((d) => d?._id !== docId) }))
        } catch (e) {
            setError('No se pudo eliminar el documento')
        }
    }

    return (
        <div className="max-w-5xl">
            <UnsavedChangesGuard when={dirty && !viewMode} />

            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-xl font-bold">
                        {isNew ? 'Nueva Reparación' : viewMode ? 'Ver Reparación' : 'Editar Reparación'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {viewMode
                            ? 'Vista de solo lectura. Use "Editar" para modificar.'
                            : 'Defina el estándar técnico (incluye tiempo estándar para KPI).'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link className="px-3 py-2 rounded border bg-white" to="/config/catalogs/repairs">
                        Volver
                    </Link>

                    {!isNew && viewMode && (
                        <button
                            className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white"
                            onClick={() => navigate(`/config/catalogs/repairs/${id}`)}
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

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Sistema (systemKey)</label>
                            <input
                                className="w-full border rounded px-3 py-2"
                                value={form.systemKey}
                                onChange={(e) => onChange('systemKey', e.target.value)}
                                disabled={viewMode}
                                placeholder="Ej: FRENOS"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Sub-sistema</label>
                            <input
                                className="w-full border rounded px-3 py-2"
                                value={form.subsystemKey}
                                onChange={(e) => onChange('subsystemKey', e.target.value)}
                                disabled={viewMode}
                                placeholder="Ej: HIDRÁULICO"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Componente</label>
                            <input
                                className="w-full border rounded px-3 py-2"
                                value={form.componentKey}
                                onChange={(e) => onChange('componentKey', e.target.value)}
                                disabled={viewMode}
                                placeholder="Ej: BOMBA"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Modo de falla</label>
                            <input
                                className="w-full border rounded px-3 py-2"
                                value={form.failureModeKey}
                                onChange={(e) => onChange('failureModeKey', e.target.value)}
                                disabled={viewMode}
                                placeholder="Ej: FUGA"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Tipo</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.repairType}
                                onChange={(e) => onChange('repairType', e.target.value)}
                                disabled={viewMode}
                            >
                                {REPAIR_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Severidad (default)</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.severityDefault}
                                onChange={(e) => onChange('severityDefault', e.target.value)}
                                disabled={viewMode}
                            >
                                {SEVERITIES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Impacto operacional</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.operationalImpactDefault}
                                onChange={(e) => onChange('operationalImpactDefault', e.target.value)}
                                disabled={viewMode}
                            >
                                {IMPACTS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Tiempo estándar (min)</label>
                            <input
                                type="number"
                                className="w-full border rounded px-3 py-2"
                                value={form.standardLaborMinutes}
                                onChange={(e) => onChange('standardLaborMinutes', e.target.value)}
                                disabled={viewMode}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Tags (1 por línea)</label>
                            <textarea
                                className="w-full border rounded px-3 py-2"
                                rows={4}
                                value={form.tagsText}
                                onChange={(e) => onChange('tagsText', e.target.value)}
                                disabled={viewMode}
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={(e) => onChange('active', e.target.checked)}
                                    disabled={viewMode}
                                />
                                <span className="text-sm">Activo</span>
                            </div>

                            <div className="rounded border p-3 bg-gray-50">
                                <div className="text-sm font-semibold mb-2">Archivos (Media)</div>
                                <div className="text-xs text-gray-500 mb-3">
                                    Disponible al guardar el registro. Se administra vía repairsMedia.controller.
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm">Foto:</span>
                                    {doc?.photo?.url ? (
                                        <a className="text-sm text-[var(--fc-primary)]" href={doc.photo.url} target="_blank" rel="noreferrer">
                                            Ver
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-500">—</span>
                                    )}
                                </div>

                                {!viewMode && !isNew && (
                                    <div className="space-y-2">
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => onUploadPhoto(e.target.files?.[0])}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                onChange={(e) => onUploadDoc(e.target.files?.[0])}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-3">
                                    <div className="text-sm font-semibold mb-2">Documentos</div>
                                    {(doc?.documents || []).length === 0 && (
                                        <div className="text-sm text-gray-500">Sin documentos</div>
                                    )}
                                    <ul className="space-y-1">
                                        {(doc?.documents || []).map((d) => (
                                            <li key={d._id} className="flex items-center justify-between gap-2">
                                                <a className="text-sm text-[var(--fc-primary)]" href={d.url} target="_blank" rel="noreferrer">
                                                    {d.label || d.format || 'Documento'}
                                                </a>
                                                {!viewMode && (
                                                    <button
                                                        type="button"
                                                        className="text-xs text-red-600"
                                                        onClick={() => onDeleteDoc(d._id)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    )
}
