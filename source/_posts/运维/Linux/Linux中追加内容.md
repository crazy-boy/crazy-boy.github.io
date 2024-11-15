---
title: Linux中">"和">>"的区别
tags:
  - Linux
categories:
  - Linux
abbrlink: 'linux-add-content'
date: 2023-03-17 11:31:00
updated: 2023-03-17 11:31:00
---
在Linux中，`>`符号用于将输出重定向到文件中，并会覆盖文件中原有的内容。

如果要将输出追加到文件中而不是覆盖原有内容，可以使用`>>`符号。

下面是两个符号的用法示例：

 - `>`符号：覆盖原有内容。
```shell
echo "Hello, World!" > output.txt
```
这将创建一个名为`output.txt`的文件，并将文本`Hello, World!`写入文件。如果该文件已存在，那么原有内容将被覆盖。

 - `>>`符号：追加内容。
```shell
echo "Hello, Again!" >> output.txt
```
这会将文本`Hello, Again!`追加到`output.txt`文件的末尾，而不会覆盖原有内容。

例如：后台运行指定程序，并将输出保存到指定文件里
```shell
nohup php artisan xx xx > nohup.log 2>&1 &
```