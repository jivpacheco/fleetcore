import StockMove from '../models/StockMove.js';
export async function kardexByProduct(productId, from, to, locationId=null){
  const match = { productId, createdAt: { $gte: new Date(from), $lte: new Date(to) } };
  if(locationId) match.$or = [{ fromLocationId: locationId }, { toLocationId: locationId }];
  return await StockMove.aggregate([
    { $match: match },
    { $sort: { createdAt: 1 } },
    { $project: { productId:1, type:1, fromLocationId:1, toLocationId:1, qty:1, unitCost:1, createdAt:1 } }
  ]);
}