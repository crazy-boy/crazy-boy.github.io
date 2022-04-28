---
title: SEO——权重转移
tags:
  - SEO
  - 权重转移
categories: SEO
abbrlink: 16774
date: 2018-06-09 23:38:26
updated: 2018-06-09 23:38:32
---
** 产品列表存在多页，或者文章内容过多存在多页时，为了SEO考虑，避免权重流失，内容重复，可以通过下面的方法优化：**
``` html
<link rel="canonical" href="主页url"/>
```
Google 等搜索引擎最终都会只收录 canonical 标签指定的这个网址，搜索引擎会将其它页面作为重复内容，这些重复的内容不再参与页面的权重分配(如 Google 的 PR 值)。
<!-- more -->
如：
https://s.1688.com/selloffer/-C6B7C5C6CDAFD0AC.html?beginPage=1
https://s.1688.com/selloffer/-C6B7C5C6CDAFD0AC.html?beginPage=2
https://s.1688.com/selloffer/-C6B7C5C6CDAFD0AC.html?beginPage=3
https://s.1688.com/selloffer/-C6B7C5C6CDAFD0AC.html?beginPage=4
……
https://s.1688.com/selloffer/-C6B7C5C6CDAFD0AC.html?beginPage=45

就可以在每个页面的head标签内添加代码：
<link rel="canonical" href="https://s.1688.com/selloffer/-C6B7C5C6CDAFD0AC.html"/>

