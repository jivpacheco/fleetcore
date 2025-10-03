
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import Login from '../pages/Login'
// import Dashboard from '../pages/Dashboard'
// import Topbar from '../components/layout/Topbar'
// import Sidebar from '../components/layout/Sidebar'
// import { useAppStore } from '../store/useAppStore'

// import BranchesList from '../pages/Branches/List'
// import VehiclesList from '../pages/Vehicles/List'
// import TicketsList from '../pages/Tickets/List'


// function AppLayout(){
// // Layout común para rutas protegidas
// return (
// <div className="min-h-screen bg-gray-50 flex">
// <Sidebar/>
// <main className="flex-1 flex flex-col">
// <Topbar/>
// <div className="flex-1">
// <Routes>
// <Route path="/dashboard" element={<Dashboard/>} />
// {/* Aquí irán Branches, Vehicles, Tickets */}
// <Route path="*" element={<Navigate to="/dashboard" replace/>} />
// </Routes>
// </div>
// </main>
// </div>
// )
// }


// function RequireAuth({ children }){
// const user = useAppStore(s=>s.user)
// if(!user) return <Navigate to="/login" replace/>
// return children
// }


// export default function AppRoutes(){
// return (
// <BrowserRouter>
// <Routes>
// <Route path="/login" element={<Login/>} />
// <Route path="/*" element={<RequireAuth><AppLayout/></RequireAuth>} />
// </Routes>
// </BrowserRouter>
// )
// }

// src/routes/index.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

// Páginas
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import BranchesList from '../pages/Branches/List'
import VehiclesList from '../pages/Vehicles/List'
import TicketsList from '../pages/Tickets/List'

// Layouts
import Topbar from '../components/layout/Topbar'
import Sidebar from '../components/layout/Sidebar'

/**
 * Layout principal (rutas protegidas)
 * - Topbar + Sidebar persistentes
 * - Contenedor para renderizar las páginas hijas
 */
function AppLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Menú lateral */}
            <Sidebar />

            {/* Zona principal */}
            <main className="flex-1 flex flex-col">
                {/* Barra superior */}
                <Topbar />

                {/* Contenido central: aquí viven las rutas hijas */}
                <div className="flex-1 p-4 md:p-6">
                    <Routes>
                        {/* Página principal del sistema */}
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* Módulos base */}
                        <Route path="/branches" element={<BranchesList />} />
                        <Route path="/vehicles" element={<VehiclesList />} />
                        <Route path="/tickets" element={<TicketsList />} />

                        {/* Cualquier otra ruta dentro del layout → redirige al dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    )
}

/**
 * Guardia de autenticación
 * - Si no hay usuario en el store → redirige a /login
 * - Si hay usuario → renderiza los hijos (layout + páginas)
 */
function RequireAuth({ children }) {
    const user = useAppStore((s) => s.user)
    if (!user) return <Navigate to="/login" replace />
    return children
}

/**
 * Mapa de rutas raíz
 * - /login (pública)
 * - /* (protegida, envuelve AppLayout)
 */
export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública */}
                <Route path="/login" element={<Login />} />

                {/* Todo lo demás requiere sesión */}
                <Route
                    path="/*"
                    element={
                        <RequireAuth>
                            <AppLayout />
                        </RequireAuth>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}
