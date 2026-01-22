// // front/src/api/people.api.js
// // -----------------------------------------------------------------------------
// // API - Personas (RRHH)
// // Mantiene el estilo FleetCore: objeto exportado + API_PREFIX centralizado.
// // -----------------------------------------------------------------------------

// import { api, API_PREFIX } from '../services/http'

// export const PeopleAPI = {
//   // Soporta filtros comunes para listado
//   list: ({ page = 1, limit = 10, q = '', branchId = '', positionId = '', active = '' } = {}) =>
//     api.get(`${API_PREFIX}/people`, { params: { page, limit, q, branchId, positionId, active } }),

//   get: (id) => api.get(`${API_PREFIX}/people/${id}`),
//   create: (data) => api.post(`${API_PREFIX}/people`, data),
//   update: (id, data) => api.patch(`${API_PREFIX}/people/${id}`, data),
//   remove: (id) => api.delete(`${API_PREFIX}/people/${id}`),
// }

//v 220126
import { api, API_PREFIX } from '../services/http'

const prefix = `${API_PREFIX}`


export const PeopleAPI = {
  list: ({ page=1, limit=10, q='', branchId='', positionId='', active='' } = {}) =>
    api.get(`${prefix}/people`, { params: { page, limit, q, branchId, positionId, active } }),

  get: (id) => api.get(`${prefix}/people/${id}`),
  create: (data) => api.post(`${prefix}/people`, data),
  update: (id, data) => api.patch(`${prefix}/people/${id}`, data),
  remove: (id) => api.delete(`${prefix}/people/${id}`),

  // Licenses (subdoc)
  addLicense: (personId, data) => api.post(`${prefix}/people/${personId}/licenses`, data),
  updateLicense: (personId, licenseId, data) => api.patch(`${prefix}/people/${personId}/licenses/${licenseId}`, data),
  removeLicense: (personId, licenseId) => api.delete(`${prefix}/people/${personId}/licenses/${licenseId}`),

  // Media (mounted as /people/:personId/media)
  uploadPhoto: (personId, file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post(`${prefix}/people/${personId}/media/photo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadDocument: (personId, file, { label='' } = {}) => {
    const fd = new FormData()
    fd.append('file', file)
    if (label) fd.append('label', label)
    return api.post(`${prefix}/people/${personId}/media/documents`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteDocument: (personId, docId) =>
    api.delete(`${prefix}/people/${personId}/media/documents/${docId}`),
}

// version fallida 220126+
// import { api, API_PREFIX } from '../services/http'

// const prefix = `${API_PREFIX}`


// export const PeopleAPI = {
//   list: ({ page=1, limit=10, q='', branchId='', positionId='', active='' } = {}) =>
//     api.get(`${prefix}/people`, { params: { page, limit, q, branchId, positionId, active } }),

//   get: (id) => api.get(`${prefix}/people/${id}`),
//   create: (data) => api.post(`${prefix}/people`, data),
//   update: (id, data) => api.patch(`${prefix}/people/${id}`, data),
//   remove: (id) => api.delete(`${prefix}/people/${id}`),

//   // Licenses (subdoc)
//   addLicense: (personId, data) => api.post(`${prefix}/people/${personId}/licenses`, data),
//   updateLicense: (personId, licenseId, data) => api.patch(`${prefix}/people/${personId}/licenses/${licenseId}`, data),
//   removeLicense: (personId, licenseId) => api.delete(`${prefix}/people/${personId}/licenses/${licenseId}`),

//   // Media (mounted as /people/:personId/media)
//   uploadPhoto: (personId, file) => {
//     const fd = new FormData()
//     fd.append('file', file)
//     return api.post(`${prefix}/people/${personId}/media/photo`, fd, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     })
//   },

//   uploadDocument: (personId, file, { label='' } = {}) => {
//     const fd = new FormData()
//     fd.append('file', file)
//     if (label) fd.append('label', label)
//     return api.post(`${prefix}/people/${personId}/media/documents`, fd, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     })
//   },

//   deleteDocument: (personId, docId) =>
//     api.delete(`${prefix}/people/${personId}/media/documents/${docId}`),
// }
