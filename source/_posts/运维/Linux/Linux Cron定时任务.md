---
title: Linux Cron定时任务
tags:
  - Linux
  - Cron
categories:
  - Cron
abbr link: linux-cron
abbrlink: 9c77
date: 2024-05-22 11:44:00
updated: 2024-05-22 11:44:00
---


## 简介

Cron 是一个用来执行定时任务的工具，可以在指定的时间自动执行重复性任务。

它的核心是 cron 守护进程，名为 crond。它在后台每分钟运行一次，检查是否有需要在指定时间执行的计划任务。

下面命令可以查看 cron 守护进程，是否正常运行。

```shell
$ sudo systemctl status cron
```

## crontab

crond 检查的定时任务，保存在 crontab 文件。该文件的每一行代表一个单独的作业，包含何时运行该任务，以及所要执行的命令。

crontab 分成两个级别：用户个人的crontab，系统的 crontab。前者由用户本人编辑，后者只能由根用户编辑。

系统的 crontab 存放在`/etc/crontab`，以及一系列特殊目录之中：`/etc/cron.daily`、`/etc/cron.hourly`、`/etc/cron.weekly`和`/etc/cron.monthly`。

## cron 任务的语法

crontab 文件的每一行，代表一个 cron 任务。它由多个字段组成，字段之间使用空格或制表符分隔。

cron 任务的基本语法如下。

```bash
minute hour day_of_month month day_of_week command_to_execute
```

各个字段的含义如下。

- minute（0-59）：指定命令运行的分钟，可以是0到59之间的值，0表示将在一小时开始时运行命令。
- hour（0-23）：指定命令运行的小时，以24小时格式指定，例如将其设置为14将在下午2点运行该命令。
- day_of_month（1-31）：指定命令运行的日期。它可以是1到31之间的任意值，具体取决于该月的天数。例如，设置为1将在每个月的第一天运行命令。
- month（1-12）：指定命令将在哪个月份执行。它可以是 1（一月）到 12（十二月）之间的值。例如，设置为12将在12月执行该命令。
- day_of_week（0-6）：指定命令应在一周中的哪一天运行。它可以是0（星期日）到6（星期六）之间的值。例如，设置为5将在每个星期五运行该命令。
- command_to_execute：指定 cron 任务应执行的操作。

crontab 还允许使用通配符。

- 星号 (*)：代表“每个”时间单位。例如，小时字段中的“*”表示“每小时”。
- 逗号 (,)：用于在同一字段指定多个值。例如，day_of_week 字段中的“1,3,5”表示“周一、周三和周五运行”。注意，逗号前后不能由空格。
- 连字符 (-)：指定值的范围。例如，小时字段中的“9-17”表示“上午9点到下午5点之间的每小时”。
- 斜杠 (/)：指定增量。例如，分钟字段中的“*/10”表示“每10分钟”。

crontab 还提供一些快捷字符串。

- @reboot	在启动时运行一次指定的命令 。
- @year，@annually 两者都在每年 1 月 1 日中午 12:00运行指定的任务 。相当于指定“0 0 1 1 *”
- @monthly 每月1 日中午 12:00运行该作业 一次。相当于“0 0 1 * *”
- @weekly 在每周周日中午 12:00运行该作业 一次。相当于“0 0 * * 0”
- @daily，@midnight：两者都在每天中午 12:00运行 cronjob  。这相当于在 crontab 文件中指定“0 0 * * *”。
- @hourly：每小时整点运行该作业 。相当于“0 * * * *”

crontab 文件中，以“#”符号开头的行表示注释。

以下是一些示例。

