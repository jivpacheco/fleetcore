// import { useEffect, useState } from 'react'
// import { DrivingTestsAPI } from '../../../api/drivingTests.api'
// import { PeopleAPI } from '../../../api/people.api'
// import { api, API_PREFIX } from '../../../services/http'
// import ExaminerSelect from '../../../components/DrivingTests/ExaminerSelect'
// import MapRecorder from '../../../components/DrivingTests/MapRecorder'

// export default function DrivingTestsTab({ person }) {
//     const [items, setItems] = useState([])
//     const [people, setPeople] = useState([])
//     const [vehicles, setVehicles] = useState([])
//     const [branchId, setBranchId] = useState(person?.branchId?._id || person?.branchId || '')

//     const [examinerId, setExaminerId] = useState('')
//     const [vehicleId, setVehicleId] = useState('')
//     const [notes, setNotes] = useState('')

//     const load = async () => {
//         if (!person?._id) return
//         const { data } = await DrivingTestsAPI.list({ personId: person._id, limit: 200 })
//         setItems(data.items || [])
//     }

//     const loadRefs = async () => {
//         // people (para examinadores)
//         try {
//             const { data } = await PeopleAPI.list({ page: 1, limit: 200, active: 'true' })
//             setPeople(data.items || [])
//         } catch { setPeople([]) }

//         // vehicles (para selección)
//         try {
//             const { data } = await api.get(`${API_PREFIX}/vehicles`, { params: { page: 1, limit: 200 } })
//             setVehicles(data.items || [])
//         } catch { setVehicles([]) }
//     }

//     useEffect(() => { loadRefs() }, [])
//     useEffect(() => { load() }, [person?._id]) // eslint-disable-line

//     const onFinish = async ({ startedAt, endedAt, durationSec, distanceKm, track, mapSnapshotDataUrl }) => {
//         if (!person?._id) return alert('Primero guarda la persona')
//         if (!examinerId) return alert('Selecciona examinador')
//         if (!vehicleId) return alert('Selecciona vehículo')

//         // Sprint 1: enviamos snapshot como dataURL (luego se sube a storage real)
//         const payload = {
//             personId: person._id,
//             examinerId,
//             vehicleId,
//             branchId: branchId || (person.branchId?._id || person.branchId),
//             notes,
//             startedAt,
//             endedAt,
//             durationSec,
//             distanceKm,
//             track,
//             mapSnapshotUrl: mapSnapshotDataUrl,
//         }

//         const { data } = await DrivingTestsAPI.start(payload)
//         const created = data.item

//         // finish inmediato para Sprint 1 (ya tenemos endedAt)
//         await DrivingTestsAPI.finish(created._id, {
//             endedAt,
//             durationSec,
//             distanceKm,
//             track,
//             mapSnapshotUrl: mapSnapshotDataUrl,
//             notes,
//         })

//         setNotes('')
//         setVehicleId('')
//         setExaminerId('')
//         await load()
//     }

//     const remove = async (id) => {
//         const ok = window.confirm('¿Eliminar prueba?')
//         if (!ok) return
//         await DrivingTestsAPI.remove(id)
//         await load()
//     }

//     return (
//         <div className="space-y-6">
//             <div className="border rounded p-4 space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <div>
//                         <div className="text-sm text-gray-600 mb-1">Examinador</div>
//                         <ExaminerSelect people={people} value={examinerId} onChange={setExaminerId} />
//                     </div>

//                     <div>
//                         <div className="text-sm text-gray-600 mb-1">Vehículo</div>
//                         <select className="w-full border rounded px-3 py-2" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
//                             <option value="">— Selecciona vehículo —</option>
//                             {vehicles.map(v => (
//                                 <option key={v._id} value={v._id}>
//                                     {v.plate || v.code || v.name || v._id}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <div className="text-sm text-gray-600 mb-1">Sucursal (branchId)</div>
//                         <input className="w-full border rounded px-3 py-2" value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder="ObjectId sucursal" />
//                     </div>
//                 </div>

//                 <textarea className="border rounded px-3 py-2 w-full" rows="3" placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />

//                 <MapRecorder onFinish={onFinish} />
//             </div>

