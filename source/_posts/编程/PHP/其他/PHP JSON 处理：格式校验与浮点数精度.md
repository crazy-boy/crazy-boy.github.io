---
title: PHP JSON 处理：格式校验、错误处理与浮点数精度
tags: [PHP笔记, JSON]
categories: [PHP]
abbrlink: php-json-validation-precision
date: 2026-10-19 10:00:00
updated: 2026-10-19 10:00:00
---

处理接口请求、读取 JSON 配置时，我们通常既要确认格式正确，也要确认解析出来的数据符合业务要求。另一个常见问题是，原本写着 `0.3` 的字段，经过 `json_encode()` 后出现了很长的小数尾巴。

这两个问题分别涉及解析错误判断和浮点数的序列化配置。下面把容易写错的判断方式、版本差异和处理方案放在一起记录。

<!-- more -->

## 一、不能用 json_decode() 的真假值判断格式

下面这种写法会误判，不建议使用：

```php
// 反例：合法 JSON 也可能被拒绝。
if (!json_decode($str, true)) {
    return '格式不正确';
}
```

解析结果为 `null` 也不一定是错误，因为 JSON 字面量 `null` 本身就是合法输入。其他合法值也可能在 PHP 条件判断中被视为假：

| 输入字符串的内容 | 解析结果（第二个参数为 true） | JSON 是否合法 |
| --- | --- | --- |
| `null` | `null` | 是 |
| `false` | `false` | 是 |
| `0` | `0` | 是 |
| `""` | 空字符串 | 是 |
| `"0"` | 字符串 `0` | 是 |
| `[]` | 空数组 | 是 |
| `{}` | 空数组 | 是 |
| 空白字符串 | `null` | 否 |
| `{"id":}` | `null` | 否 |

