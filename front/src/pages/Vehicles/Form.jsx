// // front/src/pages/Vehicles/Form.jsx
// // -----------------------------------------------------------------------------
// // Ficha de Vehículos con tabs: Básico, Técnico, Documentos, Medios, Inventario,
// // Accidentes, Combustible. (Las 3 últimas muestran "módulo en desarrollo").
// // - Sucursales ordenadas 1,2,3,10… (orden natural).
// // - Medidores: formateo visual (miles ".", decimales ",") → el back recibe números.
// // - Técnico: sombra azul cuando tab activo.
// // - Legal: TAG y Tarjeta de combustible en líneas separadas.
// // - Media: usa VehicleMediaUploader; botones con “manito”, placeholder claro.
// // -----------------------------------------------------------------------------
// import { useEffect, useMemo, useState } from 'react';
// import { api } from '../../services/http';
// import { useNavigate, useParams } from 'react-router-dom';
// import MediaUploader from '../../components/Vehicle/VehicleMediaUploader';
// import { uploadVehiclePhoto, uploadVehicleDocument } from '../../api/vehicles.api';

// const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// // formateo local: 12345.67 → "12.345,67"
// function fmtNumber(v) {
//   if (v === '' || v === null || v === undefined) return '';
//   const n = Number(v);
//   if (!Number.isFinite(n)) return '';
//   return n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
// }
// // parseo: "12.345,67" → 12345.67
// function parseNumber(str) {
//   if (typeof str !== 'string') return str;
//   const s = str.replace(/\./g,'').replace(',', '.');
//   const n = Number(s);
//   return Number.isFinite(n) ? n : undefined;
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

//   const [tab, setTab] = useState('BASICO'); // BASICO|TECNICO|DOCUMENTOS|MEDIOS|INVENTARIO|ACCIDENTES|COMBUSTIBLE
//   const [branches, setBranches] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(!!id);
//   const [error, setError] = useState('');
//   const [notice, setNotice] = useState('');
//   const [vehicle, setVehicle] = useState(null);

//   const [form, setForm] = useState({
//     // Básico (obligatorio)
//     plate: '', internalCode: '', status: 'ACTIVE',
//     type: '', brand: '', model: '', year: '', color: '', branch: '',
//     // Técnico
//     vin: '', engineNumber:'', engineBrand:'', engineModel:'', fuelType:'',
//     transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
//     generator: { brand:'', model:'', serial:'' },
//     pump: { brand:'', model:'', serial:'' },
//     body: { brand:'', model:'', serial:'' },
//     meters: { odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
//     // Legal (campos visibles; fechas/vencimientos los agregaremos luego)
//     legal: {
//       padron: { number:'', issuer:'' },
//       soap: { policy:'', issuer:'' },
//       insurance: { policy:'', issuer:'' },
//       tag: { number:'', issuer:'' },
//       fuelCard: { issuer:'', number:'' },
//     },
//   });

//   // ---------- Helpers ----------
//   const upperPatch = (obj) => {
//     const out = Array.isArray(obj) ? [] : {};
//     for (const k of Object.keys(obj)) {
//       const v = obj[k];
//       if (typeof v === 'string') out[k] = U(v);
//       else if (v && typeof v === 'object') out[k] = upperPatch(v);
//       else out[k] = v;
//     }
//     return out;
//   };
//   function update(field, val) {
//     setForm(f => ({ ...f, [field]: typeof val === 'string' ? U(val) : val }));
//   }
//   function updateNested(path, val) {
//     setForm((f) => {
//       const clone = structuredClone(f);
//       let ref = clone;
//       const parts = path.split('.');
//       for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]];
//       ref[parts.at(-1)] = (typeof val === 'string' ? U(val) : val);
//       return clone;
//     });
//   }

//   // ---------- Branches ----------
//   useEffect(() => {
//     api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
//       .then(({ data }) => {
//         const payload = data?.items || data?.data?.items || data?.data || data?.list || [];
//         const ordered = naturalSortBranches(payload);
//         setBranches(ordered);
//         if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.');
//       })
//       .catch(() => setBranches([]));
//   }, []);

