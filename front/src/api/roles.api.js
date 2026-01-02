// import { api } from '../services/http';

// export const rolesApi = {
//   list: () => api.get('/api/v1/roles'),
//   create: (payload) => api.post('/api/v1/roles', payload),
//   update: (id, payload) => api.patch(`/api/v1/roles/${id}`, payload),
//   remove: (id) => api.delete(`/api/v1/roles/${id}`),
// };

import { api, API_PREFIX } from '../services/http';

export const RolesAPI = {
  /**
   * Lista paginada de roles
   * @param {Object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @param {string} params.q
   * @param {boolean} params.active
   */
  list: ({ page = 1, limit = 200, q = '', active = true } = {}) =>
    api.get(`${API_PREFIX}/roles`, {
      params: { page, limit, q, active },
    }),

  /**
   * Obtener rol por ID
   */
  get: (id) =>
    api.get(`${API_PREFIX}/roles/${id}`),

  /**
   * Crear rol
   */
  create: (data) =>
    api.post(`${API_PREFIX}/roles`, data),

  /**
   * Actualizar rol
   */
  update: (id, data) =>
    api.patch(`${API_PREFIX}/roles/${id}`, data),

  /**
   * Eliminación lógica (soft delete)
   */
  remove: (id) =>
    api.delete(`${API_PREFIX}/roles/${id}`),
};

