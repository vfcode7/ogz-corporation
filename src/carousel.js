// Liquid CSS-3D carousel. No canvas, Three.js or secondary animation loop.
export function createCarousel({region,sites,reduced=false,track=()=>{}}){
  const stage=region.querySelector('.gallery-stage'),cards=[...region.querySelectorAll('.project-card')];
  const prev=region.querySelector('#gallery-prev'),next=region.querySelector('#gallery-next');
  const counter=region.querySelector('#gallery-current'),progress=region.querySelector('.gallery-progress i'),status=region.querySelector('#gallery-status');
  const last=cards.length-1,clamp=value=>Math.min(last,Math.max(0,value));
  let pos=innerWidth<=800?0:Math.min(2,last),target=pos,visible=true,gap=0,active=-1,dirty=true,settled=false;
  let down=false,dragging=false,pointerId=null,originX=0,originY=0,startPos=pos,lastX=0,lastAt=0,velocity=0,suppressClickUntil=0,lastPointerAt=-1000,wheelTimer;
  const elastic=value=>value<0?-Math.min(.3,-value*.22):value>last?last+Math.min(.3,(value-last)*.22):value;
  const rail=region.querySelector('.gallery-cards');
  const nativeQuery=matchMedia('(max-width: 800px)');
  let native=nativeQuery.matches;
  function nativeIndex(){return clamp(Math.round((rail.scrollLeft)/(cards[0].offsetWidth+16)))}
  function resize(){native=nativeQuery.matches;region.classList.toggle('gallery-native',native);gap=innerWidth*.21;dirty=true;if(native)requestAnimationFrame(()=>{rail.scrollTo({left:Math.round(target)*(cards[0].offsetWidth+16),behavior:'instant'});pos=target;render()})}
  rail.addEventListener('scroll',()=>{if(!native)return;pos=target=nativeIndex();render();prev.disabled=target<=0;next.disabled=target>=last;clearTimeout(wheelTimer);wheelTimer=setTimeout(announce,160)},{passive:true});
  function setTarget(value){target=clamp(Math.round(value));if(native){rail.scrollTo({left:target*(cards[0].offsetWidth+16),behavior:reduced?'instant':'smooth'})}settled=false;dirty=true;prev.disabled=target<=0;next.disabled=target>=last}
  function announce(){const index=clamp(Math.round(pos));status.textContent=`Projeto ${index+1} de ${cards.length}: ${sites[index].name}. Abra o projeto e use Voltar ao portfólio para retornar.`}
  function render(){
    cards.forEach((card,index)=>{
      if(native){card.style.transform='';card.style.opacity='';card.style.zIndex='';card.style.removeProperty('--inactive');return}
      const d=index-pos,abs=Math.abs(d),x=d*gap,angle=Math.max(-55,Math.min(55,-d*26)),z=-abs*150,y=d*d*16,scale=1-Math.min(abs,2)*.07,opacity=1-Math.min(abs,3)*.18;
      card.style.transform=`translate3d(calc(-50% + ${x.toFixed(2)}px),${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${angle.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      card.style.opacity=opacity.toFixed(3);card.style.zIndex=String(100-Math.round(abs*15));card.style.setProperty('--inactive',Math.min(1,abs).toFixed(3));
    });
    const current=clamp(Math.round(pos));if(current!==active){active=current;counter.textContent=String(current+1).padStart(2,'0');progress.style.width=`${(current+1)/cards.length*100}%`;cards.forEach((card,i)=>{card.classList.toggle('is-active',i===current);if(i===current)card.setAttribute('aria-current','true');else card.removeAttribute('aria-current')})}
    dirty=false;
  }
  function tick(delta=.016){
    if(native||(!visible&&!down))return;
    const distance=target-pos;
    if(reduced){pos=target;if(dirty||Math.abs(distance)>.0001)render()}
    else if(dirty||Math.abs(distance)>.0004){pos+=distance*(1-Math.exp(-11*Math.min(delta,.06)));if(Math.abs(target-pos)<.0004)pos=target;render()}
    if(!down&&!settled&&Math.abs(pos-target)<.003){settled=true;announce()}
  }
  prev.addEventListener('click',()=>setTarget(Math.round(target)-1));next.addEventListener('click',()=>setTarget(Math.round(target)+1));
  region.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setTarget(Math.round(target)+(event.key==='ArrowRight'?1:-1))}else if(event.key==='Home'){event.preventDefault();setTarget(0)}else if(event.key==='End'){event.preventDefault();setTarget(last)}});
  cards.forEach((card,index)=>{card.addEventListener('focus',()=>{if(!down&&performance.now()-lastPointerAt>300)setTarget(index)});card.addEventListener('click',()=>track('card_click',{site:sites[index].name}));card.addEventListener('dragstart',event=>event.preventDefault())});
  stage.addEventListener('pointerdown',event=>{
    if(native||event.button!==0||!event.isPrimary)return;
    down=true;dragging=false;pointerId=event.pointerId;originX=lastX=event.clientX;originY=event.clientY;lastAt=performance.now();lastPointerAt=lastAt;startPos=pos;target=pos;velocity=0;settled=false;
  });
  stage.addEventListener('pointermove',event=>{
    if(!down||event.pointerId!==pointerId)return;
    const dx=event.clientX-originX,dy=event.clientY-originY;
    if(!dragging&&Math.abs(dx)>6&&(event.pointerType!=='touch'||Math.abs(dx)>Math.abs(dy)*1.15)){
      dragging=true;stage.classList.add('dragging');stage.setPointerCapture(pointerId);
    }
    if(!dragging)return;
    event.preventDefault();const now=performance.now(),dt=Math.max(1,now-lastAt);velocity=velocity*.35+(event.clientX-lastX)/dt*.65;lastX=event.clientX;lastAt=now;target=elastic(startPos-dx/gap);dirty=true;
  },{passive:false});
  function release(event){
    if(!down||event.pointerId!==pointerId)return;
    if(dragging){suppressClickUntil=performance.now()+400;setTarget(target-velocity*190/gap);if(stage.hasPointerCapture(pointerId))stage.releasePointerCapture(pointerId)}else setTarget(pos);
    down=false;dragging=false;pointerId=null;stage.classList.remove('dragging');
  }
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',event=>{velocity=0;release(event)});
  // Capture suppresses navigation AND analytics only after a genuine drag, never a normal click.
  stage.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation()}},true);
  stage.addEventListener('wheel',event=>{
    if(native)return;
    const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY)*.8&&Math.abs(event.deltaX)>1;
    if(!horizontal&&!event.shiftKey)return;
    const delta=horizontal?event.deltaX:event.deltaY;if(Math.abs(delta)<.1)return;
    event.preventDefault();target=elastic(target+delta/gap*.8);settled=false;dirty=true;clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>setTarget(target),160);
  },{passive:false});
  addEventListener('resize',resize,{passive:true});resize();region.querySelector('#gallery-total').textContent=String(cards.length).padStart(2,'0');setTarget(pos);
  document.documentElement.classList.add('gallery-ready');render();
  return {tick,resize,setVisible:value=>{visible=value;if(value)dirty=true},getPosition:()=>({pos,target,active}),destroy:()=>{clearTimeout(wheelTimer);removeEventListener('resize',resize)}};
}
