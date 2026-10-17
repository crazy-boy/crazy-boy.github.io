(() => {
  const article = document.getElementById('articleContent');
  if (!article) return;
  const blocks = [...article.querySelectorAll('figure.highlight, pre')].filter(node => !node.matches('pre') || !node.closest('figure.highlight'));
  blocks.forEach((node, index) => {
    if (node.closest('.site-code') || node.classList.contains('mermaid-source')) return;
    const pre = node.matches('pre') ? node : node.querySelector('td.code pre');
    if (!pre) return;
    const languageClass = [...node.classList, ...pre.classList, ...(pre.querySelector('code')?.classList || [])].find(name => name.startsWith('language-'));
    const language = languageClass ? languageClass.slice(9) : node.matches('figure.highlight') ? [...node.classList].find(name => name !== 'highlight') || 'code' : 'code';
    const shell = document.createElement('div'); shell.className = 'site-code';
    const toolbar = document.createElement('div'); toolbar.className = 'site-code-toolbar';
    const label = document.createElement('span'); label.textContent = language.toUpperCase();
    const actions = document.createElement('div'); actions.className = 'site-code-actions';
    const wrap = document.createElement('button'); wrap.type = 'button'; wrap.textContent = '自动换行'; wrap.setAttribute('aria-pressed', 'false');
    const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = '复制';
    const status = document.createElement('span'); status.className = 'site-code-status'; status.setAttribute('role', 'status');
    actions.append(wrap, copy); toolbar.append(label, actions); shell.append(toolbar);
    node.replaceWith(shell); shell.append(pre, status);
    pre.querySelectorAll('.line-numbers-rows').forEach(rows => rows.remove());
    pre.classList.remove('line-numbers'); pre.tabIndex = 0; pre.id ||= 'code-snippet-' + index;
    pre.setAttribute('aria-label', language.toUpperCase() + ' 代码，可横向滚动');
    wrap.setAttribute('aria-controls', pre.id);
    wrap.addEventListener('click', () => { const enabled = shell.classList.toggle('is-wrapped'); wrap.setAttribute('aria-pressed', String(enabled)); });
    let timer;
    copy.addEventListener('click', async () => {
      const content = (pre.querySelector('code') || pre).cloneNode(true);
      content.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      const text = content.textContent;
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        else {
          const field = document.createElement('textarea'); field.value = text; field.style.cssText = 'position:fixed;top:0;left:-9999px';
          field.addEventListener('copy', event => event.stopPropagation()); document.body.append(field); field.select();
          let success; try { success = document.execCommand('copy'); } finally { field.remove(); copy.focus({preventScroll:true}); }
          if (!success) throw new Error('Copy unavailable');
        }
        copy.textContent = '已复制'; status.textContent = '代码已复制';
      } catch (_) { copy.textContent = '复制失败'; status.textContent = '请选中代码后手动复制'; }
      clearTimeout(timer); timer = setTimeout(() => { copy.textContent = '复制'; status.textContent = ''; }, 2500);
    });
  });
})();
