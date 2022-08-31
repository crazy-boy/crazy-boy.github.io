---
title: PHP中define和const的区别
abbrlink: 'php-define-const'
tags:  [define与const]
categories:  PHP
date: 2022-07-05 00:34:14
---

<div class="note info">在PHP中，定义常量有两种方式： const、define；下面详细说下它们的区别：</div>


- 1、const是表达式赋值定义一个常量，而define是一个函数，它接受三个参数
- 2、const对定义的常量大小写敏感，而define可以通过函数的第三个参数来控制是否大小写敏感
- 3、const可以类中使用，define不能
- 4、const不能再条件语句中使用，而define可以
- 5、const在使用上比define要简单便捷，并且编译速度要比Define来得快

- 6、用法
define常放在文件的开头
```php
defined('ENV_PREFIX') or define('ENV_PREFIX', 'PHP_');
```
const一般放在类里：
```php
class A{
	const STATUS_NORMAL = 1;
	const STATUS_FILED = 2;
}
```