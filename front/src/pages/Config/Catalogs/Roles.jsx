// import { useEffect, useMemo, useState } from 'react'
// import { RolesAPI } from '../../../api/roles.api'

// // Catálogo base de permisos (UI). Ajustable.
// const PERMISSION_MATRIX = [
//   { key: 'vehicles', label: 'Vehículos', actions: ['read', 'create', 'update', 'delete', 'transfer'] },
//   { key: 'people', label: 'RRHH', actions: ['read', 'create', 'update', 'delete'] },
//   { key: 'branches', label: 'Sucursales', actions: ['read', 'create', 'update', 'delete'] },
//   { key: 'positions', label: 'Cargos', actions: ['read', 'manage'] },
//   { key: 'roles', label: 'Roles', actions: ['read', 'manage'] },
//   { key: 'users', label: 'Usuarios', actions: ['read', 'manage'] },
//   { key: 'drivingTests', label: 'Pruebas conducción', actions: ['read', 'create', 'update', 'delete'] },
//   { key: 'purchaseOrders', label: 'Ordenes compra', actions: ['read', 'create', 'update', 'delete', 'approve'] },
//   { key: 'workOrders', label: 'Ordenes trabajo', actions: ['read', 'create', 'update', 'delete', 'approve'] },
// ]

// const permKey = (m, a) => `${m}:${a}`

// const SCOPE_OPTIONS = ['BRANCH', 'GLOBAL']

// export default function Roles() {
//     const [q, setQ] = useState('')
//     const [items, setItems] = useState([])
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState('')

//     const [form, setForm] = useState({
//         code: '', name: '', scope: 'BRANCH', active: true, permissionsText: '', isSystem: false,
//     })
//     const [editingId, setEditingId] = useState(null)

//     const load = async () => {
//         setLoading(true)
//         try {
//             const { data } = await RolesAPI.list({ q, limit: 200 })
//             if (data.items) setItems(data.items)
//             else if (data.result?.items) setItems(data.result.items)
//             else if (Array.isArray(data)) setItems(data)
//             else setItems([])
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => { load() }, []) // eslint-disable-line

//     const reset = () => {
//         setForm({ code: '', name: '', scope: 'BRANCH', active: true, permissionsText: '', isSystem: false })
//         setEditingId(null)
//     }

//     const parsePermissions = () => {
//         const raw = String(form.permissionsText || '')
//             .split(/\r?\n|,/)
//             .map(s => s.trim())
//             .filter(Boolean)
//         return Array.from(new Set(raw))
//     }

//     const permsSet = useMemo(() => new Set(parsePermissions()), [form.permissionsText])

//     const togglePerm = (p) => {
//         setForm((s) => {
//             const set = new Set(String(s.permissionsText || '')
//                 .split(/\r?\n|,/)
//                 .map(x => x.trim())
//                 .filter(Boolean))
//             if (set.has(p)) set.delete(p)
//             else set.add(p)
//             return { ...s, permissionsText: Array.from(set).sort().join('\n') }
//         })
//     }

//     const onSubmit = async (e) => {
//         e.preventDefault()
//         const payload = {
//             code: form.code,
//             name: form.name,
//             scope: form.scope,
//             active: form.active,
//             permissions: parsePermissions(),
//             isSystem: form.isSystem,
//         }
//         if (!payload.code?.trim()) return alert('Código es obligatorio')
//         if (!payload.name?.trim()) return alert('Nombre es obligatorio')

//         try {
//             if (editingId) await RolesAPI.update(editingId, payload)
//             else await RolesAPI.create(payload)
//             await load()
//             reset()
//         } catch (err) {
//             console.error(err)
//             alert('No fue posible guardar')
//         }
//     }

//     const onEdit = (it) => {
//         setEditingId(it._id)
//         setForm({
//             code: it.code || '',
//             name: it.name || '',
//             scope: it.scope || 'BRANCH',
//             active: it.active !== false,
//             isSystem: !!it.isSystem,
//             permissionsText: Array.isArray(it.permissions) ? it.permissions.join('\n') : '',
//         })
//     }

