// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // Ficha de Vehículos (Básico, Técnico, Documentos, Medios, Inventario, Accidentes, Combustible)
// // - Estado: SELECT (valores de catálogo si los usas; aquí simple input de texto por defecto 'ACTIVE')
// // - Año: min=1950, max=(AñoActual+1) + validación
// // - Fechas legales: se mantienen en 'yyyy-MM-dd' en el estado; al enviar → Date real.
// // - Legal: Padrón con 3 fechas (adquisición/inscripción/emisión), emisor por defecto en MAYÚSCULAS editable.
// //          Nuevos bloques: Revisión técnica y Permiso de circulación.
// // - Medios: eliminar fotos/documentos; video <video controls>; nombres uniformes vienen del back.
// // -----------------------------------------------------------------------------
// import { useEffect, useMemo, useState } from 'react';
// import { api } from '../../services/http';
// import { useNavigate, useParams } from 'react-router-dom';
// import MediaUploader from '../../components/Vehicle/VehicleMediaUploader';
// import { uploadVehiclePhoto, uploadVehicleDocument, deleteVehiclePhoto, deleteVehicleDocument } from '../../api/vehicles.api';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// // yyyy-MM-dd ← Date/ISO
// function ymd(d) {
//   if (!d) return '';
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return '';
//   const mm = String(dt.getUTCMonth()+1).padStart(2,'0');
//   const dd = String(dt.getUTCDate()).padStart(2,'0');
//   return `${dt.getUTCFullYear()}-${mm}-${dd}`;
// }
// function parseYMD(str) {
//   if (!str) return undefined;
//   const [Y,M,D] = str.split('-').map(n=>parseInt(n,10));
//   if (!Y || !M || !D) return undefined;
//   return new Date(Date.UTC(Y, M-1, D));
// }

// function naturalSortBranches(list){
//   return [...list].sort((a,b)=>{
//     const an = Number(a.code); const bn = Number(b.code);
//     const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn);
//     if (aIsNum && bIsNum) return an - bn;
//     if (aIsNum) return -1;
//     if (bIsNum) return 1;
//     return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true });
//   });
// }

// export default function VehiclesForm() {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   const [tab, setTab] = useState('BASICO');
//   const [branches, setBranches] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(!!id);
//   const [error, setError] = useState('');
//   const [vehicle, setVehicle] = useState(null);

//   const currentYear = new Date().getFullYear();
//   const YEAR_MIN = 1950;
//   const YEAR_MAX = currentYear + 1;

//   const PADRON_ISSUER_DEFAULT = 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACIÓN';

//   const [form, setForm] = useState({
//     // Básico
//     plate: '', internalCode: '', status: 'ACTIVE',
//     type: '', brand: '', model: '', year: '', color: '', branch: '',
//     // Técnico
//     vin: '', engineNumber:'', engineBrand:'', engineModel:'', fuelType:'',
//     transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
//     generator: { brand:'', model:'', serial:'' },
//     pump: { brand:'', model:'', serial:'' },
//     body: { brand:'', model:'', serial:'' },
//     meters: { odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
//     // Legal
//     legal: {
//       padron: {
//         number:'', issuer: PADRON_ISSUER_DEFAULT,
//         acquisitionDate:'', inscriptionDate:'', issueDate:''
//       },
//       soap:      { policy:'', issuer:'', validFrom:'', validTo:'' },
//       insurance: { policy:'', issuer:'', validFrom:'', validTo:'' },
//       tag:       { number:'', issuer:'' },
//       fuelCard:  { issuer:'', number:'', validTo:'' },
//       revisionTech:      { number:'', issuer:'', reviewedAt:'', validTo:'' },
//       circulationPermit: { number:'', issuer:'', issuedAt:'', validTo:'' },
//     },
//   });

//   // --------- Helpers ----------
//   function update(field, val) {
//     if (field === 'branch' || field === 'year') {
//       setForm(f => ({ ...f, [field]: val }));
//     } else {
//       setForm(f => ({ ...f, [field]: (typeof val === 'string' ? U(val) : val) }));
//     }
//   }
//   function updateNested(path, val) {
//     setForm((f) => {
//       const clone = structuredClone(f);
//       let ref = clone;
//       const parts = path.split('.');
//       for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]];
//       // no uppercasing en fechas (inputs yyyy-MM-dd) ni en branch id
//       const last = parts.at(-1);
//       const isDateKey = ['validFrom','validTo','acquisitionDate','inscriptionDate','issueDate','reviewedAt','issuedAt'].includes(last);
//       ref[last] = (typeof val === 'string' && !isDateKey ? U(val) : val);
//       return clone;
//     });
//   }

//   // Mantener Date instancias sin transformarlas a {}
//   function deepUpperExceptDates(obj) {
//     if (!obj || typeof obj !== 'object') return obj;
//     if (obj instanceof Date) return obj;
//     const out = Array.isArray(obj) ? [] : {};
//     for (const k of Object.keys(obj)) {
//       const v = obj[k];
//       if (v instanceof Date) out[k] = v;
//       else if (typeof v === 'string') out[k] = U(v);
//       else if (v && typeof v === 'object') out[k] = deepUpperExceptDates(v);
//       else out[k] = v;
//     }
//     return out;
//   }

//   // --------- Branches ----------
//   useEffect(() => {
//     api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || data?.list || [];
//         setBranches(naturalSortBranches(payload));
//       })
//       .catch(() => setBranches([]));
//   }, []);

//   // --------- Cargar vehículo (edit) ----------
//   useEffect(() => {
//     if (!id) return;
//     setLoading(true);
//     api.get(`/api/v1/vehicles/${id}`)
//       .then(({ data }) => {
//         const v = data?.item || data;
//         setVehicle(v);
//         setForm({
//           ...form,
//           plate: v.plate || '',
//           internalCode: v.internalCode || '',
//           status: v.status || 'ACTIVE',
//           type: v.type || '',
//           brand: v.brand || '',
//           model: v.model || '',
//           year: v.year || '',
//           color: v.color || '',
//           branch: v.branch?._id || v.branch || '',
//           vin: v.vin || '',
//           engineNumber: v.engineNumber || '',
//           engineBrand: v.engineBrand || '',
//           engineModel: v.engineModel || '',
//           fuelType: v.fuelType || '',
//           transmission: {
//             type: v.transmission?.type || '',
//             brand: v.transmission?.brand || '',
//             model: v.transmission?.model || '',
//             serial: v.transmission?.serial || '',
//             gears: v.transmission?.gears || '',
//           },
//           generator: { brand: v.generator?.brand || '', model: v.generator?.model || '', serial: v.generator?.serial || '' },
//           pump:      { brand: v.pump?.brand || '',      model: v.pump?.model || '',      serial: v.pump?.serial || '' },
//           body:      { brand: v.body?.brand || '',      model: v.body?.model || '',      serial: v.body?.serial || '' },
//           meters: {
//             odometerKm: v.meters?.odometerKm ?? '',
//             engineHours: v.meters?.engineHours ?? '',
//             ladderHours: v.meters?.ladderHours ?? '',
//             generatorHours: v.meters?.generatorHours ?? '',
//             pumpHours: v.meters?.pumpHours ?? '',
//           },
//           legal: {
//             padron: {
//               number: v.legal?.padron?.number || '',
//               issuer: v.legal?.padron?.issuer || PADRON_ISSUER_DEFAULT,
//               acquisitionDate: ymd(v.legal?.padron?.acquisitionDate),
//               inscriptionDate: ymd(v.legal?.padron?.inscriptionDate),
//               issueDate:       ymd(v.legal?.padron?.issueDate),
//             },
//             soap: {
//               policy: v.legal?.soap?.policy || '',
//               issuer: v.legal?.soap?.issuer || '',
//               validFrom: ymd(v.legal?.soap?.validFrom),
//               validTo:   ymd(v.legal?.soap?.validTo),
//             },
//             insurance: {
//               policy: v.legal?.insurance?.policy || '',
//               issuer: v.legal?.insurance?.issuer || '',
//               validFrom: ymd(v.legal?.insurance?.validFrom),
//               validTo:   ymd(v.legal?.insurance?.validTo),
//             },
//             tag: {
//               number: v.legal?.tag?.number || '',
//               issuer: v.legal?.tag?.issuer || '',
//             },
//             fuelCard: {
//               issuer:  v.legal?.fuelCard?.issuer || '',
//               number:  v.legal?.fuelCard?.number || '',
//               validTo: ymd(v.legal?.fuelCard?.validTo),
//             },
//             revisionTech: {
//               number:     v.legal?.revisionTech?.number || '',
//               issuer:     v.legal?.revisionTech?.issuer || '',
//               reviewedAt: ymd(v.legal?.revisionTech?.reviewedAt),
//               validTo:    ymd(v.legal?.revisionTech?.validTo),
//             },
//             circulationPermit: {
//               number:  v.legal?.circulationPermit?.number || '',
//               issuer:  v.legal?.circulationPermit?.issuer || '',
//               issuedAt: ymd(v.legal?.circulationPermit?.issuedAt),
//               validTo:  ymd(v.legal?.circulationPermit?.validTo),
//             },
//           },
//         });
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
//       .finally(() => setLoading(false));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   // --------- Guardar ----------
//   async function handleSubmit(e) {
//     e.preventDefault();
//     setSaving(true); setError('');

//     try {
//       const reqFields = ['plate','internalCode','status','type','brand','model','year','color','branch'];
//       for (const k of reqFields) {
//         if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`);
//       }
//       const yearNum = Number(form.year);
//       if (!Number.isFinite(yearNum) || yearNum < YEAR_MIN || yearNum > YEAR_MAX) {
//         throw new Error(`Año inválido. Debe estar entre ${YEAR_MIN} y ${YEAR_MAX}.`);
//       }

