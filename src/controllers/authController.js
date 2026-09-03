// src/controllers/authController.js
// Iki asamali admin girisi:
//   Asama 1: kullanici adi + sifre  -> kisa omurlu "pending-2fa" token
//   Asama 2: TOTP kodu (Authenticator uygulamasi) -> tam oturum cookie'si
// Admin bilgileri artik veritabanindadir (AdminUserModel); hicbir asamada
// gizli veri (sifre hash'i, TOTP secret, JWT anahtarlari) istemciye
// gonderilmez; sadece basari/basarisizlik ve opak tokenlar doner.

import { isProd } from '../config/env.js';
import { AdminUserModel } from '../models/adminUserModel.js';
import { verifyTotpCode } from '../utils/totp.js';
import { pending2FAToken, sessionToken } from '../utils/jwt.js';

const cookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
};

export async function postLogin(req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanici adi ve sifre zorunludur.' });
  }

  const user = await AdminUserModel.findByUsername(username);
  const validPassword = user ? await AdminUserModel.verifyPassword(user, password) : false;

  if (!user || !validPassword) {
    return res.status(401).json({ error: 'Kullanici adi veya sifre hatali.' });
  }

  const token = pending2FAToken.sign({ username: user.username });
  res.cookie('mv_pending_2fa', token, { ...cookieOpts, maxAge: 5 * 60 * 1000 });

  return res.json({ requiresTwoFactor: true });
}

export async function postVerifyTwoFactor(req, res) {
  const { code } = req.body || {};
  const pending = pending2FAToken.verify(req.cookies?.mv_pending_2fa);

  if (!pending) {
    return res.status(401).json({ error: 'Oturum suresi doldu, lutfen tekrar giris yapin.' });
  }

  const user = await AdminUserModel.findByUsername(pending.username);
  if (!user || !verifyTotpCode(code, user.totp_secret)) {
    return res.status(401).json({ error: 'Dogrulama kodu hatali veya suresi gecmis.' });
  }

  const token = sessionToken.sign({
    username: user.username,
    role: 'admin',
    twoFactorVerified: true,
  });

  res.clearCookie('mv_pending_2fa', { path: '/' });
  res.cookie('mv_session', token, { ...cookieOpts, maxAge: 8 * 60 * 60 * 1000 });

  return res.json({ success: true, redirect: '/admin/dashboard' });
}

export function postLogout(req, res) {
  res.clearCookie('mv_session', { path: '/' });
  res.clearCookie('mv_pending_2fa', { path: '/' });
  res.redirect('/admin/login');
}
