// Dados demonstrativos. Substitua pelos dados verificados do escritório antes de publicar.
export const CONFIG = {
  name: 'NEXO', tagline: 'Contabilidade & estratégia',
  whatsapp: '', // País + DDD + número. Exemplo de formato: 5511999999999.
  endpoint: '', // Endpoint HTTPS que recebe JSON. Vazio = demonstração local.
  portrait: './assets/contador.png',
  crc: '', responsible: '', address: '', phone: '', email: '', hours: '',
  instagram: '', linkedin: '', youtube: '', mapEmbedUrl: '', website: '',
  postalAddress: null, openingHours: [], verifiedRating: null,
  weeklySlots: null, // Preencha apenas com disponibilidade real; null oculta a escassez.
  stats: [
    { value: 12, suffix: '+', label: 'anos de experiência', icon: 'briefcase' },
    { value: 450, suffix: '+', label: 'empresas atendidas', icon: 'building' },
    { value: 98, suffix: '%', label: 'de satisfação', icon: 'heart' },
    { value: 8, prefix: 'R$ ', suffix: ' mi+', label: 'em impostos economizados', icon: 'chart' }
  ],
  plans: [
    { name: 'Essencial', month: 399, annualMonth: 359, detail: 'O seu negócio começa com uma base sólida.', features: ['Contabilidade fiscal e contábil', 'Obrigações acessórias', 'Atendimento digital', 'Relatórios mensais'] },
    { name: 'Crescimento', month: 699, annualMonth: 629, detail: 'Mais clareza para dar o próximo passo.', features: ['Tudo do Essencial', 'Revisão do planejamento tributário', 'Folha para até 5 colaboradores', 'Reunião consultiva trimestral'], featured: true },
    { name: 'Premium', month: 1299, annualMonth: 1169, detail: 'Uma visão completa para decisões maiores.', features: ['Tudo do Crescimento', 'BPO financeiro consultivo', 'Gestor de relacionamento', 'Reunião estratégica mensal'] }
  ]
};

// ALÍQUOTAS HIPOTÉTICAS: demonstram a interação, não representam tabelas legais.
// O modelo não verifica elegibilidade, faixas, anexos, deduções ou limites de receita.
export const EXAMPLE_RATES = {
  servicos: { simples: { current: .155, optimized: .11 }, presumido: { current: .1633, optimized: .12 } },
  comercio: { simples: { current: .095, optimized: .07 }, presumido: { current: .12, optimized: .09 } },
  industria: { simples: { current: .11, optimized: .085 }, presumido: { current: .14, optimized: .105 } },
  mei: { monthlyFixed: 80 } // Exemplo fixo, sem presumir economia ou reenquadramento.
};

export const SERVICES = [
  { id:'abertura',category:'COMEÇAR',title:'Abertura e legalização',image:'photo-1497366754035-f200968a6e72',alt:'Escritório moderno com áreas de trabalho iluminadas',summary:'Da ideia ao CNPJ, com segurança em cada escolha.',description:'Um começo bem estruturado evita dúvidas e retrabalho. Acompanhamos as etapas de abertura e a escolha do enquadramento adequado, conforme análise individual.',items:['Análise da atividade e do modelo de negócio','Orientação sobre natureza jurídica e regime','Acompanhamento de registros e legalização'] },
  { id:'contabilidade',category:'ORGANIZAR',title:'Contabilidade digital',image:'photo-1454165804606-c3d57bc86b40',alt:'Equipe analisando documentos e relatórios financeiros em uma mesa',summary:'MEI, ME e EPP. Sua rotina em dia, de verdade.',description:'Conectamos a organização contábil à realidade da empresa. Você acompanha as informações e conta com uma equipe para esclarecer as próximas etapas.',items:['Escrituração e obrigações aplicáveis','Acompanhamento de documentos e guias','Relatórios e atendimento consultivo'] },
  { id:'tributario',category:'PLANEJAR',title:'Planejamento tributário',image:'photo-1460925895917-afdab827c52f',alt:'Notebook com gráficos e indicadores para análise financeira',summary:'Pague o que é justo. Dentro da lei, sempre.',description:'Estudamos cenários tributários e oportunidades previstas em lei. A indicação depende de faturamento, atividade, estrutura e análise técnica; não há economia garantida.',items:['Diagnóstico do cenário atual','Comparação dos enquadramentos permitidos','Plano de ação e acompanhamento'] },
  { id:'pessoal',category:'CUIDAR',title:'Pessoas e folha',image:'photo-1521737711867-e3b97375f902',alt:'Profissionais colaborando em um ambiente de escritório',summary:'Sua equipe bem cuidada. Sua empresa protegida.',description:'Organização para a rotina do departamento pessoal, com atenção aos documentos, prazos e informações que fazem parte de cada vínculo.',items:['Processamento da folha de pagamento','Rotinas de admissão, férias e desligamento','Obrigações e orientações trabalhistas aplicáveis'] },
  { id:'bpo',category:'GERIR',title:'BPO financeiro',image:'photo-1554224155-6726b3ff858f',alt:'Documentos e calculadora em uma mesa de planejamento financeiro',summary:'Menos planilhas soltas. Mais visão do seu caixa.',description:'Estruturamos as rotinas financeiras para que você acompanhe o caixa, visualize compromissos e tome decisões com informações organizadas.',items:['Contas a pagar e receber','Conciliação e organização financeira','Fluxo de caixa e relatórios gerenciais'] },
  { id:'irpf',category:'DECLARAR',title:'Imposto de renda PF',image:'photo-1450101499163-c8848c66ca85',alt:'Pessoa revisando e assinando documentos de uma declaração',summary:'Sua declaração, com atenção a cada detalhe.',description:'Apoiamos a organização e a conferência das informações necessárias à declaração, conforme a documentação apresentada e as regras aplicáveis.',items:['Lista de documentos e orientação','Conferência das informações e preenchimento','Acompanhamento do envio e recibo'] },
  { id:'regularizacao',category:'REGULARIZAR',title:'Regularização fiscal',image:'photo-1497366811353-6870744d04b2',alt:'Sala de reuniões em um escritório contemporâneo',summary:'Resolva pendências e volte a olhar para a frente.',description:'Mapeamos pendências e avaliamos caminhos de regularização. Eventuais créditos ou recuperações dependem de elegibilidade, documentação e análise técnica.',items:['Levantamento de pendências e obrigações','Análise de débitos e alternativas legais','Plano de regularização e revisão de créditos'] }
];

export const METHOD = [
  {title:'Primeiro, entender. Depois, transformar.',name:'Diagnóstico',text:'Conhecemos o seu negócio antes de falar dos seus números.',bullets:['Escuta de verdade','Raio-X contábil e fiscal','Prioridades bem definidas']},
  {title:'Uma estratégia que faz sentido para você.',name:'Planejamento tributário',text:'Cruzamos dados, cenários e legislação para orientar as melhores decisões.',bullets:['Análise do enquadramento','Cenários comparativos','Plano de ação individual']},
  {title:'A estratégia sai do papel. Com precisão.',name:'Execução e conformidade',text:'Organizamos a rotina para que cada entrega aconteça com segurança.',bullets:['Processos digitais','Prazos acompanhados','Obrigações em dia']},
  {title:'Seu negócio evolui. Nosso cuidado também.',name:'Acompanhamento mensal',text:'Transformamos relatórios em conversas e informação em próximos passos.',bullets:['Indicadores claros','Apoio nas decisões','Melhoria contínua']}
];
