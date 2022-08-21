---
title: Linux下操作MySQL
tags:
  - Linux
  - MySQL
categories: MySQL
abbrlink: 'use-mysql-on-linux'
date: 2019-09-23 18:10:20
updated: 2019-09-23 18:10:20
---
### 1. 登录MySQL数据库
`mysql -uroot -p`
![](/images/use_mysql_on_linux_1.png)

### 2. 退出MySQL
`quit或者exit`
![](/images/use_mysql_on_linux_2.png)

### 3. 查看MySQL版本(四种方法)

- 在终端下执行： `mysql -V`
![](/images/show_mysql_version_on_linux_1.png)

- 在help中查找 `mysql --help | grep Distrib`
![](/images/show_mysql_version_on_linux_2.png)

- 在mysql 里查看 `select version()`
![](/images/show_mysql_version_on_linux_3.png)

- 在mysql 里查看 `status`
![](/images/show_mysql_version_on_linux_4.png)