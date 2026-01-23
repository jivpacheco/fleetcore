// front/src/pages/Branches/Form.jsx
// -----------------------------------------------------------------------------
// Configuración - Sucursales (Ficha)
// Visual alineada a RRHH/Catálogos.
// Tabs:
// A) Información básica (incluye adjuntos: foto fachada + documentos)
// B) Vehículos asociados (placeholder / link)
// C) Tickets asociados (placeholder / link)
// D) Recurso humano (placeholder / link)
// E) Inventarios / herramientas / equipos (placeholder)
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import comunasRegiones from '../../data/chile/comunas-regiones.json'
import { BranchesAPI } from '../../api/branches.api'

const TABS = [
    { key: 'basic', label: 'Información básica' },
    { key: 'vehicles', label: 'Vehículos asociados' },
    { key: 'tickets', label: 'Tickets asociados' },
    { key: 'hr', label: 'Recurso humano' },
    { key: 'inventory', label: 'Inventarios / equipos' },
]

const regionsList = (comunasRegiones?.regiones || []).map((r) => r.region)
const comunasByRegion = (region) => {
    const hit = (comunasRegiones?.regiones || []).find((r) => r.region === region)
    return hit?.comunas || []
}

export default function BranchesForm() {
    const { id } = useParams()
    const isNew = id === 'new' || !id
    const navigate = useNavigate()
    const [sp, setSp] = useSearchParams()
    const mode = sp.get('mode') || (isNew ? 'edit' : 'view')
    const isView = mode === 'view'

    const [tab, setTab] = useState(sp.get('tab') || 'basic')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [branch, setBranch] = useState(null)

    const [form, setForm] = useState({
        code: '',
        name: '',
        region: '',
        comuna: '',
        address: '',
        geoLat: '',
        geoLng: '',
        active: true,
    })

    const comunas = useMemo(() => comunasByRegion(form.region), [form.region])

    useEffect(() => {
        const t = sp.get('tab')
        if (t) setTab(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sp])

    const setTabSafe = (key) => {
        setTab(key)
        setSp((prev) => {
            const next = new URLSearchParams(prev)
            next.set('tab', key)
            return next
        })
    }

    const mapToForm = (b) => ({
        code: b?.code || '',
        name: b?.name || '',
        region: b?.region || '',
        comuna: b?.comuna || '',
        address: b?.address || '',
        geoLat: b?.geo?.lat != null ? String(b.geo.lat) : '',
        geoLng: b?.geo?.lng != null ? String(b.geo.lng) : '',
        active: b?.active !== false,
    })

    const load = async () => {
        if (isNew) return
        setLoading(true)
        try {
            const { data } = await BranchesAPI.get(id)
            setBranch(data)
            setForm(mapToForm(data))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // Ajuste: si cambia región y la comuna no está en la lista, limpiar
    useEffect(() => {
        if (!form.region) return
        if (!form.comuna) return
        if (!comunas.includes(form.comuna)) {
            setForm((s) => ({ ...s, comuna: '' }))
        }
    }, [form.region]) // eslint-disable-line

    const payload = useMemo(() => {
        const out = {
            code: String(form.code || '').trim(),
            name: String(form.name || '').trim(),
            region: String(form.region || '').trim(),
            comuna: String(form.comuna || '').trim(),
            address: String(form.address || '').trim(),
            active: form.active !== false,
        }
        const lat = String(form.geoLat || '').trim()
        const lng = String(form.geoLng || '').trim()
        const hasGeo = lat !== '' || lng !== ''
        if (hasGeo) {
            out.geo = {
                lat: lat === '' ? null : Number(lat),
                lng: lng === '' ? null : Number(lng),
            }
        }
        return out
    }, [form])

    const save = async () => {
        if (!payload.code || !payload.name) {
            alert('Código y Nombre son obligatorios.')
            return
        }
        setSaving(true)
        try {
            if (isNew) {
                const { data } = await BranchesAPI.create(payload)
                navigate(`/branches/${data._id}?mode=edit&tab=basic`)
            } else {
                const { data } = await BranchesAPI.update(id, payload)
                setBranch(data)
                alert('Sucursal actualizada.')
            }
        } catch (err) {
            console.error(err)
            alert('No fue posible guardar.')
        } finally {
            setSaving(false)
        }
    }

    // ========================= MEDIA (fachada + documentos) =========================
    const uploadPhoto = async (file) => {
        if (!file) return
        if (isNew) {
            alert('Primero guarda la sucursal para poder adjuntar archivos.')
            return
        }
        const fd = new FormData()
        fd.append('file', file)
        try {
            await BranchesAPI.uploadPhoto(id, fd)
            await load()
        } catch (err) {
            console.error(err)
            alert('No fue posible subir la foto.')
        }
    }

    const uploadDocument = async ({ file, label }) => {
        if (!file) return
        if (isNew) {
            alert('Primero guarda la sucursal para poder adjuntar archivos.')
            return
        }
        const fd = new FormData()
        fd.append('file', file)
        if (label) fd.append('label', label)
        try {
            await BranchesAPI.uploadDocument(id, fd)
            await load()
        } catch (err) {
            console.error(err)
            alert('No fue posible subir el documento.')
        }
    }

    const deleteDoc = async (docId) => {
        const ok = window.confirm('¿Eliminar documento?')
        if (!ok) return
        try {
            await BranchesAPI.deleteDocument(id, docId)
            await load()
        } catch (err) {
            console.error(err)
            alert('No fue posible eliminar el documento.')
        }
    }

    // ========================= UI =========================
    const title = isNew ? 'Nueva sucursal' : branch?.name || 'Sucursal'
    const badge = isNew ? '' : branch?.code || ''

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">{title}</h1>
                        {badge && (
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{badge}</span>
                        )}
                        {!isNew && (
                            <span
                                className="text-xs px-2 py-1 rounded"
                                style={{ background: branch?.active === false ? '#fee2e2' : '#dcfce7' }}
                            >
                                {branch?.active === false ? 'Inactiva' : 'Activa'}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">Módulo Sucursales — alineado a RRHH/Catálogos</p>
                </div>

                <div className="flex items-center gap-2">
                    <Link className="px-3 py-2 rounded-md border border-gray-400" to="/branches">
                        Volver
                    </Link>
                    {!isView && (
                        <button
                            className="rounded-md text-white px-4 py-2 disabled:opacity-50"
                            style={{ background: 'var(--fc-primary)' }}
                            disabled={saving || loading}
                            onClick={save}
                        >
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    )}
                    {!isNew && isView && (
                        <Link
                            className="rounded-md text-white px-4 py-2"
                            style={{ background: 'var(--fc-primary)' }}
                            to={`/branches/${id}?mode=edit&tab=${tab}`}
                        >
                            Editar
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border rounded overflow-hidden">
                <div className="flex flex-wrap gap-1 bg-gray-50 p-2">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            className={
                                'px-3 py-2 rounded-md text-sm ' +
                                (tab === t.key
                                    ? 'text-white'
                                    : 'text-gray-700 border border-transparent hover:bg-white')
                            }
                            style={tab === t.key ? { background: 'var(--fc-primary)' } : undefined}
                            onClick={() => setTabSafe(t.key)}
                            type="button"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-4">
                    {loading && <div className="text-gray-600">Cargando…</div>}

                    {!loading && tab === 'basic' && (
                        <div className="space-y-6">
                            {/* Card: Datos */}
                            <div className="border rounded p-4">
                                <h2 className="font-semibold mb-3">Información básica</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600">Código</label>
                                        <input
                                            className="border rounded w-full px-3 py-2"
                                            value={form.code}
                                            disabled={isView}
                                            onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Nombre</label>
                                        <input
                                            className="border rounded w-full px-3 py-2"
                                            value={form.name}
                                            disabled={isView}
                                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-600">Región (residencia/ubicación)</label>
                                        <select
                                            className="border rounded w-full px-3 py-2"
                                            value={form.region}
                                            disabled={isView}
                                            onChange={(e) =>
                                                setForm((s) => ({ ...s, region: e.target.value, comuna: '' }))
                                            }
                                        >
                                            <option value="">Seleccione…</option>
                                            {regionsList.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-600">Comuna</label>
                                        <select
                                            className="border rounded w-full px-3 py-2"
                                            value={form.comuna}
                                            disabled={isView || !form.region}
                                            onChange={(e) => setForm((s) => ({ ...s, comuna: e.target.value }))}
                                        >
                                            <option value="">Seleccione…</option>
                                            {comunas.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-600">Dirección</label>
                                        <input
                                            className="border rounded w-full px-3 py-2"
                                            value={form.address}
                                            disabled={isView}
                                            onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-600">Latitud</label>
                                        <input
                                            className="border rounded w-full px-3 py-2"
                                            value={form.geoLat}
                                            disabled={isView}
                                            onChange={(e) => setForm((s) => ({ ...s, geoLat: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-600">Longitud</label>
                                        <input
                                            className="border rounded w-full px-3 py-2"
                                            value={form.geoLng}
                                            disabled={isView}
                                            onChange={(e) => setForm((s) => ({ ...s, geoLng: e.target.value }))}
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 md:col-span-2 mt-2">
                                        <input
                                            type="checkbox"
                                            checked={form.active !== false}
                                            disabled={isView}
                                            onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                                        />
                                        <span className="text-sm">Sucursal activa</span>
                                    </label>
                                </div>
                            </div>

                            {/* Card: Adjuntos */}
                            <div className="border rounded p-4">
                                <h2 className="font-semibold mb-3">Adjuntos</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm font-medium mb-2">Foto fachada</div>
                                        {branch?.photo?.url ? (
                                            <img
                                                alt="Fachada"
                                                src={branch.photo.url}
                                                className="w-full max-w-md rounded border"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-600">Sin foto.</div>
                                        )}

                                        {!isView && (
                                            <div className="mt-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => uploadPhoto(e.target.files?.[0])}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium mb-2">Documentos</div>
                                        <div className="space-y-2">
                                            {(branch?.documents || []).map((d) => (
                                                <div key={d._id} className="flex items-center justify-between gap-3 border rounded px-3 py-2">
                                                    <a className="text-[var(--fc-primary)] text-sm" href={d.url} target="_blank" rel="noreferrer">
                                                        {d.label || 'Documento'}
                                                    </a>
                                                    {!isView && (
                                                        <button
                                                            className="text-sm text-red-600"
                                                            onClick={() => deleteDoc(d._id)}
                                                            type="button"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {(branch?.documents || []).length === 0 && (
                                                <div className="text-sm text-gray-600">Sin documentos.</div>
                                            )}
                                        </div>

                                        {!isView && (
                                            <div className="mt-3 space-y-2">
                                                <input
                                                    type="file"
                                                    accept="application/pdf,image/*"
                                                    onChange={(e) =>
                                                        uploadDocument({ file: e.target.files?.[0], label: '' })
                                                    }
                                                />
                                                <div className="text-xs text-gray-600">(Se usa el nombre del archivo como etiqueta por defecto)</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && tab === 'vehicles' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-700">
                                Vehículos activos asociados a la sucursal. (Implementación completa quedará enlazada
                                al módulo Vehículos reingenierizado; por ahora dejamos acceso directo.)
                            </p>
                            {!isNew && (
                                <Link
                                    className="text-[var(--fc-primary)]"
                                    to={`/vehicles?branchId=${id}`}
                                >
                                    Ver vehículos filtrados por sucursal
                                </Link>
                            )}
                        </div>
                    )}

                    {!loading && tab === 'tickets' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-700">Tickets asociados a la sucursal (listado filtrado).</p>
                            {!isNew && (
                                <Link className="text-[var(--fc-primary)]" to={`/tickets?branchId=${id}`}>
                                    Ver tickets filtrados por sucursal
                                </Link>
                            )}
                        </div>
                    )}

                    {!loading && tab === 'hr' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-700">Recurso humano asignado a la sucursal.</p>
                            {!isNew && (
                                <Link className="text-[var(--fc-primary)]" to={`/people?branchId=${id}`}>
                                    Ver personas filtradas por sucursal
                                </Link>
                            )}
                        </div>
                    )}

                    {!loading && tab === 'inventory' && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                                Inventarios, herramientas y equipos (con/sin serie). Este tab queda preparado para
                                integrarse con los módulos de Stock/Tools/Assets.
                            </p>
                            <div className="border rounded p-4 text-sm text-gray-600">
                                Placeholder: próximamente sub-secciones (Inventario / Herramientas / Equipos).
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
