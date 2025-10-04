// front/src/components/layout/Sidebar.jsx
// -----------------------------------------------------------------------------
// Sidebar con dos modos:
// - Desktop: fijo (hidden md:block desde AppLayout).
// - Móvil: drawer deslizante (prop mobile + estado sidebarOpen).
// - Menú básico con íconos y NavLink activos.
// - Usa useAppStore.sidebarOpen y toggleSidebar para cerrar al seleccionar en móvil.
// -----------------------------------------------------------------------------

import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

const menu = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/branches', label: 'Sucursales', icon: '🏢' },
    { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
    { to: '/tickets', label: 'Tickets', icon: '🎫' },
    { to: '/settings', label: 'Configuración', icon: '⚙️' },
]

export default function Sidebar({ mobile = false, className = '' }) {
    const sidebarOpen = useAppStore(s => s.sidebarOpen)
    const toggleSidebar = useAppStore(s => s.toggleSidebar)

    const base = (
        <aside className={`bg-white border-r w-64 h-full flex flex-col ${className}`}>
            <nav className="p-3 md:p-4 space-y-1">
                {menu.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-medium' : 'text-gray-700'
                            }`
                        }
                        onClick={mobile ? () => { if (sidebarOpen) toggleSidebar() } : undefined}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    )

    if (!mobile) return base

    // Drawer móvil (desliza desde la izquierda)
    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            aria-hidden={!sidebarOpen}
        >
            {base}
        </div>
    )
}