//     const onDelete = async (it) => {
//         if (it.isSystem) return alert('Rol de sistema: no se elimina')
//         const ok = window.confirm('¿Eliminar rol?')
//         if (!ok) return
//         try {
//             await RolesAPI.remove(it._id)
//             await load()
//         } catch (err) {
//             console.error(err)
//             alert('No fue posible eliminar')
//         }
//     }

//     const filtered = useMemo(() => {
//         const qq = q.trim().toLowerCase()
//         if (!qq) return items
//         return items.filter(it => `${it.code || ''} ${it.name || ''}`.toLowerCase().includes(qq))
//     }, [items, q])

//     return (
//         <div className="p-6 space-y-6">
//             <div>
//                 <h1 className="text-xl font-bold">Catálogo: Roles</h1>
//                 <p className="text-sm text-gray-600">Roles con scope y permisos (strings).</p>
//             </div>

//             <form onSubmit={onSubmit} className="border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
//                 <input className="border rounded px-3 py-2" placeholder="Código *" value={form.code}
//                     onChange={(e) => setForm(s => ({ ...s, code: e.target.value }))} />
//                 <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Nombre *" value={form.name}
//                     onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
//                 <select className="border rounded px-3 py-2" value={form.scope}
//                     onChange={(e) => setForm(s => ({ ...s, scope: e.target.value }))}>
//                     {SCOPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
//                 </select>

//                 <label className="flex items-center gap-2 text-sm">
//                     <input type="checkbox" checked={form.active} onChange={(e) => setForm(s => ({ ...s, active: e.target.checked }))} />
//                     Activo
//                 </label>

//                 <label className="flex items-center gap-2 text-sm">
//                     <input type="checkbox" checked={form.isSystem} onChange={(e) => setForm(s => ({ ...s, isSystem: e.target.checked }))} />
//                     isSystem (bloquear edición/borrado)
//                 </label>

//                 <div className="md:col-span-4">
//                     <div className="text-sm text-gray-600 mb-2">Permisos (grilla)</div>
//                     <div className="overflow-auto border rounded">
//                         <table className="min-w-full text-sm">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className="text-left p-2">Módulo</th>
//                                     <th className="text-left p-2">Acciones</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {PERMISSION_MATRIX.map((m) => (
//                                     <tr key={m.key} className="border-t">
//                                         <td className="p-2 whitespace-nowrap">{m.label}</td>
//                                         <td className="p-2">
//                                             <div className="flex flex-wrap gap-3">
//                                                 {m.actions.map((a) => {
//                                                     const p = permKey(m.key, a)
//                                                     const checked = permsSet.has(p)
//                                                     return (
//                                                         <label key={p} className="flex items-center gap-2">
//                                                             <input type="checkbox" checked={checked} onChange={() => togglePerm(p)} />
//                                                             <span className="text-xs">{a.toUpperCase()}</span>
//                                                         </label>
//                                                     )
//                                                 })}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                     <div className="mt-2 text-xs text-gray-500">Internamente se guardan como strings tipo <code>people:read</code>.</div>
//                 </div>

//                 <textarea className="border rounded px-3 py-2 md:col-span-4" rows="4"
//                     placeholder="Permisos (uno por línea o separados por coma)\nEj: people:read"
//                     value={form.permissionsText}
//                     onChange={(e) => setForm(s => ({ ...s, permissionsText: e.target.value }))}
//                 />

//                 <div className="md:col-span-4 flex gap-2">
//                     <button type="submit" className="px-3 py-2 rounded bg-black text-white">
//                         {editingId ? 'Actualizar' : 'Crear'}
//                     </button>
//                     <button type="button" className="px-3 py-2 rounded border" onClick={reset}>Limpiar</button>
//                     <button type="button" className="px-3 py-2 rounded border" onClick={load} disabled={loading}>
//                         Recargar
//                     </button>
//                 </div>
//             </form>

//             <div className="flex items-center gap-2">
//                 <input className="border rounded px-3 py-2 w-full md:w-96" placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />
//             </div>

