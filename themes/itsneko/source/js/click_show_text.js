(() => {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches)return;
  const words=['慢慢读','有点收获','保持好奇']; let last=0,index=0;
  document.addEventListener('click',event=>{
    if(event.target.closest('a,button,input,textarea,select,label,.modal,.lazy-music')||Date.now()-last<800)return;
    last=Date.now(); const hint=document.createElement('span'); hint.className='click-note';hint.textContent=words[index++%words.length];hint.setAttribute('aria-hidden','true');
    hint.style.left=Math.max(12,Math.min(event.clientX,innerWidth-100))+'px';hint.style.top=Math.max(20,event.clientY-20)+'px';document.body.append(hint);setTimeout(()=>hint.remove(),1100);
  });
})();
