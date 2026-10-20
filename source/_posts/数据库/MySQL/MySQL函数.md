---
title: MySQL函数
tags: [MySQL]
categories: MySQL
abbrlink: 'mysql-functions'
date: 2018-03-29 17:28:00
updated: 2026-10-19 11:00:00
---
记录几个常用的MySQL函数：

#### LAST_INSERT_ID([expr])

自动返回最后一个INSERT或 UPDATE 问询为 AUTO_INCREMENT列设置的第一个发生的值。
如果一次性insert多条数据，只返回第一个数据的主键。
``` 
mysql> SELECT * FROM t;
	+----+------+
	| id | name |
	|  1 | Bob  |
	+----+------+

mysql> INSERT INTO t VALUES  (NULL, 'Mary'), (NULL, 'Jane'), (NULL, 'Lisa');
mysql> SELECT * FROM t;
	+----+------+
	| id | name |
	|  1 | Bob  |
	|  2 | Mary |
	|  3 | Jane |
	|  4 | Lisa |
	+----+------+
mysql> SELECT LAST_INSERT_ID();
	->2;
```
注：假如你使用 INSERT IGNORE而记录被忽略，则AUTO_INCREMENT 计数器不会增量，而 LAST_INSERT_ID() 返回0,这反映出没有插入任何记录。


若给出作为到LAST_INSERT_ID()的参数expr ，则参数的值被函数返回，并作为被LAST_INSERT_ID()返回的下一个值而被记忆。这可用于模拟序列：

``` 
mysql> CREATE TABLE sequence (id INT NOT NULL);
mysql> INSERT INTO sequence VALUES (0);
mysql> UPDATE sequence SET id=LAST_INSERT_ID(id+1);
mysql> SELECT LAST_INSERT_ID();
     ->1;
```

## UNIX 时间戳与日期时间转换

### 当前时间戳

```sql
SELECT UNIX_TIMESTAMP();
SELECT UNIX_TIMESTAMP(NOW());
```

两者都可用于取得当前的 Unix 时间戳，单位为秒。Unix 时间戳表示相对于 UTC 纪元的时间，不应额外手动加“时区偏移秒数”。

### 时间戳转为可读时间

```sql
SELECT FROM_UNIXTIME(1700000000, '%Y-%m-%d %H:%i:%S');

-- meer 为实际查询中已定义的表别名，score_time 保存秒级时间戳。
SELECT FROM_UNIXTIME(meer.score_time, '%Y-%m-%d %H:%i:%S') AS score_datetime
FROM scores AS meer;
```

`%i` 表示分钟，`%m` 表示月份。`FROM_UNIXTIME()` 按当前会话时区显示时间，可先查看：

```sql
SELECT @@session.time_zone, @@system_time_zone;
```

如果字段存储毫秒时间戳，需要先除以 `1000`；字段已经是 `DATETIME` 时，格式化应考虑 `DATE_FORMAT()`，不能把它当作整数时间戳。带日期参数的 `UNIX_TIMESTAMP()` 也涉及会话时区，夏令时切换还可能使转换无法一一对应。支持的范围取决于 MySQL 版本及运行平台。

在筛选范围时，通常优先对原始时间戳列写区间条件，而不是对每行先调用 `FROM_UNIXTIME()`，以便使用普通列索引。参考 [MySQL 日期时间函数](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html)。
