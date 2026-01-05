// front/src/api/positions.api.js
// -----------------------------------------------------------------------------
// API - Cargos (Positions)
// Estilo FleetCore: objeto exportado + API_PREFIX centralizado.
// -----------------------------------------------------------------------------

import { api, API_PREFIX } from '../services/http'

export const PositionsAPI = {
  list: ({ page = 1, limit = 50, q = '', active = '' } = {}) =>
    api.get(`${API_PREFIX}/positions`, { params: { page, limit, q, active } }),

  get: (id) => api.get(`${API_PREFIX}/positions/${id}`),
  create: (data) => api.post(`${API_PREFIX}/positions`, data),
  update: (id, data) => api.patch(`${API_PREFIX}/positions/${id}`, data),
  remove: (id) => api.delete(`${API_PREFIX}/positions/${id}`),
}
