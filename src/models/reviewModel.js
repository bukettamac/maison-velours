// src/models/reviewModel.js
import { nanoid } from 'nanoid';
import { pool } from '../config/database.js';

function mapRow(r) {
  return {
    id: r.id,
    name: r.name,
    rating: r.rating,
    text: r.review_text,
    tag: r.tag,
    order: r.sort_order,
    createdAt: r.created_at,
  };
}

export const ReviewModel = {
  async all() {
    const { rows } = await pool.query('SELECT * FROM reviews ORDER BY sort_order ASC, created_at ASC');
    return rows.map(mapRow);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(payload) {
    const id = nanoid(10);
    const rating = Math.min(5, Math.max(1, Number(payload.rating) || 5));
    const { rows } = await pool.query(
      `INSERT INTO reviews (id, name, rating, review_text, tag, sort_order)
       VALUES ($1, $2, $3, $4, $5,
         (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM reviews))
       RETURNING *`,
      [id, payload.name, rating, payload.text, payload.tag || '']
    );
    return mapRow(rows[0]);
  },

  async update(id, payload) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const merged = { ...existing, ...payload };
    const rating = Math.min(5, Math.max(1, Number(merged.rating) || 5));
    const { rows } = await pool.query(
      `UPDATE reviews SET name = $1, rating = $2, review_text = $3, tag = $4 WHERE id = $5 RETURNING *`,
      [merged.name, rating, merged.text, merged.tag, id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async remove(id) {
    const { rowCount } = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async aggregate() {
    const { rows } = await pool.query('SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews');
    const avg = rows[0]?.avg;
    const count = Number(rows[0]?.count || 0);
    if (!count) return { ratingValue: '5.0', reviewCount: 0 };
    return { ratingValue: Number(avg).toFixed(1), reviewCount: count };
  },
};
