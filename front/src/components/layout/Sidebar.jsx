// // // // front/src/components/layout/Sidebar.jsx
// // // // -----------------------------------------------------------------------------
// // // // Sidebar FleetCore (drawer móvil + fijo desktop) + colapsado desktop persistente
// // // // + acordeón "Catálogos":
// // // // - Desktop: fijo (md+) y colapsable (w-64 <-> w-16) con botón « / »
// // // // - Móvil: drawer (md:hidden) controlado por sidebarOpen; cierra al navegar
// // // // - Guardia de "cambios sin guardar" al navegar (window.__FLEETCORE_UNSAVED__)
// // // // - Catálogos: agrupados en acordeón (para no inflar el ancho del menú)
// // // // -----------------------------------------------------------------------------

// // // import { NavLink, useLocation } from 'react-router-dom'
// // // import { useAppStore } from '../../store/useAppStore'

// // // const coreMenu = [
// // //     { to: '/dashboard', label: 'Dashboard', icon: '📊' },
// // //     { to: '/branches', label: 'Sucursales', icon: '🏢' },
// // //     { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
// // //     { to: '/people', label: 'RRHH · Personas', icon: '👥' },
// // //     // { to: '/people', label: 'RRHH · Personas', icon: '👤' },
// // //     { to: '/tickets', label: 'Tickets', icon: '🎫' },
// // // ]

// // // // Catálogos (nombres cortos + fullLabel para tooltip)
// // // const catalogsMenu = [
// // //     {
// // //         to: '/config/catalogs/vehicle-statuses',
// // //         label: 'Estados vehículo',
// // //         fullLabel: 'Catálogos · Estados de vehículo',
// // //         icon: '📚',
// // //     },
// // //     {
// // //         to: '/config/catalogs/positions',
// // //         label: 'Cargos',
// // //         fullLabel: 'Catálogos · Cargos',
// // //         icon: '🧩',
// // //     },
// // //     {
// // //         to: '/config/catalogs/failure-reports',
// // //         label: 'Fallas',
// // //         fullLabel: 'Catálogos · Reporte de fallas',
// // //         icon: '🧾',
// // //     },
// // //     {
// // //         to: '/config/catalogs/repairs',
// // //         label: 'Reparaciones',
// // //         fullLabel: 'Catálogos · Reparaciones',
// // //         icon: '🛠️',
// // //     },
// // // ]

// // // // Administración
// // // const adminMenu = [
// // //     // { to: '/config/users', label: 'Usuarios', fullLabel: 'Administración · Usuarios', icon: '👤' },
// // //     { to: '/config/roles', label: 'Roles', fullLabel: 'Administración · Roles', icon: '🛡️' },
// // //     { to: '/config/users', label: 'Usuarios', fullLabel: 'Administración · Usuarios', icon: '🧑‍💼' },

// // // ]

// // // function shouldBlockNav(targetPath, currentPath) {
// // //     try {
// // //         const isUnsaved = Boolean(window.__FLEETCORE_UNSAVED__)
// // //         if (!isUnsaved) return false
// // //         if (currentPath === targetPath) return false
// // //         return true
// // //     } catch {
// // //         return false
// // //     }
// // // }

// // // function confirmLeave() {
// // //     const msg =
// // //         window.__FLEETCORE_UNSAVED_MESSAGE__ ||
// // //         'Hay cambios sin guardar. ¿Deseas salir sin guardar?'
// // //     return window.confirm(msg)
// // // }

// // // function NavItem({ to, icon, label, fullLabel, onNavigate, collapsed }) {
// // //     const location = useLocation()

// // //     const handleClick = (e) => {
// // //         if (shouldBlockNav(to, location?.pathname)) {
// // //             const ok = confirmLeave()
// // //             if (!ok) {
// // //                 e.preventDefault()
// // //                 e.stopPropagation()
// // //                 return
// // //             }
// // //         }
// // //         onNavigate?.()
// // //     }

