// // front/src/pages/Repairs/List.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Reparaciones (Taller)
// // - Lista paginada (items/total/page/limit)
// // - Filtros: código + estado
// // - UI alineada al estándar FleetCore (FailureReports)
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from "react";
// import { Link, useSearchParams } from "react-router-dom";
// import { RepairsAPI } from "../../api/repairs.api";
// import Paginator from "../../components/table/Paginator";
// import LimitSelect from "../../components/table/LimitSelect";
// import vehicleTaxonomy from "../../data/fleetcore/vehicle-taxonomy.json";
// import repairTaxonomy from "../../data/fleetcore/repair-taxonomy.json";

// export default function RepairsList() {
//   const [sp, setSp] = useSearchParams();

//   const page = Number(sp.get("page") || 1);
//   const limit = Number(sp.get("limit") || 20);
//   const code = sp.get("code") || "";
//   const active = sp.get("active") ?? "";

//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);

//   const systemsMap = useMemo(() => {
//     const m = new Map();
//     (vehicleTaxonomy?.systems || []).forEach((s) => m.set(s.key, s.label));
//     return m;
//   }, []);


//   const normalizeOptions = (opt) => {
//     // Opción B: [{ v, l }]
//     if (Array.isArray(opt) && opt.length && typeof opt[0] === "object") {
//       return opt
//         .filter(Boolean)
//         .map((o) => ({ v: String(o.v || ""), l: String(o.l || o.v || "") }))
//         .filter((o) => o.v);
//     }
//     // Opción A: ["X", "Y"] => label=value
//     if (Array.isArray(opt) && opt.length && typeof opt[0] === "string") {
//       return opt.map((v) => ({ v: String(v), l: String(v) }));
//     }
//     return [];
//   };

//   const typeLabelMap = useMemo(() => {
//     const m = new Map();
//     normalizeOptions(repairTaxonomy?.options?.types).forEach((o) =>
//       m.set(String(o.v).toUpperCase(), o.l)
//     );
//     return m;
//   }, []);

//   const severityLabelMap = useMemo(() => {
//     const m = new Map();
//     normalizeOptions(repairTaxonomy?.options?.severities).forEach((o) =>
//       m.set(String(o.v).toUpperCase(), o.l)
//     );
//     return m;
//   }, []);

//   const impactLabelMap = useMemo(() => {
//     const m = new Map();
//     normalizeOptions(repairTaxonomy?.options?.operationalImpacts).forEach((o) =>
//       m.set(String(o.v).toUpperCase(), o.l)
//     );
//     return m;
//   }, []);

//   const typeLabel = (it) => {
//     const raw = it?.type || it?.repairType || "";
//     const key = String(raw || "").trim().toUpperCase();
//     return typeLabelMap.get(key) || raw || "—";
//   };

//   const severityLabel = (it) => {
//     const raw = it?.severityDefault || it?.severity || "";
//     const key = String(raw || "").trim().toUpperCase();
//     return severityLabelMap.get(key) || raw || "—";
//   };

//   const impactLabel = (it) => {
//     const raw =
//       it?.operationalImpact ||
//       it?.operationalImpactDefault ||
//       it?.operationalImpactDefaultKey ||
//       "";
//     const key = String(raw || "").trim().toUpperCase();
//     return impactLabelMap.get(key) || raw || "—";
//   };

//   const rowIsActive = (it) => {
//     if (typeof it?.isActive === "boolean") return it.isActive;
//     if (typeof it?.active === "boolean") return it.active;
//     return true;
//   };

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await RepairsAPI.list({ page, limit, q: code, active });
//       setItems(data?.items || []);
//       setTotal(Number(data?.total || 0));
//     } catch (err) {
//       console.error(err);
//       alert(err?.response?.data?.message || "No fue posible cargar el catálogo");
//       setItems([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [page, limit, code, active]); // eslint-disable-line react-hooks/exhaustive-deps

//   const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

