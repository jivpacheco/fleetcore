// front/src/services/http.js
// -----------------------------------------------------------
// Axios con withCredentials y manejo cuidadoso de 401.
// - NO redirigimos si el 401 viene de /auth/me (fase bootstrap).
// -----------------------------------------------------------
import axios from 'axios'
import { useAppStore } from '../store/useAppStore'

export const API_PREFIX = '/api/v1'
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Instancia de axios con baseURL y cookies (útil para Microsoft OAuth)
export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // importante para cookie httpOnly de Microsoft
})

// Agrega token si existe en Zustand
api.interceptors.request.use((config) => {
  const token = useAppStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejo global de 401 (sesión expirada)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''
    if (status === 401) {
      const { setUser, setToken } = useAppStore.getState()

      // ⛔ No rebotes en bootstrap (/auth/me)
      if (url.includes('/api/v1/auth/me')) {
        setUser(null); setToken(null)
        return Promise.reject(err)
      }

      // Resto de 401 → limpia y redirige
      setUser(null); setToken(null)
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)


/// ****** fin del estable ****** 

// ******************  //// ********************************
// front/src/services/http.js
// -----------------------------------------------------------------------------
// Axios centralizado para el Front de FleetCore.
// - Usa VITE_API_URL como base (ej. http://localhost:5000).
// - Incluye credenciales (cookies httpOnly) para Microsoft/local.
// - Inyecta token desde Zustand si existe.
// - Maneja 401 sin romper bootstrap (/auth/me).
// - Detecta respuestas HTML (<!doctype...) que causan "Unexpected token '<'...".
// -----------------------------------------------------------------------------

// import axios from 'axios'
// import { useAppStore } from '../store/useAppStore'

// // Prefijo común de API
// export const API_PREFIX = '/api/v1'

// // Base URL desde entorno (Vite)
// export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// // Instancia de axios con baseURL y cookies
// export const api = axios.create({
//   baseURL: API_BASE_URL, // MUY IMPORTANTE para no golpear el servidor del front
//   withCredentials: true, // cookies httpOnly (Microsoft/local)
//   headers: {
//     'Content-Type': 'application/json',
//     'X-Requested-With': 'XMLHttpRequest',
//   },
// })

// // ------------------------------
// // Interceptor de REQUEST
// // - Inyecta token Bearer si existe en Zustand
// // ------------------------------
// api.interceptors.request.use((config) => {
//   const token = useAppStore.getState().token
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// // ------------------------------
// // Interceptor de RESPONSE
// // - Manejo global de 401 (excepto /auth/me durante bootstrap)
// // - Detección de HTML devuelto en endpoints JSON
// // ------------------------------
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     // 1) Detección de HTML cuando esperamos JSON
//     //    Casos típicos:
//     //    - Petición a URL equivocada → servidor del front responde index.html
//     //    - Fallback del SPA se adelanta a /api
//     //    - Reverse proxy mal ordenado
//     const raw = err?.response?.data
//     if (typeof raw === 'string' && raw.trim().toLowerCase().startsWith('<!doctype')) {
//       // Reescribimos el error con mensaje claro
//       const msg = 'El servidor devolvió HTML (<!doctype>). Revisa VITE_API_URL, rutas /api y orden de middlewares.'
//       return Promise.reject(new Error(msg))
//     }
//     // Algunos entornos exponen el HTML como responseText
//     const rawText = err?.request?.responseText
//     if (typeof rawText === 'string' && rawText.trim().toLowerCase().startsWith('<!doctype')) {
//       const msg = 'El servidor devolvió HTML (<!doctype>). Revisa VITE_API_URL, rutas /api y orden de middlewares.'
//       return Promise.reject(new Error(msg))
//     }

//     // 2) Manejo de 401 (sesión expirada)
//     const status = err?.response?.status
//     const url = err?.config?.url || ''
//     if (status === 401) {
//       const { setUser, setToken } = useAppStore.getState()

//       // ⛔ No redirigir si fue durante bootstrap (/auth/me)
//       if (url.includes('/api/v1/auth/me')) {
//         setUser(null)
//         setToken(null)
//         return Promise.reject(err)
//       }

//       // Resto de 401 → limpiar y redirigir a login
//       setUser(null)
//       setToken(null)
//       // En apps SPA, mejor una navegación controlada;
//       // aquí usamos location para mantenerlo simple.
//       window.location.href = '/login'
//       return Promise.reject(err)
//     }

//     // 3) Propaga el error por defecto
//     return Promise.reject(err)
//   }


/// ***** /////  actualizado ****

// // front/src/services/http.js
// // -----------------------------------------------------------------------------
// // Axios con soporte para:
// // - Autenticación vía cookie (Microsoft/local).
// // - Token de Zustand (Bearer).
// // - Manejo controlado de 401 (sin romper bootstrap /auth/me).
// // - Detección de HTML devuelto (<!doctype...) para evitar "Unexpected token '<'".
// // -----------------------------------------------------------------------------

// import axios from 'axios'
// import { useAppStore } from '../store/useAppStore'

// export const API_PREFIX = '/api/v1'

// // BaseURL del backend (usa variable de entorno o localhost por defecto)
// const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// // Instancia Axios
// export const api = axios.create({
//   baseURL: BASE,
//   withCredentials: true, // importante para cookie httpOnly (Microsoft OAuth)
//   headers: {
//     'Content-Type': 'application/json',
//     // 'X-Requested-With': 'XMLHttpRequest',
//      'Content-Type': 'application/json',
//   },
// })

// // -----------------------------------------------------------------------------
// // Interceptor REQUEST → agrega token Bearer si existe
// // -----------------------------------------------------------------------------
// api.interceptors.request.use((config) => {
//   const token = useAppStore.getState().token
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// // -----------------------------------------------------------------------------
// // Interceptor RESPONSE → maneja 401 y respuestas HTML inesperadas
// // -----------------------------------------------------------------------------
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err?.response?.status
//     const url = err?.config?.url || ''

//     // 🧩 1. Detectar si el servidor devolvió HTML en vez de JSON
//     const raw = err?.response?.data
//     if (typeof raw === 'string' && raw.trim().toLowerCase().startsWith('<!doctype')) {
//       console.error('⚠️ El servidor devolvió HTML en una llamada API. Revisa el VITE_API_URL o la ruta /api.')
//       return Promise.reject(new Error('Respuesta HTML inesperada del servidor (<!doctype>).'))
//     }

//     const rawText = err?.request?.responseText
//     if (typeof rawText === 'string' && rawText.trim().toLowerCase().startsWith('<!doctype')) {
//       console.error('⚠️ El servidor devolvió HTML en una llamada API. Revisa el VITE_API_URL o la ruta /api.')
//       return Promise.reject(new Error('Respuesta HTML inesperada del servidor (<!doctype>).'))
//     }

//     // 🧩 2. Manejo controlado del 401 (sesión expirada)
//     if (status === 401) {
//       const { setUser, setToken } = useAppStore.getState()

//       // ⛔ No rebotes en bootstrap (/auth/me)
//       if (url.includes('/api/v1/auth/me')) {
//         setUser(null)
//         setToken(null)
//         return Promise.reject(err)
//       }

//       // 🔁 Limpia sesión y redirige
//       setUser(null)
//       setToken(null)
//       window.location.href = '/login'
//     }

//     return Promise.reject(err)
//   }
// )
