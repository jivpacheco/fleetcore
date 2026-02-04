// // front/src/api/vehicleStatuses.api.js
// // -----------------------------------------------------------------------------
// // API: Catálogo → Estados de Vehículo (key=VEHICLE_STATUSES)
// // - Encapsula el acceso al endpoint genérico /api/v1/catalogs
// // - Mantiene contrato items/total/page/limit para listados
// // -----------------------------------------------------------------------------

// import { api } from "../services/http";

// const KEY = "VEHICLE_STATUSES";

// function extractItems(data) {
//     if (!data) return { items: [], total: 0 };
//     if (Array.isArray(data)) return { items: data, total: data.length };
//     if (Array.isArray(data.items)) return { items: data.items, total: data.total ?? data.items.length };
//     if (Array.isArray(data.result?.items))
//         return { items: data.result.items, total: data.result.total ?? data.result.items.length };
//     if (Array.isArray(data.data?.items))
//         return { items: data.data.items, total: data.data.total ?? data.data.items.length };
//     return { items: [], total: 0 };
// }

// export const VehicleStatusesAPI = {
//     async list({ q = "", page = 1, limit = 20, active = "all" } = {}) {
//         const params = { key: KEY, page, limit };
//         if (q) params.q = q;
//         // Nota: si el backend no soporta active, filtramos en frontend desde el List.
//         // Pero lo enviamos de todos modos si está implementado.
//         if (active && active !== "all") params.active = active === "active";

//         const { data } = await api.get("/api/v1/catalogs", { params });
//         const { items, total } = extractItems(data);

//         // Filtro de respaldo si backend no filtra por active
//         const filtered =
//             active === "all"
//                 ? items
//                 : items.filter((it) =>
//                     active === "active" ? it?.active !== false : it?.active === false
//                 );

//         const sorted = [...filtered].sort((a, b) =>
//             String(a?.label || "").localeCompare(String(b?.label || ""), undefined, {
//                 numeric: true,
//             })
//         );

//         return { items: sorted, total: Number(total || sorted.length) };
//     },

//     async getById(id) {
//         const { data } = await api.get(`/api/v1/catalogs/${id}`);
//         return data?.item || data?.data || data;
//     },

//     async create(payload) {
//         const body = { key: KEY, ...payload };
//         const { data } = await api.post("/api/v1/catalogs", body);
//         return data;
//     },

//     async update(id, payload) {
//         const body = { key: KEY, ...payload };
//         const { data } = await api.patch(`/api/v1/catalogs/${id}`, body);
//         return data;
//     },

//     async remove(id) {
//         const { data } = await api.delete(`/api/v1/catalogs/${id}`);
//         return data;
//     },
// };

// front/src/api/vehicleStatuses.api.js
// -----------------------------------------------------------------------------
// Catálogo: Estados de Vehículo (Vehicle Statuses)
// - Implementado sobre endpoint genérico /api/v1/catalogs con key VEHICLE_STATUSES
// - Contrato esperado: { items, total, page, limit } (tolerante a variantes)
// -----------------------------------------------------------------------------
import { api } from "../services/http";

const KEY = "VEHICLE_STATUSES";

function pickItems(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.result?.items)) return data.result.items;
    if (Array.isArray(data.data?.items)) return data.data.items;
    if (Array.isArray(data.data)) return data.data;
    return [];
}

function pickMeta(data) {
    const total =
        data?.total ??
        data?.result?.total ??
        data?.data?.total ??
        (Array.isArray(data?.items) ? data.items.length : undefined) ??
        (Array.isArray(data) ? data.length : 0);

    const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
    const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

    return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
}

export const VehicleStatusesAPI = {
    async list({ q = "", active = "", page = 1, limit = 20 } = {}) {
        const { data } = await api.get("/api/v1/catalogs", {
            params: { key: KEY, q, active, page, limit },
        });
        return { items: pickItems(data), ...pickMeta(data) };
    },

    async get(id) {
        const { data } = await api.get("/api/v1/catalogs", { params: { key: KEY, id } });
        // back puede devolver item suelto o items[]
        const items = pickItems(data);
        const item = data?.item ?? data?.result?.item ?? data?.data?.item ?? items?.[0] ?? null;
        return item;
    },

    async create(payload) {
        const { data } = await api.post("/api/v1/catalogs", { key: KEY, ...payload });
        return data;
    },

    async update(id, payload) {
        const { data } = await api.post("/api/v1/catalogs", { key: KEY, id, ...payload });
        return data;
    },

    async remove(id) {
        const { data } = await api.post("/api/v1/catalogs", { key: KEY, id, _action: "delete" });
        return data;
    },
};
