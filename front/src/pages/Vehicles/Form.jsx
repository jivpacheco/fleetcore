// front/src/pages/Vehicles/Form.jsx
// -----------------------------------------------------------------------------
// Formulario de Vehículos (crear/editar, UI limpia con labels y validaciones)
// - `internalCode` (sigla institucional): obligatorio y en MAYÚSCULAS.
// - `plate`: obligatorio y en MAYÚSCULAS (se normaliza en el servicio también).
// - Select de Sucursal (opcional mientras no existan Branches).
// - Mensajes de error del backend (409 duplicado, 400 validación, etc.).
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/http'
import { useNavigate, useParams } from 'react-router-dom'

export default function VehiclesForm() {
  const navigate = useNavigate()
  const { id } = useParams()

  // --------------------------
  // Estado del formulario
  // --------------------------
  const [form, setForm] = useState({
    plate: '',
    internalCode: '',
    type: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    branch: '', // _id de Branch cuando exista
  })
  const [branches, setBranches] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [touched, setTouched] = useState({}) // control simple de blur para mostrar errores inline

  // Errores de validación del front
  const vErrors = useMemo(() => {
    const e = {}
    if (!form.plate?.trim()) e.plate = 'La placa es obligatoria'
    if (!form.internalCode?.trim()) e.internalCode = 'El código interno es obligatorio'
    if (form.year && Number.isNaN(Number(form.year))) e.year = 'El año debe ser numérico'
    return e
  }, [form])

  function update(field, val) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  // --------------------------
  // Cargar sucursales (si hay)
  // --------------------------
  useEffect(() => {
    api
      .get('/api/v1/branches', { params: { page: 1, limit: 100 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || []
        setBranches(payload)
        if (!payload.length) {
          setNotice('Aún no hay sucursales. Puedes registrar el vehículo sin sucursal y asignarlo luego.')
        }
      })
      .catch(() => setBranches([]))
  }, [])

  // --------------------------
  // Cargar vehículo si estamos editando
  // --------------------------
  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get(`/api/v1/vehicles/${id}`)
      .then(({ data }) => {
        const v = data?.item || data
        setForm({
          plate: v.plate || '',
          internalCode: v.internalCode || '',
          type: v.type || '',
          brand: v.brand || '',
          model: v.model || '',
          year: v.year || '',
          color: v.color || '',
          branch: v.branch?._id || v.branch || '',
        })
      })
      .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el vehículo'))
      .finally(() => setLoading(false))
  }, [id])

  // --------------------------
  // Guardar
  // --------------------------
  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Validación del front antes de llamar a la API
      if (Object.keys(vErrors).length > 0) {
        setTouched({ plate: true, internalCode: true, year: true })
        throw new Error('Revisa los campos marcados')
      }

      const payload = {
        ...form,
        // Normalización mínima (el servicio también normaliza)
        plate: form.plate?.toUpperCase().trim(),
        internalCode: form.internalCode?.toUpperCase().trim(),
        year: form.year ? Number(form.year) : undefined,
        branch: form.branch || undefined, // opcional
      }

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

  if (loading) {
    return <div className="max-w-3xl mx-auto bg-white shadow rounded p-4">Cargando…</div>
  }

  // Helper para clases de inputs con error
  const inputClass = (hasError) =>
    `w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-200 ${
      hasError ? 'border-red-300' : 'border-slate-300'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{id ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
          <p className="text-sm text-slate-500">
            Completa la información básica. Podrás añadir documentos, fotos y métricas luego.
          </p>
        </div>
      </header>

      {error && (
        <div className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}
      {notice && !id && (
        <div className="px-3 py-2 bg-amber-50 text-amber-800 rounded text-sm">{notice}</div>
      )}

      {/* Tarjeta: Información Básica */}
      <div className="bg-white shadow rounded-xl border">
        <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
          <h3 className="font-medium text-slate-700">Información básica</h3>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Placa / Patente <span className="text-red-500">*</span>
            </label>
            <input
              value={form.plate}
              onChange={(e) => update('plate', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, plate: true }))}
              className={inputClass(touched.plate && !!vErrors.plate)}
              placeholder="ABC-123"
              required
            />
            {touched.plate && vErrors.plate && (
              <p className="text-xs text-red-600 mt-1">{vErrors.plate}</p>
            )}
          </div>

          {/* Código interno */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Código interno (sigla institucional) <span className="text-red-500">*</span>
            </label>
            <input
              value={form.internalCode}
              onChange={(e) => update('internalCode', e.target.value.toUpperCase())}
              onBlur={() => setTouched((t) => ({ ...t, internalCode: true }))}
              className={inputClass(touched.internalCode && !!vErrors.internalCode)}
              placeholder="B:10, BX-2, SR-CALI..."
              required
            />
            {touched.internalCode && vErrors.internalCode && (
              <p className="text-xs text-red-600 mt-1">{vErrors.internalCode}</p>
            )}
            {!vErrors.internalCode && (
              <p className="text-xs text-slate-500 mt-1">
                Debe ser único. Se usa para identificar la unidad en toda la suite.
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de vehículo</label>
            <input
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className={inputClass(false)}
              placeholder="Camión, Carro bomba…"
            />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Marca</label>
            <input
              value={form.brand}
              onChange={(e) => update('brand', e.target.value)}
              className={inputClass(false)}
              placeholder="Scania, Volvo…"
            />
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Modelo</label>
            <input
              value={form.model}
              onChange={(e) => update('model', e.target.value)}
              className={inputClass(false)}
              placeholder="P340, FMX…"
            />
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Año</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => update('year', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, year: true }))}
              className={inputClass(touched.year && !!vErrors.year)}
              placeholder="2020"
            />
            {touched.year && vErrors.year && (
              <p className="text-xs text-red-600 mt-1">{vErrors.year}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Color</label>
            <input
              value={form.color}
              onChange={(e) => update('color', e.target.value)}
              className={inputClass(false)}
              placeholder="Rojo"
            />
          </div>

          {/* Sucursal (opcional por ahora) */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal (opcional)</label>
            <select
              value={form.branch}
              onChange={(e) => update('branch', e.target.value)}
              className={inputClass(false) + ' bg-white'}
            >
              <option value="">Sin sucursal</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.code ? `${b.code} — ${b.name}` : b.name || b._id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/vehicles')}
          className="px-3 py-2 border rounded"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
        </button>
      </div>
    </form>
  )
}
