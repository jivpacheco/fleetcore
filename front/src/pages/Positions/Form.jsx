// // // // // front/src/pages/Positions/Form.jsx
// // // // // -----------------------------------------------------------------------------
// // // // // Catálogo → Cargos (Positions) (FleetCore Standard v1.0)
// // // // // - Modo Ver: ?mode=view
// // // // // - UnsavedChangesGuard desde hooks
// // // // // -----------------------------------------------------------------------------
// // // // import { useEffect, useMemo, useState } from "react";
// // // // import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
// // // // import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// // // // import { PositionsAPI } from "../../api/positions.api";

// // // // function pickItemFromList(data, id) {
// // // //     const list = Array.isArray(data?.items) ? data.items : Array.isArray(data?.result?.items) ? data.result.items : Array.isArray(data) ? data : [];
// // // //     return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
// // // // }

// // // // export default function PositionsForm() {
// // // //     const navigate = useNavigate();
// // // //     const { id } = useParams();
// // // //     const [sp] = useSearchParams();
// // // //     const isView = sp.get("mode") === "view";

// // // //     const isEdit = Boolean(id);
// // // //     const title = useMemo(() => {
// // // //         if (isEdit && isView) return "Ver cargo";
// // // //         if (isEdit) return "Editar cargo";
// // // //         return "Nuevo cargo";
// // // //     }, [isEdit, isView]);

// // // //     const [loading, setLoading] = useState(false);
// // // //     const [saving, setSaving] = useState(false);
// // // //     const [form, setForm] = useState({ name: "", description: "", active: true });
// // // //     const [initial, setInitial] = useState(null);

// // // //     const dirty = JSON.stringify(form) !== JSON.stringify(initial || { name: "", description: "", active: true });
// // // //     UnsavedChangesGuard(dirty);

// // // //     const load = async () => {
// // // //         if (!id) {
// // // //             const init = { name: "", description: "", active: true };
// // // //             setForm(init);
// // // //             setInitial(init);
// // // //             return;
// // // //         }
// // // //         setLoading(true);
// // // //         try {
// // // //             let item = null;
// // // //             if (typeof PositionsAPI.get === "function") item = await PositionsAPI.get(id);
// // // //             if (!item) {
// // // //                 const { data } = await PositionsAPI.list({ q: "", limit: 500 });
// // // //                 item = pickItemFromList(data, id);
// // // //             }
// // // //             if (!item) throw new Error("not found");
// // // //             const next = {
// // // //                 name: item?.name || "",
// // // //                 description: item?.description || "",
// // // //                 active: typeof item?.active === "boolean" ? item.active : typeof item?.isActive === "boolean" ? item.isActive : true,
// // // //             };
// // // //             setForm(next);
// // // //             setInitial(next);
// // // //         } catch (e) {
// // // //             console.error(e);
// // // //             alert("No se pudo cargar el cargo.");
// // // //             navigate(-1);
// // // //         } finally {
// // // //             setLoading(false);
// // // //         }
// // // //     };

// // // //     useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

// // // //     const onSubmit = async (e) => {
// // // //         e.preventDefault();
// // // //         if (isView) return;
// // // //         if (!form.name.trim()) {
// // // //             alert("Nombre es obligatorio.");
// // // //             return;
// // // //         }
// // // //         setSaving(true);
// // // //         try {
// // // //             if (id) await PositionsAPI.update(id, form);
// // // //             else await PositionsAPI.create(form);
// // // //             navigate("/config/catalogs/positions");
// // // //         } catch (e) {
// // // //             console.error(e);
// // // //             alert("No se pudo guardar. Revisa la consola.");
// // // //         } finally {
// // // //             setSaving(false);
// // // //         }
// // // //     };

// // // //     return (
// // // //         <div className="p-6 space-y-6">
// // // //             <div className="flex items-start justify-between gap-3 flex-wrap">
// // // //                 <div>
// // // //                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
// // // //                     <p className="text-gray-500 text-sm">{title}.</p>
// // // //                 </div>

// // // //                 <div className="flex items-center gap-2">
// // // //                     <Link className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" to="/config/catalogs/positions">
// // // //                         Volver
// // // //                     </Link>
// // // //                     {!isView && (
// // // //                         <button
// // // //                             type="submit"
// // // //                             form="posForm"
// // // //                             className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
// // // //                             disabled={saving}
// // // //                         >
// // // //                             {saving ? "Guardando…" : id ? "Guardar" : "Crear"}
// // // //                         </button>
// // // //                     )}
// // // //                 </div>
// // // //             </div>