// // //     return (
// // //         <NavLink
// // //             to={to}
// // //             title={fullLabel || label} // tooltip útil cuando está colapsado
// // //             className={({ isActive }) =>
// // //                 `flex items-center gap-2 px-3 py-2 rounded-lg transition
// // //          ${isActive
// // //                     ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-700 dark:text-white'
// // //                     : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'}
// // //          ${collapsed ? 'justify-center' : ''}`
// // //             }
// // //             onClick={handleClick}
// // //         >
// // //             <span className="text-lg">{icon}</span>
// // //             {!collapsed && <span className="truncate">{label}</span>}
// // //         </NavLink>
// // //     )
// // // }

// // // export default function Sidebar({ mobile = false, className = '' }) {
// // //     // Drawer móvil
// // //     const sidebarOpen = useAppStore((s) => s.sidebarOpen)
// // //     const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

// // //     // Colapsado desktop (persistente)
// // //     const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
// // //     const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed)
// // //     // const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
// // //     const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed)


// // //     // Acordeón Catálogos (persistente)
// // //     const catalogsOpen = useAppStore((s) => s.catalogsOpen)
// // //     const toggleCatalogsOpen = useAppStore((s) => s.toggleCatalogsOpen)

// // //     // const catalogsOpen = useAppStore((s) => s.catalogsOpen)
// // //     // const toggleCatalogsOpen = useAppStore((s) => s.toggleCatalogsOpen)
// // //     const setCatalogsOpen = useAppStore((s) => s.setCatalogsOpen)



// // //     // En móvil cerramos drawer al navegar
// // //     const handleNavigateMobile = mobile ? () => setSidebarOpen(false) : undefined

// // //     // Colapsado SOLO aplica en desktop (en móvil, siempre ancho normal)
// // //     const collapsed = mobile ? false : sidebarCollapsed

// // //     const base = (
// // //         <aside
// // //             className={[
// // //                 'bg-white dark:bg-slate-800 border-r dark:border-slate-700 h-full flex flex-col',
// // //                 mobile ? 'w-[85vw] max-w-[360px]' : collapsed ? 'w-16' : 'w-64',
// // //                 // mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64',
// // //                 'transition-all duration-200',
// // //                 className,
// // //             ].join(' ')}
// // //         >
// // //             {/* Header (solo desktop): Menú + botón colapsar */}
// // //             {!mobile && (
// // //                 <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
// // //                     {!collapsed && (
// // //                         <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>
// // //                     )}
// // //                     <button
// // //                         className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 ml-auto"
// // //                         onClick={toggleSidebarCollapsed}
// // //                         aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
// // //                         title={collapsed ? 'Expandir' : 'Colapsar'}
// // //                         type="button"
// // //                     >
// // //                         {collapsed ? '»' : '«'}
// // //                     </button>
// // //                 </div>
// // //             )}

// // //             <nav className="p-3 md:p-4 space-y-1 overflow-y-auto">
// // //                 {/* Núcleo */}
// // //                 {coreMenu.map((item) => (
// // //                     <NavItem
// // //                         key={item.to}
// // //                         to={item.to}
// // //                         icon={item.icon}
// // //                         label={item.label}
// // //                         fullLabel={item.label}
// // //                         collapsed={collapsed}
// // //                         onNavigate={handleNavigateMobile}
// // //                     />
// // //                 ))}

// // //                 <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

