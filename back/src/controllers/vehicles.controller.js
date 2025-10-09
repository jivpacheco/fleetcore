import * as svc from '../services/vehicles.service.js';

export async function list(req,res,next){
  try { res.json(await svc.listVehicles(req.query)); }
  catch(e){ next(e); }
}
export async function create(req,res,next){
  try { res.status(201).json(await svc.createVehicle(req.body)); }
  catch(e){ next(e); }
}
export async function getOne(req,res,next){
  try { res.json(await svc.getVehicle(req.params.id)); }
  catch(e){ e.message==='not_found'?res.status(404).json({msg:'No encontrado'}):next(e); }
}
export async function update(req,res,next){
  try { res.json(await svc.updateVehicle(req.params.id,req.body)); }
  catch(e){ e.message==='not_found'?res.status(404).json({msg:'No encontrado'}):next(e); }
}
export async function remove(req,res,next){
  try { res.json(await svc.removeVehicle(req.params.id,true,req.user?.uid)); }
  catch(e){ e.message==='not_found'?res.status(404).json({msg:'No encontrado'}):next(e); }
}
export async function transfer(req,res,next){
  try { res.json(await svc.transferVehicle(req.params.id,req.body)); }
  catch(e){ e.message==='not_found'?res.status(404).json({msg:'No encontrado'}):next(e); }
}

