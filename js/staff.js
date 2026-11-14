// Panel guru/admin: kerangka, dashboard, live monitoring, rekap & analisis. (Bank soal, ujian, siswa, pengaturan ada di staff2.js)
const Staff = (() => {
  const me = () => Api.S.me, isAdm = () => me().peran === 'admin';
  const MENU = [['dashboard', 'Dashboard', 'dash', 'admin guru'], ['bank', 'Bank Soal', 'book', 'guru'], ['ujian', 'Manajemen Ujian', 'clip', 'admin guru'], ['monitor', 'Live Monitoring', 'radio', 'admin guru', 1], ['rekap', 'Rekap & Analisis Nilai', 'chart', 'admin guru'], ['siswa', 'Siswa & Kelas', 'users', 'admin guru'], ['pengaturan', 'Pengaturan Sistem', 'gear', 'admin guru']];
  const SC = { belum: ['gray', 'Belum mulai'], mengerjakan: ['info', 'Mengerjakan'], selesai: ['ok', 'Selesai'], terkunci: ['bad', 'Terkunci'], terputus: ['warn', 'Terputus'] };
  const schip = s => `<span class="chip ${SC[s][0]}">${SC[s][1]}</span>`;

  async function render(root, parts, qs) {
    if (!root.querySelector('.shell')) shell(root);
    $$('.nav a', root).forEach(a => a.classList.toggle('on', a.dataset.k === parts[0]));
    $('#sd').classList.remove('open'); scrollTo(0, 0);
    const pg = $('#pg'); pg.innerHTML = '<div class="card mute">Memuat…</div>';
    const V = { dashboard: vDash, monitor: vMonitor, rekap: vRekap, bank: Staff2.bank, ujian: Staff2.ujian, siswa: Staff2.siswa, pengaturan: Staff2.pengaturan }[parts[0]];
    if (!V || !MENU.find(m => m[0] === parts[0] && m[3].includes(me().peran))) { pg.innerHTML = '<div class="card">Halaman tidak tersedia untuk peran Anda.</div>'; return; }
    try { await V(pg, parts[1], qs); } catch (e) { pg.innerHTML = `<div class="card note bad">${esc(e.message)}</div>`; }
  }
  function shell(root) {
    root.innerHTML = `<div class="shell"><aside class="side" id="sd"><a class="logo" href="#/"><i>${ic('grad', 22)}</i><div>EduExam Portal<small style="display:block;font:500 11px Inter;opacity:.8">Sistem Ujian Sekolah</small></div></a>
      <nav class="nav">${MENU.filter(m => m[3].includes(me().peran)).map(m => `<a href="#/staff/${m[0]}" data-k="${m[0]}">${ic(m[2])}${m[1]}${m[4] ? '<span class="live-b">LIVE</span>' : ''}</a>`).join('')}</nav>
      <div class="me"><span class="av">${ini(me().nama)}</span><div class="grow"><b>${esc(me().nama)}</b><small>${isAdm() ? 'Administrator' : 'Guru Pengawas'}</small></div><button class="ibtn" id="lo" style="background:none;border:0;color:#fff" title="Keluar" aria-label="Keluar">${ic('logout')}</button></div></aside>
      <div class="main"><div class="top"><button class="ibtn burger" id="bg" aria-label="Menu">${ic('menu')}</button><div class="srch">${ic('search', 18)}<input class="in" id="gs" placeholder="Cari siswa…" aria-label="Cari siswa"></div><span class="grow"></span><button class="ibtn" id="dk" title="Mode gelap" aria-label="Mode gelap">${ic('moon')}</button></div><div class="page" id="pg"></div></div></div>`;
    $('#bg').onclick = () => $('#sd').classList.toggle('open');
    $('#lo').onclick = async () => { await Api.call('auth.keluar').catch(() => { }); Api.clear(); location.hash = '#/'; };
    $('#dk').onclick = () => { const d = document.documentElement.dataset.theme === 'dark' ? '' : 'dark'; document.documentElement.dataset.theme = d; localStorage.setItem('scbt_theme', d); };
    $('#gs').onkeydown = e => { if (e.key === 'Enter' && e.target.value.trim()) { sessionStorage.setItem('scbt_q', e.target.value.trim()); e.target.value = ''; if (location.hash === '#/staff/siswa') Staff.reload(); else location.hash = '#/staff/siswa'; } };
  }
  const reload = () => { const h = location.hash; dispatchEvent(new HashChangeEvent('hashchange', { newURL: h })); };

  // ===== DASHBOARD =====
  async function vDash(pg) {
    const d = (await Api.call('dash.ringkas')).data;
    const kpi = (t, v, i, c) => `<div class="card kpi lift glow"><div><span class="mute">${t}</span><b>${v}</b></div><span class="ico ${c}">${ic(i, 22)}</span></div>`;
    const now = new Date(), y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), ex = {};
    d.mendatang.forEach(u => { const x = new Date(+u.mulai); if (x.getMonth() === m && x.getFullYear() === y) ex[x.getDate()] = 1; });
    const cal = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(x => `<span class="h">${x}</span>`).join('') + '<span></span>'.repeat(first) + [...Array(days)].map((_, i) => `<span class="${i + 1 === now.getDate() ? 'td' : ex[i + 1] ? 'ex' : ''}">${i + 1}</span>`).join('');
    pg.innerHTML = `<div class="row between"><div><h1>Dashboard Ujian</h1><div class="mute">Selamat datang kembali, <b>${esc(me().nama)}</b>. Siap mengawasi asesmen hari ini.</div></div>${isAdm() ? '' : `<a class="btn btn-p btn-cta" href="#/staff/ujian?baru=1">${ic('plus', 18)} Buat Ujian Baru</a>`}</div>
    <div class="grid g4">${kpi('Total Siswa', d.totalSiswa.toLocaleString('id-ID'), 'users', '')}${kpi('Ujian Aktif', d.ujianAktif, 'clip', '')}${kpi('Rata-rata Nilai', d.rata, 'chart', 'g')}${kpi('Pelanggaran Hari Ini', d.pelanggaranHariIni, 'shield', 'o')}</div>
    <div class="grid g2"><div class="card welcome glow"><div class="grow"><span class="chip">${ic('shield', 14)} Integritas &amp; Keamanan</span><h2 style="font-size:26px;margin:12px 0 8px">Tingkatkan Integritas Asesmen Daring!</h2><p class="mute">Pantau jalannya ujian secara real-time, deteksi pindah tab otomatis, dan rekam audit aktivitas siswa.</p><div class="row"><a class="btn btn-p btn-cta" href="#/staff/monitor">Buka Live Monitoring ${ic('arrow', 16)}</a></div></div><img alt="" src="${Art.uri('aman', 'ungu')}"></div>
    <div class="card"><div class="row between"><h3>Ujian Mendatang &amp; Berjalan</h3><a href="#/staff/ujian" class="sm b">Lihat semua</a></div><div style="margin-top:14px">${d.mendatang.length ? d.mendatang.slice(0, 4).map(u => { const x = new Date(+u.mulai); return `<a class="up lift" href="#/staff/monitor/${esc(u.id)}" style="color:inherit"><span class="d">${['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'][x.getMonth()]}<b>${x.getDate()}</b></span><div class="grow"><b>${esc(u.judul)}</b><div class="sm mute">${esc(u.kelas.join(', '))} · ${fmtJam(u.mulai)}–${fmtJam(u.selesai)}</div></div><span class="chip ${u.status === 'terbit' ? 'ok' : 'gray'}">${u.status}</span></a>`; }).join('') : '<div class="mute">Belum ada ujian terjadwal.</div>'}</div></div></div>
    <div class="grid g2"><div class="card"><div class="row between"><div><h3>Performa Nilai &amp; Tingkat Kelulusan</h3><div class="sm mute">Rerata nilai dan persentase lulus (KKM ${d.kkm}) 5 minggu terakhir</div></div><div class="row sm"><span class="chip">● Nilai rerata</span><span class="chip ok">● % Lulus</span></div></div><div id="lc" style="margin-top:10px"></div></div>
    <div class="card"><h3>Kalender Jadwal Ujian</h3><div class="sm mute" style="margin-bottom:12px">${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][m]} ${y}</div><div class="cal">${cal}</div></div></div>
    <div class="card"><div class="row between"><h3>Ujian Sedang Berlangsung <span class="chip ok" style="margin-left:8px">LIVE</span></h3><a class="btn btn-sm" href="#/staff/monitor">Buka Monitoring Penuh</a></div><div class="tw"><table class="tbl" style="margin-top:10px"><thead><tr><th>Ujian</th><th>Kelas</th><th>Peserta &amp; Progres</th><th>Pelanggaran</th><th></th></tr></thead><tbody>${d.live.length ? d.live.map(u => `<tr><td><b>${esc(u.judul)}</b><div class="sm mute">${esc(u.mapel)}</div></td><td>${esc(u.kelas.join(', '))}</td><td style="min-width:200px"><div class="sm">${u.selesaiN} selesai / ${u.mulaiN} mulai / ${u.peserta} peserta</div><div class="bar"><i style="width:${u.peserta ? u.selesaiN / u.peserta * 100 : 0}%"></i></div></td><td>${u.pelanggaran ? `<span class="chip warn">${u.pelanggaran} kejadian</span>` : '<span class="chip ok">0</span>'}</td><td><a class="btn btn-p btn-sm" href="#/staff/monitor/${esc(u.id)}">Pantau Langsung</a></td></tr>`).join('') : '<tr><td colspan="5" class="mute">Tidak ada ujian yang sedang berlangsung.</td></tr>'}</tbody></table></div></div>`;
    lineChart($('#lc'), d.trend);
  }

  // ===== LIVE MONITORING =====
  async function pickExam(pg, title, base) {
    const r = (await Api.call('ujian.daftarGuru')).data, now = r.now, aktif = r.ujian.find(u => u.status === 'terbit' && now >= u.mulai && now <= u.selesai);
    if (aktif) { location.replace(`#/staff/${base}/${aktif.id}`); return null; }
    pg.innerHTML = `<h1>${title}</h1><div class="card"><p class="mute">Tidak ada ujian yang sedang berlangsung. Pilih ujian:</p>${r.ujian.length ? r.ujian.map(u => `<a class="up lift" style="color:inherit" href="#/staff/${base}/${esc(u.id)}"><div class="grow"><b>${esc(u.judul)}</b><div class="sm mute">${fmtT(u.mulai)} · ${esc(u.kelas.join(', '))}</div></div><span class="chip">${u.selesaiN}/${u.peserta} selesai</span></a>`).join('') : '<div class="mute">Belum ada ujian.</div>'}</div>`;
    return r.ujian;
  }
  async function vMonitor(pg, id) {
    if (!id) { await pickExam(pg, 'Live Monitoring', 'monitor'); return; }
    const ex = (await Api.call('ujian.daftarGuru')).data.ujian, boot = (await Api.call('public.boot')).data, poll = Math.max(8, boot.polling || 12);
    const S = { f: 'semua', q: '', pg: 1, sel: null, d: null }; let busyL = false, lastF = 0, lastAct = Date.now();
    pg.innerHTML = `<div class="card"><div class="row between"><div><h1 style="font-size:24px">Live Monitoring Pengawasan Ujian</h1><span class="chip ok" style="margin:8px 0">● Diperbarui otomatis tiap ${poll} detik</span><br><select class="in" id="ms" style="max-width:520px;margin-top:6px">${ex.map(u => `<option value="${esc(u.id)}" ${u.id === id ? 'selected' : ''}>${esc(u.judul)}</option>`).join('')}</select></div><div class="row"><button class="btn" id="ta">${ic('clock', 16)} Tambah Waktu Massal (+15m)</button><button class="btn" id="rf">Segarkan Data</button><button class="btn btn-p" id="ek">${ic('upload', 16)} Ekspor Log</button></div></div></div>
    <div class="grid g4" id="tiles"></div><div class="grid g2" style="grid-template-columns:1.6fr 1fr;align-items:start"><div class="card"><div class="row" style="margin-bottom:14px"><div class="srch" style="position:relative;max-width:220px"><input class="in" id="mq" placeholder="Cari siswa…" style="height:38px;border-radius:999px"></div><div class="chips" id="fc"></div></div><div class="tw"><table class="tbl"><thead><tr><th>Siswa</th><th>Status sesi</th><th>Progres jawaban</th></tr></thead><tbody id="mt"></tbody></table></div><div class="row between" style="margin-top:12px"><span class="sm mute" id="mi"></span><div class="pager" id="mp"></div></div></div>
    <div style="display:grid;gap:20px"><div class="card" id="ins"></div><div class="card" id="int"></div></div></div>`;
    $('#ms').onchange = e => { location.hash = '#/staff/monitor/' + e.target.value; };
    on(window, 'pointerdown', () => lastAct = Date.now(), { passive: true }); on(window, 'keydown', () => lastAct = Date.now());
    async function load(fresh) {
      if (busyL) return; busyL = true; lastF = Date.now();
      try { S.d = (await Api.call('monitor.data', { idUjian: id, _fresh: !!fresh })).data; Api.syncClock(S.d.now); paint(); } catch (e) { if (fresh) fail(e); } finally { busyL = false; }
    }
    function filt() { return S.d.siswa.filter(s => (S.f === 'semua' || (S.f === 'pelanggaran' ? s.pelanggaran > 0 : S.f === 'terkunci' ? s.status === 'terkunci' : s.status === 'mengerjakan')) && (!S.q || (s.nama + s.nisn).toLowerCase().includes(S.q))); }
    function paint() {
      const d = S.d, r = d.ringkas, tot = d.siswa.length, tile = (t, v, sub, c, ic2) => `<div class="card kpi"><div><span class="mute">${t}</span><b class="${c}">${v}</b><span class="sm mute">${sub}</span></div><span class="ico ${c === 'ok' ? 'g' : c === 'bad' ? 'r' : ''}">${ic(ic2, 22)}</span></div>`;
      $('#tiles').innerHTML = tile('Belum Mulai', r.belum + ' siswa', 'Menunggu PIN/mulai', '', 'clock') + tile('Sedang Mengerjakan', r.mengerjakan + ` siswa (${tot ? Math.round(r.mengerjakan / tot * 100) : 0}%)`, 'Sesi aktif', '', 'clip') + tile('Selesai & Terkumpul', r.selesai + ' siswa', 'Jawaban tersimpan', 'ok', 'check') + tile('Terkunci / Terputus', (r.terkunci + r.terputus) + ' siswa', r.terkunci + ' terkunci · ' + r.terputus + ' terputus', 'bad', 'shield');
      $('#fc').innerHTML = [['semua', `Semua (${tot})`], ['mengerjakan', `Mengerjakan (${r.mengerjakan})`], ['pelanggaran', `Pelanggaran (${d.siswa.filter(s => s.pelanggaran > 0).length})`], ['terkunci', `Terkunci (${r.terkunci})`]].map(f => `<button data-f="${f[0]}" class="${S.f === f[0] ? 'on' : ''} ${f[0] === 'terkunci' ? 'red' : ''}">${f[1]}</button>`).join('');
      $$('#fc button').forEach(b => b.onclick = () => { S.f = b.dataset.f; S.pg = 1; paint(); });
      const L = filt(), per = 8, pages = Math.max(1, Math.ceil(L.length / per)); S.pg = Math.min(S.pg, pages);
      $('#mt').innerHTML = L.slice((S.pg - 1) * per, S.pg * per).map(s => { const p = s.total ? Math.round(s.terjawab / s.total * 100) : 0, col = s.status === 'terkunci' ? 'var(--bad)' : s.pelanggaran ? 'var(--warn)' : 'var(--ok)'; return `<tr data-id="${esc(s.id)}" style="cursor:pointer" class="${s.status === 'terkunci' ? 'rb' : s.pelanggaran ? 'rw' : ''} ${S.sel === s.id ? 'sel' : ''}"><td><div class="row" style="flex-wrap:nowrap"><span class="av">${ini(s.nama)}</span><div><b>${esc(s.nama)}</b><div class="sm mute">NIS: ${esc(s.nisn)} · ${esc(s.kelas)}</div>${s.pelanggaran ? `<div class="sm" style="color:var(--warn)">${s.pelanggaran} pelanggaran</div>` : ''}</div></div></td><td>${schip(s.status)}</td><td style="min-width:150px"><div class="sm tab">${s.terjawab} / ${s.total} soal · ${p}%</div><div class="bar"><i style="width:${p}%;background:${col}"></i></div></td></tr>`; }).join('') || '<tr><td colspan="3" class="mute">Tidak ada siswa.</td></tr>';
      $$('#mt tr[data-id]').forEach(tr => tr.onclick = () => { S.sel = tr.dataset.id; paint(); });
      $('#mi').textContent = `Menampilkan ${Math.min(per, L.length - (S.pg - 1) * per)} dari ${L.length} siswa`;
      $('#mp').innerHTML = [...Array(pages)].map((_, i) => `<button class="${i + 1 === S.pg ? 'on' : ''}" data-p="${i + 1}">${i + 1}</button>`).join(''); $$('#mp button').forEach(b => b.onclick = () => { S.pg = +b.dataset.p; paint(); });
      inspector(); const ok = d.siswa.filter(s => s.pelanggaran === 0).length, ip = tot ? Math.round(ok / tot * 1000) / 10 : 100;
      $('#int').innerHTML = `<div class="row between"><h3>${ic('shield', 18)} Integritas Ruang Ujian</h3><b style="font:800 24px 'Plus Jakarta Sans';color:var(--ok)">${ip}%</b></div><p class="sm mute">Persentase peserta tanpa pelanggaran tercatat.</p><div class="bar"><i style="width:${ip}%"></i></div>`;
    }
    function inspector() {
      const d = S.d, s = d.siswa.find(x => x.id === S.sel) || d.siswa.find(x => x.status === 'terkunci') || d.siswa[0]; if (s) S.sel = s.id;
      $('#ins').innerHTML = (s ? `<div class="row between"><span class="sm b mute">PEMERIKSA SISWA</span>${schip(s.status)}</div><div class="row" style="margin:12px 0;background:var(--soft);border-radius:16px;padding:12px"><span class="av" style="width:48px;height:48px">${ini(s.nama)}</span><div><b>${esc(s.nama)}</b><div class="sm mute">NIS: ${esc(s.nisn)} · ${esc(s.kelas)}</div></div></div>
      <div class="grid g2e" style="gap:10px"><div class="card tab" style="padding:12px;text-align:center"><div class="sm mute">Sisa Waktu</div><b style="font-size:22px;color:var(--primary)">${s.status === 'belum' ? '—' : fmtMS(s.sisa)}</b></div><div class="card tab" style="padding:12px;text-align:center"><div class="sm mute">Progres Soal</div><b style="font-size:22px">${s.terjawab} / ${s.total}</b></div></div>
      <div style="display:grid;gap:8px;margin-top:14px">${s.status === 'terkunci' ? `<button class="btn btn-p" data-a="buka">${ic('lock', 16)} Buka Kunci Siswa</button>` : ''}<div class="row"><button class="btn grow" data-a="tambah">${ic('clock', 16)} +10 Menit</button><button class="btn btn-d grow" data-a="kumpul">Paksa Kumpul</button></div><button class="btn btn-sm" data-a="reset">Reset sesi siswa</button></div>` : '<div class="mute">Tidak ada siswa.</div>') +
        `<h3 style="margin:20px 0 10px">Log Pelanggaran Real-Time</h3>${d.log.length ? d.log.map(l => `<div class="row" style="align-items:flex-start;flex-wrap:nowrap;margin-bottom:10px"><span style="width:10px;height:10px;border-radius:50%;background:var(--warn);margin-top:5px;flex:none"></span><div class="grow"><b>${esc(l.nama)}</b><div class="sm mute">${esc({ tab: 'Pindah tab / jendela', fullscreen: 'Keluar layar penuh', salin: 'Salin / tempel', klik_kanan: 'Klik kanan' }[l.jenis] || l.jenis)}</div></div><span class="sm mute">${fmtJam(l.t)}</span></div>`).join('') : '<div class="mute sm">Belum ada pelanggaran.</div>'}`;
      $$('#ins [data-a]').forEach(b => b.onclick = async () => {
        const a = b.dataset.a; if (a === 'reset' || a === 'kumpul') { if (!await confirmBox(a === 'reset' ? 'Reset sesi siswa ini? Jawaban dihapus dan waktu dimulai ulang.' : 'Paksa kumpulkan jawaban siswa ini?', 'Ya', true)) return; }
        try { const r = await Api.call('monitor.aksi', { idUjian: id, aksi: a, idSiswa: s.id, menit: 10 }); toast(r.message); load(true); } catch (e) { fail(e); }
      });
    }
    $('#mq').oninput = e => { S.q = e.target.value.toLowerCase(); S.pg = 1; if (S.d) paint(); };
    $('#rf').onclick = () => load(true);
    $('#ta').onclick = async () => { if (await confirmBox('Tambah 15 menit untuk semua siswa yang sedang mengerjakan/terkunci?')) try { const r = await Api.call('monitor.aksi', { idUjian: id, aksi: 'tambah', menit: 15 }); toast(r.message); load(true); } catch (e) { fail(e); } };
    $('#ek').onclick = () => { if (!S.d) return; csvDownload('log-pengawasan.csv', [['Nama', 'NIS', 'Kelas', 'Status', 'Terjawab', 'Total', 'Pelanggaran']].concat(S.d.siswa.map(s => [s.nama, s.nisn, s.kelas, s.status, s.terjawab, s.total, s.pelanggaran]))); };
    await load(true);
    every(() => { if (document.hidden) return; const idle = Date.now() - lastAct > 120000; if (Date.now() - lastF >= (idle ? 60000 : poll * 1000) - 500) load(); }, 1000);
  }

  // ===== REKAP & ANALISIS =====
  async function vRekap(pg, id) {
    if (!id) { await pickExam2(pg); return; }
    const ex = (await Api.call('ujian.daftarGuru')).data.ujian; let D = (await Api.call('rekap.ujian', { idUjian: id })).data; const S = { q: '', k: '', sort: 'nilai' };
    pg.innerHTML = `<div class="row between"><div><h1>Rekap &amp; Analisis Nilai</h1><select class="in" id="rs" style="max-width:480px;margin-top:8px">${ex.map(u => `<option value="${esc(u.id)}" ${u.id === id ? 'selected' : ''}>${esc(u.judul)}</option>`).join('')}</select></div><div class="row no-print"><button class="btn" id="dl">${ic('download', 16)} Unduh CSV (Excel)</button><button class="btn" id="pr">${ic('print', 16)} Cetak / PDF</button><button class="btn" id="sy" title="Salin data ke sheet Jawaban">Sinkron ke Sheet</button></div></div><div id="rb" class="page" style="padding:0"></div>`;
    $('#rs').onchange = e => { location.hash = '#/staff/rekap/' + e.target.value; };
    $('#dl').onclick = () => csvDownload('nilai-' + D.ujian.judul.replace(/\W+/g, '-') + '.csv', [['NISN', 'Nama', 'Kelas', 'Nilai', 'Pelanggaran', 'Perlu koreksi']].concat(D.rows.map(r => [r.nisn, r.nama, r.kelas, r.nilai, r.pelanggaran, r.perluKoreksi ? 'ya' : ''])));
    $('#pr').onclick = () => { document.body.classList.add('rekap-print'); print(); setTimeout(() => document.body.classList.remove('rekap-print'), 500); };
    $('#sy').onclick = async e => { await busy(e.currentTarget, async () => { try { await Api.call('rekap.ujian', { idUjian: id, sinkron: true }); toast('Sheet "Jawaban" diperbarui.'); } catch (er) { fail(er); } }); };
    function body() {
      const s = D.stat, lab = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-100'], kl = [...new Set(D.rows.map(r => r.kelas))];
      let rows = D.rows.filter(r => (!S.k || r.kelas === S.k) && (!S.q || (r.nama + r.nisn).toLowerCase().includes(S.q))).sort((a, b) => S.sort === 'nama' ? a.nama.localeCompare(b.nama) : b.nilai - a.nilai);
      $('#rb').innerHTML = `<div class="grid g4"><div class="card kpi"><div><span class="mute">Selesai / Peserta</span><b>${s.n} / ${s.peserta}</b></div></div><div class="card kpi"><div><span class="mute">Rata-rata</span><b>${s.rata}</b></div></div><div class="card kpi"><div><span class="mute">Tertinggi / Terendah</span><b>${s.maks} / ${s.min}</b></div></div><div class="card kpi"><div><span class="mute">Lulus (KKM ${D.kkm})</span><b class="${s.lulus >= 75 ? '' : ''}" style="color:var(--ok)">${s.lulus}%</b></div></div></div>
      <div class="grid g2e"><div class="card"><h3>Sebaran Nilai</h3><div id="c1"></div></div><div class="card"><h3>Rata-rata per Kelas</h3><div id="c2"></div></div></div>
      <div class="card"><div class="row between"><h3>Tabel Nilai</h3><div class="row no-print"><input class="in" id="q" placeholder="Cari nama/NISN…" style="width:220px;height:38px" value="${esc(S.q)}"><select class="in" id="fk" style="width:160px;height:38px"><option value="">Semua kelas</option>${kl.map(k => `<option ${k === S.k ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select><select class="in" id="so" style="width:150px;height:38px"><option value="nilai">Urut nilai</option><option value="nama" ${S.sort === 'nama' ? 'selected' : ''}>Urut nama</option></select></div></div><div class="tw"><table class="tbl" style="margin-top:10px"><thead><tr><th>NISN</th><th>Nama</th><th>Kelas</th><th>Nilai</th><th>Pelanggaran</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r.nisn)}</td><td>${esc(r.nama)}</td><td>${esc(r.kelas)}</td><td><b style="color:${r.nilai >= D.kkm ? 'var(--ok)' : 'var(--bad)'}">${r.nilai}</b>${r.perluKoreksi ? ' <span class="chip warn">uraian belum dinilai</span>' : ''}</td><td>${r.pelanggaran}</td></tr>`).join('') || '<tr><td colspan="5" class="mute">Belum ada nilai.</td></tr>'}</tbody></table></div></div>
      <div class="card"><h3>Analisis Butir Soal</h3><div class="sm mute">Tingkat kesukaran = % skor yang diperoleh peserta pada soal tersebut. Rendah = sukar.</div><div class="tw"><table class="tbl" style="margin-top:10px"><thead><tr><th>No</th><th>Soal</th><th>Tipe</th><th>% Benar</th><th>Kategori</th></tr></thead><tbody>${D.butir.map(b => { const k = b.p === null ? ['gray', 'dinilai manual'] : b.p >= 70 ? ['ok', 'mudah'] : b.p >= 30 ? ['info', 'sedang'] : ['bad', 'sukar']; return `<tr><td>${b.no}</td><td>${esc(b.pertanyaan)}</td><td>${esc(b.tipe)}</td><td>${b.p === null ? '—' : b.p + '%'}</td><td><span class="chip ${k[0]}">${k[1]}</span></td></tr>`; }).join('')}</tbody></table></div></div>
      ${D.uraian.length ? `<div class="card no-print"><h3>Koreksi Soal Uraian</h3><div class="tw"><table class="tbl"><thead><tr><th>Siswa</th><th>Soal &amp; jawaban</th><th>Skor (maks)</th><th></th></tr></thead><tbody>${D.uraian.map((u, i) => `<tr><td>${esc(u.siswa)}</td><td style="max-width:420px"><div class="sm mute">${esc(u.pertanyaan)}</div><div style="white-space:pre-wrap">${esc(u.jawaban)}</div></td><td><input class="in" type="number" min="0" max="${u.bobot}" step="0.5" id="ks${i}" style="width:90px;height:38px" value="${u.skor == null ? '' : Math.round(u.skor * u.bobot * 100) / 100}"> / ${u.bobot}</td><td><button class="btn btn-sm btn-p" data-k="${i}">Simpan</button></td></tr>`).join('')}</tbody></table></div></div>` : ''}`;
      barChart($('#c1'), D.bins, lab); barChart($('#c2'), D.kelas.map(k => k.rata), D.kelas.map(k => k.kelas), 100);
      $('#q').oninput = e => { S.q = e.target.value; body(); $('#q').focus(); $('#q').setSelectionRange(S.q.length, S.q.length); }; $('#fk').onchange = e => { S.k = e.target.value; body(); }; $('#so').onchange = e => { S.sort = e.target.value; body(); };
      $$('[data-k]', $('#rb')).forEach(b => b.onclick = async () => { const u = D.uraian[+b.dataset.k], v = parseFloat($('#ks' + b.dataset.k).value); if (isNaN(v) || v < 0 || v > u.bobot) return toast('Skor harus 0–' + u.bobot, 'err'); try { await Api.call('koreksi.simpan', { sid: u.sid, idSoal: u.idSoal, frac: v / u.bobot }); toast('Nilai uraian tersimpan.'); D = (await Api.call('rekap.ujian', { idUjian: id })).data; body(); } catch (e) { fail(e); } });
    }
    body();
  }
  async function pickExam2(pg) {
    const r = (await Api.call('ujian.daftarGuru')).data;
    pg.innerHTML = `<h1>Rekap &amp; Analisis Nilai</h1><div class="card"><p class="mute">Pilih ujian:</p>${r.ujian.length ? r.ujian.map(u => `<a class="up lift" style="color:inherit" href="#/staff/rekap/${esc(u.id)}"><div class="grow"><b>${esc(u.judul)}</b><div class="sm mute">${fmtT(u.mulai)} · ${esc(u.kelas.join(', '))}</div></div><span class="chip">${u.selesaiN} selesai</span></a>`).join('') : '<div class="mute">Belum ada ujian.</div>'}</div>`;
  }
  return { render, reload };
})();
