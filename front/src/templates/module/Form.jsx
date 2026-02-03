// front/src/templates/module/Form.jsx
// -----------------------------------------------------------------------------
// Plantilla FleetCore v1.0 - Ficha
// - Modo Ver: ?mode=view
// - UnsavedChangesGuard desde hooks (dirty-state determinístico)
// - Botón Auditoría (abre Drawer/Modal) bajo demanda
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// import { ModuleAPI } from '../../api/module.api'

export default function ModuleForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [sp] = useSearchParams()
    const isViewMode = sp.get('mode') === 'view'

    const [loading, setLoading] = useState(Boolean(id))
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({ name: '', active: true })
    const [initial, setInitial] = useState(null)

    const isDirty = useMemo(() => {
        if (!initial) return false
        return JSON.stringify(form) !== JSON.stringify(initial)
    }, [form, initial])

    useEffect(() => {
        let alive = true
        async function load() {
            if (!id) { setInitial({ name: '', active: true }); setLoading(false); return }
            try {
                setLoading(true)
                // const item = await ModuleAPI.get(id)
                // if (!alive) return
                // setForm(item)
                // setInitial(item)
            } finally {
                if (alive) setLoading(false)
            }
        }
        load()
        return () => { alive = false }
    }, [id])

    async function onSave() {
        try {
            setSaving(true)
            // if (id) await ModuleAPI.update(id, form)
            // else await ModuleAPI.create(form)
            setInitial(form)
            navigate('..')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <UnsavedChangesGuard when={isDirty && !isViewMode} />

            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {id ? 'Editar' : 'Crear'} Módulo
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                        onClick={() => navigate('..')}
                    >
                        Volver
                    </button>

                    {!isViewMode && (
                        <button
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-60"
                            onClick={onSave}
                            disabled={saving || loading}
                        >
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-sm text-slate-500">Cargando…</div>
            ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-600 dark:text-slate-300">Nombre</label>
                            <input
                                value={form.name}
                                disabled={isViewMode}
                                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
