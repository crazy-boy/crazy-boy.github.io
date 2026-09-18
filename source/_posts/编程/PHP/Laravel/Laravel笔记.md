---
title: Laravel笔记
tags: [Laravel]
categories: [PHP]
abbrlink: 'laravel-notes'
date: 2026-06-01 00:00:00
updated: 2026-06-01 00:00:00
---

在Command里有代码：
$date = date('Y-m-d');
$command = sprintf('grep -ioE \'app/[^:]+.php:[0-9]+\' storage/logs/lumen-%s.log | sort -nr | uniq -c  | awk \'$1 > %d\'', $date, 100);
exec($command, $rs,$return_var);
dump($command,$rs,$return_var);die;

通过定时任务 */10 * * * * php /var/www/web/artisan watch watchLog 始终执行失败，$rs为空， 后来发现是定时任务执行时找不到log文件，改成*/10 * * * * cd /var/www/web && php artisan watch watchLog 就可以了.

另一种解决办法是修改代码：
$date = date('Y-m-d');
$log_file = storage_path(sprintf('logs/lumen-%s.log', $date));       // 绝对路径


近日发现在laravel里加日志监控，如果php-fpm挂掉，日志监控也将无法正常执行；后决定将日志监控移到shell脚本里，独立运行，这保证了监控程序的独立、安全、有效。