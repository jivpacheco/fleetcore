// // front/src/api/failureReports.api.js
// // -----------------------------------------------------------------------------
// // API Catálogo Reporte de Fallas (cliente/sucursal)
// // -----------------------------------------------------------------------------

// // import { api, API_PREFIX } from '../services/http'

// // export const FailureReportsAPI = {
// //   list: ({ page = 1, limit = 20, q = '', ...rest } = {}) =>
// //     api.get(`${API_PREFIX}/failure-reports`, { params: { page, limit, q, ...rest } }),

// //   get: (id) => api.get(`${API_PREFIX}/failure-reports/${id}`),
// //   create: (data) => api.post(`${API_PREFIX}/failure-reports`, data),
// //   update: (id, data) => api.patch(`${API_PREFIX}/failure-reports/${id}`, data),
// //   remove: (id) => api.delete(`${API_PREFIX}/failure-reports/${id}`),
// // }

// import { api, API_PREFIX } from '../services/http'

// const prefix = `${API_PREFIX}`

// export const FailureReportsAPI = {
//   list: ({ page=1, limit=20, q='', active='' } = {}) =>
//     api.get(`${prefix}/failure-reports`, { params: { page, limit, q, active } }),

//   get: (id) => api.get(`${prefix}/failure-reports/${id}`),

//   create: (payload) => api.post(`${prefix}/failure-reports`, payload),

//   update: (id, payload) => api.put(`${prefix}/failure-reports/${id}`, payload),

//   remove: (id) => api.delete(`${prefix}/failure-reports/${id}`),
// }


// front/src/api/failureReports.api.js
// -----------------------------------------------------------------------------
// API Catálogo Reporte de Fallas (cliente/sucursal)
// - CRUD estándar
// - Filtro active (vigencia lógica)
// - Preparado para Media (photo + documents[])
// -----------------------------------------------------------------------------

import { api, API_PREFIX } from '../services/http'

export const FailureReportsAPI = {
  list: ({ page = 1, limit = 20, q = '', active = '', ...rest } = {}) =>
    api.get(`${API_PREFIX}/failure-reports`, { params: { page, limit, q, active, ...rest } }),

  get: (id) => api.get(`${API_PREFIX}/failure-reports/${id}`),

  create: (data) => api.post(`${API_PREFIX}/failure-reports`, data),

  // Mantener PATCH (estándar FleetCore)
  update: (id, data) => api.patch(`${API_PREFIX}/failure-reports/${id}`, data),

  remove: (id) => api.delete(`${API_PREFIX}/failure-reports/${id}`),

  // Media (opcional hoy, pero estándar FleetCore)
  uploadPhoto: (id, file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post(`${API_PREFIX}/failure-reports/${id}/media/photo`, fd)
  },

  uploadDocument: (id, file, label = '') => {
    const fd = new FormData()
    fd.append('file', file)
    if (label) fd.append('label', label)
    return api.post(`${API_PREFIX}/failure-reports/${id}/media/documents`, fd)
  },

  deleteDocument: (id, docId) =>
    api.delete(`${API_PREFIX}/failure-reports/${id}/media/documents/${docId}`),
}
