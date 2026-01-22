// import { useEffect, useMemo, useState } from 'react'
// import { DrivingTestsAPI } from '../../../api/drivingTests.api'
// import { PeopleAPI } from '../../../api/people.api'
// import { api, API_PREFIX } from '../../../services/http'
// import ExaminerSelect from '../../../components/DrivingTests/ExaminerSelect'
// import MapRecorder from '../../../components/DrivingTests/MapRecorder'

// export default function DrivingTestsTab({ person, onPersonReload }) {
//   const [items, setItems] = useState([])
//   const [people, setPeople] = useState([])
//   const [vehicles, setVehicles] = useState([])
//   const [branches, setBranches] = useState([])
//   const [branchId, setBranchId] = useState(person?.branchId?._id || person?.branchId || '')

//   const [examinerId, setExaminerId] = useState('')
//   const [vehicleId, setVehicleId] = useState('')
//   const [notes, setNotes] = useState('')

//   // Autorización (persona)
//   const [authSaving, setAuthSaving] = useState(false)
//   const auth = useMemo(() => person?.driverAuthorization || {}, [person])
//   const [isAuthorized, setIsAuthorized] = useState(Boolean(auth?.isAuthorized))
//   const [authorizedAt, setAuthorizedAt] = useState(auth?.authorizedAt ? String(auth.authorizedAt).slice(0, 10) : '')
//   const [authNote, setAuthNote] = useState(auth?.note || '')

//   // Visor recorrido
//   const [viewerOpen, setViewerOpen] = useState(false)
//   const [viewerImg, setViewerImg] = useState('')

//   useEffect(() => {
//     setBranchId(person?.branchId?._id || person?.branchId || '')
//     setIsAuthorized(Boolean(auth?.isAuthorized))
//     setAuthorizedAt(auth?.authorizedAt ? String(auth.authorizedAt).slice(0, 10) : '')
//     setAuthNote(auth?.note || '')
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [person?._id])

//   const loadRefs = async () => {
//     // People (examinadores)
//     try {
//       const { data } = await PeopleAPI.list({ page: 1, limit: 200, active: 'true' })
//       setPeople(data?.items || [])
//     } catch {
//       setPeople([])
//     }

//     // Vehicles
//     try {
//       const { data } = await api.get(`${API_PREFIX}/vehicles`, { params: { page: 1, limit: 200, active: 'true' } })
//       setVehicles(data?.items || [])
//     } catch {
//       setVehicles([])
//     }

//     // Branches
//     try {
//       const { data } = await api.get(`${API_PREFIX}/branches`, { params: { page: 1, limit: 500, active: 'true' } })
//       const list = data?.items || data?.data?.items || data?.data || data?.list || []
//       const sorted = [...list].sort((a, b) => {
//         const ac = (a?.code || '').toString()
//         const bc = (b?.code || '').toString()
//         if (ac && bc && ac !== bc) return ac.localeCompare(bc, undefined, { numeric: true })
//         return (a?.name || '').toString().localeCompare((b?.name || '').toString(), undefined, { numeric: true })
//       })
//       setBranches(sorted)
//     } catch {
//       setBranches([])
//     }
//   }

//   const load = async () => {
//     if (!person?._id) return
//     try {
//       const { data } = await DrivingTestsAPI.list({ page: 1, limit: 200, personId: person._id })
//       setItems(data?.items || [])
//     } catch (err) {
//       console.error(err)
//       setItems([])
//     }
//   }

//   useEffect(() => {
//     loadRefs()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   useEffect(() => {
//     load()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [person?._id])

//   const onFinish = async (payload) => {
//     if (!person?._id) return

//     if (!branchId) return alert('Sucursal es obligatoria')
//     if (!examinerId) return alert('Examinador es obligatorio')
//     if (!vehicleId) return alert('Vehículo es obligatorio')

//     try {
//       const { data } = await DrivingTestsAPI.create({
//         personId: person._id,
//         branchId,
//         examinerId,
//         vehicleId,
//         notes,
//         ...payload, // incluye track + mapSnapshotDataUrl desde MapRecorder
//       })

