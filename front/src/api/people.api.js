// front/src/api/people.api.js
// -----------------------------------------------------------------------------
// API - Personas (RRHH)
// Mantiene el estilo FleetCore: objeto exportado + API_PREFIX centralizado.
// -----------------------------------------------------------------------------

import { api, API_PREFIX } from '../services/http'

export const PeopleAPI = {
  // Soporta filtros comunes para listado
  list: ({ page = 1, limit = 10, q = '', branchId = '', positionId = '', active = '' } = {}) =>
    api.get(`${API_PREFIX}/people`, { params: { page, limit, q, branchId, positionId, active } }),

  get: (id) => api.get(`${API_PREFIX}/people/${id}`),
  create: (data) => api.post(`${API_PREFIX}/people`, data),
  update: (id, data) => api.patch(`${API_PREFIX}/people/${id}`, data),
  remove: (id) => api.delete(`${API_PREFIX}/people/${id}`),
}

