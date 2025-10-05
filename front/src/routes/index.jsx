// front/src/routes/index.jsx
// -----------------------------------------------------------------------------
// Rutas raíz:
// - /login (pública)
// - /* (protegida con RequireAuth) → AppLayout + páginas hijas
// - Páginas base: Dashboard, Branches, Vehicles, Tickets, Settings
// - LazyLogin: evita problemas temporales de importación circular al desarrollar
// -----------------------------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import AppLayout from '../components/layout/AppLayout'

// Pages base (asegúrate de tener archivos mínimos con <h1>)
import Dashboard from '../pages/Dashboard'
import BranchesList from '../pages/Branches/List'
import VehiclesList from '../pages/Vehicles/List'
import TicketsList from '../pages/Tickets/List'
import Settings from '../pages/Settings'

function RequireAuth({ children }) {
    const user = useAppStore((s) => s.user)
    if (!user) return <Navigate to="/login" replace />
    return children
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LazyLogin />} />
                <Route
                    path="/*"
                    element={
                        <RequireAuth>
                            <AppLayout />
                        </RequireAuth>
                    }
                >
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="branches" element={<BranchesList />} />
                    <Route path="vehicles" element={<VehiclesList />} />
                    <Route path="tickets" element={<TicketsList />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

// Carga diferida del Login para evitar warnings si cambias cosas en caliente
function LazyLogin() {
    const C = require('../pages/Login').default
    return <C />
}
