(() => {
  'use strict';
  const WHATSAPP = 'https://wa.me/5543999539585';
  const INSTAGRAM_URL = ''; // Cole aqui o link oficial do Instagram (ex.: https://instagram.com/usuario)

  const MESSAGES = {
    geral: 'Olá! Conheci a OGZ CORPORATION pelo site e gostaria de conversar sobre um projeto digital.',
    institucional: 'Olá! Conheci a OGZ CORPORATION pelo site e tenho interesse em desenvolver um site institucional para minha empresa. Gostaria de solicitar um orçamento.',
    landing: 'Olá! Tenho interesse em desenvolver uma landing page para meu negócio. Poderiam me apresentar uma proposta?',
    catalogo: 'Olá! Tenho interesse em desenvolver um catálogo digital para minha empresa. Gostaria de mais informações.'
  };
  const waLink = text => `${WHATSAPP}?text=${encodeURIComponent(text)}`;

  // Links de WhatsApp com mensagem por serviço
  document.querySelectorAll('[data-wa]').forEach(el => {
    el.href = waLink(MESSAGES[el.dataset.wa] || MESSAGES.geral);
  });

  // Instagram (aparece apenas quando o link for informado)
  if (INSTAGRAM_URL) {
    document.querySelectorAll('[data-instagram]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('[data-instagram-link]').forEach(el => { el.href = INSTAGRAM_URL; el.hidden = false; });
  }

  // Menu mobile
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width:860px)').addEventListener('change', () => setMenu(false));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Títulos animados palavra por palavra
  const splitWords = root => {
    let n = 0;
    root.setAttribute('aria-label', root.textContent.replace(/\s+/g, ' ').trim());
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.append(' '); return; }
          const w = document.createElement('span'), i = document.createElement('span');
          w.className = 'w'; i.className = 'w__i'; i.textContent = t; i.style.setProperty('--i', n++);
          w.setAttribute('aria-hidden', 'true'); w.append(i); frag.append(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1) walk(ch);
    });
    walk(root); root.classList.add('split');
  };
  document.querySelectorAll('.hero h1,.head h2,.cta h2,.contact h2').forEach(splitWords);
  setTimeout(() => document.querySelector('.hero h1').classList.add('is-in'), 120);

  // Celular: benefícios recolhíveis nos cards de serviço (no desktop ficam sempre abertos)
  document.querySelectorAll('.card').forEach((card, n) => {
    const ul = card.querySelector('ul');
    if (!ul) return;
    const list = document.createElement('div'), inner = document.createElement('div'), btn = document.createElement('button');
    list.className = 'card__list'; list.id = `beneficios-${n + 1}`;
    ul.replaceWith(list); inner.append(ul); list.append(inner);
    btn.type = 'button'; btn.className = 'card__toggle'; btn.textContent = 'Ver benefícios';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', list.id);
    list.before(btn);
    btn.addEventListener('click', () => {
      const open = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open); btn.textContent = open ? 'Ocultar benefícios' : 'Ver benefícios';
    });
  });

  // Entrada escalonada de blocos e textos internos
  document.querySelectorAll('.head,.cta .container>*,.info li,.form,details,.footer__grid>*').forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.cards,.why,.projects,.steps,.info,.footer__grid').forEach(g =>
    [...g.children].forEach((c, n) => c.style.setProperty('--d', `${n * 0.14}s`)));
  document.querySelectorAll('.card,.why__i,.steps li,.project').forEach(b => {
    b.classList.add('stagger');
    [...b.children].forEach((c, n) => c.style.setProperty('--c', n));
  });
  document.querySelectorAll('.card li').forEach((li, n) => li.style.setProperty('--n', n % 5));
  const watched = document.querySelectorAll('.reveal,.split,.stagger');
  const show = el => { el.classList.add('is-in'); if (el.classList.contains('reveal')) setTimeout(() => el.classList.add('is-done'), 2400); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    watched.forEach(el => io.observe(el));
  } else { watched.forEach(show); }

  // Celular: indicadores dos carrosséis de serviços e projetos
  document.querySelectorAll('.cards,.projects').forEach(track => {
    const items = [...track.children], nav = document.createElement('div');
    nav.className = 'dots'; nav.setAttribute('role', 'group');
    nav.setAttribute('aria-label', track.classList.contains('cards') ? 'Serviços' : 'Projetos');
    const mark = () => {
      const c = track.getBoundingClientRect(), mid = c.left + c.width / 2;
      let best = 0, d = Infinity;
      items.forEach((it, n) => { const r = it.getBoundingClientRect(), dd = Math.abs(r.left + r.width / 2 - mid); if (dd < d) { d = dd; best = n; } });
      if (track.scrollLeft < 4) best = 0;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = items.length - 1;
      [...nav.children].forEach((b, n) => b.setAttribute('aria-current', n === best));
    };
    items.forEach((it, n) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', `Ir para o item ${n + 1} de ${items.length}`);
      b.addEventListener('click', () => {
        const left = it.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - (track.clientWidth - it.offsetWidth) / 2;
        track.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
      });
      nav.append(b);
    });
    track.after(nav); mark();
    track.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
    window.addEventListener('resize', mark);
  });

  // Animação em camadas controlada pelo scroll (renderizador próprio, sem CDN)
  const wrap = document.getElementById('montagem');
  const box = document.getElementById('lottie');
  const player = window.OGZPlayer && window.OGZ_LAYERS && box ? window.OGZPlayer(box, window.OGZ_LAYERS) : null;
  const caps = wrap ? [...wrap.querySelectorAll('.cap')] : [];
  const F1 = 92;
  let cur = 0, target = 0, running = false;
  const paint = f => { player.render(f); caps.forEach(c => c.classList.toggle('is-on', f >= +c.dataset.from)); };
  if (player) { player.svg.setAttribute('viewBox', '60 140 880 720'); paint(0); } else if (wrap) { wrap.hidden = true; }
  const tick = () => {
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.05) cur = target;
    paint(cur);
    running = cur !== target;
    if (running) requestAnimationFrame(tick);
  };

  // Scroll: cabeçalho, barra de progresso, parallax do hero e camadas
  const header = document.querySelector('.header');
  const bar = document.createElement('div');
  bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  const visual = document.querySelector('.hero__visual');
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 10);
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!reduce && y < window.innerHeight) visual.style.setProperty('--py', `${-y * 0.08}px`);
    if (player) {
      const r = wrap.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (72 - r.top) / (r.height - window.innerHeight + 72)));
      wrap.style.setProperty('--p', p.toFixed(3));
      target = p * F1;
      if (!running) { running = true; requestAnimationFrame(tick); }
    }
  };
  update();
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);

  // Formulário → WhatsApp
  const form = document.getElementById('form');
  const erro = document.getElementById('erro');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const nome = (d.get('nome') || '').trim();
    const empresa = (d.get('empresa') || '').trim();
    const mensagem = (d.get('mensagem') || '').trim();
    if (!nome || !mensagem) { erro.hidden = false; (nome ? form.mensagem : form.nome).focus(); return; }
    erro.hidden = true;
    const texto = [
      'Olá! Vim pelo site da OGZ CORPORATION.',
      `Nome: ${nome}`,
      empresa && `Empresa: ${empresa}`,
      `Serviço de interesse: ${d.get('servico')}`,
      `Mensagem: ${mensagem}`
    ].filter(Boolean).join('\n');
    window.open(waLink(texto), '_blank', 'noopener');
  });

  document.getElementById('ano').textContent = new Date().getFullYear();
})();
