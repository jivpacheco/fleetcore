import Reservation from '../models/Reservation.js';
import StockBalance from '../models/StockBalance.js';
import StockMove from '../models/StockMove.js';
export async function consumeReservation(reservationId, userId, session){
  const r = await Reservation.findById(reservationId).session(session);
  if(!r || r.status !== 'active') throw new Error('Reserva no válida');
  const bal = await StockBalance.findOne({ productId: r.productId, locationId: r.locationId }).session(session);
  if(!bal || bal.reserved < r.qty) throw new Error('Reserva insuficiente');
  bal.reserved -= r.qty; bal.onHand -= r.qty; await bal.save({ session });
  r.status = 'consumed'; await r.save({ session });
  await StockMove.create([{
    productId: r.productId, type:'OUT_CONSUME_WO', fromLocationId: r.locationId, qty: r.qty, workOrderId: r.workOrderId, createdBy: userId
  }], { session });
}