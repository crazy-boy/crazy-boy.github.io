---
title: Redis笔记
tags:
  - Redis
categories: Redis
abbrlink: 'redis-note'
date: 2022-05-19 10:40:00
updated: 2022-05-19 10:40:00
---

### 安装redis客户端
`yum install redis`

### 查看版本号
`info`
![](/images/redis_note_1.png)

### 通过命令行方式连接redis
`redis-cli -h host -p port -a password`
host:远程redis服务器host
port:远程redis服务端口
password:远程redis服务密码（无密码的的话就不需要-a参数了）
![](/images/redis_note_2.png)

### redis执行lua脚本
![](/images/redis_note_3.png)
![](/images/redis_note_4.png)