//   const sortedItems = useMemo(() => {
//     const arr = Array.isArray(items) ? [...items] : [];
//     arr.sort((a, b) => {
//       const ac = String(a?.code || "").trim().toUpperCase();
//       const bc = String(b?.code || "").trim().toUpperCase();
//       return ac.localeCompare(bc, "es", { numeric: true });
//     });
//     return arr;
//   }, [items]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Franja superior */}
//       <div className="flex items-start justify-between gap-3 flex-wrap">
//         <div>
//           <h1 className="text-xl font-bold">Catálogo · Reparaciones</h1>
//           <p className="text-gray-500 text-sm">
//             Estándares técnicos para OT, KPI y análisis de costos/fallas.
//           </p>
//         </div>

//         {/* TODO EN UNA LÍNEA (código + estado + nuevo) */}
//         <div className="flex items-center gap-2 flex-wrap justify-end">
//           <input
//             className="border rounded-md px-3 py-2 text-sm w-56"
//             placeholder="Buscar por código"
//             value={code}
//             onChange={(e) =>
//               setSp(
//                 (prev) => {
//                   const v = e.target.value;
//                   if (v) prev.set("code", v);
//                   else prev.delete("code");
//                   prev.set("page", "1");
//                   return prev;
//                 },
//                 { replace: true }
//               )
//             }
//           />

//           <select
//             className="border rounded-md px-3 py-2 text-sm w-44"
//             value={active}
//             onChange={(e) =>
//               setSp(
//                 (prev) => {
//                   const v = e.target.value;
//                   if (v !== "") prev.set("active", v);
//                   else prev.delete("active");
//                   prev.set("page", "1");
//                   return prev;
//                 },
//                 { replace: true }
//               )
//             }
//           >
//             <option value="">Activo (todos)</option>
//             <option value="true">Activos</option>
//             <option value="false">Inactivos</option>
//           </select>

//           <Link
//             className="px-5 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white whitespace-nowrap"
//             to="/config/catalogs/repairs/new"
//           >
//             Nueva reparación
//           </Link>
//         </div>
//       </div>

//       {/* Tabla */}
//       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-gray-50 text-gray-600">
//               <tr>
//                 <th className="text-left px-4 py-2">Código</th>
//                 <th className="text-left px-4 py-2">Nombre</th>
//                 <th className="text-left px-4 py-2">Sistema</th>
//                 <th className="text-left px-4 py-2">Tipo</th>
//                 <th className="text-left px-4 py-2">Severidad</th>
//                 <th className="text-left px-4 py-2">Impacto</th>
//                 <th className="text-left px-4 py-2">Std (min)</th>
//                 <th className="text-left px-4 py-2">Activo</th>
//                 <th className="text-right px-4 py-2">Acciones</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading && (
//                 <tr>
//                   <td colSpan={9} className="px-4 py-6 text-gray-500">
//                     Cargando…
//                   </td>
//                 </tr>
//               )}

//               {!loading && !sortedItems.length && (
//                 <tr>
//                   <td colSpan={9} className="px-4 py-6 text-gray-500">
//                     Sin resultados
//                   </td>
//                 </tr>
//               )}

//               {!loading &&
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
//                       {typeLabel(it)}
//                     </td>
//                     <td className="px-4 py-2">{severityLabel(it)}</td>
//                     <td className="px-4 py-2">{impactLabel(it)}</td>
//                     <td className="px-4 py-2">
//                       {Number(it.standardLaborMinutes || 0)}
//                     </td>
//                     <td className="px-4 py-2">{rowIsActive(it) ? "Sí" : "No"}</td>

//                     <td className="px-4 py-2">
//                       <div className="flex justify-end">
//                         <div className="inline-flex items-center gap-2">
//                           <Link
//                             className="border border-[var(--fc-primary)] text-[var(--fc-primary)] rounded-md px-4 py-1.5 text-sm hover:bg-[color:var(--fc-primary)] hover:text-white"
//                             to={`/config/catalogs/repairs/${it._id}?mode=view`}
//                           >
//                             Ver
//                           </Link>
//                           <Link
//                             className="border border-[var(--fc-primary)] text-[var(--fc-primary)] rounded-md px-4 py-1.5 text-sm hover:bg-[color:var(--fc-primary)] hover:text-white"
//                             to={`/config/catalogs/repairs/${it._id}`}
//                           >
//                             Editar
//                           </Link>
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
//                   { replace: true }
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
//                   { replace: true }
//                 )
//               }
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // // front/src/pages/Repairs/List.jsx
// // // -----------------------------------------------------------------------------
// // // Catálogo → Reparaciones (Taller)
// // // - Lista paginada (items/total/page/limit)
// // // - Filtros: código + estado
// // // - UI alineada al estándar FleetCore (FailureReports)
// // // -----------------------------------------------------------------------------

