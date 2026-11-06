import {CONFIG,EXAMPLE_RATES,SERVICES,METHOD} from './config.js';
import {brl,isValidCnpj,maskCnpj,isValidPhone,maskPhone,calculateEstimate,cleanCnpj} from './logic.js';

const $=(selector,root=document)=>root.querySelector(selector),$$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
const gsap=window.gsap,ST=window.ScrollTrigger;
if(gsap&&ST)gsap.registerPlugin(ST);
const locks=new Set(),returnFocus=new WeakMap();let lenis=null,scene=null,methodTrigger=null;
const attribution=Object.fromEntries([...new URLSearchParams(location.search)].filter(([key])=>['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'].includes(key)).map(([key,value])=>[key,value.slice(0,500)]));
window.dataLayer=window.dataLayer||[];
// Events intentionally exclude name, phone, email, CNPJ and user-entered financial data.
const track=(event,extra={})=>window.dataLayer.push({event,...extra});
if(!reduced&&window.Lenis)lenis=new window.Lenis({duration:1.1,smoothWheel:true,anchors:true});
if(lenis&&ST)lenis.on('scroll',ST.update);

function lock(key){locks.add(key);document.body.style.overflow='hidden';lenis?.stop()}
function unlock(key){locks.delete(key);if(!locks.size){document.body.style.overflow='';lenis?.start()}}
function focusable(root){return $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex="0"]',root).filter(el=>el.getClientRects().length)}
function trap(event,root){if(event.key!=='Tab')return;const list=focusable(root);if(!list.length)return;const first=list[0],last=list.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
function showDialog(dialog){returnFocus.set(dialog,document.activeElement);dialog.showModal();lock(dialog);if(gsap&&!reduced){const drawer=dialog.classList.contains('service-drawer');gsap.fromTo(dialog,{opacity:0,xPercent:drawer?8:0,y:drawer?0:10},{opacity:1,xPercent:0,y:0,duration:.5,ease:'power3.out'})}}
$$('dialog').forEach(dialog=>{
  $('[data-close]',dialog).addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',event=>trap(event,dialog));
  dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close()});
  dialog.addEventListener('close',()=>{unlock(dialog);const target=returnFocus.get(dialog);if(target?.isConnected)target.focus({preventScroll:true})});
});

// Central business configuration: missing credentials stay visibly unverified.
$$('[data-brand]').forEach(el=>el.textContent=CONFIG.name);$('#year').textContent=new Date().getFullYear();
if(CONFIG.name!=='NEXO'){
  document.title=document.title.replace('NEXO',CONFIG.name);
  $$('meta[property="og:title"]').forEach(meta=>meta.content=meta.content.replace('NEXO',CONFIG.name));
}
if(CONFIG.portrait){$('#accountant').src=CONFIG.portrait}else{$('.portrait-scene').hidden=true;document.documentElement.classList.add('portrait-free')}
if(CONFIG.crc)$('#hero-crc').textContent=`${CONFIG.crc} · registro informado`;
[['phone','#contact-phone'],['email','#contact-email'],['address','#contact-address'],['hours','#contact-hours'],['crc','#contact-crc'],['responsible','#contact-responsible']].forEach(([key,selector])=>{if(CONFIG[key])$(selector).textContent=CONFIG[key]});
const schema=JSON.parse($('#business-schema').textContent);schema.name=`${CONFIG.name} Contabilidade`;
if(CONFIG.postalAddress)schema.address={'@type':'PostalAddress',...CONFIG.postalAddress};if(CONFIG.openingHours.length)schema.openingHours=CONFIG.openingHours;if(CONFIG.verifiedRating)schema.aggregateRating={'@type':'AggregateRating',...CONFIG.verifiedRating};if(CONFIG.website)schema.url=CONFIG.website;if(CONFIG.phone)schema.telephone=CONFIG.phone;$('#business-schema').textContent=JSON.stringify(schema);
if(CONFIG.mapEmbedUrl){try{const url=new URL(CONFIG.mapEmbedUrl);if(url.protocol==='https:'){const frame=document.createElement('iframe');frame.src=url.href;frame.title='Localização do escritório';frame.loading='lazy';frame.referrerPolicy='no-referrer-when-downgrade';$('#map-container').append(frame);$('#map-container').hidden=false}}catch{}}
if(Number.isInteger(CONFIG.weeklySlots)&&CONFIG.weeklySlots>=0)$('#availability').lastChild.textContent=` Diagnósticos disponíveis nesta semana: ${CONFIG.weeklySlots} ${CONFIG.weeklySlots===1?'vaga':'vagas'}.`;

function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('icon');svg.setAttribute('aria-hidden','true');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href',`#i-${name}`);svg.append(use);return svg}
$('#hero-stats').replaceChildren(...CONFIG.stats.map(stat=>{const wrapper=document.createElement('div');wrapper.className='stat';const data=document.createElement('div'),strong=document.createElement('strong'),value=document.createElement('span'),small=document.createElement('small');value.dataset.count=stat.value;value.textContent=Number(stat.value).toLocaleString('pt-BR');strong.append(document.createTextNode(stat.prefix||''),value,document.createTextNode(stat.suffix||''));small.textContent=stat.label;data.append(strong,small);wrapper.append(icon(stat.icon),data);return wrapper}));

