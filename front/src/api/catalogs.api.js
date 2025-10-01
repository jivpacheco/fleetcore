import { http } from './http';
export const CatalogsAPI = {
  failureCodes: (params='') => http(`/failure-codes${params}`),
  repairMaster: (params='') => http(`/repair-master${params}`),
  sequences: (params='') => http(`/sequences${params}`),
  systemConfig: () => http('/system-config')
};