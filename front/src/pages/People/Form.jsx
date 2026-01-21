// // // front/src/pages/People/Form.jsx
// // // -----------------------------------------------------------------------------
// // // RRHH - Ficha de Persona (Tabs)
// // // - Modo Ver: ?mode=view (bloquea inputs y muestra solo "Volver")
// // // - Modo Editar: default
// // // - Guard cambios sin guardar: hooks/UnsavedChangesGuard (useBlocker)
// // // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// import { PeopleAPI } from "../../api/people.api";
// import { PositionsAPI } from "../../api/positions.api";
// import { api, API_PREFIX } from "../../services/http";

// import LicensesTab from "./tabs/LicensesTab";
// import FilesTab from "./tabs/FilesTab";
// import DrivingTestsTab from "./tabs/DrivingTestsTab";

// const TABS = [
//   { key: "basic", label: "Básico" },
//   { key: "org", label: "Organización" },
//   { key: "licenses", label: "Licencias" },
//   { key: "files", label: "Archivos" },
//   { key: "tests", label: "Pruebas" },
// ];

// function pickId(v) {
//   if (!v) return "";
//   if (typeof v === "string") return v;
//   return v._id || "";
// }

// // RUN (Chile) - validación Módulo 11
// const normalizeRun = (v) =>
//   String(v || '')
//     .trim()
//     .toUpperCase()
//     .replace(/\./g, '')
//     .replace(/\s+/g, '')

// const isValidRun = (v) => {
//   const run = normalizeRun(v)
//   if (!run) return true

//   const clean = run.replace(/-/g, '')
//   if (clean.length < 2) return false
//   const body = clean.slice(0, -1)
//   const dv = clean.slice(-1)
//   if (!/^\d+$/.test(body)) return false

//   let sum = 0
//   let mul = 2
//   for (let i = body.length - 1; i >= 0; i--) {
//     sum += Number(body[i]) * mul
//     mul = mul === 7 ? 2 : mul + 1
//   }
//   const mod = 11 - (sum % 11)
//   const expected = mod === 11 ? '0' : mod === 10 ? 'K' : String(mod)
//   return dv === expected
// }

// export default function PeopleForm() {
//   const { id } = useParams();
//   // const isNew = id === "new" || !id;
//   const isNew = !id;
//   const navigate = useNavigate();

//   const [tab, setTab] = useState("basic");
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [positions, setPositions] = useState([]);
//   const [branches, setBranches] = useState([]);

//   const [personDoc, setPersonDoc] = useState(null); // versión completa desde backend
//   const [initial, setInitial] = useState(null);

//   const [form, setForm] = useState({
//     dni: "",
//     firstName: "",
//     lastName: "",
//     phone: "",
//     email: "",
//     birthDate: "",
//     birthPlace: "",
//     nationality: "",
//     hireDate: "",
//     active: true,

//     // Dirección (opcional)
//     addressLine1: "",
//     addressCity: "",
//     addressRegion: "",
//     addressCountry: "CL",

//     branchId: "",
//     positionId: "",
//   });

//   const isDirty = useMemo(() => {
//     if (!initial) return false;
//     return JSON.stringify(form) !== JSON.stringify(initial);
//   }, [form, initial]);

//   const runOk = useMemo(() => isValidRun(form.dni), [form.dni])

//   const normalizeBranchesPayload = (data) => {
//     // Compatibilidad con las distintas formas usadas en el proyecto (Vehículos)
//     return (
//       data?.items ||
//       data?.data?.items ||
//       data?.data ||
//       data?.list ||
//       []
//     );
//   };

//   const sortBranches = (list) => {
//     const copy = Array.isArray(list) ? [...list] : [];
//     copy.sort((a, b) => {
//       const ac = (a?.code || "").toString();
//       const bc = (b?.code || "").toString();
//       if (ac && bc && ac !== bc) return ac.localeCompare(bc, undefined, { numeric: true });
//       return (a?.name || "").toString().localeCompare((b?.name || "").toString(), undefined, { numeric: true });
//     });
//     return copy;
//   };

//   const loadRefs = async () => {
//     // branches (misma lógica robusta que Vehículos)
//     try {
//       const { data } = await api.get(`${API_PREFIX}/branches`, {
//         params: { page: 1, limit: 500 },
//       });
//       const payload = normalizeBranchesPayload(data);
//       setBranches(sortBranches(payload));
//     } catch {
//       setBranches([]);
//     }

//     // positions
//     try {
//       const { data } = await PositionsAPI.list({
//         page: 1,
//         limit: 200,
//         active: "true",
//       });
//       setPositions(data.items || []);
//     } catch {
//       setPositions([]);
//     }
//   };

//   const mapToForm = (p) => ({
//     dni: p.dni || "",
//     firstName: p.firstName || "",
//     lastName: p.lastName || "",
//     phone: p.phone || "",
//     email: p.email || "",
//     birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : "",
//     birthPlace: p.birthPlace || "",
//     nationality: p.nationality || "",
//     hireDate: p.hireDate ? String(p.hireDate).slice(0, 10) : "",
//     active: p.active !== false,

//     addressLine1: p.address?.line1 || "",
//     addressCity: p.address?.city || "",
//     addressRegion: p.address?.region || "",
//     addressCountry: p.address?.country || "CL",

//     branchId: pickId(p.branchId),
//     positionId: pickId(p.positionId),
//   });

