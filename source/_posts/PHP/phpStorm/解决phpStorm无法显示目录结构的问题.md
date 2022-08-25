---
title: 解决phpStorm无法显示目录结构的问题
tags:
  - php
  - phpStorm
categories: PHP
abbrlink: 'phpstorm-show-dir'
date: 2022-05-16 17:51:46
updated: 2022-05-16 17:51:46
---

问题：PhpStorm侧边栏Project里面只显示文件不显示文件夹
![](/images/phpstorm_show_dir_1.png)

解决：删除项目根目录下的.idea文件夹，重启Phpstorm打开项目目录。Alt + 1调出左侧的目录
![](/images/phpstorm_show_dir_2.png)
