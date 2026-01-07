import { useEffect, useState } from 'react'
import { DrivingTestsAPI } from '../../../api/drivingTests.api'
import { PeopleAPI } from '../../../api/people.api'
import { api, API_PREFIX } from '../../../services/http'
import ExaminerSelect from '../../../components/DrivingTests/ExaminerSelect'
import MapRecorder from '../../../components/DrivingTests/MapRecorder'

export default function DrivingTestsTab({ person }) {
    const [items, setItems] = useState([])
    const [people, setPeople] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [branchId, setBranchId] = useState(person?.branchId?._id || person?.branchId || '')

    const [examinerId, setExaminerId] = useState('')
    const [vehicleId, setVehicleId] = useState('')
    const [notes, setNotes] = useState('')

    const load = async () => {
        if (!person?._id) return
        const { data } = await DrivingTestsAPI.list({ personId: person._id, limit: 200 })
        setItems(data.items || [])
    }

    const loadRefs = async () => {
        // people (para examinadores)
        try {
            const { data } = await PeopleAPI.list({ page: 1, limit: 200, active: 'true' })
            setPeople(data.items || [])
        } catch { setPeople([]) }

        // vehicles (para selección)
        try {
            const { data } = await api.get(`${API_PREFIX}/vehicles`, { params: { page: 1, limit: 200 } })
            setVehicles(data.items || [])
        } catch { setVehicles([]) }
    }

    useEffect(() => { loadRefs() }, [])
    useEffect(() => { load() }, [person?._id]) // eslint-disable-line

    const onFinish = async ({ startedAt, endedAt, durationSec, distanceKm, track, mapSnapshotDataUrl }) => {
        if (!person?._id) return alert('Primero guarda la persona')
        if (!examinerId) return alert('Selecciona examinador')
        if (!vehicleId) return alert('Selecciona vehículo')

        // Sprint 1: enviamos snapshot como dataURL (luego se sube a storage real)
        const payload = {
            personId: person._id,
            examinerId,
            vehicleId,
            branchId: branchId || (person.branchId?._id || person.branchId),
            notes,
            startedAt,
            endedAt,
            durationSec,
            distanceKm,
            track,
            mapSnapshotUrl: mapSnapshotDataUrl,
        }

        const { data } = await DrivingTestsAPI.start(payload)
        const created = data.item

        // finish inmediato para Sprint 1 (ya tenemos endedAt)
        await DrivingTestsAPI.finish(created._id, {
            endedAt,
            durationSec,
            distanceKm,
            track,
            mapSnapshotUrl: mapSnapshotDataUrl,
            notes,
        })

        setNotes('')
        setVehicleId('')
        setExaminerId('')
        await load()
    }

    const remove = async (id) => {
        const ok = window.confirm('¿Eliminar prueba?')
        if (!ok) return
        await DrivingTestsAPI.remove(id)
        await load()
    }

    return (
        <div className="space-y-6">
            <div className="border rounded p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Examinador</div>
                        <ExaminerSelect people={people} value={examinerId} onChange={setExaminerId} />
                    </div>

                    <div>
                        <div className="text-sm text-gray-600 mb-1">Vehículo</div>
                        <select className="w-full border rounded px-3 py-2" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                            <option value="">— Selecciona vehículo —</option>
                            {vehicles.map(v => (
                                <option key={v._id} value={v._id}>
                                    {v.plate || v.code || v.name || v._id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="text-sm text-gray-600 mb-1">Sucursal (branchId)</div>
                        <input className="w-full border rounded px-3 py-2" value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder="ObjectId sucursal" />
                    </div>
                </div>

                <textarea className="border rounded px-3 py-2 w-full" rows="3" placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />

                <MapRecorder onFinish={onFinish} />
            </div>

            <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-2">Fecha</th>
                            <th className="text-left p-2">Vehículo</th>
                            <th className="text-left p-2">Distancia</th>
                            <th className="text-left p-2">Duración</th>
                            <th className="text-left p-2 w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(it => (
                            <tr key={it._id} className="border-t">
                                <td className="p-2">{String(it.createdAt || '').slice(0, 10)}</td>
                                <td className="p-2">{it.vehicleId?.plate || it.vehicleId || '—'}</td>
                                <td className="p-2">{it.distanceKm || 0} km</td>
                                <td className="p-2">{it.durationSec || 0} s</td>
                                <td className="p-2">
                                    <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(it._id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {!items.length && (
                            <tr><td className="p-3 text-gray-500" colSpan="5">Sin pruebas registradas</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