// // // //             <div className="bg-white border rounded-2xl p-6">
// // // //                 {loading ? (
// // // //                     <div className="text-gray-500">Cargando…</div>
// // // //                 ) : (
// // // //                     <form id="posForm" onSubmit={onSubmit} className="space-y-4">
// // // //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // //                             <div className="md:col-span-2">
// // // //                                 <label className="block text-sm font-medium mb-1">Nombre *</label>
// // // //                                 <input
// // // //                                     className="border rounded-md px-3 py-2 w-full"
// // // //                                     value={form.name}
// // // //                                     disabled={isView}
// // // //                                     onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
// // // //                                 />
// // // //                             </div>

// // // //                             <div className="md:col-span-2">
// // // //                                 <label className="block text-sm font-medium mb-1">Descripción</label>
// // // //                                 <textarea
// // // //                                     className="border rounded-md px-3 py-2 w-full min-h-[90px]"
// // // //                                     value={form.description}
// // // //                                     disabled={isView}
// // // //                                     onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
// // // //                                 />
// // // //                             </div>
// // // //                         </div>

// // // //                         <label className="inline-flex items-center gap-2 text-sm">
// // // //                             <input
// // // //                                 type="checkbox"
// // // //                                 checked={Boolean(form.active)}
// // // //                                 disabled={isView}
// // // //                                 onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
// // // //                             />
// // // //                             Activo
// // // //                         </label>
// // // //                     </form>
// // // //                 )}
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // }

// // // // front/src/pages/Positions/Form.jsx
// // // // -----------------------------------------------------------------------------
// // // // Catálogo → Cargos (Positions) (FleetCore Templates v1.0)
// // // // - Modo Ver: ?mode=view
// // // // - Guard de cambios: UnsavedChangesGuard
// // // // - Carga: PositionsAPI.get(id) o fallback a list()
// // // // -----------------------------------------------------------------------------

// // // import { useCallback, useEffect, useMemo, useState } from "react";
// // // import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
// // // import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// // // import { PositionsAPI } from "../../api/positions.api";

// // // const EMPTY = { name: "", description: "", active: true };

// // // function pickItems(data) {
// // //     if (!data) return [];
// // //     if (Array.isArray(data)) return data;
// // //     if (Array.isArray(data.items)) return data.items;
// // //     if (Array.isArray(data.result?.items)) return data.result.items;
// // //     if (Array.isArray(data.data?.items)) return data.data.items;
// // //     if (Array.isArray(data.data)) return data.data;
// // //     return [];
// // // }

// // // function pickOneFromList(data, id) {
// // //     const list = pickItems(data);
// // //     return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
// // // }

// // // function normalizeItem(item) {
// // //     return {
// // //         name: item?.name || "",
// // //         description: item?.description || "",
// // //         active:
// // //             typeof item?.active === "boolean"
// // //                 ? item.active
// // //                 : typeof item?.isActive === "boolean"
// // //                     ? item.isActive
// // //                     : true,
// // //     };
// // // }

// // // function isDirty(a, b) {
// // //     // Comparación controlada (evita JSON.stringify con objetos grandes y orden de keys)
// // //     const aa = a || EMPTY;
// // //     const bb = b || EMPTY;
// // //     return (
// // //         String(aa.name || "") !== String(bb.name || "") ||
// // //         String(aa.description || "") !== String(bb.description || "") ||
// // //         Boolean(aa.active) !== Boolean(bb.active)
// // //     );
// // // }

// // // export default function PositionsForm() {
// // //     const navigate = useNavigate();
// // //     const { id } = useParams();
// // //     const [sp] = useSearchParams();

// // //     const isEdit = Boolean(id);
// // //     const isView = sp.get("mode") === "view";

// // //     const title = useMemo(() => {
// // //         if (isEdit && isView) return "Ver cargo";
// // //         if (isEdit) return "Editar cargo";
// // //         return "Nuevo cargo";
// // //     }, [isEdit, isView]);

// // //     const [loading, setLoading] = useState(false);
// // //     const [saving, setSaving] = useState(false);

// // //     const [form, setForm] = useState(EMPTY);
// // //     const [initial, setInitial] = useState(EMPTY);

// // //     const dirty = useMemo(() => isDirty(form, initial), [form, initial]);
// // //     UnsavedChangesGuard(dirty);

