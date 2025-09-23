import { http } from './http';
export const PurchasesAPI = {
  orders: (params='') => http(`/purchase-orders${params}`),
  receipts: (params='') => http(`/purchase-receipts${params}`),
  bills: (params='') => http(`/purchase-bills${params}`)
};