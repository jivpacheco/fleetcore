// front/src/pages/Vehicles/Form.jsx
// -----------------------------------------------------------------------------
// Ficha de Vehículos con tabs: Básico, Técnico, Documentos, Medios.
// - TODOS los campos de texto se normalizan a MAYÚSCULAS (front y back).
// - Subida de medios por tarjeta (category) usando MediaUploader.
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/http'
import { useNavigate, useParams } from 'react-router-dom'
import MediaUploader from '../../components/Vehicle/VehicleMediaUploader'
import { uploadVehiclePhoto, uploadVehicleDocument } from '../../api/vehicles.api'

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

export default function VehiclesForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [tab, setTab] = useState('BASICO') // BASICO|TECNICO|DOCUMENTOS|MEDIOS
  const [branches, setBranches] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [vehicle, setVehicle] = useState(null)

  const [form, setForm] = useState({
    // Básico (obligatorio)
    plate: '',
    internalCode: '',
    status: 'ACTIVE',
    type: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    branch: '',

    // Técnico
    vin: '',
    engineNumber: '',
    engineBrand: '',
    engineModel: '',
    fuelType: '',
    transmission: { type:'', brand:'', model:'', serial:'', gears:'' },
    batteries: [], // dejamos edición básica (no UI compleja aún)
    tyres: [],

    generator: { brand:'', model:'', serial:'' },
    pump: { brand:'', model:'', serial:'' },
    body: { brand:'', model:'', serial:'' },

    meters: { odometerKm:'', engineHours:'', ladderHours:'', generatorHours:'', pumpHours:'' },
  })

  // ---------- Helpers ----------
  const upperPatch = (obj) => {
    const out = Array.isArray(obj) ? [] : {}
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (typeof v === 'string') out[k] = U(v)
      else if (v && typeof v === 'object') out[k] = upperPatch(v)
      else out[k] = v
    }
    return out
  }

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: typeof val === 'string' ? U(val) : val }))
  }
  function updateNested(path, val) {
    setForm((f) => {
      const clone = structuredClone(f)
      let ref = clone
      const parts = path.split('.')
      for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]]
      ref[parts.at(-1)] = (typeof val === 'string' ? U(val) : val)
      return clone
    })
  }

  // ---------- Branches ----------
  useEffect(() => {
    api.get('/api/v1/branches', { params: { page: 1, limit: 100 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || data?.list || []
        setBranches(payload)
        if (!payload.length) setNotice('Aún no hay sucursales. Debes crear al menos una sucursal.')
      })
      .catch(() => setBranches([]))
  }, [])

  // ---------- Cargar vehículo (edit) ----------
  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/api/v1/vehicles/${id}`)
      .then(({ data }) => {
        const v = data?.item || data
        setVehicle(v)
        setForm({
          plate: v.plate || '',
          internalCode: v.internalCode || '',
          status: v.status || 'ACTIVE',
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
          batteries: v.batteries || [],
          tyres: v.tyres || [],
          generator: {
            brand: v.generator?.brand || '',
            model: v.generator?.model || '',
            serial: v.generator?.serial || '',
          },
          pump: {
            brand: v.pump?.brand || '',
            model: v.pump?.model || '',
            serial: v.pump?.serial || '',
          },
          body: {
            brand: v.body?.brand || '',
            model: v.body?.model || '',
            serial: v.body?.serial || '',
          },
          meters: {
            odometerKm: v.meters?.odometerKm || '',
            engineHours: v.meters?.engineHours || '',
            ladderHours: v.meters?.ladderHours || '',
            generatorHours: v.meters?.generatorHours || '',
            pumpHours: v.meters?.pumpHours || '',
          },
        })
      })
      .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
      .finally(() => setLoading(false))
  }, [id])

  // ---------- Guardar ----------
  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError('')

    try {
      // Validación mínima en front
      const reqFields = ['plate','internalCode','status','type','brand','model','year','color','branch']
      for (const k of reqFields) {
        if (!String(form[k] ?? '').trim()) throw new Error(`El campo ${k} es obligatorio`)
      }
      const payload = upperPatch({
        ...form,
        year: form.year ? Number(form.year) : undefined,
        transmission: {
          ...form.transmission,
          gears: form.transmission.gears ? Number(form.transmission.gears) : undefined
        },
        meters: {
          odometerKm: form.meters.odometerKm ? Number(form.meters.odometerKm) : undefined,
          engineHours: form.meters.engineHours ? Number(form.meters.engineHours) : undefined,
          ladderHours: form.meters.ladderHours ? Number(form.meters.ladderHours) : undefined,
          generatorHours: form.meters.generatorHours ? Number(form.meters.generatorHours) : undefined,
          pumpHours: form.meters.pumpHours ? Number(form.meters.pumpHours) : undefined,
        }
      })

      if (id) {
        await api.patch(`/api/v1/vehicles/${id}`, payload)
        alert('Vehículo actualizado con éxito')
      } else {
        await api.post('/api/v1/vehicles', payload)
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

  // ---------- Media handlers ----------
  const canUpload = useMemo(()=>Boolean(id), [id])
  const handleUploadBasicPhoto = async ({ file, category='BASIC', title='' }) => {
    if (!id) throw new Error('Guarda el vehículo antes de subir medios')
    await uploadVehiclePhoto(id, { file, category, title })
    // refresh ligero
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }
  const handleUploadTechPhoto = async ({ file, category, title }) => handleUploadBasicPhoto({ file, category, title })
  const handleUploadLegalDoc = async ({ file, category, label }) => {
    if (!id) throw new Error('Guarda el vehículo antes de subir documentos')
    await uploadVehicleDocument(id, { file, category, label })
    const { data } = await api.get(`/api/v1/vehicles/${id}`)
    setVehicle(data?.item || data)
  }

  if (loading) return <div className="max-w-5xl mx-auto bg-white shadow rounded p-4">Cargando…</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
          <p className="text-sm text-slate-500">Completa las tarjetas. Los textos se guardan en MAYÚSCULAS.</p>
        </div>
        <nav className="flex gap-2">
          {['BASICO','TECNICO','DOCUMENTOS','MEDIOS'].map(t=>(
            <button type="button" key={t}
              onClick={()=>setTab(t)}
              className={`px-3 py-1.5 rounded ${tab===t?'bg-blue-600 text-white':'bg-white border'}`}>
              {t==='BASICO'?'Básico':t==='TECNICO'?'Técnico':t==='DOCUMENTOS'?'Documentos':'Medios'}
            </button>
          ))}
        </nav>
      </header>

      {error && <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
      {!branches.length && !id && <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>}

      {/* --------- TAB BASICO --------- */}
      {tab==='BASICO' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Información básica</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Placa / Patente','plate','ABC-123'],
                ['Código interno','internalCode','B:10'],
                ['Estado','status','ACTIVE'],
                ['Tipo de vehículo','type','CARRO BOMBA, CAMIÓN...'],
                ['Marca','brand','SCANIA'],
                ['Modelo','model','P340'],
                ['Año','year','2020', 'number'],
                ['Color','color','ROJO'],
              ].map(([label, key, ph, type])=>(
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    type={type||'text'}
                    value={form[key]}
                    onChange={(e)=>update(key, e.target.value)}
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
                  value={form.branch}
                  onChange={(e)=>update('branch', e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 bg-white"
                >
                  <option value="" disabled>Selecciona sucursal</option>
                  {branches.map((b)=>(
                    <option key={b._id} value={b._id}>
                      {b.code ? `${b.code} — ${b.name}` : b.name || b._id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mini uploader para fotos básicas */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Fotos básicas</h3>
            </div>
            <div className="p-4">
              <MediaUploader
                onUpload={handleUploadBasicPhoto}
                accept="image/*"
                category="BASIC"
                titleLabel="Título de la foto"
                mode="photo"
              />
              {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* --------- TAB TECNICO --------- */}
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
            <div className="px-4 pb-4">
              <MediaUploader
                onUpload={(p)=>handleUploadTechPhoto({ ...p, category:'ENGINE' })}
                accept="image/*,video/*"
                category="ENGINE"
                titleLabel="Título (ej. PLACA MOTOR)"
                mode="photo"
              />
              {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
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
                ['Marchas','transmission.gears','6','number'],
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
            <div className="px-4 pb-4">
              <MediaUploader
                onUpload={(p)=>handleUploadTechPhoto({ ...p, category:'TRANSMISSION' })}
                accept="image/*,video/*"
                category="TRANSMISSION"
                titleLabel="Título (ej. PLACA CAJA)"
                mode="photo"
              />
            </div>
          </div>

          {/* Equipos: Generador / Motobomba / Cuerpo de Bomba */}
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
              <div className="px-4 pb-4">
                <MediaUploader
                  onUpload={(p)=>handleUploadTechPhoto({ ...p, category:key.toUpperCase() })}
                  accept="image/*,video/*"
                  category={key.toUpperCase()}
                  titleLabel="Título (ej. PLACA EQUIPO)"
                  mode="photo"
                />
              </div>
            </div>
          ))}

          {/* Medidores */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Medidores</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                ['Odómetro (km)','meters.odometerKm','0','number'],
                ['Horómetro motor (h)','meters.engineHours','0','number'],
                ['Horas escala (h)','meters.ladderHours','0','number'],
                ['Horas generador (h)','meters.generatorHours','0','number'],
                ['Horas cuerpo bomba (h)','meters.pumpHours','0','number'],
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

          <div className="flex justify-end gap-3">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
              {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
            </button>
          </div>
        </div>
      )}

      {/* --------- TAB DOCUMENTOS --------- */}
      {tab==='DOCUMENTOS' && (
        <div className="space-y-4">
          {/* LEGAL */}
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Legal</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['Padrón - N°','legal.padron.number'],
                ['Padrón - Emisor','legal.padron.issuer'],
                ['SOAP - Póliza','legal.soap.policy'],
                ['SOAP - Emisor','legal.soap.issuer'],
                ['Seguro - Póliza','legal.insurance.policy'],
                ['Seguro - Emisor','legal.insurance.issuer'],
                ['TAG - N°','legal.tag.number'],
                ['TAG - Emisor','legal.tag.issuer'],
                ['Tarj. combustible - Emisor','legal.fuelCard.issuer'],
                ['Tarj. combustible - N°','legal.fuelCard.number'],
              ].map(([label,path])=>{
                const val = path.split('.').reduce((acc,k)=>acc?.[k], form) ?? ''
                return (
                  <div key={path}>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                    <input
                      value={val}
                      onChange={(e)=>updateNested(path, e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                )
              })}
              {/* Fechas y numéricos simples los puedes añadir luego */}
            </div>

            {/* Subida de documentos LEGAL */}
            <div className="px-4 pb-4">
              <MediaUploader
                onUpload={(p)=>handleUploadLegalDoc({ ...p, category:'LEGAL' })}
                accept="application/pdf,image/*"
                category="LEGAL"
                labelLabel="Etiqueta (ej. SOAP 2026)"
                mode="doc"
              />
              {!canUpload && <p className="text-xs text-slate-500 mt-2">Guarda el vehículo para habilitar la subida.</p>}
            </div>

            {/* Manuales/Partes (misma tarjeta por simplicidad) */}
            <div className="px-4 pb-4">
              <h4 className="font-medium text-slate-700 mb-2">Manuales / Partes</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <MediaUploader
                  onUpload={(p)=>handleUploadLegalDoc({ ...p, category:'MANUALS' })}
                  accept="application/pdf,image/*"
                  category="MANUALS"
                  labelLabel="Manual (ej. MOTOR DC13)"
                  mode="doc"
                />
                <MediaUploader
                  onUpload={(p)=>handleUploadLegalDoc({ ...p, category:'PARTS' })}
                  accept="application/pdf,image/*"
                  category="PARTS"
                  labelLabel="Partes (ej. CATÁLOGO NEUMÁTICOS)"
                  mode="doc"
                />
              </div>
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

      {/* --------- TAB MEDIOS (galerías por categoría) --------- */}
      {tab==='MEDIOS' && (
        <div className="space-y-4">
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Medios por tarjeta</h3>
            </div>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['Básico','BASIC'],
                ['Motor','ENGINE'],
                ['Transmisión','TRANSMISSION'],
                ['Generador','GENERATOR'],
                ['Motobomba','PUMP'],
                ['Cuerpo de bomba','BODY'],
                ['Documentos (legal)','LEGAL'],
                ['Manuales','MANUALS'],
                ['Partes','PARTS'],
                ['Técnico libre','TECHNICAL'],
                ['Videos','VIDEOS'],
              ].map(([label,cat])=>(
                <div key={cat} className="border rounded-lg p-3">
                  <div className="font-medium mb-2">{label}</div>
                  <MediaUploader
                    onUpload={(p)=> cat==='LEGAL' || cat==='MANUALS' || cat==='PARTS'
                      ? handleUploadLegalDoc({ ...p, category:cat })
                      : handleUploadTechPhoto({ ...p, category:cat })}
                    accept={cat==='VIDEOS' ? 'video/*' : (cat==='LEGAL' || cat==='MANUALS' || cat==='PARTS' ? 'application/pdf,image/*' : 'image/*,video/*')}
                    category={cat}
                    mode={cat==='LEGAL' || cat==='MANUALS' || cat==='PARTS' ? 'doc' : 'photo'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Aquí podrías listar grids de photos/documents del vehículo si ya lo cargamos */}
          {vehicle && (
            <div className="bg-white shadow rounded-xl border">
              <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
                <h3 className="font-medium text-slate-700">Contenido actual</h3>
              </div>
              <div className="p-4 grid gap-4">
                <div>
                  <div className="font-medium mb-1">Fotos</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {(vehicle.photos||[]).map(ph=>(
                      <div key={ph._id} className="text-xs">
                        <img src={ph.url} alt={ph.title||''} className="w-full h-24 object-cover rounded border" />
                        <div className="mt-1">{ph.category} {ph.title?`- ${ph.title}`:''}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Documentos</div>
                  <ul className="list-disc pl-5 text-sm">
                    {(vehicle.documents||[]).map(d=>(
                      <li key={d._id}>
                        <span className="font-medium">{d.category}</span> — {d.label} — <a href={d.url} target="_blank" className="text-blue-600 underline">ver</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={()=>navigate('/vehicles')} className="px-3 py-2 border rounded">Volver</button>
          </div>
        </div>
      )}
    </form>
  )
}
