// // // // import { api, API_PREFIX } from '../services/http'

// // // // const prefix = `${API_PREFIX}`


// // // // export const RolesAPI = {
// // // //   list: ({ page=1, limit=50, q='', active='', scope='', isSystem='' } = {}) =>
// // // //     api.get(`${prefix}/roles`, { params: { page, limit, q, active, scope, isSystem } }),

// // // //   get: (id) => api.get(`${prefix}/roles/${id}`),
// // // //   create: (data) => api.post(`${prefix}/roles`, data),
// // // //   update: (id, data) => api.patch(`${prefix}/roles/${id}`, data),
// // // //   remove: (id) => api.delete(`${prefix}/roles/${id}`),
// // // // }

// // // // front/src/api/roles.api.js
// // // // -----------------------------------------------------------------------------
// // // // Entidad: Roles
// // // // - Homologado al patrón vehicleStatuses.api.js
// // // // - Contrato list: { items, total, page, limit } (tolerante a variantes)
// // // // - get(): retorna item (no axios crudo)
// // // // - Normalización: code/name en MAYÚSCULAS para evitar mezcla
// // // // - update(): PATCH (por CORS / PUT bloqueado)
// // // // -----------------------------------------------------------------------------

// // // import { api, API_PREFIX } from "../services/http";

// // // const prefix = `${API_PREFIX}`;
// // // const BASE = `${prefix}/roles`;

// // // function pickItems(data) {
// // //   if (!data) return [];
// // //   if (Array.isArray(data)) return data;
// // //   if (Array.isArray(data.items)) return data.items;
// // //   if (Array.isArray(data.result?.items)) return data.result.items;
// // //   if (Array.isArray(data.data?.items)) return data.data.items;
// // //   if (Array.isArray(data.data)) return data.data;
// // //   return [];
// // // }

// // // function pickMeta(data) {
// // //   const total =
// // //     data?.total ??
// // //     data?.result?.total ??
// // //     data?.data?.total ??
// // //     (Array.isArray(data?.items) ? data.items.length : undefined) ??
// // //     (Array.isArray(data) ? data.length : 0);

// // //   const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
// // //   const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

// // //   return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
// // // }

// // // function normMaster(v) {
// // //   // Estándar FC para maestros/catálogos: evitar minúsculas/mayúsculas mezcladas
// // //   return String(v || "").trim().toUpperCase();
// // // }

// // // function normalizePayload(payload) {
// // //   return {
// // //     ...payload,
// // //     code: normMaster(payload?.code),
// // //     name: normMaster(payload?.name),
// // //     scope: payload?.scope || "BRANCH",
// // //     active: payload?.active !== false,
// // //     isSystem: Boolean(payload?.isSystem),
// // //     // permissions / permissionsText se envían tal cual (negocio)
// // //   };
// // // }

// // // export const RolesAPI = {
// // //   async list({ q = "", active = "", scope = "", isSystem = "", page = 1, limit = 20 } = {}) {
// // //     const { data } = await api.get(BASE, { params: { q, active, scope, isSystem, page, limit } });
// // //     return { items: pickItems(data), ...pickMeta(data) };
// // //   },

// // //   async get(id) {
// // //     const { data } = await api.get(`${BASE}/${id}`);
// // //     // tolerante a variantes
// // //     return data?.item ?? data?.result?.item ?? data?.data?.item ?? data ?? null;
// // //   },

// // //   async create(payload) {
// // //     const body = normalizePayload(payload);
// // //     const { data } = await api.post(BASE, body);
// // //     return data;
// // //   },

// // //   async update(id, payload) {
// // //     const body = normalizePayload(payload);
// // //     const { data } = await api.patch(`${BASE}/${id}`, body);
// // //     return data;
// // //   },

// // //   async remove(id) {
// // //     const { data } = await api.delete(`${BASE}/${id}`);
// // //     return data;
// // //   },
// // // };

// // // front/src/api/roles.api.js
// // // -----------------------------------------------------------------------------
// // // Roles API (tabla roles)
// // // - Estándar FleetCore: list() => { items,total,page,limit }
// // // - Tolerante a variantes {data/result/items}
// // // - get() retorna item
// // // - update(): PATCH (evita CORS con PUT)
// // // -----------------------------------------------------------------------------

