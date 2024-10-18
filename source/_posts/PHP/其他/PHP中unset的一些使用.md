---
title: PHP中unset的一些使用
tags: [PHP笔记]
categories: [PHP]
abbrlink: 'php-unset'
date: 2022-06-02 20:51:22
updated: 2022-06-02 20:51:22
---

<div class="note info">前言：在PHP开发中，经常使用到unset来释放掉给定的变量；但有时候会有些问题，本文记录下。</div>

- 如果需要去掉数组中的某些key，直接unset即可
```php
    $arr = ['id' => 5, 'name' => '张三', 'status' => 1];
    unset($arr['status']);
    print_r($arr);      // Array ( [id] => 5 [name] => 张三 )
```

- 也可以去掉二位数组中指定的key
```php
    $list = [
        ['id' => 1, 'name' => '张三', 'status' => 1],
        ['id' => 2, 'name' => '李四', 'status' => 0],
        ['id' => 3, 'name' => '王五', 'status' => 1],
    ];
    array_walk($list, function (&$item) {
        unset($item['status']);
    });
    
    print_r($list);
    // output:  Array ( [0] => Array ( [id] => 1 [name] => 张三 ) [1] => Array ( [id] => 2 [name] => 李四 ) [2] => Array ( [id] => 3 [name] => 王五 ) )
```

- 下面试下去掉一维数组中的空值
```php
    $data = ['test', 'haha', '', 'hello', null, 'good'];
    array_walk($data, function (&$item) {
        if (!$item) unset($item);
    });
    print_r($data);
    // output: Array ( [0] => test [1] => haha [2] => [3] => hello [4] => [5] => good )
```

- 上面的代码没有达到预期的效果，那我们修改下试试
```php
    $data = ['test', 'haha', '', 'hello', null, 'good', ''];
    array_walk($data, function ($item, $key) use (&$data) {
        if (!$item) unset($data[$key]);
    });
    print_r($data);
    // output: Array ( [0] => test [1] => haha [3] => hello [5] => good )
```

- 虽然达到了预期，但PHP给我们提供了更优雅的解决办法
```php
    $data = ['test', 'haha', '', 'hello', null, 'good', ''];
    print_r(array_filter($data));
    // output: Array ( [0] => test [1] => haha [3] => hello [5] => good )
```