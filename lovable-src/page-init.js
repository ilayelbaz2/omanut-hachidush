export const initPage = function (root) {
  if (!root) return function () {};
  root.classList.add('js');
  var rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (rm) root.classList.add('rm');
  var hero = root.querySelector('.hero');
  var play = root.querySelector('[data-play]');
  var trig = root.querySelector('[data-act="toggle"]');
  var fin = root.querySelector('.fin');
  var finCta = root.querySelector('.fin .btn-wa');
  var offs = [];
  function on(el, ev, fn, opt) { if (!el) return; el.addEventListener(ev, fn, opt); offs.push(function () { el.removeEventListener(ev, fn, opt); }); }
  function measure() {
    if (!play || !trig) return;
    var p = play.getBoundingClientRect(), t = trig.getBoundingClientRect();
    if (!p.width || !p.height) return;
    play.style.setProperty('--sx', ((t.left + t.width / 2 - p.left) / p.width * 100).toFixed(2));
    play.style.setProperty('--sy', ((t.top + t.height / 2 - p.top) / p.height * 100).toFixed(2));
    var card = play.querySelector('.cardw'), pol = play.querySelector('.pol-ce');
    if (card && pol) {
      var W = play.offsetWidth, H = play.offsetHeight;
      var cx = card.offsetLeft, cy = card.offsetTop, cw = card.offsetWidth, ch = card.offsetHeight;
      var pw = pol.offsetWidth, ph = pol.offsetHeight;
      var x = Math.min(cx + cw / 2 + pw * 0.08, W - pw / 2 - 6);
      var y = Math.min(cy + ch / 2 - ph * 0.32, H - ph / 2 - 6);
      play.style.setProperty('--tx', (x / W * 100).toFixed(2));
      play.style.setProperty('--ty', (y / H * 100).toFixed(2));
    }
  }
  on(trig, 'click', function () {
    measure();
    var tidy = !hero.classList.contains('tidy');
    hero.classList.toggle('tidy', tidy);
    trig.setAttribute('aria-pressed', tidy ? 'true' : 'false');
    if (tidy && play) { var pr = play.getBoundingClientRect(); if (pr.bottom > (window.innerHeight || 800) + 40) setTimeout(function () { play.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center' }); }, 700); }
  });
  on(hero, 'pointermove', function (e) {
    if (rm || hero.classList.contains('tidy') || e.pointerType === 'touch') return;
    var r = hero.getBoundingClientRect();
    hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  on(hero, 'pointerleave', function () { hero.style.setProperty('--px', '0'); hero.style.setProperty('--py', '0'); });
  var ios = [];
  if ('IntersectionObserver' in window && !rm) {
    var io1 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { fin.classList.add('go'); io1.disconnect(); } });
    }, { threshold: 0.28 });
    if (fin) io1.observe(fin);
    ios.push(io1);
    var rv = root.querySelectorAll('[data-rv]');
    var io3 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io3.unobserve(en.target); } });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(rv, function (e) { io3.observe(e); });
    ios.push(io3);
  } else {
    if (fin) fin.classList.add('go');
    Array.prototype.forEach.call(root.querySelectorAll('[data-rv]'), function (e) { e.classList.add('in'); });
  }
  if ('IntersectionObserver' in window && finCta) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { root.classList.toggle('atend', en.isIntersecting); });
    }, { threshold: 0.6 });
    io2.observe(finCta);
    ios.push(io2);
  }
  var raf = 0;
  function tick() {
    raf = 0;
    measure();
    if (!fin) return;
    var r = fin.getBoundingClientRect(), vh = window.innerHeight || 800;
    var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.55)));
    fin.style.setProperty('--sp', p.toFixed(3));
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(tick); }
  on(document, 'scroll', onScroll, { passive: true, capture: true });
  on(window, 'resize', onScroll);
  tick();
  return function () {
    offs.forEach(function (f) { f(); });
    ios.forEach(function (o) { o.disconnect(); });
    if (raf) cancelAnimationFrame(raf);
  };
};
