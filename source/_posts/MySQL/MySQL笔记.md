---
title: MySQL笔记
tags:
  - MySQL
  - 笔记
categories: MySQL
abbrlink: 45387
date: 2018-06-04 11:19:00
updated: 2021-10-11 19:10:00
---

## 1. mysql根据汉字首字母排序的方法
```sql
-- utf8_general_ci编码
select * from t_school order by convert(name using gbk);
```
   
## 2. 删除表数据的时候，如果表使用了别名
应该这样写：`DELETE a FROM table a;`

## 3. 不使用缓存执行某个查询sql
`SELECT SQL_NO_CACHE xx, xx from tb;`

## 4. MySql中Blob与Text的区别
BLOB列被视为二进制字符串，TEXT列被视为非二进制字符串。

## 5. MyISAM和InnoDB的区别
Innodb 支持事务处理与外键和行级锁；
MyISAM类型的表强调的是性能，其执行速度比InnoDB类型更快。

## 6. 数据库恢复
是指通过技术手段将保存在数据库中丢失的电子数据进行抢救和恢复的技术。

## 7. mysql删除自定义函数：
```DROP FUNCTION IF EXISTS `函数名`;```

## 8. 插入数据：
``` sql
    insert into tb (field1,field2,field3……) value (val1,val2,val3……);
    insert into tb (field1,field2,field3……) values (val1,val2,val3……);
    insert into tb set field1=val1,field2=val2,field3=val3;
    insert into tb (field1,field2,field3……) values (val11,val12,val13……),(val21,val22,val23……),(val31,val32,val33……);
    insert ignore into tb (field1,field2,field3……) values (val1,val2,val3……);		//使用ignore关键字忽略错误
```

## 9. 查询数据库中每个表的记录数：
``` sql
    use information_schema;
    select table_name,table_rows from tables where TABLE_SCHEMA = 'dataBase' order by table_rows desc;  
```

## 10. mysql查询主键字段名：
``` sql
SELECT column_name FROM INFORMATION_SCHEMA.`KEY_COLUMN_USAGE` WHERE table_name='表名' AND constraint_name='PRIMARY';
```

## 11. mysql查询所有字段名：
``` sql
SELECT column_name FROM information_schema.columns WHERE table_name='表名';
```

## 12、null的问题：
``` sql 
update t_classroom set building_name=null where build_id is not null;
```

## 13、获取指定字段的默认值：  
DEFAULT(col_name)
```sql
select DEFAULT(sort) from t_node_school limit 1;
```

## 14、mysql重命名表名：
```alter table tb1 rename to tb2;```
或者
```rename tb1 to tb2;```

## 15、null字段排序问题：

设排序字段为sort，使用order by sort desc实现降序时，sort为null的数据会排在最后面；
但是使用order by sort升序时，sort为null的数据会排在最前面，如果想将sort为null的数据排在后面，就需要加is null。
如：`select * from t_grade order by sort is null, sort, create_time desc;`
    
## 16、主键设置规则
 主键的值不可更新，未来可能会变更的字段不能设置为主键；
 主键的值不可为空，且不能重复；
 
## 17、查看某个表的所有列：
```sql
show columns from tableName;  或者  describe tableName; //可以用来生成数据字典
```
 
## 18、下划线"_"通配符 匹配一个字符
```sql
 select field1,field2 from tableName where field3 like "_xx";
```
 
## 19、日期转星期
 ```sql
 select weekday("2021-11-10")+1 week;      
 -- 2021年11月10日是星期三
```
 
  




