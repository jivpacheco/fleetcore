// // // // import { useRef, useState } from 'react'
// // // // import { PeopleAPI } from '../../../api/people.api'

// // // // export default function FilesTab({ person, onPersonReload }) {
// // // //     const photoInputRef = useRef(null)
// // // //     const docInputRef = useRef(null)
// // // //     const [uploading, setUploading] = useState(false)

// // // //     const uploadPhoto = async (file) => {
// // // //         if (!person?._id) return alert('Primero guarda la persona')
// // // //         setUploading(true)
// // // //         try {
// // // //             await PeopleAPI.uploadPhoto(person._id, file)
// // // //             await onPersonReload?.()
// // // //         } finally {
// // // //             setUploading(false)
// // // //         }
// // // //     }

// // // //     const uploadDoc = async (file) => {
// // // //         if (!person?._id) return alert('Primero guarda la persona')
// // // //         setUploading(true)
// // // //         try {
// // // //             await PeopleAPI.uploadDocument(person._id, file)
// // // //             await onPersonReload?.()
// // // //         } finally {
// // // //             setUploading(false)
// // // //         }
// // // //     }

// // // //     const removeDoc = async (docId) => {
// // // //         if (!person?._id) return
// // // //         const ok = window.confirm('¿Eliminar documento?')
// // // //         if (!ok) return
// // // //         setUploading(true)
// // // //         try {
// // // //             await PeopleAPI.deleteDocument(person._id, docId)
// // // //             await onPersonReload?.()
// // // //         } finally {
// // // //             setUploading(false)
// // // //         }
// // // //     }

// // // //     return (
// // // //         <div className="space-y-6">
// // // //             <div className="border rounded p-4 space-y-3">
// // // //                 <div className="font-semibold">Foto</div>

// // // //                 <div className="flex items-center gap-4">
// // // //                     {person?.photo?.url ? (
// // // //                         <img src={person.photo.url} alt="Foto" className="w-28 h-28 object-cover rounded border" />
// // // //                     ) : (
// // // //                         <div className="w-28 h-28 rounded border flex items-center justify-center text-xs text-gray-500">
// // // //                             Sin foto
// // // //                         </div>
// // // //                     )}

// // // //                     <div className="space-y-2">
// // // //                         <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
// // // //                             onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
// // // //                         <button
// // // //                             type="button"
// // // //                             className="px-3 py-2 rounded-md text-white"
// // // //                             style={{ background: 'var(--fc-primary)' }}
// // // //                             disabled={uploading}
// // // //                             onClick={() => photoInputRef.current?.click()}>
// // // //                             Subir / Reemplazar
// // // //                         </button>
// // // //                     </div>
// // // //                 </div>
// // // //             </div>

// // // //             <div className="border rounded p-4 space-y-3">
// // // //                 <div className="flex items-center justify-between">
// // // //                     <div className="font-semibold">Documentos</div>
// // // //                     <div>
// // // //                         <input ref={docInputRef} type="file" className="hidden"
// // // //                             onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ''; }} />
// // // //                         <button
// // // //                             type="button"
// // // //                             className="px-3 py-2 rounded-md border border-gray-400"
// // // //                             disabled={uploading}
// // // //                             onClick={() => docInputRef.current?.click()}>
// // // //                             Subir documento
// // // //                         </button>
// // // //                     </div>
// // // //                 </div>

// // // //                 <div className="border rounded overflow-hidden">
// // // //                     <table className="w-full text-sm">
// // // //                         <thead className="bg-gray-50">
// // // //                             <tr>
// // // //                                 <th className="text-left p-2">Etiqueta</th>
// // // //                                 <th className="text-left p-2">Formato</th>
// // // //                                 <th className="text-left p-2">Bytes</th>
// // // //                                 <th className="text-left p-2 w-32">Acciones</th>
// // // //                             </tr>
// // // //                         </thead>
// // // //                         <tbody>
// // // //                             {(person?.documents || []).map(d => (
// // // //                                 <tr key={d._id} className="border-t">
// // // //                                     <td className="p-2">
// // // //                                         <a className="underline" href={d.url} target="_blank" rel="noreferrer">{d.label}</a>
// // // //                                     </td>
// // // //                                     <td className="p-2">{d.format || '—'}</td>
// // // //                                     <td className="p-2">{d.bytes || 0}</td>
// // // //                                     <td className="p-2">
// // // //                                         <button type="button" className="px-2 py-1 border rounded" onClick={() => removeDoc(d._id)} disabled={uploading}>
// // // //                                             Eliminar
// // // //                                         </button>
// // // //                                     </td>
// // // //                                 </tr>
// // // //                             ))}
// // // //                             {!(person?.documents || []).length && (
// // // //                                 <tr><td className="p-3 text-gray-500" colSpan="4">Sin documentos</td></tr>
// // // //                             )}
// // // //                         </tbody>
// // // //                     </table>
// // // //                 </div>
// // // //             </div>
// // // //         </div>
// // // //     )
// // // // }

