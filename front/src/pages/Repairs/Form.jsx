// // // front/src/pages/Repairs/Form.jsx
// // // -----------------------------------------------------------------------------
// // // Catálogo → Reparaciones (Taller / Técnico)
// // // - Estándar técnico para OT: define severidad/impacto/tiempo estándar KPI
// // // - Modo Ver: ?mode=view
// // // - Guardia de cambios sin guardar: hooks/UnsavedChangesGuard
// // // - system/subsystem/component/failureMode controlados por JSON (repairTaxonomy.json)
// // // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
// import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
// import { RepairsAPI } from '../../api/repairs.api'
// import vehicleTaxonomy from '../../data/fleetcore/vehicle-taxonomy.json'
// import repairTaxonomy from '../../data/fleetcore/repair-taxonomy.json'

// const emptyForm = {
//   code: '',
//   name: '',
//   description: '',
//   systemKey: '',
//   subsystemKey: '',
//   componentKey: '',
//   failureModeKey: '',
//   type: 'CORRECTIVE',
//   severityDefault: 'MEDIUM',
//   operationalImpact: 'LIMITED',
//   standardLaborMinutes: 0,
//   tags: [],
//   isActive: true,
// }

// function toLines(arr){
//   return Array.isArray(arr) ? arr.filter(Boolean).join('\n') : ''
// }
// function fromLines(text){
//   return String(text || '')
//     .split('\n')
//     .map(s => s.trim())
//     .filter(Boolean)
// }

// const TYPE_OPTIONS = [
//   { v: 'CORRECTIVE', l: 'Correctiva' },
//   { v: 'PREVENTIVE', l: 'Preventiva' },
//   { v: 'INSPECTION', l: 'Inspección' },
//   { v: 'UPGRADE', l: 'Mejora/Upgrade' },
// ]
// const SEVERITY_OPTIONS = [
//   { v: 'LOW', l: 'Baja' },
//   { v: 'MEDIUM', l: 'Media' },
//   { v: 'HIGH', l: 'Alta' },
//   { v: 'CRITICAL', l: 'Crítica' },
// ]
// const IMPACT_OPTIONS = [
//   { v: 'NO_STOP', l: 'Sin detención' },
//   { v: 'LIMITED', l: 'Operación limitada' },
//   { v: 'OUT_OF_SERVICE', l: 'Fuera de servicio' },
// ]

// export default function RepairsForm(){
//   const nav = useNavigate()
//   const { id } = useParams()
//   const [sp] = useSearchParams()
//   const viewMode = sp.get('mode') === 'view'

//   const [loading, setLoading] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [form, setForm] = useState(emptyForm)
//   const [initial, setInitial] = useState(emptyForm)

//   // Validación temprana de duplicados (crear y también edición si cambia el código)
//   const [codeCheck, setCodeCheck] = useState({ checking: false, duplicate: false })

//   const repairSystems = useMemo(() => (repairTaxonomy?.systems || []), [])
//   const failureModes = useMemo(() => (repairTaxonomy?.failureModes || []), [])

//   // Normaliza opciones desde JSON:
//   // - Opción B: [{ v, l }]
//   // - Opción A: ["X", "Y"] => label = value
//   const normalizeOptions = (opt, fallback) => {
//     if (Array.isArray(opt) && opt.length && typeof opt[0] === 'object') {
//       return opt
//         .filter(Boolean)
//         .map(o => ({ v: String(o.v || ''), l: String(o.l || o.v || '') }))
//         .filter(o => o.v)
//     }
//     if (Array.isArray(opt) && opt.length && typeof opt[0] === 'string') {
//       return opt.map(v => ({ v: String(v), l: String(v) }))
//     }
//     return fallback
//   }

//   const typeOptions = useMemo(() => {
//     return normalizeOptions(repairTaxonomy?.options?.types, TYPE_OPTIONS)
//   }, [])
//   const severityOptions = useMemo(() => {
//     return normalizeOptions(repairTaxonomy?.options?.severities, SEVERITY_OPTIONS)
//   }, [])
//   const impactOptions = useMemo(() => {
//     return normalizeOptions(repairTaxonomy?.options?.operationalImpacts, IMPACT_OPTIONS)
//   }, [])

//   const selectedSystemNode = useMemo(() => {
//     return repairSystems.find(s => s.key === form.systemKey) || null
//   }, [repairSystems, form.systemKey])

