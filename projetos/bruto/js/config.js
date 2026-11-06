/* =====================================================================
   CONFIGURAÇÃO — é aqui que se troca quase tudo
   ===================================================================== */

export const BRAND = {
  nome: 'BRUTO BURGER CO.',
  whatsapp: '5511988887766',                 // só dígitos, com DDI
  ifood: 'https://www.ifood.com.br/',        // link da loja no iFood
  taxaEntrega: 7.9,
  endereco: 'Rua da Brasa, 420 — Loja 2, Santo Amaro, São Paulo/SP'
};

/* Horário de funcionamento: [abre, fecha] em minutos a partir da meia-noite.
   null = fechado. Fechamento depois da meia-noite usa valor > 1440.      */
export const HORARIOS = {
  0: { label: 'Domingo',       faixa: [18 * 60, 23 * 60] },
  1: { label: 'Segunda',       faixa: null },
  2: { label: 'Terça',         faixa: [18 * 60, 23 * 60] },
  3: { label: 'Quarta',        faixa: [18 * 60, 23 * 60] },
  4: { label: 'Quinta',        faixa: [18 * 60, 23 * 60] },
  5: { label: 'Sexta',         faixa: [18 * 60, 24 * 60 + 30] },
  6: { label: 'Sábado',        faixa: [18 * 60, 24 * 60 + 30] }
};

/* ------------------------------------------------- HERO (scroll-scrub) */
export const HERO = {
  TOTAL_FRAMES: 120,
  // padrão do nome do arquivo (1-indexado, 4 dígitos)
  framePath: i => `assets/frames/f_${String(i + 1).padStart(4, '0')}.webp`,

  /* Mapa progresso -> frame (linear por partes).
     No vídeo original a montagem termina no frame ~57; o resto é chama.
     Então a montagem ocupa a maior parte do scroll e o fogo fecha a cena. */
  frameMap: [[0, 0], [0.78, 57], [0.92, 119], [1, 119]],

  /* Scrub: valores baixos = o frame acompanha o dedo/roda quase na hora.
     lerp alto evita a sensação de arrasto ao rolar devagar.              */
  lerp: 0.26,
  scrub: 0.25,
  /* Distância de scroll do hero. Curto de propósito: a montagem inteira
     cabe em ~1,8 tela de rolagem no desktop e ~1,3 no mobile.            */
  endDesktop: '+=180%',
  endMobile: '+=130%',

  /* Legendas. x/y em % do palco (canvas). side: 'left' | 'right'.
     from/to = faixa de progresso do scroll em que a legenda aparece.    */
  beats: [
    { from: 0.10, to: 0.34, side: 'left',  x: 6,  y: 62,
      titulo: 'Pão brioche tostado', texto: 'Assado no bairro e selado na manteiga até dourar.', chip: 'Pão brioche' },
    { from: 0.30, to: 0.52, side: 'right', x: 62, y: 30,
      titulo: 'Blend 180g no ponto', texto: 'Acém com costela, selado na chapa a 230°C.', chip: 'Blend 180g' },
    { from: 0.40, to: 0.60, side: 'left',  x: 6,  y: 26,
      titulo: 'Cheddar derretido', texto: 'Duas fatias que escorrem antes de chegar à mesa.', chip: 'Cheddar derretido' },
    { from: 0.52, to: 0.72, side: 'right', x: 62, y: 56,
      titulo: 'Bacon crocante', texto: 'Fatia grossa, assada devagar, sem encharcar o pão.', chip: 'Bacon crocante' },
    { from: 0.60, to: 0.78, side: 'left',  x: 6,  y: 72,
      titulo: 'Alface, tomate e cebola roxa', texto: 'Hortifruti recebido na mesma manhã.', chip: 'Salada fresca' }
  ],
  outroFrom: 0.80      // a partir daqui entra o bloco "Montado na hora"
};

/* ------------------------------------------------------------ CARDÁPIO */
export const CATEGORIAS = [
  { id: 'burgers',    label: 'Burgers' },
  { id: 'combos',     label: 'Combos' },
  { id: 'porcoes',    label: 'Porções' },
  { id: 'bebidas',    label: 'Bebidas' },
  { id: 'sobremesas', label: 'Sobremesas' }
];

