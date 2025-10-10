// // front/src/components/layout/AppLayout.jsx
// // -----------------------------------------------------------------------------
// // App shell (Topbar + Sidebar + Outlet) con rehidratación de sesión:
// // - Llama a /api/v1/auth/me al montar para recuperar el usuario desde cookie.
// // - Requiere axios con withCredentials:true (ver front/src/services/http.js).
// // - Drawer móvil opcional via useUiStore (si no existe, no rompe).
// // -----------------------------------------------------------------------------
// import { useEffect } from 'react'
// import { Outlet } from 'react-router-dom'
// import Topbar from './Topbar'
// import Sidebar from './Sidebar'
// import { api } from '../../services/http'
// import { useAppStore } from '../../store/useAppStore'

// // Soporte opcional para UI store (drawer móvil)
// let useUiStore
// try {
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   useUiStore = require('../../store/useUiStore').useUiStore
// } catch {
//   useUiStore = () => ({ sidebarOpen: false })
// }

// export default function AppLayout() {
//   const setUser = useAppStore(s => s.setUser)
//   const { sidebarOpen } = (useUiStore && useUiStore()) || { sidebarOpen: false }

//   // Rehidrata la sesión con cookie httpOnly (fc_token) si existe
//   useEffect(() => {
//     api.get('/api/v1/auth/me')
//       .then(({ data }) => setUser(data.user))
//       .catch(() => { /* sin sesión → guardia de rutas te llevará a /login */ })
//   }, [setUser])

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Sidebar (desktop) */}
//       <Sidebar className="hidden md:block" />

//       {/* Drawer overlay (mobile) */}
//       {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" />}

//       {/* Sidebar (mobile drawer) */}
//       <Sidebar mobile />

//       {/* Main */}
//       <main className="flex-1 flex flex-col min-w-0">
//         <Topbar />
//         <div className="flex-1 min-w-0 overflow-auto p-3 sm:p-4 lg:p-6">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   )
// }


// // ***** PRELIMINAR ////
// // front/src/components/layout/AppLayout.jsx
// // -----------------------------------------------------------------------------
// // Layout principal de FleetCore Suite
// //  - Incluye Sidebar fijo (izquierda) y Topbar superior.
// //  - Renderiza el módulo activo mediante <Outlet />.
// //  - Aplica esquema responsive y respeta dark mode.
// // -----------------------------------------------------------------------------

// import { Outlet } from 'react-router-dom'
// import Topbar from './Topbar'
// import { useAppStore } from '../../store/useAppStore'
// import { useState } from 'react'

// export default function AppLayout() {
//   const sidebarOpen = useAppStore(s => s.sidebarOpen)
//   const toggleSidebar = useAppStore(s => s.toggleSidebar)
//   const [collapsed, setCollapsed] = useState(false)

//   return (
//     <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
//       {/* -----------------------------------------------------------------
//            Sidebar
//          ----------------------------------------------------------------- */}
//       <aside
//         className={`${
//           collapsed ? 'w-16' : 'w-64'
//         } bg-gray-100 dark:bg-slate-800 border-r dark:border-slate-700
//           hidden md:flex flex-col transition-all duration-200`}
//       >
//         <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
//           <span className="font-semibold text-slate-700 dark:text-slate-200">
//             Menu
//           </span>
//           <button
//             className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
//             onClick={() => setCollapsed(!collapsed)}
//           >
//             {collapsed ? '»' : '«'}
//           </button>
//         </div>

//         <nav className="flex-1 p-2 text-sm text-slate-600 dark:text-slate-300 space-y-1">
//           <a href="/dashboard" className="block px-3 py-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
//             Dashboard
//           </a>
//           <a href="/branches" className="block px-3 py-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
//             Sucursales
//           </a>
//           <a href="/vehicles" className="block px-3 py-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
//             Vehículos
//           </a>
//           <a href="/tickets" className="block px-3 py-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
//             Tickets
//           </a>
//         </nav>
//       </aside>

//       {/* -----------------------------------------------------------------
//            Área principal (Topbar + Outlet)
//          ----------------------------------------------------------------- */}
//       <main className="flex-1 flex flex-col min-w-0">
//         <Topbar toggleSidebar={toggleSidebar} />
//         <div className="flex-1 p-4 overflow-y-auto">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   )
// }


////**** OPTIMIZADA */

// front/src/components/layout/AppLayout.jsx
import { Outlet, NavLink } from 'react-router-dom'
import Topbar from './Topbar'
import { useAppStore } from '../../store/useAppStore'
import { useState } from 'react'

function Item({ to, icon, children, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded mx-2 my-0.5
         ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}
         text-sm text-slate-700 dark:text-slate-200`
      }
    >
      <span className="w-5 h-5 inline-flex items-center justify-center">{icon}</span>
      {!collapsed && <span className="truncate">{children}</span>}
    </NavLink>
  )
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-64'}
          bg-gray-100 dark:bg-slate-800 border-r dark:border-slate-700
          hidden md:flex flex-col transition-all duration-200 overflow-hidden`}
      >
        {/* Cabecera del sidebar (misma altura que Topbar) */}
        <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
          {!collapsed && (
            <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>
          )}
          <button
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 ml-auto"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <Item to="/dashboard" icon="📊" collapsed={collapsed}>Dashboard</Item>
          <Item to="/branches"  icon="🏢" collapsed={collapsed}>Sucursales</Item>
          <Item to="/vehicles"  icon="🚒" collapsed={collapsed}>Vehículos</Item>
          <Item to="/tickets"   icon="🎫" collapsed={collapsed}>Tickets</Item>
        </nav>
      </aside>

      {/* Área principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
