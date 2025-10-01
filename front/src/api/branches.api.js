// // API Branches (axios)
// // Endpoints CRUD para sucursales
// import { api, API_PREFIX } from '../services/http'

// // Helper para querystrings con valores por defecto
// const qs = ({ page=1, limit=10, ...rest } = {}) =>
//   '?' + new URLSearchParams({ page, limit, ...rest }).toString()

// export const BranchesAPI = {
//   // Lista sucursales con paginación y filtros opcionales
//   // Ej: BranchesAPI.list({ page:2, limit:25 })
//   list: (params = {}) =>
//     api.get(`${API_PREFIX}/branches${qs(params)}`).then(r => r.data),

//   // Obtiene una sucursal por su ID
//   get: (id) =>
//     api.get(`${API_PREFIX}/branches/${id}`).then(r => r.data),

//   // Crea una sucursal: data = { code, name, city, ... }
//   create: (data) =>
//     api.post(`${API_PREFIX}/branches`, data).then(r => r.data),

//   // Actualiza sucursal existente
//   update: (id, data) =>
//     api.patch(`${API_PREFIX}/branches/${id}`, data).then(r => r.data),

//   // Elimina sucursal (soft/hard según backend)
//   remove: (id) =>
//     api.delete(`${API_PREFIX}/branches/${id}`).then(r => r.data),
// }
// API Branches (axios) — objeto + funciones sueltas
import { api, API_PREFIX } from '../services/http'

// Helper QS con defaults (page=1, limit=10)
const qs = ({ page = 1, limit = 10, ...rest } = {}) =>
  '?' + new URLSearchParams({ page, limit, ...rest }).toString()

// ===== Funciones sueltas =====

// Lista sucursales (paginado/filters)
// Ej: listBranches({ page:2, limit:25 })
export const listBranches = (params = {}) =>
  api.get(`${API_PREFIX}/branches${qs(params)}`).then((r) => r.data)

// Obtiene una sucursal por ID
export const getBranch = (id) =>
  api.get(`${API_PREFIX}/branches/${id}`).then((r) => r.data)

// Crea sucursal: data = { code, name, city, ... }
export const createBranch = (data) =>
  api.post(`${API_PREFIX}/branches`, data).then((r) => r.data)

// Actualiza sucursal
export const updateBranch = (id, data) =>
  api.patch(`${API_PREFIX}/branches/${id}`, data).then((r) => r.data)

// Elimina (soft/hard según backend)
export const removeBranch = (id) =>
  api.delete(`${API_PREFIX}/branches/${id}`).then((r) => r.data)

// ===== Objeto agrupado (mismo contrato) =====
export const BranchesAPI = {
  list: listBranches,
  get: getBranch,
  create: createBranch,
  update: updateBranch,
  remove: removeBranch,
}