// // //     const load = useCallback(async () => {
// // //         if (!id) {
// // //             setForm(EMPTY);
// // //             setInitial(EMPTY);
// // //             return;
// // //         }

// // //         setLoading(true);
// // //         try {
// // //             let item = null;

// // //             // Prefer: endpoint de detalle
// // //             if (typeof PositionsAPI.get === "function") {
// // //                 item = await PositionsAPI.get(id);
// // //             }

// // //             // Fallback: traer lista grande y buscar por id
// // //             if (!item) {
// // //                 const { data } = await PositionsAPI.list({ q: "", limit: 500 });
// // //                 item = pickOneFromList(data, id);
// // //             }

// // //             if (!item) throw new Error("not found");

// // //             const next = normalizeItem(item);
// // //             setForm(next);
// // //             setInitial(next);
// // //         } catch (err) {
// // //             console.error(err);
// // //             alert("No se pudo cargar el cargo.");
// // //             navigate(-1);
// // //         } finally {
// // //             setLoading(false);
// // //         }
// // //     }, [id, navigate]);

// // //     useEffect(() => {
// // //         load();
// // //     }, [load]);

// // //     const setField = (key) => (e) => {
// // //         const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
// // //         setForm((s) => ({ ...s, [key]: value }));
// // //     };

// // //     const onSubmit = async (e) => {
// // //         e.preventDefault();
// // //         if (isView) return;

// // //         const name = String(form?.name || "").trim();
// // //         if (!name) {
// // //             alert("Nombre es obligatorio.");
// // //             return;
// // //         }

// // //         setSaving(true);
// // //         try {
// // //             const payload = { ...form, name };

// // //             if (id) await PositionsAPI.update(id, payload);
// // //             else await PositionsAPI.create(payload);

// // //             navigate("/config/catalogs/positions");
// // //         } catch (err) {
// // //             console.error(err);
// // //             alert("No se pudo guardar. Revisa la consola.");
// // //         } finally {
// // //             setSaving(false);
// // //         }
// // //     };

// // //     return (
// // //         <div className="p-6 space-y-6">
// // //             {/* Header estándar */}
// // //             <div className="flex items-start justify-between gap-3 flex-wrap">
// // //                 <div>
// // //                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
// // //                     <p className="text-gray-500 text-sm">{title}.</p>
// // //                 </div>

// // //                 <div className="flex items-center gap-2">
// // //                     <Link
// // //                         className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
// // //                         to="/config/catalogs/positions"
// // //                     >
// // //                         Volver
// // //                     </Link>

// // //                     {!isView && (
// // //                         <button
// // //                             type="submit"
// // //                             form="posForm"
// // //                             className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
// // //                             disabled={saving || loading}
// // //                             title={dirty ? "Guardar cambios" : "Sin cambios"}
// // //                         >
// // //                             {saving ? "Guardando…" : isEdit ? "Guardar" : "Crear"}
// // //                         </button>
// // //                     )}
// // //                 </div>
// // //             </div>

// // //             <div className="bg-white border rounded-2xl p-6">
// // //                 {loading ? (
// // //                     <div className="text-gray-500">Cargando…</div>
// // //                 ) : (
// // //                     <form id="posForm" onSubmit={onSubmit} className="space-y-4">
// // //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //                             <div className="md:col-span-2">
// // //                                 <label className="block text-sm font-medium mb-1">Nombre *</label>
// // //                                 <input
// // //                                     className="border rounded-md px-3 py-2 w-full"
// // //                                     value={form.name}
// // //                                     disabled={isView}
// // //                                     onChange={setField("name")}
// // //                                 />
// // //                             </div>

// // //                             <div className="md:col-span-2">
// // //                                 <label className="block text-sm font-medium mb-1">Descripción</label>
// // //                                 <textarea
// // //                                     className="border rounded-md px-3 py-2 w-full min-h-[90px]"
// // //                                     value={form.description}
// // //                                     disabled={isView}
// // //                                     onChange={setField("description")}
// // //                                 />
// // //                             </div>
// // //                         </div>

// // //                         <label className="inline-flex items-center gap-2 text-sm">
// // //                             <input
// // //                                 type="checkbox"
// // //                                 checked={Boolean(form.active)}
// // //                                 disabled={isView}
// // //                                 onChange={setField("active")}
// // //                             />
// // //                             Activo
// // //                         </label>
// // //                     </form>
// // //                 )}
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // // // /// 060226 eliminar
// // // // // front/src/pages/Positions/Form.jsx
// // // // // -----------------------------------------------------------------------------
// // // // // Catálogo → Cargos (Positions) (FleetCore Standard v1.0)
// // // // // - Modo Ver: ?mode=view
// // // // // - UnsavedChangesGuard desde hooks
// // // // // -----------------------------------------------------------------------------
// // // // import { useCallback, useEffect, useMemo, useState } from "react";
// // // // import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
// // // // import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// // // // import { PositionsAPI } from "../../api/positions.api";

