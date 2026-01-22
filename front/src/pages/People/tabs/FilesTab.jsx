// import { useRef, useState } from 'react'
// import { PeopleAPI } from '../../../api/people.api'

// export default function FilesTab({ person, onPersonReload }) {
//     const photoInputRef = useRef(null)
//     const docInputRef = useRef(null)
//     const [uploading, setUploading] = useState(false)

//     const uploadPhoto = async (file) => {
//         if (!person?._id) return alert('Primero guarda la persona')
//         setUploading(true)
//         try {
//             await PeopleAPI.uploadPhoto(person._id, file)
//             await onPersonReload?.()
//         } finally {
//             setUploading(false)
//         }
//     }

//     const uploadDoc = async (file) => {
//         if (!person?._id) return alert('Primero guarda la persona')
//         setUploading(true)
//         try {
//             await PeopleAPI.uploadDocument(person._id, file)
//             await onPersonReload?.()
//         } finally {
//             setUploading(false)
//         }
//     }

//     const removeDoc = async (docId) => {
//         if (!person?._id) return
//         const ok = window.confirm('¿Eliminar documento?')
//         if (!ok) return
//         setUploading(true)
//         try {
//             await PeopleAPI.deleteDocument(person._id, docId)
//             await onPersonReload?.()
//         } finally {
//             setUploading(false)
//         }
//     }

//     return (
//         <div className="space-y-6">
//             <div className="border rounded p-4 space-y-3">
//                 <div className="font-semibold">Foto</div>

//                 <div className="flex items-center gap-4">
//                     {person?.photo?.url ? (
//                         <img src={person.photo.url} alt="Foto" className="w-28 h-28 object-cover rounded border" />
//                     ) : (
//                         <div className="w-28 h-28 rounded border flex items-center justify-center text-xs text-gray-500">
//                             Sin foto
//                         </div>
//                     )}

//                     <div className="space-y-2">
//                         <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
//                             onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
//                         <button type="button" className="px-3 py-2 rounded bg-black text-white" disabled={uploading}
//                             onClick={() => photoInputRef.current?.click()}>
//                             Subir / Reemplazar
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="border rounded p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                     <div className="font-semibold">Documentos</div>
//                     <div>
//                         <input ref={docInputRef} type="file" className="hidden"
//                             onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ''; }} />
//                         <button type="button" className="px-3 py-2 rounded border" disabled={uploading}
//                             onClick={() => docInputRef.current?.click()}>
//                             Subir documento
//                         </button>
//                     </div>
//                 </div>

