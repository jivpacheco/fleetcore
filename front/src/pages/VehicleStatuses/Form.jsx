// // // front/src/pages/VehicleStatuses/Form.jsx
// // // -----------------------------------------------------------------------------
// // // Catálogo → Estados de Vehículo (FleetCore Standard v1.0)
// // // - Modo Ver: ?mode=view (bloquea inputs)
// // // - UnsavedChangesGuard desde hooks
// // // -----------------------------------------------------------------------------
// // import { useEffect, useMemo, useState } from "react";
// // import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
// // import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
// // import { VehicleStatusesAPI } from "../../api/vehicleStatuses.api";

// // export default function VehicleStatusesForm() {
// //     const navigate = useNavigate();
// //     const { id } = useParams();
// //     const [sp] = useSearchParams();
// //     const mode = sp.get("mode") || "";
// //     const isView = mode === "view";

// //     const isEdit = Boolean(id);
// //     const title = useMemo(() => {
// //         if (isEdit && isView) return "Ver estado";
// //         if (isEdit) return "Editar estado";
// //         return "Nuevo estado";
// //     }, [isEdit, isView]);

// //     const [loading, setLoading] = useState(false);
// //     const [saving, setSaving] = useState(false);
// //     const [form, setForm] = useState({ code: "", name: "", active: true });
// //     const [initial, setInitial] = useState(null);

// //     const dirty =
// //         JSON.stringify(form) !== JSON.stringify(initial || { code: "", name: "", active: true });

// //     UnsavedChangesGuard(dirty);

// //     const load = async () => {
// //         if (!id) {
// //             setInitial({ code: "", name: "", active: true });
// //             return;
// //         }
// //         setLoading(true);
// //         try {
// //             const item = await VehicleStatusesAPI.get(id);
// //             const next = {
// //                 code: item?.code || item?.key || "",
// //                 name: item?.name || item?.label || "",
// //                 active:
// //                     typeof item?.isActive === "boolean"
// //                         ? item.isActive
// //                         : typeof item?.active === "boolean"
// //                             ? item.active
// //                             : true,
// //             };
// //             setForm(next);
// //             setInitial(next);
// //         } catch (e) {
// //             console.error(e);
// //             alert("No se pudo cargar el registro.");
// //             navigate(-1);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     useEffect(() => {
// //         load();
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, [id]);

// //     const onSubmit = async (e) => {
// //         e.preventDefault();
// //         if (isView) return;
// //         if (!form.code.trim() || !form.name.trim()) {
// //             alert("Código y Nombre son obligatorios.");
// //             return;
// //         }
// //         setSaving(true);
// //         try {
// //             if (id) await VehicleStatusesAPI.update(id, form);
// //             else await VehicleStatusesAPI.create(form);
// //             navigate("/config/catalogs/vehicle-statuses");
// //         } catch (err) {
// //             console.error(err);
// //             alert("No se pudo guardar. Revisa la consola.");
// //         } finally {
// //             setSaving(false);
// //         }
// //     };

// //     return (
// //         <div className="p-6 space-y-6">
// //             <div className="flex items-start justify-between gap-3 flex-wrap">
// //                 <div>
// //                     <h1 className="text-xl font-bold">Catálogo · Estados de Vehículo</h1>
// //                     <p className="text-gray-500 text-sm">{title}.</p>
// //                 </div>

// //                 <div className="flex items-center gap-2">
// //                     <Link className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" to="/config/catalogs/vehicle-statuses">
// //                         Volver
// //                     </Link>
// //                     {!isView && (
// //                         <button
// //                             type="submit"
// //                             form="vsForm"
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
// //                     <form id="vsForm" onSubmit={onSubmit} className="space-y-4">
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                             <div>
// //                                 <label className="block text-sm font-medium mb-1">Código *</label>
// //                                 <input
// //                                     className="border rounded-md px-3 py-2 w-full"
// //                                     value={form.code}
// //                                     disabled={isView}
// //                                     onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
// //                                 />
// //                             </div>

// //                             <div>
// //                                 <label className="block text-sm font-medium mb-1">Nombre *</label>
// //                                 <input
// //                                     className="border rounded-md px-3 py-2 w-full"
// //                                     value={form.name}
// //                                     disabled={isView}
// //                                     onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
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