// Minimal header, active pill indicator and scroll direction.
let previousY=scrollY,scrollDirty=true;
const nav=$('.nav'),navLinks=$$('a',nav),navIndicator=$('.nav-indicator');let activeLink=navLinks[0];
function positionNav(link){if(!link)return;navIndicator.style.width=`${link.offsetWidth}px`;navIndicator.style.transform=`translateX(${link.offsetLeft}px)`}
navLinks.forEach(link=>{link.addEventListener('pointerenter',()=>positionNav(link));link.addEventListener('focus',()=>positionNav(link))});nav.addEventListener('pointerleave',()=>positionNav(activeLink));
const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const link=navLinks.find(a=>a.hash===`#${entry.target.id}`);if(link){activeLink=link;navLinks.forEach(a=>{if(a===link)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});positionNav(link)}}}),{rootMargin:'-18% 0px -50% 0px'});navLinks.forEach(link=>{const section=$(link.hash);if(section)navObserver.observe(section)});
addEventListener('resize',()=>{positionNav(activeLink);scrollDirty=true},{passive:true});positionNav(activeLink);
addEventListener('scroll',()=>{scrollDirty=true;const y=scrollY;$('#header').classList.toggle('scrolled',y>40);if(Math.abs(y-previousY)>6){$('#header').classList.toggle('away',y>previousY&&y>180&&!$('#header').contains(document.activeElement));previousY=y}},{passive:true});
$('#header').addEventListener('focusin',()=>$('#header').classList.remove('away'));

const menu=$('#mobile-menu');let menuTimer;
const menuBackground=[$('main'),$('#header'),$('.mobile-sticky'),$('.whatsapp-float')];
function setMenu(open,restore=true){clearTimeout(menuTimer);$('#menu-toggle').setAttribute('aria-expanded',String(open));if(open){menu.hidden=false;lock(menu);menuBackground.forEach(el=>el.inert=true);requestAnimationFrame(()=>{menu.classList.add('open');$('#close-menu').focus()})}else{menu.classList.remove('open');menuBackground.forEach(el=>el.inert=false);unlock(menu);menuTimer=setTimeout(()=>menu.hidden=true,reduced?0:800);if(restore)$('#menu-toggle').focus()}}
$('#menu-toggle').addEventListener('click',()=>setMenu(true));$('#close-menu').addEventListener('click',()=>setMenu(false));menu.addEventListener('keydown',event=>{trap(event,menu);if(event.key==='Escape')setMenu(false)});
$$('a[href^="#"]',menu).forEach(link=>link.addEventListener('click',event=>{event.preventDefault();setMenu(false,false);const target=$(link.hash);if(target){target.tabIndex=-1;target.focus({preventScroll:true});if(lenis)lenis.scrollTo(target,{offset:-90});else target.scrollIntoView({behavior:reduced?'instant':'smooth'});history.replaceState(null,'',link.hash)}}));

const information={
  privacidade:{title:'Transparência começa pelos seus dados.',paragraphs:[
    'Esta é uma demonstração de uma marca fictícia. Sem endpoint ou WhatsApp configurado, os formulários não enviam nem armazenam seus dados pessoais.',
    'Na operação configurada, nome, contato, CNPJ opcional, interesse e faturamento aproximado são usados para responder ao diagnóstico solicitado. Parâmetros de campanha presentes no endereço da página podem acompanhar essa solicitação.',
    'O site prepara eventos locais de interação sem incluir nome, telefone, e-mail, CNPJ ou valores digitados. A preferência de exibição do convite de saída é salva apenas durante a sessão. Fontes, imagens e bibliotecas são carregadas de provedores externos, que recebem dados técnicos da conexão.',
    'Antes da publicação, o responsável deve identificar o controlador, os canais de contato e exercício de direitos, bases legais, prazos de retenção, compartilhamentos e medidas de proteção aplicáveis à LGPD. O envio pelo WhatsApp abre uma mensagem para sua revisão antes de você enviar.'
  ]},
  termos:{title:'Estratégia, com responsabilidade.',paragraphs:[
    'Este projeto apresenta um escritório fictício. Indicadores, preços, avaliações, depoimentos e resultados são demonstrativos. O retrato do hero foi criado com IA e não representa um contador real.',
    'O conteúdo é informativo. Uma simulação não determina enquadramento tributário, créditos ou impostos devidos. A análise depende da atividade, receita, estrutura, documentação e legislação aplicável.',
    'As condições de prestação de serviços, escopo, honorários e prazos dependem de uma proposta individual. Não há garantia de economia ou de aprovação de registros por órgãos públicos.'
  ]},
  contato:{title:'Nossa próxima conexão começa aqui.',paragraphs:['Os canais oficiais ainda não foram configurados nesta demonstração. Você pode experimentar o formulário e a simulação sem enviar dados. Preencha o WhatsApp ou endpoint oficial em src/config.js para ativar o contato.'],lead:true},
  social:{title:'Nossos canais oficiais.',paragraphs:['Os perfis da NEXO estarão disponíveis aqui depois que os endereços oficiais forem configurados. Enquanto isso, conheça nossos serviços e experimente o diagnóstico demonstrativo.']},
  clinica:{title:'Clínica médica: um cenário possível.',paragraphs:['Exemplo fictício de análise comparativa entre regimes. O percentual de 31% é ilustrativo; não descreve um cliente atendido ou uma economia garantida.','Em uma análise real, atividades, estrutura, receita, folha e requisitos legais são considerados antes de propor qualquer alteração de regime.'],lead:true},
  ecommerce:{title:'Organização para dar o próximo passo.',paragraphs:['Caso ilustrativo de um e-commerce que precisa organizar documentos, revisar pendências e estruturar a rotina fiscal. Não representa um projeto real concluído.','O plano de regularização depende do levantamento individual, dos documentos e dos órgãos envolvidos.'],lead:true},
  startup:{title:'Uma ideia, com um começo bem feito.',paragraphs:['Cenário fictício de abertura em 48 horas, usado apenas para demonstrar a apresentação de resultados. Esse prazo não é uma promessa.','Natureza jurídica, localidade, documentação, atividade e licenças podem mudar completamente o cronograma de uma abertura real.'],lead:true}
};
function showInfo(key){const data=information[key];if(!data)return;$('#info-title').textContent=data.title;const nodes=data.paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p});if(data.lead){const button=document.createElement('button');button.type='button';button.className='button primary';button.textContent='Quero conhecer as possibilidades ↗';button.addEventListener('click',()=>{$('#info-modal').close();openLead('informacoes')});nodes.push(button)}$('#info-body').replaceChildren(...nodes);showDialog($('#info-modal'))}
$$('[data-info]').forEach(button=>button.addEventListener('click',()=>showInfo(button.dataset.info)));
$$('[data-case]').forEach(button=>button.addEventListener('click',()=>showInfo(button.dataset.case)));
function whatsappURL(message){const digits=CONFIG.whatsapp.replace(/\D/g,'');return /^\d{12,15}$/.test(digits)?`https://wa.me/${digits}?text=${encodeURIComponent(message)}`:null}
function openWhatsApp(message=`Olá! Gostaria de conversar sobre meu negócio com a ${CONFIG.name} Contabilidade.`){track('whatsapp_click');const url=whatsappURL(message);if(url)window.open(url,'_blank','noopener,noreferrer');else showInfo('contato')}
$$('[data-wa]').forEach(button=>button.addEventListener('click',()=>openWhatsApp()));
$$('[data-social]').forEach(button=>button.addEventListener('click',()=>{try{const url=new URL(CONFIG[button.dataset.social]);if(url.protocol==='https:'){window.open(url.href,'_blank','noopener,noreferrer');return}}catch{}showInfo('social')}));
setTimeout(()=>$('.whatsapp-float').classList.add('show'),reduced?0:3000);

