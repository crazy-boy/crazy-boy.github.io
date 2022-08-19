---
title: MySQL自定义函数
tags:
  - MySQL
  - 自定义函数
categories: MySQL
abbrlink: 'mysql-custom-functions'
date: 2018-09-05 12:27:00
updated: 2018-09-05 12:27:00
---

<div class="note info">有时候要对MySQL数据进行批量处理，仅仅依靠已有的内置函数是不够的，这个时候就需要添加一些自定义的函数了，下面列举一些常用的自定义函数</div>

### 1. 批量处理字符串，将"FEEED305904B"转为"FE:EE:D3:05:90:4B"格式：
	
```
DROP FUNCTION IF EXISTS `SPLIT_STR`; 
delimiter $$
CREATE FUNCTION SPLIT_STR(
  x VARCHAR(255),
  delim VARCHAR(12),
  pos INT
)
RETURNS VARCHAR(255)

BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE s text DEFAULT '';
    myloop: LOOP
        SET i = i+pos;
        SET s = CONCAT(s,delim,left(x,pos));
        SET x = right(x,length(x)-pos);
        if pos>length(x) then
            if length(x)>0 then
                SET s = CONCAT(s,delim,x);
            end if;
            leave myloop;
        end if;
    END LOOP myloop;
RETURN right(s,length(s)-length(delim));
END $$
```
调用：`SELECT SPLIT_STR('FEEED305904B', ':', 2);`