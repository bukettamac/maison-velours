// src/controllers/accountController.js
// Oturum acmis admin'in KENDI hesabini yonetmesini saglar: sifre
// degistirme ve 2FA'yi yeniden kurma. Her ikisi de mevcut sifrenin
// tekrar girilmesini zorunlu kilar (oturum ele gecirilse bile hesap
// devralinamasin diye).

import qrcode from 'qrcode';
import { isProd } from '../config/env.js';
import { AdminUserModel } from '../models/adminUserModel.js';
import { generateTotpSecret, buildOtpAuthUrl, verifyTotpCode } from '../utils/totp.js';
import { reset2FAToken } from '../utils/jwt.js';

const cookieOpts = { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' };

export async function changePassword(req, res) {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body || {};
  const user = await AdminUserModel.findByUsername(req.admin.username);

  if (!user || !(await AdminUserModel.verifyPassword(user, currentPassword || ''))) {
    return res.status(401).json({ error: 'Mevcut sifre hatali.' });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Yeni sifre en az 8 karakter olmalidir.' });
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).json({ error: 'Yeni sifreler eslesmiyor.' });
  }

  await AdminUserModel.updatePassword(user.username, newPassword);
  return res.json({ success: true });
}

export async function startTwoFactorReset(req, res) {
  const { currentPassword } = req.body || {};
  const user = await AdminUserModel.findByUsername(req.admin.username);

  if (!user || !(await AdminUserModel.verifyPassword(user, currentPassword || ''))) {
    return res.status(401).json({ error: 'Mevcut sifre hatali.' });
  }

  const secret = generateTotpSecret();
  const otpauthUrl = buildOtpAuthUrl(secret, user.username, 'MaisonVelours');
  const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

  const token = reset2FAToken.sign({ username: user.username, secret });
  res.cookie('mv_reset2fa_pending', token, { ...cookieOpts, maxAge: 10 * 60 * 1000 });

  return res.json({ qrDataUrl, secret });
}

export async function confirmTwoFactorReset(req, res) {
  const pending = reset2FAToken.verify(req.cookies?.mv_reset2fa_pending);
  if (!pending || pending.username !== req.admin.username) {
    return res.status(401).json({ error: '2FA yenileme oturumunun suresi doldu, lutfen tekrar baslatin.' });
  }

  const { code } = req.body || {};
  if (!verifyTotpCode(code, pending.secret)) {
    return res.status(401).json({ error: 'Dogrulama kodu hatali.' });
  }

  await AdminUserModel.updateTotpSecret(pending.username, pending.secret);
  res.clearCookie('mv_reset2fa_pending', { path: '/' });
  return res.json({ success: true });
}
