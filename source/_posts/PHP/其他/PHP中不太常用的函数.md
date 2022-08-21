---
title: PHP中不太常用的函数
tags:
  - PHP
  - 函数
categories: PHP
abbrlink: '28294742'
date: 2022-05-08 16:28:55
updated: 2022-05-08 16:28:55
---

### 1. constant() 
   返回常量的值
``` bash
    define('DEV','test');
    
    var_dump(constant('DEV'));       //string(4) "test"     等同于var_dump(DEV);
    var_dump(constant('SORT_ASC'));  //int(4)    等同于var_dump(SORT_ASC);
    var_dump(constant(SORT_ASC));    //NULL
    var_dump(TEST);                  //string(4) "TEST"
``` 
   个人感觉作用不大，还不如直接使用常量呢，最多也就是判断常量是否被定义。