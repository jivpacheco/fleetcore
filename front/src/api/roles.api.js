import { api, API_PREFIX } from '../services/http'

const prefix = `${API_PREFIX}`


export const RolesAPI = {
  list: ({ page=1, limit=50, q='', active='', scope='', isSystem='' } = {}) =>
    api.get(`${prefix}/roles`, { params: { page, limit, q, active, scope, isSystem } }),

  get: (id) => api.get(`${prefix}/roles/${id}`),
  create: (data) => api.post(`${prefix}/roles`, data),
  update: (id, data) => api.patch(`${prefix}/roles/${id}`, data),
  remove: (id) => api.delete(`${prefix}/roles/${id}`),
}
