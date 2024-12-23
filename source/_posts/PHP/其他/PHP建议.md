---
title: PHP建议
tags: [PHP,tips]
categories: [PHP]
abbrlink: 'php-tips'
date: 2024-12-06 09:39:25
updated: 2024-12-06 09:39:25
---

### Tip 1：isset()
你是否知道可以向 isset() 函数传递多个参数？
```php
<?php

if(isset($var1) && isset($var2)) { ... }

// 等价于
if(isset($var1, $var2)) { ... }

```

### Tip 2：isset()失效的问题
当isset()用于判断数组中是否存在某个 key 时，它有一个重要的限制：**如果 key 存在但对应的值为 null，isset() 会返回 false**。
如果明确指定key的值可以为null，需要使用**array_key_exists()** 来判断数组中是否存在指定 key。
```php
<?php

$array = ['name' => null];
var_dump(isset($array['name']));				// false
var_dump(is_null($array['name']));				// true
var_dump(array_key_exists('name',$array));		// true
```