//       const payload = structuredClone(form);

//       // Fechas → Date
//       payload.legal.padron.acquisitionDate = parseYMD(form.legal.padron.acquisitionDate);
//       payload.legal.padron.inscriptionDate = parseYMD(form.legal.padron.inscriptionDate);
//       payload.legal.padron.issueDate       = parseYMD(form.legal.padron.issueDate);
//       payload.legal.soap.validFrom         = parseYMD(form.legal.soap.validFrom);
//       payload.legal.soap.validTo           = parseYMD(form.legal.soap.validTo);
//       payload.legal.insurance.validFrom    = parseYMD(form.legal.insurance.validFrom);
//       payload.legal.insurance.validTo      = parseYMD(form.legal.insurance.validTo);
//       payload.legal.fuelCard.validTo       = parseYMD(form.legal.fuelCard.validTo);
//       payload.legal.revisionTech.reviewedAt= parseYMD(form.legal.revisionTech.reviewedAt);
//       payload.legal.revisionTech.validTo   = parseYMD(form.legal.revisionTech.validTo);
//       payload.legal.circulationPermit.issuedAt = parseYMD(form.legal.circulationPermit.issuedAt);
//       payload.legal.circulationPermit.validTo  = parseYMD(form.legal.circulationPermit.validTo);

//       // Uppercase seguro que NO rompe Date
//       const finalPayload = deepUpperExceptDates(payload);
//       finalPayload.year = yearNum;
//       if (finalPayload.transmission?.gears) {
//         finalPayload.transmission.gears = Number(finalPayload.transmission.gears);
//       }

//       if (id) {
//         await api.patch(`/api/v1/vehicles/${id}`, finalPayload);
//         alert('Vehículo actualizado con éxito');
//       } else {
//         await api.post('/api/v1/vehicles', finalPayload);
//         alert('Vehículo creado con éxito');
//       }
//       navigate('/vehicles');
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || 'Datos inválidos';
//       setError(msg);
//     } finally {
//       setSaving(false);
//     }
//   }

//   // --------- Media ----------
//   const canUpload = useMemo(()=>Boolean(id), [id]);
//   const refresh = async ()=> {
//     if (!id) return;
//     const { data } = await api.get(`/api/v1/vehicles/${id}`);
//     setVehicle(data?.item || data);
//   };
//   const handleUploadPhoto = async ({ file, category='BASIC', title='' }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir medios');
//     await uploadVehiclePhoto(id, { file, category, title });
//     await refresh();
//   };
//   const handleUploadDoc = async ({ file, category, label }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir documentos');
//     await uploadVehicleDocument(id, { file, category, label });
//     await refresh();
//   };
//   const handleDeletePhoto = async (photoId) => {
//     if (!confirm('¿Eliminar foto?')) return;
//     await deleteVehiclePhoto(id, photoId);
//     await refresh();
//   };
//   const handleDeleteDoc = async (docId) => {
//     if (!confirm('¿Eliminar documento?')) return;
//     await deleteVehicleDocument(id, docId);
//     await refresh();
//   };

//   if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>;

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
//       <header className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
//           <p className="text-sm text-slate-500">Los textos se guardan en MAYÚSCULAS.</p>
//         </div>
//         <nav className="flex gap-2">
//           {['BASICO','TECNICO','DOCUMENTOS','MEDIOS','INVENTARIO','ACCIDENTES','COMBUSTIBLE'].map(t=>(
//             <button type="button" key={t}
//               onClick={()=>setTab(t)}
//               className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.25)]':'bg-white border'}`}>
//               {t==='BASICO'?'Básico':t==='TECNICO'?'Técnico':t==='DOCUMENTOS'?'Documentos':t==='MEDIOS'?'Medios':t}
//             </button>
//           ))}
//         </nav>
//       </header>

//       {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

//       {/* BASICO */}
//       {tab==='BASICO' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Información básica</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {/* Estado ahora SELECT simple; si ya tienes catálogo, cámbialo por opciones desde API */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
//                 <select
//                   value={form.status}
//                   onChange={(e)=>update('status', e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                   required
//                 >
//                   {['ACTIVE','SUPPORT','IN_REPAIR','OUT_OF_SERVICE','RETIRED'].map(s=>(
//                     <option key={s} value={s}>{s}</option>
//                   ))}
//                 </select>
//               </div>

//               {[
//                 ['Placa / Patente','plate','ABC-123','text'],
//                 ['Código interno','internalCode','B:10','text'],
//                 ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN...','text'],
//                 ['Marca','brand','SCANIA','text'],
//                 ['Modelo','model','P340','text'],
//               ].map(([label, key, ph, type])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     type={type}
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                     placeholder={ph}
//                     required
//                   />
//                 </div>
//               ))}

//               {/* Año */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
//                 <input
//                   type="number"
//                   min={YEAR_MIN}
//                   max={YEAR_MAX}
//                   value={form.year}
//                   onChange={(e)=>update('year', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                   placeholder={String(currentYear)}
//                   required
//                 />
//                 <p className="text-xs text-slate-500 mt-1">Permitido: {YEAR_MIN}–{YEAR_MAX}</p>
//               </div>

//               {/* Color */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
//                 <input
//                   type="text"
//                   value={form.color}
//                   onChange={(e)=>update('color', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                   placeholder="ROJO"
//                   required
//                 />
//               </div>

//               {/* Sucursal */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
//                 <select
//                   required
//                   value={form.branch}
//                   onChange={(e)=>update('branch', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
//                 >
//                   <option value="" disabled>Selecciona sucursal</option>
//                   {branches.map(b=>(
//                     <option key={b._id} value={b._id}>
//                       {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Cancelar</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* TECNICO */}
//       {tab==='TECNICO' && (
//         <div className="space-y-4">
//           {/* Motor */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Motor</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {[
//                 ['VIN','vin',''],
//                 ['N° Motor','engineNumber',''],
//                 ['Marca Motor','engineBrand',''],
//                 ['Modelo Motor','engineModel',''],
//                 ['Combustible','fuelType','DIESEL/GASOLINA'],
//               ].map(([label,key,ph])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded"
//                     placeholder={ph}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Transmisión */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Transmisión</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//               {[
//                 ['Tipo','transmission.type','MANUAL/AUTOMATIC/AMT/CVT'],
//                 ['Marca','transmission.brand','ALLISON/ZF/EATON'],
//                 ['Modelo','transmission.model','4500 RDS'],
//                 ['Serie','transmission.serial',''],
//                 ['Marchas','transmission.gears','6','text'],
//               ].map(([label,path,ph,type])=>{
//                 const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? '';
//                 return (
//                   <div key={path}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                     <input
//                       type={type||'text'}
//                       value={val}
//                       onChange={(e)=>updateNested(path, e.target.value)}
//                       className="w-full border p-2 rounded"
//                       placeholder={ph}
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Medidores */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Medidores</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
//               {[
//                 ['Odómetro (km)','meters.odometerKm','0'],
//                 ['Horómetro motor (h)','meters.engineHours','0'],
//                 ['Horas escala (h)','meters.ladderHours','0'],
//                 ['Horas generador (h)','meters.generatorHours','0'],
//                 ['Horas cuerpo bomba (h)','meters.pumpHours','0'],
//               ].map(([label,path,ph])=>{
//                 const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? '';
//                 return (
//                   <div key={path}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                     <input
//                       value={val}
//                       onChange={(e)=>updateNested(path, e.target.value)}
//                       className="w-full border p-2 rounded"
//                       placeholder={ph}
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Equipos */}
//           {[
//             ['Generador','generator'],
//             ['Motobomba','pump'],
//             ['Cuerpo de bomba','body'],
//           ].map(([title, key])=>(
//             <div className="bg-white shadow rounded-xl border" key={key}>
//               <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                 <h3 className="font-medium text-slate-700">{title}</h3>
//               </div>
//               <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {['brand','model','serial'].map((f)=>(
//                   <div key={f}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{f==='brand'?'Marca':f==='model'?'Modelo':'Serie'}</label>
//                     <input
//                       value={form[key]?.[f] ?? ''}
//                       onChange={(e)=>updateNested(`${key}.${f}`, e.target.value)}
//                       className="w-full border p-2 rounded"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* DOCUMENTOS (LEGAL) */}
//       {tab==='DOCUMENTOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Legal</h3>
//             </div>

