// MODE DEMO — hanya aktif bila GAS_URL belum diisi. Data contoh di memori, tidak ada server.
// Masuk demo: Siswa PIN 123456 | Guru demo/demo | Admin admin/admin
const Mock = (() => {
  const H = 36e5, D = 864e5, now = () => Date.now();
  const N = ['Ahmad Fauzi', 'Bunga Citra Lestari', 'Dimas Prasetyo', 'Dewi Sartika', 'Eko Prasetyo', 'Fitri Handayani', 'Gilang Ramadhan', 'Hana Pertiwi', 'Indra Wijaya', 'Joko Susilo', 'Kartika Sari', 'Lutfi Hakim'];
  const siswa = N.map((n, i) => ({ id: 'S' + i, nisn: '2021' + String(1000 + i), nama: n, kelas: i < 8 ? 'XII MIPA 1' : 'XII MIPA 2', aktif: true, punyaPin: i < 8 }));
  const bank = [
    { id: 'Q1', mapel: 'Matematika', tipe: 'pg', pertanyaan: 'Nilai dari 2³ + 3² adalah …', pilihan: ['13', '15', '17', '19'], kunci: 2, bobot: 2 },
    { id: 'Q2', mapel: 'Matematika', tipe: 'pgk', pertanyaan: 'Pilih semua bilangan prima.', pilihan: ['2', '9', '11', '15'], kunci: [0, 2], bobot: 2 },
    { id: 'Q3', mapel: 'Matematika', tipe: 'jodoh', pertanyaan: 'Jodohkan bangun dengan banyak sisinya.', pilihan: { kiri: ['Segitiga', 'Persegi', 'Segilima'], kanan: ['3', '4', '5'] }, kunci: null, bobot: 3 },
    { id: 'Q4', mapel: 'Matematika', tipe: 'isian', pertanyaan: 'Hasil dari 12 × 12 adalah …', pilihan: null, kunci: ['144'], bobot: 2 },
    { id: 'Q5', mapel: 'Matematika', tipe: 'uraian', pertanyaan: 'Jelaskan langkah menentukan akar persamaan x² − 5x + 6 = 0.', pilihan: null, kunci: null, bobot: 4 }
  ];
  const ujian = [
    { id: 'U1', judul: 'PAS Genap: Matematika Wajib XII', mapel: 'Matematika', mulai: now() - H, selesai: now() + 3 * H, durasi: 90, kelas: ['XII MIPA 1', 'XII MIPA 2'], status: 'terbit', peserta: 12, selesaiN: 3, mulaiN: 8 },
    { id: 'U2', judul: 'Asesmen Bahasa Inggris', mapel: 'Bahasa Inggris', mulai: now() + D, selesai: now() + D + 2 * H, durasi: 60, kelas: ['XII MIPA 1'], status: 'terbit', peserta: 8, selesaiN: 0, mulaiN: 0 },
    { id: 'U3', judul: 'Remedial Fisika Termodinamika', mapel: 'Fisika', mulai: now() + 3 * D, selesai: now() + 3 * D + 2 * H, durasi: 60, kelas: ['XII MIPA 2'], status: 'draft', peserta: 4, selesaiN: 0, mulaiN: 0 }
  ];
  const stu = {}; // sesi siswa demo
  const ok = (data, message = '') => Promise.resolve({ success: true, data, message });
  const no = m => Promise.reject(Object.assign(new Error(m), { code: 'DEMO' }));
  const stats = st => ['belum', 'mengerjakan', 'selesai', 'terkunci', 'terputus'].reduce((o, k) => (o[k] = st.filter(s => s.status === k).length, o), {});
  function monitor() {
    const t = (now() / 1000 | 0) % 600, stt = ['mengerjakan', 'mengerjakan', 'terkunci', 'selesai', 'mengerjakan', 'belum', 'mengerjakan', 'selesai', 'mengerjakan', 'terputus', 'belum', 'mengerjakan'];
    const rows = siswa.map((s, i) => { const st = stt[i], tot = 40, an = st === 'belum' ? 0 : st === 'selesai' ? tot : Math.min(tot - 1, 8 + i * 2 + (t / 40 | 0)); return { id: s.id, nama: s.nama, nisn: s.nisn, kelas: s.kelas, status: st, terjawab: an, total: tot, pelanggaran: st === 'terkunci' ? 3 : i % 5 === 1 ? 2 : 0, sisa: st === 'belum' ? 0 : 3600 - i * 60 - t, terakhir: now() }; });
    return { ujian: ujian[0], ringkas: stats(rows), siswa: rows, now: now(), log: [{ t: now() - 6e4, nama: 'Dimas Prasetyo', jenis: 'fullscreen' }, { t: now() - 15e4, nama: 'Bunga Citra Lestari', jenis: 'tab' }, { t: now() - 4e5, nama: 'Dimas Prasetyo', jenis: 'tab' }] };
  }
  const exam = () => {
    const urut = bank.map(q => q.id), cl = bank.map(q => ({ id: q.id, t: q.tipe, q: q.pertanyaan, b: q.bobot, img: '', p: q.pilihan, o: q.tipe === 'jodoh' ? q.pilihan.kanan.map((_, i) => i).reverse() : q.pilihan && q.tipe !== 'isian' ? q.pilihan.map((_, i) => i) : null }));
    return cl;
  };
  const R = {
    'public.boot': () => ok({ nama: 'Sekolah Demo', polling: 12 }),
    'auth.siswa': (d) => d.pin === '123456' ? ok({ token: 'demo', me: { id: 'S1', nama: 'M. Rizky Pratama', kelas: 'XII MIPA 1', nisn: '005481920', peran: 'siswa' } }) : no('PIN salah. (Demo: gunakan 123456)'),
    'auth.staff': (d) => d.username === 'demo' && d.password === 'demo' ? ok({ token: 'demo', me: { id: 'G1', nama: 'Ratna Sari, S.Pd', peran: 'guru' } }) : d.username === 'admin' && d.password === 'admin' ? ok({ token: 'demo', me: { id: 'A1', nama: 'Administrator', peran: 'admin' } }) : no('Salah. (Demo: demo/demo atau admin/admin)'),
    'auth.saya': (d, me) => ok({ me }), 'auth.keluar': () => ok(),
    'dash.ringkas': () => ok({ totalSiswa: 1248, ujianAktif: 1, rata: 82.4, pelanggaranHariIni: 3, kkm: 75, trend: [{ label: 'Minggu 1', rata: 72, lulus: 68 }, { label: 'Minggu 2', rata: 78, lulus: 80 }, { label: 'Minggu 3', rata: 84.5, lulus: 92 }, { label: 'Minggu 4', rata: 76, lulus: 74 }, { label: 'Minggu 5', rata: 82, lulus: 88 }], mendatang: ujian, live: [{ ...ujian[0], peserta: 12, mulaiN: 8, selesaiN: 3, pelanggaran: 5 }] }),
    'ujian.daftarGuru': () => ok({ now: now(), ujian }),
    'ujian.detail': (d) => ok({ ujian: { ...ujian.find(u => u.id === d.id), acak: true, batasPelanggaran: 3, modeKunci: 'kunci', tampilNilai: 'langsung' }, soal: bank.map(q => q.id) }),
    'ujian.simpan': () => ok({ id: 'U9' }, 'Ujian tersimpan (demo).'),
    'bank.daftar': () => ok({ soal: bank }), 'bank.simpan': (d) => { bank.push({ ...d.soal, id: d.soal.id || 'Q' + (bank.length + 1) }); return ok({}, 'Soal tersimpan (demo).'); },
    'bank.impor': (d) => ok({ masuk: d.rows.length, gagal: [], jumlahGagal: 0 }), 'bank.hapus': () => ok({}, 'Dihapus (demo).'),
    'siswa.daftar': () => ok({ siswa, kelas: [{ id: 'K1', nama: 'XII MIPA 1', wali: '' }, { id: 'K2', nama: 'XII MIPA 2', wali: '' }] }),
    'siswa.pin': (d) => ok({ pins: d.ids.map(id => { const s = siswa.find(x => x.id === id); return { id, nama: s.nama, kelas: s.kelas, pin: String(100000 + Math.random() * 899999 | 0) }; }) }),
    'siswa.impor': (d) => ok({ ditambah: d.rows.length, diperbarui: 0, dilewati: 0 }, 'Impor demo.'), 'kelas.simpan': () => ok({}, 'Tersimpan (demo).'),
    'monitor.data': () => ok(monitor()), 'monitor.aksi': () => ok({ n: 1 }, 'Aksi dijalankan (demo).'),
    'rekap.ujian': () => ok({ ujian: ujian[0], kkm: 75, bins: [0, 0, 0, 0, 1, 2, 4, 6, 4, 2], uraian: [{ sid: 'U1|S1', siswa: 'Ahmad Fauzi', idSoal: 'Q5', pertanyaan: bank[4].pertanyaan, jawaban: 'Faktorkan menjadi (x−2)(x−3), sehingga x = 2 atau x = 3.', skor: null, bobot: 4 }], stat: { n: 19, peserta: 24, rata: 79.3, maks: 98, min: 48, lulus: 74 }, kelas: [{ kelas: 'XII MIPA 1', n: 10, rata: 81.2 }, { kelas: 'XII MIPA 2', n: 9, rata: 77.1 }], rows: siswa.slice(0, 10).map((s, i) => ({ id: s.id, nisn: s.nisn, nama: s.nama, kelas: s.kelas, nilai: 98 - i * 5, pelanggaran: i % 4 === 0 ? 1 : 0, perluKoreksi: i === 0 })), butir: bank.map((q, i) => ({ no: i + 1, id: q.id, tipe: q.tipe, pertanyaan: q.pertanyaan, p: q.tipe === 'uraian' ? null : [85, 52, 40, 70][i] || 60, n: 19 })) }),
    'koreksi.simpan': () => ok({ nilai: 80 }, 'Nilai uraian tersimpan (demo).'),
    'pengguna.daftar': () => ok({ pengguna: [{ id: 'A1', nama: 'Administrator', username: 'admin', peran: 'admin', status: 'aktif' }, { id: 'G1', nama: 'Ratna Sari, S.Pd', username: 'ratna', peran: 'guru', status: 'aktif' }] }),
    'pengguna.simpan': () => ok({}, 'Tersimpan (demo).'), 'pengguna.sandi': () => ok({}, 'Demo: sandi tidak diubah.'),
    'cfg.ambil': () => ok({ cfg: { BATAS_PIN: 5, BATAS_PELANGGARAN: 3, KKM: 75, POLLING_DETIK: 12, NAMA_SEKOLAH: 'Sekolah Demo' } }), 'cfg.simpan': () => ok({}, 'Tersimpan (demo).'),
    'ujian.daftarSiswa': () => ok({ now: now(), ujian: ujian.filter(u => u.status === 'terbit').map(u => ({ ...u, tampilNilai: 'langsung', sesi: stu[u.id] ? { status: stu[u.id].status, nilai: stu[u.id].nilai } : null })) }),
    'ujian.mulai': (d) => { const s = stu[d.idUjian] = stu[d.idUjian] || { status: 'mengerjakan', a: {}, r: {}, end: now() + 90 * 6e4, p: 0 }; return s.status === 'selesai' ? ok({ selesai: true, nilai: s.nilai, tampil: 'langsung' }) : ok({ soal: exam(), a: s.a, r: s.r, status: s.status, sisa: Math.round((s.end - now()) / 1000), p: s.p, batas: 3, mode: 'kunci', now: now(), judul: ujian[0].judul, mapel: 'Matematika' }); },
    'ujian.simpanJawab': (d) => { const s = stu[d.idUjian]; Object.assign(s.a, d.jawaban || {}); Object.entries(d.ragu || {}).forEach(([k, v]) => v ? s.r[k] = 1 : delete s.r[k]); return ok({ status: s.status, sisa: Math.round((s.end - now()) / 1000), p: s.p, now: now() }); },
    'ujian.pelanggaran': (d) => { const s = stu[d.idUjian]; if (d.jenis !== 'klik_kanan') s.p++; if (s.p >= 3) s.status = 'terkunci'; return ok({ status: s.status, p: s.p, batas: 3 }); },
    'ujian.kumpul': (d) => { const s = stu[d.idUjian]; Object.assign(s.a, d.jawaban || {}); s.status = 'selesai'; let g = 0; bank.forEach(q => { const a = s.a[q.id]; if (q.tipe === 'pg' && +a === q.kunci) g += q.bobot; if (q.tipe === 'isian' && String(a || '').trim() === '144') g += q.bobot; }); s.nilai = Math.round(g / 13 * 1000) / 10; return ok({ selesai: true, nilai: s.nilai, tampil: 'langsung' }); }
  };
  return { call: (a, d, me) => new Promise(r => setTimeout(r, 180)).then(() => R[a] ? R[a](d || {}, me) : no('Fitur ini membutuhkan backend (mode demo).')) };
})();
