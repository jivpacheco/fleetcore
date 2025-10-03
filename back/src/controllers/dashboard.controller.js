// NOTA: Este controlador devuelve datos dummy “coherentes”
// para que el front ya pinte. Luego cambiamos a agregaciones reales.
// Si ya tienes modelos (Vehicle, WorkOrder, Ticket, Fuel, Accident),
// allí dejamos los TODO de ejemplos de agregaciones.

export async function getKpis(req, res, next) {
  try {
    const { branchId, from, to } = req.query
    // TODO (real): usar branchId/from/to para filtrar en agregaciones.

    // Dummy coherente para “primer render”
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

    const data = {
      fleetAvailability: 0.86,
      openWorkOrders: { total: 23, critical: 5 },
      pmCompliance: { month, mp1: 0.92, mp2: 0.88 },
      openTickets: { total: 17, byType: { mecanica: 7, electrica: 5, otros: 5 } },
      fuelMTD: { liters: 18230, cost: 21500000 },
      openAccidents: 2
    }

    // TODO (real):
    // - fleetAvailability: 1 - (vehículos con OT abierta crítica o siniestro abierto)/total
    // - openWorkOrders: WorkOrder.countDocuments({ status: { $in:['open','in_progress','on_hold'] }, ...(branch) })
    // - pmCompliance: % MP realizadas / programadas del mes
    // - openTickets: agrupación por tipo
    // - fuelMTD: sumatoria por mes actual
    // - openAccidents: Accident.countDocuments({ status: 'open' })

    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function getAlerts(req, res, next) {
  try {
    const { branchId } = req.query

    const alerts = [
      { type: 'mp_due', vehicle: 'CB-12', dueDate: '2025-10-04', mp: 'MP2', severity: 'high' },
      { type: 'stock_low', sku: 'FILT-123', qty: 2, min: 5, severity: 'med' },
      { type: 'accident_open', vehicle: 'CB-07', since: '2025-09-29', severity: 'high' }
    ]

    // TODO (real):
    // - mp_due: proyección desde plan de mantención con dueDate cercano
    // - stock_low: items con qty <= min
    // - accident_open: Accident con status 'open'

    res.json(alerts)
  } catch (err) {
    next(err)
  }
}