//   const subsystemOptions = useMemo(() => selectedSystemNode?.subsystems || [], [selectedSystemNode])
//   const componentOptions = useMemo(() => selectedSystemNode?.components || [], [selectedSystemNode])

//   const isDirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(form), [initial, form])

//   UnsavedChangesGuard({
//     when: isDirty && !viewMode,
//     message: 'Hay cambios sin guardar. ¿Deseas salir sin guardar?',
//   })

//   const onBack = () => {
//     if (!viewMode && isDirty) {
//       const ok = window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')
//       if (!ok) return
//     }
//     nav('/config/catalogs/repairs')
//   }

//   const onEdit = () => {
//     if (!id) return
//     nav(`/config/catalogs/repairs/${id}`)
//   }

//   // Si cambia systemKey, resetea dependientes si quedan inválidos
//   useEffect(() => {
//     if (!form.systemKey) {
//       if (form.subsystemKey || form.componentKey) {
//         setForm(s => ({ ...s, subsystemKey:'', componentKey:'' }))
//       }
//       return
//     }
//     const validSub = (subsystemOptions || []).some(x => x.key === form.subsystemKey)
//     const validComp = (componentOptions || []).some(x => x.key === form.componentKey)
//     if (!validSub && form.subsystemKey) setForm(s => ({ ...s, subsystemKey: '' }))
//     if (!validComp && form.componentKey) setForm(s => ({ ...s, componentKey: '' }))
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [form.systemKey, subsystemOptions, componentOptions])

//   const load = async () => {
//     if (!id) {
//       setForm(emptyForm)
//       setInitial(emptyForm)
//       setCodeCheck({ checking: false, duplicate: false })
//       return
//     }
//     setLoading(true)
//     try{
//       const { data } = await RepairsAPI.get(id)
//       const item = data?.item || data?.data || data
//       const next = {
//         code: item?.code || '',
//         name: item?.name || '',
//         description: item?.description || '',
//         systemKey: item?.systemKey || '',
//         subsystemKey: item?.subsystemKey || '',
//         componentKey: item?.componentKey || '',
//         failureModeKey: item?.failureModeKey || '',
//         type: item?.type || 'CORRECTIVE',
//         severityDefault: item?.severityDefault || 'MEDIUM',
//         operationalImpact: item?.operationalImpact || 'LIMITED',
//         standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
//         tags: Array.isArray(item?.tags) ? item.tags : [],
//         isActive: (typeof item?.isActive === 'boolean') ? item.isActive : (typeof item?.active === 'boolean') ? item.active : true,
//       }
//       setForm(next)
//       setInitial(next)
//       setCodeCheck({ checking: false, duplicate: false })
//     }catch(err){
//       console.error(err)
//       alert(err?.response?.data?.message || 'No fue posible cargar el registro')
//     }finally{
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

//   const checkDuplicateCode = async () => {
//     if (viewMode) return
//     const codeNorm = String(form.code || '').trim().toUpperCase()
//     const initialNorm = String(initial.code || '').trim().toUpperCase()

//     // En edición: solo validar si cambió el código
//     const shouldCheck = Boolean(codeNorm) && (!id || (id && codeNorm !== initialNorm))
//     if (!shouldCheck) {
//       setCodeCheck({ checking: false, duplicate: false })
//       return
//     }

//     setCodeCheck(s => ({ ...s, checking: true }))
//     try{
//       const { data } = await RepairsAPI.list({ page: 1, limit: 10, q: codeNorm, active: '' })
//       const items = data?.items || []
//       const dup = items.some((it) => {
//         const itCode = String(it?.code || '').trim().toUpperCase()
//         const sameCode = itCode === codeNorm
//         const sameId = id && String(it?._id) === String(id)
//         return sameCode && !sameId
//       })
//       setCodeCheck({ checking: false, duplicate: dup })
//     }catch{
//       // si falla la consulta, no bloqueamos; evitamos falsos positivos
//       setCodeCheck({ checking: false, duplicate: false })
//     }
//   }

//   const submit = async (e) => {
//     e.preventDefault()
//     if (viewMode) return

//     const codeNorm = String(form.code || '').trim().toUpperCase()
//     if (!codeNorm) return alert('Código es obligatorio')
//     if (!String(form.name || '').trim()) return alert('Nombre es obligatorio')
//     if (!form.systemKey) return alert('Sistema es obligatorio')

//     // Si hay duplicado detectado, no guardar (se muestra inline bajo el campo)
//     if (codeCheck.duplicate) return

