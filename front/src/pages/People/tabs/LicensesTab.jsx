// import { useMemo, useState } from 'react'
// import { PeopleAPI } from '../../../api/people.api'

// const LICENSE_TYPES = ['C', 'B', 'A4', 'A5', 'A2', 'A2*', 'A1', 'A1*', 'A3', 'D', 'E', 'F']

// const toISODate = (v) => (v ? String(v).slice(0, 10) : '')

// export default function LicensesTab({ person, onChange }) {
//   const licenses = useMemo(() => (Array.isArray(person?.licenses) ? person.licenses : []), [person])

//   const [form, setForm] = useState({
//     type: '',
//     folioNumber: '',
//     issuer: '',
//     firstIssuedAt: '',
//     issuedAt: '',
//     nextControlAt: '',
//   })

//   const reset = () =>
//     setForm({ type: '', folioNumber: '', issuer: '', firstIssuedAt: '', issuedAt: '', nextControlAt: '' })

//   const addOrUpdate = async () => {
//     if (!person?._id) return alert('Primero guarda la persona')
//     if (!form.type) return alert('Tipo/clase es obligatorio')

//     const existing = licenses.find((l) => String(l.type || '').toUpperCase() === form.type)
//     const payload = {
//       // Nuevos campos
//       type: form.type,
//       folioNumber: form.folioNumber || null,
//       issuer: form.issuer || null,
//       firstIssuedAt: form.firstIssuedAt || null,
//       issuedAt: form.issuedAt || null,
//       nextControlAt: form.nextControlAt || null,

//       // Compatibilidad legacy (si tu backend aún lo usa)
//       number: form.folioNumber || null,
//       issueDate: form.issuedAt || null,
//       expiryDate: form.nextControlAt || null,
//     }

//     if (existing?._id) {
//       const ok = window.confirm(
//         `La licencia tipo ${form.type} ya existe. ¿Deseas modificarla con estos datos?`
//       )
//       if (!ok) return

//       const { data } = await PeopleAPI.updateLicense(person._id, existing._id, payload)
//       const updated = data?.item || data
//       onChange?.((prev) => ({
//         ...prev,
//         licenses: (prev.licenses || []).map((x) => (x._id === existing._id ? updated : x)),
//       }))
//       reset()
//       return
//     }

//     const { data } = await PeopleAPI.addLicense(person._id, payload)
//     const created = data?.item || data
//     onChange?.((prev) => ({ ...prev, licenses: [...licenses, created] }))
//     reset()
//   }

//   const updateRow = async (licenseId, patch, { propagateIssuedAt = false } = {}) => {
//     if (!person?._id) return

//     // Patch de una licencia
//     const { data } = await PeopleAPI.updateLicense(person._id, licenseId, patch)
//     const updated = data?.item || data

//     // Actualiza local
//     onChange?.((prev) => ({
//       ...prev,
//       licenses: (prev.licenses || []).map((x) => (x._id === licenseId ? updated : x)),
//     }))

//     // Si cambió "Actual otorgamiento", propagar a todas las licencias
//     if (propagateIssuedAt && patch?.issuedAt) {
//       const issuedAt = patch.issuedAt
//       const others = licenses.filter((l) => l._id !== licenseId)
//       if (!others.length) return
//       await Promise.all(
//         others.map((l) =>
//           PeopleAPI.updateLicense(person._id, l._id, {
//             issuedAt,
//             issueDate: issuedAt, // legacy
//           })
//         )
//       )
//       // Reflejo local (sin depender de la respuesta de cada llamada)
//       onChange?.((prev) => ({
//         ...prev,
//         licenses: (prev.licenses || []).map((l) => ({
//           ...l,
//           issuedAt: l._id === licenseId ? updated.issuedAt : issuedAt,
//           issueDate: l._id === licenseId ? updated.issueDate : issuedAt,
//         })),
//       }))
//     }
//   }

//   const remove = async (licenseId) => {
//     if (!person?._id) return
//     const ok = window.confirm('¿Eliminar licencia?')
//     if (!ok) return
//     await PeopleAPI.removeLicense(person._id, licenseId)
//     onChange?.((prev) => ({ ...prev, licenses: (prev.licenses || []).filter((l) => l._id !== licenseId) }))
//   }