// // import { useEffect, useMemo, useState } from "react";
// // import { Link, useSearchParams } from "react-router-dom";
// // import { RepairsAPI } from "../../api/repairs.api";
// // import Paginator from "../../components/table/Paginator";
// // import LimitSelect from "../../components/table/LimitSelect";
// // import vehicleTaxonomy from "../../data/fleetcore/vehicle-taxonomy.json";

// // export default function RepairsList() {
// //   const [sp, setSp] = useSearchParams();

// //   const page = Number(sp.get("page") || 1);
// //   const limit = Number(sp.get("limit") || 20);
// //   const code = sp.get("code") || "";
// //   const active = sp.get("active") ?? "";

// //   const [loading, setLoading] = useState(false);
// //   const [items, setItems] = useState([]);
// //   const [total, setTotal] = useState(0);

// //   const systemsMap = useMemo(() => {
// //     const m = new Map();
// //     (vehicleTaxonomy?.systems || []).forEach((s) => m.set(s.key, s.label));
// //     return m;
// //   }, []);

// //   const rowIsActive = (it) => {
// //     if (typeof it?.isActive === "boolean") return it.isActive;
// //     if (typeof it?.active === "boolean") return it.active;
// //     return true;
// //   };

// //   const load = async () => {
// //     setLoading(true);
// //     try {
// //       const { data } = await RepairsAPI.list({ page, limit, q: code, active });
// //       setItems(data?.items || []);
// //       setTotal(Number(data?.total || 0));
// //     } catch (err) {
// //       console.error(err);
// //       alert(err?.response?.data?.message || "No fue posible cargar el catálogo");
// //       setItems([]);
// //       setTotal(0);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     load();
// //   }, [page, limit, code, active]); // eslint-disable-line react-hooks/exhaustive-deps

// //   const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

// //   const sortedItems = useMemo(() => {
// //     const arr = Array.isArray(items) ? [...items] : [];
// //     arr.sort((a, b) => {
// //       const ac = String(a?.code || "").trim().toUpperCase();
// //       const bc = String(b?.code || "").trim().toUpperCase();
// //       return ac.localeCompare(bc, "es", { numeric: true });
// //     });
// //     return arr;
// //   }, [items]);

// //   return (
// //     <div className="p-4 sm:p-6 space-y-6">
// //       {/* Franja superior */}
// //       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
// //         <div>
// //           <h1 className="text-xl font-bold">Catálogo · Reparaciones</h1>
// //           <p className="text-gray-500 text-sm">
// //             Estándares técnicos para OT, KPI y análisis de costos/fallas.
// //           </p>
// //         </div>

// //         {/* TODO EN UNA LÍNEA (código + estado + nuevo) */}
// //         <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
// //           <input
// //             className="border rounded-md px-3 py-2 text-sm w-full sm:w-56"
// //             placeholder="Buscar por código"
// //             value={code}
// //             onChange={(e) =>
// //               setSp(
// //                 (prev) => {
// //                   const v = e.target.value;
// //                   if (v) prev.set("code", v);
// //                   else prev.delete("code");
// //                   prev.set("page", "1");
// //                   return prev;
// //                 },
// //                 { replace: true }
// //               )
// //             }
// //           />

