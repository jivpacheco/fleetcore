// import { useQuery } from '@tanstack/react-query'
// import { listBranches } from '../api/branches.api'
// import { listVehicles } from '../api/vehicles.api'
// import { listTickets } from '../api/tickets.api'


// export default function Dashboard(){
// const qBranches = useQuery({ queryKey:['branches',{page:1}], queryFn: ()=>listBranches(1,10) })
// const qVehicles = useQuery({ queryKey:['vehicles',{page:1}], queryFn: ()=>listVehicles(1,10) })
// const qTickets = useQuery({ queryKey:['tickets',{page:1}], queryFn: ()=>listTickets(1,10) })


// return (
// <div className="p-4 grid gap-4 md:grid-cols-3">
// <div className="card p-4">
// <div className="font-semibold mb-2" style={{color:'var(--fc-secondary)'}}>Sucursales</div>
// {qBranches.isLoading? 'Cargando…' : (
// <ul className="list-disc pl-5">
// {(qBranches.data?.data||[]).map(b=> <li key={b._id}>{b.code} - {b.name}</li>)}
// </ul>
// )}
// </div>
// <div className="card p-4">
// <div className="font-semibold mb-2" style={{color:'var(--fc-secondary)'}}>Vehículos</div>
// {qVehicles.isLoading? 'Cargando…' : (
// <ul className="list-disc pl-5">
// {(qVehicles.data?.data||[]).map(v=> <li key={v._id}>{v.code} - {v.name}</li>)}
// </ul>
// )}
// </div>
// <div className="card p-4 md:col-span-2">
// <div className="font-semibold mb-2" style={{color:'var(--fc-secondary)'}}>Tickets</div>
// {qTickets.isLoading? 'Cargando…' : (
// <ul className="list-disc pl-5">
// {(qTickets.data?.data||[]).map(t=> <li key={t._id}>{t.folio} - {t.description}</li>)}
// </ul>
// )}
// </div>
// </div>
// )
// }
// src/pages/Dashboard.jsx
// -----------------------------------------------------------------------------
// Pantalla inicial del sistema (Dashboard)
// - Muestra un saludo y una grilla base para KPIs / Alertas / Listas
// - Por ahora sin datos dummy, solo estructura limpia
// - Luego podremos inyectar KPIs reales (tickets, vehículos, inventario, etc.)
// -----------------------------------------------------------------------------

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <header>
                <h1 className="text-2xl font-bold text-gray-800">
                    Bienvenido a FleetCore Suite
                </h1>
                <p className="text-gray-600 text-sm">
                    Panel principal para visualizar indicadores, alertas y pendientes.
                </p>
            </header>

            {/* Grid de KPIs (vacío por ahora) */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Indicadores clave
                </h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Aquí van tarjetas de KPIs reales cuando tengamos datos */}
                    <div className="bg-white rounded-xl shadow p-4 text-gray-400 text-sm text-center border">
                        (KPI 1)
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-gray-400 text-sm text-center border">
                        (KPI 2)
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-gray-400 text-sm text-center border">
                        (KPI 3)
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-gray-400 text-sm text-center border">
                        (KPI 4)
                    </div>
                </div>
            </section>

            {/* Alertas o mensajes del sistema */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Alertas recientes
                </h2>
                <div className="bg-white rounded-xl shadow p-4 border text-gray-400 text-sm">
                    (Aquí se mostrarán alertas críticas, como stock bajo, OT vencidas, etc.)
                </div>
            </section>

            {/* Listados rápidos o backlog */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Pendientes recientes
                </h2>
                <div className="bg-white rounded-xl shadow p-4 border text-gray-400 text-sm">
                    (Aquí aparecerá un backlog resumido de tickets/OT cuando los tengamos)
                </div>
            </section>
        </div>
    )
}
