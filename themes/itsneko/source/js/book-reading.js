(() => {
  'use strict';
  const catalogElement = document.getElementById('book-reading-catalog');
  if (!catalogElement) return;
  let catalog;
  try { catalog = JSON.parse(catalogElement.textContent); } catch (_) { return; }
  const key = id => 'book-reading:v1:' + id;
  function read(book) {
    try {
      const value = JSON.parse(localStorage.getItem(key(book.id)));
      if (!value || !Number.isFinite(value.ratio) || value.ratio < 0 || value.ratio > 1) return null;
      const entry = book.entries.find(entry => entry.id === value.entryId);
      return entry ? { ...value, entry } : null;
    } catch (_) { return null; }
  }
  function updateResumeLinks() {
    document.querySelectorAll('[data-book-resume]').forEach(link => {
      const book = catalog.find(book => book.id === link.dataset.bookResume);
      const saved = book && read(book);
      link.hidden = !saved;
      const label = link.parentElement.querySelector('[data-book-progress-label]');
      if (label) label.textContent = saved ? '上次读到：' + saved.entry.title : '';
      if (!saved) { link.removeAttribute('href'); link.removeAttribute('aria-label'); return; }
      link.href = saved.entry.url + '#continue-reading';
      link.textContent = '继续阅读 →';
      link.setAttribute('aria-label', '继续阅读：' + saved.entry.title);

    });
  }
  updateResumeLinks();
  window.addEventListener('pageshow', updateResumeLinks);
  window.addEventListener('storage', updateResumeLinks);

  const shell = document.querySelector('.book-toc-shell');
  if (shell) {
    const desktop = matchMedia('(min-width: 801px)');
    const adjust = () => { shell.open = desktop.matches; };
    adjust();
    desktop.addEventListener('change', adjust);
    const selected = shell.querySelector('[aria-current="page"]');
    const scroller = shell.querySelector('.book-sidebar-links');
    if (selected && scroller && desktop.matches) {
      scroller.scrollTop = Math.max(0, selected.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 80);
    }
  }

  const reader = document.querySelector('[data-reading-book]');
  if (!reader || !reader.dataset.readingEntry) return;
  const book = catalog.find(book => book.id === reader.dataset.readingBook);
  const entry = book && book.entries.find(entry => entry.id === reader.dataset.readingEntry);
  const article = reader.querySelector('.book-prose');
  if (!entry || !article) return;
  // Capture before saving this visit, so resume never overwrites the old position.
  const previous = read(book);
  let ready = false, timer;
  function bounds() {
    const start = article.getBoundingClientRect().top + window.scrollY - 90;
    const end = Math.max(start, start + article.offsetHeight - window.innerHeight + 120);
    return { start, distance: end - start };
  }
  function save() {
    if (!ready) return;
    const { start, distance } = bounds();
    const ratio = distance > 0 ? Math.min(1, Math.max(0, (window.scrollY - start) / distance)) : 0;
    try { localStorage.setItem(key(book.id), JSON.stringify({ entryId: entry.id, ratio, updatedAt: Date.now() })); } catch (_) { /* Reading still works when storage is unavailable. */ }
  }
  function begin() {
    if (location.hash === '#continue-reading' && previous && previous.entryId === entry.id) {
      const { start, distance } = bounds();
      window.scrollTo({ top: Math.max(0, start + distance * previous.ratio), behavior: 'instant' });
    }
    ready = true;
    save();
  }
  if (document.readyState === 'complete') begin();
  else window.addEventListener('load', begin, { once: true });
  window.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(save, 200); }, { passive: true });
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
})();
