---
title: MySQL中的JSON
tags: [JSON]
categories: MySQL
abbrlink: 'mysql-json'
date: 2022-05-20 11:30:42
updated: 2022-05-20 11:30:42
---
<div class="note info">以MySQL为代表的关系型数据库，5.7.8之前没有JSON这种数据类型，只能以varchar或者text形式变相的支持JSON，存取键值极不方便；5.7.8开始有JSON数据类型，有专门语法支持键值的存取，易用性得到很大提升。下面说说json类型的使用。</div>

### json类型的使用

1. 先看下版本号，确定是否支持json类型
![](/images/mysql_json_1.png)
2. 创建表user，其中extdata字段为json类型
![](/images/mysql_json_2.png)
3. 往表user里插入一条数据
![](/images/mysql_json_3.png)
4. 设置extdata字段的值
![](/images/mysql_json_4.png)
5. 查看数据
![](/images/mysql_json_5.png)
6. 查看json字段的指定项：`json_extract(字段名,'$.xx')`
![](/images/mysql_json_6.png)
7. explain看下
![](/images/mysql_json_7.png)
8. 以json字段中的指定项来添加字段
![](/images/mysql_json_8.png)
9. 派生字段添加索引
![](/images/mysql_json_9.png)

### json函数与find_in_set对比
1. 新建表test
```
CREATE TABLE test (
id int(10) unsigned NOT NULL AUTO_INCREMENT,
member_ids varchar(255) DEFAULT NULL,
manager_ids json DEFAULT NULL,
PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=50159 DEFAULT CHARSET=utf8mb4;
```
2. 并插入五万条数据
![](/images/mysql_json_10.png)
![](/images/mysql_json_11.png)

3. 对比查询效率
```
select SQL_NO_CACHE * from test where FIND_IN_SET(2,member_ids);
select SQL_NO_CACHE * from test where json_contains(manager_ids,'2');
```
![](/images/mysql_json_12.png)
![](/images/mysql_json_13.png)
![](/images/mysql_json_14.png)
find_in_set稳定性不好，时间在0.09s到0.69s之间变动
json_contains稳定在0.14s左右，第二个字段必须是字符串
如果连表的话，要使用cast(b.id as char)
```
SELECT
	a.id,
	a.NAME,
	group_concat( DISTINCT ( b.NAME ) ORDER BY b.id SEPARATOR '、' ) managerNames
FROM
	a
	LEFT JOIN b ON json_contains( a.manager_ids, cast(b.id as char) )
GROUP BY
	`a`.`id` 
ORDER BY
	`a`.`id` ASC 
	LIMIT 0,
	10
```
综上，对于多id存储，还是使用逗号分隔的字符串会好一些，json数据使用json类型来存储会更方便。