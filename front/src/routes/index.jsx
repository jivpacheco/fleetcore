// // front/src/routes/index.jsx
// // -----------------------------------------------------------------------------
// // Sistema de rutas de FleetCore Suite
// // Protege sesión (AuthGate + RequireAuth) y define módulos visibles.
// // Incluye vehículos (listado + formulario) y evita rebote al dashboard.
// // -----------------------------------------------------------------------------

// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { useAppStore } from "../store/useAppStore";
// import { api } from "../services/http";

// // Layout principal
// import AppLayout from "../components/layout/AppLayout";

// // Páginas base
// import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";
// import BranchesList from "../pages/Branches/List";
// import VehiclesList from "../pages/Vehicles/List";
// import VehiclesForm from "../pages/Vehicles/Form";
// import PeopleList from "../pages/People/List";
// import PeopleForm from "../pages/People/Form";
// import TicketsList from "../pages/Tickets/List";
// import VehicleStatusesCatalog from "../pages/Config/Catalogs/VehicleStatuses";
// import PositionsCatalog from "../pages/Config/Catalogs/Positions"
// import RolesCatalog from "../pages/Config/Catalogs/Roles"


// // Pantalla de carga
// function Splash() {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-gray-600">
//       <div className="animate-pulse">Cargando sesión…</div>
//     </div>
//   );
// }

// // AuthGate → carga sesión desde /auth/me
// function AuthGate({ children }) {
//   const user = useAppStore((s) => s.user);
//   const setUser = useAppStore((s) => s.setUser);
//   const authBootstrapped = useAppStore((s) => s.authBootstrapped);
//   const setAuthBootstrapped = useAppStore((s) => s.setAuthBootstrapped);
//   const [running, setRunning] = useState(false);

//   useEffect(() => {
//     if (authBootstrapped || running) return;
//     setRunning(true);
//     api
//       .get("/api/v1/auth/me")
//       .then(({ data }) => setUser(data.user))
//       .catch(() => {}) // si 401, deja user en null
//       .finally(() => {
//         setAuthBootstrapped(true);
//         setRunning(false);
//       });
//   }, [authBootstrapped, running, setAuthBootstrapped, setUser]);

//   if (!authBootstrapped) return <Splash />;
//   return children;
// }

// // RequireAuth → bloquea rutas privadas
// function RequireAuth({ children }) {
//   const user = useAppStore((s) => s.user);
//   if (!user) return <Navigate to="/login" replace />;
//   return children;
// }

// // Rutas principales
// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Pública */}
//         <Route path="/login" element={<Login />} />

//         {/* Privadas */}
//         <Route
//           path="/*"
//           element={
//             <AuthGate>
//               <RequireAuth>
//                 <AppLayout />
//               </RequireAuth>
//             </AuthGate>
//           }
//         >
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="branches" element={<BranchesList />} />

//           {/* Vehículos */}
//           <Route path="vehicles" element={<VehiclesList />} />
//           <Route path="vehicles/new" element={<VehiclesForm />} />
//           <Route path="vehicles/:id" element={<VehiclesForm />} />
//           <Route path="config/catalogs/vehicle-statuses" element={<VehicleStatusesCatalog />} />
//           <Route path="config/catalogs/positions" element={<PositionsCatalog />} />
//           <Route path="config/catalogs/roles" element={<RolesCatalog />} />


//           <Route path="tickets" element={<TicketsList />} />

//           <Route path="people" element={<PeopleList />} />
//           <Route path="people/new" element={<PeopleForm />} />
//           <Route path="people/:id" element={<PeopleForm />} />

//           {/* Cualquier otra → vehículos */}
//           <Route path="*" element={<Navigate to="/vehicles" replace />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }



// //*********************************************************** */
// //atualizacion :  fleetcore_patches_rrhh_roles_users_2026-01-10.zip

// // front/src/routes/index.jsx
// // -----------------------------------------------------------------------------
// // Sistema de rutas de FleetCore Suite
// // Protege sesión (AuthGate + RequireAuth) y define módulos visibles.
// // Incluye vehículos (listado + formulario) y evita rebote al dashboard.
// // -----------------------------------------------------------------------------

// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { useAppStore } from "../store/useAppStore";
// import { api } from "../services/http";

// // Layout principal
// import AppLayout from "../components/layout/AppLayout";

// // Páginas base
// import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";
// import BranchesList from "../pages/Branches/List";
// import VehiclesList from "../pages/Vehicles/List";
// import VehiclesForm from "../pages/Vehicles/Form";
// import PeopleList from "../pages/People/List";
// import PeopleForm from "../pages/People/Form";
// import TicketsList from "../pages/Tickets/List";
// import VehicleStatusesCatalog from "../pages/Config/Catalogs/VehicleStatuses";
// import PositionsCatalog from "../pages/Config/Catalogs/Positions"
// import RolesCatalog from "../pages/Config/Catalogs/Roles"
// import UsersConfig from "../pages/Config/Users"


// // Pantalla de carga
// function Splash() {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-gray-600">
//       <div className="animate-pulse">Cargando sesión…</div>
//     </div>
//   );
// }

// // AuthGate → carga sesión desde /auth/me
// function AuthGate({ children }) {
//   const user = useAppStore((s) => s.user);
//   const setUser = useAppStore((s) => s.setUser);
//   const authBootstrapped = useAppStore((s) => s.authBootstrapped);
//   const setAuthBootstrapped = useAppStore((s) => s.setAuthBootstrapped);
//   const [running, setRunning] = useState(false);

//   useEffect(() => {
//     if (authBootstrapped || running) return;
//     setRunning(true);
//     api
//       .get("/api/v1/auth/me")
//       .then(({ data }) => setUser(data.user))
//       .catch(() => { }) // si 401, deja user en null
//       .finally(() => {
//         setAuthBootstrapped(true);
//         setRunning(false);
//       });
//   }, [authBootstrapped, running, setAuthBootstrapped, setUser]);

//   if (!authBootstrapped) return <Splash />;
//   return children;
// }

// // RequireAuth → bloquea rutas privadas
// function RequireAuth({ children }) {
//   const user = useAppStore((s) => s.user);
//   if (!user) return <Navigate to="/login" replace />;
//   return children;
// }

// // Rutas principales
// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Pública */}
//         <Route path="/login" element={<Login />} />

//         {/* Privadas */}
//         <Route
//           path="/*"
//           element={
//             <AuthGate>
//               <RequireAuth>
//                 <AppLayout />
//               </RequireAuth>
//             </AuthGate>
//           }
//         >
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="branches" element={<BranchesList />} />

//           {/* Vehículos */}
//           <Route path="vehicles" element={<VehiclesList />} />
//           <Route path="vehicles/new" element={<VehiclesForm />} />
//           <Route path="vehicles/:id" element={<VehiclesForm />} />
//           <Route path="config/catalogs/vehicle-statuses" element={<VehicleStatusesCatalog />} />
//           <Route path="config/catalogs/positions" element={<PositionsCatalog />} />
//           <Route path="config/catalogs/roles" element={<RolesCatalog />} />
//           <Route path="config/users" element={<UsersConfig />} />


//           <Route path="tickets" element={<TicketsList />} />

//           <Route path="people" element={<PeopleList />} />
//           <Route path="people/new" element={<PeopleForm />} />
//           <Route path="people/:id" element={<PeopleForm />} />

//           {/* Cualquier otra → vehículos */}
//           <Route path="*" element={<Navigate to="/vehicles" replace />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// //V2 12012026


// // front/src/routes/index.jsx
// // -----------------------------------------------------------------------------
// // Sistema de rutas de FleetCore Suite
// // Protege sesión (AuthGate + RequireAuth) y define módulos visibles.
// // Incluye vehículos (listado + formulario) y evita rebote al dashboard.
// // -----------------------------------------------------------------------------

// import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { useAppStore } from "../store/useAppStore";
// import { api } from "../services/http";

// // Layout principal
// import AppLayout from "../components/layout/AppLayout";

