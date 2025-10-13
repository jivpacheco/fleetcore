// // front/src/api/vehicles.api.js
// // -----------------------------------------------------------------------------
// // API de Vehículos (Front): CRUD + Media (fotos, documentos, videos).
// // - Usa axios `api` y `API_PREFIX` desde services/http.
// // - Maneja uploads con multipart/form-data.
// // - Videos se suben por el endpoint de documentos con category="videos".
// // -----------------------------------------------------------------------------

// import { api, API_PREFIX } from '../services/http'

// // Helper para querystring con paginación y filtros
// const qs = ({ page = 1, limit = 10, ...rest } = {}) =>
//   '?' + new URLSearchParams({ page, limit, ...rest }).toString()

// // -------------------------
// // CRUD básico de Vehículos
// // -------------------------

// /** Lista vehículos (paginado y filtros) */
// export const listVehicles = (params = {}) =>
//   api.get(`${API_PREFIX}/vehicles${qs(params)}`).then(r => r.data)

// /** Obtiene vehículo por ID */
// export const getVehicle = (id) =>
//   api.get(`${API_PREFIX}/vehicles/${id}`).then(r => r.data)

// /** Crea vehículo */
// export const createVehicle = (data) =>
//   api.post(`${API_PREFIX}/vehicles`, data).then(r => r.data)

// /** Actualiza vehículo */
// export const updateVehicle = (id, data) =>
//   api.patch(`${API_PREFIX}/vehicles/${id}`, data).then(r => r.data)

// /** Elimina (soft/hard según backend) */
// export const removeVehicle = (id) =>
//   api.delete(`${API_PREFIX}/vehicles/${id}`).then(r => r.data)

// // API agrupada opcional (si te sirve un estilo namespaced)
// export const VehiclesAPI = {
//   list: (params = {}) => api.get(`${API_PREFIX}/vehicles`, { params }),
//   get:  (id)          => api.get(`${API_PREFIX}/vehicles/${id}`),
//   create: (data)      => api.post(`${API_PREFIX}/vehicles`, data),
//   update: (id, data)  => api.patch(`${API_PREFIX}/vehicles/${id}`, data),
//   remove: (id)        => api.delete(`${API_PREFIX}/vehicles/${id}`),
// }

// // -------------------------
// // Media: Fotos / Documentos
// // -------------------------

// /**
//  * Sube una FOTO (image/jpeg|png|webp) al vehículo (bucket "photos").
//  * Devuelve el vehicle actualizado.
//  */
// export async function uploadVehiclePhoto(id, file) {
//   const form = new FormData()
//   form.append('file', file)
//   const { data } = await api.post(
//     `${API_PREFIX}/vehicles/${id}/photos`,
//     form,
//     { headers: { 'Content-Type': 'multipart/form-data' } }
//   )
//   return data.item
// }

// /**
//  * Sube un DOCUMENTO (PDF/imagen) o VIDEO (mp4/webm/mov) al vehículo.
//  * Usa category para clasificar: 'legal' | 'manuals' | 'parts' | 'videos'
//  * - Para videos, usar category: 'videos'
//  * Devuelve el vehicle actualizado.
//  */
// export async function uploadVehicleDocument(id, file, opts = {}) {
//   const form = new FormData()
//   form.append('file', file)
//   if (opts.category) form.append('category', opts.category) // ej. 'legal' | 'videos'
//   if (opts.label)    form.append('label', opts.label)

//   const { data } = await api.post(
//     `${API_PREFIX}/vehicles/${id}/documents`,
//     form,
//     { headers: { 'Content-Type': 'multipart/form-data' } }
//   )
//   return data.item
// }

// /** Borra una foto por photoId (subdoc _id de photos[]) */
// export async function deleteVehiclePhoto(id, photoId) {
//   const { data } = await api.delete(`${API_PREFIX}/vehicles/${id}/photos/${photoId}`)
//   return data.item
// }

// /** Borra un documento por documentId (subdoc _id de documents[]) */
// export async function deleteVehicleDocument(id, documentId) {
//   const { data } = await api.delete(`${API_PREFIX}/vehicles/${id}/documents/${documentId}`)
//   return data.item
// }

// front/src/api/vehicles.api.js
// -----------------------------------------------------------------------------
// API de Vehículos (incluye soporte de 'Apoyo' y listado de planta)
// -----------------------------------------------------------------------------
import { api, API_PREFIX } from '../services/http'

const qs = (obj = {}) => '?' + new URLSearchParams(obj).toString()

export const listVehicles = (params = {}) =>
  api.get(`${API_PREFIX}/vehicles${qs(params)}`).then(r => r.data)

export const getVehicle = (id) =>
  api.get(`${API_PREFIX}/vehicles/${id}`).then(r => r.data)

export const createVehicle = (data) =>
  api.post(`${API_PREFIX}/vehicles`, data).then(r => r.data)

export const updateVehicle = (id, data) =>
  api.patch(`${API_PREFIX}/vehicles/${id}`, data).then(r => r.data)

export const removeVehicle = (id) =>
  api.delete(`${API_PREFIX}/vehicles/${id}`).then(r => r.data)

// Listar titulares de planta por sucursal (para “Apoyo”)
export const listPlantVehiclesByBranch = (branchId, extra = {}) =>
  api.get(`${API_PREFIX}/vehicles`, {
    params: { branch: branchId, status: 'active', plantOnly: 1, ...extra }
  }).then(r => r.data)

// Ejecutar Apoyo (reemplazo)
export const supportVehicle = (id, { toBranch, replaceVehicle, note }) =>
  api.post(`${API_PREFIX}/vehicles/${id}/support`, { toBranch, replaceVehicle, note })
    .then(r => r.data)

export const VehiclesAPI = {
  list:   ({ page=1, limit=10, q='' } = {}) => api.get(`${API_PREFIX}/vehicles`, { params: { page, limit, q } }),
  get:    (id) => api.get(`${API_PREFIX}/vehicles/${id}`),
  create: (data) => api.post(`${API_PREFIX}/vehicles`, data),
  update: (id, data) => api.patch(`${API_PREFIX}/vehicles/${id}`, data),
}
