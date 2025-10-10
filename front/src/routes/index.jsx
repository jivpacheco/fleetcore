// // front/src/routes/index.jsx
// // -----------------------------------------------------------
// // Rutas + AuthGate:
// // - AuthGate hace el bootstrap: llama /auth/me una vez,
// //   bloquea UI con un splash mientras resuelve,
// //   y recién ahí deja evaluar RequireAuth.
// // -----------------------------------------------------------
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import { useAppStore } from '../store/useAppStore'
// import { api } from '../services/http'
// import AppLayout from '../components/layout/AppLayout'

// // Páginas
// import Login from '../pages/Login'
// import Dashboard from '../pages/Dashboard'
// import BranchesList from '../pages/Branches/List'
// import VehiclesList from '../pages/Vehicles/List'
// import TicketsList from '../pages/Tickets/List'

// // --- Splash simple mientras bootstrap ---
// function Splash() {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-gray-600">
//       <div className="animate-pulse">Cargando sesión…</div>
//     </div>
//   )
// }

// // --- AuthGate: bootstrap de sesión al inicio ---
// function AuthGate({ children }) {
//   const user = useAppStore(s => s.user)
//   const setUser = useAppStore(s => s.setUser)
//   const authBootstrapped = useAppStore(s => s.authBootstrapped)
//   const setAuthBootstrapped = useAppStore(s => s.setAuthBootstrapped)

//   const [running, setRunning] = useState(false)

//   useEffect(() => {
//     if (authBootstrapped || running) return
//     setRunning(true)
//     api.get('/api/v1/auth/me')
//       .then(({ data }) => setUser(data.user))
//       .catch(() => { /* 401 aquí NO redirige por el interceptor */ })
//       .finally(() => {
//         setAuthBootstrapped(true)
//         setRunning(false)
//       })
//   }, [authBootstrapped, running, setAuthBootstrapped, setUser])

//   if (!authBootstrapped) return <Splash/>
//   return children
// }

// // --- Guardia de rutas protegidas ---
// function RequireAuth({ children }) {
//   const user = useAppStore(s => s.user)
//   // Ojo: aquí ya estamos después del bootstrap
//   if (!user) return <Navigate to="/login" replace />
//   return children
// }

// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login/>} />
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
//           <Route path="dashboard" element={<Dashboard/>} />
//           <Route path="branches" element={<BranchesList/>} />
//           <Route path="vehicles" element={<VehiclesList/>} />
//           <Route path="tickets" element={<TicketsList/>} />
//           <Route path="*" element={<Navigate to="/dashboard" replace/>} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   )
// }


// // // front/src/routes/index.jsx
// // // -----------------------------------------------------------------------------
// // // Rutas raíz:
// // // - /login (pública)
// // // - /* (protegida con RequireAuth) → AppLayout + páginas hijas
// // // - Páginas base: Dashboard, Branches, Vehicles, Tickets, Settings
// // // - LazyLogin: evita problemas temporales de importación circular al desarrollar
// // // -----------------------------------------------------------------------------

// // import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// // import { useAppStore } from '../store/useAppStore'
// // import AppLayout from '../components/layout/AppLayout'

// // // Pages base (asegúrate de tener archivos mínimos con <h1>)
// // import Dashboard from '../pages/Dashboard'
// // import BranchesList from '../pages/Branches/List'
// // import VehiclesList from '../pages/Vehicles/List'
// // import TicketsList from '../pages/Tickets/List'
// // import Settings from '../pages/Settings'

// // function RequireAuth({ children }) {
// //     const user = useAppStore((s) => s.user)
// //     if (!user) return <Navigate to="/login" replace />
// //     return children
// // }

// // export default function AppRoutes() {
// //     return (
// //         <BrowserRouter>
// //             <Routes>
// //                 <Route path="/login" element={<LazyLogin />} />
// //                 <Route
// //                     path="/*"
// //                     element={
// //                         <RequireAuth>
// //                             <AppLayout />
// //                         </RequireAuth>
// //                     }
// //                 >
// //                     <Route path="dashboard" element={<Dashboard />} />
// //                     <Route path="branches" element={<BranchesList />} />
// //                     <Route path="vehicles" element={<VehiclesList />} />
// //                     <Route path="tickets" element={<TicketsList />} />
// //                     <Route path="settings" element={<Settings />} />
// //                     <Route path="*" element={<Navigate to="/dashboard" replace />} />
// //                 </Route>
// //             </Routes>
// //         </BrowserRouter>
// //     )
// // }

// // // Carga diferida del Login para evitar warnings si cambias cosas en caliente
// // function LazyLogin() {
// //     const C = require('../pages/Login').default
// //     return <C />
// // }


// // front/src/routes/index.jsx
// // Ruteo con protección + carga perezosa (ESM). Sin "require" en el cliente.

// // import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// // import { lazy, Suspense } from 'react'
// // import { useAppStore } from '../store/useAppStore'

// // // App shell (Topbar + Sidebar + Outlet)
// // import AppLayout from '../components/layout/AppLayout'

// // // Pages que puedes cargar estáticas (si quieres también puedes hacerlas lazy)
// // import Dashboard from '../pages/Dashboard'
// // import BranchesList from '../pages/Branches/List'
// // import VehiclesList from '../pages/Vehicles/List'
// // import TicketsList from '../pages/Tickets/List'
// // import Settings from '../pages/Settings'

// // // ✅ Login con React.lazy (ESM) — reemplaza el "require" anterior
// // const Login = lazy(() => import('../pages/Login'))

// // function RequireAuth({ children }) {
// //     const user = useAppStore(s => s.user)
// //     if (!user) return <Navigate to="/login" replace />
// //     return children
// // }