// // // // const EMPTY = { name: "", description: "", active: true };

// // // // function pickItemFromList(data, id) {
// // // //     const list = Array.isArray(data?.items)
// // // //         ? data.items
// // // //         : Array.isArray(data?.result?.items)
// // // //             ? data.result.items
// // // //             : Array.isArray(data)
// // // //                 ? data
// // // //                 : [];
// // // //     return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
// // // // }

// // // // function normalizeItem(item) {
// // // //     return {
// // // //         name: item?.name || "",
// // // //         description: item?.description || "",
// // // //         active:
// // // //             typeof item?.active === "boolean"
// // // //                 ? item.active
// // // //                 : typeof item?.isActive === "boolean"
// // // //                     ? item.isActive
// // // //                     : true,
// // // //     };
// // // // }

// // // // function isDirty(a, b) {
// // // //     const aa = a || EMPTY;
// // // //     const bb = b || EMPTY;
// // // //     return (
// // // //         String(aa.name || "") !== String(bb.name || "") ||
// // // //         String(aa.description || "") !== String(bb.description || "") ||
// // // //         Boolean(aa.active) !== Boolean(bb.active)
// // // //     );
// // // // }

// // // // export default function PositionsForm() {
// // // //     const navigate = useNavigate();
// // // //     const { id } = useParams();
// // // //     const [sp] = useSearchParams();
// // // //     const isView = sp.get("mode") === "view";

// // // //     const isEdit = Boolean(id);
// // // //     const title = useMemo(() => {
// // // //         if (isEdit && isView) return "Ver cargo";
// // // //         if (isEdit) return "Editar cargo";
// // // //         return "Nuevo cargo";
// // // //     }, [isEdit, isView]);

// // // //     const [loading, setLoading] = useState(false);
// // // //     const [saving, setSaving] = useState(false);
// // // //     const [form, setForm] = useState(EMPTY);
// // // //     const [initial, setInitial] = useState(EMPTY);

// // // //     const dirty = useMemo(() => isDirty(form, initial), [form, initial]);
// // // //     UnsavedChangesGuard(dirty);

// // // //     const load = useCallback(async () => {
// // // //         if (!id) {
// // // //             setForm(EMPTY);
// // // //             setInitial(EMPTY);
// // // //             return;
// // // //         }

// // // //         setLoading(true);
// // // //         try {
// // // //             let item = null;

// // // //             if (typeof PositionsAPI.get === "function") {
// // // //                 item = await PositionsAPI.get(id);
// // // //             }

// // // //             if (!item) {
// // // //                 const { data } = await PositionsAPI.list({ q: "", limit: 500 });
// // // //                 item = pickItemFromList(data, id);
// // // //             }

// // // //             if (!item) throw new Error("not found");

// // // //             const next = normalizeItem(item);
// // // //             setForm(next);
// // // //             setInitial(next);
// // // //         } catch (e) {
// // // //             console.error(e);
// // // //             alert("No se pudo cargar el cargo.");
// // // //             navigate(-1);
// // // //         } finally {
// // // //             setLoading(false);
// // // //         }
// // // //     }, [id, navigate]);

// // // //     useEffect(() => {
// // // //         load();
// // // //     }, [load]);

// // // //     const onSubmit = async (e) => {
// // // //         e.preventDefault();
// // // //         if (isView) return;

// // // //         const name = String(form.name || "").trim();
// // // //         if (!name) {
// // // //             alert("Nombre es obligatorio.");
// // // //             return;
// // // //         }

// // // //         setSaving(true);
// // // //         try {
// // // //             const payload = { ...form, name };

// // // //             if (id) await PositionsAPI.update(id, payload);
// // // //             else await PositionsAPI.create(payload);

// // // //             navigate("/config/catalogs/positions");
// // // //         } catch (e) {
// // // //             console.error(e);
// // // //             alert("No se pudo guardar. Revisa la consola.");
// // // //         } finally {
// // // //             setSaving(false);
// // // //         }
// // // //     };

