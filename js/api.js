// Klien API: fetch POST (text/plain agar tanpa preflight CORS), dedupe baca, retry saat server sibuk.
const Api = (() => {
  const url = () => window.APP_CONFIG.GAS_URL;
  const demo = () => /GANTI|XXXX/.test(url());
  const S = { token: localStorage.getItem('scbt_token') || '', me: JSON.parse(localStorage.getItem('scbt_me') || 'null') };
  const dev = localStorage.getItem('scbt_dev') || (() => { const d = Math.random().toString(36).slice(2, 12); localStorage.setItem('scbt_dev', d); return d; })();
  const READ = /^(dash|monitor\.data|bank\.daftar|ujian\.daftar|ujian\.detail|siswa\.daftar|rekap\.ujian|pengguna\.daftar|cfg\.ambil|public)/;
  const inflight = {}; let epoch = 0, offset = 0;
  const sl = ms => new Promise(r => setTimeout(r, ms));
  function setSession(t, me) { S.token = t; S.me = me; localStorage.setItem('scbt_token', t); localStorage.setItem('scbt_me', JSON.stringify(me)); }
  function clear() { S.token = ''; S.me = null; localStorage.removeItem('scbt_token'); localStorage.removeItem('scbt_me'); }
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
  return { call, many, demo, S, dev, setSession, clear, syncClock: now => { offset = now - Date.now(); }, now: () => Date.now() + offset };
})();
