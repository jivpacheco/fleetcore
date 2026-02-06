// front/src/hooks/useListQueryParams.js
// -----------------------------------------------------------------------------
// FleetCore Standard v1.0
// - Maneja page/limit/q y filtros (active, etc.) en la URL usando useSearchParams.
// - Evita bugs de "tabla carga pero no renderiza" al estandarizar contrato.
// -----------------------------------------------------------------------------
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

function num(v, d) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
}

export default function useListQueryParams(defaults = {}) {
  const [sp, setSp] = useSearchParams();

  const state = useMemo(() => {
    const page = num(sp.get("page"), defaults.page ?? 1);
    const limit = num(sp.get("limit"), defaults.limit ?? 20);
    const q = sp.get("q") ?? (defaults.q ?? "");
    const active = sp.get("active") ?? (defaults.active ?? "");
    return { page, limit, q, active };
  }, [sp, defaults.page, defaults.limit, defaults.q, defaults.active]);

  const set = (patch, opts = { resetPage: false }) => {
    const next = new URLSearchParams(sp);
    const p = { ...patch };

    if (opts.resetPage) next.set("page", "1");

    Object.entries(p).forEach(([k, v]) => {
      if (v === undefined || v === null || String(v) === "") next.delete(k);
      else next.set(k, String(v));
    });

    // Asegura que page/limit existan
    if (!next.get("page")) next.set("page", String(defaults.page ?? 1));
    if (!next.get("limit")) next.set("limit", String(defaults.limit ?? 20));

    setSp(next);
  };

  return { ...state, set };
}