// // //                 {/* CATÁLOGOS (acordeón)
// // //             - Cuando está colapsado: solo ícono + tooltip (no lista interna)
// // //             - Cuando está expandido: botón + lista desplegable
// // //         */}
// // //                 {/* CATÁLOGOS (acordeón) */}
// // //                 <div className="px-2">
// // //                     <button
// // //                         type="button"
// // //                         onClick={() => {
// // //                             // Si está colapsado: expande y abre SIEMPRE
// // //                             if (collapsed) {
// // //                                 setSidebarCollapsed(false)
// // //                                 setCatalogsOpen(true)
// // //                                 return
// // //                             }
// // //                             // Si no está colapsado: toggle normal
// // //                             toggleCatalogsOpen()
// // //                         }}
// // //                         className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition
// // //                         text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700
// // //                         ${collapsed ? 'justify-center' : ''}`}
// // //                         title="Catálogos"
// // //                         aria-expanded={catalogsOpen}
// // //                     >
// // //                         <span className="flex items-center gap-2">
// // //                             <span className="text-lg">🗂️</span>
// // //                             {!collapsed && (
// // //                                 <span className="text-[11px] uppercase tracking-wide text-slate-500">
// // //                                     Catálogos
// // //                                 </span>
// // //                             )}
// // //                         </span>

// // //                         {!collapsed && (
// // //                             <span className="text-slate-400 text-xs">{catalogsOpen ? '▾' : '▸'}</span>
// // //                         )}
// // //                     </button>

// // //                     {/* Submenú: solo cuando NO está colapsado */}
// // //                     {!collapsed && catalogsOpen && (
// // //                         <div className="mt-1 space-y-1 pl-2">
// // //                             {catalogsMenu.map((item) => (
// // //                                 <NavItem
// // //                                     key={item.to}
// // //                                     to={item.to}
// // //                                     icon={item.icon}
// // //                                     label={item.label}
// // //                                     fullLabel={item.fullLabel}
// // //                                     collapsed={false}
// // //                                     onNavigate={handleNavigateMobile}
// // //                                 />
// // //                             ))}
// // //                         </div>
// // //                     )}
// // //                 </div>


// // //                 <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

// // //                 {/* Administración */}
// // //                 {!collapsed && (
// // //                     <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">
// // //                         Administración
// // //                     </div>
// // //                 )}

// // //                 {adminMenu.map((item) => (
// // //                     <NavItem
// // //                         key={item.to}
// // //                         to={item.to}
// // //                         icon={item.icon}
// // //                         label={item.label}
// // //                         fullLabel={item.fullLabel}
// // //                         collapsed={collapsed}
// // //                         onNavigate={handleNavigateMobile}
// // //                     />
// // //                 ))}
// // //             </nav>
// // //         </aside>
// // //     )

// // //     // Desktop fijo
// // //     if (!mobile) return base

// // //     // Drawer móvil
// // //     return (
// // //         <div
// // //             className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:hidden
// // //         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
// // //             aria-hidden={!sidebarOpen}
// // //         >
// // //             {base}
// // //         </div>
// // //     )
// // // }
// // //130226
// // // front/src/components/layout/Sidebar.jsx
// // // -----------------------------------------------------------------------------
// // // Sidebar FleetCore (drawer móvil + fijo desktop) + colapsado desktop persistente
// // // + acordeón "Catálogos":
// // // - Desktop: fijo (md+) y colapsable (w-64 <-> w-16) con botón « / »
// // // - Móvil: drawer (md:hidden) controlado por sidebarOpen; cierra al navegar
// // // - Guardia de "cambios sin guardar" al navegar (window.__FLEETCORE_UNSAVED__)
// // // - Catálogos: agrupados en acordeón (para no inflar el ancho del menú)
// // // -----------------------------------------------------------------------------

// // import { NavLink, useLocation } from 'react-router-dom'
// // import { useAppStore } from '../../store/useAppStore'

// // const coreMenu = [
// //     { to: '/dashboard', label: 'Dashboard', icon: '📊' },
// //     { to: '/branches', label: 'Sucursales', icon: '🏢' },
// //     { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
// //     { to: '/people', label: 'RRHH · Personas', icon: '👥' },
// //     // { to: '/people', label: 'RRHH · Personas', icon: '👤' },
// //     { to: '/tickets', label: 'Tickets', icon: '🎫' },
// // ]

