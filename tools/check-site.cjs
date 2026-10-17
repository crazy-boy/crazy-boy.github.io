'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..'),out=path.join(root,'public');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
let count=0,diagrams=0,math=0;
for(const file of walk(out).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');if(!html.includes('/css/site-ui.css'))continue;
 const $=cheerio.load(html);assert($('title').text().trim(),'Missing title: '+file);
 assert($('meta[name="description"]').attr('content')?.trim(),'Missing description: '+file);
 const canonical=$('link[rel="canonical"]').attr('href');assert(canonical?.startsWith('https://crazy-boy.com/'),'Invalid canonical: '+file);
 assert(!$('meta[name="viewport"]').attr('content').includes('user-scalable=no'),'Zoom disabled: '+file);
 assert(!html.includes('javascript(0)'),'Invalid link: '+file);assert(!html.includes('/medias/christmas-img/'),'Obsolete decoration: '+file);
 $('script[type="application/ld+json"]').each((i,e)=>{const json=JSON.parse($(e).html());assert(json.headline && json.datePublished && json.url===canonical,'Invalid article schema: '+file);});
 if($('pre.mermaid-source').length){diagrams++;assert($('script[src$="article-rendering.js"]').attr('data-diagrams')==='true','Missing diagrams loader: '+file);}
 if($('script[type^="math/tex"]').length){math++;assert($('script[src$="article-rendering.js"]').attr('data-math')==='true','Missing math loader: '+file);}
 $('a[href],script[src],link[href],img[src]').each((i,e)=>{const raw=$(e).attr('href')||$(e).attr('src');if(!raw||/^(#|mailto:|tel:|javascript:|data:)/.test(raw))return;
  if (/^https?:/.test(raw) && !raw.startsWith('https://crazy-boy.com/') && !raw.startsWith('http://crazy-boy.com/')) return;
  const url=new URL(raw,'https://crazy-boy.com/'+path.relative(out,file).replaceAll('\\','/'));if(url.origin!=='https://crazy-boy.com')return;
  let target=path.join(out,decodeURIComponent(url.pathname));if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  assert(fs.existsSync(target),'Broken link '+raw+' in '+path.relative(out,file));
 });count++;
}
for(const type of ['posts','books']){const records=JSON.parse(fs.readFileSync(path.join(out,'search',type+'.json'),'utf8'));assert(records.length>0,'Empty search: '+type);for(const item of records)assert(fs.existsSync(path.join(out,decodeURIComponent(item.url),'index.html'))||fs.existsSync(path.join(out,decodeURIComponent(item.url))),'Broken search record: '+item.url);}
const posts=JSON.parse(fs.readFileSync(path.join(root,'source/_data/reading_topics.json'),'utf8')).flatMap(t=>t.posts);for(const id of posts)assert(fs.existsSync(path.join(out,'posts',id+'.html')),'Broken curated article: '+id);
console.log('PASS: '+count+' themed pages, metadata, internal resources, search and topics; '+diagrams+' diagram pages, '+math+' formula pages.');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'source/_data/download_tools.json'),'utf8'));
for(const tool of catalog){
 const source=fs.readFileSync(path.join(root,'source',tool.download));const generated=fs.readFileSync(path.join(out,tool.download));
 assert(source.equals(generated),'Modified download: '+tool.id);assert.equal(source.length,tool.bytes,'Download size: '+tool.id);
 assert.equal(require('node:crypto').createHash('sha256').update(source).digest('hex'),tool.sha256,'Download checksum: '+tool.id);
 assert(fs.readFileSync(path.join(root,'source',tool.readme)).equals(fs.readFileSync(path.join(out,tool.readme))),'Modified README: '+tool.id);
}
console.log('PASS: download sizes, SHA-256 and original README copies.');