// // front/src/pages/VehicleStatuses/Form.jsx
// import { useEffect, useMemo, useState } from "react"
// import { useNavigate, useParams, useSearchParams } from "react-router-dom"
// import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard"
// import { VehicleStatusesAPI } from "../../api/vehicleStatuses.api"

// function normalizeForm(data) {
//     return {
//         code: data?.code || "",
//         name: data?.name || data?.label || "",
//         active: data?.active !== false,
//     }
// }

// export default function VehicleStatusesForm() {
//     const navigate = useNavigate()
//     const { id } = useParams()
//     const [sp] = useSearchParams()

//     const isNew = id === "new" || !id
//     const viewMode = sp.get("mode") === "view"

//     const [loading, setLoading] = useState(false)
//     const [saving, setSaving] = useState(false)

//     const [initial, setInitial] = useState(null)
//     const [form, setForm] = useState({ code: "", name: "", active: true })

//     // En modo view, por defecto NO editable. Botón habilita edición.
//     const [editEnabled, setEditEnabled] = useState(!viewMode)

//     useEffect(() => {
//         setEditEnabled(!viewMode)
//     }, [viewMode])

//     useEffect(() => {
//         let mounted = true
//         async function load() {
//             if (isNew) {
//                 const base = { code: "", name: "", active: true }
//                 setInitial(base)
//                 setForm(base)
//                 return
//             }
//             setLoading(true)
//             try {
//                 const data = await VehicleStatusesAPI.get(id)
//                 const norm = normalizeForm(data)
//                 if (!mounted) return
//                 setInitial(norm)
//                 setForm(norm)
//             } finally {
//                 setLoading(false)
//             }
//         }
//         load()
//         return () => { mounted = false }
//     }, [id, isNew])

//     const dirty = useMemo(() => {
//         if (!initial) return false
//         return (
//             String(form.code || "") !== String(initial.code || "") ||
//             String(form.name || "") !== String(initial.name || "") ||
//             Boolean(form.active) !== Boolean(initial.active)
//         )
//     }, [form, initial])

//     // Bloqueo navegación SPA (react-router) + deja bandera global para Sidebar
//     UnsavedChangesGuard(dirty)

//     // Bloqueo refresh/cerrar pestaña
//     useEffect(() => {
//         const handler = (e) => {
//             if (!dirty) return
//             e.preventDefault()
//             e.returnValue = ""
//         }
//         window.addEventListener("beforeunload", handler)
//         return () => window.removeEventListener("beforeunload", handler)
//     }, [dirty])

//     const canEdit = !viewMode || editEnabled

//     const onBack = () => {
//         if (dirty) {
//             const ok = window.confirm("Hay cambios sin guardar. ¿Deseas salir sin guardar?")
//             if (!ok) return
//         }
//         navigate(-1)
//     }

//     const onSubmit = async () => {
//         if (!form.code.trim() || !form.name.trim()) {
//             alert("Código y Nombre son obligatorios.")
//             return
//         }

//         setSaving(true)
//         try {
//             if (isNew) {
//                 await VehicleStatusesAPI.create({
//                     code: form.code.trim(),
//                     name: form.name.trim(),
//                     active: Boolean(form.active),
//                 })
//             } else {
//                 await VehicleStatusesAPI.update(id, {
//                     code: form.code.trim(),
//                     name: form.name.trim(),
//                     active: Boolean(form.active),
//                 })
//             }
//             // Al guardar, volvemos al listado
//             navigate("/config/catalogs/vehicle-statuses")
//         } finally {
//             setSaving(false)
//         }
//     }

//     return (
//         <div className="p-4 sm:p-6">
//             {/* Header */}
//             <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
//                 <div>
//                     <h1 className="text-xl font-semibold">
//                         {isNew ? "Catálogo · Estados de Vehículo — Nuevo" : "Catálogo · Estados de Vehículo — Detalle"}
//                     </h1>
//                     <p className="text-sm text-slate-500">
//                         {viewMode ? "Modo ver (solo lectura). Puedes habilitar edición." : "Crear / editar estado."}
//                     </p>
//                 </div>
//             </div>

