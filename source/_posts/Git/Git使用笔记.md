---
title: Git使用笔记
tags: [Git]
categories: Git
abbrlink: 'git-notes'
date: 2018-04-25 13:55:00
---

### 常用命令
```
git pull                #拉取代码到本地
git add .               #将文件添加到暂存区
git commit -m "xx"      #提交代码，并填写描述
git push                #推送代码到远端
git status              #显示所有需提交的文件
git branch              #显示当前代码库中所有的本地分支
git branch xx           #创建一个新分支xx
git branch -d xx        #删除指定分支xx
git checkout xx         #切换到分支xx
git checkout -b xx      #创建一个分支xx，并切换到新分支
git merge xx            #将指定分支xx的历史记录合并到当前分支
git stash save          #临时保存所有修改的文件
git stash pop           #恢复最近一次存储的文件
```

### 文件忽略
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
/upload
```
但有时候忽略文件不起作用，其原因是：git设置本地忽略时，必须保证远程仓库分支上没有这个要忽略的文件；否则本地的ignore将不起作用。
解决方式：删除要忽略的文件并提交远程仓库，ignore该文件。