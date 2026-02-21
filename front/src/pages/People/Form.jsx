// // front/src/pages/People/Form.jsx
// // -----------------------------------------------------------------------------
// // RRHH - Ficha de Persona (Tabs)
// // - Modo Ver: ?mode=view (bloquea inputs y muestra solo "Volver")
// // - Modo Editar: default
// // - Guard cambios sin guardar: hooks/UnsavedChangesGuard (useBlocker)
// // -----------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import UnsavedChangesGuard from "../../hooks/UnsavedChangesGuard";
import { PeopleAPI } from "../../api/people.api";
import { PositionsAPI } from "../../api/positions.api";
import { BranchesAPI } from "../../api/branches.api";

// Datos Chile (regiones/comunas)
import regionesComunas from "../../data/chile/comunas-regiones.json";

const REGIONES_CATALOGO = Array.isArray(regionesComunas?.regiones)
  ? regionesComunas.regiones
  : [];

const normalizeRegion = (value) => {
  const s = String(value || "").trim();
  if (!s) return "";
  const hit = REGIONES_CATALOGO.find(
    (r) => String(r?.region || "").toUpperCase() === s.toUpperCase()
  );
  return hit?.region || s; // si no encuentra, deja lo que viene
};

const normalizeComuna = (regionValue, comunaValue) => {
  const regionCanon = normalizeRegion(regionValue);
  const s = String(comunaValue || "").trim();
  if (!regionCanon || !s) return s;

  const regionObj = REGIONES_CATALOGO.find((r) => r?.region === regionCanon);
  const comunas = Array.isArray(regionObj?.comunas) ? regionObj.comunas : [];

  const hit = comunas.find((c) => String(c).toUpperCase() === s.toUpperCase());
  return hit || s;
};


import LicensesTab from "./tabs/LicensesTab";
import FilesTab from "./tabs/FilesTab";
import DrivingTestsTab from "./tabs/DrivingTestsTab";

// import regionesComunas from '../../data/chile/comunas-regiones.json'

const TABS = [
  { key: "basic", label: "Básico" },
  { key: "org", label: "Organización" },
  { key: "licenses", label: "Licencias" },
  { key: "files", label: "Archivos" },
  { key: "tests", label: "Pruebas" },
];

function pickId(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v._id || "";
}

// RUN (Chile) - validación Módulo 11
const normalizeRun = (v) =>
  String(v || "")
    .trim()
    .toUpperCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "")
    // deja solo dígitos, K y guion
    .replace(/[^0-9K-]/g, "");

const isValidRun = (v) => {
  const run = normalizeRun(v);
  if (!run) return true;

  const clean = run.replace(/-/g, "");
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const mod = 11 - (sum % 11);
  const expected = mod === 11 ? "0" : mod === 10 ? "K" : String(mod);
  return dv === expected;
};

// Formatea RUN a 12345678-K (agrega guion si falta) SOLO si el RUN es válido.
const formatRunWithDash = (v) => {
  const run = normalizeRun(v);
  if (!run) return "";
  const clean = run.replace(/-/g, "");
  if (clean.length < 2) return run;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = `${body}-${dv}`;
  return isValidRun(formatted) ? formatted : run;
};

