
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Topbar from '../components/layout/Topbar'
import Sidebar from '../components/layout/Sidebar'
import { useAppStore } from '../store/useAppStore'


function AppLayout(){
// Layout común para rutas protegidas
return (
<div className="min-h-screen bg-gray-50 flex">
<Sidebar/>
<main className="flex-1 flex flex-col">
<Topbar/>
<div className="flex-1">
<Routes>
<Route path="/dashboard" element={<Dashboard/>} />
{/* Aquí irán Branches, Vehicles, Tickets */}
<Route path="*" element={<Navigate to="/dashboard" replace/>} />
</Routes>
</div>
</main>
</div>
)
}


function RequireAuth({ children }){
const user = useAppStore(s=>s.user)
if(!user) return <Navigate to="/login" replace/>
return children
}


export default function AppRoutes(){
return (
<BrowserRouter>
<Routes>
<Route path="/login" element={<Login/>} />
<Route path="/*" element={<RequireAuth><AppLayout/></RequireAuth>} />
</Routes>
</BrowserRouter>
)
}