// // // //     return (
// // // //         <div className="p-6 space-y-6">
// // // //             <div className="flex items-start justify-between gap-3 flex-wrap">
// // // //                 <div>
// // // //                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
// // // //                     <p className="text-gray-500 text-sm">{title}.</p>
// // // //                 </div>

// // // //                 <div className="flex items-center gap-2">
// // // //                     <Link
// // // //                         className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
// // // //                         to="/config/catalogs/positions"
// // // //                     >
// // // //                         Volver
// // // //                     </Link>

// // // //                     {!isView && (
// // // //                         <button
// // // //                             type="submit"
// // // //                             form="posForm"
// // // //                             className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
// // // //                             disabled={saving || loading}
// // // //                         >
// // // //                             {saving ? "Guardando…" : id ? "Guardar" : "Crear"}
// // // //                         </button>
// // // //                     )}
// // // //                 </div>
// // // //             </div>

// // // //             <div className="bg-white border rounded-2xl p-6">
// // // //                 {loading ? (
// // // //                     <div className="text-gray-500">Cargando…</div>
// // // //                 ) : (
// // // //                     <form id="posForm" onSubmit={onSubmit} className="space-y-4">
// // // //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // //                             <div className="md:col-span-2">
// // // //                                 <label className="block text-sm font-medium mb-1">Nombre *</label>
// // // //                                 <input
// // // //                                     className="border rounded-md px-3 py-2 w-full"
// // // //                                     value={form.name}
// // // //                                     disabled={isView}
// // // //                                     onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
// // // //                                 />
// // // //                             </div>

// // // //                             <div className="md:col-span-2">
// // // //                                 <label className="block text-sm font-medium mb-1">Descripción</label>
// // // //                                 <textarea
// // // //                                     className="border rounded-md px-3 py-2 w-full min-h-[90px]"
// // // //                                     value={form.description}
// // // //                                     disabled={isView}
// // // //                                     onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
// // // //                                 />
// // // //                             </div>
// // // //                         </div>

// // // //                         <label className="inline-flex items-center gap-2 text-sm">
// // // //                             <input
// // // //                                 type="checkbox"
// // // //                                 checked={Boolean(form.active)}
// // // //                                 disabled={isView}
// // // //                                 onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
// // // //                             />
// // // //                             Activo
// // // //                         </label>
// // // //                     </form>
// // // //                 )}
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // }

// // // front/src/pages/Positions/Form.jsx
// // // -----------------------------------------------------------------------------
// // // Catálogo → Cargos (Positions) (FleetCore Templates v1.0)
// // // - Patrón estándar: PageHeader + TableCard + UnsavedChangesGuard
// // // - Modo Ver: ?mode=view
// // // - Negocio intacto: get(id) o fallback list(), create/update, redirect
// // // -----------------------------------------------------------------------------

// // import { useCallback, useEffect, useMemo, useState } from "react";
// // import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

// // import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// // import { PositionsAPI } from "../../api/positions.api";

// // import PageHeader from "../../components/fc/PageHeader";
// // import TableCard from "../../components/fc/TableCard";

// // const EMPTY = { name: "", description: "", active: true };

// // function pickItemFromList(data, id) {
// //   const list = Array.isArray(data?.items)
// //     ? data.items
// //     : Array.isArray(data?.result?.items)
// //       ? data.result.items
// //       : Array.isArray(data)
// //         ? data
// //         : [];
// //   return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
// // }

// // function normalizeItem(item) {
// //   return {
// //     name: item?.name || "",
// //     description: item?.description || "",
// //     active:
// //       typeof item?.active === "boolean"
// //         ? item.active
// //         : typeof item?.isActive === "boolean"
// //           ? item.isActive
// //           : true,
// //   };
// // }

// // function isDirty(a, b) {
// //   const aa = a || EMPTY;
// //   const bb = b || EMPTY;
// //   return (
// //     String(aa.name || "") !== String(bb.name || "") ||
// //     String(aa.description || "") !== String(bb.description || "") ||
// //     Boolean(aa.active) !== Boolean(bb.active)
// //   );
// // }

// // export default function PositionsForm() {
// //   const navigate = useNavigate();
// //   const { id } = useParams();
// //   const [sp] = useSearchParams();

// //   const isView = sp.get("mode") === "view";
// //   const isEdit = Boolean(id);

// //   const title = useMemo(() => {
// //     if (isEdit && isView) return "Ver cargo";
// //     if (isEdit) return "Editar cargo";
// //     return "Nuevo cargo";
// //   }, [isEdit, isView]);

