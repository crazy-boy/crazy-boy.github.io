(() => {
  if (window.siteMusicLoader) return;
  window.siteMusicLoader = true;
  const scripts = new Map();
  function load(src) {
    if (!scripts.has(src)) scripts.set(src, new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = src;
      script.onload = resolve;
      script.onerror = () => { script.remove(); scripts.delete(src); reject(new Error('load')); };
      document.head.append(script);
    }));
    return scripts.get(src);
  }
  document.querySelectorAll('[data-load-music]').forEach(button => {
    button.addEventListener('click', async () => {
      const host = button.closest('.lazy-music'), status = host.querySelector('.music-status');
      button.disabled = true; status.textContent = '正在加载音乐…';
      try {
        if (host.dataset.musicCss && !document.querySelector('link[data-music-style]')) {
          const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = host.dataset.musicCss; css.dataset.musicStyle = 'true'; document.head.append(css);
        }
        if (host.dataset.musicJs) {
          await load(host.dataset.musicJs);
          await load('https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js');
        }
        host.append(host.querySelector('template').content.cloneNode(true));
        button.hidden = true; status.textContent = '';
      } catch (_) { button.disabled = false; status.textContent = '加载失败，请点击重试。'; }
    });
  });
})();
