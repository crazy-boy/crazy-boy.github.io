---
title: PHP中isset与array_key_exists的性能对比
tags: [PHP笔记]
categories: [PHP]
abbrlink: 'php-isset-array_key_exists'
date: 2022-06-02 20:20:32
updated: 2022-06-02 20:20:32
---

<div class="note info">前言：在开发中，之前判断数组中的键是否存在，我一直使用isset；今天看到有同事大量使用array_key_exists，闲来没事就测试了一下它们的性能。</div>

```php
    $arr = ['id' => 3242, 'name' => 'test', 'age' => null];

    $time1 = microtime(true);
    for ($i = 0; $i < 100000000; $i++) {
        $tmp = isset($arr['age']);
    }
    
    echo microtime(true) - $time1;
    
    echo PHP_EOL;
    $time2 = microtime(true);
    for ($i = 0; $i < 100000000; $i++) {
        $tmp1 = array_key_exists('age', $arr);
    }
    
    echo microtime(true) - $time2;
```
上面的代码运行结果为：<code>
2.1061670780182
3.1671521663666
</code>

经测试：isset的效率要高于array_key_exists。

