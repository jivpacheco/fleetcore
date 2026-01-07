import { api, API_PREFIX } from '../services/http'

const prefix = `${API_PREFIX}`


export const PositionsAPI = {
  list: ({ page=1, limit=50, q='', active='' } = {}) =>
    api.get(`${prefix}/positions`, { params: { page, limit, q, active } }),

  get: (id) => api.get(`${prefix}/positions/${id}`),
  create: (data) => api.post(`${prefix}/positions`, data),
  update: (id, data) => api.patch(`${prefix}/positions/${id}`, data),
  remove: (id) => api.delete(`${prefix}/positions/${id}`),
}
