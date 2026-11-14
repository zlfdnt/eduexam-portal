// Utilitas UI: helper DOM, ikon, toast/modal, efek interaktif, slideshow, ilustrasi, kursor lup, grafik.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');
const fmtT = ms => { const d = new Date(+ms); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtJam = ms => { const d = new Date(+ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtD = s => { s = Math.max(0, s | 0); return `${pad(s / 3600 | 0)}:${pad(s % 3600 / 60 | 0)}:${pad(s % 60)}`; };
const fmtMS = s => { s = Math.max(0, s | 0); return `${pad(s / 60 | 0)}:${pad(s % 60)}`; };
const ini = n => String(n || '?').split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
const toLocalInput = ms => { const d = new Date(+ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const ICON = {
  dash: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  book: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/>', clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12l2 2 4-4"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M7.5 7.5a6 6 0 0 0 0 9M16.5 7.5a6 6 0 0 1 0 9M4.5 4.5a10 10 0 0 0 0 15M19.5 4.5a10 10 0 0 1 0 15"/>',
  chart: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 16v-4M12 16V8M16 16v-6"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.5 3.5 6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>', flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', logout: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  grad: '<path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/>', key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/>'
};
const ic = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ''}</svg>`;

// pembersih saat pindah halaman (timer, interval, listener)
const Leave = { fns: [], add(f) { this.fns.push(f); }, run() { this.fns.splice(0).forEach(f => { try { f(); } catch (e) { } }); } };
const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); Leave.add(() => t.removeEventListener(ev, fn, o)); };
const every = (fn, ms) => { const t = setInterval(fn, ms); Leave.add(() => clearInterval(t)); return t; };

function toast(m, t = 'ok') { const e = document.createElement('div'); e.className = 'toast ' + t; e.textContent = m; $('#toasts').append(e); setTimeout(() => e.classList.add('x'), 3200); setTimeout(() => e.remove(), 3700); }
const fail = e => toast(e && e.message ? e.message : 'Terjadi kesalahan.', 'err');
function modal(inner, o = {}) {
  const r = $('#modal-root'); r.innerHTML = `<div class="ov"><div class="md ${o.wide ? 'wide' : ''}" role="dialog" aria-modal="true"><button class="md-x" aria-label="Tutup">✕</button>${inner}</div></div>`;
  const close = () => { r.innerHTML = ''; o.onClose && o.onClose(); };
  $('.ov', r).addEventListener('click', e => { if (e.target.classList.contains('ov') || e.target.closest('.md-x')) close(); });
  return { close, el: $('.md', r) };
}
function confirmBox(msg, okText = 'Ya', danger) {
  return new Promise(res => {
    const m = modal(`<h3>Konfirmasi</h3><p>${esc(msg)}</p><div class="row end"><button class="btn" data-n>Batal</button><button class="btn ${danger ? 'btn-x' : 'btn-p'}" data-y>${esc(okText)}</button></div>`, { onClose: () => res(false) });
    $('[data-n]', m.el).onclick = () => m.close(); $('[data-y]', m.el).onclick = () => { res(true); $('#modal-root').innerHTML = ''; };
  });
}
const busy = async (btn, fn) => { const t = btn.innerHTML; btn.disabled = true; try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = t; } };

// efek global: glow mengikuti kursor, tilt 3D, ripple tombol
function fxInit() {
  document.addEventListener('pointermove', e => {
    const g = e.target.closest && e.target.closest('.glow');
    if (g) { const r = g.getBoundingClientRect(); g.style.setProperty('--mx', e.clientX - r.left + 'px'); g.style.setProperty('--my', e.clientY - r.top + 'px'); }
    const t = e.target.closest && e.target.closest('.tilt');
    if (t && e.pointerType === 'mouse') { const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; t.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateY(-4px)`; }
  });
  document.addEventListener('pointerout', e => { const t = e.target.closest && e.target.closest('.tilt'); if (t && !t.contains(e.relatedTarget)) t.style.transform = ''; });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.btn'); if (!b) return;
    const r = b.getBoundingClientRect(), s = document.createElement('span'), d = Math.max(r.width, r.height); s.className = 'rip';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; b.append(s); setTimeout(() => s.remove(), 600);
  });
}
function reveal(root = document) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); const c = e.target.matches('.cnt') ? e.target : null; if (c) countUp(c); $$('.cnt', e.target).forEach(countUp); } }), { threshold: .15 });
  $$('.rv', root).forEach(el => io.observe(el)); Leave.add(() => io.disconnect());
}
function countUp(el) {
  if (el._d) return; el._d = 1; const to = +el.dataset.to, suf = el.dataset.suf || '', t0 = performance.now();
  const f = t => { const p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f);
}
function slideshow(el, ms = 4200) {
  const s = $$('.sl', el); if (s.length < 2) return; let i = 0, t;
  const go = n => { s[i].classList.remove('on'); i = (n + s.length) % s.length; s[i].classList.add('on'); $$('.dot', el).forEach((d, k) => d.classList.toggle('on', k === i)); };
  const start = () => { clearInterval(t); if (!matchMedia('(prefers-reduced-motion:reduce)').matches) t = setInterval(() => go(i + 1), ms); };
  el.addEventListener('pointerenter', () => clearInterval(t)); el.addEventListener('pointerleave', start);
  $$('.dot', el).forEach((d, k) => d.onclick = e => { e.stopPropagation(); go(k); start(); }); start(); Leave.add(() => clearInterval(t));
}

