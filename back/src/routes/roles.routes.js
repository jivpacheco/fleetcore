import { Router } from 'express';
import requirePermission from '../middleware/requirePermission.js';
import { listRoles, createRole, updateRole, deleteRole } from '../controllers/roles.controller.js';

const router = Router();

router.get('/', requirePermission('roles.read'), listRoles);
router.post('/', requirePermission('roles.manage'), createRole);
router.patch('/:id', requirePermission('roles.manage'), updateRole);
router.delete('/:id', requirePermission('roles.manage'), deleteRole);

export default router;
