---
title: MySQL索引
tags: [索引]
categories: MySQL
abbrlink: 'mysql-index'
date: 2020-05-23 10:21:00
updated: 2020-05-23 10:21:00
---

#### 导致 MySQL 索引失效的常见场景
1. 联合索引不满足最左匹配原则
    最左匹配原则是指以最左边的为起点字段查询可以使用联合索引，否则将不能使用联合索引。
    假设联合索引为A+B+C，则能使用索引的为A+B+C、A+B、A+C。
2. 模糊查询最前面的为不确定匹配字符
    只有模糊匹配后面任意字符：`like 'xx%'` 可以使用索引
3. 索引列参与了运算
    如：`explain select * from tname where id+1=1;`未使用索引
4. 索引列使用了函数
    如：`explain select * from tname where ifnull(id,0)=1;`未使用索引
5. 索引列存在类型转换
    如果索引列存在类型转换，那么也不会走索引，比如 name 为字符串类型，而查询的时候设置了 int 类型的值就会导致索引失效
6. 索引列使用 is not null 查询
    当在查询中使用了 is not null 也会导致索引失效，而 is null 则会正常触发索引的