//   // ---------- Cargar vehículo (edit) ----------
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
//             padron: { number: v.legal?.padron?.number || '', issuer: v.legal?.padron?.issuer || '' },
//             soap: { policy: v.legal?.soap?.policy || '', issuer: v.legal?.soap?.issuer || '' },
//             insurance: { policy: v.legal?.insurance?.policy || '', issuer: v.legal?.insurance?.issuer || '' },
//             tag: { number: v.legal?.tag?.number || '', issuer: v.legal?.tag?.issuer || '' },
//             fuelCard: { issuer: v.legal?.fuelCard?.issuer || '', number: v.legal?.fuelCard?.number || '' },
//           }
//         });
//       })
//       .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
//       .finally(() => setLoading(false));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   // ---------- Guardar ----------
//   async function handleSubmit(e) {
//     e.preventDefault();
//     setSaving(true); setError('');

//     try {
//       // Validación mínima
//       const reqFields = ['plate','internalCode','status','type','brand','model','year','color','branch'];
//       for (const k of reqFields) {
//         if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`);
//       }

//       // Prepara payload
//       const numericMeters = {
//         odometerKm: parseNumber(form.meters.odometerKm),
//         engineHours: parseNumber(form.meters.engineHours),
//         ladderHours: parseNumber(form.meters.ladderHours),
//         generatorHours: parseNumber(form.meters.generatorHours),
//         pumpHours: parseNumber(form.meters.pumpHours),
//       };
//       const payload = upperPatch({
//         ...form,
//         year: form.year ? Number(form.year) : undefined,
//         transmission: {
//           ...form.transmission,
//           gears: form.transmission.gears ? Number(form.transmission.gears) : undefined
//         },
//         meters: numericMeters,
//       });

//       if (id) {
//         await api.patch(`/api/v1/vehicles/${id}`, payload);
//         alert('Vehículo actualizado con éxito');
//       } else {
//         await api.post('/api/v1/vehicles', payload);
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

//   // ---------- Media handlers ----------
//   const canUpload = useMemo(()=>Boolean(id), [id]);
//   const refreshAfterUpload = async () => {
//     if (!id) return;
//     const { data } = await api.get(`/api/v1/vehicles/${id}`);
//     setVehicle(data?.item || data);
//   };

//   const handleUploadPhoto = async ({ file, category='BASIC', title='' }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir medios');
//     await uploadVehiclePhoto(id, { file, category, title });
//     await refreshAfterUpload();
//   };
//   const handleUploadDoc = async ({ file, category, label }) => {
//     if (!id) throw new Error('Guarda el vehículo antes de subir documentos');
//     await uploadVehicleDocument(id, { file, category, label });
//     await refreshAfterUpload();
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
//       {!branches.length && !id && <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>}

//       {/* BASICO */}
//       {tab==='BASICO' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Información básica</h3>
//             </div>
//             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {[
//                 ['Placa / Patente','plate','ABC-123'],
//                 ['Código interno','internalCode','B:10'],
//                 ['Estado','status','ACTIVE'],
//                 ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN...'],
//                 ['Marca','brand','SCANIA'],
//                 ['Modelo','model','P340'],
//                 ['Año','year','2020','number'],
//                 ['Color','color','ROJO'],
//               ].map(([label, key, ph, type])=>(
//                 <div key={key}>
//                   <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                   <input
//                     type={type||'text'}
//                     value={form[key]}
//                     onChange={(e)=>update(key, e.target.value)}
//                     className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
//                     placeholder={ph}
//                     required
//                   />
//                 </div>
//               ))}

//               {/* Sucursal */}
//               <div>
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
//                 ['Marchas','transmission.gears','6','text'], // usamos text + formateo numérico al guardar
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
//                 const raw = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? '';
//                 const display = typeof raw === 'string' ? raw : fmtNumber(raw);
//                 return (
//                   <div key={path}>
//                     <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                     <input
//                       value={display}
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

