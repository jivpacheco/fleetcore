// // // front/src/pages/Positions/Form.jsx
// // // -----------------------------------------------------------------------------
// // // Catálogo → Cargos (Positions) (FleetCore Standard v1.0)
// // // - Modo Ver: ?mode=view
// // // - UnsavedChangesGuard desde hooks
// // // -----------------------------------------------------------------------------
// // import { useEffect, useMemo, useState } from "react";
// // import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
// // import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// // import { PositionsAPI } from "../../api/positions.api";

// // function pickItemFromList(data, id) {
// //     const list = Array.isArray(data?.items) ? data.items : Array.isArray(data?.result?.items) ? data.result.items : Array.isArray(data) ? data : [];
// //     return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
// // }

// // export default function PositionsForm() {
// //     const navigate = useNavigate();
// //     const { id } = useParams();
// //     const [sp] = useSearchParams();
// //     const isView = sp.get("mode") === "view";

// //     const isEdit = Boolean(id);
// //     const title = useMemo(() => {
// //         if (isEdit && isView) return "Ver cargo";
// //         if (isEdit) return "Editar cargo";
// //         return "Nuevo cargo";
// //     }, [isEdit, isView]);

// //     const [loading, setLoading] = useState(false);
// //     const [saving, setSaving] = useState(false);
// //     const [form, setForm] = useState({ name: "", description: "", active: true });
// //     const [initial, setInitial] = useState(null);

// //     const dirty = JSON.stringify(form) !== JSON.stringify(initial || { name: "", description: "", active: true });
// //     UnsavedChangesGuard(dirty);

// //     const load = async () => {
// //         if (!id) {
// //             const init = { name: "", description: "", active: true };
// //             setForm(init);
// //             setInitial(init);
// //             return;
// //         }
// //         setLoading(true);
// //         try {
// //             let item = null;
// //             if (typeof PositionsAPI.get === "function") item = await PositionsAPI.get(id);
// //             if (!item) {
// //                 const { data } = await PositionsAPI.list({ q: "", limit: 500 });
// //                 item = pickItemFromList(data, id);
// //             }
// //             if (!item) throw new Error("not found");
// //             const next = {
// //                 name: item?.name || "",
// //                 description: item?.description || "",
// //                 active: typeof item?.active === "boolean" ? item.active : typeof item?.isActive === "boolean" ? item.isActive : true,
// //             };
// //             setForm(next);
// //             setInitial(next);
// //         } catch (e) {
// //             console.error(e);
// //             alert("No se pudo cargar el cargo.");
// //             navigate(-1);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

// //     const onSubmit = async (e) => {
// //         e.preventDefault();
// //         if (isView) return;
// //         if (!form.name.trim()) {
// //             alert("Nombre es obligatorio.");
// //             return;
// //         }
// //         setSaving(true);
// //         try {
// //             if (id) await PositionsAPI.update(id, form);
// //             else await PositionsAPI.create(form);
// //             navigate("/config/catalogs/positions");
// //         } catch (e) {
// //             console.error(e);
// //             alert("No se pudo guardar. Revisa la consola.");
// //         } finally {
// //             setSaving(false);
// //         }
// //     };

// //     return (
// //         <div className="p-6 space-y-6">
// //             <div className="flex items-start justify-between gap-3 flex-wrap">
// //                 <div>
// //                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
// //                     <p className="text-gray-500 text-sm">{title}.</p>
// //                 </div>

// //                 <div className="flex items-center gap-2">
// //                     <Link className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" to="/config/catalogs/positions">
// //                         Volver
// //                     </Link>
// //                     {!isView && (
// //                         <button
// //                             type="submit"
// //                             form="posForm"
// //                             className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
// //                             disabled={saving}
// //                         >
// //                             {saving ? "Guardando…" : id ? "Guardar" : "Crear"}
// //                         </button>
// //                     )}
// //                 </div>
// //             </div>

// //             <div className="bg-white border rounded-2xl p-6">
// //                 {loading ? (
// //                     <div className="text-gray-500">Cargando…</div>
// //                 ) : (
// //                     <form id="posForm" onSubmit={onSubmit} className="space-y-4">
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                             <div className="md:col-span-2">
// //                                 <label className="block text-sm font-medium mb-1">Nombre *</label>
// //                                 <input
// //                                     className="border rounded-md px-3 py-2 w-full"
// //                                     value={form.name}
// //                                     disabled={isView}
// //                                     onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
// //                                 />
// //                             </div>

// //                             <div className="md:col-span-2">
// //                                 <label className="block text-sm font-medium mb-1">Descripción</label>
// //                                 <textarea
// //                                     className="border rounded-md px-3 py-2 w-full min-h-[90px]"
// //                                     value={form.description}
// //                                     disabled={isView}
// //                                     onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
// //                                 />
// //                             </div>
// //                         </div>

