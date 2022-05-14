---
title: Git忽略文件
tags:
  - Git
  - 文件忽略
categories: Git
abbrlink: f00bf8aa
date: 2018-04-25 13:55:00
---
软件项目使用git提交远程仓库时，如果需要忽略某些文件(如缓存文件、框架核心文件)的变更，可以在项目的根目录下创建.gitignore文件，并罗列需忽略的文件或者文件夹。

如下为PHP Yii2下的.gitignore文件内容：
``` bash
.idea/
.project
.settings
/vendor
assets/
/runtime
/Runtime
.idea/workspace.xml
/upload
```
但有时候忽略文件不起作用，其原因是：git设置本地忽略时，必须保证远程仓库分支上没有这个要忽略的文件；否则本地的ignore将不起作用。
解决方式：删除要忽略的文件并提交远程仓库，ignore该文件。