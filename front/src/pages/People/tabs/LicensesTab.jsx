// import { useMemo, useState } from 'react'
// import { PeopleAPI } from '../../../api/people.api'

// export default function LicensesTab({ person, onChange }) {
//     const [form, setForm] = useState({ number: '', type: '', issuer: '', issueDate: '', expiryDate: '' })

//     const licenses = useMemo(() => Array.isArray(person?.licenses) ? person.licenses : [], [person])

//     const add = async () => {
//         if (!person?._id) return alert('Primero guarda la persona')
//         if (!form.number?.trim()) return alert('Número es obligatorio')
//         if (!form.type?.trim()) return alert('Tipo es obligatorio')

//         const { data } = await PeopleAPI.addLicense(person._id, {
//             number: form.number,
//             type: form.type,
//             issuer: form.issuer,
//             issueDate: form.issueDate || null,
//             expiryDate: form.expiryDate || null,
//         })
//         onChange?.((prev) => ({ ...prev, licenses: [...licenses, data.item] }))
//         setForm({ number: '', type: '', issuer: '', issueDate: '', expiryDate: '' })
//     }

//     const remove = async (licenseId) => {
//         if (!person?._id) return
//         const ok = window.confirm('¿Eliminar licencia?')
//         if (!ok) return
//         await PeopleAPI.removeLicense(person._id, licenseId)
//         onChange?.((prev) => ({ ...prev, licenses: (prev.licenses || []).filter(l => l._id !== licenseId) }))
//     }

//     return (
//         <div className="space-y-4">
//             <div className="border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
//                 <input className="border rounded px-3 py-2" placeholder="Número *" value={form.number} onChange={(e) => setForm(s => ({ ...s, number: e.target.value }))} />
//                 <input className="border rounded px-3 py-2" placeholder="Tipo * (A1/B/C...)" value={form.type} onChange={(e) => setForm(s => ({ ...s, type: e.target.value }))} />
//                 <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Emisor" value={form.issuer} onChange={(e) => setForm(s => ({ ...s, issuer: e.target.value }))} />
//                 <button type="button" className="px-3 py-2 rounded bg-black text-white" onClick={add}>Agregar</button>

//                 <input type="date" className="border rounded px-3 py-2" value={form.issueDate} onChange={(e) => setForm(s => ({ ...s, issueDate: e.target.value }))} />
//                 <input type="date" className="border rounded px-3 py-2" value={form.expiryDate} onChange={(e) => setForm(s => ({ ...s, expiryDate: e.target.value }))} />
//             </div>

//             <div className="border rounded overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="text-left p-2">Número</th>
//                             <th className="text-left p-2">Tipo</th>
//                             <th className="text-left p-2">Emisor</th>
//                             <th className="text-left p-2">Vence</th>
//                             <th className="text-left p-2 w-32">Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {licenses.map(l => (
//                             <tr key={l._id} className="border-t">
//                                 <td className="p-2">{l.number}</td>
//                                 <td className="p-2">{l.type}</td>
//                                 <td className="p-2">{l.issuer || '—'}</td>
//                                 <td className="p-2">{l.expiryDate ? String(l.expiryDate).slice(0, 10) : '—'}</td>
//                                 <td className="p-2">
//                                     <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(l._id)}>Eliminar</button>
//                                 </td>
//                             </tr>
//                         ))}
//                         {!licenses.length && (
//                             <tr><td className="p-3 text-gray-500" colSpan="5">Sin licencias</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     )
// }

import { useMemo, useState } from 'react'
import { PeopleAPI } from '../../../api/people.api'

const LICENSE_TYPES = ['C', 'B', 'A4', 'A5', 'A2', 'A2*', 'A1', 'A1*', 'A3', 'D', 'E', 'F']

function normType(v = '') {
    return String(v || '').trim().toUpperCase()
}

