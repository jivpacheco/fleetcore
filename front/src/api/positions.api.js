// import { api, API_PREFIX } from '../services/http'

// export const PositionsAPI = {
//   list: ({ page=1, limit=200, q='', active=true } = {}) =>
//     api.get(`${API_PREFIX}/positions`, { params: { page, limit, q, active } }),

//   create: (data) => api.post(`${API_PREFIX}/positions`, data),
//   update: (id, data) => api.patch(`${API_PREFIX}/positions/${id}`, data),
//   remove: (id) => api.delete(`${API_PREFIX}/positions/${id}`),
// }

// import { api, API_PREFIX } from '../services/http'

// export const PositionsAPI = {
//   list: ({ page = 1, limit = 200, q = '', active = true } = {}) =>
//     api.get(`${API_PREFIX}/positions`, { params: { page, limit, q, active } }),

//   get: (id) => api.get(`${API_PREFIX}/positions/${id}`),

//   create: (data) => api.post(`${API_PREFIX}/positions`, data),
//   update: (id, data) => api.patch(`${API_PREFIX}/positions/${id}`, data),
//   remove: (id) => api.delete(`${API_PREFIX}/positions/${id}`),
// }


import { api, API_PREFIX } from '../services/http';

export const PositionsAPI = {
  /**
   * Lista paginada de cargos
   * @param {Object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @param {string} params.q
   * @param {boolean} params.active
   */
  list: ({ page = 1, limit = 200, q = '', active = true } = {}) =>
    api.get(`${API_PREFIX}/positions`, {
      params: { page, limit, q, active },
    }),

  /**
   * Obtener un cargo por ID
   */
  get: (id) =>
    api.get(`${API_PREFIX}/positions/${id}`),

  /**
   * Crear cargo
   */
  create: (data) =>
    api.post(`${API_PREFIX}/positions`, data),

  /**
   * Actualizar cargo
   */
  update: (id, data) =>
    api.patch(`${API_PREFIX}/positions/${id}`, data),

  /**
   * Eliminación lógica (soft delete)
   */
  remove: (id) =>
    api.delete(`${API_PREFIX}/positions/${id}`),
};
