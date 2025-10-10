import { useState } from 'react'

export default function VehicleMediaUploader({
    vehicleId,
    mode = 'photo', // 'photo' | 'doc' | 'video'
    onUploaded,
    uploadFn,
    accept,
    category,
    label,
}) {
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    async function onChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setBusy(true)
        setError('')
        try {
            const v = await uploadFn(vehicleId, file, category ? { category, label } : {})
            onUploaded?.(v)
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Error al subir archivo')
        } finally {
            setBusy(false)
            e.target.value = ''
        }
    }

    const acceptMap = {
        photo: 'image/jpeg,image/png,image/webp',
        doc: 'application/pdf,image/jpeg,image/png',
        video: 'video/mp4,video/webm,video/quicktime',
    }

    return (
        <div className="flex items-center gap-3">
            <label className="btn btn-primary cursor-pointer">
                {busy ? 'Subiendo…' : 'Subir archivo'}
                <input
                    type="file"
                    className="hidden"
                    accept={accept || acceptMap[mode]}
                    onChange={onChange}
                    disabled={busy}
                />
            </label>
            {error && <span className="text-red-600 text-sm">{error}</span>}
        </div>
    )
}
