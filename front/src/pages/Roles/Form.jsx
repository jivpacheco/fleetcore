// front/src/pages/Roles/Form.jsx
// -----------------------------------------------------------------------------
// Catálogo → Roles (FleetCore Standard v1.0)
// - Modo Ver: ?mode=view
// - UnsavedChangesGuard desde hooks
// -----------------------------------------------------------------------------
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { RolesAPI } from "../../api/roles.api";

// Catálogo base de permisos (UI). Ajustable.
const PERMISSION_MATRIX = [
    { key: "vehicles", label: "Vehículos", actions: ["read", "create", "update", "delete", "transfer"] },
    { key: "people", label: "RRHH", actions: ["read", "create", "update", "delete"] },
    { key: "branches", label: "Sucursales", actions: ["read", "create", "update", "delete"] },
    { key: "positions", label: "Cargos", actions: ["read", "manage"] },
    { key: "roles", label: "Roles", actions: ["read", "manage"] },
    { key: "users", label: "Usuarios", actions: ["read", "manage"] },
    { key: "drivingTests", label: "Pruebas conducción", actions: ["read", "create", "update", "delete"] },
    { key: "purchaseOrders", label: "Ordenes compra", actions: ["read", "create", "update", "delete", "approve"] },
    { key: "workOrders", label: "Ordenes trabajo", actions: ["read", "create", "update", "delete", "approve"] },
];

const permKey = (m, a) => `${m}:${a}`;
const SCOPE_OPTIONS = ["BRANCH", "GLOBAL"];

