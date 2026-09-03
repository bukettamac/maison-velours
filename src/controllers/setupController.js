// src/controllers/setupController.js
// Ilk admin hesabini TAMAMEN tarayicidan olusturur — CLI script'ine
// gerek yoktur. Veritabaninda hicbir admin_users kaydi yokken erisilebilir;
// bir hesap olusturulduktan sonra bu rotalar kilitlenir (guard fonksiyonu).
//
// Adim 1: kullanici adi + sifre girilir, sunucu yeni bir TOTP gizli
//         anahtari uretir ve QR kodunu gosterir (henuz veritabanina
//         yazilmaz — kisa omurlu imzali bir cookie'de tutulur).
// Adim 2: Authenticator uygulamasindan okunan 6 haneli kod dogrulanir;
//         basariliysa hesap veritabanina yazilir.

import qrcode from 'qrcode';
import { isProd } from '../config/env.js';
import { AdminUserModel } from '../models/adminUserModel.js';
import { generateTotpSecret, buildOtpAuthUrl, verifyTotpCode } from '../utils/totp.js';
import { setupToken } from '../utils/jwt.js';

const cookieOpts = { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' };

async function setupAlreadyDone() {
  return (await AdminUserModel.count()) > 0;
}

export async function getSetup(req, res) {
  if (await setupAlreadyDone()) return res.redirect('/admin/login');
  res.render('admin/setup', { error: null });
}

export async function postSetup(req, res) {
  if (await setupAlreadyDone()) {
    return res.status(409).json({ error: 'Kurulum zaten tamamlanmis.' });
  }

  const { username, password, passwordConfirm } = req.body || {};

  if (!username || !password || password.length < 8) {
    return res.status(400).json({ error: 'Kullanici adi ve en az 8 karakterli bir sifre girin.' });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: 'Sifreler eslesmiyor.' });
  }

  const secret = generateTotpSecret();
  const otpauthUrl = buildOtpAuthUrl(secret, username, 'MaisonVelours');
  const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

  const token = setupToken.sign({ username, password, secret });
  res.cookie('mv_setup_pending', token, { ...cookieOpts, maxAge: 15 * 60 * 1000 });

  return res.json({ qrDataUrl, secret });
}

export async function getSetupVerify(req, res) {
  if (await setupAlreadyDone()) return res.redirect('/admin/login');
  const pending = setupToken.verify(req.cookies?.mv_setup_pending);
  if (!pending) return res.redirect('/admin/setup');
  res.render('admin/setup-verify', { error: null });
}

export async function postSetupVerify(req, res) {
  if (await setupAlreadyDone()) {
    return res.status(409).json({ error: 'Kurulum zaten tamamlanmis.' });
  }

  const pending = setupToken.verify(req.cookies?.mv_setup_pending);
  if (!pending) {
    return res.status(401).json({ error: 'Kurulum oturumunun suresi doldu, lutfen bastan baslayin.' });
  }

  const { code } = req.body || {};
  if (!verifyTotpCode(code, pending.secret)) {
    return res.status(401).json({ error: 'Dogrulama kodu hatali. Authenticator uygulamanizdaki guncel kodu girin.' });
  }

  await AdminUserModel.create({
    username: pending.username,
    password: pending.password,
    totpSecret: pending.secret,
  });

  res.clearCookie('mv_setup_pending', { path: '/' });
  return res.json({ success: true, redirect: '/admin/login' });
}