// //           <select
// //             className="border rounded-md px-3 py-2 text-sm w-full sm:w-44"
// //             value={active}
// //             onChange={(e) =>
// //               setSp(
// //                 (prev) => {
// //                   const v = e.target.value;
// //                   if (v !== "") prev.set("active", v);
// //                   else prev.delete("active");
// //                   prev.set("page", "1");
// //                   return prev;
// //                 },
// //                 { replace: true }
// //               )
// //             }
// //           >
// //             <option value="">Activo (todos)</option>
// //             <option value="true">Activos</option>
// //             <option value="false">Inactivos</option>
// //           </select>

// //           <Link
// //             className="px-5 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white whitespace-nowrap w-full sm:w-auto text-center"
// //             to="/config/catalogs/repairs/new"
// //           >
// //             Nueva reparación
// //           </Link>
// //         </div>
// //       </div>

// //       {/* Tabla */}
// //       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
// //         <div className="overflow-x-auto">
// //           <table className="min-w-[1100px] w-full text-sm">
// //             <thead className="bg-gray-50 text-gray-600">
// //               <tr>
// //                 <th className="text-left px-4 py-2">Código</th>
// //                 <th className="text-left px-4 py-2">Nombre</th>
// //                 <th className="text-left px-4 py-2">Sistema</th>
// //                 <th className="text-left px-4 py-2">Tipo</th>
// //                 <th className="text-left px-4 py-2">Impacto</th>
// //                 <th className="text-left px-4 py-2">Std (min)</th>
// //                 <th className="text-left px-4 py-2">Activo</th>
// //                 <th className="text-right px-4 py-2">Acciones</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {loading && (
// //                 <tr>
// //                   <td colSpan={8} className="px-4 py-6 text-gray-500">
// //                     Cargando…
// //                   </td>
// //                 </tr>
// //               )}

// //               {!loading && !sortedItems.length && (
// //                 <tr>
// //                   <td colSpan={8} className="px-4 py-6 text-gray-500">
// //                     Sin resultados
// //                   </td>
// //                 </tr>
// //               )}

// //               {!loading &&
// //                 sortedItems.map((it) => (
// //                   <tr key={it._id} className="border-t">
// //                     <td className="px-4 py-2 font-mono text-xs text-gray-700">
// //                       {it.code}
// //                     </td>
// //                     <td className="px-4 py-2">{it.name}</td>
// //                     <td className="px-4 py-2 text-gray-700">
// //                       {systemsMap.get(it.systemKey) || it.systemKey || "—"}
// //                     </td>
// //                     <td className="px-4 py-2">
// //                       {it.type || it.repairType || "—"}
// //                     </td>
// //                     <td className="px-4 py-2">
// //                       {it.operationalImpact ||
// //                         it.operationalImpactDefault ||
// //                         "—"}
// //                     </td>
// //                     <td className="px-4 py-2">
// //                       {Number(it.standardLaborMinutes || 0)}
// //                     </td>
// //                     <td className="px-4 py-2">{rowIsActive(it) ? "Sí" : "No"}</td>

// //                     <td className="px-4 py-2">
// //                       <div className="flex justify-end">
// //                         <div className="inline-flex items-center gap-2">
// //                           <Link
// //                             className="border border-[var(--fc-primary)] text-[var(--fc-primary)] rounded-md px-4 py-1.5 text-sm hover:bg-[color:var(--fc-primary)] hover:text-white"
// //                             to={`/config/catalogs/repairs/${it._id}?mode=view`}
// //                           >
// //                             Ver
// //                           </Link>
// //                           <Link
// //                             className="border border-[var(--fc-primary)] text-[var(--fc-primary)] rounded-md px-4 py-1.5 text-sm hover:bg-[color:var(--fc-primary)] hover:text-white"
// //                             to={`/config/catalogs/repairs/${it._id}`}
// //                           >
// //                             Editar
// //                           </Link>
// //                         </div>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))}
// //             </tbody>
// //           </table>
// //         </div>

// //         {/* Footer */}
// //         <div className="flex items-center justify-between px-4 py-3 border-t">
// //           <div className="text-sm text-gray-600">
// //             Total: <span className="font-medium">{total}</span>
// //           </div>

