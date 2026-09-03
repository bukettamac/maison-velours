// src/middleware/requireSession.js
// Admin panel rotalarini korur. Gecerli, tam dogrulanmis (2FA tamamlanmis)
// bir oturum cookie'si yoksa kullaniciyi login sayfasina yonlendirir.

import { verifySessionToken } from '../utils/jwt.js';

export function requireSession(req, res, next) {
  const token = req.cookies?.mv_session;
  const decoded = token ? verifySessionToken(token) : null;

  if (!decoded || decoded.role !== 'admin' || !decoded.twoFactorVerified) {
    // req.originalUrl her zaman tam yolu korur (nested router'larda req.path
    // mount noktasina gore kirpilabilir), bu yuzden kontrolu onun uzerinden yapiyoruz.
    if (req.originalUrl.startsWith('/admin/api')) {
      return res.status(401).json({ error: 'Oturum gecersiz, lutfen tekrar giris yapin.' });
    }
    return res.redirect('/admin/login');
  }

  req.admin = decoded;
  next();
}