//     if (id && !isDirty) return alert('No hay cambios por guardar')

//     const payload = {
//       code: codeNorm,
//       name: String(form.name || '').trim(),
//       description: form.description,
//       systemKey: form.systemKey,
//       subsystemKey: form.subsystemKey || '',
//       componentKey: form.componentKey || '',
//       failureModeKey: form.failureModeKey || '',
//       type: form.type,
//       severityDefault: form.severityDefault,
//       operationalImpact: form.operationalImpact,
//       standardLaborMinutes: Number(form.standardLaborMinutes || 0),
//       tags: Array.isArray(form.tags) ? form.tags : [],
//       isActive: form.isActive === true,
//       active: form.isActive === true,
//     }

//     setSaving(true)
//     try{
//       if (id) {
//         await RepairsAPI.update(id, payload)
//         alert('Reparación actualizada')
//       } else {
//         await RepairsAPI.create(payload)
//         alert('Reparación creada')
//       }
//       setInitial(payload)
//       nav('/config/catalogs/repairs')
//     }catch(err){
//       console.error(err)
//       const msg = err?.response?.data?.message
//       // Si backend informa duplicado, reflejarlo en UI (sin alert de "al final")
//       if (String(msg || '').toLowerCase().includes('duplicate') || err?.response?.status === 409) {
//         setCodeCheck({ checking: false, duplicate: true })
//         return
//       }
//       alert(msg || 'No fue posible guardar')
//     }finally{
//       setSaving(false)
//     }
//   }

//   const tagHints = useMemo(() => {
//     const t = repairTaxonomy?.repairTags || {}
//     const all = [ ...(t.work||[]), ...(t.level||[]), ...(t.family||[]) ]
//     return Array.from(new Set(all))
//   }, [])

//   const codeHasError = !viewMode && !loading && Boolean(String(form.code || '').trim()) && codeCheck.duplicate

//   const onTagsKeyDown = (e) => {
//     // Ctrl + Shift + Enter => inserta salto de línea dentro del textarea (sin perder el foco)
//     if (e.key === 'Enter' && e.ctrlKey && e.shiftKey) {
//       e.preventDefault()
//       const el = e.target
//       const value = String(el.value || '')
//       const start = el.selectionStart ?? value.length
//       const end = el.selectionEnd ?? value.length
//       const nextValue = value.slice(0, start) + '\n' + value.slice(end)
//       setForm(s => ({ ...s, tags: fromLines(nextValue).map(t => t.toUpperCase()) }))
//       requestAnimationFrame(() => {
//         try{
//           el.selectionStart = el.selectionEnd = start + 1
//         }catch{}
//       })
//     }
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h1 className="text-xl font-bold">
//           {id ? (viewMode ? 'Ver Reparación' : 'Editar Reparación') : 'Nueva Reparación'}
//         </h1>
//         <p className="text-sm text-gray-600">
//           Estándar técnico para OT: severidad/impacto/tiempo estándar (KPI).
//         </p>
//       </div>

//       <form onSubmit={submit} className="bg-white border rounded-lg shadow-sm overflow-hidden">
//         <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
//           <div className="text-sm text-gray-500">
//             {loading ? 'Cargando…' : viewMode ? 'Modo ver' : ''}
//           </div>
//         </div>

//         <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
//           <label className="text-sm md:col-span-2">
//             <div className="text-gray-600 mb-1">Código *</div>
//             <input
//               className={"border rounded-md px-3 py-2 w-full " + (codeHasError ? "border-red-500 ring-1 ring-red-200" : "")}
//               value={form.code}
//               disabled={viewMode || loading || saving}
//               maxLength={25}
//               onChange={(e)=> {
//                 setForm(s=>({ ...s, code: e.target.value }))
//                 if (codeCheck.duplicate) setCodeCheck(s => ({ ...s, duplicate: false }))
//               }}
//               onBlur={checkDuplicateCode}
//               placeholder="Ej: REP-FREN-001"
//             />
//             {codeHasError && (
//               <div className="text-xs text-red-600 mt-1">Este código ya existe</div>
//             )}
//           </label>

//           <label className="text-sm md:col-span-2">
//             <div className="text-gray-600 mb-1">Nombre *</div>
//             <input
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.name}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, name: e.target.value }))}
//               placeholder="Ej: Cambio pastillas delanteras"
//             />
//           </label>

