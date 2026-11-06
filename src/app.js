import {initProjectViewer} from './project-viewer.js';
import {CONFIG,SITES,PLANS} from './config.js';
import {createCarousel} from './carousel.js';

const $=(selector,root=document)=>root.querySelector(selector),$$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const mobile=matchMedia('(max-width: 800px)').matches;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=!mobile&&matchMedia('(hover: hover) and (pointer: fine)').matches;
const gsap=window.gsap,ST=window.ScrollTrigger;if(gsap&&ST)gsap.registerPlugin(ST);
// Normalize restored fragment scroll before measuring any animation trigger.
const initialHash=location.hash;if(ST)document.documentElement.style.scrollBehavior='auto';history.scrollRestoration='manual';window.scrollTo({top:0,left:0,behavior:'instant'});ST?.clearScrollMemory('manual');
window.dataLayer=window.dataLayer||[];const track=(event,details={})=>window.dataLayer.push({event,...details});
const phone=CONFIG.whatsapp.replace(/\D/g,'');
const waURL=message=>`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
const defaultMessage='Olá! Vim pelo site da OGZ e quero conversar sobre o site da minha marca.';
$$('[data-founder]').forEach(el=>el.textContent=CONFIG.founder);$('#year').textContent=new Date().getFullYear();
$('#founder-photo').src=CONFIG.portrait;$('#founder-photo').srcset=`assets/ogz-fundador-mobile.webp 600w, ${CONFIG.portrait} 1092w`;$('#founder-photo').sizes='(max-width: 800px) 100vw, 70vw';$('#founder-photo').alt=`${CONFIG.founder}, fundador da OGZ Corporation, de camisa branca e gravata, com uma jaqueta no braço`;
const brandWords=CONFIG.name.trim().split(/\s+/),firstWord=brandWords.shift();
$$('.word-ogz').forEach(el=>el.textContent=firstWord);$$('.word-corporation').forEach(el=>el.textContent=brandWords.join(' '));
$$('.ogz-mark').forEach(el=>el.firstChild.textContent=firstWord);$('#hero-title').setAttribute('aria-label',CONFIG.name);
document.title=`${CONFIG.name} — Não é só um site. É a sua posição.`;
const schema=JSON.parse($('#business-schema').textContent);schema.name=CONFIG.name;schema.founder.name=CONFIG.founder;
schema.hasOfferCatalog.itemListElement=PLANS.map(plan=>({'@type':'Offer',priceCurrency:'BRL',price:String(plan.price),itemOffered:{'@type':'Service',name:plan.name}}));
if(CONFIG.domain){try{const url=new URL(CONFIG.domain.startsWith('http')?CONFIG.domain:`https://${CONFIG.domain}`);schema.url=url.href;const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=url.href;document.head.append(canonical);$('#hero-domain').href=url.href;$('#hero-domain').firstChild.textContent=url.hostname;$('meta[property="og:image"]').content=new URL('assets/ogz-fundador.png',url).href}catch{}}
else{$('#hero-domain').href=CONFIG.instagram;$('#hero-domain').firstChild.textContent=CONFIG.instagramHandle+' '}
$('#business-schema').textContent=JSON.stringify(schema);$('#footer-instagram').href=CONFIG.instagram;
if(CONFIG.email){$('#footer-email').hidden=false;$('#footer-email').href=`mailto:${CONFIG.email}`}
$$('[data-whatsapp]').forEach(link=>{link.href=waURL(defaultMessage);link.addEventListener('click',()=>track('whatsapp_click',{source:link.dataset.planLink?'plano':'contato'}))});
PLANS.forEach(plan=>{const card=$(`[data-plan="${plan.id}"]`);$('h3',card).textContent=plan.name;$('.plan-label',card).textContent=plan.label;$('.plan-description',card).textContent=plan.description;$('[data-price]',card).textContent=plan.price.toLocaleString('pt-BR');$('[data-installment]',card).textContent=CONFIG.installment;$('.plan-benefits',card).replaceChildren(...plan.benefits.map(text=>{const li=document.createElement('li'),check=document.createElement('span');check.className='benefit-check';check.setAttribute('aria-hidden','true');check.textContent='✓';li.append(check,document.createTextNode(text));return li}));const link=$('[data-plan-link]',card);link.href=waURL(`Olá! Vim pelo site da OGZ e quero o plano ${plan.name}.`);link.addEventListener('click',()=>track('plan_click',{plan:plan.name}))});

