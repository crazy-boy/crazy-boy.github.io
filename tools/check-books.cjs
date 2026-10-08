const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),catalog=require('../source/_data/book_catalog.json');
const output=process.env.HEXO_OUTPUT || path.join(root,'public');
const seen=new Set();let count=0;
for(const book of catalog){
 for(const [i,entry] of book.entries.entries()){
  assert(!seen.has(entry.url),'Duplicate route: '+entry.url);seen.add(entry.url);
  const html=fs.readFileSync(path.join(output,entry.url,'index.html'),'utf8');
  assert(html.includes('class="crypto-book"'),'Missing reader layout: '+entry.url);
  assert(html.includes(entry.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&#34;')) || html.includes(entry.title),'Missing title: '+entry.url);
  assert(html.includes('href="/books/"'),'Missing shelf link');
  if(i>0){
   if(i>1)assert(html.includes('rel="prev" href="'+book.entries[i-1].url+'"'),'Wrong previous chapter');
   if(i<book.entries.length-1)assert(html.includes('rel="next" href="'+book.entries[i+1].url+'"'),'Wrong next chapter');
   else assert(!html.includes('rel="next"'),'Last chapter must not have next');
  }
  for(const m of html.matchAll(/href="(\/books\/[^"#]*)"/g)){
   const target=path.join(output,decodeURIComponent(m[1]),'index.html');
   assert(fs.existsSync(target),'Broken book link: '+m[1]);
  }
  count++;
 }
}
const shelf=fs.readFileSync(path.join(output,'books/index.html'),'utf8');
assert(shelf.includes('我的作品')&&shelf.includes('博主的书单'),'Shelf must preserve both sections');
for(const book of catalog)assert(shelf.includes('href="'+book.url+'"'),'Missing shelf entry');
console.log('PASS: '+count+' unique book pages; directory links, sequential navigation and bookshelf.');
