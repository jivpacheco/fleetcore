// front/src/api/repairs.api.js
// -----------------------------------------------------------------------------
// API Catálogo Reparaciones (taller)
// - CRUD estándar
// - Media: photo + documents[]
// -----------------------------------------------------------------------------

import { api, API_PREFIX } from '../services/http'

export const RepairsAPI = {
    list: ({ page = 1, limit = 20, q = '', ...rest } = {}) =>
        api.get(`${API_PREFIX}/repairs`, { params: { page, limit, q, ...rest } }),

    get: (id) => api.get(`${API_PREFIX}/repairs/${id}`),
    create: (data) => api.post(`${API_PREFIX}/repairs`, data),
    update: (id, data) => api.patch(`${API_PREFIX}/repairs/${id}`, data),
    remove: (id) => api.delete(`${API_PREFIX}/repairs/${id}`),

    // Media
    uploadPhoto: (id, file) => {
        const fd = new FormData()
        fd.append('file', file)
        return api.post(`${API_PREFIX}/repairs/${id}/media/photo`, fd)
    },

    uploadDocument: (id, file, label = '') => {
        const fd = new FormData()
        fd.append('file', file)
        if (label) fd.append('label', label)
        return api.post(`${API_PREFIX}/repairs/${id}/media/documents`, fd)
    },

    deleteDocument: (id, docId) =>
        api.delete(`${API_PREFIX}/repairs/${id}/media/documents/${docId}`),
}
