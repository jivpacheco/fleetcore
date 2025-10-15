// // front/src/components/layout/AppLayout.jsx
// import { Outlet, NavLink } from 'react-router-dom'
// import Topbar from './Topbar'
// import { useAppStore } from '../../store/useAppStore'
// import { useState } from 'react'

// function Item({ to, icon, children, collapsed }) {
//   return (
//     <NavLink
//       to={to}
//       className={({ isActive }) =>
//         `flex items-center gap-3 px-3 py-2 rounded mx-2 my-0.5
//          ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}
//          text-sm text-slate-700 dark:text-slate-200`
//       }
//     >
//       <span className="w-5 h-5 inline-flex items-center justify-center">{icon}</span>
//       {!collapsed && <span className="truncate">{children}</span>}
//     </NavLink>
//   )
// }

// export default function AppLayout() {
//   const [collapsed, setCollapsed] = useState(false)

//   return (
//     <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
//       {/* Sidebar */}
//       <aside
//         className={`${collapsed ? 'w-16' : 'w-64'}
//           bg-gray-100 dark:bg-slate-800 border-r dark:border-slate-700
//           hidden md:flex flex-col transition-all duration-200 overflow-hidden`}
//       >
//         {/* Cabecera del sidebar (misma altura que Topbar) */}
//         <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
//           {!collapsed && (
//             <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>
//           )}
//           <button
//             className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 ml-auto"
//             onClick={() => setCollapsed(!collapsed)}
//             aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
//             title={collapsed ? 'Expandir' : 'Colapsar'}
//           >
//             {collapsed ? '»' : '«'}
//           </button>
//         </div>

//         {/* Navegación */}
//         <nav className="flex-1 py-2 overflow-y-auto">
//           <Item to="/dashboard" icon="📊" collapsed={collapsed}>Dashboard</Item>
//           <Item to="/branches"  icon="🏢" collapsed={collapsed}>Sucursales</Item>
//           <Item to="/vehicles"  icon="🚒" collapsed={collapsed}>Vehículos</Item>
//           <Item to="/tickets"   icon="🎫" collapsed={collapsed}>Tickets</Item>
//         </nav>
//       </aside>

//       {/* Área principal */}
//       <main className="flex-1 flex flex-col min-w-0">
//         <Topbar />
//         <div className="flex-1 p-4 overflow-y-auto">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   )
// }

// front/src/components/layout/AppLayout.jsx
// -----------------------------------------------------------------------------
// AppLayout: contenedor principal con Sidebar “simple” (colapsable) + Topbar.
// Se añade el enlace a Configuración → Catálogos → Estados de vehículo.
// - Mantiene tu estructura y estilos.
// - Soporta colapsado (» / «).
// - Usa <Item> para links normales y un header de sección “Configuración”.
// -----------------------------------------------------------------------------
//
// NOTA: recuerda registrar la ruta en tu router principal (AppRoutes / index.jsx):
// import VehicleStatusesCatalog from '../pages/Config/Catalogs/VehicleStatuses'
// ...
// <Route path="config/catalogs/vehicle-statuses" element={<VehicleStatusesCatalog />} />
//
// -----------------------------------------------------------------------------

import { Outlet, NavLink } from 'react-router-dom'
import Topbar from './Topbar'
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

          {/* Sección: Configuración */}
          <div className="my-2">
            {/* Encabezado de sección (se oculta texto al colapsar) */}
            <div className="px-3 py-1.5 mx-2 text-[11px] uppercase tracking-wide text-slate-500">
              {!collapsed ? 'Configuración' : <span className="block h-[1px] bg-slate-300/60" />}
            </div>

            {/* Catálogos → Estados de vehículo */}
            <Item
              to="/config/catalogs/vehicle-statuses"
              icon="📚"
              collapsed={collapsed}
            >
              Catálogos · Estados de vehículo
            </Item>
          </div>
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
