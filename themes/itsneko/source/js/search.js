(() => {
  'use strict';
  const script = document.currentScript;
  const input = document.getElementById('searchInput'), result = document.getElementById('searchResult'), status = document.getElementById('searchStatus');
  const books = JSON.parse(document.getElementById('searchBooks').textContent);
  let records, loading, scope = 'all', timer, generation = 0;
  const buttons = document.querySelectorAll('[data-search-scope]');
  function load() {
    if (records) return Promise.resolve(records);
    if (!loading) loading = fetch(script.dataset.searchIndex).then(response => {
      if (!response.ok) throw new Error('index');
      return response.text();
    }).then(text => {
      const xml = new DOMParser().parseFromString(text, 'text/xml');
      if (xml.querySelector('parsererror')) throw new Error('xml');
      records = Array.from(xml.querySelectorAll('entry')).flatMap(entry => {
        const title = entry.querySelector('title')?.textContent.trim();
        const raw = entry.querySelector('url')?.textContent;
        if (!title || !raw) return [];
        let url;
        try { url = new URL(raw, location.origin); } catch (_) { return []; }
        if (!['http:', 'https:'].includes(url.protocol)) return [];
        const book = books.find(book => url.pathname === book.url.replace(/\/$/, '') || url.pathname.startsWith(book.url));
        const content = new DOMParser().parseFromString(entry.querySelector('content')?.textContent || '', 'text/html').body.textContent.replace(/\s+/g, ' ').trim();
        return [{title, content, url: url.pathname + url.search + url.hash, book, type: book ? 'book' : url.pathname.startsWith(script.dataset.postPrefix) ? 'post' : 'page'}];
      });
      records = Array.from(new Map(records.map(item => [item.url, item])).values());
      return records;
    }).catch(error => { loading = null; throw error; });
    return loading;
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
      const data = await load();
      if (version !== generation) return;
      const matches = data.filter(item => (scope === 'all' || item.type === scope) && words.every(word => (item.title + ' ' + (item.book?.title || '') + ' ' + item.content).toLowerCase().includes(word)));
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
