/* Mini-renderizador de Lottie (SVG), sem dependências. Uso: OGZPlayer(container, dados) -> { render(frame), total } */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a || {}) e.setAttribute(k, a[k]); return e; };
  const arr = v => (Array.isArray(v) ? v : [v]);
  const at = (v, d) => { const a = arr(v); return a[d] !== undefined ? a[d] : a[0]; };

  function ease(o, i, d, t) {
    const x1 = at(o.x, d), y1 = at(o.y, d), x2 = at(i.x, d), y2 = at(i.y, d);
    if (x1 === y1 && x2 === y2) return t;
    let a = 0, b = 1, m = 0.5;
    for (let n = 0; n < 24; n++) {
      m = (a + b) / 2;
      const x = 3 * (1 - m) * (1 - m) * m * x1 + 3 * (1 - m) * m * m * x2 + m * m * m;
      if (x < t) a = m; else b = m;
    }
    return 3 * (1 - m) * (1 - m) * m * y1 + 3 * (1 - m) * m * m * y2 + m * m * m;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpShape = (a, b, t) => {
    const f = k => a[k].map((p, n) => [lerp(p[0], b[k][n][0], t), lerp(p[1], b[k][n][1], t)]);
    return { v: f('v'), i: f('i'), o: f('o'), c: a.c };
  };

  function val(p, f) {
    if (!p || !p.a) return p ? p.k : undefined;
    const k = p.k, last = k[k.length - 1];
    if (f <= k[0].t) return k[0].s;
    if (f >= last.t) return last.s;
    let n = 0;
    while (f >= k[n + 1].t) n++;
    const A = k[n], B = k[n + 1];
    if (A.h) return A.s;
    const t = (f - A.t) / (B.t - A.t);
    const s = A.s, e = A.e || B.s;
    if (typeof arr(s)[0] === 'object') return lerpShape(arr(s)[0], arr(e)[0], ease(A.o, A.i, 0, t));
    if (!Array.isArray(s)) return lerp(s, e, ease(A.o, A.i, 0, t));
    if (A.to && A.ti) {                       // posição com curva espacial
      const u = ease(A.o, A.i, 0, t), w = 1 - u;
      return s.map((v, d) => w * w * w * v + 3 * w * w * u * (v + A.to[d]) + 3 * w * u * u * (e[d] + A.ti[d]) + u * u * u * e[d]);
    }
    return s.map((v, d) => lerp(v, e[d], ease(A.o, A.i, d, t)));
  }

  const pathD = s => {
    const { v, i, o, c } = Array.isArray(s) ? s[0] : s, n = v.length;
    let d = `M${v[0][0]} ${v[0][1]}`;
    for (let j = 1; j < n + (c ? 1 : 0); j++) {
      const a = j - 1, b = j % n;
      d += `C${v[a][0] + o[a][0]} ${v[a][1] + o[a][1]} ${v[b][0] + i[b][0]} ${v[b][1] + i[b][1]} ${v[b][0]} ${v[b][1]}`;
    }
    return d + (c ? 'Z' : '');
  };
  const rgb = c => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
  const matrix = ks => {
    const p = val(ks.p, f_) || [0, 0], a = val(ks.a, f_) || [0, 0], s = val(ks.s, f_) || [100, 100], r = val(ks.r || ks.rz, f_) || 0;
    return `translate(${p[0]} ${p[1]}) rotate(${r}) scale(${s[0] / 100} ${s[1] / 100}) translate(${-a[0]} ${-a[1]})`;
  };
  let f_ = 0;   // frame atual

  function group(items, ks, parent) {
    const g = el('g'), kids = [];
    const shapes = items.filter(i => i.ty === 'sh'), tm = items.find(i => i.ty === 'tm');
    for (let idx = items.length - 1; idx >= 0; idx--) {      // o primeiro item fica por cima
      const it = items[idx];
      if (it.ty === 'gr') {
        const tr = it.it.find(x => x.ty === 'tr'), sub = group(it.it.filter(x => x.ty !== 'tr'), tr);
        g.appendChild(sub.g); kids.push(sub.upd);
      } else if (it.ty === 'fl' || it.ty === 'st') {
        const own = items.slice(0, idx).filter(x => x.ty === 'sh'), e = el('path');
        g.appendChild(e);
        kids.push(() => {
          e.setAttribute('d', own.map(s => pathD(val(s.ks, f_))).join(''));
          const o = val(it.o, f_) / 100, c = val(it.c, f_);
          if (it.ty === 'fl') {
            e.setAttribute('fill', rgb(c)); e.setAttribute('fill-opacity', o);
            e.setAttribute('fill-rule', it.r === 2 ? 'evenodd' : 'nonzero');
          } else {
            e.setAttribute('fill', 'none'); e.setAttribute('stroke', rgb(c)); e.setAttribute('stroke-opacity', o);
            e.setAttribute('stroke-width', val(it.w, f_));
            e.setAttribute('stroke-linecap', ['butt', 'round', 'square'][(it.lc || 2) - 1]);
            e.setAttribute('stroke-linejoin', ['miter', 'round', 'bevel'][(it.lj || 2) - 1]);
            if (tm) {
              const s0 = (val(tm.s, f_) || 0) / 100, e0 = val(tm.e, f_) / 100, off = (val(tm.o, f_) || 0) / 360;
              const a = Math.min(s0, e0) + off, len = Math.abs(e0 - s0);
              e.setAttribute('pathLength', 1);
              e.setAttribute('stroke-dasharray', `${len} 2`);
              e.setAttribute('stroke-dashoffset', -a);
              e.setAttribute('visibility', len < 0.001 ? 'hidden' : 'visible');
            }
          }
        });
      }
    }
    const upd = () => {
      if (ks) { g.setAttribute('transform', matrix(ks)); g.setAttribute('opacity', (val(ks.o, f_) ?? 100) / 100); }
      kids.forEach(k => k());
    };
    return { g, upd };
  }

  window.OGZPlayer = function (container, data) {
    const svg = el('svg', { viewBox: `0 0 ${data.w} ${data.h}`, width: '100%', height: '100%', 'aria-hidden': 'true', focusable: 'false' });
    const layers = data.layers.filter(l => l.ty === 4).map(l => ({ l, ...group(l.shapes, l.ks) }));
    layers.slice().reverse().forEach(x => svg.appendChild(x.g));
    container.appendChild(svg);
    const render = f => {
      f_ = f;
      layers.forEach(x => {
        const on = f >= x.l.ip && f < x.l.op;
        x.g.style.display = on ? '' : 'none';
        if (on) { x.g.setAttribute('transform', matrix(x.l.ks)); x.g.setAttribute('opacity', (val(x.l.ks.o, f_) ?? 100) / 100); x.upd(); }
      });
    };
    render(0);
    return { render, total: data.op, svg };
  };
})();
