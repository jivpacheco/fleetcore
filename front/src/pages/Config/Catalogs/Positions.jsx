// import { useEffect, useMemo, useState } from 'react'
// import { PositionsAPI } from '../../../api/positions.api'

// function extractItems(data) {
//     if (!data) return []
//     if (Array.isArray(data)) return data
//     if (Array.isArray(data.items)) return data.items
//     if (Array.isArray(data.result?.items)) return data.result.items
//     return []
// }

// export default function Positions() {
//     const [q, setQ] = useState('')
//     const [items, setItems] = useState([])
//     const [loading, setLoading] = useState(false)

//     const [form, setForm] = useState({ code: '', name: '', description: '', active: true })
//     const [editingId, setEditingId] = useState(null)

//     const load = async () => {
//         setLoading(true)
//         try {
//             const { data } = await PositionsAPI.list({ q, limit: 200 })
//             setItems(extractItems(data))
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => { load() }, []) // eslint-disable-line

//     const reset = () => {
//         setForm({ code: '', name: '', description: '', active: true })
//         setEditingId(null)
//     }

//     const onSubmit = async (e) => {
//         e.preventDefault()
//         const payload = { ...form }
//         if (!payload.name?.trim()) return alert('Nombre es obligatorio')

//         try {
//             if (editingId) await PositionsAPI.update(editingId, payload)
//             else await PositionsAPI.create(payload)
//             await load()
//             reset()
//         } catch (err) {
//             console.error(err)
//             alert('No fue posible guardar')
//         }
//     }

//     const onEdit = (it) => {
//         setEditingId(it._id)
//         setForm({
//             code: it.code || '',
//             name: it.name || '',
//             description: it.description || '',
//             active: it.active !== false,
//         })
//     }

//     const onDelete = async (id) => {
//         const ok = window.confirm('¿Eliminar cargo?')
//         if (!ok) return
//         try {
//             await PositionsAPI.remove(id)
//             await load()
//         } catch (err) {
//             console.error(err)
//             alert('No fue posible eliminar')
//         }
//     }

//     const filtered = useMemo(() => {
//         const qq = q.trim().toLowerCase()
//         if (!qq) return items
//         return items.filter(it => `${it.code || ''} ${it.name || ''}`.toLowerCase().includes(qq))
//     }, [items, q])

//     return (
//         <div className="p-6 space-y-6">
//             <div>
//                 <h1 className="text-xl font-bold">Catálogo: Cargos (Positions)</h1>
//                 <p className="text-sm text-gray-600">Crea y administra cargos para RRHH.</p>
//             </div>

//             <form onSubmit={onSubmit} className="border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
//                 <input
//                     className="border rounded px-3 py-2"
//                     placeholder="Código (opcional)"
//                     value={form.code}
//                     onChange={(e) => setForm(s => ({ ...s, code: e.target.value }))}
//                 />
//                 <input
//                     className="border rounded px-3 py-2 md:col-span-2"
//                     placeholder="Nombre *"
//                     value={form.name}
//                     onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
//                 />
//                 <label className="flex items-center gap-2 text-sm">
//                     <input
//                         type="checkbox"
//                         checked={form.active}
//                         onChange={(e) => setForm(s => ({ ...s, active: e.target.checked }))}
//                     />
//                     Activo
//                 </label>
//                 <textarea
//                     className="border rounded px-3 py-2 md:col-span-4"
//                     placeholder="Descripción"
//                     value={form.description}
//                     onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
//                 />

//                 <div className="md:col-span-4 flex gap-2">
//                     <button type="submit" className="px-3 py-2 rounded bg-black text-white">
//                         {editingId ? 'Actualizar' : 'Crear'}
//                     </button>
//                     <button type="button" className="px-3 py-2 rounded border" onClick={reset}>Limpiar</button>
//                     <button type="button" className="px-3 py-2 rounded border" onClick={load} disabled={loading}>
//                         Recargar
//                     </button>
//                 </div>
//             </form>

//             <div className="flex items-center gap-2">
//                 <input
//                     className="border rounded px-3 py-2 w-full md:w-96"
//                     placeholder="Buscar..."
//                     value={q}
//                     onChange={(e) => setQ(e.target.value)}
//                 />
//             </div>

