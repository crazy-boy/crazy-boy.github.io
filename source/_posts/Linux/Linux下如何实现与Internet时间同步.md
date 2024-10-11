---
title: Linux下如何实现与Internet时间同步
tags:
  - Linux
  - ntpdate
categories:
  - ntpdate
abbr link: linux-ntpdate
updated: '024-07-04 10:48:00'
abbrlink: 38c1
date: 2024-07-04 10:48:00
---


## 简介

在项目中，有时候需要修改服务器时间来模拟某些场景，或者校准服务器时间；那么如何在Linux系统下实现与Internet时间同步呢。

### 一、安装ntp
```bash
[root@pb ~]# yum install -y ntpdate
```

## 二、同步时间

```bash
// 方式一、使用域名连接，要经过DNS解析，速度慢。
[root@pb ~]# ntpdate pool.ntp.org
// 方式二、使用IP连接，超级快。
[root@pb ~]# ntpdate 120.24.81.91
```
http://www.pool.ntp.org是NTP的官方网站,在这上面我们可以找到离我们国家的NTP Server cn.pool.ntp.org.它有3个服务器地址：
服务器一： 1.cn.pool.ntp.org
服务器二： 2.asia.pool.ntp.org
服务器三： 3.asia.pool.ntp.org
（直接用域名有时有问题，可以先Ping出他们的IP，然后用IP地址同步）

// 出现以下信息说明成功
```bash
Feb 21:23:06 ntpdate[62910]: step time server 182.92.12.11 offset -40.589470 sec
```

### 三、将系统时间写入到系统硬件当中，避免重启服务器时间覆盖

// 显示hardwareclock系统硬件时间
```
[root@pb ~]# hwclock
```
// 将系统时间写入到系统硬件当中
```
[root@pb ~]# hwclock -w
```

### 四、设定计划任务同步网络时间

#### 方式1：写在/etc/crontab里
代码:
```
11 * * * root ntpdate 210.72.145.44
```
每天11点与中国国家授时中心同步时间
每天11点与中国国家授时中心同步时间
当然前提是
```
apt-get install ntpdate
```
代码也可是
```
11 * * * root ntpdate us.pool.ntp.org
```

#### 方式2：使用命令crontab -e
```
crontab -e
10 5 * * * root ntpdate us.pool.ntp.org;hwclock -w
```
这样每天5:10自动进行网络校时，并同时更新BIOS的时间
