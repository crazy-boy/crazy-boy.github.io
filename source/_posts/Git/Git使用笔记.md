---
title: Git使用笔记
tags: [Git]
categories: [Git]
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

### git设置
```bash
cat .git/config
git remote set-url origin ssh地址
```



### 当尝试将 feature/v20 分支合并到 develop 分支时，出现大量冲突，希望将 develop 分支的代码直接替换为 feature/v20 分支的代码，可以考虑以下几种方法：

#### 1. **强制重置 develop 分支**
* **警告：** 这会丢失 develop 分支上的所有未提交的更改。请谨慎操作，并确保你已经备份了重要的数据。
* **步骤：**
  ```bash
  git checkout develop
  git reset --hard feature/v20
  ```
    * `git checkout develop`: 切换到 develop 分支。
    * `git reset --hard feature/v20`: 将 develop 分支的 HEAD 指针强制重置到 feature/v20 分支的最新提交，丢弃 develop 分支上的所有本地更改。

#### 2. **重新创建 develop 分支**
* **步骤：**
  ```bash
  git branch -D develop  # 删除现有的 develop 分支
  git checkout feature/v20  # 切换到 feature/v20 分支
  git branch develop/v20  # 基于 feature/v20 分支创建一个新的 develop 分支
  ```
    * 首先删除旧的 develop 分支，然后基于 feature/v20 分支创建一个新的 develop 分支，这样 develop 分支的代码就和 feature/v20 分支完全一致了。

#### 注意事项

* **强制重置或重新创建分支是比较极端的操作**，会丢失数据。在执行之前，请务必确认你已经备份了重要的代码。
* **如果 develop 分支已经被推送到了远程仓库**，那么强制重置会造成历史记录的混乱。建议在本地进行操作，然后再将新的 develop 分支推送到远程。
* **如果 develop 分支上有其他开发者正在协作**，强制重置可能会导致他们的工作丢失。在执行操作之前，请与团队成员进行沟通。

#### 其他建议

* **仔细分析冲突：** 在强制重置之前，可以仔细查看冲突的文件，了解冲突的原因。
* **利用 `git diff` 命令** 比较两个分支之间的差异，帮助你更好地理解代码的变化。
* **考虑使用 `git mergetool`** 来可视化地解决冲突。
* **如果可能，尝试重新创建 feature 分支**，并确保在开发过程中及时合并最新的 develop 分支，以减少冲突发生的频率。


### Git pull 报错 "Please, commit your changes or stash them before you can merge" 的解决方法

#### 出现这个错误的原因：

当你执行 `git pull` 命令时，Git 会尝试将远程仓库的最新更改合并到你的本地分支。但是，如果你在本地分支上有一些未提交的修改，Git 就会拒绝合并，因为这可能会导致冲突。所以，Git 会提示你：请先提交你的修改或者将它们暂存起来，然后再进行合并。

#### 解决方法：

##### 1. **提交你的修改**
* **查看修改:** 使用 `git status` 命令查看你有哪些未提交的修改。
* **暂存修改:** 使用 `git add <文件名>` 或 `git add .` 将修改暂存。
* **提交修改:** 使用 `git commit -m "你的提交信息"` 将暂存的修改提交。
* **拉取远程分支:** 提交完后，再执行 `git pull`。

##### 2. **暂存你的修改**
* **暂存修改:** 使用 `git stash` 命令将当前工作区的所有修改暂存起来。
* **拉取远程分支:** 执行 `git pull`。
* **恢复暂存的修改:** 如果想恢复暂存的修改，可以使用 `git stash pop`。

##### 详细解释：

* **git status:** 查看你当前的工作区状态，哪些文件被修改了，哪些文件被暂存了。
* **git add:** 将你修改的文件添加到暂存区。
* **git commit:** 将暂存区的文件提交到本地仓库。
* **git pull:** 从远程仓库拉取最新的代码，并合并到本地分支。
* **git stash:** 将当前工作区的所有修改暂存起来，但不提交。
* **git stash pop:** 应用最新的 stash，并将它从 stash 栈中删除。

##### 总结

当遇到这个错误时，**最安全的做法是先提交你的本地修改**，然后再执行 `git pull`。如果你不想立即提交，也可以使用 `git stash` 将修改暂存起来。

**选择哪种方法取决于你的具体情况：**

* **如果你想保留这些修改:** 提交或暂存。
* **如果你不想保留这些修改:** 可以直接丢弃这些修改，然后执行 `git pull`。

**注意:**

* **强制覆盖本地修改:** 如果确定要丢弃本地修改，可以使用 `git fetch` 和 `git reset --hard origin/master` (假设远程分支是 master)，但这会覆盖你所有的本地修改，请谨慎操作。
* **解决冲突:** 如果在 `git pull` 的过程中出现冲突，你需要手动解决冲突，然后使用 `git add` 和 `git commit` 来提交解决后的结果。

