// front/src/pages/Branches/List.jsx
// -----------------------------------------------------------------------------
// Listado de Sucursales con búsqueda, limit y paginación (server-side):
// - Persiste estado en useTableState (page, limit, q)
// - Usa tu hook usePagedQuery(KEY, {page,limit,q}, BranchesAPI.list)
// - Espera shape { docs, page, pages, total } del backend
// -----------------------------------------------------------------------------

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTableState } from '../../store/useTableState'
import { usePagedQuery } from '../../hooks/usePagedQuery'
import { BranchesAPI } from '../../api/branches.api'
import Paginator from '../../components/table/Paginator'
import LimitSelect from '../../components/table/LimitSelect'

const KEY = 'branches'

export default function BranchesList() {
  const getState = useTableState((s) => s.getState)
  const setPage = useTableState((s) => s.setPage)
  const setLimit = useTableState((s) => s.setLimit)
  const setQuery = useTableState((s) => s.setQuery)
  const { page, limit, q } = getState(KEY)

  const { data, isLoading, error, refetch } = usePagedQuery(
    KEY,
    { page, limit, q },
    BranchesAPI.list
  )

  useEffect(() => {
    refetch()
  }, [page, limit, q, refetch])

  return (
    <div className="p-6 space-y-6">
      {/* Header estilo RRHH */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Configuración — Sucursales</h1>
          <p className="text-sm text-gray-600">Administración de sucursales y centros de operación.</p>
        </div>

        <Link
          className="rounded-md text-white px-4 py-2"
          style={{ background: 'var(--fc-primary)' }}
          to="/branches/new"
        >
          Nueva sucursal
        </Link>
      </div>

      {/* Filtros (simple) */}
      <div className="border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          className="border rounded px-3 py-2 md:col-span-3"
          placeholder="Buscar (código, nombre)"
          defaultValue={q}
          onChange={(e) => setQuery(KEY, e.target.value)}
        />

        <LimitSelect value={limit} onChange={(val) => setLimit(KEY, val)} />

        <button
          type="button"
          className="px-3 py-2 rounded-md border border-gray-400"
          onClick={() => setQuery(KEY, '')}
        >
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      <div className="border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">Código</th>
                <th className="text-left px-4 py-2">Nombre</th>
                <th className="text-left px-4 py-2">Región</th>
                <th className="text-left px-4 py-2">Comuna</th>
                <th className="text-left px-4 py-2">Activo</th>
                <th className="text-left px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Cargando…
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                    Error al cargar
                  </td>
                </tr>
              )}
              {data?.docs?.map((b) => (
                <tr key={b._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{b.code || '—'}</td>
                  <td className="px-4 py-2">
                    <Link className="text-[var(--fc-primary)]" to={`/branches/${b._id}`}>
                      {b.name || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{b.region || '—'}</td>
                  <td className="px-4 py-2">{b.comuna || '—'}</td>
                  <td className="px-4 py-2">{b.active !== false ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-2">
                    <Link className="text-[var(--fc-primary)] mr-3" to={`/branches/${b._id}?mode=edit`}>
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && !error && (data?.docs?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-xs text-gray-500">Total: {data?.total ?? 0}</div>
          <Paginator page={data?.page ?? page} pages={data?.pages ?? 1} onPage={(p) => setPage(KEY, p)} />
        </div>
      </div>
    </div>
  )
}