// // // Catálogos (nombres cortos + fullLabel para tooltip)
// // const catalogsMenu = [
// //     {
// //         to: '/config/catalogs/vehicle-statuses',
// //         label: 'Estados vehículo',
// //         fullLabel: 'Catálogos · Estados de vehículo',
// //         icon: '📚',
// //     },
// //     {
// //         to: '/config/catalogs/positions',
// //         label: 'Cargos',
// //         fullLabel: 'Catálogos · Cargos',
// //         icon: '🧩',
// //     },
// //     {
// //         to: '/config/catalogs/failure-reports',
// //         label: 'Fallas',
// //         fullLabel: 'Catálogos · Reporte de fallas',
// //         icon: '🧾',
// //     },
// //     {
// //         to: '/config/catalogs/repairs',
// //         label: 'Reparaciones',
// //         fullLabel: 'Catálogos · Reparaciones',
// //         icon: '🛠️',
// //     },
// // ]

// // // Administración
// // const adminMenu = [
// //     // { to: '/config/users', label: 'Usuarios', fullLabel: 'Administración · Usuarios', icon: '👤' },
// //     { to: '/config/roles', label: 'Roles', fullLabel: 'Administración · Roles', icon: '🛡️' },
// //     { to: '/config/users', label: 'Usuarios', fullLabel: 'Administración · Usuarios', icon: '🧑‍💼' },

// // ]

// // function shouldBlockNav(targetPath, currentPath) {
// //     try {
// //         const isUnsaved = Boolean(window.__FLEETCORE_UNSAVED__)
// //         if (!isUnsaved) return false
// //         if (currentPath === targetPath) return false
// //         return true
// //     } catch {
// //         return false
// //     }
// // }

// // function confirmLeave() {
// //     const msg =
// //         window.__FLEETCORE_UNSAVED_MESSAGE__ ||
// //         'Hay cambios sin guardar. ¿Deseas salir sin guardar?'
// //     return window.confirm(msg)
// // }

// // function NavItem({ to, icon, label, fullLabel, onNavigate, collapsed }) {
// //     const location = useLocation()

// //     const handleClick = (e) => {
// //         if (shouldBlockNav(to, location?.pathname)) {
// //             const ok = confirmLeave()
// //             if (!ok) {
// //                 e.preventDefault()
// //                 e.stopPropagation()
// //                 return
// //             }
// //         }
// //         onNavigate?.()
// //     }

// //     return (
// //         <NavLink
// //             to={to}
// //             title={fullLabel || label} // tooltip útil cuando está colapsado
// //             className={({ isActive }) =>
// //                 `flex items-center gap-2 px-3 py-2 rounded-lg transition
// //          ${isActive
// //                     ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-700 dark:text-white'
// //                     : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'}
// //          ${collapsed ? 'justify-center' : ''}`
// //             }
// //             onClick={handleClick}
// //         >
// //             <span className="text-lg">{icon}</span>
// //             {!collapsed && <span className="truncate">{label}</span>}
// //         </NavLink>
// //     )
// // }

// // export default function Sidebar({ mobile = false, className = '' }) {
// //     // Drawer móvil
// //     const sidebarOpen = useAppStore((s) => s.sidebarOpen)
// //     const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

// //     // Colapsado desktop (persistente)
// //     const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
// //     const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed)
// //     // const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
// //     const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed)


// //     // Acordeón Catálogos (persistente)
// //     const catalogsOpen = useAppStore((s) => s.catalogsOpen)
// //     const toggleCatalogsOpen = useAppStore((s) => s.toggleCatalogsOpen)

// //     // const catalogsOpen = useAppStore((s) => s.catalogsOpen)
// //     // const toggleCatalogsOpen = useAppStore((s) => s.toggleCatalogsOpen)
// //     const setCatalogsOpen = useAppStore((s) => s.setCatalogsOpen)



// //     // En móvil cerramos drawer al navegar
// //     const handleNavigateMobile = mobile ? () => setSidebarOpen(false) : undefined

