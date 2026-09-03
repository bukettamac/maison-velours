// src/routes/apiRoutes.js
// Herkese acik, salt-okunur API. Sadece public/gorunur veriyi doner.
import { Router } from 'express';
import { getPublicData } from '../controllers/publicController.js';

const router = Router();
router.get('/site-data', getPublicData);

export default router;
