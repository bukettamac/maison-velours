// src/models/adminUserModel.js
// Admin hesabi (kullanici adi, bcrypt sifre hash'i, TOTP gizli anahtari)
// veritabaninda tutulur. Bu sayede admin panelden sifre degistirme ve
// 2FA yeniden kurulumu mumkun olur; .env sadece altyapisal imzalama
// anahtarlarini (JWT_SECRET vb.) icerir.

import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

export const AdminUserModel = {
  async count() {
    const { rows } = await pool.query('SELECT COUNT(*) AS c FROM admin_users');
    return Number(rows[0].c);
  },

  async findByUsername(username) {
    const { rows } = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    return rows[0] || null;
  },

  async create({ username, password, totpSecret }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO admin_users (username, password_hash, totp_secret) VALUES ($1, $2, $3) RETURNING *`,
      [username, passwordHash, totpSecret]
    );
    return rows[0];
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  },

  async updatePassword(username, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE admin_users SET password_hash = $1 WHERE username = $2', [
      passwordHash,
      username,
    ]);
  },

  async updateTotpSecret(username, totpSecret) {
    await pool.query('UPDATE admin_users SET totp_secret = $1 WHERE username = $2', [
      totpSecret,
      username,
    ]);
  },
};