//   return (
//     <div className="space-y-4">
//       {/* Alta / edición rápida */}
//       <div className="border rounded p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
//         <label className="text-sm">
//           <div className="text-gray-600 mb-1">Tipo / Clase *</div>
//           <select
//             className="border rounded px-3 py-2 w-full"
//             value={form.type}
//             onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
//           >
//             <option value="">— Seleccionar —</option>
//             {LICENSE_TYPES.map((t) => (
//               <option key={t} value={t}>
//                 {t}
//               </option>
//             ))}
//           </select>
//         </label>

//         <label className="text-sm">
//           <div className="text-gray-600 mb-1">N° de folio</div>
//           <input
//             className="border rounded px-3 py-2 w-full"
//             value={form.folioNumber}
//             onChange={(e) => setForm((s) => ({ ...s, folioNumber: e.target.value }))}
//             placeholder="Folio"
//           />
//         </label>

//         <label className="text-sm md:col-span-2">
//           <div className="text-gray-600 mb-1">Emisor</div>
//           <input
//             className="border rounded px-3 py-2 w-full"
//             value={form.issuer}
//             onChange={(e) => setForm((s) => ({ ...s, issuer: e.target.value }))}
//             placeholder="Ej: Registro Civil"
//           />
//         </label>

//         <button
//           type="button"
//           className="rounded bg-blue-600 text-white px-3 py-2 md:col-span-2"
//           onClick={addOrUpdate}
//         >
//           Guardar licencia
//         </button>

//         <label className="text-sm">
//           <div className="text-gray-600 mb-1">Primer otorgamiento</div>
//           <input
//             type="date"
//             className="border rounded px-3 py-2 w-full"
//             value={form.firstIssuedAt}
//             onChange={(e) => setForm((s) => ({ ...s, firstIssuedAt: e.target.value }))}
//           />
//         </label>

//         <label className="text-sm">
//           <div className="text-gray-600 mb-1">Actual otorgamiento</div>
//           <input
//             type="date"
//             className="border rounded px-3 py-2 w-full"
//             value={form.issuedAt}
//             onChange={(e) => setForm((s) => ({ ...s, issuedAt: e.target.value }))}
//           />
//         </label>

//         <label className="text-sm">
//           <div className="text-gray-600 mb-1">Próximo control</div>
//           <input
//             type="date"
//             className="border rounded px-3 py-2 w-full"
//             value={form.nextControlAt}
//             onChange={(e) => setForm((s) => ({ ...s, nextControlAt: e.target.value }))}
//           />
//         </label>
//       </div>

//       {/* Listado editable */}
//       <div className="border rounded overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="text-left p-2">Tipo</th>
//               <th className="text-left p-2">Folio</th>
//               <th className="text-left p-2">Primer</th>
//               <th className="text-left p-2">Actual</th>
//               <th className="text-left p-2">Próximo</th>
//               <th className="text-left p-2">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {licenses.map((l) => {
//               const type = String(l.type || '').toUpperCase()
//               const folio = l.folioNumber || l.number || ''
//               const first = toISODate(l.firstIssuedAt)
//               const issued = toISODate(l.issuedAt || l.issueDate)
//               const next = toISODate(l.nextControlAt || l.expiryDate)

//               return (
//                 <tr key={l._id} className="border-t align-top">
//                   <td className="p-2 font-medium">{type || '—'}</td>
//                   <td className="p-2">
//                     <input
//                       className="border rounded px-2 py-1 w-32"
//                       defaultValue={folio}
//                       onBlur={(e) =>
//                         updateRow(l._id, {
//                           folioNumber: e.target.value || null,
//                           number: e.target.value || null,
//                         })
//                       }
//                     />
//                   </td>

//                   <td className="p-2">
//                     <input
//                       type="date"
//                       className="border rounded px-2 py-1"
//                       defaultValue={first}
//                       onBlur={(e) =>
//                         updateRow(l._id, {
//                           firstIssuedAt: e.target.value || null,
//                         })
//                       }
//                     />
//                   </td>

//                   <td className="p-2">
//                     <input
//                       type="date"
//                       className="border rounded px-2 py-1"
//                       defaultValue={issued}
//                       onBlur={(e) =>
//                         updateRow(
//                           l._id,
//                           {
//                             issuedAt: e.target.value || null,
//                             issueDate: e.target.value || null,
//                           },
//                           { propagateIssuedAt: true }
//                         )
//                       }
//                     />
//                     <div className="text-[11px] text-slate-500 mt-1">
//                       Cambiar aquí actualizará “Actual” en todas las clases.
//                     </div>
//                   </td>

