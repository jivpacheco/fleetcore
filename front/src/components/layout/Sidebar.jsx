// // front/src/components/layout/Sidebar.jsx
// // -----------------------------------------------------------------------------
// // Sidebar (versión drawer móvil y fija desktop):
// // - Conserva tu menú base.
// // - Agrega grupo “Configuración” con enlace a Catálogos → Estados de vehículo.
// // - En móvil cierra el drawer al seleccionar.
// // -----------------------------------------------------------------------------

// import { NavLink } from 'react-router-dom'
// import { useAppStore } from '../../store/useAppStore'

// const coreMenu = [
//     { to: '/dashboard', label: 'Dashboard', icon: '📊' },
//     { to: '/branches', label: 'Sucursales', icon: '🏢' },
//     { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
//     { to: '/people', label: 'RRHH · Personas', icon: '👤' },
//     { to: '/tickets', label: 'Tickets', icon: '🎫' },
// ]

// // En “Configuración” metemos los catálogos. Puedes crecer aquí sin romper el layout.
// const configMenu = [
//     { to: '/config/catalogs/vehicle-statuses', label: 'Catálogos · Estados de vehículo', icon: '📚' },
//     { to: '/config/catalogs/positions', label: 'Catálogos · Cargos', icon: '🧩' },
//     { to: '/config/catalogs/roles', label: 'Catálogos · Roles', icon: '🛡️' },
//     // Ejemplo futuro:
//     // { to: '/config/catalogs/vehicle-types', label: 'Catálogos · Tipos de vehículo', icon: '🚗' },
// ]

// function NavItem({ to, icon, label, onClick }) {
//     return (
//         <NavLink
//             to={to}
//             className={({ isActive }) =>
//                 `flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 
//          ${isActive ? 'bg-gray-100 font-medium' : 'text-gray-700'}`
//             }
//             onClick={onClick}
//         >
//             <span className="text-lg">{icon}</span>
//             <span className="truncate">{label}</span>
//         </NavLink>
//     )
// }

// export default function Sidebar({ mobile = false, className = '' }) {
//     const sidebarOpen = useAppStore(s => s.sidebarOpen)
//     const toggleSidebar = useAppStore(s => s.toggleSidebar)

//     const handleClickMobile = mobile
//         ? () => { if (sidebarOpen) toggleSidebar() }
//         : undefined

//     const base = (
//         <aside className={`bg-white border-r w-64 h-full flex flex-col ${className}`}>
//             <nav className="p-3 md:p-4 space-y-1">
//                 {/* Núcleo */}
//                 {coreMenu.map(item => (
//                     <NavItem key={item.to} {...item} onClick={handleClickMobile} />
//                 ))}

//                 {/* Separador sutil */}
//                 <div className="h-[1px] my-3 bg-slate-200" />

//                 {/* Grupo Configuración */}
//                 <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">
//                     Configuración
//                 </div>
//                 {configMenu.map(item => (
//                     <NavItem key={item.to} {...item} onClick={handleClickMobile} />
//                 ))}
//             </nav>
//         </aside>
//     )

//     if (!mobile) return base

//     // Drawer móvil (desliza desde la izquierda)
//     return (
//         <div
//             className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:hidden 
//                   ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
//             aria-hidden={!sidebarOpen}
//         >
//             {base}
//         </div>
//     )
// }

// front/src/components/layout/Sidebar.jsx
// -----------------------------------------------------------------------------
// Sidebar (versión drawer móvil y fija desktop):
// - Conserva tu menú base.
// - Agrega grupo “Configuración” con enlace a Catálogos → Estados de vehículo.
// - En móvil cierra el drawer al seleccionar.
// -----------------------------------------------------------------------------

import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

const coreMenu = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/branches', label: 'Sucursales', icon: '🏢' },
    { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
    { to: '/people', label: 'RRHH · Personas', icon: '👤' },
    { to: '/tickets', label: 'Tickets', icon: '🎫' },
]

// En “Configuración” metemos los catálogos. Puedes crecer aquí sin romper el layout.
const configMenu = [
    { to: '/config/catalogs/vehicle-statuses', label: 'Catálogos · Estados de vehículo', icon: '📚' },
    { to: '/config/catalogs/positions', label: 'Catálogos · Cargos', icon: '🧩' },
    { to: '/config/catalogs/roles', label: 'Catálogos · Roles', icon: '🛡️' },
    { to: '/config/users', label: 'Usuarios', icon: '👤' },
    // Ejemplo futuro:
    // { to: '/config/catalogs/vehicle-types', label: 'Catálogos · Tipos de vehículo', icon: '🚗' },
]

function NavItem({ to, icon, label, onClick }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 
         ${isActive ? 'bg-gray-100 font-medium' : 'text-gray-700'}`
            }
            onClick={onClick}
        >
            <span className="text-lg">{icon}</span>
            <span className="truncate">{label}</span>
        </NavLink>
    )
}

export default function Sidebar({ mobile = false, className = '' }) {
    const sidebarOpen = useAppStore(s => s.sidebarOpen)
    const toggleSidebar = useAppStore(s => s.toggleSidebar)

    const handleClickMobile = mobile
        ? () => { if (sidebarOpen) toggleSidebar() }
        : undefined

    const base = (
        <aside className={`bg-white border-r w-64 h-full flex flex-col ${className}`}>
            <nav className="p-3 md:p-4 space-y-1">
                {/* Núcleo */}
                {coreMenu.map(item => (
                    <NavItem key={item.to} {...item} onClick={handleClickMobile} />
                ))}

                {/* Separador sutil */}
                <div className="h-[1px] my-3 bg-slate-200" />

                {/* Grupo Configuración */}
                <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                    Configuración
                </div>
                {configMenu.map(item => (
                    <NavItem key={item.to} {...item} onClick={handleClickMobile} />
                ))}
            </nav>
        </aside>
    )

    if (!mobile) return base

    // Drawer móvil (desliza desde la izquierda)
    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:hidden 
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            aria-hidden={!sidebarOpen}
        >
            {base}
        </div>
    )
}
