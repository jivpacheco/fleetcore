import { http } from './http';
export const InventoryAPI = {
  balances: (params='') => http(`/stock/balances${params}`),
  moves: (params='') => http(`/stock/moves${params}`),
  reservations: (params='') => http(`/reservations${params}`)
};