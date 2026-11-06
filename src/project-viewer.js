// Keep projects in this tab; closing a preview restores the exact portfolio position.
export function initProjectViewer({onOpen=()=>{},onClose=()=>{}}={}){
  const dialog=document.querySelector('#project-viewer'),frame=document.querySelector('#project-frame');
  const title=document.querySelector('#viewer-title'),close=document.querySelector('#viewer-close');
  let origin=null,scrollY=0,previousOverflow='';
  function cleanup(){if(!dialog.open)return;dialog.close();frame.removeAttribute('src');dialog.classList.remove('is-loaded');document.body.style.overflow=previousOverflow;onClose();window.scrollTo({top:scrollY,behavior:'instant'});origin?.focus({preventScroll:true})}
  function leave(){const previewEntry=history.state?.ogzPreview;cleanup();if(previewEntry)history.back()}
  document.querySelectorAll('[data-project]').forEach(card=>{
    card.removeAttribute('target');card.setAttribute('aria-haspopup','dialog');
    card.addEventListener('click',event=>{
      if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();origin=card;scrollY=window.scrollY;previousOverflow=document.body.style.overflow;
      title.textContent=card.querySelector('.project-bottom strong').textContent;
      frame.title=`Site ${title.textContent}`;dialog.classList.remove('is-loaded');
      onOpen();document.body.style.overflow='hidden';dialog.showModal();
      history.pushState({ogzPreview:true},'',location.href);frame.src=card.href;
    });
  });
  frame.addEventListener('load',()=>{if(frame.getAttribute('src'))dialog.classList.add('is-loaded')});
  close.addEventListener('click',leave);dialog.addEventListener('cancel',event=>{event.preventDefault();leave()});
  addEventListener('popstate',()=>{if(dialog.open)cleanup()});
}
