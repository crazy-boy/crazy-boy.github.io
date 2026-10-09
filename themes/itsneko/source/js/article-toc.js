(() => {
  const container = document.getElementById('toc-content');
  if (!container) return;
  const layout = document.querySelector('.post-reading-layout'), button = document.querySelector('#floating-toc-btn button');
  const headings = Array.from(document.getElementById('articleContent').querySelectorAll(container.dataset.headings));
  if (!headings.length) { layout.classList.add('toc-collapsed'); if(button)button.parentElement.hidden=true; return; }
  const list = document.createElement('ol'); list.className = 'toc-list';
  const minLevel = Math.min(...headings.map(h=>Number(h.tagName[1])));
  const links = headings.map((heading,index) => {
    if (!heading.id) heading.id = 'toc-heading-' + index;
    const li=document.createElement('li'),link=document.createElement('a');
    link.className='toc-link'; link.href='#'+encodeURIComponent(heading.id); link.textContent=heading.textContent;
    li.style.paddingLeft=(Number(heading.tagName[1])-minLevel)*12+'px';
    li.append(link); list.append(li); return link;
  });
  container.append(list);
  let active=-1,frame;
  function update() {
    frame=null;
    let current=0;
    headings.forEach((heading,index)=>{if(heading.getBoundingClientRect().top<=110)current=index;});
    if(current===active)return;
    links.forEach((link,index)=>{link.classList.toggle('is-active-link',index===current);if(index===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    active=current;
    const rect=links[current].getBoundingClientRect(),box=container.getBoundingClientRect();
    if(rect.top<box.top || rect.bottom>box.bottom)container.scrollTop+=rect.top-box.top-40;
  }
  window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  window.addEventListener('resize',update);
  update();
  if(button)button.addEventListener('click',()=>{
    const collapsed=layout.classList.toggle('toc-collapsed');
    button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'展开文章目录':'收起文章目录');
    window.dispatchEvent(new Event('resize'));
  });
})();
