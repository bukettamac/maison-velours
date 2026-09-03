// src/app.js
// Express uygulama yapilandirmasi: guvenlik basliklari, cookie/JSON parse,
// view engine (EJS) ve tum rotalarin baglanmasi.

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from './config/env.js';
import viewRoutes from './routes/viewRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.disable('x-powered-by'); // sunucu/teknoloji bilgisini sizdirma

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'https://images.pexels.com', 'data:'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
          connectSrc: ["'self'"],
        },
      },
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.cookieSecret));

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));

  app.use(
    express.static(path.join(__dirname, '../public'), {
      setHeaders(res, filePath) {
        // .env, veritabani ve kaynak kod asla static olarak servis edilmez;
        // sadece public/ klasoru disari acik (bkz. asagidaki yol kisitlamasi).
        if (filePath.endsWith('.env') || filePath.endsWith('.json')) {
          res.setHeader('Cache-Control', 'no-store');
        }
      },
    })
  );

  app.use('/', viewRoutes);
  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes);
  app.use('/admin', adminRoutes);

  app.use((req, res) => {
    res.status(404).render('404', { url: req.originalUrl });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[error]', err);
    res.status(500).send('Sunucu hatasi olustu.');
  });

  return app;
}
