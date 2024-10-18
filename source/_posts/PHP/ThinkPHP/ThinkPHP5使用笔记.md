---
title: ThinkPHP5使用笔记
tags: [ThinkPHP]
categories: [PHP]
abbrlink: 'thinkphp-note'
date: 2022-04-25 11:32:32
updated: 2022-04-25 11:32:32
---

### 1. 报错：Request.php中 variable type error: array
 - 描述：如果在post请求的时候，raw内容中某个参数的值为数组，直接使用$this->request->post('field');，会报错
![](/images/thinkphp_note_1.png)

 - 原因：TP5之后，默认的变量修饰符为/s，转为字符串了。
 - 解决办法：在变量名后加/a，转为数组：$this->request->post('field/a');
 
### 2. 回显处理
如果请求参数里有&等符号，在接收后会进行转义为&，要使用htmlspecialchars_decode回显