// front/src/components/Vehicle/MediaGalleryModal.jsx
// -----------------------------------------------------------------------------
// Modal simple para ver fotos/videos en tamaño grande con navegación.
// - props: { open, onClose, items, startIndex }
// - items: [{ url, format, title }]
// -----------------------------------------------------------------------------
import { useEffect, useState } from 'react';

export default function MediaGalleryModal({ open, onClose, items = [], startIndex = 0 }) {
    const [idx, setIdx] = useState(startIndex);

    useEffect(() => { if (open) setIdx(startIndex); }, [open, startIndex]);

    if (!open) return null;
    const cur = items[idx];

    const isVideo = /^(mp4|mov|webm)$/i.test(cur?.format || '');

    const prev = () => setIdx(i => (i - 1 + items.length) % items.length);
    const next = () => setIdx(i => (i + 1) % items.length);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-xl w-[90vw] max-w-5xl p-4">
                <button onClick={onClose} className="absolute top-2 right-2 px-3 py-1 rounded bg-slate-200">Cerrar</button>
                <div className="flex items-center gap-3">
                    <button onClick={prev} className="px-3 py-2 rounded bg-slate-100 border">◀</button>
                    <div className="flex-1">
                        {isVideo ? (
                            <video className="w-full max-h-[70vh] rounded border" controls>
                                <source src={cur.url} />
                            </video>
                        ) : (
                            <img src={cur.url} alt={cur.title || ''} className="w-full max-h-[70vh] object-contain rounded border" />
                        )}
                        <div className="mt-2 text-sm text-slate-700 break-words">{cur.title || cur.label || ''}</div>
                    </div>
                    <button onClick={next} className="px-3 py-2 rounded bg-slate-100 border">▶</button>
                </div>
            </div>
        </div>
    );
}
