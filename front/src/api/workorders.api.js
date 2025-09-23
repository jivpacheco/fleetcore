import { http } from './http';
export const WorkOrdersAPI = {
  list: (params='') => http(`/workorders${params}`),
  get: (id) => http(`/workorders/${id}`),
  create: (data) => http('/workorders', { method:'POST', body:data }),
  update: (id,data) => http(`/workorders/${id}`, { method:'PATCH', body:data }),
  remove: (id) => http(`/workorders/${id}`, { method:'DELETE' })
};