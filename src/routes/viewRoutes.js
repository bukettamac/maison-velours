// src/routes/viewRoutes.js
import { Router } from 'express';
import { renderHome } from '../controllers/publicController.js';

const router = Router();
router.get('/', renderHome);

export default router;
