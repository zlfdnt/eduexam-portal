// Panel guru/admin (lanjutan): bank soal, manajemen ujian, siswa & kelas, pengaturan.
const Staff2 = (() => {
  const me = () => Api.S.me, L = n => String.fromCharCode(65 + n);
  const TL = { pg: 'Pilihan Ganda', pgk: 'PG Kompleks', jodoh: 'Menjodohkan', isian: 'Isian Singkat', uraian: 'Uraian' };

  // ===================== BANK SOAL (terarsip per koleksi: mata pelajaran → kelas → materi) =====================
  const kn = s => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const kchips = ks => ks.map(k => `<span class="chip">${esc(k)}</span>`).join(' ');
  const tipeCount = list => Object.entries(list.reduce((o, s) => (o[s.tipe] = (o[s.tipe] || 0) + 1, o), {})).map(([t, n]) => `<span class="chip gray">${TL[t]} ${n}</span>`).join(' ');

  async function bank(pg, id) {
    let D = (await Api.call('bank.daftar')).data; const S = { q: '', m: '', t: '' }, sel = new Set();
    const kolOf = s => D.koleksi.find(k => k.id === s.idKoleksi), lama = () => D.soal.filter(s => !kolOf(s)), diampu = mapel => D.penugasan.find(a => kn(a.mapel) === kn(mapel));
    const refresh = async () => { D = (await Api.call('bank.daftar')).data; sel.clear(); id ? folder() : home(); };
    const label = k => `${k.mapel} · ${k.kelas.join(', ')} · ${k.materi}`;

    // ----- tingkat 1: daftar koleksi, dikelompokkan per mata pelajaran -----
    function home() {
      const mapelList = [...new Set(D.koleksi.map(k => k.mapel))].sort();
      pg.innerHTML = `<div class="row between"><div><h1>Bank Soal</h1><div class="mute">Arsipkan soal per koleksi: mata pelajaran → kelas → materi.</div></div><button class="btn btn-p btn-cta" id="nk">${ic('plus', 16)} Koleksi Baru</button></div>
      ${D.penugasan.length ? `<div class="note">${ic('book', 16)}<span>Penugasan Anda: ${D.penugasan.map(a => `<b>${esc(a.mapel)}</b> (${esc(a.kelas.join(', '))})`).join(' · ')}</span></div>` : `<div class="note warn">${ic('lock', 16)}<span>Anda belum memiliki penugasan mata pelajaran/kelas, sehingga belum bisa membuat koleksi soal. Hubungi admin untuk mengisinya (Pengaturan → Akun Guru).</span></div>`}
      <div class="card"><div class="row"><input class="in" id="bq" placeholder="Cari materi / kelas…" style="max-width:280px;height:40px" value="${esc(S.q)}"><div class="chips"><button data-m="" class="${S.m === '' ? 'on' : ''}">Semua</button>${mapelList.map(m => `<button data-m="${esc(m)}" class="${S.m === m ? 'on' : ''}">${esc(m)}</button>`).join('')}</div></div></div><div id="kg"></div>`;
      $('#nk').onclick = () => koleksiForm(null, refresh);
      $('#bq').oninput = e => { S.q = e.target.value.toLowerCase(); grid(); };
      $$('.chips button').forEach(b => b.onclick = () => { S.m = b.dataset.m; home(); });
      grid();
    }
    function card(k) {
      const ss = D.soal.filter(s => s.idKoleksi === k.id);
      return `<a class="card lift glow fcol" href="#/staff/bank/${esc(k.id)}"><div class="row between"><span class="chip info">${esc(k.mapel)}</span><b>${ss.length} soal</b></div><h3 style="margin:12px 0 8px">${esc(k.materi)}</h3><div class="row" style="gap:6px">${kchips(k.kelas)}</div><div class="row" style="gap:6px;margin-top:12px">${tipeCount(ss) || '<span class="mute sm">Belum ada soal</span>'}</div></a>`;
    }
    function grid() {
      const ks = D.koleksi.filter(k => (!S.m || k.mapel === S.m) && (!S.q || (k.materi + ' ' + k.mapel + ' ' + k.kelas.join(' ')).toLowerCase().includes(S.q))), by = {}, L = lama();
      ks.forEach(k => (by[k.mapel] = by[k.mapel] || []).push(k));
      $('#kg').innerHTML = Object.keys(by).sort().map(m => `<div style="margin-top:22px"><div class="row between" style="margin-bottom:12px"><h2 style="font-size:20px">${esc(m)}</h2><span class="mute sm">${by[m].length} koleksi · ${by[m].reduce((a, k) => a + D.soal.filter(s => s.idKoleksi === k.id).length, 0)} soal</span></div><div class="cgrid">${by[m].sort((a, b) => a.materi.localeCompare(b.materi)).map(card).join('')}</div></div>`).join('')
        + (L.length && !S.m && !S.q ? `<div style="margin-top:28px"><h2 style="font-size:20px;margin-bottom:12px">Perlu dirapikan</h2><div class="cgrid"><a class="card lift fcol" style="border-color:var(--warn)" href="#/staff/bank/lama"><span class="chip warn">Belum dikelompokkan</span><h3 style="margin:12px 0 6px">Soal lama</h3><p class="mute" style="margin:0">${L.length} soal belum memiliki koleksi. Pindahkan agar terarsip rapi.</p></a></div></div>` : '')
        || `<div class="card mute" style="margin-top:20px">${D.koleksi.length ? 'Tidak ada koleksi yang cocok.' : 'Belum ada koleksi. Klik “Koleksi Baru” untuk memulai.'}</div>`;
    }

    // ----- tingkat 2: isi satu koleksi -----
    function folder() {
      const isLama = id === 'lama', k = isLama ? null : D.koleksi.find(x => x.id === id);
      if (!isLama && !k) { pg.innerHTML = '<div class="card note bad">Koleksi tidak ditemukan. <a href="#/staff/bank">Kembali ke Bank Soal</a></div>'; return; }
      const all = isLama ? lama() : D.soal.filter(s => s.idKoleksi === id), can = !isLama && !!diampu(k.mapel);
      pg.innerHTML = `<div class="crumb"><a href="#/staff/bank">Bank Soal</a> › <span>${esc(isLama ? 'Belum dikelompokkan' : k.mapel)}</span>${isLama ? '' : ` › <b>${esc(k.materi)}</b>`}</div>
      <div class="card"><div class="row between"><div><div class="row" style="gap:6px">${isLama ? '<span class="chip warn">Belum dikelompokkan</span>' : `<span class="chip info">${esc(k.mapel)}</span>${kchips(k.kelas)}`}</div><h1 style="font-size:26px;margin-top:10px">${esc(isLama ? 'Soal lama' : k.materi)}</h1><div class="mute">${esc(isLama ? 'Pilih soal, lalu “Pindahkan ke koleksi” agar terarsip dengan identitas yang benar.' : (k.catatan || ''))}</div></div>
      <div class="row">${isLama ? '' : `${can ? `<button class="btn" id="ek">${ic('edit', 16)} Ubah</button>` : ''}<button class="btn btn-d" id="hk" ${all.length ? 'disabled title="Kosongkan koleksi dulu"' : ''}>${ic('trash', 16)}</button>${all.length ? `<a class="btn" href="#/staff/pratinjau/koleksi/${esc(id)}">${ic('eye', 16)} Pratinjau</a>` : ''}${can ? `<button class="btn" id="im">${ic('upload', 16)} Impor CSV</button><button class="btn btn-p btn-cta" id="ts">${ic('plus', 16)} Tambah Soal</button>` : ''}`}</div></div>
      ${!isLama && !can ? `<div class="note warn" style="margin-top:12px">${ic('lock', 16)}<span>Mata pelajaran ini tidak lagi termasuk penugasan Anda, jadi koleksi hanya bisa dilihat.</span></div>` : ''}</div>
      <div class="card"><div class="row" style="margin-bottom:12px"><input class="in" id="sq" placeholder="Cari soal…" style="max-width:260px;height:40px" value="${esc(S.q)}"><select class="in" id="st" style="max-width:200px;height:40px"><option value="">Semua tipe</option>${Object.entries(TL).map(([t, v]) => `<option value="${t}" ${S.t === t ? 'selected' : ''}>${v}</option>`).join('')}</select><span class="sm mute" id="sc"></span><span class="grow"></span><button class="btn btn-sm hide" id="mv">Pindahkan ke koleksi…</button></div>
      <div class="tw"><table class="tbl"><thead><tr><th><input type="checkbox" id="sa" aria-label="Pilih semua"></th><th>No</th><th>Tipe</th><th>Pertanyaan</th><th>Bobot</th><th></th></tr></thead><tbody id="sb"></tbody></table></div></div>`;
      const rows = () => all.filter(s => (!S.t || s.tipe === S.t) && (!S.q || s.pertanyaan.toLowerCase().includes(S.q)));
      const body = () => {
        const r = rows(); $('#sc').textContent = `${r.length} dari ${all.length} soal`; $('#mv').classList.toggle('hide', !sel.size || !can && !isLama); $('#mv').textContent = `Pindahkan ${sel.size} soal ke koleksi…`;
        $('#sb').innerHTML = r.map((s, i) => `<tr><td><input type="checkbox" class="sc" value="${esc(s.id)}" ${sel.has(s.id) ? 'checked' : ''}></td><td>${i + 1}</td><td><span class="chip">${TL[s.tipe]}</span></td><td style="max-width:480px">${esc(s.pertanyaan.slice(0, 150))}</td><td>${s.bobot}</td><td><div class="row" style="flex-wrap:nowrap">${can || isLama ? `<button class="btn btn-sm" data-e="${esc(s.id)}">${ic('edit', 14)}</button>` : ''}<button class="btn btn-sm btn-d" data-d="${esc(s.id)}">${ic('trash', 14)}</button></div></td></tr>`).join('') || `<tr><td colspan="6" class="mute">${all.length ? 'Tidak ada soal yang cocok.' : 'Koleksi masih kosong.'}</td></tr>`;
        $$('.sc').forEach(c => c.onchange = () => { c.checked ? sel.add(c.value) : sel.delete(c.value); body(); });
        $$('[data-e]').forEach(b => b.onclick = () => soalForm(D.soal.find(x => x.id === b.dataset.e), kolOf(D.soal.find(x => x.id === b.dataset.e)), refresh));
        $$('[data-d]').forEach(b => b.onclick = async () => { if (await confirmBox('Hapus soal ini?', 'Hapus', true)) try { await Api.call('bank.hapus', { id: b.dataset.d }); toast('Soal dihapus.'); refresh(); } catch (e) { fail(e); } });
      };
      $('#sq').oninput = e => { S.q = e.target.value.toLowerCase(); body(); }; $('#st').onchange = e => { S.t = e.target.value; body(); };
      $('#sa').onchange = e => { rows().forEach(s => e.target.checked ? sel.add(s.id) : sel.delete(s.id)); body(); };
      $('#mv').onclick = () => pindahForm([...sel], isLama ? '' : id, refresh);
      if ($('#ts')) $('#ts').onclick = () => soalForm(null, k, refresh); if ($('#im')) $('#im').onclick = () => importForm(k, refresh);
      if ($('#ek')) $('#ek').onclick = () => koleksiForm(k, refresh);
      if ($('#hk')) $('#hk').onclick = async () => { if (await confirmBox('Hapus koleksi kosong ini?', 'Hapus', true)) try { await Api.call('koleksi.hapus', { id }); toast('Koleksi dihapus.'); location.hash = '#/staff/bank'; } catch (e) { fail(e); } };
      body();
    }

    // ----- formulir -----
    function koleksiForm(k, done) {
      if (!D.penugasan.length) return toast('Anda belum memiliki penugasan. Hubungi admin.', 'err');
      const first = k ? k.kelas.slice() : []; let chosen = new Set(first);
      const m = modal(`<h3>${k ? 'Ubah Koleksi' : 'Koleksi Baru'}</h3><div class="sm mute">Tentukan identitas koleksi lebih dulu. Soal di dalamnya otomatis mengikuti identitas ini.</div>
        <label class="f">1. Mata pelajaran</label><select class="in" id="km" ${k ? 'disabled' : ''}>${(k ? [{ mapel: k.mapel }] : D.penugasan).map(a => `<option>${esc(a.mapel)}</option>`).join('')}</select>
        <label class="f">2. Kelas</label><div id="kk" class="row"></div>
        <label class="f">3. Materi / bab</label><input class="in" id="kt" list="kdl" value="${esc(k ? k.materi : '')}" placeholder="mis. Pecahan, Teorema Pythagoras"><datalist id="kdl"></datalist>
        <label class="f">Catatan (opsional)</label><input class="in" id="kc" value="${esc(k ? k.catatan : '')}">
        <div class="row end" style="margin-top:16px"><button class="btn" id="kx">Batal</button><button class="btn btn-p" id="ks">Simpan</button></div>`), E = m.el;
      const paintK = () => {
        const mp = $('#km', E).value, a = diampu(mp), opts = [...new Set([...(a ? a.kelas : []), ...first])];
        $('#kk', E).innerHTML = opts.map(x => `<label class="chip" style="cursor:pointer"><input type="checkbox" class="kc" value="${esc(x)}" ${chosen.has(x) ? 'checked' : ''}> ${esc(x)}</label>`).join('') || '<span class="mute">Tidak ada kelas pada penugasan ini.</span>';
        $$('.kc', E).forEach(c => c.onchange = () => c.checked ? chosen.add(c.value) : chosen.delete(c.value));
        $('#kdl', E).innerHTML = [...new Set(D.koleksi.filter(x => kn(x.mapel) === kn(mp)).map(x => x.materi))].map(x => `<option value="${esc(x)}">`).join('');
      };
      $('#km', E).onchange = () => { const a = diampu($('#km', E).value); chosen = new Set([...chosen].filter(x => a && a.kelas.includes(x))); paintK(); }; paintK();
      $('#kx', E).onclick = () => m.close();
      $('#ks', E).onclick = async e => await busy(e.currentTarget, async () => { try { await Api.call('koleksi.simpan', { id: k && k.id, mapel: $('#km', E).value, kelas: [...chosen], materi: $('#kt', E).value, catatan: $('#kc', E).value }); toast('Koleksi tersimpan.'); m.close(); done(); } catch (er) { fail(er); } });
    }
    function pindahForm(ids, dari, done) {
      const opts = D.koleksi.filter(k => k.id !== dari && diampu(k.mapel));
      if (!opts.length) return toast('Belum ada koleksi tujuan. Buat koleksi baru dulu.', 'err');
      const m = modal(`<h3>Pindahkan ${ids.length} soal</h3><label class="f">Koleksi tujuan</label><select class="in" id="pt">${opts.map(k => `<option value="${esc(k.id)}">${esc(label(k))}</option>`).join('')}</select><div class="note warn" style="margin-top:12px">Mata pelajaran soal akan mengikuti koleksi tujuan.</div><div class="row end" style="margin-top:16px"><button class="btn btn-p" id="pg2">Pindahkan</button></div>`);
      $('#pg2', m.el).onclick = async e => await busy(e.currentTarget, async () => { try { const r = await Api.call('bank.pindah', { ids, idKoleksi: $('#pt', m.el).value }); toast(r.message); m.close(); done(); } catch (er) { fail(er); } });
    }
    function soalForm(s, kol, done) {
      s = s || { tipe: 'pg', pilihan: ['', '', '', ''], kunci: 0, bobot: 1, pertanyaan: '', gambar: '' };
      const C = { t: s.tipe, pil: s.tipe === 'pg' || s.tipe === 'pgk' ? s.pilihan.slice() : ['', '', '', ''], kun: s.tipe === 'pg' ? [s.kunci] : s.tipe === 'pgk' ? s.kunci : [0], kiri: s.tipe === 'jodoh' ? s.pilihan.kiri.slice() : ['', '', ''], kanan: s.tipe === 'jodoh' ? s.pilihan.kanan.slice() : ['', '', ''], isi: s.tipe === 'isian' ? s.kunci.join('\n') : '' };
      const idHead = kol ? `<div class="row" style="gap:6px;margin-bottom:6px"><span class="chip info">${esc(kol.mapel)}</span>${kchips(kol.kelas)}<span class="chip gray">${esc(kol.materi)}</span></div><div class="sm mute">Identitas mengikuti koleksi (terkunci). Mulai dari tipe soal.</div>`
        : `<div class="note warn">Soal ini belum punya koleksi. Pilih koleksi tujuan:</div><select class="in" id="fk" style="margin-top:8px">${D.koleksi.filter(k => diampu(k.mapel)).map(k => `<option value="${esc(k.id)}">${esc(label(k))}</option>`).join('')}</select>`;
      const m = modal(`<h3>${s.id ? 'Ubah' : 'Tambah'} Soal</h3>${idHead}<label class="f">1. Tipe soal</label><select class="in" id="ft">${Object.entries(TL).map(([k, v]) => `<option value="${k}" ${k === C.t ? 'selected' : ''}>${v}</option>`).join('')}</select><label class="f">2. Pertanyaan</label><textarea class="in" id="fq" rows="4">${esc(s.pertanyaan)}</textarea><div id="fa" style="margin-top:8px"></div><div class="grid g2e" style="gap:12px"><div><label class="f">Bobot</label><input class="in" id="fb" type="number" min="0.5" step="0.5" value="${s.bobot}"></div><div><label class="f">Gambar (URL https, opsional)</label><input class="in" id="fg" value="${esc(s.gambar || '')}"></div></div><div class="row end" style="margin-top:16px"><button class="btn" id="fx">Batal</button><button class="btn btn-p" id="fs">Simpan</button></div>`, { wide: true }), E = m.el;
      const read = () => {
        if (C.t === 'pg' || C.t === 'pgk') { C.pil = $$('.po', E).map(i => i.value); C.kun = $$('.kn', E).map((c, i) => c.checked ? i : -1).filter(i => i >= 0); }
        else if (C.t === 'jodoh') { C.kiri = $$('.jk', E).map(i => i.value); C.kanan = $$('.jn', E).map(i => i.value); } else if (C.t === 'isian') C.isi = $('#fi', E).value;
      };
      const paint = () => {
        const a = $('#fa', E);
        if (C.t === 'pg' || C.t === 'pgk') { const n = Math.max(4, C.pil.length); a.innerHTML = `<div class="sm mute">Isi pilihan, lalu tandai ${C.t === 'pg' ? 'satu' : 'semua'} jawaban benar.</div>` + [...Array(n)].map((_, i) => `<div class="qopt"><input class="kn" type="${C.t === 'pg' ? 'radio' : 'checkbox'}" name="kn" ${C.kun.includes(i) ? 'checked' : ''} aria-label="Kunci ${L(i)}"><b>${L(i)}</b><input class="in po" value="${esc(C.pil[i] || '')}" placeholder="Pilihan ${L(i)}"></div>`).join('') + (n < 8 ? '<button class="btn btn-sm" id="mo">+ Pilihan</button>' : ''); const mo = $('#mo', E); if (mo) mo.onclick = () => { read(); C.pil.push(''); paint(); }; }
        else if (C.t === 'jodoh') { const n = Math.max(3, C.kiri.length); a.innerHTML = '<div class="sm mute">Setiap baris adalah pasangan benar (kiri ↔ kanan). Urutan kanan diacak untuk siswa.</div>' + [...Array(n)].map((_, i) => `<div class="qopt"><input class="in jk" value="${esc(C.kiri[i] || '')}" placeholder="Kiri ${i + 1}"><span>↔</span><input class="in jn" value="${esc(C.kanan[i] || '')}" placeholder="Pasangan ${i + 1}"></div>`).join('') + '<button class="btn btn-sm" id="mp2">+ Pasangan</button>'; $('#mp2', E).onclick = () => { read(); C.kiri.push(''); C.kanan.push(''); paint(); }; }
        else if (C.t === 'isian') a.innerHTML = `<label class="f">Jawaban yang diterima (satu per baris; huruf besar/kecil diabaikan)</label><textarea class="in" id="fi" rows="3">${esc(C.isi)}</textarea>`;
        else a.innerHTML = '<div class="note">Soal uraian dinilai manual oleh guru pada halaman Rekap.</div>';
      };
      $('#ft', E).onchange = e => { read(); C.t = e.target.value; if (C.t === 'pg' && C.kun.length > 1) C.kun = [C.kun[0]]; paint(); };
      $('#fx', E).onclick = () => m.close(); paint();
      $('#fs', E).onclick = async e => {
        read(); const o = { id: s.id, idKoleksi: kol ? kol.id : $('#fk', E).value, tipe: C.t, pertanyaan: $('#fq', E).value, bobot: +$('#fb', E).value, gambar: $('#fg', E).value };
        if (C.t === 'pg' || C.t === 'pgk') { const map = {}, p = []; C.pil.forEach((v, i) => { if (v.trim()) { map[i] = p.length; p.push(v); } }); o.pilihan = p; const kk = C.kun.filter(i => map[i] !== undefined).map(i => map[i]); o.kunci = C.t === 'pg' ? (kk.length ? kk[0] : -1) : kk; }
        else if (C.t === 'jodoh') { const pr = C.kiri.map((k, i) => [k.trim(), (C.kanan[i] || '').trim()]).filter(x => x[0] && x[1]); o.pilihan = { kiri: pr.map(x => x[0]), kanan: pr.map(x => x[1]) }; }
        else if (C.t === 'isian') o.kunci = C.isi.split('\n').map(x => x.trim()).filter(Boolean);
        await busy(e.currentTarget, async () => { try { await Api.call('bank.simpan', { soal: o }); toast('Soal tersimpan.'); m.close(); done(); } catch (er) { fail(er); } });
      };
    }
    function rowToSoal(r) {
      const g = i => String(r[i] ?? '').trim(), al = { 'pilihan ganda': 'pg', pg: 'pg', 'pilihan ganda kompleks': 'pgk', pgk: 'pgk', menjodohkan: 'jodoh', jodoh: 'jodoh', isian: 'isian', 'isian singkat': 'isian', uraian: 'uraian' };
      const t = al[g(0).toLowerCase()] || g(0).toLowerCase(), opts = [2, 3, 4, 5, 6].map(g).filter(Boolean), k = g(7), ix = c => c.toUpperCase().charCodeAt(0) - 65, s = { tipe: t, pertanyaan: g(1), bobot: +g(8) || 1 };
      if (t === 'pg') { s.pilihan = opts; s.kunci = ix(k); } else if (t === 'pgk') { s.pilihan = opts; s.kunci = k.split(/[;,|]/).map(x => x.trim()).filter(Boolean).map(ix); }
      else if (t === 'jodoh') { const p = opts.map(o => o.split('=')); s.pilihan = { kiri: p.map(x => (x[0] || '').trim()), kanan: p.map(x => x.slice(1).join('=').trim()) }; } else if (t === 'isian') s.kunci = k.split('|').map(x => x.trim()).filter(Boolean);
      return s;
    }
    function importForm(kol, done) {
      const m = modal(`<h3>Impor Soal ke Koleksi</h3><div class="row" style="gap:6px;margin-bottom:8px"><span class="chip info">${esc(kol.mapel)}</span>${kchips(kol.kelas)}<span class="chip gray">${esc(kol.materi)}</span></div><p class="mute">Kolom: <code>tipe, pertanyaan, A, B, C, D, E, kunci, bobot</code>. Mapel, kelas, dan materi otomatis mengikuti koleksi ini. Tipe: pg, pgk, jodoh, isian, uraian. Kunci pg = huruf (B); pgk = A;C; isian = jawaban1|jawaban2; menjodohkan = isi kolom A–E dengan <code>kiri=kanan</code>. Simpan dari Excel sebagai CSV.</p><div class="row"><button class="btn btn-sm" id="tp">${ic('download', 14)} Unduh template</button></div><input type="file" id="fl" accept=".csv,.txt" class="in" style="padding-top:10px;margin-top:12px"><div id="pv" class="sm mute" style="margin:10px 0"></div><div class="row end"><button class="btn btn-p" id="go" disabled>Impor</button></div>`);
      let rows = [];
      $('#tp', m.el).onclick = () => csvDownload('template-soal.csv', [['tipe', 'pertanyaan', 'A', 'B', 'C', 'D', 'E', 'kunci', 'bobot'], ['pg', 'Ibu kota Indonesia adalah …', 'Bandung', 'Jakarta', 'Surabaya', 'Medan', '', 'B', 1], ['pgk', 'Pilih bilangan prima', '2', '9', '11', '15', '', 'A;C', 2], ['jodoh', 'Jodohkan negara dan ibu kota', 'Jepang=Tokyo', 'Prancis=Paris', 'Italia=Roma', '', '', '', 3], ['isian', 'Hasil 12 x 12 = …', '', '', '', '', '', '144', 1], ['uraian', 'Jelaskan proses fotosintesis.', '', '', '', '', '', '', 5]]);
      $('#fl', m.el).onchange = async e => { const f = e.target.files[0]; if (!f) return; const r = parseCSV(await f.text()); if (r.length && /^tipe$/i.test(r[0][0].trim())) r.shift(); rows = r.map(rowToSoal); $('#pv', m.el).textContent = rows.length + ' baris soal terbaca.'; $('#go', m.el).disabled = !rows.length; };
      $('#go', m.el).onclick = async e => await busy(e.currentTarget, async () => {
        let ok = 0, gagal = []; try { for (let i = 0; i < rows.length; i += 100) { const r = (await Api.call('bank.impor', { idKoleksi: kol.id, rows: rows.slice(i, i + 100) })).data; ok += r.masuk; gagal = gagal.concat(r.gagal); } } catch (er) { return fail(er); }
        toast(`${ok} soal diimpor${gagal.length ? ', ' + gagal.length + ' gagal' : ''}.`, gagal.length ? 'err' : 'ok'); if (gagal.length) alert('Baris gagal:\n' + gagal.slice(0, 15).join('\n')); m.close(); done();
      });
    }
    id ? folder() : home();
  }

  // ===================== MANAJEMEN UJIAN =====================
  async function ujian(pg, _, qs) {
    const guru = me().peran === 'guru'; let list = (await Api.call('ujian.daftarGuru')).data.ujian;
    pg.innerHTML = `<div class="row between"><h1>Manajemen Ujian</h1>${guru ? `<button class="btn btn-p btn-cta" id="nu">${ic('plus', 16)} Buat Ujian</button>` : ''}</div><div class="card tw"><table class="tbl"><thead><tr><th>Ujian</th><th>Jadwal</th><th>Kelas</th><th>Selesai</th><th>Status</th><th></th></tr></thead><tbody>${list.map(u => `<tr><td><b>${esc(u.judul)}</b><div class="sm mute">${esc(u.mapel)} · ${u.durasi} menit</div></td><td class="sm">${fmtT(u.mulai)}<br>s/d ${fmtT(u.selesai)}</td><td>${esc(u.kelas.join(', '))}</td><td>${u.selesaiN}/${u.peserta}</td><td><span class="chip ${u.status === 'terbit' ? 'ok' : 'gray'}">${u.status}</span></td><td><div class="row" style="flex-wrap:nowrap"><a class="btn btn-sm" href="#/staff/pratinjau/ujian/${esc(u.id)}" title="Pratinjau sebagai siswa" aria-label="Pratinjau sebagai siswa">${ic('eye', 14)}</a><a class="btn btn-sm" href="#/staff/monitor/${esc(u.id)}">${ic('radio', 14)}</a><a class="btn btn-sm" href="#/staff/rekap/${esc(u.id)}">${ic('chart', 14)}</a>${guru ? `<button class="btn btn-sm" data-e="${esc(u.id)}">${ic('edit', 14)}</button><button class="btn btn-sm ${u.status === 'terbit' ? '' : 'btn-p'}" data-t="${esc(u.id)}">${u.status === 'terbit' ? 'Jadikan draft' : 'Terbitkan'}</button>` : ''}</div></td></tr>`).join('') || '<tr><td colspan="6" class="mute">Belum ada ujian.</td></tr>'}</tbody></table></div>`;
    const re = () => Staff.reload();
    if (!guru) return;
    $('#nu').onclick = () => form(null, re); $$('[data-e]').forEach(b => b.onclick = () => form(b.dataset.e, re));
    $$('[data-t]').forEach(b => b.onclick = async () => { try { const d = (await Api.call('ujian.detail', { id: b.dataset.t })).data, u = d.ujian; await Api.call('ujian.simpan', { ...u, status: u.status === 'terbit' ? 'draft' : 'terbit', soal: d.soal, soalBerubah: false }); toast('Status diperbarui.'); re(); } catch (e) { fail(e); } });
    if (/baru=1/.test(qs || '')) form(null, re);
  }
  async function form(id, done) {
    const [bk] = await Promise.all([Api.call('bank.daftar')]), B = bk.data;
    if (!B.penugasan.length) return toast('Anda belum memiliki penugasan mata pelajaran/kelas. Hubungi admin.', 'err');
    let u = { judul: '', mapel: B.penugasan[0].mapel, mulai: Date.now() + 36e5, selesai: Date.now() + 5 * 36e5, durasi: 90, kelas: [], acak: true, batasPelanggaran: 3, modeKunci: 'kunci', tampilNilai: 'langsung', status: 'draft' }, sel = [];
    if (id) { const d = (await Api.call('ujian.detail', { id })).data; u = d.ujian; sel = d.soal; }
    const S = { mapel: u.mapel, kelas: new Set(u.kelas), soal: new Set(sel) }, orig = sel.slice().sort().join('|');
    const mapelOpts = B.penugasan.map(a => a.mapel); if (!mapelOpts.some(x => kn(x) === kn(S.mapel))) mapelOpts.push(S.mapel);
    const diampu = mp => B.penugasan.find(a => kn(a.mapel) === kn(mp)), kolMapel = () => B.koleksi.filter(k => kn(k.mapel) === kn(S.mapel));
    const m = modal(`<h3>${id ? 'Ubah' : 'Buat'} Ujian</h3><div class="grid g2e" style="gap:12px"><div><label class="f">Judul ujian</label><input class="in" id="uj" value="${esc(u.judul)}"></div><div><label class="f">1. Mata pelajaran</label><select class="in" id="um">${mapelOpts.map(x => `<option ${kn(x) === kn(S.mapel) ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div><div><label class="f">Mulai dibuka</label><input class="in" id="us" type="datetime-local" value="${toLocalInput(u.mulai)}"></div><div><label class="f">Ditutup</label><input class="in" id="ue" type="datetime-local" value="${toLocalInput(u.selesai)}"></div><div><label class="f">Durasi (menit)</label><input class="in" id="ud" type="number" min="5" max="360" value="${u.durasi}"></div><div><label class="f">Batas pelanggaran (0 = tanpa batas)</label><input class="in" id="ub" type="number" min="0" max="20" value="${u.batasPelanggaran}"></div><div><label class="f">Bila melebihi batas</label><select class="in" id="uk"><option value="kunci" ${u.modeKunci === 'kunci' ? 'selected' : ''}>Kunci ujian (guru yang membuka)</option><option value="peringatan" ${u.modeKunci !== 'kunci' ? 'selected' : ''}>Hanya peringatan</option></select></div><div><label class="f">Tampilkan nilai ke siswa</label><select class="in" id="un"><option value="langsung" ${u.tampilNilai === 'langsung' ? 'selected' : ''}>Langsung setelah kumpul</option><option value="nanti" ${u.tampilNilai === 'nanti' ? 'selected' : ''}>Diumumkan guru</option><option value="tidak" ${u.tampilNilai === 'tidak' ? 'selected' : ''}>Tidak ditampilkan</option></select></div></div>
    <label class="f">2. Kelas peserta <span class="mute" style="font-weight:400">(sesuai penugasan Anda untuk mapel ini)</span></label><div class="row" id="kls"></div>
    <label class="f"><input type="checkbox" id="ua" ${u.acak ? 'checked' : ''}> Acak urutan soal &amp; pilihan jawaban per siswa</label>
    <label class="f">3. Pilih soal dari koleksi <span class="chip" id="sc">0</span></label><div id="sl" style="max-height:260px;overflow:auto;border:1px solid var(--line);border-radius:12px;padding:8px"></div>
    <label class="f">Status</label><select class="in" id="ut"><option value="draft" ${u.status !== 'terbit' ? 'selected' : ''}>Draft (belum terlihat siswa)</option><option value="terbit" ${u.status === 'terbit' ? 'selected' : ''}>Terbit</option></select><div class="row end" style="margin-top:16px"><button class="btn" id="ux">Batal</button><button class="btn btn-p" id="us2">Simpan</button></div>`, { wide: true });
    const E = m.el, cnt = () => $('#sc', E).textContent = S.soal.size;
    function paint() {
      const a = diampu(S.mapel), ks = [...new Set([...(a ? a.kelas : []), ...(kn(u.mapel) === kn(S.mapel) ? u.kelas : [])])];
      $('#kls', E).innerHTML = ks.map(k => `<label class="chip" style="cursor:pointer"><input type="checkbox" class="kc" value="${esc(k)}" ${S.kelas.has(k) ? 'checked' : ''}> ${esc(k)}</label>`).join('') || '<span class="mute">Tidak ada kelas pada penugasan ini.</span>';
      $$('.kc', E).forEach(c => c.onchange = () => { c.checked ? S.kelas.add(c.value) : S.kelas.delete(c.value); paint(); });
      const cols = kolMapel().map(k => ({ k, ov: k.kelas.some(x => S.kelas.has(x)), ss: B.soal.filter(q => q.idKoleksi === k.id) })).sort((x, y) => y.ov - x.ov || x.k.materi.localeCompare(y.k.materi));
      $('#sl', E).innerHTML = cols.map(c => `<div style="margin-bottom:12px"><div class="row between" style="padding:4px 4px 6px"><div class="row" style="gap:6px"><b>${esc(c.k.materi)}</b>${kchips(c.k.kelas)}${c.ov ? '<span class="chip ok">sesuai kelas</span>' : ''}</div><a href="javascript:void 0" data-all="${esc(c.k.id)}" class="sm b">pilih semua (${c.ss.length})</a></div>${c.ss.map(q => `<label style="display:flex;gap:8px;padding:4px 6px"><input type="checkbox" class="sq" value="${esc(q.id)}" ${S.soal.has(q.id) ? 'checked' : ''}><span class="sm"><span class="chip gray">${TL[q.tipe]}</span> ${esc(q.pertanyaan.slice(0, 90))}</span></label>`).join('') || '<div class="sm mute" style="padding:4px 6px">Koleksi masih kosong.</div>'}</div>`).join('') || `<div class="mute" style="padding:8px">Belum ada koleksi soal untuk mata pelajaran ini. Buat dulu di menu Bank Soal.</div>`;
      $$('.sq', E).forEach(c => c.onchange = () => { c.checked ? S.soal.add(c.value) : S.soal.delete(c.value); cnt(); });
      $$('[data-all]', E).forEach(a2 => a2.onclick = () => { B.soal.filter(q => q.idKoleksi === a2.dataset.all).forEach(q => S.soal.add(q.id)); paint(); });
      cnt();
    }
    $('#um', E).onchange = e => { S.mapel = e.target.value; const a = diampu(S.mapel), okK = new Set(kolMapel().flatMap(k => B.soal.filter(q => q.idKoleksi === k.id).map(q => q.id))); S.kelas = new Set([...S.kelas].filter(k => a && a.kelas.includes(k))); S.soal = new Set([...S.soal].filter(x => okK.has(x))); paint(); };
    paint(); $('#ux', E).onclick = () => m.close();
    $('#us2', E).onclick = async e => {
      const ids = [...S.soal], p = { id, judul: $('#uj', E).value, mapel: S.mapel, mulai: new Date($('#us', E).value).getTime(), selesai: new Date($('#ue', E).value).getTime(), durasi: +$('#ud', E).value, batasPelanggaran: +$('#ub', E).value, modeKunci: $('#uk', E).value, tampilNilai: $('#un', E).value, acak: $('#ua', E).checked, kelas: [...S.kelas], soal: ids, status: $('#ut', E).value, soalBerubah: ids.slice().sort().join('|') !== orig };
      await busy(e.currentTarget, async () => { try { await Api.call('ujian.simpan', p); toast('Ujian tersimpan.'); m.close(); done(); } catch (er) { fail(er); } });
    };
  }

  // ===================== SISWA & KELAS =====================
  async function siswa(pg) {
    const adm = me().peran === 'admin'; let D = (await Api.call('siswa.daftar', {})).data; const S = { k: '', q: sessionStorage.getItem('scbt_q') || '', sel: new Set() }; sessionStorage.removeItem('scbt_q');
    pg.innerHTML = `<div class="row between"><h1>Siswa &amp; Kelas</h1><div class="row">${adm ? `<button class="btn" id="ak">+ Kelas</button><button class="btn" id="as">+ Siswa</button><button class="btn" id="ai">${ic('upload', 16)} Impor CSV</button>` : ''}<button class="btn btn-p btn-cta" id="bp">${ic('key', 16)} Buat / Reset PIN terpilih</button></div></div>
    <div class="card"><div class="row" style="margin-bottom:12px"><input class="in" id="sq" placeholder="Cari nama / NISN…" style="max-width:260px;height:40px" value="${esc(S.q)}"><select class="in" id="sk" style="max-width:200px;height:40px"><option value="">Semua kelas</option>${D.kelas.map(k => `<option>${esc(k.nama)}</option>`).join('')}</select><span class="sm mute" id="si"></span></div><div class="tw"><table class="tbl"><thead><tr><th><input type="checkbox" id="sall" aria-label="Pilih semua"></th><th>NISN</th><th>Nama</th><th>Kelas</th><th>PIN</th></tr></thead><tbody id="sb"></tbody></table></div></div>`;
    const flt = () => D.siswa.filter(s => (!S.k || s.kelas === S.k) && (!S.q || (s.nama + s.nisn).toLowerCase().includes(S.q.toLowerCase())));
    function paint() { const r = flt(), v = r.slice(0, 300); $('#si').textContent = `${r.length} siswa · ${S.sel.size} terpilih${r.length > 300 ? ' (menampilkan 300 pertama; gunakan filter kelas)' : ''}`; $('#sb').innerHTML = v.map(s => `<tr><td><input type="checkbox" class="sc" value="${esc(s.id)}" ${S.sel.has(s.id) ? 'checked' : ''}></td><td>${esc(s.nisn)}</td><td>${esc(s.nama)}</td><td>${esc(s.kelas)}</td><td><span class="chip ${s.punyaPin ? 'ok' : 'gray'}">${s.punyaPin ? 'sudah ada' : 'belum'}</span></td></tr>`).join('') || '<tr><td colspan="5" class="mute">Belum ada siswa.</td></tr>'; $$('.sc').forEach(c => c.onchange = () => { c.checked ? S.sel.add(c.value) : S.sel.delete(c.value); $('#si').textContent = $('#si').textContent.replace(/\d+ terpilih/, S.sel.size + ' terpilih'); }); }
    $('#sq').oninput = e => { S.q = e.target.value; paint(); }; $('#sk').onchange = e => { S.k = e.target.value; paint(); };
    $('#sall').onchange = e => { flt().slice(0, 300).forEach(s => e.target.checked ? S.sel.add(s.id) : S.sel.delete(s.id)); paint(); };
    $('#bp').onclick = async () => {
      if (!S.sel.size) return toast('Pilih siswa terlebih dahulu (centang).', 'err'); if (!await confirmBox(`Buat PIN baru untuk ${S.sel.size} siswa? PIN lama mereka tidak berlaku lagi.`)) return;
      try { const ids = [...S.sel]; let pins = []; for (let i = 0; i < ids.length; i += 300) pins = pins.concat((await Api.call('siswa.pin', { ids: ids.slice(i, i + 300) })).data.pins); S.sel.clear(); pinResult(pins); D = (await Api.call('siswa.daftar', {})).data; paint(); } catch (e) { fail(e); }
    };
    if (adm) {
      $('#ak').onclick = () => { const m = modal(`<h3>Tambah Kelas</h3><label class="f">Nama kelas</label><input class="in" id="kn"><label class="f">Wali kelas</label><input class="in" id="kw"><div class="row end" style="margin-top:14px"><button class="btn btn-p" id="ks">Simpan</button></div>`); $('#ks', m.el).onclick = async () => { try { await Api.call('kelas.simpan', { nama: $('#kn', m.el).value, wali: $('#kw', m.el).value }); toast('Kelas tersimpan.'); m.close(); Staff.reload(); } catch (e) { fail(e); } }; };
      $('#as').onclick = () => { const m = modal(`<h3>Tambah Siswa</h3><label class="f">NISN</label><input class="in" id="sn"><label class="f">Nama</label><input class="in" id="sm"><label class="f">Kelas</label><input class="in" id="sl" list="kl"><datalist id="kl">${D.kelas.map(k => `<option>${esc(k.nama)}</option>`).join('')}</datalist><div class="row end" style="margin-top:14px"><button class="btn btn-p" id="ss">Simpan</button></div>`); $('#ss', m.el).onclick = async () => { try { await Api.call('siswa.impor', { rows: [{ nisn: $('#sn', m.el).value, nama: $('#sm', m.el).value, kelas: $('#sl', m.el).value }] }); toast('Siswa tersimpan.'); m.close(); Staff.reload(); } catch (e) { fail(e); } }; };
      $('#ai').onclick = () => { const m = modal(`<h3>Impor Siswa dari CSV</h3><p class="mute">Kolom: <code>nisn, nama, kelas</code>. Impor ulang aman (memperbarui berdasarkan NISN).</p><button class="btn btn-sm" id="tp">${ic('download', 14)} Template</button><input type="file" id="fl" accept=".csv,.txt" class="in" style="padding-top:10px;margin:12px 0"><div id="pv" class="sm mute"></div><div class="row end"><button class="btn btn-p" id="go" disabled>Impor</button></div>`); let rows = []; $('#tp', m.el).onclick = () => csvDownload('template-siswa.csv', [['nisn', 'nama', 'kelas'], ['0012345678', 'Contoh Siswa', 'XII MIPA 1']]); $('#fl', m.el).onchange = async e => { const r = parseCSV(await e.target.files[0].text()); if (r.length && /^nisn$/i.test(r[0][0].trim())) r.shift(); rows = r.map(x => ({ nisn: x[0], nama: x[1], kelas: x[2] })); $('#pv', m.el).textContent = rows.length + ' baris terbaca.'; $('#go', m.el).disabled = !rows.length; }; $('#go', m.el).onclick = async e => await busy(e.currentTarget, async () => { let a = 0, b = 0, c = 0; try { for (let i = 0; i < rows.length; i += 500) { const r = (await Api.call('siswa.impor', { rows: rows.slice(i, i + 500) })).data; a += r.ditambah; b += r.diperbarui; c += r.dilewati; } toast(`Ditambah ${a}, diperbarui ${b}, dilewati ${c}.`); m.close(); Staff.reload(); } catch (er) { fail(er); } }); };
    }
    paint();
  }
  function pinResult(pins) {
    const m = modal(`<h3>PIN Siswa Dibuat</h3><div class="note warn">PIN hanya ditampilkan SEKALI. Cetak atau unduh sekarang — sistem hanya menyimpan versi terenkripsinya.</div><div class="row" style="margin:12px 0"><button class="btn btn-p" id="pp">${ic('print', 16)} Cetak kartu PIN</button><button class="btn" id="pd">${ic('download', 16)} Unduh CSV</button></div><div class="tw" style="max-height:300px;overflow:auto"><table class="tbl"><thead><tr><th>Nama</th><th>Kelas</th><th>PIN</th></tr></thead><tbody>${pins.map(p => `<tr><td>${esc(p.nama)}</td><td>${esc(p.kelas)}</td><td class="tab"><b style="letter-spacing:.2em">${esc(p.pin)}</b></td></tr>`).join('')}</tbody></table></div>`, { wide: true });
    $('#pd', m.el).onclick = () => csvDownload('pin-siswa.csv', [['Nama', 'Kelas', 'PIN']].concat(pins.map(p => [p.nama, p.kelas, p.pin])));
    $('#pp', m.el).onclick = () => { $('#print-area').innerHTML = pins.map(p => `<div class="pcard"><div>${esc(p.nama)}<br><span>${esc(p.kelas)}</span></div><b>${esc(p.pin)}</b><div style="font-size:11px">Masuk di EduExam Portal dengan PIN ini.</div></div>`).join(''); document.body.classList.add('printing'); print(); setTimeout(() => { document.body.classList.remove('printing'); $('#print-area').innerHTML = ''; }, 800); };
  }

  // ===================== PENGATURAN =====================
  async function pengaturan(pg) {
    const adm = me().peran === 'admin'; let cfg = {}, users = [], kelasAll = [];
    if (adm) [cfg, users, kelasAll] = (await Api.many([['cfg.ambil'], ['pengguna.daftar'], ['siswa.daftar', { kelas: '__' }]])).map((x, i) => i === 0 ? x.cfg : i === 1 ? x.pengguna : x.kelas.map(k => k.nama));
    const asgHtml = u => u.peran !== 'guru' ? '<span class="mute sm">—</span>' : (u.penugasan || []).length ? u.penugasan.map(a => `<div class="sm" style="margin-bottom:4px"><b>${esc(a.mapel)}</b>: ${esc(a.kelas.join(', '))}</div>`).join('') : '<span class="chip warn">Belum ditugaskan</span>';
    pg.innerHTML = `<h1>Pengaturan Sistem</h1><div class="grid g2e"><div class="card"><h3>Ubah kata sandi saya</h3><label class="f">Sandi lama</label><input class="in" id="pl" type="password" autocomplete="current-password"><label class="f">Sandi baru (min. 8, huruf + angka)</label><input class="in" id="pb" type="password" autocomplete="new-password"><div class="row end" style="margin-top:14px"><button class="btn btn-p" id="ps">Ganti sandi</button></div></div>
    ${adm ? `<div class="card"><h3>Konfigurasi</h3>${[['NAMA_SEKOLAH', 'Nama sekolah', 'text'], ['BATAS_PIN', 'Batas percobaan PIN salah / perangkat', 'number'], ['KKM', 'KKM (nilai ketuntasan)', 'number'], ['POLLING_DETIK', 'Interval live monitoring (8–30 dtk)', 'number']].map(f => `<label class="f">${f[1]}</label><input class="in cf" data-k="${f[0]}" type="${f[2]}" value="${esc(cfg[f[0]] ?? '')}">`).join('')}<div class="row end" style="margin-top:14px"><button class="btn btn-p" id="cs">Simpan</button></div></div>` : ''}</div>
    ${adm ? `<div class="card"><div class="row between"><div><h3>Akun Guru &amp; Admin</h3><div class="sm mute">Penugasan menentukan mata pelajaran dan kelas yang boleh dibuatkan soal &amp; ujian oleh guru.</div></div><button class="btn btn-p btn-sm" id="pu">+ Tambah pengguna</button></div><div class="tw"><table class="tbl" style="margin-top:10px"><thead><tr><th>Nama</th><th>Username</th><th>Peran</th><th>Mapel &amp; kelas yang diampu</th><th>Status</th><th></th></tr></thead><tbody>${users.map(u => `<tr><td>${esc(u.nama)}</td><td>${esc(u.username)}</td><td>${esc(u.peran)}</td><td>${asgHtml(u)}</td><td><span class="chip ${u.status === 'aktif' ? 'ok' : 'gray'}">${esc(u.status)}</span></td><td><button class="btn btn-sm" data-u="${esc(u.id)}">${ic('edit', 14)}</button></td></tr>`).join('')}</tbody></table></div></div>` : ''}`;
    $('#ps').onclick = async e => await busy(e.currentTarget, async () => { try { const r = await Api.call('pengguna.sandi', { lama: $('#pl').value, baru: $('#pb').value }); toast(r.message); Api.clear(); setTimeout(() => location.hash = '#/masuk/staff', 900); } catch (er) { fail(er); } });
    if (!adm) return;
    $('#cs').onclick = async e => await busy(e.currentTarget, async () => { const c = {}; $$('.cf').forEach(i => c[i.dataset.k] = i.value); try { await Api.call('cfg.simpan', { cfg: c }); toast('Pengaturan tersimpan.'); } catch (er) { fail(er); } });
    const mapelKnown = () => [...new Set(users.flatMap(x => (x.penugasan || []).map(a => a.mapel)))].sort();
    const uform = u => {
      u = u || { peran: 'guru', status: 'aktif', penugasan: [] }; const PN = (u.penugasan || []).map(p => ({ mapel: p.mapel, kelas: p.kelas.slice() }));
      const m = modal(`<h3>${u.id ? 'Ubah' : 'Tambah'} Pengguna</h3><div class="grid g2e" style="gap:12px"><div><label class="f">Nama lengkap</label><input class="in" id="un" value="${esc(u.nama || '')}"></div><div><label class="f">Username</label><input class="in" id="uu" value="${esc(u.username || '')}"></div><div><label class="f">Peran</label><select class="in" id="up"><option value="guru" ${u.peran === 'guru' ? 'selected' : ''}>Guru</option><option value="admin" ${u.peran === 'admin' ? 'selected' : ''}>Admin</option></select></div><div><label class="f">Status</label><select class="in" id="us"><option value="aktif" ${u.status === 'aktif' ? 'selected' : ''}>Aktif</option><option value="nonaktif" ${u.status !== 'aktif' ? 'selected' : ''}>Nonaktif</option></select></div></div>
        <label class="f">${u.id ? 'Sandi baru (kosongkan bila tidak diubah)' : 'Sandi awal (min. 8, huruf + angka)'}</label><input class="in" id="ux" type="password" autocomplete="new-password"><div id="pe" style="margin-top:6px"></div><div class="row end" style="margin-top:16px"><button class="btn btn-p" id="uk">Simpan</button></div>`, { wide: true }), E = m.el;
      const pe = () => {
        const box = $('#pe', E); box.style.display = $('#up', E).value === 'guru' ? '' : 'none';
        box.innerHTML = `<label class="f">Mata pelajaran &amp; kelas yang diampu</label><div class="sm mute" style="margin-bottom:8px">Guru hanya dapat membuat koleksi soal dan ujian untuk mata pelajaran &amp; kelas di sini.</div>` + PN.map((p, i) => `<div class="card" style="padding:14px;margin-bottom:10px"><div class="row" style="flex-wrap:nowrap"><input class="in pm" data-i="${i}" list="mdl" placeholder="Mata pelajaran (mis. Matematika)" value="${esc(p.mapel)}"><button class="btn btn-sm btn-d" data-r="${i}" aria-label="Hapus">${ic('trash', 14)}</button></div><div class="row" style="margin-top:10px">${kelasAll.map(k => `<label class="chip" style="cursor:pointer"><input type="checkbox" class="pk" data-i="${i}" value="${esc(k)}" ${p.kelas.includes(k) ? 'checked' : ''}> ${esc(k)}</label>`).join('') || '<span class="mute sm">Belum ada kelas. Impor siswa dulu di Siswa &amp; Kelas.</span>'}</div></div>`).join('') + `<datalist id="mdl">${mapelKnown().map(x => `<option value="${esc(x)}">`).join('')}</datalist><button class="btn btn-sm" id="pa">+ Tambah mata pelajaran</button>`;
        $$('.pm', E).forEach(i => i.oninput = () => PN[+i.dataset.i].mapel = i.value);
        $$('.pk', E).forEach(c => c.onchange = () => { const k = PN[+c.dataset.i].kelas, ix = k.indexOf(c.value); c.checked ? ix < 0 && k.push(c.value) : ix >= 0 && k.splice(ix, 1); });
        $$('[data-r]', E).forEach(b => b.onclick = () => { PN.splice(+b.dataset.r, 1); pe(); });
        $('#pa', E).onclick = () => { PN.push({ mapel: '', kelas: [] }); pe(); };
      };
      $('#up', E).onchange = pe; pe();
      $('#uk', E).onclick = async () => {
        const peran = $('#up', E).value;
        try { await Api.call('pengguna.simpan', { id: u.id, nama: $('#un', E).value, username: $('#uu', E).value, peran, status: $('#us', E).value, sandi: $('#ux', E).value, penugasan: peran === 'guru' ? PN.filter(p => p.mapel.trim()) : [] }); toast('Pengguna tersimpan.'); m.close(); Staff.reload(); } catch (e) { fail(e); }
      };
    };
    $('#pu').onclick = () => uform(); $$('[data-u]').forEach(b => b.onclick = () => uform(users.find(x => x.id === b.dataset.u)));
  }
  return { bank, ujian, siswa, pengaturan };
})();
