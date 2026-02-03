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
//     { to: '/config/users', label: 'Usuarios', icon: '👤' },
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
//                 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
//             aria-hidden={!sidebarOpen}
//         >
//             {base}
//         </div>
//     )
// }
// //v1 020226
// // front/src/components/layout/Sidebar.jsx
// // -----------------------------------------------------------------------------
// // Sidebar (drawer móvil + fijo desktop):
// // - Menú núcleo + grupo Configuración
// // - En móvil: drawer con overlay en AppLayout, cierra al navegar
// // - Protege navegación si hay cambios sin guardar (window.__FLEETCORE_UNSAVED__)
// // -----------------------------------------------------------------------------
// import { NavLink, useLocation } from 'react-router-dom'
// import { useAppStore } from '../../store/useAppStore'

// const coreMenu = [
//     { to: '/dashboard', label: 'Dashboard', icon: '📊' },
//     { to: '/branches', label: 'Sucursales', icon: '🏢' },
//     { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
//     { to: '/people', label: 'RRHH · Personas', icon: '👤' },
//     { to: '/tickets', label: 'Tickets', icon: '🎫' },
// ]

// const configMenu = [
//     { to: '/config/catalogs/vehicle-statuses', label: 'Catálogos · Estados de vehículo', icon: '📚' },
//     { to: '/config/catalogs/positions', label: 'Catálogos · Cargos', icon: '🧩' },
//     { to: '/config/catalogs/roles', label: 'Catálogos · Roles', icon: '🛡️' },
//     { to: '/config/catalogs/failure-reports', label: 'Catálogos · Reporte de fallas', icon: '🧾' },
//     { to: '/config/catalogs/repairs', label: 'Catálogos · Reparaciones', icon: '🛠️' },
//     { to: '/config/users', label: 'Usuarios', icon: '👤' },
// ]

// function shouldBlockNav(targetPath, currentPath) {
//     try {
//         const isUnsaved = Boolean(window.__FLEETCORE_UNSAVED__)
//         if (!isUnsaved) return false
//         if (currentPath === targetPath) return false
//         return true
//     } catch {
//         return false
//     }
// }

// function confirmLeave() {
//     const msg =
//         window.__FLEETCORE_UNSAVED_MESSAGE__ ||
//         'Hay cambios sin guardar. ¿Deseas salir sin guardar?'
//     return window.confirm(msg)
// }

// function NavItem({ to, icon, label, onNavigate }) {
//     const location = useLocation()

//     const handleClick = (e) => {
//         if (shouldBlockNav(to, location?.pathname)) {
//             const ok = confirmLeave()
//             if (!ok) {
//                 e.preventDefault()
//                 e.stopPropagation()
//                 return
//             }
//         }
//         onNavigate?.()
//     }

//     return (
//         <NavLink
//             to={to}
//             className={({ isActive }) =>
//                 `flex items-center gap-2 px-3 py-2 rounded-lg transition
//          ${isActive
//                     ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-700 dark:text-white'
//                     : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'}`
//             }
//             onClick={handleClick}
//         >
//             <span className="text-lg">{icon}</span>
//             <span className="truncate">{label}</span>
//         </NavLink>
//     )
// }

// export default function Sidebar({ mobile = false, className = '' }) {
//     const sidebarOpen = useAppStore((s) => s.sidebarOpen)
//     const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

//     const handleNavigateMobile = mobile ? () => setSidebarOpen(false) : undefined

//     const base = (
//         <aside className={`bg-white dark:bg-slate-800 border-r dark:border-slate-700 w-64 h-full flex flex-col ${className}`}>
//             <nav className="p-3 md:p-4 space-y-1">
//                 {coreMenu.map((item) => (
//                     <NavItem key={item.to} {...item} onNavigate={handleNavigateMobile} />
//                 ))}

//                 <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

//                 <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">
//                     Configuración
//                 </div>

//                 {configMenu.map((item) => (
//                     <NavItem key={item.to} {...item} onNavigate={handleNavigateMobile} />
//                 ))}
//             </nav>
//         </aside>
//     )

//     if (!mobile) return base

//     return (
//         <div
//             className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:hidden
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
//             aria-hidden={!sidebarOpen}
//         >
//             {base}
//         </div>
//     )
// }

