---
title: Linux 安装php5(php7)
tags: [PHP]
categories: Linux
abbrlink: 'install-php-on-linux'
date: 2019-10-14 23:58:32
updated: 2019-10-14 23:58:32
---

### 1. 先安装依赖包
```shell
$   yum install gcc bison bison-devel zlib-devel libmcrypt-devel mcrypt mhash-devel openssl-devel libxml2-devel libcurl-devel bzip2-devel readline-devel libedit-devel
```

### 2. 下载php-5.3.0
```shell
wget http://cn2.php.net/get/php-5.3.0.tar.gz/from/this/mirror -o php-5.3.0

# 解压 
$ tar -zxvf php-5.3.0.tar.gz
$ cd php-5.3.0

yum install libxml2

yum install libxml2-devel -y

yum install curl curl-devel
yum install -y epel-release
yum install -y libmcrypt-devel
```

```shell
php5 配置 

 ./configure \
--prefix=/usr/local/php5 \
--with-config-file-path=/usr/local/php5/etc \
--enable-inline-optimization \
--disable-debug \
--disable-rpath \
--enable-shared \
--enable-opcache \
--enable-fpm \
--with-fpm-user=www \
--with-fpm-group=www \
--with-mysql=mysqlnd \
--with-mysqli=mysqlnd \
--with-pdo-mysql=mysqlnd \
--with-gettext \
--with-gd \
--enable-mbstring \
--with-iconv \
--with-mcrypt \
--with-mhash \
--with-openssl \
--enable-bcmath \
--enable-soap \
--with-libxml-dir \
--enable-pcntl \
--enable-shmop \
--enable-sysvmsg \
--enable-sysvsem \
--enable-sysvshm \
--enable-sockets \
--with-curl \
--with-zlib \
--enable-zip \
--with-bz2 \
--with-readline \
--with-xsl \
--without-sqlite3 \
--without-pdo-sqlite \
--with-pear
```

```shell
php7 配置

 ./configure \
--prefix=/usr/local/php7 \
--with-config-file-path=/usr/local/php7/etc \
--enable-inline-optimization \
--disable-debug \
--disable-rpath \
--enable-shared \
--enable-opcache \
--enable-fpm \
--with-fpm-user=www \
--with-fpm-group=www \
--with-mysql=mysqlnd \
--with-mysqli=mysqlnd \
--with-pdo-mysql=mysqlnd \
--with-gettext \
--enable-mbstring \
--with-iconv \
--with-mcrypt \
--with-mhash \
--with-openssl \
--enable-bcmath \
--enable-soap \
--with-libxml-dir \
--enable-pcntl \
--enable-shmop \
--enable-sysvmsg \
--enable-sysvsem \
--enable-sysvshm \
--enable-sockets \
--with-curl \
--with-zlib \
--enable-zip \
--with-bz2 \
--with-readline \
--without-sqlite3 \
--without-pdo-sqlite \
--with-pear
```

### 3. 编译安装 
```shell
$ make && make install
```

### 4. 复制 php 配置文件
```shell
[root@VM_0_2_centos php-5.6.30]# cp php.ini-production /usr/local/php7/etc/php.ini
已经安装完成，查看版本号

[root@VM_0_2_centos php-5.6.30]# /usr/local/php7/bin/php -v
返回

PHP 5.6.30 (cli) (built: Aug 29 2018 09:09:28) 
Copyright (c) 1997-2016 The PHP Group
Zend Engine v2.6.0, Copyright (c) 1998-2016 Zend Technologies
```

### 5. 配置 php-fpm
```shell
[root@VM_0_2_centos php-5.6.30]# cp /usr/local/php7/etc/php-fpm.conf.default /usr/local/php7/etc/php-fpm.conf
[root@VM_0_2_centos php-5.6.30]# vim /usr/local/php7/etc/php-fpm.conf
查找 user 将

user = nobody
group = nobody
改成

user = www
group = www
查找 listen 将

listen = 127.0.0.1:9000
改成

listen = 127.0.0.1:9001

配置 php-fpm 服务

[root@VM_0_2_centos php-5.6.30]# cp sapi/fpm/php-fpm.service /usr/lib/systemd/system/php7-fpm.service
[root@VM_0_2_centos php-5.6.30]# vim /usr/lib/systemd/system/php7-fpm.service 
将：

PIDFile=${prefix}/var/run/php-fpm.pid
ExecStart=${exec_prefix}/sbin/php-fpm --nodaemonize --fpm-config ${prefix}/etc/php-fpm.conf
改成

PIDFile=/usr/local/php7/var/run/php-fpm.pid
ExecStart=/usr/local/php7/sbin/php-fpm --nodaemonize --fpm-config /usr/local/php7/etc/php-fpm.conf
```

### 6. 重新载入 systemd
```shell
[root@VM_0_2_centos php-5.6.30]# systemctl daemon-reload
可以设置开机启动：

[root@VM_0_2_centos php-5.6.30]# systemctl enable php7-fpm
返回结果

Created symlink from /etc/systemd/system/multi-user.target.wants/php7-fpm.service to /usr/lib/systemd/system/php7-fpm.service.
启动：

[root@VM_0_2_centos php-5.6.30]# systemctl start php7-fpm
关闭：

[root@VM_0_2_centos php-5.6.30]# systemctl stop php7-fpm
查看状态：

[root@VM_0_2_centos php-5.6.30]# systemctl status php7-fpm
返回

● php5-fpm.service - The PHP FastCGI Process Manager
   Loaded: loaded (/usr/lib/systemd/system/php5-fpm.service; disabled; vendor preset: disabled)
   Active: active (running) since Wed 2018-08-29 09:36:39 CST; 47s ago
 Main PID: 14996 (php-fpm)
   CGroup: /system.slice/php5-fpm.service
           ├─14996 php-fpm: master process (/usr/local/php5/etc/php-fpm.conf)
           ├─14997 php-fpm: pool www
           └─14998 php-fpm: pool www
```


参考地址：https://blog.csdn.net/weixin_42579642/article/details/85290670