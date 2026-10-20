---
title: 谈谈MySQL中的聚簇索引和非聚簇索引
tags: [聚簇索引]
categories: MySQL
abbrlink: 'mysql-clustered-index'
date: 2022-03-21 18:45:23
updated: 2026-10-20 09:00:00
---

理解 InnoDB 索引时，最有用的问题是：叶子节点里有什么，能不能直接提供当前查询要的字段？这比背诵“主键快、普通索引慢”更有助于分析实际查询。

## 一、普通 B+ 树索引的叶子节点

以下讨论 InnoDB 常见的 B+ 树索引，不把全文索引、空间索引等特殊结构混为一谈。

| 类型 | 叶子记录中的主要内容 | 常见读取方式 |
| --- | --- | --- |
| 聚簇索引 | 聚簇键及整行记录信息，大字段可能涉及页外存储 | 根据聚簇键定位行记录 |
| 二级索引（辅助索引） | 二级索引列及对应的聚簇键 | 先定位二级记录，必要时再查聚簇索引 |

每张 InnoDB 表只有一个聚簇索引，因为它决定了行记录在索引中的组织方式。这里的有序指 B+ 树中的逻辑组织，不意味着所有数据页都在磁盘上连续排列。

## 二、聚簇索引如何选择？

1. 有主键时，使用主键。
2. 没有主键时，使用第一个所有键列都为 `NOT NULL` 的合适唯一索引。
3. 两者都没有时，InnoDB 基于隐藏行 ID 生成内部聚簇索引 `GEN_CLUST_INDEX`。

因此聚簇索引通常是主键索引，但两者不能在所有表上画等号。二级索引可以有多个，不过数量、键长等仍受实现限制，并非无限制。参考 [InnoDB 聚簇索引与二级索引](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html)。

## 三、什么时候需要回表？

假设表中有主键 `id`，以及普通索引 `idx_status(status)`：

```sql
CREATE TABLE orders (
    id BIGINT NOT NULL PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    amount DECIMAL(9,2) NOT NULL,
    KEY idx_status (status)
) ENGINE=InnoDB;
```

查询订单金额：

```sql
SELECT amount FROM orders WHERE status = 'paid';
```

如果执行计划选择 `idx_status`，先通过二级索引找到匹配行的主键，再读取聚簇索引中的 `amount`。通常把后一段访问叫作“回表”。

而下面的查询只需要二级索引中已有的字段：

```sql
SELECT id, status FROM orders WHERE status = 'paid';
```

它具备覆盖索引的条件，通常可以减少回表；实际访问还可能受到事务可见性等条件影响。因此不能笼统说二级索引查询必然回表。

## 四、不能简单比较哪种索引总是更快

选择性高的二级索引可以大幅缩小扫描范围，覆盖查询也可能只读较小的二级索引；大范围读取完整行时，代价又会变化。应结合查询字段、返回行数、缓存和执行计划判断。

主键值会出现在二级索引记录中，过长的主键还会增加多个二级索引的存储成本。设计索引时，要一起考虑查询与写入维护成本，而不是只追求索引数量。

MyISAM 的行存储与 InnoDB 不同，不能把两者的叶子记录结构混用，也不能仅凭引擎名称断言某种查询必然更快。

相关笔记：[MySQL 中 IN 与 EXISTS](/posts/mysql-in-exists.html)。