//             <div className="p-4 grid grid-cols-1 gap-6">
//               {/* Padrón */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Padrón | N° (máx 12)</label>
//                   <input maxLength={12} value={form.legal.padron.number} onChange={(e)=>updateNested('legal.padron.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.padron.issuer} onChange={(e)=>updateNested('legal.padron.issuer', e.target.value)} className="w-full border p-2 rounded" placeholder={PADRON_ISSUER_DEFAULT} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Adquisición</label>
//                   <input type="date" value={form.legal.padron.acquisitionDate || ''} onChange={(e)=>updateNested('legal.padron.acquisitionDate', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inscripción</label>
//                   <input type="date" value={form.legal.padron.inscriptionDate || ''} onChange={(e)=>updateNested('legal.padron.inscriptionDate', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Emisión</label>
//                   <input type="date" value={form.legal.padron.issueDate || ''} onChange={(e)=>updateNested('legal.padron.issueDate', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* SOAP */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">SOAP | Póliza</label>
//                   <input value={form.legal.soap.policy} onChange={(e)=>updateNested('legal.soap.policy', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
//                   <input value={form.legal.soap.issuer} onChange={(e)=>updateNested('legal.soap.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                   <input type="date" value={form.legal.soap.validFrom || ''} onChange={(e)=>updateNested('legal.soap.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fin</label>
//                   <input type="date" value={form.legal.soap.validTo || ''} onChange={(e)=>updateNested('legal.soap.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* Seguro */}
//               <div className="grid sm:grid-cols-6 gap-3 items-end">
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Seguro | Póliza</label>
//                   <input value={form.legal.insurance.policy} onChange={(e)=>updateNested('legal.insurance.policy', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
//                   <input value={form.legal.insurance.issuer} onChange={(e)=>updateNested('legal.insurance.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Inicio</label>
//                   <input type="date" value={form.legal.insurance.validFrom || ''} onChange={(e)=>updateNested('legal.insurance.validFrom', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fin</label>
//                   <input type="date" value={form.legal.insurance.validTo || ''} onChange={(e)=>updateNested('legal.insurance.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* Revisión técnica (NUEVO) */}
//               <div className="grid sm:grid-cols-5 gap-3 items-end">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Rev. Técnica | N°</label>
//                   <input value={form.legal.revisionTech.number} onChange={(e)=>updateNested('legal.revisionTech.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.revisionTech.issuer} onChange={(e)=>updateNested('legal.revisionTech.issuer', e.target.value)} className="w-full border p-2 rounded" placeholder="PLANTA DE REVISIÓN TÉCNICA" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fecha revisión</label>
//                   <input type="date" value={form.legal.revisionTech.reviewedAt || ''} onChange={(e)=>updateNested('legal.revisionTech.reviewedAt', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Vencimiento</label>
//                   <input type="date" value={form.legal.revisionTech.validTo || ''} onChange={(e)=>updateNested('legal.revisionTech.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* Permiso de circulación (NUEVO) */}
//               <div className="grid sm:grid-cols-5 gap-3 items-end">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Permiso circ. | N°</label>
//                   <input value={form.legal.circulationPermit.number} onChange={(e)=>updateNested('legal.circulationPermit.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Emisor (Comuna)</label>
//                   <input value={form.legal.circulationPermit.issuer} onChange={(e)=>updateNested('legal.circulationPermit.issuer', e.target.value)} className="w-full border p-2 rounded" placeholder="MUNICIPALIDAD DE ..." />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Fecha emisión</label>
//                   <input type="date" value={form.legal.circulationPermit.issuedAt || ''} onChange={(e)=>updateNested('legal.circulationPermit.issuedAt', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Vencimiento</label>
//                   <input type="date" value={form.legal.circulationPermit.validTo || ''} onChange={(e)=>updateNested('legal.circulationPermit.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* TAG */}
//               <div className="grid sm:grid-cols-3 gap-3 items-end">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">TAG | N°</label>
//                   <input value={form.legal.tag.number} onChange={(e)=>updateNested('legal.tag.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-600">Emisor</label>
//                   <input value={form.legal.tag.issuer} onChange={(e)=>updateNested('legal.tag.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>

//               {/* Tarjeta combustible */}
//               <div className="grid sm:grid-cols-3 gap-3 items-end">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Tarj. combustible | Emisor</label>
//                   <input value={form.legal.fuelCard.issuer} onChange={(e)=>updateNested('legal.fuelCard.issuer', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">N° Tarjeta</label>
//                   <input value={form.legal.fuelCard.number} onChange={(e)=>updateNested('legal.fuelCard.number', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-600">Vence</label>
//                   <input type="date" value={form.legal.fuelCard.validTo || ''} onChange={(e)=>updateNested('legal.fuelCard.validTo', e.target.value)} className="w-full border p-2 rounded" />
//                 </div>
//               </div>
//             </div>

//             <div className="px-4 pb-4 text-sm text-slate-500">
//               La carga de documentos se realiza en la pestaña <b>Medios</b>.
//             </div>
//           </div>

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* MEDIOS */}
//       {tab==='MEDIOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
//             </div>
//             <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 ['Básico (vehículo)','BASIC','photo'],
//                 ['Motor','ENGINE','photo'],
//                 ['Transmisión','TRANSMISSION','photo'],
//                 ['Generador','GENERATOR','photo'],
//                 ['Motobomba','PUMP','photo'],
//                 ['Cuerpo de bomba','BODY','photo'],
//                 ['Documentos (legal)','LEGAL','doc'],
//                 ['Manuales','MANUALS','doc'],
//                 ['Partes','PARTS','doc'],
//               ].map(([label,cat,mode])=>(
//                 <div key={cat} className="border rounded-lg p-3">
//                   <div className="font-medium mb-2">{label}</div>
//                   <MediaUploader
//                     onUpload={(p)=> mode==='doc'
//                       ? handleUploadDoc({ ...p, category:cat })
//                       : handleUploadPhoto({ ...p, category:cat })}
//                     accept={mode==='doc' ? 'application/pdf,image/*' : 'image/*,video/*'}
//                     category={cat}
//                     mode={mode}
//                   />
//                   {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Contenido actual */}
//           {vehicle && (
//             <div className="bg-white shadow rounded-xl border">
//               <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                 <h3 className="font-medium text-slate-700">Contenido actual</h3>
//               </div>
//               <div className="p-4 grid gap-6">
//                 {/* Fotos/Videos */}
//                 <div>
//                   <div className="font-medium mb-1">Fotos / Videos</div>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
//                     {(vehicle.photos||[]).map(ph=>(
//                       <div key={ph._id} className="text-xs">
//                         {/^(mp4|mov|webm)$/i.test(ph.format || '') ? (
//                           <video className="w-full h-24 rounded border object-cover" controls>
//                             <source src={ph.url} />
//                           </video>
//                         ) : (
//                           <img src={ph.url} alt={ph.title||''} className="w-full h-24 object-cover rounded border" />
//                         )}
//                         <div className="mt-1 break-words">{ph.title}</div>
//                         <button
//                           type="button"
//                           onClick={()=>handleDeletePhoto(ph._id)}
//                           className="mt-1 text-red-600 hover:underline"
//                         >Eliminar</button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Documentos/PDF */}
//                 <div>
//                   <div className="font-medium mb-1">Documentos</div>
//                   <ul className="list-disc pl-5 text-sm space-y-1">
//                     {(vehicle.documents||[]).map(d=>(
//                       <li key={d._id} className="break-words">
//                         {d.label} — <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ver</a>
//                         <button
//                           type="button"
//                           onClick={()=>handleDeleteDoc(d._id)}
//                           className="ml-3 text-red-600 hover:underline"
//                         >Eliminar</button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-end">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//           </div>
//         </div>
//       )}

//       {/* ESQUELETOS VISIBLES */}
//       {['INVENTARIO','ACCIDENTES','COMBUSTIBLE'].includes(tab) && (
//         <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//           Este módulo está en desarrollo.
//         </div>
//       )}
//     </form>
//   );
// }


// ///***** PENULTIMA ACTUALIZACION */
// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // Ficha de Vehículos
// // Cambios:
// // - Status al final del bloque Básico + opciones con LABEL visible (catálogo), value=CODE.
// // - Sección "Servicios de Apoyo a otras Sucursales": seleccionar sucursal y vehículo,
// //   botón iniciar/finalizar reemplazo, muestra de leyenda y sigla en rojo.
// // - Carrusel/Lightbox simple para imágenes (click en miniatura).
// // - Fechas legales se mantienen como en versión estable (envío Date desde yyyy-MM-dd).
// // -----------------------------------------------------------------------------
// import { useEffect, useMemo, useState } from 'react';
// import { api } from '../../services/http';
// import { useNavigate, useParams } from 'react-router-dom';
// import MediaUploader from '../../components/Vehicle/VehicleMediaUploader';
// import {
//   uploadVehiclePhoto, uploadVehicleDocument,
//   deleteVehiclePhoto, deleteVehicleDocument,
//   startSupport, finishSupport, listCatalog, listVehicles
// } from '../../api/vehicles.api';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// function ymd(d) {
//   if (!d) return '';
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return '';
//   const mm = String(dt.getUTCMonth()+1).padStart(2,'0');
//   const dd = String(dt.getUTCDate()).padStart(2,'0');
//   return `${dt.getUTCFullYear()}-${mm}-${dd}`;
// }
// function parseYMD(str) {
//   if (!str) return undefined;
//   const [Y,M,D] = str.split('-').map(n=>parseInt(n,10));
//   if (!Y || !M || !D) return undefined;
//   return new Date(Date.UTC(Y, M-1, D));
// }

// function naturalSortBranches(list){
//   return [...list].sort((a,b)=>{
//     const an = Number(a.code); const bn = Number(b.code);
//     const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn);
//     if (aIsNum && bIsNum) return an - bn;
//     if (aIsNum) return -1;
//     if (bIsNum) return 1;
//     return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true });
//   });
// }

// export default function VehiclesForm() {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   const [tab, setTab] = useState('BASICO');
//   const [branches, setBranches] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(!!id);
//   const [error, setError] = useState('');
//   const [notice, setNotice] = useState('');
//   const [vehicle, setVehicle] = useState(null);

//   const [statusOptions, setStatusOptions] = useState([]); // {code, label}

//   const currentYear = new Date().getFullYear();
//   const YEAR_MIN = 1950;
//   const YEAR_MAX = currentYear + 1;