// Service drawer, including meaningful content before JavaScript enhancement.
let selectedService=SERVICES[0];
$$('[data-service]').forEach(button=>button.addEventListener('click',()=>{const service=SERVICES.find(item=>item.id===button.dataset.service);selectedService=service;$('#drawer-category').textContent=service.category;$('#drawer-title').textContent=service.title;$('#drawer-image').src=`https://images.unsplash.com/${service.image}?auto=format&fit=crop&w=800&q=80`;$('#drawer-image').srcset=`https://images.unsplash.com/${service.image}?auto=format&fit=crop&w=400&q=80 400w, https://images.unsplash.com/${service.image}?auto=format&fit=crop&w=800&q=80 800w`;$('#drawer-image').alt=service.alt;$('#drawer-description').textContent=service.description;$('#drawer-items').replaceChildren(...service.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));showDialog($('#service-drawer'))}));
$('#drawer-lead').addEventListener('click',()=>{$('#service-drawer').close();openLead('servico',{interest:selectedService.title})});

// Carousel controls keep a horizontal native-scrolling fallback when Swiper is unavailable.
let testimonialSwiper;
const swiperA11y=(item)=>({prevSlideMessage:`${item} anterior`,nextSlideMessage:`Próximo ${item.toLowerCase()}`,firstSlideMessage:`Primeiro ${item.toLowerCase()}`,lastSlideMessage:`Último ${item.toLowerCase()}`,slideLabelMessage:`${item} {{index}} de {{slidesLength}}`,containerRoleDescriptionMessage:`Carrossel de ${item.toLowerCase()}s`,itemRoleDescriptionMessage:item});
if(window.Swiper){
  $('#service-cards').classList.remove('fallback');new window.Swiper('.service-swiper',{slidesPerView:1.14,spaceBetween:13,freeMode:{enabled:true,sticky:false},speed:reduced?0:650,grabCursor:true,keyboard:{enabled:true,onlyInViewport:true},navigation:{prevEl:'.service-prev',nextEl:'.service-next'},a11y:swiperA11y('Serviço'),breakpoints:{601:{slidesPerView:2.2,spaceBetween:16},1000:{slidesPerView:3.2,spaceBetween:17},1450:{slidesPerView:3.65,spaceBetween:19}}});
  $('.testimonial-swiper .swiper-wrapper').classList.remove('fallback');testimonialSwiper=new window.Swiper('.testimonial-swiper',{slidesPerView:1.1,spaceBetween:14,speed:reduced?0:850,grabCursor:true,autoplay:reduced?false:{delay:6500,pauseOnMouseEnter:true,disableOnInteraction:true},keyboard:{enabled:true,onlyInViewport:true},navigation:{prevEl:'.testimonial-prev',nextEl:'.testimonial-next'},a11y:swiperA11y('Depoimento'),breakpoints:{601:{slidesPerView:2,spaceBetween:17},1100:{slidesPerView:2.65,spaceBetween:19},1500:{slidesPerView:3,spaceBetween:20}}});
}else{
  [['.service-prev','.service-next','#service-cards'],['.testimonial-prev','.testimonial-next','.testimonial-swiper .swiper-wrapper']].forEach(([prev,next,wrapper])=>{[prev,next].forEach((button,i)=>$(button).addEventListener('click',()=>$(wrapper).scrollBy({left:(i?1:-1)*300,behavior:reduced?'instant':'smooth'})))});
}
const pauseReviews=$('.testimonial-pause');let reviewsPaused=reduced;
pauseReviews.setAttribute('aria-pressed',String(reviewsPaused));pauseReviews.setAttribute('aria-label',reviewsPaused?'Retomar depoimentos':'Pausar depoimentos');
pauseReviews.addEventListener('click',()=>{reviewsPaused=!reviewsPaused;if(reviewsPaused)testimonialSwiper?.autoplay?.stop();else testimonialSwiper?.autoplay?.start();pauseReviews.setAttribute('aria-pressed',String(reviewsPaused));pauseReviews.setAttribute('aria-label',reviewsPaused?'Retomar depoimentos':'Pausar depoimentos')});
$('.testimonial-swiper').addEventListener('focusin',()=>testimonialSwiper?.autoplay?.stop());
$('.testimonial-swiper').addEventListener('focusout',event=>{if(!reviewsPaused&&!reduced&&!$('.testimonial-swiper').contains(event.relatedTarget))testimonialSwiper?.autoplay?.start()});

