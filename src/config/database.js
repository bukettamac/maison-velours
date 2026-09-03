// src/config/database.js
// Veritabani katmani IKI modda calisabilir:
//
//  1) GOMULU (varsayilan, ekstra kurulum GEREKTIRMEZ): DATABASE_URL
//     tanimli degilse, Node'un kendi ic ice (built-in) "node:sqlite"
//     modulu kullanilarak proje icindeki data/maison-velours.sqlite
//     dosyasina yazan gercek bir SQLite veritabani calisir. Native
//     derleme veya harici servis GEREKMEZ — veritabani projenin kendi
//     icinde gelir.
//
//  2) POSTGRESQL (istege bagli, kalici sunucusuz/serverless barindirma
//     icin onerilir — ornegin Vercel): DATABASE_URL tanimliysa (Vercel
//     Postgres / Neon / Supabase vb.) bunun yerine PostgreSQL kullanilir.
//     Serverless ortamlarda dosya sistemi kalici olmadigi icin (ornegin
//     Vercel) SQLite yazmalari kalici OLMAZ; bu yuzden Vercel'de
//     DATABASE_URL tanimlamak onerilir.
//
// Her iki modda da AYNI SQL (PostgreSQL sozdizimi: $1, $2, ... parametreler
// ve RETURNING) yazilir; SQLite tarafinda parametreler otomatik olarak "?"
// isaretlerine cevrilir. Model katmani (src/models/*) hangi motorun
// calistigini bilmek zorunda degildir.

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usePostgres = Boolean(env.databaseUrl);

function translateParamsForSqlite(sql) {
  // "$1, $2, ..." -> "?, ?, ..." (siralari zaten pg cagrilariyla eslesiyor)
  return sql.replace(/\$\d+/g, '?');
}

async function createPostgresAdapter() {
  const pg = (await import('pg')).default;
  const { Pool } = pg;

  const needsSsl = /sslmode=require|neon\.tech|vercel-storage\.com|supabase\.co/.test(env.databaseUrl);

  const pgPool = new Pool({
    connectionString: env.databaseUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5, // serverless ortamda dusuk tutulur
    idleTimeoutMillis: 30_000,
  });

  return {
    kind: 'postgres',
    async query(sql, params = []) {
      const res = await pgPool.query(sql, params);
      return { rows: res.rows, rowCount: res.rowCount };
    },
  };
}

async function createSqliteAdapter() {
  const { DatabaseSync } = await import('node:sqlite');

  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbFile = path.join(dataDir, 'maison-velours.sqlite');

  const sqliteDb = new DatabaseSync(dbFile);
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  sqliteDb.exec('PRAGMA foreign_keys = ON;');

  return {
    kind: 'sqlite',
    async query(sql, params = []) {
      const sqliteSql = translateParamsForSqlite(sql);
      const stmt = sqliteDb.prepare(sqliteSql);
      const isRead = /^\s*SELECT/i.test(sqliteSql) || /RETURNING/i.test(sqliteSql);
      if (isRead) {
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
      }
      const info = stmt.run(...params);
      return { rows: [], rowCount: info.changes };
    },
  };
}

let adapterPromise;
function getAdapter() {
  if (!adapterPromise) {
    adapterPromise = usePostgres ? createPostgresAdapter() : createSqliteAdapter();
  }
  return adapterPromise;
}

// Model katmani "pool.query(sql, params)" seklinde cagirir; hangi motorun
// calistigi burada gizlenir.
export const pool = {
  async query(sql, params = []) {
    const adapter = await getAdapter();
    return adapter.query(sql, params);
  },
};

