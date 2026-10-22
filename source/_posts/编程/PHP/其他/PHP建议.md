---
title: PHP建议
tags: [PHP,tips]
categories: [PHP]
abbrlink: 'php-tips'
date: 2024-12-06 09:39:25
updated: 2026-10-22 09:00:00
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

### 标记弃用方法：@deprecated

如果一个方法不再建议使用，可以在 PHPDoc 中标记弃用，同时说明替代方法和起始版本：

```php
class ReportService
{
    /**
     * @deprecated 2.0.0 请改用 generate()，此入口计划在后续主版本移除。
     * @see generate()
     */
    public function createReport(): string
    {
        return $this->generate();
    }

    public function generate(): string
    {
        return 'report';
    }
}
```

它主要供 IDE、文档生成器和分析工具识别。注释本身不会阻止调用，也不会自动在运行时触发弃用通知。弃用通常表示进入迁移期，不等于已经删除接口；真正移除前应检查调用方并提供迁移说明。

这里 `2.0.0` 表示项目版本，不是 PHP 版本。参考 [phpDocumentor 的 @deprecated 说明](https://docs.phpdoc.org/guide/references/phpdoc/tags/deprecated.html)。