//   const loadPerson = async () => {
//     if (isNew) {
//       setPersonDoc(null);
//       const base = { ...form };
//       setInitial(base);
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data } = await PeopleAPI.get(id);
//       const p = data.item;
//       setPersonDoc(p);

//       const mapped = mapToForm(p);
//       setForm(mapped);
//       setInitial(mapped);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRefs();
//   }, []);
//   useEffect(() => {
//     loadPerson();
//   }, [id]); // eslint-disable-line

//   //modificacion
//   //   const payload = useMemo(() => {
//   //   const out = { ...form }
//   //   if (!out.positionId) out.positionId = null
//   //   if (!out.email) delete out.email
//   //   return out
//   // }, [form])

//   const toDateOrNull = (v) => (v ? new Date(`${v}T00:00:00.000Z`) : null);

//   const payload = useMemo(() => {
//     const out = { ...form };

//     out.birthDate = toDateOrNull(out.birthDate);
//     out.hireDate = toDateOrNull(out.hireDate);

//     // address (opcional): solo enviamos si hay datos reales.
//     const address = {
//       line1: (out.addressLine1 || '').trim(),
//       city: (out.addressCity || '').trim(),
//       region: (out.addressRegion || '').trim(),
//       country: ((out.addressCountry || 'CL').trim() || 'CL').toUpperCase(),
//     };
//     delete out.addressLine1;
//     delete out.addressCity;
//     delete out.addressRegion;
//     delete out.addressCountry;

//     const hasAddress = Boolean(address.line1 || address.city || address.region);
//     if (hasAddress) out.address = address;

//     if (!out.positionId) out.positionId = null;
//     if (!out.email) delete out.email;

//     return out;
//   }, [form]);

//   const cancelChanges = async () => {
//     if (!isDirty) {
//       navigate('/people');
//       return;
//     }
//     // Modo edición con cambios → "Cancelar" (restaurar)
//     if (isNew) {
//       setForm(initial || form);
//       return;
//     }
//     await loadPerson();
//   };

//   const save = async () => {
//     if (!isValidRun(form.dni)) {
//       alert('RUN inválido. Verifica el dígito verificador (Módulo 11).')
//       return
//     }
//     setSaving(true);
//     try {
//       const { data } = isNew
//         ? await PeopleAPI.create(payload)
//         : await PeopleAPI.update(id, payload);

//       const saved = data.item;
//       if (isNew) {
//         navigate(`/people/${saved._id}`);
//         return;
//       }
//       await loadPerson();
//     } catch (err) {
//       console.error(err);
//       alert("No fue posible guardar");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const title = isNew
//     ? "Nueva persona"
//     : `Persona: ${form.lastName} ${form.firstName}`;

//   return (
//     <div className="p-6 space-y-6">
//       <UnsavedChangesGuard when={isDirty} />

//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-xl font-bold">{title}</h1>
//           <p className="text-sm text-gray-600">RRHH — ficha por pestañas.</p>
//         </div>
//       </div>

//       <div className="border-b flex gap-2">
//         {TABS.map((t) => (
//           <button
//             key={t.key}
//             type="button"
//             className={`px-4 py-2 text-sm rounded-xl border transition ${
//               tab === t.key
//                 ? 'bg-blue-600 text-white border-blue-600'
//                 : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
//             }`}
//             onClick={() => setTab(t.key)}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <div className="text-sm text-gray-600">Cargando…</div>
//       ) : (
//         <>
//           {tab === "basic" && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="RUN *"
//                 value={form.dni}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, dni: e.target.value }))
//                 }
//               />
//               {!runOk && (
//                 <div className="text-xs text-red-600 md:col-span-3">
//                   RUN inválido (verificación Módulo 11).
//                 </div>
//               )}
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Nombres *"
//                 value={form.firstName}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, firstName: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Apellidos *"
//                 value={form.lastName}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, lastName: e.target.value }))
//                 }
//               />

//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Teléfono"
//                 value={form.phone}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, phone: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2 md:col-span-2"
//                 placeholder="Email"
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, email: e.target.value }))
//                 }
//               />

//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">Fecha nacimiento</div>
//                 <input
//                   type="date"
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.birthDate}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, birthDate: e.target.value }))
//                   }
//                 />
//               </label>

//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Lugar nacimiento"
//                 value={form.birthPlace}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, birthPlace: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Nacionalidad"
//                 value={form.nationality}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, nationality: e.target.value }))
//                 }
//               />


//               {/* Dirección (opcional) */}
//               <input
//                 className="border rounded px-3 py-2 md:col-span-3"
//                 placeholder="Dirección (línea 1)"
//                 value={form.addressLine1}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, addressLine1: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Ciudad"
//                 value={form.addressCity}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, addressCity: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Región"
//                 value={form.addressRegion}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, addressRegion: e.target.value }))
//                 }
//               />
//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">País</div>
//                 <select
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.addressCountry}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, addressCountry: e.target.value }))
//                   }
//                 >
//                   <option value="CL">CL</option>
//                 </select>
//               </label>

//               <label className="flex items-center gap-2 text-sm md:col-span-3">
//                 <input
//                   type="checkbox"
//                   checked={form.active}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, active: e.target.checked }))
//                   }
//                 />
//                 Activo
//               </label>
//             </div>
//           )}

