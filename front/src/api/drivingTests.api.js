import { api, API_PREFIX } from '../services/http'

const prefix = `${API_PREFIX}`


export const DrivingTestsAPI = {
  list: ({ page=1, limit=50, personId='', branchId='' } = {}) =>
    api.get(`${prefix}/driving-tests`, { params: { page, limit, personId, branchId } }),

  get: (id) => api.get(`${prefix}/driving-tests/${id}`),

  start: (data) => api.post(`${prefix}/driving-tests/start`, data),

  finish: (id, data) => api.post(`${prefix}/driving-tests/${id}/finish`, data),

  remove: (id) => api.delete(`${prefix}/driving-tests/${id}`),
}