// Illustrative calculator: a single pure function feeds HTML bars, totals and Three.js bars.
let simulation={revenue:50000,activity:'servicos',regime:'simples'},estimate=calculateEstimate(simulation,EXAMPLE_RATES),simTimer,announceTimer;
const displayTotals={current:estimate.current,optimized:estimate.optimized,savings:estimate.savings};
const outputTotals=()=>{$('#sim-current').textContent=brl(displayTotals.current);$('#sim-optimized').textContent=brl(displayTotals.optimized);$('#sim-savings').textContent=brl(displayTotals.savings)};
function updateSimulation(user=false){
  estimate=calculateEstimate(simulation,EXAMPLE_RATES);
  if(gsap&&!reduced)gsap.to(displayTotals,{current:estimate.current,optimized:estimate.optimized,savings:estimate.savings,duration:.65,ease:'power2.out',overwrite:true,onUpdate:outputTotals});else{Object.assign(displayTotals,estimate);outputTotals()}
  $('#sim-percent').textContent=estimate.regime==='mei'?'Valor fixo hipotético, sem economia presumida.':`${Math.round(estimate.percent).toLocaleString('pt-BR')}% de diferença entre os cenários`;
  const rate=n=>`${(n*100).toLocaleString('pt-BR',{maximumFractionDigits:2})}% no exemplo`;
  $('#current-rate').textContent=estimate.regime==='mei'?`${brl(EXAMPLE_RATES.mei.monthlyFixed)}/mês no exemplo`:rate(estimate.currentRate);
  $('#optimized-rate').textContent=estimate.regime==='mei'?'Mesmo valor fixo no exemplo':rate(estimate.optimizedRate);
  const max=Math.max(estimate.current,estimate.optimized,1);$('#bar-current').style.width=`${estimate.current/max*100}%`;$('#bar-optimized').style.width=`${estimate.optimized/max*100}%`;
  $('#revenue-range').value=Math.min(200000,estimate.monthly);$('#revenue-range').setAttribute('aria-valuetext',`${brl(estimate.monthly)} por mês`);scene?.setSimulation(estimate);
  if(user){clearTimeout(simTimer);clearTimeout(announceTimer);simTimer=setTimeout(()=>track('simulator_used',{activity:simulation.activity,regime:simulation.regime}),800);announceTimer=setTimeout(()=>$('#sim-status').textContent=`Cenário anual atual: ${brl(estimate.current)}. Cenário planejado: ${brl(estimate.optimized)}. Diferença ilustrativa: ${brl(estimate.savings)}.`,850)}
}
$('#revenue-range').addEventListener('input',event=>{simulation.revenue=Number(event.target.value);$('#revenue-input').value=simulation.revenue.toLocaleString('pt-BR');updateSimulation(true)});
$('#revenue-input').addEventListener('input',event=>{simulation.revenue=Math.min(1000000,Number(event.target.value.replace(/\D/g,''))||0);event.target.value=simulation.revenue.toLocaleString('pt-BR');updateSimulation(true)});
$('#activity').addEventListener('change',event=>{simulation.activity=event.target.value;updateSimulation(true)});$('#regime').addEventListener('change',event=>{simulation.regime=event.target.value;updateSimulation(true)});updateSimulation();
$('#show-rates').addEventListener('click',()=>{const p=document.createElement('p');p.textContent='Alíquotas inteiramente hipotéticas. O modelo multiplica faturamento mensal por 12 e aplica o percentual escolhido. Não simula anexos, faixas, deduções, créditos, Fator R ou limites de enquadramento.';const list=document.createElement('ul');for(const [activity,regimes] of Object.entries(EXAMPLE_RATES)){if(activity==='mei')continue;for(const [regime,pair] of Object.entries(regimes)){const li=document.createElement('li');li.textContent=`${{servicos:'Serviços',comercio:'Comércio',industria:'Indústria'}[activity]} / ${regime==='simples'?'Simples Nacional':'Lucro Presumido'}: ${(pair.current*100).toLocaleString('pt-BR')}% → ${(pair.optimized*100).toLocaleString('pt-BR')}%.`;list.append(li)}}const mei=document.createElement('p');mei.textContent=`MEI: valor hipotético fixo de ${brl(EXAMPLE_RATES.mei.monthlyFixed)} por mês, igual nos dois cenários. Nenhuma elegibilidade ou limite é verificado.`;$('#info-title').textContent='Os números por trás do exemplo.';$('#info-body').replaceChildren(p,list,mei);showDialog($('#info-modal'))});