// //   const [loading, setLoading] = useState(false);
// //   const [saving, setSaving] = useState(false);
// //   const [form, setForm] = useState(EMPTY);
// //   const [initial, setInitial] = useState(EMPTY);

// //   const dirty = useMemo(() => isDirty(form, initial), [form, initial]);
// //   UnsavedChangesGuard(dirty);

// //   const load = useCallback(async () => {
// //     if (!id) {
// //       setForm(EMPTY);
// //       setInitial(EMPTY);
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       let item = null;

// //       if (typeof PositionsAPI.get === "function") item = await PositionsAPI.get(id);

// //       if (!item) {
// //         const { data } = await PositionsAPI.list({ q: "", limit: 500 });
// //         item = pickItemFromList(data, id);
// //       }

// //       if (!item) throw new Error("not found");

// //       const next = normalizeItem(item);
// //       setForm(next);
// //       setInitial(next);
// //     } catch (e) {
// //       console.error(e);
// //       alert("No se pudo cargar el cargo.");
// //       navigate(-1);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [id, navigate]);

// //   useEffect(() => {
// //     load();
// //   }, [load]);

// //   const onSubmit = async (e) => {
// //     e.preventDefault();
// //     if (isView) return;

// //     const name = String(form?.name || "").trim();
// //     if (!name) {
// //       alert("Nombre es obligatorio.");
// //       return;
// //     }

// //     setSaving(true);
// //     try {
// //       const payload = { ...form, name };

// //       if (id) await PositionsAPI.update(id, payload);
// //       else await PositionsAPI.create(payload);