// //     // Colapsado SOLO aplica en desktop (en móvil, siempre ancho normal)
// //     const collapsed = mobile ? false : sidebarCollapsed

// //     const base = (
// //         <aside
// //             className={[
// //                 'bg-white dark:bg-slate-800 border-r dark:border-slate-700 h-full flex flex-col',
// //                 mobile ? 'w-[85vw] max-w-[360px]' : collapsed ? 'w-16' : 'w-64',
// //                 // mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64',
// //                 'transition-all duration-200',
// //                 className,
// //             ].join(' ')}
// //         >
// //             {/* Header (solo desktop): Menú + botón colapsar */}
// //             {!mobile && (
// //                 <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
// //                     {!collapsed && (
// //                         <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>
// //                     )}
// //                     <div className="flex items-center gap-2 ml-auto">
// //                     <button
// //                         type="button"
// //                         className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
// //                         onClick={() => setIconMode((m) => (m === "icons" ? "bullets" : "icons"))}
// //                         title={iconMode === "icons" ? "Cambiar a viñetas" : "Cambiar a íconos"}
// //                         aria-label="Alternar íconos/viñetas"
// //                     >
// //                         {iconMode === "icons" ? "•" : "😶"}
// //                     </button>

// //                     <button
// //                         className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
// //                         onClick={toggleSidebarCollapsed}
// //                         aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
// //                         title={collapsed ? "Expandir" : "Colapsar"}
// //                         type="button"
// //                     >
// //                         {collapsed ? "»" : "«"}
// //                     </button>
// //                 </div>
// //                 </div>
// //             )}

// //             <nav className="p-3 md:p-4 space-y-1 overflow-y-auto">
// //                 {/* Núcleo */}
// //                 {coreMenu.map((item) => (
// //                     <NavItem
// //                         key={item.to}
// //                         to={item.to}
// //                         icon={item.icon}
// //                         label={item.label}
// //                         fullLabel={item.label}
// //                         collapsed={collapsed}
// //                         onNavigate={handleNavigateMobile}
// //                     />
// //                 ))}

// //                 <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

// //                 {/* CATÁLOGOS (acordeón)
// //             - Cuando está colapsado: solo ícono + tooltip (no lista interna)
// //             - Cuando está expandido: botón + lista desplegable
// //         */}
// //                 {/* CATÁLOGOS (acordeón) */}
// //                 <div className="px-2">
// //                     <button
// //                         type="button"
// //                         onClick={() => {
// //                             // Si está colapsado: expande y abre SIEMPRE
// //                             if (collapsed) {
// //                                 setSidebarCollapsed(false)
// //                                 setCatalogsOpen(true)
// //                                 return
// //                             }
// //                             // Si no está colapsado: toggle normal
// //                             toggleCatalogsOpen()
// //                         }}
// //                         className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition
// //                         text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700
// //                         ${collapsed ? 'justify-center' : ''}`}
// //                         title="Catálogos"
// //                         aria-expanded={catalogsOpen}
// //                     >
// //                         <span className="flex items-center gap-2">
// //                             <span className="text-lg">🗂️</span>
// //                             {!collapsed && (
// //                                 <span className="text-[11px] uppercase tracking-wide text-slate-500">
// //                                     Catálogos
// //                                 </span>
// //                             )}
// //                         </span>

// //                         {!collapsed && (
// //                             <span className="text-slate-400 text-xs">{catalogsOpen ? '▾' : '▸'}</span>
// //                         )}
// //                     </button>

// //                     {/* Submenú: solo cuando NO está colapsado */}
// //                     {!collapsed && catalogsOpen && (
// //                         <div className="mt-1 space-y-1 pl-2">
// //                             {catalogsMenu.map((item) => (
// //                                 <NavItem
// //                                     key={item.to}
// //                                     to={item.to}
// //                                     icon={item.icon}
// //                                     label={item.label}
// //                                     fullLabel={item.fullLabel}
// //                                     collapsed={false}
// //                                     onNavigate={handleNavigateMobile}
// //                                 />
// //                             ))}
// //                         </div>
// //                     )}
// //                 </div>


