---
title: Git使用笔记
tags: [Git]
categories: [Git]
abbrlink: 'git-notes'
date: 2018-04-25 13:55:00
updated: 2026-10-22 10:00:00
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




2. ​直接基于 feature/v30 创建新 develop 分支​
   git checkout feature/v30             # 切换到feature/v30分支
   git branch -D develop                # 强制删除本地develop分支（谨慎！）
   git checkout -b develop              # 基于feature/v30创建新的develop分支

删除远程 develop 分支 	git push origin --delete develop

3. ​强制推送到远程（如果需要）​​
   git push origin develop --force      # 强制覆盖远程develop分支（确保团队知晓！）

sudo -s
git checkout develop -f
git branch
git pull
git status
git pull origin develop


git stash  # 保存当前更改
git checkout -f master
git branch -D develop  # 强制删除本地 develop 分支
git checkout -b develop  # 从当前分支创建并切换到 develop 分支
git branch -a

# 1. 首先中止当前的合并（如果正处于冲突状态）
git merge --abort

# 2. 重新执行合并，但指定在遇到冲突时全部使用 feature/v87 的代码
git merge -X theirs origin/feature/v87


git reset HEAD

git checkout master
git  branch -D develop
git pull
git checkout develop







git  远程有代码未拉下来导致代码无法提交，怎么办  提示为：Updates were rejected because the tip of your current branch is behind its remote counterpart.


这个错误表明你的本地分支 `feature/v28` 比远程分支 `feature/v28` 落后（`non-fast-forward`），Git 默认不允许直接覆盖远程代码，所以拒绝推送。

**解决方法**
**1. 先拉取远程代码并合并（推荐）**
```bash
git pull origin feature/v28
```
• 如果没有冲突，Git 会自动合并远程代码到本地。

• 如果有冲突，Git 会提示你手动解决冲突，然后 `git add` 和 `git commit` 合并后的代码。


**2. 再次尝试推送**
```bash
git push origin feature/v28
```

---

**3. 如果不想合并（强制覆盖远程分支，慎用！）**
如果你确定远程分支的代码不需要保留，可以强制推送（会覆盖远程分支）：
```bash
git push origin feature/v28 --force
# 或更安全的强制推送（推荐）
git push origin feature/v28 --force-with-lease
```
⚠️ 注意：强制推送会覆盖远程分支，可能导致其他人的代码丢失，仅在你完全确定远程分支不需要保留时使用！

---

**总结**
| 情况 | 解决方案 |
|------|----------|
| 远程有更新，你想合并 | `git pull origin feature/v28` → 解决冲突 → `git push origin feature/v28` |
| 远程有更新，但你不想合并（强制覆盖） | `git push origin feature/v28 --force-with-lease`（谨慎使用） |
| 远程没有更新，但 Git 仍然报错 | 可能是缓存问题，尝试 `git fetch` + `git rebase` |

推荐做法：先 `git pull` 合并远程代码，再 `git push`，避免覆盖他人代码。

## git reset：分支、暂存区与工作区

使用前先区分三份状态：当前提交 `HEAD`、暂存区（index）和工作区。下面讨论的是 `git reset [模式] <提交>` 这种重置提交的形式；正常附着分支时，它会移动当前分支指向，分离 HEAD 时则只移动 HEAD。

| 模式 | HEAD／当前分支指向 | 暂存区 | 工作区 |
| --- | --- | --- | --- |
| `--soft` | 移到目标提交 | 保持不变 | 保持不变 |
| `--mixed`（默认） | 移到目标提交 | 重置为目标提交的内容 | 保持不变 |
| `--hard` | 移到目标提交 | 重置为目标提交的内容 | 按目标提交重置受跟踪内容 |

例如下面三条是独立选择的示例，不是依次执行的步骤：

```shell
# 撤回最近一次提交，但保留暂存区与工作区现状。
git reset --soft HEAD~1

# 撤回最近一次提交，保留工作区，差异通常变成未暂存修改。
git reset --mixed HEAD~1

# 丢弃受跟踪文件的本地修改，重置到指定提交；执行前确认要保留的内容。
git reset --hard HEAD~1
```

`--hard` 还可能删除妨碍写入目标提交的未跟踪文件或目录，但它并不是通用的“清理所有未跟踪文件”命令。不能假定未提交内容总能从 reflog 找回：reflog 主要记录引用移动，不会替工作区保存全部历史。

### 只取消暂存某个文件

```shell
git reset HEAD -- path/to/file.php
```

这种带路径的形式重置的是该路径的暂存状态，不移动 HEAD，也不改变工作区。较新 Git 也可使用：

```shell
git restore --staged -- path/to/file.php
```

### 已共享的提交要考虑协作影响

reset 不会自动修改远端，但后续强制推送可能改写大家正在使用的历史。如果目的是撤销已共享提交带来的变更，可根据情况选择 `git revert` 新建反向提交。操作前先用 `git status`、`git diff`、`git diff --cached` 核对三份状态。

参考：[Git reset 官方文档](https://git-scm.com/docs/git-reset)。

## 身份配置、SSH 与分支命令

### 提交者信息与登录身份不同

```shell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

这两项用于提交记录中的身份信息，并不是登录 GitHub 的账号密码。`--global` 影响当前用户的默认配置；只想配置当前仓库时省略它。

SSH 密钥应先检查已有文件，再生成新密钥，避免覆盖原有密钥。服务支持时，可参考 GitHub 文档使用：

```shell
ssh-keygen -t ed25519 -C "you@example.com"
```

旧环境有兼容需要时也可按服务要求使用 RSA，例如 `ssh-keygen -t rsa -b 4096 -C "you@example.com"`。`-C` 是注释，不是身份认证本身；需妥善保存私钥，并将公钥配置到对应服务。参考 [GitHub SSH 密钥说明](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)。

### 查看状态与分支

```shell
git status
git branch -a
```

`branch -a` 显示本地分支和本地保存的远端跟踪引用，不会主动获取远端最新状态。需要更新这些信息时可按工作流程执行 `git fetch origin`。

### 合并另一条分支

```shell
git merge master-ios
```

它把指定分支合并到当前检出的分支，不会自动切换分支。`master-ios` 只是历史项目的分支名，使用前要核对当前分支和目标引用。

如果确实要连接两套没有共同祖先的历史，Git 提供：

```shell
git merge master-ios --allow-unrelated-histories
```

这是明确允许合并无关历史的选项，不是普通冲突或所有合并失败的通用修复。`--allow-urelated-histories` 少了字母 `n`，是拼写错误。遇到意外报错时应先确认远端、分支和仓库来源，而不是反复加此参数重试。参考 [git merge 文档](https://git-scm.com/docs/git-merge)。

### 普通推送与历史改写

```shell
git push -u origin master
```

这会推送本地 `master`，并设置相应的上游关系；它不一定是推送当前分支。项目使用其他分支名时应替换目标。

历史命令 `git push origin master:master --force` 中，冒号左侧是本地来源、右侧是远端目标，`--force` 会尝试绕过通常的非快进保护，可能覆盖协作者的提交，也可能被服务端规则拒绝。

确实需要改写已共享历史时，应先协调并核对远端状态，通常优先考虑带期望检查的 `--force-with-lease`：

```shell
# 仅适用于已确认需要改写此远端分支历史的情况。
git push --force-with-lease origin master:master
```

它能提供一定的并发更新保护，但不保证业务上“安全”，未显式指定期望值时还依赖本地远端跟踪引用的状态；后台 fetch 等行为也可能影响保护前提。不能把它作为普通推送失败后的固定下一步。参考 [git push 文档](https://git-scm.com/docs/git-push)。
