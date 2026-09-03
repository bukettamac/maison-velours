// src/models/galleryModel.js
import { nanoid } from 'nanoid';
import { pool } from '../config/database.js';

function mapRow(r) {
  return {
    id: r.id,
    imageUrl: r.image_url,
    alt: r.alt,
    row: r.row_key,
    order: r.sort_order,
    createdAt: r.created_at,
  };
}

export const GalleryModel = {
  async all() {
    const { rows } = await pool.query('SELECT * FROM gallery ORDER BY row_key ASC, sort_order ASC');
    return rows.map(mapRow);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM gallery WHERE id = $1', [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(payload) {
    const id = nanoid(10);
    const row = payload.row === 'b' ? 'b' : 'a';
    const { rows } = await pool.query(
      `INSERT INTO gallery (id, image_url, alt, row_key, sort_order)
       VALUES ($1, $2, $3, $4,
         (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM gallery WHERE row_key = $5))
       RETURNING *`,
      [id, payload.imageUrl, payload.alt || '', row, row]
    );
    return mapRow(rows[0]);
  },

  async update(id, payload) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const merged = { ...existing, ...payload };
    const row = merged.row === 'b' ? 'b' : 'a';
    const { rows } = await pool.query(
      `UPDATE gallery SET image_url = $1, alt = $2, row_key = $3 WHERE id = $4 RETURNING *`,
      [merged.imageUrl, merged.alt, row, id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async remove(id) {
    const { rowCount } = await pool.query('DELETE FROM gallery WHERE id = $1', [id]);
    return rowCount > 0;
  },
};
