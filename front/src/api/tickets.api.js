import { http } from './http';
export const TicketsAPI = {
  list: (params='') => http(`/tickets${params}`),
  get: (id) => http(`/tickets/${id}`),
  create: (data) => http('/tickets', { method:'POST', body:data }),
  update: (id,data) => http(`/tickets/${id}`, { method:'PATCH', body:data }),
  remove: (id) => http(`/tickets/${id}`, { method:'DELETE' })
};