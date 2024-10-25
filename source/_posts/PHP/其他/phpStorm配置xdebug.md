---
title: phpStorm配置xdebug
tags: [phpStorm,xdebug]
categories: [phpStorm]
abbrlink: 'phpstorm-setting-xdebug'
date: 20224-10-23 15:44:02
updated: 20224-10-23 15:44:02
---
<div class="note info">在php开发中，经常遇到一些奇怪的问题，一时半会儿排查不出原因；这时候就需要进行断点调试，xdebug就是常用的一种断点调试工具，下面介绍下如何设置的。</div>

### xdebug设置

1. 开启xdebug扩展，并配置php.ini，重启php
```
[Xdebug]
zend_extension=D:/phpstudy_pro/Extensions/php/php7.1.9nts/ext/php_xdebug.dll
xdebug.collect_params=1
xdebug.collect_return=1
xdebug.auto_trace=Off
xdebug.trace_output_dir=D:/phpstudy_pro/Extensions/php_log/php7.1.9nts.xdebug.trace
xdebug.profiler_enable=Off
xdebug.profiler_output_dir=D:/phpstudy_pro/Extensions/php_log/php7.1.9nts.xdebug.profiler
xdebug.remote_enable=On
xdebug.remote_autostart=1
xdebug.remote_host=127.0.0.1
xdebug.remote_port=9003
xdebug.remote_handler=dbgp
xdebug.remote_connect_back=0
xdebug.idekey=PHPSTORM
```
2. 配置phpStorm
![](/images/xdebug_1.png)
![](/images/xdebug_2.png)
![](/images/xdebug_3.png)
![](/images/xdebug_4.png)

3. 开启xdebug
![](/images/xdebug_5.png)

4. 重启phpStorm，可以愉快地使用了


### 问题排查

如果xdebug不生效，可以检查下配置是否正确
![](/images/xdebug_6.png)


### 常用快捷键

在 PHPStorm 中使用 Xdebug 进行命令行调试时，虽然没有图形界面那么直观，但通过一些快捷键，我们可以高效地控制调试过程。
**注意：** 具体的快捷键可能因 PHPStorm 版本和操作系统而略有不同。可以通过 **Help -> Keymap Reference** 查看当前配置的快捷键。

* **Step Over (F8)：** 执行当前行，如果当前行有函数调用，则不进入函数内部。
* **Step Into (F7)：** 执行当前行，如果当前行有函数调用，则进入函数内部。
* **Step Out (Shift+F8)：** 从当前函数返回。
* **Run to Cursor (Alt+F9)：** 执行代码直到光标所在行。
* **Evaluate Expression (Alt+F8)：** 计算表达式并显示结果。
* **Toggle Line Breakpoint (Ctrl+F8)：** 在当前行设置或取消断点。
* **View Breakpoints (Ctrl+Shift+F8)：** 查看所有断点。

* **Resume Program (F9)：** 继续执行程序直到下一个断点。
* **Pause Program (Ctrl+F2)：** 暂停程序执行。
* **Mute Breakpoints (Ctrl+Shift+N)：** 禁用所有断点。
* **Show Execution Point (Ctrl+Alt+F10)：** 跳转到当前执行行。


### 示例：调试一个 PHP 命令行脚本

1. **设置断点：** 在要调试的代码行设置断点。
2. **配置运行配置：** 在 PHPStorm 中创建一个新的运行配置，选择 PHP，配置好脚本路径、参数等。
3. **启动调试：** 点击运行配置旁边的调试按钮。
4. **使用快捷键控制调试过程：** 根据需要使用上述快捷键进行单步执行、跳过、进入函数等操作。

### 注意
* **Xdebug 配置：** 确保 Xdebug 已正确配置，并且 PHPStorm 的配置与 Xdebug 的配置一致。
* **命令行参数：** 如果脚本需要命令行参数，可以在运行配置中设置。
* **远程调试：** 如果需要调试远程服务器上的代码，需要配置远程调试。

**通过熟练掌握这些快捷键，我们可以更有效地进行 PHP 命令行调试，提高开发效率。**

**温馨提示：**

* **具体操作可能因 PHPStorm 版本和操作系统而略有差异，请参考官方文档。**
* **Xdebug 的配置非常重要，配置不正确会导致调试无法进行。**
* **善用 PHPStorm 的调试功能，可以帮助我们快速定位并解决问题。**
