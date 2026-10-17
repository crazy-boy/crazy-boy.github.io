'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),fm=require('hexo-front-matter'),moment=require('moment');
const root=path.resolve(__dirname,'..');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const routes=new Set();let count=0;
for(const file of walk(path.join(root,'source/_posts')).filter(file=>file.endsWith('.md'))){
 const data=fm.parse(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'));
 for(const key of ['date','updated'])if(data[key]){
  const valid=data[key] instanceof Date ? Number.isFinite(data[key].valueOf()) : typeof data[key]==='string' && moment(data[key],['YYYY-MM-DD HH:mm:ss','YYYY-MM-DD'],true).isValid();
  assert(valid,'Invalid '+key+': '+file);
 }
 assert(data.title,'Missing title: '+file);assert(data.abbrlink!==undefined,'Missing abbrlink: '+file);
 const route=String(data.abbrlink).toLowerCase();assert(!routes.has(route),'Duplicate abbrlink: '+route);routes.add(route);count++;
}
console.log('PASS: '+count+' article titles, dates and unique abbrlinks.');