export const MENU = [
  { id: 'bruto-classico', cat: 'burgers', preco: 34.90, tag: 'Mais vendido',
    nome: 'Bruto Clássico', img: 'https://images.pexels.com/photos/18713425/pexels-photo-18713425.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/burger-classico.svg',
    desc: 'Blend 180g, cheddar, alface, tomate, cebola roxa e molho da casa no brioche.' },
  { id: 'duplo-fogo', cat: 'burgers', preco: 46.90, tag: 'Picante',
    nome: 'Duplo Fogo', img: 'https://images.pexels.com/photos/10922930/pexels-photo-10922930.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/burger-picante.svg',
    desc: 'Dois blends, cheddar duplo, jalapeño e maionese defumada de pimenta.' },
  { id: 'cheddar-bacon', cat: 'burgers', preco: 42.90, tag: '',
    nome: 'Cheddar Bacon', img: 'https://images.pexels.com/photos/19247573/pexels-photo-19247573.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/burger-cheddar.svg',
    desc: 'Blend 180g afogado em cheddar cremoso com bacon crocante em fatia grossa.' },
  { id: 'smash-duplo', cat: 'burgers', preco: 38.90, tag: '',
    nome: 'Smash Duplo', img: 'https://images.pexels.com/photos/29819319/pexels-photo-29819319.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/burger-duplo.svg',
    desc: 'Dois smashes de 90g prensados na chapa, queijo prato e picles.' },
  { id: 'combo-bruto', cat: 'combos', preco: 49.90, tag: 'Mais vendido',
    nome: 'Combo Bruto', img: 'https://images.pexels.com/photos/19247580/pexels-photo-19247580.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/combo-bruto.svg',
    desc: 'Bruto Clássico + fritas rústicas + refrigerante em lata.' },
  { id: 'combo-duplo', cat: 'combos', preco: 79.90, tag: '',
    nome: 'Combo Duplo Fogo', img: 'https://images.pexels.com/photos/18713430/pexels-photo-18713430.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/combo-duplo.svg',
    desc: 'Dois Duplo Fogo, fritas grandes e duas bebidas geladas.' },
  { id: 'fritas', cat: 'porcoes', preco: 19.90, tag: '',
    nome: 'Fritas Rústicas', img: 'https://images.pexels.com/photos/11485199/pexels-photo-11485199.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/fritas.svg',
    desc: 'Batata com casca, alecrim e sal grosso. Vai com maionese da casa.' },
  { id: 'onion-rings', cat: 'porcoes', preco: 22.90, tag: '',
    nome: 'Onion Rings', img: 'https://images.pexels.com/photos/6941009/pexels-photo-6941009.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/onion-rings.svg',
    desc: 'Oito anéis de cebola empanados na hora, com molho barbecue.' },
  { id: 'refri', cat: 'bebidas', preco: 7.50, tag: '',
    nome: 'Refrigerante Lata', img: 'https://images.unsplash.com/photo-1782046820433-99b6fce8f9b9?auto=format&fit=crop&w=900&h=680&q=70',
    fallback: 'assets/img/menu/refri.svg',
    desc: 'Lata 350ml bem gelada. Cola, guaraná ou limão.' },
  { id: 'limonada', cat: 'bebidas', preco: 12.90, tag: '',
    nome: 'Limonada Suíça', img: 'https://images.unsplash.com/photo-1775390722213-2830af4dde60?auto=format&fit=crop&w=900&h=680&q=70',
    fallback: 'assets/img/menu/limonada.svg',
    desc: 'Limão batido com casca e um toque de leite condensado. 500ml.' },
  { id: 'milkshake', cat: 'sobremesas', preco: 18.90, tag: '',
    nome: 'Milkshake', img: 'https://images.pexels.com/photos/11381485/pexels-photo-11381485.jpeg?auto=compress&cs=tinysrgb&w=900&h=680&fit=crop',
    fallback: 'assets/img/menu/milkshake.svg',
    desc: 'Sorvete batido com calda à sua escolha e chantilly por cima. 400ml.' },
  { id: 'brownie', cat: 'sobremesas', preco: 16.90, tag: '',
    nome: 'Brownie na Chapa', img: 'https://images.unsplash.com/photo-1717768024023-73768e73f630?auto=format&fit=crop&w=900&h=680&q=70',
    fallback: 'assets/img/menu/brownie.svg',
    desc: 'Brownie aquecido na chapa com bola de baunilha e doce de leite.' }
];

export const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
