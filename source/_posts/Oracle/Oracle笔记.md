---
title: Oracle笔记
tags:
  - Oracle
  - 笔记
categories: Oracle
abbrlink: 4acd8de8
date: 2018-06-19 22:39:00
updated: 2018-06-19 22:45:00
---

1. 强制并行处理：`/*+ monitor parallel(8)*/`

2. plsql查看sql性能：F5

3. 在oracle中有时候需要进行MySQL中的find_in_set查询，故封装了如下函数：
    ``` bash
        CREATE OR REPLACE FUNCTION FIND_IN_SET(piv_str1 varchar2, piv_str2 varchar2, p_sep varchar2 := ',')
        RETURN NUMBER IS
          l_idx    number:=0; -- 用于计算piv_str2中分隔符的位置
          str      varchar2(500);  -- 根据分隔符截取的子字符串
          piv_str  varchar2(500) := piv_str2; -- 将piv_str2赋值给piv_str
          res      number:=0; -- 返回结果
        BEGIN
        -- 如果piv_str中没有分割符，直接判断piv_str1和piv_str是否相等，相等 res=1
        IF instr(piv_str, p_sep, 1) = 0 THEN
           IF piv_str = piv_str1 THEN
              res:= 1;
           END IF;
        ELSE
        -- 循环按分隔符截取piv_str
        LOOP
            l_idx := instr(piv_str,p_sep);
        -- 当piv_str中还有分隔符时
              IF l_idx > 0 THEN
           -- 截取第一个分隔符前的字段str
                 str:= substr(piv_str,1,l_idx-1);
           -- 判断 str 和piv_str1 是否相等，相等 res=1 并结束循环判断
                 IF str = piv_str1 THEN
                   res:= 1;
                   EXIT;
                 END IF;
                piv_str := substr(piv_str,l_idx+length(p_sep));
              ELSE
           -- 当截取后的piv_str 中不存在分割符时，判断piv_str和piv_str1是否相等，相等 res=1
                IF piv_str = piv_str1 THEN
                   res:= 1;
                END IF;
                -- 无论最后是否相等，都跳出循环
                EXIT;
              END IF;
        END LOOP;
        -- 结束循环
        END IF;
        -- 返回res
        RETURN res;
        END FIND_IN_SET;
    ``` 

4. 日期转时间戳函数

    ``` bash 
    create or replace function oracle_to_unix(in_date IN DATE) return number is
        begin 
            return( (in_date -TO_DATE('19700101','yyyymmdd'))*86400 - TO_NUMBER(SUBSTR(TZ_OFFSET(sessiontimezone),1,3))*3600);
        end oracle_to_unix;
    ```

5. 时间戳转日期函数

    ``` bash
    create or replace function unix_to_oracle(in_number NUMBER) return date is
        begin
            return(TO_DATE('19700101','yyyymmdd') + in_number/86400 +TO_NUMBER(SUBSTR(TZ_OFFSET(sessiontimezone),1,3))/24);
        end unix_to_oracle;
    
    ```
