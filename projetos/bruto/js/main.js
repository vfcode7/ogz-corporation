/* =====================================================================
   BOOT — Lenis + GSAP, preloader, hero e o resto da interface
   ===================================================================== */
import { initHero } from './hero.js?v=layout-7';
import { initUI } from './ui.js?v=layout-7';
import { initCart } from './cart.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

/* ---------------------------------------------------- smooth scroll */
if (!REDUCED && typeof Lenis === 'function') {
  const lenis = new Lenis({ lerp: .1, smoothWheel: true, touchMultiplier: 1.6 });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href').length < 2) return;
  const alvo = $(a.getAttribute('href'));
  if (!alvo) return;
  e.preventDefault();
  window.lenis ? window.lenis.scrollTo(alvo, { offset: -70, duration: 1.2 })
               : alvo.scrollIntoView({ behavior: 'smooth' });
});

/* ------------------------------------------------------- preloader */
const barra = $('#pre-bar'), pct = $('#pre-pct');
let mostrado = 0;
function progresso(p) {
  mostrado = Math.max(mostrado, p);
  const v = Math.round(mostrado * 100);
  barra.style.width = v + '%';
  pct.textContent = v + '%';
}
let preloaderClosed = false;
function fecharPreloader() {
  if (preloaderClosed) return;
  preloaderClosed = true;
  progresso(1);
  gsap.timeline()
    .to('#pl-box', { opacity: 0, y: -14, duration: .3 })
    .to('#preloader', { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '-=.05')
    .set('#preloader', { display: 'none' })
    .from('#hero-copy > *', { y: 30, opacity: 0, duration: .8, stagger: .08 }, '-=.45');
}

/* ------------------------------------------------------------ boot */
(async function start() {
  initUI();
  initCart();

  // segurança: nunca deixa o preloader preso se algo falhar
  const timeout = setTimeout(fecharPreloader, 9000);

  try {
    await initHero({ onPreload: p => progresso(Math.min(p * 2.2, .98)) });
  } catch (err) {
    console.error('[hero]', err);
  }

  clearTimeout(timeout);
  fecharPreloader();
  ScrollTrigger.refresh();
})();

addEventListener('load', () => ScrollTrigger.refresh());
if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
