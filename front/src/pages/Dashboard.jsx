import { useQuery } from '@tanstack/react-query'
import { listBranches } from '../api/branches.api'
import { listVehicles } from '../api/vehicles.api'
import { listTickets } from '../api/tickets.api'


export default function Dashboard(){
const qBranches = useQuery({ queryKey:['branches',{page:1}], queryFn: ()=>listBranches(1,10) })
const qVehicles = useQuery({ queryKey:['vehicles',{page:1}], queryFn: ()=>listVehicles(1,10) })
const qTickets = useQuery({ queryKey:['tickets',{page:1}], queryFn: ()=>listTickets(1,10) })


return (
<div className="p-4 grid gap-4 md:grid-cols-3">
<div className="card p-4">
<div className="font-semibold mb-2" style={{color:'var(--fc-secondary)'}}>Sucursales</div>
{qBranches.isLoading? 'Cargando…' : (
<ul className="list-disc pl-5">
{(qBranches.data?.data||[]).map(b=> <li key={b._id}>{b.code} - {b.name}</li>)}
</ul>
)}
</div>
<div className="card p-4">
<div className="font-semibold mb-2" style={{color:'var(--fc-secondary)'}}>Vehículos</div>
{qVehicles.isLoading? 'Cargando…' : (
<ul className="list-disc pl-5">
{(qVehicles.data?.data||[]).map(v=> <li key={v._id}>{v.code} - {v.name}</li>)}
</ul>
)}
</div>
<div className="card p-4 md:col-span-2">
<div className="font-semibold mb-2" style={{color:'var(--fc-secondary)'}}>Tickets</div>
{qTickets.isLoading? 'Cargando…' : (
<ul className="list-disc pl-5">
{(qTickets.data?.data||[]).map(t=> <li key={t._id}>{t.folio} - {t.description}</li>)}
</ul>
)}
</div>
</div>
)
}