// Real project links are present in HTML as a no-JavaScript fallback.
$$('[data-project]').forEach((card,index)=>{const project=SITES[index];card.href=project.url;card.setAttribute('aria-label',`Visitar site ${project.name}`);$('.project-tag',card).textContent=project.category.toUpperCase();$('.project-bottom strong',card).textContent=project.name;const image=$('img',card);image.src=project.image;image.alt=project.alt;image.srcset=`${project.image.replace('.webp','-small.webp')} 600w, ${project.image} 1000w`;let fallback=0;image.addEventListener('error',()=>{image.parentElement.querySelector('source')?.remove();image.removeAttribute('srcset');if(fallback===0){fallback++;image.src=project.imageFallback;return}const url=new URL(project.url,location.href);if(fallback===1&&/^https?:$/.test(url.protocol)&&!['localhost','127.0.0.1','[::1]'].includes(url.hostname)){fallback++;image.src=`https://image.thum.io/get/width/800/crop/1000/${url.href}`;return}image.hidden=true;card.classList.add('preview-missing');if(!$('.preview-title',card)){const title=document.createElement('span');title.className='preview-title';title.textContent=project.name;card.prepend(title)}})});
const gallery=createCarousel({region:$('#gallery'),sites:SITES,reduced,track});
{const observer=new IntersectionObserver(entries=>gallery.setVisible(entries[0].isIntersecting),{rootMargin:'100px'});observer.observe($('#gallery'))}

// Typography is fitted once fonts resolve, identically in both layers, then on viewport changes.
$$('.hero-word').forEach(word=>{const text=word.textContent;word.replaceChildren(...[...text].map(letter=>{const span=document.createElement('span');span.className='hero-letter';span.textContent=letter;return span}))});
function fitTypography(){const word=$('.type-back .word-corporation'),available=$('.hero').clientWidth*(innerWidth<=600?.93:.91),natural=word.scrollWidth;if(natural)document.documentElement.style.setProperty('--corp-stretch',String(Math.min(1.65,available/natural)));gallery.resize()}
addEventListener('resize',fitTypography,{passive:true});fitTypography();

// Verified metrics are opt-in; client counts or delivery promises are never fabricated.
if(CONFIG.stats){const metrics=[['sites','sites no ar'],['clients','clientes atendidos'],['deliveryDays','dias de prazo médio']].filter(([key])=>Number(CONFIG.stats[key])>0);if(metrics.length){$('#verified-stats').replaceChildren(...metrics.map(([key,label])=>{const wrapper=document.createElement('div'),value=document.createElement('strong'),small=document.createElement('small');value.dataset.count=CONFIG.stats[key];value.textContent=Number(CONFIG.stats[key]).toLocaleString('pt-BR');small.textContent=label;wrapper.append(value,small);return wrapper}));$('#verified-stats').hidden=false}}

let lenis=null;if(!mobile&&!reduced&&window.Lenis){lenis=new window.Lenis({lerp:.09,smoothWheel:true,anchors:true});if(ST)lenis.on('scroll',ST.update)}
const cursor=$('.custom-cursor');let pointerX=-100,pointerY=-100,cursorX=-100,cursorY=-100,cursorMode='',lastTime=0;
function cursorState(mode){cursorMode=mode;cursor.classList.toggle('expanded',!!mode);$('span',cursor).textContent=mode==='visit'?'VISITAR ↗':'ARRASTE'}
if(fine&&!reduced){
  addEventListener('pointermove',event=>{pointerX=event.clientX;pointerY=event.clientY;cursor.style.opacity='1'},{passive:true});document.addEventListener('mouseleave',()=>cursor.style.opacity='0');
  $('#gallery-stage').addEventListener('pointerenter',()=>cursorState('drag'));$('#gallery-stage').addEventListener('pointerleave',()=>cursorState(''));
  $$('.project-card').forEach(card=>{card.addEventListener('pointerenter',()=>cursorState('visit'));card.addEventListener('pointerleave',()=>cursorState('drag'))});
  $$('.plan-card').forEach(card=>{card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;card.style.setProperty('--mx',`${x*100}%`);card.style.setProperty('--my',`${y*100}%`);const scale=card.classList.contains('featured')&&innerWidth>600?1.035:1;card.style.transform=`perspective(900px) rotateX(${(.5-y)*8}deg) rotateY(${(x-.5)*8}deg) scale(${scale})`});card.addEventListener('pointerleave',()=>card.style.transform='')});
  $$('.button').forEach(button=>{const arrow=$('.button-arrow',button);if(!arrow)return;const xTo=gsap?.quickTo(arrow,'x',{duration:.5,ease:'power3.out'}),yTo=gsap?.quickTo(arrow,'y',{duration:.5,ease:'power3.out'});button.addEventListener('pointermove',event=>{const r=button.getBoundingClientRect(),x=Math.max(-10,Math.min(10,(event.clientX-r.left-r.width/2)*.14)),y=Math.max(-10,Math.min(10,(event.clientY-r.top-r.height/2)*.25));if(xTo){xTo(x);yTo(y)}else arrow.style.translate=`${x}px ${y}px`});button.addEventListener('pointerleave',()=>{if(xTo){xTo(0);yTo(0)}else arrow.style.translate='0 0'})});
}

