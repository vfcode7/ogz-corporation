/* =====================================================================
   SACOLA + CHECKOUT NO WHATSAPP
   estado em localStorage · drawer com focus trap · ViaCEP · máscara
   ===================================================================== */
import { BRAND, MENU, BRL } from './config.js';

const KEY = 'bruto:cart:v1';
const $ = s => document.querySelector(s);

let itens = [];
let lastFocus = null;

/* ----------------------------------------------------- persistência */
const salvar = () => localStorage.setItem(KEY, JSON.stringify(itens));
const carregar = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    itens = raw.filter(l => MENU.some(m => m.id === l.id));
  } catch { itens = []; }
};

const produto = id => MENU.find(m => m.id === id);
const subtotal = () => itens.reduce((s, l) => s + produto(l.id).preco * l.qtd, 0);
const entregando = () => (document.querySelector('input[name="modo"]:checked') || {}).value !== 'retirada';
const taxa = () => (itens.length && entregando() ? BRAND.taxaEntrega : 0);
const total = () => subtotal() + taxa();
const contagem = () => itens.reduce((s, l) => s + l.qtd, 0);

/* ------------------------------------------------------------ toast */
let toastTimer;
export function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
}

/* ------------------------------------------------------- renderizar */
function render() {
  const body = $('#cart-body');
  body.innerHTML = '';

  if (!itens.length) {
    body.innerHTML = `<p class="cart-empty">Sua sacola está vazia.<br>Que tal começar pelo Bruto Clássico?</p>`;
  } else {
    for (const linha of itens) {
      const p = produto(linha.id);
      const el = document.createElement('article');
      el.className = 'line';
      el.innerHTML = `
        <img src="${p.img}" alt="" width="62" height="62" loading="lazy"
             onerror="this.onerror=null;this.src='${p.fallback}'">
        <div>
          <div class="flex items-start justify-between gap-3">
            <h4>${p.nome}</h4>
            <strong class="shrink-0 font-display text-[15px] text-fire-400">${BRL.format(p.preco * linha.qtd)}</strong>
          </div>
          <div class="mt-2.5 flex items-center gap-3">
            <div class="qty">
              <button type="button" data-dec="${p.id}" aria-label="Diminuir ${p.nome}">−</button>
              <span aria-live="polite">${linha.qtd}</span>
              <button type="button" data-inc="${p.id}" aria-label="Aumentar ${p.nome}">+</button>
            </div>
            <button type="button" class="line-rm" data-rm="${p.id}">remover</button>
          </div>
          <textarea class="obs" data-obs="${p.id}" rows="1"
            placeholder="Observações (ex.: sem cebola)">${linha.obs || ''}</textarea>
        </div>`;
      body.appendChild(el);
    }
  }

  $('#sum-sub').textContent = BRL.format(subtotal());
  $('#sum-fee').textContent = BRL.format(taxa());
  $('#sum-total').textContent = BRL.format(total());
  $('#go-checkout').disabled = !itens.length;
  $('#go-checkout').style.opacity = itens.length ? 1 : .45;

  const n = contagem();
  const badge = $('#bag-count');
  badge.textContent = n;
  badge.dataset.count = n;
  $('#mb-count').textContent = n;
  $('#mb-total').textContent = BRL.format(total());
  $('#mobile-bar').hidden = n === 0;
  salvar();
}

/* ------------------------------------------------------------ ações */
export function addItem(id, qtd = 1) {
  const p = produto(id);
  if (!p) return;
  const linha = itens.find(l => l.id === id);
  if (linha) linha.qtd += qtd; else itens.push({ id, qtd, obs: '' });
  render();
  toast(`${p.nome} na sacola`);
  const badge = $('#bag-count');
  gsap.fromTo(badge, { scale: 1.6 }, { scale: 1, duration: .45, ease: 'back.out(3)' });
}