// //           <div className="flex items-center gap-3">
// //             <Paginator
// //               page={page}
// //               pages={pages}
// //               onPage={(p) =>
// //                 setSp(
// //                   (prev) => {
// //                     prev.set("page", String(p));
// //                     return prev;
// //                   },
// //                   { replace: true }
// //                 )
// //               }
// //             />

// //             <LimitSelect
// //               value={limit}
// //               onChange={(val) =>
// //                 setSp(
// //                   (prev) => {
// //                     prev.set("limit", String(val));
// //                     prev.set("page", "1");
// //                     return prev;
// //                   },
// //                   { replace: true }
// //                 )
// //               }
// //             />
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // front/src/pages/Repairs/List.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Reparaciones (Taller)
// // - Lista paginada (items/total/page/limit)
// // - Filtros: código + estado
// // - UI alineada al estándar FleetCore (FailureReports)
// // -----------------------------------------------------------------------------

// import { useEffect, useMemo, useState } from "react";
// import { Link, useSearchParams } from "react-router-dom";
// import { RepairsAPI } from "../../api/repairs.api";
// import Paginator from "../../components/table/Paginator";
// import LimitSelect from "../../components/table/LimitSelect";
// import vehicleTaxonomy from "../../data/fleetcore/vehicle-taxonomy.json";
// import repairTaxonomy from "../../data/fleetcore/repair-taxonomy.json";

// export default function RepairsList() {
//   const [sp, setSp] = useSearchParams();

//   const page = Number(sp.get("page") || 1);
//   const limit = Number(sp.get("limit") || 20);
//   const code = sp.get("code") || "";
//   const active = sp.get("active") ?? "";

//   const [loading, setLoading] = useState(false);
//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);

//   const systemsMap = useMemo(() => {
//     const m = new Map();
//     (vehicleTaxonomy?.systems || []).forEach((s) => m.set(s.key, s.label));
//     return m;
//   }, []);


//   const normalizeOptions = (opt) => {
//     // Opción B: [{ v, l }]
//     if (Array.isArray(opt) && opt.length && typeof opt[0] === "object") {
//       return opt
//         .filter(Boolean)
//         .map((o) => ({ v: String(o.v || ""), l: String(o.l || o.v || "") }))
//         .filter((o) => o.v);
//     }
//     // Opción A: ["X", "Y"] => label=value
//     if (Array.isArray(opt) && opt.length && typeof opt[0] === "string") {
//       return opt.map((v) => ({ v: String(v), l: String(v) }));
//     }
//     return [];
//   };

//   const typeLabelMap = useMemo(() => {
//     const m = new Map();
//     normalizeOptions(repairTaxonomy?.options?.types).forEach((o) =>
//       m.set(String(o.v).toUpperCase(), o.l)
//     );
//     return m;
//   }, []);

//   const severityLabelMap = useMemo(() => {
//     const m = new Map();
//     normalizeOptions(repairTaxonomy?.options?.severities).forEach((o) =>
//       m.set(String(o.v).toUpperCase(), o.l)
//     );
//     return m;
//   }, []);

//   const impactLabelMap = useMemo(() => {
//     const m = new Map();
//     normalizeOptions(repairTaxonomy?.options?.operationalImpacts).forEach((o) =>
//       m.set(String(o.v).toUpperCase(), o.l)
//     );
//     return m;
//   }, []);

//   const typeLabel = (it) => {
//     const raw = it?.type || it?.repairType || "";
//     const key = String(raw || "").trim().toUpperCase();
//     return typeLabelMap.get(key) || raw || "—";
//   };

//   const severityLabel = (it) => {
//     const raw = it?.severityDefault || it?.severity || "";
//     const key = String(raw || "").trim().toUpperCase();
//     return severityLabelMap.get(key) || raw || "—";
//   };

//   const impactLabel = (it) => {
//     const raw =
//       it?.operationalImpact ||
//       it?.operationalImpactDefault ||
//       it?.operationalImpactDefaultKey ||
//       "";
//     const key = String(raw || "").trim().toUpperCase();
//     return impactLabelMap.get(key) || raw || "—";
//   };

