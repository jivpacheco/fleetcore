// // front/src/pages/FailureReports/List.jsx
// // -----------------------------------------------------------------------------
// // Catálogo Reporte de Fallas (Cliente/Sucursal)
// // - Enfoque "no experto": sistemas principales + descripción guiada
// // - List server-side: contrato { items, total, page, limit, pages }
// // -----------------------------------------------------------------------------

// import { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useTableState } from '../../store/useTableState'
// import { usePagedQuery } from '../../hooks/usePagedQuery'
// import { FailureReportsAPI } from '../../api/failureReports.api'
// import Paginator from '../../components/table/Paginator'
// import LimitSelect from '../../components/table/LimitSelect'

// const KEY = 'failureReports'

// export default function FailureReportsList() {
//     const navigate = useNavigate()
//     const getState = useTableState((s) => s.getState)
//     const setPage = useTableState((s) => s.setPage)
//     const setLimit = useTableState((s) => s.setLimit)
//     const setQuery = useTableState((s) => s.setQuery)
//     const { page, limit, q } = getState(KEY)

//     const { data, isLoading, error, refetch } = usePagedQuery(
//         KEY,
//         { page, limit, q },
//         FailureReportsAPI.list
//     )

//     useEffect(() => {
//         refetch()
//     }, [page, limit, q, refetch])

