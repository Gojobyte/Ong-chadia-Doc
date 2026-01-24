import { Router, type Router as RouterType } from 'express';
import * as sharingController from './sharing.controller.js';

const router: RouterType = Router();

// GET /api/share/:token - Download document via share token (PUBLIC, no auth required)
router.get('/:token', sharingController.downloadByShareToken);

export default router;
