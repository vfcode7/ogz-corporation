/* =====================================================================
   UI — cardápio, header, marquee, cursor, reveals, contadores, horário
   ===================================================================== */
import { BRAND, HORARIOS, CATEGORIAS, MENU, BRL } from './config.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;

/* ------------------------------------------------------- cardápio */
function cardHTML(item) {
  const tag = item.tag
    ? `<span class="dish-tag${/picante/i.test(item.tag) ? ' is-fire' : ''}">${item.tag}</span>` : '';
  return `
    <article class="dish" data-cat="${item.cat}">
      <div class="dish-media">${tag}
        <img src="${item.img}" width="900" height="680" loading="lazy" decoding="async"
             alt="${item.nome} — ${item.desc}"
             onerror="this.onerror=null;this.src='${item.fallback}';this.classList.add('is-fallback')">
      </div>
      <div class="dish-body">
        <h3>${item.nome}</h3>
        <p>${item.desc}</p>
        <div class="dish-foot">
          <span class="dish-price">${BRL.format(item.preco)}</span>
          <button class="add" data-add="${item.id}" aria-label="Adicionar ${item.nome} à sacola">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                 stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </article>`;
}

function tilt(card) {
  if (TOUCH || REDUCED) return;
  const st = { rx: 0, ry: 0, tx: 0, ty: 0 };
  let raf = null, vivo = false;
  const tick = () => {
    st.rx = lerp(st.rx, st.tx, .14);
    st.ry = lerp(st.ry, st.ty, .14);
    card.style.transform = `perspective(900px) rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg)`;
    if (vivo || Math.abs(st.rx - st.tx) > .01) raf = requestAnimationFrame(tick);
    else { raf = null; card.style.transform = ''; }
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
  card.addEventListener('mouseenter', () => { vivo = true; start(); });
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    st.ty = ((e.clientX - r.left) / r.width - .5) * 10;   // máx 5°
    st.tx = (.5 - (e.clientY - r.top) / r.height) * 10;
    start();
  });
  card.addEventListener('mouseleave', () => { vivo = false; st.tx = st.ty = 0; start(); });
}

function renderGrid(cat) {
  const grid = $('#grid');
  const lista = cat === 'todos' ? MENU : MENU.filter(m => m.cat === cat);
  grid.innerHTML = lista.map(cardHTML).join('');
  $$('.dish', grid).forEach(tilt);
  if (!REDUCED) {
    gsap.fromTo($$('#grid .dish'),
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: .55, stagger: .06, ease: 'power3.out', overwrite: true });
  }
}

function initMenu() {
  const tabs = $('#tabs');
  const todas = [{ id: 'todos', label: 'Tudo' }, ...CATEGORIAS];
  tabs.innerHTML = todas.map((c, i) =>
    `<button class="tab" role="tab" data-cat="${c.id}" aria-selected="${i === 0}">${c.label}</button>`).join('');
  tabs.addEventListener('click', e => {
    const b = e.target.closest('.tab');
    if (!b) return;
    $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t === b)));
    renderGrid(b.dataset.cat);
  });
  renderGrid('todos');
}

/* --------------------------------------------------------- header */
function initHeader() {
  const header = $('#header');
  const menu = $('#mobile-menu');
  let lastY = 0, aberto = false;

  const tl = gsap.timeline({ paused: true })
    .set(menu, { display: 'block' })
    .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .6, ease: 'expo.inOut' })
    .from('#mobile-menu .m-link, #mobile-menu .btn-yellow',
          { y: 34, opacity: 0, duration: .45, stagger: .06 }, '-=.28');

  const abrir = () => {
    aberto = true; menu.hidden = false; tl.play();
    $('#menu-open').setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked'); window.lenis?.stop();
  };
  const fechar = () => {
    if (!aberto) return;
    aberto = false; tl.reverse();
    $('#menu-open').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked'); window.lenis?.start();
    gsap.delayedCall(.7, () => { if (!aberto) menu.hidden = true; });
  };
  $('#menu-open').addEventListener('click', abrir);
  $('#menu-close').addEventListener('click', fechar);
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', fechar));
  addEventListener('keydown', e => e.key === 'Escape' && fechar());

  ScrollTrigger.create({
    start: 'top -10',
    onUpdate(self) {
      const y = self.scroll();
      if (aberto) return;
      gsap.to(header, { yPercent: y > lastY && y > 240 ? -110 : 0, duration: .45, overwrite: true });
      lastY = y;
    }
  });
}

/* -------------------------------------------------------- marquee */
function initMarquee() {
  const track = $('.marquee-track');
  if (!track || REDUCED) return;
  const largura = track.scrollWidth / 2;
  let x = 0, base = 0.9, extra = 0;
  ScrollTrigger.create({
    onUpdate: self => { extra = Math.min(Math.abs(self.getVelocity()) / 260, 9); }
  });
  gsap.ticker.add(() => {
    x -= base + extra;
    extra *= 0.94;
    if (x <= -largura) x += largura;
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
  });
}

