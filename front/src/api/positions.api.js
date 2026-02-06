// // // import { api, API_PREFIX } from '../services/http'

// // // const prefix = `${API_PREFIX}`

// // // export const PositionsAPI = {
// // //   list: ({ page=1, limit=50, q='', active='' } = {}) =>
// // //     api.get(`${prefix}/positions`, { params: { page, limit, q, active } }),

// // //   get: (id) => api.get(`${prefix}/positions/${id}`),
// // //   create: (data) => api.post(`${prefix}/positions`, data),
// // //   update: (id, data) => api.patch(`${prefix}/positions/${id}`, data),
// // //   remove: (id) => api.delete(`${prefix}/positions/${id}`),
// // // }
// // // front/src/api/positions.api.js
// // // -----------------------------------------------------------------------------
// // // Catálogo: Cargos (Positions)
// // // - Implementado sobre endpoint genérico /api/v1/catalogs con key POSITIONS
// // // - Contrato esperado: { items, total, page, limit } (tolerante a variantes)
// // // - Payload tolerante (label/itemKey/item/etc.) igual al módulo estable
// // // -----------------------------------------------------------------------------
// // import { api } from "../services/http";

// // const KEY = "POSITIONS"; // <-- AJUSTA si tu backend usa otro key

// // function pickItems(data) {
// //   if (!data) return [];
// //   if (Array.isArray(data)) return data;
// //   if (Array.isArray(data.items)) return data.items;
// //   if (Array.isArray(data.result?.items)) return data.result.items;
// //   if (Array.isArray(data.data?.items)) return data.data.items;
// //   if (Array.isArray(data.data)) return data.data;
// //   return [];
// // }

// // function pickMeta(data) {
// //   const total =
// //     data?.total ??
// //     data?.result?.total ??
// //     data?.data?.total ??
// //     (Array.isArray(data?.items) ? data.items.length : undefined) ??
// //     (Array.isArray(data) ? data.length : 0);

// //   const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
// //   const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

// //   return {
// //     total: Number(total || 0),
// //     page: Number(page || 1),
// //     limit: Number(limit || 20),
// //   };
// // }

// // export const PositionsAPI = {  
// //   async list({ q = "", active = "", page = 1, limit = 20 } = {}) {
// //     const { data } = await api.get("/api/v1/catalogs", {
// //       params: { key: KEY, q, active, page, limit },
// //     });
// //     return { items: pickItems(data), ...pickMeta(data) };
// //   },

// //   async get(idOrKey) {
// //     // 1) Intento: pedir “detalle” por params (si el backend lo soporta)
// //     try {
// //       const { data } = await api.get("/api/v1/catalogs", {
// //         params: { key: KEY, id: idOrKey },
// //       });

// //       const items = pickItems(data);
// //       const direct =
// //         data?.item ?? data?.result?.item ?? data?.data?.item ?? items?.[0];

// //       if (
// //         direct &&
// //         (String(direct?._id || "") === String(idOrKey) ||
// //           String(direct?.id || "") === String(idOrKey) ||
// //           String(direct?.key || "") === String(idOrKey) ||
// //           String(direct?.code || "") === String(idOrKey))
// //       ) {
// //         return direct;
// //       }
// //     } catch {
// //       // seguimos al fallback
// //     }

// //     // 2) Fallback: traer lista y encontrar el registro
// //     const { data } = await api.get("/api/v1/catalogs", {
// //       params: { key: KEY, page: 1, limit: 500 },
// //     });

// //     const items = pickItems(data);
// //     const found = items.find(
// //       (it) =>
// //         String(it?._id || "") === String(idOrKey) ||
// //         String(it?.id || "") === String(idOrKey) ||
// //         String(it?.key || "") === String(idOrKey) ||
// //         String(it?.code || "") === String(idOrKey),
// //     );

// //     return found ?? null;
// //   },

// //   async create(payload) {
// //     // Positions (tu Form) usa: name, description, active
// //     // Lo convertimos a patrón catalog:
// //     const name = String(payload?.name || "").trim();
// //     const description = String(payload?.description || "").trim();
// //     const active = payload?.active !== false;

// //     // Para catalog backend: "code" no existe en Positions.
// //     // Usamos itemKey = name (o un slug). Mantengo simple: itemKey = name.
// //     // Si tu backend exige un "código" separado, me dices y lo añadimos.
// //     const itemKey = name;

// //     const body = {
// //       // catálogo
// //       key: KEY,
// //       catalogKey: KEY,
// //       catalog: KEY,

// //       // item (campos típicos que piden backends legacy)
// //       label: name,
// //       name,
// //       itemLabel: name,

// //       itemKey,
// //       code: itemKey,
// //       itemCode: itemKey,

// //       description,

// //       // item completo (por si backend usa objeto)
// //       item: { key: itemKey, label: name, description, active },

// //       active,
// //     };

// //     const { data } = await api.post("/api/v1/catalogs", body);
// //     return data;
// //   },

// //   async update(id, payload) {
// //     const name = String(payload?.name || "").trim();
// //     const description = String(payload?.description || "").trim();
// //     const active = payload?.active !== false;

// //     const itemKey = name;

// //     const item = {
// //       id,
// //       _id: id,
// //       key: itemKey,
// //       label: name,
// //       description,
// //       active,
// //     };

// //     // 1) Intento PATCH (si existe)
// //     try {
// //       const { data } = await api.patch(`/api/v1/catalogs/${id}`, {
// //         catalogKey: KEY,
// //         key: KEY,
// //         itemKey,
// //         label: name,
// //         description,
// //         active,
// //         item,
// //       });
// //       return data;
// //     } catch (err) {
// //       if (
// //         err?.response?.status &&
// //         err.response.status !== 404 &&
// //         err.response.status !== 405
// //       ) {
// //         // seguimos a fallback
// //       }
// //     }

