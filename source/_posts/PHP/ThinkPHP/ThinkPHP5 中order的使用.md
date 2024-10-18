---
title: ThinkPHP5 中order的使用
tags: [ThinkPHP]
categories: [PHP]
abbrlink: 'thinkphp-order'
date: 2022-05-06 20:49:19
updated: 2022-05-06 20:49:19
---
之前一直在使用Yii2，在查询排序时习惯了使用 SORT_DESC | SORT_ASC，今天在使用的时候发现了问题，记录一下。
下面这个查询没有得到预期的结果：
``` 
    $list = Db::name('tb')->where(['status'=>1])->order(['create_time'=>SORT_DESC])->field('id,name')->select();
   // 输出sql为：select id,name from tb where status=1 order by create_time;
``` 

问题在于SORT_DESC=3、SORT_ASC=4，这不符合thinkphp中order方法的传参规则，
可以这样使用：

``` 
   order('id','desc')
   order('id desc')
   order(['id'=>'desc','create_time'=>'asc'])
   order('id,create_time desc')
``` 
