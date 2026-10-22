---
title: Linux常用命令
tags: [Linux]
categories: Linux
abbrlink: 'linux-common-commands'
date: 2018-06-04 11:15:00
updated: 2026-10-22 10:00:00
---

本人编程多年，一直对Linux操作不熟练，主要原因是命令不熟悉，为方便记忆，现罗列一些常用的命令：

### 操作文件
 - 创建文件夹：` mkdir dir`
 - 删除文件夹：` rm -rf dir`   -r向下递归，-f强制删除
 - 创建文件：` touch a.txt`
 - 删除文件：` rm -f /var/log/a.txt`
 - 追加内容到文件：` echo sssss >> a.txt`
 - 插入内容：`vi text.txt =》按i =》插入内容 =》按Esc =》:wq`
 - 查看文件的行数：`wc -l xx.txt`
 - 查看文件里有多少个word：`wc -l xx.txt`
 - 顺序查看指定文件的内容：`cat xx.php`
 - 倒序查看指定文件的内容：`tac xx.log`

### 系统操作
 - 修改密码
  1. 选择要修改密码的用户名，以root用户为例
   `passwd root`
  2. 输入2次一样的新密码，当提示更新成功即可。
   ![](/images/linux_command_1.png)

 - 查看系统环境
    ```shell
    [root@VM_0_7_centos ~]# cat /etc/redhat-release 
    CentOS Linux release 7.6.1810 (Core) 
    [root@VM_0_7_centos ~]# uname -a
    Linux VM_0_7_centos 3.10.0-957.27.2.el7.x86_64 #1 SMP Mon Jul 29 17:46:05 UTC 2019 x86_64 x86_64 x86_64 GNU/Linux
    ```
    从上述结果可以看出：系统为CentOS 7.6 内核为3.10.0-957.27.2.el7.x86_64
    
### 日志操作
 - 实时查看日志：`tail -f xx.log`
 - 实时查看日志最后100行的内容： `tail -f -n 100 xx.log`
 - 查询最后100行的内容：`tail -n 100 xx.log`
 - 查询100行之后的所有内容：`tail -n +100 xx.log`
 - 查看文件的前10行：`head -n 10 xx.log`
 - 查询除最后100行外的内容：`head -n -100 xx.log`
 - 根据关键字查询日志：`cat -n xx.log |grep "charge"`   可以得到关键字日志的行号和内容
 - 根据关键字查询日志并获取最后5行：`grep 'charge' xx.log |tail -n 5`
 - 根据关键字查询日志内容：`grep 'charge' xx.log`   不返回行号，如果为空，则说明日志中无此关键字
  - 如果日志太多，可分页查看：`cat -n xx.log |grep 'charge' | more`  按空格键进行翻页
  - 如果日志太大，也可以只把关键字部分保存到文件中，提取下来，命令如下：
       `cat -n xx.log |grep 'charge' > aa.txt`
       然后下载下来：`sz aa.txt`
       最后删除文件：`rm -f aa.txt `
    
    

### 查看当前工作目录：pwd

在服务器上执行相对路径命令前，可以先用 `pwd` 确认自己在哪个目录：

```shell
pwd
# 示例输出：/var/www/blog
```

它显示当前工作目录的绝对路径，不是当前脚本文件所在目录。经过符号链接进入目录时，在常见的 Bash 环境中，`pwd -L` 显示逻辑路径，`pwd -P` 显示解析符号链接后的物理路径：

```shell
pwd -L
pwd -P
```

### 其他命令
 - 清空当前界面信息：`clear` 或者 Ctrl+L
 - 显示当前时间：`date`
 - 查看历史命令：`history`
 - Tab键：自动补齐，按两下是查询相同前缀的目录或文件
 - more的辅助操作：按空格键进行翻页
 - less的辅助操作：按空格键进行翻页   [up]向上滚动一行   [down]或者回车先后滚动一行   Q：退出
 - linux下，删除整行命令 Ctrl + U
   作用：删除从光标位置到行首的所有内容（如果光标在行首，则删除整行）。
   适用场景：无论光标在行中的哪个位置，都能一键清空整行。
- tail -n 100 日志文件.log
    持续查看新增日志：tail -n 100 -f 日志文件.log

## vi / Vim 基本编辑操作

先按 `Esc` 回到普通模式，再使用下面的按键：

| 操作 | 按键 |
| --- | --- |
| 删除当前行 | `dd` |
| 删除光标所在字符 | `x` |
| 撤销上一次修改 | `u` |
| 向后查找文本 `my` | 输入 `/my`，再按 Enter |
| 跳到下一个匹配 | `n` |
| 跳到上一个匹配 | `N` |
| 进入插入模式 | `i` |
| 保存并退出 | 输入 `:wq`，再按 Enter |