export default function LicensesTab({ person, onChange }) {
    const licenses = useMemo(() => Array.isArray(person?.licenses) ? person.licenses : [], [person])

    const [form, setForm] = useState({
        folioNumber: '',
        type: '',
        issuer: '',
        firstIssuedAt: '',
        issuedAt: '',
        nextControlAt: '',
    })

    const addOrUpdate = async () => {
        if (!person?._id) return alert('Primero guarda la persona')

        const type = normType(form.type)
        if (!form.folioNumber?.trim()) return alert('N° de folio es obligatorio')
        if (!type) return alert('Tipo/clase es obligatoria')

        const existing = licenses.find(l => normType(l.type) === type)

        // Payload compatible: mantenemos campos anteriores (number/issueDate/expiryDate) y agregamos los nuevos
        const payload = {
            type,
            issuer: form.issuer || '',
            folioNumber: form.folioNumber,
            number: form.folioNumber, // compat
            firstIssuedAt: form.firstIssuedAt || null,
            issuedAt: form.issuedAt || null,
            issueDate: form.issuedAt || null, // compat
            nextControlAt: form.nextControlAt || null,
            expiryDate: form.nextControlAt || null, // compat
        }

        try {
            if (existing?._id) {
                const ok = window.confirm(`La licencia tipo ${type} ya existe. ¿Deseas modificarla?`)
                if (!ok) return
                const { data } = await PeopleAPI.updateLicense(person._id, existing._id, payload)
                onChange?.((prev) => ({
                    ...prev,
                    licenses: licenses.map(l => l._id === existing._id ? data.item : l)
                }))
            } else {
                const { data } = await PeopleAPI.addLicense(person._id, payload)
                onChange?.((prev) => ({ ...prev, licenses: [...licenses, data.item] }))
            }

            setForm({ folioNumber: '', type: '', issuer: '', firstIssuedAt: '', issuedAt: '', nextControlAt: '' })
        } catch (err) {
            console.error(err)
            alert(err?.response?.data?.message || 'No fue posible guardar licencia')
        }
    }

    const remove = async (licenseId) => {
        if (!person?._id) return
        const ok = window.confirm('¿Eliminar licencia?')
        if (!ok) return
        try {
            await PeopleAPI.removeLicense(person._id, licenseId)
            onChange?.((prev) => ({ ...prev, licenses: licenses.filter(l => l._id !== licenseId) }))
        } catch (err) {
            console.error(err)
            alert('No fue posible eliminar')
        }
    }

    return (
        <div className="space-y-4">
            <div className="border rounded p-4">
                <div className="text-sm font-medium mb-2">Agregar / Modificar licencia</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="N° de folio *"
                        value={form.folioNumber}
                        onChange={(e) => setForm(s => ({ ...s, folioNumber: e.target.value }))}
                    />

                    <select
                        className="border rounded px-3 py-2"
                        value={form.type}
                        onChange={(e) => setForm(s => ({ ...s, type: e.target.value }))}
                    >
                        <option value="">Tipo / Clase *</option>
                        {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <input
                        className="border rounded px-3 py-2"
                        placeholder="Organismo emisor (opcional)"
                        value={form.issuer}
                        onChange={(e) => setForm(s => ({ ...s, issuer: e.target.value }))}
                    />

                    <label className="text-sm">
                        <div className="text-gray-600 mb-1">Primer otorgamiento</div>
                        <input
                            type="date"
                            className="border rounded px-3 py-2 w-full"
                            value={form.firstIssuedAt}
                            onChange={(e) => setForm(s => ({ ...s, firstIssuedAt: e.target.value }))}
                        />
                    </label>

                    <label className="text-sm">
                        <div className="text-gray-600 mb-1">Actual otorgamiento</div>
                        <input
                            type="date"
                            className="border rounded px-3 py-2 w-full"
                            value={form.issuedAt}
                            onChange={(e) => setForm(s => ({ ...s, issuedAt: e.target.value }))}
                        />
                    </label>

                    <label className="text-sm">
                        <div className="text-gray-600 mb-1">Próximo control</div>
                        <input
                            type="date"
                            className="border rounded px-3 py-2 w-full"
                            value={form.nextControlAt}
                            onChange={(e) => setForm(s => ({ ...s, nextControlAt: e.target.value }))}
                        />
                    </label>
                </div>

                <div className="mt-3">
                    <button
                        type="button"
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={addOrUpdate}
                    >
                        Guardar licencia
                    </button>
                </div>
            </div>

            <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-2">Tipo</th>
                            <th className="text-left p-2">Folio</th>
                            <th className="text-left p-2">Primer</th>
                            <th className="text-left p-2">Actual</th>
                            <th className="text-left p-2">Próx. control</th>
                            <th className="text-left p-2 w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {licenses.map((l) => (
                            <tr key={l._id} className="border-t">
                                <td className="p-2">{l.type || '—'}</td>
                                <td className="p-2">{l.folioNumber || l.number || '—'}</td>
                                <td className="p-2">{l.firstIssuedAt ? String(l.firstIssuedAt).slice(0, 10) : '—'}</td>
                                <td className="p-2">{(l.issuedAt || l.issueDate) ? String(l.issuedAt || l.issueDate).slice(0, 10) : '—'}</td>
                                <td className="p-2">{(l.nextControlAt || l.expiryDate) ? String(l.nextControlAt || l.expiryDate).slice(0, 10) : '—'}</td>
                                <td className="p-2">
                                    <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(l._id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {!licenses.length && (
                            <tr><td className="p-3 text-gray-500" colSpan="6">Sin licencias</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
