// import { api, API_PREFIX } from '../services/http'

// const prefix = `${API_PREFIX}`


// export const PeopleAPI = {
//   list: ({ page=1, limit=10, q='', branchId='', positionId='', active='' } = {}) =>
//     api.get(`${prefix}/people`, { params: { page, limit, q, branchId, positionId, active } }),

//   get: (id) => api.get(`${prefix}/people/${id}`),
//   create: (data) => api.post(`${prefix}/people`, data),
//   update: (id, data) => api.patch(`${prefix}/people/${id}`, data),
//   remove: (id) => api.delete(`${prefix}/people/${id}`),
//   exists: ({ dni, excludeId } = {}) =>
//     api.get(`${prefix}/people/exists`, {
//       params: { dni, excludeId },
//     }),

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

//   deletePhoto: (personId) => api.delete(`${prefix}/people/${personId}/media/photo`),

//   // URL directa para descargar con nombre y extensión (servida por backend)
//   documentDownloadUrl: (personId, docId) => {
//     const base = api?.defaults?.baseURL || ''
//     return `${base}${prefix}/people/${personId}/media/documents/${docId}/download`
//   },
// }

import { api, API_PREFIX } from '../services/http'

const prefix = `${API_PREFIX}`


export const PeopleAPI = {
  list: ({ page=1, limit=10, q='', branchId='', positionId='', branchIds='', positionIds='', active='' } = {}) =>
    api.get(`${prefix}/people`, { params: { page, limit, q, branchId, positionId, branchIds, positionIds, active } }),

  get: (id) => api.get(`${prefix}/people/${id}`),
  create: (data) => api.post(`${prefix}/people`, data),
  update: (id, data) => api.patch(`${prefix}/people/${id}`, data),
  remove: (id) => api.delete(`${prefix}/people/${id}`),
  exists: ({ dni, excludeId } = {}) =>
    api.get(`${prefix}/people/exists`, {
      params: { dni, excludeId },
    }),

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

  deletePhoto: (personId) => api.delete(`${prefix}/people/${personId}/media/photo`),

  // URL directa para descargar con nombre y extensión (servida por backend)
  documentDownloadUrl: (personId, docId) => {
    const base = api?.defaults?.baseURL || ''
    return `${base}${prefix}/people/${personId}/media/documents/${docId}/download`
  },
}