// //                 <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

// //                 {/* Administración */}
// //                 {!collapsed && (
// //                     <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">
// //                         Administración
// //                     </div>
// //                 )}

// //                 {adminMenu.map((item) => (
// //                     <NavItem
// //                         key={item.to}
// //                         to={item.to}
// //                         icon={item.icon}
// //                         label={item.label}
// //                         fullLabel={item.fullLabel}
// //                         collapsed={collapsed}
// //                         onNavigate={handleNavigateMobile}
// //                     />
// //                 ))}
// //             </nav>
// //         </aside>
// //     )

// //     // Desktop fijo
// //     if (!mobile) return base

// //     // Drawer móvil
// //     return (
// //         <div
// //             className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:hidden
// //         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
// //             aria-hidden={!sidebarOpen}
// //         >
// //             {base}
// //         </div>
// //     )
// // }

//     // front/src/components/layout/Sidebar.jsx
// // -----------------------------------------------------------------------------
// // Sidebar FleetCore (drawer móvil + fijo desktop) + colapsado desktop persistente
// // + acordeón "Catálogos":
// // - Desktop: fijo (md+) y colapsable (w-64 <-> w-16) con botón « / »
// // - Móvil: drawer (md:hidden) controlado por sidebarOpen; cierra al navegar
// // - Guardia de "cambios sin guardar" al navegar (window.__FLEETCORE_UNSAVED__)
// // - Catálogos: agrupados en acordeón (para no inflar el ancho del menú)
// // -----------------------------------------------------------------------------

// import { NavLink, useLocation } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import { useAppStore } from '../../store/useAppStore'

// const coreMenu = [
//     { to: '/dashboard', label: 'Dashboard', icon: '📊' },
//     { to: '/branches', label: 'Sucursales', icon: '🏢' },
//     { to: '/vehicles', label: 'Vehículos', icon: '🚒' },
//     { to: '/people', label: 'RRHH · Personas', icon: '👥' },
//     // { to: '/people', label: 'RRHH · Personas', icon: '👤' },
//     { to: '/tickets', label: 'Tickets', icon: '🎫' },
// ]

// // Catálogos (nombres cortos + fullLabel para tooltip)
// const catalogsMenu = [
//     {
//         to: '/config/catalogs/vehicle-statuses',
//         label: 'Estados vehículo',
//         fullLabel: 'Catálogos · Estados de vehículo',
//         icon: '📚',
//     },
//     {
//         to: '/config/catalogs/positions',
//         label: 'Cargos',
//         fullLabel: 'Catálogos · Cargos',
//         icon: '🧩',
//     },
//     {
//         to: '/config/catalogs/failure-reports',
//         label: 'Fallas',
//         fullLabel: 'Catálogos · Reporte de fallas',
//         icon: '🧾',
//     },
//     {
//         to: '/config/catalogs/repairs',
//         label: 'Reparaciones',
//         fullLabel: 'Catálogos · Reparaciones',
//         icon: '🛠️',
//     },
// ]

// // Administración
// const adminMenu = [
//     // { to: '/config/users', label: 'Usuarios', fullLabel: 'Administración · Usuarios', icon: '👤' },
//     { to: '/config/roles', label: 'Roles', fullLabel: 'Administración · Roles', icon: '🛡️' },
//     { to: '/config/users', label: 'Usuarios', fullLabel: 'Administración · Usuarios', icon: '🧑‍💼' },

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

// function NavItem({ to, icon, label, fullLabel, onNavigate, collapsed }) {
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
//             title={fullLabel || label} // tooltip útil cuando está colapsado
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
//     // Drawer móvil
//     const sidebarOpen = useAppStore((s) => s.sidebarOpen)
//     const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

