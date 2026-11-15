// Router hash sederhana + penjaga akses berdasarkan peran.
(() => {
  const root = $('#app'); let seq = 0;
  function sbBar() { // bilah penanda Mode Pratinjau (data contoh)
    let el = $('#sbbar');
    if (Api.sandbox()) { document.body.classList.add('sb'); if (!el) { el = document.createElement('div'); el.id = 'sbbar'; el.innerHTML = '<span>MODE PRATINJAU · data contoh, tidak memengaruhi data sekolah</span><button class="btn btn-sm" id="sbx">Keluar pratinjau</button>'; document.body.prepend(el); $('#sbx').onclick = () => { Api.exitSandbox(); location.hash = '#/'; location.reload(); }; } }
    else { if (el) el.remove(); document.body.classList.remove('sb'); }
  }
  async function route() {
    const my = ++seq; Leave.run(); $('#modal-root').innerHTML = ''; document.body.classList.remove('printing', 'rekap-print');
    const [path, qs] = (location.hash.slice(1) || '/').split('?'), p = path.split('/').filter(Boolean), me = Api.S.me && Api.S.token ? Api.S.me : null;
    const staff = me && me.peran !== 'siswa', siswa = me && me.peran === 'siswa';
    Lens.show(true); sbBar();
    if (p[0] === 'pratinjau') return Preview.pilih(root);
    if (p[0] === 'staff' && p[1] === 'pratinjau') { if (!staff) return location.replace('#/masuk/staff'); return p[2] === 'koleksi' ? Preview.koleksi(root, p[3]) : Preview.ujian(root, p[3]); }
    if (!p.length) return Landing.render(root);
    if (p[0] === 'masuk') { if (staff) return location.replace('#/staff/dashboard'); if (siswa) return location.replace('#/siswa'); return Auth.render(root, p[1] === 'staff' ? 'staff' : 'siswa'); }
    if (p[0] === 'siswa' || p[0] === 'ujian') { if (!siswa) return location.replace('#/masuk'); return p[0] === 'siswa' ? Exam.home(root) : Exam.room(root, p[1]); }
    if (p[0] === 'staff') { if (!staff) return location.replace('#/masuk/staff'); return Staff.render(root, p.slice(1).length ? p.slice(1) : ['dashboard'], qs); }
    location.replace('#/');
  }
  document.documentElement.dataset.theme = localStorage.getItem('scbt_theme') || '';
  fxInit(); Lens.init();
  addEventListener('hashchange', route); addEventListener('DOMContentLoaded', route);
  if (document.readyState !== 'loading') route();
})();
