// // API Vehicles (axios)
// // Endpoints CRUD para vehículos
// import { api, API_PREFIX } from '../services/http'

// // Querystring con valores por defecto
// const qs = ({ page=1, limit=10, ...rest } = {}) =>
//   '?' + new URLSearchParams({ page, limit, ...rest }).toString()

// export const VehiclesAPI = {
//   // Lista vehículos con paginación y filtros
//   // Ej: VehiclesAPI.list({ branchId:'123', page:1, limit:50 })
//   list: (params = {}) =>
//     api.get(`${API_PREFIX}/vehicles${qs(params)}`).then(r => r.data),

//   // Obtiene un vehículo por su ID
//   get: (id) =>
//     api.get(`${API_PREFIX}/vehicles/${id}`).then(r => r.data),

//   // Crea vehículo: data = { code, name, plate, branchId, ... }
//   create: (data) =>
//     api.post(`${API_PREFIX}/vehicles`, data).then(r => r.data),

//   // Actualiza vehículo existente
//   update: (id, data) =>
//     api.patch(`${API_PREFIX}/vehicles/${id}`, data).then(r => r.data),

//   // Elimina vehículo (soft/hard según backend)
//   remove: (id) =>
//     api.delete(`${API_PREFIX}/vehicles/${id}`).then(r => r.data),
// }
// API Vehicles (axios) — objeto + funciones sueltas
import { api, API_PREFIX } from '../services/http'

const qs = ({ page = 1, limit = 10, ...rest } = {}) =>
  '?' + new URLSearchParams({ page, limit, ...rest }).toString()

// Lista vehículos: { page, limit, status, branchId, q, ... }
export const listVehicles = (params = {}) =>
  api.get(`${API_PREFIX}/vehicles${qs(params)}`).then((r) => r.data)

// Obtiene vehículo por ID
export const getVehicle = (id) =>
  api.get(`${API_PREFIX}/vehicles/${id}`).then((r) => r.data)

// Crea vehículo: data = { code, name, plate, branchId, ... }
export const createVehicle = (data) =>
  api.post(`${API_PREFIX}/vehicles`, data).then((r) => r.data)

// Actualiza vehículo
export const updateVehicle = (id, data) =>
  api.patch(`${API_PREFIX}/vehicles/${id}`, data).then((r) => r.data)

// Elimina (soft/hard según backend)
export const removeVehicle = (id) =>
  api.delete(`${API_PREFIX}/vehicles/${id}`).then((r) => r.data)

export const VehiclesAPI = {
  list: listVehicles,
  get: getVehicle,
  create: createVehicle,
  update: updateVehicle,
  remove: removeVehicle,
}
