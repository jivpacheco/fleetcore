// front/src/pages/People/List.jsx
// -----------------------------------------------------------------------------
// Listado RRHH (Personas) con búsqueda y paginación server-side.
// - Aplica branchScope en backend (global ve todo; otros, solo su sucursal).
// -----------------------------------------------------------------------------

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTableState } from '../../store/useTableState'
import { usePagedQuery } from '../../hooks/usePagedQuery'
import { PeopleAPI } from '../../api/people.api'
import Paginator from '../../components/table/Paginator'
import LimitSelect from '../../components/table/LimitSelect'

const KEY = 'people'

export default function PeopleList(){
  const nav = useNavigate()

  const getState = useTableState((s) => s.getState)
  const setPage = useTableState((s) => s.setPage)
  const setLimit = useTableState((s) => s.setLimit)
  const setQuery = useTableState((s) => s.setQuery)

  const state = getState(KEY)
  const p = state.page
  const l = state.limit
  const q = state.q

  const { data, isLoading, refetch } = usePagedQuery(
    KEY,
    { page: p, limit: l, q },
    (params) => PeopleAPI.list(params).then(r => r.data)
  )

  useEffect(() => { refetch() }, [p, l, q]) // eslint-disable-line

  const rows = data?.data || []
  const total = data?.total || 0
  const pages = data?.pages || 1

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Recurso Humano</h1>
          <p className="text-gray-500 text-sm">Personas por sucursal</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Buscar por DNI / nombre / apellido"
            value={q}
            onChange={(e) => setQuery(KEY, e.target.value)}
          />
          <LimitSelect value={l} onChange={(val) => setLimit(KEY, val)} />
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => nav('/people/new')}>
            Nueva persona
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-3">DNI</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Sucursal</th>
                <th className="text-left p-3">Cargo</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && (
                <tr><td className="p-3 text-slate-500" colSpan={6}>Cargando…</td></tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr><td className="p-3 text-slate-500" colSpan={6}>Sin resultados.</td></tr>
              )}
              {!isLoading && rows.map(r => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono">{r.dni}</td>
                  <td className="p-3">{r.lastName} {r.firstName}</td>
                  <td className="p-3">{r.branchId?.code ? `${r.branchId.code} — ${r.branchId.name}` : (r.branchId?.name || '—')}</td>
                  <td className="p-3">{r.positionId?.name || '—'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${r.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {r.active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-blue-600 hover:underline" onClick={() => nav(`/people/${r._id}`)}>
                      Ver/Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t bg-white">
          <Paginator page={p} pages={pages} total={total} onChange={(np) => setPage(KEY, np)} />
        </div>
      </div>
    </div>
  )
}
