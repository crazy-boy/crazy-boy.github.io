const host = document.getElementById('site-comments');
if (host) {
  const status = document.getElementById('comments-status'), retry = document.getElementById('comments-retry');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.protocol === 'file:';
  let production = false, server;
  try { production = location.origin === new URL(host.dataset.siteUrl).origin; } catch (_) {}
  try { if (host.dataset.serverUrl) server = new URL(host.dataset.serverUrl); } catch (_) {}
  if (local || !production) {
    status.textContent = '预览模式：留言提交已关闭，避免将测试内容发布到线上。';
  } else if (!server || server.protocol !== 'https:') {
    status.textContent = '留言功能正在准备中，请稍后再来。';
  } else {
    async function start() {
      retry.hidden = true; status.textContent = '正在加载留言区…';
      try {
        await new Promise((resolve,reject) => {
          if (document.getElementById('waline-style')) { resolve(); return; }
          const css = document.createElement('link'); css.id = 'waline-style'; css.rel = 'stylesheet';
          css.href = 'https://unpkg.com/@waline/client@3.1.3/dist/waline.css';
          css.onload = resolve; css.onerror = () => { css.remove(); reject(new Error('style')); };
          document.head.append(css);
        });
        const { init } = await import('https://unpkg.com/@waline/client@3.1.3/dist/waline.js');
        init({el:'#waline', serverURL:server.href.replace(/\/$/,''), path:location.pathname.replace(/\/$/,'') || '/', lang:'zh-CN', dark:'body.dark',
          login:'disable', meta:[], requiredMeta:[], emoji:false, imageUploader:false, search:false, reaction:false,
          pageview:false, comment:false, highlighter:false, texRenderer:false,
          locale:{placeholder:'写下你的留言…'}, pageSize:10});
        status.hidden = true;
      } catch (_) { status.hidden = false; status.textContent = '留言区加载失败，请稍后重试。'; retry.hidden = false; }
    }
    retry.addEventListener('click',start);
    start();
  }
}
