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
//                         <button
//                             type="button"
//                             className="px-3 py-2 rounded-md text-white"
//                             style={{ background: 'var(--fc-primary)' }}
//                             disabled={uploading}
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
//                         <button
//                             type="button"
//                             className="px-3 py-2 rounded-md border border-gray-400"
//                             disabled={uploading}
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

    const removePhoto = async () => {
        if (!person?._id) return
        if (!person?.photo?.url) return
        const ok = window.confirm('¿Eliminar foto de la persona?')
        if (!ok) return
        setUploading(true)
        try {
            await PeopleAPI.deletePhoto(person._id)
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
                    <div className="relative">
                        {person?.photo?.url ? (
                            <>
                                <img src={person.photo.url} alt="Foto" className="w-28 h-28 object-cover rounded border" />
                                <button
                                    type="button"
                                    title="Eliminar foto"
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border text-sm leading-none"
                                    onClick={removePhoto}
                                    disabled={uploading}
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <div className="w-28 h-28 rounded border flex items-center justify-center text-xs text-gray-500">
                                Sin foto
                            </div>
                        )}
                    </div>

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
                        {person?.photo?.url && (
                            <button
                                type="button"
                                className="px-3 py-2 rounded-md border border-gray-400"
                                disabled={uploading}
                                onClick={removePhoto}
                            >
                                Eliminar
                            </button>
                        )}
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
                                <th className="text-left p-2 w-56">Acciones</th>
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
                                        <div className="flex gap-2">
                                            <a
                                                className="px-2 py-1 border rounded"
                                                href={d.url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Ver
                                            </a>
                                            <a
                                                className="px-2 py-1 border rounded"
                                                href={PeopleAPI.documentDownloadUrl(person._id, d._id)}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Descargar
                                            </a>
                                            <button type="button" className="px-2 py-1 border rounded" onClick={() => removeDoc(d._id)} disabled={uploading}>
                                                Eliminar
                                            </button>
                                        </div>
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