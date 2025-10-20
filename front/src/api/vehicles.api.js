// ///*************** vERSION ESTABLE 20/10/2025 */
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






// ///****************** ultima actualizacion **************************** */
// // front/src/api/vehicles.api.js
// // -----------------------------------------------------------------------------
// // API helper de Vehículos
// // -----------------------------------------------------------------------------
// import { api, API_PREFIX } from '../services/http';

// const qs = (obj={}) => '?' + new URLSearchParams(obj).toString();

// export const listVehicles = (params = {}) =>
//   api.get(`${API_PREFIX}/vehicles${qs(params)}`).then(r => r.data);

// export const getVehicle = (id) =>
//   api.get(`${API_PREFIX}/vehicles/${id}`).then(r => r.data);

// export const createVehicle = (data) =>
//   api.post(`${API_PREFIX}/vehicles`, data).then(r => r.data);

// export const updateVehicle = (id, data) =>
//   api.patch(`${API_PREFIX}/vehicles/${id}`, data).then(r => r.data);

// export const removeVehicle = (id) =>
//   api.delete(`${API_PREFIX}/vehicles/${id}`).then(r => r.data);

// // --- Medios
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

// export const deleteVehiclePhoto = (id, photoId) =>
//   api.delete(`${API_PREFIX}/vehicles/${id}/photos/${photoId}`).then(r => r.data);

// export const deleteVehicleDocument = (id, docId) =>
//   api.delete(`${API_PREFIX}/vehicles/${id}/documents/${docId}`).then(r => r.data);

// // --- Support / Apoyo
// export const startSupport = (id, payload) =>
//   api.post(`${API_PREFIX}/vehicles/${id}/support/start`, payload).then(r => r.data);

// export const finishSupport = (id) =>
//   api.post(`${API_PREFIX}/vehicles/${id}/support/finish`).then(r => r.data);

// // --- Catálogos
// export const listCatalog = (key) =>
//   api.get(`${API_PREFIX}/catalogs`, { params: { key, limit: 200 } }).then(r => r.data);



//// ACTUALIZACION 20/10/2025 //////

// front/src/api/vehicles.api.js
// -----------------------------------------------------------------------------
// API de Vehículos: media, apoyo y auditoría.
// -----------------------------------------------------------------------------
import { api } from '../services/http';

// ===== Media =====
export async function uploadVehiclePhoto(id, { file, category, title }) {
  const fd = new FormData();
  fd.append('file', file);
  if (category) fd.append('category', category);
  if (title) fd.append('title', title);
  return api.post(`/api/v1/vehicles/${id}/photos`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function uploadVehicleDocument(id, { file, category, label }) {
  const fd = new FormData();
  fd.append('file', file);
  if (category) fd.append('category', category);
  if (label) fd.append('label', label);
  return api.post(`/api/v1/vehicles/${id}/documents`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function deleteVehiclePhoto(id, photoId) {
  return api.delete(`/api/v1/vehicles/${id}/photos/${photoId}`);
}

export async function deleteVehicleDocument(id, docId) {
  return api.delete(`/api/v1/vehicles/${id}/documents/${docId}`);
}

// ===== Apoyo =====
export async function startSupport(id, { targetBranch, targetVehicle }) {
  return api.post(`/api/v1/vehicles/${id}/support/start`, { targetBranch, targetVehicle });
}
export async function finishSupport(id) {
  return api.post(`/api/v1/vehicles/${id}/support/finish`, {});
}

// ===== Auditoría (paginada) =====
export async function fetchVehicleAudit(id, { page = 1, limit = 10 } = {}) {
  return api.get(`/api/v1/vehicles/${id}/audit`, { params: { page, limit } });
}

// ===== Auxiliar: listar vehículos por sucursal =====
export async function fetchVehiclesByBranch(branchId) {
  // Reutiliza el endpoint de vehículos con filtro simple (si tienes uno específico, cámbialo)
  return api.get('/api/v1/vehicles', { params: { page: 1, limit: 500, branch: branchId } });
}
