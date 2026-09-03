// scripts/seed.js
// PostgreSQL veritabanini ornek hizmet, galeri ve yorum verileriyle doldurur
// (mevcut kayitlari temizleyip yeniden ekler — idempotenttir).
// Gorseller Pexels'ten (ucretsiz stok fotograf) alinmistir.
// Calistirmak icin: npm run seed

import { initDatabase, pool } from '../src/config/database.js';
import { ServiceModel } from '../src/models/serviceModel.js';
import { GalleryModel } from '../src/models/galleryModel.js';
import { ReviewModel } from '../src/models/reviewModel.js';

const services = [
  {
    name: 'Klasik Manikür',
    description: 'Şekillendirme, kütikül bakımı ve el masajı ile tamamlanan temel bakım.',
    duration: '45 dakika',
    oldPrice: '450 ₺',
    newPrice: '320 ₺',
    priceTag: 'Kampanyalı fiyat',
    image: 'https://images.pexels.com/photos/4783335/pexels-photo-4783335.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Klasik Pedikür',
    description: 'Sert bölge bakımı, şekillendirme ve dinlendirici ayak masajı içerir.',
    duration: '55 dakika',
    oldPrice: '550 ₺',
    newPrice: '390 ₺',
    priceTag: 'Kampanyalı fiyat',
    image: 'https://images.pexels.com/photos/34930123/pexels-photo-34930123.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Kalıcı Oje — El',
    description: 'Manikür sonrası 3 haftaya kadar parlaklığını koruyan kalıcı oje uygulaması.',
    duration: '60 dakika',
    oldPrice: '650 ₺',
    newPrice: '480 ₺',
    priceTag: 'Kampanyalı fiyat',
    image: 'https://images.pexels.com/photos/6135686/pexels-photo-6135686.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Kalıcı Oje — Ayak',
    description: 'Pedikür sonrası uzun süre dayanıklı, göz alıcı bitiş.',
    duration: '65 dakika',
    oldPrice: '750 ₺',
    newPrice: '550 ₺',
    priceTag: 'Kampanyalı fiyat',
    image: 'https://images.pexels.com/photos/17056222/pexels-photo-17056222.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Protez Tırnak (Jel Uzatma)',
    description: 'Doğal görünümlü, dayanıklı uzatma ve şekillendirme, dolgu dahil.',
    duration: '90 dakika',
    oldPrice: '1.200 ₺',
    newPrice: '890 ₺',
    priceTag: 'Kampanyalı fiyat',
    image: 'https://images.pexels.com/photos/14267565/pexels-photo-14267565.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Nail Art / Özel Tasarım',
    description: 'Taş, çizim veya varak ile tırnak başına özel tasarım.',
    duration: 'Tırnak başı',
    oldPrice: '',
    newPrice: "50 ₺'den başlayan",
    priceTag: 'Tasarıma göre değişir',
    image: 'https://images.pexels.com/photos/7446915/pexels-photo-7446915.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Parafin Bakım (El veya Ayak)',
    description: 'Nemlendirici parafin banyosu ile yumuşama ve rahatlama.',
    duration: '30 dakika',
    oldPrice: '350 ₺',
    newPrice: '250 ₺',
    priceTag: 'Kampanyalı fiyat',
    image: 'https://images.pexels.com/photos/15202934/pexels-photo-15202934.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'VIP Paket — Manikür + Pedikür',
    description: 'El ve ayak bakımını tek seansta birleştiren imza paketimiz.',
    duration: '110 dakika',
    oldPrice: '1.100 ₺',
    newPrice: '790 ₺',
    priceTag: 'Kampanyalı fiyat',
    image: 'https://images.pexels.com/photos/10401643/pexels-photo-10401643.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const galleryRowA = [
  { imageUrl: 'https://images.pexels.com/photos/34835286/pexels-photo-34835286.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Pembe simli tırnak sanatı' },
  { imageUrl: 'https://images.pexels.com/photos/34835304/pexels-photo-34835304.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Leopar desenli siyah tırnak sanatı' },
  { imageUrl: 'https://images.pexels.com/photos/34871553/pexels-photo-34871553.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Kırmızı beyaz zarif manikür' },
  { imageUrl: 'https://images.pexels.com/photos/34885842/pexels-photo-34885842.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Pembe çiçek desenli manikür' },
  { imageUrl: 'https://images.pexels.com/photos/34871734/pexels-photo-34871734.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Altın yüzük ile kırmızı beyaz tırnak sanatı' },
  { imageUrl: 'https://images.pexels.com/photos/29004934/pexels-photo-29004934.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Kot kumaş üzerinde sanatsal tırnaklar' },
];

const galleryRowB = [
  { imageUrl: 'https://images.pexels.com/photos/34835305/pexels-photo-34835305.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Leopar desenli zarif manikür' },
  { imageUrl: 'https://images.pexels.com/photos/34871614/pexels-photo-34871614.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Yaratıcı kırmızı manikür tasarımı' },
  { imageUrl: 'https://images.pexels.com/photos/34871570/pexels-photo-34871570.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Kırmızı tırnak sanatı detay' },
  { imageUrl: 'https://images.pexels.com/photos/34835283/pexels-photo-34835283.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Simli pembe manikür ve gümüş yüzük' },
  { imageUrl: 'https://images.pexels.com/photos/8377206/pexels-photo-8377206.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Manikürlü iki elin yakın çekimi' },
  { imageUrl: 'https://images.pexels.com/photos/30691552/pexels-photo-30691552.jpeg?auto=compress&cs=tinysrgb&w=500', alt: 'Kırmızı manikür ve mücevherlerle şık kadın' },
];

const reviews = [
  { name: 'Ayşe K.', rating: 5, text: 'Yıllardır farklı salonlar denedim ama burada hem hijyen hem sanat bir arada. Kalıcı ojem üç haftadır kusursuz duruyor.', tag: 'Kalıcı Oje — El' },
  { name: 'Zeynep T.', rating: 5, text: "Nail art konusunda istediğim en detaylı tasarımı bile birebir çizdiler. Ellerim adeta küçük birer tablo gibi oldu.", tag: 'Nail Art / Özel Tasarım' },
  { name: 'Merve A.', rating: 4, text: 'Pedikür koltuğu o kadar rahattı ki neredeyse uyuyakaldım. Ortam, koku, müzik... her detay düşünülmüş.', tag: 'Klasik Pedikür' },
  { name: 'Selin D.', rating: 5, text: 'Kampanyalı VIP pakette hem manikür hem pedikür yaptırdım, fiyat performans gerçekten çok iyiydi.', tag: 'VIP Paket' },
  { name: 'Buse Y.', rating: 5, text: 'Protez tırnaklarım bir ayı aşkın süredir kırılmadan duruyor, ustalık gerçekten belli oluyor.', tag: 'Protez Tırnak' },
];

async function seed() {
  await initDatabase();

  await pool.query('DELETE FROM services');
  await pool.query('DELETE FROM gallery');
  await pool.query('DELETE FROM reviews');

  for (const s of services) {
    await ServiceModel.create(s);
  }

  for (const g of galleryRowA) {
    await GalleryModel.create({ ...g, row: 'a' });
  }
  for (const g of galleryRowB) {
    await GalleryModel.create({ ...g, row: 'b' });
  }

  for (const r of reviews) {
    await ReviewModel.create(r);
  }

  console.log(
    `Veritabani dolduruldu: ${services.length} hizmet, ${galleryRowA.length + galleryRowB.length} galeri gorseli, ${reviews.length} yorum.`
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed islemi basarisiz:', err);
  process.exit(1);
});