//     // Colapsado desktop (persistente)
//     const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
//     const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed)
//     // const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
//     const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed)


//     // Acordeón Catálogos (persistente)
//     const catalogsOpen = useAppStore((s) => s.catalogsOpen)
//     const toggleCatalogsOpen = useAppStore((s) => s.toggleCatalogsOpen)

//     // const catalogsOpen = useAppStore((s) => s.catalogsOpen)
//     // const toggleCatalogsOpen = useAppStore((s) => s.toggleCatalogsOpen)
//     const setCatalogsOpen = useAppStore((s) => s.setCatalogsOpen)

//     // Modo de íconos del sidebar: 'icons' | 'bullets' (persistente)
//     const [iconMode, setIconMode] = useState(() => {
//         try {
//             return window.localStorage.getItem('fc_sidebar_icon_mode') || 'icons'
//         } catch {
//             return 'icons'
//         }
//     })

//     useEffect(() => {
//         try {
//             window.localStorage.setItem('fc_sidebar_icon_mode', iconMode)
//         } catch {}
//     }, [iconMode])

//     // En móvil cerramos drawer al navegar
//     const handleNavigateMobile = mobile ? () => setSidebarOpen(false) : undefined

//     // Colapsado SOLO aplica en desktop (en móvil, siempre ancho normal)
//     const collapsed = mobile ? false : sidebarCollapsed

//     const base = (
//         <aside
//             className={[
//                 'bg-white dark:bg-slate-800 border-r dark:border-slate-700 h-full flex flex-col',
//                 mobile ? 'w-[85vw] max-w-[360px]' : collapsed ? 'w-16' : 'w-64',
//                 // mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64',
//                 'transition-all duration-200',
//                 className,
//             ].join(' ')}
//         >
//             {/* Header (solo desktop): Menú + botón colapsar */}
//             {!mobile && (
//                 <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
//                     {!collapsed && (
//                         <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>
//                     )}
//                     <div className="flex items-center gap-2 ml-auto">
//                     <button
//                         type="button"
//                         className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
//                         onClick={() => setIconMode((m) => (m === "icons" ? "bullets" : "icons"))}
//                         title={iconMode === "icons" ? "Cambiar a viñetas" : "Cambiar a íconos"}
//                         aria-label="Alternar íconos/viñetas"
//                     >
//                         {iconMode === "icons" ? "•" : "😶"}
//                     </button>

//                     <button
//                         className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
//                         onClick={toggleSidebarCollapsed}
//                         aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
//                         title={collapsed ? "Expandir" : "Colapsar"}
//                         type="button"
//                     >
//                         {collapsed ? "»" : "«"}
//                     </button>
//                 </div>
//                 </div>
//             )}

//             <nav className="p-3 md:p-4 space-y-1 overflow-y-auto">
//                 {/* Núcleo */}
//                 {coreMenu.map((item) => (
//                     <NavItem
//                         key={item.to}
//                         to={item.to}
//                         // icon={iconMode === 'icons' ? item.icon : '●'}
//                         icon={iconMode === 'icons' ? item.icon : ''}
//                         label={item.label}
//                         fullLabel={item.label}
//                         collapsed={collapsed}
//                         onNavigate={handleNavigateMobile}
//                     />
//                 ))}

//                 <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

//                 {/* CATÁLOGOS (acordeón)
//             - Cuando está colapsado: solo ícono + tooltip (no lista interna)
//             - Cuando está expandido: botón + lista desplegable
//         */}
//                 {/* CATÁLOGOS (acordeón) */}
//                 <div className="px-2">
//                     <button
//                         type="button"
//                         onClick={() => {
//                             // Si está colapsado: expande y abre SIEMPRE
//                             if (collapsed) {
//                                 setSidebarCollapsed(false)
//                                 setCatalogsOpen(true)
//                                 return
//                             }
//                             // Si no está colapsado: toggle normal
//                             toggleCatalogsOpen()
//                         }}
//                         className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition
//                         text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700
//                         ${collapsed ? 'justify-center' : ''}`}
//                         title="Catálogos"
//                         aria-expanded={catalogsOpen}
//                     >
//                         <span className="flex items-center gap-2">
//                             <span className="text-lg"></span>
//                             {/* <span className="text-lg">🗂️</span> */}
//                             {!collapsed && (
//                                 <span className="text-[11px] uppercase tracking-wide text-slate-500">
//                                     Catálogos
//                                 </span>
//                             )}
//                         </span>

