// src/middleware/rateLimiters.js
// Giris ve 2FA dogrulama uclarina kaba kuvvet (brute-force) saldirilarini
// zorlastirmak icin hiz siniri uygular.

import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Cok fazla deneme yapildi. Lutfen birkac dakika sonra tekrar deneyin.' },
});

export const twoFactorLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Cok fazla dogrulama denemesi yapildi. Lutfen birkac dakika sonra tekrar deneyin.' },
});
