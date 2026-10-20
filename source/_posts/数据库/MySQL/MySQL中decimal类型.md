---
title: MySQL中decimal类型
tags: [MySQL]
categories: MySQL
abbrlink: 'mysql-decimal'
date: 2020-07-05 18:26:19
updated: 2026-10-20 09:00:00
---

工资、订单金额和税率等字段，如果要求按十进制精确保留数值，通常会考虑 `DECIMAL`。MySQL 中 `NUMERIC` 作为 `DECIMAL` 实现，可以按相同类型理解。

## 一、精度与小数位数

```sql
salary DECIMAL(9, 2)
```

`9` 是精度（precision），表示整数部分和小数部分合计的十进制数字位数；`2` 是标度（scale），表示小数点后的位数。符号和小数点不计入这 9 位。

因此整数部分最多 7 位，有符号值的范围为 `-9999999.99` 到 `9999999.99`。

```sql
amount DECIMAL(6, 2) -- 范围：-9999.99 到 9999.99
```

按 MySQL 8.4 的规则，精度最大 65，标度最大 30，且不能超过精度；省略标度时默认 0，连精度也省略时默认为 `DECIMAL(10,0)`。字段规格应按业务上限、币种和中间计算的需要确定，不必给所有金额都套同一组参数。

## 二、DECIMAL 不是直接按字符串存储

当前 MySQL 使用二进制格式编码 `DECIMAL` 的精确数值，并不是将文本 `123.45` 原样保存为字符串。驱动把查询结果返回为字符串，通常是应用接口为避免精度损失而做的选择，不能据此推断数据库的内部存储格式。

`FLOAT`、`DOUBLE` 的问题也不是“使用二进制存储”本身，而是二进制浮点表示无法精确表达许多有限十进制小数。`DECIMAL` 的数值编码和运算规则与它们不同。参考 [MySQL DECIMAL、NUMERIC 文档](https://dev.mysql.com/doc/refman/8.4/en/fixed-point-types.html)。

## 三、数据库类型正确，应用链路也要配合

PHP 中可以从规范的十进制字符串传入金额，由数据库驱动绑定参数，避免先转成 `float` 再写回。读出后如果仍要精确计算，也应使用 BCMath 等合适的计算方式。

```text
输入的十进制字符串 → 参数绑定 → DECIMAL 列
DECIMAL 查询结果 → 精确计算 → 按业务规则展示
```

超过字段小数位的输入可能发生舍入；超出范围的处理还与 SQL 模式等有关。字段类型不能替你决定税费、折扣和尾差如何处理，这些规则需要明确约定。

相关笔记：[PHP 浮点数格式化与舍入](/posts/php-float-format-round.html)、[PHP JSON 与浮点数精度](/posts/php-json-validation-precision.html)。