/* ------------------------------------------------------------ drawer */
function trap(e) {
  if (e.key === 'Escape') return closeCart();
  if (e.key !== 'Tab') return;
  const f = $('#cart').querySelectorAll('button, input, select, textarea, a[href]');
  const vis = [...f].filter(el => !el.disabled && el.offsetParent !== null);
  if (!vis.length) return;
  const first = vis[0], last = vis[vis.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

export function openCart() {
  lastFocus = document.activeElement;
  $('#cart').classList.add('is-open');
  $('#cart').setAttribute('aria-hidden', 'false');
  $('#cart-backdrop').style.opacity = 1;
  $('#cart-backdrop').style.pointerEvents = 'auto';
  document.body.classList.add('is-locked');
  document.addEventListener('keydown', trap);
  setTimeout(() => $('#cart-close').focus(), 60);
  window.lenis?.stop();
}

export function closeCart() {
  $('#cart').classList.remove('is-open');
  $('#cart').setAttribute('aria-hidden', 'true');
  $('#cart-backdrop').style.opacity = 0;
  $('#cart-backdrop').style.pointerEvents = 'none';
  document.body.classList.remove('is-locked');
  document.removeEventListener('keydown', trap);
  lastFocus?.focus();
  window.lenis?.start();
}

/* ---------------------------------------------------------- checkout */
const soDigitos = v => v.replace(/\D/g, '');

function mascaraFone(el) {
  const d = soDigitos(el.value).slice(0, 11);
  el.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
           : d.length > 6  ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
           : d.length > 2  ? d.replace(/(\d{2})(\d{0,5})/, '($1) $2')
           : d;
}

const regras = {
  'ck-nome': v => v.trim().length >= 2 || 'Escreva seu nome.',
  'ck-fone': v => soDigitos(v).length >= 10 || 'Informe DDD e número.',
  'ck-cep':  v => !entregando() || soDigitos(v).length === 8 || 'CEP precisa ter 8 dígitos.',
  'ck-rua':  v => !entregando() || v.trim().length >= 5 || 'Informe rua e número.'
};

function valida(id) {
  const el = $('#' + id), msg = document.querySelector(`[data-err="${id}"]`);
  if (!el || !msg) return true;
  const r = regras[id](el.value);
  const ruim = r !== true;
  el.classList.toggle('is-invalid', ruim);
  el.setAttribute('aria-invalid', ruim ? 'true' : 'false');
  msg.textContent = ruim ? r : '';
  msg.classList.toggle('is-on', ruim);
  return !ruim;
}

async function buscarCep() {
  const cep = soDigitos($('#ck-cep').value);
  if (cep.length !== 8) return valida('ck-cep');
  const btn = $('#cep-btn');
  btn.disabled = true; btn.textContent = '...';
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const d = await r.json();
    if (d.erro) throw new Error('cep');
    $('#ck-rua').value = `${d.logradouro || ''}${d.logradouro ? ', ' : ''}`;
    $('#ck-bairro').value = d.bairro || '';
    $('#ck-rua').focus();
    toast('Endereço preenchido — falta o número');
  } catch {
    toast('CEP não encontrado. Pode digitar o endereço.');
  } finally {
    btn.disabled = false; btn.textContent = 'Buscar';
  }
}

function montarMensagem() {
  const modo = entregando() ? 'Entrega' : 'Retirada no balcão';
  const linhas = itens.map(l => {
    const p = produto(l.id);
    return `• ${l.qtd}x ${p.nome} — ${BRL.format(p.preco * l.qtd)}` + (l.obs ? `\n   _obs: ${l.obs}_` : '');
  });
  const partes = [
    `*Pedido — ${BRAND.nome}*`, '',
    ...linhas, '',
    `Subtotal: ${BRL.format(subtotal())}`,
    `Taxa de entrega: ${BRL.format(taxa())}`,
    `*Total: ${BRL.format(total())}*`, '',
    `Nome: ${$('#ck-nome').value.trim()}`,
    `WhatsApp: ${$('#ck-fone').value.trim()}`,
    `Modo: ${modo}`
  ];
  if (entregando()) {
    partes.push(`Endereço: ${$('#ck-rua').value.trim()}`);
    if ($('#ck-bairro').value.trim()) partes.push(`Bairro: ${$('#ck-bairro').value.trim()}`);
    if ($('#ck-cep').value.trim()) partes.push(`CEP: ${$('#ck-cep').value.trim()}`);
  }
  partes.push(`Pagamento: ${$('#ck-pag').value}`);
  if ($('#ck-pag').value === 'Dinheiro' && $('#ck-troco').value.trim()) {
    partes.push(`Troco para: ${$('#ck-troco').value.trim()}`);
  }
  return partes.join('\n');
}

/* -------------------------------------------------------------- init */
export function initCart() {
  carregar();
  render();

  $('#cart-open').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-backdrop').addEventListener('click', closeCart);
  $('#mobile-bar').addEventListener('click', openCart);

  // delegação dentro da sacola
  $('#cart-body').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const { inc, dec, rm } = b.dataset;
    if (inc) { itens.find(l => l.id === inc).qtd++; render(); }
    if (dec) {
      const l = itens.find(x => x.id === dec);
      l.qtd--; if (l.qtd <= 0) itens = itens.filter(x => x.id !== dec);
      render();
    }
    if (rm) { itens = itens.filter(x => x.id !== rm); render(); toast('Item removido'); }
  });
  $('#cart-body').addEventListener('input', e => {
    const id = e.target.dataset.obs;
    if (!id) return;
    const l = itens.find(x => x.id === id);
    if (l) { l.obs = e.target.value; salvar(); }
  });

  // botões "+" e CTAs espalhados pela página
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (b) { addItem(b.dataset.add); openCart(); }
  });

  // alternar sacola <-> checkout
  $('#go-checkout').addEventListener('click', () => {
    if (!itens.length) return;
    $('#cart-body').hidden = true;
    $('#cart-foot').hidden = true;
    $('#checkout').hidden = false;
    $('#ck-nome').focus();
  });
  $('#ck-voltar').addEventListener('click', () => {
    $('#checkout').hidden = true;
    $('#cart-body').hidden = false;
    $('#cart-foot').hidden = false;
  });

  // validação ao vivo
  Object.keys(regras).forEach(id => {
    const el = $('#' + id);
    el.addEventListener('blur', () => valida(id));
    el.addEventListener('input', () => el.classList.contains('is-invalid') && valida(id));
  });
  $('#ck-fone').addEventListener('input', e => mascaraFone(e.target));
  $('#ck-cep').addEventListener('input', e => {
    const d = soDigitos(e.target.value).slice(0, 8);
    e.target.value = d.length > 5 ? d.replace(/(\d{5})(\d{0,3})/, '$1-$2') : d;
    if (d.length === 8) buscarCep();
  });
  $('#cep-btn').addEventListener('click', buscarCep);

  document.querySelectorAll('input[name="modo"]').forEach(r =>
    r.addEventListener('change', () => {
      $('#bloco-endereco').hidden = !entregando();
      render();
    }));
  $('#ck-pag').addEventListener('change', e => {
    $('#bloco-troco').hidden = e.target.value !== 'Dinheiro';
  });

  $('#checkout').addEventListener('submit', e => {
    e.preventDefault();
    const ruins = Object.keys(regras).filter(id => !valida(id));
    if (ruins.length) { $('#' + ruins[0]).focus(); return; }
    const url = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(montarMensagem())}`;
    window.open(url, '_blank', 'noopener');
    toast('Pedido aberto no WhatsApp. É só enviar.');
  });
}
