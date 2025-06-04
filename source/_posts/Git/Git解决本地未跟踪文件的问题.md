---
title: Git解决本地未跟踪文件的问题
tags: [Git]
categories: Git
abbrlink: 'git-pull-untracked-files'
date: 2025-05-23 15:05:14
updated: 2025-05-23 15:05:14
---


`git pull origin xx` 提示有 `untracked files`，报错如同所示
   ![](/images/git-faq-1.jpg)

这个错误的意思是：Git 发现你的工作目录中有一个未跟踪（untracked）的文件 `app/xx.php`，而远程 `develop` 分支上也有这个文件。Git 不允许直接覆盖它，所以合并失败了。

---

**解决方法**
你有几种选择，取决于这个文件的来源和你的需求：

---

**方法 1：删除本地未跟踪文件（推荐）**
如果这个文件是你不需要的，或者你可以从远程重新获取它，可以删除本地文件后重试：
```bash
rm app/xx.php  # 删除本地文件
git pull origin develop  # 再次尝试拉取
```
或者更安全的方式（避免误删）：
```bash
git clean -n  # 查看哪些文件会被删除（模拟运行）
git clean -f  # 强制删除未跟踪的文件（谨慎使用！）
git pull origin develop
```

---

**方法 2：备份并提交本地文件（如果需要保留）**
如果这个文件是你本地新增的，并且你希望保留它，可以：
1. 提交到你的分支（如果你正在自己的分支上开发）：
   ```bash
   git add app/xx.php
   git commit -m "保存本地新增的 xx.php"
   git pull origin develop
   ```
   • 如果仍然冲突，Git 会提示你合并冲突，你需要手动解决。


2. 或者暂存（stash）你的修改（如果你不想立即提交）：
   ```bash
   git stash -u  # -u 表示包括未跟踪的文件
   git pull origin develop
   git stash pop  # 恢复暂存的修改（可能会冲突）
   ```
   • 如果 `git stash pop` 后有冲突，需要手动解决。


---

**方法 3：重命名本地文件（避免覆盖）**
如果你希望保留本地文件，但不想提交它，可以重命名它：
```bash
mv app/xx.php app/xx.local.php
git pull origin develop
```
然后你可以手动比较两个文件，决定如何合并。

---

**方法 4：强制覆盖本地文件（不推荐）**
如果你确定远程的 `xx.php` 是正确的，并且你不需要本地的修改，可以：
```bash
git fetch origin  # 先获取远程最新代码
git reset --hard origin/develop  # 强制重置到远程分支（会丢失所有未提交的修改！）
```
⚠️ 注意：这个操作会丢弃所有未提交的更改，慎用！

---

**总结**
| 情况 | 解决方案 |
|------|---------|
| 本地文件不需要 | `rm 文件` 或 `git clean -f` 后 `git pull` |
| 本地文件需要保留并提交 | `git add` + `git commit` 后 `git pull` |
| 本地文件需要保留但不提交 | `git stash -u` + `git pull` + `git stash pop` |
| 重命名本地文件避免冲突 | `mv 文件 文件.local` 后 `git pull` |
| 强制覆盖本地文件（危险！） | `git reset --hard origin/develop` |