//                 <div className="border rounded overflow-hidden">
//                     <table className="w-full text-sm">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="text-left p-2">Etiqueta</th>
//                                 <th className="text-left p-2">Formato</th>
//                                 <th className="text-left p-2">Bytes</th>
//                                 <th className="text-left p-2 w-32">Acciones</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {(person?.documents || []).map(d => (
//                                 <tr key={d._id} className="border-t">
//                                     <td className="p-2">
//                                         <a className="underline" href={d.url} target="_blank" rel="noreferrer">{d.label}</a>
//                                     </td>
//                                     <td className="p-2">{d.format || '—'}</td>
//                                     <td className="p-2">{d.bytes || 0}</td>
//                                     <td className="p-2">
//                                         <button type="button" className="px-2 py-1 border rounded" onClick={() => removeDoc(d._id)} disabled={uploading}>
//                                             Eliminar
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                             {!(person?.documents || []).length && (
//                                 <tr><td className="p-3 text-gray-500" colSpan="4">Sin documentos</td></tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     )
// }

//V220126
import { useRef, useState } from 'react'
import { PeopleAPI } from '../../../api/people.api'

export default function FilesTab({ person, onPersonReload }) {
    const photoInputRef = useRef(null)
    const docInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    const uploadPhoto = async (file) => {
        if (!person?._id) return alert('Primero guarda la persona')
        setUploading(true)
        try {
            await PeopleAPI.uploadPhoto(person._id, file)
            await onPersonReload?.()
        } finally {
            setUploading(false)
        }
    }

    const uploadDoc = async (file) => {
        if (!person?._id) return alert('Primero guarda la persona')
        setUploading(true)
        try {
            await PeopleAPI.uploadDocument(person._id, file)
            await onPersonReload?.()
        } finally {
            setUploading(false)
        }
    }

    const removeDoc = async (docId) => {
        if (!person?._id) return
        const ok = window.confirm('¿Eliminar documento?')
        if (!ok) return
        setUploading(true)
        try {
            await PeopleAPI.deleteDocument(person._id, docId)
            await onPersonReload?.()
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="border rounded p-4 space-y-3">
                <div className="font-semibold">Foto</div>

                <div className="flex items-center gap-4">
                    {person?.photo?.url ? (
                        <img src={person.photo.url} alt="Foto" className="w-28 h-28 object-cover rounded border" />
                    ) : (
                        <div className="w-28 h-28 rounded border flex items-center justify-center text-xs text-gray-500">
                            Sin foto
                        </div>
                    )}

                    <div className="space-y-2">
                        <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
                        <button
                            type="button"
                            className="px-3 py-2 rounded-md text-white"
                            style={{ background: 'var(--fc-primary)' }}
                            disabled={uploading}
                            onClick={() => photoInputRef.current?.click()}>
                            Subir / Reemplazar
                        </button>
                    </div>
                </div>
            </div>

            <div className="border rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="font-semibold">Documentos</div>
                    <div>
                        <input ref={docInputRef} type="file" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ''; }} />
                        <button
                            type="button"
                            className="px-3 py-2 rounded-md border border-gray-400"
                            disabled={uploading}
                            onClick={() => docInputRef.current?.click()}>
                            Subir documento
                        </button>
                    </div>
                </div>

                <div className="border rounded overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-2">Etiqueta</th>
                                <th className="text-left p-2">Formato</th>
                                <th className="text-left p-2">Bytes</th>
                                <th className="text-left p-2 w-32">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(person?.documents || []).map(d => (
                                <tr key={d._id} className="border-t">
                                    <td className="p-2">
                                        <a className="underline" href={d.url} target="_blank" rel="noreferrer">{d.label}</a>
                                    </td>
                                    <td className="p-2">{d.format || '—'}</td>
                                    <td className="p-2">{d.bytes || 0}</td>
                                    <td className="p-2">
                                        <button type="button" className="px-2 py-1 border rounded" onClick={() => removeDoc(d._id)} disabled={uploading}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!(person?.documents || []).length && (
                                <tr><td className="p-3 text-gray-500" colSpan="4">Sin documentos</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}


// version fallida de 220126+
// // front/src/pages/People/tabs/FilesTab.jsx
// // -----------------------------------------------------------------------------
// // RRHH - Archivos / Foto
// // - Foto: subir + ver + quitar (X)
// // - Documentos: ver y descargar con nombre + extensión
// // -----------------------------------------------------------------------------

// import { useMemo, useState } from 'react'
// import { PeopleAPI } from '../../../api/people.api'

// function guessExt(doc) {
//     const fmt = (doc?.format || '').toLowerCase().replace('.', '')
//     if (fmt) return fmt
//     const ct = (doc?.contentType || '').toLowerCase()
//     if (ct.includes('pdf')) return 'pdf'
//     if (ct.includes('png')) return 'png'
//     if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg'
//     if (ct.includes('webp')) return 'webp'
//     return ''
// }

// function safeName(s) {
//     return String(s || '')
//         .trim()
//         .replace(/[^\w\-]+/g, '_')
//         .replace(/_+/g, '_')
//         .replace(/^_+|_+$/g, '')
//         .slice(0, 80)
// }

// function buildFilename(doc, fallback = 'archivo') {
//     const base = safeName(doc?.label || fallback) || fallback
//     const ext = guessExt(doc)
//     return ext ? `${base}.${ext}` : base
// }

// export default function FilesTab({ personId, person, onChange }) {
//     const [busy, setBusy] = useState(false)

//     const docs = useMemo(() => (Array.isArray(person?.documents) ? person.documents : []), [person?.documents])
//     const photo = person?.photo || null

//     const uploadPhoto = async (file) => {
//         if (!file || !personId) return
//         setBusy(true)
//         try {
//             const { item } = await PeopleAPI.uploadPhoto(personId, file)
//             onChange?.((s) => ({ ...s, photo: item }))
//             alert('Foto actualizada con éxito')
//         } catch (err) {
//             console.error(err)
//             alert(err?.response?.data?.message || 'No fue posible subir la foto')
//         } finally {
//             setBusy(false)
//         }
//     }

//     const removePhoto = async () => {
//         if (!personId) return
//         const ok = window.confirm('¿Quitar foto de la persona?')
//         if (!ok) return
//         setBusy(true)
//         try {
//             // PATCH simple: permite limpiar el objeto foto
//             const { item } = await PeopleAPI.update(personId, { photo: null })
//             onChange?.(() => item)
//             alert('Foto eliminada con éxito')
//         } catch (err) {
//             console.error(err)
//             alert(err?.response?.data?.message || 'No fue posible eliminar la foto')
//         } finally {
//             setBusy(false)
//         }
//     }

//     const uploadDoc = async (file) => {
//         if (!file || !personId) return
//         setBusy(true)
//         try {
//             const { item } = await PeopleAPI.uploadDocument(personId, file, file.name)
//             onChange?.((s) => ({ ...s, documents: [...(s.documents || []), item] }))
//             alert('Documento cargado con éxito')
//         } catch (err) {
//             console.error(err)
//             alert(err?.response?.data?.message || 'No fue posible cargar el documento')
//         } finally {
//             setBusy(false)
//         }
//     }

//     const removeDoc = async (doc) => {
//         if (!personId) return
//         const ok = window.confirm('¿Eliminar documento?')
//         if (!ok) return
//         setBusy(true)
//         try {
//             await PeopleAPI.deleteDocument(personId, doc._id)
//             onChange?.((s) => ({ ...s, documents: (s.documents || []).filter((d) => d._id !== doc._id) }))
//             alert('Documento eliminado con éxito')
//         } catch (err) {
//             console.error(err)
//             alert(err?.response?.data?.message || 'No fue posible eliminar el documento')
//         } finally {
//             setBusy(false)
//         }
//     }

//     return (
//         <div className="space-y-4">
//             {/* Foto */}
//             <div className="border rounded p-4">
//                 <div className="flex items-center justify-between">
//                     <div className="text-sm text-gray-600">Foto</div>
//                     <label className="px-3 py-2 rounded border text-sm cursor-pointer">
//                         Subir foto
//                         <input
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                             disabled={busy || !personId}
//                             onChange={(e) => uploadPhoto(e.target.files?.[0])}
//                         />
//                     </label>
//                 </div>

//                 <div className="mt-3">
//                     {photo?.url ? (
//                         <div className="relative inline-block">
//                             <img src={photo.url} alt="Foto" className="w-40 h-40 object-cover rounded border" />
//                             <button
//                                 type="button"
//                                 title="Quitar foto"
//                                 onClick={removePhoto}
//                                 disabled={busy}
//                                 className="absolute -top-2 -right-2 w-7 h-7 rounded-full border bg-white text-gray-700"
//                             >
//                                 ×
//                             </button>
//                         </div>
//                     ) : (
//                         <div className="text-sm text-gray-500">(Sin foto)</div>
//                     )}
//                 </div>
//             </div>

//             {/* Documentos */}
//             <div className="border rounded p-4">
//                 <div className="flex items-center justify-between">
//                     <div className="text-sm text-gray-600">Documentos</div>
//                     <label className="px-3 py-2 rounded border text-sm cursor-pointer">
//                         Subir documento
//                         <input
//                             type="file"
//                             className="hidden"
//                             disabled={busy || !personId}
//                             onChange={(e) => uploadDoc(e.target.files?.[0])}
//                         />
//                     </label>
//                 </div>

//                 <div className="mt-3 space-y-2">
//                     {docs.length === 0 ? (
//                         <div className="text-sm text-gray-500">(Sin documentos)</div>
//                     ) : (
//                         docs.map((d) => {
//                             const filename = buildFilename(d, 'documento')
//                             return (
//                                 <div key={d._id} className="flex items-center justify-between gap-3 border rounded px-3 py-2">
//                                     <div className="min-w-0">
//                                         <div className="text-sm font-medium truncate">{d.label || filename}</div>
//                                         <div className="text-xs text-gray-500 truncate">{filename}</div>
//                                     </div>
//                                     <div className="flex gap-2 shrink-0">
//                                         <a
//                                             className="px-3 py-1.5 rounded border text-sm"
//                                             href={d.url}
//                                             target="_blank"
//                                             rel="noreferrer"
//                                         >
//                                             Ver
//                                         </a>
//                                         <a
//                                             className="px-3 py-1.5 rounded border text-sm"
//                                             href={d.url}
//                                             download={filename}
//                                         >
//                                             Descargar
//                                         </a>
//                                         <button
//                                             type="button"
//                                             className="px-3 py-1.5 rounded border text-sm"
//                                             onClick={() => removeDoc(d)}
//                                             disabled={busy}
//                                         >
//                                             Eliminar
//                                         </button>
//                                     </div>
//                                 </div>
//                             )
//                         })
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }
