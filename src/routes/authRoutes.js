// src/routes/authRoutes.js
import { Router } from 'express';
import { postLogin, postVerifyTwoFactor, postLogout } from '../controllers/authController.js';
import { loginLimiter, twoFactorLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/login', loginLimiter, postLogin);
router.post('/verify-2fa', twoFactorLimiter, postVerifyTwoFactor);
router.post('/logout', postLogout);

export default router;