// // // import { useRef, useState } from 'react'
// // // import { PeopleAPI } from '../../../api/people.api'

// // // export default function FilesTab({ person, onPersonReload }) {
// // //     const photoInputRef = useRef(null)
// // //     const docInputRef = useRef(null)
// // //     const [uploading, setUploading] = useState(false)

// // //     const uploadPhoto = async (file) => {
// // //         if (!person?._id) return alert('Primero guarda la persona')
// // //         setUploading(true)
// // //         try {
// // //             await PeopleAPI.uploadPhoto(person._id, file)
// // //             await onPersonReload?.()
// // //         } finally {
// // //             setUploading(false)
// // //         }
// // //     }

// // //     const uploadDoc = async (file) => {
// // //         if (!person?._id) return alert('Primero guarda la persona')
// // //         setUploading(true)
// // //         try {
// // //             await PeopleAPI.uploadDocument(person._id, file)
// // //             await onPersonReload?.()
// // //         } finally {
// // //             setUploading(false)
// // //         }
// // //     }

// // //     const removeDoc = async (docId) => {
// // //         if (!person?._id) return
// // //         const ok = window.confirm('¿Eliminar documento?')
// // //         if (!ok) return
// // //         setUploading(true)
// // //         try {
// // //             await PeopleAPI.deleteDocument(person._id, docId)
// // //             await onPersonReload?.()
// // //         } finally {
// // //             setUploading(false)
// // //         }
// // //     }

// // //     const removePhoto = async () => {
// // //         if (!person?._id) return
// // //         if (!person?.photo?.url) return
// // //         const ok = window.confirm('¿Eliminar foto de la persona?')
// // //         if (!ok) return
// // //         setUploading(true)
// // //         try {
// // //             await PeopleAPI.deletePhoto(person._id)
// // //             await onPersonReload?.()
// // //         } finally {
// // //             setUploading(false)
// // //         }
// // //     }

// // //     return (
// // //         <div className="space-y-6">
// // //             <div className="border rounded p-4 space-y-3">
// // //                 <div className="font-semibold">Foto</div>

// // //                 <div className="flex items-center gap-4">
// // //                     <div className="relative">
// // //                         {person?.photo?.url ? (
// // //                             <>
// // //                                 <img src={person.photo.url} alt="Foto" className="w-28 h-28 object-cover rounded border" />
// // //                                 <button
// // //                                     type="button"
// // //                                     title="Eliminar foto"
// // //                                     className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border text-sm leading-none"
// // //                                     onClick={removePhoto}
// // //                                     disabled={uploading}
// // //                                 >
// // //                                     ×
// // //                                 </button>
// // //                             </>
// // //                         ) : (
// // //                             <div className="w-28 h-28 rounded border flex items-center justify-center text-xs text-gray-500">
// // //                                 Sin foto
// // //                             </div>
// // //                         )}
// // //                     </div>

// // //                     <div className="space-y-2">
// // //                         <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
// // //                             onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
// // //                         <button
// // //                             type="button"
// // //                             className="px-3 py-2 rounded-md text-white"
// // //                             style={{ background: 'var(--fc-primary)' }}
// // //                             disabled={uploading}
// // //                             onClick={() => photoInputRef.current?.click()}>
// // //                             Subir / Reemplazar
// // //                         </button>
// // //                         {person?.photo?.url && (
// // //                             <button
// // //                                 type="button"
// // //                                 className="px-3 py-2 rounded-md border border-gray-400"
// // //                                 disabled={uploading}
// // //                                 onClick={removePhoto}
// // //                             >
// // //                                 Eliminar
// // //                             </button>
// // //                         )}
// // //                     </div>
// // //                 </div>
// // //             </div>

