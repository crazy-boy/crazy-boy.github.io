---
title: Jquery笔记
tags:
  - Jquery
  - 笔记
  - 前端
categories: 前端
abbrlink: df9c1142
date: 2018-06-04 11:19:00
updated: 2018-06-04 11:43:00
---

1. jquery获取json的长度：

    1.1 一维：`var JsonTemp = {'id':5,'name':'lilei'};  length = JsonTemp.length;`
    
    1.2 二维：`var JsonTemp = {["name":"张三","age":18],["name":"李四","age":19]};  length = Object.keys(JsonTemp).length;`