// //02022026
// // front/src/components/layout/Sidebar.jsx
// // -----------------------------------------------------------------------------
// // Sidebar (drawer móvil + fijo desktop) + colapsado desktop persistente:
// // - Menú núcleo + grupo Configuración
// // - En móvil: drawer con overlay en AppLayout, cierra al navegar
// // - Desktop: colapsa (w-64 <-> w-16) con persistencia (sidebarCollapsed)
// // - Protege navegación si hay cambios sin guardar (window.__FLEETCORE_UNSAVED__)
// // -----------------------------------------------------------------------------
// import { NavLink, useLocation } from 'react-router-dom'
// import { useAppStore } from '../../store/useAppStore'

// const coreMenu = [
//     { to: '/dashboard', label: 'Dashboard', icon: '📊' },
//     { to: '/branches', label: 'Sucursales', icon: '🏢' },
//     { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
//     { to: '/people', label: 'RRHH · Personas', icon: '👤' },
//     { to: '/tickets', label: 'Tickets', icon: '🎫' },
// ]

// const configMenu = [
//     { to: '/config/catalogs/vehicle-statuses', label: 'Catálogos · Estados de vehículo', icon: '📚' },
//     { to: '/config/catalogs/positions', label: 'Catálogos · Cargos', icon: '🧩' },
//     { to: '/config/catalogs/roles', label: 'Catálogos · Roles', icon: '🛡️' },
//     { to: '/config/catalogs/failure-reports', label: 'Catálogos · Reporte de fallas', icon: '🧾' },
//     { to: '/config/catalogs/repairs', label: 'Catálogos · Reparaciones', icon: '🛠️' },
//     { to: '/config/users', label: 'Usuarios', icon: '👤' },
// ]

// function shouldBlockNav(targetPath, currentPath) {
//     try {
//         const isUnsaved = Boolean(window.__FLEETCORE_UNSAVED__)
//         if (!isUnsaved) return false
//         if (currentPath === targetPath) return false
//         return true
//     } catch {
//         return false
//     }
// }

// function confirmLeave() {
//     const msg =
//         window.__FLEETCORE_UNSAVED_MESSAGE__ ||
//         'Hay cambios sin guardar. ¿Deseas salir sin guardar?'
//     return window.confirm(msg)
// }

// function NavItem({ to, icon, label, onNavigate, collapsed }) {
//     const location = useLocation()

//     const handleClick = (e) => {
//         if (shouldBlockNav(to, location?.pathname)) {
//             const ok = confirmLeave()
//             if (!ok) {
//                 e.preventDefault()
//                 e.stopPropagation()
//                 return
//             }
//         }
//         onNavigate?.()
//     }

//     return (
//         <NavLink
//             to={to}
//             title={label} // útil cuando está colapsado
//             className={({ isActive }) =>
//                 `flex items-center gap-2 px-3 py-2 rounded-lg transition
//          ${isActive
//                     ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-700 dark:text-white'
//                     : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'}
//          ${collapsed ? 'justify-center' : ''}`
//             }
//             onClick={handleClick}
//         >
//             <span className="text-lg">{icon}</span>
//             {!collapsed && <span className="truncate">{label}</span>}
//         </NavLink>
//     )
// }

// export default function Sidebar({ mobile = false, className = '' }) {
//     const sidebarOpen = useAppStore((s) => s.sidebarOpen)
//     const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

//     const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
//     const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed)

//     // En móvil cerramos el drawer al navegar
//     const handleNavigateMobile = mobile ? () => setSidebarOpen(false) : undefined

//     // Colapsado SOLO aplica en desktop
//     const collapsed = mobile ? false : sidebarCollapsed

//     const base = (
//         <aside
//             className={[
//                 'bg-white dark:bg-slate-800 border-r dark:border-slate-700 h-full flex flex-col',
//                 mobile ? 'w-72' : (collapsed ? 'w-16' : 'w-64'),
//                 'transition-all duration-200',
//                 className,
//             ].join(' ')}
//         >
//             {/* Header (solo desktop) */}
//             {!mobile && (
//                 <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
//                     {!collapsed && (
//                         <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>
//                     )}
//                     <button
//                         className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 ml-auto"
//                         onClick={toggleSidebarCollapsed}
//                         aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
//                         title={collapsed ? 'Expandir' : 'Colapsar'}
//                     >
//                         {collapsed ? '»' : '«'}
//                     </button>
//                 </div>
//             )}

