// // API Tickets (axios)
// // Endpoints CRUD para tickets/solicitudes
// import { api, API_PREFIX } from '../services/http'

// // Querystring con valores por defecto
// const qs = ({ page=1, limit=10, ...rest } = {}) =>
//   '?' + new URLSearchParams({ page, limit, ...rest }).toString()

// export const TicketsAPI = {
//   // Lista tickets con paginación y filtros
//   // Ej: TicketsAPI.list({ status:'open', page:3 })
//   list: (params = {}) =>
//     api.get(`${API_PREFIX}/tickets${qs(params)}`).then(r => r.data),

//   // Obtiene un ticket por su ID
//   get: (id) =>
//     api.get(`${API_PREFIX}/tickets/${id}`).then(r => r.data),

//   // Crea ticket: data = { folio, vehicleId, description, priority, ... }
//   create: (data) =>
//     api.post(`${API_PREFIX}/tickets`, data).then(r => r.data),

//   // Actualiza ticket existente
//   update: (id, data) =>
//     api.patch(`${API_PREFIX}/tickets/${id}`, data).then(r => r.data),

//   // Elimina ticket (soft/hard según backend)
//   remove: (id) =>
//     api.delete(`${API_PREFIX}/tickets/${id}`).then(r => r.data),

//   // Transición de estado: data = { action:'start'|'close', notes:... }
//   transition: (id, data) =>
//     api.patch(`${API_PREFIX}/tickets/${id}/transition`, data).then(r => r.data),
// }
// API Tickets (axios) — objeto + funciones sueltas
import { api, API_PREFIX } from '../services/http'

const qs = ({ page = 1, limit = 10, ...rest } = {}) =>
  '?' + new URLSearchParams({ page, limit, ...rest }).toString()

// Lista tickets: { page, limit, status, priority, vehicleId, q, ... }
export const listTickets = (params = {}) =>
  api.get(`${API_PREFIX}/tickets${qs(params)}`).then((r) => r.data)

// Obtiene ticket por ID
export const getTicket = (id) =>
  api.get(`${API_PREFIX}/tickets/${id}`).then((r) => r.data)

// Crea ticket: data = { folio, vehicleId, description, priority, ... }
export const createTicket = (data) =>
  api.post(`${API_PREFIX}/tickets`, data).then((r) => r.data)

// Actualiza ticket
export const updateTicket = (id, data) =>
  api.patch(`${API_PREFIX}/tickets/${id}`, data).then((r) => r.data)

// Elimina (soft/hard según backend)
export const removeTicket = (id) =>
  api.delete(`${API_PREFIX}/tickets/${id}`).then((r) => r.data)

// Transición de estado: data = { action:'start'|'close', notes?... }
export const transitionTicket = (id, data) =>
  api.patch(`${API_PREFIX}/tickets/${id}/transition`, data).then((r) => r.data)

export const TicketsAPI = {
  list: ({ page=1, limit=10, q='' } = {}) =>
    api.get(`${API_PREFIX}/tickets`, { params: { page, limit, q } }),

  get: (id) => api.get(`${API_PREFIX}/tickets/${id}`),
  create: (data) => api.post(`${API_PREFIX}/tickets`, data),
  update: (id, data) => api.patch(`${API_PREFIX}/tickets/${id}`, data),
  remove: (id) => api.delete(`${API_PREFIX}/tickets/${id}`).then(r=>r.data),
  // list: listTickets,
  // get: getTicket,
  // create: createTicket,
  // update: updateTicket,
  // remove: removeTicket,
  // transition: transitionTicket,
}