//                         {!collapsed && (
//                             <span className="text-slate-400 text-xs">{catalogsOpen ? '▾' : '▸'}</span>
//                         )}
//                     </button>

//                     {/* Submenú: solo cuando NO está colapsado */}
//                     {!collapsed && catalogsOpen && (
//                         <div className="mt-1 space-y-1 pl-2">
//                             {catalogsMenu.map((item) => (
//                                 <NavItem
//                                     key={item.to}
//                                     to={item.to}
//                                     // icon={iconMode === 'icons' ? item.icon : '●'}
//                                     icon={iconMode === 'icons' ? item.icon : ''}
//                                     label={item.label}
//                                     fullLabel={item.fullLabel}
//                                     collapsed={false}
//                                     onNavigate={handleNavigateMobile}
//                                 />
//                             ))}
//                         </div>
//                     )}
//                 </div>


//                 <div className="h-[1px] my-3 bg-slate-200 dark:bg-slate-700" />

//                 {/* Administración */}
//                 {!collapsed && (
//                     <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">
//                         Administración
//                     </div>
//                 )}

//                 {adminMenu.map((item) => (
//                     <NavItem
//                         key={item.to}
//                         to={item.to}
//                         icon={iconMode === 'icons' ? item.icon : '●'}
//                         label={item.label}
//                         fullLabel={item.fullLabel}
//                         collapsed={collapsed}
//                         onNavigate={handleNavigateMobile}
//                     />
//                 ))}
//             </nav>
//         </aside>
//     )

//     // Desktop fijo
//     if (!mobile) return base

//     // Drawer móvil
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

//140226
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
import { useState } from "react";import { useAppStore } from '../../store/useAppStore'

// ----------------------------------------------------------------------------
// Configuración rápida (decide el DEV, no el usuario)
// - Si SIDEBAR_SHOW_ICONS = true: se usan los íconos del menú.
// - Si es false: se usa un glifo simple (viñeta, etc.) definido en SIDEBAR_ALT_GLYPH.
// ----------------------------------------------------------------------------
const SIDEBAR_SHOW_ICONS = false;
const SIDEBAR_ALT_GLYPH = "";
// const SIDEBAR_ALT_GLYPH = "●"


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
    { to: '/config/roles', label: 'Roles', fullLabel: 'Administración · Roles', icon: '🛡️' },
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

    // Modo de íconos del sidebar: 'icons' | 'bullets' (persistente)
    
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
                    <div className="flex items-center gap-2 ml-auto">
<button
                        className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                        onClick={toggleSidebarCollapsed}
                        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
                        title={collapsed ? "Expandir" : "Colapsar"}
                        type="button"
                    >
                        {collapsed ? "»" : "«"}
                    </button>
                </div>
                </div>
            )}

            <nav className="p-3 md:p-4 space-y-1 overflow-y-auto">
                {/* Núcleo */}
                {coreMenu.map((item) => (
                    <NavItem
                        key={item.to}
                        to={item.to}
                        icon={SIDEBAR_SHOW_ICONS ? item.icon : SIDEBAR_ALT_GLYPH}
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
                                    icon={SIDEBAR_SHOW_ICONS ? item.icon : SIDEBAR_ALT_GLYPH}
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
                        icon={SIDEBAR_SHOW_ICONS ? item.icon : SIDEBAR_ALT_GLYPH}
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