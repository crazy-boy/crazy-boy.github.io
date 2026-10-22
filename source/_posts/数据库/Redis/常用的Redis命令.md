---
title: Redis笔记
tags: [Redis]
categories: [Redis]
abbrlink: 'redis-note'
date: 2022-05-19 10:40:00
updated: 2026-10-22 10:00:00
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

### monitor监控
在项目中有时候需要查看某个redis数据的情况，可以使用monitor来监控
![](/images/redis_monitor_1.png)
上述代码是在redis里监控key包含`pay_center_pay_methods`的信息，发现在db3里有被get一次。

## 用 PING 检查连接与基本响应

```shell
redis-cli -h redis.example.com -p 6379 ping
```

正常响应通常为 `PONG`。直接执行 `redis-cli` 则通常进入连接默认本地地址和端口的交互模式；它只是客户端，不会自动启动 Redis 服务。

如果服务需要认证，裸 PING 可能返回认证错误；如果要求 TLS，还要配置 TLS、证书与相应端口。可按客户端支持情况使用 `--user`、`--askpass`、`--tls` 等参数，避免把密码直接写进命令历史。

`PONG` 只能说明本次连接和命令得到了响应，不证明持久化、复制、集群或业务读写都健康。连接超时、拒绝连接、认证失败也应分别排查。参考 [Redis PING](https://redis.io/docs/latest/commands/ping/) 和 [Redis CLI](https://redis.io/docs/latest/develop/tools/cli/)。