// //                         <label className="inline-flex items-center gap-2 text-sm">
// //                             <input
// //                                 type="checkbox"
// //                                 checked={Boolean(form.active)}
// //                                 disabled={isView}
// //                                 onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
// //                             />
// //                             Activo
// //                         </label>
// //                     </form>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // }

// // front/src/pages/Positions/Form.jsx
// // -----------------------------------------------------------------------------
// // Catálogo → Cargos (Positions) (FleetCore Templates v1.0)
// // - Modo Ver: ?mode=view
// // - Guard de cambios: UnsavedChangesGuard
// // - Carga: PositionsAPI.get(id) o fallback a list()
// // -----------------------------------------------------------------------------

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
// import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// import { PositionsAPI } from "../../api/positions.api";

// const EMPTY = { name: "", description: "", active: true };

// function pickItems(data) {
//     if (!data) return [];
//     if (Array.isArray(data)) return data;
//     if (Array.isArray(data.items)) return data.items;
//     if (Array.isArray(data.result?.items)) return data.result.items;
//     if (Array.isArray(data.data?.items)) return data.data.items;
//     if (Array.isArray(data.data)) return data.data;
//     return [];
// }

// function pickOneFromList(data, id) {
//     const list = pickItems(data);
//     return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
// }

// function normalizeItem(item) {
//     return {
//         name: item?.name || "",
//         description: item?.description || "",
//         active:
//             typeof item?.active === "boolean"
//                 ? item.active
//                 : typeof item?.isActive === "boolean"
//                     ? item.isActive
//                     : true,
//     };
// }

// function isDirty(a, b) {
//     // Comparación controlada (evita JSON.stringify con objetos grandes y orden de keys)
//     const aa = a || EMPTY;
//     const bb = b || EMPTY;
//     return (
//         String(aa.name || "") !== String(bb.name || "") ||
//         String(aa.description || "") !== String(bb.description || "") ||
//         Boolean(aa.active) !== Boolean(bb.active)
//     );
// }

// export default function PositionsForm() {
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const [sp] = useSearchParams();

//     const isEdit = Boolean(id);
//     const isView = sp.get("mode") === "view";

//     const title = useMemo(() => {
//         if (isEdit && isView) return "Ver cargo";
//         if (isEdit) return "Editar cargo";
//         return "Nuevo cargo";
//     }, [isEdit, isView]);

//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);

//     const [form, setForm] = useState(EMPTY);
//     const [initial, setInitial] = useState(EMPTY);

//     const dirty = useMemo(() => isDirty(form, initial), [form, initial]);
//     UnsavedChangesGuard(dirty);

//     const load = useCallback(async () => {
//         if (!id) {
//             setForm(EMPTY);
//             setInitial(EMPTY);
//             return;
//         }

//         setLoading(true);
//         try {
//             let item = null;

//             // Prefer: endpoint de detalle
//             if (typeof PositionsAPI.get === "function") {
//                 item = await PositionsAPI.get(id);
//             }

//             // Fallback: traer lista grande y buscar por id
//             if (!item) {
//                 const { data } = await PositionsAPI.list({ q: "", limit: 500 });
//                 item = pickOneFromList(data, id);
//             }

//             if (!item) throw new Error("not found");

//             const next = normalizeItem(item);
//             setForm(next);
//             setInitial(next);
//         } catch (err) {
//             console.error(err);
//             alert("No se pudo cargar el cargo.");
//             navigate(-1);
//         } finally {
//             setLoading(false);
//         }
//     }, [id, navigate]);

//     useEffect(() => {
//         load();
//     }, [load]);

//     const setField = (key) => (e) => {
//         const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
//         setForm((s) => ({ ...s, [key]: value }));
//     };

//     const onSubmit = async (e) => {
//         e.preventDefault();
//         if (isView) return;

//         const name = String(form?.name || "").trim();
//         if (!name) {
//             alert("Nombre es obligatorio.");
//             return;
//         }

//         setSaving(true);
//         try {
//             const payload = { ...form, name };

//             if (id) await PositionsAPI.update(id, payload);
//             else await PositionsAPI.create(payload);

//             navigate("/config/catalogs/positions");
//         } catch (err) {
//             console.error(err);
//             alert("No se pudo guardar. Revisa la consola.");
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <div className="p-6 space-y-6">
//             {/* Header estándar */}
//             <div className="flex items-start justify-between gap-3 flex-wrap">
//                 <div>
//                     <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
//                     <p className="text-gray-500 text-sm">{title}.</p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                     <Link
//                         className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
//                         to="/config/catalogs/positions"
//                     >
//                         Volver
//                     </Link>

//                     {!isView && (
//                         <button
//                             type="submit"
//                             form="posForm"
//                             className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
//                             disabled={saving || loading}
//                             title={dirty ? "Guardar cambios" : "Sin cambios"}
//                         >
//                             {saving ? "Guardando…" : isEdit ? "Guardar" : "Crear"}
//                         </button>
//                     )}
//                 </div>
//             </div>

