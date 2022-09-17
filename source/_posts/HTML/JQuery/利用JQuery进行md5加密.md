---
title: 利用JQuery进行md5加密
tags: [Jquery]
categories: 前端
abbrlink: 'jquery-md5'
date: 2016-07-02 11:12:00
updated: 2016-07-02 11:12:00
---

在开发中，有时候需要前端将数据加密后传给后端，下面介绍下jquery md5加密：

先引入[md5.min.js](/codes/md5.min.js)，再调用，代码如下：
```
<script src="md5.min.js"></script>
<script>
	var str = document.getElementById('input').value;
    console.log(md5(str));
</script>
```
