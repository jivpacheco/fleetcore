// // front/src/routes/index.jsx
// // -----------------------------------------------------------------------------
// // Sistema de rutas de FleetCore Suite
// // Protege sesión (AuthGate + RequireAuth) y define módulos visibles.
// // -----------------------------------------------------------------------------


// import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { useAppStore } from "../store/useAppStore";
// import { api } from "../services/http";

// // Layout principal
// import AppLayout from "../components/layout/AppLayout";

// // Páginas base
// import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";

// // Módulos
// import BranchesList from "../pages/Branches/List";
// import BranchesForm from "../pages/Branches/Form";

// import VehiclesList from "../pages/Vehicles/List";
// import VehiclesForm from "../pages/Vehicles/Form";

// import PeopleList from "../pages/People/List";
// import PeopleForm from "../pages/People/Form";

// import TicketsList from "../pages/Tickets/List";

// // Catálogos (migrados a estándar List/Form)
// import VehicleStatusesList from "../pages/VehicleStatuses/List";
// import VehicleStatusesForm from "../pages/VehicleStatuses/Form";

// // Catálogos que aún están en Config/Catalogs (pendiente migrar)
// import PositionsCatalog from "../pages/Config/Catalogs/Positions";
// import RolesCatalog from "../pages/Config/Catalogs/Roles";

// // Admin / Cuenta
// import UsersAdmin from "../pages/Config/Users";
// import ChangePassword from "../pages/Account/ChangePassword";

// // Otros catálogos ya estándar
// import RepairsList from "../pages/Repairs/List";
// import RepairsForm from "../pages/Repairs/Form";
// import FailureReportsList from "../pages/FailureReports/List";
// import FailureReportsForm from "../pages/FailureReports/Form";

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
//   const loc = useLocation();

//   if (!user) return <Navigate to="/login" replace />;

//   // Forzar cambio de clave si el usuario fue creado con password temporal.
//   if (user.mustChangePassword && loc.pathname !== "/account/change-password") {
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

//           {/* Branches */}
//           <Route path="branches" element={<BranchesList />} />
//           <Route path="branches/new" element={<BranchesForm />} />
//           <Route path="branches/:id" element={<BranchesForm />} />

//           {/* Vehicles */}
//           <Route path="vehicles" element={<VehiclesList />} />
//           <Route path="vehicles/new" element={<VehiclesForm />} />
//           <Route path="vehicles/:id" element={<VehiclesForm />} />

//           {/* People */}
//           <Route path="people" element={<PeopleList />} />
//           <Route path="people/new" element={<PeopleForm />} />
//           <Route path="people/:id" element={<PeopleForm />} />

//           {/* Tickets */}
//           <Route path="tickets" element={<TicketsList />} />

//           {/* Catálogos → Vehicle Statuses (YA estándar List/Form) */}
//           <Route path="config/catalogs/vehicle-statuses" element={<VehicleStatusesList />} />
//           <Route path="config/catalogs/vehicle-statuses/new" element={<VehicleStatusesForm />} />
//           <Route path="config/catalogs/vehicle-statuses/:id" element={<VehicleStatusesForm />} />

//           {/* Catálogos → pendientes de migrar */}
//           <Route path="config/catalogs/positions" element={<PositionsCatalog />} />
//           <Route path="config/catalogs/roles" element={<RolesCatalog />} />

//           {/* Catálogos → Repairs */}
//           <Route path="config/catalogs/repairs" element={<RepairsList />} />
//           <Route path="config/catalogs/repairs/new" element={<RepairsForm />} />
//           <Route path="config/catalogs/repairs/:id" element={<RepairsForm />} />

//           {/* Catálogos → Failure Reports */}
//           <Route path="config/catalogs/failure-reports" element={<FailureReportsList />} />
//           <Route path="config/catalogs/failure-reports/new" element={<FailureReportsForm />} />
//           <Route path="config/catalogs/failure-reports/:id" element={<FailureReportsForm />} />

//           {/* Administración */}
//           <Route path="config/users" element={<UsersAdmin />} />

//           {/* Cuenta */}
//           <Route path="account/change-password" element={<ChangePassword />} />

