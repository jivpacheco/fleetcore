// front/src/pages/Repairs/List.jsx
// -----------------------------------------------------------------------------
// Catálogo Reparaciones (Taller)
// - List server-side: contrato { items, total, page, limit, pages }
// - Estándar FleetCore v1.0: pages/X/{List.jsx, Form.jsx}
// -----------------------------------------------------------------------------

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTableState } from '../../store/useTableState'
import { usePagedQuery } from '../../hooks/usePagedQuery'
import { RepairsAPI } from '../../api/repairs.api'
import Paginator from '../../components/table/Paginator'
import LimitSelect from '../../components/table/LimitSelect'

const KEY = 'repairs'

export default function RepairsList() {
    const navigate = useNavigate()
    const getState = useTableState((s) => s.getState)
    const setPage = useTableState((s) => s.setPage)
    const setLimit = useTableState((s) => s.setLimit)
    const setQuery = useTableState((s) => s.setQuery)
    const { page, limit, q } = getState(KEY)

    const { data, isLoading, error, refetch } = usePagedQuery(
        KEY,
        { page, limit, q },
        RepairsAPI.list
    )

    useEffect(() => {
        refetch()
    }, [page, limit, q, refetch])

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-xl font-bold">Catálogo de Reparaciones</h1>
                    <p className="text-gray-500 text-sm">
                        Base técnica para diagnósticos, KPI (tiempo estándar) e informes
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        className="input border rounded px-3 py-2"
                        placeholder="Buscar por nombre/código"
                        defaultValue={q}
                        onChange={(e) => setQuery(KEY, e.target.value)}
                    />
                    <LimitSelect value={limit} onChange={(val) => setLimit(KEY, val)} />
                    <button
                        className="btn btn-primary px-3 py-2 rounded text-white"
                        onClick={() => navigate('/config/catalogs/repairs/new')}
                    >
                        Nuevo
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left px-4 py-2">Código</th>
                                <th className="text-left px-4 py-2">Nombre</th>
                                <th className="text-left px-4 py-2">Sistema</th>
                                <th className="text-left px-4 py-2">Tipo</th>
                                <th className="text-left px-4 py-2">Std (min)</th>
                                <th className="text-left px-4 py-2">Estado</th>
                                <th className="text-right px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        Cargando…
                                    </td>
                                </tr>
                            )}
                            {error && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                                        Error al cargar
                                    </td>
                                </tr>
                            )}
                            {data?.items?.map((r) => (
                                <tr key={r._id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{r.code || '-'}</td>
                                    <td className="px-4 py-2">{r.name || '-'}</td>
                                    <td className="px-4 py-2">{r.systemKey || '-'}</td>
                                    <td className="px-4 py-2">{r.repairType || '-'}</td>
                                    <td className="px-4 py-2">{Number(r.standardLaborMinutes || 0)}</td>
                                    <td className="px-4 py-2">{r.active ? 'Activo' : 'Inactivo'}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            className="text-[var(--fc-primary)] mr-3"
                                            onClick={() => navigate(`/config/catalogs/repairs/${r._id}?mode=view`)}
                                        >
                                            Ver
                                        </button>
                                        <button
                                            className="text-[var(--fc-primary)]"
                                            onClick={() => navigate(`/config/catalogs/repairs/${r._id}`)}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && !error && (data?.items?.length ?? 0) === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        Sin resultados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-xs text-gray-500">Total: {data?.total ?? 0}</div>
                    <Paginator
                        page={data?.page ?? page}
                        pages={data?.pages ?? 1}
                        onPage={(p) => setPage(KEY, p)}
                    />
                </div>
            </div>
        </div>
    )
}
