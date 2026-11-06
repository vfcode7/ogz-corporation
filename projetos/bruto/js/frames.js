/* =====================================================================
   Engine de frame sequence em canvas
   - carrega em dois passes (1 a cada N, depois o resto)
   - desenha com devicePixelRatio e cover-fit
   - o frame atual persegue o alvo por lerp, deixando o scrub líquido
   ===================================================================== */

export class FrameSequence {
  constructor(canvas, { total, path, lerp = 0.12, onProgress }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.total = total;
    this.path = path;
    this.lerpAmount = lerp;
    this.onProgress = onProgress || (() => {});
    this.images = new Array(total);
    this.ready = new Array(total).fill(false);
    this.current = 0;
    this.target = 0;
    this.loaded = 0;
    this.failed = 0;
    this.width = 0;
    this.height = 0;
    this._raf = null;
    this._onResize = () => this.resize();
  }

  /* --------------------------------------------------------- carregar */
  load(index) {
    return new Promise(resolve => {
      if (this.images[index]) return resolve(true);
      const img = new Image();
      img.decoding = 'async';
      img.src = this.path(index);
      const done = ok => {
        if (ok) {
          this.images[index] = img;
          this.ready[index] = true;
          if (!this.width) { this.width = img.naturalWidth; this.height = img.naturalHeight; }
        } else {
          this.failed++;
        }
        this.loaded++;
        this.onProgress(this.loaded / this.total, ok);
        resolve(ok);
      };
      img.onload = () => (img.decode ? img.decode().then(() => done(true)).catch(() => done(true)) : done(true));
      img.onerror = () => done(false);
    });
  }

  /** Primeiro passe: 1 frame a cada `step`. Já permite rolar. */
  async warmup(step = 8) {
    const idx = [];
    for (let i = 0; i < this.total; i += step) idx.push(i);
    if (idx[idx.length - 1] !== this.total - 1) idx.push(this.total - 1);
    await Promise.all(idx.map(i => this.load(i)));
    return this.failed < idx.length;          // false = nenhum frame carregou
  }

  /** Segundo passe: completa o resto em segundo plano, sem travar a UI. */
  async fill(concurrency = 6) {
    const pend = [];
    for (let i = 0; i < this.total; i++) if (!this.ready[i]) pend.push(i);
    let cursor = 0;
    const worker = async () => {
      while (cursor < pend.length) await this.load(pend[cursor++]);
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
  }

  /* ------------------------------------------------------- desenhar */
  nearest(i) {
    const n = Math.round(i);
    if (this.ready[n]) return this.images[n];
    for (let d = 1; d < this.total; d++) {                 // procura o vizinho mais próximo já carregado
      if (this.ready[n - d]) return this.images[n - d];
      if (this.ready[n + d]) return this.images[n + d];
    }
    return null;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw(this.current, true);
  }

  draw(i, force = false) {
    const img = this.nearest(i);
    if (!img) return;
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return;
    const ctx = this.ctx;
    // cover-fit
    const scale = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.drawImage(img, (r.width - w) / 2, (r.height - h) / 2, w, h);
    if (force) this._last = -1;
  }

  tick = () => {
    this.current += (this.target - this.current) * this.lerpAmount;
    if (Math.abs(this.target - this.current) < 0.02) this.current = this.target;
    const n = Math.round(this.current);
    if (n !== this._last) { this.draw(this.current); this._last = n; }
    this._raf = requestAnimationFrame(this.tick);
  };

  start() {
    this.resize();
    window.addEventListener('resize', this._onResize, { passive: true });
    if (!this._raf) this._raf = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    window.removeEventListener('resize', this._onResize);
  }

  /** Pula direto, sem suavização (usado no fallback / reduced motion). */
  jump(i) { this.current = this.target = i; this._last = -1; this.draw(i, true); }
}

/** Interpola um mapa [[progresso, frame], ...] de forma linear por partes. */
export function mapProgress(map, p) {
  for (let i = 0; i < map.length - 1; i++) {
    const [p0, f0] = map[i], [p1, f1] = map[i + 1];
    if (p <= p1) {
      const t = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
      return f0 + (f1 - f0) * Math.max(0, Math.min(1, t));
    }
  }
  return map[map.length - 1][1];
}
