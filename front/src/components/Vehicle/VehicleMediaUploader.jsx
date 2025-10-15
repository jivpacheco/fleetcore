// // front/src/components/Vehicle/VehicleMediaUploader.jsx
// // -----------------------------------------------------------
// // Uploader genérico para fotos / documentos / videos.
// // - Acepta: imágenes (jpg/png/webp), PDF y videos (mp4/webm/mov).
// // - Convierte título/etiqueta a MAYÚSCULAS.
// // - onUpload({ file, category, title|label }) la define el padre.
// // -----------------------------------------------------------
// import { useState } from 'react'

// export default function VehicleMediaUploader({
//   onUpload,
//   accept = 'image/*,application/pdf,video/*',
//   category,                 // 'photos' | 'legal' | 'manuals' | 'parts' | 'videos'
//   titleLabel = 'Título',
//   labelLabel = 'Etiqueta',
//   mode = 'photo',           // 'photo' | 'doc'
// }) {
//   const [file, setFile] = useState(null)
//   const [title, setTitle] = useState('')
//   const [label, setLabel] = useState('')

//   async function handleUpload() {
//     if (!file) return
//     try {
//       if (mode === 'photo') {
//         await onUpload({ file, category, title: title.toUpperCase() })
//       } else {
//         await onUpload({ file, category, label: label.toUpperCase() })
//       }
//       setFile(null)
//       setTitle('')
//       setLabel('')
//       alert('Archivo subido correctamente')
//     } catch (e) {
//       alert(e?.response?.data?.message || e.message || 'Error al subir el archivo')
//     }
//   }

//   return (
//     <div className="border rounded-lg p-3 flex flex-col gap-2 bg-white">
//       <input
//         type="file"
//         accept={accept}
//         onChange={(e) => setFile(e.target.files?.[0] || null)}
//       />

//       {mode === 'photo' ? (
//         <input
//           placeholder={titleLabel}
//           value={title}
//           onChange={(e) => setTitle(e.target.value.toUpperCase())}
//           className="border p-2 rounded"
//         />
//       ) : (
//         <input
//           placeholder={labelLabel}
//           value={label}
//           onChange={(e) => setLabel(e.target.value.toUpperCase())}
//           className="border p-2 rounded"
//         />
//       )}

//       <button
//         type="button"
//         className="px-3 py-2 bg-blue-600 text-white rounded w-max"
//         onClick={handleUpload}
//         disabled={!file}
//       >
//         Subir
//       </button>
//     </div>
//   )
// }
// Uploader genérico para fotos/docs/videos con categoría + título/etiqueta.
// Props:
//  - mode: 'photo' | 'doc' (afecta placeholder de label)
//  - accept: input accept
//  - categories: [{code,label}]
//  - onUploadMany: async (files[], {category, title/label})
import { useRef, useState } from 'react'

export default function VehicleMediaUploader({ mode='photo', accept='image/*', categories=[], onUploadMany }){
  const [category, setCategory] = useState(categories[0]?.code || '')
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  async function handleSend(){
    const files = Array.from(fileRef.current?.files || [])
    if (!files.length) return alert('Selecciona archivos')
    if (!category) return alert('Selecciona una categoría')
    setBusy(true)
    try {
      await onUploadMany(files, { category, label })
      setLabel('')
      if (fileRef.current) fileRef.current.value = ''
      alert('Subido correctamente')
    } catch(e){
      alert(e?.response?.data?.message || e.message || 'Error al subir')
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-2">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Sección / Categoría</label>
          <select className="w-full border rounded p-2 bg-white" value={category} onChange={e=>setCategory(e.target.value)}>
            {categories.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{mode==='doc' ? 'Etiqueta' : 'Título'}</label>
          <input className="w-full border rounded p-2" placeholder={mode==='doc'?'SOAP 2026':'PLACA CHASIS'}
                 value={label} onChange={e=>setLabel(e.target.value.toUpperCase())}/>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Seleccionar archivos</label>
          <input ref={fileRef} type="file" accept={accept} multiple className="w-full border rounded p-2 bg-white" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="button" disabled={busy} onClick={handleSend}
          className="px-3 py-2 bg-blue-600 text-white rounded">{busy?'Subiendo…':'Subir'}</button>
      </div>
    </div>
  )
}