// //       navigate("/config/catalogs/positions");
// //     } catch (e) {
// //       console.error(e);
// //       alert("No se pudo guardar. Revisa la consola.");
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   return (
// //     <div className="p-6 space-y-6">
// //       <PageHeader
// //         title="Catálogo · Cargos"
// //         subtitle={`${title}.`}
// //         actions={
// //           <div className="flex items-center gap-2">
// //             <Link
// //               className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
// //               to="/config/catalogs/positions"
// //             >
// //               Volver
// //             </Link>

// //             {!isView && (
// //               <button
// //                 type="submit"
// //                 form="posForm"
// //                 className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
// //                 disabled={saving || loading}
// //               >
// //                 {saving ? "Guardando…" : id ? "Guardar" : "Crear"}
// //               </button>
// //             )}
// //           </div>
// //         }
// //       />

// //       <TableCard>
// //         {loading ? (
// //           <TableCard.Loading text="Cargando…" />
// //         ) : (
// //           <form id="posForm" onSubmit={onSubmit} className="space-y-4 p-6">
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="md:col-span-2">
// //                 <label className="block text-sm font-medium mb-1">Nombre *</label>
// //                 <input
// //                   className="border rounded-md px-3 py-2 w-full"
// //                   value={form.name}
// //                   disabled={isView}
// //                   onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
// //                 />
// //               </div>

// //               <div className="md:col-span-2">
// //                 <label className="block text-sm font-medium mb-1">Descripción</label>
// //                 <textarea
// //                   className="border rounded-md px-3 py-2 w-full min-h-[90px]"
// //                   value={form.description}
// //                   disabled={isView}
// //                   onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
// //                 />
// //               </div>
// //             </div>

// //             <label className="inline-flex items-center gap-2 text-sm">
// //               <input
// //                 type="checkbox"
// //                 checked={Boolean(form.active)}
// //                 disabled={isView}
// //                 onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
// //               />
// //               Activo
// //             </label>
// //           </form>
// //         )}
// //       </TableCard>
// //     </div>
// //   );
// // }

// // front/src/pages/Positions/Form.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Cargos (Positions)
// // Patrón estable (basado en VehicleStatuses/Form):
// // - Modo Ver: ?mode=view
// // - UnsavedChangesGuard
// // - negocio intacto: get/fallback list, create/update, redirect
// // -----------------------------------------------------------------------------

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   Link,
//   useNavigate,
//   useParams,
//   useSearchParams,
// } from "react-router-dom";
// import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// import { PositionsAPI } from "../../api/positions.api";

// const EMPTY = { name: "", description: "", active: true };

// function pickItemFromList(data, id) {
//   const list = Array.isArray(data?.items)
//     ? data.items
//     : Array.isArray(data?.result?.items)
//       ? data.result.items
//       : Array.isArray(data)
//         ? data
//         : [];
//   return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
// }

// function normalizeItem(item) {
//   return {
//     name: item?.name || "",
//     description: item?.description || "",
//     active:
//       typeof item?.active === "boolean"
//         ? item.active
//         : typeof item?.isActive === "boolean"
//           ? item.isActive
//           : true,
//   };
// }

// function isDirty(a, b) {
//   const aa = a || EMPTY;
//   const bb = b || EMPTY;
//   return (
//     String(aa.name || "") !== String(bb.name || "") ||
//     String(aa.description || "") !== String(bb.description || "") ||
//     Boolean(aa.active) !== Boolean(bb.active)
//   );
// }

// export default function PositionsForm() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [sp] = useSearchParams();
//   const isView = sp.get("mode") === "view";

//   const isEdit = Boolean(id);
//   const title = useMemo(() => {
//     if (isEdit && isView) return "Ver cargo";
//     if (isEdit) return "Editar cargo";
//     return "Nuevo cargo";
//   }, [isEdit, isView]);

//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState(EMPTY);
//   const [initial, setInitial] = useState(EMPTY);

//   const dirty = useMemo(() => isDirty(form, initial), [form, initial]);
//   UnsavedChangesGuard(dirty);

//   const load = useCallback(async () => {
//     if (!id) {
//       setForm(EMPTY);
//       setInitial(EMPTY);
//       return;
//     }

//     setLoading(true);
//     try {
//       let item = null;

//       if (typeof PositionsAPI.get === "function")
//         item = await PositionsAPI.get(id);

//       if (!item) {
//         const { data } = await PositionsAPI.list({ q: "", limit: 500 });
//         item = pickItemFromList(data, id);
//       }

//       if (!item) throw new Error("not found");

//       const next = normalizeItem(item);
//       setForm(next);
//       setInitial(next);
//     } catch (e) {
//       console.error(e);
//       alert("No se pudo cargar el cargo.");
//       navigate(-1);
//     } finally {
//       setLoading(false);
//     }
//   }, [id, navigate]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     if (isView) return;

//     const name = String(form.name || "").trim();
//     if (!name) {
//       alert("Nombre es obligatorio.");
//       return;
//     }

//     setSaving(true);
//     try {
//       const payload = { ...form, name };

//       if (id) await PositionsAPI.update(id, payload);
//       else await PositionsAPI.create(payload);

//       navigate("/config/catalogs/positions");
//     } catch (e) {
//       console.error(e);
//       alert("No se pudo guardar. Revisa la consola.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="p-4 sm:p-6">
//       {/* Header estándar */}
//       <div className="flex items-start justify-between gap-3 flex-wrap">
//         <div>
//           <h1 className="text-xl font-semibold">Catálogo · Cargos</h1>
//           <p className="text-sm text-slate-500">{title}.</p>
//         </div>

//         <div className="flex items-center gap-2">
//           <Link
//             className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
//             to="/config/catalogs/positions"
//           >
//             Volver
//           </Link>

//           {!isView && (
//             <button
//               type="submit"
//               form="posForm"
//               className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
//               disabled={saving || loading}
//             >
//               {saving ? "Guardando…" : id ? "Guardar" : "Crear"}
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="bg-white border rounded-2xl p-6 mt-4">
//         {loading ? (
//           <div className="text-gray-500">Cargando…</div>
//         ) : (
//           <form id="posForm" onSubmit={onSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium mb-1">
//                   Nombre *
//                 </label>
//                 <input
//                   className="border rounded-md px-3 py-2 w-full"
//                   value={form.name}
//                   disabled={isView}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, name: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium mb-1">
//                   Descripción
//                 </label>
//                 <textarea
//                   className="border rounded-md px-3 py-2 w-full min-h-[90px]"
//                   value={form.description}
//                   disabled={isView}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, description: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>

//             <label className="inline-flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 checked={Boolean(form.active)}
//                 disabled={isView}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, active: e.target.checked }))
//                 }
//               />
//               Activo
//             </label>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// front/src/pages/Positions/Form.jsx
// -----------------------------------------------------------------------------
// Catálogo → Cargos (Positions)
// Basado 1:1 en VehicleStatuses/Form.jsx (módulo estable)
// - Modo Ver: ?mode=view (solo lectura) + botón Editar
// - Botonera abajo-derecha (Cancelar/Volver + Guardar/Crear)
// - UnsavedChangesGuard + beforeunload + banderas globales
// - Negocio intacto: get/list fallback, create/update, redirect
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { PositionsAPI } from "../../api/positions.api";

const BASE = "/config/catalogs/positions";

function normalize(data) {
  return {
    name: String(data?.name || ""),
    description: String(data?.description || ""),
    active: data?.active !== false,
  };
}

function pickItemFromList(data, id) {
  const list = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.result?.items)
      ? data.result.items
      : Array.isArray(data)
        ? data
        : [];
  return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
}

