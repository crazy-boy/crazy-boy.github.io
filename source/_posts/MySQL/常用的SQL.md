---
title: 常用的SQL
tags:
  - MySQL
categories: MySQL
abbrlink: 'common-sql'
date: 2021-04-26 20:20:18
updated: 2021-04-26 20:20:18
---

#### 1、查看所有的触发器
``` 
SELECT * FROM information_schema.`TRIGGERS`;
```

#### 2、查询所有的表
``` 
SELECT TABLE_NAME table_name,TABLE_COMMENT table_comment FROM INFORMATION_SCHEMA.TABLES where table_schema='myDB' and table_type='BASE TABLE';   //表名(不包含视图)及备注
show full tables where Table_type = 'BASE TABLE';    //表名
```

#### 3、查询db1数据库中所有有触发器的表
``` 
SELECT DISTINCT EVENT_OBJECT_TABLE FROM information_schema.`TRIGGERS` WHERE EVENT_OBJECT_SCHEMA = "db1";
```

#### 4、查询db1数据库中所有无触发器的表
``` 
SELECT A.TABLE_NAME from information_schema.`TABLES` A LEFT JOIN information_schema.`TRIGGERS` B ON A.TABLE_NAME=B.EVENT_OBJECT_TABLE where B.EVENT_OBJECT_TABLE is null and A.TABLE_SCHEMA="db1";
```

#### 5、创建索引
``` 
alter table table_name add index index_name (索引字段);   -- 创建普通索引
create index index_name on table_name (索引字段);         -- 创建普通索引
alter table table_name add primary key(colunm_name);     -- 创建主键
alter table table_name add unique(colunm_name);          -- 创建唯一索引
create index idx_c1_c2 on table_name(c1,c2);             -- 创建联合索引
show index from table_name;                              -- 查看表中的索引
```

#### 6、去除数据表中指定字段的换行符
``` 
-- char(10)：换行符      char(13)：回车符
update table set name=replace(replace(`field`,char(10),''),char(13),'');
```