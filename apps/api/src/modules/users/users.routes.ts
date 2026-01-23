import { Router, type Router as RouterType } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { isSuperAdmin } from '../../middleware/rbac.middleware.js';
import { usersController } from './users.controller.js';

const router: RouterType = Router();

// All users routes require authentication and Super Admin role
router.use(authenticate);
router.use(isSuperAdmin);

// Routes
router.get('/', usersController.list);
router.get('/:id', usersController.getById);
router.post('/', usersController.create);
router.patch('/:id', usersController.update);
router.delete('/:id', usersController.delete);

export default router;
