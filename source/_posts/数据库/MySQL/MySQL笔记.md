---
title: MySQL笔记
tags: [MySQL]
categories: MySQL
abbrlink: 'mysql-notes'
date: 2018-06-04 11:19:00
updated: 2026-10-20 09:00:00
---

### 1. mysql根据汉字首字母排序的方法
```
-- utf8_general_ci编码
select * from tname order by convert(name using gbk);
```
   
### 2. 删除表数据的时候，如果表使用了别名
应该这样写：`DELETE a FROM table a;`

### 3. 不使用缓存执行某个查询sql
`SELECT SQL_NO_CACHE xx, xx from tb;`

### 4. MySql中Blob与Text的区别
BLOB列被视为二进制字符串，TEXT列被视为非二进制字符串。

### 5. MyISAM和InnoDB的区别
Innodb 支持事务处理与外键和行级锁；
MyISAM类型的表强调的是性能，其执行速度比InnoDB类型更快。

### 6. 数据库恢复
是指通过技术手段将保存在数据库中丢失的电子数据进行抢救和恢复的技术。

### 7. mysql删除自定义函数：
```DROP FUNCTION IF EXISTS `函数名`;```

### 8. 插入数据：
``` sql
    insert into tb (field1,field2,field3……) value (val1,val2,val3……);
    insert into tb (field1,field2,field3……) values (val1,val2,val3……);
    insert into tb set field1=val1,field2=val2,field3=val3;
    insert into tb (field1,field2,field3……) values (val11,val12,val13……),(val21,val22,val23……),(val31,val32,val33……);
    insert ignore into tb (field1,field2,field3……) values (val1,val2,val3……);		//使用ignore关键字忽略错误
```

### 9. 查询数据库中每个表的记录数：
``` sql
    use information_schema;
    select table_name,table_rows from tables where TABLE_SCHEMA = 'dataBase' order by table_rows desc;  
```

### 10. mysql查询主键字段名：
``` sql
SELECT column_name FROM INFORMATION_SCHEMA.`KEY_COLUMN_USAGE` WHERE table_name='表名' AND constraint_name='PRIMARY';
```

### 11. mysql查询所有字段名：
``` sql
SELECT column_name FROM information_schema.columns WHERE table_name='表名';
```

### 12、null的问题：
``` sql 
update t_classroom set building_name=null where build_id is not null;
```

### 13、获取指定字段的默认值：  
DEFAULT(col_name)
```sql
select DEFAULT(sort) from t_node_school limit 1;
```

### 14、mysql重命名表名：
```alter table tb1 rename to tb2;```
或者
```rename tb1 to tb2;```

### 15、null字段排序问题：

设排序字段为sort，使用order by sort desc实现降序时，sort为null的数据会排在最后面；
但是使用order by sort升序时，sort为null的数据会排在最前面，如果想将sort为null的数据排在后面，就需要加is null。
如：`select * from t_grade order by sort is null, sort, create_time desc;`
    
### 16、主键设置规则
 主键的值不可更新，未来可能会变更的字段不能设置为主键；
 主键的值不可为空，且不能重复；
 
### 17、查看某个表的所有列：
```sql
show columns from tableName;  或者  describe tableName; //可以用来生成数据字典
```
 
### 18、下划线"_"通配符 匹配一个字符
```sql
 select field1,field2 from tableName where field3 like "_xx";
```
 
### 19、日期转星期
 ```sql
 select weekday("2021-11-10")+1 week;      
 -- 2021年11月10日是星期三
```
 
### 20、单条SQL语句完成多种数据统计
 ```sql
-- 现需分别统计wl_student_score_logs表中exam_id为5的change_score增加量和减少量
select
sum( if( change_score > 0, change_score, 0)) as increase_score,
sum( if( change_score  < 0, change_score, 0)) as reduce_score
from wl_student_score_logs where exam_id=5;
```

### 21、truncate、drop 和 delete 的区别
    1. 执行速度：drop > truncate > detele；
    2. delete 和 truncate 只删除表数据，而 drop 会删除表数据和表结构以及表的索引、约束和触发器；
    3. delete 可以加 where 条件实现部分数据删除，而 truncate 和 drop 不能加 where 条件是整体删除；
    4. truncate 和 drop 是立即执行，且不能恢复；而 delete 会走事务，可以撤回和恢复；
    5. truncate 会重置自增列为 1，而 delete 不会重置自增列；
    6. truncate 和 drop 是 DDL 语句，而 delete 是 DML 语句。

