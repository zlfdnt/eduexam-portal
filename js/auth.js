// Halaman masuk: siswa (PIN 6 digit) dan guru/admin (username + sandi). Mendukung mode pratinjau (tanpa server).
const Auth = (() => {
  async function render(root, mode = 'siswa', opts = {}) {
    const pv = !!opts.preview, sb = Api.sandbox();
    const boot = pv ? { nama: opts.nama } : await Api.call('public.boot').then(r => r.data).catch(() => ({}));
    if (pv) Exam.pvOn();
    root.innerHTML = `${pv ? Exam.pvBar(false) : ''}<div class="auth"><div class="auth-card">
      <div class="lg">${ic('grad', 34)}</div><h1 style="font-size:30px;font-weight:800">EduExam Portal</h1><p class="mute" style="margin:4px 0 0">${esc(boot.nama || 'Portal Asesmen & Ujian Daring Sekolah')}</p>
      ${pv ? '<div style="height:18px"></div>' : `<div class="seg" role="tablist"><button data-m="siswa" class="${mode === 'siswa' ? 'on' : ''}">Siswa (Masuk PIN)</button><button data-m="staff" class="${mode === 'staff' ? 'on' : ''}">Guru &amp; Admin</button></div>`}
      <div id="af"></div>
      <div class="row" style="justify-content:center;margin-top:18px;font-size:12px;color:var(--mute)"><span>${ic('shield', 14)} Anti-Cheat Safe Exam</span><span>•</span><span>Autosave Aktif</span></div>
      ${pv ? '<div class="note warn" style="margin-top:14px;text-align:left">Pratinjau tampilan siswa: PIN 6 digit apa pun diterima. Tidak ada data yang dikirim atau disimpan.</div>'
        : `<p style="margin:14px 0 0"><a href="#/">← Kembali ke beranda</a>${sb ? '' : ' · <a href="#/pratinjau">Coba pratinjau tanpa login</a>'}</p>${Api.demo() ? '<div class="note warn" style="margin-top:14px;text-align:left">MODE PRATINJAU — data contoh. ' + (sb ? 'Kolom sudah terisi, cukup tekan tombol masuk.' : 'Siswa: PIN 123456 · Guru: demo/demo · Admin: admin/admin') + '</div>' : ''}`}</div></div>`;
    $$('.seg button', root).forEach(b => b.onclick = () => { location.hash = b.dataset.m === 'siswa' ? '#/masuk' : '#/masuk/staff'; });
    if (pv) $('#pvx', root).onclick = opts.onExit;
    mode === 'siswa' ? siswa($('#af', root), pv ? opts.onPin : null, pv || sb) : staff($('#af', root));
  }
  function siswa(el, onPin, prefill) {
    el.innerHTML = `<div class="b" style="text-align:left;margin-top:4px">Masukkan 6 Digit PIN Ujian</div><div class="pins" id="pins">${[0, 1, 2, 3, 4, 5].map(i => `<input inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit ${i + 1}">`).join('')}</div>
      <div class="note">${ic('shield', 16)}<span>PIN unik diberikan oleh guru pengawas sebelum ujian dimulai.</span></div><div id="aerr"></div>
      <button class="btn btn-p btn-lg btn-cta" id="go" style="width:100%;margin-top:6px">Masuk ke Ruang Ujian ${ic('arrow', 18)}</button>`;
    const ins = $$('#pins input', el); ins[0].focus();
    if (prefill) [...'123456'].forEach((c, i) => ins[i].value = c); // pratinjau: PIN contoh sudah terisi
    ins.forEach((inp, i) => {
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && ins[i + 1]) ins[i + 1].focus(); if (ins.every(x => x.value)) go(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) { ins[i - 1].focus(); ins[i - 1].value = ''; } if (e.key === 'Enter') go(); });
      inp.addEventListener('paste', e => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!t) return; e.preventDefault(); [...t].forEach((c, k) => ins[k].value = c); ins[Math.min(5, t.length)].focus(); if (t.length === 6) go(); });
    });
    let busyNow = false;
    async function go() {
      if (busyNow) return; const pin = ins.map(x => x.value).join(''); if (pin.length !== 6) { $('#aerr', el).innerHTML = '<div class="note warn">Lengkapi 6 digit PIN.</div>'; return; }
      if (onPin) return onPin(pin);
      busyNow = true; const b = $('#go', el); b.disabled = true;
      try { const r = await Api.call('auth.siswa', { pin, dev: Api.dev }); Api.setSession(r.data.token, r.data.me); location.hash = '#/siswa'; }
      catch (e) { $('#aerr', el).innerHTML = `<div class="note ${e.code === 'LOCKED' ? 'bad' : 'warn'}">${ic('lock', 16)}<span>${esc(e.message)}</span></div>`; ins.forEach(x => x.value = ''); ins[0].focus(); }
      finally { busyNow = false; b.disabled = false; }
    }
    $('#go', el).onclick = go;
  }
  function staff(el) {
    const adm = Api.sandbox() && Api.sbRole() === 'admin', pre = Api.sandbox() ? (adm ? ['admin', 'admin'] : ['demo', 'demo']) : ['', ''];
    el.innerHTML = `<form id="sf" style="text-align:left" autocomplete="off"><label class="f">Username</label><input class="in" id="su" autocomplete="username" required value="${pre[0]}"><label class="f">Kata sandi</label><input class="in" id="sp" type="password" autocomplete="current-password" required value="${pre[1]}"><div id="aerr"></div><button class="btn btn-p btn-lg btn-cta" style="width:100%;margin-top:18px">Masuk ${ic('arrow', 18)}</button></form>`;
    $('#su', el).focus();
    $('#sf', el).onsubmit = async e => {
      e.preventDefault(); const b = e.submitter; b.disabled = true;
      try { const r = await Api.call('auth.staff', { username: $('#su', el).value, password: $('#sp', el).value }); Api.setSession(r.data.token, r.data.me); location.hash = '#/staff/dashboard'; }
      catch (er) { $('#aerr', el).innerHTML = `<div class="note bad">${esc(er.message)}</div>`; $('#sp', el).value = ''; }
      finally { b.disabled = false; }
    };
  }
  return { render };
})();
