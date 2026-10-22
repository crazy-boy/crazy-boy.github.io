---
title: PHP中，Supervisor的使用详解
tags: [php,supervisor]
categories: [php]
abbrlink: 'supervisor'
date: 2024-03-18 10:25:00
updated: 2026-10-22 10:00:00
---

Supervisor 用来管理进程的启动、退出和重启。在 PHP 项目里，常见用途是管理队列 worker、常驻任务等前台运行的程序；系统已经用 systemd 管理 PHP-FPM 时，不应再同时交给 Supervisor 重复管理。

## 一、安装方式要统一

Ubuntu/Debian 可以根据发行版仓库安装：

```shell
sudo apt install supervisor
```

RPM 系统则取决于发行版及启用的仓库，历史环境可能使用 `sudo yum install supervisor`；较新的环境可能使用 `dnf`。`epel-release` 只适用于对应的 Enterprise Linux 生态和版本，不能在任意系统上照搬。仓库方式安装通常会提供配置与服务集成，具体路径应以安装包为准。

也可使用隔离的 Python 环境安装：

```shell
python3 -m venv ~/.venvs/supervisor
~/.venvs/supervisor/bin/python -m pip install supervisor
```

历史命令 `pip3 install supervisor==4.2.1` 是固定旧版本的写法，只有项目确实需要时才使用；它不表示当前推荐版本。使用 `python3 -m pip` 能明确对应的 Python，直接运行 `pip3` 通常只是显示用法。不要在未了解系统 Python 管理方式时混用仓库安装和 `sudo pip3 install`。

venv 安装不会自动为你创建 systemd unit，也不代表普通账号已能访问系统配置或管理其他用户的进程。参考 [Supervisor 安装文档](https://supervisord.org/installing.html)。

## 二、生成配置与 sudo 重定向

`echo_supervisord_conf` 将示例配置输出到标准输出；它不负责启动服务。使用上面的 venv 时，可以先生成一个普通用户可查看的文件：

```shell
~/.venvs/supervisor/bin/echo_supervisord_conf > supervisord.conf.example
```

确认系统目标文件不存在或已经妥善备份，再按需要编辑并安装配置。下面仅演示初次写入系统路径的权限方式：

```shell
~/.venvs/supervisor/bin/echo_supervisord_conf | sudo tee /etc/supervisord.conf > /dev/null
```

原来的 `sudo echo_supervisord_conf > /etc/supervisord.conf` 不一定有效：`>` 由当前 shell 在执行 sudo 命令前处理，写文件的权限没有因为命令前加 sudo 而自动提升。`tee` 的方式仍会覆盖目标文件，不能直接用来刷新已有业务配置。

常见路径有 `/etc/supervisord.conf`、`/etc/supervisor/supervisord.conf`，应检查实际安装来源，并通过 `-c` 明确使用哪个文件。

## 三、受管程序应在前台运行

下面是队列 worker 的配置示意，路径、运行账号和日志目录需要按项目准备：

```ini
[program:queue-worker]
command=/usr/bin/php /var/www/app/artisan queue:work --sleep=3 --tries=3
directory=/var/www/app
user=app
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/queue-worker.log
```

Supervisor 需要能跟踪实际进程，不应给命令再加 `&`。配置中开启 `redirect_stderr` 后，标准错误会合并到标准输出，不必再同时指定独立的错误日志文件。

Supervisor 可以根据退出状态重启程序，但不会天然保证业务任务执行成功或自动提供完整告警。优雅停止、重试、重复消费和日志轮转仍需按程序行为配置。

## 四、启动守护进程与管理子进程

若使用软件包提供的 systemd 服务，先核对 unit 名；一些发行版叫 `supervisor`，另一些叫 `supervisord`。启动的是 `supervisord` 守护进程，而 `supervisorctl` 是连接它进行管理的客户端。

在守护进程已经运行、配置路径正确且账号有权限的前提下：

```shell
supervisorctl -c /etc/supervisord.conf status
supervisorctl -c /etc/supervisord.conf reread
supervisorctl -c /etc/supervisord.conf update
supervisorctl -c /etc/supervisord.conf start queue-worker
supervisorctl -c /etc/supervisord.conf restart queue-worker
```

`reread` 读取配置变化，`update` 应用变化，可能涉及程序组重启；`start all` 启动受管程序，不是启动 supervisord 本身。`reload` 通常会重启 supervisord 和受管进程，不能笼统称为无中断“热重启”。

Web 管理界面只有配置了相应 HTTP server 才可用，不存在通用的默认 `user/password` 凭据。需要使用时应配置认证与访问范围，不能假定它默认监听 `9001`。参考 [Supervisor 配置说明](https://supervisord.org/configuration.html)。
