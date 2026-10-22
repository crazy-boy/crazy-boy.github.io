---
title: Docker使用
tags: [Docker]
categories: Docker
abbrlink: 'docker-notes'
date: 2018-06-05 09:44:00
updated: 2026-10-22 10:00:00
---

这份笔记记录 Linux 上检查 Docker、启动服务和使用 Compose 的常见命令。安装包名、仓库与服务管理方式依赖发行版，不能把旧服务器上的一串命令当成通用安装脚本。

## 一、安装前先确认环境

```shell
cat /etc/os-release
```

旧笔记中的 `yum install docker`、`yum install docker-compose` 依赖当时配置的软件源，得到的软件和版本未必等同于 Docker 官方仓库的软件。当前安装应按 [Docker Engine 官方安装入口](https://docs.docker.com/engine/install/) 选择对应发行版，先核对支持版本及仓库配置。

例如在已正确配置 Docker 官方仓库的受支持 RPM 系统上，常见安装包包括：

```shell
sudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

这不是添加仓库的完整步骤，也不适用于所有 Linux。历史 Windows 7 的 Docker Toolbox 做法不作为当前安装建议。

## 二、客户端不等于守护进程

```shell
docker --version   # 与 docker -v 一样，查看客户端版本
docker version     # 查看客户端与可访问服务端的信息
docker ps          # 查看运行中的容器
docker ps -a       # 包括已停止的容器
```

`docker &` 只是把客户端命令放到 shell 后台，并不是启动 Docker 服务。常见的 rootful、systemd 安装使用：

```shell
sudo systemctl start docker
sudo systemctl status docker
sudo systemctl enable docker
```

`start` 启动当前服务，`enable` 设置随系统启动；需要同时完成时可以使用 `sudo systemctl enable --now docker`。Rootless Docker、Docker Desktop 或非 systemd 环境的启动方式不同。

`docker ps` 还要求当前账号能访问相应 Docker socket。无权限与服务未启动是不同问题；检查连接目标和权限时，不应直接把 socket 改成所有人可写。

## 三、Compose 插件与旧独立命令

```shell
docker compose version
```

当前官方 Compose 插件使用带空格的 `docker compose`，旧环境常见的独立命令是 `docker-compose`。包名、安装方法以 [Compose 插件安装文档](https://docs.docker.com/compose/install/linux/) 为准，不要仅凭命令外观判断本机已安装什么版本。

进入包含项目 Compose 配置的目录后：

```shell
docker compose up -d
docker compose ps
docker compose logs --tail 100
```

`up -d` 根据配置创建或更新并后台启动服务，不等于只启动一个已经存在的容器；执行前应理解配置中的镜像、端口、卷和环境变量。需要使用旧版项目时，才按其实际工具版本使用 `docker-compose up -d`。
