import { NavLink } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'


const linkCls = ({isActive}) => `block px-3 py-2 rounded hover:bg-gray-100 ${isActive?'bg-gray-100 font-medium':''}`


export default function Sidebar(){
const open = useAppStore(s=>s.sidebarOpen)


return (
<aside className={`bg-white border-r transition-all duration-200 ${open? 'w-64' : 'w-14'} overflow-hidden`}>
<nav className="p-2 text-sm">
<NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
<div className="mt-3 mb-1 text-gray-500 uppercase text-xs">Gestión</div>
<NavLink to="/branches" className={linkCls}>Sucursales</NavLink>
<NavLink to="/vehicles" className={linkCls}>Vehículos</NavLink>
<NavLink to="/tickets" className={linkCls}>Tickets</NavLink>
</nav>
</aside>
)
}