//       setItems((prev) => [data?.item, ...prev].filter(Boolean))
//       setNotes('')
//     } catch (err) {
//       console.error(err)
//       alert(err?.response?.data?.message || 'No fue posible guardar la prueba')
//     }
//   }

//   const remove = async (id) => {
//     if (!person?._id) return
//     const ok = window.confirm('¿Eliminar prueba?')
//     if (!ok) return
//     try {
//       await DrivingTestsAPI.remove(id)
//       setItems((prev) => prev.filter((x) => x._id !== id))
//     } catch (err) {
//       console.error(err)
//       alert('No fue posible eliminar')
//     }
//   }

//   const saveAuthorization = async () => {
//     if (!person?._id) return
//     setAuthSaving(true)
//     try {
//       await PeopleAPI.update(person._id, {
//         driverAuthorization: {
//           isAuthorized,
//           authorizedAt: authorizedAt || null,
//           note: authNote || '',
//         },
//       })
//       await onPersonReload?.()
//     } catch (err) {
//       console.error(err)
//       alert(err?.response?.data?.message || 'No fue posible guardar autorización')
//     } finally {
//       setAuthSaving(false)
//     }
//   }

//   const openRoute = (it) => {
//     const img = it?.mapSnapshotUrl || it?.mapSnapshotDataUrl || ''
//     if (!img) return alert('Esta prueba no tiene imagen de recorrido')
//     setViewerImg(img)
//     setViewerOpen(true)
//   }

//   return (
//     <div className="space-y-4">
//       {/* Autorización */}
//       <div className="border rounded p-4">
//         <div className="text-sm font-medium mb-2">Autorización de conducción</div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//           <div className="text-sm">
//             <div className="text-gray-600 mb-1">Estado</div>
//             <div className="flex gap-3 items-center">
//               <label className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   name="driverAuth"
//                   checked={isAuthorized === true}
//                   onChange={() => setIsAuthorized(true)}
//                 />
//                 Conductor autorizado
//               </label>
//               <label className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   name="driverAuth"
//                   checked={isAuthorized === false}
//                   onChange={() => setIsAuthorized(false)}
//                 />
//                 Conductor no autorizado
//               </label>
//             </div>
//           </div>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Fecha de autorización</div>
//             <input
//               type="date"
//               className="border rounded px-3 py-2 w-full"
//               value={authorizedAt}
//               onChange={(e) => setAuthorizedAt(e.target.value)}
//             />
//           </label>

//           <label className="text-sm md:col-span-3">
//             <div className="text-gray-600 mb-1">Observación</div>
//             <textarea
//               className="border rounded px-3 py-2 w-full"
//               rows={3}
//               value={authNote}
//               onChange={(e) => setAuthNote(e.target.value)}
//               placeholder="Ej: sanción, condicionantes, observaciones de RRHH…"
//             />
//           </label>
//         </div>

//         <div className="mt-3">
//           <button
//             type="button"
//             className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
//             onClick={saveAuthorization}
//             disabled={authSaving}
//           >
//             Guardar autorización
//           </button>
//         </div>
//       </div>

//       {/* Registrar prueba */}
//       <div className="border rounded p-4">
//         <div className="text-sm font-medium mb-2">Registrar prueba de conducción</div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Sucursal</div>
//             <select
//               className="w-full border rounded px-3 py-2"
//               value={branchId}
//               onChange={(e) => setBranchId(e.target.value)}
//             >
//               <option value="">— Selecciona sucursal —</option>
//               {branches.map((b) => (
//                 <option key={b._id} value={b._id}>
//                   {b.code} — {b.name}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <div>
//             <div className="text-sm text-gray-600 mb-1">Examinador</div>
//             <ExaminerSelect people={people} value={examinerId} onChange={setExaminerId} />
//           </div>

