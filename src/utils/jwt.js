// src/utils/jwt.js
// Oturum, "2FA bekleniyor", "ilk kurulum bekleniyor" ve "2FA yeniden
// kurulum bekleniyor" durumlari icin imzali (opak) token yardimcilari.
// Anahtarlar sadece sunucu belleginde kullanilir; istemciye SADECE
// imzalanmis token gonderilir, anahtarin kendisi asla gonderilmez.

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

function makeTokenPair(scope, secret, ttl) {
  return {
    sign(payload) {
      return jwt.sign({ ...payload, scope }, secret, { expiresIn: ttl });
    },
    verify(token) {
      if (!token) return null;
      try {
        const decoded = jwt.verify(token, secret);
        return decoded.scope === scope ? decoded : null;
      } catch {
        return null;
      }
    },
  };
}

// Tam oturum (2FA tamamlanmis admin girisi) — 8 saat
export const sessionToken = makeTokenPair('session', env.jwtSecret, '8h');

// Giris Adim 1 basarili, Adim 2 (TOTP) bekleniyor — 5 dakika
export const pending2FAToken = makeTokenPair('pending-2fa', env.jwt2faPendingSecret, '5m');

// Ilk admin hesabi kurulumu (kullanici adi/sifre girildi, TOTP dogrulamasi
// bekleniyor) — 15 dakika
export const setupToken = makeTokenPair('setup-pending', env.jwt2faPendingSecret, '15m');

// Mevcut hesap icin 2FA yeniden kurulumu (yeni gizli anahtar uretildi,
// dogrulama bekleniyor) — 10 dakika
export const reset2FAToken = makeTokenPair('reset-2fa-pending', env.jwt2faPendingSecret, '10m');

// Geriye donuk uyumluluk icin eski fonksiyon adlari
export const signSessionToken = sessionToken.sign;
export const verifySessionToken = sessionToken.verify;
export const signPending2FAToken = pending2FAToken.sign;
export const verifyPending2FAToken = pending2FAToken.verify;