// // import { api, API_PREFIX } from "../services/http";

// // const BASE = `${API_PREFIX}/roles`;

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

// //   return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
// // }

// // export const RolesAPI = {
// //   async list({ q = "", active = "", scope = "", isSystem = "", page = 1, limit = 20 } = {}) {
// //     const { data } = await api.get(BASE, { params: { q, active, scope, isSystem, page, limit } });
// //     return { items: pickItems(data), ...pickMeta(data) };
// //   },

// //   async get(id) {
// //     const { data } = await api.get(`${BASE}/${id}`);
// //     return data?.item ?? data?.result?.item ?? data?.data?.item ?? data ?? null;
// //   },

// //   async create(payload) {
// //     const { data } = await api.post(BASE, payload);
// //     return data;
// //   },

// //   async update(id, payload) {
// //     const { data } = await api.patch(`${BASE}/${id}`, payload);
// //     return data;
// //   },

// //   async remove(id) {
// //     const { data } = await api.delete(`${BASE}/${id}`);
// //     return data;
// //   },
// // };


// // front/src/api/roles.api.js
// // -----------------------------------------------------------------------------
// // Roles API (tabla roles)
// // - Estándar FleetCore: list() => { items,total,page,limit }
// // - PATCH para update (evita CORS/PUT)
// // -----------------------------------------------------------------------------
// import { api, API_PREFIX } from "../services/http";

// const BASE = `${API_PREFIX}/roles`;

// function pickItems(data) {
//   if (!data) return [];
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data.items)) return data.items;
//   if (Array.isArray(data.result?.items)) return data.result.items;
//   if (Array.isArray(data.data?.items)) return data.data.items;
//   if (Array.isArray(data.data)) return data.data;
//   return [];
// }

// function pickMeta(data) {
//   const total =
//     data?.total ??
//     data?.result?.total ??
//     data?.data?.total ??
//     (Array.isArray(data?.items) ? data.items.length : undefined) ??
//     (Array.isArray(data) ? data.length : 0);

//   const page = data?.page ?? data?.result?.page ?? data?.data?.page ?? 1;
//   const limit = data?.limit ?? data?.result?.limit ?? data?.data?.limit ?? 20;

//   return { total: Number(total || 0), page: Number(page || 1), limit: Number(limit || 20) };
// }

// export const RolesAPI = {
//   async list({ q = "", active = "", scope = "", isSystem = "", page = 1, limit = 20 } = {}) {
//     const { data } = await api.get(BASE, { params: { q, active, scope, isSystem, page, limit } });
//     return { items: pickItems(data), ...pickMeta(data) };
//   },

//   async get(id) {
//     const { data } = await api.get(`${BASE}/${id}`);
//     return data?.item ?? data?.result?.item ?? data?.data?.item ?? data ?? null;
//   },

//   async create(payload) {
//     const { data } = await api.post(BASE, payload);
//     return data;
//   },

//   async update(id, payload) {
//     const { data } = await api.patch(`${BASE}/${id}`, payload);
//     return data;
//   },

//   async remove(id) {
//     const { data } = await api.delete(`${BASE}/${id}`);
//     return data;
//   },
// };

// front/src/api/roles.api.js
// -----------------------------------------------------------------------------
// Roles API (tabla roles)
// - Estándar FleetCore: list() => { items,total,page,limit }
// - PATCH para update (evita CORS/PUT)
// -----------------------------------------------------------------------------
import { api, API_PREFIX } from "../services/http";

const BASE = `${API_PREFIX}/roles`;

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

export const RolesAPI = {
  async list({ q = "", active = "", scope = "", isSystem = "", page = 1, limit = 20 } = {}) {
    const { data } = await api.get(BASE, { params: { q, active, scope, isSystem, page, limit } });
    return { items: pickItems(data), ...pickMeta(data) };
  },

  async get(id) {
    const { data } = await api.get(`${BASE}/${id}`);
    return data?.item ?? data?.result?.item ?? data?.data?.item ?? data ?? null;
  },

  async create(payload) {
    const { data } = await api.post(BASE, payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.patch(`${BASE}/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`${BASE}/${id}`);
    return data;
  },
};
