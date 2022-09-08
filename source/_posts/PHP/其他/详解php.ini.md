---
title: 详解php.ini
tags: [PHP]
categories: PHP
abbrlink: 'php-ini-config'
date: 2020-07-12 19:44:25
updated: 2020-07-12 19:44:25
---

1. safe_mode_exec_dir 
    设置安全模式下脚本可执行的目录，如果要通过popen()、system()、exec()等执行脚本，则该脚本需放在本配置设置的目录下。