//       {/* DOCUMENTOS */}
//       {tab==='DOCUMENTOS' && (
//         <div className="space-y-4">
//           <div className="bg-white shadow rounded-xl border">
//             <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
//               <h3 className="font-medium text-slate-700">Legal</h3>
//             </div>
//             {/* Reordenado: TAG y Tarjeta combustible en líneas separadas */}
//             <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {[
//                   ['Padrón - N°','legal.padron.number'],
//                   ['Padrón - Emisor','legal.padron.issuer'],
//                   ['SOAP - Póliza','legal.soap.policy'],
//                   ['SOAP - Emisor','legal.soap.issuer'],
//                   ['Seguro - Póliza','legal.insurance.policy'],
//                   ['Seguro - Emisor','legal.insurance.issuer'],
//                 ].map(([label,path])=>{
//                   const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? '';
//                   return (
//                     <div key={path}>
//                       <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                       <input
//                         value={val}
//                         onChange={(e)=>updateNested(path, e.target.value)}
//                         className="w-full border p-2 rounded"
//                       />
//                     </div>
//                   );
//                 })}
//               </div>
//               <div className="grid grid-cols-1 gap-4">
//                 {[
//                   ['TAG - N°','legal.tag.number'],
//                   ['TAG - Emisor','legal.tag.issuer'],
//                 ].map(([label,path])=>{
//                   const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? '';
//                   return (
//                     <div key={path}>
//                       <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                       <input
//                         value={val}
//                         onChange={(e)=>updateNested(path, e.target.value)}
//                         className="w-full border p-2 rounded"
//                       />
//                     </div>
//                   );
//                 })}
//                 {[
//                   ['Tarj. combustible - Emisor','legal.fuelCard.issuer'],
//                   ['Tarj. combustible - N°','legal.fuelCard.number'],
//                 ].map(([label,path])=>{
//                   const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? '';
//                   return (
//                     <div key={path}>
//                       <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
//                       <input
//                         value={val}
//                         onChange={(e)=>updateNested(path, e.target.value)}
//                         className="w-full border p-2 rounded"
//                       />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Subida (documentos y manuales/partes se usan desde MEDIOS) */}
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
//               <div className="p-4 grid gap-4">
//                 <div>
//                   <div className="font-medium mb-1">Fotos</div>
//                   <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
//                     {(vehicle.photos||[]).map(ph=>(
//                       <div key={ph._id} className="text-xs">
//                         <img src={ph.url} alt={ph.title||''} className="w-full h-24 object-cover rounded border" />
//                         <div className="mt-1">{ph.category} {ph.title?`- ${ph.title}`:''}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="font-medium mb-1">Documentos</div>
//                   <ul className="list-disc pl-5 text-sm">
//                     {(vehicle.documents||[]).map(d=>(
//                       <li key={d._id}>
//                         <span className="font-medium">{d.category}</span> — {d.label} — <a href={d.url} target="_blank" className="text-blue-600 underline">ver</a>
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


// front/src/pages/Vehicles/Form.jsx
// -----------------------------------------------------------------------------
// Ficha de Vehículos (tabs): Básico, Técnico, Documentos, Medios, Inventario,
// Accidentes, Combustible.
// Ajustes:
// - Estado: SELECT desde catálogo VEHICLE_STATUSES (si vacío → aviso).
// - Sucursales: orden natural (1,2,3…10…).
// - Títulos: fondo como listados (bg-slate-100).
// - Documentos (Legal): filas en una línea + fechas visibles (SOAP/Seguro).
// - Medios: utiliza endpoints /photos y /documents (ya montados en back).
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/http';
import { useNavigate, useParams } from 'react-router-dom';
import MediaUploader from '../../components/Vehicle/VehicleMediaUploader';
import { uploadVehiclePhoto, uploadVehicleDocument } from '../../api/vehicles.api';

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v);

