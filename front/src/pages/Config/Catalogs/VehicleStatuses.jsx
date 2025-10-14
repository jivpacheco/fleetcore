import { useEffect, useState } from 'react'
import { getCatalog, addCatalogItem, patchCatalogItem, removeCatalogItem } from '../../../api/catalogs.api'

const KEY = 'vehicle_statuses' // en back se guarda uppercase

export default function VehicleStatusesCatalog() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState({ code: '', label: '' })

    async function load() {
        setLoading(true); setError('')
        try {
            const data = await getCatalog(KEY)
            setItems(data?.items || [])
        } catch (e) {
            setItems([]); setError('No se pudo cargar el catálogo')
        } finally { setLoading(false) }
    }
    useEffect(() => { load() }, [])

    async function handleAdd(e) {
        e.preventDefault()
        if (!form.code.trim() || !form.label.trim()) return
        await addCatalogItem(KEY, { code: form.code, label: form.label })
        setForm({ code: '', label: '' })
        await load()
    }

    async function toggleActive(it) {
        await patchCatalogItem(KEY, it._id, { active: !it.active })
        await load()
    }

    async function del(it) {
        if (!confirm('¿Eliminar estado?')) return
        await removeCatalogItem(KEY, it._id)
        await load()
    }

    return (
        <div className="max-w-3xl space-y-4">
            <header>
                <h1 className="text-xl font-semibold">Catálogo: Estados de Vehículo</h1>
                <p className="text-sm text-slate-500">Configura opciones como ACTIVE, SUPPORT, IN_REPAIR, etc.</p>
            </header>

            <form onSubmit={handleAdd} className="bg-white border rounded-xl p-4 flex gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Código</label>
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                        className="w-full border rounded p-2" placeholder="ACTIVE" required />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Etiqueta</label>
                    <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value.toUpperCase() }))}
                        className="w-full border rounded p-2" placeholder="ACTIVO" required />
                </div>
                <button className="px-3 py-2 bg-blue-600 text-white rounded">Agregar</button>
            </form>

            <div className="bg-white border rounded-xl">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600">
                            <th className="text-left px-3 py-2">Código</th>
                            <th className="text-left px-3 py-2">Etiqueta</th>
                            <th className="px-3 py-2">Activo</th>
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td className="px-3 py-3" colSpan={4}>Cargando…</td></tr>
                        ) : items.length ? items.map(it => (
                            <tr key={it._id} className="border-t">
                                <td className="px-3 py-2 font-mono">{it.code}</td>
                                <td className="px-3 py-2">{it.label}</td>
                                <td className="px-3 py-2">
                                    <button onClick={() => toggleActive(it)} className={`px-2 py-1 rounded ${it.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {it.active ? 'Sí' : 'No'}
                                    </button>
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <button onClick={() => del(it)} className="px-2 py-1 text-red-600 hover:underline">Eliminar</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td className="px-3 py-3" colSpan={4}>Sin datos</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
    )
}
