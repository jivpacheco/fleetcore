// front/src/pages/Roles/Form.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { RolesAPI } from "../../api/roles.api";
import PERMISSION_MATRIX from "../../data/security/permissionMatrix.json";

const BASE = "/config/catalogs/roles";
const SCOPE_OPTIONS = ["BRANCH", "GLOBAL"];

function parsePermissionsText(txt) {
  return String(txt || "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function RolesForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const isView = sp.get("mode") === "view";
  const isEdit = Boolean(id);

  const empty = useMemo(
    () => ({
      code: "",
      name: "",
      scope: "BRANCH",
      active: true,
      isSystem: false,
      permissionsText: "",
    }),
    []
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(empty);
  const [initial, setInitial] = useState(empty);

  const title = useMemo(() => {
    if (isEdit && isView) return "Ver rol";
    if (isEdit) return "Editar rol";
    return "Nuevo rol";
  }, [isEdit, isView]);

  const protectedRole = useMemo(() => {
    const code = String(form?.code || "").toUpperCase();
    return Boolean(form?.isSystem) || code === "SUPERADMIN";
  }, [form?.code, form?.isSystem]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  UnsavedChangesGuard(dirty);

  // ✅ Confirmar al recargar/cerrar pestaña si hay cambios
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = ""; // requerido por navegadores
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const backLabel = dirty && !isView ? "Cancelar" : "Volver";
  const onBack = () => navigate(BASE);

  const permsSet = useMemo(() => new Set(parsePermissionsText(form.permissionsText)), [form.permissionsText]);

  const setPermsSetToText = (set) => {
    setForm((s) => ({ ...s, permissionsText: Array.from(set).sort().join("\n") }));
  };

  const togglePerm = (p) => {
    const set = new Set(permsSet);
    if (set.has(p)) set.delete(p);
    else set.add(p);
    setPermsSetToText(set);
  };

  const toggleModuleAll = (moduleKey, actions) => {
    const set = new Set(permsSet);
    const keys = (actions || []).map((a) => `${moduleKey}:${a}`);
    const allOn = keys.length > 0 && keys.every((k) => set.has(k));
    if (allOn) keys.forEach((k) => set.delete(k));
    else keys.forEach((k) => set.add(k));
    setPermsSetToText(set);
  };

  const load = async () => {
    if (!id) {
      setForm(empty);
      setInitial(empty);
      return;
    }

    setLoading(true);
    try {
      let item = await RolesAPI.get(id);

      if (!item) {
        const res = await RolesAPI.list({ page: 1, limit: 500 });
        item = (res?.items || []).find((x) => String(x?._id || x?.id) === String(id)) || null;
      }

      if (!item) throw new Error("not found");

      const next = {
        code: item?.code || "",
        name: item?.name || "",
        scope: item?.scope || "BRANCH",
        active: item?.active !== false,
        isSystem: Boolean(item?.isSystem),
        permissionsText: Array.isArray(item?.permissions) ? item.permissions.join("\n") : (item?.permissionsText || ""),
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    if (protectedRole) return alert("Rol protegido: no se puede modificar desde la UI.");

    const payload = {
      code: String(form.code || "").trim().toUpperCase(),
      name: String(form.name || "").trim().toUpperCase(),
      scope: form.scope || "BRANCH",
      active: form.active !== false,
      isSystem: Boolean(form.isSystem),
      permissions: Array.from(new Set(parsePermissionsText(form.permissionsText))),
    };

    if (!payload.code) return alert("Código es obligatorio");
    if (!payload.name) return alert("Nombre es obligatorio");

    setSaving(true);
    try {
      if (id) {
        await RolesAPI.update(id, payload);
        alert("Rol actualizado con éxito");
      } else {
        await RolesAPI.create(payload);
        alert(payload.permissions.length ? "Rol creado con éxito" : "Rol creado con éxito pero sin permisos");
      }
      navigate(BASE);
    } catch (err) {
      console.error(err);
      alert("No fue posible guardar");
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
          {protectedRole && (
            <p className="text-xs text-amber-700 mt-1">Rol protegido (sistema / SUPERADMIN).</p>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        {loading ? (
          <div className="text-gray-500">Cargando…</div>
        ) : (
          <form id="roleForm" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código *</label>
                <input
                  className="border rounded-md px-3 py-2 w-full"
                  value={form.code}
                  disabled={isView || protectedRole}
                  onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  className="border rounded-md px-3 py-2 w-full"
                  value={form.name}
                  disabled={isView || protectedRole}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Scope</label>
                <select
                  className="border rounded-md px-3 py-2 w-full"
                  value={form.scope}
                  disabled={isView || protectedRole}
                  onChange={(e) => setForm((s) => ({ ...s, scope: e.target.value }))}
                >
                  {SCOPE_OPTIONS.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form.active)}
                    disabled={isView || protectedRole}
                    onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                  />
                  Activo
                </label>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isSystem)}
                    disabled={isView || protectedRole}
                    onChange={(e) => setForm((s) => ({ ...s, isSystem: e.target.checked }))}
                  />
                  Sistema
                </label>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Permisos</div>

              <div className="border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-gray-700">
                      <th className="px-4 py-2 w-[280px]">Módulo</th>
                      <th className="px-4 py-2">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {PERMISSION_MATRIX.map((m) => {
                      const keys = (m.actions || []).map((a) => `${m.key}:${a}`);
                      const allOn = keys.length > 0 && keys.every((k) => permsSet.has(k));

                      return (
                        <tr key={m.key} className="align-top">
                          <td className="px-4 py-2 font-medium">
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={allOn}
                                disabled={isView || protectedRole}
                                onChange={() => toggleModuleAll(m.key, m.actions || [])}
                              />
                              {String(m.label || "").toUpperCase()}
                            </label>
                          </td>

                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              {(m.actions || []).map((a) => {
                                const p = `${m.key}:${a}`;
                                const on = permsSet.has(p);

                                return (
                                  <button
                                    key={p}
                                    type="button"
                                    disabled={isView || protectedRole}
                                    onClick={() => togglePerm(p)}
                                    className={[
                                      "px-3 py-1 rounded-md border text-xs hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                      on
                                        ? "bg-[#0B3A6E]/10 text-[#0B3A6E] border-[#0B3A6E]/30 hover:bg-[#0B3A6E]/15"
                                        : "bg-white text-gray-800 hover:bg-gray-50",
                                    ].join(" ")}
                                    title={p}
                                  >
                                    {String(a).toUpperCase()}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Permisos (texto)</label>
                <textarea
                  className="border rounded-md px-3 py-2 w-full min-h-[120px] font-mono text-xs"
                  value={form.permissionsText}
                  disabled={isView || protectedRole}
                  onChange={(e) => setForm((s) => ({ ...s, permissionsText: e.target.value }))}
                  placeholder="Formato: module:action (uno por línea). Ej: vehicles:read"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                onClick={onBack}
              >
                {backLabel}
              </button>

              {isView && isEdit && !protectedRole && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                  onClick={() => navigate(`${BASE}/${id}`)}
                >
                  Editar
                </button>
              )}

              {!isView && (
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#0B3A6E] text-white text-sm font-medium hover:opacity-95 disabled:opacity-60"
                  disabled={saving || protectedRole}
                  title={protectedRole ? "Rol protegido" : ""}
                >
                  {saving ? "Guardando…" : id ? "Guardar" : "Crear"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
