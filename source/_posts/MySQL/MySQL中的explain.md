---
title: MySQL中的explain
tags:
  - MySQL
categories: MySQL
abbrlink: 'mysql-explain1'
date: 2020-06-12 08:25:40
updated: 2020-06-12 08:25:40
---

#### 用法
  只需要在查询的 SQL 前面添加上 explain 关键字即可。
![](/images/mysql_explain_1.png)

#### 结果列说明
- id — 选择标识符，id 越大优先级越高，越先被执行；
- select_type — 表示查询的类型；
- table — 输出结果集的表；
- partitions — 匹配的分区；
- type — 表示表的连接类型；
    type 值有如下类型
    - all — 扫描全表数据；
    - index — 遍历索引；
    - range — 索引范围查找；
    - index_subquery — 在子查询中使用 ref；
    - unique_subquery — 在子查询中使用 eq_ref；
    - ref_or_null — 对 null 进行索引的优化的 ref；
    - fulltext — 使用全文索引；
    - ref — 使用非唯一索引查找数据；
    - eq_ref — 在 join 查询中使用主键或唯一索引关联；
    - const — 将一个主键放置到 where 后面作为条件查询， MySQL 优化器就能把这次查询优化转化为一个常量，如何转化以及何时转化，这个取决于优化器，这个比 eq_ref 效率高一点。
- possible_keys — 表示查询时，可能使用的索引；
- key — 表示实际使用的索引；
    如果这一列为 NULL 则表示未使用索引，反之则使用了索引。
- key_len — 索引字段的长度；
- ref—  列与索引的比较；
- rows — 大概估算的行数；
- filtered — 按表条件过滤的行百分比；
- Extra — 执行情况的描述和说明。
