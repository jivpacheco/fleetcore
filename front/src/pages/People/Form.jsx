// front/src/pages/People/Form.jsx
// -----------------------------------------------------------------------------
// RRHH - Ficha de Persona (Tabs)
// - Modo Ver: ?mode=view (bloquea inputs y muestra solo "Volver")
// - Modo Editar: default
// - Guard cambios sin guardar: hooks/UnsavedChangesGuard (useBlocker)
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UnsavedChangesGuard from '../../hooks/UnsavedChangesGuard'
import { api } from '../../services/http'
import { PeopleAPI } from '../../api/people.api'
import { PositionsAPI } from '../../api/positions.api'

function deepEqual(a, b) {
  try { return JSON.stringify(a) === JSON.stringify(b) } catch { return false }
}

const ymd = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
}

export default function PeopleForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [sp, setSp] = useSearchParams()

  const mode = sp.get('mode')
  const readOnly = mode === 'view'
  const [tab, setTab] = useState(sp.get('tab') || 'BASICO')

  const scrollRef = useRef(null)
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [tab])

  const handleChangeTab = (code) => {
    setTab(code)
    const next = new URLSearchParams(sp)
    next.set('tab', code)
    setSp(next, { replace: true })
  }

  const [branches, setBranches] = useState([])
  const [positions, setPositions] = useState([])

  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    branchId: '',
    positionId: '',
    status: 'ACTIVE',
    documentType: 'RUT',
    documentId: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    nationality: '',
    email: '',
    phone: '',
    address: '',
    hireDate: '',
    licenses: [],
  })

  const [initialForm, setInitialForm] = useState(null)
  const isDirty = !readOnly && !deepEqual(form, initialForm || form)

  useEffect(() => {
    // branches
    api.get('/api/v1/branches', { params: { page: 1, limit: 200 } })
      .then(({ data }) => {
        const payload = data?.items || data?.data?.items || data?.data || []
        setBranches(payload)
      })
      .catch(() => setBranches([]))

    // positions
    PositionsAPI.list({ page: 1, limit: 500 })
      .then(({ data }) => {
        const list = data?.items || data?.data?.items || data?.data || []
        setPositions(list.filter(x => x.active !== false))
      })
      .catch(() => setPositions([]))
  }, [])

  useEffect(() => {
    if (!id) { setInitialForm(form); return }

    setLoading(true)
    PeopleAPI.get(id)
      .then(({ data }) => {
        const p = data?.item || data
        const loaded = {
          branchId: p.branchId?._id || p.branchId || '',
          positionId: p.positionId?._id || p.positionId || '',
          status: p.status || 'ACTIVE',
          documentType: p.documentType || 'RUT',
          documentId: p.documentId || '',
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          birthDate: ymd(p.birthDate),
          nationality: p.nationality || '',
          email: p.email || '',
          phone: p.phone || '',
          address: p.address || '',
          hireDate: ymd(p.hireDate),
          licenses: Array.isArray(p.licenses) ? p.licenses.map(l => ({
            number: l.number || '',
            type: l.type || '',
            issuer: l.issuer || '',
            issuedAt: ymd(l.issuedAt),
            validTo: ymd(l.validTo),
          })) : [],
        }
        setForm(loaded)
        setInitialForm(loaded)
      })
      .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar la persona'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const toDateOrNull = (v) => (v ? new Date(`${v}T00:00:00.000Z`) : null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (readOnly) return
    setSaving(true); setError('')

    try {
      if (!form.branchId) throw new Error('Sucursal es obligatoria')
      if (!form.positionId) throw new Error('Cargo es obligatorio')
      if (!String(form.documentId || '').trim()) throw new Error('Documento es obligatorio')
      if (!String(form.firstName || '').trim() || !String(form.lastName || '').trim()) throw new Error('Nombre y apellido son obligatorios')

      const payload = {
        ...form,
        birthDate: toDateOrNull(form.birthDate),
        hireDate: toDateOrNull(form.hireDate),
        licenses: (form.licenses || []).map(l => ({
          ...l,
          issuedAt: toDateOrNull(l.issuedAt),
          validTo: toDateOrNull(l.validTo),
        })),
      }

      if (id) await PeopleAPI.update(id, payload)
      else await PeopleAPI.create(payload)

      alert(id ? 'Persona actualizada con éxito' : 'Persona creada con éxito')
      setInitialForm(form)
      navigate('/people')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Datos inválidos')
    } finally {
      setSaving(false)
    }
  }

  const TabButton = ({ code, label }) => (
    <button
      type="button"
      onClick={() => handleChangeTab(code)}
      className={`px-3 py-1.5 rounded ${tab === code ? 'bg-blue-600 text-white' : 'bg-white border'}`}
    >
      {label}
    </button>
  )

  if (loading) return <div className="max-w-6xl mx-auto p-4 bg-white border rounded mt-3">Cargando…</div>

  return (
    <div className="flex flex-col h-full">
      <UnsavedChangesGuard when={isDirty} getMessage={() => 'Tienes cambios sin guardar. ¿Salir sin guardar?'} />

      <header className="max-w-6xl mx-auto mt-2 px-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {readOnly ? 'Consulta de persona' : id ? 'Editar persona' : 'Registrar persona'}
          </h2>
        </div>

        <nav className="mt-2 flex justify-center gap-2">
          <TabButton code="BASICO" label="Básico" />
          <TabButton code="ORGANIZACION" label="Organización" />
          <TabButton code="CONDUCCION" label="Conducción" />
        </nav>
      </header>

      {error && <div className="max-w-6xl mx-auto mt-2 px-3 py-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <form ref={scrollRef} onSubmit={handleSubmit} className="max-w-6xl mx-auto w-full h-[calc(100vh-140px)] overflow-y-auto px-3 my-3">

        {tab === 'BASICO' && (
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Datos personales</h3>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Documento</label>
                <input
                  className="w-full border p-2 rounded"
                  value={form.documentId}
                  disabled={readOnly}
                  readOnly={readOnly}
                  onChange={(e) => setForm(f => ({ ...f, documentId: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                <select
                  className="w-full border p-2 rounded bg-white"
                  value={form.status}
                  disabled={readOnly}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  <option value="ACTIVE">ACTIVO</option>
                  <option value="INACTIVE">INACTIVO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombres</label>
                <input
                  className="w-full border p-2 rounded"
                  value={form.firstName}
                  disabled={readOnly}
                  readOnly={readOnly}
                  onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Apellidos</label>
                <input
                  className="w-full border p-2 rounded"
                  value={form.lastName}
                  disabled={readOnly}
                  readOnly={readOnly}
                  onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'ORGANIZACION' && (
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Organización</h3>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
                <select
                  className="w-full border p-2 rounded bg-white"
                  value={form.branchId}
                  disabled={readOnly}
                  onChange={(e) => setForm(f => ({ ...f, branchId: e.target.value }))}
                >
                  <option value="" disabled>Selecciona sucursal</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Cargo</label>
                <select
                  className="w-full border p-2 rounded bg-white"
                  value={form.positionId}
                  disabled={readOnly}
                  onChange={(e) => setForm(f => ({ ...f, positionId: e.target.value }))}
                >
                  <option value="" disabled>Selecciona cargo</option>
                  {positions.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {tab === 'CONDUCCION' && (
          <div className="bg-white shadow rounded-xl border">
            <div className="px-4 py-3 border-b bg-slate-50 rounded-t-xl">
              <h3 className="font-medium text-slate-700">Conducción</h3>
            </div>

            <div className="p-4 text-sm text-slate-600">
              Sprint 1: base lista. Sprint 2: licencias múltiples + validaciones + vehículos autorizados.
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pb-4 mt-4">
          {readOnly ? (
            <button type="button" onClick={() => navigate('/people')} className="px-3 py-2 border rounded">Volver</button>
          ) : (
            <>
              <button type="button" onClick={() => navigate('/people')} className="px-3 py-2 border rounded">
                {isDirty ? 'Cancelar' : 'Volver'}
              </button>
              <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">
                {saving ? 'Guardando…' : (id ? 'Guardar cambios' : 'Guardar')}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
