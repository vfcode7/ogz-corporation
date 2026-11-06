/* =====================================================================
   HERO — pin + scrub da sequência, legendas por beat e canvas de brasas
   ===================================================================== */
import { HERO } from './config.js';
import { FrameSequence, mapProgress } from './frames.js?v=layout-7';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

/* ------------------------------------------------- legendas (beats) */
function buildBeats() {
  const wrapBeats = document.getElementById('hero-beats');
  const wrapChips = document.getElementById('hero-chips');
  HERO.beats.forEach((b, i) => {
    const el = document.createElement('div');
    el.className = 'beat' + (b.side === 'right' ? ' is-right' : '');
    el.style.left = b.side === 'right' ? 'auto' : b.x + '%';
    el.style.right = b.side === 'right' ? (100 - b.x - 28) + '%' : 'auto';
    el.style.top = b.y + '%';
    el.innerHTML = `<span class="beat-line" style="width:${b.side === 'right' ? 10 : 9}vw"></span>
                    <h3>${b.titulo}</h3><p>${b.texto}</p>`;
    wrapBeats.appendChild(el);

    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = b.chip || b.titulo;
    wrapChips.appendChild(chip);
    b._el = el; b._chip = chip;
  });
}

/* ------------------------------------------------------- brasas */
function embers(canvas) {
  if (REDUCED) return { setVelocity() {} };
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(devicePixelRatio || 1, 2);
  let w = 0, h = 0, parts = [], raf = null, vel = 0, visible = true;

  const size = () => {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * DPR; canvas.height = h * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  const build = () => {
    const n = w < 700 ? 30 : 48;
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.4 + 0.6,
      s: Math.random() * 0.7 + 0.25,
      o: Math.random() * 0.55 + 0.15,
      p: Math.random() * Math.PI * 2,
      d: Math.random() * 0.6 + 0.5          // profundidade = parallax
    }));
  };
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.s + vel * p.d * 7;
      p.p += 0.02;
      p.x += Math.sin(p.p) * 0.5;
      if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
      if (p.y > h + 40) p.y = -12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${120 + Math.round(p.o * 90)},40,${p.o})`;
      ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,122,26,.85)';
      ctx.fill();
    }
    vel *= 0.92;
    raf = requestAnimationFrame(tick);
  };
  size(); build(); tick();
  addEventListener('resize', () => { size(); build(); }, { passive: true });

  // pausa quando o hero sai da tela
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
    if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0 }).observe(canvas);

  return { setVelocity(v) { vel = Math.min(Math.abs(v), 0.9); } };
}

/* --------------------------------------------------------- init */
export async function initHero({ onPreload } = {}) {
  const canvas = document.getElementById('frames');
  const pin = document.getElementById('hero-pin');
  const intro = document.getElementById('hero-intro');
  const outro = document.getElementById('hero-outro');
  const seal = document.getElementById('hero-seal');
  const bar = document.querySelector('#hero-progress span');

  buildBeats();
  const emb = embers(document.getElementById('embers'));

  const seq = new FrameSequence(canvas, {
    total: HERO.TOTAL_FRAMES,
    path: HERO.framePath,
    lerp: HERO.lerp,
    onProgress: onPreload
  });

  /* rede fraca / economia de dados -> passe inicial mais denso,
     porque o segundo passe pode demorar muito                      */
  const conn = navigator.connection || {};
  const slow = conn.saveData || /2g/.test(conn.effectiveType || '');
  const step = slow ? 8 : 4;

  const ok = await seq.warmup(step);

  if (!ok) {                                  // fallback: nenhum frame carregou
    canvas.replaceWith(Object.assign(new Image(), {
      src: 'assets/img/hero-poster.webp', alt: canvas.getAttribute('aria-label'),
      width: 540, height: 960, style: 'width:100%;height:100%;object-fit:contain'
    }));
    intro.style.opacity = 1; outro.style.opacity = 1;
    return;
  }

  seq.start();
  seq.fill(slow ? 3 : 8);

  /* ---- reduced motion: hero estático com o burger montado ---- */
  if (REDUCED) {
    seq.stop();
    seq.jump(HERO.TOTAL_FRAMES - 1);
    document.getElementById('hero-beats').remove();
    gsap.set([outro, seal], { opacity: 1 });
    gsap.set(intro, { position: 'relative', opacity: 1 });
    pin.style.height = 'auto';
    pin.style.minHeight = '100svh';
    return;
  }

  /* --------------------------------------------- timeline do scroll */
  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 861px)', mob: '(max-width: 860px)' }, ctx => {
    const { desk } = ctx.conditions;

    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: desk ? HERO.endDesktop : HERO.endMobile,
      pin: pin,
      pinSpacing: true,
      scrub: HERO.scrub,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress;
        seq.target = mapProgress(HERO.frameMap, p);
        emb.setVelocity(self.getVelocity() / 4000);
        bar.style.transform = `scaleY(${p})`;

        // abertura some assim que começa a rolar
        const introOut = clamp(p / 0.10, 0, 1);
        gsap.set(intro, { opacity: 1 - introOut, xPercent: -introOut * 14 });

        // legendas
        for (const b of HERO.beats) {
          const inside = p >= b.from && p <= b.to;
          const edge = Math.min(p - b.from, b.to - p) / 0.05;
          const a = inside ? clamp(edge, 0, 1) : 0;
          gsap.set(b._el, { opacity: a, y: (1 - a) * 18 });
          gsap.set(b._chip, { opacity: a, y: (1 - a) * 10 });
        }

        // bloco final + selo
        const outA = clamp((p - HERO.outroFrom) / 0.1, 0, 1);
        gsap.set(outro, { opacity: outA, y: (1 - outA) * 30 });
        gsap.set(seal, { opacity: outA, scale: 0.8 + outA * 0.2 });
      }
    });
  });
}