let leadContext={source:'',company:'',simulation:null};const leadForm=$('#lead-form');
const leadFields=$$('input:not([type=checkbox]),select',leadForm);
function leadHint(){return CONFIG.endpoint?'Sua solicitação será enviada à equipe. O diagnóstico depende de confirmação.':whatsappURL('')?'Você poderá revisar sua mensagem no WhatsApp antes de enviar.':'Modo demonstrativo: nenhum dado será enviado.'}
$('#lead-status').textContent=leadHint();
function openLead(source='site',prefill={}){
  if(menu.classList.contains('open'))setMenu(false,false);
  leadContext={source,company:prefill.company||'',simulation:prefill.simulation||null};
  ['name','phone','revenue'].forEach(key=>{if(prefill[key]!==undefined)$(`#lead-${key}`).value=key==='revenue'?brl(prefill[key]):prefill[key]});
  const interest=prefill.interest||'Diagnóstico do meu negócio';const selected=$('#lead-interest');if(![...selected.options].some(option=>option.value===interest)){const option=new Option(interest,interest);selected.add(option)}selected.value=interest;
  const summary=$('#lead-summary');summary.hidden=!leadContext.simulation;if(leadContext.simulation){summary.textContent=`Seu cenário ilustrativo: faturamento de ${brl(estimate.monthly)}/mês, ${$('#activity').selectedOptions[0].textContent}, ${$('#regime').selectedOptions[0].textContent}. Diferença anual no exemplo: ${brl(estimate.savings)}. Não representa recomendação ou economia garantida.`}
  showDialog($('#lead-modal'));track('lead_open',{source});
}
$$('[data-lead]').forEach(button=>button.addEventListener('click',()=>openLead(button.dataset.lead,{interest:button.dataset.interest})));
$('#sim-lead').addEventListener('click',()=>openLead('simulador',{revenue:estimate.monthly,interest:'Planejamento tributário',simulation:{...simulation,...estimate}}));
$$('[data-phone]').forEach(input=>input.addEventListener('input',()=>input.value=maskPhone(input.value)));
$('#lead-cnpj').addEventListener('input',event=>event.target.value=maskCnpj(event.target.value));
$('#lead-revenue').addEventListener('input',event=>{const value=Math.min(1000000000,Number(event.target.value.replace(/\D/g,''))||0);event.target.value=brl(value)});
const validators={
  name:input=>input.value.trim().length>=3?'':'Informe seu nome completo.',
  phone:input=>isValidPhone(input.value)?'':'Informe um WhatsApp válido com DDD.',
  email:input=>input.validity.valid?'':'Informe um e-mail válido.',
  cnpj:input=>!input.value.trim()||isValidCnpj(input.value)?'':'Confira os caracteres e os dígitos verificadores do CNPJ.',
  revenue:()=>'',interest:input=>input.value?'':'Selecione um interesse.'
};
function validate(input){const error=validators[input.name]?.(input)||'';input.setAttribute('aria-invalid',String(!!error));$(`#${input.name}-error`).textContent=error;return !error}
leadFields.forEach(input=>{input.addEventListener('blur',()=>validate(input));input.addEventListener('input',()=>{if(input.hasAttribute('aria-invalid'))validate(input)});input.addEventListener('change',()=>validate(input))});
$('#lead-consent').addEventListener('change',event=>{if(event.target.checked){$('#consent-error').textContent='';event.target.setAttribute('aria-invalid','false')}});
$('#hero-form').addEventListener('submit',event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));let first=null;[['name',values.name.trim().length>=3,'Informe seu nome.'],['phone',isValidPhone(values.phone),'Informe um WhatsApp com DDD.'],['company',!!values.company,'Selecione o tipo de empresa.']].forEach(([name,valid,message])=>{const input=$(`#hero-${name}`);input.setAttribute('aria-invalid',String(!valid));$(`#hero-${name}-error`).textContent=valid?'':message;if(!valid&&!first)first=input});if(first){first.focus();return}openLead('hero',values)});
$$('input,select',$('#hero-form')).forEach(input=>input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');$(`#hero-${input.name}-error`).textContent=''}));
function composeMessage(payload){let message=`Olá! Quero solicitar um diagnóstico na ${CONFIG.name} Contabilidade.\nNome: ${payload.name}\nWhatsApp: ${payload.phone}\nE-mail: ${payload.email}\nInteresse: ${payload.interest}`;if(payload.cnpj)message+=`\nCNPJ: ${payload.cnpj}`;if(payload.revenue)message+=`\nFaturamento aproximado: ${payload.revenue}`;if(payload.company)message+=`\nTipo de empresa: ${payload.company}`;if(payload.simulation)message+=`\nSimulação ilustrativa: ${brl(payload.simulation.current)} vs. ${brl(payload.simulation.optimized)} por ano. Não substitui análise contábil.`;return message+'\nAutorizo o contato para esta solicitação.'}
async function sendLead(payload){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);try{const response=await fetch(CONFIG.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});if(!response.ok)throw new Error('request')}finally{clearTimeout(timeout)}}
function showLeadSuccess(payload,mode){
  const panel=document.createElement('div');panel.className='success';panel.setAttribute('role','status');const mark=document.createElement('span');mark.className='success-mark';mark.append(icon('check'));const heading=document.createElement('h3');heading.textContent=mode==='sent'?'Uma boa conversa está a caminho.':mode==='whatsapp'?'Seu próximo passo está pronto.':'Tudo pronto para uma nova conexão.';const text=document.createElement('p');text.textContent=mode==='sent'?'Sua solicitação foi enviada. A equipe entrará em contato pelos canais informados para combinar o diagnóstico.':mode==='whatsapp'?'Continue no WhatsApp para revisar e enviar sua mensagem. A equipe confirmará as próximas etapas.':'Demonstração concluída. Nenhum dado foi enviado e nenhum diagnóstico foi agendado.';panel.append(mark,heading,text);
  if(mode==='whatsapp'){const link=document.createElement('a');link.className='button primary';link.href=whatsappURL(composeMessage(payload));link.target='_blank';link.rel='noopener noreferrer';link.textContent='Continuar no WhatsApp ↗';link.addEventListener('click',()=>track('whatsapp_click',{source:'lead'}));panel.append(link)}
  const back=document.createElement('button');back.type='button';back.className='text-link';back.textContent='Voltar para o site';back.addEventListener('click',()=>$('#lead-modal').close());panel.append(back);leadForm.hidden=true;leadForm.after(panel);
  if(gsap&&!reduced){gsap.from(panel,{opacity:0,y:12,duration:.65});const path=$('path',mark);if(path){const length=path.getTotalLength();gsap.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:.8,delay:.2})}}
  $('#lead-modal').addEventListener('close',()=>{panel.remove();leadForm.hidden=false;leadForm.reset();leadFields.forEach(input=>{input.removeAttribute('aria-invalid');$(`#${input.name}-error`).textContent=''});$('#consent-error').textContent='';$('#lead-consent').removeAttribute('aria-invalid');$('[type=submit]',leadForm).disabled=false;$('#lead-summary').hidden=true;$('#lead-status').textContent=leadHint();leadContext={source:'',company:'',simulation:null}},{once:true});back.focus({preventScroll:true});
}
leadForm.addEventListener('submit',async event=>{
  event.preventDefault();const valid=leadFields.map(validate).every(Boolean),consent=$('#lead-consent');$('#consent-error').textContent=consent.checked?'':'Autorize o contato para continuar.';consent.setAttribute('aria-invalid',String(!consent.checked));if(!valid||!consent.checked){(leadFields.find(input=>input.getAttribute('aria-invalid')==='true')||consent).focus();return}
  const payload={...Object.fromEntries(new FormData(leadForm)),consent:true,company:leadContext.company,source:leadContext.source,simulation:leadContext.simulation,attribution,submittedAt:new Date().toISOString()};payload.name=payload.name.trim();payload.cnpj=cleanCnpj(payload.cnpj);const button=$('[type=submit]',leadForm);button.disabled=true;$('#lead-status').textContent='Preparando sua solicitação…';
  if(!CONFIG.endpoint){const mode=whatsappURL('')?'whatsapp':'demo';track('lead_submit',{source:leadContext.source,mode});showLeadSuccess(payload,mode);return}
  try{await sendLead(payload);track('lead_submit',{source:leadContext.source,mode:'sent'});showLeadSuccess(payload,'sent')}catch{button.disabled=false;const status=$('#lead-status');status.textContent='Não foi possível enviar agora. Tente novamente.';const url=whatsappURL(composeMessage(payload));if(url){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=' Continuar pelo WhatsApp ↗';link.style.textDecoration='underline';link.addEventListener('click',()=>track('whatsapp_click',{source:'fallback'}));status.append(link)}}
});