//             <div className="border rounded overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="text-left p-2">Código</th>
//                             <th className="text-left p-2">Nombre</th>
//                             <th className="text-left p-2">Scope</th>
//                             <th className="text-left p-2">Activo</th>
//                             <th className="text-left p-2 w-56">Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filtered.map(it => (
//                             <tr key={it._id} className="border-t">
//                                 <td className="p-2">{it.code}</td>
//                                 <td className="p-2">{it.name}</td>
//                                 <td className="p-2">{it.scope}</td>
//                                 <td className="p-2">{it.active === false ? 'No' : 'Sí'}</td>
//                                 <td className="p-2 flex gap-2">
//                                     <button className="px-2 py-1 border rounded" onClick={() => onEdit(it)} disabled={it.isSystem}>Editar</button>
//                                     <button className="px-2 py-1 border rounded" onClick={() => onDelete(it)} disabled={it.isSystem}>Eliminar</button>
//                                 </td>
//                             </tr>
//                         ))}
//                         {!filtered.length && (
//                             <tr><td className="p-3 text-gray-500" colSpan="5">Sin registros</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     )
// }

import { useEffect, useMemo, useState } from "react";
import { RolesAPI } from "../../../api/roles.api";

// Catálogo base de permisos (UI). Ajustable.
const PERMISSION_MATRIX = [
  {
    key: "vehicles",
    label: "Vehículos",
    actions: ["read", "create", "update", "delete", "transfer"],
  },
  {
    key: "people",
    label: "RRHH",
    actions: ["read", "create", "update", "delete"],
  },
  {
    key: "branches",
    label: "Sucursales",
    actions: ["read", "create", "update", "delete"],
  },
  { key: "positions", label: "Cargos", actions: ["read", "manage"] },
  { key: "roles", label: "Roles", actions: ["read", "manage"] },
  { key: "users", label: "Usuarios", actions: ["read", "manage"] },
  {
    key: "drivingTests",
    label: "Pruebas conducción",
    actions: ["read", "create", "update", "delete"],
  },
  {
    key: "purchaseOrders",
    label: "Ordenes compra",
    actions: ["read", "create", "update", "delete", "approve"],
  },
  {
    key: "workOrders",
    label: "Ordenes trabajo",
    actions: ["read", "create", "update", "delete", "approve"],
  },
];

const permKey = (m, a) => `${m}:${a}`;

const SCOPE_OPTIONS = ["BRANCH", "GLOBAL"];