//           {tab === "org" && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">Sucursal *</div>
//                 <select
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.branchId}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, branchId: e.target.value }))
//                   }
//                 >
//                   <option value="">— Selecciona sucursal —</option>
//                   {branches.map((b) => (
//                     <option key={b._id} value={b._id}>
//                       {b.code} — {b.name}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">Cargo</div>
//                 <select
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.positionId || ""}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, positionId: e.target.value }))
//                   }
//                 >
//                   <option value="">— Sin cargo —</option>
//                   {positions.map((p) => (
//                     <option key={p._id} value={p._id}>
//                       {p.name}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">Fecha contratación</div>
//                 <input
//                   type="date"
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.hireDate}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, hireDate: e.target.value }))
//                   }
//                 />
//               </label>
//             </div>
//           )}

//           {tab === "licenses" && (
//             <LicensesTab
//               person={personDoc || { _id: isNew ? null : id, licenses: [] }}
//               onChange={(updater) => {
//                 setPersonDoc((prev) =>
//                   typeof updater === "function"
//                     ? updater(prev || { _id: id, licenses: [] })
//                     : updater
//                 );
//               }}
//             />
//           )}

//           {tab === "files" && (
//             <FilesTab
//               person={
//                 personDoc || {
//                   _id: isNew ? null : id,
//                   photo: null,
//                   documents: [],
//                 }
//               }
//               onPersonReload={loadPerson}
//             />
//           )}

//           {tab === "tests" && (
//             <DrivingTestsTab
//               person={
//                 personDoc || { _id: isNew ? null : id, branchId: form.branchId }
//               }
//             />
//           )}

//           {isNew && (
//             <div className="text-sm text-amber-700 border border-amber-200 bg-amber-50 rounded p-3">
//               Nota: para Licencias / Archivos / Pruebas primero debes guardar la
//               persona.
//             </div>
//           )}
//         </>
//       )}

//       {/* Acciones inferiores (únicas) */}
//       <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-slate-200 p-3 flex justify-end gap-2">
//         <button
//           type="button"
//           className="rounded-xl border px-4 py-2"
//           onClick={cancelChanges}
//           disabled={saving || loading}
//         >
//           {isDirty ? 'Cancelar' : 'Volver'}
//         </button>
//         <button
//           type="button"
//           className="rounded-xl bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
//           onClick={save}
//           disabled={saving || loading}
//         >
//           Guardar
//         </button>
//       </div>
//     </div>
//   );
// }

// // v2 160126

// // // front/src/pages/People/Form.jsx
// // // -----------------------------------------------------------------------------
// // // RRHH - Ficha de Persona (Tabs)
// // // - Modo Ver: ?mode=view (bloquea inputs y muestra solo "Volver")
// // // - Modo Editar: default
// // // - Guard cambios sin guardar: hooks/UnsavedChangesGuard (useBlocker)
// // // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// import { PeopleAPI } from "../../api/people.api";
// import { PositionsAPI } from "../../api/positions.api";
// import { api, API_PREFIX } from "../../services/http";

// import LicensesTab from "./tabs/LicensesTab";
// import FilesTab from "./tabs/FilesTab";
// import DrivingTestsTab from "./tabs/DrivingTestsTab";

// const TABS = [
//   { key: "basic", label: "Básico" },
//   { key: "org", label: "Organización" },
//   { key: "licenses", label: "Licencias" },
//   { key: "files", label: "Archivos" },
//   { key: "tests", label: "Pruebas" },
// ];

// function pickId(v) {
//   if (!v) return "";
//   if (typeof v === "string") return v;
//   return v._id || "";
// }

// // RUN (Chile) - validación Módulo 11
// const normalizeRun = (v) =>
//   String(v || '')
//     .trim()
//     .toUpperCase()
//     .replace(/\./g, '')
//     .replace(/\s+/g, '')

// const isValidRun = (v) => {
//   const run = normalizeRun(v)
//   if (!run) return true

//   const clean = run.replace(/-/g, '')
//   if (clean.length < 2) return false
//   const body = clean.slice(0, -1)
//   const dv = clean.slice(-1)
//   if (!/^\d+$/.test(body)) return false

//   let sum = 0
//   let mul = 2
//   for (let i = body.length - 1; i >= 0; i--) {
//     sum += Number(body[i]) * mul
//     mul = mul === 7 ? 2 : mul + 1
//   }
//   const mod = 11 - (sum % 11)
//   const expected = mod === 11 ? '0' : mod === 10 ? 'K' : String(mod)
//   return dv === expected
// }

// export default function PeopleForm() {
//   const { id } = useParams();
//   // const isNew = id === "new" || !id;
//   const isNew = !id;
//   const navigate = useNavigate();

//   const [tab, setTab] = useState("basic");
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [positions, setPositions] = useState([]);
//   const [branches, setBranches] = useState([]);

//   const [personDoc, setPersonDoc] = useState(null); // versión completa desde backend
//   const [initial, setInitial] = useState(null);

//   const [form, setForm] = useState({
//     dni: "",
//     firstName: "",
//     lastName: "",
//     phone: "",
//     email: "",
//     birthDate: "",
//     birthPlace: "",
//     nationality: "",
//     hireDate: "",
//     active: true,

//     // Dirección (opcional)
//     addressLine1: "",
//     addressCity: "",
//     addressRegion: "",
//     addressCountry: "CL",

//     branchId: "",
//     positionId: "",
//   });

//   const isDirty = useMemo(() => {
//     if (!initial) return false;
//     return JSON.stringify(form) !== JSON.stringify(initial);
//   }, [form, initial]);

//   const runOk = useMemo(() => isValidRun(form.dni), [form.dni])