// // //             <div className="border rounded p-4 space-y-3">
// // //                 <div className="flex items-center justify-between">
// // //                     <div className="font-semibold">Documentos</div>
// // //                     <div>
// // //                         <input ref={docInputRef} type="file" className="hidden"
// // //                             onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ''; }} />
// // //                         <button
// // //                             type="button"
// // //                             className="px-3 py-2 rounded-md border border-gray-400"
// // //                             disabled={uploading}
// // //                             onClick={() => docInputRef.current?.click()}>
// // //                             Subir documento
// // //                         </button>
// // //                     </div>
// // //                 </div>

// // //                 <div className="border rounded overflow-hidden">
// // //                     <table className="w-full text-sm">
// // //                         <thead className="bg-gray-50">
// // //                             <tr>
// // //                                 <th className="text-left p-2">Etiqueta</th>
// // //                                 <th className="text-left p-2">Formato</th>
// // //                                 <th className="text-left p-2">Bytes</th>
// // //                                 <th className="text-left p-2 w-56">Acciones</th>
// // //                             </tr>
// // //                         </thead>
// // //                         <tbody>
// // //                             {(person?.documents || []).map(d => (
// // //                                 <tr key={d._id} className="border-t">
// // //                                     <td className="p-2">
// // //                                         <a className="underline" href={d.url} target="_blank" rel="noreferrer">{d.label}</a>
// // //                                     </td>
// // //                                     <td className="p-2">{d.format || '—'}</td>
// // //                                     <td className="p-2">{d.bytes || 0}</td>
// // //                                     <td className="p-2">
// // //                                         <div className="flex gap-2">
// // //                                             <a
// // //                                                 className="px-2 py-1 border rounded"
// // //                                                 href={d.url}
// // //                                                 target="_blank"
// // //                                                 rel="noreferrer"
// // //                                             >
// // //                                                 Ver
// // //                                             </a>
// // //                                             <a
// // //                                                 className="px-2 py-1 border rounded"
// // //                                                 href={PeopleAPI.documentDownloadUrl(person._id, d._id)}
// // //                                                 target="_blank"
// // //                                                 rel="noreferrer"
// // //                                             >
// // //                                                 Descargar
// // //                                             </a>
// // //                                             <button type="button" className="px-2 py-1 border rounded" onClick={() => removeDoc(d._id)} disabled={uploading}>
// // //                                                 Eliminar
// // //                                             </button>
// // //                                         </div>
// // //                                     </td>
// // //                                 </tr>
// // //                             ))}
// // //                             {!(person?.documents || []).length && (
// // //                                 <tr><td className="p-3 text-gray-500" colSpan="4">Sin documentos</td></tr>
// // //                             )}
// // //                         </tbody>
// // //                     </table>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     )
// // // }




// // //19022025
// // import { useRef, useState } from 'react'
// // import { PeopleAPI } from '../../../api/people.api'

// // export default function FilesTab({ person, onPersonReload }) {
// //     const photoInputRef = useRef(null)
// //     const docInputRef = useRef(null)
// //     const [uploading, setUploading] = useState(false)
// //     const [preview, setPreview] = useState(null)

// //     const uploadPhoto = async (file) => {
// //         if (!person?._id) return alert('Primero guarda la persona')
// //         setUploading(true)
// //         try {
// //             await PeopleAPI.uploadPhoto(person._id, file)
// //             await onPersonReload?.()
// //         } finally {
// //             setUploading(false)
// //         }
// //     }

// //     const uploadDoc = async (file) => {
// //         if (!person?._id) return alert('Primero guarda la persona')
// //         setUploading(true)
// //         try {
// //             await PeopleAPI.uploadDocument(person._id, file)
// //             await onPersonReload?.()
// //         } finally {
// //             setUploading(false)
// //         }
// //     }

// //     const removeDoc = async (docId) => {
// //         if (!person?._id) return
// //         const ok = window.confirm('¿Eliminar documento?')
// //         if (!ok) return
// //         setUploading(true)
// //         try {
// //             await PeopleAPI.deleteDocument(person._id, docId)
// //             await onPersonReload?.()
// //         } finally {
// //             setUploading(false)
// //         }
// //     }

