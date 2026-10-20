---
title: Laravel笔记
tags: [Laravel]
categories: [PHP]
abbrlink: 'laravel-notes'
date: 2026-06-01 00:00:00
updated: 2026-10-19 11:00:00
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


历史项目中曾将依赖应用运行链路的日志监控移到独立 shell 脚本，以减少故障时的共同依赖。是否受 PHP-FPM 停止影响，需要区分监控通过 Web 请求还是 CLI 执行，见文末补充。

## Eloquent 与链式查询速记

以下是常见 Eloquent / Query Builder 用法，说明按 Laravel 12.x 文档核对；旧项目请结合实际框架版本。文中的 `Bar` 是项目模型示例，字段和模型需按实际项目替换。

### 自动时间戳

Eloquent 默认维护 `created_at`、`updated_at`。表中不使用这两列时，可以关闭自动时间戳：

```php
use Illuminate\Database\Eloquent\Model;

class Bar extends Model
{
    public $timestamps = false;
}
```

这会同时关闭两列的自动维护，不只是 `updated_at`。如果仅缺少更新时间列但仍保留创建时间，可以按项目需求设置 `const UPDATED_AT = null;`，而不是把创建时间也关掉。

### 查看 SQL 与绑定参数

```php
$query = Bar::query()->where('status', 'active');

dump($query->toSql(), $query->getBindings());
```

`toSql()` 返回带占位符的 SQL 模板，不会执行查询，也不等于已包含参数的最终 SQL。结合 `getBindings()` 才能看到实际绑定值；不要自己简单拼接参数再执行。

### 复杂条件与 whereRaw()

常规组合条件优先使用闭包分组，确实需要 SQL 表达式时可用 `whereRaw()`：

```php
$minimum = 100;

$rows = Bar::query()
    ->whereRaw('(amount - refunded_amount) >= ?', [$minimum])
    ->get();
```

用户输入通过绑定参数传入，不能直接拼进原生 SQL。参数绑定也不能代替动态列名、排序方向的白名单检查。原生表达式可能影响跨数据库兼容性和索引使用。

### 只取一列的一个值

```php
$name = Bar::query()->where('id', $id)->value('name');
```

`value()` 返回一条匹配记录指定列的值，不是模型对象或结果集。无匹配记录通常返回 `null`，因此无法单凭它区分“没有记录”和“字段本身为 NULL”。多条记录匹配时，应通过唯一条件或明确排序确定取哪条；要取整列结果时考虑 `pluck()`。

### 读写分离后强制读取写连接

```php
$data = Bar::onWriteConnection()->find($id);
```

`onWriteConnection()` 使用该模型连接配置中的写连接。在常见主从架构下，就是绕开只读副本读取主库，用于应对刚写入后副本尚未同步的情况。这里由连接配置决定目标，并不是把某台固定服务器地址写死。

它不会自动等待别的事务提交，也不解决跨请求缓存等一致性问题。不必把所有查询都强制走主库；应结合读写配置、事务和业务的一致性要求使用。

### 模型监听器中检查字段变化

在 `updating` 等保存前事件中，可以检查待保存的变化：

```php
public function updating(Bar $bar): void
{
    if ($bar->isDirty('status')) {
        $changes = $bar->getDirty();
        // 处理待保存的变化。
    }
}
```

`isDirty('status')` 判断指定属性是否有未同步的变化，`getDirty()` 返回脏属性及其当前值。保存后的判断，应考虑 `wasChanged('status')` 和 `getChanges()`；不要在保存完成后仍然假设 `getDirty()` 保留刚才的变化。

批量更新如 `Bar::where(...)->update(...)` 不会逐个加载模型，因此不会逐条触发这些模型事件。需要监听器保证的业务逻辑时，必须考虑更新入口。参考 [Eloquent 文档](https://laravel.com/docs/12.x/eloquent)、[Query Builder 文档](https://laravel.com/docs/12.x/queries) 和 [模型写连接 API](https://api.laravel.com/docs/12.x/Illuminate/Database/Eloquent/Model.html#method_onWriteConnection)。

## 自定义 Artisan 命令与调度器不是同一个入口

直接执行一个已注册的业务命令，例如项目定义了 `reports:daily {date}`：

```shell
php artisan reports:daily 2026-10-19
```

命令名、参数和选项由命令的签名决定，不存在通用的 `php artisan {command} {fun}` 调用任意方法规则。旧笔记中的 `watch watchLog` 只有在项目为它定义了相应参数和执行逻辑时才成立。

运行当前到期的计划任务使用调度器入口：

```shell
php artisan schedule:run
```

服务器通常每分钟通过 cron 调用一次：

```cron
* * * * * cd /var/www/web && php artisan schedule:run >> /dev/null 2>&1
```

本地可用 `php artisan schedule:work` 持续运行调度器，用 `php artisan schedule:list` 查看已定义任务；命令可用性以项目版本为准。任务仍须先在项目中注册调度规则，执行 `schedule:run` 并不等于强制运行所有任务。参考 [Laravel 任务调度](https://laravel.com/docs/12.x/scheduling)。

### 回看日志监控的运行环境

前面的历史案例强调了 cron 的工作目录和相对路径问题。命令里读日志应优先使用 `storage_path()` 取得绝对路径，或在 cron 中先切换到项目根目录。

还需要区分 PHP CLI 与 PHP-FPM：Artisan 使用 CLI，通常不会仅因 PHP-FPM 停止就无法运行；如果监控依赖 Web 请求、共享数据库或其他故障组件，仍可能一同失效。监控需要核对自己的实际依赖，而不只是把 PHP 换成 shell。