//           <div>
//             <div className="text-sm text-gray-600 mb-1">Vehículo</div>
//             <select
//               className="w-full border rounded px-3 py-2"
//               value={vehicleId}
//               onChange={(e) => setVehicleId(e.target.value)}
//             >
//               <option value="">— Selecciona vehículo —</option>
//               {vehicles.map((v) => (
//                 <option key={v._id} value={v._id}>
//                   {v.plate || v.code || v.name || v._id}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <label className="text-sm md:col-span-3">
//             <div className="text-gray-600 mb-1">Observaciones</div>
//             <textarea
//               className="w-full border rounded px-3 py-2"
//               rows={3}
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//             />
//           </label>
//         </div>

//         <div className="mt-3">
//           <MapRecorder onFinish={onFinish} />
//         </div>
//       </div>

//       {/* Tabla */}
//       <div className="border rounded overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="text-left p-2">Fecha</th>
//               <th className="text-left p-2">Vehículo</th>
//               <th className="text-left p-2">Distancia</th>
//               <th className="text-left p-2">Duración</th>
//               <th className="text-left p-2 w-56">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((it) => (
//               <tr key={it._id} className="border-t">
//                 <td className="p-2">{it.startedAt ? String(it.startedAt).slice(0, 10) : '—'}</td>
//                 <td className="p-2">{it.vehicleId?.plate || it.vehicleId?.code || it.vehicleId?.name || '—'}</td>
//                 <td className="p-2">{it.distanceKm || 0} km</td>
//                 <td className="p-2">{it.durationSec || 0} s</td>
//                 <td className="p-2 flex flex-wrap gap-2">
//                   <button type="button" className="px-2 py-1 border rounded" onClick={() => openRoute(it)}>
//                     Ver recorrido
//                   </button>
//                   <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(it._id)}>
//                     Eliminar
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {!items.length && (
//               <tr>
//                 <td className="p-3 text-gray-500" colSpan="5">
//                   Sin pruebas registradas
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal visor */}
//       {viewerOpen && (
//         <div
//           className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
//           onClick={() => setViewerOpen(false)}
//         >
//           <div
//             className="bg-white rounded-xl shadow max-w-3xl w-full overflow-hidden"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between p-3 border-b">
//               <div className="font-medium">Recorrido</div>
//               <button className="px-2 py-1 border rounded" onClick={() => setViewerOpen(false)}>
//                 Cerrar
//               </button>
//             </div>
//             <div className="p-3">
//               <img src={viewerImg} alt="Recorrido" className="w-full h-auto rounded border" />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


//V220126
import { useEffect, useMemo, useState } from 'react'
import { DrivingTestsAPI } from '../../../api/drivingTests.api'
import { PeopleAPI } from '../../../api/people.api'
import { api, API_PREFIX } from '../../../services/http'
import MapRecorder from '../../../components/DrivingTests/MapRecorder'
import { useAppStore } from '../../../store/useAppStore'

const hasRole = (user, role) => {
  const needle = String(role || '').toUpperCase()
  const roles = Array.isArray(user?.roles) ? user.roles : []
  return roles.some((r) => String(r).toUpperCase() === needle)
}

export default function DrivingTestsTab({ person, onPersonReload }) {
  const user = useAppStore((s) => s.user)
  const canOperate = hasRole(user, 'ADMIN') || hasRole(user, 'EXAMINADOR')

  const [items, setItems] = useState([])
  const [people, setPeople] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState(person?.branchId?._id || person?.branchId || '')

  const [examinerId, setExaminerId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [notes, setNotes] = useState('')

  // Autorización (persona)
  const [authSaving, setAuthSaving] = useState(false)
  const auth = useMemo(() => person?.driverAuthorization || {}, [person])
  const [isAuthorized, setIsAuthorized] = useState(Boolean(auth?.isAuthorized))
  const [authorizedAt, setAuthorizedAt] = useState(auth?.authorizedAt ? String(auth.authorizedAt).slice(0, 10) : '')
  const [authNote, setAuthNote] = useState(auth?.note || '')

  // Visor recorrido
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerImg, setViewerImg] = useState('')

  const examinerPerson = useMemo(() => {
    if (!user?._id) return null
    return people.find((p) => {
      const uid = p?.userId?._id || p?.userId
      return uid && String(uid) === String(user._id)
    }) || null
  }, [people, user?._id])

  useEffect(() => {
    if (examinerPerson?._id) {
      setExaminerId(examinerPerson._id)
    }
  }, [examinerPerson?._id])

  useEffect(() => {
    setBranchId(person?.branchId?._id || person?.branchId || '')
    setIsAuthorized(Boolean(auth?.isAuthorized))
    setAuthorizedAt(auth?.authorizedAt ? String(auth.authorizedAt).slice(0, 10) : '')
    setAuthNote(auth?.note || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?._id])

  const loadRefs = async () => {
    // People (examinadores)
    try {
      const { data } = await PeopleAPI.list({ page: 1, limit: 200, active: 'true' })
      setPeople(data?.items || [])
    } catch {
      setPeople([])
    }

    // Vehicles
    try {
      const { data } = await api.get(`${API_PREFIX}/vehicles`, { params: { page: 1, limit: 200, active: 'true' } })
      setVehicles(data?.items || [])
    } catch {
      setVehicles([])
    }

    // Branches
    try {
      const { data } = await api.get(`${API_PREFIX}/branches`, { params: { page: 1, limit: 500, active: 'true' } })
      const list = data?.items || data?.data?.items || data?.data || data?.list || []
      const sorted = [...list].sort((a, b) => {
        const ac = (a?.code || '').toString()
        const bc = (b?.code || '').toString()
        if (ac && bc && ac !== bc) return ac.localeCompare(bc, undefined, { numeric: true })
        return (a?.name || '').toString().localeCompare((b?.name || '').toString(), undefined, { numeric: true })
      })
      setBranches(sorted)
    } catch {
      setBranches([])
    }
  }

  const load = async () => {
    if (!person?._id) return
    try {
      const { data } = await DrivingTestsAPI.list({ page: 1, limit: 200, personId: person._id })
      setItems(data?.items || [])
    } catch (err) {
      console.error(err)
      setItems([])
    }
  }

  useEffect(() => {
    loadRefs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Examinador: por requerimiento, es el usuario logueado con rol EXAMINADOR.
  // Mapeamos al registro Person asociado (person.userId == user._id).
  useEffect(() => {
    if (examinerPerson?._id) setExaminerId(examinerPerson._id)
  }, [examinerPerson?._id])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?._id])

  const onFinish = async (payload) => {
    if (!person?._id) return

    if (!canOperate) {
      alert('No tienes permisos para registrar/autorizar pruebas. Requiere rol ADMIN o EXAMINADOR.')
      return
    }

    if (!branchId) return alert('Sucursal es obligatoria')
    if (!examinerId) return alert('No se encontró el perfil Person del examinador (usuario logueado). Asocia el usuario a un registro de Persona.')
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

      setItems((prev) => [data?.item, ...prev].filter(Boolean))
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
    if (!canOperate) {
      alert('No autorizado. Requiere rol ADMIN o EXAMINADOR.')
      return
    }

    const ok = window.confirm('¿Está seguro de guardar la aprobación/autorización?')
    if (!ok) return
    setAuthSaving(true)
    try {
      await PeopleAPI.update(person._id, {
        driverAuthorization: {
          isAuthorized,
          authorizedAt: authorizedAt || null,
          note: authNote || '',
        },
      })
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
      {!canOperate && (
        <div className="border border-amber-200 bg-amber-50 text-amber-800 rounded p-3 text-sm">
          Este apartado está deshabilitado. Requiere rol <b>ADMIN</b> o <b>EXAMINADOR</b>.
        </div>
      )}
      {/* Autorización */}
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
                  disabled={!canOperate}
                />
                Conductor autorizado
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="driverAuth"
                  checked={isAuthorized === false}
                  onChange={() => setIsAuthorized(false)}
                  disabled={!canOperate}
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
              disabled={!canOperate}
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
              disabled={!canOperate}
            />
          </label>
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="px-3 py-2 text-white rounded-md disabled:opacity-50"
            style={{ background: 'var(--fc-primary)' }}
            onClick={saveAuthorization}
            disabled={authSaving || !canOperate}
          >
            Guardar autorización
          </button>
        </div>
      </div>

      {/* Registrar prueba */}
      <div className="border rounded p-4">
        <div className="text-sm font-medium mb-2">Registrar prueba de conducción</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm">
            <div className="text-gray-600 mb-1">Sucursal</div>
            <select
              className="w-full border rounded px-3 py-2"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={!canOperate}
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
            <div className="text-sm text-gray-600 mb-1">Examinador (usuario actual)</div>
            <div className="border rounded px-3 py-2 text-sm bg-white">
              {user?.name || user?.email || '—'}
            </div>
            {!examinerPerson && canOperate && (
              <div className="text-xs text-amber-700 mt-1">
                No se encontró una persona asociada a este usuario (Person.userId). Crea/asocia el registro de persona del examinador.
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Vehículo</div>
            <select
              className="w-full border rounded px-3 py-2"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              disabled={!canOperate}
            >
              <option value="">— Selecciona vehículo —</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.plate || v.code || v.name || v._id}
                </option>
              ))}
            </select>
          </div>

          <label className="text-sm md:col-span-3">
            <div className="text-gray-600 mb-1">Observaciones</div>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!canOperate}
            />
          </label>
        </div>

        <div className="mt-3">
          {canOperate ? (
            <MapRecorder onFinish={onFinish} />
          ) : (
            <div className="text-sm text-gray-500">MapRecorder deshabilitado por permisos.</div>
          )}
        </div>
      </div>

      {/* Tabla */}
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
              <tr>
                <td className="p-3 text-gray-500" colSpan="5">
                  Sin pruebas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal visor */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setViewerOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow max-w-3xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b">
              <div className="font-medium">Recorrido</div>
              <button className="px-2 py-1 border rounded" onClick={() => setViewerOpen(false)}>
                Cerrar
              </button>
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


// version fallida  220126+

// // front/src/pages/People/tabs/DrivingTestsTab.jsx
// // -----------------------------------------------------------------------------
// // RRHH - Pruebas de Conducción + Autorización de Conductor
// // Requisitos clave:
// // - Autorización: botón Guardar habilitado sólo con cambios y validación de info completa
// // - Historial: mostrar driverAuthorizationHistory con fecha, autorizador, estado inicial/final
// // - Prueba de ruta: sólo rol EXAMINER (front: "Examinador"); si no, vista únicamente
// // - MapRecorder: cronómetro + pre-chequeos + seguro anti-interrupción (lo gestiona el componente)
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import MapRecorder from '../../../components/DrivingTests/MapRecorder'
// import { useAppStore } from '../../../store/useAppStore'
// import { PeopleAPI } from '../../../api/people.api'
// import { DrivingTestsAPI } from '../../../api/drivingTests.api'

// const UPPER = (arr) => (Array.isArray(arr) ? arr.map((r) => String(r || '').toUpperCase()) : [])

// function hasAnyRole(roles, ...needles) {
//   const r = new Set(UPPER(roles))
//   return needles.some((n) => r.has(String(n || '').toUpperCase()))
// }

// function isoDate(d) {
//   if (!d) return ''
//   try {
//     const x = new Date(d)
//     if (Number.isNaN(x.getTime())) return ''
//     return x.toISOString().slice(0, 10)
//   } catch {
//     return ''
//   }
// }

// export default function DrivingTestsTab({ person }) {
//   const user = useAppStore((s) => s.user)
//   const roles = user?.roles || []

//   const personId = person?._id
//   const branchId = person?.branchId?._id || person?.branchId || ''

//   // Roles
//   const isAdmin = hasAnyRole(roles, 'ADMIN', 'SUPERADMIN', 'GLOBAL')
//   const isExaminer = hasAnyRole(roles, 'EXAMINER')
//   const canEditAuthorization = isAdmin || isExaminer
//   const canRunDrivingTest = isExaminer // requisito

//   // Autorización de conductor (draft local)
//   const currentAuth = person?.driverAuthorization || { isAuthorized: false, authorizedAt: null, note: '' }
//   const [authDraft, setAuthDraft] = useState({
//     isAuthorized: Boolean(currentAuth.isAuthorized),
//     authorizedAt: isoDate(currentAuth.authorizedAt),
//     note: currentAuth.note || '',
//   })

//   // Carga de pruebas (backend)
//   const [tests, setTests] = useState([])
//   const [loading, setLoading] = useState(false)

//   // Estado de prueba activa
//   const [activeTestId, setActiveTestId] = useState(null)

//   // Historial (con fallback a person)
//   const authHistory = useMemo(() => {
//     const h = Array.isArray(person?.driverAuthorizationHistory) ? person.driverAuthorizationHistory : []
//     return [...h].sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())
//   }, [person?.driverAuthorizationHistory])

//   const authDirty = useMemo(() => {
//     const curDate = isoDate(currentAuth.authorizedAt)
//     return (
//       Boolean(authDraft.isAuthorized) !== Boolean(currentAuth.isAuthorized) ||
//       (authDraft.authorizedAt || '') !== (curDate || '') ||
//       (authDraft.note || '') !== (currentAuth.note || '')
//     )
//   }, [authDraft, currentAuth])

//   // Flag global de cambios sin aplicar (para bloqueo navegación)
//   useEffect(() => {
//     if (!canEditAuthorization) return
//     if (authDirty) window.__FLEETCORE_UNSAVED__ = true
//     else if (!activeTestId) window.__FLEETCORE_UNSAVED__ = false
//   }, [authDirty, canEditAuthorization, activeTestId])

//   useEffect(() => {
//     // Si cambia person, resetea draft
//     setAuthDraft({
//       isAuthorized: Boolean(currentAuth.isAuthorized),
//       authorizedAt: isoDate(currentAuth.authorizedAt),
//       note: currentAuth.note || '',
//     })
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [personId])

//   const loadTests = async () => {
//     if (!personId) return
//     setLoading(true)
//     try {
//       const { items } = await DrivingTestsAPI.list({ page: 1, limit: 200, personId })
//       setTests(items || [])
//     } catch (err) {
//       console.error(err)
//       // sin alert aquí para no ser invasivo
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadTests()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [personId])

