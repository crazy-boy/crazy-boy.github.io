---
title: PHP中...的用法
tags: [PHP笔记]
categories: PHP
abbrlink: 'php-uncertain-params'
date: 2022-06-02 19:26:25
updated: 2022-06-02 19:26:25
---


- 如果...在函数的定义中，则表示传入多个参数(个数不定)将合并成一个数组(索引数组)
```php
    function sum(...$numbers){
        $sum = 0;
        foreach ($numbers as $number){
            $sum += $number;
        }
    
        return $sum;
    }
    
    echo sum(1,2,3,4,5);    //15
```
- 如果...在调用函数的语句中，则表示传入的数组(索引数组)将拆分成多个参数
```php
    function add($a, $b){
        return $a + $b;
    }
    
    $arr = [2,3];
    echo add(...$arr);      //5
    var_dump(add(...[1]));  //没有任何输出
    var_dump(add(...['a'=>1,'b'=>2]));  //没有任何输出
```