function tick(time){lenis?.raf(time*1000);const delta=lastTime?Math.min(time-lastTime,.06):.016;lastTime=time;if(!document.hidden){gallery.tick(delta);if(fine&&!reduced){cursorX+=(pointerX-cursorX)*.18;cursorY+=(pointerY-cursorY)*.18;cursor.style.transform=`translate3d(${cursorX-(cursorMode?40.5:4)}px,${cursorY-(cursorMode?17.5:4)}px,0)`}}}
let fallbackFrame;const tickerLayout=matchMedia('(min-width: 0px)');
function syncTicker(){if(gsap){gsap.ticker.remove(tick);if(tickerLayout.matches){gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0)}}else{if(fallbackFrame)cancelAnimationFrame(fallbackFrame);fallbackFrame=null;if(tickerLayout.matches){const frame=now=>{tick(now/1000);fallbackFrame=requestAnimationFrame(frame)};fallbackFrame=requestAnimationFrame(frame)}}}
syncTicker();tickerLayout.addEventListener('change',syncTicker);

if(gsap&&ST&&!reduced){
  gsap.to('.type-exit',{scale:1.15,opacity:0,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom 12%',scrub:1}});
  gsap.to('.portrait-scroll',{yPercent:-8,filter:mobile?'brightness(.72)':'brightness(.38)',ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
  const manifesto=$('#manifesto'),text=manifesto.textContent;manifesto.setAttribute('aria-label',text);manifesto.replaceChildren(...text.split(/\s+/).flatMap((word,index)=>{const span=document.createElement('span');span.className='word';span.textContent=word;span.setAttribute('aria-hidden','true');return [document.createTextNode(index?' ':''),span]}));
  gsap.fromTo('.manifesto .word',{color:'#52554b'},{color:'#f4ecdc',stagger:.08,ease:'none',scrollTrigger:{trigger:'.about-grid',start:'top 85%',end:'bottom 30%',scrub:1}});
  $$('.cases-heading,.case-pillars article,.about h2,.comparison-card,.position-pillars article,.plans-heading').forEach(el=>gsap.from(el,{opacity:0,y:25,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
  // Keep transforms on pricing shells reserved for hover tilt; reveal their inner content instead.
  $$('.plan-content').forEach((el,index)=>gsap.from(el,{opacity:0,y:30,duration:1,delay:index*.08,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}}));
}
if(gsap&&!reduced){
  if(fine){const hero=$('.hero'),photoX=gsap.quickTo('.portrait-mouse','x',{duration:1.1,ease:'power3.out'}),photoY=gsap.quickTo('.portrait-mouse','y',{duration:1.1,ease:'power3.out'});const types=$$('.type-parallax').map(el=>({x:gsap.quickTo(el,'x',{duration:1.2,ease:'power3.out'}),y:gsap.quickTo(el,'y',{duration:1.2,ease:'power3.out'})}));hero.addEventListener('pointermove',event=>{const r=hero.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;photoX(x*20);photoY(y*20);types.forEach(to=>{to.x(-x*44);to.y(-y*22)})});hero.addEventListener('pointerleave',()=>{photoX(0);photoY(0);types.forEach(to=>{to.x(0);to.y(0)})})}
  else {const float=gsap.to('.portrait-mouse',{x:7,y:4,duration:4.5,repeat:-1,yoyo:true,ease:'sine.inOut'});new IntersectionObserver(entries=>float.paused(!entries[0].isIntersecting)).observe($('.hero'))}
}
if(CONFIG.stats&&gsap&&!reduced){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);const counter={value:0},el=entry.target;gsap.to(counter,{value:Number(el.dataset.count),duration:2,ease:'expo.out',onUpdate:()=>el.textContent=Math.round(counter.value).toLocaleString('pt-BR')})}),{threshold:.8});$$('[data-count]').forEach(el=>observer.observe(el))}
setTimeout(()=>$('.whatsapp-float').classList.add('show'),reduced?0:3000);

// Short, bounded loading state: portrait and webfonts decode before the editorial entrance.
const loader=$('#preloader');let loaded=false;
if(!reduced&&!mobile){loader.hidden=false;document.body.style.overflow='hidden';lenis?.stop();document.body.setAttribute('aria-busy','true')}
function enter(){if(loaded)return;loaded=true;fitTypography();document.body.style.overflow='';document.body.removeAttribute('aria-busy');lenis?.start();loader.classList.add('leaving');setTimeout(()=>loader.hidden=true,reduced?0:650);if(gsap&&!reduced){const photo=$('#founder-photo'),baseFilter=getComputedStyle(photo).filter.replace(/^none$/,'');gsap.timeline({defaults:{ease:'power3.out'}}).from('.hero-spotlight',{opacity:0,duration:1.1}).fromTo('.type-back .hero-word',{clipPath:'inset(100% -20% 0 -20%)'},{clipPath:'inset(-25% -20% -25% -20%)',duration:1.1,stagger:.1},.05).from('.type-back .hero-letter',{yPercent:115,opacity:0,stagger:.04,duration:.95},.05).fromTo(photo,{opacity:0,scale:1.06,filter:`${baseFilter} blur(10px)`},{opacity:1,scale:1,filter:`${baseFilter} blur(0px)`,duration:1.3},.35).from('.type-front',{opacity:0,duration:.8},1).from('.hero-header,.hero-bottom,.hero-index,.scroll-cue',{opacity:0,y:8,duration:.8,stagger:.06},.8)}ST?.refresh();ST?.update();if(initialHash&&initialHash===location.hash){const destination=$(initialHash);if(destination){if(lenis)lenis.scrollTo(destination,{immediate:true});else destination.scrollIntoView({behavior:'instant'})}}requestAnimationFrame(()=>{ST?.refresh();ST?.update()})}
const timeout=setTimeout(enter,3500);
Promise.all([document.fonts?.ready||Promise.resolve(),$('#founder-photo').decode().catch(()=>null)]).finally(()=>{clearTimeout(timeout);enter()});
$('#founder-photo').addEventListener('error',()=>{if(!$('#founder-photo').src.endsWith('ogz-fundador.png'))$('#founder-photo').src='./assets/ogz-fundador.png'});
addEventListener('pagehide',()=>{gallery.destroy();lenis?.destroy();if(gsap)gsap.ticker.remove(tick);if(fallbackFrame)cancelAnimationFrame(fallbackFrame)},{once:true});

// Refit after a slow font response even if the bounded loader has already released.
document.fonts?.ready.then(fitTypography);

// Keep the corner signature unobstructed while the first screen is in view.
const heroContactObserver=new IntersectionObserver(entries=>$('.whatsapp-float').classList.toggle('in-hero',entries[0].isIntersecting),{threshold:.1});heroContactObserver.observe($('.hero'));

initProjectViewer({onOpen:()=>lenis?.stop(),onClose:()=>lenis?.start()});

const planLayout=matchMedia('(max-width: 800px)');
function updatePlanDetails(){ $$('.plan-details').forEach(detail=>detail.open=!planLayout.matches) }
updatePlanDetails();planLayout.addEventListener('change',updatePlanDetails);

// Native details remain accessible; prevent scroll anchoring and keep each toggle in place.
$$('.plan-details').forEach(detail=>{
 const summary=$('summary',detail);
 summary.addEventListener('click',event=>{
  if(!planLayout.matches)return;
  event.preventDefault();const pageY=window.scrollY,rail=$('.plan-grid'),railX=rail.scrollLeft;
  detail.open=!detail.open;
  if(detail.open)$('.plan-benefits',detail).scrollTop=0;
  summary.firstChild.textContent=detail.open?'Ocultar benefícios ':'Ver tudo que está incluído ';
  requestAnimationFrame(()=>{rail.scrollLeft=railX;window.scrollTo({top:pageY,behavior:'instant'});ST?.refresh()});
 });
});