//   const [form, setForm] = useState({
//     // Básico
//     plate: '', internalCode: '', status: 'ACTIVE',
//     type: '', brand: '', model: '', year: '', color: '', branch: '',
//     // Técnico
//     vin: '', engineNumber:'', engineBrand:'', engineModel:'', fuelType:'',
//     transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
//     generator: { brand:'', model:'', serial:'' },
//     pump: { brand:'', model:'', serial:'' },
//     body: { brand:'', model:'', serial:'' },
//     meters: { odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
//     // Legal (fechas visibles)
//     legal: {
//       padron:    { number:'', issuer:'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION', validFrom:'', validTo:'', acquisitionDate:'', inscriptionDate:'', issueDate:'' },
//       soap:      { policy:'', issuer:'', validFrom:'', validTo:'' },
//       insurance: { policy:'', issuer:'', validFrom:'', validTo:'' },
//       tag:       { number:'', issuer:'' },
//       fuelCard:  { issuer:'', number:'', validTo:'' },
//       technicalReview: { number:'', issuer:'', reviewDate:'', validTo:'' },
//       circulationPermit: { number:'', issuer:'', issueDate:'', validTo:'' },
//     },
//   });

//   // --------- Helpers ----------
//   function update(field, val) {
//     if (field === 'branch') {
//       setForm(f => ({ ...f, branch: val }));
//     } else if (field === 'year') {
//       setForm(f => ({ ...f, year: val }));
//     } else {
//       setForm(f => ({ ...f, [field]: (typeof val === 'string' ? U(val) : val) }));
//     }
//   }
//   function updateNested(path, val) {
//     setForm((f) => {
//       const clone = structuredClone(f);
//       let ref = clone;
//       const parts = path.split('.');
//       for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]];
//       const isDatePath = path.startsWith('legal.') &&
//         (path.endsWith('validFrom') || path.endsWith('validTo') || path.endsWith('acquisitionDate') || path.endsWith('inscriptionDate') || path.endsWith('issueDate') || path.endsWith('reviewDate'));
//       ref[parts.at(-1)] = (typeof val === 'string' && !isDatePath ? U(val) : val);
//       return clone;
//     });
//   }

//   // --------- Branches ----------
//   useEffect(() => {
//     api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || data?.list || [];
//         setBranches(naturalSortBranches(payload));
//         if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.');
//       })
//       .catch(() => setBranches([]));
//   }, []);

//   // --------- Catálogo de estados ----------
//   useEffect(() => {
//     listCatalog('VEHICLE_STATUSES').then((data) => {
//       const items = data?.items || data?.data || [];
//       // cada item: { code (opcional), label (visible) }
//       const opts = items.map(it => ({ code: it.code || it.label, label: it.label }));
//       setStatusOptions(opts);
//     }).catch(()=>setStatusOptions([]));
//   }, []);

//   // --------- Cargar vehículo (edit) ----------
//   useEffect(() => {
//     if (!id) return;
//     setLoading(true);
//     api.get(`/api/v1/vehicles/${id}`)
//       .then(({ data }) => {
//         const v = data?.item || data;
//         setVehicle(v);
//         setForm({
//           ...form,
//           plate: v.plate || '',
//           internalCode: v.internalCode || '',
//           status: v.status || 'ACTIVE',
//           type: v.type || '',
//           brand: v.brand || '',
//           model: v.model || '',
//           year: v.year || '',
//           color: v.color || '',
//           branch: v.branch?._id || v.branch || '',
//           vin: v.vin || '',
//           engineNumber: v.engineNumber || '',
//           engineBrand: v.engineBrand || '',
//           engineModel: v.engineModel || '',
//           fuelType: v.fuelType || '',
//           transmission: {
//             type: v.transmission?.type || '',
//             brand: v.transmission?.brand || '',
//             model: v.transmission?.model || '',
//             serial: v.transmission?.serial || '',
//             gears: v.transmission?.gears || '',
//           },
//           generator: { brand: v.generator?.brand || '', model: v.generator?.model || '', serial: v.generator?.serial || '' },
//           pump:      { brand: v.pump?.brand || '',      model: v.pump?.model || '',      serial: v.pump?.serial || '' },
//           body:      { brand: v.body?.brand || '',      model: v.body?.model || '',      serial: v.body?.serial || '' },
//           meters: {
//             odometerKm: v.meters?.odometerKm ?? '',
//             engineHours: v.meters?.engineHours ?? '',
//             ladderHours: v.meters?.ladderHours ?? '',
//             generatorHours: v.meters?.generatorHours ?? '',
//             pumpHours: v.meters?.pumpHours ?? '',
//           },
//           legal: {
//             padron: {
//               number: v.legal?.padron?.number || '',
//               issuer: v.legal?.padron?.issuer || 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION',
//               validFrom: ymd(v.legal?.padron?.validFrom),
//               validTo: ymd(v.legal?.padron?.validTo),
//               acquisitionDate: ymd(v.legal?.padron?.acquisitionDate),
//               inscriptionDate: ymd(v.legal?.padron?.inscriptionDate),
//               issueDate: ymd(v.legal?.padron?.issueDate),
//             },
//             soap:      { policy: v.legal?.soap?.policy || '', issuer: v.legal?.soap?.issuer || '', validFrom: ymd(v.legal?.soap?.validFrom), validTo: ymd(v.legal?.soap?.validTo) },
//             insurance: { policy: v.legal?.insurance?.policy || '', issuer: v.legal?.insurance?.issuer || '', validFrom: ymd(v.legal?.insurance?.validFrom), validTo: ymd(v.legal?.insurance?.validTo) },
//             tag:       { number: v.legal?.tag?.number || '', issuer: v.legal?.tag?.issuer || '' },
//             fuelCard:  { issuer: v.legal?.fuelCard?.issuer || '', number: v.legal?.fuelCard?.number || '', validTo: ymd(v.legal?.fuelCard?.validTo) },
//             technicalReview: {
//               number: v.legal?.technicalReview?.number || '',
//               issuer: v.legal?.technicalReview?.issuer || '',
//               reviewDate: ymd(v.legal?.technicalReview?.reviewDate),
//               validTo: ymd(v.legal?.technicalReview?.validTo),
//             },
//             circulationPermit: {
//               number: v.legal?.circulationPermit?.number || '',
//               issuer: v.legal?.circulationPermit?.issuer || '',
//               issueDate: ymd(v.legal?.circulationPermit?.issueDate),
//               validTo: ymd(v.legal?.circulationPermit?.validTo),
//             },
//           }
//         });
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
//       .finally(() => setLoading(false));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   // --------- Guardar ----------
//   async function handleSubmit(e) {
//     e.preventDefault();
//     setSaving(true); setError('');

//     try {
//       const reqFields = ['plate','internalCode','status','type','brand','model','year','color','branch'];
//       for (const k of reqFields) {
//         if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`);
//       }
//       const yearNum = Number(form.year);
//       if (!Number.isFinite(yearNum) || yearNum < YEAR_MIN || yearNum > YEAR_MAX) {
//         throw new Error(`Año inválido. Debe estar entre ${YEAR_MIN} y ${YEAR_MAX}.`);
//       }

//       const payload = structuredClone(form);

//       // Fechas → Date
//       payload.legal.padron.validFrom       = parseYMD(form.legal.padron.validFrom);
//       payload.legal.padron.validTo         = parseYMD(form.legal.padron.validTo);
//       payload.legal.padron.acquisitionDate = parseYMD(form.legal.padron.acquisitionDate);
//       payload.legal.padron.inscriptionDate = parseYMD(form.legal.padron.inscriptionDate);
//       payload.legal.padron.issueDate       = parseYMD(form.legal.padron.issueDate);

//       payload.legal.soap.validFrom         = parseYMD(form.legal.soap.validFrom);
//       payload.legal.soap.validTo           = parseYMD(form.legal.soap.validTo);
//       payload.legal.insurance.validFrom    = parseYMD(form.legal.insurance.validFrom);
//       payload.legal.insurance.validTo      = parseYMD(form.legal.insurance.validTo);
//       payload.legal.fuelCard.validTo       = parseYMD(form.legal.fuelCard.validTo);

//       payload.legal.technicalReview.reviewDate = parseYMD(form.legal.technicalReview.reviewDate);
//       payload.legal.technicalReview.validTo    = parseYMD(form.legal.technicalReview.validTo);

//       payload.legal.circulationPermit.issueDate = parseYMD(form.legal.circulationPermit.issueDate);
//       payload.legal.circulationPermit.validTo   = parseYMD(form.legal.circulationPermit.validTo);

//       // Uppercase todo excepto branch y fechas (ya convertido)
//       const up = (obj) => {
//         if (!obj || typeof obj !== 'object') return obj;
//         const out = Array.isArray(obj) ? [] : {};
//         for (const k of Object.keys(obj)) {
//           const v = obj[k];
//           const isBranch = k === 'branch';
//           const isDateKey = ['validFrom','validTo','acquisitionDate','inscriptionDate','issueDate','reviewDate'].includes(k);
//           if (typeof v === 'string' && !isBranch && !isDateKey) out[k] = U(v);
//           else if (v && typeof v === 'object') out[k] = up(v);
//           else out[k] = v;
//         }
//         return out;
//       };
//       const finalPayload = up(payload);
//       finalPayload.year = yearNum;
//       if (finalPayload.transmission?.gears) {
//         finalPayload.transmission.gears = Number(finalPayload.transmission.gears);
//       }

//       if (id) {
//         await api.patch(`/api/v1/vehicles/${id}`, finalPayload);
//         alert('Vehículo actualizado con éxito');
//       } else {
//         await api.post('/api/v1/vehicles', finalPayload);
//         alert('Vehículo creado con éxito');
//       }
//       navigate('/vehicles');
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || 'Datos inválidos';
//       setError(msg);
//     } finally {
//       setSaving(false);
//     }
//   }

