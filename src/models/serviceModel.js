// src/models/serviceModel.js
import { nanoid } from 'nanoid';
import { pool } from '../config/database.js';

function mapRow(r) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    duration: r.duration,
    oldPrice: r.old_price,
    newPrice: r.new_price,
    priceTag: r.price_tag,
    image: r.image,
    order: r.sort_order,
    createdAt: r.created_at,
  };
}

export const ServiceModel = {
  async all() {
    const { rows } = await pool.query('SELECT * FROM services ORDER BY sort_order ASC, created_at ASC');
    return rows.map(mapRow);
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(payload) {
    const id = nanoid(10);
    const { rows } = await pool.query(
      `INSERT INTO services (id, name, description, duration, old_price, new_price, price_tag, image, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
         (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM services))
       RETURNING *`,
      [
        id,
        payload.name,
        payload.description || '',
        payload.duration || '',
        payload.oldPrice || null,
        payload.newPrice,
        payload.priceTag || 'Kampanyalı fiyat',
        payload.image || '',
      ]
    );
    return mapRow(rows[0]);
  },

  async update(id, payload) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const merged = { ...existing, ...payload };
    const { rows } = await pool.query(
      `UPDATE services
       SET name = $1, description = $2, duration = $3, old_price = $4,
           new_price = $5, price_tag = $6, image = $7
       WHERE id = $8
       RETURNING *`,
      [
        merged.name,
        merged.description,
        merged.duration,
        merged.oldPrice,
        merged.newPrice,
        merged.priceTag,
        merged.image,
        id,
      ]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async remove(id) {
    const { rowCount } = await pool.query('DELETE FROM services WHERE id = $1', [id]);
    return rowCount > 0;
  },
};