//             <div className="border rounded overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="text-left p-2">Código</th>
//                             <th className="text-left p-2">Nombre</th>
//                             <th className="text-left p-2">Activo</th>
//                             <th className="text-left p-2 w-48">Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filtered.map(it => (
//                             <tr key={it._id} className="border-t">
//                                 <td className="p-2">{it.code || '—'}</td>
//                                 <td className="p-2">{it.name}</td>
//                                 <td className="p-2">{it.active === false ? 'No' : 'Sí'}</td>
//                                 <td className="p-2 flex gap-2">
//                                     <button className="px-2 py-1 border rounded" onClick={() => onEdit(it)}>Editar</button>
//                                     <button className="px-2 py-1 border rounded" onClick={() => onDelete(it._id)}>Eliminar</button>
//                                 </td>
//                             </tr>
//                         ))}
//                         {!filtered.length && (
//                             <tr><td className="p-3 text-gray-500" colSpan="4">Sin registros</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     )
// }

import { useEffect, useMemo, useState } from 'react'
import { PositionsAPI } from '../../../api/positions.api'

function extractItems(data) {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.items)) return data.items
    if (Array.isArray(data.result?.items)) return data.result.items
    return []
}

export default function Positions() {
    const [q, setQ] = useState('')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [form, setForm] = useState({ code: '', name: '', description: '', active: true })
    const [editingId, setEditingId] = useState(null)

    const load = async () => {
        setLoading(true)
        try {
            const { data } = await PositionsAPI.list({ q, limit: 200 })
            setItems(extractItems(data))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, []) // eslint-disable-line

    const reset = () => {
        setForm({ code: '', name: '', description: '', active: true })
        setEditingId(null)
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        const payload = { ...form }
        if (!payload.name?.trim()) return alert('Nombre es obligatorio')

        try {
            if (editingId) await PositionsAPI.update(editingId, payload)
            else await PositionsAPI.create(payload)
            await load()
            reset()
        } catch (err) {
            console.error(err)
            alert('No fue posible guardar')
        }
    }

    const onEdit = (it) => {
        setEditingId(it._id)
        setForm({
            code: it.code || '',
            name: it.name || '',
            description: it.description || '',
            active: it.active !== false,
        })
    }

    const onDelete = async (id) => {
        const ok = window.confirm('¿Eliminar cargo?')
        if (!ok) return
        try {
            await PositionsAPI.remove(id)
            await load()
        } catch (err) {
            console.error(err)
            alert('No fue posible eliminar')
        }
    }

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase()
        if (!qq) return items
        return items.filter(it => `${it.code || ''} ${it.name || ''}`.toLowerCase().includes(qq))
    }, [items, q])

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold">Catálogo: Cargos (Positions)</h1>
                <p className="text-sm text-gray-600">Crea y administra cargos para RRHH.</p>
            </div>

            <form onSubmit={onSubmit} className="border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    className="border rounded px-3 py-2"
                    placeholder="Código (opcional)"
                    value={form.code}
                    onChange={(e) => setForm(s => ({ ...s, code: e.target.value }))}
                />
                <input
                    className="border rounded px-3 py-2 md:col-span-2"
                    placeholder="Nombre *"
                    value={form.name}
                    onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm(s => ({ ...s, active: e.target.checked }))}
                    />
                    Activo
                </label>
                <textarea
                    className="border rounded px-3 py-2 md:col-span-4"
                    placeholder="Descripción"
                    value={form.description}
                    onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
                />

                <div className="md:col-span-4 flex gap-2">
                    <button type="submit" className="px-3 py-2 rounded bg-black text-white">
                        {editingId ? 'Actualizar' : 'Crear'}
                    </button>
                    <button type="button" className="px-3 py-2 rounded border" onClick={reset}>Limpiar</button>
                    <button type="button" className="px-3 py-2 rounded border" onClick={load} disabled={loading}>
                        Recargar
                    </button>
                </div>
            </form>

            <div className="flex items-center gap-2">
                <input
                    className="border rounded px-3 py-2 w-full md:w-96"
                    placeholder="Buscar..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>

            <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-2">Código</th>
                            <th className="text-left p-2">Nombre</th>
                            <th className="text-left p-2">Activo</th>
                            <th className="text-left p-2 w-48">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(it => (
                            <tr key={it._id} className="border-t">
                                <td className="p-2">{it.code || '—'}</td>
                                <td className="p-2">{it.name}</td>
                                <td className="p-2">{it.active === false ? 'No' : 'Sí'}</td>
                                <td className="p-2 flex gap-2">
                                    <button className="px-2 py-1 border rounded" onClick={() => onEdit(it)}>Editar</button>
                                    <button className="px-2 py-1 border rounded" onClick={() => onDelete(it._id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {!filtered.length && (
                            <tr><td className="p-3 text-gray-500" colSpan="4">Sin registros</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
