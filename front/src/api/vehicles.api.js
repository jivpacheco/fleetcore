// // front/src/api/vehicles.api.js
// import { api, API_PREFIX } from '../services/http';

// const qs = ({ page = 1, limit = 10, ...rest } = {}) =>
//   '?' + new URLSearchParams({ page, limit, ...rest }).toString();

// export const listVehicles   = (params = {}) => api.get(`${API_PREFIX}/vehicles${qs(params)}`).then(r => r.data);
// export const getVehicle     = (id)         => api.get(`${API_PREFIX}/vehicles/${id}`).then(r => r.data);
// export const createVehicle  = (data)       => api.post(`${API_PREFIX}/vehicles`, data).then(r => r.data);
// export const updateVehicle  = (id, data)   => api.patch(`${API_PREFIX}/vehicles/${id}`, data).then(r => r.data);
// export const removeVehicle  = (id)         => api.delete(`${API_PREFIX}/vehicles/${id}`).then(r => r.data);

// // Subidas
// export async function uploadVehiclePhoto(id, { file, category = 'BASIC', title = '' }) {
//   const fd = new FormData();
//   fd.append('file', file);
//   fd.append('category', category);
//   fd.append('title', title);
//   const { data } = await api.post(`${API_PREFIX}/vehicles/${id}/photos`, fd, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return data;
// }
// export async function uploadVehicleDocument(id, { file, category = 'LEGAL', label = '' }) {
//   const fd = new FormData();
//   fd.append('file', file);
//   fd.append('category', category);
//   fd.append('label', label);
//   const { data } = await api.post(`${API_PREFIX}/vehicles/${id}/documents`, fd, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return data;
// }

// // Eliminaciones
// export const deleteVehiclePhoto     = (id, photoId)    => api.delete(`${API_PREFIX}/vehicles/${id}/photos/${photoId}`).then(r=>r.data);
// export const deleteVehicleDocument  = (id, documentId) => api.delete(`${API_PREFIX}/vehicles/${id}/documents/${documentId}`).then(r=>r.data);



// front/src/api/vehicles.api.js
// -----------------------------------------------------------------------------
// API helper de Vehículos
// -----------------------------------------------------------------------------
import { api, API_PREFIX } from '../services/http';

const qs = (obj={}) => '?' + new URLSearchParams(obj).toString();

export const listVehicles = (params = {}) =>
  api.get(`${API_PREFIX}/vehicles${qs(params)}`).then(r => r.data);

export const getVehicle = (id) =>
  api.get(`${API_PREFIX}/vehicles/${id}`).then(r => r.data);

export const createVehicle = (data) =>
  api.post(`${API_PREFIX}/vehicles`, data).then(r => r.data);

export const updateVehicle = (id, data) =>
  api.patch(`${API_PREFIX}/vehicles/${id}`, data).then(r => r.data);

export const removeVehicle = (id) =>
  api.delete(`${API_PREFIX}/vehicles/${id}`).then(r => r.data);

// --- Medios
export async function uploadVehiclePhoto(id, { file, category = 'BASIC', title = '' }) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('category', category);
  fd.append('title', title);
  const { data } = await api.post(`${API_PREFIX}/vehicles/${id}/photos`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadVehicleDocument(id, { file, category = 'LEGAL', label = '' }) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('category', category);
  fd.append('label', label);
  const { data } = await api.post(`${API_PREFIX}/vehicles/${id}/documents`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export const deleteVehiclePhoto = (id, photoId) =>
  api.delete(`${API_PREFIX}/vehicles/${id}/photos/${photoId}`).then(r => r.data);

export const deleteVehicleDocument = (id, docId) =>
  api.delete(`${API_PREFIX}/vehicles/${id}/documents/${docId}`).then(r => r.data);

// --- Support / Apoyo
export const startSupport = (id, payload) =>
  api.post(`${API_PREFIX}/vehicles/${id}/support/start`, payload).then(r => r.data);

export const finishSupport = (id) =>
  api.post(`${API_PREFIX}/vehicles/${id}/support/finish`).then(r => r.data);

// --- Catálogos
export const listCatalog = (key) =>
  api.get(`${API_PREFIX}/catalogs`, { params: { key, limit: 200 } }).then(r => r.data);
