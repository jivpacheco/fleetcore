import axios from 'axios'
import { useAppStore } from '../store/useAppStore'

export const API_PREFIX = '/api/v1'


const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Instancia de axios con baseURL y cookies (útil para Microsoft OAuth)
export const api = axios.create({
    baseURL: BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // importante para cookie httpOnly de Microsoft
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
        if (err.response?.status === 401) {
            const { setUser, setToken } = useAppStore.getState()
            setUser(null); setToken(null)
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)
