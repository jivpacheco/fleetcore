// import { useEffect, useMemo, useState } from "react";
// import { PeopleAPI } from "../../../api/people.api";

// const TYPES = [
//   "C",
//   "B",
//   "A4",
//   "A5",
//   "A2",
//   "A2*",
//   "A1",
//   "A1*",
//   "A3",
//   "D",
//   "E",
//   "F",
// ];

// const emptyForm = {
//   type: "",
//   folioNumber: "",
//   issuer: "",
//   firstIssuedAt: "",
//   issuedAt: "",
//   nextControlAt: "",
// };

// // Requerimiento: no permitir guardar una licencia con fechas en blanco.
// // Interpretación operacional: issuedAt y nextControlAt son obligatorias.
// function validateLicenseDraft(draft) {
//   const missing = [];
//   if (!String(draft.type || "").trim()) missing.push("Tipo");
//   if (!String(draft.issuedAt || "").trim()) missing.push("Fecha de emisión");
//   if (!String(draft.nextControlAt || "").trim())
//     missing.push("Fecha de control");
//   return missing;
// }

// function toPayload(draft) {
//   return {
//     type: draft.type || "",
//     folioNumber: draft.folioNumber || "",
//     issuer: draft.issuer || "",
//     firstIssuedAt: draft.firstIssuedAt || null,
//     issuedAt: draft.issuedAt || null,
//     nextControlAt: draft.nextControlAt || null,
//   };
// }

// export default function LicensesTab({ person, onChange, onDirtyChange }) {
//   const personId = person?._id;
//   const licenses = person?.licenses || [];

//   const [creating, setCreating] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [draft, setDraft] = useState(emptyForm);

//   const editing = Boolean(editId);
//   const isDirty = useMemo(() => {
//     if (creating) return JSON.stringify(draft) !== JSON.stringify(emptyForm);
//     if (!editing) return false;
//     const current = licenses.find((l) => String(l._id) === String(editId));
//     if (!current) return false;
//     const normalized = {
//       type: current.type || "",
//       folioNumber: current.folioNumber || "",
//       issuer: current.issuer || "",
//       firstIssuedAt: current.firstIssuedAt
//         ? String(current.firstIssuedAt).slice(0, 10)
//         : "",
//       issuedAt: current.issuedAt ? String(current.issuedAt).slice(0, 10) : "",
//       nextControlAt: current.nextControlAt
//         ? String(current.nextControlAt).slice(0, 10)
//         : "",
//     };
//     return JSON.stringify(draft) !== JSON.stringify(normalized);
//   }, [creating, editing, editId, draft, licenses]);

//   useEffect(() => {
//     onDirtyChange?.(isDirty);
//   }, [isDirty, onDirtyChange]);

//   const startCreate = () => {
//     setCreating(true);
//     setEditId(null);
//     setDraft(emptyForm);
//   };

//   const startEdit = (l) => {
//     setCreating(false);
//     setEditId(l._id);
//     setDraft({
//       type: l.type || "",
//       folioNumber: l.folioNumber || "",
//       issuer: l.issuer || "",
//       firstIssuedAt: l.firstIssuedAt
//         ? String(l.firstIssuedAt).slice(0, 10)
//         : "",
//       issuedAt: l.issuedAt ? String(l.issuedAt).slice(0, 10) : "",
//       nextControlAt: l.nextControlAt
//         ? String(l.nextControlAt).slice(0, 10)
//         : "",
//     });
//   };

//   const cancel = () => {
//     setCreating(false);
//     setEditId(null);
//     setDraft(emptyForm);
//     onDirtyChange?.(false);
//   };

//   const save = async () => {
//     if (!personId) return;
//     const missing = validateLicenseDraft(draft);
//     if (missing.length) {
//       alert("Información incompleta. Revisa: " + missing.join(", "));
//       return;
//     }

//     // Si no hay cambios, no hacemos nada y volvemos al listado.
//     if (!isDirty) {
//       cancel();
//       return;
//     }

