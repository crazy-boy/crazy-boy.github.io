---
title: phpStorm实现保存后，代码自动格式化
tags: [phpStorm]
categories: PHP
abbrlink: 'phpstorm-auto-format'
date: 2022-04-26 17:51:46
updated: 2022-04-26 17:51:46
---
鉴于个人编程风格的不同，为了保证团队开发能更好地开展，需要进行代码统一格式化。我们可以在ctrl+s的时候让IED来自动格式化保存。
下面介绍下设置步骤：
### 1. 点击File-》Settings-》Keymap
![](/images/phpstorm_auth_format_1.png)

### 2. 在右侧搜索save ALL
![](/images/phpstorm_auth_format_2.png)

### 3. 右键点击Save All，选择Remove Ctrl+S
![](/images/phpstorm_auth_format_3.png)

### 4. 右键点击Save All，选择Add Keyboard Shortcut，然后按键盘shift+ctrl+alt+s，然后保存。
![](/images/phpstorm_auth_format_4.png)
PS:shift+ctrl+alt+s这个可以自己随便设置，但是不能和其他的快捷键冲突，而且要记住，一会我们会用得到。

### 5. 点击Edit(编辑)->Macros(宏)->Start Macro Recording(开始录制宏)。
右下角会出现这样一个图标
![](/images/phpstorm_auth_format_5.png)
然后先按ctrl+alt+l，再按我们刚刚把save  all设置的快捷键shift+ctrl+alt+s，最后点击红色的小方块结束录制宏
![](/images/phpstorm_auth_format_6.png)
保存宏：名称设置为：Format And Save（这个名字随意啦，自己记得就好）
![](/images/phpstorm_auth_format_7.png)

### 6. 点击File-》Settings-》Keymap  搜索Format And Save

### 7. 右键点击Format And Save，选择Add Keyboard Shortcut,设置为command+s，保存就可以了
![](/images/phpstorm_auth_format_8.png)
最后试一下吧，ctrl+s 就实现了 保存+代码格式化