//   // --------- Media ----------
//   const canUpload = useMemo(()=>Boolean(id), [id]);
//   const refresh = async ()=> {
//     if (!id) return;
//     const { data } = await api.get(`/api/v1/vehicles/${id}`);
//     setVehicle(data?.item || data);
//   };
//   const handleUploadPhoto = async ({ file, category='BASIC', title='' }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir medios');
//     await uploadVehiclePhoto(id, { file, category, title });
//     await refresh();
//   };
//   const handleUploadDoc = async ({ file, category, label }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir documentos');
//     await uploadVehicleDocument(id, { file, category, label });
//     await refresh();
//   };
//   const handleDeletePhoto = async (photoId) => {
//     if (!confirm('¿Eliminar foto?')) return;
//     await deleteVehiclePhoto(id, photoId);
//     await refresh();
//   };
//   const handleDeleteDoc = async (docId) => {
//     if (!confirm('¿Eliminar documento?')) return;
//     await deleteVehicleDocument(id, docId);
//     await refresh();
//   };

//   // --------- Lightbox / Carrusel simple ---------
//   const [lightbox, setLightbox] = useState({ open:false, idx:0 });
//   const photos = (vehicle?.photos || []).filter(ph => !/^mp4|mov|webm$/i.test(ph.format||''));
//   const openLightbox = (i)=> setLightbox({ open:true, idx:i });
//   const closeLightbox = ()=> setLightbox({ open:false, idx:0 });
//   const prev = ()=> setLightbox(s => ({ ...s, idx: (s.idx - 1 + photos.length) % photos.length }));
//   const next = ()=> setLightbox(s => ({ ...s, idx: (s.idx + 1) % photos.length }));

//   // --------- Apoyo / Reemplazo ----------
//   const [supportBranch, setSupportBranch] = useState('');
//   const [supportVehicles, setSupportVehicles] = useState([]);
//   const [supportTarget, setSupportTarget] = useState('');

//   useEffect(() => {
//     if (!supportBranch) { setSupportVehicles([]); setSupportTarget(''); return; }
//     // Traer vehículos de esa sucursal
//     listVehicles({ page:1, limit:200, branch: supportBranch }).then((data)=>{
//       const items = data.items || [];
//       setSupportVehicles(items.filter(v => v._id !== id)); // no incluirse a sí mismo
//     });
//   }, [supportBranch, id]);

//   const supportActive = vehicle?.support?.active;
//   const replacementCode = vehicle?.support?.replacementCode;
//   const supportStartedAt = vehicle?.support?.startedAt;

//   const handleStartSupport = async ()=> {
//     if (!id) return alert('Guarda el vehículo antes.');
//     if (!supportBranch || !supportTarget) return alert('Selecciona sucursal y vehículo a reemplazar');
//     await startSupport(id, { targetBranchId: supportBranch, targetVehicleId: supportTarget });
//     await refresh();
//   };
//   const handleFinishSupport = async ()=> {
//     if (!id) return;
//     await finishSupport(id);
//     await refresh();
//   };

//   if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>;

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
//       <header className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
//           <p className="text-sm text-slate-500">Los textos se guardan en MAYÚSCULAS.</p>
//         </div>
//         <nav className="flex gap-2">
//           {['BASICO','TECNICO','DOCUMENTOS','MEDIOS','INVENTARIO','ACCIDENTES','COMBUSTIBLE'].map(t=>(
//             <button type="button" key={t}
//               onClick={()=>setTab(t)}
//               className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.25)]':'bg-white border'}`}>
//               {t==='BASICO'?'Básico':t==='TECNICO'?'Técnico':t==='DOCUMENTOS'?'Documentos':t==='MEDIOS'?'Medios':t}
//             </button>
//           ))}
//         </nav>
//       </header>

//       {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

//       {/* BASICO */}
//       {tab==='BASICO' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Información básica</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {[
//                 ['Placa / Patente','plate','ABC-123','text'],
//                 ['Código interno','internalCode','B:10','text'],
//                 ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN...','text'],
//                 ['Marca','brand','SCANIA','text'],
//                 ['Modelo','model','P340','text'],
//               ].map(([label, key, ph, type])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     type={type}
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                     placeholder={ph}
//                     required
//                   />
//                 </div>
//               ))}
//               {/* Año */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
//                 <input
//                   type="number"
//                   min={YEAR_MIN}
//                   max={YEAR_MAX}
//                   value={form.year}
//                   onChange={(e)=>update('year', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                   placeholder={String(currentYear)}
//                   required
//                 />
//                 <p className="text-xs text-slate-500 mt-1">Permitido: {YEAR_MIN}–{YEAR_MAX}</p>
//               </div>
//               {/* Color */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
//                 <input
//                   type="text"
//                   value={form.color}
//                   onChange={(e)=>update('color', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                   placeholder="ROJO"
//                   required
//                 />
//               </div>
//               {/* Sucursal */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
//                 <select
//                   required
//                   value={form.branch}
//                   onChange={(e)=>update('branch', e.target.value)}
//                   className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
//                 >
//                   <option value="" disabled>Selecciona sucursal</option>
//                   {branches.map(b=>(
//                     <option key={b._id} value={b._id}>
//                       {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* ===== Status (AL FINAL) con etiquetas visibles ===== */}
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
//                 <select
//                   required
//                   value={form.status}
//                   onChange={(e)=>update('status', e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                 >
//                   <option value="" disabled>Selecciona estado</option>
//                   {statusOptions.map(opt=>(
//                     <option key={opt.code} value={opt.code}>{opt.label}</option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-slate-500 mt-1">Se guarda el código interno, se muestra la etiqueta.</p>
//               </div>
//             </div>
//           </div>

//           {/* ====== Servicios de Apoyo a otras Sucursales ====== */}
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Servicios de Apoyo a otras Sucursales</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {/* Sucursal destino */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal a apoyar</label>
//                 <select
//                   value={supportBranch}
//                   onChange={(e)=>{ setSupportBranch(e.target.value); setSupportTarget(''); }}
//                   className="w-full border p-2 rounded bg-white"
//                 >
//                   <option value="">Selecciona sucursal</option>
//                   {branches.map(b=>(
//                     <option key={b._id} value={b._id}>{b.code ? `${b.code} — ${b.name}` : b.name}</option>
//                   ))}
//                 </select>
//               </div>
//               {/* Vehículo a reemplazar */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-600 mb-1">Vehículo a reemplazar</label>
//                 <select
//                   value={supportTarget}
//                   onChange={(e)=>setSupportTarget(e.target.value)}
//                   className="w-full border p-2 rounded bg-white"
//                   disabled={!supportBranch}
//                 >
//                   <option value="">Selecciona vehículo</option>
//                   {supportVehicles.map(v=>(
//                     <option key={v._id} value={v._id}>
//                       {v.internalCode} — {v.plate} — {v.brand} {v.model}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {/* Botón iniciar/finalizar */}
//               <div className="flex items-end">
//                 {!supportActive ? (
//                   <button type="button" onClick={handleStartSupport} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//                     disabled={!id || !supportBranch || !supportTarget}>
//                     Iniciar reemplazo
//                   </button>
//                 ) : (
//                   <button type="button" onClick={handleFinishSupport} className="px-3 py-2 bg-amber-600 text-white rounded">
//                     Finalizar reemplazo
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Leyenda de reemplazo en curso */}
//             {supportActive && (
//               <div className="px-4 pb-4">
//                 <div className="text-sm text-slate-600">
//                   En reemplazo desde: <b>{new Date(supportStartedAt).toLocaleString('es-CL')}</b>
//                 </div>
//                 <div className="mt-1 text-red-700 font-bold text-2xl tracking-wide">
//                   {replacementCode}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end gap-3">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Cancelar</button>
//             <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
//               {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ====== (Técnico, Documentos y Medios) — iguales a tu estable con mejoras previas ===== */}
//       {/* ... Tu bloque TECNICO y DOCUMENTOS del estable (ya incluido en tu último envío) ... */}
//       {/* Por brevedad, asumo mantenidos sin cambios salvo lo que ya agregamos en model/fechas */}