//     setSaving(true);
//     try {
//       const payload = toPayload(draft);
//       if (creating) {
//         const { data } = await PeopleAPI.addLicense(personId, payload);
//         const item = data?.item;
//         onChange?.((prev) => ({
//           ...(prev || person),
//           licenses: [...(prev?.licenses || licenses), item].filter(Boolean),
//         }));
//         alert("Licencia guardada con éxito");
//       } else {
//         const { data } = await PeopleAPI.updateLicense(
//           personId,
//           editId,
//           payload,
//         );
//         const item = data?.item;
//         onChange?.((prev) => ({
//           ...(prev || person),
//           licenses: (prev?.licenses || licenses).map((x) =>
//             String(x._id) === String(editId) ? item : x,
//           ),
//         }));
//         alert("Licencia actualizada con éxito");
//       }
//       cancel();
//     } catch (err) {
//       console.error(err);
//       const msg = err?.response?.data?.message || err?.message;
//       alert(msg || "No fue posible guardar la licencia");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const remove = async (licenseId) => {
//     if (!personId) return;
//     const ok = window.confirm("¿Eliminar licencia?");
//     if (!ok) return;
//     setSaving(true);
//     try {
//       await PeopleAPI.removeLicense(personId, licenseId);
//       onChange?.((prev) => ({
//         ...(prev || person),
//         licenses: (prev?.licenses || licenses).filter(
//           (l) => String(l._id) !== String(licenseId),
//         ),
//       }));
//     } catch (err) {
//       console.error(err);
//       const msg = err?.response?.data?.message || err?.message;
//       alert(msg || "No fue posible eliminar la licencia");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="font-semibold">Licencias de conducir</div>
//           <div className="text-xs text-gray-600">
//             Listado en modo ver. Usa “Editar” para modificar una licencia.
//           </div>
//         </div>

//         <button
//           type="button"
//           className="px-3 py-2 rounded-md text-white disabled:opacity-50"
//           style={{ background: "var(--fc-primary)" }}
//           disabled={saving || creating || editing}
//           onClick={startCreate}
//         >
//           Nueva licencia
//         </button>
//       </div>

