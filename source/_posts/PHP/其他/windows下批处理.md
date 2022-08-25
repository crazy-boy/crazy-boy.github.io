---
title: windows下批处理
tags:
  - PHP
categories: PHP
abbrlink: 'php-bat'
date: 2022-03-02 13:22:05
updated: 2022-03-02 13:22:05
---

因工作需要，需要按条件删除指定表中大批量数据，故用php做了个站点页面处理程序，每页处理500条数据，处理后sleep(5)，跳转下一页；但程序运行中可能出现超时页面挂掉的情况，为了减少个人的工作量，就借助windows的任务计划程序，设置每两个小时，关闭浏览器，休眠几秒，再次在浏览器中访问处理程序地址。没想到效果还不错。下面是计划任务的bat程序。
```
TASKKILL /F /IM chrome.exe
ping -n 10 127.0.0.1 > nul
cmd /c start https://manage.lepayedu.com/index.php/my-test/deal-school-entry?page=100
```
![](/images/php_bat_1.png)