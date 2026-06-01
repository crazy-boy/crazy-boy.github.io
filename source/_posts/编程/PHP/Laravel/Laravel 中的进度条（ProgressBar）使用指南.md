---
title: Laravel 中的进度条（ProgressBar）使用指南
tags: [Laravel, ProgressBar]
categories: [PHP]
abbrlink: 'laravel-progressbar-guide'
date: 2026-06-01 00:00:00
updated: 2026-06-01 00:00:00
---

> Laravel Artisan 命令底层集成了 Symfony Console 组件，可轻松实现控制台可视化进度条。

---

## 一、基础用法

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BatchProcess extends Command
{
    protected $signature = 'batch:process';
    protected $description = '批量处理数据';

    public function handle()
    {
        // 模拟待处理数据总量
        $userIds = range(1, 1000);
        $total = count($userIds);

        // 1. 创建进度条
        $bar = $this->output->createProgressBar($total);
        
        // 2. 启动
        $bar->start();

        foreach ($userIds as $id) {
            // 模拟业务处理（例如更新数据库）
            usleep(10000);
            // 3. 前进一格
            $bar->advance();
        }

        // 4. 结束
        $bar->finish();

        $this->newLine();   // 换行，避免后续输出挤占
        $this->info('处理完成！');
    }
}
```

---

## 二、核心方法说明

| 方法 | 作用 |
|------|------|
| `createProgressBar($max)` | 创建进度条对象，`$max` 为总步数 |
| `start()` | 输出初始进度条 |
| `advance($step = 1)` | 前进指定步数（默认 1） |
| `finish()` | 强制完成进度条，输出 100% |

---

## 三、自定义格式

### 3.1 使用 `setFormat()` 设置显示格式

```php
$bar->setFormat(" %current%/%max% [%bar%] %percent:3s%% %elapsed:6s% / %estimated:-6s% %memory:6s%");
```

**常用占位符**：

| 占位符 | 含义 |
|--------|------|
| `%current%` | 当前步数 |
| `%max%` | 总步数 |
| `%bar%` | 进度条图形 |
| `%percent%` | 百分比 |
| `%elapsed%` | 已用时间 |
| `%estimated%` | 预计剩余时间 |
| `%memory%` | 内存使用 |

### 3.2 自定义进度条字符

```php
$bar->setBarCharacter('=');      // 已填充部分字符（默认 =）
$bar->setEmptyBarCharacter('-'); // 未填充部分字符（默认 -）
$bar->setProgressCharacter('>'); // 当前进度头字符（默认 >）
```

---

## 四、大数据量优化 - 降低刷新频率

默认每步刷新，处理几十万数据时控制台刷新开销较大。使用 `setRedrawFrequency($steps)` 降低刷新频率：

```php
$bar = $this->output->createProgressBar($total);
$bar->setRedrawFrequency(100);   // 每 100 步刷新一次
$bar->start();

foreach ($userIds as $index => $id) {
    // 处理数据...
    $bar->advance();              // 即使不刷新内部计数仍会增加
}
```

---

## 五、在进度条旁输出自定义消息

```php
$bar = $this->output->createProgressBar($total);
$bar->start();

foreach ($userIds as $id) {
    // 设置消息（注意：不会立即显示，需等待下一次 advance 或手动调用 display）
    $bar->setMessage("当前处理 ID: {$id}");
    $bar->display();   // 立即刷新显示消息
    // 处理数据...
    $bar->advance();
}
```

> **注意**：`setMessage()` 后需要调用 `$bar->display()` 才能立即看到变化，或者等待下一次 `advance()` 自动刷新。

---

## 六、Laravel 简化写法（无需手动创建对象）

```php
$this->output->progressStart($total);
foreach ($userIds as $id) {
    // 处理数据...
    $this->output->progressAdvance();
}
$this->output->progressFinish();
```

这种方式内部自动创建并管理 ProgressBar，代码更简洁。

---

## 七、重要注意事项

| 问题 | 解决方法 |
|------|----------|
| 混用 `echo` / `dump` 破坏进度条 | 如需输出日志，先调用 `$bar->clear()` 清除进度条，输出后再 `$bar->display()` |
| `advance()` 步数总和 != `$max` | 确保累计前进步数等于总步数，否则百分比异常 |
| 异常退出时光标错位 | 在异常处理中调用 `$bar->finish()` |
| 大量数据导致内存溢出 | 使用 `chunk()` 或 `cursor()` 分批加载数据，配合进度条 |

---

## 八、完整示例（带异常处理）

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class FixUserData extends Command
{
    protected $signature = 'fix:user-data';
    protected $description = '批量修复用户数据';

    public function handle()
    {
        $total = User::where('status', 0)->count();
        if ($total === 0) {
            $this->info('无需处理的数据');
            return 0;
        }

        $bar = $this->output->createProgressBar($total);
        $bar->setFormat(" %current%/%max% [%bar%] %percent:3s%%");
        $bar->start();

        $failedIds = [];

        User::where('status', 0)->chunkById(200, function ($users) use ($bar, &$failedIds) {
            foreach ($users as $user) {
                try {
                    // 模拟业务逻辑
                    $user->status = 1;
                    $user->save();
                } catch (\Exception $e) {
                    $failedIds[] = $user->id;
                }
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();

        if (!empty($failedIds)) {
            $this->warn("失败 ID: " . implode(',', $failedIds));
        }
        
        $this->info('处理完成');
        return 0;
    }
}
```

---

以上内容涵盖了 Laravel 中进度条的主要用法，可直接参考使用。