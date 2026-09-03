// public/js/admin.js
// Yonetim panelinin istemci tarafi mantigi. Tum istekler /admin/api/*
// ucuna gider; bu uclar sunucuda requireSession middleware'i ile korunur
// (gecerli, 2FA tamamlanmis oturum cookie'si zorunlu).

// ---------- Sekme gecisi ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ---------- Genel yardimcilar ----------
async function apiCall(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Islem basarisiz.');
  return json;
}

async function deleteItem(kind, id) {
  if (!confirm('Silmek istediginize emin misiniz?')) return;
  try {
    await apiCall(`/admin/api/${kind}/${id}`, 'DELETE');
    document.querySelector(`tr[data-id="${id}"]`)?.remove();
  } catch (err) {
    alert(err.message);
  }
}

const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalForm = document.getElementById('modalForm');

function closeModal() {
  modalBackdrop.classList.remove('open');
  modalForm.innerHTML = '';
}
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});

function fieldRow(label, name, value = '', type = 'text', required = true) {
  const isArea = type === 'textarea';
  return `<label>${label}
    ${isArea
      ? `<textarea name="${name}" ${required ? 'required' : ''}>${value ?? ''}</textarea>`
      : `<input type="${type}" name="${name}" value="${(value ?? '').toString().replace(/"/g, '&quot;')}" ${required ? 'required' : ''}>`}
  </label>`;
}

function openModal(title, fieldsHtml, onSubmit) {
  modalTitle.textContent = title;
  modalForm.innerHTML =
    fieldsHtml +
    `<div class="modal-actions">
      <button type="button" class="cancel" id="modalCancel">Vazgeç</button>
      <button type="submit" class="save">Kaydet</button>
    </div>`;
  modalBackdrop.classList.add('open');
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  modalForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(modalForm));
    try {
      await onSubmit(data);
      closeModal();
      location.reload();
    } catch (err) {
      alert(err.message);
    }
  };
}

// ---------- Hizmetler ----------
function openServiceForm(service) {
  const isEdit = !!service;
  const html = [
    fieldRow('Hizmet adı', 'name', service?.name),
    fieldRow('Açıklama', 'description', service?.description, 'textarea', false),
    fieldRow('Süre (örn: 45 dakika)', 'duration', service?.duration, 'text', false),
    fieldRow('Eski fiyat (örn: 450 ₺)', 'oldPrice', service?.oldPrice, 'text', false),
    fieldRow('Kampanya fiyatı (örn: 320 ₺)', 'newPrice', service?.newPrice),
    fieldRow('Fiyat etiketi', 'priceTag', service?.priceTag || 'Kampanyalı fiyat', 'text', false),
    fieldRow('Görsel URL (pexels vb.)', 'image', service?.image),
  ].join('');

  openModal(isEdit ? 'Hizmeti Düzenle' : 'Yeni Hizmet', html, async (data) => {
    if (isEdit) return apiCall(`/admin/api/services/${service.id}`, 'PUT', data);
    return apiCall('/admin/api/services', 'POST', data);
  });
}

// ---------- Galeri ----------
function openGalleryForm(image) {
  const isEdit = !!image;
  const html =
    fieldRow('Görsel URL (pexels vb.)', 'imageUrl', image?.imageUrl) +
    fieldRow('Alt metin (SEO)', 'alt', image?.alt, 'text', false) +
    `<label>Satır
      <select name="row">
        <option value="a" ${image?.row !== 'b' ? 'selected' : ''}>A — sola akan</option>
        <option value="b" ${image?.row === 'b' ? 'selected' : ''}>B — sağa akan</option>
      </select>
    </label>`;

  openModal(isEdit ? 'Görseli Düzenle' : 'Yeni Galeri Görseli', html, async (data) => {
    if (isEdit) return apiCall(`/admin/api/gallery/${image.id}`, 'PUT', data);
    return apiCall('/admin/api/gallery', 'POST', data);
  });
}

// ---------- Yorumlar ----------
function openReviewForm(review) {
  const isEdit = !!review;
  const html = [
    fieldRow('Müşteri adı', 'name', review?.name),
    `<label>Puan (1-5)
      <select name="rating">
        ${[5, 4, 3, 2, 1].map((n) => `<option value="${n}" ${review?.rating === n ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
    </label>`,
    fieldRow('Yorum metni', 'text', review?.text, 'textarea'),
    fieldRow('Etiket (örn: Klasik Pedikür)', 'tag', review?.tag, 'text', false),
  ].join('');

  openModal(isEdit ? 'Yorumu Düzenle' : 'Yeni Yorum', html, async (data) => {
    if (isEdit) return apiCall(`/admin/api/reviews/${review.id}`, 'PUT', data);
    return apiCall('/admin/api/reviews', 'POST', data);
  });
}

// ---------- Ayarlar ----------
const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(settingsForm));
    data.hours = collectHours();
    const msg = document.getElementById('settingsMsg');
    try {
      await apiCall('/admin/api/settings', 'PUT', data);
      msg.style.color = '#2e7d4f';
      msg.textContent = 'Kaydedildi.';
      setTimeout(() => (msg.textContent = ''), 2500);
    } catch (err) {
      msg.style.color = '#B23A48';
      msg.textContent = err.message;
    }
  });
}

// ---------- Çalışma saatleri (dinamik satırlar) ----------
const hoursEditor = document.getElementById('hoursEditor');

function addHourRow(day = '', value = '') {
  const row = document.createElement('div');
  row.className = 'hour-row';
  row.innerHTML = `
    <input type="text" placeholder="Gün (örn: Pazartesi - Cuma)" value="${(day || '').replace(/"/g, '&quot;')}" class="hour-day">
    <input type="text" placeholder="Saat (örn: 10:00 - 20:00)" value="${(value || '').replace(/"/g, '&quot;')}" class="hour-value">
    <button type="button" class="hour-remove" title="Satırı sil">✕</button>
  `;
  row.querySelector('.hour-remove').addEventListener('click', () => row.remove());
  hoursEditor.appendChild(row);
}

function collectHours() {
  return Array.from(hoursEditor.querySelectorAll('.hour-row')).map((row) => ({
    day: row.querySelector('.hour-day').value,
    value: row.querySelector('.hour-value').value,
  }));
}

if (hoursEditor) {
  (window.__INITIAL_HOURS__ || []).forEach((h) => addHourRow(h.day, h.value));
  document.getElementById('addHourRow')?.addEventListener('click', () => addHourRow());
}

// ---------- Hesabım: şifre değiştir ----------
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(passwordForm));
    const msg = document.getElementById('passwordMsg');
    try {
      await apiCall('/admin/api/account/change-password', 'POST', data);
      msg.style.color = '#2e7d4f';
      msg.textContent = 'Şifreniz güncellendi.';
      passwordForm.reset();
    } catch (err) {
      msg.style.color = '#B23A48';
      msg.textContent = err.message;
    }
  });
}

// ---------- Hesabım: 2FA yenile ----------
const reset2faBackdrop = document.getElementById('reset2faBackdrop');
const reset2faStep1 = document.getElementById('reset2faStep1');
const reset2faStep2 = document.getElementById('reset2faStep2');

function closeReset2fa() {
  reset2faBackdrop.classList.remove('open');
  reset2faStep1.style.display = 'block';
  reset2faStep2.style.display = 'none';
  document.getElementById('reset2faPasswordForm').reset();
  document.getElementById('reset2faCodeForm').reset();
  document.getElementById('reset2faError1').textContent = '';
  document.getElementById('reset2faError2').textContent = '';
}

document.getElementById('start2faReset')?.addEventListener('click', () => {
  reset2faBackdrop.classList.add('open');
});
document.getElementById('reset2faCancel1')?.addEventListener('click', closeReset2fa);
document.getElementById('reset2faCancel2')?.addEventListener('click', closeReset2fa);
reset2faBackdrop?.addEventListener('click', (e) => {
  if (e.target === reset2faBackdrop) closeReset2fa();
});

document.getElementById('reset2faPasswordForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const errEl = document.getElementById('reset2faError1');
  try {
    const json = await apiCall('/admin/api/account/reset-2fa/start', 'POST', data);
    document.getElementById('reset2faQr').src = json.qrDataUrl;
    reset2faStep1.style.display = 'none';
    reset2faStep2.style.display = 'block';
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById('reset2faCodeForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const errEl = document.getElementById('reset2faError2');
  try {
    await apiCall('/admin/api/account/reset-2fa/confirm', 'POST', data);
    closeReset2fa();
    alert('2FA başarıyla yenilendi.');
  } catch (err) {
    errEl.textContent = err.message;
  }
});
