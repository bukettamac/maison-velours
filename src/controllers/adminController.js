// src/controllers/adminController.js
// Admin panelinin veriye erisen tum uclarini barindirir. Tumu requireSession
// middleware'i arkasinda calisir (bkz. routes/adminRoutes.js).

import { ServiceModel } from '../models/serviceModel.js';
import { GalleryModel } from '../models/galleryModel.js';
import { ReviewModel } from '../models/reviewModel.js';
import { SettingsModel } from '../models/settingsModel.js';

export async function renderDashboard(req, res) {
  const [services, gallery, reviews, settings] = await Promise.all([
    ServiceModel.all(),
    GalleryModel.all(),
    ReviewModel.all(),
    SettingsModel.get(),
  ]);
  res.render('admin/dashboard', {
    admin: req.admin,
    services,
    gallery,
    reviews,
    settings,
  });
}

// ---- Hizmetler ----
export async function createService(req, res) {
  const record = await ServiceModel.create(req.body);
  res.json(record);
}
export async function updateService(req, res) {
  const record = await ServiceModel.update(req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Hizmet bulunamadi.' });
  res.json(record);
}
export async function deleteService(req, res) {
  const ok = await ServiceModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Hizmet bulunamadi.' });
  res.json({ success: true });
}

// ---- Galeri ----
export async function createGalleryImage(req, res) {
  const record = await GalleryModel.create(req.body);
  res.json(record);
}
export async function updateGalleryImage(req, res) {
  const record = await GalleryModel.update(req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Gorsel bulunamadi.' });
  res.json(record);
}
export async function deleteGalleryImage(req, res) {
  const ok = await GalleryModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Gorsel bulunamadi.' });
  res.json({ success: true });
}

// ---- Yorumlar ----
export async function createReview(req, res) {
  const record = await ReviewModel.create(req.body);
  res.json(record);
}
export async function updateReview(req, res) {
  const record = await ReviewModel.update(req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Yorum bulunamadi.' });
  res.json(record);
}
export async function deleteReview(req, res) {
  const ok = await ReviewModel.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Yorum bulunamadi.' });
  res.json({ success: true });
}

// ---- Ayarlar ----
export async function updateSettings(req, res) {
  const record = await SettingsModel.update(req.body);
  res.json(record);
}
