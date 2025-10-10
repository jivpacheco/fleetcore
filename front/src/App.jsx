// import { useEffect } from 'react'

// export default function App(){
//   useEffect(()=>{
//     http((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/health')
//       .then(r=>r.json())
//       .then(d=>console.log('health:', d))
//       .catch(console.error)
//   },[])

//   return (
//     <div className="min-h-screen flex">
//       <aside className="w-64 bg-gray-100 p-4">Sidebar</aside>
//       <main className="flex-1">
//         <header className="h-14 bg-[color:var(--fc-primary)] text-white flex items-center px-4">
//           FleetCore Suite
//         </header>
//         <section className="p-4">Contenido principal</section>
//       </main>
//     </div>
//   )
// }


///***** previa */
// front/src/App.jsx
// -----------------------------------------------------------------------------
// Estructura principal de FleetCore Suite (AppShell)
// Mantiene Sidebar + Topbar + contenido dinámico (React Router).
// -----------------------------------------------------------------------------
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import Topbar from './components/layout/Topbar'
// import { useAppStore } from './store/useAppStore'
// import VehiclesList from './pages/Vehicles/List'
// import VehiclesForm from './pages/Vehicles/Form'

// export default function App() {
//   const { user } = useAppStore()

//   return (
//     <BrowserRouter>
//       <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
//         {/* Sidebar (por ahora estático) */}
//         <aside className="w-64 bg-gray-100 p-4 border-r dark:border-slate-700 hidden md:block">
//           Sidebar
//         </aside>

//         {/* Contenido principal */}
//         <main className="flex-1 flex flex-col">
//           <Topbar />

//           <section className="flex-1 p-4">
//             <Routes>
//               {/* Rutas protegidas (puedes agregar un RequireAuth más adelante) */}
//               <Route path="/" element={<Navigate to="/vehicles" replace />} />
//               <Route path="/vehicles" element={<VehiclesList />} />
//               <Route path="/vehicles/new" element={<VehiclesForm />} />
//               <Route path="/vehicles/:id" element={<VehiclesForm />} />

//               {/* Fallback: redirige a dashboard */}
//               <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>
//           </section>
//         </main>
//       </div>
//     </BrowserRouter>
//   )
// }


// ***compacta

// front/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Topbar from './components/layout/Topbar'
import VehiclesList from './pages/Vehicles/List'
import VehiclesForm from './pages/Vehicles/Form'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
        <aside className="w-64 bg-gray-100 p-4 border-r dark:border-slate-700 hidden md:block">
          Sidebar
        </aside>

        <main className="flex-1 flex flex-col">
          <Topbar />
          <section className="flex-1 p-4">
            <Routes>
              {/* Home → Vehículos */}
              <Route path="/" element={<Navigate to="/vehicles" replace />} />

              {/* Vehículos */}
              <Route path="/vehicles" element={<VehiclesList />} />
              <Route path="/vehicles/new" element={<VehiclesForm />} />
              <Route path="/vehicles/:id" element={<VehiclesForm />} />

              {/* (Temporal) Fallback a vehículos mientras depuramos */}
              <Route path="*" element={<Navigate to="/vehicles" replace />} />
            </Routes>
          </section>
        </main>
      </div>
    </BrowserRouter>
  )
}