// // Páginas base
// import Login from "../pages/Login";
// import ChangePassword from "../pages/Account/ChangePassword";
// import Dashboard from "../pages/Dashboard";
// import BranchesList from "../pages/Branches/List";
// import VehiclesList from "../pages/Vehicles/List";
// import VehiclesForm from "../pages/Vehicles/Form";
// import PeopleList from "../pages/People/List";
// import PeopleForm from "../pages/People/Form";
// import TicketsList from "../pages/Tickets/List";
// import VehicleStatusesCatalog from "../pages/Config/Catalogs/VehicleStatuses";
// import PositionsCatalog from "../pages/Config/Catalogs/Positions"
// import RolesCatalog from "../pages/Config/Catalogs/Roles"


// // Pantalla de carga
// function Splash() {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-gray-600">
//       <div className="animate-pulse">Cargando sesión…</div>
//     </div>
//   );
// }

// // AuthGate → carga sesión desde /auth/me
// function AuthGate({ children }) {
//   const user = useAppStore((s) => s.user);
//   const setUser = useAppStore((s) => s.setUser);
//   const authBootstrapped = useAppStore((s) => s.authBootstrapped);
//   const setAuthBootstrapped = useAppStore((s) => s.setAuthBootstrapped);
//   const [running, setRunning] = useState(false);

//   useEffect(() => {
//     if (authBootstrapped || running) return;
//     setRunning(true);
//     api
//       .get("/api/v1/auth/me")
//       .then(({ data }) => setUser(data.user))
//       .catch(() => { }) // si 401, deja user en null
//       .finally(() => {
//         setAuthBootstrapped(true);
//         setRunning(false);
//       });
//   }, [authBootstrapped, running, setAuthBootstrapped, setUser]);

//   if (!authBootstrapped) return <Splash />;
//   return children;
// }

// // RequireAuth → bloquea rutas privadas
// function RequireAuth({ children }) {
//   const user = useAppStore((s) => s.user);
//   const loc = useLocation();
//   if (!user) return <Navigate to="/login" replace />;
//   // Si el usuario debe cambiar su clave, forzar ruta dedicada
//   if (user?.mustChangePassword && loc.pathname !== '/account/change-password') {
//     return <Navigate to="/account/change-password?force=1" replace />;
//   }
//   return children;
// }

// // Rutas principales
// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Pública */}
//         <Route path="/login" element={<Login />} />

//         {/* Privadas */}
//         <Route
//           path="/*"
//           element={
//             <AuthGate>
//               <RequireAuth>
//                 <AppLayout />
//               </RequireAuth>
//             </AuthGate>
//           }
//         >
//           <Route path="dashboard" element={<Dashboard />} />

//           <Route path="account/change-password" element={<ChangePassword />} />
//           <Route path="branches" element={<BranchesList />} />

//           {/* Vehículos */}
//           <Route path="vehicles" element={<VehiclesList />} />
//           <Route path="vehicles/new" element={<VehiclesForm />} />
//           <Route path="vehicles/:id" element={<VehiclesForm />} />
//           <Route path="config/catalogs/vehicle-statuses" element={<VehicleStatusesCatalog />} />
//           <Route path="config/catalogs/positions" element={<PositionsCatalog />} />
//           <Route path="config/catalogs/roles" element={<RolesCatalog />} />


//           <Route path="tickets" element={<TicketsList />} />

//           <Route path="people" element={<PeopleList />} />
//           <Route path="people/new" element={<PeopleForm />} />
//           <Route path="people/:id" element={<PeopleForm />} />

//           {/* Cualquier otra → vehículos */}
//           <Route path="*" element={<Navigate to="/vehicles" replace />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// front/src/routes/index.jsx
// -----------------------------------------------------------------------------
// Sistema de rutas de FleetCore Suite
// Protege sesión (AuthGate + RequireAuth) y define módulos visibles.
// Incluye vehículos (listado + formulario) y evita rebote al dashboard.
// -----------------------------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { api } from "../services/http";

// Layout principal
import AppLayout from "../components/layout/AppLayout";

