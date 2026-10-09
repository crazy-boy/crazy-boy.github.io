(() => {
  const normalize = path => path.replace(/\/+$/, '') || '/';
  const current = normalize(location.pathname);
  document.querySelectorAll('.nav-menu a, .mobile-menu-list a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/')) return;
    const target = normalize(new URL(href, location.origin).pathname);
    if (current !== target && !(target !== '/' && current.startsWith(target + '/'))) return;
    link.classList.add('is-active');
    if (current === target) link.setAttribute('aria-current', 'page');
    const item = link.closest('.nav-item, .m-nav-item');
    const parent = item && item.querySelector(':scope > a');
    if (parent) parent.classList.add('is-active');
  });
  if (current.startsWith('/posts/')) {
    document.querySelectorAll('.nav-menu a[href="/archives/"], .mobile-menu-list a[href="/archives/"]').forEach(link => {
      link.closest('.nav-item, .m-nav-item').querySelector(':scope > a').classList.add('is-active');
    });
  }
})();
