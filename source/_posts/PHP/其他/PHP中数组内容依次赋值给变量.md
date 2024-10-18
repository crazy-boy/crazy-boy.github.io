---
title: PHP中数组内容依次赋值给变量
tags: [PHP]
categories: [PHP]
abbrlink: 'php-assign-array-values'
date: 2022-05-08 16:59:22
updated: 2022-05-08 16:59:22
---

在日常开发过程中，经常需要把数组中的内容依次赋值给变量，可以使用list、[]、extract来处理。

### 1. list($var1,$var2...) = $arr;
   或者[$var1,$var2...] = $arr;
   将数组中的值赋给一些变量
   该函数只能用于索引数组，且数字索引从0开始。
   如果对应的数字下标，则该变量赋值为null

``` 
<?php
list($a, $b, $c) = ['Jone', 'Jam', 'Kav'];
var_dump($a, $b, $c);       //output：string(4) "Jone" string(3) "Jam" string(3) "Kav"

list($a, $b) = ['Jone', 'Jam', 'Kav'];
var_dump($a, $b);           //output：string(4) "Jone" string(3) "Jam"

list($a, $b, $c) = [2 => 'Jone', 3 => 'Jam', 4 => 'Kav'];
var_dump($a, $b, $c);       //output：NULL NULL string(4) "Jone"

list($a, $b, $c) = ['id' => 4, 2 => 'Jam', 'name' => 'Kav'];
var_dump($a, $b, $c);       //output：NULL NULL string(3) "Jam"
``` 
   list()如果需要跳过某些值
```
$info = ['coffee', 'brown', 'caffeine'];
[,$a,] = $info;
var_dump($a);	// string(5) "brown"
```

### 2. extract(array,extract_rules,prefix);
   从数组中将变量导入到当前的符号表
   该函数使用数组键名作为变量名，使用数组键值作为变量值，进行依次赋值
``` 
extract(['id' => 3, 'name' => 'Hoj']);
/**
 * 在IDE中会提示错误，加上注释即可
 * @var $id
 * @var $name
 */
var_dump($id, $name);       //output：int(3) string(3) "Hoj"

extract([3, 'name' => 'Hoj']);
var_dump($name);            //output：string(3) "Hoj"
``` 
总结：一般索引数组用list，关联数组用extract。