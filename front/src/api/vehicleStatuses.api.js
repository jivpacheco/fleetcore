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
   
    async get(idOrKey) {
        // 1) Intento: pedir “detalle” por params (si el backend lo soporta)
        try {
            const { data } = await api.get("/api/v1/catalogs", {
                params: { key: KEY, id: idOrKey },
            })
            const items = pickItems(data)
            const direct = data?.item ?? data?.result?.item ?? data?.data?.item ?? items?.[0]
            if (direct && (
                String(direct?._id || "") === String(idOrKey) ||
                String(direct?.id || "") === String(idOrKey) ||
                String(direct?.key || "") === String(idOrKey) ||
                String(direct?.code || "") === String(idOrKey)
            )) {
                return direct
            }
        } catch {
            // seguimos al fallback
        }

        // 2) Fallback (definitivo): traer lista y encontrar el registro correcto
        const { data } = await api.get("/api/v1/catalogs", {
            params: { key: KEY, page: 1, limit: 500 },
        })
        const items = pickItems(data)

        const found = items.find((it) =>
            String(it?._id || "") === String(idOrKey) ||
            String(it?.id || "") === String(idOrKey) ||
            String(it?.key || "") === String(idOrKey) ||
            String(it?.code || "") === String(idOrKey)
        )

        return found ?? null
    },

    async create(payload) {
        const code = String(payload?.code || "").trim()
        const name = String(payload?.name || "").trim()
        const active = payload?.active !== false

        // Enviamos varias llaves típicas para cubrir el backend:
        const body = {
            // catálogo
            key: KEY,               // tu backend lo usa en list/get
            catalogKey: KEY,        // variante común
            catalog: KEY,           // variante común

            // item (lo que el error exige)
            label: name,
            name,                   // compat
            itemLabel: name,        // compat

            // "código del item": algunos backends le llaman key / itemKey / code
            itemKey: code,
            code,
            itemCode: code,

            // por si el backend usa key como "código del item"
            // (pero sin perder el key del catálogo):
            item: { key: code, label: name, active },

            active,
        }

        const { data } = await api.post("/api/v1/catalogs", body)
        return data
    },

    async update(id, payload) {
        const code = String(payload?.code || "").trim()
        const name = String(payload?.name || "").trim()
        const active = payload?.active !== false

        // Cuerpo estándar de item
        const item = { id, _id: id, key: code, label: name, active }

        // 1) Intento PATCH (muchos backends lo soportan y aquí sí excluyen por :id)
        try {
            const { data } = await api.patch(`/api/v1/catalogs/${id}`, {
                catalogKey: KEY,
                key: KEY,
                itemKey: code,
                label: name,
                active,
                item,
            })
            return data
        } catch (err) {
            // Si el backend no tiene PATCH para catalogs/:id, caeremos al POST (legacy)
            if (err?.response?.status && err.response.status !== 404 && err.response.status !== 405) {
                // Si es 409 u otro, seguimos a fallback porque puede ser bug del endpoint POST
            }
        }

        // 2) Fallback POST (lo que usas hoy), pero enviando id de todas las formas
        const body = {
            id,
            _id: id,
            itemId: id,

            // catálogo
            key: KEY,
            catalogKey: KEY,
            catalog: KEY,

            // item (campos exigidos por backend)
            label: name,
            itemKey: code,
            code,
            active,

            // item completo
            item,
        }

        const { data } = await api.post("/api/v1/catalogs", body)
        return data
    },



    async remove(id) {
        const body = {
            id,
            key: KEY,
            catalogKey: KEY,
            catalog: KEY,
            _action: "delete",
        }
        const { data } = await api.post("/api/v1/catalogs", body)
        return data
    },

};