// //     // 2) Fallback POST (legacy)
// //     const body = {
// //       id,
// //       _id: id,
// //       itemId: id,

// //       key: KEY,
// //       catalogKey: KEY,
// //       catalog: KEY,

// //       label: name,
// //       itemKey,
// //       code: itemKey,
// //       description,
// //       active,

// //       item,
// //     };

// //     const { data } = await api.post("/api/v1/catalogs", body);
// //     return data;
// //   },

// //   async remove(id) {
// //     const body = {
// //       id,
// //       key: KEY,
// //       catalogKey: KEY,
// //       catalog: KEY,
// //       _action: "delete",
// //     };
// //     const { data } = await api.post("/api/v1/catalogs", body);
// //     return data;
// //   },
// // };


// // front/src/api/positions.api.js
// import { api } from "../services/http";

// const BASE_URL = "/api/v1/positions"; // o "/api/v1/positions"

// function pickItems(data) {
//   if (!data) return [];
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data.items)) return data.items;
//   if (Array.isArray(data.result?.items)) return data.result.items;
//   if (Array.isArray(data.data?.items)) return data.data.items;
//   if (Array.isArray(data.data)) return data.data;
//   return [];
// }

// function pickMeta(data, fallbackCount = 0) {
//   const total =
//     data?.total ??
//     data?.result?.total ??
//     data?.data?.total ??
//     fallbackCount;

//   const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
//   const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

//   return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
// }

// export const PositionsAPI = {
//   async list({ q = "", active = "", page = 1, limit = 20 } = {}) {
//     const { data } = await api.get(BASE_URL, { params: { q, active, page, limit } });
//     const items = pickItems(data);
//     return { items, ...pickMeta(data, items.length) };
//   },

//   async get(id) {
//     const { data } = await api.get(`${BASE_URL}/${id}`);
//     // tolerante a {item} o item plano
//     return data?.item ?? data?.result?.item ?? data?.data?.item ?? data;
//   },

//   async create(payload) {
//     const { data } = await api.post(BASE_URL, payload);
//     return data;
//   },

//   async update(id, payload) {
//     const { data } = await api.patch(`${BASE_URL}/${id}`, payload);
//     return data;
//   },

//   async remove(id) {
//     const { data } = await api.delete(`${BASE_URL}/${id}`);
//     return data;
//   },
// };

// front/src/api/positions.api.js
// -----------------------------------------------------------------------------
// Entidad: Positions (tabla positions)
// - Homologado al patrón de vehicleStatuses.api.js
// - Contrato list: { items, total, page, limit } (tolerante a variantes)
// - Update: PATCH (por CORS: PUT bloqueado)
// - Normalización: trim + UPPERCASE para evitar mezcla
// -----------------------------------------------------------------------------

import { api } from "../services/http";

const BASE = "/api/v1/positions";

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

function norm(v) {
  // estándar de normalización para maestros/catálogos
  return String(v || "").trim().toUpperCase();
}

function normalizePayload(payload) {
  return {
    name: norm(payload?.name),
    description: norm(payload?.description),
    active: payload?.active !== false,
  };
}

export const PositionsAPI = {
  async list({ q = "", active = "", page = 1, limit = 20 } = {}) {
    const { data } = await api.get(BASE, { params: { q, active, page, limit } });
    return { items: pickItems(data), ...pickMeta(data) };
  },

  async get(id) {
    // 1) Intento directo por :id
    try {
      const { data } = await api.get(`${BASE}/${id}`);
      // tolerante a varias formas
      const direct = data?.item ?? data?.result?.item ?? data?.data?.item ?? data;
      if (direct && (String(direct?._id || "") === String(id) || String(direct?.id || "") === String(id))) {
        return direct;
      }
      // si vino un objeto aunque no matchee ids, igual lo devolvemos
      if (direct && typeof direct === "object") return direct;
    } catch {
      // seguimos al fallback
    }

    // 2) Fallback: lista grande y encontrar
    const { data } = await api.get(BASE, { params: { page: 1, limit: 500 } });
    const items = pickItems(data);

    const found = items.find(
      (it) => String(it?._id || it?.id || "") === String(id)
    );

    return found ?? null;
  },

  async create(payload) {
    const body = normalizePayload(payload);
    const { data } = await api.post(BASE, body);
    return data;
  },

  async update(id, payload) {
    const body = normalizePayload(payload);

    // 1) Intento PATCH (recomendado por tu CORS)
    try {
      const { data } = await api.patch(`${BASE}/${id}`, body);
      return data;
    } catch (err) {
      // si el backend no soporta PATCH
      if (err?.response?.status && err.response.status !== 404 && err.response.status !== 405) {
        // para 409 u otros, igualmente intentamos fallback si aplica
      }
    }

    // 2) Fallback POST (legacy: algunos backends aceptan POST para update)
    // Si tu backend NO tiene este comportamiento, lo quitamos.
    const { data } = await api.post(`${BASE}/${id}`, body);
    return data;
  },

  async remove(id) {
    // 1) Intento DELETE estándar
    try {
      const { data } = await api.delete(`${BASE}/${id}`);
      return data;
    } catch (err) {
      // 2) Fallback legacy si tu backend no soporta DELETE
      // Descomenta solo si lo necesitas:
      // const { data } = await api.post(`${BASE}/${id}`, { _action: "delete" });
      // return data;

      throw err;
    }
  },
};