查找输入默认按模式解释，正则特殊字符可能需要转义。`dd`、`x` 也会影响 Vim 寄存器中的内容，并不只是屏幕上消失几个字符。参考 [Vim 官方快速参考](https://vimhelp.org/quickref.txt.html)。

## 添加常用快捷命令

以下以 Bash 为例；如果使用 Zsh 等其他 shell，配置文件和部分规则需要对应调整。

### 方法一：alias 与函数

在 `~/.bashrc` 中添加：

```bash
alias pull_bfc='cd /var/www/bingocash && git pull --ff-only origin develop'
```

加载配置后，在当前交互式 Bash 中使用：

```bash
source ~/.bashrc
pull_bfc
```

这里 `&&` 保证切换目录成功后才执行后面的命令。`--ff-only` 表示只接受快进合并，遇到分叉会停止，避免快捷命令自动创建合并提交。应使用有权操作仓库的账号，不必默认给 `git pull` 加 `sudo`。

alias 的名字不能含空格；需要接受参数或组织多步逻辑时，可以定义函数。函数名也不能随意包含空格，通常使用字母、数字和下划线等常规标识符：

```bash
pull_bfc_branch() (
    cd /var/www/bingocash || exit 1
    git pull --ff-only origin "${1:-develop}"
)
```

函数体使用子 shell 的括号形式，里面的 `cd` 不改变调用者目录；普通 alias 中的 `cd` 则会改变当前 shell 的工作目录。这个函数只能在已准备好的项目中使用，参数还应遵守团队的分支约定。

### 方法二：放到 PATH 目录中的脚本

可以先为当前用户创建 `~/.local/bin/tt` 文件，写入实际需要的命令，例如：

```bash
#!/usr/bin/env bash
set -euo pipefail

cd /var/www/bingocash
git pull --ff-only origin develop
```

脚本保存为适合 Linux 的换行格式，赋予执行权限：

```bash
chmod 755 ~/.local/bin/tt
```

确认 `~/.local/bin` 在 `PATH` 中。若没有，可以在适合的 shell 配置文件中添加：

```bash
export PATH="$HOME/.local/bin:$PATH"
```

重新加载配置后可运行 `tt`，用 `command -v tt` 检查实际匹配到哪个命令。目录未在 PATH 时，也可以用完整路径 `~/.local/bin/tt` 执行。

系统范围的命令可以由管理员将已审核脚本安装到 `/usr/local/bin`，例如：

```bash
sudo install -m 755 tt /usr/local/bin/tt
```

这要求当前目录确实有待安装的 `tt` 文件，并应先确认不会覆盖其他命令。不要为了“能执行”就使用 `chmod 777 -R`：普通脚本通常不需要递归操作，也不应该允许所有用户改写内容。`755` 表示所有者可读、写、执行，其他人可读、执行；含敏感内容时还需更严格地控制读取权限。

## 切换用户与 root shell

```shell
su account_name       # 切换为指定账号，通常保留部分当前环境
su - account_name     # 使用目标账号的登录环境
sudo -i              # sudo 策略允许时进入 root 登录 shell
sudo su              # 也可得到 root shell，但两层调用通常没有必要
exit                 # 退出当前切换出的 shell
```

`su` 通常按目标账号及 PAM 配置验证身份，`sudo` 按 sudo 策略授权，常见配置验证当前用户身份。普通账号不是执行这些命令就天然拥有 root 权限；目标账号状态、密码和系统策略都会影响结果。

只需完成一项管理操作时，可以使用 `sudo 具体命令`，减少长期停留在 root shell 中的需要。参考 [su 手册](https://man7.org/linux/man-pages/man1/su.1.html) 和 [Bash 手册](https://www.gnu.org/software/bash/manual/bash.html)。

## systemd 服务管理速记

下面假设系统使用 systemd，并且对应服务已经安装；unit 名以机器实际配置为准：

```shell
sudo systemctl start nginx
sudo systemctl status nginx
sudo systemctl enable nginx
sudo systemctl enable php-fpm
sudo systemctl enable docker
sudo systemctl status docker
```

| 子命令 | 用途 |
| --- | --- |
| `start` | 当前启动服务，不自动等于开机自启 |
| `status` | 查看服务状态与部分日志 |
| `enable` | 设置启动关联，本身不等于立即启动 |
| `enable --now` | 同时设置启动关联并立即启动 |

当前已是有权限的 root 用户时通常可以省略 sudo；普通用户能否操作取决于授权策略。`sudo -s` 进入由 sudo 启动的 shell，通常不同于 `sudo -i` 的登录环境；用完后通过 `exit` 退出。

`systemctl status` 返回失败状态时可能产生非零退出码，这是状态信息的一部分。容器、部分 WSL 或其他 init 系统不一定能直接使用这些命令。参考 [systemctl 官方手册](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html)。

## 主机与资源检查

```shell
whoami           # 当前有效用户名
cat /etc/hosts   # 查看本地 hosts 映射
free -m          # 以 MiB 展示内存统计
top              # 持续观察进程与系统负载
ls               # 列出当前目录的非隐藏条目
```

`/etc/hosts` 只是名称解析来源之一，具体优先级还受系统解析配置影响。`free` 中空闲内存较小不一定表示内存不足，要结合可用内存、缓存、交换和工作负载判断。
