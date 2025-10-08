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