//                   <td className="p-2">
//                     <input
//                       type="date"
//                       className="border rounded px-2 py-1"
//                       defaultValue={next}
//                       onBlur={(e) =>
//                         updateRow(l._id, {
//                           nextControlAt: e.target.value || null,
//                           expiryDate: e.target.value || null,
//                         })
//                       }
//                     />
//                   </td>

//                   <td className="p-2">
//                     <button
//                       type="button"
//                       className="px-2 py-1 border rounded"
//                       onClick={() => remove(l._id)}
//                     >
//                       Eliminar
//                     </button>
//                   </td>
//                 </tr>
//               )
//             })}

//             {!licenses.length && (
//               <tr>
//                 <td className="p-3 text-gray-500" colSpan="6">
//                   Sin licencias
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

//V 220126
import { useMemo, useState } from 'react'
import { PeopleAPI } from '../../../api/people.api'

const LICENSE_TYPES = ['C', 'B', 'A4', 'A5', 'A2', 'A2*', 'A1', 'A1*', 'A3', 'D', 'E', 'F']

const toISODate = (v) => (v ? String(v).slice(0, 10) : '')

export default function LicensesTab({ person, onChange }) {
  const licenses = useMemo(() => (Array.isArray(person?.licenses) ? person.licenses : []), [person])

  const [form, setForm] = useState({
    type: '',
    folioNumber: '',
    issuer: '',
    firstIssuedAt: '',
    issuedAt: '',
    nextControlAt: '',
  })

  const reset = () =>
    setForm({ type: '', folioNumber: '', issuer: '', firstIssuedAt: '', issuedAt: '', nextControlAt: '' })

  const addOrUpdate = async () => {
    if (!person?._id) return alert('Primero guarda la persona')
    if (!form.type) return alert('Tipo/clase es obligatorio')

    const existing = licenses.find((l) => String(l.type || '').toUpperCase() === form.type)
    const payload = {
      // Nuevos campos
      type: form.type,
      folioNumber: form.folioNumber || null,
      issuer: form.issuer || null,
      firstIssuedAt: form.firstIssuedAt || null,
      issuedAt: form.issuedAt || null,
      nextControlAt: form.nextControlAt || null,

      // Compatibilidad legacy (si tu backend aún lo usa)
      number: form.folioNumber || null,
      issueDate: form.issuedAt || null,
      expiryDate: form.nextControlAt || null,
    }

    if (existing?._id) {
      const ok = window.confirm(
        `La licencia tipo ${form.type} ya existe. ¿Deseas modificarla con estos datos?`
      )
      if (!ok) return

      const { data } = await PeopleAPI.updateLicense(person._id, existing._id, payload)
      const updated = data?.item || data
      onChange?.((prev) => ({
        ...prev,
        licenses: (prev.licenses || []).map((x) => (x._id === existing._id ? updated : x)),
      }))
      reset()
      return
    }

    const { data } = await PeopleAPI.addLicense(person._id, payload)
    const created = data?.item || data
    onChange?.((prev) => ({ ...prev, licenses: [...licenses, created] }))
    reset()
  }

  const updateRow = async (licenseId, patch, { propagateIssuedAt = false } = {}) => {
    if (!person?._id) return

    // Patch de una licencia
    const { data } = await PeopleAPI.updateLicense(person._id, licenseId, patch)
    const updated = data?.item || data

    // Actualiza local
    onChange?.((prev) => ({
      ...prev,
      licenses: (prev.licenses || []).map((x) => (x._id === licenseId ? updated : x)),
    }))

    // Si cambió "Actual otorgamiento", propagar a todas las licencias
    if (propagateIssuedAt && patch?.issuedAt) {
      const issuedAt = patch.issuedAt
      const others = licenses.filter((l) => l._id !== licenseId)
      if (!others.length) return
      await Promise.all(
        others.map((l) =>
          PeopleAPI.updateLicense(person._id, l._id, {
            issuedAt,
            issueDate: issuedAt, // legacy
          })
        )
      )
      // Reflejo local (sin depender de la respuesta de cada llamada)
      onChange?.((prev) => ({
        ...prev,
        licenses: (prev.licenses || []).map((l) => ({
          ...l,
          issuedAt: l._id === licenseId ? updated.issuedAt : issuedAt,
          issueDate: l._id === licenseId ? updated.issueDate : issuedAt,
        })),
      }))
    }
  }

  const remove = async (licenseId) => {
    if (!person?._id) return
    const ok = window.confirm('¿Eliminar licencia?')
    if (!ok) return
    await PeopleAPI.removeLicense(person._id, licenseId)
    onChange?.((prev) => ({ ...prev, licenses: (prev.licenses || []).filter((l) => l._id !== licenseId) }))
  }

  return (
    <div className="space-y-4">
      {/* Alta / edición rápida */}
      <div className="border rounded p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <label className="text-sm">
          <div className="text-gray-600 mb-1">Tipo / Clase *</div>
          <select
            className="border rounded px-3 py-2 w-full"
            value={form.type}
            onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
          >
            <option value="">— Seleccionar —</option>
            {LICENSE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">N° de folio</div>
          <input
            className="border rounded px-3 py-2 w-full"
            value={form.folioNumber}
            onChange={(e) => setForm((s) => ({ ...s, folioNumber: e.target.value }))}
            placeholder="Folio"
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="text-gray-600 mb-1">Emisor</div>
          <input
            className="border rounded px-3 py-2 w-full"
            value={form.issuer}
            onChange={(e) => setForm((s) => ({ ...s, issuer: e.target.value }))}
            placeholder="Ej: Registro Civil"
          />
        </label>

        <button
          type="button"
          className="rounded-md text-white px-3 py-2 text-sm md:col-span-2"
          style={{ background: 'var(--fc-primary)' }}
          onClick={addOrUpdate}
        >
          Guardar licencia
        </button>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">Primer otorgamiento</div>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={form.firstIssuedAt}
            onChange={(e) => setForm((s) => ({ ...s, firstIssuedAt: e.target.value }))}
          />
        </label>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">Actual otorgamiento</div>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={form.issuedAt}
            onChange={(e) => setForm((s) => ({ ...s, issuedAt: e.target.value }))}
          />
        </label>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">Próximo control</div>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={form.nextControlAt}
            onChange={(e) => setForm((s) => ({ ...s, nextControlAt: e.target.value }))}
          />
        </label>
      </div>

      {/* Listado editable */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Tipo</th>
              <th className="text-left p-2">Folio</th>
              <th className="text-left p-2">Primer</th>
              <th className="text-left p-2">Actual</th>
              <th className="text-left p-2">Próximo</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((l) => {
              const type = String(l.type || '').toUpperCase()
              const folio = l.folioNumber || l.number || ''
              const first = toISODate(l.firstIssuedAt)
              const issued = toISODate(l.issuedAt || l.issueDate)
              const next = toISODate(l.nextControlAt || l.expiryDate)

              return (
                <tr key={l._id} className="border-t align-top">
                  <td className="p-2 font-medium">{type || '—'}</td>
                  <td className="p-2">
                    <input
                      className="border rounded px-2 py-1 w-32"
                      defaultValue={folio}
                      onBlur={(e) =>
                        updateRow(l._id, {
                          folioNumber: e.target.value || null,
                          number: e.target.value || null,
                        })
                      }
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="date"
                      className="border rounded px-2 py-1"
                      defaultValue={first}
                      onBlur={(e) =>
                        updateRow(l._id, {
                          firstIssuedAt: e.target.value || null,
                        })
                      }
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="date"
                      className="border rounded px-2 py-1"
                      defaultValue={issued}
                      onBlur={(e) =>
                        updateRow(
                          l._id,
                          {
                            issuedAt: e.target.value || null,
                            issueDate: e.target.value || null,
                          },
                          { propagateIssuedAt: true }
                        )
                      }
                    />
                    <div className="text-[11px] text-slate-500 mt-1">
                      Cambiar aquí actualizará “Actual” en todas las clases.
                    </div>
                  </td>

                  <td className="p-2">
                    <input
                      type="date"
                      className="border rounded px-2 py-1"
                      defaultValue={next}
                      onBlur={(e) =>
                        updateRow(l._id, {
                          nextControlAt: e.target.value || null,
                          expiryDate: e.target.value || null,
                        })
                      }
                    />
                  </td>

                  <td className="p-2">
                    <button
                      type="button"
                      className="px-2 py-1 border rounded"
                      onClick={() => remove(l._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}

            {!licenses.length && (
              <tr>
                <td className="p-3 text-gray-500" colSpan="6">
                  Sin licencias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}



//version fallida 220126+
// // front/src/pages/People/tabs/LicensesTab.jsx
// // -----------------------------------------------------------------------------
// // RRHH - Licencias de conducir (Chile)
// // - Listado en modo vista
// // - Editar por fila (botón "Editar")
// // - Validación: no permite guardar sin fechas (Emisión y Próximo control)
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import { PeopleAPI } from '../../../api/people.api'

// const LICENSE_TYPES_CL = ['C', 'B', 'A4', 'A5', 'A2', 'A2*', 'A1', 'A1*', 'A3', 'D', 'E', 'F']

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

// export default function LicensesTab({ person, onChange }) {
//   const personId = person?._id
//   const licenses = Array.isArray(person?.licenses) ? person.licenses : []

//   const [busy, setBusy] = useState(false)
//   const [editingId, setEditingId] = useState(null)
//   const [row, setRow] = useState({
//     type: '',
//     folioNumber: '',
//     issuer: '',
//     firstIssuedAt: '',
//     issuedAt: '',
//     nextControlAt: '',
//   })

//   const sorted = useMemo(() => {
//     const arr = [...licenses]
//     arr.sort((a, b) => String(a.type || '').localeCompare(String(b.type || '')))
//     return arr
//   }, [licenses])

//   useEffect(() => {
//     // si cambia la persona, resetea edición
//     setEditingId(null)
//   }, [personId])

//   const validate = (payload) => {
//     if (!payload.type) return 'Seleccione el tipo de licencia'
//     if (!payload.issuedAt || !payload.nextControlAt) return 'Debe ingresar fechas válidas (Emisión y Próximo control)'
//     return null
//   }

//   const startAdd = () => {
//     setEditingId('__new__')
//     setRow({
//       type: '',
//       folioNumber: '',
//       issuer: '',
//       firstIssuedAt: '',
//       issuedAt: '',
//       nextControlAt: '',
//     })
//   }

//   const startEdit = (it) => {
//     setEditingId(it._id)
//     setRow({
//       type: it.type || '',
//       folioNumber: it.folioNumber || '',
//       issuer: it.issuer || '',
//       firstIssuedAt: isoDate(it.firstIssuedAt),
//       issuedAt: isoDate(it.issuedAt),
//       nextControlAt: isoDate(it.nextControlAt),
//     })
//   }

//   const cancelEdit = () => {
//     setEditingId(null)
//   }

//   const save = async () => {
//     if (!personId) return
//     const payload = {
//       type: row.type,
//       folioNumber: row.folioNumber,
//       issuer: row.issuer,
//       firstIssuedAt: row.firstIssuedAt || null,
//       issuedAt: row.issuedAt || null,
//       nextControlAt: row.nextControlAt || null,
//     }

//     const msg = validate(payload)
//     if (msg) return alert(msg)

//     setBusy(true)
//     try {
//       if (editingId === '__new__') {
//         const { item } = await PeopleAPI.addLicense(personId, payload)
//         onChange?.((s) => ({ ...s, licenses: [...(s.licenses || []), item] }))
//         alert('Licencia creada con éxito')
//       } else {
//         const { item } = await PeopleAPI.updateLicense(personId, editingId, payload)
//         onChange?.((s) => ({
//           ...s,
//           licenses: (s.licenses || []).map((x) => (x._id === editingId ? item : x)),
//         }))
//         alert('Licencia actualizada con éxito')
//       }
//       setEditingId(null)
//     } catch (err) {
//       console.error(err)
//       alert(err?.response?.data?.message || 'No fue posible guardar la licencia')
//     } finally {
//       setBusy(false)
//     }
//   }

//   const remove = async (it) => {
//     if (!personId) return
//     const ok = window.confirm('¿Eliminar licencia?')
//     if (!ok) return
//     setBusy(true)
//     try {
//       await PeopleAPI.removeLicense(personId, it._id)
//       onChange?.((s) => ({ ...s, licenses: (s.licenses || []).filter((x) => x._id !== it._id) }))
//       alert('Licencia eliminada con éxito')
//     } catch (err) {
//       console.error(err)
//       alert(err?.response?.data?.message || 'No fue posible eliminar la licencia')
//     } finally {
//       setBusy(false)
//     }
//   }

//   const isEditing = Boolean(editingId)

//   return (
//     <div className="space-y-3">
//       <div className="flex items-center justify-between">
//         <div className="text-sm text-gray-600">Licencias registradas</div>
//         <button
//           type="button"
//           className="px-3 py-2 rounded border text-sm"
//           disabled={busy || !personId || isEditing}
//           onClick={startAdd}
//         >
//           Nueva licencia
//         </button>
//       </div>

//       {/* Editor (agregar / editar) */}
//       {isEditing && (
//         <div className="border rounded p-3 bg-gray-50">
//           <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
//             <label className="text-sm md:col-span-1">
//               <div className="text-gray-600 mb-1">Tipo *</div>
//               <select
//                 className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//                 value={row.type}
//                 onChange={(e) => setRow((s) => ({ ...s, type: e.target.value }))}
//                 disabled={busy}
//               >
//                 <option value="">Seleccione...</option>
//                 {LICENSE_TYPES_CL.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             <label className="text-sm md:col-span-2">
//               <div className="text-gray-600 mb-1">Folio</div>
//               <input
//                 className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//                 value={row.folioNumber}
//                 onChange={(e) => setRow((s) => ({ ...s, folioNumber: e.target.value }))}
//                 disabled={busy}
//               />
//             </label>

//             <label className="text-sm md:col-span-3">
//               <div className="text-gray-600 mb-1">Entidad emisora</div>
//               <input
//                 className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//                 value={row.issuer}
//                 onChange={(e) => setRow((s) => ({ ...s, issuer: e.target.value }))}
//                 disabled={busy}
//               />
//             </label>

//             <label className="text-sm md:col-span-2">
//               <div className="text-gray-600 mb-1">Primera emisión</div>
//               <input
//                 type="date"
//                 className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//                 value={row.firstIssuedAt}
//                 onChange={(e) => setRow((s) => ({ ...s, firstIssuedAt: e.target.value }))}
//                 disabled={busy}
//               />
//             </label>

//             <label className="text-sm md:col-span-2">
//               <div className="text-gray-600 mb-1">Emisión *</div>
//               <input
//                 type="date"
//                 className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//                 value={row.issuedAt}
//                 onChange={(e) => setRow((s) => ({ ...s, issuedAt: e.target.value }))}
//                 disabled={busy}
//               />
//             </label>

//             <label className="text-sm md:col-span-2">
//               <div className="text-gray-600 mb-1">Próximo control *</div>
//               <input
//                 type="date"
//                 className="border border-gray-400 rounded px-3 py-2 w-full h-[38px]"
//                 value={row.nextControlAt}
//                 onChange={(e) => setRow((s) => ({ ...s, nextControlAt: e.target.value }))}
//                 disabled={busy}
//               />
//             </label>
//           </div>

//           <div className="flex items-center justify-end gap-2 mt-3">
//             <button type="button" className="px-3 py-2 rounded border text-sm" onClick={cancelEdit} disabled={busy}>
//               Cancelar
//             </button>
//             <button
//               type="button"
//               className="px-3 py-2 rounded text-sm text-white"
//               style={{ background: 'var(--fc-primary)' }}
//               onClick={save}
//               disabled={busy}
//             >
//               Guardar
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Tabla en modo vista */}
//       <div className="overflow-x-auto border rounded">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-50 text-gray-600">
//             <tr>
//               <th className="text-left px-3 py-2">Tipo</th>
//               <th className="text-left px-3 py-2">Folio</th>
//               <th className="text-left px-3 py-2">Emisión</th>
//               <th className="text-left px-3 py-2">Próximo control</th>
//               <th className="text-left px-3 py-2">Emisor</th>
//               <th className="text-right px-3 py-2">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sorted.length === 0 ? (
//               <tr>
//                 <td className="px-3 py-4 text-gray-500" colSpan={6}>
//                   Aún no hay licencias registradas.
//                 </td>
//               </tr>
//             ) : (
//               sorted.map((it) => (
//                 <tr key={it._id} className="border-t">
//                   <td className="px-3 py-2">{it.type || '-'}</td>
//                   <td className="px-3 py-2">{it.folioNumber || '-'}</td>
//                   <td className="px-3 py-2">{isoDate(it.issuedAt) || '-'}</td>
//                   <td className="px-3 py-2">{isoDate(it.nextControlAt) || '-'}</td>
//                   <td className="px-3 py-2">{it.issuer || '-'}</td>
//                   <td className="px-3 py-2 text-right">
//                     <div className="inline-flex gap-2">
//                       <button
//                         type="button"
//                         className="px-3 py-1.5 rounded border text-sm"
//                         onClick={() => startEdit(it)}
//                         disabled={busy || isEditing}
//                       >
//                         Editar
//                       </button>
//                       <button
//                         type="button"
//                         className="px-3 py-1.5 rounded border text-sm"
//                         onClick={() => remove(it)}
//                         disabled={busy || isEditing}
//                       >
//                         Eliminar
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }
