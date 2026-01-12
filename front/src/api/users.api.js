import { api, API_PREFIX } from '../services/http'

export const UsersAPI = {
    list: ({ page = 1, limit = 50, q = '' } = {}) =>
        api.get(`${API_PREFIX}/users`, { params: { page, limit, q } }),

    get: (id) => api.get(`${API_PREFIX}/users/${id}`),

    create: (payload) => api.post(`${API_PREFIX}/users`, payload),

    update: (id, payload) => api.patch(`${API_PREFIX}/users/${id}`, payload),

    remove: (id) => api.delete(`${API_PREFIX}/users/${id}`),

    setPassword: (id, payload) => api.post(`${API_PREFIX}/users/${id}/password`, payload),
}
