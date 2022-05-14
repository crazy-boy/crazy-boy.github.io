---
title: ThinkPHP5框架where条件中含有or的使用方法
tags:
  - PHP
  - ThinkPHP
  - 数据库查询
categories: PHP
abbrlink: 521b47c8
date: 2022-05-08 17:07:22
updated: 2022-05-08 17:07:22
---

### 1. 直接whereOr
``` php
    $list = Db::name('tb')->where(['status'=>1,'admin_id'=>5])->whereOr(['type'=>1,'step'=>2])->select();
    // 生成的sql为：select * from `tb` where `status`=1 and `admin_id`=5 or (`type`=1 or `step`=2);
``` 

### 2. 采用闭包的方式
``` php
    $map = ['status'=>1,'admin_id'=>5];
    $orMap = ['type'=>1,'step'=>2];
    $list = Db::name('tb')->where(function ($query) use ($map) {
        $query->where($map);
    })->whereOr(function ($query) use ($orMap) {
        $query->where($orMap);
    })->order('id desc')->select();
    // 生成的sql为：select * from `tb` where (`status`=1 and `admin_id`=5) or (`type`=1 and `step`=2);
``` 
一般来说，在复杂的查询里，我们更多的是使用第二种方式。