//   const rowIsActive = (it) => {
//     if (typeof it?.isActive === "boolean") return it.isActive;
//     if (typeof it?.active === "boolean") return it.active;
//     return true;
//   };

//   const load = async () => {
//     setLoading(true);
//     try {
//       const { data } = await RepairsAPI.list({ page, limit, q: code, active });
//       setItems(data?.items || []);
//       setTotal(Number(data?.total || 0));
//     } catch (err) {
//       console.error(err);
//       alert(err?.response?.data?.message || "No fue posible cargar el catálogo");
//       setItems([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [page, limit, code, active]); // eslint-disable-line react-hooks/exhaustive-deps

//   const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

//   const sortedItems = useMemo(() => {
//     const arr = Array.isArray(items) ? [...items] : [];
//     arr.sort((a, b) => {
//       const ac = String(a?.code || "").trim().toUpperCase();
//       const bc = String(b?.code || "").trim().toUpperCase();
//       return ac.localeCompare(bc, "es", { numeric: true });
//     });
//     return arr;
//   }, [items]);

//   return (
//     <div className="p-4 sm:p-6 space-y-6">
//       {/* Franja superior */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//         <div>
//           <h1 className="text-xl font-bold">Catálogo · Reparaciones</h1>
//           <p className="text-gray-500 text-sm">
//             Estándares técnicos para OT, KPI y análisis de costos/fallas.
//           </p>
//         </div>

//         {/* TODO EN UNA LÍNEA (código + estado + nuevo) */}
//         <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
//           <input
//             className="border rounded-md px-3 py-2 text-sm w-full sm:w-56"
//             placeholder="Buscar por código"
//             value={code}
//             onChange={(e) =>
//               setSp(
//                 (prev) => {
//                   const v = e.target.value;
//                   if (v) prev.set("code", v);
//                   else prev.delete("code");
//                   prev.set("page", "1");
//                   return prev;
//                 },
//                 { replace: true }
//               )
//             }
//           />

//           <select
//             className="border rounded-md px-3 py-2 text-sm w-full sm:w-44"
//             value={active}
//             onChange={(e) =>
//               setSp(
//                 (prev) => {
//                   const v = e.target.value;
//                   if (v !== "") prev.set("active", v);
//                   else prev.delete("active");
//                   prev.set("page", "1");
//                   return prev;
//                 },
//                 { replace: true }
//               )
//             }
//           >
//             <option value="">Activo (todos)</option>
//             <option value="true">Activos</option>
//             <option value="false">Inactivos</option>
//           </select>

//           <Link
//             className="px-5 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white whitespace-nowrap w-full sm:w-auto text-center"
//             to="/config/catalogs/repairs/new"
//           >
//             Nueva reparación
//           </Link>
//         </div>
//       </div>

//       {/* Tabla */}
//       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-[1100px] w-full text-sm">
//             <thead className="bg-gray-50 text-gray-600">
//               <tr>
//                 <th className="text-left px-4 py-2">Código</th>
//                 <th className="text-left px-4 py-2">Nombre</th>
//                 <th className="text-left px-4 py-2">Sistema</th>
//                 <th className="text-left px-4 py-2">Tipo</th>
//                 <th className="text-left px-4 py-2">Severidad</th>
//                 <th className="text-left px-4 py-2">Impacto</th>
//                 <th className="text-left px-4 py-2">Std (min)</th>
//                 <th className="text-left px-4 py-2">Activo</th>
//                 <th className="text-right px-4 py-2">Acciones</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading && (
//                 <tr>
//                   <td colSpan={9} className="px-4 py-6 text-gray-500">
//                     Cargando…
//                   </td>
//                 </tr>
//               )}

//               {!loading && !sortedItems.length && (
//                 <tr>
//                   <td colSpan={9} className="px-4 py-6 text-gray-500">
//                     Sin resultados
//                   </td>
//                 </tr>
//               )}

//               {!loading &&
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
//                       {typeLabel(it)}
//                     </td>
//                     <td className="px-4 py-2">{severityLabel(it)}</td>
//                     <td className="px-4 py-2">{impactLabel(it)}</td>
//                     <td className="px-4 py-2">
//                       {Number(it.standardLaborMinutes || 0)}
//                     </td>
//                     <td className="px-4 py-2">{rowIsActive(it) ? "Sí" : "No"}</td>