//           {/* Cualquier otra → vehicles */}
//           <Route path="*" element={<Navigate to="/vehicles" replace />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

//******************************** */

//030226
// front/src/routes/index.jsx
// -----------------------------------------------------------------------------
// Sistema de rutas de FleetCore Suite
// Protege sesión (AuthGate + RequireAuth) y define módulos visibles.
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

// Módulos
import BranchesList from "../pages/Branches/List";
import BranchesForm from "../pages/Branches/Form";

import VehiclesList from "../pages/Vehicles/List";
import VehiclesForm from "../pages/Vehicles/Form";

import PeopleList from "../pages/People/List";
import PeopleForm from "../pages/People/Form";

import TicketsList from "../pages/Tickets/List";

// Catálogos (migrados a estándar List/Form)
import VehicleStatusesList from "../pages/VehicleStatuses/List";
import VehicleStatusesForm from "../pages/VehicleStatuses/Form";

import PositionsList from "../pages/Positions/List";
import PositionsForm from "../pages/Positions/Form";
import RolesList from "../pages/Roles/List";
import RolesForm from "../pages/Roles/Form";

// Catálogos que aún están en Config/Catalogs (pendiente migrar)



// Admin / Cuenta
import UsersAdmin from "../pages/Config/Users";
import ChangePassword from "../pages/Account/ChangePassword";

// Otros catálogos ya estándar
import RepairsList from "../pages/Repairs/List";
import RepairsForm from "../pages/Repairs/Form";
import FailureReportsList from "../pages/FailureReports/List";
import FailureReportsForm from "../pages/FailureReports/Form";

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
  if (user.mustChangePassword && loc.pathname !== "/account/change-password") {
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

          {/* Branches */}
          <Route path="branches" element={<BranchesList />} />
          <Route path="branches/new" element={<BranchesForm />} />
          <Route path="branches/:id" element={<BranchesForm />} />

          {/* Vehicles */}
          <Route path="vehicles" element={<VehiclesList />} />
          <Route path="vehicles/new" element={<VehiclesForm />} />
          <Route path="vehicles/:id" element={<VehiclesForm />} />

          {/* People */}
          <Route path="people" element={<PeopleList />} />
          <Route path="people/new" element={<PeopleForm />} />
          <Route path="people/:id" element={<PeopleForm />} />

          {/* Tickets */}
          <Route path="tickets" element={<TicketsList />} />

          {/* Catálogos → Vehicle Statuses (YA estándar List/Form) */}
          <Route path="config/catalogs/vehicle-statuses" element={<VehicleStatusesList />} />
          <Route path="config/catalogs/vehicle-statuses/new" element={<VehicleStatusesForm />} />
          <Route path="config/catalogs/vehicle-statuses/:id" element={<VehicleStatusesForm />} />

          {/* Catálogos → Cargos/Roles (estándar List/Form) */}
          <Route path="config/catalogs/positions" element={<PositionsList />} />
          <Route path="config/catalogs/positions/new" element={<PositionsForm />} />
          <Route path="config/catalogs/positions/:id" element={<PositionsForm />} />
          <Route path="config/catalogs/roles" element={<RolesList />} />
          <Route path="config/catalogs/roles/new" element={<RolesForm />} />
          <Route path="config/catalogs/roles/:id" element={<RolesForm />} />

          {/* Catálogos → Repairs */}
          <Route path="config/catalogs/repairs" element={<RepairsList />} />
          <Route path="config/catalogs/repairs/new" element={<RepairsForm />} />
          <Route path="config/catalogs/repairs/:id" element={<RepairsForm />} />

          {/* Catálogos → Failure Reports */}
          <Route path="config/catalogs/failure-reports" element={<FailureReportsList />} />
          <Route path="config/catalogs/failure-reports/new" element={<FailureReportsForm />} />
          <Route path="config/catalogs/failure-reports/:id" element={<FailureReportsForm />} />

          {/* Administración */}
          <Route path="config/users" element={<UsersAdmin />} />

          {/* Cuenta */}
          <Route path="account/change-password" element={<ChangePassword />} />

          {/* Cualquier otra → vehicles */}
          <Route path="*" element={<Navigate to="/vehicles" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
