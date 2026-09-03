// src/server.js
import { createApp } from './app.js';
import { initDatabase } from './config/database.js';
import { env } from './config/env.js';

async function main() {
  await initDatabase();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`\n  Maison Velours calisiyor -> http://localhost:${env.port}`);
    console.log(`  Admin panel           -> http://localhost:${env.port}/admin/login\n`);
  });
}

main().catch((err) => {
  console.error('Sunucu baslatilamadi:', err);
  process.exit(1);
});