// //     const removePhoto = async () => {
// //         if (!person?._id) return
// //         if (!person?.photo?.url) return
// //         const ok = window.confirm('¿Eliminar foto de la persona?')
// //         if (!ok) return
// //         setUploading(true)
// //         try {
// //             await PeopleAPI.deletePhoto(person._id)
// //             await onPersonReload?.()
// //         } finally {
// //             setUploading(false)
// //         }
// //     }

// //     return (
// //         <div className="space-y-6">
// //             {preview && (
// //                 <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closePreview}>
// //                     <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
// //                         <div className="flex items-center justify-between px-4 py-3 border-b">
// //                             <div className="font-semibold text-sm">{preview.label}</div>
// //                             <button type="button" className="px-2 py-1 border rounded" onClick={closePreview}>Cerrar</button>
// //                         </div>
// //                         <div className="p-4 overflow-auto max-h-[75vh]">
// //                             {preview.kind === "image" && (
// //                                 <img src={preview.url} alt={preview.label} className="max-w-full h-auto mx-auto rounded border" />
// //                             )}
// //                             {preview.kind === "pdf" && (
// //                                 <iframe title={preview.label} src={preview.url} className="w-full h-[70vh] border rounded" />
// //                             )}
// //                             {preview.kind === "iframe" && (
// //                                 <iframe title={preview.label} src={preview.url} className="w-full h-[70vh] border rounded" />
// //                             )}
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}

// //             <div className="border rounded p-4 space-y-3">
// //                 <div className="font-semibold">Foto</div>

// //                 <div className="flex items-center gap-4">
// //                     <div className="relative">
// //                         {person?.photo?.url ? (
// //                             <>
// //                                 <button type="button" className="block" onClick={() => openPreview(person.photo.url, { label: 'Foto de la persona', kind: 'image' })}>
// //                                     <img src={person.photo.url} alt="Foto" className="w-28 h-28 object-cover rounded border" />
// //                                 </button>
// //                                 <button
// //                                     type="button"
// //                                     title="Eliminar foto"
// //                                     className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border text-[10px] leading-none flex items-center justify-center"
// //                                     onClick={removePhoto}
// //                                     disabled={uploading}
// //                                 >
// //                                     ×
// //                                 </button>
// //                             </>
// //                         ) : (
// //                             <div className="w-28 h-28 rounded border flex items-center justify-center text-xs text-gray-500">
// //                                 Sin foto
// //                             </div>
// //                         )}
// //                     </div>

// //                     <div className="space-y-2">
// //                         <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
// //                             onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
// //                         <button
// //                             type="button"
// //                             className="px-3 py-2 rounded-md text-white"
// //                             style={{ background: 'var(--fc-primary)' }}
// //                             disabled={uploading}
// //                             onClick={() => photoInputRef.current?.click()}>
// //                             Subir / Reemplazar
// //                         </button>
// // </div>
// //                 </div>
// //             </div>

// //             <div className="border rounded p-4 space-y-3">
// //                 <div className="flex items-center justify-between">
// //                     <div className="font-semibold">Documentos</div>
// //                     <div>
// //                         <input ref={docInputRef} type="file" className="hidden"
// //                             onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ''; }} />
// //                         <button
// //                             type="button"
// //                             className="px-3 py-2 rounded-md border border-gray-400"
// //                             disabled={uploading}
// //                             onClick={() => docInputRef.current?.click()}>
// //                             Subir documento
// //                         </button>
// //                     </div>
// //                 </div>