//   const saveAuthorization = async () => {
//     if (!personId) return
//     if (!canEditAuthorization) return

//     if (!authDirty) {
//       alert('La información está incompleta o no presenta cambios para guardar.')
//       return
//     }

//     // Validación mínima: si autoriza, debe existir fecha
//     if (authDraft.isAuthorized && !authDraft.authorizedAt) {
//       alert('Debe indicar la fecha de autorización.')
//       return
//     }

//     const sure = window.confirm('¿Está seguro de guardar la autorización de conductor?')
//     if (!sure) return

//     setLoading(true)
//     try {
//       const payload = {
//         driverAuthorization: {
//           isAuthorized: Boolean(authDraft.isAuthorized),
//           authorizedAt: authDraft.authorizedAt || null,
//           note: authDraft.note || '',
//         },
//       }
//       const { item } = await PeopleAPI.update(personId, payload)

//       alert('Actualización con éxito')

//       // Refresh local draft & clean dirty flag
//       setAuthDraft({
//         isAuthorized: Boolean(item?.driverAuthorization?.isAuthorized),
//         authorizedAt: isoDate(item?.driverAuthorization?.authorizedAt),
//         note: item?.driverAuthorization?.note || '',
//       })
//       window.__FLEETCORE_UNSAVED__ = false
//     } catch (err) {
//       console.error(err)
//       alert(err?.response?.data?.message || 'No fue posible guardar la autorización')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const startTest = async () => {
//     if (!personId) return
//     if (!canRunDrivingTest) {
//       alert('No autorizado como examinador.')
//       return
//     }

