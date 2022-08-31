---
title: Linux下网络相关的命令
tags: [网络]
categories: Linux
abbrlink: 'network-command-on-linux'
date: 2021-01-07 09:20:00
updated: 2021-01-07 09:20:00
---
## 1、检测IP/域名是否连通：
```shell
ping -c 4 192.168.10.8  #指定ping的次数  -c times
ping -q -c 4 www.baidu.com  #只显示结果  -q
```

## 2、测试端口的连通性：
```shell
telnet ip port  #如果未安装telnet，需执行yum install telnet进行安装
```