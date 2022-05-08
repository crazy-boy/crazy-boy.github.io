---
title: MySQL脚本执行中，预防误处理数据的方法
tags:
  - MySQL
  - 脚本执行
categories: MySQL
abbrlink: 83475
password: fdg34$35JFJEWfd
date: 2020-08-05 18:04:16
updated: 2020-08-05 18:04:16
---

在工作中，有时需要通过数据库脚本来变更生产数据，但稍有疏忽，就会误删数据、或者变更过多数据；为防预防这类情况的发生，根据我个人的工作经验，总结了以下几点方法：

## 1、先测试
   脚本写好之后，先在测试环境执行一遍，一方面可以看看脚本是否有语法问题，另一方面看看数据是否正确被处理；

## 2、脚本简单化
   尽量将复杂的联表处理语句转为多条单表处理语句，这可以防止由于逻辑不严谨导致的数据过多被处理的问题；
如：现有脚本
```sql
update personnel p set p.status=1 left join classes c on p.class_id=c.class_id where c.grade_id=5;
```
假设经查询，grade_id=5的personnel 为201-296，可改为：
```sql
update personnel set status=1 where id=201;
update personnel set status=1 where id=202;
update personnel set status=1 where id=203;
……
update personnel set status=1 where id=296;
```

## 3、Where条件精确化
   变更的where条件尽量为唯一索引字段，这可以防止由于条件过于复杂、数据表过大，导致锁表时间过长，执行效率过低的问题；
如：现有脚本
```sql
update personnel set status=1 where class_id=20 and status=0 and create_time<1571580242;
```

假设经查询，满足上述条件的personnelId 为220、233、234、256，可改为：
```sql
update personnel set status=1 where id=220;
update personnel set status=1 where id=233;
update personnel set status=1 where id=234;
update personnel set status=1 where id=256;
```

单条复杂语句拆分成多条单一条件语句的方法有很多，下面列举几种方式：
（1）将满足条件的数据导出，借助excel/Notepad++等工具进行批量补全sql语句；
（2）在数据库中使用concat函数进行sql拼接，如：
```sql
select CONCAT('delete from t_bracelet_person_relation where person_id=',person_id,' and mac_id="',mac_id,'";') from t_bracelet_person_relation where mac_id in ('C9B1EC032CB3','FCBA0EB1DA09') and status=0;
```

## 4、有条件处理
每条SQL语句必须有where条件，否则可能有问题，容易引起数据过度被处理的情况；
如：现有脚本
```sql
update goods set status=0;
```

经查上述语句本来只变更id=23的数据，由于疏忽大意忘些where条件，导致整个表的数据都被变更了，这个问题的严重性不亚于删库；
```sql
update goods set status=0 where id=23;
```

## 5、脚本数据校验
脚本写好之后，可以将update、delete改为select查询下，从查询结果的数据总条数和具体数据上比对下，看看数据是否和预期需要处理的数据有出入，如果有就是条件未控制好，需修改；
如：现有脚本
```sql
update personnel p set p.status=1 left join classes c on p.class_id=c.class_id where c.grade_id=5;
delete from personnel where class_id=20 and status=0 and create_time<1571580242;
```
可改为如下语句，查询后核对数据
```sql
select p.* from personnel p left join classes c on p.class_id=c.class_id where c.grade_id=5;
select * from personnel where class_id=20 and status=0 and create_time<1571580242;
```