//                     <td className="px-4 py-2">
//                       <div className="flex justify-end">
//                         <div className="inline-flex items-center gap-2">
//                           <Link
//                             className="border border-[var(--fc-primary)] text-[var(--fc-primary)] rounded-md px-4 py-1.5 text-sm hover:bg-[color:var(--fc-primary)] hover:text-white"
//                             to={`/config/catalogs/repairs/${it._id}?mode=view`}
//                           >
//                             Ver
//                           </Link>
//                           <Link
//                             className="border border-[var(--fc-primary)] text-[var(--fc-primary)] rounded-md px-4 py-1.5 text-sm hover:bg-[color:var(--fc-primary)] hover:text-white"
//                             to={`/config/catalogs/repairs/${it._id}`}
//                           >
//                             Editar
//                           </Link>
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
//                   { replace: true }
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
//                   { replace: true }
//                 )
//               }
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// front/src/pages/Repairs/List.jsx
// -----------------------------------------------------------------------------
// Catálogo → Reparaciones (Taller)
// - Lista paginada (items/total/page/limit)
// - Filtros: código + estado
// - UI alineada al estándar FleetCore (FailureReports)
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RepairsAPI } from "../../api/repairs.api";
import Paginator from "../../components/table/Paginator";
import LimitSelect from "../../components/table/LimitSelect";
import vehicleTaxonomy from "../../data/fleetcore/vehicle-taxonomy.json";
import repairTaxonomy from "../../data/fleetcore/repair-taxonomy.json";

