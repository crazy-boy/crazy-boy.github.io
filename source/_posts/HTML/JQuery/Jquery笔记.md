---
title: Jquery笔记
tags: [Jquery]
categories: 前端
abbrlink: 'jquery-note'
date: 2018-06-04 11:19:00
updated: 2018-06-04 11:43:00
---

### jquery获取json的长度

``` 
//一维：
var JsonTemp = {'id':5,'name':'lilei'};  
length = JsonTemp.length;

//二维：
var JsonTemp = [{"name":"张三","age":18},{"name":"李四","age":19}];  
length = Object.keys(JsonTemp).length;
```
