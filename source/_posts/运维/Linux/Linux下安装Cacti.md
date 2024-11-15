---
title: Linux下安装Cacti
tags: [Cacti]
categories: Linux
abbrlink: 'install-cacti-on-linux'
date: 2019-09-23 18:28:06
updated: 2019-09-23 18:28:06
---

### 1、安装rrdtool
`yum install rrdtool rrdtool-perl -y `

### 2、安装配置net-snmp
- (1)、安装net-snmp
`yum install net-snmp net-snmp-libs net-snmp-utils`

可能报错：

```
...
2:postfix-2.10.1-6.el7.x86_64 has missing requires of libmysqlclient.so.18()(64bit)
2:postfix-2.10.1-6.el7.x86_64 has missing requires of libmysqlclient.so.18(libmysqlclient_18)(64bit)
```

解决:缺少Percona-XtraDB-Cluster-shared-55-5.5.37-25.10.756.el6.x86_64.rpm这个包

```shell
# wget http://www.percona.com/redir/downloads/Percona-XtraDB-Cluster/5.5.37-25.10/RPM/rhel6/x86_64/Percona-XtraDB-Cluster-shared-55-5.5.37-25.10.756.el6.x86_64.rpm
# rpm -ivh Percona-XtraDB-Cluster-shared-55-5.5.37-25.10.756.el6.x86_64.rp
```

- (2)、配置net-snmp
`vim /etc/snmp/snmpd.conf `

```
41行 1将default 改为监控服务器ip;2 将public 改成复杂些的识别的字符串  
com2sec notConfigUser  127.0.0.1      public  
  
62行 1将systemview 改为all,供所有snmp 访问权限  
access  notConfigGroup ""      any       noauth    exact  all none none  
  
85行 将#注释符号去掉  
view all    included  .1                               80  
```

- (3)、启动net-snmp
`service snmpd start `
可能提示：Redirecting to /bin/systemctl start snmpd.service
解决方法：`/bin/systemctl start snmpd`

- (4)、测试net-snmp
snmpd 使用 tcp/udp 161 端口,验证snmpd 服务
`lsof -i :161`
![](/images/install_cacti_on_linux_1.png)
使用snmpwalk 命令验证
```
snmpwalk -v 2c -c public 127.0.0.1 
-v是指版本,-c 是指密钥，获取到系统信息则正常！
如果cacti搭建好后很久还是没出图，用这个命令试试看能否获取到数据。
正常情况下，执行完这个命令后会有很多数据出现！
```

### 3、安装cacti

- (1)、安装net-snmp
```shell
cd /tmp 
wget http://www.cacti.net/downloads/cacti-0.8.8a.tar.gz 
tar xzf cacti-0.8.8a.tar.gz 
mv cacti-0.8.8a /var/www/cacti 
cd /var/www/cacti
```
- (2)、创建数据库
`mysqladmin --user=root -p create cacti `

- (3)、导入数据库
`mysql -uroot -p cacti < cacti.sql `
可能报错：ERROR 1067 (42000) at line 1847: Invalid default value for 'status_fail_date'
原因：status_fail_date的datetime默认类型是不允许的
解决方法：
```
vim /etc/my.cnf
添加如下内容：
sql-mode="ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION"
重启mysql服务：systemctl restart mysqld
```

- (4)、创建数据库用户
```
shell> mysql -uroot -p mysql 
mysql> GRANT ALL ON cacti.* TO cactiuser@localhost IDENTIFIED BY 'Cacti@pwd001231'; 
mysql> flush privileges; 
```

- (5)、配置include/config.php
```
$database_type = "mysql"; 
$database_default = "cacti"; 
$database_hostname = "localhost"; 
$database_username = "cactiuser"; 
$database_password = "Cacti@pwd001231"; 
```

打开注释掉的：`$url_path = "/cacti/"; `


- (6)、配置include/global.php
``` php
/* Default database settings*/ 
$database_type = "mysql"; 
$database_default = "cacti"; 
$database_hostname = "localhost"; 
$database_username = "cactiuser"; 
$database_password = "Cacti@pwd001231"; 
$database_port = "3306"; 
$database_ssl = false; 
```

- (7)、设置目录权限
```
useradd cactiuser 
chown -R cactiuser rra/ log/ 
```

- (8)、配置计划任务
```
#crontab -e 
*/5 * * * * /usr/bin/php /var/www/html/cacti/poller.php > /dev/null 2>&1 //让系统每5分钟收集
service crond restart 
```

- (9)、完成cacti的安装
注意关闭防火墙或者允许80端口，关闭selinux
1) 在浏览器中输入：http://监控服务器IP/cacti/
默认用户名：admin 密码：admin
2）设置cacti用到的命令路径
3) 更改密码 
登陆成功户 next>>   next>> 
![](/images/install_cacti_on_linux_2.png)
![](/images/install_cacti_on_linux_3.png)

参考地址：https://www.cnblogs.com/liuyansheng/p/6118535.html