//             <div className="bg-white border rounded-2xl p-6">
//                 {loading ? (
//                     <div className="text-gray-500">Cargando…</div>
//                 ) : (
//                     <form id="posForm" onSubmit={onSubmit} className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="md:col-span-2">
//                                 <label className="block text-sm font-medium mb-1">Nombre *</label>
//                                 <input
//                                     className="border rounded-md px-3 py-2 w-full"
//                                     value={form.name}
//                                     disabled={isView}
//                                     onChange={setField("name")}
//                                 />
//                             </div>

//                             <div className="md:col-span-2">
//                                 <label className="block text-sm font-medium mb-1">Descripción</label>
//                                 <textarea
//                                     className="border rounded-md px-3 py-2 w-full min-h-[90px]"
//                                     value={form.description}
//                                     disabled={isView}
//                                     onChange={setField("description")}
//                                 />
//                             </div>
//                         </div>

//                         <label className="inline-flex items-center gap-2 text-sm">
//                             <input
//                                 type="checkbox"
//                                 checked={Boolean(form.active)}
//                                 disabled={isView}
//                                 onChange={setField("active")}
//                             />
//                             Activo
//                         </label>
//                     </form>
//                 )}
//             </div>
//         </div>
//     );
// }

// front/src/pages/Positions/Form.jsx
// -----------------------------------------------------------------------------
// Catálogo → Cargos (Positions) (FleetCore Standard v1.0)
// - Modo Ver: ?mode=view
// - UnsavedChangesGuard desde hooks
// -----------------------------------------------------------------------------
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { PositionsAPI } from "../../api/positions.api";

const EMPTY = { name: "", description: "", active: true };

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

function normalizeItem(item) {
    return {
        name: item?.name || "",
        description: item?.description || "",
        active:
            typeof item?.active === "boolean"
                ? item.active
                : typeof item?.isActive === "boolean"
                    ? item.isActive
                    : true,
    };
}

function isDirty(a, b) {
    const aa = a || EMPTY;
    const bb = b || EMPTY;
    return (
        String(aa.name || "") !== String(bb.name || "") ||
        String(aa.description || "") !== String(bb.description || "") ||
        Boolean(aa.active) !== Boolean(bb.active)
    );
}

export default function PositionsForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [sp] = useSearchParams();
    const isView = sp.get("mode") === "view";

    const isEdit = Boolean(id);
    const title = useMemo(() => {
        if (isEdit && isView) return "Ver cargo";
        if (isEdit) return "Editar cargo";
        return "Nuevo cargo";
    }, [isEdit, isView]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [initial, setInitial] = useState(EMPTY);

    const dirty = useMemo(() => isDirty(form, initial), [form, initial]);
    UnsavedChangesGuard(dirty);

    const load = useCallback(async () => {
        if (!id) {
            setForm(EMPTY);
            setInitial(EMPTY);
            return;
        }

        setLoading(true);
        try {
            let item = null;

            if (typeof PositionsAPI.get === "function") {
                item = await PositionsAPI.get(id);
            }

            if (!item) {
                const { data } = await PositionsAPI.list({ q: "", limit: 500 });
                item = pickItemFromList(data, id);
            }

            if (!item) throw new Error("not found");

            const next = normalizeItem(item);
            setForm(next);
            setInitial(next);
        } catch (e) {
            console.error(e);
            alert("No se pudo cargar el cargo.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        load();
    }, [load]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isView) return;

        const name = String(form.name || "").trim();
        if (!name) {
            alert("Nombre es obligatorio.");
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form, name };

            if (id) await PositionsAPI.update(id, payload);
            else await PositionsAPI.create(payload);

            navigate("/config/catalogs/positions");
        } catch (e) {
            console.error(e);
            alert("No se pudo guardar. Revisa la consola.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold">Catálogo · Cargos</h1>
                    <p className="text-gray-500 text-sm">{title}.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                        to="/config/catalogs/positions"
                    >
                        Volver
                    </Link>

                    {!isView && (
                        <button
                            type="submit"
                            form="posForm"
                            className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
                            disabled={saving || loading}
                        >
                            {saving ? "Guardando…" : id ? "Guardar" : "Crear"}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white border rounded-2xl p-6">
                {loading ? (
                    <div className="text-gray-500">Cargando…</div>
                ) : (
                    <form id="posForm" onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Nombre *</label>
                                <input
                                    className="border rounded-md px-3 py-2 w-full"
                                    value={form.name}
                                    disabled={isView}
                                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Descripción</label>
                                <textarea
                                    className="border rounded-md px-3 py-2 w-full min-h-[90px]"
                                    value={form.description}
                                    disabled={isView}
                                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                                />
                            </div>
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={Boolean(form.active)}
                                disabled={isView}
                                onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                            />
                            Activo
                        </label>
                    </form>
                )}
            </div>
        </div>
    );
}

