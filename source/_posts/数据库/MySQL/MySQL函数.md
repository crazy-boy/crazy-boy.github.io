---
title: MySQL函数
tags: [MySQL]
categories: MySQL
abbrlink: 'mysql-functions'
date: 2018-03-29 17:28:00
updated: 2018-04-03 17:28:00
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