export const DEFAULT_SETTINGS = {
  businessName: 'Maison Velours Nail Atelier',
  tagline: 'Her cizgide ustalik, her renkte karakter',
  heroSubtext:
    "El ve ayak bakimini sanata donusturen ozel bir atolye. Steril ortam, deneyimli ellerimiz ve size ozel tasarimlarla parmak uclariniz imzaniz olsun.",
  heroImage: '',
  address: 'Tesvikiye Cd. No:24, Nisantasi, Sisli / Istanbul',
  phone: '+90 212 555 18 24',
  whatsapp: '905325551824',
  email: 'merhaba@maisonvelours.com',
  instagram: 'https://instagram.com/maisonvelours',
  tiktok: 'https://tiktok.com/@maisonvelours',
  facebook: 'https://facebook.com/maisonveloursnails',
  hours: [
    { day: 'Pazartesi - Cuma', value: '10:00 - 20:00' },
    { day: 'Cumartesi', value: '10:00 - 19:00' },
    { day: 'Pazar', value: 'Randevu ile' },
  ],
  latitude: 41.0483,
  longitude: 28.9924,
  metaDescription:
    "Nisantasi'nda luks manikur, pedikur, kalici oje, protez tirnak ve nail art hizmetleri. Steril, davetkar ve tamamen size ozel bir atolye deneyimi.",
  metaKeywords: 'manikur, pedikur, nail art, kalici oje, protez tirnak, nisantasi nail salon',
  aboutTitle: 'Atölyemiz hakkında',
  aboutParagraph1:
    "2016'dan bu yana Nişantaşı'nda, el ve ayak bakımını gerçek bir zanaate dönüştürüyoruz. Kurucumuz Elif Yıldız'ın vizyonuyla açılan atölyemizde, her aletimiz seans arasında otoklavda sterilize edilir; kullandığımız ürünler cilt dostu ve uzun ömürlü formüllerden seçilir.",
  aboutParagraph2:
    'Altı sertifikalı uzmanımız, klasik bakımdan ileri seviye nail art\'a kadar her isteği aynı titizlikle karşılar. Amacımız hızlı değil, doğru ve kalıcı bir sonuç sunmak.',
  aboutImage: '',
  stat1Num: '9 yıl',
  stat1Label: "Nişantaşı'nda hizmet",
  stat2Num: '5.000+',
  stat2Label: 'Memnun müşteri',
  stat3Num: '6',
  stat3Label: 'Sertifikalı uzman',
  footerTagline: "Nişantaşı'nda el ve ayak bakımını sanata dönüştüren nail atölyesi.",
};

let initialized = false;

export async function initDatabase() {
  if (initialized) return;
  const adapter = await getAdapter();
  const isPg = adapter.kind === 'postgres';

  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      duration TEXT DEFAULT '',
      old_price TEXT,
      new_price TEXT NOT NULL,
      price_tag TEXT DEFAULT 'Kampanyalı fiyat',
      image TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at ${isPg ? 'TIMESTAMPTZ NOT NULL DEFAULT now()' : "TEXT DEFAULT CURRENT_TIMESTAMP"}
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      image_url TEXT NOT NULL,
      alt TEXT DEFAULT '',
      row_key TEXT NOT NULL DEFAULT 'a',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at ${isPg ? 'TIMESTAMPTZ NOT NULL DEFAULT now()' : "TEXT DEFAULT CURRENT_TIMESTAMP"}
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      review_text TEXT NOT NULL,
      tag TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at ${isPg ? 'TIMESTAMPTZ NOT NULL DEFAULT now()' : "TEXT DEFAULT CURRENT_TIMESTAMP"}
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL
    );
  `);

  await pool.query(
    isPg
      ? `CREATE TABLE IF NOT EXISTS admin_users (
           id SERIAL PRIMARY KEY,
           username TEXT UNIQUE NOT NULL,
           password_hash TEXT NOT NULL,
           totp_secret TEXT NOT NULL,
           created_at TIMESTAMPTZ NOT NULL DEFAULT now()
         );`
      : `CREATE TABLE IF NOT EXISTS admin_users (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           username TEXT UNIQUE NOT NULL,
           password_hash TEXT NOT NULL,
           totp_secret TEXT NOT NULL,
           created_at TEXT DEFAULT CURRENT_TIMESTAMP
         );`
  );

  const { rows } = await pool.query('SELECT id FROM settings WHERE id = 1');
  if (rows.length === 0) {
    await pool.query('INSERT INTO settings (id, data) VALUES (1, $1)', [
      JSON.stringify(DEFAULT_SETTINGS),
    ]);
  }

  initialized = true;
}

export async function getDbKind() {
  const adapter = await getAdapter();
  return adapter.kind;
}