第二个参数为 `true` 时，JSON 对象会转成关联数组，所以空对象 `{}` 也会得到空数组。需要保留对象与数组的区别时，不要在这里直接转成关联数组。返回值规则见 [json_decode 官方文档](https://www.php.net/manual/en/function.json-decode.php)。

### 兼容写法：立即检查错误码

```php
function decodeJson(string $json)
{
    $data = json_decode($json, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new InvalidArgumentException(
            'JSON 格式不正确：' . json_last_error_msg()
        );
    }

    return $data;
}

var_dump(decodeJson('null')); // NULL，合法
var_dump(decodeJson('false')); // bool(false)，合法
var_dump(decodeJson('{"id":3}')); // 关联数组
```

`json_last_error()` 返回错误码，`json_last_error_msg()` 返回错误描述。它们反映的是最近一次相关的非异常 JSON 操作的状态，因此应在解析后立即读取，不要先执行另一个 `json_encode()` 或 `json_decode()`。错误信息接口 `json_last_error_msg()` 从 PHP 5.5 起提供；上面示例的参数类型写法需要 PHP 7.0 起。

### PHP 7.3 起：使用异常处理

```php
function decodeJsonOrThrow(string $json)
{
    return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
}

try {
    $data = decodeJsonOrThrow('{"id":}');
} catch (JsonException $exception) {
    echo 'JSON 解析失败：' . $exception->getMessage();
}
```

`JSON_THROW_ON_ERROR` 和 `JsonException` 从 PHP 7.3 起可用。在支持的项目里，我通常优先选择这种写法，把解析失败放进明确的异常分支。使用该标志时，应直接处理异常，不再依赖全局错误状态判断这次解析是否成功。

### PHP 8.3 起：只校验语法可以用 json_validate()

```php
// PHP 8.3+
$json = '{"id":3}';

if (!json_validate($json)) {
    throw new InvalidArgumentException(json_last_error_msg());
}
```

`json_validate()` 适合只需要确认语法、暂时不需要解析结果的场景。如果下一步本来就要 `json_decode()`，直接解析并处理异常即可，没必要先校验再解析两遍。版本和使用边界见 [json_validate 官方文档](https://www.php.net/manual/en/function.json-validate.php)。

## 二、格式正确，不代表数据结构正确

假设一个配置接口要求最外层必须是对象，那么 `null`、`123`、`[]` 虽然都是合法 JSON，也不符合接口约定。

```php
// PHP 7.3+
function decodeConfig(string $json): stdClass
{
    $data = json_decode($json, false, 512, JSON_THROW_ON_ERROR);

    if (!$data instanceof stdClass) {
        throw new InvalidArgumentException('配置必须是 JSON 对象');
    }

    return $data;
}

$config = decodeConfig('{"enabled":true}');
```

这里先保留对象类型，再判断顶层结构，能够区分 `{}` 和 `[]`。接下来还应按业务检查必填字段、类型与范围。不要把这些问题都归结为“JSON 格式错误”。

## 三、json_encode() 为什么会输出小数长尾？

```php
$arr = [
    'id' => 3,
    'rate' => 0.3,
];

echo json_encode($arr);
```

某些环境可能输出：

```json
{"id":3,"rate":0.29999999999999999}
```

`0.3` 无法被二进制浮点数精确保存，实际存储值与十进制 `0.3` 有微小差异。序列化时采用的精度配置，决定这些细节是否出现在输出中。

**PHP 7.1 不是必然出现精度问题。** 从 PHP 7.1 开始，`json_encode()` 改用 `serialize_precision`，其默认值也改为 `-1`。旧配置文件可能仍保留 `17`，升级后就容易看到这种长尾。

可以在 PHP 7.1 及以上环境复现两种配置的区别：

```php
$previous = ini_get('serialize_precision');
$arr = ['id' => 3, 'rate' => 0.3];

try {
    ini_set('serialize_precision', '17');
    echo json_encode($arr), PHP_EOL;

    ini_set('serialize_precision', '-1');
    echo json_encode($arr), PHP_EOL;
} finally {
    ini_set('serialize_precision', $previous);
}
```

典型输出：

```text
{"id":3,"rate":0.29999999999999999}
{"id":3,"rate":0.3}
```

`-1` 会选择能够恢复该浮点值的简短十进制表示，通常能避免无意义的长尾；它没有改变浮点数内部的值，也不能保证任意计算结果都按业务预期显示。例如先进行浮点运算得到的误差，仍可能体现在 JSON 中。历史变化见 [PHP 精确浮点数 RFC](https://wiki.php.net/rfc/precise_float_value)。

## 四、查看与调整精度配置

先在实际处理请求的环境中查看配置：

```php
var_dump(PHP_VERSION);
var_dump(php_ini_loaded_file());
var_dump(ini_get('precision'));
var_dump(ini_get('serialize_precision'));
```

常见默认配置为：

```ini
precision = 14
serialize_precision = -1
```

`precision` 影响普通浮点数转换为文字时的有效位数；`serialize_precision` 影响 `json_encode()`、`serialize()` 等操作。它们都不是“保留几位小数”的业务配置，也不会提高底层浮点运算的精度。配置含义见 [PHP 核心配置说明](https://www.php.net/manual/en/ini.core.php)。

### 修改 php.ini

确认 PHP 7.1 及以上项目需要统一使用该行为后，可以在实际加载的配置文件中设置：

```ini
serialize_precision = -1
```

保存后，根据运行方式重新加载或重启 PHP-FPM、Apache 等服务。CLI 每次启动会重新读取配置，但 CLI 和 PHP-FPM 可能加载不同的 `php.ini`，不能只看命令行结果就认定网页接口也已生效。

### 运行时设置

```php
// PHP 7.3+：此处同时使用了 JSON_THROW_ON_ERROR。
ini_set('serialize_precision', '-1');

$arr = ['id' => 3, 'rate' => 0.3];
echo json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
```

如果只是设置 `serialize_precision = -1`，PHP 7.1 起即可使用；包含 `JSON_THROW_ON_ERROR` 的完整示例则需要 PHP 7.3 起。排查 JSON 长尾不需要顺带修改 `precision`，应根据项目实际要求调整。

运行时配置影响当前执行环境。传统 Web 请求结束后通常会恢复；常驻 worker、队列进程中，改动可能影响后续任务，临时调整应恢复原值。

## 五、精确小数应从输入阶段保留

税率、金额等数据如果要求精确十进制表示，可以由接口约定使用字符串：

```php
// PHP 7.3+
$arr = ['id' => 3, 'rate' => '0.3'];
echo json_encode($arr, JSON_THROW_ON_ERROR);
```

输出：

```json
{"id":3,"rate":"0.3"}
```

此时 `rate` 是 JSON 字符串，接收方必须配合这个约定，不能悄悄改变接口字段类型。把已经计算过的浮点数强制转为字符串，不能保证找回之前丢失的精度。

金额计算还可以采用整数最小货币单位、BCMath 或明确支持十进制计算的类型。保存方式、舍入时机和输出格式需要一起设计，详见 [PHP 浮点数格式化与舍入](/posts/php-float-format-round.html)。

## 六、不要混淆 encode 和 decode 的第二个参数

```php
// 反例：第二个参数要求整数位掩码。
json_encode($arr, true);
```

在允许标量类型转换的调用中，`true` 可能被转换成整数 `1`，这个值对应 `JSON_HEX_TAG`，并不表示“返回关联数组”；严格类型等环境下还可能直接产生类型错误。

应当省略参数，或者明确写出 JSON 标志：

```php
// PHP 7.3+
echo json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
```

`json_decode()` 的第二个参数才用于控制 JSON 对象转换成关联数组还是对象：

```php
$data = json_decode('{"id":3}', true);
```

编码标志和失败行为见 [json_encode 官方文档](https://www.php.net/manual/en/function.json-encode.php)。平时审查接口代码时，我会先看错误有没有明确处理，再检查字段类型，最后核对精度和输出选项。
