import express from 'express';
import { makeCrudController } from '../controllers/crud.controller.js';
import { branchScope } from '../middleware/branchScope.js';

export default function makeRoutes(Model){
  const router = express.Router();
  const C = makeCrudController(Model);
  router.get('/', branchScope, C.list);
  router.get('/:id', C.get);
  router.post('/', C.create);
  router.patch('/:id', C.update);
  router.delete('/:id', C.remove);
  return router;
}