//             {/* Form card */}
//             <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
//                 {loading ? (
//                     <div className="text-slate-500">Cargando…</div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-sm font-medium">Código *</label>
//                             <input
//                                 className="mt-1 w-full border rounded-lg px-3 py-2"
//                                 value={form.code}
//                                 onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
//                                 disabled={!canEdit}
//                             />
//                         </div>

//                         <div>
//                             <label className="text-sm font-medium">Nombre *</label>
//                             <input
//                                 className="mt-1 w-full border rounded-lg px-3 py-2"
//                                 value={form.name}
//                                 onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
//                                 disabled={!canEdit}
//                             />
//                         </div>

//                         <div className="md:col-span-2">
//                             <label className="inline-flex items-center gap-2">
//                                 <input
//                                     type="checkbox"
//                                     checked={Boolean(form.active)}
//                                     onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
//                                     disabled={!canEdit}
//                                 />
//                                 <span className="text-sm">Activo</span>
//                             </label>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Botonera: siempre abajo a la derecha */}
//             <div className="mt-4 flex justify-end gap-2">
//                 <button className="px-4 py-2 rounded-lg border" onClick={onBack}>
//                     {dirty ? "Cancelar" : "Volver"}
//                 </button>

//                 {viewMode && !editEnabled && (
//                     <button
//                         className="px-4 py-2 rounded-lg border"
//                         onClick={() => setEditEnabled(true)}
//                     >
//                         Habilitar edición
//                     </button>
//                 )}

//                 {!viewMode && (
//                     <button
//                         className="px-4 py-2 rounded-lg bg-[#0B3A66] text-white disabled:opacity-60"
//                         disabled={saving || loading}
//                         onClick={onSubmit}
//                     >
//                         {saving ? "Guardando…" : isNew ? "Crear" : "Guardar"}
//                     </button>
//                 )}

//                 {viewMode && editEnabled && (
//                     <button
//                         className="px-4 py-2 rounded-lg bg-[#0B3A66] text-white disabled:opacity-60"
//                         disabled={saving || loading}
//                         onClick={onSubmit}
//                     >
//                         {saving ? "Guardando…" : "Guardar"}
//                     </button>
//                 )}
//             </div>
//         </div>
//     )
// }

// front/src/pages/VehicleStatuses/Form.jsx
// -----------------------------------------------------------------------------
// Catálogo → Estados de Vehículo (Form)
// - Modo Ver: ?mode=view (solo lectura) + botón "Habilitar edición"
// - Botonera abajo-derecha (Volver/Cancelar + Guardar/Crear)
// - UnsavedChangesGuard (hooks) + beforeunload (recargar/cerrar pestaña)
// -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { VehicleStatusesAPI } from "../../api/vehicleStatuses.api";

function normalize(data) {
    return {
        code: String(data?.code || ""),
        name: String(data?.name || data?.label || ""),
        active: data?.active !== false,
    };
}

