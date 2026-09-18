---
title: git status  出现.orig文件解决办法
tags: [Git]
categories: [Git]
abbrlink: 'git-resolve-orig'
date: 2026-09-18 00:00:00
updated: 2026-09-18 00:00:00
---
git status  出现.orig文件解决办法：
# On branch develop
# Your branch is ahead of 'origin/develop' by 199 commits.
#   (use "git push" to publish your local commits)
#
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#
#	modified:   aa.php
#
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#
#	bb.php.orig

1. rm bb.php.orig

2.
git add bb.php
git add aa.php
git commit -m "解决冲突"



git status
# On branch develop
# Your branch is ahead of 'origin/develop' by 316 commits.
#   (use "git push" to publish your local commits)
#
nothing to commit, working directory clean