//   const normalizeBranchesPayload = (data) => {
//     // Compatibilidad con las distintas formas usadas en el proyecto (Vehículos)
//     return (
//       data?.items ||
//       data?.data?.items ||
//       data?.data ||
//       data?.list ||
//       []
//     );
//   };

//   const sortBranches = (list) => {
//     const copy = Array.isArray(list) ? [...list] : [];
//     copy.sort((a, b) => {
//       const ac = (a?.code || "").toString();
//       const bc = (b?.code || "").toString();
//       if (ac && bc && ac !== bc) return ac.localeCompare(bc, undefined, { numeric: true });
//       return (a?.name || "").toString().localeCompare((b?.name || "").toString(), undefined, { numeric: true });
//     });
//     return copy;
//   };

//   const loadRefs = async () => {
//     // branches (misma lógica robusta que Vehículos)
//     try {
//       const { data } = await BranchesAPI.list({ page: 1, limit: 500, q: '' })
//       const payload = normalizeBranchesPayload(data);
//       setBranches(sortBranches(payload));
//     } catch {
//       setBranches([]);
//     }

//     // positions
//     try {
//       const { data } = await PositionsAPI.list({
//         page: 1,
//         limit: 500,
//         q: '',
//         active: "true",
//       });
//       const items = data?.items || data?.data?.items || data?.data || []
//       setPositions(Array.isArray(items) ? items : []);
//     } catch {
//       setPositions([]);
//     }
//   };

//   const mapToForm = (p) => ({
//     dni: p.dni || "",
//     firstName: p.firstName || "",
//     lastName: p.lastName || "",
//     phone: p.phone || "",
//     email: p.email || "",
//     birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : "",
//     birthPlace: p.birthPlace || "",
//     nationality: p.nationality || "",
//     hireDate: p.hireDate ? String(p.hireDate).slice(0, 10) : "",
//     active: p.active !== false,

//     addressLine1: p.address?.line1 || "",
//     addressCity: p.address?.city || "",
//     addressRegion: p.address?.region || "",
//     addressCountry: p.address?.country || "CL",

//     branchId: pickId(p.branchId),
//     positionId: pickId(p.positionId),
//   });

//   const loadPerson = async () => {
//     if (isNew) {
//       setPersonDoc(null);
//       const base = { ...form };
//       setInitial(base);
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data } = await PeopleAPI.get(id);
//       const p = data.item;
//       setPersonDoc(p);

//       const mapped = mapToForm(p);
//       setForm(mapped);
//       setInitial(mapped);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRefs();
//   }, []);
//   useEffect(() => {
//     loadPerson();
//   }, [id]); // eslint-disable-line

//   //modificacion
//   //   const payload = useMemo(() => {
//   //   const out = { ...form }
//   //   if (!out.positionId) out.positionId = null
//   //   if (!out.email) delete out.email
//   //   return out
//   // }, [form])

//   const toDateOrNull = (v) => (v ? new Date(`${v}T00:00:00.000Z`) : null);

//   const payload = useMemo(() => {
//     const out = { ...form };

//     out.birthDate = toDateOrNull(out.birthDate);
//     out.hireDate = toDateOrNull(out.hireDate);

//     // address (opcional): solo enviamos si hay datos reales.
//     const address = {
//       line1: (out.addressLine1 || '').trim(),
//       city: (out.addressCity || '').trim(),
//       region: (out.addressRegion || '').trim(),
//       country: ((out.addressCountry || 'CL').trim() || 'CL').toUpperCase(),
//     };
//     delete out.addressLine1;
//     delete out.addressCity;
//     delete out.addressRegion;
//     delete out.addressCountry;

//     const hasAddress = Boolean(address.line1 || address.city || address.region);
//     if (hasAddress) out.address = address;

//     if (!out.positionId) out.positionId = null;
//     if (!out.email) delete out.email;

//     return out;
//   }, [form]);

//   const cancelChanges = async () => {
//     if (!isDirty) {
//       navigate('/people');
//       return;
//     }
//     // Modo edición con cambios → "Cancelar" (restaurar)
//     if (isNew) {
//       setForm(initial || form);
//       return;
//     }
//     await loadPerson();
//   };

//   const save = async () => {
//     // Validación front (evita el mensaje genérico "No fue posible guardar")
//     const missing = []
//     if (!String(form.dni || '').trim()) missing.push('RUN')
//     if (!runOk) missing.push('RUN')
//     if (!String(form.firstName || '').trim()) missing.push('Nombres')
//     if (!String(form.lastName || '').trim()) missing.push('Apellidos')
//     if (!String(form.branchId || '').trim()) missing.push('Sucursal')

//     if (missing.length) {
//       // Requerimiento: mensaje diciente cuando hay errores de formulario
//       alert('Existen errores en el formulario. Revisa los campos obligatorios.')
//       return
//     }

//     // Si el RUN es válido pero venía sin guion, lo normalizamos al guardar.
//     const formattedRun = formatRunWithDash(form.dni)
//     if (formattedRun && formattedRun !== form.dni) {
//       setForm((s) => ({ ...s, dni: formattedRun }))
//     }

//     setSaving(true);
//     try {
//       const { data } = isNew
//         ? await PeopleAPI.create(payload)
//         : await PeopleAPI.update(id, payload);

//       const saved = data.item;
//       if (isNew) {
//         navigate(`/people/${saved._id}`);
//         return;
//       }
//       await loadPerson();
//     } catch (err) {
//       console.error(err);
//       const msg = err?.response?.data?.message || err?.message
//       // Si es error de validación, mostramos mensaje diciente.
//       if (err?.response?.status === 400) {
//         alert(msg || 'Existen errores en el formulario. Revisa los campos.')
//       } else {
//         alert(msg || 'No fue posible guardar')
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   const title = isNew
//     ? "Nueva persona"
//     : `Persona: ${form.lastName} ${form.firstName}`;