export default function VehicleStatusesForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [sp] = useSearchParams();

    const isNew = !id || id === "new";
    const viewMode = sp.get("mode") === "view";

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [initial, setInitial] = useState(null);
    const [form, setForm] = useState({ code: "", name: "", active: true });

    const [editEnabled, setEditEnabled] = useState(!viewMode);

    useEffect(() => {
        setEditEnabled(!viewMode);
    }, [viewMode]);

    useEffect(() => {
        let alive = true;
        async function load() {
            if (isNew) {
                const base = { code: "", name: "", active: true };
                setInitial(base);
                setForm(base);
                return;
            }
            setLoading(true);
            try {
                const data = await VehicleStatusesAPI.get(id);
                if (!alive) return;
                const norm = normalize(data);
                setInitial(norm);
                setForm(norm);
            } finally {
                if (alive) setLoading(false);
            }
        }
        load();
        return () => {
            alive = false;
        };
    }, [id, isNew]);

    const dirty = useMemo(() => {
        if (!initial) return false;
        return (
            String(form.code || "") !== String(initial.code || "") ||
            String(form.name || "") !== String(initial.name || "") ||
            Boolean(form.active) !== Boolean(initial.active)
        );
    }, [form, initial]);

    // Bloqueo navegación SPA (y bandera para sidebar)
    UnsavedChangesGuard(dirty);

    // Bloqueo refresh / cerrar pestaña
    useEffect(() => {
        const handler = (e) => {
            if (!dirty) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);


    // Mantener bandera global para Sidebar/AppLayout
    useEffect(() => {
        try {
            window.__FLEETCORE_UNSAVED__ = Boolean(dirty)
            window.__FLEETCORE_UNSAVED_MESSAGE__ =
                "Hay cambios sin guardar. ¿Deseas salir sin guardar?"
        } catch {
            // no-op
        }
        return () => {
            try {
                window.__FLEETCORE_UNSAVED__ = false
                window.__FLEETCORE_UNSAVED_MESSAGE__ = ""
            } catch {
                // no-op
            }
        }
    }, [dirty])


    const canEdit = !viewMode || editEnabled;

    const goBack = () => {
        if (dirty) {
            const ok = window.confirm("Hay cambios sin guardar. ¿Deseas salir sin guardar?");
            if (!ok) return;
        }
        navigate(-1);
    };

    // const onSubmit = async () => {
    //     if (!form.code.trim() || !form.name.trim()) {
    //         alert("Código y Nombre son obligatorios.");
    //         return;
    //     }
    //     setSaving(true);
    //     try {
    //         if (isNew) {
    //             await VehicleStatusesAPI.create({
    //                 code: form.code.trim(),
    //                 name: form.name.trim(),
    //                 active: Boolean(form.active),
    //             });
    //         } else {
    //             await VehicleStatusesAPI.update(id, {
    //                 code: form.code.trim(),
    //                 name: form.name.trim(),
    //                 active: Boolean(form.active),
    //             });
    //         }
    //         navigate("/config/catalogs/vehicle-statuses");
    //     } finally {
    //         setSaving(false);
    //     }
    // };

    const onSubmit = async () => {
        if (saving || loading) return

        if (!form.code.trim() || !form.name.trim()) {
            alert("Código y Nombre son obligatorios.")
            return
        }

        setSaving(true)
        try {
            const payload = {
                code: form.code.trim(),
                name: form.name.trim(),
                active: Boolean(form.active),
            }

            if (isNew) {
                await VehicleStatusesAPI.create(payload)
            } else {
                await VehicleStatusesAPI.update(id, payload)
            }

            // Importante: al guardar, reseteamos "dirty" antes de navegar
            setInitial(payload)
            setForm(payload)

            // limpiamos bandera para que el sidebar no bloquee la navegación post-save
            try {
                window.__FLEETCORE_UNSAVED__ = false
                window.__FLEETCORE_UNSAVED_MESSAGE__ = ""
            } catch { }

            navigate("/config/catalogs/vehicle-statuses")
        } catch (err) {
            console.error(err)
            // muestra mensaje útil si viene del backend
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "No se pudo guardar. Revisa la consola."
            alert(msg)
        } finally {
            setSaving(false)
        }
    }


    return (
        <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-semibold">Catálogo · Estados de Vehículo</h1>
                    <p className="text-sm text-slate-500">
                        {isNew ? "Crear nuevo estado." : viewMode ? "Modo ver (solo lectura)." : "Editar estado."}
                    </p>
                </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-600 bg-white p-4 sm:p-6">
                {loading ? (
                    <div className="text-slate-500">Cargando…</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Código *</label>
                            <input
                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                value={form.code}
                                onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                                disabled={!canEdit}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Nombre *</label>
                            <input
                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                value={form.name}
                                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
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

            {/* Botonera abajo-derecha (estándar) */}
            <div className="mt-4 flex justify-end gap-2 flex-wrap">
                <button className="px-4 py-2 rounded-lg border" onClick={goBack}>
                    {dirty ? "Cancelar" : "Volver"}
                </button>

                {viewMode && !editEnabled && (
                    // <button className="px-4 py-2 rounded-lg border" onClick={() => setEditEnabled(true)}>
                    //     Habilitar edición
                    // </button>
                    <button className="px-4 py-2 rounded-md bg-[var(--fc-primary)] hover:opacity-95 text-white" onClick={() => setEditEnabled(true)}>
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
