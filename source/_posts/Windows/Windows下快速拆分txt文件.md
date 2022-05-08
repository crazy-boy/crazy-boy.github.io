---
title: Windows下快速拆分txt文件
tags:
  - Windows
  - 文件拆分
categories: Windows
abbrlink: 53g$Y3441
date: 2022-05-08 16:37:12
updated: 2022-05-08 16:37:12
---
有时候，需要把一个大的txt文件拆分为多个小文件，并行处理文件里的内容，来提高工作效率。下面介绍一下在windows下的拆分方法。

现在有个a.txt文件，里面有若干行内容，现要拆分为多个小文件
![](/images/split_txt_1.png)

## 操作步骤
### 1、在文件所在目录打开git bash；
### 2、创建一个文件夹
![](/images/split_txt_2.png)
### 3、执行命令
``` bash
split -l 5 -d -a 1 a.txt tmp/m_ && cd tmp/ && ls|grep m_|xargs -n1 -i{} mv  {} {}.txt
``` 
命令分解：
``` bash
-l 5 ：按行分割，每个文件5行
-d ：添加数字后缀，如00,01
-a 1 : 用一位数据来顺序命名(从0开始)
tmp/ ：拆分后的文件放在tmp目录下
m_ ：拆分后的文件名前缀
&& cd tmp/ && ls|grep m_|xargs -n1 -i{} mv  {} {}.txt ：进入tmp目录，对拆分后的文件添加扩展名txt(默认生成的文件是没有扩展名的)
``` 
### 4、在tmp目录下就看到生成的文件了
![](/images/split_txt_3.png)

注：对xlsx文件拆分有问题