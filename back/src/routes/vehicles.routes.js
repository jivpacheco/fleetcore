import { Router } from 'express';
import * as ctrl from '../controllers/vehicles.controller.js';
import { requirePermission } from '../middleware/requirePermission.js';
const r = Router();

r.get('/', requirePermission('vehicles:read'), ctrl.list);
r.post('/', requirePermission('vehicles:create'), ctrl.create);
r.get('/:id', requirePermission('vehicles:read'), ctrl.getOne);
r.patch('/:id', requirePermission('vehicles:update'), ctrl.update);
r.delete('/:id', requirePermission('vehicles:delete'), ctrl.remove);
r.post('/:id/transfer', requirePermission('vehicles:transfer'), ctrl.transfer);

export default r;

