import { api, API_PREFIX } from '../services/http'

export const PeopleAPI = {
  list: ({ page=1, limit=10, q='', branchId='', positionId='', active='' } = {}) =>
    api.get(`${API_PREFIX}/people`, { params: { page, limit, q, branchId, positionId, active } }),

  get: (id) => api.get(`${API_PREFIX}/people/${id}`),
  create: (data) => api.post(`${API_PREFIX}/people`, data),
  update: (id, data) => api.patch(`${API_PREFIX}/people/${id}`, data),
  remove: (id) => api.delete(`${API_PREFIX}/people/${id}`),
}
