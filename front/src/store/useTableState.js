// Guarda estado de tabla por recurso (branches, vehicles, tickets)
// - page: página actual
// - limit: items por página (user cambia 10/25/50)
// - q: búsqueda
import { create } from 'zustand'

export const useTableState = create((set, get) => ({
    // estado por recurso, ej: { branches: { page, limit, q }, vehicles: {...} }
    tables: {},

    // lectura con defaults
    getState: (key) => {
        const t = get().tables[key] || {}
        return { page: t.page ?? 1, limit: t.limit ?? 10, q: t.q ?? '' }
    },

    // setters
    setPage: (key, page) =>
        set((s) => ({ tables: { ...s.tables, [key]: { ...s.tables[key], page } } })),

    setLimit: (key, limit) =>
        set((s) => ({ tables: { ...s.tables, [key]: { ...s.tables[key], limit, page: 1 } } })),

    setQuery: (key, q) =>
        set((s) => ({ tables: { ...s.tables, [key]: { ...s.tables[key], q, page: 1 } } })),
}));
