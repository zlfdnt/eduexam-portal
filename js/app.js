// Router hash sederhana + penjaga akses berdasarkan peran.
(() => {
  const root = $('#app'); let seq = 0;
  async function route() {
    const my = ++seq; Leave.run(); $('#modal-root').innerHTML = ''; document.body.classList.remove('printing', 'rekap-print');
    const [path, qs] = (location.hash.slice(1) || '/').split('?'), p = path.split('/').filter(Boolean), me = Api.S.me && Api.S.token ? Api.S.me : null;
    const staff = me && me.peran !== 'siswa', siswa = me && me.peran === 'siswa';
    Lens.show(true);
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