function parsePermissions(text) {
    const raw = String(text || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    const set = new Set();
    raw.forEach((line) => {
        // permite "module:action"
        const m = line.split(":")[0]?.trim();
        const a = line.split(":")[1]?.trim();
        if (m && a) set.add(`${m}:${a}`);
    });
    return Array.from(set);
}

function formatPermissions(arr) {
    return (arr || []).join("\n");
}

function pickItemFromList(data, id) {
    const list = Array.isArray(data?.items) ? data.items : Array.isArray(data?.result?.items) ? data.result.items : Array.isArray(data) ? data : [];
    return list.find((x) => String(x?._id || x?.id) === String(id)) || null;
}

export default function RolesForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [sp] = useSearchParams();
    const isView = sp.get("mode") === "view";

    const isEdit = Boolean(id);
    const title = useMemo(() => {
        if (isEdit && isView) return "Ver rol";
        if (isEdit) return "Editar rol";
        return "Nuevo rol";
    }, [isEdit, isView]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        code: "",
        name: "",
        scope: "BRANCH",
        active: true,
        permissionsText: "",
        isSystem: false,
    });
    const [initial, setInitial] = useState(null);

    const dirty = JSON.stringify(form) !== JSON.stringify(initial || {
        code: "", name: "", scope: "BRANCH", active: true, permissionsText: "", isSystem: false
    });
    UnsavedChangesGuard(dirty);

    const load = async () => {
        if (!id) {
            const init = { code: "", name: "", scope: "BRANCH", active: true, permissionsText: "", isSystem: false };
            setForm(init);
            setInitial(init);
            return;
        }
        setLoading(true);
        try {
            let item = null;
            if (typeof RolesAPI.get === "function") item = await RolesAPI.get(id);
            if (!item) {
                const { data } = await RolesAPI.list({ q: "", limit: 500 });
                item = pickItemFromList(data, id);
            }
            if (!item) throw new Error("not found");

            const perms = Array.isArray(item?.permissions) ? item.permissions : [];
            const next = {
                code: item?.code || "",
                name: item?.name || "",
                scope: item?.scope || "BRANCH",
                active: typeof item?.active === "boolean" ? item.active : typeof item?.isActive === "boolean" ? item.isActive : true,
                permissionsText: item?.permissionsText || formatPermissions(perms),
                isSystem: Boolean(item?.isSystem),
            };
            setForm(next);
            setInitial(next);
        } catch (e) {
            console.error(e);
            alert("No se pudo cargar el rol.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

    const togglePermission = (moduleKey, actionKey) => {
        const k = permKey(moduleKey, actionKey);
        const current = new Set(parsePermissions(form.permissionsText));
        if (current.has(k)) current.delete(k);
        else current.add(k);
        setForm((s) => ({ ...s, permissionsText: formatPermissions(Array.from(current).sort()) }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isView) return;

        if (!form.code.trim() || !form.name.trim()) {
            alert("Código y Nombre son obligatorios.");
            return;
        }

        const permissions = parsePermissions(form.permissionsText);

        const payload = {
            code: form.code.trim(),
            name: form.name.trim(),
            scope: form.scope,
            active: Boolean(form.active),
            permissions,
            permissionsText: form.permissionsText,
            isSystem: Boolean(form.isSystem),
        };

        setSaving(true);
        try {
            if (id) await RolesAPI.update(id, payload);
            else await RolesAPI.create(payload);
            navigate("/config/catalogs/roles");
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
                    <h1 className="text-xl font-bold">Catálogo · Roles</h1>
                    <p className="text-gray-500 text-sm">{title}.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Link className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" to="/config/catalogs/roles">
                        Volver
                    </Link>
                    {!isView && (
                        <button
                            type="submit"
                            form="rolesForm"
                            className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
                            disabled={saving}
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
                    <form id="rolesForm" onSubmit={onSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Código *</label>
                                <input className="border rounded-md px-3 py-2 w-full" value={form.code} disabled={isView} onChange={(e) => setForm(s => ({ ...s, code: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre *</label>
                                <input className="border rounded-md px-3 py-2 w-full" value={form.name} disabled={isView} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Scope</label>
                                <select className="border rounded-md px-3 py-2 w-full" value={form.scope} disabled={isView} onChange={(e) => setForm(s => ({ ...s, scope: e.target.value }))}>
                                    {SCOPE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-2 text-sm mt-6">
                                    <input type="checkbox" checked={Boolean(form.active)} disabled={isView} onChange={(e) => setForm(s => ({ ...s, active: e.target.checked }))} />
                                    Activo
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm mt-6">
                                    <input type="checkbox" checked={Boolean(form.isSystem)} disabled={isView} onChange={(e) => setForm(s => ({ ...s, isSystem: e.target.checked }))} />
                                    Sistema
                                </label>
                            </div>
                        </div>

                        {/* Permisos (UI Matrix) */}
                        <div>
                            <div className="text-sm font-medium mb-2">Permisos</div>
                            <div className="border rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-[900px] w-full text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr className="text-left text-gray-700">
                                                <th className="px-4 py-3">Módulo</th>
                                                <th className="px-4 py-3">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {PERMISSION_MATRIX.map((m) => (
                                                <tr key={m.key} className="border-t">
                                                    <td className="px-4 py-3 font-medium">{m.label}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {m.actions.map((a) => {
                                                                const k = permKey(m.key, a);
                                                                const checked = parsePermissions(form.permissionsText).includes(k);
                                                                return (
                                                                    <button
                                                                        key={k}
                                                                        type="button"
                                                                        disabled={isView}
                                                                        onClick={() => togglePermission(m.key, a)}
                                                                        className={`px-3 py-1.5 rounded-md border text-sm ${checked ? "bg-slate-100" : "hover:bg-gray-50"
                                                                            } ${isView ? "opacity-60 cursor-not-allowed" : ""}`}
                                                                    >
                                                                        {a}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* textarea de respaldo (útil para copiar/pegar) */}
                            <div className="mt-3">
                                <label className="block text-sm font-medium mb-1">permissionsText (debug/backup)</label>
                                <textarea
                                    className="border rounded-md px-3 py-2 w-full min-h-[120px] font-mono text-xs"
                                    value={form.permissionsText}
                                    disabled={isView}
                                    onChange={(e) => setForm(s => ({ ...s, permissionsText: e.target.value }))}
                                />
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
