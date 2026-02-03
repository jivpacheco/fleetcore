// front/src/templates/module/List.jsx
// -----------------------------------------------------------------------------
// Plantilla FleetCore v1.0 - Listado
// - Querystring: page, limit, q (+ filtros)
// - Contrato backend: { items, total, page, limit }
// - Responsivo: mínimo overflow-x-auto; recomendado cards en móvil
// -----------------------------------------------------------------------------
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
// import { ModuleAPI } from '../../api/module.api'

export default function ModuleList() {
    const navigate = useNavigate()
    const [sp, setSp] = useSearchParams()

    const page = Number(sp.get('page') || 1)
    const limit = Number(sp.get('limit') || 20)
    const [q, setQ] = useState(sp.get('q') || '')

    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        let alive = true
        async function load() {
            try {
                setLoading(true); setError(null)
                // const res = await ModuleAPI.list({ page, limit, q })
                // if (!alive) return
                // setItems(res.items || [])
                // setTotal(res.total || 0)
            } catch (e) {
                if (!alive) return
                setError('No se pudo cargar el listado.')
            } finally {
                if (alive) setLoading(false)
            }
        }
        load()
        return () => { alive = false }
    }, [page, limit, q])

    function goNew() { navigate('new') }
    function goView(id) { navigate(`${id}?mode=view`) }
    function goEdit(id) { navigate(`${id}`) }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Módulo</h1>
                <button className="px-4 py-2 rounded-xl bg-slate-900 text-white" onClick={goNew}>Nuevo</button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onBlur={() => setSp((p) => { p.set('q', q); p.set('page', '1'); return p }, { replace: true })}
                    placeholder="Buscar…"
                    className="w-full md:max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                />
                <div className="text-sm text-slate-500">{loading ? 'Cargando…' : `${total} registros`}</div>
            </div>

            {/* List */}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="border rounded-2xl overflow-x-auto bg-white dark:bg-slate-800">
                <table className="min-w-[900px] w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/40">
                        <tr>
                            <th className="text-left p-3">Columna</th>
                            <th className="text-left p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && items.length === 0 && (
                            <tr><td className="p-3 text-slate-500" colSpan={2}>Sin resultados</td></tr>
                        )}
                        {items.map((it) => (
                            <tr key={it.id || it._id} className="border-t border-slate-100 dark:border-slate-700">
                                <td className="p-3">{it.name || it.code}</td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <button className="text-blue-600" onClick={() => goView(it.id || it._id)}>Ver</button>
                                        <button className="text-slate-700 dark:text-slate-200" onClick={() => goEdit(it.id || it._id)}>Editar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