/* ------------------------------------------- cursor + magnéticos */
function initPointer() {
  if (TOUCH) { document.body.classList.add('cursor-off'); return; }
  const cur = $('#cur'), label = cur.querySelector('span');
  const m = { x: innerWidth / 2, y: innerHeight / 2 }, p = { ...m };
  let s = 1, ts = 1;
  addEventListener('mousemove', e => { m.x = e.clientX; m.y = e.clientY; }, { passive: true });
  const loop = () => {
    p.x = lerp(p.x, m.x, .18); p.y = lerp(p.y, m.y, .18); s = lerp(s, ts, .16);
    cur.style.transform = `translate(${p.x}px,${p.y}px) scale(${s})`;
    requestAnimationFrame(loop);
  };
  loop();
  const set = (txt, sc) => {
    ts = sc; label.textContent = txt;
    gsap.to(label, { opacity: txt ? 1 : 0, duration: .2 });
  };
  const bind = (sel, txt, sc) => $$(sel).forEach(el => {
    el.addEventListener('mouseenter', () => set(txt, sc));
    el.addEventListener('mouseleave', () => set('', 1));
  });
  bind('.dish-media, .combo-img, #float-burger', 'Ver', 2.1);
  bind('a, button', '', 1.6);

  if (REDUCED) return;
  const mags = $$('.is-magnetic').map(el => ({ el, x: 0, y: 0, tx: 0, ty: 0 }));
  addEventListener('mousemove', e => {
    for (const it of mags) {
      const r = it.el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const perto = Math.hypot(dx, dy) < 80 + Math.max(r.width, r.height) / 2;
      it.tx = perto ? dx * .3 : 0; it.ty = perto ? dy * .36 : 0;
    }
  }, { passive: true });
  gsap.ticker.add(() => {
    for (const it of mags) {
      it.x = lerp(it.x, it.tx, .16); it.y = lerp(it.y, it.ty, .16);
      it.el.style.transform = `translate(${it.x.toFixed(2)}px,${it.y.toFixed(2)}px)`;
    }
  });
}

/* -------------------------------------- reveals, contadores, linha */
function initReveals() {
  $$('[data-reveal]').forEach(el => {
    gsap.from(el, {
      y: 30, opacity: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
    });
  });

  $$('[data-count]').forEach(el => {
    const alvo = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    el.textContent = fmt.format(0);
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter() {
        const o = { v: 0 };
        gsap.to(o, { v: alvo, duration: 1.6, ease: 'power2.out', onUpdate: () => el.textContent = fmt.format(o.v) });
      }
    });
  });

  const dash = $('#dash-path');
  if (dash) {
    const len = dash.getTotalLength();
    gsap.set(dash, { strokeDasharray: `${len}`, strokeDashoffset: len });
    gsap.to(dash, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '#como-pedir', start: 'top 70%', end: 'bottom 70%', scrub: .6 }
    });
  }

  if (!REDUCED) {
    gsap.to('#float-burger', { y: -16, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.to('#hero-glow', { opacity: .72, scale: 1.08, duration: 2.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
    gsap.to('#burst', {
      rotate: 360, duration: 48, ease: 'none', repeat: -1, transformOrigin: '50% 50%'
    });
  }
}

/* -------------------------------------------------------- starburst */
function initBurst() {
  const g = $('#burst');
  if (!g) return;
  let d = '';
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r1 = 60, r2 = i % 2 ? 150 : 196;
    d += `M200 200 L${(200 + Math.cos(a) * r1).toFixed(1)} ${(200 + Math.sin(a) * r1).toFixed(1)} `
       + `L${(200 + Math.cos(a + .11) * r2).toFixed(1)} ${(200 + Math.sin(a + .11) * r2).toFixed(1)} Z `;
  }
  g.innerHTML = `<path d="${d}" fill="#140D0B" opacity=".55"/>`;
}

/* ------------------------------------------------ horário / status */
function minutosAgora(d) { return d.getHours() * 60 + d.getMinutes(); }

function initHorarios() {
  const agora = new Date();
  const dia = agora.getDay();
  const min = minutosAgora(agora);

  const lista = $('#hours-list');
  if (lista) {
    lista.innerHTML = [2, 3, 4, 5, 6, 0, 1].map(d => {
      const h = HORARIOS[d];
      const txt = h.faixa
        ? `${String(Math.floor(h.faixa[0] / 60)).padStart(2, '0')}h${h.faixa[0] % 60 ? String(h.faixa[0] % 60).padStart(2, '0') : ''}`
          + ` às ${String(Math.floor(h.faixa[1] / 60) % 24).padStart(2, '0')}h${h.faixa[1] % 60 ? String(h.faixa[1] % 60).padStart(2, '0') : ''}`
        : 'Fechado';
      return `<li class="${d === dia ? 'is-today' : ''}"><span>${h.label}</span><span>${txt}</span></li>`;
    }).join('');
  }

  // aberto agora? considera madrugada herdada do dia anterior
  const hoje = HORARIOS[dia].faixa;
  const ontem = HORARIOS[(dia + 6) % 7].faixa;
  const aberto = (hoje && min >= hoje[0] && min <= hoje[1])
              || (ontem && ontem[1] > 1440 && min <= ontem[1] - 1440);

  const badge = $('#status-badge');
  badge.classList.add(aberto ? 'is-open' : 'is-closed');
  badge.querySelector('span').textContent = aberto ? 'Aberto agora' : 'Fechado';
}

/* ------------------------------------------------------------ links */
function initLinks() {
  const texto = encodeURIComponent('Olá! Quero fazer um pedido na BRUTO BURGER CO.');
  const wa = `https://wa.me/${BRAND.whatsapp}?text=${texto}`;
  ['#wpp-link', '#wpp-float', '#wpp-footer'].forEach(s => { const e = $(s); if (e) e.href = wa; });
  $('#ifood-link').href = BRAND.ifood;
  $('#ano').textContent = new Date().getFullYear();
}

/* -------------------------------------------------------- depoimentos */
function initSwiper() {
  if (typeof Swiper === 'undefined') return;
  new Swiper('#depo-swiper', {
    slidesPerView: 1.08, spaceBetween: 16, grabCursor: true,
    pagination: { el: '#depo-swiper .swiper-pagination', clickable: true },
    breakpoints: { 640: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 24 } }
  });
}

export function initUI() {
  initLinks();
  initMenu();
  initHeader();
  initMarquee();
  initBurst();
  initReveals();
  initHorarios();
  initSwiper();
  initPointer();
}