// Páginas base
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import BranchesList from "../pages/Branches/List";
import BranchesForm from "../pages/Branches/Form";
import VehiclesList from "../pages/Vehicles/List";
import VehiclesForm from "../pages/Vehicles/Form";
import PeopleList from "../pages/People/List";
import PeopleForm from "../pages/People/Form";
import TicketsList from "../pages/Tickets/List";
import VehicleStatusesCatalog from "../pages/Config/Catalogs/VehicleStatuses";
import PositionsCatalog from "../pages/Config/Catalogs/Positions"
import RolesCatalog from "../pages/Config/Catalogs/Roles"
import UsersAdmin from "../pages/Config/Users"
import ChangePassword from "../pages/Account/ChangePassword"
import RepairsList from '../pages/Repairs/List'
import RepairsForm from '../pages/Repairs/Form'
import FailureReportsList from '../pages/FailureReports/List'
import FailureReportsForm from '../pages/FailureReports/Form'









// import UsersAdmin from "../pages/Config/Users"
// import ChangePassword from "../pages/Account/ChangePassword"


// Pantalla de carga
function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      <div className="animate-pulse">Cargando sesión…</div>
    </div>
  );
}

// AuthGate → carga sesión desde /auth/me
function AuthGate({ children }) {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const authBootstrapped = useAppStore((s) => s.authBootstrapped);
  const setAuthBootstrapped = useAppStore((s) => s.setAuthBootstrapped);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (authBootstrapped || running) return;
    setRunning(true);
    api
      .get("/api/v1/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => { }) // si 401, deja user en null
      .finally(() => {
        setAuthBootstrapped(true);
        setRunning(false);
      });
  }, [authBootstrapped, running, setAuthBootstrapped, setUser]);

  if (!authBootstrapped) return <Splash />;
  return children;
}

// RequireAuth → bloquea rutas privadas
function RequireAuth({ children }) {
  const user = useAppStore((s) => s.user);
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace />;
  // Forzar cambio de clave si el usuario fue creado con password temporal.
  if (user.mustChangePassword && loc.pathname !== '/account/change-password') {
    return <Navigate to="/account/change-password?force=1" replace />;
  }
  return children;
}

// Rutas principales
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Privadas */}
        <Route
          path="/*"
          element={
            <AuthGate>
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            </AuthGate>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="branches" element={<BranchesList />} />
          <Route path="branches/new" element={<BranchesForm />} />
          <Route path="branches/:id" element={<BranchesForm />} />

          {/* Vehículos */}
          <Route path="vehicles" element={<VehiclesList />} />
          <Route path="vehicles/new" element={<VehiclesForm />} />
          <Route path="vehicles/:id" element={<VehiclesForm />} />
          <Route path="config/catalogs/vehicle-statuses" element={<VehicleStatusesCatalog />} />
          <Route path="config/catalogs/positions" element={<PositionsCatalog />} />
          <Route path="config/catalogs/roles" element={<RolesCatalog />} />
          <Route path="config/users" element={<UsersAdmin />} />

          {/* Fallas  */}
          <Route path="config/catalogs/repairs" element={<RepairsList />} />
          <Route path="config/catalogs/repairs/new" element={<RepairsForm />} />
          <Route path="config/catalogs/repairs/:id" element={<RepairsForm />} />

          <Route path="config/catalogs/failure-reports" element={<FailureReportsList />} />
          <Route path="config/catalogs/failure-reports/new" element={<FailureReportsForm />} />
          <Route path="config/catalogs/failure-reports/:id" element={<FailureReportsForm />} />


          {/* Cuenta */}
          <Route path="account/change-password" element={<ChangePassword />} />
          <Route path="config/users" element={<UsersAdmin />} />
          <Route path="account/change-password" element={<ChangePassword />} />


          <Route path="tickets" element={<TicketsList />} />

          <Route path="people" element={<PeopleList />} />
          <Route path="people/new" element={<PeopleForm />} />
          <Route path="people/:id" element={<PeopleForm />} />

          {/* Cualquier otra → vehículos */}
          <Route path="*" element={<Navigate to="/vehicles" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
