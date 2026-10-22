---
title: PHP运维笔记
tags: [运维]
categories: [PHP]
abbrlink: 'php-operate-note'
date: 2019-03-20 17:37:00
updated: 2026-10-22 10:00:00
---

### 1. 常见命令
    查看PHP扩展：`php -m`
    查看扩展的版本信息：`php -ri 扩展名`  如：`php -ri redis`

## 区分 CLI 与 PHP-FPM 的运行环境

```shell
php -v             # CLI 版本
php -m             # CLI 扩展
php --ini          # CLI 加载的配置路径
php-fpm -v         # 对应 FPM 可执行文件的版本
php-fpm -m         # 对应 FPM 环境加载的模块
```

FPM 可执行文件可能带版本后缀，先确认真实路径。CLI 和 Web 请求使用的 PHP 版本、配置文件、扩展可能不同，不能仅凭 `php -m` 就确认网页环境已启用某个扩展。必要时通过受控的应用诊断检查实际 SAPI，不要长期公开 phpinfo 页面。

### 查找进程与配置

```shell
ps aux | grep '[p]hp-fpm'
pgrep -af php-fpm
```

`ps aux | grep fpm | wc -l` 可能把 grep 本身、其他匹配项也算进去；即使排除了 grep，得到的也只是匹配进程数，不等于当前活跃请求数。多 pool、多实例还会影响统计口径。

RPM 系统中 pool 配置常见于 `/etc/php-fpm.d/www.conf`，但并不是通用路径。修改前先核对实例加载的主配置和 include 规则，再用该实例的 `php-fpm -t` 检查语法，按服务约定 reload 或 restart。

### 安装 Xdebug 要匹配 PHP 版本和安装来源

历史命令 `yum install php72-xdebug` 中的包名依赖当时的软件源，不是所有系统都能使用。不要为安装扩展而把正在运行的 PHP 隐式换成另一个来源或版本。

安装前核对 PHP 版本、发行版仓库或 PECL 的支持情况；安装后分别检查 CLI 和 FPM 的扩展加载状态。排查流程参考 [PHP 命令行选项](https://www.php.net/manual/en/features.commandline.options.php) 和 [Xdebug 安装说明](https://xdebug.org/docs/install)。
