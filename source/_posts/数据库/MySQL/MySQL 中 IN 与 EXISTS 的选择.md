---
title: MySQL 中 IN 与 EXISTS：语义、NULL 与执行计划
tags: [MySQL]
categories: [MySQL]
abbrlink: mysql-in-exists
date: 2026-10-20 09:00:00
updated: 2026-10-20 09:00:00
---

“子查询表大用 EXISTS，子查询表小用 IN”是一条常见口诀，但我不会直接把它当成 SQL 改写依据。选择之前，先确认查询要表达什么，尤其是有没有 `NULL`，再看具体版本和执行计划。

本文的优化器说明按 MySQL 8.4 文档核对；较早版本支持的转换和策略可能不同。

<!-- more -->

## 一、查询存在关系的两种写法

假设 `users.id` 是非空主键，`orders.user_id` 关联用户。查找有已支付订单的用户：

```sql
SELECT u.id
FROM users AS u
WHERE u.id IN (
    SELECT o.user_id FROM orders AS o WHERE o.status = 'paid'
);
```

也可以用相关子查询表达：

```sql
SELECT u.id
FROM users AS u
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.user_id = u.id AND o.status = 'paid'
);
```

`IN` 判断值是否属于结果集合，`EXISTS` 判断子查询是否存在记录。此处 `SELECT 1` 表达存在性即可，它不是“必然比 SELECT * 更快”的技巧。

MySQL 可能把符合条件的 `IN`、`EXISTS` 转换为半连接，或采用物化等执行策略。看到 SQL 里写了相关子查询，也不能就断言它一定会按文字顺序逐行执行。

## 二、NOT IN 与 NOT EXISTS 首先是语义问题

```sql
SELECT 2 NOT IN (1, NULL); -- NULL，表示 UNKNOWN，不是 TRUE
```

在 `WHERE` 中，UNKNOWN 不会保留该行。假如订单表里的 `user_id` 允许为空，下面的查询就可能不符合“没有订单的用户”这个意图：

```sql
SELECT u.id
FROM users AS u
WHERE u.id NOT IN (SELECT o.user_id FROM orders AS o);
```

表达“找不到匹配订单”时，可以写：

```sql
SELECT u.id
FROM users AS u
WHERE NOT EXISTS (
    SELECT 1 FROM orders AS o WHERE o.user_id = u.id
);
```

在外层 `u.id` 非空的前提下，也可以在 `NOT IN` 子查询中明确排除空值：

```sql
SELECT u.id
FROM users AS u
WHERE u.id NOT IN (
    SELECT o.user_id FROM orders AS o WHERE o.user_id IS NOT NULL
);
```

如果外层比较值本身也可能为 `NULL`，还要重新核对预期语义，不能只加一个内层 `IS NOT NULL` 就宣称所有情况等价。

## 三、不要凭表大小断言谁更快

`NOT IN` 不是必然让内外表全表扫描，`NOT EXISTS` 也不是必然使用索引或更快。优化器能否做半连接、反连接转换，受子查询结构、可空性、索引、统计信息及版本等条件影响。

对上面的查询，可以结合过滤条件考虑 `orders(user_id, status)` 等索引候选，再看实际扫描方式和数据分布，而不是先固定一条“最佳索引”规则。

```sql
EXPLAIN
SELECT u.id
FROM users AS u
WHERE EXISTS (
    SELECT 1 FROM orders AS o
    WHERE o.user_id = u.id AND o.status = 'paid'
);
```

核对访问方式、使用的索引、估计行数和过滤条件；对语义等价的候选方案，在代表性数据和相同环境下比较。MySQL 8.0.18 起的 `EXPLAIN ANALYZE` 会实际运行支持的查询，使用前要考虑执行成本，不要把它当作只读计划信息的静态打印。

参考：[MySQL 半连接与反连接优化](https://dev.mysql.com/doc/refman/8.4/en/semijoins-antijoins.html)、[子查询的 EXISTS 优化策略](https://dev.mysql.com/doc/refman/8.4/en/subquery-optimization-with-exists.html)。