export default function Roles() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    scope: "BRANCH",
    active: true,
    permissionsText: "",
    isSystem: false,
  });
  const [editingId, setEditingId] = useState(null);

  // const load = async () => {
  //     setLoading(true)
  //     try {
  //         const { data } = await RolesAPI.list({ q, limit: 200 })
  //         if (data.items) setItems(data.items)
  //         else if (data.result?.items) setItems(data.result.items)
  //         else if (Array.isArray(data)) setItems(data)
  //         else setItems([])
  //     } finally {
  //         setLoading(false)
  //     }
  // }

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await RolesAPI.list({ q: "", limit: 200 }); // opcional: traer sin filtro server
      if (Array.isArray(data)) setItems(data);
      else if (Array.isArray(data.items)) setItems(data.items);
      else if (Array.isArray(data.result?.items)) setItems(data.result.items);
      else if (Array.isArray(data.data)) setItems(data.data); // ✅ CLAVE
      else if (Array.isArray(data.data?.items)) setItems(data.data.items);
      else setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const reset = () => {
    setForm({
      code: "",
      name: "",
      scope: "BRANCH",
      active: true,
      permissionsText: "",
      isSystem: false,
    });
    setEditingId(null);
  };

  const parsePermissions = () => {
    const raw = String(form.permissionsText || "")
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set(raw));
  };

  const permsSet = useMemo(
    () => new Set(parsePermissions()),
    [form.permissionsText]
  );

  const togglePerm = (p) => {
    setForm((s) => {
      const set = new Set(
        String(s.permissionsText || "")
          .split(/\r?\n|,/)
          .map((x) => x.trim())
          .filter(Boolean)
      );
      if (set.has(p)) set.delete(p);
      else set.add(p);
      return { ...s, permissionsText: Array.from(set).sort().join("\n") };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      name: form.name,
      scope: form.scope,
      active: form.active,
      permissions: parsePermissions(),
      isSystem: form.isSystem,
    };
    if (!payload.code?.trim()) return alert("Código es obligatorio");
    if (!payload.name?.trim()) return alert("Nombre es obligatorio");

    try {
      if (editingId) await RolesAPI.update(editingId, payload);
      else await RolesAPI.create(payload);
      await load();
      reset();
    } catch (err) {
      console.error(err);
      alert("No fue posible guardar");
    }
  };

  const onEdit = (it) => {
    setEditingId(it._id);
    setForm({
      code: it.code || "",
      name: it.name || "",
      scope: it.scope || "BRANCH",
      active: it.active !== false,
      isSystem: !!it.isSystem,
      permissionsText: Array.isArray(it.permissions)
        ? it.permissions.join("\n")
        : "",
    });
  };

  const onDelete = async (it) => {
    if (it.isSystem) return alert("Rol de sistema: no se elimina");
    const ok = window.confirm("¿Eliminar rol?");
    if (!ok) return;
    try {
      await RolesAPI.remove(it._id);
      await load();
    } catch (err) {
      console.error(err);
      alert("No fue posible eliminar");
    }
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((it) =>
      `${it.code || ""} ${it.name || ""}`.toLowerCase().includes(qq)
    );
  }, [items, q]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Catálogo: Roles</h1>
        <p className="text-sm text-gray-600">
          Roles con scope y permisos (strings).
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="border rounded p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <input
          className="border rounded px-3 py-2"
          placeholder="Código *"
          value={form.code}
          onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
        />
        <input
          className="border rounded px-3 py-2 md:col-span-2"
          placeholder="Nombre *"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
        />
        <select
          className="border rounded px-3 py-2"
          value={form.scope}
          onChange={(e) => setForm((s) => ({ ...s, scope: e.target.value }))}
        >
          {SCOPE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm((s) => ({ ...s, active: e.target.checked }))
            }
          />
          Activo
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isSystem}
            onChange={(e) =>
              setForm((s) => ({ ...s, isSystem: e.target.checked }))
            }
          />
          isSystem (bloquear edición/borrado)
        </label>

        <div className="md:col-span-4">
          <div className="text-sm text-gray-600 mb-2">Permisos (grilla)</div>
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Módulo</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MATRIX.map((m) => (
                  <tr key={m.key} className="border-t">
                    <td className="p-2 whitespace-nowrap">{m.label}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-3">
                        {m.actions.map((a) => {
                          const p = permKey(m.key, a);
                          const checked = permsSet.has(p);
                          return (
                            <label key={p} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePerm(p)}
                              />
                              <span className="text-xs">{a.toUpperCase()}</span>
                            </label>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Internamente se guardan como strings tipo <code>people:read</code>.
          </div>
        </div>

        <textarea
          className="border rounded px-3 py-2 md:col-span-4"
          rows="4"
          placeholder="Permisos (uno por línea o separados por coma)\nEj: people:read"
          value={form.permissionsText}
          onChange={(e) =>
            setForm((s) => ({ ...s, permissionsText: e.target.value }))
          }
        />

        <div className="md:col-span-4 flex gap-2">
          <button
            type="submit"
            className="px-3 py-2 rounded bg-[var(--fc-primary)] text-white"
          >
            {editingId ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded border"
            onClick={reset}
          >
            Limpiar
          </button>
          {/* <button
            type="button"
            className="px-3 py-2 rounded border"
            onClick={load}
            disabled={loading}
          >
            Recargar
          </button> */}
        </div>
      </form>

      <div className="flex items-center gap-2">
        <input
          className="border rounded px-3 py-2 w-full md:w-96"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Código</th>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Scope</th>
              <th className="text-left p-2">Activo</th>
              <th className="text-left p-2 w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="p-2">{it.code}</td>
                <td className="p-2">{it.name}</td>
                <td className="p-2">{it.scope}</td>
                <td className="p-2">{it.active === false ? "No" : "Sí"}</td>
                <td className="p-2 flex gap-2">
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => onEdit(it)}
                    disabled={it.isSystem}
                  >
                    Editar
                  </button>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => onDelete(it)}
                    disabled={it.isSystem}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="p-3 text-gray-500" colSpan="5">
                  Sin registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