### 22、修改自增列的值
    `alter table tname auto_increment=n;`
    一个表中只能有一个自增列,如果设置多个自增列，那么 SQL 执行就会报错。除此之外还要注意自增列应该为整数类型，且 auto_increment 需要配合 key 一起使用，这个 key 可以是 primary key 或 foreign key。
    
### 23、生成批量清空指定数据库的语句
    `select CONCAT('TRUNCATE TABLE ',table_schema,'.',TABLE_NAME, ';') 清空语句 from INFORMATION_SCHEMA.TABLES where table_schema ='库名';`    


## 查询基础补充

### COUNT(列名) 会忽略 NULL

```sql
SELECT COUNT(*) AS row_count,
       COUNT(phone) AS phone_count
FROM users;
```

`COUNT(*)` 统计满足条件的行，`COUNT(phone)` 统计其中 `phone` 不为 `NULL` 的行。空字符串并不是 `NULL`，仍会计入后者。计数规则不意味着某一种写法在所有查询中都更快。参考 [MySQL 聚合函数](https://dev.mysql.com/doc/refman/8.4/en/aggregate-functions.html)。

### SELECT 常见子句的书写顺序

```sql
SELECT user_id, COUNT(*) AS order_count
FROM orders
WHERE status = 'paid'
GROUP BY user_id
HAVING order_count >= 2
ORDER BY order_count DESC, user_id
LIMIT 20;
```

常见的书写次序是 `SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT`，但可选子句不必全部出现。这是语法顺序，不代表优化器实际按这个顺序执行。

`WHERE` 筛选分组前的行，`HAVING` 筛选分组或聚合后的结果。MySQL 支持在 `GROUP BY`、`HAVING`、`ORDER BY` 中引用 SELECT 列别名，同一查询块的 `WHERE` 不能直接使用该列别名；这并不是 MySQL 5.7.5 才新增的能力。别名不宜与原列重名，以免产生歧义。

`GROUP BY` 可以不带 `HAVING`；聚合查询也可以只有 `HAVING` 而没有显式 `GROUP BY`：

```sql
SELECT COUNT(*) AS total FROM orders HAVING total > 0;
```

MySQL 5.7.5 的变化包括默认启用 `ONLY_FULL_GROUP_BY`、改进函数依赖判断，以及解除开启该模式时 HAVING 引用 SELECT 别名的旧限制。别名支持本身并非这一版才全面加入，应区分具体子句和 SQL 模式。参考 [MySQL 列别名规则](https://dev.mysql.com/doc/refman/8.4/en/problems-with-alias.html) 和 [MySQL 5.7 SQL 模式说明](https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html)。

### 单表 DELETE 的 ORDER BY 和 LIMIT

```sql
-- 示例：只适用于已确认条件和表结构的业务环境。
DELETE FROM access_logs
WHERE created_at < '2025-01-01'
ORDER BY id
LIMIT 1000;
```

这是单表 DELETE 语法，可用于每次删除一批匹配记录。`LIMIT` 限制本次删除行数，不表示最多只扫描或锁住这么多行；扫描成本还要看条件和索引。分批循环时还要明确终止条件、事务大小及失败重试方式。

多表 DELETE 不能照搬这里的 `ORDER BY`、`LIMIT`。参考 [MySQL DELETE 文档](https://dev.mysql.com/doc/refman/8.4/en/delete.html)。

### 使用 utf8mb4 保存 emoji

```sql
CREATE TABLE message_notes (
    id BIGINT NOT NULL PRIMARY KEY,
    content VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4;
```

`utf8mb4` 能表示包括四字节字符在内的 Unicode 字符，适合保存 emoji；旧的 `utf8mb3` 无法覆盖全部字符。还要确保客户端连接字符集、驱动和目标列配置一致，不能只改数据库默认字符集就认为现有列已经转换。

一些 emoji 由多个 Unicode 码点组成，字符计数与用户看到的图形数量未必相同。排序规则影响比较与排序，不等于字符集的可表示范围。参考 [MySQL utf8mb4 字符集](https://dev.mysql.com/doc/refman/8.4/en/charset-unicode-utf8mb4.html)。

延伸阅读：[IN 与 EXISTS 的语义和性能](/posts/mysql-in-exists.html)、[DECIMAL 类型](/posts/mysql-decimal.html)、[聚簇索引与二级索引](/posts/mysql-clustered-index.html)。