// Values and annual equivalents always move together; no hidden subscription total.
function updatePlans(annual=false){
  $$('.plan-card').forEach((card,index)=>{const plan=CONFIG.plans[index];$('h3',card).textContent=plan.name;$(':scope>p',card).textContent=plan.detail;const price=annual?plan.annualMonth:plan.month,el=$('[data-plan-price]',card);if(gsap&&!reduced){gsap.fromTo(el,{opacity:.35,y:5},{opacity:1,y:0,duration:.4})}el.textContent=price.toLocaleString('pt-BR');$('[data-plan-period]',card).textContent=annual?`Contrato anual: ${brl(price*12)}/ano.`:'Contratação mensal';$('ul',card).replaceChildren(...plan.features.map(text=>{const li=document.createElement('li');li.textContent=text;return li}))});
  $$('[data-billing]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.billing==='annual')===annual)));
}
$$('[data-billing]').forEach(button=>button.addEventListener('click',()=>updatePlans(button.dataset.billing==='annual')));updatePlans();

// Semantic <details> is readable without JS; only the height transition is enhanced.
$$('.faq-list details').forEach(details=>{const summary=$('summary',details),answer=$('.faq-answer',details);let animation;details.addEventListener('toggle',()=>summary.setAttribute('aria-expanded',String(details.open)));summary.addEventListener('click',event=>{if(reduced||!answer.animate)return;event.preventDefault();const closing=details.open;animation?.cancel();if(!closing)details.open=true;const height=answer.scrollHeight;animation=answer.animate([{height:closing?`${height}px`:'0px',opacity:closing?1:0},{height:closing?'0px':`${height}px`,opacity:closing?0:1}],{duration:450,easing:'cubic-bezier(.22,1,.36,1)'});summary.setAttribute('aria-expanded',String(!closing));animation.onfinish=()=>{if(closing)details.open=false;animation=null;ST?.refresh()}})});

const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;counterObserver.unobserve(entry.target);if(reduced)return;const el=entry.target,value=Number(el.dataset.count);if(gsap){const counter={value:0};gsap.to(counter,{value,duration:2,ease:'expo.out',onUpdate:()=>el.textContent=Math.round(counter.value).toLocaleString('pt-BR')})}}),{threshold:.75});$$('[data-count]').forEach(el=>counterObserver.observe(el));

