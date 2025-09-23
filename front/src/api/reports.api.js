import { http } from './http';
export const ReportsAPI = {
  kardex: (productId, from, to, locationId=null) =>
    http(`/reports/kardex?productId=${productId}&from=${from}&to=${to}${locationId?`&locationId=${locationId}`:''}`),
  otCosts: (params='') => http(`/reports/ot-costs${params}`),
  accidentKPIs: (params='') => http(`/reports/accidents${params}`)
};