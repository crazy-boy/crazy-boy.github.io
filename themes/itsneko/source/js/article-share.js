(() => {
  'use strict';
  const host=document.getElementById('article-share');
  if (!host) return;
  const copy=host.querySelector('[data-copy-link]'), native=host.querySelector('[data-native-share]'), status=host.querySelector('[role="status"]');
  const data={title:host.dataset.shareTitle,url:host.dataset.shareUrl};
  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard');
      await navigator.clipboard.writeText(data.url);
    } catch (_) {
      const field=document.createElement('textarea');field.value=data.url;field.readOnly=true;field.style.cssText='position:fixed;left:-9999px;top:0';
      field.addEventListener('copy',event=>event.stopPropagation());document.body.append(field);field.select();
      let ok;try{ok=document.execCommand('copy');}finally{field.remove();copy.focus({preventScroll:true});}
      if (!ok) throw new Error('copy');
    }
  }
  copy.addEventListener('click',async()=>{
    copy.disabled=true;
    try {await copyLink();status.textContent='链接已复制，可粘贴到微信、QQ 或其他应用分享。';}
    catch (_) {status.textContent='复制失败，请复制浏览器地址栏中的链接。';}
    finally {copy.disabled=false;}
  });
  if (typeof navigator.share==='function' && (!navigator.canShare || navigator.canShare(data))) {
    native.hidden=false;
    native.addEventListener('click',async()=>{
      native.disabled=true;
      try {await navigator.share(data);status.textContent='已打开系统分享。';}
      catch (error) {status.textContent=error.name==='AbortError'?'已取消分享。':'系统分享暂不可用，请复制链接。';}
      finally {native.disabled=false;}
    });
  }
})();
