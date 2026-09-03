// src/controllers/publicController.js
// Ziyaretcilerin gordugu ana sayfayi render eder (SEO meta + JSON-LD ile)
// ve on yuzun dinamik olarak veri cekmesi icin salt-okunur (read-only)
// bir JSON API sunar. Bu uclarda ASLA gizli veri (sifre hash'i, TOTP
// secret, JWT anahtarlari, .env icerigi) donulmez.

import { env } from '../config/env.js';
import { ServiceModel } from '../models/serviceModel.js';
import { GalleryModel } from '../models/galleryModel.js';
import { ReviewModel } from '../models/reviewModel.js';
import { SettingsModel } from '../models/settingsModel.js';
import { buildLocalBusinessSchema } from '../utils/schema.js';

async function loadPublicData() {
  const [services, gallery, reviews, settings, aggregate] = await Promise.all([
    ServiceModel.all(),
    GalleryModel.all(),
    ReviewModel.all(),
    SettingsModel.get(),
    ReviewModel.aggregate(),
  ]);
  return { services, gallery, reviews, settings, aggregate };
}

export async function renderHome(req, res) {
  const { services, gallery, reviews, settings, aggregate } = await loadPublicData();
  const url = env.appUrl;

  const schemaJson = buildLocalBusinessSchema({ settings, services, reviews, aggregate, url });

  res.render('index', {
    siteName: env.siteName,
    url,
    settings,
    services,
    gallery: {
      rowA: gallery.filter((g) => g.row !== 'b'),
      rowB: gallery.filter((g) => g.row === 'b'),
    },
    reviews,
    aggregate,
    schemaJson,
  });
}

export async function getPublicData(req, res) {
  const data = await loadPublicData();
  res.set('Cache-Control', 'public, max-age=60');
  res.json(data);
}
