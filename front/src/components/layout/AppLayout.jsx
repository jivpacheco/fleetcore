// // front/src/components/layout/AppLayout.jsx
// // -----------------------------------------------------------------------------
// // Layout principal con Sidebar básico + Topbar + Outlet.
// // Agrega sección "Configuración" y enlace a "Catálogos → Estados de vehículo".
// // -----------------------------------------------------------------------------
// import { Outlet, NavLink } from 'react-router-dom';
// import Topbar from './Topbar';
// import { useState } from 'react';

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
//   );
// }

// export default function AppLayout() {
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
//       {/* Sidebar */}
//       <aside
//         className={`${collapsed ? 'w-16' : 'w-64'}
//           bg-gray-100 dark:bg-slate-800 border-r dark:border-slate-700
//           hidden md:flex flex-col transition-all duration-200 overflow-hidden`}
//       >
//         {/* Header del sidebar */}
//         <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
//           {!collapsed && <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>}
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
//           <Item to="/people"    icon="👥" collapsed={collapsed}>RRHH</Item>
//           <Item to="/tickets"   icon="🎫" collapsed={collapsed}>Tickets</Item>

//           {/* Configuración */}
//           {!collapsed && <div className="mt-3 px-4 text-xs uppercase tracking-wide text-slate-500">Configuración</div>}
//           <Item to="/config/catalogs/vehicle-statuses" icon="🗂️" collapsed={collapsed}>
//             Catálogos → Estados de vehículo
//           </Item>
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
//   );
// }


// front/src/components/layout/AppLayout.jsx
// -----------------------------------------------------------------------------
// Layout principal con Sidebar básico + Topbar + Outlet.
// Agrega sección "Configuración" y enlace a "Catálogos → Estados de vehículo".
// -----------------------------------------------------------------------------
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Topbar from './Topbar';
import { useState } from 'react';

function Item({ to, icon, children, collapsed }) {
  const location = useLocation();

  const handleClick = (e) => {
    // Guardia de "cambios sin guardar".
    // Importante: este sidebar está dentro de AppLayout (no Sidebar.jsx),
    // por lo que el bloqueo debe implementarse aquí.
    try {
      const isUnsaved = Boolean(window.__FLEETCORE_UNSAVED__);
      if (!isUnsaved) return;

      // Si ya estás en la misma ruta, no bloquees.
      if (location?.pathname === to) return;

      const msg =
        window.__FLEETCORE_UNSAVED_MESSAGE__ ||
        'Hay cambios sin guardar. ¿Deseas salir sin guardar?';
      const ok = window.confirm(msg);
      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
      }
    } catch {
      // no-op
    }
  };
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded mx-2 my-0.5
         ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}
         text-sm text-slate-700 dark:text-slate-200`
      }
      onClick={handleClick}
    >
      <span className="w-5 h-5 inline-flex items-center justify-center">{icon}</span>
      {!collapsed && <span className="truncate">{children}</span>}
    </NavLink>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-64'}
          bg-gray-100 dark:bg-slate-800 border-r dark:border-slate-700
          hidden md:flex flex-col transition-all duration-200 overflow-hidden`}
      >
        {/* Header del sidebar */}
        <div className="h-14 md:h-16 flex items-center justify-between px-3 border-b dark:border-slate-700">
          {!collapsed && <span className="font-semibold text-slate-700 dark:text-slate-200">Menú</span>}
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
          <Item to="/people"    icon="👥" collapsed={collapsed}>RRHH</Item>
          <Item to="/tickets"   icon="🎫" collapsed={collapsed}>Tickets</Item>

          {/* Configuración */}
          {!collapsed && <div className="mt-3 px-4 text-xs uppercase tracking-wide text-slate-500">Configuración</div>}
          <Item to="/config/catalogs/vehicle-statuses" icon="🗂️" collapsed={collapsed}>
            Catálogos → Estados de vehículo
          </Item>
          <Item to="/config/catalogs/positions" icon="🧩" collapsed={collapsed}>
            Catálogos → Cargos
          </Item>
          <Item to="/config/catalogs/roles" icon="🛡️" collapsed={collapsed}>
            Catálogos → Roles
          </Item>
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
  );
}

