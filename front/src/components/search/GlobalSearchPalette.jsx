// front/src/components/search/GlobalSearchPalette.jsx
// -----------------------------------------------------------------------------
// Búsqueda global FleetCore (Ctrl/Cmd+K):
// - Normaliza códigos OTxxxx y SOLxxx
// - Consulta backend (si existe): GET /api/v1/search?q=...&limit=10
// - Devuelve items con { type, code, title, subtitle, route }
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/http'

function normalizeQuery(q) {
    const raw = String(q || '').trim()
    if (!raw) return ''
    // OT / SOL con variaciones: "ot 123", "OT-123", "sol_55"
    const m = raw.match(/^(ot|sol)\s*[-_ ]?\s*(\d+)$/i)
    if (m) return `${m[1].toUpperCase()}${m[2]}`
    return raw
}

export default function GlobalSearchPalette({ open, onClose }) {
    const navigate = useNavigate()
    const [q, setQ] = useState('')
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState([])
    const inputRef = useRef(null)

    const norm = useMemo(() => normalizeQuery(q), [q])

    useEffect(() => {
        if (!open) return
        setQ('')
        setItems([])
        setTimeout(() => inputRef.current?.focus(), 0)
    }, [open])

    useEffect(() => {
        if (!open) return
        if (!norm) { setItems([]); return }

        const ctrl = new AbortController()
        const run = async () => {
            try {
                setLoading(true)
                const { data } = await api.get('/api/v1/search', {
                    params: { q: norm, limit: 10 },
                    signal: ctrl.signal,
                })
                setItems(Array.isArray(data?.items) ? data.items : [])
            } catch (e) {
                // Si el endpoint aún no existe, no rompemos la UI.
                setItems([])
            } finally {
                setLoading(false)
            }
        }

        const t = setTimeout(run, 300) // debounce
        return () => { clearTimeout(t); ctrl.abort() }
    }, [norm, open])

    function go(item) {
        if (!item) return
        onClose?.()
        if (item.route) navigate(item.route)
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
            <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar OTxxxx o SOLxxx… (Ctrl/Cmd+K)"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
                    />
                    {norm && norm !== q.trim() && (
                        <div className="mt-2 text-xs text-slate-500">
                            Normalizado: <span className="font-medium">{norm}</span>
                        </div>
                    )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-sm text-slate-500">Buscando…</div>
                    )}

                    {!loading && items.length === 0 && norm && (
                        <div className="p-4 text-sm text-slate-500">
                            Sin resultados. (Si el endpoint aún no está implementado, la búsqueda se activará cuando exista.)
                        </div>
                    )}

                    {!loading && !norm && (
                        <div className="p-4 text-sm text-slate-500">
                            Escribe un código (OT/SOL) o texto para buscar.
                        </div>
                    )}

                    {items.map((it, idx) => (
                        <button
                            key={`${it.type || 'item'}-${it.id || idx}`}
                            onClick={() => go(it)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                        {it.title || it.code || 'Resultado'}
                                    </div>
                                    {it.subtitle && (
                                        <div className="text-xs text-slate-500 truncate">{it.subtitle}</div>
                                    )}
                                </div>
                                {it.code && (
                                    <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                        {it.code}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
