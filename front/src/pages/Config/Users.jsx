// front/src/pages/Config/Users.jsx
// -----------------------------------------------------------------------------
// Administración de Usuarios
// - Lista paginada
// - Crear/editar
// - Reset de contraseña (admin)
//
// Importante:
// - En backend, /api/v1/users está protegido con requireRole('admin','global')
// - Si entras con un usuario sin esos roles, verás 403
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { UsersAPI } from '../../api/users.api'
import { api } from '../../services/http'

export default function UsersAdmin() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState([])

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    email: '',
    name: '',
    rolesText: 'user',
    branchIds: [],
    isActive: true,
    tempPassword: '',
    mustChangePassword: true,
  })

  const parseRoles = () => {
    const raw = String(form.rolesText || '')
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
    return Array.from(new Set(raw))
  }

  const loadBranches = async () => {
    try {
      const { data } = await api.get('/api/v1/branches', { params: { page: 1, limit: 500 } })
      const list = data?.items || data?.data?.items || data?.data || data?.list || []
      const sorted = [...list].sort((a, b) => {
        const ac = (a?.code || '').toString()
        const bc = (b?.code || '').toString()
        if (ac && bc && ac !== bc) return ac.localeCompare(bc, undefined, { numeric: true })
        return (a?.name || '').toString().localeCompare((b?.name || '').toString(), undefined, { numeric: true })
      })
      setBranches(sorted)
    } catch {
      setBranches([])
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await UsersAPI.list({ page: 1, limit: 200, q })
      setItems(data.items || [])
    } catch (err) {
      console.error(err)
      setItems([])
      const msg = err?.response?.data?.message
      if (msg) alert(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranches()
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return items
    return items.filter((it) => `${it.email || ''} ${it.name || ''}`.toLowerCase().includes(qq))
  }, [items, q])

  const reset = () => {
    setEditing(null)
    setForm({ email: '', name: '', rolesText: 'user', branchIds: [], isActive: true, tempPassword: '', mustChangePassword: true })
  }

  const startEdit = (it) => {
    setEditing(it)
    setForm({
      email: it.email || '',
      name: it.name || '',
      rolesText: Array.isArray(it.roles) ? it.roles.join(', ') : 'user',
      branchIds: Array.isArray(it.branchIds) ? it.branchIds.map((b) => (b?._id || b)) : [],
      isActive: it.isActive !== false,
      tempPassword: '',
      mustChangePassword: Boolean(it?.local?.mustChangePassword),
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) return alert('Email es obligatorio')

    const payload = {
      email: form.email.trim().toLowerCase(),
      name: form.name,
      roles: parseRoles(),
      branchIds: form.branchIds,
      isActive: form.isActive,
    }

    try {
      if (editing?._id) {
        await UsersAPI.update(editing._id, payload)
        if (form.tempPassword) {
          await UsersAPI.setPassword(editing._id, {
            password: form.tempPassword,
            mustChangePassword: Boolean(form.mustChangePassword),
          })
        }
      } else {
        await UsersAPI.create({
          ...payload,
          password: form.tempPassword || undefined,
          mustChangePassword: Boolean(form.mustChangePassword),
        })
      }
      await load()
      reset()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'No fue posible guardar')
    }
  }

  const remove = async (it) => {
    const ok = window.confirm('¿Eliminar usuario? (soft delete)')
    if (!ok) return
    try {
      await UsersAPI.remove(it._id)
      await load()
    } catch (err) {
      console.error(err)
      alert('No fue posible eliminar')
    }
  }

  const toggleBranch = (id) => {
    setForm((s) => {
      const set = new Set(s.branchIds)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...s, branchIds: Array.from(set) }
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Usuarios</h1>
        <p className="text-sm text-gray-600">Administración de usuarios (requiere rol admin o global).</p>
      </div>

      <form onSubmit={submit} className="border rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 bg-white">
        <label className="text-sm md:col-span-2">
          <div className="text-gray-600 mb-1">Email *</div>
          <input className="border rounded px-3 py-2 w-full" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
        </label>
        <label className="text-sm md:col-span-2">
          <div className="text-gray-600 mb-1">Nombre</div>
          <input className="border rounded px-3 py-2 w-full" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="text-gray-600 mb-1">Roles (separados por coma o línea)</div>
          <input className="border rounded px-3 py-2 w-full" value={form.rolesText} onChange={(e) => setForm((s) => ({ ...s, rolesText: e.target.value }))} placeholder="user, global, admin" />
        </label>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">Activo</div>
          <select className="border rounded px-3 py-2 w-full" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.value === 'true' }))}>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </label>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">Clave temporal (opcional)</div>
          <input className="border rounded px-3 py-2 w-full" value={form.tempPassword} onChange={(e) => setForm((s) => ({ ...s, tempPassword: e.target.value }))} placeholder="Dejar vacío para no cambiar" />
        </label>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" checked={form.mustChangePassword} onChange={(e) => setForm((s) => ({ ...s, mustChangePassword: e.target.checked }))} />
          Requerir cambio de clave al ingresar
        </label>

        <div className="md:col-span-4">
          <div className="text-sm text-gray-600 mb-1">Sucursales (scope)</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {branches.map((b) => (
              <label key={b._id} className="flex items-center gap-2 text-sm border rounded px-3 py-2">
                <input type="checkbox" checked={form.branchIds.includes(b._id)} onChange={() => toggleBranch(b._id)} />
                <span className="truncate">{b.code} — {b.name}</span>
              </label>
            ))}
            {!branches.length && (
              <div className="text-sm text-gray-500">(No hay sucursales o no fue posible cargarlas)</div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 flex gap-2">
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={loading}>
            {editing ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" className="px-4 py-2 rounded border" onClick={reset}>Limpiar</button>
          <button type="button" className="px-4 py-2 rounded border" onClick={load} disabled={loading}>Recargar</button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        <input className="border rounded px-3 py-2 w-full md:w-96" placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="border rounded overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Roles</th>
              <th className="text-left p-2">Activo</th>
              <th className="text-left p-2 w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="p-2">{it.email}</td>
                <td className="p-2">{it.name || '—'}</td>
                <td className="p-2">{Array.isArray(it.roles) ? it.roles.join(', ') : '—'}</td>
                <td className="p-2">{it.isActive === false ? 'No' : 'Sí'}</td>
                <td className="p-2 flex flex-wrap gap-2">
                  <button type="button" className="px-2 py-1 border rounded" onClick={() => startEdit(it)}>Editar</button>
                  <button type="button" className="px-2 py-1 border rounded" onClick={() => remove(it)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td className="p-3 text-gray-500" colSpan="5">Sin registros</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
