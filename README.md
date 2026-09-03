# Maison Velours — Nail Atelier

Veritabanı destekli, iki aşamalı doğrulamalı (2FA) admin panele sahip, SEO uyumlu luks nail salon web sitesi.

## Öne çıkanlar

- **Veritabanı projenin İÇİNDE gelir**: Ekstra kurulum, hesap açma veya bağlantı dizesi girmeden `npm install && npm start` ile çalışır. Node.js'in kendi dahili `node:sqlite` motoruyla, proje klasöründeki `data/maison-velours.sqlite` dosyasına yazan **gerçek, embedded bir veritabanı** kullanılır — native derleme veya harici bir veritabanı sunucusu gerekmez. Paket, örnek hizmet/galeri/yorum verileriyle **önceden doldurulmuş** bu dosyayla birlikte gelir.
- **İsteğe bağlı PostgreSQL desteği**: `DATABASE_URL` ortam değişkenini tanımlarsanız (Vercel Postgres / Neon / Supabase), uygulama otomatik olarak PostgreSQL'e geçer — bu, Vercel gibi serverless ortamlarda kalıcı veri için önerilir (çünkü serverless dosya sistemi kalıcı değildir, gömülü SQLite yazmaları orada kaybolur). Kod tabanı aynı SQL ile her iki motoru da destekler.
- **Admin panelinden gerçekten her şey yönetilir**: hizmetler, galeri, yorumlar, hero/Hakkımızda metinleri ve görselleri, çalışma saatleri, footer metni, SEO alanları — hepsi panelden düzenlenir. Ayrıca admin **kendi şifresini değiştirebilir** ve **2FA'sını yeniden kurabilir**, hiçbir CLI komutuna gerek kalmadan.
- **CLI'siz ilk kurulum**: İlk admin hesabı `/admin/setup` sayfasından, tarayıcı üzerinden (kullanıcı adı/şifre + QR kod ile 2FA) oluşturulur. (Güvenlik nedeniyle pakete dahil edilen veritabanında hazır bir admin hesabı YOKTUR — bunu ilk siz oluşturursunuz.) Vercel Postgres, Neon, Supabase gibi herhangi bir standart Postgres sağlayıcısıyla çalışır.
- **Vercel'e hazır**: `vercel.json` + `api/index.js` ile proje tek komutla Vercel'e deploy edilebilir (serverless function olarak).
- **İki aşamalı doğrulamalı admin paneli**: Adım 1 kullanıcı adı + şifre, Adım 2 Google Authenticator uyumlu TOTP kodu.
- **Gizli veriler sayfa kaynağında görünmez**: Veritabanı bağlantı dizesi, şifre hash'i, TOTP anahtarı, JWT imza anahtarları yalnızca `.env` / Vercel Environment Variables içinde ve sunucu belleğinde tutulur; istemciye hiçbir zaman gönderilmez.
- **SEO uyumlu**: Meta etiketleri, Open Graph, canonical link, `robots.txt`, `sitemap.xml` ve `schema.org` (`BeautySalon`) JSON-LD yapılandırılmış verisi — hizmetler ve yorumlar otomatik olarak şemaya yansır.
- **Profesyonel klasör yapısı**: `src/` altında config / models / controllers / routes / middleware / utils ayrımı (MVC benzeri repository deseni).
- **Google Harita** iletişim bölümünde, API anahtarı gerektirmeyen `embed` modu ile gömülüdür.
- **Kaydırmalı, otomatik akan** salon yorumları ve tırnak galerisi (iki satır, zıt yönlerde döngüsel akış).

## Klasör yapısı

```
maison-velours/
├── api/
│   └── index.js          Vercel serverless giriş noktası (Express app'i sarar)
├── src/
│   ├── config/           env okuma + veritabanı katmanı (gömülü SQLite / opsiyonel PostgreSQL)
│   ├── models/            Service, Gallery, Review, Settings, AdminUser (SQL sorguları)
│   ├── controllers/        auth / setup / account / admin / public iş mantığı
│   ├── routes/              Express route tanımları
│   ├── middleware/          oturum koruması, hız sınırlama
│   ├── utils/                JWT, TOTP, schema.org üretici
│   ├── app.js                 Express uygulama kurulumu
│   └── server.js               yerel geliştirme giriş noktası (node src/server.js)
├── views/                 EJS şablonları (public site + admin paneli)
├── public/                 statik CSS/JS + robots.txt + sitemap.xml
├── scripts/                seed.js (örnek verilerle doldurma)
├── data/
│   └── maison-velours.sqlite   ← GERÇEK, ÖNCEDEN DOLDURULMUŞ veritabanı dosyası (pakette dahil)
├── vercel.json              Vercel rewrite + fonksiyon yapılandırması
└── .env.example              örnek ortam değişkenleri
```

## Kurulum (yerel geliştirme)

```bash
npm install
cp .env.example .env
npm start
```

Bu kadar. Veritabanı zaten `data/maison-velours.sqlite` olarak pakette gelir ve örnek içerikle doludur — hiçbir ek servis, hesap veya bağlantı dizesi girmenize gerek yoktur.

`.env` içindeki `JWT_SECRET`, `JWT_2FA_PENDING_SECRET`, `COOKIE_SECRET` alanlarını rastgele değerlerle doldurmanız önerilir (boş bırakılırsa geliştirme için varsayılan değerler kullanılır, ancak üretimde mutlaka değiştirin):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Veritabanını sıfırlayıp örnek verilerle yeniden doldurmak isterseniz:

```bash
npm run seed
```

### İlk admin hesabınızı tarayıcıdan oluşturun

