// front/src/components/layout/AppLayout.jsx
// -----------------------------------------------------------------------------
// App shell (Topbar + Sidebar + Outlet) con rehidratación de sesión:
// - Llama a /api/v1/auth/me al montar para recuperar el usuario desde cookie.
// - Requiere axios con withCredentials:true (ver front/src/services/http.js).
// - Drawer móvil opcional via useUiStore (si no existe, no rompe).
// -----------------------------------------------------------------------------
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import { api } from '../../services/http'
import { useAppStore } from '../../store/useAppStore'

// Soporte opcional para UI store (drawer móvil)
let useUiStore
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  useUiStore = require('../../store/useUiStore').useUiStore
} catch {
  useUiStore = () => ({ sidebarOpen: false })
}

export default function AppLayout() {
  const setUser = useAppStore(s => s.setUser)
  const { sidebarOpen } = (useUiStore && useUiStore()) || { sidebarOpen: false }

  // Rehidrata la sesión con cookie httpOnly (fc_token) si existe
  useEffect(() => {
    api.get('/api/v1/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => { /* sin sesión → guardia de rutas te llevará a /login */ })
  }, [setUser])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (desktop) */}
      <Sidebar className="hidden md:block" />

      {/* Drawer overlay (mobile) */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" />}

      {/* Sidebar (mobile drawer) */}
      <Sidebar mobile />

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 min-w-0 overflow-auto p-3 sm:p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
