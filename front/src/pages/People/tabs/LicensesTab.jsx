import { useMemo, useState } from 'react'
import { PeopleAPI } from '../../../api/people.api'

export default function LicensesTab({ person, onChange }) {
    const [form, setForm] = useState({ number: '', type: '', issuer: '', issueDate: '', expiryDate: '' })

    const licenses = useMemo(() => Array.isArray(person?.licenses) ? person.licenses : [], [person])

    const add = async () => {
        if (!person?._id) return alert('Primero guarda la persona')
        if (!form.number?.trim()) return alert('Número es obligatorio')
        if (!form.type?.trim()) return alert('Tipo es obligatorio')

        const { data } = await PeopleAPI.addLicense(person._id, {
            number: form.number,
            type: form.type,
            issuer: form.issuer,
            issueDate: form.issueDate || null,
            expiryDate: form.expiryDate || null,
        })
        onChange?.((prev) => ({ ...prev, licenses: [...licenses, data.item] }))
        setForm({ number: '', type: '', issuer: '', issueDate: '', expiryDate: '' })
    }

    const remove = async (licenseId) => {
        if (!person?._id) return
        const ok = window.confirm('¿Eliminar licencia?')
        if (!ok) return
        await PeopleAPI.removeLicense(person._id, licenseId)
        onChange?.((prev) => ({ ...prev, licenses: (prev.licenses || []).filter(l => l._id !== licenseId) }))
    }

    return (
        <div className="space-y-4">
            <div className="border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Número *" value={form.number} onChange={(e) => setForm(s => ({ ...s, number: e.target.value }))} />
                <input className="border rounded px-3 py-2" placeholder="Tipo * (A1/B/C...)" value={form.type} onChange={(e) => setForm(s => ({ ...s, type: e.target.value }))} />
                <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Emisor" value={form.issuer} onChange={(e) => setForm(s => ({ ...s, issuer: e.target.value }))} />
                <button type="button" className="px-3 py-2 rounded bg-black text-white" onClick={add}>Agregar</button>

                <input type="date" className="border rounded px-3 py-2" value={form.issueDate} onChange={(e) => setForm(s => ({ ...s, issueDate: e.target.value }))} />
                <input type="date" className="border rounded px-3 py-2" value={form.expiryDate} onChange={(e) => setForm(s => ({ ...s, expiryDate: e.target.value }))} />
            </div>

            <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-2">Número</th>
                            <th className="text-left p-2">Tipo</th>
                            <th className="text-left p-2">Emisor</th>
                            <th className="text-left p-2">Vence</th>
                            <th className="text-left p-2 w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {licenses.map(l => (
                            <tr key={l._id} className="border-t">
                                <td className="p-2">{l.number}</td>
                                <td className="p-2">{l.type}</td>
                                <td className="p-2">{l.issuer || '—'}</td>
                                <td className="p-2">{l.expiryDate ? String(l.expiryDate).slice(0, 10) : '—'}</td>
                                <td className="p-2">
                                    <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(l._id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {!licenses.length && (
                            <tr><td className="p-3 text-gray-500" colSpan="5">Sin licencias</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
