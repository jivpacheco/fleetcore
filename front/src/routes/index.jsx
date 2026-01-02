// front/src/routes/index.jsx
// -----------------------------------------------------------------------------
// Sistema de rutas de FleetCore Suite
// Protege sesión (AuthGate + RequireAuth) y define módulos visibles.
// Incluye vehículos (listado + formulario) y evita rebote al dashboard.
// -----------------------------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { api } from "../services/http";

// Layout principal
import AppLayout from "../components/layout/AppLayout";

// Páginas base
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import BranchesList from "../pages/Branches/List";
import VehiclesList from "../pages/Vehicles/List";
import VehiclesForm from "../pages/Vehicles/Form";
import PeopleList from "../pages/People/List";
import PeopleForm from "../pages/People/Form";
import TicketsList from "../pages/Tickets/List";
import VehicleStatusesCatalog from "../pages/Config/Catalogs/VehicleStatuses";

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
      .catch(() => {}) // si 401, deja user en null
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
  if (!user) return <Navigate to="/login" replace />;
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

          {/* Vehículos */}
          <Route path="vehicles" element={<VehiclesList />} />
          <Route path="vehicles/new" element={<VehiclesForm />} />
          <Route path="vehicles/:id" element={<VehiclesForm />} />
          <Route path="config/catalogs/vehicle-statuses" element={<VehicleStatusesCatalog />} />

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