// // export default function AppRoutes() {
// //     return (
// //         <BrowserRouter>
// //             <Routes>
// //                 {/* Ruta pública: Login (lazy + Suspense) */}
// //                 <Route
// //                     path="/login"
// //                     element={
// //                         <Suspense fallback={<div className="p-6">Cargando login…</div>}>
// //                             <Login />
// //                         </Suspense>
// //                     }
// //                 />

// //                 {/* Rutas protegidas */}
// //                 <Route
// //                     path="/*"
// //                     element={
// //                         <RequireAuth>
// //                             <AppLayout />
// //                         </RequireAuth>
// //                     }
// //                 >
// //                     <Route path="dashboard" element={<Dashboard />} />
// //                     <Route path="branches" element={<BranchesList />} />
// //                     <Route path="vehicles" element={<VehiclesList />} />
// //                     <Route path="tickets" element={<TicketsList />} />
// //                     <Route path="settings" element={<Settings />} />
// //                     <Route path="*" element={<Navigate to="/dashboard" replace />} />
// //                 </Route>
// //             </Routes>
// //         </BrowserRouter>
// //     )
// // }

// // front/src/routes/index.jsx
// // -----------------------------------------------------------------------------
// // Sistema de rutas de FleetCore Suite
// //   - /login → pública
// //   - /* → protegida (AuthGate + RequireAuth + AppLayout)
// //   - Incluye splash de carga de sesión
// //
// // Estructura:
// //   • AuthGate: bootstrap inicial que consulta /auth/me
// //   • RequireAuth: bloquea acceso a rutas privadas si no hay usuario
// //   • AppLayout: layout con Sidebar + Topbar + Outlet
// // -----------------------------------------------------------------------------

// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import { useEffect, useState } from 'react'
// import { useAppStore } from '../store/useAppStore'
// import { api } from '../services/http'

// // Layout principal (Topbar + Sidebar + Outlet)
// import AppLayout from '../components/layout/AppLayout'

// // Páginas base
// import Login from '../pages/Login'
// import Dashboard from '../pages/Dashboard'
// import BranchesList from '../pages/Branches/List'
// import VehiclesList from '../pages/Vehicles/List'
// import TicketsList from '../pages/Tickets/List'

// // 🌀 Pantalla temporal de carga mientras se valida sesión
// function Splash() {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-gray-600">
//       <div className="animate-pulse">Cargando sesión…</div>
//     </div>
//   )
// }

// // 🔒 AuthGate: valida sesión al cargar la app
// function AuthGate({ children }) {
//   const user = useAppStore(s => s.user)
//   const setUser = useAppStore(s => s.setUser)
//   const authBootstrapped = useAppStore(s => s.authBootstrapped)
//   const setAuthBootstrapped = useAppStore(s => s.setAuthBootstrapped)

//   const [running, setRunning] = useState(false)

//   useEffect(() => {
//     if (authBootstrapped || running) return
//     setRunning(true)
//     api.get('/api/v1/auth/me')
//       .then(({ data }) => setUser(data.user))
//       .catch(() => { /* si 401, se deja sin usuario */ })
//       .finally(() => {
//         setAuthBootstrapped(true)
//         setRunning(false)
//       })
//   }, [authBootstrapped, running, setAuthBootstrapped, setUser])

//   if (!authBootstrapped) return <Splash />
//   return children
// }

// // 🧱 Guardia de rutas privadas
// function RequireAuth({ children }) {
//   const user = useAppStore(s => s.user)
//   if (!user) return <Navigate to="/login" replace />
//   return children
// }

// // 🚦 Definición de rutas
// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Ruta pública: Login */}
//         <Route path="/login" element={<Login />} />

//         {/* Rutas protegidas */}
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
//           <Route path="vehicles" element={<VehiclesList />} />
//           <Route path="tickets" element={<TicketsList />} />

//           {/* Ruta comodín → Dashboard */}
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   )
// }


//// **** Limpio

// front/src/routes/index.jsx
// -----------------------------------------------------------------------------
// Sistema de rutas de FleetCore Suite
// Protege sesión (AuthGate + RequireAuth) y define módulos visibles.
// Incluye vehículos (listado + formulario) y evita rebote al dashboard.
// -----------------------------------------------------------------------------

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { api } from '../services/http'

// Layout principal
import AppLayout from '../components/layout/AppLayout'

// Páginas base
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import BranchesList from '../pages/Branches/List'
import VehiclesList from '../pages/Vehicles/List'
import VehiclesForm from '../pages/Vehicles/Form'
import TicketsList from '../pages/Tickets/List'

// Pantalla de carga
function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      <div className="animate-pulse">Cargando sesión…</div>
    </div>
  )
}

// AuthGate → carga sesión desde /auth/me
function AuthGate({ children }) {
  const user = useAppStore(s => s.user)
  const setUser = useAppStore(s => s.setUser)
  const authBootstrapped = useAppStore(s => s.authBootstrapped)
  const setAuthBootstrapped = useAppStore(s => s.setAuthBootstrapped)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (authBootstrapped || running) return
    setRunning(true)
    api.get('/api/v1/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {}) // si 401, deja user en null
      .finally(() => {
        setAuthBootstrapped(true)
        setRunning(false)
      })
  }, [authBootstrapped, running, setAuthBootstrapped, setUser])

  if (!authBootstrapped) return <Splash />
  return children
}

// RequireAuth → bloquea rutas privadas
function RequireAuth({ children }) {
  const user = useAppStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  return children
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

          <Route path="tickets" element={<TicketsList />} />

          {/* Cualquier otra → vehículos */}
          <Route path="*" element={<Navigate to="/vehicles" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
