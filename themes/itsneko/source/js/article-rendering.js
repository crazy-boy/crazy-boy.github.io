(async () => {
  'use strict';
  const script = document.currentScript, article = document.getElementById('articleContent');
  if (!article) return;
  if (script.dataset.diagrams === 'true') {
    try {
      const {default: mermaid} = await import(script.dataset.mermaid);
      mermaid.initialize({startOnLoad:false, securityLevel:'strict', theme:document.body.classList.contains('dark') ? 'dark' : 'default', flowchart:{htmlLabels:false}, suppressErrorRendering:true});
      let index=0;
      for (const pre of article.querySelectorAll('pre.mermaid-source')) {
        const source=pre.textContent, figure=document.createElement('figure'); figure.className='article-diagram';
        try {
          const {svg,bindFunctions}=await mermaid.render('article-diagram-'+index++,source);
          figure.innerHTML=svg; figure.setAttribute('aria-label','文章图表');
          const details=document.createElement('details'),summary=document.createElement('summary'); summary.textContent='查看图表源码';
          pre.replaceWith(figure); details.append(summary,pre); figure.append(details); bindFunctions?.(figure);
        } catch (_) {
          const note=document.createElement('p');note.className='render-note';note.textContent='这张图暂时无法渲染，以下为原始图表代码。';pre.before(note);
        }
      }
      window.dispatchEvent(new Event('resize'));
    } catch (_) {
      const note=document.createElement('p');note.className='render-note';note.textContent='图表组件加载失败，已保留图表源码。';article.querySelector('.mermaid-source')?.before(note);
    }
  }
  if (script.dataset.math === 'true') {
    article.querySelectorAll('script[type^="math/tex"]').forEach(node => {
      const display=node.type.includes('mode=display');
      node.replaceWith(document.createTextNode((display?'\\[':'\\(')+node.textContent+(display?'\\]':'\\)')));
    });
    window.MathJax={tex:{inlineMath:[['$','$'],['\\(','\\)']],displayMath:[['$$','$$'],['\\[','\\]']],processEscapes:true},options:{ignoreHtmlClass:'site-code|mermaid-source|article-diagram'},startup:{typeset:false}};
    const loader=document.createElement('script');loader.src=script.dataset.mathjax;loader.async=true;
    loader.onload=()=>window.MathJax.startup.promise.then(()=>window.MathJax.typesetPromise([article])).then(()=>window.dispatchEvent(new Event('resize'))).catch(()=>{});
    loader.onerror=()=>{const note=document.createElement('p');note.className='render-note';note.textContent='公式组件加载失败，已保留公式文本。';article.prepend(note);};
    document.head.append(loader);
  }
})();
