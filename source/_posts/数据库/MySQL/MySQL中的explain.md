---
title: MySQL中的explain
tags: [MySQL]
categories: MySQL
abbrlink: 'mysql-explain1'
date: 2020-06-12 08:25:40
updated: 2020-06-12 08:25:40
---

当我们在执行sql时，一般都会使用explain来分析sql的效率情况。
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
    - all — 全表扫描，在数据量大时效率极低；
    - index — 遍历索引，全索引排序；根据extra的内容分以下几种情况：
        Using Index：覆盖索引，即**只需要**通过索引就可以返回查询所需要的数据
        Using Where：查询列未用到索引
        Using Index  Using Where：其中的查询列是索引，但是并不是前导列，因此其实是没法用到这个索引的
        Null：查询列有些不是索引，需要回表来查询未被索引覆盖的字段（不是纯粹用了索引，也不是完全没用到索引）
    - range — 索引范围查找，有范围的索引排序；如：`between and < > in or`
    - index_subquery — 在子查询中使用 ref；非唯一性索引，一般出现在in查询中；
    - unique_subquery — 在子查询中使用 eq_ref，一般出现在in查询中；
    - index_merge — 使用了索引合并优化。(对多个索引分别进行了条件的查询，最后对这几个查询的结果进行合并交集运算)
    - ref_or_null — 对 null 进行索引的优化的 ref； 类似 ref。区别是他会额外的搜索包含 null 的记录，他会对其进行一些优化。(例如：SELECT * FROM table WHERE age = 18 and name is null)
    - fulltext — 使用全文索引；
    - ref — 使用非唯一索引查找数据；利用查询索引来进行搜索。（非主键以及 UNIQUE）
    - eq_ref — 在 join 查询中使用主键或唯一索引关联；查询列是主键或者非 NULL 的 UNIQUE 索引，常用在联合查询。(例如：SELECT * FROM ref_table,other_table WHERE ref_table.key_column=other_table.column => ref_table.key_column 是主键或者非 NULL 的 UNIQUE 索引)
    - const — 将一个主键放置到 where 后面作为条件查询， MySQL 优化器就能把这次查询优化转化为一个常量，如何转化以及何时转化，这个取决于优化器，这个比 eq_ref 效率高一点。
        查询条件是主键或者非 NULL 的 UNIQUE 索引，因此结果只有一条，同时优化过程中查询列值会转成常量。
    - system — 表中数据只有一行的情况；
    - null — 不用访问表就可以直接得到结果。(例如：SELECT 1)
    type的效率高低情况：`all < index < range < index_subquery < unique_subquery < index_merge < ref_or_null < ref < eq_ref < const < system`
- possible_keys — 表示查询时，可能使用的索引；
- key — 表示实际使用的索引；
    如果这一列为 NULL 则表示未使用索引，反之则使用了索引。
- key_len — 索引字段的长度；
- ref—  列与索引的比较；
- rows — 大概估算的行数；
- filtered — 按表条件过滤的行百分比；
- Extra — 执行情况的描述和说明。
