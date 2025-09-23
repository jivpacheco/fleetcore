import { http } from './http';
export const BranchesAPI = {
  list: (params='') => http(`/branches${params}`),
  get: (id) => http(`/branches/${id}`),
  create: (data) => http('/branches', { method:'POST', body:data }),
  update: (id,data) => http(`/branches/${id}`, { method:'PATCH', body:data }),
  remove: (id) => http(`/branches/${id}`, { method:'DELETE' })
};