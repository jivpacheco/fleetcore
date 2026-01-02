import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
// import { requirePermission } from '../middleware/requirePermission.js';
import  requirePermission  from '../middleware/requirePermission.js';
import { branchScope } from '../middleware/branchScope.js';
import * as ctrl from '../controllers/people.controller.js';

const router = express.Router();

router.get('/',      requireAuth, requirePermission('people:read'),   branchScope, ctrl.list);
router.get('/:id',   requireAuth, requirePermission('people:read'),   branchScope, ctrl.get);
router.post('/',     requireAuth, requirePermission('people:create'), ctrl.create);
router.patch('/:id', requireAuth, requirePermission('people:update'), branchScope, ctrl.update);
router.delete('/:id',requireAuth, requirePermission('people:delete'), branchScope, ctrl.remove);

export default router;