export default function RepairsList() {
  const [sp, setSp] = useSearchParams();

  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 20);
  const code = sp.get("code") || "";
  const active = sp.get("active") ?? "";

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const systemsMap = useMemo(() => {
    const m = new Map();
    (vehicleTaxonomy?.systems || []).forEach((s) => m.set(s.key, s.label));
    return m;
  }, []);


  const normalizeOptions = (opt) => {
    // Opción B: [{ v, l }]
    if (Array.isArray(opt) && opt.length && typeof opt[0] === "object") {
      return opt
        .filter(Boolean)
        .map((o) => ({ v: String(o.v || ""), l: String(o.l || o.v || "") }))
        .filter((o) => o.v);
    }
    // Opción A: ["X", "Y"] => label=value
    if (Array.isArray(opt) && opt.length && typeof opt[0] === "string") {
      return opt.map((v) => ({ v: String(v), l: String(v) }));
    }
    return [];
  };

  const typeLabelMap = useMemo(() => {
    const m = new Map();
    normalizeOptions(repairTaxonomy?.options?.types).forEach((o) =>
      m.set(String(o.v).toUpperCase(), o.l)
    );
    return m;
  }, []);

  const severityLabelMap = useMemo(() => {
    const m = new Map();
    normalizeOptions(repairTaxonomy?.options?.severities).forEach((o) =>
      m.set(String(o.v).toUpperCase(), o.l)
    );
    return m;
  }, []);

  const impactLabelMap = useMemo(() => {
    const m = new Map();
    normalizeOptions(repairTaxonomy?.options?.operationalImpacts).forEach((o) =>
      m.set(String(o.v).toUpperCase(), o.l)
    );
    return m;
  }, []);

  const typeLabel = (it) => {
    const raw = it?.type || it?.repairType || "";
    const key = String(raw || "").trim().toUpperCase();
    return typeLabelMap.get(key) || raw || "—";
  };

  const severityLabel = (it) => {
    const raw = it?.severityDefault || it?.severity || "";
    const key = String(raw || "").trim().toUpperCase();
    return severityLabelMap.get(key) || raw || "—";
  };

  const impactLabel = (it) => {
    const raw =
      it?.operationalImpact ||
      it?.operationalImpactDefault ||
      it?.operationalImpactDefaultKey ||
      "";
    const key = String(raw || "").trim().toUpperCase();
    return impactLabelMap.get(key) || raw || "—";
  };

  const rowIsActive = (it) => {
    if (typeof it?.isActive === "boolean") return it.isActive;
    if (typeof it?.active === "boolean") return it.active;
    return true;
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await RepairsAPI.list({ page, limit, q: code, active });
      setItems(data?.items || []);
      setTotal(Number(data?.total || 0));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "No fue posible cargar el catálogo");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, limit, code, active]); // eslint-disable-line react-hooks/exhaustive-deps

  const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

  const sortedItems = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];
    arr.sort((a, b) => {
      const ac = String(a?.code || "").trim().toUpperCase();
      const bc = String(b?.code || "").trim().toUpperCase();
      return ac.localeCompare(bc, "es", { numeric: true });
    });
    return arr;
  }, [items]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Franja superior */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Catálogo · Reparaciones</h1>
          <p className="text-gray-500 text-sm">
            Estándares técnicos para OT, KPI y análisis de costos/fallas.
          </p>
        </div>

        {/* TODO EN UNA LÍNEA (código + estado + nuevo) */}
        <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            className="border rounded-md px-3 py-2 text-sm w-full sm:w-56"
            placeholder="Buscar por código"
            value={code}
            onChange={(e) =>
              setSp(
                (prev) => {
                  const v = e.target.value;
                  if (v) prev.set("code", v);
                  else prev.delete("code");
                  prev.set("page", "1");
                  return prev;
                },
                { replace: true }
              )
            }
          />

          <select
            className="border rounded-md px-3 py-2 text-sm w-full sm:w-44"
            value={active}
            onChange={(e) =>
              setSp(
                (prev) => {
                  const v = e.target.value;
                  if (v !== "") prev.set("active", v);
                  else prev.delete("active");
                  prev.set("page", "1");
                  return prev;
                },
                { replace: true }
              )
            }
          >
            <option value="">Activo (todos)</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <Link
            className="px-5 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white whitespace-nowrap w-full sm:w-auto text-center"
            to="/config/catalogs/repairs/new"
          >
            Nueva reparación
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">Código</th>
                <th className="text-left px-4 py-2">Nombre</th>
                <th className="text-left px-4 py-2">Sistema</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Severidad</th>
                <th className="text-left px-4 py-2">Impacto</th>
                <th className="text-left px-4 py-2">Std (min)</th>
                <th className="text-left px-4 py-2">Activo</th>
                <th className="text-right px-4 py-2">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-gray-500">
                    Cargando…
                  </td>
                </tr>
              )}

              {!loading && !sortedItems.length && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-gray-500">
                    Sin resultados
                  </td>
                </tr>
              )}

              {!loading &&
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
                      {typeLabel(it)}
                    </td>
                    <td className="px-4 py-2">{severityLabel(it)}</td>
                    <td className="px-4 py-2">{impactLabel(it)}</td>
                    <td className="px-4 py-2">
                      {Number(it.standardLaborMinutes || 0)}
                    </td>
                    <td className="px-4 py-2">{rowIsActive(it) ? "Sí" : "No"}</td>

                    <td className="px-4 py-2">
                      <div className="flex justify-end">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            className="border border-[var(--fc-primary)] text-[var(--fc-primary)] rounded-md px-4 py-1.5 text-sm hover:bg-[color:var(--fc-primary)] hover:text-white"
                            to={`/config/catalogs/repairs/${it._id}?mode=view`}
                          >
                            Ver
                          </Link>
                          <Link
                            className="border border-[var(--fc-primary)] text-[var(--fc-primary)] rounded-md px-4 py-1.5 text-sm hover:bg-[color:var(--fc-primary)] hover:text-white"
                            to={`/config/catalogs/repairs/${it._id}`}
                          >
                            Editar
                          </Link>
                        </div>
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

          <div className="flex items-center gap-3">
            <Paginator
              page={page}
              pages={pages}
              onPage={(p) =>
                setSp(
                  (prev) => {
                    prev.set("page", String(p));
                    return prev;
                  },
                  { replace: true }
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
                  { replace: true }
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
