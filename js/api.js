// Klien API: fetch POST (text/plain agar tanpa preflight CORS), dedupe baca, retry saat server sibuk.
const Api = (() => {
  const url = () => window.APP_CONFIG.GAS_URL;
  // Sandbox = mode pratinjau: memakai data contoh (Mock), sesi disimpan terpisah di sessionStorage, tidak menyentuh data/sesi asli.
  let sandbox = sessionStorage.getItem('scbt_sandbox') === '1';
  const demo = () => sandbox || /GANTI|XXXX/.test(url());
  const S = { token: '', me: null };
  const load = () => { const st = sandbox ? sessionStorage : localStorage, k = sandbox ? ['scbt_sb_t', 'scbt_sb_m'] : ['scbt_token', 'scbt_me']; S.token = st.getItem(k[0]) || ''; try { S.me = JSON.parse(st.getItem(k[1]) || 'null'); } catch (e) { S.me = null; } };
  load();
  const dev = localStorage.getItem('scbt_dev') || (() => { const d = Math.random().toString(36).slice(2, 12); localStorage.setItem('scbt_dev', d); return d; })();
  const READ = /^(dash|monitor\.data|bank\.daftar|ujian\.daftar|ujian\.detail|siswa\.daftar|rekap\.ujian|pengguna\.daftar|cfg\.ambil|public)/;
  const inflight = {}; let epoch = 0, offset = 0;
  const sl = ms => new Promise(r => setTimeout(r, ms));
  function setSession(t, me) { S.token = t; S.me = me; const st = sandbox ? sessionStorage : localStorage, k = sandbox ? ['scbt_sb_t', 'scbt_sb_m'] : ['scbt_token', 'scbt_me']; st.setItem(k[0], t); st.setItem(k[1], JSON.stringify(me)); }
  function clear() { S.token = ''; S.me = null; const st = sandbox ? sessionStorage : localStorage; (sandbox ? ['scbt_sb_t', 'scbt_sb_m'] : ['scbt_token', 'scbt_me']).forEach(k => st.removeItem(k)); }
  function enterSandbox(role) { sessionStorage.setItem('scbt_sandbox', '1'); sessionStorage.setItem('scbt_sb_role', role || 'siswa'); sessionStorage.removeItem('scbt_sb_t'); sessionStorage.removeItem('scbt_sb_m'); sandbox = true; load(); }
  function exitSandbox() { ['scbt_sandbox', 'scbt_sb_role', 'scbt_sb_t', 'scbt_sb_m'].forEach(k => sessionStorage.removeItem(k)); sandbox = false; load(); }
  async function run(action, data) {
    if (demo()) return Mock.call(action, data, S.me);
    for (let i = 0; i < 4; i++) {
      let j;
      try {
        const r = await fetch(url(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: S.token, data }) });
        j = await r.json();
      } catch (e) { if (i === 3) { const x = new Error('Tidak dapat terhubung ke server. Periksa koneksi internet.'); x.net = true; throw x; } await sl(600 * (i + 1)); continue; }
      if (j.code === 'AUTH') { clear(); if (!location.hash.startsWith('#/masuk')) location.hash = '#/masuk'; }
      if (j.code === 'SIBUK' && i < 3) { await sl(500 + Math.random() * 1200 * (i + 1)); continue; }
      if (!j.success) { const x = new Error(j.message || 'Terjadi kesalahan.'); x.code = j.code; throw x; }
      return j;
    }
  }
  async function call(action, data = {}) {
    if (!READ.test(action)) { epoch++; return run(action, data); }
    const k = epoch + '|' + action + '|' + JSON.stringify(data);
    if (inflight[k]) return inflight[k];
    const p = run(action, data); inflight[k] = p; p.then(() => delete inflight[k], () => delete inflight[k]); return p;
  }
  // beberapa baca sekaligus → 1 eksekusi server
  async function many(calls) {
    if (demo() || calls.length === 1) return Promise.all(calls.map(c => call(c[0], c[1] || {}).then(r => r.data)));
    const r = await run('batch', { calls: calls.map(c => ({ action: c[0], data: c[1] || {} })) });
    return r.data.results.map(x => { if (!x.success) throw new Error(x.message); return x.data; });
  }
  return { call, many, demo, S, dev, setSession, clear, enterSandbox, exitSandbox, sandbox: () => sandbox, sbRole: () => sessionStorage.getItem('scbt_sb_role') || 'siswa', syncClock: now => { offset = now - Date.now(); }, now: () => Date.now() + offset };
})();
