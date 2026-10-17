(() => {
  'use strict';
  const script = document.currentScript;
  const input = document.getElementById('searchInput'), result = document.getElementById('searchResult'), status = document.getElementById('searchStatus');
  const books = JSON.parse(document.getElementById('searchBooks').textContent);
  let scope = 'all', timer, generation = 0;
  const cache = new Map(), buttons = document.querySelectorAll('[data-search-scope]');
  function loadIndex(type) {
    if (!cache.has(type)) {
      const url=type==='post' ? script.dataset.searchIndex : script.dataset.searchBooks;
      cache.set(type,fetch(url).then(response=>{if(!response.ok)throw new Error('index');return response.json();}).then(rows=>rows.flatMap(row=>{
        if(typeof row.title!=='string' || typeof row.url!=='string' || typeof row.content!=='string')return [];
        const url=new URL(row.url,location.origin);if(url.origin!==location.origin)return [];
        const book=books.find(book=>url.pathname.startsWith(book.url));
        return [{...row,url:url.pathname,book,type,searchText:(row.title+' '+(book?.title||'')+' '+row.content).toLowerCase()}];
      })).catch(error=>{cache.delete(type);throw error;}));
    }
    return cache.get(type);
  }
  function load(selectedScope) {
    return Promise.all((selectedScope==='all'?['post','book']:[selectedScope]).map(loadIndex)).then(parts=>parts.flat());
  }
  function highlight(node, text, keywords) {
    const pattern = new RegExp(keywords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
    let start = 0;
    for (const match of text.matchAll(pattern)) {
      node.append(document.createTextNode(text.slice(start, match.index)));
      const mark = document.createElement('mark'); mark.textContent = match[0]; node.append(mark); start = match.index + match[0].length;
    }
    node.append(document.createTextNode(text.slice(start)));
  }
  async function search() {
    const version = ++generation;
    const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    result.replaceChildren();
    if (!words.length) { status.textContent = '输入关键词开始搜索。'; return; }
    status.textContent = '正在搜索…';
    try {
      const data = await load(scope);
      if (version !== generation) return;
      const matches = data.filter(item => (scope === 'all' || item.type === scope) && words.every(word => item.searchText.includes(word)));
      matches.sort((a,b) => Number(words.every(w=>b.title.toLowerCase().includes(w))) - Number(words.every(w=>a.title.toLowerCase().includes(w))));
      status.textContent = matches.length ? `找到 ${matches.length} 条结果${matches.length > 60 ? '，显示前 60 条，请增加关键词缩小范围' : ''}。` : '没有找到结果，请换个关键词或搜索范围。';
      const list = document.createElement('ul'); list.className = 'search-result-list';
      for (const item of matches.slice(0,60)) {
        const li = document.createElement('li'), meta = document.createElement('div'), a = document.createElement('a'), p = document.createElement('p');
        meta.className = 'search-result-meta'; meta.textContent = item.book ? '书籍 · ' + item.book.title : item.type === 'post' ? '博文' : '站点页面';
        a.className = 'search-result-title'; a.href = item.url; highlight(a,item.title,words);
        const at = item.content.toLowerCase().indexOf(words[0]), begin = Math.max(0,at-25);
        p.className = 'search-result'; highlight(p,(begin ? '…' : '') + item.content.slice(begin,begin+140) + (item.content.length>begin+140 ? '…' : ''),words);
        li.append(meta,a,p); list.append(li);
      }
      result.append(list);
    } catch (_) { if (version === generation) status.textContent = '搜索索引加载失败，请重新输入关键词重试。'; }
  }
  input.addEventListener('input', () => { ++generation; clearTimeout(timer); timer = setTimeout(search,150); });
  buttons.forEach(button => button.addEventListener('click', () => {
    scope = button.dataset.searchScope;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    clearTimeout(timer); search();
  }));
})();