//           <label className="text-sm md:col-span-4">
//             <div className="text-gray-600 mb-1">Descripción</div>
//             <textarea
//               className="border rounded-md px-3 py-2 w-full min-h-24"
//               value={form.description}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, description: e.target.value }))}
//             />
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Sistema *</div>
//             <select
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.systemKey}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, systemKey: e.target.value }))}
//             >
//               <option value="">Seleccione…</option>
//               {(vehicleTaxonomy?.systems || []).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
//             </select>
//             <div className="text-xs text-gray-500 mt-1">Recomendado usar el canon del sistema para BI.</div>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Sub-sistema</div>
//             <select
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.subsystemKey}
//               disabled={viewMode || loading || !form.systemKey}
//               onChange={(e)=>setForm(s=>({ ...s, subsystemKey: e.target.value }))}
//             >
//               <option value="">{form.systemKey ? '(Sin sub-sistema)' : 'Seleccione sistema primero'}</option>
//               {subsystemOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Componente</div>
//             <select
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.componentKey}
//               disabled={viewMode || loading || !form.systemKey}
//               onChange={(e)=>setForm(s=>({ ...s, componentKey: e.target.value }))}
//             >
//               <option value="">{form.systemKey ? '(Sin componente)' : 'Seleccione sistema primero'}</option>
//               {componentOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Modo de falla</div>
//             <select
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.failureModeKey}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, failureModeKey: e.target.value }))}
//             >
//               <option value="">(Sin modo)</option>
//               {failureModes.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Tipo</div>
//             <select
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.type}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, type: e.target.value }))}
//             >
//               {typeOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Severidad (default)</div>
//             <select
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.severityDefault}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, severityDefault: e.target.value }))}
//             >
//               {severityOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Impacto operacional</div>
//             <select
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.operationalImpact}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, operationalImpact: e.target.value }))}
//             >
//               {impactOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
//             </select>
//           </label>

//           <label className="text-sm">
//             <div className="text-gray-600 mb-1">Tiempo estándar (min)</div>
//             <input
//               type="number"
//               min="0"
//               className="border rounded-md px-3 py-2 w-full"
//               value={form.standardLaborMinutes}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, standardLaborMinutes: Number(e.target.value || 0) }))}
//             />
//           </label>

