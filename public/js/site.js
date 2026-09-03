// public/js/site.js
// Sadece mobil menu ac/kapa davranisini yonetir. Sayfa icerigi sunucu
// tarafinda (EJS + veritabani) render edildigi icin ekstra veri cekme
// islemine gerek yoktur; bu da ilk yuklemede daha iyi SEO/performans saglar.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const navlinks = document.getElementById('navlinks');
  if (!toggle || !navlinks) return;

  toggle.addEventListener('click', () => navlinks.classList.toggle('open'));
  navlinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => navlinks.classList.remove('open'))
  );
});