// ilustrasi SVG internal (tanpa gambar eksternal) untuk slideshow kartu & hero
const Art = (() => {
  const bg = (a, b) => `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="345" cy="45" r="72" fill="#fff" opacity=".09"/><circle cx="40" cy="275" r="92" fill="#fff" opacity=".08"/>`;
  const C = ['#22C58B', '#6C4DF6', '#F59E0B', '#EF4444'];
  const S = {
    ujian: () => `<rect x="86" y="62" width="228" height="150" rx="14" fill="#fff"/><rect x="102" y="78" width="140" height="12" rx="6" fill="#E5DEFF"/>${[0, 1, 2].map(i => `<circle cx="120" cy="${120 + i * 28}" r="8" fill="${i == 1 ? '#22C58B' : '#E5DEFF'}"/><rect x="138" y="${115 + i * 28}" width="${130 - i * 22}" height="10" rx="5" fill="#C8BFFF"/>`).join('')}<rect x="56" y="218" width="288" height="12" rx="6" fill="#fff" opacity=".9"/>`,
    aman: () => `<path d="M200 54 126 84v62c0 46 32 74 74 88 42-14 74-42 74-88V84l-74-30Z" fill="#fff"/><path d="m166 148 24 24 46-52" stroke="#22C58B" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    live: () => [...Array(12)].map((_, i) => `<rect x="${64 + (i % 4) * 68}" y="${66 + (i / 4 | 0) * 56}" width="56" height="42" rx="10" fill="#fff" opacity=".95"/><circle cx="${92 + (i % 4) * 68}" cy="${87 + (i / 4 | 0) * 56}" r="7" fill="${C[(i * 7) % 4]}"/>`).join(''),
    nilai: () => `${[60, 96, 74, 124, 104].map((h, i) => `<rect x="${78 + i * 54}" y="${230 - h}" width="38" height="${h}" rx="8" fill="#fff" opacity=".95"/>`).join('')}<polyline points="97,150 151,112 205,138 259,84 313,98" stroke="#F59E0B" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${[[97, 150], [151, 112], [205, 138], [259, 84], [313, 98]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#F59E0B" stroke="#fff" stroke-width="3"/>`).join('')}`,
    bank: () => [0, 1, 2].map(i => `<rect x="${92 + i * 22}" y="${62 + i * 28}" width="196" height="108" rx="14" fill="#fff" opacity="${1 - (2 - i) * .12}"/>`).join('') + `<rect x="142" y="154" width="120" height="10" rx="5" fill="#C8BFFF"/><rect x="142" y="174" width="86" height="10" rx="5" fill="#E5DEFF"/><circle cx="160" cy="130" r="9" fill="#22C58B"/>`,
    pin: () => [...Array(6)].map((_, i) => `<rect x="${52 + i * 54}" y="112" width="44" height="60" rx="12" fill="#fff" opacity="${i < 4 ? 1 : .6}"/>${i < 4 ? `<circle cx="${74 + i * 54}" cy="142" r="7" fill="#431DC1"/>` : ''}`).join('') + `<rect x="132" y="206" width="136" height="30" rx="15" fill="#22C58B"/>`
  };
  const P = { ungu: ['#431DC1', '#6C4DF6'], biru: ['#00668A', '#40C2FD'], hijau: ['#0E9F6E', '#22C58B'], oranye: ['#C2410C', '#F59E0B'] };
  return { uri: (k, p = 'ungu') => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">${bg(...P[p])}${S[k]()}</svg>`) };
})();

// KURSOR LUP: karakter kaca pembesar yang mengikuti kursor dengan gerak pegas, mata mengikuti arah, berkedip, membesar saat hover tombol
const Lens = {
  init() {
    const el = $('#lens'); if (!el || !matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    el.innerHTML = `<svg viewBox="0 0 60 60"><defs><radialGradient id="lg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#C8BFFF" stop-opacity=".55"/></radialGradient></defs>
      <g class="lens-body"><rect x="35" y="36" width="9" height="24" rx="4.5" transform="rotate(-45 40 40)" fill="#431DC1"/><circle cx="24" cy="24" r="19" fill="url(#lg)" stroke="#5B3FD9" stroke-width="4.5"/>
      <path d="M12 18a13 13 0 0 1 9-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>
      <g class="lens-eye"><ellipse cx="18" cy="24" rx="4.4" ry="5.2" fill="#fff"/><ellipse cx="30" cy="24" rx="4.4" ry="5.2" fill="#fff"/><circle class="pu" cx="18" cy="24.5" r="2.4" fill="#1F2340"/><circle class="pu" cx="30" cy="24.5" r="2.4" fill="#1F2340"/>
      <ellipse class="lens-lid" cx="18" cy="24" rx="4.6" ry="5.4" fill="#C8BFFF"/><ellipse class="lens-lid" cx="30" cy="24" rx="4.6" ry="5.4" fill="#C8BFFF"/></g>
      <path d="M19 33q5 4 10 0" stroke="#5B3FD9" stroke-width="2" fill="none" stroke-linecap="round"/></g></svg>`;
    let x = -100, y = -100, tx = x, ty = y, rot = 0, last = 0; const pu = $$('.pu', el);
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; el.classList.add('on'); el.classList.toggle('hot', !!e.target.closest('a,button,[role=button],input,select,.glow,.opt')); last = performance.now(); });
    addEventListener('pointerdown', () => el.classList.add('dn')); addEventListener('pointerup', () => el.classList.remove('dn'));
    document.addEventListener('pointerleave', () => el.classList.remove('on')); document.addEventListener('pointerenter', () => el.classList.add('on'));
    const loop = () => {
      const gx = tx + 18, gy = ty + 14, vx = gx - x; x += vx * .14; y += (gy - y) * .14; rot += (Math.max(-28, Math.min(28, vx * .9)) - rot) * .15;
      el.style.transform = `translate(${x - 29}px,${y - 29}px) rotate(${rot}deg)`;
      const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy) || 1, k = Math.min(2.4, d / 30);
      pu.forEach(p => p.style.transform = `translate(${dx / d * k}px,${dy / d * k}px)`);
      requestAnimationFrame(loop);
    }; loop();
    (function blink() { el.classList.add('blink'); setTimeout(() => el.classList.remove('blink'), 140); setTimeout(blink, 2200 + Math.random() * 2800); })();
  },
  show(v) { document.body.classList.toggle('no-lens', !v); const el = $('#lens'); if (el) el.style.display = v ? '' : 'none'; }
};

// grafik SVG ringan
function smooth(pts) { if (pts.length < 2) return ''; let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`; } return d; }
function lineChart(el, data) {
  const W = 640, H = 220, P = 24, xs = i => P + i * (W - 2 * P) / Math.max(1, data.length - 1), ys = v => H - 28 - (v / 100) * (H - 56);
  const a = data.map((d, i) => [xs(i), ys(d.rata)]), b = data.map((d, i) => [xs(i), ys(d.lulus)]);
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22C58B" stop-opacity=".25"/><stop offset="1" stop-color="#22C58B" stop-opacity="0"/></linearGradient></defs>
  ${[0, 50, 100].map(v => `<line x1="${P}" x2="${W - P}" y1="${ys(v)}" y2="${ys(v)}" stroke="var(--line)" stroke-dasharray="4 4"/>`).join('')}
  <path d="${smooth(b)} L${b[b.length - 1][0]},${H - 28} L${b[0][0]},${H - 28}Z" fill="url(#ar)"/><path d="${smooth(b)}" fill="none" stroke="#22C58B" stroke-width="3" stroke-linecap="round"/>
  <path d="${smooth(a)}" fill="none" stroke="#5B3FD9" stroke-width="3.5" stroke-linecap="round"/>
  ${data.map((d, i) => `<text x="${xs(i)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--mute)">${esc(d.label)}</text>`).join('')}
  <g id="hv" style="display:none"><line y1="10" y2="${H - 28}" stroke="#5B3FD9" stroke-dasharray="3 3"/><circle r="5" fill="#5B3FD9"/></g></svg><div class="tip hide"></div>`;
  el.style.position = 'relative'; const svg = $('svg', el), tip = $('.tip', el), hv = $('#hv', el);
  svg.addEventListener('pointermove', e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W; let k = 0, m = 1e9; a.forEach((p, i) => { const dd = Math.abs(p[0] - x); if (dd < m) { m = dd; k = i; } });
    hv.style.display = ''; hv.setAttribute('transform', `translate(${a[k][0]},0)`); hv.firstElementChild.setAttribute('x1', 0); hv.firstElementChild.setAttribute('x2', 0); hv.lastElementChild.setAttribute('cy', a[k][1]);
    tip.classList.remove('hide'); tip.style.left = a[k][0] / W * r.width + 'px'; tip.style.top = a[k][1] / H * r.height + 'px'; tip.textContent = `Rerata: ${data[k].rata} · Lulus: ${data[k].lulus}%`; });
  svg.addEventListener('pointerleave', () => { hv.style.display = 'none'; tip.classList.add('hide'); });
}
function barChart(el, vals, labels, max) {
  max = max || Math.max(1, ...vals); const W = 520, H = 170, bw = (W - 20) / vals.length;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H + 22}" style="width:100%;height:auto">${vals.map((v, i) => { const h = v / max * (H - 24); return `<rect x="${10 + i * bw + 4}" y="${H - h}" width="${bw - 8}" height="${h}" rx="6" fill="url(#bg1)"><title>${esc(labels[i])}: ${v}</title></rect><text x="${10 + i * bw + bw / 2}" y="${H - h - 5}" text-anchor="middle" font-size="11" fill="var(--ink)">${v}</text><text x="${10 + i * bw + bw / 2}" y="${H + 15}" text-anchor="middle" font-size="10" fill="var(--mute)">${esc(labels[i])}</text>`; }).join('')}<defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6C4DF6"/><stop offset="1" stop-color="#5B3FD9"/></linearGradient></defs></svg>`;
}
function csvDownload(nama, rows) { const b = new Blob(['\ufeff' + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nama; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
function parseCSV(t) {
  t = t.replace(/^\ufeff/, ''); const first = t.split(/\r?\n/)[0] || '', del = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let r = [], c = '', q = false;
  for (let i = 0; i < t.length; i++) { const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true; else if (ch === del) { r.push(c); c = ''; } else if (ch === '\n') { r.push(c); rows.push(r); r = []; c = ''; } else if (ch !== '\r') c += ch; }
  if (c || r.length) { r.push(c); rows.push(r); } return rows.filter(x => x.some(v => v.trim()));
}
