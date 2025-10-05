// front/src/pages/Vehicles/List.jsx
// -----------------------------------------------------------------------------
// Listado de Vehículos (mismo patrón que Branches)
// -----------------------------------------------------------------------------

import { useEffect } from 'react'
import { useTableState } from '../../store/useTableState'
import { usePagedQuery } from '../../hooks/usePagedQuery'
import { VehiclesAPI } from '../../api/vehicles.api'
import Paginator from '../../components/table/Paginator'
import LimitSelect from '../../components/table/LimitSelect'

const KEY = 'vehicles'

export default function VehiclesList() {
  const getState = useTableState((s) => s.getState)
  const setPage = useTableState((s) => s.setPage)
  const setLimit = useTableState((s) => s.setLimit)
  const setQuery = useTableState((s) => s.setQuery)
  const { page, limit, q } = getState(KEY)

  const { data, isLoading, error, refetch } = usePagedQuery(
    KEY,
    { page, limit, q },
    VehiclesAPI.list
  )

  useEffect(() => {
    refetch()
  }, [page, limit, q, refetch])

  return (
    <div>
      {/* Franja superior */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Vehículos</h1>
          <p className="text-gray-500 text-sm">Inventario de material mayor</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="input border rounded px-3 py-2"
            placeholder="Buscar por patente/modelo"
            defaultValue={q}
            onChange={(e) => setQuery(KEY, e.target.value)}
          />
          <LimitSelect value={limit} onChange={(val) => setLimit(KEY, val)} />
          <button className="btn btn-primary px-3 py-2 rounded text-white" onClick={() => { }}>
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
                <th className="text-left px-4 py-2">Patente</th>
                <th className="text-left px-4 py-2">Modelo</th>
                <th className="text-left px-4 py-2">Año</th>
                <th className="text-left px-4 py-2">Sucursal</th>
                <th className="text-right px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Cargando…
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-red-600">
                    Error al cargar
                  </td>
                </tr>
              )}
              {data?.docs?.map((v) => (
                <tr key={v._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{v.plate || '-'}</td>
                  <td className="px-4 py-2">{v.model || '-'}</td>
                  <td className="px-4 py-2">{v.year || '-'}</td>
                  <td className="px-4 py-2">{v.branchName || '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-[var(--fc-primary)] mr-2">Editar</button>
                    <button className="text-red-600">Eliminar</button>
                  </td>
                </tr>
              ))}
              {!isLoading && !error && (data?.docs?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla: paginación */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-xs text-gray-500">Total: {data?.total ?? 0}</div>
          <Paginator page={data?.page ?? page} pages={data?.pages ?? 1} onPage={(p) => setPage(KEY, p)} />
        </div>
      </div>
    </div>
  )
}
