---
title: Linux常用命令
tags: [Linux]
categories: Linux
abbrlink: 'linux-common-commands'
date: 2018-06-04 11:15:00
updated: 2022-06-06 19:35:00
---
编程多年，一直对Linux操作不熟练，主要原因是命令不熟悉，为方便记忆，现罗列一些常用的命令：

### 操作文件
 - 创建文件夹：` mkdir dir`
 - 删除文件夹：` rm -rf dir`   -r向下递归，-f强制删除
 - 创建文件：` touch a.txt`
 - 删除文件：` rm -f /var/log/a.txt`
 - 追加内容到文件：` echo sssss >> a.txt`
 - 插入内容：`vi text.txt =》按i =》插入内容 =》按Esc =》:wq`
 - 查看文件的行数：`wc -l xx.txt`
 - 查看文件里有多少个word：`wc -l xx.txt`
 - 顺序查看指定文件的内容：`cat xx.php`
 - 倒序查看指定文件的内容：`tac xx.log`

### 系统操作
 - 修改密码
  1. 选择要修改密码的用户名，以root用户为例
   `passwd root`
  2. 输入2次一样的新密码，当提示更新成功即可。
   ![](/images/linux_command_1.png)

 - 查看系统环境
    ```shell
    [root@VM_0_7_centos ~]# cat /etc/redhat-release 
    CentOS Linux release 7.6.1810 (Core) 
    [root@VM_0_7_centos ~]# uname -a
    Linux VM_0_7_centos 3.10.0-957.27.2.el7.x86_64 #1 SMP Mon Jul 29 17:46:05 UTC 2019 x86_64 x86_64 x86_64 GNU/Linux
    ```
    从上述结果可以看出：系统为CentOS 7.6 内核为3.10.0-957.27.2.el7.x86_64
    
### 日志操作
 - 实时查看日志：`tail -f xx.log`
 - 实时查看日志最后100行的内容： `tail -f -n 100 xx.log`
 - 查询最后100行的内容：`tail -n 100 xx.log`
 - 查询100行之后的所有内容：`tail -n +100 xx.log`
 - 查询头10行的内容：`head -n 10 xx.log`
 - 查询除最后100行外的内容：`head -n -100 xx.log`
 - 根据关键字查询日志：`cat -n xx.log |grep "charge"`   可以得到关键字日志的行号和内容
 - 根据关键字查询日志并获取最后5行：`grep 'charge' xx.log |tail -n 5`
 - 根据关键字查询日志内容：`grep 'charge' xx.log`   不返回行号，如果为空，则说明日志中无此关键字
  - 如果日志太多，可分页查看：`cat -n xx.log |grep 'charge' | more`  按空格键进行翻页
  - 如果日志太大，也可以只把关键字部分保存到文件中，提取下来，命令如下：
       `cat -n xx.log |grep 'charge' > aa.txt`
       然后下载下来：`sz aa.txt`
       最后删除文件：`rm -f aa.txt `
    
    

### 其他命令
 - 清空当前界面信息：`clear` 或者 Ctrl+L
 - 显示当前时间：`date`
 - 显示当前路径：`pwd`
 - 查看历史命令：`history`
 - Tab键：自动补齐，按两下是查询相同前缀的目录或文件
 - more的辅助操作：按空格键进行翻页
 - less的辅助操作：按空格键进行翻页   [up]向上滚动一行   [down]或者回车先后滚动一行   Q：退出