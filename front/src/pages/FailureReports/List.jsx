// // front/src/pages/FailureReports/List.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Reporte de Fallas (Sucursal / Operación)
// // - Lista paginada (items/total/page/limit)
// // - Búsqueda por nombre/código/sistema
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from "react";
// import { Link, useSearchParams } from "react-router-dom";
// import { FailureReportsAPI } from "../../api/failureReports.api";
// import Paginator from "../../components/table/Paginator";
// import LimitSelect from "../../components/table/LimitSelect";
// import vehicleTaxonomy from "../../data/fleetcore/vehicle-taxonomy.json";

// export default function FailureReportsList() {
//   const [sp, setSp] = useSearchParams();
//   const page = Number(sp.get("page") || 1);
//   const limit = Number(sp.get("limit") || 20);
//   const q = sp.get("q") || "";
//   const active = sp.get("active") || "";

//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);

//   const systemsMap = useMemo(() => {
//     const m = new Map();
//     (vehicleTaxonomy?.systems || []).forEach((s) => m.set(s.key, s.label));
//     return m;
//   }, []);

//   const rowIsActive = (it) => {
//     // prioridad: si existe isActive úsalo; si no, usa active
//     if (typeof it?.isActive === "boolean") return it.isActive;
//     if (typeof it?.active === "boolean") return it.active;
//     return true; // fallback
//   };

//   const sortedItems = useMemo(() => {
//     const arr = Array.isArray(items) ? [...items] : [];
//     arr.sort((a, b) => {
//       const ac = String(a?.code || "")
//         .trim()
//         .toUpperCase();
//       const bc = String(b?.code || "")
//         .trim()
//         .toUpperCase();
//       return ac.localeCompare(bc, "es", { numeric: true });
//     });
//     return arr;
//   }, [items]);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await FailureReportsAPI.list({ page, limit, q, active });
//       setItems(data?.items || []);
//       setTotal(Number(data?.total || 0));
//     } catch (err) {
//       console.error(err);
//       alert(
//         err?.response?.data?.message || "No fue posible cargar el catálogo",
//       );
//       setItems([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [page, limit, q, active]); // eslint-disable-line react-hooks/exhaustive-deps

//   const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

//   return (
//     <div className="p-6 space-y-6">
//       {/* Franja superior */}
//       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
//         <div>
//           <h1 className="text-xl font-bold">Catálogo · Reporte de Fallas</h1>
//           <p className="text-gray-500 text-sm">
//             Entrada operativa (sucursal). Sin diagnóstico técnico.
//           </p>
//         </div>

//         {/* TODO EN UNA LÍNEA (buscar + selector + nuevo) */}
//         <div className="flex items-center gap-2 flex-nowrap">
//           <input
//             className="input border rounded px-3 py-2 w-56"
//             placeholder="Buscar por código"
//             value={q}
//             onChange={(e) =>
//               setSp(
//                 (prev) => {
//                   prev.set("q", e.target.value);
//                   prev.set("page", "1");
//                   return prev;
//                 },
//                 { replace: true },
//               )
//             }
//           />

//           <select
//             className="border rounded px-3 py-2 text-sm w-44"
//             value={active}
//             onChange={(e) =>
//               setSp(
//                 (prev) => {
//                   prev.set("active", e.target.value);
//                   prev.set("page", "1");
//                   return prev;
//                 },
//                 { replace: true },
//               )
//             }
//           >
//             <option value="">Activo (todos)</option>
//             <option value="true">Activos</option>
//             <option value="false">Inactivos</option>
//           </select>

//           <Link
//             // className="btn btn-primary px-5 py-2 rounded text-white whitespace-nowrap"
//             className="px-5 py-2 rounded bg-[var(--fc-primary)] text-white whitespace-nowrap"
//             to="/config/catalogs/failure-reports/new"
//           >
//             Nuevo reporte
//           </Link>
//         </div>
//       </div>

//       {/* Tabla */}
//       <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-50 text-gray-600">
//               <tr>
//                 <th className="text-left px-4 py-2">Código</th>
//                 <th className="text-left px-4 py-2">Nombre</th>
//                 <th className="text-left px-4 py-2">Sistema</th>
//                 <th className="text-left px-4 py-2">Activo</th>
//                 <th className="text-right px-4 py-2">Acciones</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading && (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-6 text-gray-500">
//                     Cargando…
//                   </td>
//                 </tr>
//               )}

//               {!loading && !items.length && (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-6 text-gray-500">
//                     Sin resultados
//                   </td>
//                 </tr>
//               )}

//               {!loading &&
//                 // items.map((it) => (
//                 sortedItems.map((it) => (
//                   <tr key={it._id} className="border-t">
//                     <td className="px-4 py-2 font-mono text-xs text-gray-700">
//                       {it.code}
//                     </td>
//                     <td className="px-4 py-2">{it.name}</td>
//                     <td className="px-4 py-2 text-gray-700">
//                       {systemsMap.get(it.systemKey) || it.systemKey || "—"}
//                     </td>
//                     <td className="px-4 py-2">
//                       {/* {it.isActive !== false ? "Sí" : "No"} */}
//                       {rowIsActive(it) ? "Sí" : "No"}
//                     </td>