// //                 <div className="border rounded overflow-hidden">
// //                     <table className="w-full text-sm">
// //                         <thead className="bg-gray-50">
// //                             <tr>
// //                                 <th className="text-left p-2">Etiqueta</th>
// //                                 <th className="text-left p-2">Formato</th>
// //                                 <th className="text-left p-2">Bytes</th>
// //                                 <th className="text-left p-2 w-56">Acciones</th>
// //                             </tr>
// //                         </thead>
// //                         <tbody>
// //                             {(person?.documents || []).map(d => (
// //                                 <tr key={d._id} className="border-t">
// //                                     <td className="p-2">{d.label || "—"}</td>
// //                                     <td className="p-2">{d.format || '—'}</td>
// //                                     <td className="p-2">{d.bytes || 0}</td>
// //                                     <td className="p-2">
// //                                         <div className="flex gap-2">
// //                                             <button
// //                                                 type="button"
// //                                                 className="px-2 py-1 border rounded"
// //                                                 onClick={() => openPreview(d.url, { label: d.label || "Documento", kind: guessKind(d) })}
// //                                                 disabled={uploading}
// //                                             >
// //                                                 Ver
// //                                             </button>
// //                                             <a
// //                                                 className="px-2 py-1 border rounded"
// //                                                 href={PeopleAPI.documentDownloadUrl(person._id, d._id)}
// //                                                 target="_blank"
// //                                                 rel="noreferrer"
// //                                             >
// //                                                 Descargar
// //                                             </a>
// //                                             <button type="button" className="px-2 py-1 border rounded" onClick={() => removeDoc(d._id)} disabled={uploading}>
// //                                                 Eliminar
// //                                             </button>
// //                                         </div>
// //                                     </td>
// //                                 </tr>
// //                             ))}
// //                             {!(person?.documents || []).length && (
// //                                 <tr><td className="p-3 text-gray-500" colSpan="4">Sin documentos</td></tr>
// //                             )}
// //                         </tbody>
// //                     </table>
// //                 </div>
// //             </div>
// //         </div>
// //     )
// // }

// //19022026 v2
// import { useMemo, useRef, useState } from "react";
// import { PeopleAPI } from "../../../api/people.api";

// function humanBytes(n) {
//   const v = Number(n || 0);
//   if (!v) return "0 B";
//   const units = ["B", "KB", "MB", "GB", "TB"];
//   let idx = 0;
//   let x = v;
//   while (x >= 1024 && idx < units.length - 1) {
//     x /= 1024;
//     idx += 1;
//   }
//   return `${x.toFixed(x >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
// }

// function isImage(url = "", format = "") {
//   const u = String(url).toLowerCase();
//   const f = String(format).toLowerCase();
//   return (
//     ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].some((x) => u.endsWith("." + x)) ||
//     ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(f) ||
//     u.includes("image/")
//   );
// }

// function isPdf(url = "", format = "") {
//   const u = String(url).toLowerCase();
//   const f = String(format).toLowerCase();
//   return u.endsWith(".pdf") || f === "pdf" || u.includes("application/pdf");
// }

// export default function FilesTab({ person, onPersonReload }) {
//   const photoInputRef = useRef(null);
//   const docInputRef = useRef(null);

//   const [uploading, setUploading] = useState(false);

//   const [preview, setPreview] = useState(null); // { url, label, format }

//   const docs = useMemo(() => person?.documents || [], [person]);

//   const openPreview = (file) => {
//     if (!file?.url) return;
//     setPreview({ url: file.url, label: file.label || "Archivo", format: file.format || "" });
//   };

//   const closePreview = () => setPreview(null);

//   const uploadPhoto = async (file) => {
//     if (!person?._id) return alert("Primero guarda la persona");
//     setUploading(true);
//     try {
//       await PeopleAPI.uploadPhoto(person._id, file);
//       await onPersonReload?.();
//     } finally {
//       setUploading(false);
//     }
//   };

