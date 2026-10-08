// Count once per generation, including books now stored as pages.
let cached;
hexo.extend.filter.register('before_generate', () => { cached = undefined; });
hexo.extend.helper.register('cached_totalcount', function (site) {
  if (cached === undefined) {
    const posts = site.posts.toArray();
    site.pages.forEach(page => { if (page.book && page.book_order > 0) posts.push(page); });
    cached = hexo.extend.helper.get('totalcount').call(this, { posts });
  }
  return cached;
});
