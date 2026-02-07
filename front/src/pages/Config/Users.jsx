// front/src/pages/Config/Users.jsx
// -----------------------------------------------------------------------------
// Administración de Usuarios (FleetCore)
// Revisión 2026-01-14 (alineado a requerimientos):
// - Roles: consume RolesAPI (tabla roles) y permite multi-selección
// - Sucursales: multi-selección + marcar/desmarcar todas
// - Elimina botón Recargar
// - Lista: columnas Nombre / Email y orden por Nombre
// - Mensaje: "Usuario actualizado con éxito" al editar
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react'
import { UsersAPI } from '../../api/users.api'
import { RolesAPI } from '../../api/roles.api'
import { api } from '../../services/http'
// import Select from 'react-select'
import Select, { components } from 'react-select'


export default function UsersAdmin() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const [branches, setBranches] = useState([])
  const [roles, setRoles] = useState([])

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    email: '',
    name: '',
    roles: ['user'],
    branchIds: [],
    isActive: true,
    tempPassword: '',
    mustChangePassword: true,
  })

  // multicheck tipo dropdown + checklist
  // const CheckboxOption = (props) => (
  //   <components.Option {...props}>
  //     <div className="flex items-center gap-2">
  //       <input
  //         type="checkbox"
  //         checked={props.isSelected}
  //         onChange={() => null}
  //         className="h-4 w-4"
  //       />
  //       <span>{props.label}</span>
  //     </div>
  //   </components.Option>
  // )

  const CheckboxOption = (props) => (
    <components.Option {...props}>
      <div className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={props.isSelected}
          readOnly
          className="h-4 w-4 rounded border-gray-300 text-[var(--fc-primary)] focus:ring-[var(--fc-primary)]"
        />
        <span className={props.isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}>
          {props.label}
        </span>
      </div>
    </components.Option>
  )


  const SummaryValueContainer = (props) => {
    const values = props.getValue()
    const count = values?.length || 0
    const placeholder = props.selectProps.placeholder || 'Seleccionar...'

    return (
      <components.ValueContainer {...props}>
        {count > 0 ? (
          <span className="text-sm text-gray-800 font-medium">
            {count} seleccionado{count === 1 ? '' : 's'}
          </span>
        ) : (
          <span className="text-sm text-gray-400">
            {placeholder}
          </span>
        )}
        {props.children[1]}
      </components.ValueContainer>
    )
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

  const loadRoles = async () => {
    try {
      const { data } = await RolesAPI.list({ page: 1, limit: 500 })
      const list = data?.items || data?.data?.items || data?.data || []
      const sorted = [...list].sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { numeric: true }))
      setRoles(sorted)
    } catch {
      setRoles([])
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
    loadRoles()
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //options + selected values (con useMemo)

  const roleOptions = useMemo(() => {
    return roles.map((r) => ({
      value: r.code,
      label: `${r.name} (${r.code})`,
    }))
  }, [roles])

  const selectedRoleOptions = useMemo(() => {
    const set = new Set(form.roles || [])
    return roleOptions.filter((o) => set.has(o.value))
  }, [roleOptions, form.roles])

  const branchOptions = useMemo(() => {
    return branches.map((b) => ({
      value: b._id,
      label: `${b.code} — ${b.name}`,
    }))
  }, [branches])

  const selectedBranchOptions = useMemo(() => {
    const set = new Set(form.branchIds || [])
    return branchOptions.filter((o) => set.has(o.value))
  }, [branchOptions, form.branchIds])


  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    const baseList = !qq
      ? items
      : items.filter((it) => `${it.name || ''} ${it.email || ''}`.toLowerCase().includes(qq))

    return [...baseList].sort((a, b) => {
      const an = String(a?.name || '').toLowerCase()
      const bn = String(b?.name || '').toLowerCase()
      if (an && bn && an !== bn) return an.localeCompare(bn, undefined, { numeric: true })
      return String(a?.email || '').localeCompare(String(b?.email || ''), undefined, { numeric: true })
    })
  }, [items, q])

  const reset = () => {
    setEditing(null)
    setForm({ email: '', name: '', roles: ['user'], branchIds: [], isActive: true, tempPassword: '', mustChangePassword: true })
  }

  const startEdit = (it) => {
    setEditing(it)
    setForm({
      email: it.email || '',
      name: it.name || '',
      roles: Array.isArray(it.roles) && it.roles.length ? it.roles : ['user'],
      branchIds: Array.isArray(it.branchIds) ? it.branchIds.map((b) => (b?._id || b)) : [],
      isActive: it.isActive !== false,
      tempPassword: '',
      mustChangePassword: Boolean(it?.local?.mustChangePassword),
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) return alert('Email es obligatorio')
    if (!Array.isArray(form.roles) || !form.roles.length) return alert('Debe seleccionar al menos un rol')

    const payload = {
      email: form.email.trim().toLowerCase(),
      name: form.name,
      roles: form.roles,
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
        alert('Usuario actualizado con éxito')
      } else {
        await UsersAPI.create({
          ...payload,
          password: form.tempPassword || undefined,
          mustChangePassword: Boolean(form.mustChangePassword),
        })
        alert('Usuario creado con éxito')
      }
      await load()
      reset()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'No fue posible guardar')
    }
  }

  // const remove = async (it) => {
  //   const ok = window.confirm('¿Eliminar usuario? ') 
  //   // (soft delete)
  //   if (!ok) return
  //   try {
  //     await UsersAPI.remove(it._id)
  //     await load()
  //   } catch (err) {
  //     console.error(err)
  //     alert('No fue posible eliminar')
  //   }
  // }

  const remove = async (it) => {
    const ok = window.confirm('¿Eliminar usuario?')
    if (!ok) return
    try {
      const res = await UsersAPI.remove(it._id)
      const msg =
        res?.data?.message ||
        (res?.data?.mode === 'inactivated'
          ? 'Se inactivó para mantener trazabilidad.'
          : 'Usuario eliminado con éxito.')
      alert(msg)
      await load()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'No fue posible eliminar')
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

  const toggleAllBranches = () => {
    setForm((s) => {
      const all = branches.map((b) => b._id)
      const allSelected = all.length && all.every((id) => s.branchIds.includes(id))
      return { ...s, branchIds: allSelected ? [] : all }
    })
  }

  const toggleRole = (code) => {
    setForm((s) => {
      const set = new Set(s.roles)
      if (set.has(code)) set.delete(code)
      else set.add(code)
      return { ...s, roles: Array.from(set) }
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

        {/* Roles con checkboxes */}
        {/* <div className="md:col-span-3">
          <div className="text-sm text-gray-600 mb-1">Roles *</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {roles.map((r) => (
              <label key={r._id} className="flex items-center gap-2 text-sm border rounded px-3 py-2">
                <input
                  type="checkbox"
                  checked={form.roles.includes(r.code)}
                  onChange={() => toggleRole(r.code)}
                />
                <span className="truncate">{r.name} <span className="text-gray-400">({r.code})</span></span>
              </label>
            ))}
            {!roles.length && (
              <div className="text-sm text-gray-500">(No hay roles o no fue posible cargarlos)</div>
            )}
          </div>
        </div> */}


        {/* Roles multi-selección */}
        {/* <div className="md:col-span-3">
          <div className="text-sm text-gray-600 mb-1">Roles *</div>

          <Select
            isMulti
            isLoading={loading && !roles.length}
            options={roleOptions}
            value={selectedRoleOptions}
            onChange={(vals) => {
              const next = Array.isArray(vals) ? vals.map((v) => v.value) : []
              setForm((s) => ({ ...s, roles: next.length ? next : ['user'] }))
            }}
            placeholder="Seleccione Rol(es)..."
            classNamePrefix="fc-select"
            noOptionsMessage={() => 'No hay roles'}
          />

          {!roles.length && (
            <div className="text-sm text-gray-500 mt-2">(No hay roles o no fue posible cargarlos)</div>
          )}
        </div> */}


        {/* Roles multi-selección - tipo: dropdown*/}
        {/* <Select
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          options={roleOptions}
          value={selectedRoleOptions}
          onChange={(vals) => {
            const next = Array.isArray(vals) ? vals.map((v) => v.value) : []
            setForm((s) => ({ ...s, roles: next.length ? next : ['user'] }))
          }}
          placeholder="Seleccione roles..."
          classNamePrefix="fc-select"
          noOptionsMessage={() => 'No hay roles'}
          components={{
            Option: CheckboxOption,
            ValueContainer: SummaryValueContainer,
          }}
        /> */}

        {/* <label className="text-sm md:col-span-3">
        <div className="text-gray-600 mb-1">Roles *</div>
        <Select
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          options={roleOptions}
          value={selectedRoleOptions}
          onChange={(vals) => {
            const next = Array.isArray(vals) ? vals.map((v) => v.value) : []
            setForm((s) => ({ ...s, roles: next.length ? next : ['user'] }))
          }}
          placeholder="Seleccione roles..."
          className="text-sm"
          classNamePrefix="fc-select"
          noOptionsMessage={() => 'No hay roles'}
          components={{
            Option: CheckboxOption,
            ValueContainer: SummaryValueContainer,
          }}
          styles={{
            control: (base, state) => ({
              ...base,
              borderRadius: '0.375rem',           // rounded-md
              borderColor: state.isFocused ? 'var(--fc-primary)' : '#d1d5db',
              boxShadow: state.isFocused ? `0 0 0 1px var(--fc-primary)` : 'none',
              minHeight: '38px',
            }),
            multiValue: (base) => ({
              ...base,
              display: 'none', // ocultamos chips (porque usamos resumen)
            }),
            menu: (base) => ({
              ...base,
              zIndex: 50,
            }),
          }}
        /> */}

        <label className="text-sm md:col-span-3">
          <div className="text-gray-600 mb-1">Roles *</div>

          <Select
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            options={roleOptions}
            value={selectedRoleOptions}
            onChange={(vals) => {
              const next = Array.isArray(vals) ? vals.map((v) => v.value) : []
              setForm((s) => ({ ...s, roles: next.length ? next : ['user'] }))
            }}
            placeholder="Seleccione roles..."
            noOptionsMessage={() => 'No hay roles'}
            components={{
              Option: CheckboxOption,
              ValueContainer: SummaryValueContainer,
            }}
            // styles={{
            //   control: (base, state) => ({
            //     ...base,
            //     borderRadius: '0.375rem',      // igual que Tailwind rounded
            //     borderColor: '#d1d5db',        // border-gray-300
            //     minHeight: '42px',
            //     boxShadow: state.isFocused
            //       ? '0 0 0 1px var(--fc-primary)'
            //       : 'none',
            //     '&:hover': {
            //       borderColor: 'var(--fc-primary)',
            //     },
            //   }),
            //   menu: (base) => ({
            //     ...base,
            //     zIndex: 50,
            //   }),
            //   multiValue: (base) => ({
            //     ...base,
            //     display: 'none', // ocultamos chips (usamos resumen)
            //   }),
            // }}
            styles={{
              control: (base, state) => ({
                ...base,
                borderRadius: '0.375rem', // rounded
                borderColor: '#757575',   // gray-300
                height: 38,               // ✅ altura fija
                minHeight: 38,            // ✅ evita crecimiento
                alignItems: 'center',     // ✅ centra vertical
                boxShadow: state.isFocused ? '0 0 0 1px var(--fc-primary)' : 'none',
                '&:hover': { borderColor: 'var(--fc-primary)' },
              }),
              valueContainer: (base) => ({
                ...base,
                height: 38,               // ✅ misma altura
                padding: '0 12px',        // ✅ similar a px-3
                display: 'flex',
                alignItems: 'center',     // ✅ centra placeholder/resumen
              }),
              input: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: 38,
              }),
              menu: (base) => ({
                ...base,
                zIndex: 50,
              }),
              multiValue: (base) => ({
                ...base,
                display: 'none', // ocultamos chips (usamos resumen)
              }),
            }}

          />
        </label>





        <label className="text-sm">
          <div className="text-gray-600 mb-1">Activo</div>
          <select className="border rounded px-3 py-2 w-full" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.value === 'true' }))}>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </label>

        <label className="text-sm md:col-span-2">
          <div className="text-gray-600 mb-1">Clave temporal (opcional)</div>
          <input className="border rounded px-3 py-2 w-full" value={form.tempPassword} onChange={(e) => setForm((s) => ({ ...s, tempPassword: e.target.value }))} placeholder="Dejar vacío para no cambiar" />
        </label>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" checked={form.mustChangePassword} onChange={(e) => setForm((s) => ({ ...s, mustChangePassword: e.target.checked }))} />
          Requerir cambio de clave al ingresar
        </label>

        {/* Sucursales con checkboxes */}
        {/* <div className="md:col-span-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-sm text-gray-600">Sucursales (scope)</div>
            <button type="button" className="px-3 py-1.5 border rounded text-sm" onClick={toggleAllBranches}>
              Marcar / Desmarcar todas
            </button>
          </div>

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
        </div> */}


        {/* Sucursales multi-selección */}
        <div className="md:col-span-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-sm text-gray-600">Sucursales (scope)</div>
            <button
              type="button"
              className="px-3 py-1.5 border rounded text-sm"
              onClick={() => {
                const all = branches.map((b) => b._id)
                const allSelected = all.length && all.every((id) => form.branchIds.includes(id))
                setForm((s) => ({ ...s, branchIds: allSelected ? [] : all }))
              }}
            >
              Marcar / Desmarcar todas
            </button>
          </div>

          {/* <Select
            isMulti
            options={branchOptions}
            value={selectedBranchOptions}
            onChange={(vals) => {
              const next = Array.isArray(vals) ? vals.map((v) => v.value) : []
              setForm((s) => ({ ...s, branchIds: next }))
            }}
            placeholder="Seleccione sucursales..."
            classNamePrefix="fc-select"
            noOptionsMessage={() => 'No hay sucursales'}
          /> */}

          {/* <Select
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            options={branchOptions}
            value={selectedBranchOptions}
            onChange={(vals) => {
              const next = Array.isArray(vals) ? vals.map((v) => v.value) : []
              setForm((s) => ({ ...s, branchIds: next }))
            }}
            placeholder="Seleccione sucursales..."
            classNamePrefix="fc-select"
            noOptionsMessage={() => 'No hay sucursales'}
            components={{
              Option: CheckboxOption,
              ValueContainer: SummaryValueContainer,
            }}

          /> */}

          <Select
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            options={branchOptions}
            value={selectedBranchOptions}
            onChange={(vals) => {
              const next = Array.isArray(vals) ? vals.map((v) => v.value) : []
              setForm((s) => ({ ...s, branchIds: next }))
            }}
            placeholder="Seleccione sucursales..."
            classNamePrefix="fc-select"
            noOptionsMessage={() => 'No hay sucursales'}
            components={{
              Option: CheckboxOption,
              ValueContainer: SummaryValueContainer,
            }}
            styles={{
              control: (base, state) => ({
                ...base,
                borderRadius: '0.375rem',
                borderColor: '#757575',
                height: 38,
                minHeight: 38,
                alignItems: 'center',
                boxShadow: state.isFocused ? '0 0 0 1px var(--fc-primary)' : 'none',
                '&:hover': { borderColor: 'var(--fc-primary)' },
              }),
              valueContainer: (base) => ({
                ...base,
                height: 38,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
              }),
              input: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: 38,
              }),
              menu: (base) => ({
                ...base,
                zIndex: 50,
              }),
              multiValue: (base) => ({
                ...base,
                display: 'none',
              }),
            }}
          />



          {!branches.length && (
            <div className="text-sm text-gray-500 mt-2">(No hay sucursales o no fue posible cargarlas)</div>
          )}
        </div>

        {/* fin  */}

        <div className="md:col-span-4 flex gap-2">
          <button type="submit" className="px-4 py-2 rounded bg-[var(--fc-primary)] text-white disabled:opacity-50" disabled={loading}>
            {editing ? 'Actualizar' : 'Crear'}
          </button>
          <button type="button" className="px-4 py-2 rounded border" onClick={reset}>Limpiar</button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        <input className="border rounded px-3 py-2 w-full md:w-96" placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="border rounded overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Roles</th>
              <th className="text-left p-2">Activo</th>
              <th className="text-left p-2 w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="p-2">{it.name || '—'}</td>
                <td className="p-2">{it.email}</td>
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
