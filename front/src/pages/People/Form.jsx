// front/src/pages/People/Form.jsx
// -----------------------------------------------------------------------------
// Formulario RRHH (Persona)
// - Crea / edita
// - Persona pertenece a UNA sucursal (branchId obligatorio).
// - Cargo desde /positions (solo lectura para usuarios sin permiso de gestión).
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PeopleAPI } from '../../api/people.api'
import { PositionsAPI } from '../../api/positions.api'
import { BranchesAPI } from '../../api/branches.api'

const U = (v) => (typeof v === 'string' ? v.toUpperCase() : v)

export default function PeopleForm(){
  const nav = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [branches, setBranches] = useState([])
  const [positions, setPositions] = useState([])

  const [form, setForm] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    branchId: '',
    positionId: '',
    active: true,
    birthDate: '',
    birthPlace: '',
    nationality: '',
    hireDate: '',
  })

  const title = id ? 'Editar Persona' : 'Registrar Persona'

  useEffect(() => {
    BranchesAPI.list({ page: 1, limit: 500, q: '' })
      .then(r => {
        const payload = r?.data?.data || r?.data?.items || r?.data?.data?.items || r?.data?.list || []
        setBranches(payload)
      })
      .catch(() => setBranches([]))

    PositionsAPI.list({ page: 1, limit: 500, active: true })
      .then(r => setPositions(r?.data?.data || []))
      .catch(() => setPositions([]))
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    PeopleAPI.get(id)
      .then(r => {
        const p = r?.data?.item || r?.data
        setForm({
          dni: p?.dni || '',
          firstName: p?.firstName || '',
          lastName: p?.lastName || '',
          email: p?.email || '',
          phone: p?.phone || '',
          branchId: p?.branchId?._id || p?.branchId || '',
          positionId: p?.positionId?._id || p?.positionId || '',
          active: p?.active !== false,
          birthDate: p?.birthDate ? String(p.birthDate).slice(0,10) : '',
          birthPlace: p?.birthPlace || '',
          nationality: p?.nationality || '',
          hireDate: p?.hireDate ? String(p.hireDate).slice(0,10) : '',
        })
      })
      .catch(e => setError(e?.response?.data?.message || 'No se pudo cargar'))
      .finally(() => setLoading(false))
  }, [id])

  function update(k, v){
    setForm(f => ({ ...f, [k]: (k === 'email' ? v : U(v)) }))
  }

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    setSaving(true)
    try{
      const payload = {
        ...form,
        // Fechas: enviar null si vacío
        birthDate: form.birthDate ? new Date(form.birthDate) : null,
        hireDate: form.hireDate ? new Date(form.hireDate) : null,
      }
      if (!payload.branchId) throw new Error('Sucursal es obligatoria')
      if (!payload.dni || !payload.firstName || !payload.lastName) throw new Error('DNI, nombres y apellidos son obligatorios')

      if (id) await PeopleAPI.update(id, payload)
      else await PeopleAPI.create(payload)

      nav('/people')
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Error')
    }finally{
      setSaving(false)
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto bg-white border rounded p-4">Cargando…</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-slate-500">RRHH • Persona asociada a una sucursal</p>
        </div>
        <button className="px-3 py-2 border rounded" type="button" onClick={() => nav('/people')}>Volver</button>
      </div>

      {error && <div className="mb-3 px-3 py-2 bg-red-50 text-red-700 rounded">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">DNI / Cédula</label>
            <input value={form.dni} onChange={(e) => update('dni', e.target.value)} className="w-full border p-2 rounded" required />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
              <select value={String(form.active)} onChange={(e) => setForm(f => ({ ...f, active: e.target.value === 'true' }))} className="w-full border p-2 rounded bg-white">
                <option value="true">ACTIVO</option>
                <option value="false">INACTIVO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nombres</label>
            <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="w-full border p-2 rounded" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Apellidos</label>
            <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="w-full border p-2 rounded" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
            <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border p-2 rounded" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Sucursal</label>
            <select value={form.branchId} onChange={(e) => setForm(f => ({ ...f, branchId: e.target.value }))} className="w-full border p-2 rounded bg-white" required>
              <option value="" disabled>Selecciona sucursal</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.code ? `${b.code} — ${b.name}` : (b.name || b._id)}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Cargo</label>
            <select value={form.positionId || ''} onChange={(e) => setForm(f => ({ ...f, positionId: e.target.value }))} className="w-full border p-2 rounded bg-white">
              <option value="">— Sin cargo —</option>
              {positions.map(p => (
                <option key={p._id} value={p._id}>{p.code ? `${p.code} — ${p.name}` : p.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">La gestión de cargos está restringida (admin/global).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Fecha nacimiento</label>
            <input type="date" value={form.birthDate} onChange={(e) => setForm(f => ({ ...f, birthDate: e.target.value }))} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nacionalidad</label>
            <input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} className="w-full border p-2 rounded" placeholder="CHILENA, COLOMBIANA..." />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Lugar de nacimiento</label>
            <input value={form.birthPlace} onChange={(e) => update('birthPlace', e.target.value)} className="w-full border p-2 rounded" placeholder="CIUDAD / REGIÓN / PAÍS" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Fecha ingreso</label>
            <input type="date" value={form.hireDate} onChange={(e) => setForm(f => ({ ...f, hireDate: e.target.value }))} className="w-full border p-2 rounded" />
          </div>

        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button type="button" className="px-3 py-2 border rounded" onClick={() => nav('/people')}>Cancelar</button>
          <button type="submit" disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