//     return (
//         <div>
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
//                 <div>
//                     <h1 className="text-xl font-bold">Catálogo de Reporte de Fallas</h1>
//                     <p className="text-gray-500 text-sm">
//                         Base para crear tickets desde sucursal (sin diagnóstico técnico)
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <input
//                         className="input border rounded px-3 py-2"
//                         placeholder="Buscar por nombre/código"
//                         defaultValue={q}
//                         onChange={(e) => setQuery(KEY, e.target.value)}
//                     />
//                     <LimitSelect value={limit} onChange={(val) => setLimit(KEY, val)} />
//                     <button
//                         className="btn btn-primary px-3 py-2 rounded text-white"
//                         onClick={() => navigate('/config/catalogs/failure-reports/new')}
//                     >
//                         Nuevo
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-white rounded-2xl shadow-sm border">
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm">
//                         <thead className="bg-gray-50 text-gray-600">
//                             <tr>
//                                 <th className="text-left px-4 py-2">Código</th>
//                                 <th className="text-left px-4 py-2">Nombre</th>
//                                 <th className="text-left px-4 py-2">Sistema</th>
//                                 <th className="text-left px-4 py-2">Zona</th>
//                                 <th className="text-left px-4 py-2">Estado</th>
//                                 <th className="text-right px-4 py-2">Acciones</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {isLoading && (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
//                                         Cargando…
//                                     </td>
//                                 </tr>
//                             )}
//                             {error && (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-6 text-center text-red-600">
//                                         Error al cargar
//                                     </td>
//                                 </tr>
//                             )}
//                             {data?.items?.map((r) => (
//                                 <tr key={r._id} className="border-t hover:bg-gray-50">
//                                     <td className="px-4 py-2">{r.code || '-'}</td>
//                                     <td className="px-4 py-2">{r.name || '-'}</td>
//                                     <td className="px-4 py-2">{r.systemKey || '-'}</td>
//                                     <td className="px-4 py-2">{r.zoneKey || '-'}</td>
//                                     <td className="px-4 py-2">{r.active ? 'Activo' : 'Inactivo'}</td>
//                                     <td className="px-4 py-2 text-right">
//                                         <button
//                                             className="text-[var(--fc-primary)] mr-3"
//                                             onClick={() => navigate(`/config/catalogs/failure-reports/${r._id}?mode=view`)}
//                                         >
//                                             Ver
//                                         </button>
//                                         <button
//                                             className="text-[var(--fc-primary)]"
//                                             onClick={() => navigate(`/config/catalogs/failure-reports/${r._id}`)}
//                                         >
//                                             Editar
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                             {!isLoading && !error && (data?.items?.length ?? 0) === 0 && (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
//                                         Sin resultados
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="flex items-center justify-between px-4 py-3">
//                     <div className="text-xs text-gray-500">Total: {data?.total ?? 0}</div>
//                     <Paginator
//                         page={data?.page ?? page}
//                         pages={data?.pages ?? 1}
//                         onPage={(p) => setPage(KEY, p)}
//                     />
//                 </div>
//             </div>
//         </div>
//     )
// }

// //v2 280126

// // front/src/pages/FailureReports/List.jsx
// // -----------------------------------------------------------------------------
// // Catálogo Reporte de Fallas (Cliente/Sucursal)
// // - Enfoque "no experto": sistemas principales + descripción guiada
// // - List server-side: contrato { items, total, page, limit, pages }
// // -----------------------------------------------------------------------------

// import { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useTableState } from '../../store/useTableState'
// import { usePagedQuery } from '../../hooks/usePagedQuery'
// import { FailureReportsAPI } from '../../api/failureReports.api'
// import Paginator from '../../components/table/Paginator'
// import LimitSelect from '../../components/table/LimitSelect'

// const KEY = 'failureReports'

// export default function FailureReportsList() {
//     const navigate = useNavigate()
//     const getState = useTableState((s) => s.getState)
//     const setPage = useTableState((s) => s.setPage)
//     const setLimit = useTableState((s) => s.setLimit)
//     const setQuery = useTableState((s) => s.setQuery)
//     const { page, limit, q } = getState(KEY)

//     const { data, isLoading, error, refetch } = usePagedQuery(
//         KEY,
//         { page, limit, q },
//         FailureReportsAPI.list
//     )

//     useEffect(() => {
//         refetch()
//     }, [page, limit, q, refetch])

//     return (
//         <div className="p-6 space-y-6">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
//                 <div>
//                     <h1 className="text-xl font-bold">Catálogo de Reporte de Fallas</h1>
//                     <p className="text-gray-500 text-sm">
//                         Base para crear tickets desde sucursal (sin diagnóstico técnico)
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <input
//                         className="input border rounded px-3 py-2"
//                         placeholder="Buscar por nombre/código"
//                         defaultValue={q}
//                         onChange={(e) => setQuery(KEY, e.target.value)}
//                     />
//                     <LimitSelect value={limit} onChange={(val) => setLimit(KEY, val)} />
//                     <button
//                         className="btn btn-primary px-3 py-2 rounded text-white"
//                         onClick={() => navigate('/config/catalogs/failure-reports/new')}
//                     >
//                         Nuevo
//                     </button>
//                 </div>
//             </div>

//             <div className="bg-white rounded-2xl shadow-sm border">
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm">
//                         <thead className="bg-gray-50 text-gray-600">
//                             <tr>
//                                 <th className="text-left px-4 py-2">Código</th>
//                                 <th className="text-left px-4 py-2">Nombre</th>
//                                 <th className="text-left px-4 py-2">Sistema</th>
//                                 <th className="text-left px-4 py-2">Zona</th>
//                                 <th className="text-left px-4 py-2">Estado</th>
//                                 <th className="text-right px-4 py-2">Acciones</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {isLoading && (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
//                                         Cargando…
//                                     </td>
//                                 </tr>
//                             )}
//                             {error && (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-6 text-center text-red-600">
//                                         Error al cargar
//                                     </td>
//                                 </tr>
//                             )}
//                             {data?.items?.map((r) => (
//                                 <tr key={r._id} className="border-t hover:bg-gray-50">
//                                     <td className="px-4 py-2">{r.code || '-'}</td>
//                                     <td className="px-4 py-2">{r.name || '-'}</td>
//                                     <td className="px-4 py-2">{r.systemKey || '-'}</td>
//                                     <td className="px-4 py-2">{r.zoneKey || '-'}</td>
//                                     <td className="px-4 py-2">{r.active ? 'Activo' : 'Inactivo'}</td>
//                                     <td className="px-4 py-2 text-right">
//                                         <button
//                                             className="text-[var(--fc-primary)] mr-3"
//                                             onClick={() => navigate(`/config/catalogs/failure-reports/${r._id}?mode=view`)}
//                                         >
//                                             Ver
//                                         </button>
//                                         <button
//                                             className="text-[var(--fc-primary)]"
//                                             onClick={() => navigate(`/config/catalogs/failure-reports/${r._id}`)}
//                                         >
//                                             Editar
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                             {!isLoading && !error && (data?.items?.length ?? 0) === 0 && (
//                                 <tr>
//                                     <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
//                                         Sin resultados
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="flex items-center justify-between px-4 py-3">
//                     <div className="text-xs text-gray-500">Total: {data?.total ?? 0}</div>
//                     <Paginator
//                         page={data?.page ?? page}
//                         pages={data?.pages ?? 1}
//                         onPage={(p) => setPage(KEY, p)}
//                     />
//                 </div>
//             </div>
//         </div>
//     )
// }

// front/src/pages/FailureReports/List.jsx
// -----------------------------------------------------------------------------
// Catálogo → Reporte de Fallas (Sucursal / Operación)
// - Lista paginada (items/total/page/limit)
// - Búsqueda por nombre/código/sistema
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FailureReportsAPI } from "../../api/failureReports.api";
import Paginator from "../../components/table/Paginator";
import LimitSelect from "../../components/table/LimitSelect";
import vehicleTaxonomy from "../../data/fleetcore/vehicle-taxonomy.json";

export default function FailureReportsList() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 20);
  const q = sp.get("q") || "";
  const active = sp.get("active") || "";

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const systemsMap = useMemo(() => {
    const m = new Map();
    (vehicleTaxonomy?.systems || []).forEach((s) => m.set(s.key, s.label));
    return m;
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await FailureReportsAPI.list({ page, limit, q, active });
      setItems(data?.items || []);
      setTotal(Number(data?.total || 0));
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || "No fue posible cargar el catálogo",
      );
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, limit, q, active]); // eslint-disable-line react-hooks/exhaustive-deps

  const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

  return (
    <div>
      {/* Franja superior */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Catálogo · Reporte de Fallas</h1>
          <p className="text-gray-500 text-sm">
            Entrada operativa (sucursal). Sin diagnóstico técnico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="input border rounded px-3 py-2"
            placeholder="Buscar por código/nombre/sistema"
            value={q}
            onChange={(e) =>
              setSp(
                (prev) => {
                  prev.set("q", e.target.value);
                  prev.set("page", "1");
                  return prev;
                },
                { replace: true },
              )
            }
          />
          <select
            className="border rounded px-3 py-2 text-sm"
            value={active}
            onChange={(e) =>
              setSp(
                (prev) => {
                  prev.set("active", e.target.value);
                  prev.set("page", "1");
                  return prev;
                },
                { replace: true },
              )
            }
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <LimitSelect
            value={limit}
            onChange={(val) =>
              setSp(
                (prev) => {
                  prev.set("limit", String(val));
                  prev.set("page", "1");
                  return prev;
                },
                { replace: true },
              )
            }
          />
          <Link
            className="btn btn-primary px-3 py-2 rounded text-white"
            to="/config/catalogs/failure-reports/new"
          >
            Nuevo
          </Link>
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
                <th className="text-left px-4 py-2">Sistema</th>
                <th className="text-left px-4 py-2">Activo</th>
                <th className="text-right px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-500">
                    Cargando…
                  </td>
                </tr>
              )}

              {!loading && !items.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-500">
                    Sin resultados
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((it) => (
                  <tr key={it._id} className="border-t">
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">
                      {it.code}
                    </td>
                    <td className="px-4 py-2">{it.name}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {systemsMap.get(it.systemKey) || it.systemKey || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {it.isActive !== false ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          className="underline text-blue-700"
                          to={`/config/catalogs/failure-reports/${it._id}?mode=view`}
                        >
                          Ver
                        </Link>
                        <Link
                          className="underline text-blue-700"
                          to={`/config/catalogs/failure-reports/${it._id}`}
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">
            Total: <span className="font-medium">{total}</span>
          </div>
          <Paginator
            page={page}
            pages={pages}
            onPage={(p) =>
              setSp(
                (prev) => {
                  prev.set("page", String(p));
                  return prev;
                },
                { replace: true },
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