export default function PeopleForm() {
  const { id } = useParams();
  // const isNew = id === "new" || !id;
  const isNew = !id;
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const isView = sp.get("mode") === "view";
  const canEdit = !isView;

  const goEdit = () => {
    setSp((prev) => {
      prev.delete("mode");
      return prev;
    });
  };


  const [tab, setTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [checkingDni, setCheckingDni] = useState(false);
  const [dniDup, setDniDup] = useState(false);
  const [dniDupMsg, setDniDupMsg] = useState("");

  // Dirty flags desde tabs (Licencias / Pruebas). Se integra al guard de navegación.
  const [subDirty, setSubDirty] = useState(false);
  const [subEditing, setSubEditing] = useState(false);

  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);

  const [personDoc, setPersonDoc] = useState(null); // versión completa desde ba
  const [initialSnapshot, setInitialSnapshot] = useState(null);
// ckend
  const [initial, setInitial] = useState(null);

  const [form, setForm] = useState({
    dni: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthDate: "",
    birthPlace: "",
    nationality: "",
    hireDate: "",
    active: true,

    // Dirección (opcional)
    addressLine1: "",
    addressCity: "", // ciudad (residencia)
    addressComuna: "", // comuna (residencia)
    addressRegion: "", // región (residencia)
    addressCountry: "CL",

    branchId: "",
    positionId: "",
  });

  const isDirty = useMemo(() => {
    if (!initial) return false;
    return JSON.stringify(form) !== JSON.stringify(initial);
  }, [form, initial]);

  // const hasUnsavedChanges = Boolean(isDirty || subDirty)

  const hasUnsavedChanges = Boolean(isDirty || subDirty);

  const runOk = useMemo(() => isValidRun(form.dni), [form.dni]);

  const checkDniDuplicate = async (raw) => {
    const value = String(raw || "").trim();
    if (!value) {
      setDniDup(false);
      setDniDupMsg("");
      return;
    }

    // Solo validamos duplicidad si el RUN es válido (evita alertas mientras se escribe)
    const formatted = formatRunWithDash(value) || value;
    if (!isValidRun(formatted)) {
      setDniDup(false);
      setDniDupMsg("");
      return;
    }

    setCheckingDni(true);
    try {
      const { data } = await PeopleAPI.exists({
        dni: formatted,
        excludeId: isNew ? "" : id,
      });
      if (data?.exists) {
        setDniDup(true);
        setDniDupMsg("Ya existe una persona registrada con este RUN");
      } else {
        setDniDup(false);
        setDniDupMsg("");
      }
    } catch (err) {
      // Si falla la validación remota, no bloqueamos el guardado; solo limpiamos.
      console.error(err);
      setDniDup(false);
      setDniDupMsg("");
    } finally {
      setCheckingDni(false);
    }
  };

  // Regiones/Comunas (Chile) desde JSON
  // const REGIONES = useMemo(() => regionesComunas?.regiones || [], []);

  const REGIONES = useMemo(
    () => (Array.isArray(regionesComunas?.regiones) ? regionesComunas.regiones : []),
    [regionesComunas]
  );



  const comunasForSelectedRegion = useMemo(() => {
    const r = REGIONES.find((x) => x?.region === form.addressRegion);
    return Array.isArray(r?.comunas) ? r.comunas : [];
  }, [REGIONES, form.addressRegion]);

  const normalizeBranchesPayload = (data) => {
    // Compatibilidad con las distintas formas usadas en el proyecto (Vehículos)
    return data?.items || data?.data?.items || data?.data || data?.list || [];
  };

  const sortBranches = (list) => {
    const copy = Array.isArray(list) ? [...list] : [];
    copy.sort((a, b) => {
      const ac = (a?.code || "").toString();
      const bc = (b?.code || "").toString();
      if (ac && bc && ac !== bc)
        return ac.localeCompare(bc, undefined, { numeric: true });
      return (a?.name || "")
        .toString()
        .localeCompare((b?.name || "").toString(), undefined, {
          numeric: true,
        });
    });
    return copy;
  };

  const loadRefs = async () => {
    // branches (misma lógica robusta que Vehículos)
    try {
      const { data } = await BranchesAPI.list({ page: 1, limit: 500, q: "" });
      const payload = normalizeBranchesPayload(data);
      setBranches(sortBranches(payload));
    } catch {
      setBranches([]);
    }

    // positions
    try {
      const res = await PositionsAPI.list({
        page: 1,
        limit: 500,
        q: "",
        active: "true",
      });
      // Compat: PositionsAPI puede devolver {items,...} (nuevo contrato) o {data} (axios) en módulos antiguos.
      const items =
        res?.items ??
        res?.data?.items ??
        res?.data?.data?.items ??
        res?.data?.data ??
        res?.data ??
        [];
      setPositions(Array.isArray(items) ? items : []);
    } catch {
      setPositions([]);
    }
  };

  const mapToForm = (p) => ({
    dni: p.dni || "",
    firstName: p.firstName || "",
    lastName: p.lastName || "",
    phone: p.phone || "",
    email: p.email || "",
    birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : "",
    birthPlace: p.birthPlace || "",
    nationality: p.nationality || "",
    hireDate: p.hireDate ? String(p.hireDate).slice(0, 10) : "",
    active: p.active !== false,

    addressLine1: p.address?.line1 || "",
    addressCity: p.address?.city || "",
    // addressComuna: p.address?.comuna || "",
    // addressRegion: p.address?.region || "",
    addressRegion: normalizeRegion(p.address?.region || ""),
    addressComuna: normalizeComuna(p.address?.region || "", p.address?.comuna || ""),

    addressCountry: p.address?.country || "CL",

    branchId: pickId(p.branchId),
    positionId: pickId(p.positionId),
  });

  const loadPerson = async () => {
    if (isNew) {
      setPersonDoc(null);
      const base = { ...form };
      setInitial(base);
      setInitialSnapshot(buildPayloadFromForm(base));
      return;
    }

    setLoading(true);
    try {
      const { data } = await PeopleAPI.get(id);
      const p = data.item;
      setPersonDoc(p);

      const mapped = mapToForm(p);
      setForm(mapped);
      setInitial(mapped);
      setInitialSnapshot(buildPayloadFromForm(mapped));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
  }, []);
  useEffect(() => {
    loadPerson();
  }, [id]); // eslint-disable-line

  //modificacion
  //   
  const deepSort = (v) => {
    if (Array.isArray(v)) return v.map(deepSort);
    if (v && typeof v === "object" && v.constructor === Object) {
      return Object.keys(v)
        .sort()
        .reduce((acc, k) => {
          acc[k] = deepSort(v[k]);
          return acc;
        }, {});
    }
    return v;
  };

  const sameObject = (a, b) => {
    try {
      return JSON.stringify(deepSort(a)) === JSON.stringify(deepSort(b));
    } catch {
      return false;
    }
  };

  //   const out = { ...form }
  //   if (!out.positionId) out.positionId = null
  //   if (!out.email) delete out.email
  //   return out
  // }, [form])

  
  const toDateOrNull = (v) => (v ? new Date(`${v}T00:00:00.000Z`) : null);

  const buildPayloadFromForm = (f) => {
    const out = { ...f };

    out.birthDate = toDateOrNull(out.birthDate);
    out.hireDate = toDateOrNull(out.hireDate);

    // address (opcional): solo enviamos si hay datos reales.
    const address = {
      line1: (out.addressLine1 || "").trim(),
      city: (out.addressCity || "").trim(),
      comuna: (out.addressComuna || "").trim(),
      region: (out.addressRegion || "").trim(),
      country: ((out.addressCountry || "CL").trim() || "CL").toUpperCase(),
    };
    delete out.addressLine1;
    delete out.addressCity;
    delete out.addressComuna;
    delete out.addressRegion;
    delete out.addressCountry;

    const hasAddress = Boolean(
      address.line1 || address.city || address.comuna || address.region,
    );
    if (hasAddress) out.address = address;
    else delete out.address;

    // Limpieza opcionales
    if (!out.positionId) out.positionId = null;
    if (!String(out.phone || "").trim()) delete out.phone;
    if (!String(out.email || "").trim()) delete out.email;

    return out;
  };

  const payload = useMemo(() => buildPayloadFromForm(form), [form]);

  useEffect(() => {
    console.log("regionesComunas:", regionesComunas);
    console.log("REGIONES length:", REGIONES.length);
    console.log("Ejemplo región:", REGIONES[0]);
  }, [REGIONES]);

    const cancelChanges = async () => {
    // Si no hay cambios, salir al listado
    if (!hasUnsavedChanges) {
      navigate("/people");
      return;
    }

    // Si estás creando: cancelar = salir al listado (no tiene sentido "restaurar")
    if (isNew) {
      const ok = window.confirm("Hay cambios sin guardar. ¿Deseas salir?");
      if (!ok) return;
      window.__FLEETCORE_UNSAVED__ = false;
      navigate("/people");
      // navigate(`/people?q=${encodeURIComponent(savedItem?.dni || dniFormatted)}&page=1`);

      return;
    }

    // Si estás editando: cancelar = restaurar datos desde BD
    const ok = window.confirm("Hay cambios sin guardar. ¿Deseas restaurar?");
    if (!ok) return;
    await loadPerson();
  };

  const save = async () => {
    const missing = [];
    const dniRaw = String(form.dni || "").trim();

    if (!dniRaw) missing.push("RUN");
    else if (!runOk) missing.push("RUN");

    if (!String(form.firstName || "").trim()) missing.push("Nombres");
    if (!String(form.lastName || "").trim()) missing.push("Apellidos");
    if (!String(form.branchId || "").trim()) missing.push("Sucursal");

    if (dniDup) {
      alert(dniDupMsg || "Ya existe una persona registrada con este RUN");
      return;
    }

    if (missing.length) {
      alert(
        "Existen errores en el formulario. Revisa los campos obligatorios.",
      );
      return;
    }

    const dniFormatted = formatRunWithDash(dniRaw) || dniRaw;

    // opcional: refleja el formato en UI
    if (dniFormatted !== form.dni) {
      setForm((s) => ({ ...s, dni: dniFormatted }));
    }

    const payloadToSend = { ...payload, dni: dniFormatted };
    // Si NO hay cambios (y no estamos creando), no hacemos nada y volvemos al listado.
    if (!isNew && initialSnapshot && sameObject(initialSnapshot, payloadToSend)) {
      navigate("/people?page=1");
      return;
    }


    setSaving(true);
    try {
      const { data } = isNew
        ? await PeopleAPI.create(payloadToSend)
        : await PeopleAPI.update(id, payloadToSend);

      const savedItem = data.item;

      if (isNew) {
        // navigate(
        //   `/people?q=${encodeURIComponent(savedItem?.dni || dniFormatted)}&page=1`,
        // );
        // navigate(`/people?q=${encodeURIComponent(savedItem?.dni || dniFormatted)}&page=1`);
        navigate("/people?page=1");



        return;
      }

      // Guardado OK: volver al listado
      navigate("/people?page=1");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message;

      if (err?.response?.status === 400) {
        alert(msg || "Existen errores en el formulario. Revisa los campos.");
      } else if (err?.response?.status === 409) {
        alert(msg || "Ya existe una persona registrada con este RUN");
      } else {
        alert(msg || "No fue posible guardar");
      }
    } finally {
      setSaving(false);
    }
  };

   const title = isNew
    ? "Nueva persona"
    : `Persona: ${form.lastName} ${form.firstName}`;

  return (
    <div className="p-6 space-y-6">
      <UnsavedChangesGuard when={hasUnsavedChanges} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600">RRHH — ficha por pestañas.</p>

          {/* Validación RUN */}
          {dniDup && (
            <div className="mt-2 text-sm text-red-600">{dniDupMsg}</div>
          )}
          {checkingDni && (
            <div className="mt-2 text-sm text-gray-500">Validando RUN…</div>
          )}
        </div>
      </div>

      <div className="border-b -mx-6 px-6 md:mx-0 md:px-0 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
        {TABS.map((t) => {
          const disabled =
            isNew &&
            (t.key === "licenses" || t.key === "files" || t.key === "tests");

          return (
            <button
              key={t.key}
              type="button"
              disabled={disabled}
              className={`px-4 py-2 text-sm rounded-md border transition ${tab === t.key
                ? "text-white"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              style={
                tab === t.key
                  ? {
                    background: "var(--fc-primary)",
                    borderColor: "var(--fc-primary)",
                  }
                  : disabled
                    ? { opacity: 0.55, cursor: "not-allowed" }
                    : undefined
              }
              onClick={() => {
                if (disabled) return;
                setTab(t.key);
              }}
            >
              {t.label}
            </button>
          );
        })}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Cargando…</div>
      ) : (
        <>
          {tab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
              <label className="text-sm">
                <div className="text-gray-600 mb-1">RUN *</div>
                <input
                  className={`border rounded px-3 h-[38px] w-full ${!runOk ? "border-red-500" : "border-gray-400"}`}
                  placeholder="Ej: 12.345.678-5"
                  value={form.dni}
                  disabled={isView}
                  onChange={(e) => setForm((s) => ({ ...s, dni: e.target.value }))}
                  onBlur={async () => {
                    const formatted = formatRunWithDash(form.dni);
                    if (formatted && formatted !== form.dni) {
                      setForm((s) => ({ ...s, dni: formatted }));
                    }
                    await checkDniDuplicate(formatted || form.dni);
                  }}
                />
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Nombres *</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  placeholder="Ej: Juan Ignacio"
                  value={form.firstName}
                  disabled={isView}
                  onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                />
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Apellidos *</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  placeholder="Ej: Valencia Pacheco"
                  value={form.lastName}
                  disabled={isView}
                  onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                />
              </label>

              {!runOk && (
                <div className="text-xs text-red-600 md:col-span-3 -mt-1">
                  RUN inválido (verificación Módulo 11).
                </div>
              )}

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Teléfono</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  placeholder="Ej: +56 9 1234 5678"
                  value={form.phone}
                  disabled={isView}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                />
              </label>

              <label className="text-sm md:col-span-2">
                <div className="text-gray-600 mb-1">Email</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  placeholder="Ej: correo@dominio.com"
                  value={form.email}
                  disabled={isView}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
              </label>
<label className="text-sm">
                <div className="text-gray-600 mb-1">Fecha nacimiento</div>
                <input
                  type="date"
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.birthDate}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, birthDate: e.target.value }))
                  }
                />
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Lugar nacimiento</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.birthPlace}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, birthPlace: e.target.value }))
                  }
                  placeholder="Ej: Santiago"
                />
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Nacionalidad</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.nationality}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, nationality: e.target.value }))
                  }
                  placeholder="Ej: Chilena"
                />
              </label>

              {/* Dirección (opcional) */}
              <label className="text-sm md:col-span-3">
                <div className="text-gray-600 mb-1">Dirección (línea 1)</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressLine1}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, addressLine1: e.target.value }))
                  }
                  placeholder="Calle y número"
                />
              </label>
              {/* //aqui */}
              <label className="text-sm">
                <div className="text-gray-600 mb-1">Región (residencia)</div>
                <select
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressRegion || ""}
                  onChange={(e) => {
                    const nextRegion = e.target.value;
                    setForm((s) => ({
                      ...s,
                      addressRegion: nextRegion,
                      addressComuna: "",
                    }));
                  }}
                >
                  <option value="">— Selecciona región —</option>
                  {REGIONES.map((r) => (
                    <option key={r.region} value={r.region}>
                      {r.region}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Comuna (residencia)</div>
                <select
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressComuna || ""}
                  onChange={(e) => setForm((s) => ({ ...s, addressComuna: e.target.value }))}
                  disabled={!form.addressRegion}
                >
                  <option value="">— Selecciona comuna —</option>
                  {comunasForSelectedRegion.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {/* <div className="text-xs text-gray-500 mt-1">
                  Valor actual región: {String(form.addressRegion || "—")}
                </div> */}
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Ciudad (residencia)</div>
                <input
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressCity}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, addressCity: e.target.value }))
                  }
                  placeholder="Ej: Santiago"
                />
              </label>
              <label className="text-sm">
                <div className="text-gray-600 mb-1">País</div>
                <select
                  className="border rounded px-3 h-[38px] w-full"
                  value={form.addressCountry}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, addressCountry: e.target.value }))
                  }
                >
                  <option value="CL">CL</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm md:col-span-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, active: e.target.checked }))
                  }
                />
                Activo
              </label>
            </div>
          )}

          {tab === "org" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded p-4">
              <label className="text-sm">
                <div className="text-gray-600 mb-1">Sucursal *</div>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={form.branchId}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, branchId: e.target.value }))
                  }
                >
                  <option value="">— Selecciona sucursal —</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Cargo</div>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={form.positionId || ""}
                  disabled={isView}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, positionId: e.target.value }))
                  }
                >
                  <option value="">— Sin cargo —</option>
                  {positions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-gray-600 mb-1">Fecha contratación</div>
                <input
                  type="date"
                  className="border rounded px-3 py-2 w-full"
                  value={form.hireDate}
                  disabled={isView}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, hireDate: e.target.value }))
                  }
                />
              </label>
            </div>
          )}

          {tab === "licenses" && (
            <LicensesTab
              person={personDoc || { _id: isNew ? null : id, licenses: [] }}
              canEdit={canEdit}
              onDirtyChange={setSubDirty}
              onEditingChange={setSubEditing}
              onChange={(updater) => {
                setPersonDoc((prev) =>
                  typeof updater === "function"
                    ? updater(prev || { _id: id, licenses: [] })
                    : updater,
                );
              }}
            />
          )}

          {tab === "files" && (
            <FilesTab
              canEdit={canEdit}
              isView={isView}
              person={
                personDoc || {
                  _id: isNew ? null : id,
                  photo: null,
                  documents: [],
                }
              }
              onPersonReload={loadPerson}
            />
          )}

          {tab === "tests" && (
            <DrivingTestsTab
              canEdit={canEdit}
              isView={isView}
              person={
                personDoc || { _id: isNew ? null : id, branchId: form.branchId }
              }
              onPersonReload={loadPerson}
              onDirtyChange={setSubDirty}
            />
          )}

          {isNew && (
            <div className="text-sm text-amber-700 border border-amber-200 bg-amber-50 rounded p-3">
              Nota: para Licencias / Archivos / Pruebas primero debes guardar la
              persona.
            </div>
          )}
        </>
      )}

      {/* Acciones inferiores (únicas) */}


      <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-slate-200 p-3 flex justify-end gap-2">
        {subEditing ? null : isView ? (
          <>
            <button
              type="button"
              className="rounded-md border border-gray-400 px-4 py-2 text-sm"
              onClick={() => navigate("/people?page=1")}
              disabled={saving || loading}
            >
              Volver
            </button>
            <button
              type="button"
              className="rounded-md text-white px-4 py-2 text-sm"
              style={{ background: "var(--fc-primary)" }}
              onClick={goEdit}
              disabled={saving || loading}
            >
              Editar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="rounded-md border border-gray-400 px-4 py-2 text-sm"
              onClick={cancelChanges}
              disabled={saving || loading}
            >
              {hasUnsavedChanges ? "Cancelar" : "Volver"}
            </button>

            <button
              type="button"
              className="rounded-md text-white px-4 py-2 text-sm disabled:opacity-50"
              style={{ background: "var(--fc-primary)" }}
              onClick={save}
              disabled={saving || loading || checkingDni || dniDup}
            >
              Guardar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
