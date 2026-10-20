---
title: php中，this、self、static的区别
tags: [PHP笔记]
categories: [PHP]
abbrlink: 'php-self-static'
date: 2022-06-02 20:28:32
updated: 2026-10-19 10:00:00
---


- `$this` 指向当前对象实例，用 `$this->` 访问实例成员，静态方法中不能使用。
- `self::` 按方法定义所在的类解析成员，并不是只能访问静态方法或属性。
- `static::` 使用后期静态绑定，按调用链中的被调用类解析成员；这里的 `static` 与声明静态属性、静态方法的修饰符含义不同。

下面看下测试代码：

```php
class A{
    public $name = 'Jams';
    protected static $age = 26;

    public function start(){
        echo get_called_class() . '==>' . $this->name . '==>' . $this::$age;
    }

    public static function getAge(){
        echo get_called_class() . '==>' . self::$age;
    }

    public static function getInfo(){
        echo get_called_class() . '==>' . static::$age;
    }
}

class B extends A{
    public $name = 'Kiv';
    protected static $age = 20;
}

(new B())->start();
B::getAge();
B::getInfo();
```
三个调用依次输出下面的内容（原代码未加换行，这里分行展示）：

```text
B==>Kiv==>20
B==>26
B==>20
```

## new static 和 new static() 有区别吗？

构造方法没有必需参数时，这两种写法都能实例化对象，含义相同：

```php
class Factory
{
    public static function create()
    {
        $first = new static;
        $second = new static();

        return [$first, $second];
    }
}
```

它们各自创建一个新对象，并不是同一个对象的两种引用。为了统一风格、方便添加参数，我通常保留括号，写成 `new static()`。如果构造方法要求参数，则必须传入参数，不能通过省略括号跳过构造方法。

## new self()、new static()、new parent() 的区别

最直观的场景是父类提供工厂方法，子类希望沿用实现，但创建自己的对象：

```php
class Animal
{
    public static function createSelf(): self
    {
        return new self();
    }

    // 不声明 static 返回类型，让此示例兼容 PHP 7.x。
    public static function createStatic()
    {
        return new static();
    }
}

class Dog extends Animal
{
    public static function createParent(): Animal
    {
        return new parent();
    }
}

var_dump(get_class(Dog::createSelf()));   // string(6) "Animal"
var_dump(get_class(Dog::createStatic())); // string(3) "Dog"
var_dump(get_class(Dog::createParent())); // string(6) "Animal"
```

| 写法 | 实例化目标 | 示例中的结果 |
| --- | --- | --- |
| `new self()` | 当前方法定义所在的类 | `Animal` |
| `new static()` | 后期静态绑定得到的被调用类 | `Dog` |
| `new parent()` | 当前类作用域的直接父类 | `Animal` |

这里 `Dog` 继承了 `createSelf()`，但该方法定义在 `Animal` 中，`self` 因此仍指向 `Animal`。`new static()` 则保留调用 `Dog::createStatic()` 时的类信息。更复杂的调用链还涉及调用是否转发，并非简单寻找“当前对象”。

父类使用 `new static()` 时，还需要考虑子类构造方法的参数要求。如果子类增加了必填参数，而工厂方法仍然无参实例化，就会调用失败。`static` 能决定类名，不能自动补齐构造参数。

### PHP 8.0 起可以声明 static 返回类型

```php
// PHP 8.0+，作为独立示例运行。
class Entity
{
    public static function create(): static
    {
        return new static();
    }
}

class Order extends Entity
{
}

var_dump(get_class(Order::create())); // string(5) "Order"
```

`new static()` 本身早于 PHP 8.0 就已存在；新增的是这里的 `: static` 返回类型声明。维护 PHP 7 项目时，不要把两者的版本要求混在一起。

参考：[PHP 后期静态绑定](https://www.php.net/manual/en/language.oop5.late-static-bindings.php)、[PHP 对象实例化](https://www.php.net/manual/en/language.oop5.basic.php)、[PHP 8.0 新特性](https://www.php.net/manual/en/migration80.new-features.php)。
