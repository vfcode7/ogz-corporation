// All contacts below were supplied by the founder. Domain and email stay unset until provided.
export const CONFIG={
  name:'OGZ CORPORATION', founder:'vinxz.ogz',
  whatsapp:'554399539585', whatsappDisplay:'(43) 9953-9585',
  instagram:'https://www.instagram.com/ogz.corporation/', instagramHandle:'@ogz.corporation',
  domain:'', email:'', portrait:'./assets/ogz-fundador.webp',
  installment:'Consulte parcelamento em até 12x no cartão.',
  stats:null // Only verified figures: {sites:5,clients:0,deliveryDays:0}. null hides this strip.
};

// Self-contained copies of the five actual projects. Replace URLs here when they go public.
export const SITES=[
  {name:'YU.MED',category:'Odontologia · Landing page',url:'./projetos/yumed/',image:'./assets/sites/site-1.webp',imageFallback:'./assets/sites/site-1.jpg',alt:'Site da YU.MED com fotografia de um sorriso, tipografia editorial e painéis de vidro azul-marinho'},
  {name:'KINETIC',category:'Fisioterapia · Institucional',url:'./projetos/kinetic/',image:'./assets/sites/site-2.webp',imageFallback:'./assets/sites/site-2.jpg',alt:'Site da KINETIC em preto e branco com fotografia de fisioterapia e composição minimalista'},
  {name:'NEXO',category:'Contabilidade · Experiência 3D',url:'./projetos/nexo/',image:'./assets/sites/site-3.webp',imageFallback:'./assets/sites/site-3.jpg',alt:'Site da NEXO com contador, detalhes dourados e uma cena financeira tridimensional'},
  {name:'VÉRTICE',category:'Automotivo · Imersivo',url:'./projetos/vertice/',image:'./assets/sites/site-4.webp',imageFallback:'./assets/sites/site-4.jpg',alt:'Site Vértice com fotos reais de detalhamento automotivo e serviços em azul e preto'},
  {name:'BRUTO BURGER',category:'Gastronomia · Interativo',url:'./projetos/bruto/',image:'./assets/sites/site-5.webp',imageFallback:'./assets/sites/site-5.jpg',alt:'Site da BRUTO BURGER com hambúrguer artesanal, tipografia marcante e cardápio interativo'}
];

export const PLANS=[
  {id:'landing',name:'Landing Page',label:'DIRETO AO PONTO',price:400,description:'Dê ao interesse um caminho até o orçamento.',benefits:[
    'Página estratégica de alta conversão: promessa, prova, oferta e chamada para ação.',
    'Textos persuasivos escritos para o seu nicho. Copy inclusa.',
    'WhatsApp com mensagem pronta em pontos estratégicos.',
    'Formulário de captura de leads.',
    'Carregamento otimizado, com meta de Lighthouse 90+.',
    '100% responsiva, pensada primeiro para o celular.',
    'Meta Pixel e Google Analytics configurados para anunciar e medir.',
    'SEO básico: títulos, descrição e dados estruturados.',
    'Configuração de domínio e certificado SSL.',
    '1 rodada de ajustes incluída.'
  ]},
  {id:'3d',name:'Site 3D',label:'PARA SER INESQUECÍVEL',price:897,description:'Uma experiência que diferencia sua marca.',featured:true,benefits:[
    'Tudo do Site Institucional, mais uma experiência que impressiona.',
    'Cena 3D interativa que reage ao mouse e à rolagem.',
    'Animações fluidas, no nível dos sites de grandes marcas.',
    'Vidro, luz, parallax e microinterações.',
    'Modo leve automático para celulares com menos desempenho.',
    'Identidade visual exclusiva, sem template.',
    'Uma experiência criada para ser lembrada e compartilhada.',
    '3 rodadas de ajustes incluídas.',
    'Suporte pós-entrega por 30 dias.'
  ]},
  {id:'institucional',name:'Site Institucional',label:'PRESENÇA QUE PASSA CONFIANÇA',price:597,description:'Mostre seu valor antes de discutir preço.',benefits:[
    'Tudo da Landing Page, com espaço para contar sua história.',
    'Até 5 páginas: Início, Sobre, Serviços, Contato + 1 extra.',
    'Design sob medida com a identidade da sua marca.',
    'SEO local: Search Console, sitemap e dados estruturados.',
    'Mapa do Google e WhatsApp flutuante.',
    'Páginas de serviço individuais para estruturar sua presença nas buscas.',
    '2 rodadas de ajustes incluídas.',
    'Vídeo curto ensinando a editar textos e imagens.',
    'Suporte pós-entrega por 15 dias.'
  ]}
];
