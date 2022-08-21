---
title: PHP中，通过&改变变量的值，效率如何
tags:
  - PHP笔记
categories: PHP
abbrlink: 'php-assignment'
date: 2022-06-02 20:46:42
updated: 2022-06-02 20:46:42
---


在PHP中，通过&改变变量的值，效率如何呢，下面来测试一下。

```php
$arr = ['id' => null, 'name' => 'test', 'age' => null];

$time1 = microtime(true);
$tmp = &$arr;
for ($i = 0; $i < 100000000; $i++) {
    $tmp['id'] = $i;
}
print_r($arr); 
echo PHP_EOL;
echo microtime(true) - $time1;

echo PHP_EOL;
$time2 = microtime(true);
$tmp1 = null;
for ($i = 0; $i < 100000000; $i++) {
    $tmp1 = $i;
}
$tmp['id'] = $tmp1;
print_r($arr);
echo PHP_EOL;
echo microtime(true) - $time2;

```
输出结果为：<code>
Array ( [id] => 99999999 [name] => test [age] => )
2.0506858825684
Array ( [id] => 99999999 [name] => test [age] => )
1.1653530597687
</code>

不难看出，两次的处理结果是一样的，但通过&多次改变值，效率较低。