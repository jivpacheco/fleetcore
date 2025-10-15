// // front/src/api/vehicles.api.js
// import { api, API_PREFIX } from '../services/http'

// const qs = ({ page = 1, limit = 10, ...rest } = {}) =>
//   '?' + new URLSearchParams({ page, limit, ...rest }).toString()

// export const listVehicles = (params = {}) =>
//   api.get(`${API_PREFIX}/vehicles${qs(params)}`).then((r) => r.data)

// export const getVehicle = (id) =>
//   api.get(`${API_PREFIX}/vehicles/${id}`).then((r) => r.data)

// export const createVehicle = (data) =>
//   api.post(`${API_PREFIX}/vehicles`, data).then((r) => r.data)

// export const updateVehicle = (id, data) =>
//   api.patch(`${API_PREFIX}/vehicles/${id}`, data).then((r) => r.data)

// export const removeVehicle = (id) =>
//   api.delete(`${API_PREFIX}/vehicles/${id}`).then((r) => r.data)

// // -------- Media --------
// export async function uploadVehiclePhoto(id, { file, category='BASIC', title='' }) {
//   const fd = new FormData()
//   fd.append('file', file)
//   fd.append('category', String(category).toUpperCase())
//   fd.append('title', String(title).toUpperCase())
//   const { data } = await api.post(`${API_PREFIX}/vehicles/${id}/photos`, fd, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   })
//   return data
// }

// export async function deleteVehiclePhoto(id, photoId) {
//   const { data } = await api.delete(`${API_PREFIX}/vehicles/${id}/photos/${photoId}`)
//   return data
// }

// export async function uploadVehicleDocument(id, { file, category='LEGAL', label='' }) {
//   const fd = new FormData()
//   fd.append('file', file)
//   fd.append('category', String(category).toUpperCase())
//   fd.append('label', String(label).toUpperCase())
//   const { data } = await api.post(`${API_PREFIX}/vehicles/${id}/documents`, fd, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   })
//   return data
// }

// export async function deleteVehicleDocument(id, documentId) {
//   const { data } = await api.delete(`${API_PREFIX}/vehicles/${id}/documents/${documentId}`)
//   return data
// }

// export const VehiclesAPI = {
//   list: ({ page=1, limit=10, q='' } = {}) =>
//     api.get(`${API_PREFIX}/vehicles`, { params: { page, limit, q } }),
//   get: (id) => api.get(`${API_PREFIX}/vehicles/${id}`),
//   create: (data) => api.post(`${API_PREFIX}/vehicles`, data),
//   update: (id, data) => api.patch(`${API_PREFIX}/vehicles/${id}`, data),
//   uploadPhoto: uploadVehiclePhoto,
//   deletePhoto: deleteVehiclePhoto,
//   uploadDocument: uploadVehicleDocument,
//   deleteDocument: deleteVehicleDocument,
// }

// front/src/api/vehicles.api.js
// -----------------------------------------------------------------------------
// API helper de Vehículos: lista/CRUD y subida de medios (Cloudinary).
// -----------------------------------------------------------------------------
import { api, API_PREFIX } from '../services/http';

const qs = ({ page = 1, limit = 10, ...rest } = {}) =>
  '?' + new URLSearchParams({ page, limit, ...rest }).toString();

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

// --- Subidas ---
export async function uploadVehiclePhoto(id, { file, category = 'BASIC', title = '' }) {
  const fd = new FormData();
  fd.append('file', file);            // 👈 campo debe llamarse 'file'
  fd.append('category', category);
  fd.append('title', title);
  const { data } = await api.post(`${API_PREFIX}/vehicles/${id}/photos`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadVehicleDocument(id, { file, category = 'LEGAL', label = '' }) {
  const fd = new FormData();
  fd.append('file', file);            // 👈 campo debe llamarse 'file'
  fd.append('category', category);
  fd.append('label', label);
  const { data } = await api.post(`${API_PREFIX}/vehicles/${id}/documents`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export const VehiclesAPI = {
  list: (p = {}) => api.get(`${API_PREFIX}/vehicles`, { params: p }),
  get: (id) => api.get(`${API_PREFIX}/vehicles/${id}`),
  create: (data) => api.post(`${API_PREFIX}/vehicles`, data),
  update: (id, data) => api.patch(`${API_PREFIX}/vehicles/${id}`, data),
};
