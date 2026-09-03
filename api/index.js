// api/index.js
// Vercel Serverless Function giris noktasi. /api klasorundeki her dosya
// Vercel tarafindan otomatik olarak bir fonksiyona donusturulur; vercel.json
// icindeki "rewrites" ile tum istekler (statik dosyalar haric) buraya
// yonlendirilir. Express uygulamasi (req, res) imzasina uydugu icin
// dogrudan bir Vercel fonksiyon handler'i olarak kullanilabilir.

import { createApp } from '../src/app.js';
import { initDatabase } from '../src/config/database.js';

// Sicak (warm) fonksiyon cagrilari arasinda tekrar kullanilsin diye
// modul seviyesinde tek seferlik baslatma yapilir.
let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = initDatabase().then(() => createApp());
  }
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
