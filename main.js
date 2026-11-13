(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
gsap.registerPlugin(ScrollTrigger);

/* smooth scroll */
let lenis;
if (!RM) {
  lenis = new Lenis({ duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const go = id => lenis ? lenis.scrollTo(id, { offset: 0 }) : $(id).scrollIntoView();

/* menu */
$('#mb').onclick = () => document.body.classList.toggle('menu-open');
$$('#menu a, .pill a').forEach(a => a.onclick = e => { e.preventDefault(); document.body.classList.remove('menu-open'); go(a.getAttribute('href') === '#top' ? 0 : a.getAttribute('href')); });

/* loader + hero intro */
const cnt = $('#cnt'), o = { v: 0 };
gsap.to(o, { v: 100, duration: RM ? 0.1 : 1.3, ease: 'power2.inOut', onUpdate: () => cnt.textContent = Math.round(o.v),
  onComplete: () => gsap.timeline()
    .to('#load', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' })
    .to('#ttl span', { y: 0, duration: 1.3, stagger: 0.12, ease: 'expo.out' }, '-=0.3')
    .from('.h1i', { scale: 1.25, duration: 2.2, ease: 'expo.out' }, '<')
    .set('#load', { display: 'none' }) });

/* hero: diamond reveal, scrubbed + pinned */
if (!RM) {
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=130%', scrub: 1.2, pin: true, anticipatePin: 1 } })
    .to('.h2i', { clipPath: 'polygon(50% -60%,160% 50%,50% 160%,-60% 50%)', ease: 'none' }, 0)
    .to('.art', { rotate: 90, scale: 1.4, ease: 'none' }, 0)
    .to('#ttl', { scale: 1.15, opacity: 0.2, ease: 'none' }, 0);
}

/* works: reveal + parallax */
$$('.w').forEach(w => {
  const im = $('img', w);
  gsap.fromTo(w, { clipPath: 'inset(18% 12% 18% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: w, start: 'top 95%', end: 'top 35%', scrub: 1 } });
  gsap.fromTo(im, { scale: 1.3, yPercent: -8, force3D: true }, { scale: 1, yPercent: 8, force3D: true, ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
});

/* background light to dark */
ScrollTrigger.create({ trigger: '#services', start: 'top 70%', end: 'top 20%', scrub: 1,
  animation: gsap.to('body', { backgroundColor: '#1f2223', color: '#f2f2f0', ease: 'none' }) });
$$('.card').forEach((c, i, a) => i < a.length - 1 && gsap.to(c, { scale: 0.93, ease: 'none', scrollTrigger: { trigger: a[i + 1], start: 'top 70%', end: 'top 12%', scrub: 1 } }));

/* corner micro-text per section */
const cs = $$('.c');
$$('[data-c]').forEach(s => {
  const set = () => gsap.to(cs, { opacity: 0, duration: 0.2, onComplete: () => { s.dataset.c.split('|').forEach((t, i) => cs[i].textContent = t); gsap.to(cs, { opacity: 1, duration: 0.4 }); } });
  ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onEnter: set, onEnterBack: set });
});

/* footer wordmark reveal */
gsap.from('.big', { yPercent: 60, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top 40%', end: 'bottom bottom', scrub: 1 } });

/* about images */
gsap.from('.pics img', { y: 80, opacity: 0, stagger: 0.15, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.pics', start: 'top 80%' } });

/* custom cursor */
const cur = $('#cur'); let mx = 0, my = 0, cx = 0, cy = 0;
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
gsap.ticker.add(() => { cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14; cur.style.transform = `translate(${cx}px,${cy}px)`; });
document.addEventListener('pointerover', e => { const t = e.target.closest('[data-cur]'); cur.classList.toggle('on', !!t); cur.textContent = t ? t.dataset.cur : ''; });

/* gallery */
const mas = $('#mas'), fl = $('#fl');
const cats = ['All', ...new Set(PHOTOS.map(p => p.c))];
let list = PHOTOS, idx = 0;
$('#n').textContent = `(${PHOTOS.length})`;
const render = () => {
  mas.innerHTML = '';
  list.forEach((p, i) => {
    const im = new Image(); im.src = 'images/thumb/' + p.f; im.width = p.w; im.height = p.h; im.loading = 'lazy'; im.alt = p.c + ' photograph by Muhammad Ansar';
    im.dataset.cur = 'VIEW'; im.onclick = () => open(i); mas.append(im);
  });
  gsap.from('#mas img', { opacity: 0, y: 40, stagger: 0.015, duration: 0.9, ease: 'expo.out', clearProps: 'transform,opacity' });
  ScrollTrigger.refresh();
};
cats.forEach(c => { const b = document.createElement('button'); b.textContent = c; if (c === 'All') b.className = 'on';
  b.onclick = () => { $$('button', fl).forEach(x => x.classList.remove('on')); b.classList.add('on'); list = c === 'All' ? PHOTOS : PHOTOS.filter(p => p.c === c); render(); }; fl.append(b); });
render();

/* lightbox */
const lb = $('#lb'), lim = $('img', lb);
const show = i => { idx = (i + list.length) % list.length; lim.style.opacity = 0; setTimeout(() => { lim.src = 'images/full/' + list[idx].f; lim.onload = () => lim.style.opacity = 1; }, 150); $('#lc').textContent = `${idx + 1} / ${list.length}`; };
function open(i) { lb.classList.add('on'); lenis && lenis.stop(); show(i); }
const close = () => { lb.classList.remove('on'); lenis && lenis.start(); };
$('.x', lb).onclick = close; $('.pv', lb).onclick = () => show(idx - 1); $('.nx', lb).onclick = () => show(idx + 1);
lb.onclick = e => e.target === lb && close();
addEventListener('keydown', e => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
let sx; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX); lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1)); });

/* works open lightbox on the same photo */
$$('.w').forEach(w => w.onclick = () => { const f = $('img', w).src.split('/').pop(); list = PHOTOS; open(Math.max(0, PHOTOS.findIndex(p => p.f === f))); });
})();