//   return (
//     <div className="p-6 space-y-6">
//       <UnsavedChangesGuard when={isDirty} />

//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-xl font-bold">{title}</h1>
//           <p className="text-sm text-gray-600">RRHH — ficha por pestañas.</p>
//         </div>
//       </div>

//       <div className="border-b flex gap-2">
//         {TABS.map((t) => (
//           <button
//             key={t.key}
//             type="button"
//             className={`px-4 py-2 text-sm rounded-md border transition ${
//               tab === t.key
//                 ? 'text-white'
//                 : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
//             }`}
//             style={
//               tab === t.key
//                 ? { background: 'var(--fc-primary)', borderColor: 'var(--fc-primary)' }
//                 : undefined
//             }
//             onClick={() => setTab(t.key)}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <div className="text-sm text-gray-600">Cargando…</div>
//       ) : (
//         <>
//           {tab === "basic" && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
//               <input
//                 className={`border rounded px-3 py-2 ${!runOk ? 'border-red-500' : 'border-gray-400'}`}
//                 placeholder="RUN *"
//                 value={form.dni}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, dni: e.target.value }))
//                 }
//                 onBlur={() => {
//                   const formatted = formatRunWithDash(form.dni)
//                   // Requerimiento: si es válido pero viene sin guion, lo completamos al salir del campo
//                   if (formatted && formatted !== form.dni) {
//                     setForm((s) => ({ ...s, dni: formatted }))
//                   }
//                 }}
//               />
//               {!runOk && (
//                 <div className="text-xs text-red-600 md:col-span-3">
//                   RUN inválido (verificación Módulo 11).
//                 </div>
//               )}
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Nombres *"
//                 value={form.firstName}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, firstName: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Apellidos *"
//                 value={form.lastName}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, lastName: e.target.value }))
//                 }
//               />

//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Teléfono"
//                 value={form.phone}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, phone: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2 md:col-span-2"
//                 placeholder="Email"
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, email: e.target.value }))
//                 }
//               />

//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">Fecha nacimiento</div>
//                 <input
//                   type="date"
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.birthDate}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, birthDate: e.target.value }))
//                   }
//                 />
//               </label>

//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Lugar nacimiento"
//                 value={form.birthPlace}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, birthPlace: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Nacionalidad"
//                 value={form.nationality}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, nationality: e.target.value }))
//                 }
//               />


//               {/* Dirección (opcional) */}
//               <input
//                 className="border rounded px-3 py-2 md:col-span-3"
//                 placeholder="Dirección (línea 1)"
//                 value={form.addressLine1}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, addressLine1: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Ciudad"
//                 value={form.addressCity}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, addressCity: e.target.value }))
//                 }
//               />
//               <input
//                 className="border rounded px-3 py-2"
//                 placeholder="Región"
//                 value={form.addressRegion}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, addressRegion: e.target.value }))
//                 }
//               />
//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">País</div>
//                 <select
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.addressCountry}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, addressCountry: e.target.value }))
//                   }
//                 >
//                   <option value="CL">CL</option>
//                 </select>
//               </label>

//               <label className="flex items-center gap-2 text-sm md:col-span-3">
//                 <input
//                   type="checkbox"
//                   checked={form.active}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, active: e.target.checked }))
//                   }
//                 />
//                 Activo
//               </label>
//             </div>
//           )}

//           {tab === "org" && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">Sucursal *</div>
//                 <select
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.branchId}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, branchId: e.target.value }))
//                   }
//                 >
//                   <option value="">— Selecciona sucursal —</option>
//                   {branches.map((b) => (
//                     <option key={b._id} value={b._id}>
//                       {b.code} — {b.name}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">Cargo</div>
//                 <select
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.positionId || ""}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, positionId: e.target.value }))
//                   }
//                 >
//                   <option value="">— Sin cargo —</option>
//                   {positions.map((p) => (
//                     <option key={p._id} value={p._id}>
//                       {p.name}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <label className="text-sm">
//                 <div className="text-gray-600 mb-1">Fecha contratación</div>
//                 <input
//                   type="date"
//                   className="border rounded px-3 py-2 w-full"
//                   value={form.hireDate}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, hireDate: e.target.value }))
//                   }
//                 />
//               </label>
//             </div>
//           )}

//           {tab === "licenses" && (
//             <LicensesTab
//               person={personDoc || { _id: isNew ? null : id, licenses: [] }}
//               onChange={(updater) => {
//                 setPersonDoc((prev) =>
//                   typeof updater === "function"
//                     ? updater(prev || { _id: id, licenses: [] })
//                     : updater
//                 );
//               }}
//             />
//           )}

//           {tab === "files" && (
//             <FilesTab
//               person={
//                 personDoc || {
//                   _id: isNew ? null : id,
//                   photo: null,
//                   documents: [],
//                 }
//               }
//               onPersonReload={loadPerson}
//             />
//           )}

//           {tab === "tests" && (
//             <DrivingTestsTab
//               person={
//                 personDoc || { _id: isNew ? null : id, branchId: form.branchId }
//               }
//             />
//           )}

//           {isNew && (
//             <div className="text-sm text-amber-700 border border-amber-200 bg-amber-50 rounded p-3">
//               Nota: para Licencias / Archivos / Pruebas primero debes guardar la
//               persona.
//             </div>
//           )}
//         </>
//       )}