export default function PositionsForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();

  const isNew = !id || id === "new";
  const viewMode = sp.get("mode") === "view";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", active: true });

  const [editEnabled, setEditEnabled] = useState(!viewMode);

  useEffect(() => setEditEnabled(!viewMode), [viewMode]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (isNew) {
        const base = { name: "", description: "", active: true };
        setInitial(base);
        setForm(base);
        return;
      }

      setLoading(true);
      try {
        let item = null;

        // 1) get directo si existe
        if (typeof PositionsAPI.get === "function") item = await PositionsAPI.get(id);

        // 2) fallback: list y buscar (igual que tu lógica actual)
        if (!item) {
          const res = await PositionsAPI.list({ q: "", limit: 500 });
          const data = res?.data ?? res;
          item = pickItemFromList(data, id);
        }

        if (!alive) return;

        const norm = normalize(item);
        setInitial(norm);
        setForm(norm);
      } catch (e) {
        console.error(e);
        if (alive) {
          alert("No se pudo cargar el cargo.");
          navigate(-1);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, isNew, navigate]);

  const dirty = useMemo(() => {
    if (!initial) return false;
    return (
      String(form.name || "") !== String(initial.name || "") ||
      String(form.description || "") !== String(initial.description || "") ||
      Boolean(form.active) !== Boolean(initial.active)
    );
  }, [form, initial]);

  UnsavedChangesGuard(dirty);

  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    try {
      window.__FLEETCORE_UNSAVED__ = Boolean(dirty);
      window.__FLEETCORE_UNSAVED_MESSAGE__ = "Hay cambios sin guardar. ¿Deseas salir sin guardar?";
    } catch {}
    return () => {
      try {
        window.__FLEETCORE_UNSAVED__ = false;
        window.__FLEETCORE_UNSAVED_MESSAGE__ = "";
      } catch {}
    };
  }, [dirty]);

  const canEdit = !viewMode || editEnabled;

  const goBack = () => {
    if (dirty) {
      const ok = window.confirm("Hay cambios sin guardar. ¿Deseas salir sin guardar?");
      if (!ok) return;
    }
    navigate(-1);
  };

  const onSubmit = async () => {
    if (saving || loading) return;
    if (!form.name.trim()) {
      alert("Nombre es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: String(form.description || ""),
        active: Boolean(form.active),
      };

      if (isNew) await PositionsAPI.create(payload);
      else await PositionsAPI.update(id, payload);

      // resetea dirty antes de navegar
      setInitial(payload);
      setForm(payload);

      try {
        window.__FLEETCORE_UNSAVED__ = false;
        window.__FLEETCORE_UNSAVED_MESSAGE__ = "";
      } catch {}

      navigate(BASE);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No se pudo guardar. Revisa la consola.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Catálogo · Cargos</h1>
          <p className="text-sm text-slate-500">
            {isNew ? "Nuevo cargo." : viewMode ? "Modo ver (solo lectura)." : "Editar cargo."}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-600 bg-white p-4 sm:p-6">
        {loading ? (
          <div className="text-slate-500">Cargando…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Nombre *</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                disabled={!canEdit}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[120px]"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                disabled={!canEdit}
              />
            </div>

            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(form.active)}
                  onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                  disabled={!canEdit}
                />
                <span className="text-sm">Activo</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2 flex-wrap">
        <button className="px-4 py-2 rounded-lg border" onClick={goBack}>
          {dirty ? "Cancelar" : "Volver"}
        </button>

        {viewMode && !editEnabled && (
          <button
            className="px-4 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white"
            onClick={() => setEditEnabled(true)}
          >
            Editar
          </button>
        )}

        {(!viewMode || editEnabled) && (
          <button
            className="px-4 py-2 rounded-lg bg-[#0B3A66] text-white disabled:opacity-60"
            onClick={onSubmit}
            disabled={saving || loading}
          >
            {saving ? "Guardando…" : isNew ? "Crear" : "Guardar"}
          </button>
        )}
      </div>
    </div>
  );
}
