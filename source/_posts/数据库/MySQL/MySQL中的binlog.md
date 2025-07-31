---
title: MySQL中的binlog
tags: [binlog]
categories: MySQL
abbrlink: 'mysql-binlog'
date: 2022-05-10 13:25:13
updated: 2022-05-10 13:25:13
---
### 如何查看binlog日志
#### 1. 开启binlog
- 在my.ini文件[mysqld]里添加`log_bin=mysql-bin`，值 mysql-bin 是日志的基本名或前缀名
- 通过mysql的变量配置表，查看二进制日志是否已开启
![](/images/mysql_binlog_1.png)
- 查看MySQL的binlog模式
![](/images/mysql_binlog_2.png)
在查看binlog的时候可能会遇到错误：`mysqlbinlog: [ERROR] unknown variable 'default-character-set=utf8'`
![](/images/mysql_binlog_3.png)
原因是mysqlbinlog这个工具无法识别binlog中的配置中的default-character-set=utf8这个指令。
两个方法可以解决这个问题
A. 在MySQL的配置/etc/my.cnf中将`default-character-set=utf8` 修改为
`character-set-server = utf8`，但是这需要重启MySQL服务，如果你的MySQL服务正在忙，那这样的代价会比较大。
B. 用mysqlbinlog --no-defaults mysql-bin.000001 命令打开
![](/images/mysql_binlog_4.png)

### 参考资料
https://blog.csdn.net/weixin_43944305/article/details/108620849
https://www.kancloud.cn/wenshunbiao/wenshunbiao/1403850