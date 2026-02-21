import { useRef, useState } from "react";
import { PeopleAPI } from "../../../api/people.api";
import { api } from "../../../services/http";

export default function FilesTab({ person, onPersonReload }) {
    const photoInputRef = useRef(null);
    const docInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null); // { kind, url, title, objectUrl }

    const uploadPhoto = async (file) => {
        if (!person?._id) return alert("Primero guarda la persona");
        setUploading(true);
        try {
            await PeopleAPI.uploadPhoto(person._id, file);
            await onPersonReload?.();
        } finally {
            setUploading(false);
        }
    };

    const uploadDoc = async (file) => {
        if (!person?._id) return alert("Primero guarda la persona");
        setUploading(true);
        try {
            await PeopleAPI.uploadDocument(person._id, file);
            await onPersonReload?.();
        } finally {
            setUploading(false);
        }
    };

    const removeDoc = async (docId) => {
        if (!person?._id) return;
        const ok = window.confirm("¿Eliminar documento?");
        if (!ok) return;
        setUploading(true);
        try {
            await PeopleAPI.deleteDocument(person._id, docId);
            await onPersonReload?.();
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = async () => {
        if (!person?._id) return;
        if (!person?.photo?.url) return;
        const ok = window.confirm("¿Eliminar foto de la persona?");
        if (!ok) return;
        setUploading(true);
        try {
            await PeopleAPI.deletePhoto(person._id);
            await onPersonReload?.();
        } finally {
            setUploading(false);
        }
    };

    const MIME_BY_EXT = {
        pdf: "application/pdf",
        mp4: "video/mp4",
        webm: "video/webm",
        mov: "video/quicktime",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp",
    };

    const inferExt = (doc) => {
        const fromFormat = String(doc?.format || "").trim().toLowerCase();
        // si format viene como "pdf" ó ".pdf"
        if (fromFormat && !fromFormat.includes("/")) return fromFormat.replace(".", "");

        // si format viene como MIME (application/pdf)
        if (fromFormat.includes("/")) {
            const mime = fromFormat;
            const ext = Object.keys(MIME_BY_EXT).find((k) => MIME_BY_EXT[k] === mime);
            if (ext) return ext;
        }

        const label = String(doc?.label || "").trim();
        const m = label.match(/\.([a-z0-9]{1,6})$/i);
        if (m) return m[1].toLowerCase();
        return "";
    };

    const inferMime = (doc) => {
        const f = String(doc?.format || "").trim().toLowerCase();
        if (f.includes("/")) return f; // ya es MIME
        const ext = inferExt(doc);
        if (ext && MIME_BY_EXT[ext]) return MIME_BY_EXT[ext];
        return "application/octet-stream";
    };

    const ensureFilename = (doc, fallback = "archivo") => {
        const raw = String(doc?.label || fallback).trim() || fallback;
        const hasExt = /\.[a-z0-9]{1,6}$/i.test(raw);
        if (hasExt) return raw;
        const ext = inferExt(doc);
        return ext ? `${raw}.${ext}` : raw;
    };

    const closePreview = () => {
        try {
            if (preview?.objectUrl && preview?.url) URL.revokeObjectURL(preview.url);
        } catch { }
        setPreview(null);
    };

    const fetchBlob = async (url, mimeHint) => {
        // 1) intentar con fetch (URLs públicas tipo Cloudinary)
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const type = mimeHint || blob.type || "application/octet-stream";
            return new Blob([blob], { type });
        } catch {
            // 2) fallback con axios/api (URLs backend con auth)
            const resp = await api.get(url, { responseType: "blob" });
            const blob = resp?.data;
            const type = mimeHint || blob?.type || "application/octet-stream";
            return new Blob([blob], { type });
        }
    };

    const onViewDoc = async (doc) => {
        if (!doc?.url) return;
        const mime = inferMime(doc);

        const kind = mime.startsWith("image/")
            ? "image"
            : mime.startsWith("video/")
                ? "video"
                : mime === "application/pdf"
                    ? "pdf"
                    : "other";

        const blob = await fetchBlob(doc.url, mime);
        const objectUrl = URL.createObjectURL(blob);

        setPreview({
            kind,
            url: objectUrl,
            title: ensureFilename(doc, "archivo"),
            objectUrl: true,
        });
    };

    const onDownloadDoc = async (doc) => {
        if (!doc?.url || !person?._id || !doc?._id) return;
        const mime = inferMime(doc);
        const filename = ensureFilename(doc, "archivo");

        const dlUrl = PeopleAPI.documentDownloadUrl(person._id, doc._id);
        const blob = await fetchBlob(dlUrl, mime);
        const objectUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    };

    return (
        <div className="space-y-6">
            <div className="border rounded p-4 space-y-3">
                <div className="font-semibold">Foto</div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        {person?.photo?.url ? (
                            <>
                                <img
                                    src={person.photo.url}
                                    alt="Foto"
                                    className="w-28 h-28 object-cover rounded border cursor-pointer"
                                    onClick={() =>
                                        setPreview({
                                            kind: "image",
                                            url: person.photo.url,
                                            title: "Foto",
                                            objectUrl: false,
                                        })
                                    }
                                />
                                <button
                                    type="button"
                                    title="Eliminar foto"
                                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border text-xs leading-none"
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
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadPhoto(f);
                                e.target.value = "";
                            }}
                        />
                        <button
                            type="button"
                            className="px-3 py-2 rounded-md text-white"
                            style={{ background: "var(--fc-primary)" }}
                            disabled={uploading}
                            onClick={() => photoInputRef.current?.click()}
                        >
                            Subir / Reemplazar
                        </button>
                    </div>
                </div>
            </div>

            <div className="border rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="font-semibold">Documentos</div>
                    <div>
                        <input
                            ref={docInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadDoc(f);
                                e.target.value = "";
                            }}
                        />
                        <button
                            type="button"
                            className="px-3 py-2 rounded-md border border-gray-400"
                            disabled={uploading}
                            onClick={() => docInputRef.current?.click()}
                        >
                            Subir documento
                        </button>
                    </div>
                </div>

                <div className="border rounded overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-[720px] w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-2">Etiqueta</th>
                                    <th className="text-left p-2">Formato</th>
                                    <th className="text-left p-2">Bytes</th>
                                    <th className="text-left p-2 w-56">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(person?.documents || []).map((d) => (
                                    <tr key={d._id} className="border-t">
                                        <td className="p-2">{d.label}</td>
                                        <td className="p-2">{d.format || "—"}</td>
                                        <td className="p-2">{d.bytes || 0}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 border rounded"
                                                    onClick={() => onViewDoc(d)}
                                                    disabled={uploading}
                                                >
                                                    Ver
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 border rounded"
                                                    onClick={() => onDownloadDoc(d)}
                                                    disabled={uploading}
                                                >
                                                    Descargar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 border rounded"
                                                    onClick={() => removeDoc(d._id)}
                                                    disabled={uploading}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!(person?.documents || []).length && (
                                    <tr>
                                        <td className="p-3 text-gray-500" colSpan="4">
                                            Sin documentos
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {preview && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                    onClick={closePreview}
                >
                    <div
                        className="bg-white rounded-xl max-w-5xl w-full max-h-[85vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <div className="font-semibold text-sm truncate">{preview.title}</div>
                            <button type="button" className="px-2 py-1 border rounded" onClick={closePreview}>
                                Cerrar
                            </button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[75vh]">
                            {preview.kind === "image" && (
                                <img src={preview.url} alt={preview.title} className="max-w-full h-auto rounded" />
                            )}
                            {preview.kind === "pdf" && (
                                <iframe title={preview.title} src={preview.url} className="w-full h-[70vh] border rounded" />
                            )}
                            {preview.kind === "video" && (
                                <video src={preview.url} className="w-full max-h-[70vh] rounded" controls />
                            )}
                            {preview.kind === "other" && (
                                <div className="text-sm text-gray-600">
                                    No hay vista previa para este tipo de archivo. Usa “Descargar”.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