//             <nav className="p-3 md:p-4 space-y-1 overflow-y-auto">
//                 {coreMenu.map((item) => (
//                     <NavItem
//                         key={item.to}
//                         {...item}
//                         collapsed={collapsed}
//                         onNavigate={handleNavigateMobile}
//                     />
//                 ))}

//                 <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

//                 {!collapsed && (
//                     <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">
//                         Configuración
//                     </div>
//                 )}

//                 {configMenu.map((item) => (
//                     <NavItem
//                         key={item.to}
//                         {...item}
//                         collapsed={collapsed}
//                         onNavigate={handleNavigateMobile}
//                     />
//                 ))}
//             </nav>
//         </aside>
//     )

//     if (!mobile) return base

//     // Drawer móvil (desliza desde la izquierda)
//     return (
//         <div
//             className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:hidden
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
//             aria-hidden={!sidebarOpen}
//         >
//             {base}
//         </div>
//     )
// }

//02022026a

// front/src/components/layout/Sidebar.jsx
// -----------------------------------------------------------------------------
// Sidebar FleetCore (drawer móvil + fijo desktop) + colapsado desktop persistente
// + acordeón "Catálogos":
// - Desktop: fijo (md+) y colapsable (w-64 <-> w-16) con botón « / »
// - Móvil: drawer (md:hidden) controlado por sidebarOpen; cierra al navegar
// - Guardia de "cambios sin guardar" al navegar (window.__FLEETCORE_UNSAVED__)
// - Catálogos: agrupados en acordeón (para no inflar el ancho del menú)
// -----------------------------------------------------------------------------

