// import { http } from './http';
// export const CatalogsAPI = {
//   failureCodes: (params='') => http(`/failure-codes${params}`),
//   repairMaster: (params='') => http(`/repair-master${params}`),
//   sequences: (params='') => http(`/sequences${params}`),
//   systemConfig: () => http('/system-config')
// };

import { api, API_PREFIX } from '../services/http'

// GET /catalogs/:key  → { key, items:[{_id, code, label, active}] }
export const getCatalog = (key) =>
  api.get(`${API_PREFIX}/catalogs/${key}`).then(r => r.data)

// POST /catalogs/:key/items  body:{code,label,active?}
export const addCatalogItem = (key, data) =>
  api.post(`${API_PREFIX}/catalogs/${key}/items`, data).then(r => r.data)

// PATCH /catalogs/:key/items/:itemId
export const patchCatalogItem = (key, itemId, data) =>
  api.patch(`${API_PREFIX}/catalogs/${key}/items/${itemId}`, data).then(r => r.data)

// DELETE /catalogs/:key/items/:itemId
export const removeCatalogItem = (key, itemId) =>
  api.delete(`${API_PREFIX}/catalogs/${key}/items/${itemId}`).then(r => r.data)
