'use strict';
const fs=require('node:fs'),path=require('node:path');
hexo.extend.generator.register('article-vendors', function () {
 const assets=[];
 function include(dir,prefix,select){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const file=path.join(dir,entry.name),target=prefix+'/'+entry.name;
   if(entry.isDirectory())include(file,target,select);
   else if(select(entry.name))assets.push({path:target,data:()=>fs.createReadStream(file)});
  }
 }
 const modules=path.join(hexo.base_dir,'node_modules');
 assets.push({path:'vendor/mermaid/mermaid.esm.min.mjs',data:()=>fs.createReadStream(path.join(modules,'mermaid/dist/mermaid.esm.min.mjs'))});
 include(path.join(modules,'mermaid/dist/chunks/mermaid.esm.min'),'vendor/mermaid/chunks/mermaid.esm.min',name=>name.endsWith('.mjs'));
 assets.push({path:'vendor/mathjax/tex-svg.js',data:()=>fs.createReadStream(path.join(modules,'mathjax/es5/tex-svg.js'))});
 for(const dir of ['input/tex/extensions','a11y','ui'])include(path.join(modules,'mathjax/es5',dir),'vendor/mathjax/'+dir,name=>name.endsWith('.js'));
 for(const name of ['mermaid','mathjax'])assets.push({path:'vendor/'+name+'/LICENSE',data:()=>fs.createReadStream(path.join(modules,name,'LICENSE'))});
 return assets;
});