import { NavLink, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

const coreMenu = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/branches', label: 'Sucursales', icon: '🏢' },
    { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
    { to: '/people', label: 'RRHH · Personas', icon: '👥' },
    // { to: '/people', label: 'RRHH · Personas', icon: '👤' },
    { to: '/tickets', label: 'Tickets', icon: '🎫' },
]

// Catálogos (nombres cortos + fullLabel para tooltip)
const catalogsMenu = [
    {
        to: '/config/catalogs/vehicle-statuses',
        label: 'Estados vehículo',
        fullLabel: 'Catálogos · Estados de vehículo',
        icon: '📚',
    },
    {
        to: '/config/catalogs/positions',
        label: 'Cargos',
        fullLabel: 'Catálogos · Cargos',
        icon: '🧩',
    },
    {
        to: '/config/catalogs/roles',
        label: 'Roles',
        fullLabel: 'Catálogos · Roles',
        icon: '🛡️',
    },
    {
        to: '/config/catalogs/failure-reports',
        label: 'Fallas',
        fullLabel: 'Catálogos · Reporte de fallas',
        icon: '🧾',
    },
    {
        to: '/config/catalogs/repairs',
        label: 'Reparaciones',
        fullLabel: 'Catálogos · Reparaciones',
        icon: '🛠️',
    },
]

// Administración
const adminMenu = [
    // { to: '/config/users', label: 'Usuarios', fullLabel: 'Administración · Usuarios', icon: '👤' },
    { to: '/config/users', label: 'Usuarios', fullLabel: 'Administración · Usuarios', icon: '🧑‍💼' },

]

function shouldBlockNav(targetPath, currentPath) {
    try {
        const isUnsaved = Boolean(window.__FLEETCORE_UNSAVED__)
        if (!isUnsaved) return false
        if (currentPath === targetPath) return false
        return true
    } catch {
        return false
    }
}

function confirmLeave() {
    const msg =
        window.__FLEETCORE_UNSAVED_MESSAGE__ ||
        'Hay cambios sin guardar. ¿Deseas salir sin guardar?'
    return window.confirm(msg)
}

function NavItem({ to, icon, label, fullLabel, onNavigate, collapsed }) {
    const location = useLocation()

    const handleClick = (e) => {
        if (shouldBlockNav(to, location?.pathname)) {
            const ok = confirmLeave()
            if (!ok) {
                e.preventDefault()
                e.stopPropagation()
                return
            }
        }
        onNavigate?.()
    }

    return (
        <NavLink
            to={to}
            title={fullLabel || label} // tooltip útil cuando está colapsado
            className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition
         ${isActive
                    ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-700 dark:text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'}
         ${collapsed ? 'justify-center' : ''}`
            }
            onClick={handleClick}
        >
            <span className="text-lg">{icon}</span>
            {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>
    )
}

export default function Sidebar({ mobile = false, className = '' }) {
    // Drawer móvil
    const sidebarOpen = useAppStore((s) => s.sidebarOpen)
    const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

    // Colapsado desktop (persistente)
    const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
    const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed)
    // const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
    const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed)


    // Acordeón Catálogos (persistente)
    const catalogsOpen = useAppStore((s) => s.catalogsOpen)
    const toggleCatalogsOpen = useAppStore((s) => s.toggleCatalogsOpen)

    // const catalogsOpen = useAppStore((s) => s.catalogsOpen)
    // const toggleCatalogsOpen = useAppStore((s) => s.toggleCatalogsOpen)
    const setCatalogsOpen = useAppStore((s) => s.setCatalogsOpen)



    // En móvil cerramos drawer al navegar
    const handleNavigateMobile = mobile ? () => setSidebarOpen(false) : undefined

    // Colapsado SOLO aplica en desktop (en móvil, siempre ancho normal)
    const collapsed = mobile ? false : sidebarCollapsed

    const base = (
        <aside
            className={[
                'bg-white dark:bg-slate-800 border-r dark:border-slate-700 h-full flex flex-col',
                mobile ? 'w-[85vw] max-w-[360px]' : collapsed ? 'w-16' : 'w-64',
                // mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64',
                'transition-all duration-200',
                className,
            ].join(' ')}
        >
            {/* Header (solo desktop): Menú + botón colapsar */}
            {!mobile && (
                <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
                    {!collapsed && (
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>
                    )}
                    <button
                        className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 ml-auto"
                        onClick={toggleSidebarCollapsed}
                        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                        title={collapsed ? 'Expandir' : 'Colapsar'}
                        type="button"
                    >
                        {collapsed ? '»' : '«'}
                    </button>
                </div>
            )}

            <nav className="p-3 md:p-4 space-y-1 overflow-y-auto">
                {/* Núcleo */}
                {coreMenu.map((item) => (
                    <NavItem
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        fullLabel={item.label}
                        collapsed={collapsed}
                        onNavigate={handleNavigateMobile}
                    />
                ))}

                <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

                {/* CATÁLOGOS (acordeón)
            - Cuando está colapsado: solo ícono + tooltip (no lista interna)
            - Cuando está expandido: botón + lista desplegable
        */}
                {/* CATÁLOGOS (acordeón) */}
                <div className="px-2">
                    <button
                        type="button"
                        onClick={() => {
                            // Si está colapsado: expande y abre SIEMPRE
                            if (collapsed) {
                                setSidebarCollapsed(false)
                                setCatalogsOpen(true)
                                return
                            }
                            // Si no está colapsado: toggle normal
                            toggleCatalogsOpen()
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition
                        text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700
                        ${collapsed ? 'justify-center' : ''}`}
                        title="Catálogos"
                        aria-expanded={catalogsOpen}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-lg">🗂️</span>
                            {!collapsed && (
                                <span className="text-[11px] uppercase tracking-wide text-slate-500">
                                    Catálogos
                                </span>
                            )}
                        </span>

                        {!collapsed && (
                            <span className="text-slate-400 text-xs">{catalogsOpen ? '▾' : '▸'}</span>
                        )}
                    </button>

                    {/* Submenú: solo cuando NO está colapsado */}
                    {!collapsed && catalogsOpen && (
                        <div className="mt-1 space-y-1 pl-2">
                            {catalogsMenu.map((item) => (
                                <NavItem
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    fullLabel={item.fullLabel}
                                    collapsed={false}
                                    onNavigate={handleNavigateMobile}
                                />
                            ))}
                        </div>
                    )}
                </div>


                <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

                {/* Administración */}
                {!collapsed && (
                    <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">
                        Administración
                    </div>
                )}

                {adminMenu.map((item) => (
                    <NavItem
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        fullLabel={item.fullLabel}
                        collapsed={collapsed}
                        onNavigate={handleNavigateMobile}
                    />
                ))}
            </nav>
        </aside>
    )

    // Desktop fijo
    if (!mobile) return base

    // Drawer móvil
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