//       {/* Acciones inferiores (únicas) */}
//       <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-slate-200 p-3 flex justify-end gap-2">
//         <button
//           type="button"
//           className="rounded-md border border-gray-400 px-4 py-2 text-sm"
//           onClick={cancelChanges}
//           disabled={saving || loading}
//         >
//           {isDirty ? 'Cancelar' : 'Volver'}
//         </button>
//         <button
//           type="button"
//           className="rounded-md text-white px-4 py-2 text-sm disabled:opacity-50"
//           style={{ background: 'var(--fc-primary)' }}
//           onClick={save}
//           disabled={saving || loading}
//         >
//           Guardar
//         </button>
//       </div>
//     </div>
//   );
// }

// // front/src/pages/People/Form.jsx
// // -----------------------------------------------------------------------------
// // RRHH - Ficha de Persona (Tabs)
// // - Modo Ver: ?mode=view (bloquea inputs y muestra solo "Volver")
// // - Modo Editar: default
// // - Guard cambios sin guardar: hooks/UnsavedChangesGuard (useBlocker)
// // -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { PeopleAPI } from "../../api/people.api";
import { PositionsAPI } from "../../api/positions.api";
import { BranchesAPI } from "../../api/branches.api";

// Datos Chile (regiones/comunas)
import regionesComunas from "../../data/chile/comunas-regiones.json";

import LicensesTab from "./tabs/LicensesTab";
import FilesTab from "./tabs/FilesTab";
import DrivingTestsTab from "./tabs/DrivingTestsTab";

// import regionesComunas from '../../data/chile/comunas-regiones.json'

const TABS = [
  { key: "basic", label: "Básico" },
  { key: "org", label: "Organización" },
  { key: "licenses", label: "Licencias" },
  { key: "files", label: "Archivos" },
  { key: "tests", label: "Pruebas" },
];

function pickId(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v._id || "";
}

// RUN (Chile) - validación Módulo 11
const normalizeRun = (v) =>
  String(v || '')
    .trim()
    .toUpperCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    // deja solo dígitos, K y guion
    .replace(/[^0-9K-]/g, '')

const isValidRun = (v) => {
  const run = normalizeRun(v)
  if (!run) return true

  const clean = run.replace(/-/g, '')
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false

  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const mod = 11 - (sum % 11)
  const expected = mod === 11 ? '0' : mod === 10 ? 'K' : String(mod)
  return dv === expected
}

// Formatea RUN a 12345678-K (agrega guion si falta) SOLO si el RUN es válido.
const formatRunWithDash = (v) => {
  const run = normalizeRun(v)
  if (!run) return ''
  const clean = run.replace(/-/g, '')
  if (clean.length < 2) return run
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = `${body}-${dv}`
  return isValidRun(formatted) ? formatted : run
}

