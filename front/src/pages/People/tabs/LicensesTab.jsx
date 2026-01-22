// // front/src/pages/People/tabs/LicensesTab.jsx
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
//           className="rounded-md text-white px-3 py-2 text-sm md:col-span-2"
//           style={{ background: 'var(--fc-primary)' }}
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

import { useEffect, useMemo, useState } from 'react'
import { PeopleAPI } from '../../../api/people.api'

const TYPES = ['C', 'B', 'A4', 'A5', 'A2', 'A2*', 'A1', 'A1*', 'A3', 'D', 'E', 'F']

const emptyForm = {
  type: '',
  folioNumber: '',
  issuer: '',
  firstIssuedAt: '',
  issuedAt: '',
  nextControlAt: '',
}

// Requerimiento: no permitir guardar una licencia con fechas en blanco.
// Interpretación operacional: issuedAt y nextControlAt son obligatorias.
function validateLicenseDraft(draft) {
  const missing = []
  if (!String(draft.type || '').trim()) missing.push('Tipo')
  if (!String(draft.issuedAt || '').trim()) missing.push('Fecha de emisión')
  if (!String(draft.nextControlAt || '').trim()) missing.push('Fecha de control')
  return missing
}

function toPayload(draft) {
  return {
    type: draft.type || '',
    folioNumber: draft.folioNumber || '',
    issuer: draft.issuer || '',
    firstIssuedAt: draft.firstIssuedAt || null,
    issuedAt: draft.issuedAt || null,
    nextControlAt: draft.nextControlAt || null,
  }
}

export default function LicensesTab({ person, onChange, onDirtyChange }) {
  const personId = person?._id
  const licenses = person?.licenses || []

  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState(emptyForm)

  const editing = Boolean(editId)
  const isDirty = useMemo(() => {
    if (creating) return JSON.stringify(draft) !== JSON.stringify(emptyForm)
    if (!editing) return false
    const current = licenses.find((l) => String(l._id) === String(editId))
    if (!current) return false
    const normalized = {
      type: current.type || '',
      folioNumber: current.folioNumber || '',
      issuer: current.issuer || '',
      firstIssuedAt: current.firstIssuedAt ? String(current.firstIssuedAt).slice(0, 10) : '',
      issuedAt: current.issuedAt ? String(current.issuedAt).slice(0, 10) : '',
      nextControlAt: current.nextControlAt ? String(current.nextControlAt).slice(0, 10) : '',
    }
    return JSON.stringify(draft) !== JSON.stringify(normalized)
  }, [creating, editing, editId, draft, licenses])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const startCreate = () => {
    setCreating(true)
    setEditId(null)
    setDraft(emptyForm)
  }

  const startEdit = (l) => {
    setCreating(false)
    setEditId(l._id)
    setDraft({
      type: l.type || '',
      folioNumber: l.folioNumber || '',
      issuer: l.issuer || '',
      firstIssuedAt: l.firstIssuedAt ? String(l.firstIssuedAt).slice(0, 10) : '',
      issuedAt: l.issuedAt ? String(l.issuedAt).slice(0, 10) : '',
      nextControlAt: l.nextControlAt ? String(l.nextControlAt).slice(0, 10) : '',
    })
  }

  const cancel = () => {
    setCreating(false)
    setEditId(null)
    setDraft(emptyForm)
    onDirtyChange?.(false)
  }

  const save = async () => {
    if (!personId) return
    const missing = validateLicenseDraft(draft)
    if (missing.length) {
      alert('Información incompleta. Revisa: ' + missing.join(', '))
      return
    }

    setSaving(true)
    try {
      const payload = toPayload(draft)
      if (creating) {
        const { data } = await PeopleAPI.addLicense(personId, payload)
        const item = data?.item
        onChange?.((prev) => ({
          ...(prev || person),
          licenses: [...(prev?.licenses || licenses), item].filter(Boolean),
        }))
        alert('Licencia guardada con éxito')
      } else {
        const { data } = await PeopleAPI.updateLicense(personId, editId, payload)
        const item = data?.item
        onChange?.((prev) => ({
          ...(prev || person),
          licenses: (prev?.licenses || licenses).map((x) => (String(x._id) === String(editId) ? item : x)),
        }))
        alert('Licencia actualizada con éxito')
      }
      cancel()
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message
      alert(msg || 'No fue posible guardar la licencia')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (licenseId) => {
    if (!personId) return
    const ok = window.confirm('¿Eliminar licencia?')
    if (!ok) return
    setSaving(true)
    try {
      await PeopleAPI.removeLicense(personId, licenseId)
      onChange?.((prev) => ({
        ...(prev || person),
        licenses: (prev?.licenses || licenses).filter((l) => String(l._id) !== String(licenseId)),
      }))
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message
      alert(msg || 'No fue posible eliminar la licencia')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Licencias de conducir</div>
          <div className="text-xs text-gray-600">Listado en modo ver. Usa “Editar” para modificar una licencia.</div>
        </div>

        <button
          type="button"
          className="px-3 py-2 rounded-md text-white disabled:opacity-50"
          style={{ background: 'var(--fc-primary)' }}
          disabled={saving || creating || editing}
          onClick={startCreate}
        >
          Nueva licencia
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Tipo</th>
              <th className="text-left p-2">Folio</th>
              <th className="text-left p-2">Emisión</th>
              <th className="text-left p-2">Control</th>
              <th className="text-left p-2 w-44">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-2 font-medium">{l.type || '—'}</td>
                <td className="p-2">{l.folioNumber || '—'}</td>
                <td className="p-2">{l.issuedAt ? String(l.issuedAt).slice(0, 10) : '—'}</td>
                <td className="p-2">{l.nextControlAt ? String(l.nextControlAt).slice(0, 10) : '—'}</td>
                <td className="p-2 flex gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 border rounded"
                    disabled={saving || creating || editing}
                    onClick={() => startEdit(l)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded"
                    disabled={saving || creating || editing}
                    onClick={() => remove(l._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!licenses.length && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={5}>Sin licencias</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <div className="border rounded p-4 space-y-3">
          <div className="font-semibold">{creating ? 'Crear licencia' : 'Editar licencia'}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className="border rounded px-3 h-[38px]"
              value={draft.type}
              onChange={(e) => setDraft((s) => ({ ...s, type: e.target.value }))}
            >
              <option value="">Tipo *</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              className="border rounded px-3 h-[38px]"
              placeholder="Folio"
              value={draft.folioNumber}
              onChange={(e) => setDraft((s) => ({ ...s, folioNumber: e.target.value }))}
            />
            <input
              className="border rounded px-3 h-[38px]"
              placeholder="Emisor"
              value={draft.issuer}
              onChange={(e) => setDraft((s) => ({ ...s, issuer: e.target.value }))}
            />
            <input
              type="date"
              className="border rounded px-3 h-[38px]"
              value={draft.firstIssuedAt}
              onChange={(e) => setDraft((s) => ({ ...s, firstIssuedAt: e.target.value }))}
            />
            <input
              type="date"
              className="border rounded px-3 h-[38px]"
              value={draft.issuedAt}
              onChange={(e) => setDraft((s) => ({ ...s, issuedAt: e.target.value }))}
            />
            <input
              type="date"
              className="border rounded px-3 h-[38px]"
              value={draft.nextControlAt}
              onChange={(e) => setDraft((s) => ({ ...s, nextControlAt: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-3 py-2 rounded-md border border-gray-400" onClick={cancel} disabled={saving}>
              Cancelar
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md text-white disabled:opacity-50"
              style={{ background: 'var(--fc-primary)' }}
              onClick={save}
              disabled={saving}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
