---
title: windows下批处理
tags: [PHP]
categories: [PHP]
abbrlink: 'php-bat'
date: 2022-03-02 13:22:05
updated: 2026-10-19 11:00:00
---

因工作需要，需要按条件删除指定表中大批量数据，故用php做了个站点页面处理程序，每页处理500条数据，处理后sleep(5)，跳转下一页；但程序运行中可能出现超时页面挂掉的情况，为了减少个人的工作量，就借助windows的任务计划程序，设置每两个小时，关闭浏览器，休眠几秒，再次在浏览器中访问处理程序地址。没想到效果还不错。下面是计划任务的bat程序。
```
TASKKILL /F /IM chrome.exe
ping -n 10 127.0.0.1 > nul
cmd /c start https://manage.lepayedu.com/index.php/my-test/deal-school-entry?page=100
```
![](/images/php_bat_1.png)

## 在 CMD 中批量修改扩展名

当前目录中的 `.txt` 文件要统一改成 `.html`，可以在 Windows 的 CMD 中执行：

```bat
ren *.txt *.html
```

它只修改名称，不会把文本内容转换成 HTML，也不会递归处理子目录。操作前应确认目录及已有同名目标文件，避免重名冲突。文件名包含空格时，单个文件的源名称、目标名称应分别用引号包住。

PowerShell 的 `ren` 是另一套命令别名，不能直接假定上面的 CMD 通配符语法适用。在 PowerShell 中可以先预览：

```powershell
Get-ChildItem -File -Filter '*.txt' |
    Rename-Item -NewName { $_.BaseName + '.html' } -WhatIf
```

确认预览结果后，去掉 `-WhatIf` 才会实际重命名。参考 [Microsoft ren 命令文档](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ren)。
