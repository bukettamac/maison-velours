// src/config/env.js
// Tum ortam degiskenlerini tek noktadan okur. Bu modul SADECE sunucu
// tarafinda import edilir; public/ ve views/ katmanina asla dogrudan
// gecirilmez. Boylece gizli anahtarlar sayfa kaynagina hicbir zaman sizmaz.

import dotenv from 'dotenv';
dotenv.config();

function required(name, fallbackForDev) {
  const val = process.env[name];
  if (!val || val.startsWith('CHANGE_ME')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[env] Zorunlu ortam degiskeni eksik: ${name}`);
    }
    return fallbackForDev;
  }
  return val;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  siteName: process.env.SITE_NAME || 'Maison Velours Nail Atelier',

  // Veritabani baglantisi her zaman zorunlu (JSON dosya fallback'i yok):
  databaseUrl: process.env.DATABASE_URL || '',

  jwtSecret: required('JWT_SECRET', 'dev-only-jwt-secret-do-not-use-in-prod'),
  jwt2faPendingSecret: required('JWT_2FA_PENDING_SECRET', 'dev-only-2fa-pending-secret'),
  cookieSecret: required('COOKIE_SECRET', 'dev-only-cookie-secret'),
};

export const isProd = env.nodeEnv === 'production';