//     const sure = window.confirm('¿Iniciar una nueva prueba de ruta?')
//     if (!sure) return

//     setLoading(true)
//     try {
//       const { item } = await DrivingTestsAPI.start({ personId, branchId })
//       setActiveTestId(item?._id || null)
//       await loadTests()
//     } catch (err) {
//       console.error(err)
//       if (err?.response?.status === 403) {
//         alert('No autorizado como examinador.')
//       } else {
//         alert(err?.response?.data?.message || 'No fue posible iniciar la prueba')
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const finishTest = async (payload) => {
//     if (!activeTestId) return
//     if (!canRunDrivingTest) return

//     setLoading(true)
//     try {
//       await DrivingTestsAPI.finish(activeTestId, payload)
//       alert('Prueba de ruta finalizada con éxito')
//       setActiveTestId(null)
//       window.__FLEETCORE_UNSAVED__ = false
//       await loadTests()
//     } catch (err) {
//       console.error(err)
//       if (err?.response?.status === 403) {
//         alert('No autorizado como examinador.')
//       } else {
//         alert(err?.response?.data?.message || 'No fue posible finalizar la prueba')
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const removeTest = async (id) => {
//     const ok = window.confirm('¿Eliminar registro de prueba?')
//     if (!ok) return
//     setLoading(true)
//     try {
//       await DrivingTestsAPI.remove(id)
//       alert('Registro eliminado con éxito')
//       await loadTests()
//     } catch (err) {
//       console.error(err)
//       alert(err?.response?.data?.message || 'No fue posible eliminar')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-4">
//       {/* Autorización */}
//       <div className="border rounded p-4 space-y-3">
//         <div className="flex items-center justify-between">
//           <div>
//             <div className="text-sm text-gray-600">Autorización de conductor</div>
//             <div className="text-xs text-gray-500">
//               {canEditAuthorization ? 'Puede editar y guardar cambios.' : 'Modo vista.'}
//             </div>
//           </div>

//           <button
//             type="button"
//             className="px-3 py-2 rounded text-sm text-white disabled:opacity-50"
//             style={{ background: 'var(--fc-primary)' }}
//             onClick={saveAuthorization}
//             disabled={loading || !canEditAuthorization || !authDirty}
//           >
//             Guardar autorización
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Estado</div>
//             <select
//               className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//               value={authDraft.isAuthorized ? 'true' : 'false'}
//               onChange={(e) => setAuthDraft((s) => ({ ...s, isAuthorized: e.target.value === 'true' }))}
//               disabled={!canEditAuthorization || loading}
//             >
//               <option value="false">No autorizado</option>
//               <option value="true">Autorizado</option>
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Fecha</div>
//             <input
//               type="date"
//               className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//               value={authDraft.authorizedAt}
//               onChange={(e) => setAuthDraft((s) => ({ ...s, authorizedAt: e.target.value }))}
//               disabled={!canEditAuthorization || loading}
//             />
//           </label>

//           <label className="text-sm md:col-span-2">
//             <div className="text-gray-600 mb-1">Observación</div>
//             <input
//               className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//               value={authDraft.note}
//               onChange={(e) => setAuthDraft((s) => ({ ...s, note: e.target.value }))}
//               disabled={!canEditAuthorization || loading}
//             />
//           </label>
//         </div>
//       </div>

//       {/* Prueba de ruta */}
//       <div className="border rounded p-4 space-y-3">
//         <div className="flex items-center justify-between">
//           <div>
//             <div className="text-sm text-gray-600">Prueba de ruta</div>
//             <div className="text-xs text-gray-500">
//               {canRunDrivingTest ? 'Perfil: Examinador.' : 'Modo vista (requiere rol EXAMINER).'}
//             </div>
//           </div>

//           <button
//             type="button"
//             className="px-3 py-2 rounded text-sm text-white disabled:opacity-50"
//             style={{ background: 'var(--fc-primary)' }}
//             onClick={startTest}
//             disabled={loading || !personId || Boolean(activeTestId) || !canRunDrivingTest}
//             title={!canRunDrivingTest ? 'No autorizado como Examinador' : ''}
//           >
//             Iniciar prueba
//           </button>
//         </div>

//         {/* Recorder: controla reiniciar/finalizar internamente */}
//         {activeTestId ? (
//           <MapRecorder
//             onFinish={finishTest}
//             disabled={!canRunDrivingTest}
//             disabledReason="No autorizado como Examinador."
//           />
//         ) : (
//           <div className="text-sm text-gray-500">
//             {loading ? 'Cargando...' : 'No hay una prueba en curso.'}
//           </div>
//         )}
//       </div>

//       {/* Listado de pruebas registradas */}
//       <div className="border rounded p-4 space-y-2">
//         <div className="text-sm text-gray-600">Pruebas registradas</div>
//         <div className="overflow-x-auto border rounded">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-50 text-gray-600">
//               <tr>
//                 <th className="text-left px-3 py-2">Fecha</th>
//                 <th className="text-left px-3 py-2">Estado</th>
//                 <th className="text-left px-3 py-2">Duración</th>
//                 <th className="text-right px-3 py-2">Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tests.length === 0 ? (
//                 <tr>
//                   <td className="px-3 py-4 text-gray-500" colSpan={4}>
//                     (Sin registros)
//                   </td>
//                 </tr>
//               ) : (
//                 tests.map((t) => (
//                   <tr key={t._id} className="border-t">
//                     <td className="px-3 py-2">{isoDate(t.startedAt) || isoDate(t.createdAt) || '-'}</td>
//                     <td className="px-3 py-2">{t.status || '-'}</td>
//                     <td className="px-3 py-2">{typeof t.durationSec === 'number' ? `${t.durationSec}s` : '-'}</td>
//                     <td className="px-3 py-2 text-right">
//                       <button
//                         type="button"
//                         className="px-3 py-1.5 rounded border text-sm"
//                         onClick={() => removeTest(t._id)}
//                         disabled={loading}
//                       >
//                         Eliminar
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Historial autorización */}
//       <div className="border rounded p-4 space-y-2">
//         <div className="text-sm text-gray-600">Historial de autorización</div>
//         <div className="overflow-x-auto border rounded">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-50 text-gray-600">
//               <tr>
//                 <th className="text-left px-3 py-2">Fecha</th>
//                 <th className="text-left px-3 py-2">Autorizador</th>
//                 <th className="text-left px-3 py-2">Estado inicial</th>
//                 <th className="text-left px-3 py-2">Estado final</th>
//                 <th className="text-left px-3 py-2">Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {authHistory.length === 0 ? (
//                 <tr>
//                   <td className="px-3 py-4 text-gray-500" colSpan={5}>
//                     (Sin historial)
//                   </td>
//                 </tr>
//               ) : (
//                 authHistory.map((h) => (
//                   <tr key={h._id || String(h.at)} className="border-t">
//                     <td className="px-3 py-2">{isoDate(h.at) || '-'}</td>
//                     <td className="px-3 py-2">{h.authorizedByName || '-'}</td>
//                     <td className="px-3 py-2">
//                       {h.from?.isAuthorized ? 'Autorizado' : 'No autorizado'}{' '}
//                       {h.from?.authorizedAt ? `(${isoDate(h.from.authorizedAt)})` : ''}
//                     </td>
//                     <td className="px-3 py-2">
//                       {h.to?.isAuthorized ? 'Autorizado' : 'No autorizado'}{' '}
//                       {h.to?.authorizedAt ? `(${isoDate(h.to.authorizedAt)})` : ''}
//                     </td>
//                     <td className="px-3 py-2">{h.to?.note || h.from?.note ? 'Observación' : '-'}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }
