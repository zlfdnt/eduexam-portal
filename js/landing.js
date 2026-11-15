// Halaman beranda publik. Teks testimoni adalah CONTOH — ganti dengan testimoni asli sekolah Anda.
const Landing = (() => {
  const HERO = [
    { h: 'Ujian daring yang <em>aman</em>, cepat, dan tanpa biaya hosting', p: 'Siswa masuk hanya dengan PIN. Guru memantau langsung, nilai keluar otomatis — semua berjalan di ekosistem Google Workspace sekolah Anda.', a: ['ujian', 'ungu'], f: [['users', '32 siswa', 'sedang mengerjakan', 'ok', 'top:4%;left:-2%', 34, 26, 0], ['check', 'Autosave aktif', 'Jawaban tersimpan', '', 'top:40%;right:-4%', -30, 22, -1.6], ['clock', '01:14:29', 'sisa waktu ujian', 'warn', 'bottom:3%;left:6%', 24, -30, -3]] },
    { h: 'Anti-kecurangan yang <em>transparan</em> dan terukur', p: 'Deteksi pindah tab, keluar layar penuh, dan salin-tempel dicatat otomatis. Pengawasan guru tetap diperlukan — EduExam Portal membantu, bukan menggantikan.', a: ['aman', 'biru'], f: [['shield', 'Pelanggaran 0/3', 'Ruang ujian aman', 'ok', 'top:6%;right:-2%', -30, 24, 0], ['lock', 'Layar penuh', 'Wajib aktif saat ujian', '', 'top:48%;left:-5%', 32, 20, -1.8], ['flag', 'Log otomatis', 'Tab · salin-tempel', 'warn', 'bottom:2%;right:4%', -22, -30, -3]] },
    { h: 'Rekap & analisis nilai <em>otomatis</em>', p: 'Grafik sebaran nilai, perbandingan kelas, dan analisis butir soal siap pakai, bisa diunduh untuk laporan.', a: ['nilai', 'hijau'], f: [['chart', 'Rerata 82.4', '+4.2 poin', 'ok', 'top:5%;left:-3%', 34, 26, 0], ['check', 'Lulus 92%', 'KKM 75', '', 'top:44%;right:-4%', -30, 22, -1.6], ['download', 'Unduh CSV / PDF', 'Rekap siap cetak', 'warn', 'bottom:3%;left:8%', 24, -28, -3]] }
  ];
  const FEAT = [
    { t: 'Ruang Ujian Fokus', d: 'Soal satu per satu, penanda ragu-ragu, timer mundur, dan simpan otomatis yang tahan koneksi putus.', tags: ['5 tipe soal', 'Autosave'], art: [['ujian', 'ungu'], ['pin', 'biru'], ['nilai', 'oranye']] },
    { t: 'Anti-Kecurangan', d: 'Wajib layar penuh, log pelanggaran, soal & pilihan diacak per siswa, kunci jawaban tidak pernah dikirim ke browser.', tags: ['Log pelanggaran', 'Acak soal'], art: [['aman', 'biru'], ['live', 'ungu'], ['pin', 'hijau']] },
    { t: 'Live Monitoring', d: 'Lihat siapa yang belum mulai, mengerjakan, selesai, atau terputus. Tambah waktu, buka kunci, paksa kumpul.', tags: ['Tiap 10–15 dtk', 'Aksi guru'], art: [['live', 'hijau'], ['aman', 'ungu'], ['nilai', 'biru']] },
    { t: 'Penilaian Otomatis', d: 'Pilihan ganda, kompleks, menjodohkan, dan isian singkat dinilai di server. Uraian dikoreksi guru.', tags: ['Dinilai server', 'Koreksi uraian'], art: [['nilai', 'oranye'], ['ujian', 'hijau'], ['bank', 'ungu']] },
    { t: 'Bank Soal & Impor CSV', d: 'Tulis soal langsung atau impor massal dari Excel/CSV. Satu bank soal, banyak ujian.', tags: ['Impor massal', 'Milik guru'], art: [['bank', 'ungu'], ['ujian', 'biru'], ['pin', 'oranye']] },
    { t: 'Rekap & Analisis Butir', d: 'Sebaran nilai, rerata per kelas, tingkat kesukaran soal, dan unduhan CSV/PDF.', tags: ['Grafik', 'Unduh'], art: [['nilai', 'ungu'], ['bank', 'hijau'], ['live', 'oranye']] }
  ];
  const TESTI = [
    ['Guru Matematika', 'Ibu Sari', 'Rekap nilai yang dulu butuh berjam-jam sekarang selesai begitu siswa menekan kumpul. Tampilan live monitoring sangat membantu saat mengawasi dua ruang sekaligus.', 5],
    ['Guru IPA', 'Bapak Dedi', 'Siswa cukup memasukkan PIN, tidak ada akun yang harus diingat. Antrean masuk ruang ujian jadi jauh lebih cepat dan rapi.', 5],
    ['Wakil Kurikulum', 'Ibu Maya', 'Admin bisa melihat semua ujian yang sedang berjalan dan mencetak PIN per kelas. Laporan pelanggaran memudahkan evaluasi tata tertib ujian.', 4],
    ['Guru Bahasa Inggris', 'Bapak Rendra', 'Pengacakan soal dan pilihan jawaban membuat siswa sulit saling mencontek. Analisis butir membantu saya merevisi soal yang terlalu sulit.', 5],
    ['Pengawas Ruang', 'Ibu Lestari', 'Saat ada siswa terkunci karena keluar layar penuh, saya bisa membukanya dari satu tombol setelah memastikan situasinya.', 4],
    ['Guru Informatika', 'Bapak Arif', 'Karena berjalan di Google Workspace, sekolah kami tidak perlu menyewa server. Data tersimpan di spreadsheet yang bisa kami cadangkan sendiri.', 5]
  ];
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const TICK = ['Masuk hanya dengan PIN', 'Autosave tahan koneksi putus', 'Soal & pilihan diacak', 'Live monitoring', 'Deteksi pindah tab', 'Penilaian otomatis', 'Impor soal CSV', 'Analisis butir soal', 'Tanpa biaya hosting', 'Mode gelap'];
  const ROWS = [['Ahmad Fauzi', 34], ['Bunga Citra', 28], ['Dimas Prasetyo', 19, 1], ['Dewi Sartika', 40], ['Eko Prasetyo', 31]];
  function render(root) {
    const boot = Api.S.me ? `<a class="btn btn-p btn-sm" href="#/${Api.S.me.peran === 'siswa' ? 'siswa' : 'staff/dashboard'}">Buka aplikasi</a>` : `<a class="btn btn-p btn-sm btn-cta" href="#/masuk">Masuk</a>`;
    const fl = f => `<div class="fl" style="${f[4]};--dx:${f[5]};--dy:${f[6]};--dl:${f[7]}s"><div><span class="ic2 ${f[3]}">${ic(f[0], 18)}</span><span><b>${esc(f[1])}</b><small>${esc(f[2])}</small></span></div></div>`;
    root.innerHTML = `<div class="lp">
    <header class="lp-nav" id="nv"><a class="logo" href="#/"><i>${ic('grad', 22)}</i>EduExam Portal</a><nav><a href="#fitur">Fitur</a><a href="#live">Live Monitoring</a><a href="#alur">Cara Kerja</a><a href="#testimoni">Testimoni</a></nav>${boot}</header>
    <section class="hero" id="hero0"><div class="mesh"><i></i><i></i><i></i></div><div class="dotgrid"></div>
      <div class="hero-box" id="hero">${HERO.map((s, i) => `<div class="sl ${i ? '' : 'on'}"><div class="tx"><span class="livechip">Ujian daring sekolah</span><h1>${s.h}</h1><p class="lead">${esc(s.p)}</p><div class="row"><a class="btn btn-p btn-lg btn-cta" href="#/masuk">Masuk ke Ruang Ujian ${ic('arrow', 18)}</a><a class="btn btn-lg" href="#fitur">Lihat fitur</a></div></div>
        <div class="stage"><div class="ring"></div><div class="art"><img alt="" src="${Art.uri(...s.a)}"></div>${s.f.map(fl).join('')}</div></div>`).join('')}<div class="dots">${HERO.map((_, i) => `<button class="dot ${i ? '' : 'on'}" aria-label="Slide ${i + 1}"></button>`).join('')}</div></div></section>
    <div class="mq" aria-hidden="true"><div class="tr">${[...TICK, ...TICK].map(t => `<span>${esc(t)}</span>`).join('')}</div></div>
    <section style="padding:72px 0 24px"><div class="wrap"><div class="stats">
      ${[['clip', '5', '', 'tipe soal didukung', ''], ['check', '100', '%', 'dinilai di server', ''], ['key', '0', '', 'biaya hosting', 'Rp'], ['clock', '12', ' dtk', 'pembaruan live monitoring', '']].map((x, i) => `<div class="card stat glow rv" style="transition-delay:${i * 60}ms"><span class="ico">${ic(x[0], 26)}</span><div><b>${x[4]}<span class="cnt" data-to="${x[1]}" data-suf="${x[2]}">0</span></b><span class="mute">${x[3]}</span></div></div>`).join('')}</div></div></section>
    <section id="fitur"><div class="wrap"><div class="sec-h rv"><span class="eyebrow">Fitur</span><h2>Semua yang dibutuhkan untuk ujian daring</h2><p>Dari bank soal sampai analisis nilai. Arahkan kursor ke kartu untuk melihatnya menyala.</p></div>
      <div class="fgrid">${FEAT.map((f, i) => `<article class="fcard glow tilt rv" style="transition-delay:${(i % 3) * 70}ms"><div class="cardimg">${f.art.map((a, k) => `<div class="sl ${k ? '' : 'on'}"><img alt="" loading="lazy" src="${Art.uri(...a)}"></div>`).join('')}<div class="dots">${f.art.map((_, k) => `<button class="dot ${k ? '' : 'on'}" aria-label="Gambar ${k + 1}"></button>`).join('')}</div></div>
      <div class="bd"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p><div class="tags">${f.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div></article>`).join('')}</div></div></section>
    <section id="live" style="background:#fdf8ff"><div class="wrap"><div class="split"><div class="rv"><span class="eyebrow">Live Monitoring</span><h2 style="font-size:clamp(26px,3.4vw,38px);font-weight:800;letter-spacing:-.02em">Pantau seluruh ruang ujian dalam satu layar</h2><p class="mute" style="font-size:16px;margin-top:12px">Lihat siapa yang belum mulai, sedang mengerjakan, selesai, atau terputus, lengkap dengan progres dan pelanggaran.</p>
      <ul class="checks">${['Status siswa diperbarui otomatis tiap 10–15 detik', 'Tambah waktu, buka kunci, reset, atau paksa kumpul', 'Log pelanggaran: pindah tab, keluar layar penuh, salin-tempel'].map(t => `<li><span class="ck">${ic('check', 14)}</span><span>${esc(t)}</span></li>`).join('')}</ul><a class="btn btn-p btn-lg btn-cta" href="#/masuk/staff">Coba sebagai guru ${ic('arrow', 18)}</a></div>
      <div class="mock rv" id="mock"><div class="mh"><b style="font:700 16px 'Plus Jakarta Sans',Inter,sans-serif">PAS Genap · Matematika XII</b><span class="chip ok">● LIVE</span></div>
        <div class="tiles"><div><span class="sm mute">Mengerjakan</span><b id="m1">4</b></div><div><span class="sm mute">Selesai</span><b id="m2">1</b></div><div><span class="sm mute">Terkunci</span><b style="color:var(--bad)">1</b></div></div>
        ${ROWS.map((r, i) => `<div class="row2 ${r[2] ? 'lk' : ''}" data-i="${i}"><span class="av">${ini(r[0])}</span><div><b style="font-size:13px">${esc(r[0])}</b><div class="bar" style="margin-top:6px"><i style="width:${r[1] / 40 * 100}%;${r[2] ? 'background:var(--bad)' : ''}"></i></div></div><span class="chip ${r[2] ? 'bad' : r[1] >= 40 ? 'ok' : 'info'}">${r[2] ? 'Terkunci' : r[1] >= 40 ? 'Selesai' : 'Mengerjakan'}</span></div>`).join('')}
        <div class="row between" style="margin-top:14px"><span class="sm mute">Integritas ruang ujian</span><b style="color:var(--ok)">95.1%</b></div></div></div></div></section>
    <section id="alur"><div class="wrap"><div class="sec-h rv"><span class="eyebrow">Cara kerja</span><h2>Tiga langkah menuju ujian</h2><p>Sederhana untuk guru, ringan untuk siswa.</p></div>
      <div class="steps"><div class="card step glow rv"><h3>Siapkan soal &amp; ujian</h3><p class="mute">Guru menulis atau mengimpor soal, lalu menjadwalkan ujian untuk kelas tertentu.</p></div><div class="card step glow rv" style="transition-delay:.08s"><h3>Bagikan PIN</h3><p class="mute">Guru/admin membuat dan mencetak PIN 6 digit per kelas. Siswa masuk hanya dengan PIN.</p></div><div class="card step glow rv" style="transition-delay:.16s"><h3>Pantau &amp; nilai</h3><p class="mute">Pantau langsung saat ujian, lalu lihat rekap dan analisis nilai otomatis.</p></div></div></div></section>
    <section id="testimoni" style="background:#fdf8ff"><div class="wrap"><div class="sec-h rv"><span class="eyebrow">Testimoni</span><h2>Kata pengguna</h2><p>Klik kartu untuk membaca selengkapnya.</p><p class="sm mute" style="margin-top:8px">Contoh testimoni — ganti dengan testimoni asli sekolah Anda di <code>js/landing.js</code>.</p></div>
      <div class="tgrid" id="testi">${TESTI.map((t, i) => `<button class="flip glow rv" data-i="${i}" aria-label="Testimoni ${esc(t[1])}"><div class="flip-in"><div class="face f"><q>${esc(t[2])}</q><div class="who"><span class="av">${ini(t[1])}</span><div><b>${esc(t[1])}</b><span class="mute sm">${esc(t[0])}</span></div></div></div><div class="face bk"><div><div class="stars">${stars(t[3])}</div><h3 style="margin:10px 0 6px;color:#fff">${esc(t[1])}</h3><span style="opacity:.85">${esc(t[0])}</span></div><span class="chip" style="align-self:flex-start;background:rgba(255,255,255,.2);color:#fff">Baca selengkapnya ${ic('arrow', 14)}</span></div></div></button>`).join('')}</div></div></section>
    <section style="padding:72px 0 96px"><div class="wrap"><div class="cta rv"><span class="bl" style="width:180px;height:180px;left:-50px;top:-60px"></span><span class="bl" style="width:120px;height:120px;right:6%;bottom:-40px;animation-delay:-4s"></span><h2>Siap menjalankan ujian berikutnya?</h2><p>Mulai dari satu kelas. Uji coba terbatas sebelum dipakai pada ujian sesungguhnya.</p><a class="btn btn-w btn-lg btn-cta" href="#/masuk">Masuk sekarang ${ic('arrow', 18)}</a></div></div></section>
    <footer>© ${new Date().getFullYear()} EduExam Portal · Ujian &amp; asesmen daring berbasis Google Workspace${Api.demo() ? ' · <b>MODE DEMO</b>' : ''}</footer></div>`;
    // hero: slideshow otomatis + parallax mouse
    slideshow($('#hero', root), 5200, false);
    const hero = $('#hero0', root);
    on(hero, 'pointermove', e => { const r = hero.getBoundingClientRect(); hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3)); hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
    on(hero, 'pointerleave', () => { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); });
    const nv = $('#nv', root); on(window, 'scroll', () => nv.classList.toggle('sc', scrollY > 8), { passive: true });
    $$('.fcard', root).forEach((c, i) => slideshow(c, 3600 + i * 400));
    reveal(root);
    // pratinjau live: progres bergerak
    const st = ROWS.map(r => r[1]), rows = $$('#mock .row2', root);
    every(() => { if (document.hidden) return; st.forEach((v, i) => { if (ROWS[i][2] || v >= 40) return; if (Math.random() < .6) st[i] = Math.min(40, v + 1); const r = rows[i]; $('.bar i', r).style.width = st[i] / 40 * 100 + '%'; if (st[i] >= 40) { const c = $('.chip', r); c.className = 'chip ok'; c.textContent = 'Selesai'; } });
      const done = st.filter((v, i) => !ROWS[i][2] && v >= 40).length; $('#m1', root).textContent = st.filter((v, i) => !ROWS[i][2] && v < 40).length; $('#m2', root).textContent = done; if (st.every((v, i) => ROWS[i][2] || v >= 40)) ROWS.forEach((r, i) => { st[i] = r[1] >= 40 ? 40 : Math.max(5, r[1] - 18); }); }, 1500);
    // testimoni: balik otomatis satu per satu, berhenti saat disorot
    const fp = $$('.flip', root); let k = 0, hov = false;
    fp.forEach(f => { f.addEventListener('pointerenter', () => hov = true); f.addEventListener('pointerleave', () => hov = false); f.addEventListener('click', () => openTesti(+f.dataset.i)); });
    every(() => { if (hov || document.hidden) return; fp.forEach(f => f.classList.remove('on')); fp[k % fp.length].classList.add('on'); k++; }, 3200);
  }
  function openTesti(i) {
    const t = TESTI[i]; modal(`<div class="who" style="margin-bottom:14px"><span class="av" style="width:52px;height:52px;font-size:16px">${ini(t[1])}</span><div><h3>${esc(t[1])}</h3><span class="mute">${esc(t[0])}</span></div></div><div class="stars" style="color:var(--warn);font-size:18px">${stars(t[3])}</div><p style="font-size:16px;line-height:1.75">“${esc(t[2])}”</p><p class="sm mute">Contoh testimoni untuk keperluan tampilan.</p>`);
  }
  return { render };
})();