//             <div className="border rounded overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="text-left p-2">Fecha</th>
//                             <th className="text-left p-2">Vehículo</th>
//                             <th className="text-left p-2">Distancia</th>
//                             <th className="text-left p-2">Duración</th>
//                             <th className="text-left p-2 w-32">Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {items.map(it => (
//                             <tr key={it._id} className="border-t">
//                                 <td className="p-2">{String(it.createdAt || '').slice(0, 10)}</td>
//                                 <td className="p-2">{it.vehicleId?.plate || it.vehicleId || '—'}</td>
//                                 <td className="p-2">{it.distanceKm || 0} km</td>
//                                 <td className="p-2">{it.durationSec || 0} s</td>
//                                 <td className="p-2">
//                                     <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(it._id)}>Eliminar</button>
//                                 </td>
//                             </tr>
//                         ))}
//                         {!items.length && (
//                             <tr><td className="p-3 text-gray-500" colSpan="5">Sin pruebas registradas</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     )
// }

import { useEffect, useMemo, useState } from 'react'
import { DrivingTestsAPI } from '../../../api/drivingTests.api'
import { PeopleAPI } from '../../../api/people.api'
import { api, API_PREFIX } from '../../../services/http'
import ExaminerSelect from '../../../components/DrivingTests/ExaminerSelect'
import MapRecorder from '../../../components/DrivingTests/MapRecorder'