let methodProgress=0;
const stages=$$('.method-stage');
stages.forEach((stage,index)=>{const data=METHOD[index];$('h3',stage).textContent=data.title;$(':scope>p',stage).textContent=data.text;const items=$$('li',stage);data.bullets.forEach((text,i)=>{items[i].lastChild.textContent=text})});
function setMethod(progress){methodProgress=progress;const step=Math.min(3,Math.floor(progress*4));stages.forEach((stage,index)=>{const active=index===step;stage.classList.toggle('active',active);stage.setAttribute('aria-hidden',String(!active))});$('#method-current').textContent=String(step+1).padStart(2,'0');$('#method-outline').textContent=String(step+1).padStart(2,'0');$('.method-progress span').style.transform=`scaleY(${Math.max(.02,progress)})`;scene?.setState({methodProgress:progress});scrollDirty=true}
if(gsap&&ST&&!reduced){
  document.documentElement.classList.add('method-enhanced');setMethod(0);
  const methodProxy={progress:0};
  const methodTimeline=gsap.timeline({scrollTrigger:{trigger:'.method-pin',start:'top top',end:()=>`+=${innerHeight*(innerWidth<601?.9:1.5)}`,pin:true,scrub:1,invalidateOnRefresh:true}});
  methodTimeline.to(methodProxy,{progress:1,duration:1,ease:'none',onUpdate:()=>setMethod(methodProxy.progress)});
  methodTrigger=methodTimeline.scrollTrigger;
  const manifesto=$('#manifesto');const words=manifesto.textContent.split(/\s+/);manifesto.setAttribute('aria-label',manifesto.textContent);manifesto.replaceChildren(...words.map((word,index)=>{const span=document.createElement('span');span.className='word';span.textContent=word;span.setAttribute('aria-hidden','true');const wrapper=document.createDocumentFragment();wrapper.append(span,document.createTextNode(index<words.length-1?' ':''));return wrapper}));
  gsap.fromTo('.manifesto .word',{color:'#96a0ac'},{color:'#11263a',stagger:.1,ease:'none',scrollTrigger:{trigger:'.about',start:'top 80%',end:'bottom 35%',scrub:1}});
  $$('.audience-card').forEach((card,index)=>gsap.from(card,{y:28,opacity:0,duration:.85,delay:index*.1,ease:'power3.out',scrollTrigger:{trigger:'.audience-grid',start:'top 88%',once:true}}));
  $$('.section-heading,.about h2,.simulator,.result-table,.plan-grid,.faq-intro,.final-cta h2').forEach(el=>gsap.from(el,{y:24,opacity:0,duration:.95,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
}

// One ticker for Lenis, Three.js, cursor and DOM effects; none of the modules run a second loop.
const sceneSections=$$('[data-scene]');let cursorX=-100,cursorY=-100,pointerX=-100,pointerY=-100,cursorExpanded=false;
const cursor=$('.custom-cursor'),preview=$('.case-preview');let previewActive=false;
if(fine&&!reduced){
  addEventListener('pointermove',event=>{pointerX=event.clientX;pointerY=event.clientY;cursor.style.opacity='1'},{passive:true});document.addEventListener('mouseleave',()=>cursor.style.opacity='0');
  const cursorTarget=(selector,label)=>$$(selector).forEach(el=>{el.addEventListener('pointerenter',()=>{cursorExpanded=true;cursor.classList.add('expanded');$('span',cursor).textContent=label});el.addEventListener('pointerleave',()=>{cursorExpanded=false;cursor.classList.remove('expanded')})});cursorTarget('.service-swiper','ARRASTE');cursorTarget('.result-row','VER');
  $$('.result-row').forEach(row=>{row.addEventListener('pointerenter',()=>{previewActive=true;$('img',preview).src=`https://images.unsplash.com/${row.dataset.image}?auto=format&fit=crop&w=500&q=75`;preview.style.opacity='1'});row.addEventListener('pointerleave',()=>{previewActive=false;preview.style.opacity='0'})});
  $$('.spotlight,.plan-card').forEach(card=>{card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect();const x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;card.style.setProperty('--mx',`${x*100}%`);card.style.setProperty('--my',`${y*100}%`);if(card.classList.contains('spotlight'))card.style.transform=`perspective(900px) rotateX(${(.5-y)*8}deg) rotateY(${(x-.5)*8}deg)`});card.addEventListener('pointerleave',()=>card.style.transform='')});
  $$('.button').forEach(button=>{const circle=$('.button-icon',button);if(!circle)return;const toX=gsap?.quickTo(circle,'x',{duration:.5,ease:'power3.out'}),toY=gsap?.quickTo(circle,'y',{duration:.5,ease:'power3.out'});button.addEventListener('pointermove',event=>{const r=button.getBoundingClientRect(),x=Math.max(-10,Math.min(10,(event.clientX-r.left-r.width/2)*.13)),y=Math.max(-10,Math.min(10,(event.clientY-r.top-r.height/2)*.22));if(toX){toX(x);toY(y)}else circle.style.translate=`${x}px ${y}px`});button.addEventListener('pointerleave',()=>{if(toX){toX(0);toY(0)}else circle.style.translate='0 0'})});
}
function updateSceneState(){
  const height=innerHeight,progress=scrollY/Math.max(1,document.documentElement.scrollHeight-height);let selected=null,distance=Infinity,visible=false;
  sceneSections.forEach(section=>{const rect=section.getBoundingClientRect();if(rect.bottom>0&&rect.top<height){if(section.dataset.scene!=='about')visible=true;const current=Math.abs(rect.top+Math.min(rect.height,height)/2-height/2);if(current<distance){distance=current;selected=section}}});
  let section=selected?.dataset.scene||'hero';if(methodTrigger?.isActive){section='method';visible=true}
  scene?.setState({progress,section,methodProgress,visible});scrollDirty=false;
}
function sharedTick(time){lenis?.raf(time*1000);if(scrollDirty)updateSceneState();scene?.tick(time);if(fine&&!reduced){cursorX+=(pointerX-cursorX)*.17;cursorY+=(pointerY-cursorY)*.17;const radius=cursorExpanded?33:5;cursor.style.transform=`translate3d(${cursorX-radius}px,${cursorY-radius}px,0)`;if(previewActive){const x=Math.min(innerWidth-275,Math.max(12,cursorX+26)),y=Math.min(innerHeight-195,Math.max(12,cursorY-80));preview.style.transform=`translate3d(${x}px,${y}px,0) rotate(3deg)`}}}
let fallbackFrame;
if(gsap){gsap.ticker.add(sharedTick);gsap.ticker.lagSmoothing(0)}else{const frame=now=>{sharedTick(now/1000);fallbackFrame=requestAnimationFrame(frame)};fallbackFrame=requestAnimationFrame(frame)}

// Exit invitation: once per tab session, only after engagement, never over another dialog.
let exitSeen=false,engagedAt=performance.now();try{exitSeen=sessionStorage.getItem('nexo-exit-seen')==='1'}catch{}
if(fine&&!reduced)document.addEventListener('mouseout',event=>{if(exitSeen||event.relatedTarget||event.clientY>2||performance.now()-engagedAt<20000||scrollY<200||locks.size)return;exitSeen=true;try{sessionStorage.setItem('nexo-exit-seen','1')}catch{}showDialog($('#exit-modal'))});
$('#exit-lead').addEventListener('click',()=>{$('#exit-modal').close();openLead('exit-intent')});$('#exit-dismiss').addEventListener('click',()=>$('#exit-modal').close());

// A short bounded preloader never makes form availability depend on a WebGL/CDN success.
const loader=$('#preloader');let loaderReleased=false;
if(!reduced){loader.hidden=false;lock('boot');document.body.setAttribute('aria-busy','true')}
function enterHero(){if(gsap&&!reduced)gsap.timeline({defaults:{ease:'power3.out'}}).from('.hero-eyebrow,.registration',{opacity:0,y:10,duration:.7,stagger:.08}).from('.hero h1 .line-mask>span',{yPercent:115,duration:1.1,stagger:.1},'-=.35').from('.hero-description,.hero-form',{opacity:0,y:20,duration:.9,stagger:.12},'-=.55').from('.accountant',{opacity:0,y:22,duration:1.2},'-=1').from('.float-chip,.rating-area',{opacity:0,duration:1,stagger:.1},'-=.7')}
function releaseLoader(){if(loaderReleased)return;loaderReleased=true;unlock('boot');document.body.removeAttribute('aria-busy');loader.classList.add('leaving');setTimeout(()=>loader.hidden=true,reduced?0:650);enterHero();ST?.refresh();scrollDirty=true}
const bootTimeout=setTimeout(releaseLoader,2600);
requestAnimationFrame(async()=>{
  if(reduced){document.documentElement.classList.add('scene-fallback');clearTimeout(bootTimeout);releaseLoader();return}
  try{const module=await import('./scene.js');scene=module.initScene({canvas:$('#scene'),reduced});if(scene){scene.setSimulation(estimate);scrollDirty=true}else document.documentElement.classList.add('scene-fallback')}
  catch{document.documentElement.classList.add('scene-fallback');$('#scene').dataset.mode='fallback'}
  finally{clearTimeout(bootTimeout);releaseLoader()}
});
// The submit controls are enabled only after event handlers are registered.
$$('button[data-ready]').forEach(button=>button.disabled=false);
addEventListener('pagehide',()=>{scene?.destroy();lenis?.destroy();if(gsap)gsap.ticker.remove(sharedTick);if(fallbackFrame)cancelAnimationFrame(fallbackFrame)},{once:true});