//           <label className="text-sm md:col-span-2">
//             <div className="text-gray-600 mb-1">Tags (1 por línea)</div>
//             <textarea
//               className="border rounded-md px-3 py-2 w-full min-h-24"
//               value={toLines(form.tags)}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, tags: fromLines(e.target.value).map(t=>t.toUpperCase()) }))}
//               onKeyDown={onTagsKeyDown}
//               placeholder="Ej:\nMANTENCION\nFRENOS\nSEGURIDAD"
//             />
//             <div className="mt-3">
//               <span className="inline-flex items-center px-2 py-0.5 rounded-md border bg-gray-50 text-xs text-gray-700">
//                 Sugeridos
//               </span>
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {tagHints.slice(0, 30).map((t) => {
//                   const next = String(t).toUpperCase()
//                   const selected = (form.tags || []).map(String).map(x=>x.toUpperCase()).includes(next)
//                   return (
//                     <button
//                       type="button"
//                       key={t}
//                       className={
//                         "px-3 py-1.5 rounded-md border text-xs " +
//                         (selected
//                           ? "bg-[color:var(--fc-primary)]/10 border-[color:var(--fc-primary)]/40 text-[color:var(--fc-primary)]"
//                           : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
//                       }
//                       onClick={() =>
//                         setForm((s) => {
//                           const cur = Array.isArray(s.tags) ? s.tags.map((x) => String(x).toUpperCase()) : []
//                           const has = cur.includes(next)
//                           return { ...s, tags: has ? cur.filter((x) => x !== next) : [...cur, next] }
//                         })
//                       }
//                       disabled={viewMode || loading}
//                       title={selected ? "Quitar" : "Agregar"}
//                     >
//                       {selected ? "✓ " : ""}
//                       {t}
//                     </button>
//                   )
//                 })}
//               </div>
//             </div>
//           </label>

//           <label className="text-sm flex items-center gap-2 md:col-span-2 mt-1 select-none">
//             <input
//               type="checkbox"
//               className="h-4 w-4"
//               checked={form.isActive === true}
//               disabled={viewMode || loading || saving}
//               onChange={(e)=>setForm(s=>({ ...s, isActive: e.target.checked }))}
//             />
//             <span>Activo</span>
//           </label>
//         </div>

//         <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
//           <button type="button" className="btn border rounded-md px-4 py-2" onClick={onBack} disabled={saving || loading}>
//             {(!viewMode && isDirty) ? 'Cancelar' : 'Volver'}
//           </button>

//           {id && viewMode && (
//             <button
//               type="button"
//               className="px-4 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white"
//               onClick={onEdit}
//             >
//               Editar
//             </button>
//           )}

//           {!viewMode && (
//             <button
//               type="submit"
//               className="px-4 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white disabled:opacity-50"
//               disabled={saving || loading || (id ? !isDirty : false) || codeCheck.duplicate}
//               title={codeCheck.duplicate ? 'Este código ya existe' : (id && !isDirty) ? 'No hay cambios por guardar' : ''}
//             >
//               {saving ? 'Guardando…' : 'Guardar'}
//             </button>
//           )}
//         </div>
//       </form>
//     </div>
//   )
// }

// // front/src/pages/Repairs/Form.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Reparaciones (Taller / Técnico)
// // - Estándar técnico para OT: define severidad/impacto/tiempo estándar KPI
// // - Modo Ver: ?mode=view
// // - Guardia de cambios sin guardar: hooks/UnsavedChangesGuard
// // - system/subsystem/component/failureMode controlados por JSON (repairTaxonomy.json)
// // -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
import { RepairsAPI } from '../../api/repairs.api'
import vehicleTaxonomy from '../../data/fleetcore/vehicle-taxonomy.json'
import repairTaxonomy from '../../data/fleetcore/repair-taxonomy.json'

const emptyForm = {
  code: '',
  name: '',
  description: '',
  systemKey: '',
  subsystemKey: '',
  componentKey: '',
  failureModeKey: '',
  type: 'CORRECTIVE',
  severityDefault: 'MEDIUM',
  operationalImpact: 'LIMITED',
  standardLaborMinutes: 0,
  tags: [],
  isActive: true,
}

function toLines(arr){
  return Array.isArray(arr) ? arr.filter(Boolean).join('\n') : ''
}
function fromLines(text){
  return String(text || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

const TYPE_OPTIONS = [
  { v: 'CORRECTIVE', l: 'Correctiva' },
  { v: 'PREVENTIVE', l: 'Preventiva' },
  { v: 'INSPECTION', l: 'Inspección' },
  { v: 'UPGRADE', l: 'Mejora/Upgrade' },
]
const SEVERITY_OPTIONS = [
  { v: 'LOW', l: 'Baja' },
  { v: 'MEDIUM', l: 'Media' },
  { v: 'HIGH', l: 'Alta' },
  { v: 'CRITICAL', l: 'Crítica' },
]
const IMPACT_OPTIONS = [
  { v: 'NO_STOP', l: 'Sin detención' },
  { v: 'LIMITED', l: 'Operación limitada' },
  { v: 'OUT_OF_SERVICE', l: 'Fuera de servicio' },
]

export default function RepairsForm(){
  const nav = useNavigate()
  const { id } = useParams()
  const [sp] = useSearchParams()
  const viewMode = sp.get('mode') === 'view'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [initial, setInitial] = useState(emptyForm)

  // Validación temprana de duplicados (crear y también edición si cambia el código)
  const [codeCheck, setCodeCheck] = useState({ checking: false, duplicate: false })

  const repairSystems = useMemo(() => (repairTaxonomy?.systems || []), [])
  const failureModes = useMemo(() => (repairTaxonomy?.failureModes || []), [])

  // Normaliza opciones desde JSON:
  // - Opción B: [{ v, l }]
  // - Opción A: ["X", "Y"] => label = value
  const normalizeOptions = (opt, fallback) => {
    if (Array.isArray(opt) && opt.length && typeof opt[0] === 'object') {
      return opt
        .filter(Boolean)
        .map(o => ({ v: String(o.v || ''), l: String(o.l || o.v || '') }))
        .filter(o => o.v)
    }
    if (Array.isArray(opt) && opt.length && typeof opt[0] === 'string') {
      return opt.map(v => ({ v: String(v), l: String(v) }))
    }
    return fallback
  }

  const typeOptions = useMemo(() => {
    return normalizeOptions(repairTaxonomy?.options?.types, TYPE_OPTIONS)
  }, [])
  const severityOptions = useMemo(() => {
    return normalizeOptions(repairTaxonomy?.options?.severities, SEVERITY_OPTIONS)
  }, [])
  const impactOptions = useMemo(() => {
    return normalizeOptions(repairTaxonomy?.options?.operationalImpacts, IMPACT_OPTIONS)
  }, [])

  const selectedSystemNode = useMemo(() => {
    return repairSystems.find(s => s.key === form.systemKey) || null
  }, [repairSystems, form.systemKey])

  const subsystemOptions = useMemo(() => selectedSystemNode?.subsystems || [], [selectedSystemNode])
  const componentOptions = useMemo(() => selectedSystemNode?.components || [], [selectedSystemNode])

  const isDirty = useMemo(() => JSON.stringify(initial) !== JSON.stringify(form), [initial, form])

  UnsavedChangesGuard({
    when: isDirty && !viewMode,
    message: 'Hay cambios sin guardar. ¿Deseas salir sin guardar?',
  })

  const onBack = () => {
    if (!viewMode && isDirty) {
      const ok = window.confirm('Hay cambios sin guardar. ¿Deseas descartarlos?')
      if (!ok) return
    }
    nav('/config/catalogs/repairs')
  }

  const onEdit = () => {
    if (!id) return
    nav(`/config/catalogs/repairs/${id}`)
  }

  // Si cambia systemKey, resetea dependientes si quedan inválidos
  useEffect(() => {
    if (!form.systemKey) {
      if (form.subsystemKey || form.componentKey) {
        setForm(s => ({ ...s, subsystemKey:'', componentKey:'' }))
      }
      return
    }
    const validSub = (subsystemOptions || []).some(x => x.key === form.subsystemKey)
    const validComp = (componentOptions || []).some(x => x.key === form.componentKey)
    if (!validSub && form.subsystemKey) setForm(s => ({ ...s, subsystemKey: '' }))
    if (!validComp && form.componentKey) setForm(s => ({ ...s, componentKey: '' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.systemKey, subsystemOptions, componentOptions])

  const load = async () => {
    if (!id) {
      setForm(emptyForm)
      setInitial(emptyForm)
      setCodeCheck({ checking: false, duplicate: false })
      return
    }
    setLoading(true)
    try{
      const { data } = await RepairsAPI.get(id)
      const item = data?.item || data?.data || data
      const next = {
        code: item?.code || '',
        name: item?.name || '',
        description: item?.description || '',
        systemKey: item?.systemKey || '',
        subsystemKey: item?.subsystemKey || '',
        componentKey: item?.componentKey || '',
        failureModeKey: item?.failureModeKey || '',
        type: item?.type || 'CORRECTIVE',
        severityDefault: item?.severityDefault || 'MEDIUM',
        operationalImpact: item?.operationalImpact || 'LIMITED',
        standardLaborMinutes: Number(item?.standardLaborMinutes || 0),
        tags: Array.isArray(item?.tags) ? item.tags : [],
        isActive: (typeof item?.isActive === 'boolean') ? item.isActive : (typeof item?.active === 'boolean') ? item.active : true,
      }
      setForm(next)
      setInitial(next)
      setCodeCheck({ checking: false, duplicate: false })
    }catch(err){
      console.error(err)
      alert(err?.response?.data?.message || 'No fue posible cargar el registro')
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkDuplicateCode = async () => {
    if (viewMode) return
    const codeNorm = String(form.code || '').trim().toUpperCase()
    const initialNorm = String(initial.code || '').trim().toUpperCase()

    // En edición: solo validar si cambió el código
    const shouldCheck = Boolean(codeNorm) && (!id || (id && codeNorm !== initialNorm))
    if (!shouldCheck) {
      setCodeCheck({ checking: false, duplicate: false })
      return
    }

    setCodeCheck(s => ({ ...s, checking: true }))
    try{
      const { data } = await RepairsAPI.list({ page: 1, limit: 10, q: codeNorm, active: '' })
      const items = data?.items || []
      const dup = items.some((it) => {
        const itCode = String(it?.code || '').trim().toUpperCase()
        const sameCode = itCode === codeNorm
        const sameId = id && String(it?._id) === String(id)
        return sameCode && !sameId
      })
      setCodeCheck({ checking: false, duplicate: dup })
    }catch{
      // si falla la consulta, no bloqueamos; evitamos falsos positivos
      setCodeCheck({ checking: false, duplicate: false })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (viewMode) return

    const codeNorm = String(form.code || '').trim().toUpperCase()
    if (!codeNorm) return alert('Código es obligatorio')
    if (!String(form.name || '').trim()) return alert('Nombre es obligatorio')
    if (!form.systemKey) return alert('Sistema es obligatorio')

    // Si hay duplicado detectado, no guardar (se muestra inline bajo el campo)
    if (codeCheck.duplicate) return

    if (id && !isDirty) return alert('No hay cambios por guardar')

    const payload = {
      code: codeNorm,
      name: String(form.name || '').trim(),
      description: form.description,
      systemKey: form.systemKey,
      subsystemKey: form.subsystemKey || '',
      componentKey: form.componentKey || '',
      failureModeKey: form.failureModeKey || '',
      type: form.type,
      severityDefault: form.severityDefault,
      operationalImpact: form.operationalImpact,
      standardLaborMinutes: Number(form.standardLaborMinutes || 0),
      tags: Array.isArray(form.tags) ? form.tags : [],
      isActive: form.isActive === true,
      active: form.isActive === true,
    }

    setSaving(true)
    try{
      if (id) {
        await RepairsAPI.update(id, payload)
        alert('Reparación actualizada')
      } else {
        await RepairsAPI.create(payload)
        alert('Reparación creada')
      }
      setInitial(payload)
      nav('/config/catalogs/repairs')
    }catch(err){
      console.error(err)
      const msg = err?.response?.data?.message
      // Si backend informa duplicado, reflejarlo en UI (sin alert de "al final")
      if (String(msg || '').toLowerCase().includes('duplicate') || err?.response?.status === 409) {
        setCodeCheck({ checking: false, duplicate: true })
        return
      }
      alert(msg || 'No fue posible guardar')
    }finally{
      setSaving(false)
    }
  }

  const tagHints = useMemo(() => {
    const t = repairTaxonomy?.repairTags || {}
    const all = [ ...(t.work||[]), ...(t.level||[]), ...(t.family||[]) ]
    return Array.from(new Set(all))
  }, [])

  const codeHasError = !viewMode && !loading && Boolean(String(form.code || '').trim()) && codeCheck.duplicate

  const onTagsKeyDown = (e) => {
    // Shift + Enter => inserta salto de línea dentro del textarea (sin perder el foco)
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      const el = e.target
      const value = String(el.value || '')
      const start = el.selectionStart ?? value.length
      const end = el.selectionEnd ?? value.length
      const nextValue = value.slice(0, start) + '\n' + value.slice(end)
      setForm(s => ({ ...s, tags: fromLines(nextValue).map(t => t.toUpperCase()) }))
      requestAnimationFrame(() => {
        try{
          el.selectionStart = el.selectionEnd = start + 1
        }catch{}
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">
          {id ? (viewMode ? 'Ver Reparación' : 'Editar Reparación') : 'Nueva Reparación'}
        </h1>
        <p className="text-sm text-gray-600">
          Estándar técnico para OT: severidad/impacto/tiempo estándar (KPI).
        </p>
      </div>

      <form onSubmit={submit} className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
          <div className="text-sm text-gray-500">
            {loading ? 'Cargando…' : viewMode ? 'Modo ver' : ''}
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm md:col-span-2">
            <div className="text-gray-600 mb-1">Código *</div>
            <input
              className={"border rounded-md px-3 py-2 w-full " + (codeHasError ? "border-red-500 ring-1 ring-red-200" : "")}
              value={form.code}
              disabled={viewMode || loading || saving}
              maxLength={25}
              onChange={(e)=> {
                setForm(s=>({ ...s, code: e.target.value }))
                if (codeCheck.duplicate) setCodeCheck(s => ({ ...s, duplicate: false }))
              }}
              onBlur={checkDuplicateCode}
              placeholder="Ej: REP-FREN-001"
            />
            {codeHasError && (
              <div className="text-xs text-red-600 mt-1">Este código ya existe</div>
            )}
          </label>

          <label className="text-sm md:col-span-2">
            <div className="text-gray-600 mb-1">Nombre *</div>
            <input
              className="border rounded-md px-3 py-2 w-full"
              value={form.name}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, name: e.target.value }))}
              placeholder="Ej: Cambio pastillas delanteras"
            />
          </label>

          <label className="text-sm md:col-span-4">
            <div className="text-gray-600 mb-1">Descripción</div>
            <textarea
              className="border rounded-md px-3 py-2 w-full min-h-24"
              value={form.description}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, description: e.target.value }))}
            />
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Sistema *</div>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={form.systemKey}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, systemKey: e.target.value }))}
            >
              <option value="">Seleccione…</option>
              {(vehicleTaxonomy?.systems || []).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <div className="text-xs text-gray-500 mt-1">Recomendado usar el canon del sistema para BI.</div>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Sub-sistema</div>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={form.subsystemKey}
              disabled={viewMode || loading || !form.systemKey}
              onChange={(e)=>setForm(s=>({ ...s, subsystemKey: e.target.value }))}
            >
              <option value="">{form.systemKey ? '(Sin sub-sistema)' : 'Seleccione sistema primero'}</option>
              {subsystemOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Componente</div>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={form.componentKey}
              disabled={viewMode || loading || !form.systemKey}
              onChange={(e)=>setForm(s=>({ ...s, componentKey: e.target.value }))}
            >
              <option value="">{form.systemKey ? '(Sin componente)' : 'Seleccione sistema primero'}</option>
              {componentOptions.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Modo de falla</div>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={form.failureModeKey}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, failureModeKey: e.target.value }))}
            >
              <option value="">(Sin modo)</option>
              {failureModes.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Tipo</div>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={form.type}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, type: e.target.value }))}
            >
              {typeOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Severidad (default)</div>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={form.severityDefault}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, severityDefault: e.target.value }))}
            >
              {severityOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Impacto operacional</div>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={form.operationalImpact}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, operationalImpact: e.target.value }))}
            >
              {impactOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <div className="text-gray-600 mb-1">Tiempo estándar (min)</div>
            <input
              type="number"
              min="0"
              className="border rounded-md px-3 py-2 w-full"
              value={form.standardLaborMinutes}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, standardLaborMinutes: Number(e.target.value || 0) }))}
            />
          </label>

          <label className="text-sm md:col-span-2">
            <div className="text-gray-600 mb-1">Tags (1 por línea)</div>
            <textarea
              className="border rounded-md px-3 py-2 w-full min-h-24"
              value={toLines(form.tags)}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, tags: fromLines(e.target.value).map(t=>t.toUpperCase()) }))}
              onKeyDown={onTagsKeyDown}
              placeholder="Ej:\nMANTENCION\nFRENOS\nSEGURIDAD"
            />
            <div className="text-xs text-gray-500 mt-2">Tip: Shift + Enter para bajar una línea dentro del campo.</div>
          </label>

          {/* Sugeridos (ocupa todo el ancho) */}
          <div className="md:col-span-4">
            <div className="border rounded-md bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md border bg-white text-xs text-gray-700">
                  Sugeridos
                </span>
                <span className="text-xs text-gray-500">Click para agregar / quitar</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {tagHints.slice(0, 40).map((t) => {
                  const next = String(t).toUpperCase()
                  const selected = (form.tags || []).map(String).map(x=>x.toUpperCase()).includes(next)
                  return (
                    <button
                      type="button"
                      key={t}
                      className={
                        "px-3 py-1.5 rounded-md border text-xs " +
                        (selected
                          ? "bg-[color:var(--fc-primary)]/10 border-[color:var(--fc-primary)]/40 text-[color:var(--fc-primary)]"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50")
                      }
                      onClick={() =>
                        setForm((s) => {
                          const cur = Array.isArray(s.tags) ? s.tags.map((x) => String(x).toUpperCase()) : []
                          const has = cur.includes(next)
                          return { ...s, tags: has ? cur.filter((x) => x !== next) : [...cur, next] }
                        })
                      }
                      disabled={viewMode || loading}
                      title={selected ? "Quitar" : "Agregar"}
                    >
                      {selected ? "✓ " : ""}
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>


          <label className="text-sm flex items-center gap-2 md:col-span-2 mt-1 select-none">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.isActive === true}
              disabled={viewMode || loading || saving}
              onChange={(e)=>setForm(s=>({ ...s, isActive: e.target.checked }))}
            />
            <span>Activo</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
          <button type="button" className="btn border rounded-md px-4 py-2" onClick={onBack} disabled={saving || loading}>
            {(!viewMode && isDirty) ? 'Cancelar' : 'Volver'}
          </button>

          {id && viewMode && (
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white"
              onClick={onEdit}
            >
              Editar
            </button>
          )}

          {!viewMode && (
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white disabled:opacity-50"
              disabled={saving || loading || (id ? !isDirty : false) || codeCheck.duplicate}
              title={codeCheck.duplicate ? 'Este código ya existe' : (id && !isDirty) ? 'No hay cambios por guardar' : ''}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