//                     {/* Acciones como en la imagen (botones con borde) */}
//                     <td className="px-4 py-2">
//                       <div className="flex justify-end">
//                         <div className="inline-flex items-center gap-2">
//                           <Link
//                             className="border rounded px-4 py-1.5 text-sm hover:bg-gray-50"
//                             to={`/config/catalogs/failure-reports/${it._id}?mode=view`}
//                           >
//                             Ver
//                           </Link>
//                           <Link
//                             className="border rounded px-4 py-1.5 text-sm hover:bg-gray-50"
//                             to={`/config/catalogs/failure-reports/${it._id}`}
//                           >
//                             Editar
//                           </Link>

//                           {/* Eliminar: lo dejamos “abierto” hasta validar trazabilidad con Tickets
//                              (si no hay endpoint aún, no lo activamos para no romper). */}
//                           {/* <button
//                             type="button"
//                             className="border rounded px-4 py-1.5 text-sm hover:bg-gray-50"
//                             onClick={() => onDelete(it)}
//                           >
//                             Eliminar
//                           </button> */}
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-between px-4 py-3 border-t">
//           <div className="text-sm text-gray-600">
//             Total: <span className="font-medium">{total}</span>
//           </div>

//           <div className="flex items-center gap-3">
//             <Paginator
//               page={page}
//               pages={pages}
//               onPage={(p) =>
//                 setSp(
//                   (prev) => {
//                     prev.set("page", String(p));
//                     return prev;
//                   },
//                   { replace: true },
//                 )
//               }
//             />

//             <LimitSelect
//               value={limit}
//               onChange={(val) =>
//                 setSp(
//                   (prev) => {
//                     prev.set("limit", String(val));
//                     prev.set("page", "1");
//                     return prev;
//                   },
//                   { replace: true },
//                 )
//               }
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
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

  const rowIsActive = (it) => {
    // prioridad: si existe isActive úsalo; si no, usa active
    if (typeof it?.isActive === "boolean") return it.isActive;
    if (typeof it?.active === "boolean") return it.active;
    return true; // fallback
  };

  const sortedItems = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];
    arr.sort((a, b) => {
      const ac = String(a?.code || "")
        .trim()
        .toUpperCase();
      const bc = String(b?.code || "")
        .trim()
        .toUpperCase();
      return ac.localeCompare(bc, "es", { numeric: true });
    });
    return arr;
  }, [items]);

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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Franja superior */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">Catálogo · Reporte de Fallas</h1>
          <p className="text-gray-500 text-sm">
            Entrada operativa (sucursal). Sin diagnóstico técnico.
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <input
            className="input border rounded px-3 py-2 w-full sm:w-56"
            placeholder="Buscar por código"
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
            className="border rounded px-3 py-2 text-sm w-full sm:w-44"
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
            <option value="">Activo (todos)</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <Link
            // className="btn btn-primary px-5 py-2 rounded text-white whitespace-nowrap"
            className="px-5 py-2 rounded bg-[var(--fc-primary)] text-white whitespace-nowrap w-full sm:w-auto text-center"
            to="/config/catalogs/failure-reports/new"
          >
            Nuevo reporte
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
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
                // items.map((it) => (
                sortedItems.map((it) => (
                  <tr key={it._id} className="border-t">
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">
                      {it.code}
                    </td>
                    <td className="px-4 py-2">{it.name}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {systemsMap.get(it.systemKey) || it.systemKey || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {/* {it.isActive !== false ? "Sí" : "No"} */}
                      {rowIsActive(it) ? "Sí" : "No"}
                    </td>

                    {/* Acciones como en la imagen (botones con borde) */}
                    <td className="px-4 py-2">
                      <div className="flex justify-end">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            className="border rounded px-4 py-1.5 text-sm hover:bg-gray-50"
                            to={`/config/catalogs/failure-reports/${it._id}?mode=view`}
                          >
                            Ver
                          </Link>
                          <Link
                            className="border rounded px-4 py-1.5 text-sm hover:bg-gray-50"
                            to={`/config/catalogs/failure-reports/${it._id}`}
                          >
                            Editar
                          </Link>

                          {/* Eliminar: lo dejamos “abierto” hasta validar trazabilidad con Tickets
                             (si no hay endpoint aún, no lo activamos para no romper). */}
                          {/* <button
                            type="button"
                            className="border rounded px-4 py-1.5 text-sm hover:bg-gray-50"
                            onClick={() => onDelete(it)}
                          >
                            Eliminar
                          </button> */}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t">
          <div className="text-sm text-gray-600">
            Total: <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
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
          </div>
        </div>
      </div>
    </div>
  );
}
