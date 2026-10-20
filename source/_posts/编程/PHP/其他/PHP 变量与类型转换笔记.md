---
title: PHP 变量与类型转换：中文变量、字符串与小数末尾的零
tags: [PHP笔记]
categories: [PHP]
abbrlink: php-variable-type-conversion
date: 2026-10-19 11:00:00
updated: 2026-10-19 11:00:00
---

写 PHP 时，一些很短的语句也值得留一份说明：变量能不能用中文，三种转字符串的方式有什么区别，以及怎样去掉小数末尾的零。它们都能快速写出来，但处理的数据不同，边界也不同。

<!-- more -->

## 一、PHP 可以使用中文变量名吗？

可以。例如将文件保存为 UTF-8：

```php
$动作 = ['石头', '剪刀', '布'];
echo $动作[0]; // 石头
```

字符串要使用英文半角引号，不能把排版用的 `“石头”`、`”剪刀”` 直接当成 PHP 字符串引号。

PHP 变量名以 `$` 开头。除字母、数字、下划线的常见规则外，PHP 也接受特定范围的高位字节，因此 UTF-8 编码的中文可以出现在变量名中。这不是说它会按完整的 Unicode 字符类别校验或自动规范化变量名。

测试可用与团队约定是两回事。个人示例用中文直观；协作项目则应遵守现有命名规范，考虑输入、搜索、编码和工具支持的一致性。变量名规则见 [PHP 变量基础](https://www.php.net/manual/en/language.variables.basics.php)。

## 二、将变量转换为字符串

常见写法有三种：

```php
$value = 123;

$first = (string) $value;
$second = $value . '';
$third = strval($value);

var_dump($first, $second, $third); // 都是 string(3) "123"
```

单独做类型转换时，我更倾向于 `(string) $value`，意图比较直接。`strval()` 是函数形式，拼接空字符串则是借助字符串拼接触发转换。

它们不是任意数据的通用序列化方案：

| 输入 | 常见转换结果或行为 |
| --- | --- |
| `true` | 字符串 `1` |
| `false`、`null` | 空字符串 |
| 数组 | 不能得到数组内容的可靠字符串表示，通常还会产生警告 |
| 对象 | 需要适当的字符串转换能力，例如 `__toString()` |

结构化数据要按用途选 JSON 等编码方式；调试对象和数组时可使用 `var_dump()`。相关规则见 [PHP 字符串类型](https://www.php.net/manual/en/language.types.string.php)。

## 三、去掉小数末尾的零

如果只是把输入转成普通浮点数，再按默认方式展示：

```php
var_dump(floatval('210.10')); // float(210.1)
var_dump(floatval('200.00')); // float(200)
```

`floatval()` 做的是数值转换，不是字符串裁剪。它会改变类型，长小数或大整数还可能丢失精度；无效输入也不能简单靠转换后的数值识别。因此它不适合当成所有金额字符串的去零工具。

如果要保留规范十进制字符串的精度，可以只处理小数部分：

```php
function trimDecimalZeros(string $value): string
{
    // 仅接受普通十进制字符串，不接受千位分隔符、空格或科学计数法。
    if (!preg_match('/^[+-]?\d+(?:\.\d+)?$/D', $value)) {
        throw new InvalidArgumentException('请输入普通十进制字符串');
    }

    if (strpos($value, '.') === false) {
        return $value;
    }

    return rtrim(rtrim($value, '0'), '.');
}

var_dump(trimDecimalZeros('210.10')); // string(5) "210.1"
var_dump(trimDecimalZeros('200.00')); // string(3) "200"
var_dump(trimDecimalZeros('200'));    // string(3) "200"，整数末尾的零保留
```

这个函数只调整文字，不计算数值，也不规范化正负零或前导零。需要固定两位小数时则应保留 `200.00`，不要去零。金额表示、舍入与格式化的区别见 [PHP 浮点数格式化与舍入](/posts/php-float-format-round.html)。