export default function PeopleForm() {
  const { id } = useParams();
  // const isNew = id === "new" || !id;
  const isNew = !id;
  const navigate = useNavigate();

  const [tab, setTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);

  const [personDoc, setPersonDoc] = useState(null); // versión completa desde backend
  const [initial, setInitial] = useState(null);

  const [form, setForm] = useState({
    dni: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthDate: "",
    birthPlace: "",
    nationality: "",
    hireDate: "",
    active: true,

    // Dirección (opcional)
    addressLine1: "",
    addressCity: "", // ciudad (residencia)
    addressComuna: "", // comuna (residencia)
    addressRegion: "", // región (residencia)
    addressCountry: "CL",

    branchId: "",
    positionId: "",
  });

  const isDirty = useMemo(() => {
    if (!initial) return false;
    return JSON.stringify(form) !== JSON.stringify(initial);
  }, [form, initial]);

  const runOk = useMemo(() => isValidRun(form.dni), [form.dni])

  // Regiones/Comunas (Chile) desde JSON
  const REGIONES = useMemo(() => regionesComunas?.regiones || [], [])
  const comunasForSelectedRegion = useMemo(() => {
    const r = REGIONES.find((x) => x?.region === form.addressRegion)
    return Array.isArray(r?.comunas) ? r.comunas : []
  }, [REGIONES, form.addressRegion])

  const normalizeBranchesPayload = (data) => {
    // Compatibilidad con las distintas formas usadas en el proyecto (Vehículos)
    return (
      data?.items ||
      data?.data?.items ||
      data?.data ||
      data?.list ||
      []
    );
  };

  const sortBranches = (list) => {
    const copy = Array.isArray(list) ? [...list] : [];
    copy.sort((a, b) => {
      const ac = (a?.code || "").toString();
      const bc = (b?.code || "").toString();
      if (ac && bc && ac !== bc) return ac.localeCompare(bc, undefined, { numeric: true });
      return (a?.name || "").toString().localeCompare((b?.name || "").toString(), undefined, { numeric: true });
    });
    return copy;
  };

  const loadRefs = async () => {
    // branches (misma lógica robusta que Vehículos)
    try {
      const { data } = await BranchesAPI.list({ page: 1, limit: 500, q: '' })
      const payload = normalizeBranchesPayload(data);
      setBranches(sortBranches(payload));
    } catch {
      setBranches([]);
    }

    // positions
    try {
      const { data } = await PositionsAPI.list({
        page: 1,
        limit: 500,
        q: '',
        active: "true",
      });
      const items = data?.items || data?.data?.items || data?.data || []
      setPositions(Array.isArray(items) ? items : []);
    } catch {
      setPositions([]);
    }
  };

  const mapToForm = (p) => ({
    dni: p.dni || "",
    firstName: p.firstName || "",
    lastName: p.lastName || "",
    phone: p.phone || "",
    email: p.email || "",
    birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : "",
    birthPlace: p.birthPlace || "",
    nationality: p.nationality || "",
    hireDate: p.hireDate ? String(p.hireDate).slice(0, 10) : "",
    active: p.active !== false,

    addressLine1: p.address?.line1 || "",
    addressCity: p.address?.city || "",
    addressComuna: p.address?.comuna || "",
    addressRegion: p.address?.region || "",
    addressCountry: p.address?.country || "CL",

    branchId: pickId(p.branchId),
    positionId: pickId(p.positionId),
  });

  const loadPerson = async () => {
    if (isNew) {
      setPersonDoc(null);
      const base = { ...form };
      setInitial(base);
      return;
    }

    setLoading(true);
    try {
      const { data } = await PeopleAPI.get(id);
      const p = data.item;
      setPersonDoc(p);

      const mapped = mapToForm(p);
      setForm(mapped);
      setInitial(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
  }, []);
  useEffect(() => {
    loadPerson();
  }, [id]); // eslint-disable-line

  //modificacion
  //   const payload = useMemo(() => {
  //   const out = { ...form }
  //   if (!out.positionId) out.positionId = null
  //   if (!out.email) delete out.email
  //   return out
  // }, [form])

  const toDateOrNull = (v) => (v ? new Date(`${v}T00:00:00.000Z`) : null);

  const payload = useMemo(() => {
    const out = { ...form };

    out.birthDate = toDateOrNull(out.birthDate);
    out.hireDate = toDateOrNull(out.hireDate);

    // address (opcional): solo enviamos si hay datos reales.
    const address = {
      line1: (out.addressLine1 || '').trim(),
      city: (out.addressCity || '').trim(),
      comuna: (out.addressComuna || '').trim(),
      region: (out.addressRegion || '').trim(),
      country: ((out.addressCountry || 'CL').trim() || 'CL').toUpperCase(),
    };
    delete out.addressLine1;
    delete out.addressCity;
    delete out.addressComuna;
    delete out.addressRegion;
    delete out.addressCountry;

    const hasAddress = Boolean(address.line1 || address.city || address.comuna || address.region);
    if (hasAddress) out.address = address;

    if (!out.positionId) out.positionId = null;
    if (!out.email) delete out.email;

    return out;
  }, [form]);

  const cancelChanges = async () => {
    if (!isDirty) {
      navigate('/people');
      return;
    }
    // Modo edición con cambios → "Cancelar" (restaurar)
    if (isNew) {
      setForm(initial || form);
      return;
    }
    await loadPerson();
  };

  const save = async () => {
    // Validación front (evita el mensaje genérico "No fue posible guardar")
    const missing = []
    if (!String(form.dni || '').trim()) missing.push('RUN')
    if (!runOk) missing.push('RUN')
    if (!String(form.firstName || '').trim()) missing.push('Nombres')
    if (!String(form.lastName || '').trim()) missing.push('Apellidos')
    if (!String(form.branchId || '').trim()) missing.push('Sucursal')

    if (missing.length) {
      // Requerimiento: mensaje diciente cuando hay errores de formulario
      alert('Existen errores en el formulario. Revisa los campos obligatorios.')
      return
    }

    // Si el RUN es válido pero venía sin guion, lo normalizamos al guardar.
    const formattedRun = formatRunWithDash(form.dni)
    if (formattedRun && formattedRun !== form.dni) {
      setForm((s) => ({ ...s, dni: formattedRun }))
    }

    setSaving(true);
    try {
      const { data } = isNew
        ? await PeopleAPI.create(payload)
        : await PeopleAPI.update(id, payload);

      const saved = data.item;
      if (isNew) {
        navigate(`/people/${saved._id}`);
        return;
      }
      await loadPerson();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message
      // Si es error de validación, mostramos mensaje diciente.
      if (err?.response?.status === 400) {
        alert(msg || 'Existen errores en el formulario. Revisa los campos.')
      } else {
        alert(msg || 'No fue posible guardar')
      }
    } finally {
      setSaving(false);
    }
  };

  const title = isNew
    ? "Nueva persona"
    : `Persona: ${form.lastName} ${form.firstName}`;

  return (
    <div className="p-6 space-y-6">
      <UnsavedChangesGuard when={isDirty} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600">RRHH — ficha por pestañas.</p>
        </div>
      </div>

      <div className="border-b flex gap-2">
        {TABS.map((t) => (
          (() => {
            const disabled = isNew && (t.key === 'licenses' || t.key === 'files' || t.key === 'tests')
            return (
          <button
            key={t.key}
            type="button"
            disabled={disabled}
            className={`px-4 py-2 text-sm rounded-md border transition ${
              tab === t.key
                ? 'text-white'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            style={
              tab === t.key
                ? { background: 'var(--fc-primary)', borderColor: 'var(--fc-primary)' }
                : disabled
                  ? { opacity: 0.55, cursor: 'not-allowed' }
                  : undefined
            }
            onClick={() => {
              if (disabled) return
              setTab(t.key)
            }}
          >
            {t.label}
          </button>
            )
          })()
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Cargando…</div>
      ) : (
        <>
          {tab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
              <input
                className={`border rounded px-3 h-[38px] ${!runOk ? 'border-red-500' : 'border-gray-400'}`}
                placeholder="RUN *"
                value={form.dni}
                onChange={(e) =>
                  setForm((s) => ({ ...s, dni: e.target.value }))
                }
                onBlur={() => {
                  const formatted = formatRunWithDash(form.dni)
                  // Requerimiento: si es válido pero viene sin guion, lo completamos al salir del campo
                  if (formatted && formatted !== form.dni) {
                    setForm((s) => ({ ...s, dni: formatted }))
                  }
                }}
              />
              {!runOk && (
                <div className="text-xs text-red-600 md:col-span-3">
                  RUN inválido (verificación Módulo 11).
                </div>
              )}
              <input
                className="border rounded px-3 h-[38px]"
                placeholder="Nombres *"
                value={form.firstName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, firstName: e.target.value }))
                }
              />
              <input
                className="border rounded px-3 h-[38px]"
                placeholder="Apellidos *"
                value={form.lastName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, lastName: e.target.value }))
                }
              />

              <input
                className="border rounded px-3 h-[38px]"
                placeholder="Teléfono"
                value={form.phone}
                onChange={(e) =>
                  setForm((s) => ({ ...s, phone: e.target.value }))
                }
              />
              <input
                className="border rounded px-3 h-[38px] md:col-span-2"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((s) => ({ ...s, email: e.target.value }))
                }
              />

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Fecha nacimiento</div>
                <input
                  type="date"
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, birthDate: e.target.value }))
                  }
                />
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Lugar nacimiento</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.birthPlace}
                  onChange={(e) => setForm((s) => ({ ...s, birthPlace: e.target.value }))}
                  placeholder="Ej: Santiago"
                />
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Nacionalidad</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.nationality}
                  onChange={(e) => setForm((s) => ({ ...s, nationality: e.target.value }))}
                  placeholder="Ej: Chilena"
                />
              </label>


              {/* Dirección (opcional) */}
              <label className="text-sm md:col-span-3">
                <div className="text-gray-600 mb-1">Dirección (línea 1)</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressLine1}
                  onChange={(e) => setForm((s) => ({ ...s, addressLine1: e.target.value }))}
                  placeholder="Calle y número"
                />
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Región (residencia)</div>
                <select
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressRegion}
                  onChange={(e) => {
                    const nextRegion = e.target.value
                    setForm((s) => ({ ...s, addressRegion: nextRegion, addressComuna: '' }))
                  }}
                >
                  <option value="">— Selecciona región —</option>
                  {REGIONES.map((r) => (
                    <option key={r.region} value={r.region}>{r.region}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Comuna (residencia)</div>
                <select
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressComuna}
                  onChange={(e) => setForm((s) => ({ ...s, addressComuna: e.target.value }))}
                  disabled={!form.addressRegion}
                >
                  <option value="">— Selecciona comuna —</option>
                  {comunasForSelectedRegion.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Ciudad (residencia)</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressCity}
                  onChange={(e) => setForm((s) => ({ ...s, addressCity: e.target.value }))}
                  placeholder="Ej: Santiago"
                />
              </label>
              <label className="text-sm">
                <div className="text-gray-600 mb-1">País</div>
                <select
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressCountry}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, addressCountry: e.target.value }))
                  }
                >
                  <option value="CL">CL</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm md:col-span-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, active: e.target.checked }))
                  }
                />
                Activo
              </label>
            </div>
          )}

          {tab === "org" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
              <label className="text-sm">
                <div className="text-gray-600 mb-1">Sucursal *</div>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={form.branchId}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, branchId: e.target.value }))
                  }
                >
                  <option value="">— Selecciona sucursal —</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Cargo</div>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={form.positionId || ""}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, positionId: e.target.value }))
                  }
                >
                  <option value="">— Sin cargo —</option>
                  {positions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Fecha contratación</div>
                <input
                  type="date"
                  className="border rounded px-3 py-2 w-full"
                  value={form.hireDate}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, hireDate: e.target.value }))
                  }
                />
              </label>
            </div>
          )}

          {tab === "licenses" && (
            <LicensesTab
              person={personDoc || { _id: isNew ? null : id, licenses: [] }}
              onChange={(updater) => {
                setPersonDoc((prev) =>
                  typeof updater === "function"
                    ? updater(prev || { _id: id, licenses: [] })
                    : updater
                );
              }}
            />
          )}

          {tab === "files" && (
            <FilesTab
              person={
                personDoc || {
                  _id: isNew ? null : id,
                  photo: null,
                  documents: [],
                }
              }
              onPersonReload={loadPerson}
            />
          )}

          {tab === "tests" && (
            <DrivingTestsTab
              person={
                personDoc || { _id: isNew ? null : id, branchId: form.branchId }
              }
            />
          )}

          {isNew && (
            <div className="text-sm text-amber-700 border border-amber-200 bg-amber-50 rounded p-3">
              Nota: para Licencias / Archivos / Pruebas primero debes guardar la
              persona.
            </div>
          )}
        </>
      )}

      {/* Acciones inferiores (únicas) */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-slate-200 p-3 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-md border border-gray-400 px-4 py-2 text-sm"
          onClick={cancelChanges}
          disabled={saving || loading}
        >
          {isDirty ? 'Cancelar' : 'Volver'}
        </button>
        <button
          type="button"
          className="rounded-md text-white px-4 py-2 text-sm disabled:opacity-50"
          style={{ background: 'var(--fc-primary)' }}
          onClick={save}
          disabled={saving || loading}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