//       {/* MEDIOS */}
//       {tab==='MEDIOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
//             </div>
//             <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 ['Básico (vehículo)','BASIC','photo'],
//                 ['Motor','ENGINE','photo'],
//                 ['Transmisión','TRANSMISSION','photo'],
//                 ['Generador','GENERATOR','photo'],
//                 ['Motobomba','PUMP','photo'],
//                 ['Cuerpo de bomba','BODY','photo'],
//                 ['Documentos (legal)','LEGAL','doc'],
//                 ['Manuales','MANUALS','doc'],
//                 ['Partes','PARTS','doc'],
//               ].map(([label,cat,mode])=>(
//                 <div key={cat} className="border rounded-lg p-3">
//                   <div className="font-medium mb-2">{label}</div>
//                   <MediaUploader
//                     onUpload={(p)=> mode==='doc'
//                       ? handleUploadDoc({ ...p, category:cat })
//                       : handleUploadPhoto({ ...p, category:cat })}
//                     accept={mode==='doc' ? 'application/pdf,image/*' : 'image/*,video/*'}
//                     category={cat}
//                     mode={mode}
//                   />
//                   {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Contenido actual */}
//           {vehicle && (
//             <div className="bg-white shadow rounded-xl border">
//               <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//                 <h3 className="font-medium text-slate-700">Contenido actual</h3>
//               </div>
//               <div className="p-4 grid gap-6">
//                 {/* Fotos/Videos */}
//                 <div>
//                   <div className="font-medium mb-1">Fotos / Videos</div>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
//                     {(vehicle.photos||[]).map((ph, idx)=>(
//                       <div key={ph._id} className="text-xs">
//                         {/* Si es video, <video>; si es imagen, <img> clickeable */}
//                         {/^mp4|mov|webm$/i.test(ph.format || '') ? (
//                           <video className="w-full h-24 rounded border object-cover" controls>
//                             <source src={ph.url} />
//                           </video>
//                         ) : (
//                           <img
//                             src={ph.url}
//                             alt={ph.title||''}
//                             className="w-full h-24 object-cover rounded border cursor-zoom-in"
//                             onClick={()=>openLightbox(photos.findIndex(p=>p._id===ph._id))}
//                           />
//                         )}
//                         <div className="mt-1 break-words">{ph.title}</div>
//                         <button
//                           type="button"
//                           onClick={()=>handleDeletePhoto(ph._id)}
//                           className="mt-1 text-red-600 hover:underline"
//                         >Eliminar</button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {/* Documentos/PDF */}
//                 <div>
//                   <div className="font-medium mb-1">Documentos</div>
//                   <ul className="list-disc pl-5 text-sm space-y-1">
//                     {(vehicle.documents||[]).map(d=>(
//                       <li key={d._id} className="break-words">
//                         {d.label} — <a href={d.url} target="_blank" className="text-blue-600 underline">ver</a>
//                         <button
//                           type="button"
//                           onClick={()=>handleDeleteDoc(d._id)}
//                           className="ml-3 text-red-600 hover:underline"
//                         >Eliminar</button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-end">
//             <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
//           </div>
//         </div>
//       )}

//       {/* ESQUELETOS VISIBLES */}
//       {['INVENTARIO','ACCIDENTES','COMBUSTIBLE'].includes(tab) && (
//         <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
//           Este módulo está en desarrollo.
//         </div>
//       )}

//       {/* ===== Lightbox ===== */}
//       {lightbox.open && photos.length > 0 && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
//           <button className="absolute top-4 right-4 text-white text-2xl" onClick={closeLightbox}>✕</button>
//           <button className="absolute left-4 text-white text-3xl" onClick={prev}>‹</button>
//           <img src={photos[lightbox.idx].url} alt="" className="max-h-[80vh] max-w-[90vw] rounded shadow-lg" />
//           <button className="absolute right-4 text-white text-3xl" onClick={next}>›</button>
//         </div>
//       )}
//     </form>
//   );
// }


// front/src/pages/Vehicles/Form.jsx
// -----------------------------------------------------------------------------
// Ficha de Vehículos (Básico, Técnico, Documentos, Medios, Inventario, Accidentes, Combustible)
// - Estado: select por catálogo (muestra label, envía code/label como valor). Al final del bloque “Básico”.
// - Apoyo: bloque “Servicios de Apoyo a otras Sucursales” (selección sucursal → vehículos; iniciar/finalizar).
// - Fechas legales: 'yyyy-MM-dd' en UI → Date al enviar.
// - Medios: visor modal con carrusel (click miniatura).
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/http'
import { useNavigate, useParams } from 'react-router-dom'
import MediaUploader from '../../components/Vehicle/VehicleMediaUploader'
import {
  uploadVehiclePhoto,
  uploadVehicleDocument,
  deleteVehiclePhoto,
  deleteVehicleDocument
} from '../../api/vehicles.api'

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)
function ymd(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  const mm = String(dt.getUTCMonth()+1).padStart(2,'0')
  const dd = String(dt.getUTCDate()).padStart(2,'0')
  return `${dt.getUTCFullYear()}-${mm}-${dd}`
}
function parseYMD(str) {
  if (!str) return undefined
  const [Y,M,D] = str.split('-').map(n=>parseInt(n,10))
  if (!Y || !M || !D) return undefined
  return new Date(Date.UTC(Y, M-1, D))
}
function naturalSortBranches(list){
  return [...list].sort((a,b)=>{
    const an = Number(a.code); const bn = Number(b.code)
    const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn)
    if (aIsNum && bIsNum) return an - bn
    if (aIsNum) return -1
    if (bIsNum) return 1
    return (a.name || '').localeCompare(b.name || '', 'es', { numeric:true })
  })
}

