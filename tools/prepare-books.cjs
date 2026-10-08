// Shared catalog builder: npm run books. Only frontmatter is updated; bodies are preserved.
const fs=require('node:fs'),path=require('node:path'),fm=require('hexo-front-matter');
const root=path.resolve(__dirname,'..'), books=JSON.parse(fs.readFileSync(path.join(root,'books.json'),'utf8'));
const ids=new Set(),writes=[];
const catalog=books.map(book=>{
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.id)||ids.has(book.id))throw Error('Invalid/duplicate book id: '+book.id);
 ids.add(book.id);
 const dir=path.resolve(root,book.source),rel=path.relative(path.join(root,'source'),dir);
 if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Book sources must be within source/');
 const slugs=new Set(),orders=new Set();
 const entries=fs.readdirSync(dir,{recursive:true}).filter(f=>f.endsWith('.md')).map(file=>{
  const full=path.join(dir,file),text=fs.readFileSync(full,'utf8'),data=fm.parse(text.replace(/\r\n/g, '\n')),id=String(data.abbrlink||'');
  if(data.book!==book.id||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||slugs.has(id))throw Error('Invalid/duplicate abbrlink or book: '+file);
  if(!Number.isFinite(data.book_order)||data.book_order<0||orders.has(data.book_order))throw Error('Invalid/duplicate book_order: '+file);
  if(!['home','part','chapter','section'].includes(data.book_kind))throw Error('Invalid book_kind: '+file);
  if(!data.title||(data.book_order===0)!==(data.book_kind==='home'))throw Error('Invalid title/home: '+file);
  slugs.add(id);orders.add(data.book_order);
  const url='/books/'+book.id+'/'+(data.book_order===0?'':id+'/');
  const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if(!match)throw Error('Missing frontmatter: '+file);
  const head=match[1].replace(/^(permalink|layout|book_id):[^\r\n]*(?:\r?\n|$)/gm,'').trimEnd();
  const updated='---\n'+head+'\npermalink: '+url.slice(1)+'index.html\nlayout: book-reader\nbook_id: '+id+'\n---'+text.slice(match[0].length);
  if(updated!==text)writes.push([full,updated]);
  return {id,title:String(data.title),url,order:data.book_order,kind:data.book_kind};
 }).sort((a,b)=>a.order-b.order);
 if(entries.length<2||entries[0].order!==0)throw Error('Book needs home and chapters: '+book.id);
 return {...book,url:'/books/'+book.id+'/',entries};
});
for(const [file,content] of writes)fs.writeFileSync(file,content);
const out=path.join(root,'source/_data/book_catalog.json'),content=JSON.stringify(catalog,null,2)+'\n';
fs.mkdirSync(path.dirname(out),{recursive:true});
if(!fs.existsSync(out)||fs.readFileSync(out,'utf8')!==content)fs.writeFileSync(out,content);
console.log('Prepared '+catalog.length+' book(s), '+catalog.reduce((n,b)=>n+b.entries.length,0)+' unique pages.');
