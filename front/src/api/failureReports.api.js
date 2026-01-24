// front/src/api/failureReports.api.js
// -----------------------------------------------------------------------------
// API Catálogo Reporte de Fallas (cliente/sucursal)
// -----------------------------------------------------------------------------

import { api, API_PREFIX } from '../services/http'

export const FailureReportsAPI = {
  list: ({ page = 1, limit = 20, q = '', ...rest } = {}) =>
    api.get(`${API_PREFIX}/failure-reports`, { params: { page, limit, q, ...rest } }),

  get: (id) => api.get(`${API_PREFIX}/failure-reports/${id}`),
  create: (data) => api.post(`${API_PREFIX}/failure-reports`, data),
  update: (id, data) => api.patch(`${API_PREFIX}/failure-reports/${id}`, data),
  remove: (id) => api.delete(`${API_PREFIX}/failure-reports/${id}`),
}
