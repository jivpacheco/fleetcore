// front/src/layout/AppLayout.jsx
// -----------------------------------------------------------------------------
// App shell responsivo: Sidebar (desktop + drawer móvil) + Topbar + área de Outlet
// - Integra tu verificación de sesión (/api/v1/auth/me) al montar.
// - Usa el estado del sidebar desde useAppStore (sidebarOpen, toggleSidebar).
// -----------------------------------------------------------------------------

import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import Sidebar from '../components/layout/Sidebar'
import { api } from '../services/http'
import { useAppStore } from '../store/useAppStore'

export default function AppLayout() {
    const setUser = useAppStore(s => s.setUser)
    const sidebarOpen = useAppStore(s => s.sidebarOpen)

    // Carga de usuario desde cookie httpOnly (Microsoft) si existe
    useEffect(() => {
        api.get('/api/v1/auth/me')
            .then(({ data }) => setUser(data.user))
            .catch(() => { }) // si no hay sesión, continuar normal
    }, [setUser])

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar fijo en desktop */}
            <Sidebar className="hidden md:block" />

            {/* Overlay para drawer móvil */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" />}

            {/* Sidebar como drawer en móvil */}
            <Sidebar mobile />

            {/* Contenido principal */}
            <main className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <div className="flex-1 min-w-0 overflow-auto p-3 sm:p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
