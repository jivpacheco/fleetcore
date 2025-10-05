// front/src/pages/Dashboard.jsx
// -----------------------------------------------------------------------------
// Estructura base sin datos dummy. Dejamos slots para KPIs, alertas y pendientes.
// -----------------------------------------------------------------------------

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Bienvenido a FleetCore Suite</h1>
                <p className="text-gray-600 text-sm">
                    Panel principal para visualizar indicadores, alertas y pendientes.
                </p>
            </header>

            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Indicadores clave</h2>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Alertas recientes</h2>
                <div className="bg-white rounded-xl shadow p-4 border text-gray-400 text-sm">
                    (Aquí se mostrarán alertas críticas, como stock bajo, OT vencidas, etc.)
                </div>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Pendientes recientes</h2>
                <div className="bg-white rounded-xl shadow p-4 border text-gray-400 text-sm">
                    (Aquí aparecerá un backlog resumido de tickets/OT cuando los tengamos)
                </div>
            </section>
        </div>
    )
}
