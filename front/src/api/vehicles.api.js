import { http } from './http';
export const VehiclesAPI = {
  list: (params='') => http(`/vehicles${params}`),
  get: (id) => http(`/vehicles/${id}`),
  create: (data) => http('/vehicles', { method:'POST', body:data }),
  update: (id,data) => http(`/vehicles/${id}`, { method:'PATCH', body:data }),
  remove: (id) => http(`/vehicles/${id}`, { method:'DELETE' })
};