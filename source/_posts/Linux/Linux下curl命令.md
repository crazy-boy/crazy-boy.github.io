---
title: Linux下curl命令
tags:
  - curl
categories: Linux
abbrlink: 'linux-curl'
date: 2022-07-04 10:42:39
updated: 2022-07-04 10:42:39
---


### 格式

```
curl https://www.baidu.com
```
上面命令向www.baidu.com发出 GET 请求，服务器返回的内容会在命令行输出。

### 常用参数
    
#### -d：使用-d参数向服务器发送POST请求的数据体
```
curl -d 'login=admin＆password=123' -X POST https://www.aa.com/admin/
```
上方的命令向服务器发送（POST）了login=admin＆password=123。但是使用-d参数以后，HTTP 请求会自动加上标头Content-Type : application/x-www-form-urlencoded。并且会自动将请求转为 POST 方法，因此可以省略-X POST。
    
```
curl -d '{"login": "admin", "pass": "123"}' -X 'Content-Type: application/json' https://www.aa.com/admin
```
上方的命令添加了HTTP请求标头：Content-Type:application/json并使用-d参数向服务器发送（POST）了json数据。

#### -H：设置 HTTP头信息
```
curl -H 'Token: xxxx' https://www.aa.com/
```
使用-H参数设置Token为xxxx向服务器发送了GET请求。
    
#### -X：可以指定HTTP请求方法
```
curl -X POST https://www.aa.com/
```
上方的命令向服务器发送了POST请求。

### 参考
https://www.typeboom.com/archives/107/