// formato local: 12345.67 -> "12.345,67"
function fmtNumber(v) {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function parseNumber(str) {
  if (typeof str !== 'string') return str;
  const s = str.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}
function naturalSortBranches(list) {
  return [...list].sort((a, b) => {
    const an = Number(a.code);
    const bn = Number(b.code);
    const aIsNum = Number.isFinite(an), bIsNum = Number.isFinite(bn);
    if (aIsNum && bIsNum) return an - bn;
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    return (a.name || '').localeCompare(b.name || '', 'es', { numeric: true });
  });
}

export default function VehiclesForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tab, setTab] = useState('BASICO');
  const [branches, setBranches] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [vehicle, setVehicle] = useState(null);

  const [form, setForm] = useState({
    // Básico
    plate: '', internalCode: '', status: '',
    type: '', brand: '', model: '', year: '', color: '', branch: '',
    // Técnico
    vin: '', engineNumber: '', engineBrand: '', engineModel: '', fuelType: '',
    transmission: { type: '', brand: '', model: '', serial: '', gears: '' },
    generator: { brand: '', model: '', serial: '' },
    pump: { brand: '', model: '', serial: '' },
    body: { brand: '', model: '', serial: '' },
    meters: { odometerKm: '', engineHours: '', ladderHours: '', generatorHours: '', pumpHours: '' },
    // Legal
    legal: {
      padron: { number: '', issuer: '' },
      soap: { policy: '', issuer: '', validFrom: '', validTo: '' },
      insurance: { policy: '', issuer: '', validFrom: '', validTo: '' },
      tag: { number: '', issuer: '' },
      fuelCard: { issuer: '', number: '', validTo: '' },
    },
  });

  // ---------- Helpers ----------
  const upperPatch = (obj) => {
    const out = Array.isArray(obj) ? [] : {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string') out[k] = U(v);
      else if (v && typeof v === 'object') out[k] = upperPatch(v);
      else out[k] = v;
    }
    return out;
  };
  function update(field, val) {
    setForm((f) => ({ ...f, [field]: typeof val === 'string' ? U(val) : val }));
  }
  function updateNested(path, val) {
    setForm((f) => {
      const clone = structuredClone(f);
      let ref = clone;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
      ref[parts.at(-1)] = typeof val === 'string' ? U(val) : val;
      return clone;
    });
  }

  // ---------- Catálogo de estados ----------
  useEffect(() => {
    api
      .get('/api/v1/catalogs', { params: { key: 'VEHICLE_STATUSES', limit: 200 } })
      .then(({ data }) => {
        const items = (data?.items || []).filter((x) => x.active !== false);
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.label.localeCompare(b.label));
        setStatuses(items);
      })
      .catch(() => setStatuses([]));
  }, []);

  // ---------- Sucursales ----------
  useEffect(() => {
    api
      .get('/api/v1/branches', { params: { page: 1, limit: 200 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || data?.list || [];
        const ordered = naturalSortBranches(payload);
        setBranches(ordered);
        if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.');
      })
      .catch(() => setBranches([]));
  }, []);

  // ---------- Cargar vehículo (editar) ----------
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/api/v1/vehicles/${id}`)
      .then(({ data }) => {
        const v = data?.item || data;
        setVehicle(v);
        setForm({
          ...form,
          plate: v.plate || '',
          internalCode: v.internalCode || '',
          status: v.status || '',
          type: v.type || '',
          brand: v.brand || '',
          model: v.model || '',
          year: v.year || '',
          color: v.color || '',
          branch: v.branch?._id || v.branch || '',
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
          pump: { brand: v.pump?.brand || '', model: v.pump?.model || '', serial: v.pump?.serial || '' },
          body: { brand: v.body?.brand || '', model: v.body?.model || '', serial: v.body?.serial || '' },
          meters: {
            odometerKm: v.meters?.odometerKm ?? '',
            engineHours: v.meters?.engineHours ?? '',
            ladderHours: v.meters?.ladderHours ?? '',
            generatorHours: v.meters?.generatorHours ?? '',
            pumpHours: v.meters?.pumpHours ?? '',
          },
          legal: {
            padron: { number: v.legal?.padron?.number || '', issuer: v.legal?.padron?.issuer || '' },
            soap: { policy: v.legal?.soap?.policy || '', issuer: v.legal?.soap?.issuer || '', validFrom: v.legal?.soap?.validFrom || '', validTo: v.legal?.soap?.validTo || '' },
            insurance: { policy: v.legal?.insurance?.policy || '', issuer: v.legal?.insurance?.issuer || '', validFrom: v.legal?.insurance?.validFrom || '', validTo: v.legal?.insurance?.validTo || '' },
            tag: { number: v.legal?.tag?.number || '', issuer: v.legal?.tag?.issuer || '' },
            fuelCard: { issuer: v.legal?.fuelCard?.issuer || '', number: v.legal?.fuelCard?.number || '', validTo: v.legal?.fuelCard?.validTo || '' },
          },
        });
      })
      .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------- Guardar ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const reqFields = ['plate', 'internalCode', 'status', 'type', 'brand', 'model', 'year', 'color', 'branch'];
      for (const k of reqFields) {
        if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`);
      }

      const numericMeters = {
        odometerKm: parseNumber(form.meters.odometerKm),
        engineHours: parseNumber(form.meters.engineHours),
        ladderHours: parseNumber(form.meters.ladderHours),
        generatorHours: parseNumber(form.meters.generatorHours),
        pumpHours: parseNumber(form.meters.pumpHours),
      };

      const payload = upperPatch({
        ...form,
        year: form.year ? Number(form.year) : undefined,
        transmission: {
          ...form.transmission,
          gears: form.transmission.gears ? Number(form.transmission.gears) : undefined,
        },
        meters: numericMeters,
      });

      if (id) {
        await api.patch(`/api/v1/vehicles/${id}`, payload);
        alert('Vehículo actualizado con éxito');
      } else {
        await api.post('/api/v1/vehicles', payload);
        alert('Vehículo creado con éxito');
      }
      navigate('/vehicles');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Datos inválidos';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  // ---------- Media handlers ----------
  const canUpload = useMemo(() => Boolean(id), [id]);
  const refreshAfterUpload = async () => {
    if (!id) return;
    const { data } = await api.get(`/api/v1/vehicles/${id}`);
    setVehicle(data?.item || data);
  };
  const handleUploadPhoto = async ({ file, category = 'BASIC', title = '' }) => {
    if (!id) throw new Error('Guarda el vehículo antes de subir medios');
    await uploadVehiclePhoto(id, { file, category, title });
    await refreshAfterUpload();
  };
  const handleUploadDoc = async ({ file, category, label }) => {
    if (!id) throw new Error('Guarda el vehículo antes de subir documentos');
    await uploadVehicleDocument(id, { file, category, label });
    await refreshAfterUpload();
  };

  if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
          <p className="text-sm text-slate-500">Los textos se guardan en MAYÚSCULAS.</p>
        </div>
        <nav className="flex gap-2">
          {['BASICO', 'TECNICO', 'DOCUMENTOS', 'MEDIOS', 'INVENTARIO', 'ACCIDENTES', 'COMBUSTIBLE'].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded ${tab === t ? 'bg-blue-600 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.25)]' : 'bg-white border'}`}
            >
              {t === 'BASICO' ? 'Básico' : t === 'TECNICO' ? 'Técnico' : t === 'DOCUMENTOS' ? 'Documentos' : t === 'MEDIOS' ? 'Medios' : t}
            </button>
          ))}
        </nav>
      </header>

      {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
      {!branches.length && !id && <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>}

      {/* BASICO */}
      {tab === 'BASICO' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-100 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Información básica</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Placa / Patente', 'plate', 'ABC-123'],
                ['Código interno', 'internalCode', 'B:10'],
              ].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder={ph}
                    required
                  />
                </div>
              ))}

              {/* Estado (select desde catálogo) */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                >
                  <option value="" disabled>Selecciona estado</option>
                  {statuses.map((s) => (
                    <option key={s._id} value={s.code || s.label}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {!statuses.length && (
                  <p className="text-xs text-amber-600 mt-1">Primero crea estados en Configuración → Catálogos → Estados de vehículo.</p>
                )}
              </div>

              {[
                ['Tipo de vehículo', 'type', 'CARRO BOMBA, CAMIÓN...'],
                ['Marca', 'brand', 'SCANIA'],
                ['Modelo', 'model', 'P340'],
                ['Año', 'year', '2020'],
                ['Color', 'color', 'ROJO'],
              ].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder={ph}
                    required
                  />
                </div>
              ))}

              {/* Sucursal */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
                <select
                  required
                  value={String(form.branch || '')}
                  onChange={(e) => update('branch', e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                >
                  <option value="" disabled>Selecciona sucursal</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.code ? `${b.code} — ${b.name}` : b.name || b._id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : id ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* TECNICO */}
      {tab === 'TECNICO' && (
        <div className="space-y-4">
          {/* Motor */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-100 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Motor</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ['VIN', 'vin', ''],
                ['N° Motor', 'engineNumber', ''],
                ['Marca Motor', 'engineBrand', ''],
                ['Modelo Motor', 'engineModel', ''],
                ['Combustible', 'fuelType', 'DIESEL/GASOLINA'],
              ].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input value={form[key]} onChange={(e) => update(key, e.target.value)} className="w-full border p-2 rounded" placeholder={ph} />
                </div>
              ))}
            </div>
          </div>

          {/* Transmisión */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-100 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Transmisión</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                ['Tipo', 'transmission.type', 'MANUAL/AUTOMATIC/AMT/CVT'],
                ['Marca', 'transmission.brand', 'ALLISON/ZF/EATON'],
                ['Modelo', 'transmission.model', '4500 RDS'],
                ['Serie', 'transmission.serial', ''],
                ['Marchas', 'transmission.gears', '6'],
              ].map(([label, path, ph]) => {
                const val = path.split('.').reduce((acc, k) => acc?.[k], form) ?? '';
                return (
                  <div key={path}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                    <input value={val} onChange={(e) => updateNested(path, e.target.value)} className="w-full border p-2 rounded" placeholder={ph} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Medidores */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-100 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Medidores</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                ['Odómetro (km)', 'meters.odometerKm', '0'],
                ['Horómetro motor (h)', 'meters.engineHours', '0'],
                ['Horas escala (h)', 'meters.ladderHours', '0'],
                ['Horas generador (h)', 'meters.generatorHours', '0'],
                ['Horas cuerpo bomba (h)', 'meters.pumpHours', '0'],
              ].map(([label, path, ph]) => {
                const raw = path.split('.').reduce((acc, k) => acc?.[k], form) ?? '';
                const display = typeof raw === 'string' ? raw : fmtNumber(raw);
                return (
                  <div key={path}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                    <input value={display} onChange={(e) => updateNested(path, e.target.value)} className="w-full border p-2 rounded" placeholder={ph} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipos */}
          {[
            ['Generador', 'generator'],
            ['Motobomba', 'pump'],
            ['Cuerpo de bomba', 'body'],
          ].map(([title, key]) => (
            <div className="bg-white shadow rounded-xl border" key={key}>
              <div className="px-4 py-3 border-b bg-slate-100 rounded-t-xl">
                <h3 className="font-medium text-slate-700">{title}</h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['brand', 'model', 'serial'].map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{f === 'brand' ? 'Marca' : f === 'model' ? 'Modelo' : 'Serie'}</label>
                    <input value={form[key]?.[f] ?? ''} onChange={(e) => updateNested(`${key}.${f}`, e.target.value)} className="w-full border p-2 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">
              Volver
            </button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : id ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENTOS */}
      {tab === 'DOCUMENTOS' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-100 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Legal</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Padrón */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Padrón - N°</label>
                  <input value={form.legal.padron.number || ''} onChange={(e) => updateNested('legal.padron.number', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Padrón - Emisor</label>
                  <input value={form.legal.padron.issuer || ''} onChange={(e) => updateNested('legal.padron.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              {/* TAG */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">TAG - N°</label>
                  <input value={form.legal.tag.number || ''} onChange={(e) => updateNested('legal.tag.number', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">TAG - Emisor</label>
                  <input value={form.legal.tag.issuer || ''} onChange={(e) => updateNested('legal.tag.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              {/* SOAP */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">SOAP - Póliza</label>
                  <input value={form.legal.soap.policy || ''} onChange={(e) => updateNested('legal.soap.policy', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Aseguradora</label>
                  <input value={form.legal.soap.issuer || ''} onChange={(e) => updateNested('legal.soap.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Inicio</label>
                  <input type="date" value={form.legal.soap.validFrom || ''} onChange={(e) => updateNested('legal.soap.validFrom', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Fin</label>
                  <input type="date" value={form.legal.soap.validTo || ''} onChange={(e) => updateNested('legal.soap.validTo', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              {/* Seguro contractual */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Seguro - Póliza</label>
                  <input value={form.legal.insurance.policy || ''} onChange={(e) => updateNested('legal.insurance.policy', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Aseguradora</label>
                  <input value={form.legal.insurance.issuer || ''} onChange={(e) => updateNested('legal.insurance.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Inicio</label>
                  <input type="date" value={form.legal.insurance.validFrom || ''} onChange={(e) => updateNested('legal.insurance.validFrom', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Fin</label>
                  <input type="date" value={form.legal.insurance.validTo || ''} onChange={(e) => updateNested('legal.insurance.validTo', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              {/* Tarjeta combustible */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Tarj. combustible - Emisor</label>
                  <input value={form.legal.fuelCard.issuer || ''} onChange={(e) => updateNested('legal.fuelCard.issuer', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Tarj. combustible - N°</label>
                  <input value={form.legal.fuelCard.number || ''} onChange={(e) => updateNested('legal.fuelCard.number', e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Vencimiento</label>
                  <input type="date" value={form.legal.fuelCard.validTo || ''} onChange={(e) => updateNested('legal.fuelCard.validTo', e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>

              <div className="text-sm text-slate-500">La carga de documentos se realiza en la pestaña <b>Medios</b>.</div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">
              Volver
            </button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : id ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* MEDIOS */}
      {tab === 'MEDIOS' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-100 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Cargar medios (por categoría)</h3>
            </div>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['Básico (vehículo)', 'BASIC', 'photo'],
                ['Motor', 'ENGINE', 'photo'],
                ['Transmisión', 'TRANSMISSION', 'photo'],
                ['Generador', 'GENERATOR', 'photo'],
                ['Motobomba', 'PUMP', 'photo'],
                ['Cuerpo de bomba', 'BODY', 'photo'],
                ['Documentos (legal)', 'LEGAL', 'doc'],
                ['Manuales', 'MANUALS', 'doc'],
                ['Partes', 'PARTS', 'doc'],
              ].map(([label, cat, mode]) => (
                <div key={cat} className="border rounded-lg p-3">
                  <div className="font-medium mb-2">{label}</div>
                  <MediaUploader
                    onUpload={(p) => (mode === 'doc' ? handleUploadDoc({ ...p, category: cat }) : handleUploadPhoto({ ...p, category: cat }))}
                    accept={mode === 'doc' ? 'application/pdf,image/*' : 'image/*,video/*'}
                    category={cat}
                    mode={mode}
                  />
                  {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
                </div>
              ))}
            </div>
          </div>

          {vehicle && (
            <div className="bg-white shadow rounded-xl border">
              <div className="px-4 py-3 border-b bg-slate-100 rounded-t-xl">
                <h3 className="font-medium text-slate-700">Contenido actual</h3>
              </div>
              <div className="p-4 grid gap-4">
                <div>
                  <div className="font-medium mb-1">Fotos</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {(vehicle.photos || []).map((ph) => (
                      <div key={ph._id} className="text-xs">
                        <img src={ph.url} alt={ph.title || ''} className="w-full h-24 object-cover rounded border" />
                        <div className="mt-1">
                          {ph.category} {ph.title ? `- ${ph.title}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Documentos</div>
                  <ul className="list-disc pl-5 text-sm">
                    {(vehicle.documents || []).map((d) => (
                      <li key={d._id}>
                        <span className="font-medium">{d.category}</span> — {d.label} —{' '}
                        <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          ver
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={() => navigate('/vehicles')} className="px-3 py-2 border rounded">
              Volver
            </button>
          </div>
        </div>
      )}

      {/* ESQUELETOS */}
      {['Inventario', 'Accidentes', 'Combustibles'].includes(tab) && (
        <div className="bg-white shadow rounded-xl border p-6 text-slate-600">Este módulo está en desarrollo.</div>
      )}
    </form>
  );
}
