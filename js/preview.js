// Pratinjau: (1) Mode Pratinjau publik dengan data contoh (tanpa login), (2) pratinjau "sebagai siswa" untuk guru/admin.
const Preview = (() => {
  // ---------- 1. halaman pilih peran (sandbox) ----------
  function pilih(root) {
    const card = (ico, judul, langkah, tombol, role, warna) => `<div class="card glow tilt pvcard rv"><span class="ico2" style="background:${warna[0]};color:${warna[1]};width:56px;height:56px;border-radius:18px">${ic(ico, 28)}</span><h3 style="font-size:22px;margin:14px 0 4px">${judul}</h3><ol class="pvsteps">${langkah.map(l => `<li>${l}</li>`).join('')}</ol><button class="btn btn-p btn-lg btn-cta" data-r="${role}" style="width:100%">${tombol} ${ic('arrow', 18)}</button></div>`;
    root.innerHTML = `<div class="lp" style="min-height:100vh"><header class="lp-nav sc"><a class="logo" href="#/"><i>${ic('grad', 22)}</i>EduExam Portal</a><span class="grow"></span><a class="btn btn-sm" href="#/">← Kembali ke beranda</a></header>
    <section style="padding:64px 0 96px;background:radial-gradient(900px 480px at 85% -10%,#E5DEFF,transparent),radial-gradient(700px 420px at 0 30%,#d6f0ff,transparent)"><div class="wrap"><div class="sec-h rv"><span class="eyebrow">Mode Pratinjau</span><h2>Coba EduExam Portal tanpa login</h2><p>Rasakan langsung alur masuk portal sampai mengerjakan asesmen. Memakai <b>data contoh</b> dan tidak terhubung ke data sekolah Anda.</p></div>
      <div class="pvgrid">${card('users', 'Sebagai Siswa', ['Masuk portal dengan PIN 6 digit', 'Pilih ujian lalu baca petunjuk', 'Kerjakan soal: timer, ragu-ragu, autosave', 'Kumpulkan dan lihat nilai'], 'Coba sebagai siswa', 'siswa', ['#EEF2FF', 'var(--primary)'])}
      ${card('clip', 'Sebagai Guru', ['Dashboard dan kalender ujian', 'Bank soal per koleksi (mapel · kelas · materi)', 'Buat ujian, lihat Live Monitoring', 'Rekap, analisis butir, dan pratinjau soal'], 'Coba sebagai guru', 'guru', ['#ECFDF5', 'var(--ok)'])}
      ${card('gear', 'Sebagai Admin', ['Kelola akun guru dan penugasan mapel & kelas', 'Siswa, kelas, dan PIN', 'Pengaturan sistem', 'Pantau seluruh ujian'], 'Coba sebagai admin', 'admin', ['#FFFBEB', 'var(--warn)'])}</div>
      <p class="mute sm" style="text-align:center;margin-top:28px">Kolom masuk akan terisi otomatis. Tekan tombol keluar di bilah atas kapan saja untuk menutup pratinjau.</p></div></section></div>`;
    $$('[data-r]', root).forEach(b => b.onclick = () => { Api.enterSandbox(b.dataset.r); location.hash = b.dataset.r === 'siswa' ? '#/masuk' : '#/masuk/staff'; location.reload(); });
    reveal(root);
  }

  // ---------- 2. pratinjau sebagai siswa untuk guru/admin ----------
  const prep = q => ({ ...q, o: q.t === 'pg' || q.t === 'pgk' ? q.p.map((_, i) => i) : q.t === 'jodoh' ? q.p.kanan.map((_, i) => i).reverse() : null });
  function run(root, data, back) {
    const exit = () => { location.hash = back; };
    const s1 = () => Auth.render(root, 'siswa', { preview: true, nama: '', onPin: s2, onExit: exit });
    const s2 = () => Exam.homePreview(root, data, { onStart: s3, onExit: exit });
    const s3 = () => Exam.room(root, 'pv', { preview: true, data, onExit: exit, onBack: s2, onRestart: s1 });
    s1();
  }
  async function ujian(root, id) {
    try { const d = (await Api.call('ujian.pratinjau', { id })).data; run(root, { judul: d.judul, mapel: d.mapel, durasi: d.durasi, batas: d.batas, mode: d.mode, soal: d.soal.map(prep) }, '#/staff/ujian'); }
    catch (e) { fail(e); location.hash = '#/staff/ujian'; }
  }
  async function koleksi(root, id) {
    try {
      const B = (await Api.call('bank.daftar')).data, k = B.koleksi.find(x => x.id === id), ss = B.soal.filter(s => s.idKoleksi === id);
      if (!k) throw new Error('Koleksi tidak ditemukan.'); if (!ss.length) throw new Error('Koleksi masih kosong. Tambahkan soal dulu.');
      run(root, { judul: 'Pratinjau koleksi: ' + k.materi, mapel: k.mapel, durasi: 30, batas: 3, mode: 'kunci', soal: ss.map(s => prep({ id: s.id, t: s.tipe, q: s.pertanyaan, b: s.bobot, img: s.gambar, p: s.pilihan, k: s.kunci })) }, '#/staff/bank/' + id);
    } catch (e) { fail(e); location.hash = '#/staff/bank/' + id; }
  }
  return { pilih, ujian, koleksi };
})();
