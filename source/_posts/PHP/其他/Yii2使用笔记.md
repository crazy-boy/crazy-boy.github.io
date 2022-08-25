---
title: Yii2使用笔记
tags:
  - PHP
  - Yii2
categories: PHP
abbrlink: 'php-yii2-notes'
date: 2021-05-27 15:52:24
updated: 2021-05-27 15:52:24
---

### 1. 安装Yii2第三方扩展

- 方法一：composer安装
```
php composer.phar require php-amqplib/php-amqplib
或者
在composer.json文件的require里添加"php-amqplib/php-amqplib": "~2.7"，然后执行composer update
```
- 方法二：手动添加
1、拷贝php-amqplib扩展到vendor目录下，
2、在vendor/yiisoft/extensions.php里添加如下配置项：
   ```
  'php-amqplib/php-amqplib' =>
     array (
        'name' => 'php-amqplib/php-amqplib',
        'version' => '2.4.5.0',
        'alias' =>
           array (
              '@PhpAmqpLib' => $vendorDir . '/php-amqplib/php-amqplib/PhpAmqpLib',
           ),
     ), 
  ```