//   const uploadDoc = async (file) => {
//     if (!person?._id) return alert("Primero guarda la persona");
//     setUploading(true);
//     try {
//       await PeopleAPI.uploadDocument(person._id, file);
//       await onPersonReload?.();
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removeDoc = async (docId) => {
//     if (!person?._id) return;
//     const ok = window.confirm("¿Eliminar documento?");
//     if (!ok) return;
//     setUploading(true);
//     try {
//       await PeopleAPI.deleteDocument(person._id, docId);
//       await onPersonReload?.();
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removePhoto = async () => {
//     if (!person?._id) return;
//     if (!person?.photo?.url) return;
//     const ok = window.confirm("¿Eliminar foto de la persona?");
//     if (!ok) return;
//     setUploading(true);
//     try {
//       await PeopleAPI.deletePhoto(person._id);
//       await onPersonReload?.();
//     } finally {
//       setUploading(false);
//     }
//   };

//   const onClickPhoto = () => {
//     if (!person?.photo?.url) return;
//     // abrir preview en pantalla (no solo cursor)
//     setPreview({ url: person.photo.url, label: "Foto", format: "image" });
//   };

//   return (
//     <div className="space-y-6">
//       {/* ===== FOTO ===== */}
//       <div className="border rounded p-4 space-y-3">
//         <div className="font-semibold">Foto</div>

//         <div className="flex items-center gap-4">
//           <div className="relative">
//             {person?.photo?.url ? (
//               <>
//                 <img
//                   src={person.photo.url}
//                   alt="Foto"
//                   className="w-28 h-28 object-cover rounded border cursor-pointer"
//                   onClick={onClickPhoto}
//                   title="Ver foto"
//                 />

//                 {/* X más pequeña (~60%) */}
//                 <button
//                   type="button"
//                   title="Eliminar foto"
//                   className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border text-[10px] leading-none flex items-center justify-center"
//                   onClick={removePhoto}
//                   disabled={uploading}
//                 >
//                   ×
//                 </button>
//               </>
//             ) : (
//               <div className="w-28 h-28 rounded border flex items-center justify-center text-xs text-gray-500">
//                 Sin foto
//               </div>
//             )}
//           </div>

//           <div className="space-y-2">
//             <input
//               ref={photoInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={(e) => {
//                 const f = e.target.files?.[0];
//                 if (f) uploadPhoto(f);
//                 e.target.value = "";
//               }}
//             />
//             <button
//               type="button"
//               className="px-3 py-2 rounded-md text-white"
//               style={{ background: "var(--fc-primary)" }}
//               disabled={uploading}
//               onClick={() => photoInputRef.current?.click()}
//             >
//               Subir / Reemplazar
//             </button>

//             {/* Eliminado: botón "Eliminar" (se gestiona con la X) */}
//           </div>
//         </div>
//       </div>

//       {/* ===== DOCUMENTOS ===== */}
//       <div className="border rounded p-4 space-y-3">
//         <div className="flex items-center justify-between">
//           <div className="font-semibold">Documentos</div>
//           <div>
//             <input
//               ref={docInputRef}
//               type="file"
//               className="hidden"
//               onChange={(e) => {
//                 const f = e.target.files?.[0];
//                 if (f) uploadDoc(f);
//                 e.target.value = "";
//               }}
//             />
//             <button
//               type="button"
//               className="px-3 py-2 rounded-md border border-gray-400"
//               disabled={uploading}
//               onClick={() => docInputRef.current?.click()}
//             >
//               Subir documento
//             </button>
//           </div>
//         </div>

//         <div className="border rounded overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="text-left p-2">Etiqueta</th>
//                 <th className="text-left p-2">Formato</th>
//                 <th className="text-left p-2">Tamaño</th>
//                 <th className="text-left p-2 w-64">Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {docs.map((d) => (
//                 <tr key={d._id} className="border-t">
//                   {/* Etiqueta SIN link */}
//                   <td className="p-2">{d.label || "—"}</td>
//                   <td className="p-2">{d.format || "—"}</td>
//                   <td className="p-2">{humanBytes(d.bytes || 0)}</td>
//                   <td className="p-2 flex gap-2">
//                     <button
//                       type="button"
//                       className="px-2 py-1 border rounded"
//                       onClick={() => openPreview(d)}
//                       disabled={uploading}
//                     >
//                       Ver
//                     </button>

//                     <a
//                       className="px-2 py-1 border rounded inline-flex items-center"
//                       href={d.url}
//                       target="_blank"
//                       rel="noreferrer"
//                       download
//                     >
//                       Descargar
//                     </a>

//                     <button
//                       type="button"
//                       className="px-2 py-1 border rounded"
//                       onClick={() => removeDoc(d._id)}
//                       disabled={uploading}
//                     >
//                       Eliminar
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {!docs.length && (
//                 <tr>
//                   <td className="p-3 text-gray-500" colSpan={4}>
//                     Sin documentos
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ===== PREVIEW (modal simple) ===== */}
//         {preview?.url && (
//           <div
//             className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
//             onClick={closePreview}
//           >
//             <div
//               className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center justify-between p-3 border-b">
//                 <div className="font-semibold text-sm truncate">{preview.label}</div>
//                 <button type="button" className="px-2 py-1 border rounded" onClick={closePreview}>
//                   Cerrar
//                 </button>
//               </div>

//               <div className="p-3 overflow-auto max-h-[75vh]">
//                 {isImage(preview.url, preview.format) ? (
//                   <img src={preview.url} alt={preview.label} className="max-w-full h-auto rounded border" />
//                 ) : isPdf(preview.url, preview.format) ? (
//                   <iframe title="preview" src={preview.url} className="w-full h-[70vh] border rounded" />
//                 ) : (
//                   <div className="space-y-3">
//                     <div className="text-sm text-gray-600">
//                       Vista previa no disponible para este formato. Usa &quot;Descargar&quot;.
//                     </div>
//                     <a className="px-3 py-2 border rounded inline-flex" href={preview.url} target="_blank" rel="noreferrer">
//                       Abrir en nueva pestaña
//                     </a>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useRef, useState } from 'react'
import { PeopleAPI } from '../../../api/people.api'

export default function FilesTab({ person, onPersonReload }) {
    const photoInputRef = useRef(null)
    const docInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(null) // { kind, url, title, objectUrl }
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
    }

    const inferExt = (doc) => {
        const fromFormat = String(doc?.format || "").trim().toLowerCase()
        if (fromFormat && fromFormat !== "—") return fromFormat.replace(".", "")
        const label = String(doc?.label || "").trim()
        const m = label.match(/\.([a-z0-9]{1,6})$/i)
        if (m) return m[1].toLowerCase()
        return ""
    }

    const inferMime = (doc) => {
        const ext = inferExt(doc)
        if (ext && MIME_BY_EXT[ext]) return MIME_BY_EXT[ext]
        // fallback genérico
        if (ext) return "application/octet-stream"
        return "application/octet-stream"
    }

    const ensureFilename = (doc, fallback = "archivo") => {
        const raw = String(doc?.label || fallback).trim() || fallback
        const hasExt = /\.[a-z0-9]{1,6}$/i.test(raw)
        if (hasExt) return raw
        const ext = inferExt(doc)
        return ext ? `${raw}.${ext}` : raw
    }

    const closePreview = () => {
        try {
            if (preview?.objectUrl && preview?.url) URL.revokeObjectURL(preview.url)
        } catch {}
        setPreview(null)
    }

    const fetchBlob = async (url, mimeHint) => {
        // 1) intentar con fetch (para URLs públicas tipo Cloudinary)
        try {
            const res = await fetch(url)
            const blob = await res.blob()
            const type = mimeHint || blob.type || "application/octet-stream"
            return new Blob([blob], { type })
        } catch (e) {
            // 2) fallback con axios/api (para URLs del backend con auth)
            const { api } = await import("../../../services/http")
            const resp = await api.get(url, { responseType: "blob" })
            const blob = resp?.data
            const type = mimeHint || blob?.type || "application/octet-stream"
            return new Blob([blob], { type })
        }
    }

    const onViewDoc = async (doc) => {
        if (!doc?.url) return
        const ext = inferExt(doc)
        const mime = inferMime(doc)

        // Para PDF / video / image: preview en modal con blobURL (evita descarga forzada por Content-Disposition)
        const kind =
            mime.startsWith("image/") ? "image" :
            mime.startsWith("video/") ? "video" :
            mime === "application/pdf" ? "pdf" :
            "other"

        const blob = await fetchBlob(doc.url, mime)
        const objectUrl = URL.createObjectURL(blob)

        setPreview({ kind, url: objectUrl, title: ensureFilename(doc, "archivo"), objectUrl: true })
    }

    const onDownloadDoc = async (doc) => {
        if (!doc?.url || !person?._id || !doc?._id) return
        const mime = inferMime(doc)
        const filename = ensureFilename(doc, "archivo")

        // usar endpoint de descarga del backend (con auth) para consistencia
        const dlUrl = PeopleAPI.documentDownloadUrl(person._id, doc._id)

        const blob = await fetchBlob(dlUrl, mime)
        const objectUrl = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = objectUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()

        setTimeout(() => URL.revokeObjectURL(objectUrl), 5000)
    }

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
                                    onClick={() => setPreview({ kind: "image", url: person.photo.url, title: "Foto", objectUrl: false })}
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
                                <th className="text-left p-2 w-56">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(person?.documents || []).map(d => (
                                <tr key={d._id} className="border-t">
                                    <td className="p-2">{d.label}</td>
                                    <td className="p-2">{d.format || '—'}</td>
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
            {preview && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={closePreview}>
                    <div className="bg-white rounded-xl max-w-5xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <div className="font-semibold text-sm truncate">{preview.title}</div>
                            <button type="button" className="px-2 py-1 border rounded" onClick={closePreview}>Cerrar</button>
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
    )
}