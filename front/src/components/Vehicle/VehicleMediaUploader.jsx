// front/src/components/Vehicle/VehicleMediaUploader.jsx
// -----------------------------------------------------------
// Uploader genérico para fotos / documentos / videos.
// - Acepta: imágenes (jpg/png/webp), PDF y videos (mp4/webm/mov).
// - Convierte título/etiqueta a MAYÚSCULAS.
// - onUpload({ file, category, title|label }) la define el padre.
// -----------------------------------------------------------
import { useState } from 'react'

export default function VehicleMediaUploader({
  onUpload,
  accept = 'image/*,application/pdf,video/*',
  category,                 // 'photos' | 'legal' | 'manuals' | 'parts' | 'videos'
  titleLabel = 'Título',
  labelLabel = 'Etiqueta',
  mode = 'photo',           // 'photo' | 'doc'
}) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [label, setLabel] = useState('')

  async function handleUpload() {
    if (!file) return
    try {
      if (mode === 'photo') {
        await onUpload({ file, category, title: title.toUpperCase() })
      } else {
        await onUpload({ file, category, label: label.toUpperCase() })
      }
      setFile(null)
      setTitle('')
      setLabel('')
      alert('Archivo subido correctamente')
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Error al subir el archivo')
    }
  }

  return (
    <div className="border rounded-lg p-3 flex flex-col gap-2 bg-white">
      <input
        type="file"
        accept={accept}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {mode === 'photo' ? (
        <input
          placeholder={titleLabel}
          value={title}
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          className="border p-2 rounded"
        />
      ) : (
        <input
          placeholder={labelLabel}
          value={label}
          onChange={(e) => setLabel(e.target.value.toUpperCase())}
          className="border p-2 rounded"
        />
      )}

      <button
        type="button"
        className="px-3 py-2 bg-blue-600 text-white rounded w-max"
        onClick={handleUpload}
        disabled={!file}
      >
        Subir
      </button>
    </div>
  )
}