Pakette gelen veritabanında güvenlik nedeniyle hazır bir admin hesabı YOKTUR. `http://localhost:3000/admin/login` adresine gittiğinizde otomatik olarak **`/admin/setup`** sayfasına yönlendirilirsiniz:

1. Kullanıcı adı ve şifre belirleyin.
2. Ekrana gelen QR kodu Google Authenticator / Authy ile tarayın.
3. Uygulamadaki 6 haneli kodu girip hesabınızı etkinleştirin.

Bundan sonra `/admin/setup` kilitlenir; normal girişleriniz `/admin/login` üzerinden, iki aşamalı doğrulamayla devam eder.

- Site: http://localhost:3000
- Admin girişi: http://localhost:3000/admin/login

## Vercel'e Deploy

**Önemli:** Vercel serverless fonksiyonlarının dosya sistemi kalıcı değildir — pakete gömülü SQLite veritabanı yerelde/kendi sunucunuzda mükemmel çalışır, ancak Vercel'de admin panelden eklediğiniz veriler her soğuk başlatmada kaybolabilir. **Vercel'de kalıcı veri için mutlaka bir `DATABASE_URL` (PostgreSQL) tanımlayın** — uygulama bunu algılayıp otomatik olarak PostgreSQL'e geçer.

1. Bu klasörü bir GitHub reposuna yükleyin (veya `vercel` CLI ile doğrudan deploy edin).
2. [vercel.com](https://vercel.com) üzerinden **New Project** ile repoyu içe aktarın. `vercel.json` sayesinde ek yapılandırma gerekmez.
3. Proje ayarlarında **Environment Variables** kısmına ekleyin: `DATABASE_URL` (zorunlu — yukarıdaki uyarıya bakın), `JWT_SECRET`, `JWT_2FA_PENDING_SECRET`, `COOKIE_SECRET`, `APP_URL` (deploy sonrası verilen `https://...vercel.app` adresi), `SITE_NAME`, `NODE_ENV=production`.
   - Veritabanı için Vercel'in kendi **Storage → Postgres** eklentisini de kullanabilirsiniz; oluşturduğunuzda `DATABASE_URL` otomatik olarak projeye eklenir.
4. **Deploy**'a tıklayın. İlk isteğe gelen serverless function, tabloları otomatik oluşturur (`initDatabase`).
5. `https://sizin-domaininiz.vercel.app/admin/login` adresine gidin — hiç admin hesabı olmadığı için otomatik olarak **`/admin/setup`**'a yönlendirilirsiniz. Kullanıcı adı/şifre belirleyip QR kod ile 2FA'yı kurarak ilk hesabınızı canlı ortamda oluşturun.
6. (İsteğe bağlı) Örnek içerikle başlamak isterseniz `DATABASE_URL`'i yerel `.env`'inize alıp `npm run seed` çalıştırabilir, ya da doğrudan admin panelden kendi içeriğinizi girebilirsiniz.

**Not:** `express-rate-limit` varsayılan olarak bellek-içi (in-memory) çalışır; Vercel'in serverless yapısında her fonksiyon örneği kendi sayacını tutar. Üretimde daha sıkı bir hız sınırlama isterseniz Upstash Redis tabanlı bir rate-limit store eklemeniz önerilir.

## Panelden yönetilebilenler

| Sekme | İçerik |
|---|---|
| Hizmetler | Ad, açıklama, süre, eski/kampanyalı fiyat, görsel — ekle/düzenle/sil |
| Galeri | Döngülü galerinin her iki satırındaki görseller — ekle/düzenle/sil |
| Yorumlar | Salon yorumları (isim, puan, metin, etiket) — ekle/düzenle/sil |
| Ayarlar | İşletme adı, hero başlığı/alt metni/görseli, Hakkımızda başlığı + iki paragrafı + görseli + 3 istatistik, adres/telefon/e-posta/sosyal medya, harita için enlem-boylam, çalışma saatleri (satır ekle/sil), footer metni, SEO meta açıklama/anahtar kelimeler |
| Hesabım | Şifre değiştirme, iki aşamalı doğrulamayı (2FA) sıfırdan yeniden kurma |

Ana sayfadaki hiçbir metin veya görsel artık koda gömülü değildir; hepsi veritabanından, admin panel aracılığıyla düzenlenir.

## Güvenlik notları

- `.env` dosyası `.gitignore` içindedir, asla repoya eklenmez ve yalnızca **altyapısal** imzalama anahtarlarını (`JWT_SECRET`, `JWT_2FA_PENDING_SECRET`, `COOKIE_SECRET`) ile `DATABASE_URL`'i içerir.
- Admin **kullanıcı adı, şifre hash'i ve TOTP anahtarı** veritabanındadır (`admin_users` tablosu) — bu sayede panelden değiştirilebilir. Şifre değiştirme ve 2FA yenileme uçları, oturum çalınsa bile hesabın devralınamaması için mevcut şifrenin tekrar girilmesini zorunlu kılar.
- Tüm admin API uçları (`/admin/api/*`) oturum middleware'i arkasındadır ve yalnızca 2FA tamamlanmış geçerli bir cookie ile erişilebilir.
- `/admin/setup` yalnızca veritabanında hiç admin hesabı yokken erişilebilir; ilk hesap oluşturulduktan sonra otomatik olarak kilitlenir.
- Giriş, 2FA doğrulama ve kurulum uçlarında `express-rate-limit` ile kaba kuvvet koruması vardır.
- `helmet` ile güvenlik başlıkları (CSP dahil) aktif edilmiştir.
- Üretimde mutlaka `NODE_ENV=production` ve HTTPS arkasında çalıştırın (cookie'ler `secure` bayrağıyla işaretlenir; Vercel bunu otomatik sağlar).
