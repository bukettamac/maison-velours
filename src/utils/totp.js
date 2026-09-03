// src/utils/totp.js
// Google Authenticator / Authy uyumlu TOTP (zaman tabanli tek kullanimlik
// sifre) uretim ve dogrulama yardimcisi. Gizli anahtar artik veritabaninda
// (admin_users.totp_secret) tutulur; bu modul sadece saf fonksiyonlar
// icerir, herhangi bir global/env gizli anahtara bagimli degildir.

import { authenticator } from 'otplib';

authenticator.options = { window: 1 }; // ±30sn tolerans

export function verifyTotpCode(code, secret) {
  if (!secret || !code) return false;
  try {
    return authenticator.check(String(code).trim(), secret);
  } catch {
    return false;
  }
}

export function generateTotpSecret() {
  return authenticator.generateSecret();
}

export function buildOtpAuthUrl(secret, accountLabel, issuer) {
  return authenticator.keyuri(accountLabel, issuer, secret);
}