- `* * * * *`	每分钟运行一次 cron 作业。
- `0 * * * *`	每小时运行一次 cron 作业。
- `0 0 * * *`	每天午夜运行 cron 作业。
- `0 2 * * *`	每天凌晨 2 点运行 cron 作业。
- `0 0 15 * *`	每个月 15 日午夜运行一次 cron 作业。
- `0 0 0 12 *`	周六午夜运行 cron 作业。
- `0 0 * * 6`	从周一到周五每天下午 3 点运行 cron 作业。
- `0 15 * * 1-5`	从周一到周五每天下午 3 点运行 cron 作业。
- `*/5 * * * *`	每 5 分钟运行一次 cron 作业。
- `0 8-16 * * *` 每天、每小时、从上午 8 点到下午 4 点准时执行 cron 作业。
- `0 4 * * 2,4`	在周二和周四凌晨 4 点运行 cron 作业。
- `@reboot`	系统启动时运行 cron 作业。

### 环境变量

cron 任务在非交互式、非登录 Shell 环境中运行，这意味着它们可能无法访问与手动运行命令时相同的环境变量。

这就是说，cron 任务不会自动继承用户或系统的环境变量或路径。这可能会导致 cron 作业失败，无法找到可执行文件或脚本。解决方法是在 crontab 文件中显式设置 PATH 环境变量。

```bash
PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin
```

不过，为了便于调试，建议始终在 cron 任务中使用绝对路径。

除了`PATH`环境变量，还可以设置`SHELL`环境变量，指定 cron 使用的 Shell。

```bash
SHELL=/bin/sh
```

上面示例设定执行 cron 任务时，使用 Bash。

## cron 任务管理

### 个人任务

创建或编辑用户的 crontab 文件，使用下面的命令。

```bash
crontab -e
```

上面的命令会打开系统默认文本编辑器，对用户的 crontab 文件进行编辑。

添加 cron 任务，只需在 crontab 文件中添加一个新行即可。例如，备份脚本 backup.sh 每天凌晨 3:00 运行，就是添加下面的内容。

```bash
0 3 * * * /home/linuxiac/backup.sh
```

编辑完成后，保存并退出编辑器。Cron 服务会自动检查 crontab 文件，因此无需在更改后重新启动 Cron 进程。

`crontab -e`还会在保存和退出文件时，自动检查语法，防止意外输入无效的 cron 任务。

下面命令可以列出当前用户的所有 cron 任务。

```bash
$ crontab -l
```

如果拥有根用户权限，可以查看其他用户的 cron 任务。

```bash
$ sudo crontab -u [用户名] -l
```

上面示例中，`[用户名]`是需要替换的部分。

编辑其他用户的 cron 任务，可以使用命令行参数`-e`。

```bash
$ sudo crontab -u [用户名] -e
```

删除某个 cron 任务时，只要删除那一行即可。如果想要删除所有的 cron 任务，只要删除 crontab 文件即可，也可以使用命令行参数`-r`。

```bash
$ crontab -r
```

上面的命令会删除当前用户的 crontab 文件（即删除所有 cron 任务），而且不会出现任何确认提示，因此请小心使用。

如果希望删除前出现确认提示，则可以使用命令行参数`-i`。

```bash
$ crontab -i -r
```

### 系统任务

创建系统级别的 cron 任务，需要直接编辑`/etc/crontab`文件。

```bash
0  2  *  *  * root /usr/bin/find /var/log/myservice -type f -name '*.log' -delete
```

上面示例设定在每天凌晨2:00，从`/var/log/myservice`目录删除所有带有扩展名为`.log`的文件。

它的格式与用户级别的 cron 文件有一个区别，就是在最初表示时间的五个字段后面，多了一个字段，表示执行任务的用户帐户，本例为`root`。

直接编辑`/etc/crontab`文件有两个缺点。（1）它不提供语法检查，增加了出错的风险。（2）它会影响整个系统，使用时需要非常谨慎。

列出所有的系统级别 cron 任务，需要查看以下所有文件和目录。

- /etc/crontab 文件
- /etc/cron.d/ 目录
- /etc/cron.daily/ 目录
- /etc/cron.hourly/ 目录
- /etc/cron.weekly/ 目录
- /etc/cron.monthly/ 目录

## 参考链接

- [How to Use Cron on Linux: Tips, Tricks, and Examples](https://linuxiac.com/how-to-use-cron-and-crontab-on-linux/)

