// front/src/api/roles.api.js
// -----------------------------------------------------------------------------
// API - Roles y Permisos
// Estilo FleetCore: objeto exportado + API_PREFIX centralizado.
// -----------------------------------------------------------------------------

import { api, API_PREFIX } from '../services/http'

export const RolesAPI = {
  list: ({ page = 1, limit = 50, q = '', scope = '', active = '' } = {}) =>
    api.get(`${API_PREFIX}/roles`, { params: { page, limit, q, scope, active } }),

  get: (id) => api.get(`${API_PREFIX}/roles/${id}`),
  create: (data) => api.post(`${API_PREFIX}/roles`, data),
  update: (id, data) => api.patch(`${API_PREFIX}/roles/${id}`, data),
  remove: (id) => api.delete(`${API_PREFIX}/roles/${id}`),
}
