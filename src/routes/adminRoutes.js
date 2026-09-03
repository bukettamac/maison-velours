// src/routes/adminRoutes.js
import { Router } from 'express';
import { requireSession } from '../middleware/requireSession.js';
import { loginLimiter, twoFactorLimiter } from '../middleware/rateLimiters.js';
import * as admin from '../controllers/adminController.js';
import * as setup from '../controllers/setupController.js';
import * as account from '../controllers/accountController.js';
import { AdminUserModel } from '../models/adminUserModel.js';

const router = Router();

// ---- Ilk kurulum (CLI gerekmez, sadece hic admin yokken erisilir) ----
router.get('/setup', setup.getSetup);
router.post('/setup', loginLimiter, setup.postSetup);
router.get('/setup/verify', setup.getSetupVerify);
router.post('/setup/verify', twoFactorLimiter, setup.postSetupVerify);

// ---- Sayfalar (view) ----
router.get('/login', async (req, res) => {
  if ((await AdminUserModel.count()) === 0) return res.redirect('/admin/setup');
  res.render('admin/login', { error: null });
});
router.get('/verify', (req, res) => {
  if (!req.cookies?.mv_pending_2fa) return res.redirect('/admin/login');
  res.render('admin/verify', { error: null });
});
router.get('/dashboard', requireSession, admin.renderDashboard);
router.get('/', requireSession, (req, res) => res.redirect('/admin/dashboard'));

// ---- Korumali JSON API (CRUD + hesap yonetimi) ----
router.use('/api', requireSession);

router.post('/api/services', admin.createService);
router.put('/api/services/:id', admin.updateService);
router.delete('/api/services/:id', admin.deleteService);

router.post('/api/gallery', admin.createGalleryImage);
router.put('/api/gallery/:id', admin.updateGalleryImage);
router.delete('/api/gallery/:id', admin.deleteGalleryImage);

router.post('/api/reviews', admin.createReview);
router.put('/api/reviews/:id', admin.updateReview);
router.delete('/api/reviews/:id', admin.deleteReview);

router.put('/api/settings', admin.updateSettings);

router.post('/api/account/change-password', account.changePassword);
router.post('/api/account/reset-2fa/start', account.startTwoFactorReset);
router.post('/api/account/reset-2fa/confirm', account.confirmTwoFactorReset);

export default router;
