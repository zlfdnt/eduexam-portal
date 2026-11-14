// Sisi siswa: daftar ujian + ruang ujian (fokus, autosave, anti-kecurangan).
const Exam = (() => {
  const L = n => String.fromCharCode(65 + n);
  async function home(root) {
    const me = Api.S.me;
    root.innerHTML = `<div class="ex-top"><a class="logo" href="#/siswa"><i style="background:var(--grad);color:#fff">${ic('grad', 20)}</i>EduExam Portal</a><span class="grow"></span><span class="chip">${ic('users', 14)} ${esc(me.nama)} · ${esc(me.kelas || '')}</span><button class="btn btn-sm" id="out">${ic('logout', 16)} Keluar</button></div>
    <div class="page" style="max-width:900px;margin:0 auto"><h1>Halo, ${esc(me.nama.split(' ')[0])} 👋</h1><div id="ul" class="grid"><div class="card mute">Memuat ujian…</div></div></div>`;
    $('#out').onclick = async () => { await Api.call('auth.keluar').catch(() => { }); Api.clear(); location.hash = '#/'; };
    try {
      const r = (await Api.call('ujian.daftarSiswa')).data; Api.syncClock(r.now); const now = Api.now();
      $('#ul').innerHTML = r.ujian.length ? r.ujian.map(u => {
        const s = u.sesi, open = now >= u.mulai && now <= u.selesai, st = s && s.status === 'selesai' ? ['ok', 'Selesai'] : s && s.status === 'terkunci' ? ['bad', 'Terkunci'] : s ? ['warn', 'Sedang dikerjakan'] : now < u.mulai ? ['gray', 'Belum dibuka'] : now > u.selesai ? ['gray', 'Berakhir'] : ['', 'Siap dikerjakan'];
        const can = s ? s.status !== 'selesai' && (open || s.status === 'mengerjakan') : open;
        return `<div class="card lift"><div class="row between"><div><h3>${esc(u.judul)}</h3><div class="mute">${esc(u.mapel)} · ${u.durasi} menit</div><div class="sm mute" style="margin-top:4px">${ic('clock', 14)} ${fmtT(u.mulai)} – ${fmtJam(u.selesai)}</div></div><div class="row"><span class="chip ${st[0]}">${st[1]}${s && s.nilai != null ? ' · Nilai ' + s.nilai : ''}</span>${can ? `<a class="btn btn-p btn-cta" href="#/ujian/${esc(u.id)}">${s ? 'Lanjutkan' : 'Mulai'} ${ic('arrow', 16)}</a>` : ''}</div></div></div>`;
      }).join('') : '<div class="card mute">Belum ada ujian untuk kelasmu.</div>';
    } catch (e) { $('#ul').innerHTML = `<div class="card note bad">${esc(e.message)}</div>`; }
  }

  async function room(root, id) {
    const me = Api.S.me, BK = `scbt_bk_${id}_${me.id}`, FS = !!document.documentElement.requestFullscreen;
    let X = null, done = false, saving = false, timer = null, lastRep = 0, st = 'ok'; const ovl = () => $('#ovl');
    Lens.show(false);
    root.innerHTML = `<div class="ex-top"><b>EduExam Portal</b></div><div class="page" style="max-width:640px;margin:30px auto"><div class="card"><h2>Sebelum mulai</h2><ul style="line-height:2"><li>Ujian berjalan dalam <b>mode layar penuh</b>${FS ? '' : ' (perangkat ini tidak mendukung layar penuh; pindah tab tetap dicatat)'}.</li><li>Berpindah tab/jendela, keluar layar penuh, dan salin-tempel <b>dicatat</b> dan dapat mengunci ujianmu.</li><li>Jawaban tersimpan otomatis. Jika koneksi putus, tetap kerjakan — jawaban dikirim ulang saat tersambung.</li><li>Waktu dihitung oleh server.</li></ul><div class="row end"><a class="btn" href="#/siswa">Kembali</a><button class="btn btn-p btn-cta" id="st">Mulai Ujian ${ic('arrow', 16)}</button></div></div></div>`;
    $('#st').onclick = async e => {
      const b = e.currentTarget; b.disabled = true;
      if (FS) { try { await document.documentElement.requestFullscreen(); } catch (x) { } }
      try { const r = (await Api.call('ujian.mulai', { idUjian: id })).data; if (r.selesai) return result(r); init(r); }
      catch (er) { toast(er.message, 'err'); b.disabled = false; if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); }
    };

    function init(r) {
      Api.syncClock(r.now);
      X = { soal: r.soal, i: 0, a: r.a || {}, r: r.r || {}, dA: {}, dR: {}, end: Date.now() + r.sisa * 1000, p: r.p, batas: r.batas, mode: r.mode, judul: r.judul, mapel: r.mapel, fs: 18, locked: r.status === 'terkunci' };
      try { const b = JSON.parse(localStorage.getItem(BK) || 'null'); if (b) { Object.keys(b.a || {}).forEach(k => { if (!(k in X.a)) { X.a[k] = b.a[k]; X.dA[k] = b.a[k]; } }); Object.keys(b.r || {}).forEach(k => { if (!(k in X.r)) { X.r[k] = 1; X.dR[k] = true; } }); } } catch (e) { }
      shell(); draw(); guards(); if (X.locked) lock();
      timer = setInterval(tick, 1000); Leave.add(() => clearInterval(timer));
      let n = 0; every(() => { n++; if (X.locked ? n % 6 === 0 : n % 20 === 0) save(true); }, 1000);
      if (Object.keys(X.dA).length || Object.keys(X.dR).length) save(true);
    }
    const ans = q => { const v = X.a[q.id]; return q.t === 'pgk' ? Array.isArray(v) && v.length > 0 : q.t === 'jodoh' ? v && Object.values(v).some(x => x !== '' && x != null) : q.t === 'isian' || q.t === 'uraian' ? String(v || '').trim() !== '' : v !== undefined && v !== null; };
    const cnt = () => ({ a: X.soal.filter(ans).length, r: X.soal.filter(q => X.r[q.id]).length });
    function shell() {
      root.innerHTML = `<div class="ex-top"><b class="logo" style="font-size:18px">EduExam Portal</b><span class="chip">${esc(X.judul)}</span><span class="chip">${esc(me.nama)}</span><span class="grow"></span><span class="timer" id="tm">--:--:--</span><span class="chip ok" id="sv">Tersimpan otomatis</span><span class="chip warn" id="pv"></span><button class="btn btn-sm" id="pb">${ic('dash', 14)} Daftar soal</button></div>
      <div class="ex"><div class="card" id="qc"></div><aside class="pal-wrap" id="pw"><div class="card"><div class="row between"><b>Daftar Nomor Soal</b><span class="chip" id="pn"></span></div><div class="pal" id="pal" style="margin-top:12px"></div>
      <div class="sm mute" style="margin:12px 0"><span class="chip">Biru: dijawab</span> <span class="chip warn">Oranye: ragu</span></div><div class="bar"><i id="pgb"></i></div><div class="sm mute" id="pgt" style="margin:6px 0 14px"></div><button class="btn btn-ok btn-lg" id="fin" style="width:100%">${ic('check', 18)} Selesai &amp; Kumpulkan</button><p class="sm mute" style="text-align:center;margin:8px 0 0">Jawaban dikunci otomatis saat waktu habis.</p></div></aside></div><div id="ovl"></div>`;
      $('#pb').onclick = () => $('#pw').classList.toggle('open'); $('#fin').onclick = finish; pv();
    }
    function pv() { const p = $('#pv'); if (p) p.innerHTML = `${ic('shield', 14)} Pelanggaran: ${X.p}${X.batas ? '/' + X.batas : ''}`; }
    function draw() {
      const q = X.soal[X.i], on = X.a[q.id];
      let body = '';
      if (q.t === 'pg') body = q.o.map((oi, j) => `<button class="opt ${on === oi ? 'on' : ''}" data-v="${oi}"><span class="k">${L(j)}</span><span>${esc(q.p[oi])}</span></button>`).join('');
      else if (q.t === 'pgk') body = `<div class="sm mute" style="margin-bottom:8px">Pilih satu atau lebih jawaban benar.</div>` + q.o.map((oi, j) => `<button class="opt ${Array.isArray(on) && on.includes(oi) ? 'on' : ''}" data-v="${oi}"><span class="k">${L(j)}</span><span>${esc(q.p[oi])}</span></button>`).join('');
      else if (q.t === 'jodoh') body = q.p.kiri.map((k, i) => `<div class="row" style="margin-bottom:10px"><span class="grow b">${esc(k)}</span><select class="in" style="max-width:55%" data-k="${i}"><option value="">Pilih pasangan…</option>${q.o.map(oi => `<option value="${oi}" ${on && String(on[i]) === String(oi) ? 'selected' : ''}>${esc(q.p.kanan[oi])}</option>`).join('')}</select></div>`).join('');
      else if (q.t === 'isian') body = `<input class="in" id="ti" placeholder="Ketik jawabanmu…" value="${esc(on || '')}" autocomplete="off" style="font-size:16px">`;
      else body = `<textarea class="in" id="ti" rows="8" placeholder="Tulis jawabanmu…" style="font-size:16px">${esc(on || '')}</textarea>`;
      const tl = { pg: 'Pilihan Ganda', pgk: 'Pilihan Ganda Kompleks', jodoh: 'Menjodohkan', isian: 'Isian Singkat', uraian: 'Uraian' }[q.t];
      $('#qc').innerHTML = `<div class="row between"><div class="row"><span class="chip" style="background:var(--primary);color:#fff;font-size:14px;padding:5px 16px">Soal No. ${X.i + 1}</span><span class="mute">dari ${X.soal.length} soal</span></div><div class="row"><span class="chip gray">Bobot: ${q.b}</span><span class="chip">${tl}</span><span class="chip gray"><a href="javascript:void 0" id="fm" style="color:inherit">A−</a> <a href="javascript:void 0" id="fp" style="color:inherit">A+</a></span></div></div>
      <div class="qtext" style="font-size:${X.fs}px">${esc(q.q)}</div>${q.img ? `<img class="qimg" alt="Gambar soal" src="${esc(q.img)}">` : ''}<div id="ob">${body}</div>
      <div class="nav-btns"><button class="btn" id="pr" ${X.i ? '' : 'disabled'}>${ic('back', 16)} Soal Sebelumnya</button><button class="btn ${X.r[q.id] ? 'btn-d' : ''}" id="rg" style="background:${X.r[q.id] ? '' : '#FFFBEB'};color:#b45309">${ic('flag', 16)} ${X.r[q.id] ? 'Batalkan Ragu-ragu' : 'Tandai Ragu-ragu'}</button><button class="btn btn-p" id="nx" ${X.i < X.soal.length - 1 ? '' : 'disabled'}>Soal Berikutnya ${ic('arrow', 16)}</button></div>`;
      const ob = $('#ob');
      if (q.t === 'pg') $$('.opt', ob).forEach(b => b.onclick = () => { setA(q, +b.dataset.v); draw(); });
      else if (q.t === 'pgk') $$('.opt', ob).forEach(b => b.onclick = () => { const v = +b.dataset.v, cur = Array.isArray(X.a[q.id]) ? X.a[q.id].slice() : []; const k = cur.indexOf(v); k < 0 ? cur.push(v) : cur.splice(k, 1); setA(q, cur); draw(); });
      else if (q.t === 'jodoh') $$('select', ob).forEach(s => s.onchange = () => { const cur = { ...(X.a[q.id] || {}) }; cur[s.dataset.k] = s.value === '' ? '' : +s.value; setA(q, cur); pal(); });
      else $('#ti').oninput = e => { setA(q, e.target.value, 1600); pal(); };
      $('#pr').onclick = () => go(X.i - 1); $('#nx').onclick = () => go(X.i + 1);
      $('#rg').onclick = () => { const on2 = !X.r[q.id]; on2 ? X.r[q.id] = 1 : delete X.r[q.id]; X.dR[q.id] = on2; persist(); sched(500); draw(); };
      $('#fm').onclick = () => { X.fs = Math.max(14, X.fs - 2); draw(); }; $('#fp').onclick = () => { X.fs = Math.min(26, X.fs + 2); draw(); };
      pal();
    }
    function pal() {
      const c = cnt(); $('#pal').innerHTML = X.soal.map((q, i) => `<button class="${X.r[q.id] ? 'r' : ans(q) ? 'a' : ''} ${i === X.i ? 'c' : ''}" data-i="${i}">${i + 1}</button>`).join('');
      $$('#pal button').forEach(b => b.onclick = () => go(+b.dataset.i));
      $('#pn').textContent = `${X.i + 1}/${X.soal.length}`; $('#pgb').style.width = c.a / X.soal.length * 100 + '%'; $('#pgt').textContent = `${c.a} dijawab · ${c.r} ragu-ragu · ${X.soal.length - c.a} belum`;
    }
    function go(i) { if (i < 0 || i >= X.soal.length) return; X.i = i; $('#pw').classList.remove('open'); draw(); scrollTo(0, 0); }
    let t0;
    function setA(q, v, ms) { X.a[q.id] = v; X.dA[q.id] = v; persist(); sched(ms || 900); }
    function sched(ms) { clearTimeout(t0); t0 = setTimeout(() => save(false), ms); }
    function persist() { try { localStorage.setItem(BK, JSON.stringify({ a: X.a, r: X.r })); } catch (e) { } }
    function sv(s) { st = s; const e = $('#sv'); if (!e) return; e.className = 'chip ' + (s === 'ok' ? 'ok' : s === 'sav' ? 'info' : 'bad'); e.textContent = s === 'ok' ? 'Tersimpan otomatis' : s === 'sav' ? 'Menyimpan…' : 'Offline — dicoba lagi'; }
    async function save(hb) {
      if (done || saving) return; const ja = { ...X.dA }, rg = { ...X.dR };
      if (!hb && !Object.keys(ja).length && !Object.keys(rg).length) return;
      saving = true; sv('sav');
      try {
        const r = (await Api.call('ujian.simpanJawab', { idUjian: id, jawaban: ja, ragu: rg })).data;
        Api.syncClock(r.now); Object.keys(ja).forEach(k => { if (JSON.stringify(X.dA[k]) === JSON.stringify(ja[k])) delete X.dA[k]; }); Object.keys(rg).forEach(k => { if (X.dR[k] === rg[k]) delete X.dR[k]; });
        if (r.selesai) { result(r); return; }
        if (Math.abs(Date.now() + r.sisa * 1000 - X.end) > 3000) X.end = Date.now() + r.sisa * 1000;
        X.p = r.p; pv(); sv('ok');
        if (r.status === 'terkunci' && !X.locked) lock(); else if (r.status === 'mengerjakan' && X.locked) unlock();
      } catch (e) { sv('off'); if (e.code === 'LOCKED') lock(); } finally { saving = false; }
    }
    function tick() { if (done) return; const s = Math.max(0, Math.round((X.end - Date.now()) / 1000)), t = $('#tm'); if (t) { t.textContent = fmtD(s); t.classList.toggle('low', s < 300); } if (s <= 0 && !X.over) { X.over = true; toast('Waktu habis. Mengumpulkan jawaban…'); submit(); } }
    async function finish() {
      const c = cnt(), n = X.soal.length - c.a;
      if (await confirmBox(`${n ? n + ' soal belum dijawab. ' : ''}${c.r ? c.r + ' soal masih ragu-ragu. ' : ''}Kumpulkan ujian sekarang? Jawaban tidak dapat diubah setelah dikumpulkan.`, 'Ya, Kumpulkan')) submit();
    }
    async function submit() {
      if (done) return; clearTimeout(t0); await save(true).catch(() => { });
      for (let i = 0; i < 3; i++) { try { const r = (await Api.call('ujian.kumpul', { idUjian: id, jawaban: X.dA })).data; return result(r); } catch (e) { if (e.code === 'LOCKED') { toast(e.message, 'err'); lock(); return; } if (i === 2) { toast(e.message + ' Coba lagi.', 'err'); X.over = false; return; } await sleep(1200); } }
    }
    function result(r) {
      done = true; clearInterval(timer); try { localStorage.removeItem(BK); } catch (e) { } if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); Lens.show(true); document.body.classList.remove('no-sel');
      root.innerHTML = `<div class="auth"><div class="auth-card"><div class="lg" style="background:var(--ok)">${ic('check', 36)}</div><h2>Ujian terkumpul</h2><p class="mute">Jawabanmu sudah tersimpan di server.</p>${r.tampil === 'langsung' && r.nilai != null ? `<div style="font:800 56px 'Plus Jakarta Sans';color:var(--primary)">${r.nilai}</div><div class="mute">Nilai sementara${'' }</div>` : `<div class="note">Nilai akan diumumkan oleh gurumu.</div>`}<a class="btn btn-p btn-lg" style="margin-top:18px" href="#/siswa">Kembali ke daftar ujian</a></div></div>`;
    }
    // ----- anti-kecurangan -----
    function report(jenis) {
      if (done || !X) return; const t = Date.now(); if (jenis !== 'klik_kanan') { if (t - lastRep < 2000) return; lastRep = t; }
      Api.call('ujian.pelanggaran', { idUjian: id, jenis }).then(r => { X.p = r.data.p ?? X.p; pv(); if (r.data.status === 'terkunci') lock(); else if (jenis !== 'klik_kanan') toast(`Peringatan: tindakan terdeteksi (${jenis.replace('_', ' ')}). Pelanggaran ${X.p}${X.batas ? '/' + X.batas : ''}.`, 'err'); }).catch(() => { });
    }
    function guards() {
      document.body.classList.add('no-sel');
      on(document, 'visibilitychange', () => { if (document.hidden) report('tab'); });
      on(window, 'blur', () => { if (!document.hidden) report('tab'); });
      on(document, 'fullscreenchange', () => { if (done) return; if (!document.fullscreenElement && FS) { report('fullscreen'); fsOv(); } else if (ovl()) $('#fso') && $('#fso').remove(); });
      ['copy', 'cut', 'paste'].forEach(ev => on(document, ev, e => { e.preventDefault(); report('salin'); }));
      on(document, 'contextmenu', e => { e.preventDefault(); report('klik_kanan'); });
      on(window, 'beforeunload', e => { if (!done) { e.preventDefault(); e.returnValue = ''; } });
      Leave.add(() => { document.body.classList.remove('no-sel'); Lens.show(true); if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); });
    }
    function fsOv() { if (!ovl() || $('#fso')) return; ovl().insertAdjacentHTML('beforeend', `<div class="lockov" id="fso"><div class="box"><div style="font-size:48px">⚠️</div><h2 style="color:#fff">Kembali ke layar penuh</h2><p>Ujian harus dikerjakan dalam layar penuh. Waktu tetap berjalan.</p><button class="btn btn-p btn-lg" id="fsb">Masuk layar penuh</button></div></div>`); $('#fsb').onclick = async () => { try { await document.documentElement.requestFullscreen(); } catch (e) { } $('#fso') && $('#fso').remove(); }; }
    function lock() { X.locked = true; if (!ovl() || $('#lko')) return; ovl().insertAdjacentHTML('beforeend', `<div class="lockov" id="lko"><div class="box"><div style="font-size:52px">🔒</div><h2 style="color:#fff">Ujian terkunci</h2><p>Terdeteksi pelanggaran melebihi batas. Hubungi guru pengawas untuk membuka kunci. Jawabanmu tetap aman; halaman ini akan terbuka otomatis setelah dibuka.</p></div></div>`); }
    function unlock() { X.locked = false; $('#lko') && $('#lko').remove(); toast('Kunci dibuka. Silakan lanjutkan.'); }
  }
  return { home, room };
})();
