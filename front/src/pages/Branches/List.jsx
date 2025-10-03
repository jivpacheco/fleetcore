import { useEffect } from 'react'
import { useTableState } from '../../store/useTableState'
import { usePagedQuery } from '../../hooks/usePagedQuery'
import { BranchesAPI } from '../../api/branches.api'
import Paginator from '../../components/table/Paginator'
import LimitSelect from '../../components/table/LimitSelect'

const KEY = 'branches' // clave para Zustand

export default function BranchesList() {
  const getState = useTableState(s => s.getState)
  const setPage = useTableState(s => s.setPage)
  const setLimit = useTableState(s => s.setLimit)
  const setQuery = useTableState(s => s.setQuery)
  const { page, limit, q } = getState(KEY)

  // React Query
  const { data, isLoading, error, refetch } = usePagedQuery(
    KEY,
    { page, limit, q },
    BranchesAPI.list
  )

  // Refech cuando cambie estado
  useEffect(() => { refetch() }, [page, limit, q, refetch])

  return (
    <div>
      {/* Franja superior */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Sucursales</h1>
          <p className="text-gray-500 text-sm">Centros de operación</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input border rounded px-3 py-2"
            placeholder="Buscar por nombre/código"
            defaultValue={q}
            onChange={(e)=> setQuery(KEY, e.target.value)}
          />
          <LimitSelect value={limit} onChange={(val)=> setLimit(KEY, val)} />
          <button className="btn btn-primary px-3 py-2 rounded text-white" onClick={()=>{/* abrir modal crear */}}>
            Nuevo
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">Código</th>
                <th className="text-left px-4 py-2">Nombre</th>
                <th className="text-left px-4 py-2">Ciudad</th>
                <th className="text-left px-4 py-2">Estado</th>
                <th className="text-right px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Cargando…</td></tr>
              )}
              {error && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-red-600">Error al cargar</td></tr>
              )}
              {data?.docs?.map(b => (
                <tr key={b._id} className="border-t">
                  <td className="px-4 py-2">{b.code || '-'}</td>
                  <td className="px-4 py-2">{b.name || '-'}</td>
                  <td className="px-4 py-2">{b.city || '-'}</td>
                  <td className="px-4 py-2">{b.isActive ? 'Activa' : 'Inactiva'}</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-[var(--fc-secondary)] mr-2">Editar</button>
                    <button className="text-red-600">Eliminar</button>
                  </td>
                </tr>
              ))}
              {!isLoading && !error && (data?.docs?.length ?? 0) === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla: paginación */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-xs text-gray-500">
            Total: {data?.total ?? 0}
          </div>
          <Paginator
            page={data?.page ?? page}
            pages={data?.pages ?? 1}
            onPage={(p)=> setPage(KEY, p)}
          />
        </div>
      </div>
    </div>
  )
}
