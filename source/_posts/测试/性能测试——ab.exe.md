---
title: 性能测试——ab.exe
tags: [ab.exe]
categories: [测试]
abbrlink: 'performance-test'
date: 2022-05-06 17:28:37
updated: 2022-05-06 17:28:37
---
ab.exe是apache server下的一个性能检测小组件，使用方便简单。
使用方法：
### 1. 找到ab.exe的位置
在电脑中找到ab.exe的位置，一般在Apache文件下的bin目录中，我这里的目录路径为：D:\software\phpstudy_pro\Extensions\Apache2.4.39\bin
![](/images/test_ab_1.png)
### 2. 打开cmd
### 3. 进入ab.exe所在目录
![](/images/test_ab_2.png)
### 4. 开始压测
![](/images/test_ab_3.png)

常用参数说明：
-n：请求个数，默认一次一个
-c：并发数
-t：超时限制(秒)，默认不限制

结果分析：
```shell
D:\software\phpstudy_pro\Extensions\Apache2.4.39\bin>ab -n 10 -c 10 http://www.baidu.com/
This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking www.baidu.com (be patient).....done


Server Software:        BWS/1.1
Server Hostname:        www.baidu.com
Server Port:            80    #端口

Document Path:          /
Document Length:        353122 bytes    #请求文件大小

Concurrency Level:      10           #并发数
Time taken for tests:   0.535 seconds    #整个测试所用的时间
Complete requests:      10               #完成的请求数量
Failed requests:        9                #失败的请求数量
   (Connect: 0, Receive: 0, Length: 9, Exceptions: 0)
Total transferred:      3548070 bytes    #整个场景的网络传输量
HTML transferred:       3536205 bytes    #整个场景的HTML传输量
Requests per second:    18.71 [#/sec] (mean)    #平均每秒请求数
Time per request:       534.535 [ms] (mean)     #平均每个请求的响应时间
Time per request:       53.453 [ms] (mean, across all concurrent requests)
Transfer rate:          6482.11 [Kbytes/sec] received    #平均每秒网络上的流量

 # 网络上消耗时间分解
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:       30   34   3.3     34      39
Processing:   151  225  78.4    220     378
Waiting:       35  139  92.2    151     281
Total:        186  260  75.8    254     410

# 下面为整个场景所有请求的响应情况，50%的响应时间小于254毫秒，66%的响应时间小于281毫秒……最长响应时间 410毫秒
Percentage of the requests served within a certain time (ms)
  50%    254
  66%    281
  75%    314
  80%    342
  90%    410
  95%    410
  98%    410
  99%    410
 100%    410 (longest request)

```