// front/src/store/useTableState.js
// -----------------------------------------------------------------------------
// Estado de tablas por recurso (branches, vehicles, tickets)
// - getState(key): devuelve { page, limit, q } con defaults
// - setPage / setLimit / setQuery: actualizan y resetean page cuando corresponde
// - Estructura flexible: puedes agregar más claves sin cambiar el store
// -----------------------------------------------------------------------------

import { create } from 'zustand'

export const useTableState = create((set, get) => ({
  tables: {},

  getState: (key) => {
    const t = get().tables[key] || {}
    return { page: t.page ?? 1, limit: t.limit ?? 10, q: t.q ?? '' }
  },

  setPage: (key, page) =>
    set((s) => ({ tables: { ...s.tables, [key]: { ...s.tables[key], page } } })),

  setLimit: (key, limit) =>
    set((s) => ({ tables: { ...s.tables, [key]: { ...s.tables[key], limit, page: 1 } } })),

  setQuery: (key, q) =>
    set((s) => ({ tables: { ...s.tables, [key]: { ...s.tables[key], q, page: 1 } } })),
}))