//       <div className="border rounded overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="text-left p-2">Tipo</th>
//               <th className="text-left p-2">Folio</th>
//               <th className="text-left p-2">Emisión</th>
//               <th className="text-left p-2">Control</th>
//               <th className="text-left p-2 w-44">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {licenses.map((l) => (
//               <tr key={l._id} className="border-t">
//                 <td className="p-2 font-medium">{l.type || "—"}</td>
//                 <td className="p-2">{l.folioNumber || "—"}</td>
//                 <td className="p-2">
//                   {l.issuedAt ? String(l.issuedAt).slice(0, 10) : "—"}
//                 </td>
//                 <td className="p-2">
//                   {l.nextControlAt ? String(l.nextControlAt).slice(0, 10) : "—"}
//                 </td>
//                 <td className="p-2 flex gap-2">
//                   <button
//                     type="button"
//                     className="px-2 py-1 border rounded"
//                     disabled={saving || creating || editing}
//                     onClick={() => startEdit(l)}
//                   >
//                     Editar
//                   </button>
//                   <button
//                     type="button"
//                     className="px-2 py-1 border rounded"
//                     disabled={saving || creating || editing}
//                     onClick={() => remove(l._id)}
//                   >
//                     Eliminar
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {!licenses.length && (
//               <tr>
//                 <td className="p-3 text-gray-500" colSpan={5}>
//                   Sin licencias
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {(creating || editing) && (
//         <div className="border rounded p-4 space-y-3">
//           <div className="font-semibold">
//             {creating ? "Crear licencia" : "Editar licencia"}
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//             <div className="space-y-1">
//               <div className="text-xs text-gray-600">Tipo *</div>
//               <select
//                 className="border rounded px-3 h-[38px] w-full"
//                 value={draft.type}
//                 onChange={(e) =>
//                   setDraft((s) => ({ ...s, type: e.target.value }))
//                 }
//               >
//                 <option value="">Selecciona tipo</option>
//                 {TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="space-y-1">
//               <div className="text-xs text-gray-600">Folio</div>
//               <input
//                 className="border rounded px-3 h-[38px] w-full"
//                 placeholder="Ej: 123456 / Folio de licencia"
//                 value={draft.folioNumber}
//                 onChange={(e) =>
//                   setDraft((s) => ({ ...s, folioNumber: e.target.value }))
//                 }
//               />
//             </div>

//             <div className="space-y-1">
//               <div className="text-xs text-gray-600">Emisor</div>
//               <input
//                 className="border rounded px-3 h-[38px] w-full"
//                 placeholder="Ej: Registro Civil / Municipalidad"
//                 value={draft.issuer}
//                 onChange={(e) =>
//                   setDraft((s) => ({ ...s, issuer: e.target.value }))
//                 }
//               />
//             </div>

//             <div className="space-y-1">
//               <div className="text-xs text-gray-600">Primera emisión</div>
//               <input
//                 type="date"
//                 className="border rounded px-3 h-[38px] w-full"
//                 placeholder="AAAA-MM-DD"
//                 value={draft.firstIssuedAt}
//                 onChange={(e) =>
//                   setDraft((s) => ({ ...s, firstIssuedAt: e.target.value }))
//                 }
//               />
//             </div>

//             <div className="space-y-1">
//               <div className="text-xs text-gray-600">Fecha de emisión *</div>
//               <input
//                 type="date"
//                 className="border rounded px-3 h-[38px] w-full"
//                 placeholder="AAAA-MM-DD"
//                 value={draft.issuedAt}
//                 onChange={(e) =>
//                   setDraft((s) => ({ ...s, issuedAt: e.target.value }))
//                 }
//               />
//             </div>

//             <div className="space-y-1">
//               <div className="text-xs text-gray-600">Próximo control *</div>
//               <input
//                 type="date"
//                 className="border rounded px-3 h-[38px] w-full"
//                 placeholder="AAAA-MM-DD"
//                 value={draft.nextControlAt}
//                 onChange={(e) =>
//                   setDraft((s) => ({ ...s, nextControlAt: e.target.value }))
//                 }
//               />
//             </div>
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               type="button"
//               className="px-3 py-2 rounded-md border border-gray-400"
//               onClick={cancel}
//               disabled={saving}
//             >
//               Cancelar
//             </button>
//             <button
//               type="button"
//               className="px-3 py-2 rounded-md text-white disabled:opacity-50"
//               style={{ background: "var(--fc-primary)" }}
//               onClick={save}
//               disabled={saving}
//             >
//               Guardar
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { PeopleAPI } from "../../../api/people.api";

const TYPES = [
  "C",
  "B",
  "A4",
  "A5",
  "A2",
  "A2*",
  "A1",
  "A1*",
  "A3",
  "D",
  "E",
  "F",
];

const emptyForm = {
  type: "",
  folioNumber: "",
  issuer: "",
  firstIssuedAt: "",
  issuedAt: "",
  nextControlAt: "",
};

// Requerimiento: no permitir guardar una licencia con fechas en blanco.
// Interpretación operacional: issuedAt y nextControlAt son obligatorias.
function validateLicenseDraft(draft) {
  const missing = [];
  if (!String(draft.type || "").trim()) missing.push("Tipo");
  if (!String(draft.issuedAt || "").trim()) missing.push("Fecha de emisión");
  if (!String(draft.nextControlAt || "").trim())
    missing.push("Fecha de control");
  return missing;
}

function toPayload(draft) {
  return {
    type: draft.type || "",
    folioNumber: draft.folioNumber || "",
    issuer: draft.issuer || "",
    firstIssuedAt: draft.firstIssuedAt || null,
    issuedAt: draft.issuedAt || null,
    nextControlAt: draft.nextControlAt || null,
  };
}

export default function LicensesTab({ person, onChange, onDirtyChange }) {
  const personId = person?._id;
  const licenses = person?.licenses || [];

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(emptyForm);

  const editing = Boolean(editId);
  const isDirty = useMemo(() => {
    if (creating) return JSON.stringify(draft) !== JSON.stringify(emptyForm);
    if (!editing) return false;
    const current = licenses.find((l) => String(l._id) === String(editId));
    if (!current) return false;
    const normalized = {
      type: current.type || "",
      folioNumber: current.folioNumber || "",
      issuer: current.issuer || "",
      firstIssuedAt: current.firstIssuedAt
        ? String(current.firstIssuedAt).slice(0, 10)
        : "",
      issuedAt: current.issuedAt ? String(current.issuedAt).slice(0, 10) : "",
      nextControlAt: current.nextControlAt
        ? String(current.nextControlAt).slice(0, 10)
        : "",
    };
    return JSON.stringify(draft) !== JSON.stringify(normalized);
  }, [creating, editing, editId, draft, licenses]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const startCreate = () => {
    setCreating(true);
    setEditId(null);
    setDraft(emptyForm);
  };

  const startEdit = (l) => {
    setCreating(false);
    setEditId(l._id);
    setDraft({
      type: l.type || "",
      folioNumber: l.folioNumber || "",
      issuer: l.issuer || "",
      firstIssuedAt: l.firstIssuedAt
        ? String(l.firstIssuedAt).slice(0, 10)
        : "",
      issuedAt: l.issuedAt ? String(l.issuedAt).slice(0, 10) : "",
      nextControlAt: l.nextControlAt
        ? String(l.nextControlAt).slice(0, 10)
        : "",
    });
  };

  const cancel = () => {
    setCreating(false);
    setEditId(null);
    setDraft(emptyForm);
    onDirtyChange?.(false);
  };

  const save = async () => {
    if (!personId) return;
    const missing = validateLicenseDraft(draft);
    if (missing.length) {
      alert("Información incompleta. Revisa: " + missing.join(", "));
      return;
    }

    // Si no hay cambios, no hacemos nada y volvemos al listado.
    if (!isDirty) {
      cancel();
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(draft);
      if (creating) {
        const { data } = await PeopleAPI.addLicense(personId, payload);
        const item = data?.item;
        onChange?.((prev) => ({
          ...(prev || person),
          licenses: [...(prev?.licenses || licenses), item].filter(Boolean),
        }));
        alert("Licencia guardada con éxito");
      } else {
        const { data } = await PeopleAPI.updateLicense(
          personId,
          editId,
          payload,
        );
        const item = data?.item;
        onChange?.((prev) => ({
          ...(prev || person),
          licenses: (prev?.licenses || licenses).map((x) =>
            String(x._id) === String(editId) ? item : x,
          ),
        }));
        alert("Licencia actualizada con éxito");
      }
      cancel();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message;
      alert(msg || "No fue posible guardar la licencia");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (licenseId) => {
    if (!personId) return;
    const ok = window.confirm("¿Eliminar licencia?");
    if (!ok) return;
    setSaving(true);
    try {
      await PeopleAPI.removeLicense(personId, licenseId);
      onChange?.((prev) => ({
        ...(prev || person),
        licenses: (prev?.licenses || licenses).filter(
          (l) => String(l._id) !== String(licenseId),
        ),
      }));
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message;
      alert(msg || "No fue posible eliminar la licencia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Licencias de conducir</div>
          <div className="text-xs text-gray-600">
            Listado en modo ver. Usa “Editar” para modificar una licencia.
          </div>
        </div>

        <button
          type="button"
          className="px-3 py-2 rounded-md text-white disabled:opacity-50"
          style={{ background: "var(--fc-primary)" }}
          disabled={saving || creating || editing}
          onClick={startCreate}
        >
          Nueva licencia
        </button>
      </div>

      <div className="border rounded overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
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
                <td className="p-2 font-medium">{l.type || "—"}</td>
                <td className="p-2">{l.folioNumber || "—"}</td>
                <td className="p-2">
                  {l.issuedAt ? String(l.issuedAt).slice(0, 10) : "—"}
                </td>
                <td className="p-2">
                  {l.nextControlAt ? String(l.nextControlAt).slice(0, 10) : "—"}
                </td>
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
                <td className="p-3 text-gray-500" colSpan={5}>
                  Sin licencias
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {(creating || editing) && (
        <div className="border rounded p-4 space-y-3">
          <div className="font-semibold">
            {creating ? "Crear licencia" : "Editar licencia"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-gray-600">Tipo *</div>
              <select
                className="border rounded px-3 h-[38px] w-full"
                value={draft.type}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, type: e.target.value }))
                }
              >
                <option value="">Selecciona tipo</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-600">Folio</div>
              <input
                className="border rounded px-3 h-[38px] w-full"
                placeholder="Ej: 123456 / Folio de licencia"
                value={draft.folioNumber}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, folioNumber: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-600">Emisor</div>
              <input
                className="border rounded px-3 h-[38px] w-full"
                placeholder="Ej: Registro Civil / Municipalidad"
                value={draft.issuer}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, issuer: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-600">Primera emisión</div>
              <input
                type="date"
                className="border rounded px-3 h-[38px] w-full"
                placeholder="AAAA-MM-DD"
                value={draft.firstIssuedAt}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, firstIssuedAt: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-600">Fecha de emisión *</div>
              <input
                type="date"
                className="border rounded px-3 h-[38px] w-full"
                placeholder="AAAA-MM-DD"
                value={draft.issuedAt}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, issuedAt: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-600">Próximo control *</div>
              <input
                type="date"
                className="border rounded px-3 h-[38px] w-full"
                placeholder="AAAA-MM-DD"
                value={draft.nextControlAt}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, nextControlAt: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-md border border-gray-400"
              onClick={cancel}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md text-white disabled:opacity-50"
              style={{ background: "var(--fc-primary)" }}
              onClick={save}
              disabled={saving}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
