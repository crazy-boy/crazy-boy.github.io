---
title: PHP 闭包（Closure）详解
tags: [闭包, PHP]
categories: [编程]
abbrlink: 'closure'
date: 2024-12-24 09:39:25
updated: 2026-10-19 09:00:00
---

给任务执行器、事件监听器或数组处理函数传回调时，经常会遇到一个选择：参数应该声明成 `Closure`，还是 `callable`？两者都能接收匿名函数，但含义不同。

`Closure` 是一个具体的类，`callable` 是表示“可以被调用”的类型。理解这个区别，再看变量捕获、方法回调和任务对象的写法，就容易把它们用在合适的位置。

<!-- more -->

## 一、匿名函数与变量捕获

PHP 的匿名函数会生成 `Closure` 对象，可以赋给变量、作为参数传递，或者作为返回值。

```php
$message = 'Hello';

$sayHello = function () use ($message): void {
    echo $message;
};

$message = 'Hi';
$sayHello(); // Hello

var_dump($sayHello instanceof Closure); // true
var_dump(is_callable($sayHello));       // true
```

`use ($message)` 按值捕获创建闭包时的变量。之后重新赋值外部变量，不会改掉已经捕获的值。

如果确实需要共享同一个变量，可以使用引用：

```php
$count = 0;

$increment = function () use (&$count): void {
    $count++;
};

$increment();
var_dump($count); // int(1)
```

注意“按值捕获”也不等于深拷贝：捕获对象变量时，仍然可以通过它访问同一个对象，其属性可能在别处被修改。在延迟任务中，需要区分捕获的是一个值，还是指向可变对象的变量。

PHP 7.4 起支持的箭头函数同样生成 `Closure`，并自动按值捕获用到的外部变量：

```php
$factor = 2;
$multiply = fn (int $number): int => $number * $factor;

var_dump($multiply(3));                // int(6)
var_dump($multiply instanceof Closure); // true
```

## 二、Closure 和 callable 的范围

可以用下面的关系记忆：

```text
Closure 一定是 callable
callable 不一定是 Closure
```

下面是常见回调形式，示例可放在同一个脚本中执行：

```php
function test(): void
{
    echo "test\n";
}

class UserService
{
    public function create(): void
    {
        echo "create\n";
    }

    public static function describe(): void
    {
        echo "UserService\n";
    }
}

class Handler
{
    public function __invoke(): void
    {
        echo "handle\n";
    }
}

$service = new UserService();

$callbacks = [
    function (): void { echo "anonymous\n"; }, // Closure
    'test',                                  // 函数名
    [$service, 'create'],                     // 对象方法
    [UserService::class, 'describe'],          // 静态方法
    UserService::class . '::describe',        // 静态方法字符串
    new Handler(),                           // 可调用对象
];

foreach ($callbacks as $callback) {
    var_dump(is_callable($callback)); // 均为 true
    $callback();
}
```

“一个数组”或“一个方法名”并不天然就是有效回调：目标要存在，方法在当前作用域内要可访问，静态写法也应指向静态方法。例如对象的非静态方法应使用 `[$service, 'create']`。

## 三、用参数类型表达接口的要求

```php
function callClosure(Closure $callback): void
{
    $callback();
}

function callCallable(callable $callback): void
{
    $callback();
}

$anonymous = function (): void {
    echo "anonymous\n";
};

callClosure($anonymous);  // anonymous
callCallable($anonymous); // anonymous
callCallable('test');     // test，使用上一节定义的函数

try {
    callClosure('test');
} catch (TypeError $exception) {
    echo "函数名字符串不是 Closure\n";
}
```

对外暴露一个普通的执行入口，希望调用者能传函数名、对象方法或匿名函数时，我通常使用 `callable`。如果实现需要 `Closure::bindTo()`、`Closure::call()` 等闭包能力，则使用 `Closure`，并明确说明绑定的限制；静态闭包等情况并不能随意重新绑定。

参数里的 `callable` 只保证它可以被调用，不保证目标接受几个参数、返回什么类型。实际传参协议仍要在接口说明中约定；复杂项目也可以配合静态分析标注回调签名。

## 四、把 callable 转成 Closure

### PHP 7.1 起：Closure::fromCallable()

继续使用前面定义的 `test()` 和 `$service`：

```php
$functionClosure = Closure::fromCallable('test');
$methodClosure = Closure::fromCallable([$service, 'create']);

callClosure($functionClosure); // test
callClosure($methodClosure);   // create
```

转换时会检查目标在当前作用域内能否调用，无效目标会抛出 `TypeError`。创建好的闭包会保留取得目标时的作用域语义，但这并不是冻结对象状态或序列化回调。

### PHP 8.1 起：一级可调用语法

```php
$functionClosure = test(...);
$methodClosure = $service->create(...);

var_dump($functionClosure instanceof Closure); // true
$methodClosure(); // create
```

这里独立的 `...` 是取得可调用对象的语法，不是在执行函数，也不是展开某个参数数组。使用这种写法的脚本需要 PHP 8.1 及以上；老版本即使没有执行到这一行，也可能在解析阶段报错。

## 五、任务对象为什么适合保存 Closure？

PHP 不允许把属性声明为 `callable`。如果一个对象需要保存用户传入的回调，可以在入口接受 `callable`，在内部统一转换为 `Closure`。下面的类型化属性需要 PHP 7.4 及以上：

```php
class Task
{
    private Closure $callback;

    public function __construct(callable $callback)
    {
        $this->callback = Closure::fromCallable($callback);
    }

    public function run(): void
    {
        ($this->callback)();
    }
}

$task = new Task('test'); // 使用前面定义的 test()
$task->run();            // test
```

这里“统一保存”的意思是内部类型一致，调用者仍然可以使用不同的回调形式。闭包本身也是对象，捕获的对象和绑定的 `$this` 也可能延长相关实例的生命周期，不能笼统认为闭包“没有对象开销”。

这种任务适合当前进程内执行。需要把任务投递到队列、持久化后再交给其他进程时，不要直接把普通 `Closure` 当成可序列化的任务数据；更适合保存任务类型与参数，由消费者恢复执行逻辑。对象引用和生命周期问题还可以结合 [PHP 内存泄漏全解析](/posts/php-memory-leak.html) 一起看。

## 六、常见使用场景

数组转换时，箭头函数适合简单表达式：

```php
// PHP 7.4+
$numbers = [1, 2, 3, 4, 5];
$squared = array_map(fn (int $number): int => $number * $number, $numbers);
```

需要多条语句、显式捕获变量时，普通匿名函数更直观：

```php
$minimum = 3;
$numbers = [1, 2, 3, 4, 5];

$filtered = array_filter($numbers, function (int $number) use ($minimum): bool {
    return $number >= $minimum;
});
```

`Closure` 和 `callable` 的选择先由接口需求决定。一般回调入口用 `callable`；内部需要闭包能力或类型化属性时，再转换为 `Closure`，不必要求每位调用者都手动包装一次。

## 参考资料

- [PHP 匿名函数](https://www.php.net/manual/en/functions.anonymous.php)
- [PHP Closure 类](https://www.php.net/manual/en/class.closure.php)
- [PHP callable 类型](https://www.php.net/manual/en/language.types.callable.php)
- [Closure::fromCallable](https://www.php.net/manual/en/closure.fromcallable.php)
- [PHP 一级可调用语法](https://www.php.net/manual/en/functions.first_class_callable_syntax.php)

相关笔记：[匿名函数（Anonymous Functions）](/posts/anonymous-functions.html)、[PHP 浮点数格式化与舍入](/posts/php-float-format-round.html)。