export default function VehiclesForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [tab, setTab] = useState('BASICO')
  const [branches, setBranches] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [vehicle, setVehicle] = useState(null)

  // Estado (catálogo)
  const [statusOptions, setStatusOptions] = useState([]) // [{value, label}]
  const [statusLoading, setStatusLoading] = useState(false)

  // Apoyo
  const [supportBranch, setSupportBranch] = useState('')
  const [supportVehicles, setSupportVehicles] = useState([])
  const [supportTarget, setSupportTarget] = useState('')
  const [supportBusy, setSupportBusy] = useState(false)
  const [supportActiveInfo, setSupportActiveInfo] = useState(null) // {from: ISO, code:'XXR'}

  // Medios -> visor modal
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  const currentYear = new Date().getFullYear()
  const YEAR_MIN = 1950
  const YEAR_MAX = currentYear + 1

  const [form, setForm] = useState({
    // Básico
    plate: '', internalCode: '',
    type: '', brand: '', model: '', year: '', color: '', branch: '',
    status: 'ACTIVE',
    // Técnico
    vin: '', engineNumber:'', engineBrand:'', engineModel:'', fuelType:'',
    transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
    generator: { brand:'', model:'', serial:'' },
    pump: { brand:'', model:'', serial:'' },
    body: { brand:'', model:'', serial:'' },
    meters: { odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
    // Legal (fechas visibles)
    legal: {
      padron:    { number:'', issuer:'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION', validFrom:'', validTo:'' },
      soap:      { policy:'', issuer:'', validFrom:'', validTo:'' },
      insurance: { policy:'', issuer:'', validFrom:'', validTo:'' },
      tag:       { number:'', issuer:'' },
      fuelCard:  { issuer:'', number:'', validTo:'' },
    },
  })

  // --------- Cargar catálogo de estados ----------
  useEffect(() => {
    setStatusLoading(true)
    api.get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
      .then(({ data }) => {
        const list = data?.items || data?.data || []
        // value: code || label  (interno), label: etiqueta mostrada
        const opts = list
          .filter(it => it.active !== false)
          .sort((a,b)=> (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label))
          .map(it => ({ value: it.code || it.label, label: it.label }))
        setStatusOptions(opts)
      })
      .finally(()=>setStatusLoading(false))
  }, [])

  // --------- Helpers update ----------
  function update(field, val) {
    if (field === 'branch' || field === 'year') {
      setForm(f => ({ ...f, [field]: val }))
    } else {
      setForm(f => ({ ...f, [field]: (typeof val === 'string' ? U(val) : val) }))
    }
  }
  function updateNested(path, val) {
    setForm((f) => {
      const clone = structuredClone(f)
      let ref = clone
      const parts = path.split('.')
      for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]]
      const isDatePath = path.startsWith('legal.') && (path.endsWith('validFrom') || path.endsWith('validTo'))
      ref[parts.at(-1)] = (typeof val === 'string' && !isDatePath ? U(val) : val)
      return clone
    })
  }

  // --------- Branches ----------
  useEffect(() => {
    api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || data?.list || []
        setBranches(naturalSortBranches(payload))
        if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.')
      })
      .catch(() => setBranches([]))
  }, [])

  // --------- Cargar vehículo (edit) ----------
  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/api/v1/vehicles/${id}`)
      .then(({ data }) => {
        const v = data?.item || data
        setVehicle(v)
        // Detectar si hay apoyo activo (última assignment reason APOYO sin endAt)
        let supportInfo = null
        const last = Array.isArray(v.assignments) && v.assignments.length ? v.assignments[v.assignments.length - 1] : null
        if (last && last.reason === 'APOYO' && !last.endAt) {
          supportInfo = { from: last.startAt, code: v.internalCode }
        }
        setSupportActiveInfo(supportInfo)

        setForm({
          ...form,
          plate: v.plate || '',
          internalCode: v.internalCode || '',
          type: v.type || '',
          brand: v.brand || '',
          model: v.model || '',
          year: v.year || '',
          color: v.color || '',
          branch: v.branch?._id || v.branch || '',
          status: v.status || 'ACTIVE',
          vin: v.vin || '',
          engineNumber: v.engineNumber || '',
          engineBrand: v.engineBrand || '',
          engineModel: v.engineModel || '',
          fuelType: v.fuelType || '',
          transmission: {
            type: v.transmission?.type || '',
            brand: v.transmission?.brand || '',
            model: v.transmission?.model || '',
            serial: v.transmission?.serial || '',
            gears: v.transmission?.gears || '',
          },
          generator: { brand: v.generator?.brand || '', model: v.generator?.model || '', serial: v.generator?.serial || '' },
          pump:      { brand: v.pump?.brand || '',      model: v.pump?.model || '',      serial: v.pump?.serial || '' },
          body:      { brand: v.body?.brand || '',      model: v.body?.model || '',      serial: v.body?.serial || '' },
          meters: {
            odometerKm: v.meters?.odometerKm ?? '',
            engineHours: v.meters?.engineHours ?? '',
            ladderHours: v.meters?.ladderHours ?? '',
            generatorHours: v.meters?.generatorHours ?? '',
            pumpHours: v.meters?.pumpHours ?? '',
          },
          legal: {
            padron:    { number: v.legal?.padron?.number || '', issuer: v.legal?.padron?.issuer || 'SERVICIO DE REGISTRO CIVIL E IDENTIFICACION', validFrom: ymd(v.legal?.padron?.validFrom), validTo: ymd(v.legal?.padron?.validTo) },
            soap:      { policy: v.legal?.soap?.policy || '', issuer: v.legal?.soap?.issuer || '', validFrom: ymd(v.legal?.soap?.validFrom), validTo: ymd(v.legal?.soap?.validTo) },
            insurance: { policy: v.legal?.insurance?.policy || '', issuer: v.legal?.insurance?.issuer || '', validFrom: ymd(v.legal?.insurance?.validFrom), validTo: ymd(v.legal?.insurance?.validTo) },
            tag:       { number: v.legal?.tag?.number || '', issuer: v.legal?.tag?.issuer || '' },
            fuelCard:  { issuer: v.legal?.fuelCard?.issuer || '', number: v.legal?.fuelCard?.number || '', validTo: ymd(v.legal?.fuelCard?.validTo) },
          }
        })
      })
      .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // --------- Guardar ----------
  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')

    try {
      const reqFields = ['plate','internalCode','status','type','brand','model','year','color','branch']
      for (const k of reqFields) {
        if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`)
      }
      const yearNum = Number(form.year)
      if (!Number.isFinite(yearNum) || yearNum < YEAR_MIN || yearNum > YEAR_MAX) {
        throw new Error(`Año inválido. Debe estar entre ${YEAR_MIN} y ${YEAR_MAX}.`)
      }

      // Payload
      const payload = structuredClone(form)
      // Fechas a Date
      payload.legal.padron.validFrom    = parseYMD(form.legal.padron.validFrom)
      payload.legal.padron.validTo      = parseYMD(form.legal.padron.validTo)
      payload.legal.soap.validFrom      = parseYMD(form.legal.soap.validFrom)
      payload.legal.soap.validTo        = parseYMD(form.legal.soap.validTo)
      payload.legal.insurance.validFrom = parseYMD(form.legal.insurance.validFrom)
      payload.legal.insurance.validTo   = parseYMD(form.legal.insurance.validTo)
      payload.legal.fuelCard.validTo    = parseYMD(form.legal.fuelCard.validTo)

      // Uppercase inteligente
      const up = (obj) => {
        if (!obj || typeof obj !== 'object') return obj
        const out = Array.isArray(obj) ? [] : {}
        for (const k of Object.keys(obj)) {
          const v = obj[k]
          const isBranch = k === 'branch'
          const isDateKey = ['validFrom','validTo'].includes(k)
          if (typeof v === 'string' && !isBranch && !isDateKey) out[k] = U(v)
          else if (v && typeof v === 'object') out[k] = up(v)
          else out[k] = v
        }
        return out
      }
      const finalPayload = up(payload)
      finalPayload.year = yearNum
      if (finalPayload.transmission?.gears) {
        finalPayload.transmission.gears = Number(finalPayload.transmission.gears)
      }

      if (id) {
        await api.patch(`/api/v1/vehicles/${id}`, finalPayload)
        alert('Vehículo actualizado con éxito')
      } else {
        await api.post('/api/v1/vehicles', finalPayload)
        alert('Vehículo creado con éxito')
      }
      navigate('/vehicles')
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Datos inválidos'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  // --------- Medios ----------
  const canUpload = useMemo(()=>Boolean(id), [id])
  const refresh = async ()=> {
    if (!id) return
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }
  const handleUploadPhoto = async ({ file, category='BASIC', title='' }) => {
    if (!id) throw new Error('Guarda el vehículo antes de subir medios')
    await uploadVehiclePhoto(id, { file, category, title })
    await refresh()
  }
  const handleUploadDoc = async ({ file, category, label }) => {
    if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
    await uploadVehicleDocument(id, { file, category, label })
    await refresh()
  }
  const handleDeletePhoto = async (photoId) => {
    if (!confirm('¿Eliminar foto?')) return
    await deleteVehiclePhoto(id, photoId)
    await refresh()
  }
  const handleDeleteDoc = async (docId) => {
    if (!confirm('¿Eliminar documento?')) return
    await deleteVehicleDocument(id, docId)
    await refresh()
  }

  // --------- Apoyo (UI) ----------
  // Cargar vehículos por sucursal seleccionada
  useEffect(() => {
    if (!supportBranch) { setSupportVehicles([]); setSupportTarget(''); return }
    api.get('/api/v1/vehicles', { params: { page:1, limit:500, branch: supportBranch } })
      .then(({ data }) => {
        const items = data?.items || data?.data || []
        setSupportVehicles(items)
      })
  }, [supportBranch])

  async function startSupport() {
    if (!id || !supportBranch || !supportTarget) return alert('Selecciona sucursal y vehículo objetivo.')
    setSupportBusy(true)
    try {
      await api.post(`/api/v1/vehicles/${id}/support/start`, {
        targetBranchId: supportBranch,
        targetVehicleId: supportTarget,
      })
      const { data } = await api.get(`/api/v1/vehicles/${id}`)
      setVehicle(data)
      // marca UI
      setSupportActiveInfo({ from: new Date().toISOString(), code: (data.internalCode || '') })
      alert('Reemplazo iniciado')
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo iniciar el reemplazo')
    } finally {
      setSupportBusy(false)
    }
  }

  async function finishSupport() {
    if (!id) return
    setSupportBusy(true)
    try {
      await api.post(`/api/v1/vehicles/${id}/support/finish`)
      await refresh()
      setSupportActiveInfo(null)
      setSupportBranch(''); setSupportVehicles([]); setSupportTarget('')
      alert('Reemplazo finalizado')
    } catch (e) {
      alert(e?.response?.data?.message || 'No se pudo finalizar el reemplazo')
    } finally {
      setSupportBusy(false)
    }
  }

  // --------- Visor modal (carrusel) ----------
  function openViewer(idx) { setViewerIndex(idx); setViewerOpen(true) }
  function closeViewer() { setViewerOpen(false) }
  function prevViewer() {
    if (!vehicle?.photos?.length) return
    setViewerIndex((viewerIndex - 1 + vehicle.photos.length) % vehicle.photos.length)
  }
  function nextViewer() {
    if (!vehicle?.photos?.length) return
    setViewerIndex((viewerIndex + 1) % vehicle.photos.length)
  }

  if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
          <p className="text-sm text-slate-500">Los textos se guardan en MAYÚSCULAS.</p>
        </div>
        <nav className="flex gap-2">
          {['BASICO','TECNICO','DOCUMENTOS','MEDIOS','INVENTARIO','ACCIDENTES','COMBUSTIBLE'].map(t=>(
            <button type="button" key={t}
              onClick={()=>setTab(t)}
              className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.25)]':'bg-white border'}`}>
              {t==='BASICO'?'Básico':t==='TECNICO'?'Técnico':t==='DOCUMENTOS'?'Documentos':t==='MEDIOS'?'Medios':t}
            </button>
          ))}
        </nav>
      </header>

      {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      {/* ====================== BASICO ====================== */}
      {tab==='BASICO' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Información básica</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Placa / Patente','plate','ABC-123','text'],
                ['Código interno','internalCode','B:10','text'],
                ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN...','text'],
                ['Marca','brand','SCANIA','text'],
                ['Modelo','model','P340','text'],
              ].map(([label, key, ph, type])=>(
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e)=>update(key, e.target.value)}
                    className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder={ph}
                    required
                  />
                </div>
              ))}

              {/* Año */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
                <input
                  type="number"
                  min={YEAR_MIN}
                  max={YEAR_MAX}
                  value={form.year}
                  onChange={(e)=>update('year', e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder={String(currentYear)}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Permitido: {YEAR_MIN}–{YEAR_MAX}</p>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e)=>update('color', e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="ROJO"
                  required
                />
              </div>

              {/* Sucursal */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
                <select
                  required
                  value={form.branch}
                  onChange={(e)=>update('branch', e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                >
                  <option value="" disabled>Selecciona sucursal</option>
                  {branches.map(b=>(
                    <option key={b._id} value={b._id}>
                      {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado (AL FINAL del bloque) */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                <select
                  required
                  disabled={statusLoading}
                  value={form.status}
                  onChange={(e)=>update('status', e.target.value)}
                  className="w-full border p-2 rounded bg-white"
                >
                  <option value="" disabled>Selecciona estado</option>
                  {statusOptions.map(opt=>(
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ====================== APOYO A OTRAS SUCURSALES ====================== */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Servicios de Apoyo a otras Sucursales</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Sucursal destino */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal objetivo</label>
                <select
                  value={supportBranch}
                  onChange={(e)=>setSupportBranch(e.target.value)}
                  className="w-full border p-2 rounded bg-white"
                >
                  <option value="">— Selecciona sucursal —</option>
                  {branches.map(b=>(
                    <option key={b._id} value={b._id}>
                      {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
                    </option>
                  ))}
                </select>
              </div>
              {/* Vehículo de esa sucursal */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Vehículo a reemplazar</label>
                <select
                  value={supportTarget}
                  onChange={(e)=>setSupportTarget(e.target.value)}
                  className="w-full border p-2 rounded bg-white"
                  disabled={!supportBranch}
                >
                  <option value="">— Selecciona vehículo —</option>
                  {supportVehicles.map(v=>(
                    <option key={v._id} value={v._id}>
                      {v.internalCode || v.plate || v._id} — {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>
              {/* Botón acción */}
              <div className="flex gap-2">
                {supportActiveInfo ? (
                  <button
                    type="button"
                    onClick={finishSupport}
                    disabled={supportBusy}
                    className="px-3 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                  >
                    {supportBusy ? 'Finalizando…' : 'Finalizar reemplazo'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startSupport}
                    disabled={supportBusy || !supportBranch || !supportTarget}
                    className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                  >
                    {supportBusy ? 'Iniciando…' : 'Iniciar reemplazo'}
                  </button>
                )}
              </div>
            </div>

            {/* Etiquetas de estado de reemplazo */}
            {supportActiveInfo && (
              <div className="px-4 pb-4">
                <div className="text-sm text-slate-600">
                  En reemplazo desde: {new Date(supportActiveInfo.from).toLocaleString()}
                </div>
                <div className="text-red-700 font-extrabold text-lg">
                  {supportActiveInfo.code}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* ====================== TECNICO ====================== */}
      {tab==='TECNICO' && (
        <div className="space-y-4">
          {/* Motor */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Motor</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ['VIN','vin',''],
                ['N° Motor','engineNumber',''],
                ['Marca Motor','engineBrand',''],
                ['Modelo Motor','engineModel',''],
                ['Combustible','fuelType','DIESEL/GASOLINA'],
              ].map(([label,key,ph])=>(
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e)=>update(key, e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder={ph}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Transmisión */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Transmisión</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                ['Tipo','transmission.type','MANUAL/AUTOMATIC/AMT/CVT'],
                ['Marca','transmission.brand','ALLISON/ZF/EATON'],
                ['Modelo','transmission.model','4500 RDS'],
                ['Serie','transmission.serial',''],
                ['Marchas','transmission.gears','6','text'],
              ].map(([label,path,ph,type])=>{
                const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
                return (
                  <div key={path}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                    <input
                      type={type||'text'}
                      value={val}
                      onChange={(e)=>updateNested(path, e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder={ph}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Medidores */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Medidores</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                ['Odómetro (km)','meters.odometerKm','0'],
                ['Horómetro motor (h)','meters.engineHours','0'],
                ['Horas escala (h)','meters.ladderHours','0'],
                ['Horas generador (h)','meters.generatorHours','0'],
                ['Horas cuerpo bomba (h)','meters.pumpHours','0'],
              ].map(([label,path,ph])=>{
                const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
                return (
                  <div key={path}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                    <input
                      value={val}
                      onChange={(e)=>updateNested(path, e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder={ph}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Equipos */}
          {[
            ['Generador','generator'],
            ['Motobomba','pump'],
            ['Cuerpo de bomba','body'],
          ].map(([title, key])=>(
            <div className="bg-white shadow rounded-xl border" key={key}>
              <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                <h3 className="font-medium text-slate-700">{title}</h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['brand','model','serial'].map((f)=>(
                  <div key={f}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{f==='brand'?'Marca':f==='model'?'Modelo':'Serie'}</label>
                    <input
                      value={form[key]?.[f] ?? ''}
                      onChange={(e)=>updateNested(`${key}.${f}`, e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* ====================== DOCUMENTOS ====================== */}
      {tab==='DOCUMENTOS' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Legal</h3>
            </div>
            <div className="p-4 grid grid-cols-1 gap-6">
              {/* Padrón */}
              <div className="grid sm:grid-cols-6 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600">Padrón | N°</label>
                  <input maxLength={12} value={form.legal.padron.number} onChange={(e)=>updateNested('legal.padron.number', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Emisor</label>
                  <input value={form.legal.padron.issuer} onChange={(e)=>updateNested('legal.padron.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Inicio</label>
                  <input type="date" value={form.legal.padron.validFrom || ''} onChange={(e)=>updateNested('legal.padron.validFrom', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Fin</label>
                  <input type="date" value={form.legal.padron.validTo || ''} onChange={(e)=>updateNested('legal.padron.validTo', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              {/* SOAP */}
              <div className="grid sm:grid-cols-6 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600">SOAP | Póliza</label>
                  <input value={form.legal.soap.policy} onChange={(e)=>updateNested('legal.soap.policy', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
                  <input value={form.legal.soap.issuer} onChange={(e)=>updateNested('legal.soap.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Inicio</label>
                  <input type="date" value={form.legal.soap.validFrom || ''} onChange={(e)=>updateNested('legal.soap.validFrom', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Fin</label>
                  <input type="date" value={form.legal.soap.validTo || ''} onChange={(e)=>updateNested('legal.soap.validTo', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              {/* Seguro */}
              <div className="grid sm:grid-cols-6 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600">Seguro | Póliza</label>
                  <input value={form.legal.insurance.policy} onChange={(e)=>updateNested('legal.insurance.policy', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Aseguradora</label>
                  <input value={form.legal.insurance.issuer} onChange={(e)=>updateNested('legal.insurance.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Inicio</label>
                  <input type="date" value={form.legal.insurance.validFrom || ''} onChange={(e)=>updateNested('legal.insurance.validFrom', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Fin</label>
                  <input type="date" value={form.legal.insurance.validTo || ''} onChange={(e)=>updateNested('legal.insurance.validTo', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              {/* TAG */}
              <div className="grid sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-600">TAG | N°</label>
                  <input value={form.legal.tag.number} onChange={(e)=>updateNested('legal.tag.number', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Emisor</label>
                  <input value={form.legal.tag.issuer} onChange={(e)=>updateNested('legal.tag.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              {/* Tarjeta combustible */}
              <div className="grid sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-600">Tarj. combustible | Emisor</label>
                  <input value={form.legal.fuelCard.issuer} onChange={(e)=>updateNested('legal.fuelCard.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">N° Tarjeta</label>
                  <input value={form.legal.fuelCard.number} onChange={(e)=>updateNested('legal.fuelCard.number', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Vence</label>
                  <input type="date" value={form.legal.fuelCard.validTo || ''} onChange={(e)=>updateNested('legal.fuelCard.validTo', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 text-sm text-slate-500">
              La carga de documentos se realiza en la pestaña <b>Medios</b>.
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* ====================== MEDIOS ====================== */}
      {tab==='MEDIOS' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
            </div>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['Básico (vehículo)','BASIC','photo'],
                ['Motor','ENGINE','photo'],
                ['Transmisión','TRANSMISSION','photo'],
                ['Generador','GENERATOR','photo'],
                ['Motobomba','PUMP','photo'],
                ['Cuerpo de bomba','BODY','photo'],
                ['Documentos (legal)','LEGAL','doc'],
                ['Manuales','MANUALS','doc'],
                ['Partes','PARTS','doc'],
              ].map(([label,cat,mode])=>(
                <div key={cat} className="border rounded-lg p-3">
                  <div className="font-medium mb-2">{label}</div>
                  <MediaUploader
                    onUpload={(p)=> mode==='doc'
                      ? handleUploadDoc({ ...p, category:cat })
                      : handleUploadPhoto({ ...p, category:cat })}
                    accept={mode==='doc' ? 'application/pdf,image/*' : 'image/*,video/*'}
                    category={cat}
                    mode={mode}
                  />
                  {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Contenido actual */}
          {vehicle && (
            <div className="bg-white shadow rounded-xl border">
              <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                <h3 className="font-medium text-slate-700">Contenido actual</h3>
              </div>
              <div className="p-4 grid gap-6">
                {/* Fotos/Videos */}
                <div>
                  <div className="font-medium mb-1">Fotos / Videos</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {(vehicle.photos||[]).map((ph,idx)=>(
                      <div key={ph._id} className="text-xs">
                        {/^mp4|mov|webm$/i.test(ph.format || '') ? (
                          <video className="w-full h-24 rounded border object-cover" controls>
                            <source src={ph.url} />
                          </video>
                        ) : (
                          <img
                            src={ph.url}
                            alt={ph.title||''}
                            className="w-full h-24 object-cover rounded border cursor-pointer"
                            onClick={()=>openViewer(idx)}
                          />
                        )}
                        <div className="mt-1 break-words">{ph.title}</div>
                        <button
                          type="button"
                          onClick={()=>handleDeletePhoto(ph._id)}
                          className="mt-1 text-red-600 hover:underline"
                        >Eliminar</button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Documentos/PDF */}
                <div>
                  <div className="font-medium mb-1">Documentos</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {(vehicle.documents||[]).map(d=>(
                      <li key={d._id} className="break-words">
                        {d.label} — <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ver</a>
                        <button
                          type="button"
                          onClick={()=>handleDeleteDoc(d._id)}
                          className="ml-3 text-red-600 hover:underline"
                        >Eliminar</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* MODAL VISOR */}
          {viewerOpen && vehicle?.photos?.length > 0 && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg max-w-4xl w-full mx-4 p-3 relative">
                <button className="absolute top-2 right-2 text-slate-700" onClick={closeViewer}>✕</button>
                <div className="flex items-center justify-between mb-3">
                  <button className="px-3 py-1 border rounded" onClick={prevViewer}>◀</button>
                  <div className="text-sm">{vehicle.photos[viewerIndex]?.title}</div>
                  <button className="px-3 py-1 border rounded" onClick={nextViewer}>▶</button>
                </div>
                <div className="w-full">
                  <img
                    src={vehicle.photos[viewerIndex]?.url}
                    alt={vehicle.photos[viewerIndex]?.title || ''}
                    className="max-h-[70vh] mx-auto object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
          </div>
        </div>
      )}

      {/* ESQUELETOS VISIBLES */}
      {['INVENTARIO','ACCIDENTES','COMBUSTIBLE'].includes(tab) && (
        <div className="bg-white shadow rounded-xl border p-6 text-slate-600">
          Este módulo está en desarrollo.
        </div>
      )}
    </form>
  )
}
