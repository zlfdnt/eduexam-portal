// Halaman beranda publik. Teks testimoni adalah CONTOH — ganti dengan testimoni asli sekolah Anda.
const Landing = (() => {
  const HERO = [
    { h: 'Ujian daring yang <em>aman</em>, cepat, dan tanpa biaya hosting', p: 'Siswa masuk hanya dengan PIN. Guru memantau langsung, nilai keluar otomatis — semua berjalan di ekosistem Google Workspace sekolah Anda.', a: ['ujian', 'ungu'] },
    { h: 'Anti-kecurangan yang <em>transparan</em> dan terukur', p: 'Deteksi pindah tab, keluar layar penuh, dan salin-tempel dicatat otomatis. Pengawasan guru tetap diperlukan — EduExam Portal membantu, bukan menggantikan.', a: ['aman', 'biru'] },
    { h: 'Rekap & analisis nilai <em>otomatis</em>', p: 'Grafik sebaran nilai, perbandingan kelas, dan analisis butir soal siap pakai, bisa diunduh untuk laporan.', a: ['nilai', 'hijau'] }
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
  function render(root) {
    const boot = Api.S.me ? `<a class="btn btn-p btn-sm" href="#/${Api.S.me.peran === 'siswa' ? 'siswa' : 'staff/dashboard'}">Buka aplikasi</a>` : `<a class="btn btn-p btn-sm btn-cta" href="#/masuk">Masuk</a>`;
    root.innerHTML = `<div class="lp">
    <header class="lp-nav"><a class="logo" href="#/"><i>${ic('grad', 22)}</i>EduExam Portal</a><nav><a href="#fitur">Fitur</a><a href="#alur">Cara Kerja</a><a href="#testimoni">Testimoni</a></nav>${boot}</header>
    <section class="hero"><div class="shape" style="width:160px;height:160px;background:#c8bfff;left:4%;top:18%"></div><div class="shape" style="width:110px;height:110px;background:#7bd0ff;right:8%;bottom:22%;animation-delay:-3s"></div>
      <div class="hero-box" id="hero">${HERO.map((s, i) => `<div class="sl ${i ? '' : 'on'}"><div><span class="chip">Sistem Ujian Sekolah</span><h1 style="margin-top:14px">${s.h}</h1><p>${esc(s.p)}</p><div class="row"><a class="btn btn-p btn-lg btn-cta" href="#/masuk">Masuk ke Ruang Ujian ${ic('arrow', 18)}</a><a class="btn btn-lg" href="#fitur">Lihat fitur</a></div></div><div class="art"><img alt="" src="${Art.uri(...s.a)}"></div></div>`).join('')}<div class="dots">${HERO.map((_, i) => `<button class="dot ${i ? '' : 'on'}" aria-label="Slide ${i + 1}"></button>`).join('')}</div></div></section>
    <div class="wrap" style="padding:0 24px"><div class="stats rv">
      <div class="card stat glow"><b><span class="cnt" data-to="5">0</span></b><span class="mute">tipe soal didukung</span></div>
      <div class="card stat glow"><b><span class="cnt" data-to="100" data-suf="%">0</span></b><span class="mute">dinilai di server</span></div>
      <div class="card stat glow"><b>Rp<span class="cnt" data-to="0">0</span></b><span class="mute">biaya hosting</span></div>
      <div class="card stat glow"><b><span class="cnt" data-to="12">0</span> dtk</b><span class="mute">pembaruan live monitoring</span></div></div></div>
    <section id="fitur"><div class="wrap"><div class="sec-h rv"><h2>Semua yang dibutuhkan untuk ujian daring</h2><p>Dari bank soal sampai analisis nilai — arahkan kursor untuk melihat kartu menyala.</p></div>
      <div class="fgrid">${FEAT.map((f, i) => `<article class="fcard glow tilt rv" style="transition-delay:${i * 70}ms"><div class="cardimg">${f.art.map((a, k) => `<div class="sl ${k ? '' : 'on'}"><img alt="" loading="lazy" src="${Art.uri(...a)}"></div>`).join('')}<div class="dots">${f.art.map((_, k) => `<button class="dot ${k ? '' : 'on'}" aria-label="Gambar ${k + 1}"></button>`).join('')}</div></div>
      <div class="bd"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p><div class="tags">${f.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div></article>`).join('')}</div></div></section>
    <section id="alur" style="background:#fdf8ff"><div class="wrap"><div class="sec-h rv"><h2>Tiga langkah menuju ujian</h2><p>Sederhana untuk guru, ringan untuk siswa.</p></div>
      <div class="steps"><div class="card step glow rv"><h3>Siapkan soal & ujian</h3><p class="mute">Guru menulis atau mengimpor soal, lalu menjadwalkan ujian untuk kelas tertentu.</p></div><div class="card step glow rv" style="transition-delay:.1s"><h3>Bagikan PIN</h3><p class="mute">Guru/admin membuat dan mencetak PIN 6 digit per kelas. Siswa masuk hanya dengan PIN.</p></div><div class="card step glow rv" style="transition-delay:.2s"><h3>Pantau & nilai</h3><p class="mute">Pantau langsung saat ujian, lalu lihat rekap dan analisis nilai otomatis.</p></div></div></div></section>
    <section id="testimoni"><div class="wrap"><div class="sec-h rv"><h2>Kata pengguna</h2><p>Klik kartu untuk membaca selengkapnya.</p><p class="sm mute" style="margin-top:8px">Contoh testimoni — ganti dengan testimoni asli sekolah Anda di <code>js/landing.js</code>.</p></div>
      <div class="tgrid" id="testi">${TESTI.map((t, i) => `<button class="flip glow rv" data-i="${i}" aria-label="Testimoni ${esc(t[1])}" style="transition-delay:${i * 60}ms"><div class="flip-in"><div class="face f"><q>${esc(t[2])}</q><div class="who"><span class="av">${ini(t[1])}</span><div><b>${esc(t[1])}</b><span class="mute sm">${esc(t[0])}</span></div></div></div><div class="face bk"><div><div class="stars">${stars(t[3])}</div><h3 style="margin:10px 0 6px;color:#fff">${esc(t[1])}</h3><span style="opacity:.85">${esc(t[0])}</span></div><span class="chip" style="align-self:flex-start;background:rgba(255,255,255,.2);color:#fff">Baca selengkapnya ${ic('arrow', 14)}</span></div></div></button>`).join('')}</div></div></section>
    <section style="padding-top:0"><div class="wrap"><div class="cta rv"><div class="shape" style="width:140px;height:140px;background:#fff;left:-30px;top:-30px;opacity:.12"></div><h2>Siap menjalankan ujian berikutnya?</h2><p>Mulai dari satu kelas. Uji coba terbatas sebelum dipakai pada ujian sesungguhnya.</p><a class="btn btn-w btn-lg btn-cta" href="#/masuk">Masuk sekarang ${ic('arrow', 18)}</a></div></div></section>
    <footer>© ${new Date().getFullYear()} EduExam Portal · Ujian &amp; asesmen daring berbasis Google Workspace${Api.demo() ? ' · <b>MODE DEMO</b>' : ''}</footer></div>`;
    slideshow($('#hero', root), 5200);
    $$('.fcard', root).forEach((c, i) => slideshow(c, 3600 + i * 400));
    reveal(root);
    // testimoni: balik otomatis satu per satu, berhenti saat disorot
    const fl = $$('.flip', root); let k = 0, hov = false;
    fl.forEach(f => { f.addEventListener('pointerenter', () => hov = true); f.addEventListener('pointerleave', () => hov = false); f.addEventListener('click', () => openTesti(+f.dataset.i)); });
    every(() => { if (hov || document.hidden) return; fl.forEach(f => f.classList.remove('on')); fl[k % fl.length].classList.add('on'); k++; }, 3200);
  }
  function openTesti(i) {
    const t = TESTI[i]; modal(`<div class="who" style="margin-bottom:14px"><span class="av" style="width:52px;height:52px;font-size:16px">${ini(t[1])}</span><div><h3>${esc(t[1])}</h3><span class="mute">${esc(t[0])}</span></div></div><div class="stars" style="color:var(--warn);font-size:18px">${stars(t[3])}</div><p style="font-size:16px;line-height:1.75">“${esc(t[2])}”</p><p class="sm mute">Contoh testimoni untuk keperluan tampilan.</p>`);
  }
  return { render };
})();