export default function DrivingTestsTab({ person, onPersonReload }) {
    const [items, setItems] = useState([])
    const [people, setPeople] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [branches, setBranches] = useState([])
    const [branchId, setBranchId] = useState(person?.branchId?._id || person?.branchId || '')

    const [examinerId, setExaminerId] = useState('')
    const [vehicleId, setVehicleId] = useState('')
    const [notes, setNotes] = useState('')

    // Autorización (para el conductor/persona)
    const [authSaving, setAuthSaving] = useState(false)
    const auth = useMemo(() => person?.driverAuthorization || {}, [person])
    const [isAuthorized, setIsAuthorized] = useState(Boolean(auth?.isAuthorized))
    const [authorizedAt, setAuthorizedAt] = useState(auth?.authorizedAt ? String(auth.authorizedAt).slice(0, 10) : '')
    const [authNote, setAuthNote] = useState(auth?.note || '')

    // Visor de recorrido
    const [viewerOpen, setViewerOpen] = useState(false)
    const [viewerImg, setViewerImg] = useState('')

    useEffect(() => {
        setBranchId(person?.branchId?._id || person?.branchId || '')
        setIsAuthorized(Boolean(auth?.isAuthorized))
        setAuthorizedAt(auth?.authorizedAt ? String(auth.authorizedAt).slice(0, 10) : '')
        setAuthNote(auth?.note || '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [person?._id])

    const loadRefs = async () => {
        try {
            const { data } = await PeopleAPI.list({ page: 1, limit: 200, active: 'true' })
            setPeople(data.items || [])
        } catch {
            setPeople([])
        }

        try {
            const { data } = await api.get(`${API_PREFIX}/vehicles`, { params: { page: 1, limit: 200, active: 'true' } })
            setVehicles(data.items || [])
        } catch {
            setVehicles([])
        }
    }

    const load = async () => {
        if (!person?._id) return
        try {
            const { data } = await DrivingTestsAPI.list({ page: 1, limit: 200, personId: person._id })
            setItems(data.items || [])
        } catch (err) {
            console.error(err)
            setItems([])
        }
    }

    useEffect(() => {
        loadRefs()
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [person?._id])

    const onFinish = async (payload) => {
        if (!person?._id) return

        if (!branchId) return alert('Sucursal es obligatoria')
        if (!examinerId) return alert('Examinador es obligatorio')
        if (!vehicleId) return alert('Vehículo es obligatorio')

        try {
            const { data } = await DrivingTestsAPI.create({
                personId: person._id,
                branchId,
                examinerId,
                vehicleId,
                notes,
                ...payload, // incluye track + mapSnapshotDataUrl desde MapRecorder
            })
            setItems((prev) => [data.item, ...prev])
            setNotes('')
        } catch (err) {
            console.error(err)
            alert(err?.response?.data?.message || 'No fue posible guardar la prueba')
        }
    }

    const remove = async (id) => {
        if (!person?._id) return
        const ok = window.confirm('¿Eliminar prueba?')
        if (!ok) return
        try {
            await DrivingTestsAPI.remove(id)
            setItems((prev) => prev.filter((x) => x._id !== id))
        } catch (err) {
            console.error(err)
            alert('No fue posible eliminar')
        }
    }

    const saveAuthorization = async () => {
        if (!person?._id) return
        setAuthSaving(true)
        try {
            await PeopleAPI.update(person._id, {
                driverAuthorization: {
                    isAuthorized,
                    authorizedAt: authorizedAt || null,
                    note: authNote || '',
                },
            })
            // recargamos persona para asegurar consistencia
            await onPersonReload?.()
        } catch (err) {
            console.error(err)
            alert(err?.response?.data?.message || 'No fue posible guardar autorización')
        } finally {
            setAuthSaving(false)
        }
    }

    const openRoute = (it) => {
        const img = it?.mapSnapshotUrl || it?.mapSnapshotDataUrl || ''
        if (!img) return alert('Esta prueba no tiene imagen de recorrido')
        setViewerImg(img)
        setViewerOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="border rounded p-4">
                <div className="text-sm font-medium mb-2">Autorización de conducción</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-sm">
                        <div className="text-gray-600 mb-1">Estado</div>
                        <div className="flex gap-3 items-center">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="driverAuth"
                                    checked={isAuthorized === true}
                                    onChange={() => setIsAuthorized(true)}
                                />
                                Conductor autorizado
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="driverAuth"
                                    checked={isAuthorized === false}
                                    onChange={() => setIsAuthorized(false)}
                                />
                                Conductor no autorizado
                            </label>
                        </div>
                    </div>

                    <label className="text-sm">
                        <div className="text-gray-600 mb-1">Fecha de autorización</div>
                        <input
                            type="date"
                            className="border rounded px-3 py-2 w-full"
                            value={authorizedAt}
                            onChange={(e) => setAuthorizedAt(e.target.value)}
                        />
                    </label>

                    <label className="text-sm md:col-span-3">
                        <div className="text-gray-600 mb-1">Observación</div>
                        <textarea
                            className="border rounded px-3 py-2 w-full"
                            rows={3}
                            value={authNote}
                            onChange={(e) => setAuthNote(e.target.value)}
                            placeholder="Ej: sanción, condicionantes, observaciones de RRHH…"
                        />
                    </label>
                </div>

                <div className="mt-3">
                    <button
                        type="button"
                        className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
                        onClick={saveAuthorization}
                        disabled={authSaving}
                    >
                        Guardar autorización
                    </button>
                </div>
            </div>

            <div className="border rounded p-4">
                <div className="text-sm font-medium mb-2">Registrar prueba de conducción</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="text-sm">
                        <div className="text-gray-600 mb-1">Sucursal</div>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                        >
                            <option value="">— Selecciona sucursal —</option>
                            {branches.map((b) => (
                                <option key={b._id} value={b._id}>
                                    {b.code} — {b.name}
                                </option>
                            ))}
                        </select>
                    </label>

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

                    <label className="text-sm md:col-span-3">
                        <div className="text-gray-600 mb-1">Observaciones</div>
                        <textarea className="w-full border rounded px-3 py-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </label>
                </div>

                <div className="mt-3">
                    <MapRecorder onFinish={onFinish} />
                </div>
            </div>

            <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-2">Fecha</th>
                            <th className="text-left p-2">Vehículo</th>
                            <th className="text-left p-2">Distancia</th>
                            <th className="text-left p-2">Duración</th>
                            <th className="text-left p-2 w-56">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it) => (
                            <tr key={it._id} className="border-t">
                                <td className="p-2">{it.startedAt ? String(it.startedAt).slice(0, 10) : '—'}</td>
                                <td className="p-2">{it.vehicleId?.plate || it.vehicleId?.code || it.vehicleId?.name || '—'}</td>
                                <td className="p-2">{it.distanceKm || 0} km</td>
                                <td className="p-2">{it.durationSec || 0} s</td>
                                <td className="p-2 flex flex-wrap gap-2">
                                    <button type="button" className="px-2 py-1 border rounded" onClick={() => openRoute(it)}>
                                        Ver recorrido
                                    </button>
                                    <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(it._id)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!items.length && (
                            <tr><td className="p-3 text-gray-500" colSpan="5">Sin pruebas registradas</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {viewerOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setViewerOpen(false)}>
                    <div className="bg-white rounded-xl shadow max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 border-b">
                            <div className="font-medium">Recorrido</div>
                            <button className="px-2 py-1 border rounded" onClick={() => setViewerOpen(false)}>Cerrar</button>
                        </div>
                        <div className="p-3">
                            <img src={viewerImg} alt="Recorrido" className="w-full h-auto rounded border" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
