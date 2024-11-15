---
title: centos7安装mysql5.0版本教程
tags: [mysql]
categories: [Linux]
abbrlink: 'install-mysql-on-linux'
date: 2019-10-12 00:05:36
updated: 2019-10-12 00:05:36
---

### 1. 下载mysql bundle.tar包
上传  mysql bundle.tar包到服务器
```shell
解压  tar -xvf mysql-5.7.27-1.el7.x86_64.rpm-bundle.tar
```

### 2. 按顺序逐个安装rpm
```shell
rpm -qa|grep mariadb
rpm -e mariadb-libs-5.5.35-3.el7.x86_64 --nodeps
rpm - ivh mysql-community-common-
rpm - ivh mysql-community-libs-      
rpm - ivh mysql-community-client-  
rpm - ivh mysql-community-server-   
rpm - ivh mysql-community-devel-
```

### 3. 启动&配置
```shell
# 启动
systemctl  start mysqld
# 关闭
systemctl  stop mysqld
# 开机启动
systemctl enable mysqld
systemctl daemon-reload
# 查看运行状态
systemctl  status mysqld
# 看到绿色的running代表已经启动成功，然后mysql在5.6之后的版本都会默认生成一个默认密码，是root用户的。
# 查看默认设置的密码
grep 'temporary password' /var/log/mysqld.log
```

### 4. 进入mysql
执行完如下命令之后输入默认密码
```shell
mysql -u root -p
```

MySQL 5调整密码验证规则：
```shell
mysql> set global validate_password_policy=0;
mysql> set global validate_password_length=1;
```

重新设置密码
```shell
ALTER USER  user() identified by "123456";
```

授权 root 远程连接
```shell
use mysql;
```

修改连接权限，执行：
```shell 
update user set host='%' where user ='root';
```

执行刷新权限：
```shell 
flush privileges;
```