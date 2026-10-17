'use strict';
const cheerio = require('cheerio');
const { escapeHTML } = require('hexo-util');
const plainText = (html, includeCode = false) => {
  const $ = cheerio.load(html || '', {decodeEntities: true});
  $('script,style,.headerlink,td.gutter').remove();
  if (!includeCode) $('pre,figure.highlight').remove();
  $('br').replaceWith(' '); $('p,li,h1,h2,h3,h4,h5,h6,pre').append(' ');
  return $.root().text().replace(/\s+/g, ' ').trim();
};
hexo.extend.helper.register('site_summary', function (page, limit = 160) {
  return plainText(page.summary || page.description || page.content || '').slice(0, limit);
});
hexo.extend.helper.register('related_posts', function (current, limit = 4) {
  const names = items => new Set(items ? items.toArray().map(item => item.name.toLowerCase()) : []);
  const tags = names(current.tags), categories = names(current.categories);
  return this.site.posts.toArray().filter(post => post._id !== current._id && !post.book).map(post => {
    const score = [...names(post.tags)].filter(name => tags.has(name)).length * 3 + [...names(post.categories)].filter(name => categories.has(name)).length;
    return {post, score};
  }).filter(item => item.score > 0).sort((a,b) => b.score-a.score || b.post.date-a.post.date || a.post.title.localeCompare(b.post.title)).slice(0,limit).map(item=>item.post);
});
// Preserve diagram text before Hexo turns unknown languages into plaintext highlights.
hexo.extend.filter.register('before_post_render', function (data) {
  data.content = data.content.replace(/^[ \t]{0,3}(`{3,}|~{3,})mermaid[^\S\r\n]*\r?\n([\s\S]*?)\r?\n[ \t]{0,3}\1[ \t]*(?=\r?\n|$)/gm, (_, fence, source) =>
    '<pre class="mermaid-source"><code>' + escapeHTML(source).replace(/{/g, '&#123;').replace(/}/g, '&#125;') + '</code></pre>\n');
  return data;
}, 1);
hexo.extend.filter.register('after_render:html', function (html) {
  let image = 0;
  return html.replace(/<script\b[\s\S]*?<\/script>|<img\b[^>]*>/gi, tag => {
    if (/^<script/i.test(tag)) return tag;
    image++;
    if (!/\bloading\s*=/.test(tag) && image > 3) tag=tag.replace(/\s*\/?>(?![\s\S])/, ' loading="lazy">');
    if (!/\bdecoding\s*=/.test(tag)) tag=tag.replace(/\s*\/?>(?![\s\S])/, ' decoding="async">');
    return tag;
  });
});
hexo.extend.generator.register('compact-search', function (locals) {
  const record = (item,type) => ({title:item.title,url:hexo.config.root+item.path.replace(/^\//,''),type,content:plainText(item.content, true)});
  const posts=locals.posts.toArray().filter(p=>!p.book).map(p=>record(p,'post'));
  const pages=locals.pages.toArray().filter(p=>p.book).map(p=>record(p,'book'));
  return [{path:'search/posts.json',data:JSON.stringify(posts)},{path:'search/books.json',data:JSON.stringify(pages)}];
});
