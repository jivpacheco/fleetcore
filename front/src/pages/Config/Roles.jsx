// front/src/pages/Config/Roles.jsx
// -----------------------------------------------------------------------------
// Configuración - Roles y Permisos - Sprint 1 (base)
// - Listado simple (placeholder)
// - CRUD completo se entrega en Sprint 2
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { RolesAPI } from '../../api/roles.api'

export default function RolesPage() {
    const [items, setItems] = useState([])
    const [q, setQ] = useState('')
    const [loading, setLoading] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const { data } = await RolesAPI.list({ page: 1, limit: 200, q })
            const list = data?.items || data?.data?.items || data?.data || []
            setItems(list)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, []) // eslint-disable-line

    return (
        <div className="max-w-6xl mx-auto p-3">
            <h2 className="text-lg font-semibold">Configuraciones — Roles</h2>

            <div className="mt-3 flex gap-2">
                <input className="border rounded p-2 w-full" placeholder="Buscar rol…" value={q} onChange={(e) => setQ(e.target.value)} />
                <button className="px-3 py-2 border rounded" onClick={load}>Buscar</button>
            </div>

            <div className="mt-4 bg-white border rounded-xl overflow-hidden">
                {loading && <div className="p-3 text-sm text-slate-500">Cargando…</div>}
                {!loading && items.length === 0 && <div className="p-3 text-sm text-slate-500">Sin resultados.</div>}
                {!loading && items.length > 0 && (
                    <ul className="divide-y">
                        {items.map(it => (
                            <li key={it._id} className="p-3 text-sm">
                                <div className="font-medium">{it.name}</div>
                                <div className="text-xs text-slate-500">{it.code} — {it.scope || 'BRANCH'}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
