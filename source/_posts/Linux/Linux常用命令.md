---
title: Linux常用命令
tags:
  - Linux
categories: Linux
abbrlink: d0edc1ed
date: 2018-06-04 11:15:00
updated: 2019-10-26 19:35:00
---
编程多年，一直对Linux操作不熟练，主要原因是命令不熟悉，为方便记忆，现罗列一些常用的命令：

### 1. 创建文件夹
` mkdir dir`

### 2. 删除文件夹
-r向下递归，-f强制删除： ` rm -rf dir`

### 3. 创建文件
` touch a.txt`

### 4. 删除文件
` rm -f /var/log/a.txt`

### 5. 追加内容到文件
` echo sssss >> a.txt`

### 6. 插入内容
vi text.txt =》按i =》插入内容 =》按Esc =》:wq

### 7. 修改密码
   - 选择要修改密码的用户名，以root用户为例
   `passwd root`
   - 输入2次一样的新密码，当提示更新成功即可。
   ![](/images/linux_command_1.png)

### 8. 查看系统环境
```shell
[root@VM_0_7_centos ~]# cat /etc/redhat-release 
CentOS Linux release 7.6.1810 (Core) 
[root@VM_0_7_centos ~]# uname -a
Linux VM_0_7_centos 3.10.0-957.27.2.el7.x86_64 #1 SMP Mon Jul 29 17:46:05 UTC 2019 x86_64 x86_64 x86_64 GNU/Linux
```
从上述结果可以看出：系统为CentOS 7.6 内核为3.10.0-957.27.2.el7.x86_64
