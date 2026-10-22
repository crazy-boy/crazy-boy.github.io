---
title: "PHP 运算符：逻辑优先级、?? 与 ?: 的区别"
tags: [PHP笔记]
categories: [PHP]
abbrlink: php-operators-default-values
date: 2026-10-22 09:00:00
updated: 2026-10-22 09:00:00
---

权限判断、配置读取和表单默认值里，常会混用几个很短的运算符。代码能够运行，不代表组合后的含义就是原先想的那样。这篇记录逻辑优先级，以及“没有值”和“值被判断为假”之间的区别。

<!-- more -->

## 一、&& 的优先级高于 ||

```php
$a = true;
$b = false;
$c = false;

var_dump($a || $b && $c);   // bool(true)
var_dump($a || ($b && $c)); // bool(true)，按优先级展开
var_dump(($a || $b) && $c); // bool(false)，改变了组合关系
```

`$a || $b && $c` 等价于 `$a || ($b && $c)`，不等价于 `($a || $b) && $c`。

混用时，建议按业务要求明确加括号。例如“管理员，或者同时具备编辑权限且属于当前项目”，和“管理员或编辑者，还必须属于当前项目”是不同条件。括号是把意图写出来，不是随便加在哪都能消除问题。

`&&`、`||` 还会短路：前面的结果已经足以决定真假时，后面的表达式不会执行。不要依赖被跳过的表达式完成必要的赋值、日志或其他操作。规则见 [PHP 运算符优先级](https://www.php.net/manual/en/language.operators.precedence.php)。

## 二、&&、|| 与 and、or 的赋值陷阱

相关运算符的优先级可以记成下面这个局部顺序（从高到低，省略其他运算符）：

```text
&& → || → = → and → or
```

```php
$result = true && false;
var_dump($result); // bool(false)

$result = true and false;
var_dump($result); // bool(true)
```

第一句相当于 `$result = (true && false)`；第二句相当于 `($result = true) and false`。后一句整个逻辑表达式为假，但赋给 `$result` 的仍是真。

`or` 也有相同的赋值边界问题：

```php
$result = false || true;
var_dump($result); // bool(true)

$result = false or true;
var_dump($result); // bool(false)
```

需要把逻辑运算结果保存下来时，使用明确的括号和统一的团队风格，避免仅因单词与符号看起来意思相似就直接替换。

## 三、??：不存在或为 null 时使用默认值

空合并运算符 `??` 从 PHP 7.0 起可用。对于普通变量：

```php
$value = [];
var_dump($value ?? 0); // array(0) {}
```

`$value ?? 0` 可以理解为 `isset($value) ? $value : 0`。空数组确实存在，而且不是 `null`，因此不会回退到 `0`。

```php
$config = ['limit' => null, 'enabled' => false];

var_dump($config['limit'] ?? 20);      // int(20)
var_dump($config['enabled'] ?? true);  // bool(false)
var_dump($config['missing'] ?? '默认'); // string(6) "默认"，UTF-8 下
```

它适合“缺失或为空才用默认值”的读取场景，能处理不存在的变量或数组键而不产生该未定义项的警告。但它不会替你验证已有值的类型、范围，也不能自动吞掉表达式中其他调用的异常。

## 四、?:：值转换为布尔后为假时使用默认值

```php
$value = [];
var_dump($value ?: 0); // int(0)
```

对于普通变量，`$value ?: 0` 可以理解为 `$value ? $value : 0`。对于有副作用的表达式，短三元形式不会像手工重复表达式那样求值两遍。

| 已定义的值 | `$value ?? '默认'` | `$value ?: '默认'` |
| --- | --- | --- |
| `null` | 默认值 | 默认值 |
| `false` | `false` | 默认值 |
| `0`、`0.0` | 原值 | 默认值 |
| `''`、`'0'` | 原值 | 默认值 |
| `[]` | 空数组 | 默认值 |
| `'hello'` | 原字符串 | 原字符串 |

`?:` 会直接读取条件中的值，不能像 `??` 一样安全处理未定义变量或不存在的数组键。PHP 8 中直接读取这些未定义项通常会产生警告；旧版本的诊断级别可能不同。语义见 [PHP 比较运算符文档](https://www.php.net/manual/en/language.operators.comparison.php)。

## 五、按业务决定默认值

例如“重试次数允许为 0，表示不重试”，应保留有效的零值：

```php
$options = ['retry_count' => 0];

$retryCount = $options['retry_count'] ?? 3;
var_dump($retryCount); // int(0)
```

如果需求是“已定义的昵称为空字符串时展示访客”，则可以按对应的数据约定使用 `?:`，或明确检查空字符串。不要只因为表达式更短，就把 `false`、零、空字符串与缺失值全部合并成一种状态。

相关笔记：[PHP 变量与类型转换](/posts/php-variable-type-conversion.html)、[PHP 位运算与权限标记](/posts/php-bitwise-permission-flags.html)。
