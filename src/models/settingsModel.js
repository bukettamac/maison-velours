// src/models/settingsModel.js
// Ayarlar tek satirlik bir JSON metni olarak saklanir (data TEXT sutunu).
// Bu, hem PostgreSQL hem de gomulu SQLite motoruyla ayni kod ile calisir.

import { pool, DEFAULT_SETTINGS } from '../config/database.js';

export const SettingsModel = {
  async get() {
    const { rows } = await pool.query('SELECT data FROM settings WHERE id = 1');
    if (!rows[0]) return DEFAULT_SETTINGS;
    const stored = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    return { ...DEFAULT_SETTINGS, ...stored };
  },

  async update(payload) {
    const current = await this.get();
    const merged = { ...current, ...payload };
    await pool.query(
      `INSERT INTO settings (id, data) VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET data = excluded.data`,
      [JSON.stringify(merged)]
    );
    return merged;
  },
};
